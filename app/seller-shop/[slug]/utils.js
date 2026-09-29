import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

export const getImageSrc = (image) => {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
};

export function hexToRgb(hex) {
  hex = hex?.replace("#", "") || "888888";
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// ─── Shared Add-to-Cart ──────────────────────────────────────────────────────
export function makeAddToCart({
  product,
  getValidToken,
  setLoadingProductId,
  setCartItems,
  setIsCartOpen,
}) {
  return async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product?.id) return;
    setLoadingProductId(product.id);
    try {
      const token = await getValidToken();
      if (!token) {
        toast.error("🔐 Login required to add item to cart.");
        return;
      }
      let cartId =
        localStorage.getItem("cart_id") ||
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);
      const cartItem = {
        id: product.id,
        name: product.name,
        qty: 1,
        price:
          product.promo_price && new Date(product.end_date) > new Date()
            ? Number(product.promo_price)
            : Number(product.price),
        image: product.image,
      };
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]",
      );
      const existingIndex = existingCart.findIndex(
        (item) => item.id === product.id,
      );
      const updatedCart =
        existingIndex >= 0
          ? existingCart.map((item, i) =>
              i === existingIndex ? { ...item, qty: item.qty + 1 } : item,
            )
          : [...existingCart, cartItem];
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selected_country: "IN",
          product_id: product.id,
          variant_id: [],
          qty: 1,
          cart_id: cartId,
          historypincode: 600002,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        toast.error(data?.message || "Failed to add item to cart.");
        return;
      }
      toast.success("🛒 Added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
      setIsCartOpen?.(true);
    } catch (err) {
      console.error("💥 Add to cart failed:", err);
      toast.error("Something went wrong!");
    } finally {
      setLoadingProductId(null);
    }
  };
}

// ─── Reveal wrapper for scroll animations ───────────────────────────────────
export function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
