import React from "react";

export default function ProductSchema({ product }) {
  if (!product) return null;

  const images = product.product_image?.length
    ? product.product_image
    : product.p_image
    ? [product.p_image]
    : [];

  const resolvedImages = images.map((img) =>
    img.startsWith("http")
      ? img
      : `https://marketplace.yuukke.com/assets/uploads/${img}`
  );

  // 🧠 Promo price logic (Google Rich Results critical)
  const now = new Date();
  const promoStart = product.start_date ? new Date(product.start_date) : null;
  const promoEnd = product.end_date ? new Date(product.end_date) : null;

  const isPromoActive =
    product.promotion === "1" &&
    promoStart &&
    promoEnd &&
    now >= promoStart &&
    now <= promoEnd;

  const finalPrice = isPromoActive
    ? Number(product.promo_price)
    : Number(product.price);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.meta_description || product.product_details,
    image: resolvedImages,
    sku: String(product.code || product.id),
    mpn: String(product.code || product.id),

    brand: {
      "@type": "Brand",
      name: product.brand || "Yuukke",
    },

    offers: {
      "@type": "Offer",
      url: `https://marketplace.yuukke.com/products/${product.slug}`,
      priceCurrency: "INR",
      price: finalPrice,
      priceValidUntil: "2026-12-31",
      availability:
        Number(product.quantity) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",

      seller: {
        "@type": "Organization",
        name: product.store_details?.[0]?.name || "Yuukke Marketplace",
      },

      // 👑 tells Google this is a discounted product
      ...(isPromoActive && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: Number(product.price),
          priceCurrency: "INR",
        },
      }),
    },
  };

  if (product.review) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.review),
      reviewCount: product.all_reviews?.length || 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
