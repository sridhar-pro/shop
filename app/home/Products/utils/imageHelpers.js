const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

export const getImageSrcThumbs = (image) => {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/thumbs/${image}`;
};

export const getImageSrc = (image) => {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
};
