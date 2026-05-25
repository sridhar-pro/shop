import { cache } from "react";
import ProductPageClient from "./ProductPageClient";
import ProductSchema from "./ProductSchema";

// Cached so generateMetadata + Page share one fetch
const getProduct = cache(async (slug) => {
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://shop.yuukke.com/"
      : "http://localhost:3001";

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const tokenRes = await fetch(`${baseUrl}/api/serverAuth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const tokenData = await tokenRes.json();
  const token = tokenData?.token;
  if (!token) throw new Error("Failed to get auth token");

  const res = await fetch(
    `https://marketplace.${DOMAIN_KEY}.com/api/v1/Marketv2/getProductDetails`,
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
    },
  );

  const data = await res.json();
  return data?.data?.[0] || null;
});

export async function generateMetadata({ params: paramsPromise }) {
  const { slug } = await paramsPromise;
  const product = await getProduct(slug); // uses cache

  if (!product) {
    return { title: "Product Not Found | Yuukke" };
  }

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

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

  const resolvedImages = imgs
    .filter(Boolean)
    .map((img) =>
      img.startsWith("http")
        ? img
        : `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${img}`,
    );

  return {
    title,
    description,
    alternates: {
      canonical: `https://shop.yuukke.com/products/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://shop.yuukke.com/products/${slug}`,
      siteName: "Yuukke Marketplace",
      images: resolvedImages.map((u) => ({ url: u, width: 800, height: 600 })),
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
  const product = await getProduct(slug); // hits cache, no second API call

  return (
    <>
      <ProductSchema product={product} />
      <ProductPageClient slug={slug} />
    </>
  );
}
