const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

// Same image logic as OtherProductsGrid
export function getImageSrc(image) {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

// Same promo rules as OtherProductsGrid
export function getPriceInfo(product) {
  const price = Number(product.price);
  const promo = Number(product.promo_price);
  const onPromo =
    !!product.promo_price &&
    !!product.end_date &&
    !!product.promotion &&
    new Date(product.end_date + "T23:59:59") >= new Date();
  const off = onPromo && price > 0 ? Math.round(((price - promo) / price) * 100) : 0;
  return { onPromo, price, promo, off };
}
