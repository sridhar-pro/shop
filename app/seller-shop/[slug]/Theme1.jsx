import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc, hexToRgb, makeAddToCart, Reveal } from "./utils";

// ──────────────────────────────────────────────────────────────
// THEME 1 — Editorial Premium Storefront
// Inspired by Aesop, Apple, and modern luxury DTC brands
// ──────────────────────────────────────────────────────────────
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
  const accent = palette.theme_color || "#8b6f47";
  const accentRgb = hexToRgb(accent);

  // Sophisticated neutral system — warm off-whites, soft stone, deep ink
  const bg = palette.section1_color || "#faf8f5";
  const prodBg = palette.section2_color || "#ffffff";
  const footBg = palette.section3_color || "#1a1a1a";
  const text = palette.text_color || "#1a1a1a";
  const muted = palette.secondary_text_color || "#6b6b6b";

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], ["0%", "15%"]);

  const cssVars = {
    "--acc": accent,
    "--acc-rgb": accentRgb,
    "--acc-soft": `rgba(${accentRgb}, 0.08)`,
    "--acc-border": `rgba(${accentRgb}, 0.18)`,
    "--txt": text,
    "--mut": muted,
    "--bg": bg,
    "--prod-bg": prodBg,
    "--foot-bg": footBg,
  };

  return (
    <div style={cssVars} className="min-h-screen w-full overflow-x-hidden">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@300;400;500;600&display=swap");
        .font-display {
          font-family: "Fraunces", Georgia, serif;
          font-feature-settings: "ss01";
        }
        .font-body {
          font-family:
            "Inter",
            -apple-system,
            sans-serif;
        }
        .eyebrow {
          font-family: "Inter", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="font-body" style={{ background: bg, color: text }}>
        {/* ─────────────── HERO ─────────────── */}
        {hasMedia && (
          <section className="relative w-full">
            <div className="relative w-full h-[92vh] min-h-[560px] max-h-[900px] overflow-hidden">
              <motion.div
                style={{ y: heroY }}
                className="absolute inset-0 w-full h-[115%]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    {currentMedia.type === "video" ? (
                      <video
                        src={getImageSrc(currentMedia.url)}
                        autoPlay
                        muted
                        playsInline
                        onEnded={() =>
                          setCurrentIndex((p) => (p + 1) % media.length)
                        }
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <Image
                        src={getImageSrc(currentMedia.url)}
                        alt={shopData.name}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Refined gradient overlay — only where the text sits */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
                }}
              />

              {/* Identity — bottom-left editorial placement */}
              <div className="absolute inset-x-0 bottom-0 z-10">
                <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-10 sm:pb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-end gap-5 sm:gap-7"
                  >
                    {shopData.store_logo && (
                      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/95 backdrop-blur-sm ring-1 ring-white/30 shadow-2xl">
                        <Image
                          src={getImageSrc(shopData.store_logo)}
                          alt={shopData.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 text-white">
                      <div
                        className="eyebrow mb-2 sm:mb-3 flex items-center gap-2"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        <span
                          className="inline-block w-6 h-px"
                          style={{ background: accent }}
                        />
                        Official Store
                      </div>
                      <h1 className="font-display text-4xl sm:text-6xl md:text-7xl leading-[0.95] tracking-[-0.02em] font-light">
                        {shopData.name}
                      </h1>
                      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/80 max-w-md font-light">
                        Crafted with care · Curated for you
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Minimal carousel indicators */}
              {media.length > 1 && (
                <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-10 flex items-center gap-2">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Slide ${i + 1}`}
                      className="group p-2 -m-2"
                    >
                      <motion.span
                        className="block rounded-full"
                        animate={{
                          width: i === currentIndex ? 28 : 6,
                          background:
                            i === currentIndex
                              ? "rgba(255,255,255,0.95)"
                              : "rgba(255,255,255,0.4)",
                        }}
                        transition={{ duration: 0.4 }}
                        style={{ height: 2 }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─────────────── CATEGORIES ─────────────── */}
        {categories?.length > 0 && (
          <section className="py-20 sm:py-28" style={{ background: bg }}>
            <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
              <Reveal>
                <div className="flex items-end justify-between mb-10 sm:mb-14 gap-6 flex-wrap">
                  <div>
                    <div className="eyebrow mb-3" style={{ color: accent }}>
                      Collections
                    </div>
                    <h2 className="font-display text-3xl sm:text-5xl leading-[1] tracking-[-0.02em] font-light">
                      Shop by category
                    </h2>
                  </div>
                  <p
                    className="text-sm max-w-xs font-light leading-relaxed"
                    style={{ color: muted }}
                  >
                    A curated edit of collections, each handpicked to inspire.
                  </p>
                </div>
              </Reveal>

              {/* Horizontal scroll on mobile · grid on desktop */}
              <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:overflow-visible -mx-6 px-6 sm:mx-0 sm:px-0">
                {categories.map((cat, idx) => (
                  <Reveal key={cat.id || idx} delay={idx * 0.05}>
                    <Link
                      href={`/products/category/${cat.slug}`}
                      className="group block snap-start shrink-0 w-[70%] sm:w-auto"
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black/5"
                      >
                        <Image
                          src={getImageSrc(cat.image)}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 640px) 70vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `linear-gradient(180deg, transparent 55%, rgba(${accentRgb},0.35) 100%)`,
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                          <h3 className="font-display text-white text-xl sm:text-2xl leading-tight font-normal tracking-tight drop-shadow-lg">
                            {cat.name}
                          </h3>
                          <motion.div
                            initial={{ opacity: 0.7 }}
                            whileHover={{ x: 3 }}
                            className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shrink-0"
                          >
                            <ArrowUpRight
                              size={14}
                              style={{ color: accent }}
                              strokeWidth={2}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─────────────── PRODUCTS ─────────────── */}
        <section className="py-20 sm:py-28" style={{ background: prodBg }}>
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
            <Reveal>
              <div className="text-center mb-14 sm:mb-20">
                <div className="eyebrow mb-4" style={{ color: accent }}>
                  Featured
                </div>
                <h2 className="font-display text-4xl sm:text-6xl leading-[1] tracking-[-0.02em] font-light">
                  Handpicked for you
                </h2>
                <div
                  className="mx-auto mt-6 h-px w-12"
                  style={{ background: accent }}
                />
              </div>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 sm:gap-x-8 sm:gap-y-20">
              {products.map((product, i) => (
                <Reveal key={product.id} delay={(i % 3) * 0.08}>
                  <article className="group">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div
                        className="relative aspect-[4/5] overflow-hidden rounded-xl mb-5"
                        style={{ background: `rgba(${accentRgb}, 0.04)` }}
                      >
                        <Image
                          src={getImageSrc(product.image)}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    </Link>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/products/${product.slug}`}>
                          <h3
                            className="font-display text-base sm:text-lg leading-snug font-normal tracking-tight line-clamp-2 hover:opacity-70 transition-opacity"
                            style={{ color: text }}
                          >
                            {product.name}
                          </h3>
                        </Link>
                        <p
                          className="mt-1.5 text-base sm:text-lg font-medium tracking-tight"
                          style={{ color: text }}
                        >
                          ₹{Number(product.price).toFixed(2)}
                        </p>
                      </div>

                      <motion.button
                        onClick={makeAddToCart({
                          product,
                          getValidToken,
                          setLoadingProductId,
                          setCartItems,
                          setIsCartOpen,
                        })}
                        disabled={loadingProductId === product.id}
                        whileTap={{ scale: 0.92 }}
                        aria-label={`Add ${product.name} to cart`}
                        className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-60"
                        style={{
                          background:
                            loadingProductId === product.id
                              ? accent
                              : "transparent",
                          border: `1px solid ${loadingProductId === product.id ? accent : `rgba(${accentRgb},0.35)`}`,
                          color:
                            loadingProductId === product.id ? "#fff" : accent,
                        }}
                        onMouseEnter={(e) => {
                          if (loadingProductId !== product.id) {
                            e.currentTarget.style.background = accent;
                            e.currentTarget.style.color = "#fff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (loadingProductId !== product.id) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = accent;
                          }
                        }}
                      >
                        {loadingProductId === product.id ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 0.9,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                          />
                        ) : (
                          <ShoppingBag size={15} strokeWidth={1.75} />
                        )}
                      </motion.button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─────────────── ABOUT + CONTACT (FOOTER) ─────────────── */}
        <footer style={{ background: footBg, color: "#f5f5f5" }}>
          {/* Accent separator */}
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
            <div
              className="h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              }}
            />
          </div>

          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
            {/* Brand mark */}
            <Reveal>
              <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
                {shopData.store_logo && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white ring-1 ring-white/10 mb-6">
                    <Image
                      src={getImageSrc(shopData.store_logo)}
                      alt={shopData.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="eyebrow mb-3" style={{ color: accent }}>
                  Our Story
                </div>
                <h2 className="font-display text-3xl sm:text-5xl leading-[1.05] tracking-[-0.02em] font-light max-w-2xl">
                  About {shopData.name}
                </h2>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-14 sm:gap-20 max-w-4xl mx-auto">
              {/* About */}
              <div
                className="prose prose-invert prose-sm max-w-none font-light leading-relaxed text-[15px] text-justify"
                style={{ color: "rgba(245,245,245,0.72)" }}
                dangerouslySetInnerHTML={{
                  __html:
                    shopData.about_us?.trim() ||
                    `
        <p>
          We are committed to offering carefully selected products that combine quality,
          value, and exceptional customer service. Every item in our collection is chosen
          with attention to detail, ensuring a reliable shopping experience for every customer.
        </p>
        <br/>
        <p>
          Thank you for visiting our store. We look forward to serving you and helping you
          discover products you'll love.
        </p>
      `,
                }}
              />

              {/* Contact */}
              <Reveal delay={0.1}>
                <div>
                  <div className="eyebrow mb-6" style={{ color: accent }}>
                    Get in touch
                  </div>
                  <ul className="space-y-5">
                    {[
                      {
                        Icon: Mail,
                        val: shopData.email,
                        href: `mailto:${shopData.email}`,
                      },
                      {
                        Icon: Phone,
                        val: shopData.phone,
                        href: `tel:${shopData.phone}`,
                      },
                      { Icon: MapPin, val: shopData.address, html: true },
                    ]
                      .filter((x) => x.val)
                      .map(({ Icon, val, html, href }, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <span
                            className="shrink-0 mt-0.5 w-9 h-9 rounded-full flex items-center justify-center"
                            style={{
                              background: `rgba(${accentRgb},0.12)`,
                              color: accent,
                            }}
                          >
                            <Icon size={15} strokeWidth={1.75} />
                          </span>
                          {html ? (
                            <span
                              className="text-[15px] font-light leading-relaxed pt-1.5"
                              style={{ color: "rgba(245,245,245,0.82)" }}
                              dangerouslySetInnerHTML={{ __html: val }}
                            />
                          ) : href ? (
                            <a
                              href={href}
                              className="text-[15px] font-light leading-relaxed pt-1.5 hover:opacity-80 transition-opacity"
                              style={{ color: "rgba(245,245,245,0.82)" }}
                            >
                              {val}
                            </a>
                          ) : (
                            <span
                              className="text-[15px] font-light leading-relaxed pt-1.5"
                              style={{ color: "rgba(245,245,245,0.82)" }}
                            >
                              {val}
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </Reveal>
            </div>

            {/* Closing signature */}
            <div
              className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
              style={{ color: "rgba(245,245,245,0.5)" }}
            >
              <span className="font-body tracking-wide">
                © {new Date().getFullYear()} {shopData.name}
              </span>
              <span className="eyebrow" style={{ color: accent }}>
                Thank you for visiting
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Theme1;
