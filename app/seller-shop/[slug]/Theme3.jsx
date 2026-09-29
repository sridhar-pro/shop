"use client";

import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getImageSrc, hexToRgb, makeAddToCart, Reveal } from "./utils";

// ══════════════════════════════════════════════════════════════
// THEME 3 — Soft Luxury Boutique
// Cream/ivory base, serif-forward, large editorial product grid
// Great for: jewelry, candles, skincare, handmade crafts
// ══════════════════════════════════════════════════════════════
function Theme3({
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
  const accent = palette.theme_color || "#b07d62";
  const accentRgb = hexToRgb(accent);
  const bg = palette.section1_color || "#fdf8f3";
  const bg2 = palette.section1_color2 || "#f7efe5";
  const prodBg = palette.section2_color || "#fffcf9";
  const prodBg2 = palette.section2_color2 || "#f5ede3";
  const footBg = palette.section3_color || "#2a2018";
  const footBg2 = palette.section3_color2 || "#1a1410";
  const text = palette.text_color || "#1c1612";
  const muted = palette.secondary_text_color || "#8a7060";

  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: bg,
        color: text,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: `rgba(${hexToRgb(bg)},0.88)`,
          backdropFilter: "blur(18px)",
          borderBottom: `1px solid rgba(${accentRgb},0.12)`,
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src={getImageSrc(shopData.store_logo)}
            alt={shopData.name}
            className="w-28 h-28 object-contain rounded-full"
            style={{ border: `1px solid rgba(${accentRgb},0.3)` }}
          />
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18,
              color: text,
            }}
          >
            {shopData.name}
          </span>
        </div>
        <span
          className="hidden md:block text-xs tracking-[0.28em] uppercase"
          style={{ color: accent }}
        >
          Handmade with love
        </span>
      </nav>

      {/* ── SPLIT HERO ── */}
      {hasMedia && (
        <section
          className="grid md:grid-cols-[70%_30%]"
          style={{ minHeight: 480 }}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentMedia.src}
                    alt="hero"
                    className="w-full h-full object-fill"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg,rgba(${accentRgb},0.15),transparent 60%)`,
              }}
            />
            {media.length > 1 && (
              <div className="absolute bottom-5 left-5 flex gap-2 z-10">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className="rounded-full border-none cursor-pointer"
                    style={{
                      width: i === currentIndex ? 28 : 8,
                      height: 8,
                      background:
                        i === currentIndex ? accent : "rgba(255,255,255,0.5)",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <motion.div
            className="flex flex-col justify-center px-12 py-16"
            style={{ background: bg2 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="text-[10px] tracking-[0.36em] uppercase font-medium mb-6"
              style={{ color: accent }}
            >
              Est. Artisan Collection
            </span>
            <h1
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(2.4rem,5vw,4rem)",
                color: text,
                lineHeight: 1.08,
                marginBottom: 20,
              }}
            >
              {shopData.name}
            </h1>
            <div className="w-12 h-0.5 mb-6" style={{ background: accent }} />
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: muted, maxWidth: 380 }}
              dangerouslySetInnerHTML={{
                __html:
                  shopData.about_us
                    ?.match(/<p>(.*?)<\/p>/s)?.[1]
                    ?.split("<br")[0]
                    ?.trim()
                    ?.substring(0, 220) + "…" ||
                  "We craft beautiful things for beautiful lives. Every piece made with intention.",
              }}
            />
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: muted }}
            >
              <MapPin size={13} style={{ color: accent }} />
              <span dangerouslySetInnerHTML={{ __html: shopData.address }} />
            </div>
          </motion.div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <section
        className="py-24 px-6 md:px-12"
        style={{
          background: `
      radial-gradient(circle at top left,
      rgba(${accentRgb},0.05),
      transparent 40%),
      ${bg}
    `,
        }}
      >
        <Reveal className="mb-12">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span
                className="uppercase tracking-[0.3em] text-[11px]"
                style={{ color: accent }}
              >
                Curated Selection
              </span>

              <h2
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "clamp(2rem,4vw,3rem)",
                  color: text,
                  lineHeight: 1.08,
                }}
              >
                Browse the <em>collection</em>
              </h2>
            </div>

            <div className="w-16 h-[2px]" style={{ background: accent }} />
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories?.map((cat, idx) => (
            <Reveal key={cat.slug || idx} delay={idx * 0.06}>
              <Link
                href={`/products/category/${cat.slug}`}
                className="block"
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="
              group
              relative
              overflow-hidden
              rounded-[28px]
              p-6
              h-full
              backdrop-blur-md
            "
                  style={{
                    background: `linear-gradient(
                135deg,
                rgba(${accentRgb},0.10),
                rgba(255,255,255,.02)
              )`,
                    border: `1px solid rgba(${accentRgb},0.18)`,
                    boxShadow: `0 12px 40px rgba(${accentRgb},0.08)`,
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      className="
                  w-40
                  h-32
                  rounded-lg
                  overflow-hidden
                  mb-5
                  flex
                  items-center
                  justify-center
                "
                      style={{
                        background: `rgba(${accentRgb},0.08)`,
                      }}
                    >
                      <img
                        src={getImageSrc(cat.image)}
                        alt={cat.name}
                        className="
                    w-44
                    h-44
                    object-contain
                    transition-transform
                    duration-500
                    group-hover:scale-110
                  "
                      />
                    </motion.div>

                    <h3
                      className="text-[15px] font-medium capitalize italic"
                      style={{
                        color: text,
                      }}
                    >
                      {cat.name}
                    </h3>

                    <div
                      className="
                  mt-4
                  text-xs
                  flex
                  items-center
                  gap-2
                  opacity-0
                  translate-y-2
                  group-hover:opacity-100
                  group-hover:translate-y-0
                  transition-all
                "
                      style={{ color: accent }}
                    >
                      Explore →
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                    style={{
                      background: `
                  radial-gradient(
                    circle at top,
                    rgba(${accentRgb},0.12),
                    transparent 60%
                  )
                `,
                    }}
                  />
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      {/* ── PRODUCTS ── */}
      <section className="py-16 px-6 md:px-12" style={{ background: prodBg }}>
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <span
              className="block text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: accent }}
            >
              Curated picks
            </span>
            <h2
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
                color: text,
                lineHeight: 1.1,
              }}
            >
              Our Favourites
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.07} className="h-full">
              <motion.div
                onClick={() => setSelectedProduct(product)}
                className="relative rounded-3xl overflow-hidden flex flex-col group h-full"
                style={{
                  background: prodBg2,
                  border: `1px solid rgba(${accentRgb},0.12)`,
                }}
                whileHover={{
                  y: -5,
                  boxShadow: `0 24px 60px rgba(${accentRgb},0.14)`,
                  borderColor: `rgba(${accentRgb},0.32)`,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{
                    aspectRatio: "1 / 1",
                  }}
                >
                  <motion.img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1/3"
                    style={{
                      background: `linear-gradient(to top,${prodBg2},transparent)`,
                    }}
                  />
                </div>
                <div className="p-5 flex flex-col">
                  <h3
                    className="font-medium capitalize leading-snug line-clamp-2"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 17,
                      color: text,
                    }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between pt-5">
                    <p
                      className="font-bold"
                      style={{ fontSize: 20, color: accent }}
                    >
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                    <motion.button
                      disabled={loadingProductId === product.id}
                      onClick={(e) => {
                        makeAddToCart({
                          product,
                          getValidToken,
                          setLoadingProductId,
                          setCartItems,
                          setIsCartOpen,
                        })(e);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide cursor-pointer disabled:opacity-40"
                      style={{
                        background: accent,
                        color: "#fff",
                        border: "none",
                      }}
                      whileHover={{
                        scale: 1.06,
                        boxShadow: `0 6px 22px rgba(${accentRgb},0.4)`,
                      }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <ShoppingBag size={12} />
                      {loadingProductId === product.id ? "…" : "Add"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
          relative
          overflow-hidden
          rounded-[32px]
          max-w-5xl
          w-full
          bg-white
          grid
          md:grid-cols-[48%_52%]
        "
              style={{
                background: prodBg,
                border: `1px solid rgba(${accentRgb},0.16)`,
              }}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-5 right-5 z-20 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="aspect-square">
                <img
                  src={getImageSrc(selectedProduct.image)}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:p-10 flex flex-col">
                <span
                  className="uppercase text-[11px] tracking-[0.3em]"
                  style={{ color: accent }}
                >
                  Product Details
                </span>

                <h2
                  className="mt-4 capitalize"
                  style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: "clamp(2rem,4vw,3rem)",
                    color: text,
                  }}
                >
                  {selectedProduct.name}
                </h2>

                <p
                  className="mt-4 text-2xl font-bold"
                  style={{ color: accent }}
                >
                  ₹{Number(selectedProduct.price).toFixed(2)}
                </p>

                <div
                  className="mt-8 text-sm leading-7"
                  style={{ color: muted }}
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedProduct.details ||
                      "Beautifully crafted and thoughtfully designed.",
                  }}
                />

                <motion.button
                  disabled={loadingProductId === selectedProduct.id}
                  onClick={async (e) => {
                    e.stopPropagation();

                    await makeAddToCart({
                      product: selectedProduct,
                      getValidToken,
                      setLoadingProductId,
                      setCartItems,
                      setIsCartOpen,
                    })(e);

                    setSelectedProduct(null);
                  }}
                  className="
              mt-auto
              flex
              items-center
              justify-center
              gap-3
              px-6
              py-4
              rounded-full
              cursor-pointer
            "
                  style={{
                    background: accent,
                    color: "#fff",
                  }}
                  whileHover={{
                    scale: 1.02,
                  }}
                >
                  <ShoppingBag size={16} />

                  {loadingProductId === selectedProduct.id
                    ? "Adding..."
                    : "Add to Cart"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <footer
        className="py-16 px-8 md:px-14"
        style={{ background: `linear-gradient(180deg,${footBg},${footBg2})` }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap gap-12 justify-between">
          <div style={{ flex: "1 1 260px" }}>
            <img
              src={getImageSrc(shopData.store_logo)}
              alt={shopData.name}
              className="w-14 h-14 object-contain rounded-2xl mb-5"
            />
            <h3
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "1.5rem",
                color: muted,
                marginBottom: 12,
              }}
            >
              {shopData.name}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: muted, maxWidth: 340 }}
              dangerouslySetInnerHTML={{
                __html:
                  (shopData.about_us
                    ?.match(/<p>(.*?)<\/p>/s)?.[1]
                    ?.split("<br")[0]
                    ?.substring(0, 180) ||
                    "Discover curated products crafted with quality, creativity, and care. Explore unique collections designed to bring great experiences to every purchase.") +
                  "",
              }}
            />
          </div>
          <div style={{ flex: "0 1 200px" }}>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-5"
              style={{ color: accent }}
            >
              Contact
            </p>
            {[
              { Icon: Mail, val: shopData.email },
              { Icon: Phone, val: shopData.phone },
              { Icon: MapPin, val: shopData.address, html: true },
            ].map(({ Icon, val, html }, i) => (
              <div
                key={i}
                className="flex items-start gap-3 mb-4 text-sm"
                style={{ color: muted }}
              >
                <Icon
                  size={13}
                  style={{ color: accent, marginTop: 2, flexShrink: 0 }}
                />
                {html ? (
                  <span dangerouslySetInnerHTML={{ __html: val }} />
                ) : (
                  <span>{val}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Theme3;
