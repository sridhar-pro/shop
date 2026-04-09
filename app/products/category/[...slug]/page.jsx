import CategoryPageClient from "./page.client";
import { getServerToken } from "@/app/utils/authServer";

const isValidId = (value) => value && !isNaN(Number(value));

// 🚀 generateMetadata works here (server)
export async function generateMetadata({ params }) {
  // console.log("🔍 Raw params:", params);
  // console.log("🔍 Raw slug array:", params.slug);

  const [categorySlug, subCategorySlug, subSubCategorySlug] = params.slug || [];

  // console.log("🟢 categorySlug:", categorySlug);
  // console.log("🟢 subCategorySlug:", subCategorySlug);
  // console.log("🟢 subSubCategorySlug:", subSubCategorySlug);

  let categoryId = null; // 🔹 declare in outer scope
  let subcategoryId = null; // if needed
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
        localStorage.removeItem("authToken");
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
      return;
    }

    // console.log("✅ Categories fetched from server:", data);

    // Map server response to `categories`
    const categories = data.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      content: cat.content,
      subcategories: cat.subcategories || [],
      sub_subcategories: cat.sub_subcategories || [],
    }));

    // 🔍 Find the matching category by slug
    const matchedCategory = categories.find((cat) => cat.slug === categorySlug);

    categoryId = matchedCategory ? matchedCategory.id : null;

    // console.log("🟢 Matched Category ID:", categoryId);

    // Find subcategory (nested)
    let matchedSubcategory = null;
    if (matchedCategory?.subcategories?.length) {
      matchedSubcategory = matchedCategory.subcategories.find(
        (sub) => sub.slug === subCategorySlug,
      );
    }
    subcategoryId = matchedSubcategory ? matchedSubcategory.id : null;
    // console.log("🟢 Matched Subcategory ID:", subcategoryId);

    // Find sub-subcategory (nested deeper, if exists)
    let matchedSubSubcategory = null;
    if (matchedSubcategory?.sub_subcategories?.length) {
      matchedSubSubcategory = matchedSubcategory.sub_subcategories.find(
        (subsub) => subsub.slug === subSubCategorySlug,
      );
    }
    subSubcategoryId = matchedSubSubcategory ? matchedSubSubcategory.id : null;
    // console.log("🟢 Matched Sub-subcategory ID:", subSubcategoryId);

    // ✅ Now you can use `categoryId` in your next API calls
  } catch (error) {
    console.error("❌ Error processing categories:", error);
  }

  try {
    const token = await getServerToken(); // ✅ server-safe
    // console.log("🔑 Server got token:", token);
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
            category: categoryId ? { id: Number(categoryId) } : {}, // ✅ single object
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
    // console.log("🟢 Full API response:", data);
    const meta = data?.metaData;
    // console.log("🟢 Category metadata fetched:", meta);
    return {
      title: meta?.title || meta?.name || "Products", // use meta.title if exists, fallback to name
      description: meta?.description || "Browse our collection", // use description from API
      openGraph: {
        title: meta?.name || "Products",
        description: meta?.description || "Browse our collection",
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
    return {
      title: "Products",
      description: "Browse our awesome collection",
    };
  }
}

// ✅ just render the client file
export default function CategoryPage(props) {
  return <CategoryPageClient {...props} />;
}
