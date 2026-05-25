import React from "react";

export default function ProductSchema({ product }) {
  if (!product) return null;

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const images = product.product_image?.length
    ? product.product_image
    : product.p_image
      ? [product.p_image]
      : [];

  const resolvedImages = images
    .filter(Boolean)
    .map((img) =>
      img.startsWith("http")
        ? img
        : `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${img}`,
    );

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

  const priceValidUntil = product.end_date
    ? new Date(product.end_date).toISOString().split("T")[0]
    : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
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
              ...(product.review && {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Number(product.review),
                  reviewCount: product.all_reviews?.length || 1,
                },
              }),
              offers: {
                "@type": "Offer",
                url: `https://shop.yuukke.com/products/${product.slug}`,
                priceCurrency: "INR",
                price: finalPrice,
                priceValidUntil: priceValidUntil,
                availability:
                  Number(product.quantity) > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: {
                  "@type": "Organization",
                  name:
                    product.store_details?.[0]?.name || "Yuukke Marketplace",
                },
                ...(isPromoActive && {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: Number(product.price),
                    priceCurrency: "INR",
                  },
                }),
              },
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
                  name: product.name,
                  item: `https://shop.yuukke.com/products/${product.slug}`,
                },
              ],
            },
          ],
        }),
      }}
    />
  );
}
