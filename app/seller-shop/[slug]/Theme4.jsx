import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Hand,
  Leaf,
  Truck,
  ShieldCheck,
  Heart,
  Star,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { getImageSrc, makeAddToCart, Reveal } from "./utils";

// ══════════════════════════════════════════════════════════════
// THEME 4 — Premium Editorial / Artisan House
// Warm parchment, bronze accents, Playfair serif headings.
// Signature: curtain-wipe reveal + rotated spine typography, carried
// across hero, story, categories and footer as one continuous rule.
// Great for: handmade goods, artisan crafts, textile, pottery, boutique.
// ══════════════════════════════════════════════════════════════

/* ── Curtain-reveal wrapper — reused for products AND categories ── */
function CurtainImage({ src, alt, className, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <div ref={ref} className="relative w-full h-full overflow-hidden">
      <img src={src} alt={alt} className={className} style={style} />
      <motion.div
        className="absolute inset-0 origin-right"
        style={{ backgroundColor: "var(--t5-surface)" }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: inView ? 0 : 1 }}
        transition={{ duration: 0.85, ease: [0.77, 0, 0.18, 1], delay: 0.1 }}
      />
    </div>
  );
}

/* ── Rotated edge label — the spine motif, reused as a section marker ── */
function SpineLabel({ text, color }) {
  return (
    <span
      className="t5-italic"
      style={{
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        fontSize: 11,
        letterSpacing: "0.22em",
        color,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

/* ── Marquee strip ── */
function Marquee({ items, accent }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="overflow-hidden flex items-center"
      style={{
        height: 42,
        borderTop: `1px solid ${accent}`,
        borderBottom: `1px solid ${accent}`,
        background: "#0D0B0A",
      }}
      aria-hidden="true"
    >
      <motion.div
        className="flex whitespace-nowrap flex-shrink-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-5 px-8"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: 13,
              letterSpacing: "0.1em",
              color: "#D4B483",
            }}
          >
            <span
              className="rounded-full flex-shrink-0"
              style={{ width: 4, height: 4, background: accent }}
            />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const FEATURES = [
  { Icon: Hand, title: "Handmade", desc: "Every piece shaped by hand." },
  {
    Icon: Leaf,
    title: "Sustainable",
    desc: "Small batches, honest materials.",
  },
  {
    Icon: Truck,
    title: "Fast Shipping",
    desc: "Packed with care, sent quickly.",
  },
  {
    Icon: ShieldCheck,
    title: "Trusted Seller",
    desc: "Verified artisan on Yuukke.",
  },
];

function Theme4({
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
  // ── Palette tokens ──
  const parchment = palette.section1_color || "#F7F3EE";
  const surface = palette.section1_color2 || "#EFE9E1";
  const prodBg = palette.section2_color || "#F7F3EE";
  const footBg = palette.section3_color || "#0D0B0A";
  const ink = palette.text_color || "#1A1714";
  const muted = palette.secondary_text_color || "#8A7D72";
  const bronze = palette.theme_color || "#B8935A";
  const bronzeLight = "#D4B483";
  const roseDeep = "#C9A98A";

  const CSS_VARS = {
    "--t5-parchment": parchment,
    "--t5-surface": surface,
    "--t5-ink": ink,
    "--t5-bronze": bronze,
    "--t5-bronze-l": bronzeLight,
    "--t5-muted": muted,
  };

  const MARQUEE_ITEMS = [
    "Handcrafted with care",
    "Artisan verified",
    "New arrivals weekly",
    "Ethically sourced",
  ];

  const [wishlisted, setWishlisted] = useState({});
  const toggleWishlist = (id) =>
    setWishlisted((prev) => ({ ...prev, [id]: !prev[id] }));

  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaImageY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  const scrollTo = (id) => {
    if (typeof document !== "undefined") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const storyQuote =
    shopData.bio ||
    "Every piece in our collection carries the fingerprints of the maker — no middlemen, no compromises, just objects that hold memory, texture, and intention.";

  // ── CSS (scoped via .t5 prefix) ──
  const styles = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,600&display=swap');

.t5 {
  font-family: 'DM Sans', system-ui, sans-serif;
  background: ${parchment};
  color: ${ink};
}

/* Hero */
.t5-hero-spine {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 52px;
  border-right: 1px solid rgba(184,147,90,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
}

.t5-spine-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: ${bronzeLight};
  text-transform: uppercase;
  white-space: nowrap;
}

/* Hero media */
.t5-hero-media-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Typography */
.t5-serif { font-family: 'Playfair Display', Georgia, serif; }
.t5-italic { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; }
.t5-sans { font-family: 'DM Sans', system-ui, sans-serif; }

/* Scroll */
.t5-scroll-track {
  position: relative;
  width: 1px;
  height: 48px;
  background: rgba(247,243,238,0.12);
  overflow: hidden;
}
.t5-scroll-track::after {
  content: '';
  position: absolute;
  top: -48px;
  left: 0;
  width: 1px;
  height: 48px;
  background: ${bronze};
  animation: t5ScrollDrop 2s ease-in-out 1.4s infinite;
}
@keyframes t5ScrollDrop {
  0% { top: -48px; }
  60% { top: 48px; }
  61% { top: -48px; }
  100% { top: -48px; }
}

/* Products */
.t5-products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

@media (max-width: 1280px) {
  .t5-products-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .t5-products-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .t5-products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

/* Pills / feature columns */
.t5-pill {
  transition: background .25s, border-color .25s, color .25s, transform .2s;
}
.t5-pill:hover {
  background: ${bronze} !important;
  border-color: ${bronze} !important;
  color: white !important;
  transform: translateY(-2px);
}

.t5-feature-col {
  border-left: 1px solid rgba(184,147,90,0.25);
  transition: border-color .3s, transform .3s;
}
.t5-feature-col:hover { border-color: ${bronze}; transform: translateY(-3px); }

/* Category cards */
.t5-cat-card { transition: box-shadow .35s, border-color .35s, transform .35s; }
.t5-cat-card:hover {
  border-color: ${bronze} !important;
  box-shadow: 0 24px 48px rgba(184,147,90,0.18);
  transform: translateY(-4px);
}
.t5-cat-card:hover .t5-product-img { transform: scale(1.06); filter: saturate(1); }

/* Buttons */
.t5-add-btn { transition: background .25s, transform .2s; }
.t5-add-btn:hover:not(:disabled) { background: ${bronze} !important; transform: translateY(-1px); }
.t5-add-btn:disabled { opacity: .4; cursor: not-allowed; }

/* Product hover */
.t5-product-img {
  transition: transform .7s cubic-bezier(0.22,1,0.36,1), filter .5s ease;
  filter: saturate(.85);
}
.t5-card-wrap:hover .t5-product-img { transform: scale(1.06); filter: saturate(1); }

.t5-wish-btn {
  transition: background .2s, transform .2s;
}
.t5-wish-btn:hover { transform: scale(1.08); }

/* ================= MOBILE ================= */
@media (max-width: 768px) {
  .t5-hero-media-content { object-fit: contain; object-position: center; }

  .t5-products-grid { grid-template-columns: 1fr; gap: 18px; }
  .t5-products-grid > *:nth-child(3n+1) { grid-column: auto; }
  .t5-card-inner { flex-direction: column !important; min-height: unset !important; }
  .t5-products-grid .t5-img-wrap { width: 100% !important; min-width: 100% !important; height: 340px !important; max-height: 340px !important; }
  .t5-products-grid .t5-product-img { width: 100%; height: 100%; object-fit: cover; }
  .t5-sans { padding: 22px 18px !important; border-left: none !important; border-top: 1px solid rgba(184,147,90,.15); }
  .t5-sans h3 { font-size: 1.12rem !important; line-height: 1.35; }
  .t5-card-inner .flex.items-center.justify-between { flex-direction: column; align-items: stretch !important; gap: 16px; }
  .t5-add-btn { width: 100%; justify-content: center; padding: 14px 18px !important; }

  .t5-intro-grid { grid-template-columns: 1fr !important; }
  .t5-products-wrap { padding: 56px 18px 72px !important; }
  .t5-categories-wrap { padding: 48px 18px !important; }
  .t5-hero-content { padding: 0 18px 6vh 68px !important; }
  .t5-footer-inner { grid-template-columns: 1fr !important; }

  .t5-feature-strip { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
  .t5-cat-grid { grid-template-columns: 1fr 1fr !important; }
  .t5-cta-title { font-size: clamp(1.6rem,7vw,2.4rem) !important; }
}

@media (max-width: 480px) {
  .t5-hero-media-content { object-position: center top; }
  .t5-products-grid .t5-img-wrap { height: 340px !important; }
  .t5-add-btn { font-size: 11px; }
  .t5-feature-strip { grid-template-columns: 1fr !important; }
  .t5-cat-grid { grid-template-columns: 1fr !important; }
}

@media (prefers-reduced-motion: reduce) {
  .t5-scroll-track::after { animation: none; }
}
`;

  return (
    <div className="t5" style={CSS_VARS}>
      <style>{styles}</style>

      {/* ── HERO ── */}
      <header
        className="relative w-full overflow-hidden"
        style={{ height: "70svh", minHeight: 520 }}
      >
        {hasMedia ? (
          <div
            className="absolute inset-0 t5-hero-media"
            style={{ background: "#2C2420" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
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
                    className="t5-hero-media-content"
                  />
                ) : (
                  <img
                    src={getImageSrc(currentMedia.src)}
                    alt="hero"
                    className="t5-hero-media-content"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 15% 0%, #241D18 0%, #0D0B0A 70%)",
            }}
          >
            <img
              src={getImageSrc(shopData.store_logo)}
              alt=""
              className="w-full h-full object-contain"
              style={{ opacity: 0.14, padding: "10vh 20vw" }}
            />
          </div>
        )}

        {/* Vertical spine — signature element */}
        <div className="t5-hero-spine">
          <span className="t5-spine-text">
            {shopData.name} · Official Store
          </span>
        </div>

        {/* Content */}
        <div
          className="t5-hero-content absolute inset-0 flex flex-col justify-end z-10"
          style={{ padding: "0 5vw 7vh 80px" }}
        >
          <motion.p
            className="t5-italic mb-5"
            style={{
              fontSize: 14,
              letterSpacing: "0.12em",
              color: bronzeLight,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Official Store
          </motion.p>

          <motion.h1
            className="t5-serif"
            style={{
              fontSize: "clamp(3.2rem,9vw,7.5rem)",
              fontWeight: 700,
              lineHeight: 0.95,
              color: parchment,
              letterSpacing: "-0.01em",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {shopData.name}
          </motion.h1>

          <motion.div
            className="flex items-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div
              className="h-px max-w-[72px] flex-1"
              style={{ background: bronze }}
            />
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: "rgba(247,243,238,0.4)", letterSpacing: "0.3em" }}
            >
              Handmade. Heritage. Yours.
            </span>
          </motion.div>

          {/* Trust indicator line */}
          <motion.div
            className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-6"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {["Verified Artisan", "Handmade Goods", "Ships in 3 Days"].map(
              (t, i) => (
                <span key={t} className="flex items-center gap-5">
                  {i > 0 && (
                    <span
                      style={{
                        width: 1,
                        height: 12,
                        background: "rgba(212,180,131,0.35)",
                      }}
                    />
                  )}
                  <span
                    className="t5-italic"
                    style={{
                      fontSize: 13,
                      color: "rgba(247,243,238,0.65)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t}
                  </span>
                </span>
              ),
            )}
          </motion.div>

          <motion.div
            className="flex items-center gap-7 mt-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <button
              onClick={() => scrollTo("t5-products")}
              className="t5-sans inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest cursor-pointer border-none"
              style={{
                padding: "14px 32px",
                background: bronze,
                color: "#0D0B0A",
                letterSpacing: "0.18em",
              }}
            >
              Explore the Collection
            </button>
            <button
              onClick={() => scrollTo("t5-intro")}
              className="t5-italic cursor-pointer border-none bg-transparent inline-flex items-center gap-2"
              style={{
                fontSize: 14,
                color: "rgba(247,243,238,0.5)",
                letterSpacing: "0.05em",
              }}
            >
              Our Story ↓
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute z-10 flex flex-col items-center gap-1.5"
          style={{ bottom: 32, right: 40 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <span
            className="t5-italic"
            style={{ fontSize: 11, color: bronzeLight, letterSpacing: "0.1em" }}
          >
            {String(currentIndex + 1).padStart(2, "0")}
          </span>
          <div className="t5-scroll-track" />
        </motion.div>

        {/* Media counter */}
        {hasMedia && media.length > 1 && (
          <div className="absolute bottom-8 left-20 z-10 flex items-center gap-3">
            {media.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className="border-none bg-transparent cursor-pointer p-0"
                style={{
                  width: i === currentIndex ? 28 : 6,
                  height: 1,
                  background:
                    i === currentIndex ? bronze : "rgba(255,255,255,0.25)",
                  transition: "width 0.4s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </header>

      {/* ── MARQUEE ── */}
      <Marquee items={MARQUEE_ITEMS} accent={bronze} />

      {/* ── FEATURE STRIP ── */}
      <section
        style={{
          padding: "44px 80px",
          background: parchment,
          borderBottom: `1px solid rgba(184,147,90,0.18)`,
        }}
      >
        <div className="t5-feature-strip grid grid-cols-4 gap-10 max-w-6xl mx-auto">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="t5-feature-col flex flex-col gap-3 pl-6">
                <Icon size={18} color={bronze} strokeWidth={1.4} />
                <p className="t5-serif" style={{ fontSize: 15, color: ink }}>
                  {title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.6,
                    color: muted,
                    fontWeight: 300,
                  }}
                >
                  {desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── INTRO / ABOUT THE MAKER ── */}
      <section
        id="t5-intro"
        className="t5-intro-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
      >
        <Reveal>
          <div
            className="flex flex-col justify-center"
            style={{
              padding: "80px 60px 80px 80px",
              borderRight: `1px solid rgba(184,147,90,0.2)`,
            }}
          >
            <p
              className="t5-italic flex items-center gap-3 mb-7"
              style={{
                fontSize: 12,
                letterSpacing: "0.25em",
                color: bronze,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 28,
                  height: 1,
                  background: bronze,
                  flexShrink: 0,
                }}
              />
              About the Maker
            </p>

            <p
              className="t5-italic"
              style={{
                fontSize: "clamp(1.5rem,2.6vw,2.1rem)",
                lineHeight: 1.4,
                color: ink,
                marginBottom: 20,
              }}
            >
              “{storyQuote}”
            </p>

            <div className="flex items-center gap-3 mt-2 mb-8">
              <span
                className="t5-serif"
                style={{ fontStyle: "italic", fontSize: 16, color: bronze }}
              >
                — {shopData.name}
              </span>
            </div>

            <div
              className="h-px w-full mb-8"
              style={{ background: "rgba(184,147,90,0.25)" }}
            />

            {/* Timeline accent */}
            <div
              className="flex flex-col gap-5 relative pl-5"
              style={{ borderLeft: `1px dashed rgba(184,147,90,0.4)` }}
            >
              {[
                ["Founded", "A single idea, made by hand."],
                ["Handcrafted", "Every order shaped to order, not stocked."],
                ["Delivered", "Packed with care, straight to your door."],
              ].map(([label, desc], i) => (
                <div key={label} className="flex items-start gap-3 relative">
                  <span
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 6,
                      height: 6,
                      background: bronze,
                      marginTop: 6,
                      marginLeft: -26,
                    }}
                  />
                  <div>
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: ink, letterSpacing: "0.14em" }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 12.5,
                        color: muted,
                        fontWeight: 300,
                        marginTop: 2,
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <div
          className="relative overflow-hidden"
          style={{ background: surface, minHeight: 240 }}
        >
          <img
            src={getImageSrc(shopData.store_logo)}
            alt={shopData.name}
            className="w-full h-[39rem] object-cover"
            style={{ opacity: 0.6 }}
          />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      {categories?.length > 0 && (
        <section
          className="t5-categories-wrap"
          style={{
            padding: "64px 80px",
            background: surface,
            borderTop: `1px solid rgba(184,147,90,0.15)`,
          }}
        >
          <Reveal>
            <p
              className="t5-italic flex items-center gap-3 mb-9"
              style={{
                fontSize: 12,
                letterSpacing: "0.25em",
                color: bronze,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 24,
                  height: 1,
                  background: bronze,
                  flexShrink: 0,
                }}
              />
              Browse by craft
            </p>
          </Reveal>

          <div className="t5-cat-grid grid grid-cols-2 md:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {categories.map((cat, idx) => (
              <Reveal key={cat.slug || idx} delay={idx * 0.05}>
                <Link
                  href={`/products/category/${cat.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="t5-cat-card relative overflow-hidden flex flex-col cursor-pointer"
                    style={{
                      background: parchment,
                      border: `1px solid rgba(184,147,90,0.2)`,
                    }}
                  >
                    <span
                      className="t5-italic absolute z-10"
                      style={{
                        top: 10,
                        left: 12,
                        fontSize: 11,
                        color: bronzeLight,
                        letterSpacing: "0.12em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="relative w-full" style={{ height: 170 }}>
                      {cat.image ? (
                        <CurtainImage
                          src={getImageSrc(cat.image)}
                          alt={cat.name}
                          className="t5-product-img w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: surface }}
                        />
                      )}
                    </div>
                    <div
                      className="px-4 py-3.5"
                      style={{ borderTop: `1px solid rgba(184,147,90,0.15)` }}
                    >
                      <span
                        className="t5-serif capitalize"
                        style={{ fontSize: 14, color: ink }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── PRODUCTS ── */}
      <section
        id="t5-products"
        className="t5-products-wrap"
        style={{
          padding: "80px 80px 100px",
          background: prodBg,
          borderTop: `1px solid rgba(184,147,90,0.18)`,
        }}
      >
        <Reveal>
          <div className="flex justify-between items-end mb-16">
            <h2
              className="t5-serif"
              style={{
                fontSize: "clamp(2rem,5vw,4.5rem)",
                fontWeight: 400,
                lineHeight: 1,
                color: ink,
              }}
            >
              The{" "}
              <em
                style={{
                  fontStyle: "italic",
                  color: roseDeep,
                  display: "block",
                }}
              >
                Collection
              </em>
            </h2>
            <span
              className="t5-italic"
              style={{ fontSize: 14, color: muted, letterSpacing: "0.08em" }}
            >
              {products.length} items available
            </span>
          </div>
        </Reveal>

        <div className="t5-products-grid">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className="t5-card-wrap"
              style={{
                background: surface,
                overflow: "hidden",
                cursor: "pointer",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{
                delay: (i % 2) * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="t5-card-inner flex items-stretch"
                style={{
                  minHeight: 220,
                  transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                <div
                  className="t5-img-wrap relative flex-shrink-0 overflow-hidden"
                  style={{ width: 220 }}
                >
                  <CurtainImage
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="t5-product-img w-full h-full object-cover"
                  />
                  {/* <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleWishlist(product.id);
                    }}
                    aria-label="Save to wishlist"
                    className="t5-wish-btn absolute top-3 right-3 flex items-center justify-center rounded-full cursor-pointer border-none z-10"
                    style={{
                      width: 28,
                      height: 28,
                      background: "rgba(247,243,238,0.92)",
                    }}
                  >
                    <Heart
                      size={12}
                      color={bronze}
                      fill={wishlisted[product.id] ? bronze : "none"}
                      strokeWidth={1.6}
                    />
                  </button> */}
                </div>

                <div
                  className="t5-sans flex flex-col justify-between flex-1"
                  style={{
                    padding: "32px 36px",
                    borderLeft: `1px solid rgba(184,147,90,0.15)`,
                  }}
                >
                  <div>
                    <p
                      className="t5-italic mb-3"
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.25em",
                        color: bronze,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(products.length).padStart(2, "0")}
                    </p>
                    <h3
                      className="t5-serif capitalize mb-2"
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: ink,
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* <span
                      className="inline-block"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        color: bronze,
                        textTransform: "uppercase",
                        border: `1px solid rgba(184,147,90,0.35)`,
                        padding: "3px 8px",
                      }}
                    >
                      In stock
                    </span> */}
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div
                      className="t5-italic"
                      style={{ fontSize: "1.45rem", color: ink }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          color: muted,
                          textTransform: "uppercase",
                          fontStyle: "normal",
                          fontFamily: "'DM Sans', sans-serif",
                          marginBottom: 2,
                        }}
                      >
                        Price
                      </span>
                      ₹{Number(product.price).toLocaleString("en-IN")}
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
                      className="t5-add-btn t5-sans inline-flex items-center gap-2 flex-shrink-0 text-xs font-medium uppercase tracking-widest border-none cursor-pointer"
                      style={{
                        padding: "10px 22px",
                        background: ink,
                        color: parchment,
                        letterSpacing: "0.16em",
                        whiteSpace: "nowrap",
                      }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {loadingProductId === product.id
                        ? "Adding…"
                        : "Add to cart"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MID CTA (parallax) ── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden"
        style={{ height: 380 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ y: ctaImageY, scale: 1.15 }}
        >
          <img
            src={getImageSrc(products?.[0]?.image || shopData.store_logo)}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "saturate(0.75)" }}
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(13,11,10,0.55), rgba(13,11,10,0.82))",
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <Reveal>
            <p
              className="t5-serif t5-cta-title"
              style={{
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2rem,4.6vw,3.4rem)",
                lineHeight: 1.2,
                color: parchment,
              }}
            >
              Crafted with care.
              <br />
              Delivered with love.
            </p>
          </Reveal>
          <button
            onClick={() => scrollTo("t5-products")}
            className="t5-sans mt-8 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-widest cursor-pointer border-none"
            style={{
              padding: "14px 32px",
              background: bronze,
              color: "#0D0B0A",
              letterSpacing: "0.18em",
            }}
          >
            Explore Collection
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: footBg,
          padding: "64px 80px 40px",
          borderTop: `1px solid ${bronze}`,
        }}
      >
        <div
          className="t5-footer-inner"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 48,
            alignItems: "start",
            paddingBottom: 48,
            borderBottom: "1px solid rgba(90,82,72,0.4)",
          }}
        >
          <div>
            <h2
              className="t5-serif"
              style={{
                fontSize: "2rem",
                fontWeight: 400,
                color: parchment,
                letterSpacing: "0.02em",
                marginBottom: 24,
              }}
            >
              {shopData.name}
            </h2>
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
                    style={{ color: "#8A8074" }}
                  >
                    <Icon
                      size={13}
                      style={{ color: bronze, marginTop: 2, flexShrink: 0 }}
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
          <div style={{ textAlign: "right" }}>
            <img
              src={getImageSrc(shopData.store_logo)}
              alt={shopData.name}
              style={{ width: 72, height: 72, objectFit: "contain" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <p
            className="text-[11px]"
            style={{ color: "rgba(247,243,238,0.35)" }}
          >
            © {new Date().getFullYear()} {shopData.name}. All rights reserved.
          </p>
          <p
            className="t5-italic text-[11px]"
            style={{ color: bronzeLight, letterSpacing: "0.08em" }}
          >
            Powered by Yuukke
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Theme4;
