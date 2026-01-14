import ProductPageClient from "./ProductPageClient";
import ProductSchema from "./ProductSchema";

async function getProduct(slug) {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://shop.yuukke.com/"
      : "http://localhost:3001";

  const tokenRes = await fetch(`${baseUrl}/api/serverAuth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const tokenData = await tokenRes.json();
  const token = tokenData?.token;
  if (!token) throw new Error("Failed to get auth token");

  const res = await fetch(
    "https://marketplace.yuukke.com/api/v1/Marketv2/getProductDetails",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        slug,
        id: slug.split("-").pop() || "",
      }),
      cache: "no-store",
    }
  );

  const data = await res.json();
  return data?.data?.[0] || null;
}

export async function generateMetadata({ params: paramsPromise }) {
  const { slug } = await paramsPromise;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product Not Found | Yuukke" };
  }

  const title =
    product.meta_title ||
    product.name ||
    "Yuukke Marketplace | Premium Products";

  const description =
    product.meta_description ||
    product.product_details ||
    "Discover amazing deals and premium products on Yuukke Marketplace.";

  const imgs = product.product_image?.length
    ? product.product_image
    : product.p_image
    ? [product.p_image]
    : [];

  const resolvedImages = imgs.map((img) =>
    img.startsWith("http")
      ? img
      : `https://marketplace.yuukke.com/assets/uploads/${img}`
  );

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: resolvedImages,
    sku: String(product.code || product.id),
    itemCondition: "https://schema.org/NewCondition",
    brand: {
      "@type": "Brand",
      name: product.brand || "Unknown",
    },
    seller: {
      "@type": "Organization",
      name: product.store_details?.[0]?.name || "Marketplace Seller",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://marketplace.yuukke.com/products/${slug}`,
    },
  };

  if (product.review) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.review,
      reviewCount: product.all_reviews?.length || 0,
    };
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://marketplace.yuukke.com/products/${slug}`,
      siteName: "Yuukke Marketplace",
      images: resolvedImages.map((u) => ({
        url: u,
        width: 800,
        height: 600,
      })),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: resolvedImages,
    },
  };
}

export default async function Page({ params: paramsPromise }) {
  const { slug } = await paramsPromise;
  const product = await getProduct(slug); // pass to schema

  return (
    <>
      <ProductSchema product={product} />
      <ProductPageClient slug={slug} />
    </>
  );
}
