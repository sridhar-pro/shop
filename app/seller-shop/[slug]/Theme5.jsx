import { useState, useRef } from "react";
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Hand,
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
  ChevronDown,
  ArrowRight,
  Quote,
  BadgeCheck,
  Star,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { getImageSrc, hexToRgb, makeAddToCart, Reveal } from "./utils";

// ══════════════════════════════════════════════════════════════
// THEME 5 — The Maker's Atelier
// Editorial, soft-luxury storefront for an individual artisan seller.
// Signature element: "The Maker's Seal" — a stitched, stamp-like
// monogram that authenticates the hero, the story, and every product,
// standing in for the trust a customer can't get in person.
// ══════════════════════════════════════════════════════════════

const FEATURES = [
  {
    Icon: Hand,
    title: "Handmade",
    desc: "Shaped by hand, never mass-produced.",
  },
  {
    Icon: Leaf,
    title: "Sustainable",
    desc: "Small batches, honest materials.",
  },
  {
    Icon: Truck,
    title: "Fast Shipping",
    desc: "Packed with care, sent without delay.",
  },
  {
    Icon: ShieldCheck,
    title: "Trusted Seller",
    desc: "Verified maker on Yuukke.",
  },
];

function StitchDivider({ color }) {
  return (
    <svg
      width="100%"
      height="17"
      viewBox="0 0 100 17"
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <line
        x1="0"
        y1="8.5"
        x2="100"
        y2="8.5"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="0.6 4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function MakerSeal({ letter, accent, accentRgb, size = 64 }) {
  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={`rgba(${accentRgb},0.08)`}
          stroke={accent}
          strokeWidth="1.2"
          strokeDasharray="1.2 4.4"
        />
        <circle
          cx="50"
          cy="50"
          r="37"
          fill="none"
          stroke={accent}
          strokeWidth="0.6"
        />
      </svg>
      <span
        className="absolute"
        style={{
          fontFamily: "'Fraunces', serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: size * 0.36,
          color: accent,
        }}
      >
        {letter}
      </span>
    </div>
  );
}

function Theme5({
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
  const accent = palette.theme_color || "#c0782a";
  const accentRgb = hexToRgb(accent);
  const bg = palette.section1_color || "#f5efe6";
  const bg2 = palette.section1_color2 || "#ede4d8";
  const prodBg = palette.section2_color || "#faf6f0";
  const prodBg2 = palette.section2_color2 || "#f0e8da";
  const footBg = palette.section3_color || "#2c2018";
  const footBg2 = palette.section3_color2 || "#1e1610";
  const text = palette.text_color || "#2a1f14";
  const muted = palette.secondary_text_color || "#8a7060";

  const [wishlisted, setWishlisted] = useState({});
  const toggleWishlist = (id) =>
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));

  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaImageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`;

  const scrollTo = (id) => {
    if (typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const storyText =
    shopData.about_us
      ?.match(/<p>(.*?)<\/p>/s)?.[1]
      ?.split("<br")[0]
      ?.trim()
      ?.substring(0, 280) ||
    "Every piece leaves the workbench a little different from the last — that's not a flaw, it's the signature of a hand at work, not a machine.";

  const monogram = (shopData.name || "?").trim().charAt(0).toUpperCase();
  const topCategories = (categories || []).slice(0, 5);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: bg,
        color: text,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,340..600;1,9..144,340..600&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .t5-mono { font-family: 'JetBrains Mono', monospace; letter-spacing: 0.14em; text-transform: uppercase; }
        .t5-display { font-family: 'Fraunces', serif; }
        @media (prefers-reduced-motion: reduce) {
          .t5-reduced-motion * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ══════════════ HERO ══════════════ */}
      <header className="relative overflow-hidden">
        {hasMedia ? (
          <div className="relative h-[560px] md:h-[680px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
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
                    className="w-full h-full object-cover absolute inset-0"
                  />
                ) : (
                  <img
                    src={currentMedia.src}
                    alt={shopData.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.78) 100%)",
              }}
            />

            {media.length > 1 && (
              <div className="absolute top-6 right-6 z-20 flex gap-1.5">
                {media.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="rounded-full border-none cursor-pointer"
                    style={{
                      width: i === currentIndex ? 22 : 6,
                      height: 6,
                      background:
                        i === currentIndex ? "#fff" : "rgba(255,255,255,0.4)",
                      transition: "all 0.35s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            className="relative h-[520px] md:h-[600px]"
            style={{
              background: `radial-gradient(120% 100% at 20% 0%, ${bg2}, ${bg})`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: noiseSvg,
                backgroundSize: "200px",
                opacity: 0.5,
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 480,
                height: 480,
                right: "-8%",
                top: "-12%",
                background: `radial-gradient(circle, rgba(${accentRgb},0.16), transparent 70%)`,
                filter: "blur(10px)",
              }}
            />
          </div>
        )}

        {/* Glass content card */}
        <motion.div
          className="absolute z-20 left-4 right-4 md:left-10 md:right-auto bottom-16 md:bottom-20 md:max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="rounded-3xl px-6 py-7 md:px-9 md:py-9"
            style={{
              background: hasMedia
                ? "rgba(15,12,10,0.42)"
                : "rgba(255,255,255,0.5)",
              backdropFilter: "blur(18px)",
              border: `1px solid ${hasMedia ? "rgba(255,255,255,0.18)" : `rgba(${accentRgb},0.22)`}`,
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck size={13} color={accent} />
              <span
                className="t5-mono text-[10px]"
                style={{ color: hasMedia ? "rgba(255,255,255,0.75)" : accent }}
              >
                Verified Maker · Yuukke
              </span>
            </div>

            <h1
              className="t5-display"
              style={{
                fontStyle: "italic",
                fontWeight: 480,
                fontSize: "clamp(2.2rem,5vw,4rem)",
                lineHeight: 1.05,
                color: hasMedia ? "#fff" : text,
                textShadow: hasMedia ? "0 4px 30px rgba(0,0,0,0.35)" : "none",
              }}
            >
              {shopData.name}
            </h1>

            <p
              className="mt-4 text-sm md:text-[15px] leading-relaxed max-w-md"
              style={{ color: hasMedia ? "rgba(255,255,255,0.82)" : muted }}
            >
              Handmade, sourced honestly, and shipped straight from the
              workbench to your door.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <motion.button
                onClick={() => scrollTo("shop")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                style={{ background: accent, color: "#fff" }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                Explore Shop
                <ArrowRight size={13} />
              </motion.button>
              <motion.button
                onClick={() => scrollTo("story")}
                className="px-5 py-2.5 rounded-full text-xs font-medium cursor-pointer"
                style={{
                  background: "transparent",
                  color: hasMedia ? "#fff" : text,
                  border: `1px solid ${hasMedia ? "rgba(255,255,255,0.4)" : `rgba(${accentRgb},0.4)`}`,
                }}
                whileHover={{ scale: 1.04, borderColor: accent }}
                whileTap={{ scale: 0.97 }}
              >
                Our Story
              </motion.button>
            </div>

            {topCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {topCategories.map((cat, idx) => (
                  <Link
                    key={cat.slug || idx}
                    href={`/products/category/${cat.slug}`}
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      className="text-[10px] px-3 py-1.5 rounded-full inline-block"
                      style={{
                        background: hasMedia
                          ? "rgba(255,255,255,0.12)"
                          : `rgba(${accentRgb},0.1)`,
                        color: hasMedia ? "rgba(255,255,255,0.85)" : accent,
                        border: `1px solid ${hasMedia ? "rgba(255,255,255,0.2)" : `rgba(${accentRgb},0.25)`}`,
                      }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Maker's Seal — bridges hero to next section */}
        <div
          className="absolute z-30 left-1/2"
          style={{ bottom: -32, transform: "translateX(-50%)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-full"
            style={{
              background: bg,
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            }}
          >
            <MakerSeal
              letter={monogram}
              accent={accent}
              accentRgb={accentRgb}
              size={64}
            />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        {hasMedia && (
          <motion.button
            onClick={() => scrollTo("features")}
            aria-label="Scroll down"
            className="absolute z-20 right-6 md:right-10 bottom-6 cursor-pointer border-none bg-transparent flex flex-col items-center gap-1"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <span
              className="t5-mono text-[9px]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Scroll
            </span>
            <ChevronDown size={16} color="rgba(255,255,255,0.7)" />
          </motion.button>
        )}
      </header>

      {/* ══════════════ FEATURES ══════════════ */}
      <section
        id="features"
        className="pt-20 pb-14 px-6 md:px-14"
        style={{ background: bg }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <motion.div
                className="flex flex-col items-start gap-3 p-5 rounded-2xl h-full"
                style={{ border: `1px solid rgba(${accentRgb},0.14)` }}
                whileHover={{ y: -4, borderColor: `rgba(${accentRgb},0.4)` }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 40,
                    height: 40,
                    background: `rgba(${accentRgb},0.1)`,
                  }}
                >
                  <Icon size={17} color={accent} />
                </div>
                <p className="text-sm font-semibold" style={{ color: text }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: muted }}>
                  {desc}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ STORY ══════════════ */}
      <section
        id="story"
        className="py-20 md:py-28 px-6 md:px-14"
        style={{ background: bg }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-[0.8fr_1.2fr] gap-10 md:gap-16 items-center">
          <Reveal>
            <div className="flex flex-col items-start gap-6">
              <img
                src={getImageSrc(shopData.store_logo)}
                alt={shopData.name}
                className="rounded-2xl object-contain"
                style={{
                  width: 160,
                  height: 160,
                  padding: 16,
                  background: `rgba(${accentRgb},0.06)`,
                  border: `1px solid rgba(${accentRgb},0.16)`,
                }}
              />
              <StitchDivider color={`rgba(${accentRgb},0.5)`} />
              <p className="t5-mono text-[10px]" style={{ color: accent }}>
                About the Maker
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <Quote size={26} color={accent} style={{ opacity: 0.6 }} />
              <p
                className="t5-display mt-3"
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "clamp(1.4rem,2.6vw,2.1rem)",
                  lineHeight: 1.4,
                  color: text,
                }}
              >
                {storyText}
              </p>
              <div className="flex items-center gap-3 mt-8">
                <MakerSeal
                  letter={monogram}
                  accent={accent}
                  accentRgb={accentRgb}
                  size={36}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: text }}>
                    {shopData.name}
                  </p>
                  <p className="text-xs" style={{ color: muted }}>
                    Independent maker on Yuukke
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ CATEGORIES ══════════════ */}
      {categories?.length > 0 && (
        <section
          className="py-16 md:py-20 px-6 md:px-14"
          style={{ background: bg2 }}
        >
          <Reveal className="mb-10">
            <p className="t5-mono text-[10px] mb-2" style={{ color: accent }}>
              Browse by craft
            </p>
            <h2
              className="t5-display"
              style={{
                fontStyle: "italic",
                fontSize: "clamp(1.6rem,3vw,2.3rem)",
                color: text,
              }}
            >
              What we make
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 max-w-6xl mx-auto">
            {categories.map((cat, idx) => (
              <Reveal key={cat.slug || idx} delay={idx * 0.05}>
                <Link
                  href={`/products/category/${cat.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <motion.div
                    className="relative flex flex-col items-center gap-3 px-4 py-6 rounded-2xl cursor-pointer overflow-hidden"
                    style={{
                      background: prodBg,
                      border: `1px solid rgba(${accentRgb},0.14)`,
                    }}
                    whileHover={{
                      y: -6,
                      boxShadow: `0 20px 45px rgba(${accentRgb},0.2)`,
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 120,
                        height: 120,
                        top: -30,
                        right: -30,
                        background: `radial-gradient(circle, rgba(${accentRgb},0.18), transparent 70%)`,
                      }}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                    <motion.img
                      src={getImageSrc(cat.image)}
                      alt={cat.name}
                      className="w-36 h-36 object-contain relative z-10"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span
                      className="text-xs font-medium capitalize text-center relative z-10"
                      style={{ color: text }}
                    >
                      {cat.name}
                    </span>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════ PRODUCTS ══════════════ */}
      <section
        id="shop"
        className="py-20 md:py-24 px-6 md:px-14"
        style={{ background: prodBg }}
      >
        <Reveal className="text-center mb-14">
          <p className="t5-mono text-[10px] mb-2" style={{ color: accent }}>
            The Collection
          </p>
          <h2
            className="t5-display"
            style={{
              fontStyle: "italic",
              fontWeight: 450,
              fontSize: "clamp(1.9rem,3.4vw,2.7rem)",
              color: text,
            }}
          >
            Handpicked Pieces
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 max-w-6xl mx-auto">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 6) * 0.06}>
              <motion.div
                className="group relative rounded-[24px] overflow-hidden flex flex-col"
                style={{
                  background: prodBg2,
                  border: `1px solid rgba(${accentRgb},0.12)`,
                }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 24px 55px rgba(${accentRgb},0.18)`,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 220 }}
                >
                  <motion.img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />

                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full t5-mono text-[8px]"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      color: accent,
                    }}
                  >
                    No. {String(i + 1).padStart(3, "0")}
                  </div>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Save to wishlist"
                    className="absolute top-3 right-3 flex items-center justify-center rounded-full cursor-pointer border-none"
                    style={{
                      width: 30,
                      height: 30,
                      background: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <Heart
                      size={13}
                      color={accent}
                      fill={wishlisted[product.id] ? accent : "none"}
                    />
                  </button>

                  <motion.div
                    className="absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                    initial={{ y: 12 }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
                    }}
                  >
                    <motion.button
                      disabled={loadingProductId === product.id}
                      onClick={makeAddToCart({
                        product,
                        getValidToken,
                        setLoadingProductId,
                        setCartItems,
                        setIsCartOpen,
                      })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium cursor-pointer disabled:opacity-50"
                      style={{ background: "#fff", color: accent }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingBag size={12} />
                      {loadingProductId === product.id
                        ? "Adding…"
                        : "Quick Add"}
                    </motion.button>
                  </motion.div>
                </div>

                <div className="p-5 flex flex-col gap-2.5 flex-1">
                  <h3
                    className="font-medium capitalize leading-snug line-clamp-2"
                    style={{ fontSize: 14.5, color: text }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <p
                      className="t5-display"
                      style={{
                        fontStyle: "italic",
                        fontSize: 19,
                        color: accent,
                      }}
                    >
                      ₹{Number(product.price).toFixed(2)}
                    </p>
                    <span
                      className="t5-mono text-[8px]"
                      style={{ color: muted }}
                    >
                      In Stock
                    </span>
                  </div>
                  <motion.button
                    disabled={loadingProductId === product.id}
                    onClick={makeAddToCart({
                      product,
                      getValidToken,
                      setLoadingProductId,
                      setCartItems,
                      setIsCartOpen,
                    })}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-medium cursor-pointer disabled:opacity-40"
                    style={{
                      background: `rgba(${accentRgb},0.1)`,
                      color: accent,
                      border: `1px solid rgba(${accentRgb},0.25)`,
                    }}
                    whileHover={{ background: accent, color: "#fff" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ShoppingBag size={12} />
                    {loadingProductId === product.id
                      ? "Adding…"
                      : "Add to Cart"}
                  </motion.button>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════ MID CTA (parallax) ══════════════ */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden"
        style={{ height: 420 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ y: ctaImageY, scale: 1.15 }}
        >
          <img
            src={getImageSrc(products?.[0]?.image || shopData.store_logo)}
            alt=""
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,14,10,0.55), rgba(20,14,10,0.75))",
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <p
              className="t5-display"
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(1.9rem,4.4vw,3.2rem)",
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Crafted with care.
              <br />
              Delivered with love.
            </p>
          </Reveal>
          <motion.button
            onClick={() => scrollTo("shop")}
            className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full text-xs font-medium cursor-pointer"
            style={{ background: "#fff", color: text }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            Explore Collection
            <ArrowRight size={13} />
          </motion.button>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer
        className="relative overflow-hidden py-16 px-8 md:px-14"
        style={{ background: `linear-gradient(180deg,${footBg},${footBg2})` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: noiseSvg,
            backgroundSize: "200px",
            opacity: 0.12,
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <StitchDivider color={`rgba(${accentRgb},0.35)`} />
          <div className="flex flex-wrap gap-12 justify-between mt-10">
            <div className="flex items-center gap-4">
              <MakerSeal
                letter={monogram}
                accent={accent}
                accentRgb={accentRgb}
                size={52}
              />
              <div>
                <p
                  className="t5-display"
                  style={{
                    fontStyle: "italic",
                    fontSize: "1.3rem",
                    color: "#fff",
                  }}
                >
                  {shopData.name}
                </p>
                <p
                  className="t5-mono text-[9px] mt-1"
                  style={{ color: accent }}
                >
                  Verified Maker
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { Icon: Mail, val: shopData.email },
                { Icon: Phone, val: shopData.phone },
                { Icon: MapPin, val: shopData.address, html: true },
              ]
                .filter((row) => row.val)
                .map(({ Icon, val, html }, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "rgba(255,255,255,0.75)" }}
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

          <div
            className="mt-14 pt-6 flex flex-wrap items-center justify-between gap-3"
            style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}
          >
            <p
              className="text-[11px]"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              © {new Date().getFullYear()} {shopData.name}. All rights reserved.
            </p>
            <p
              className="t5-mono text-[9px]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Powered by Yuukke
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Theme5;
