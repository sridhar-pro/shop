import CategoryPageClient from "./page.client";
import { getServerToken } from "@/app/utils/authServer";

const isValidId = (value) => value && !isNaN(Number(value));

// 🚀 generateMetadata works here (server)
export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;

  const [categorySlug, subCategorySlug, subSubCategorySlug] = params.slug || [];

  // ✅ Build canonical + fallback name FIRST, from params alone —
  // this guarantees every return path below has a canonical, even on total API failure
  const canonicalUrl = `https://shop.yuukke.com/products/category/${params.slug.join("/")}`;
  const fallbackSlug =
    subSubCategorySlug || subCategorySlug || categorySlug || "products";
  const fallbackName = fallbackSlug.replaceAll("-", " ");

  let categoryId = null;
  let subcategoryId = null;
  let subSubcategoryId = null;

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const fetchWithAuth = async (url, retry = false) => {
    try {
      const token = await getServerToken();

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 && !retry) {
        // ⚠️ removed localStorage.removeItem("authToken") — this is a server
        // component, localStorage doesn't exist here and was throwing silently,
        // which was killing metadata on every expired-token request.
        return await fetchWithAuth(url, true);
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ HTTP ${res.status}:`, errText);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error("🚨 fetchWithAuth error:", err.message);
      return null;
    }
  };

  try {
    const data = await fetchWithAuth(
      `https://marketplace.${DOMAIN_KEY}.com/api/v1/Marketv2/homeCategory`,
    );

    if (!data) {
      console.warn("⚠️ No category data received.");
      // ✅ don't bail with undefined — still return valid metadata + canonical
      return {
        title: `${fallbackName} | Yuukke`,
        description: `Explore ${fallbackName} products on Yuukke.`,
        alternates: { canonical: canonicalUrl },
      };
    }

    const categories = data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      content: cat.content,
      subcategories: cat.subcategories || [],
      sub_subcategories: cat.sub_subcategories || [],
    }));

    const matchedCategory = categories.find((cat) => cat.slug === categorySlug);
    categoryId = matchedCategory ? matchedCategory.id : null;

    let matchedSubcategory = null;
    if (matchedCategory?.subcategories?.length) {
      matchedSubcategory = matchedCategory.subcategories.find(
        (sub) => sub.slug === subCategorySlug,
      );
    }
    subcategoryId = matchedSubcategory ? matchedSubcategory.id : null;

    let matchedSubSubcategory = null;
    if (matchedSubcategory?.sub_subcategories?.length) {
      matchedSubSubcategory = matchedSubcategory.sub_subcategories.find(
        (subsub) => subsub.slug === subSubCategorySlug,
      );
    }
    subSubcategoryId = matchedSubSubcategory ? matchedSubSubcategory.id : null;
  } catch (error) {
    console.error("❌ Error processing categories:", error);
    // fall through — categoryId/subcategoryId stay null, getProducts call below still runs
  }

  try {
    const token = await getServerToken();
    const res = await fetch(
      `https://marketplace.${DOMAIN_KEY}.com/api/v1/Marketv2/getProducts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filters: {
            gifts_products: "",
            query: "",
            category: categoryId ? { id: Number(categoryId) } : {},
            subcategory: subcategoryId ? { id: Number(subcategoryId) } : {},
            sub_subcategory: subSubcategoryId
              ? { id: Number(subSubcategoryId) }
              : {},
            brand: "",
            sorting: "name-asc",
            min_price: "1",
            max_price: "",
            in_stock: "0",
            page: "1",
            sort_by_v: "",
            limit: 24,
            offset: "0",
            warehouses_id: "",
          },
        }),
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const meta = data?.metaData;

    return {
      title: meta?.title || meta?.name || `${fallbackName} | Yuukke`,
      description:
        meta?.description || `Explore ${fallbackName} products on Yuukke.`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: meta?.name || fallbackName,
        description:
          meta?.description || `Explore ${fallbackName} products on Yuukke.`,
        url: canonicalUrl,
        images: meta?.image
          ? [
              {
                url: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${meta.image}`,
                alt: meta?.name || "Product Image",
              },
            ]
          : [],
      },
    };
  } catch (err) {
    console.error("Meta fetch failed:", err);
    // ✅ was missing canonical here — every failure path was creating a duplicate
    return {
      title: `${fallbackName} | Yuukke`,
      description: `Explore ${fallbackName} products on Yuukke.`,
      alternates: { canonical: canonicalUrl },
    };
  }
}

// ✅ just render the client file
export default async function CategoryPage(props) {
  const params = await props.params;

  const [categorySlug, subCategorySlug, subSubCategorySlug] = params.slug || [];

  const currentSlug =
    subSubCategorySlug || subCategorySlug || categorySlug || "products";

  const canonicalUrl = `https://shop.yuukke.com/products/category/${params.slug.join("/")}`;

  const categorySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonicalUrl,
        name: currentSlug.replaceAll("-", " "),
        url: canonicalUrl,
        description: `Explore ${currentSlug.replaceAll("-", " ")} products on Yuukke.`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://shop.yuukke.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: "https://shop.yuukke.com/products",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: currentSlug.replaceAll("-", " "),
            item: canonicalUrl,
          },
        ],
      },
      // ⚠️ removed the hardcoded ItemList block — it was emitting the same
      // two fake product URLs on every category page regardless of actual
      // content, which is duplicate/fake structured data at scale.
      // If you want real ItemList data here, we'd need to fetch products
      // in this component too (it's currently only fetched inside
      // generateMetadata, which doesn't share data with the page render).
      // Happy to wire that up as a separate step if you want it back.
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchema),
        }}
      />

      <CategoryPageClient {...props} />
    </>
  );
}
