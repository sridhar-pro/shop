"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Star,
  StoreIcon,
} from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import CartSidebar from "@/app/components/CartSideBar";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

const getImageSrc = (image) => {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
};

// ─── Shared base styles (no color hardcodes — all via palette CSS vars) ───────
const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');

 .sp-wrapper {
    /* Palette vars populated inline per-render */
  }

  .sp-wrapper * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

  .sp-root { font-family: 'Outfit', sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
  .sp-display { font-family: 'Cormorant Garamond', serif; }

  .clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ── Shared animations ── */
  @keyframes sp-shimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes sp-float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes sp-pulse-ring {
    0%   { box-shadow: 0 0 0 0 var(--sp-accent-a30); }
    70%  { box-shadow: 0 0 0 12px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  @keyframes sp-scan {
    0%   { transform: skewX(-20deg) translateX(-200%); }
    100% { transform: skewX(-20deg) translateX(400%); }
  }
  @keyframes sp-fadeup {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sp-scroll-line {
    0%, 100% { opacity: 0.6; transform: scaleY(1); }
    50%       { opacity: 1;   transform: scaleY(1.3); }
  }

  /* ── Theme 1 ── */
  .t1-hero-media { position: relative; width: 100%; aspect-ratio: 21/9; min-height: 300px; overflow: hidden; }
  .t1-vignette {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: linear-gradient(to top,
      rgba(0,0,0,0.88) 0%,
      rgba(0,0,0,0.28) 45%,
      rgba(0,0,0,0.08) 70%,
      rgba(0,0,0,0.55) 100%
    );
  }
  .t1-grain {
    position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0.18;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  .t1-logo-wrap {
    border: 1px solid var(--sp-accent-a40);
    box-shadow: 0 0 28px var(--sp-accent-a15), inset 0 0 16px rgba(0,0,0,0.4);
    animation: sp-float 5s ease-in-out infinite;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(18px);
    border-radius: 18px;
    padding: 10px;
    flex-shrink: 0;
  }

  .t1-dot {
    height: 3px; border-radius: 2px;
    transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
    cursor: pointer; border: none; outline: none;
  }

  .t1-scroll-bar {
    position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
    z-index: 10; width: 1px; height: 38px;
    background: linear-gradient(to bottom, var(--sp-accent), transparent);
    animation: sp-scroll-line 2s ease-in-out infinite;
  }

  /* Category cards – T1 */
  .t1-cat-card {
    width: 138px; flex-shrink: 0;
    border-radius: 16px;
    border: 1px solid var(--sp-accent-a15);
    background: var(--sp-cat-bg);
    overflow: hidden;
    transition: all 0.42s cubic-bezier(0.23,1,0.32,1);
    position: relative;
  }
  .t1-cat-card:hover {
    border-color: var(--sp-accent-a45);
    transform: translateY(-5px);
    box-shadow: 0 18px 50px rgba(0,0,0,0.45), 0 0 0 1px var(--sp-accent-a20);
  }
  .t1-cat-img-area {
    display: flex; align-items: center; justify-content: center;
    padding: 16px 16px 8px;
    aspect-ratio: 1;
    position: relative;
  }
  .t1-cat-img-area::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, var(--sp-accent-a08) 0%, transparent 70%);
  }
  .t1-cat-badge {
    position: relative; overflow: hidden;
    padding: 7px 10px;
    background: linear-gradient(110deg, var(--sp-accent2), var(--sp-accent));
    text-align: center;
  }
  .t1-cat-badge::after {
    content: ''; position: absolute;
    top: -50%; left: -60%; width: 35%; height: 200%;
    background: rgba(255,255,255,0.18);
    animation: sp-scan 3.2s ease-in-out infinite;
  }
  .t1-cat-badge span {
    font-size: 9px; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--sp-badge-text);
    position: relative; z-index: 1;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: block;
  }
  .t1-corner { position: absolute; width: 18px; height: 18px; border-color: var(--sp-accent); border-style: solid; opacity: 0.45; }
  .t1-corner.tl { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
  .t1-corner.tr { top: 8px; right: 8px; border-width: 1px 1px 0 0; }
  .t1-corner.bl { bottom: 36px; left: 8px; border-width: 0 0 1px 1px; }
  .t1-corner.br { bottom: 36px; right: 8px; border-width: 0 1px 1px 0; }

  /* Product cards – T1 */
  .t1-prod-card {
    display: flex; flex-direction: row; border-radius: 20px; overflow: hidden;
    background: var(--sp-prod-bg);
    border: 1px solid var(--sp-accent-a12);
    transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
    position: relative;
  }
  .t1-prod-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--sp-accent-a06) 0%, transparent 55%);
    opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
  }
  .t1-prod-card:hover { border-color: var(--sp-accent-a38); transform: translateY(-4px); box-shadow: 0 22px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--sp-accent-a15); }
  .t1-prod-card:hover::before { opacity: 1; }
  .t1-prod-img-col {
    flex: 0 0 190px; display: flex; align-items: center; justify-content: center;
    padding: 22px; border-right: 1px solid var(--sp-accent-a08); position: relative; overflow: hidden;
  }
  .t1-prod-img-col::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, var(--sp-accent-a08) 0%, transparent 70%);
  }
  .t1-btn {
    position: relative; overflow: hidden;
    border: 1px solid var(--sp-accent2);
    color: var(--sp-accent);
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 10px 22px; border-radius: 8px;
    cursor: pointer; transition: all 0.3s ease;
    display: flex; align-items: center; gap: 8px;
    width: fit-content;
  }
  .t1-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, var(--sp-accent2), var(--sp-accent));
    opacity: 0; transition: opacity 0.3s ease;
  }
  .t1-btn:hover::before { opacity: 1; }
  .t1-btn:hover { color: var(--sp-badge-text); border-color: var(--sp-accent); }
  .t1-btn span { position: relative; z-index: 1; }
  .t1-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .t1-section-rule {
    display: flex; align-items: center; gap: 18px; margin-bottom: 52px;
  }
  .t1-section-rule::before, .t1-section-rule::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, transparent, var(--sp-accent-a40), transparent);
  }
  .t1-diamond {
    width: 8px; height: 8px; background: var(--sp-accent);
    transform: rotate(45deg); flex-shrink: 0;
  }

  .t1-contact-row {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 11px 0; border-bottom: 1px solid var(--sp-accent-a10);
    color: var(--sp-contact-text);
    font-size: 14px; transition: color 0.3s;
  }
  .t1-contact-row:hover { color: var(--sp-accent); }
  .t1-contact-row:last-child { border-bottom: none; }
  .t1-contact-icon { color: var(--sp-accent); opacity: 0.75; flex-shrink: 0; margin-top: 2px; }

  .t1-footer-line { height: 1px; background: linear-gradient(90deg, transparent, var(--sp-accent-a50), transparent); }

  /* ── Theme 2 ── */
  .t2-hero-desktop { display: none; }
  @media (min-width: 768px) { .t2-hero-desktop { display: block; } .t2-hero-mobile { display: none !important; } }

  .t2-cat-circle {
    position: relative;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.5s cubic-bezier(0.23,1,0.32,1);
    border: 2px solid var(--sp-accent-a20);
    background: var(--sp-cat-bg);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  }
  .t2-cat-circle::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 30% 30%, var(--sp-accent-a10), transparent 60%);
    border-radius: 50%;
  }
  .t2-cat-circle:hover {
    transform: translateY(-8px) scale(1.06);
    border-color: var(--sp-accent-a50);
    box-shadow: 0 20px 50px rgba(0,0,0,0.18), 0 0 0 3px var(--sp-accent-a15);
  }
  .t2-cat-name {
    margin-top: 14px; font-size: 14px; font-weight: 600;
    text-align: center; text-transform: capitalize;
    color: var(--sp-text);
    transition: all 0.3s;
  }
  .t2-cat-wrap:hover .t2-cat-name { color: var(--sp-accent); }

  .t2-prod-card {
    border-radius: 16px; overflow: hidden;
    display: flex; flex-direction: column; align-items: center;
    padding: 24px 20px;
    background: var(--sp-prod-bg);
    border: 1px solid var(--sp-accent-a12);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
    position: relative;
  }
  .t2-prod-card::after {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--sp-accent2), var(--sp-accent));
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23,1,0.32,1);
  }
  .t2-prod-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.15); border-color: var(--sp-accent-a30); }
  .t2-prod-card:hover::after { transform: scaleX(1); }
  .t2-prod-img-wrap { position: relative; width: 130px; height: 130px; margin-bottom: 16px; }
  .t2-prod-img-wrap::before {
    content: ''; position: absolute;
    bottom: -8px; left: 50%; transform: translateX(-50%);
    width: 70%; height: 16px;
    background: var(--sp-accent-a15);
    filter: blur(8px); border-radius: 50%;
  }

  .t2-btn {
    margin-top: 14px; padding: 9px 20px;
    border-radius: 8px; font-size: 12px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: 'Outfit', sans-serif; cursor: pointer;
    border: 1px solid var(--sp-accent);
    background: transparent; color: var(--sp-accent);
    transition: all 0.3s ease; width: 100%;
    position: relative; overflow: hidden;
  }
  .t2-btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(120deg, var(--sp-accent2), var(--sp-accent));
    opacity: 0; transition: opacity 0.3s;
  }
  .t2-btn:hover::before { opacity: 1; }
  .t2-btn:hover { color: var(--sp-badge-text); }
  .t2-btn span { position: relative; z-index: 1; }
  .t2-btn:disabled { opacity: 0.38; cursor: not-allowed; }

  .t2-about-card {
    border-radius: 24px;
    padding: 40px 36px;
    background: var(--sp-about-bg);
    border: 1px solid var(--sp-accent-a15);
    backdrop-filter: blur(12px);
    position: relative; overflow: hidden;
  }
  .t2-about-card::before {
    content: ''; position: absolute;
    top: -60px; right: -60px; width: 200px; height: 200px;
    background: radial-gradient(circle, var(--sp-accent-a10), transparent 70%);
    border-radius: 50%;
  }
  .t2-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 700; line-height: 1.1;
    color: var(--sp-text);
  }
  .t2-eyebrow {
    font-size: 10px; font-weight: 600; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--sp-accent);
    margin-bottom: 10px; display: block;
  }

  /* Shared loader */
  .sp-loader {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--sp-bg, #fafafa);
  }
  .sp-loader-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--sp-accent, #888);
    animation: sp-spin 0.8s linear infinite;
  }
  @keyframes sp-spin { to { transform: rotate(360deg); } }

  /* Responsive tweaks */
  @media (max-width: 640px) {
    .t1-prod-card { flex-direction: column; }
    .t1-prod-img-col { flex: unset; border-right: none; border-bottom: 1px solid var(--sp-accent-a08); padding: 20px; }
  }
`;

// ─── Helper: inject palette as CSS vars ──────────────────────────────────────
function buildCssVars(palette) {
  // accent is theme_color, accent2 is a slightly shifted/darker variant
  const accent = palette.theme_color || "#888";
  const accent2 = palette.section3_color || accent;
  return `
   .sp-wrapper,
.sp-wrapper [data-sp] {
      --sp-bg:          ${palette.section1_color || "#fff"};
      --sp-prod-bg:     ${palette.section2_color || "#f9f9f9"};
      --sp-cat-bg:      ${palette.section1_color2 || "#f5f5f5"};
      --sp-about-bg:    ${palette.section3_color || "#f0f0f0"};
      --sp-text:        ${palette.text_color || "#111"};
      --sp-muted:       ${palette.secondary_text_color || "#666"};
      --sp-accent:      ${accent};
      --sp-accent2:     ${accent2};
      --sp-badge-text:  ${palette.text_color || "#111"};
      --sp-contact-text: rgba(${hexToRgb(palette.text_color || "#111")}, 0.65);

      --sp-accent-a06:  rgba(${hexToRgb(accent)}, 0.06);
      --sp-accent-a08:  rgba(${hexToRgb(accent)}, 0.08);
      --sp-accent-a10:  rgba(${hexToRgb(accent)}, 0.10);
      --sp-accent-a12:  rgba(${hexToRgb(accent)}, 0.12);
      --sp-accent-a15:  rgba(${hexToRgb(accent)}, 0.15);
      --sp-accent-a20:  rgba(${hexToRgb(accent)}, 0.20);
      --sp-accent-a30:  rgba(${hexToRgb(accent)}, 0.30);
      --sp-accent-a38:  rgba(${hexToRgb(accent)}, 0.38);
      --sp-accent-a40:  rgba(${hexToRgb(accent)}, 0.40);
      --sp-accent-a45:  rgba(${hexToRgb(accent)}, 0.45);
      --sp-accent-a50:  rgba(${hexToRgb(accent)}, 0.50);
    }
  `;
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// ─── Shared Add-to-Cart handler factory ──────────────────────────────────────
function makeAddToCart({
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

// ══════════════════════════════════════════════════════════════
// THEME 1 — Cinematic Dark Luxury (colors from palette)
// ══════════════════════════════════════════════════════════════
function Theme1({
  shopData,
  palette,
  products,
  categories,
  media,
  hasMedia,
  currentIndex,
  setCurrentIndex,
  currentMedia,
  loadingProductId,
  setLoadingProductId,
  cartItems,
  setCartItems,
  isCartOpen,
  setIsCartOpen,
  getValidToken,
}) {
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
    },
  };

  return (
    <div className="sp-wrapper">
      <div
        className="sp-root"
        data-sp
        style={{ backgroundColor: palette.section1_color }}
      >
        {/* ── Hero ── */}
        {hasMedia && (
          <header className="t1-hero-media">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
                style={{ position: "absolute", inset: 0 }}
              >
                {currentMedia.type === "video" ? (
                  <video
                    src={currentMedia.src}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() =>
                      setCurrentIndex((p) => (p + 1) % media.length)
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src={currentMedia.src}
                    alt="Seller media"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="t1-vignette" />
            <div className="t1-grain" />

            {/* Identity */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.35,
                ease: [0.76, 0, 0.24, 1],
              }}
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                zIndex: 10,
                display: "flex",
                alignItems: "flex-end",
                gap: 22,
              }}
            >
              <div className="t1-logo-wrap">
                <img
                  src={getImageSrc(shopData.store_logo)}
                  alt={shopData.name}
                  style={{
                    height: 72,
                    width: 72,
                    objectFit: "contain",
                    borderRadius: 12,
                    display: "block",
                  }}
                />
              </div>
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: 10,
                    letterSpacing: "0.26em",
                    color: "var(--sp-accent)",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Official Store
                </span>
                <h1
                  className="sp-display"
                  style={{
                    fontSize: "clamp(1.9rem,4.2vw,3.6rem)",
                    color: "#fff",
                    lineHeight: 1.04,
                    fontWeight: 700,
                    textShadow: "0 4px 28px rgba(0,0,0,0.65)",
                  }}
                >
                  {shopData.name}
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.48)",
                    marginTop: 8,
                    letterSpacing: "0.05em",
                  }}
                >
                  Crafted with love &nbsp;·&nbsp; Curated for you
                </p>
              </div>
            </motion.div>

            {/* Pagination */}
            {media.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 38,
                  right: 36,
                  zIndex: 10,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className="t1-dot"
                    style={{
                      width: i === currentIndex ? 38 : 8,
                      background:
                        i === currentIndex
                          ? "var(--sp-accent)"
                          : "rgba(255,255,255,0.28)",
                    }}
                  />
                ))}
              </div>
            )}

            <div className="t1-scroll-bar" />
          </header>
        )}

        {/* ── Categories ── */}
        <section
          style={{
            padding: "88px 36px",
            background: `linear-gradient(180deg, ${palette.section1_color} 0%, ${palette.section1_color2} 100%)`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                fontSize: 10,
                letterSpacing: "0.3em",
                color: "var(--sp-accent)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 12,
              }}
            >
              Browse Collections
            </span>
            <h2
              className="sp-display"
              style={{
                fontSize: "clamp(2rem,4.2vw,3.1rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "var(--sp-text)",
                marginBottom: 14,
              }}
            >
              Shop by Category
            </h2>
            <p style={{ fontSize: 15, color: "var(--sp-muted)" }}>
              Explore your favorite categories — curated just for you.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "28px 36px",
              maxWidth: 1120,
              margin: "0 auto",
            }}
          >
            {categories?.map((cat, idx) => (
              <motion.div key={cat.slug || idx} variants={fadeUp}>
                <Link
                  href={`/products/category/${cat.slug}`}
                  aria-label={`Explore ${cat.name}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="t1-cat-card">
                    <div className="t1-cat-img-area">
                      <div className="t1-corner tl" />
                      <div className="t1-corner tr" />
                      <div className="t1-corner bl" />
                      <div className="t1-corner br" />
                      <motion.div
                        style={{ position: "relative", width: 80, height: 80 }}
                        whileHover={{ rotate: 4, scale: 1.09 }}
                        transition={{
                          type: "spring",
                          stiffness: 240,
                          damping: 18,
                        }}
                      >
                        <Image
                          src={getImageSrc(cat.image)}
                          alt={cat.name}
                          fill
                          className="object-contain"
                          style={{
                            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
                          }}
                          quality={100}
                        />
                      </motion.div>
                    </div>
                    <div className="t1-cat-badge">
                      <span>{cat.name}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Featured Products ── */}
        <section
          style={{
            padding: "80px 36px",
            background: `linear-gradient(180deg, ${palette.section2_color} 0%, ${palette.section2_color2} 100%)`,
          }}
        >
          <div className="t1-section-rule">
            <div className="t1-diamond" />
            <div>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  color: "var(--sp-accent)",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: 8,
                  transform: "translateX(32px)",
                }}
              >
                Handpicked for you
              </span>
              <h2
                className="sp-display"
                style={{
                  fontSize: "clamp(1.9rem,3.5vw,2.7rem)",
                  fontWeight: 700,
                  color: "var(--sp-text)",
                  lineHeight: 1.1,
                }}
              >
                Featured Picks
              </h2>
            </div>
            <div className="t1-diamond" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%,460px),1fr))",
              gap: 22,
              maxWidth: 1100,
              margin: "0 auto",
            }}
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="t1-prod-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.09,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Image col */}
                <div className="t1-prod-img-col">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: "relative", zIndex: 1 }}
                  >
                    <motion.img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      style={{
                        width: 136,
                        height: 136,
                        objectFit: "contain",
                        filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.35))",
                        display: "block",
                      }}
                      whileHover={{ scale: 1.09, rotate: 1.5 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 17,
                      }}
                    />
                  </Link>
                </div>

                {/* Info col */}
                <div
                  style={{
                    flex: 1,
                    padding: "26px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none" }}
                  >
                    <h3
                      className="clamp-2"
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "var(--sp-text)",
                        lineHeight: 1.45,
                        marginBottom: 10,
                        textTransform: "capitalize",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.color = "var(--sp-accent)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.color = "var(--sp-text)")
                      }
                    >
                      {product.name}
                    </h3>
                  </Link>
                  <p
                    className="sp-display font-odop"
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "var(--sp-accent)",
                      marginBottom: 18,
                      letterSpacing: "0.01em",
                    }}
                  >
                    ₹{Number(product.price).toFixed(2)}
                  </p>
                  <button
                    disabled={loadingProductId === product.id}
                    className="t1-btn"
                    onClick={makeAddToCart({
                      product,
                      getValidToken,
                      setLoadingProductId,
                      setCartItems,
                      setIsCartOpen,
                    })}
                  >
                    <ShoppingBag size={13} />
                    <span>
                      {loadingProductId === product.id
                        ? "Adding…"
                        : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            padding: "72px 36px 48px",
            background: `linear-gradient(180deg, ${palette.section3_color} 0%, ${palette.section3_color2} 100%)`,
            position: "relative",
          }}
        >
          <div className="t1-footer-line" style={{ marginBottom: 52 }} />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 48,
              justifyContent: "space-between",
              alignItems: "flex-start",
              maxWidth: 1120,
              margin: "0 auto",
            }}
          >
            {/* About */}
            <div style={{ flex: "1 1 300px", maxWidth: 440 }}>
              <span className="t2-eyebrow">Our Story</span>
              <h2
                className="sp-display"
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "var(--sp-text)",
                  marginBottom: 20,
                  lineHeight: 1.2,
                }}
              >
                About {shopData.name}
              </h2>
              <div
                style={{
                  color: "var(--sp-muted)",
                  fontSize: 14,
                  lineHeight: 1.9,
                  borderLeft: "2px solid var(--sp-accent-a30)",
                  paddingLeft: 20,
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    shopData.about_us
                      ?.match(/<p>(.*?)<\/p>/s)?.[1]
                      ?.split("<br")[0]
                      ?.trim() ||
                    "Our brand stands for innovation, reliability, and craftsmanship that make everyday life better.",
                }}
              />
            </div>

            {/* Contact */}
            <div style={{ flex: "1 1 220px" }}>
              <span className="t2-eyebrow">Get in Touch</span>
              <h2
                className="sp-display"
                style={{
                  fontSize: "1.7rem",
                  fontWeight: 700,
                  color: "var(--sp-text)",
                  marginBottom: 22,
                  lineHeight: 1.2,
                }}
              >
                Contact Us
              </h2>
              <div className="t1-contact-row">
                <Mail size={14} className="t1-contact-icon" />
                <span>{shopData.email}</span>
              </div>
              <div className="t1-contact-row">
                <Phone size={14} className="t1-contact-icon" />
                <span>{shopData.phone}</span>
              </div>
              <div className="t1-contact-row">
                <MapPin size={14} className="t1-contact-icon" />
                <span dangerouslySetInnerHTML={{ __html: shopData.address }} />
              </div>
            </div>

            {/* Logo */}
            <div style={{ flex: "0 0 auto" }}>
              <div
                style={{
                  border: "1px solid var(--sp-accent-a25)",
                  borderRadius: 20,
                  padding: 16,
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <img
                  src={getImageSrc(shopData.store_logo)}
                  alt={shopData.name}
                  style={{
                    height: 88,
                    width: 88,
                    objectFit: "contain",
                    borderRadius: 12,
                    display: "block",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 52,
              paddingTop: 22,
              borderTop: "1px solid var(--sp-accent-a10)",
              textAlign: "center",
              color: "var(--sp-muted)",
              fontSize: 12,
              letterSpacing: "0.05em",
            }}
          >
            © {new Date().getFullYear()} {shopData.name}. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// THEME 2 — Airy Editorial Light (colors from palette)
// ══════════════════════════════════════════════════════════════
function Theme2({
  shopData,
  palette,
  products,
  categories,
  media,
  hasMedia,
  currentIndex,
  setCurrentIndex,
  currentMedia,
  loadingProductId,
  setLoadingProductId,
  cartItems,
  setCartItems,
  isCartOpen,
  setIsCartOpen,
  getValidToken,
}) {
  return (
    <div className="sp-wrapper">
      <div
        className="sp-root"
        data-sp
        style={{ backgroundColor: palette.section1_color }}
      >
        {/* ── Hero ── */}
        {hasMedia && (
          <>
            {/* Desktop */}
            <header
              className="t2-hero-desktop"
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/4",
                overflow: "hidden",
                borderRadius: "0 0 32px 32px",
                boxShadow: "0 8px 48px rgba(0,0,0,0.12)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.65 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {currentMedia.type === "video" ? (
                    <video
                      src={currentMedia.src}
                      autoPlay
                      muted
                      playsInline
                      onEnded={() =>
                        setCurrentIndex((p) => (p + 1) % media.length)
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={currentMedia.src}
                      alt="Seller media"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {/* Soft bottom fade */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60%",
                  background: `linear-gradient(to top, ${palette.section1_color}cc, transparent)`,
                  zIndex: 2,
                }}
              />
              {/* Shop identity overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{
                  position: "absolute",
                  bottom: 28,
                  left: 40,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    backdropFilter: "blur(16px)",
                    borderRadius: 16,
                    padding: 10,
                    border: "1px solid var(--sp-accent-a20)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={getImageSrc(shopData.store_logo)}
                    alt={shopData.name}
                    style={{
                      height: 56,
                      width: 56,
                      objectFit: "contain",
                      borderRadius: 10,
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <h1
                    className="sp-display"
                    style={{
                      fontSize: "clamp(1.6rem,3vw,2.6rem)",
                      fontWeight: 700,
                      color: palette.text_color,
                      lineHeight: 1.1,
                      textShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    {shopData.name}
                  </h1>
                  <p
                    style={{
                      fontSize: 13,
                      color: palette.secondary_text_color,
                      marginTop: 5,
                    }}
                  >
                    Curated for you
                  </p>
                </div>
              </motion.div>
              {media.length > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        background:
                          i === currentIndex
                            ? "var(--sp-accent)"
                            : "rgba(255,255,255,0.5)",
                        transition: "all 0.3s",
                      }}
                    />
                  ))}
                </div>
              )}
            </header>

            {/* Mobile */}
            <div
              className="t2-hero-mobile"
              style={{
                display: "block",
                position: "relative",
                width: "100%",
                height: 130,
                overflow: "hidden",
                borderRadius: "0 0 20px 20px",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {currentMedia.type === "video" ? (
                    <video
                      src={currentMedia.src}
                      autoPlay
                      muted
                      playsInline
                      onEnded={() =>
                        setCurrentIndex((p) => (p + 1) % media.length)
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <img
                      src={currentMedia.src}
                      alt="Seller media"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        {/* ── Categories ── */}
        <section
          style={{
            padding: "80px 36px",
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(160deg, ${palette.section1_color} 0%, ${palette.section1_color2} 100%)`,
          }}
        >
          {/* decorative mesh */}
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 320,
              height: 320,
              background: `radial-gradient(circle, var(--sp-accent-a10), transparent 70%)`,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 240,
              height: 240,
              background: `radial-gradient(circle, var(--sp-accent-a08), transparent 70%)`,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              textAlign: "center",
              marginBottom: 60,
              position: "relative",
            }}
          >
            <span className="t2-eyebrow">Discover Collections</span>
            <h2 className="t2-section-title" style={{ marginBottom: 12 }}>
              Shop by Category
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--sp-muted)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Discover our finest selection — hand-picked just for you.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "36px 40px",
              position: "relative",
            }}
          >
            {categories?.map((cat, idx) => (
              <motion.div
                key={cat.id || idx}
                className="t2-cat-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.07,
                  ease: [0.23, 1, 0.32, 1],
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  width: 140,
                }}
              >
                <Link
                  href={`/products/category/${cat.slug}`}
                  aria-label={cat.name}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="t2-cat-circle"
                    style={{ width: 128, height: 128 }}
                  >
                    <motion.img
                      src={getImageSrc(cat.image)}
                      alt={cat.name}
                      style={{
                        width: "72%",
                        height: "72%",
                        objectFit: "contain",
                        position: "relative",
                        zIndex: 1,
                      }}
                      whileHover={{ scale: 1.1, rotate: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 18,
                      }}
                    />
                  </div>
                  <p className="t2-cat-name">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Products ── */}
        <section
          style={{
            padding: "80px 36px",
            background: `linear-gradient(180deg, ${palette.section2_color} 0%, ${palette.section2_color2} 100%)`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="t2-eyebrow">Editor's Choice</span>
            <h2 className="t2-section-title">Featured Products</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 20,
              maxWidth: 1200,
              margin: "0 auto",
            }}
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                className="t2-prod-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.06,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {/* Product image */}
                <div className="t2-prod-img-wrap">
                  <motion.img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    style={{
                      width: 130,
                      height: 130,
                      objectFit: "contain",
                      position: "relative",
                      zIndex: 1,
                      display: "block",
                    }}
                    whileHover={{ scale: 1.1, y: -4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  />
                </div>

                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--sp-text)",
                    lineHeight: 1.45,
                    textTransform: "capitalize",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: "2.6em",
                  }}
                >
                  {product.name}
                </h3>

                <p
                  className="sp-display font-odop"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--sp-accent)",
                    marginTop: 6,
                  }}
                >
                  ₹{Number(product.price).toFixed(2)}
                </p>

                <button
                  disabled={loadingProductId === product.id}
                  className="t2-btn"
                  onClick={makeAddToCart({
                    product,
                    getValidToken,
                    setLoadingProductId,
                    setCartItems,
                    setIsCartOpen,
                  })}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
                    }}
                  >
                    <ShoppingBag size={12} />
                    {loadingProductId === product.id
                      ? "Adding…"
                      : "Add to Cart"}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── About + Contact ── */}
        <section
          style={{
            padding: "88px 36px",
            background: `linear-gradient(160deg, ${palette.section3_color} 0%, ${palette.section3_color2} 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background:
                "linear-gradient(90deg, transparent, var(--sp-accent-a40), transparent)",
            }}
          />

          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="t2-eyebrow">Who We Are</span>
            <h2 className="t2-section-title">About {shopData.name}</h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--sp-muted)",
                marginTop: 12,
                maxWidth: 480,
                margin: "12px auto 0",
              }}
            >
              A closer look at our journey, passion, and purpose.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 48,
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 1000,
              margin: "0 auto",
            }}
          >
            {/* Logo + tagline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                flex: "0 0 auto",
              }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  border: "1px solid var(--sp-accent-a25)",
                  borderRadius: 24,
                  padding: 18,
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 36px rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src={getImageSrc(shopData.store_logo)}
                  alt={shopData.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "contain",
                    borderRadius: 14,
                    display: "block",
                  }}
                />
              </motion.div>
              <h3
                className="sp-display"
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--sp-text)",
                  textAlign: "center",
                  textTransform: "capitalize",
                }}
              >
                {shopData.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--sp-muted)",
                  textAlign: "center",
                  maxWidth: 200,
                }}
              >
                {shopData.tagline || "Ideas brought to life with purpose."}
              </p>
            </div>

            {/* About card */}
            <div
              className="t2-about-card"
              style={{ flex: "1 1 360px", maxWidth: 580 }}
            >
              <div
                style={{
                  color: "var(--sp-text)",
                  fontSize: 15,
                  lineHeight: 1.85,
                  position: "relative",
                }}
                dangerouslySetInnerHTML={{
                  __html:
                    shopData.about_us
                      ?.match(/<p>(.*?)<\/p>/s)?.[1]
                      ?.split("<br")[0]
                      ?.trim() ||
                    "Our brand stands for innovation, reliability, and craftsmanship.",
                }}
              />

              <div
                style={{
                  height: 1,
                  background: "var(--sp-accent-a20)",
                  margin: "28px 0",
                }}
              />

              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  { Icon: Mail, val: shopData.email },
                  { Icon: Phone, val: shopData.phone },
                  { Icon: MapPin, val: shopData.address, isHtml: true },
                ].map(({ Icon, val, isHtml }, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      color: "var(--sp-text)",
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--sp-accent-a10)",
                        border: "1px solid var(--sp-accent-a20)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ color: "var(--sp-accent)" }} />
                    </div>
                    {isHtml ? (
                      <span
                        dangerouslySetInnerHTML={{ __html: val }}
                        style={{ paddingTop: 8 }}
                      />
                    ) : (
                      <span style={{ paddingTop: 8 }}>{val}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT PAGE COMPONENT
// ══════════════════════════════════════════════════════════════
const SellerShopPage = () => {
  const { slug } = useParams();
  const { getValidToken } = useAuth();

  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const token = await getValidToken();
        const body = {
          filters: {
            gifts_products: "",
            query: "",
            category: "",
            subcategory: "",
            sub_subcategory: "",
            brand: "",
            sorting: "name-asc",
            min_price: "1",
            max_price: "",
            in_stock: "0",
            page: "1",
            sort_by_v: "",
            limit: 24,
            offset: "0",
            warehouses_id: slug,
          },
        };
        const res = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to fetch shop data");
        const data = await res.json();
        // 🚨 CONDITION HANDLING
        if (!data?.warehouse || data?.warehouse?.warehouses_id === null) {
          setShopData(null); // triggers "Shop not found"
          setProducts([]);
          setCategories([]);
          return;
        }

        setShopData({
          ...data.warehouse,
          // theme_type: 2,
        });
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("❌ Error fetching shop data:", err);
        setShopData(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchShopData();
  }, [slug, getValidToken]);

  const videoSrc = shopData?.about_video
    ? getImageSrc(shopData.about_video)
    : null;
  const images = shopData
    ? [shopData.slider, shopData.slider2].filter(Boolean)
    : [];
  const media = [];
  if (videoSrc) media.push({ type: "video", src: videoSrc });
  images.forEach((img) => media.push({ type: "image", src: getImageSrc(img) }));
  const hasMedia = media.length > 0;
  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (media.length <= 1 || currentMedia?.type === "video") return;
    const timer = setTimeout(
      () => setCurrentIndex((p) => (p + 1) % media.length),
      5000,
    );
    return () => clearTimeout(timer);
  }, [currentIndex, media, currentMedia]);

  function ShopSkeleton() {
    return (
      <div className="sp-wrapper">
        <div className="sp-root animate-pulse">
          {/* Hero */}
          <div className="w-full h-[250px] bg-gray-200" />

          {/* Categories */}
          <div className="p-8">
            <div className="h-6 w-40 bg-gray-200 mx-auto mb-6 rounded" />

            <div className="flex flex-wrap justify-center gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-28 h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="p-8">
            <div className="h-6 w-48 bg-gray-200 mx-auto mb-8 rounded" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg bg-gray-100 space-y-3"
                >
                  <div className="h-24 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-300 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <ShopSkeleton />;
  if (!shopData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 py-16 font-odop">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[20px] w-full max-w-md px-10 py-12 text-center shadow-sm">
          {/* Icon */}
          <div className="w-[72px] h-[72px] rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-7">
            <StoreIcon className="w-7 h-7 text-gray-400 dark:text-zinc-400" />
          </div>

          {/* Status pill */}
          <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 dark:text-zinc-400 tracking-wide">
              Store unavailable
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-[22px] font-medium text-gray-900 dark:text-white tracking-tight leading-snug mb-2">
            This store isn't available
          </h1>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            The store you're looking for may have moved, been paused, or doesn't
            exist. Check the link or try again later.
          </p>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-zinc-800 mb-8" />

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-3 rounded-[10px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Go to home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-[10px] border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const palette = {
    theme_color: shopData.theme_color,
    text_color: shopData.text_color,
    secondary_text_color: shopData.secondary_text_color,
    section1_color: shopData.section1_color,
    section1_color2: shopData.section1_color2,
    section2_color: shopData.section2_color,
    section2_color2: shopData.section2_color2,
    section3_color: shopData.section3_color,
    section3_color2: shopData.section3_color2,
  };

  const sharedProps = {
    shopData,
    palette,
    products,
    categories,
    media,
    hasMedia,
    currentIndex,
    setCurrentIndex,
    currentMedia,
    loadingProductId,
    setLoadingProductId,
    cartItems,
    setCartItems,
    isCartOpen,
    setIsCartOpen,
    getValidToken,
  };

  return (
    <>
      <style>{baseStyles}</style>
      <style>{buildCssVars(palette)}</style>

      {shopData.theme_type === 2 ? (
        <Theme2 {...sharedProps} />
      ) : (
        <Theme1 {...sharedProps} />
      )}

      {/* ✅ GLOBAL (NOT inside sp-wrapper anymore) */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setIsCartOpen(false)}
          />
          <CartSidebar
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            setCartItems={setCartItems}
          />
        </>
      )}
    </>
  );
};

export default SellerShopPage;
