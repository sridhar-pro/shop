import { ShoppingBag } from "lucide-react";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getImageSrc, hexToRgb, makeAddToCart, Reveal } from "./utils";

// ══════════════════════════════════════════════════════════════
// THEME 2 — Airy Editorial (Light, Structured, Modern)
// Clean white/off-white base, accent pops, editorial rhythm
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
  const accent = palette.theme_color || "#2563eb";
  const accentRgb = hexToRgb(accent);
  const bg = palette.section1_color || "#fafaf8";
  const bg2 = palette.section1_color2 || "#f0f0ea";
  const prodBg = palette.section2_color || "#ffffff";
  const prodBg2 = palette.section2_color2 || "#f5f5f0";
  const aboutBg = palette.section3_color || "#f8f8f4";
  const aboutBg2 = palette.section3_color2 || "#efefea";
  const text = palette.text_color || "#111010";
  const muted = palette.secondary_text_color || "#6b6b6a";

  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: bg,
        color: text,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* ── HERO ── */}
      {hasMedia && (
        <>
          {/* Desktop hero — wide cinematic banner */}
          <header
            className="relative w-full overflow-hidden hidden md:block"
            style={{
              borderRadius: "0 0 36px 36px",
              boxShadow: "0 12px 60px rgba(0,0,0,0.1)",
            }}
          >
            <div className="relative w-full" style={{ aspectRatio: "16/5" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: "easeInOut" }}
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
                      alt="Seller media"
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Soft vignette */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)`,
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-2/3"
                style={{
                  background: `linear-gradient(to top, ${bg}dd, transparent)`,
                }}
              />

              {/* Identity */}
              <motion.div
                className="absolute z-10 flex items-center gap-5"
                style={{ bottom: 32, left: 44 }}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div
                  className="rounded-2xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid rgba(${accentRgb},0.2)`,
                    boxShadow: "0 6px 28px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={getImageSrc(shopData.store_logo)}
                    alt={shopData.name}
                    className="w-14 h-14 object-contain rounded-xl block"
                  />
                </div>
                <div>
                  <h1
                    className="font-bold"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "clamp(1.7rem, 3.2vw, 2.8rem)",
                      color: text,
                      lineHeight: 1.1,
                    }}
                  >
                    {shopData.name}
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: muted }}>
                    Curated for you
                  </p>
                </div>
              </motion.div>

              {/* Dot nav */}
              {media.length > 1 && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {media.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className="rounded-full border-none cursor-pointer"
                      animate={{
                        width: i === currentIndex ? 28 : 8,
                        height: 8,
                        background:
                          i === currentIndex ? accent : "rgba(255,255,255,0.5)",
                      }}
                      transition={{ duration: 0.35 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Mobile hero */}
          <div
            className="relative w-full md:hidden overflow-hidden"
            style={{ height: 160, borderRadius: "0 0 20px 20px" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
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
                    alt="Seller media"
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ── CATEGORIES ── */}
      <section
        className="py-20 px-6 md:px-12 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${bg} 0%, ${bg2} 100%)` }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${accentRgb},0.06), transparent 70%)`,
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(${accentRgb},0.05), transparent 70%)`,
          }}
        />

        <Reveal className="text-center mb-14">
          <span
            className="inline-block text-[10px] font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: accent }}
          >
            Discover Collections
          </span>
          <h2
            className="font-bold mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: text,
              lineHeight: 1.1,
            }}
          >
            Shop by Category
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: muted, maxWidth: 380 }}
          >
            Discover our finest selection — hand-picked just for you.
          </p>
        </Reveal>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 relative">
          {categories?.map((cat, idx) => (
            <Reveal key={cat.id || idx} delay={idx * 0.06}>
              <Link
                href={`/products/category/${cat.slug}`}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  className="flex flex-col items-center cursor-pointer"
                  style={{ width: 130 }}
                  whileHover="hovered"
                >
                  {/* Circle */}
                  <motion.div
                    className="relative rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      width: 230,
                      height: 170,
                      padding: 12,
                      border: `2px solid rgba(${accentRgb},0.14)`,
                      background: `
      radial-gradient(circle at 30% 25%, rgba(${accentRgb},0.12), transparent 55%),
      linear-gradient(145deg,#fff,#f8f8f8)
    `,
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.7)",
                    }}
                    variants={{
                      hovered: {
                        y: -8,
                        scale: 1.05,
                        borderColor: `rgba(${accentRgb},0.45)`,
                        boxShadow: `
        0 22px 45px rgba(0,0,0,.14),
        0 0 0 5px rgba(${accentRgb},0.10)
      `,
                      },
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <motion.img
                      src={getImageSrc(cat.image)}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-lg"
                      variants={{
                        hovered: {
                          scale: 1.12,
                        },
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />

                    {/* Soft shine */}
                    <motion.div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,.45), transparent 45%, transparent 70%, rgba(255,255,255,.15))",
                      }}
                      variants={{
                        hovered: {
                          opacity: 1,
                        },
                      }}
                    />
                  </motion.div>

                  {/* Name */}
                  <motion.p
                    className="mt-3.5 text-sm font-medium capitalize text-center"
                    style={{ color: text }}
                    variants={{ hovered: { color: accent } }}
                    transition={{ duration: 0.25 }}
                  >
                    {cat.name}
                  </motion.p>
                </motion.div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section
        className="py-20 px-6 md:px-12"
        style={{
          background: `linear-gradient(180deg, ${prodBg} 0%, ${prodBg2} 100%)`,
        }}
      >
        <Reveal className="text-center mb-14">
          <span
            className="inline-block text-[10px] font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: accent }}
          >
            Editor's Choice
          </span>
          <h2
            className="font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: text,
              lineHeight: 1.1,
            }}
          >
            Featured Products
          </h2>
        </Reveal>

        <div
          className="grid gap-5 max-w-6xl mx-auto"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 0.055}>
              <motion.div
                className="relative rounded-2xl overflow-hidden flex flex-col items-center p-6 text-center"
                style={{
                  background: prodBg,
                  border: `1px solid rgba(${accentRgb},0.1)`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
                whileHover={{
                  y: -7,
                  boxShadow: `0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(${accentRgb},0.25)`,
                  borderColor: `rgba(${accentRgb},0.3)`,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Top accent bar (reveals on hover) */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-0.5 origin-left"
                  style={{
                    background: `linear-gradient(90deg, rgba(${accentRgb},0.8), ${accent})`,
                  }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Product image */}
                <div
                  className="relative mb-4"
                  style={{ width: 130, height: 130 }}
                >
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 blur-lg rounded-full"
                    style={{ background: `rgba(${accentRgb},0.12)` }}
                  />
                  <motion.img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain relative z-10"
                    whileHover={{ scale: 1.1, y: -4 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  />
                </div>

                {/* Name */}
                <h3
                  className="text-sm font-medium capitalize leading-snug"
                  style={{
                    color: text,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    minHeight: "2.6em",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {product.name}
                </h3>

                {/* Price */}
                <p
                  className="font-bold mt-2"
                  style={{
                    fontSize: 20,
                    color: accent,
                  }}
                >
                  ₹{Number(product.price).toFixed(2)}
                </p>

                {/* Add to cart */}
                <motion.button
                  disabled={loadingProductId === product.id}
                  onClick={makeAddToCart({
                    product,
                    getValidToken,
                    setLoadingProductId,
                    setCartItems,
                    setIsCartOpen,
                  })}
                  className="relative overflow-hidden mt-4 w-full rounded-xl text-xs font-semibold uppercase tracking-[0.08em] py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    border: `1px solid rgba(${accentRgb},0.6)`,
                    color: accent,
                    background: "transparent",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      background: `linear-gradient(120deg, rgba(${accentRgb},0.85), ${accent})`,
                    }}
                    transition={{ duration: 0.25 }}
                  />
                  <span className="relative z-10 flex items-center gap-2 justify-center">
                    <ShoppingBag size={12} />
                    {loadingProductId === product.id
                      ? "Adding…"
                      : "Add to Cart"}
                  </span>
                </motion.button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ABOUT + CONTACT ── */}
      <section
        className="py-24 px-6 md:px-12 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${aboutBg} 0%, ${aboutBg2} 100%)`,
        }}
      >
        {/* Top rule */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${accentRgb},0.4), transparent)`,
          }}
        />

        <Reveal className="text-center mb-16">
          <span
            className="inline-block text-[10px] font-semibold tracking-[0.3em] uppercase mb-3"
            style={{ color: accent }}
          >
            Who We Are
          </span>
          <h2
            className="font-bold mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: text,
              lineHeight: 1.1,
            }}
          >
            About {shopData.name}
          </h2>
          <p
            className="text-sm mx-auto"
            style={{ color: muted, maxWidth: 420 }}
          >
            A closer look at our journey, passion, and purpose.
          </p>
        </Reveal>

        <div className="flex flex-wrap gap-12 items-start justify-center max-w-4xl mx-auto">
          {/* Logo + tagline */}
          <Reveal className="flex flex-col items-center gap-4 flex-shrink-0">
            <motion.div
              className="rounded-3xl p-5"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                border: `1px solid rgba(${accentRgb},0.2)`,
                boxShadow: "0 8px 36px rgba(0,0,0,0.07)",
              }}
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={getImageSrc(shopData.store_logo)}
                alt={shopData.name}
                className="w-24 h-24 object-contain rounded-2xl block"
              />
            </motion.div>
            <h3
              className="font-semibold text-center capitalize"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.3rem",
                color: text,
              }}
            >
              {shopData.name}
            </h3>
            <p
              className="text-xs text-center max-w-[180px]"
              style={{ color: muted }}
            >
              {shopData.tagline || "Ideas brought to life with purpose."}
            </p>
          </Reveal>

          {/* About card */}
          <Reveal
            delay={0.1}
            className="flex-1"
            style={{ minWidth: 300, maxWidth: 580 }}
          >
            <div
              className="rounded-3xl p-9 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(14px)",
                border: `1px solid rgba(${accentRgb},0.12)`,
                boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
              }}
            >
              {/* Decorative orb */}
              <div
                className="absolute -top-14 -right-14 w-44 h-44 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(${accentRgb},0.08), transparent 70%)`,
                }}
              />

              {/* About text */}
              <div
                className="text-sm leading-relaxed relative"
                style={{ color: text, lineHeight: 1.9 }}
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
                className="my-7 h-px"
                style={{ background: `rgba(${accentRgb},0.15)` }}
              />

              {/* Contact items */}
              <div className="flex flex-col gap-3.5">
                {[
                  { Icon: Mail, val: shopData.email },
                  { Icon: Phone, val: shopData.phone },
                  { Icon: MapPin, val: shopData.address, html: true },
                ].map(({ Icon, val, html }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 text-sm"
                    style={{ color: text }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `rgba(${accentRgb},0.08)`,
                        border: `1px solid rgba(${accentRgb},0.18)`,
                      }}
                    >
                      <Icon size={14} style={{ color: accent }} />
                    </div>
                    {html ? (
                      <span
                        className="pt-2"
                        dangerouslySetInnerHTML={{ __html: val }}
                      />
                    ) : (
                      <span className="pt-2">{val}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default Theme2;
