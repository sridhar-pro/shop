import ProductPageClient from "./ProductPageClient";

export async function generateMetadata({ params }) {
  const { slug } = params;

  try {
    // get fresh bearer token from internal API route
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://shop.yuukke.com"
        : "http://localhost:3001";

    const tokenRes = await fetch(`${baseUrl}/api/serverAuth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const tokenData = await tokenRes.json();
    const token = tokenData?.token;

    if (!token) throw new Error("Failed to get auth token");

    // fetch product details securely with bearer token
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
    const product = data?.data?.[0];

    if (!product) return { title: "Product Not Found | Yuukke" };

    // Title & description (unchanged)
    const title =
      product.meta_title ||
      product.name ||
      "Yuukke Marketplace | Premium Products";

    const description =
      product.meta_description ||
      "Discover amazing deals and premium products on Yuukke Marketplace.";

    // *** IMAGE: use ONLY p_image (no meta_image fallback) ***
    // If you want a fallback link, uncomment the fallback line below.
    const pImage = product.p_image || null;
    // const fallback = "https://marketplace.yuukke.com/fallback.png"; // optional
    const resolvedImage = pImage
      ? pImage.startsWith("http")
        ? pImage
        : `https://marketplace.yuukke.com/assets/uploads/${pImage}`
      : null;

    // Build metadata object
    const metadata = {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://marketplace.yuukke.com/products/${slug}`,
        siteName: "Yuukke Marketplace",
        // include image only if p_image existed; it's an array of image objects
        images: resolvedImage
          ? [
              {
                url: resolvedImage,
                width: 800,
                height: 600,
              },
            ]
          : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: resolvedImage ? [resolvedImage] : [],
      },
    };

    return metadata;
  } catch (error) {
    console.error("Metadata generation failed:", error);
    return {
      title: "Yuukke Marketplace",
      description:
        "Explore trending collections, handcrafted goods, and more on Yuukke.",
    };
  }
}

// Client component
export default function Page() {
  return <ProductPageClient />;
}
