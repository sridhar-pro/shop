"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import {
  Tag,
  Gift,
  Truck,
  Crown,
  ShoppingBag,
  Coffee,
  Briefcase,
  Leaf,
  Star,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  Phone,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   BRAND TOKENS
───────────────────────────────────────────────────────────── */
const B = "#A00300";
const BL = "#c40400";
const BD = "#6e0200";
const CREAM = "#fdf8f5";
const INK = "#1a0a08";

/* ─────────────────────────────────────────────────────────────
   FONT LOADER
───────────────────────────────────────────────────────────── */
function FontLoader() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&family=Cinzel:wght@400;600;900&display=swap";
    document.head.appendChild(l);
  }, []);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   CURSOR GLOW
───────────────────────────────────────────────────────────── */
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  useEffect(() => {
    const mv = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, []);
  return (
    <div
      className="pointer-events-none fixed z-[9999] rounded-full"
      style={{
        width: 320,
        height: 320,
        left: pos.x - 160,
        top: pos.y - 160,
        background: `radial-gradient(circle, ${B}12 0%, transparent 70%)`,
        transition: "left 0.12s ease, top 0.12s ease",
      }}
    />
  );
}

/* ───────────────── FEATURES ───────────────── */
const features = [
  { icon: CheckCircle, text: "Verified women-led businesses" },
  { icon: Leaf, text: "Sustainable & ethical sourcing" },
  { icon: Tag, text: "Bulk order & customization support" },
  { icon: Globe, text: "Pan-India delivery" },
  { icon: Users, text: "End-to-end corporate procurement" },
  { icon: Star, text: "Custom branding on all products" },
];

/* ─────────────────────────────────────────────────────────────
   SLIDE DATA
───────────────────────────────────────────────────────────── */
const slides = [
  {
    id: 1,
    img: "/eoy.jpeg", // 👈 plain image (no text/overlay)
    plain: true, // 👈 flag to control UI
  },
  {
    id: 2,
    kicker: "End Of Year Sale",
    headline: ["Curated", "Hampers"],
    img: "/eoy1.png",
    plain: false,
  },
];
/* ─────────────────────────────────────────────────────────────
   HERO SLIDER
───────────────────────────────────────────────────────────── */
function HeroSlider() {
  const [cur, setCur] = useState(0);
  const [dir, setDir] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ Filter slides
  const visibleSlides = isMobile
    ? slides.filter((slide) => slide.id !== 2)
    : slides;

  // ✅ Navigation
  const go = useCallback(
    (next) => {
      setDir(next > cur ? 1 : -1);
      setCur(next);
    },
    [cur],
  );

  // ✅ Auto slide
  useEffect(() => {
    const t = setInterval(() => {
      go((cur + 1) % visibleSlides.length);
    }, 5500);

    return () => clearInterval(t);
  }, [cur, go, visibleSlides.length]);

  // ✅ Fix index if slides shrink (desktop → mobile)
  useEffect(() => {
    if (cur >= visibleSlides.length) {
      setCur(0);
    }
  }, [visibleSlides.length, cur]);

  const s = visibleSlides[cur];

  const imgVariants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", scale: 1.05 }),
    center: {
      x: 0,
      scale: 1,
      transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
    },
    exit: (d) => ({
      x: d > 0 ? "-100%" : "100%",
      scale: 0.98,
      transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
    }),
  };

  const textVariants = {
    enter: { opacity: 0, y: 40 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: 0.2 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <section className="relative w-full aspect-[2560/800] max-h-[614px] overflow-hidden bg-black">
      {/* IMAGE */}
      <AnimatePresence custom={dir} mode="sync">
        <motion.div
          key={s.id}
          custom={dir}
          variants={imgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img src={s.img} alt="" className="w-full h-full object-cover" />
          {!s.plain && <div className="absolute inset-0 bg-black/10" />}
        </motion.div>
      </AnimatePresence>

      {/* CONTENT */}
      {!s.plain && (
        <div className="relative z-10 h-full flex items-end pb-16 px-8 lg:px-20 font-odop">
          <div className="max-w-xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={s.id}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Kicker */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-px bg-[#A00300]" />
                  <span className="text-[11px] tracking-[0.4em] text-[#A00300] uppercase font-semibold">
                    {s.kicker}
                  </span>
                </div>

                {/* FEATURES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {features.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.08 }}
                        className="flex items-center gap-3 p-3 rounded-lg 
                                   bg-white/10 border border-white/10 backdrop-blur-sm"
                      >
                        <Icon className="w-5 h-5 text-[#A00300]" />
                        <span className="text-sm text-white font-medium">
                          {item.text}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="flex gap-4 flex-wrap">
                  <button
                    className="px-6 py-3 bg-[#A00300] text-white text-sm font-semibold uppercase tracking-wide"
                    onClick={() =>
                      document
                        .getElementById("categories")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore Products →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </section>
  );
}
/* ─────────────────────────────────────────────────────────────
   MARQUEE TICKER
───────────────────────────────────────────────────────────── */
function Ticker() {
  const items = [
    "FLAT 30% OFF ON BULK ORDERS",
    "VERIFIED WOMEN-LED BUSINESSES",
    "PAN-INDIA DELIVERY",
    "SUSTAINABLE & ETHICAL SOURCING",
    "CUSTOM BRANDING AVAILABLE",
    "EMPLOYEE ONBOARDING KITS",
    "CORPORATE GIFTING SOLUTIONS",
    "BULK PROCUREMENT READY",
  ];
  const repeated = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-3.5 border-y"
      style={{ background: B, borderColor: BD }}
    >
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
      >
        {repeated.map((t, i) => (
          <span
            key={i}
            className="text-white text-[11px] uppercase tracking-[0.25em] px-10 flex items-center gap-10"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {t}
            <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COUNTER
───────────────────────────────────────────────────────────── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= to) {
        setVal(to);
        clearInterval(id);
      } else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   INTRO / WHY SECTION
───────────────────────────────────────────────────────────── */
function IntroSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  const stats = [
    { n: 500, s: "+", label: "Curated Products" },
    { n: 30, s: "%", label: "Bulk Savings" },
    { n: 100, s: "+", label: "Women-Led Brands" },
  ];

  const pillars = [
    {
      icon: CheckCircle,
      title: "Women-Led Businesses",
      desc: "Every product sourced from verified women entrepreneurs",
    },
    {
      icon: Leaf,
      title: "Ethical Sourcing",
      desc: "Sustainable supply chains, eco-conscious products",
    },
    {
      icon: Globe,
      title: "Pan-India Delivery",
      desc: "Fast, tracked shipping to every corner of India",
    },
    {
      icon: Tag,
      title: "Bulk Pricing",
      desc: "Volume discounts & end-to-end procurement support",
    },
  ];

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative overflow-hidden bg-white"
    >
      <div className="flex items-center px-8 lg:px-20 pt-10 lg:pt-20">
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${B}40, transparent)`,
          }}
        />
        <span
          className="mx-4 text-xs tracking-[0.4em] uppercase"
          style={{ color: B, fontFamily: "'Cinzel', serif" }}
        >
          Why Yuukke
        </span>
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to left, ${B}40, transparent)`,
          }}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-0 px-8 lg:px-20 pt-16 pb-4 lg:pb-24">
        {/* Left */}
        <div className="pr-0 lg:pr-16 flex flex-col justify-center">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-4"
            style={{ color: B, fontFamily: "'Cinzel', serif" }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            ✦ Workplace Procurement Reimagined
          </motion.p>

          <motion.h2
            className="font-black leading-[1.05] mb-8"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.8rem, 5vw, 5rem)",
              color: INK,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Upgrade Your
            <br />
            <span style={{ color: B, fontStyle: "italic" }}>Corporate</span>
            <br />
            Procurement
          </motion.h2>

          <motion.p
            className="text-gray-500 leading-relaxed mb-12 max-w-md"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9375rem",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            At <strong style={{ color: INK }}>Yuukke Global</strong>, we help
            organizations source corporate hampers, onboarding kits, office
            supplies, and pantry products — while supporting women entrepreneurs
            and ethical supply chains.
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex gap-10 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {stats.map((s, i) => (
              <div key={i}>
                <div
                  className="text-4xl font-black leading-none mb-1"
                  style={{ color: B, fontFamily: "'Playfair Display', serif" }}
                >
                  <Counter to={s.n} suffix={s.s} />
                </div>
                <div
                  className="text-[11px] uppercase tracking-[0.2em] text-gray-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Pillars */}
          <div className="grid grid-cols-2 gap-3">
            {pillars.map((o, i) => (
              <motion.div
                key={i}
                className="group flex items-start gap-3 p-4 rounded-xl border transition-all duration-300"
                style={{ borderColor: `${B}18`, background: CREAM }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.3 }}
                whileHover={{
                  borderColor: `${B}50`,
                  boxShadow: `0 4px 24px ${B}12`,
                  y: -2,
                }}
              >
                <span className="mt-0.5 flex-shrink-0" style={{ color: B }}>
                  <o.icon size={18} strokeWidth={1.8} />
                </span>
                <div>
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: INK, fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {o.title}
                  </div>
                  <div
                    className="text-[11px] text-gray-400 leading-snug"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {o.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: parallax image */}
        <motion.div
          className="relative hidden lg:block rounded-2xl overflow-hidden"
          style={{ minHeight: 560 }}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div className="absolute inset-[-8%]" style={{ y: imgY }}>
            <img
              src="/eoysec.png"
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${BD}30 0%, transparent 60%)`,
            }}
          />
          <motion.div
            className="absolute bottom-8 left-8 right-8 p-5 rounded-xl backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: `1px solid ${B}20`,
            }}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-xs uppercase tracking-[0.25em] mb-1"
                  style={{ color: B, fontFamily: "'Cinzel', serif" }}
                >
                  Bulk Orders Welcome
                </div>
                <div
                  className="text-sm text-gray-600"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Custom branding & pan-India delivery
                </div>
              </div>
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{ background: B }}
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORNAMENT DIVIDER
───────────────────────────────────────────────────────────── */
function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center py-2 lg:py-10 px-8 lg:px-20 bg-white">
      <motion.div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${B}30)` }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      <div className="flex items-center gap-3 px-6">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: `${B}40` }}
        />
        <motion.div
          className="text-lg"
          style={{ color: B }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        >
          ✦
        </motion.div>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: `${B}40` }}
        />
      </div>
      <motion.div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${B}30)` }}
        initial={{ scaleX: 0, originX: 1 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY CARD
───────────────────────────────────────────────────────────── */
function CategoryCard({
  icon: Icon,
  title,
  italic,
  items,
  badge,
  img,
  flip,
  delay,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${B}15`,
        boxShadow: "0 8px 48px rgba(0,0,0,0.07)",
        background: "#fff",
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: `0 20px 80px ${B}18`, borderColor: `${B}35` }}
    >
      <div
        className={`flex flex-col lg:flex-row ${flip ? "lg:flex-row-reverse" : ""} min-h-[420px]`}
      >
        {/* Image half */}
        <div className="relative lg:w-2/5 h-64 lg:h-auto overflow-hidden">
          <motion.div className="absolute inset-[-10%]" style={{ y: imgY }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background: flip
                ? `linear-gradient(to left, white 0%, transparent 30%), linear-gradient(135deg, ${BD}50, transparent)`
                : `linear-gradient(to right, white 0%, transparent 30%), linear-gradient(135deg, ${BD}50, transparent)`,
            }}
          />
          <div className="absolute top-6 left-6">
            <span
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
              style={{ background: B, fontFamily: "'Cinzel', serif" }}
            >
              {badge}
            </span>
          </div>
        </div>

        {/* Content half */}
        <div className="lg:w-3/5 flex flex-col justify-center p-8 lg:p-10">
          <div className="flex items-center gap-3 mb-4">
            <span style={{ color: B }}>
              <Icon size={20} strokeWidth={1.6} />
            </span>
            <div className="w-5 h-px" style={{ background: `${B}40` }} />
          </div>

          <h3
            className="font-black leading-tight mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: INK,
            }}
          >
            {title}
            <br />
            <span style={{ color: B, fontStyle: "italic" }}>{italic}</span>
          </h3>

          <ul className="mb-8 space-y-2">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: B }}
                />
                {item}
              </li>
            ))}
          </ul>

          <div
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: B, fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>Explore Category</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight size={14} />
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORIES SECTION
───────────────────────────────────────────────────────────── */
function CategoriesSection() {
  const categories = [
    {
      icon: Briefcase,
      title: "Employee Onboarding",
      italic: "& Welcome Kits",
      badge: "HR Favourite",
      img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=85",
      items: [
        "Employee welcome kits",
        "Work-from-home kits",
        "Desk essentials & accessories",
        "Premium notebooks & planners",
        "Custom branded kits",
      ],
      flip: false,
    },
    {
      icon: ShoppingBag,
      title: "Office Supplies",
      italic: "& Workplace Essentials",
      badge: "Bulk Ready",
      img: "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&q=85",
      items: [
        "Office stationery & supplies",
        "Desk organizers & accessories",
        "Conference & event materials",
        "Eco-friendly office products",
        "Everyday workplace essentials",
      ],
      flip: true,
    },
    {
      icon: Coffee,
      title: "Pantry",
      italic: "& Food Essentials",
      badge: "Wellness",
      img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=85",
      items: [
        "Tea, coffee & healthy snacks",
        "Millet-based & organic foods",
        "Pantry staples (oil, atta, spices)",
        "Office pantry kits",
      ],
      flip: false,
    },
    {
      icon: Gift,
      title: "Corporate Gifting",
      italic: "& Employee Engagement",
      badge: "Custom Branded",
      img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=85",
      items: [
        "Festive hampers",
        "Employee milestone gifts",
        "Recognition & reward kits",
        "Curated gift boxes",
      ],
      flip: true,
    },
    {
      icon: Crown,
      title: "Client & Executive",
      italic: "Gifting",
      badge: "Premium",
      img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=85",
      items: [
        "Executive gift boxes",
        "Premium curated hampers",
        "Client appreciation kits",
      ],
      flip: false,
    },
    {
      icon: Leaf,
      title: "Facilities, Cleaning",
      italic: "& Hygiene",
      badge: "Eco-Friendly",
      img: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=85",
      items: [
        "Eco-friendly cleaning products",
        "Hygiene kits",
        "Workplace sanitation supplies",
      ],
      flip: true,
    },
  ];

  return (
    <section className="relative bg-white pb-24 px-8 lg:px-20">
      <div className="text-center mb-16">
        <motion.p
          className="text-[11px] font-semibold uppercase tracking-[0.45em] mb-5"
          style={{ color: B, fontFamily: "'Cinzel', serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✦ What We Offer ✦
        </motion.p>
        <motion.h2
          className="font-black leading-[1.08]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 5.5vw, 5rem)",
            color: INK,
          }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Everything Your
          <br />
          <span style={{ color: B, fontStyle: "italic" }}>Workplace Needs</span>
        </motion.h2>
        <motion.p
          className="mt-6 text-gray-400 max-w-sm mx-auto text-sm leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Functional, sustainable, and thoughtfully curated — all in one place.
        </motion.p>
      </div>

      <div className="flex flex-col gap-5 max-w-6xl mx-auto">
        {categories.map((c, i) => (
          <CategoryCard key={i} {...c} delay={0.05 * i} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   OFFER SECTION
───────────────────────────────────────────────────────────── */
function OfferSection() {
  return (
    <section
      className="relative overflow-hidden py-24 px-8 lg:px-20"
      style={{ background: INK }}
    >
      {/* Bg pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${B} 0, ${B} 1px, transparent 0, transparent 50%)`,
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${BD}60 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.p
          className="text-[11px] font-semibold uppercase tracking-[0.45em] mb-5"
          style={{ color: BL, fontFamily: "'Cinzel', serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✦ Limited-Time Offer ✦
        </motion.p>

        <motion.h2
          className="font-black leading-[1.05] mb-6 text-white"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.8rem, 6vw, 5.5rem)",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          End of Year
          <br />
          <span style={{ color: BL, fontStyle: "italic" }}>
            Procurement Sale
          </span>
        </motion.h2>

        <motion.p
          className="text-white/50 text-base mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Save more while sourcing better. Plan your corporate gifting,
          onboarding, and office procurement in advance.
        </motion.p>

        {/* Big offer badge */}
        <motion.div
          className="inline-flex flex-col items-center gap-2 px-12 py-8 border mb-10"
          style={{ borderColor: `${B}60`, background: `${B}15` }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-7xl font-black text-white font-odop font-medium">
            30%
          </span>
          <span
            className="text-xs uppercase tracking-[0.4em] text-white/60"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Flat Off on All Bulk Orders
          </span>
          <div className="flex items-center gap-2 mt-2">
            <motion.span
              className="w-2 h-2 rounded-full block"
              style={{ background: BL }}
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
            <span
              className="text-[11px] text-white/40 uppercase tracking-widest"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Book before 31st March 2026 · Shop While Stocks Last
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   PATH CARDS (Products + Hampers)
───────────────────────────────────────────────────────────── */
function PathCard({
  href,
  label,
  title,
  italic,
  description,
  badge,
  img,
  tags,
  cta,
  delay,
  flip,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border"
      style={{
        borderColor: `${B}15`,
        boxShadow: "0 8px 48px rgba(0,0,0,0.07)",
        background: "#fff",
      }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: `0 20px 80px ${B}18`, borderColor: `${B}35` }}
    >
      <div
        className={`flex flex-col lg:flex-row ${flip ? "lg:flex-row-reverse" : ""} min-h-[480px]`}
      >
        <div className="relative lg:w-1/2 h-72 lg:h-auto overflow-hidden">
          <motion.div className="absolute inset-[-10%]" style={{ y: imgY }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background: flip
                ? `linear-gradient(to left, white 0%, transparent 20%), linear-gradient(135deg, ${BD}50, transparent)`
                : `linear-gradient(to right, white 0%, transparent 20%), linear-gradient(135deg, ${BD}50, transparent)`,
            }}
          />
          <div className="absolute top-6 left-6">
            <span
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white"
              style={{ background: B, fontFamily: "'Cinzel', serif" }}
            >
              {badge}
            </span>
          </div>
        </div>

        <div className="lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px" style={{ background: B }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.35em]"
              style={{ color: B, fontFamily: "'Cinzel', serif" }}
            >
              {label}
            </span>
          </div>

          <h3
            className="font-black leading-tight mb-5"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
              color: INK,
            }}
          >
            {title}
            <br />
            <span style={{ color: B, fontStyle: "italic" }}>{italic}</span>
          </h3>

          <p
            className="text-gray-500 leading-relaxed mb-8 text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {description}
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full"
                style={{
                  background: CREAM,
                  color: BD,
                  border: `1px solid ${B}20`,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 self-start"
          >
            <motion.span
              className="px-8 py-3.5 font-semibold text-sm uppercase tracking-[0.2em] text-white"
              style={{
                background: `linear-gradient(135deg, ${BD}, ${B}, ${BL})`,
                backgroundSize: "200% 100%",
                backgroundPosition: "0% 50%",
                fontFamily: "'DM Sans', sans-serif",
              }}
              whileHover={{ backgroundPosition: "100% 50%", scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              {cta}
            </motion.span>
            <motion.div
              className="w-10 h-10 rounded-full border flex items-center justify-center text-sm flex-shrink-0"
              style={{ borderColor: `${B}40`, color: B }}
              whileHover={{
                background: B,
                color: "#fff",
                borderColor: B,
                scale: 1.1,
              }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.div>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function PathsSection() {
  return (
    <section id="categories" className="relative bg-white pb-24 px-8 lg:px-20">
      <div className="text-center mb-16">
        <motion.p
          className="text-[11px] font-semibold uppercase tracking-[0.45em] mb-5"
          style={{ color: B, fontFamily: "'Cinzel', serif" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ✦ Shop Now ✦
        </motion.p>
        <motion.h2
          className="font-black leading-[1.08]"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.5rem, 5.5vw, 5rem)",
            color: INK,
          }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Two Destinations,
          <br />
          <span style={{ color: B, fontStyle: "italic" }}>One Purpose</span>
        </motion.h2>
      </div>

      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <PathCard
          href="https://shop.yuukke.com/products/EOY"
          label="Yuukke Shop"
          title="Premium"
          italic="Products"
          description="Explore our meticulously handpicked collection of premium office supplies, onboarding kits, pantry essentials, and workplace products — all from verified women-led businesses."
          badge="EOY Sale"
          img="/eoysec.png"
          tags={[
            "Office Supplies",
            "Onboarding Kits",
            "Up to 30% Off",
            "Bulk Ready",
          ]}
          cta="Shop Products"
          delay={0.1}
          flip={false}
        />
        <PathCard
          href="https://gift.yuukke.com/EOY"
          label="Yuukke Gifts"
          title="Corporate"
          italic="Hampers"
          description="Thoughtfully curated corporate hampers for every occasion — employee gifting, client appreciation, festive celebrations, and more. Custom branding available."
          badge="Gift Special"
          img="/eoysec2.webp"
          tags={[
            "Custom Branded",
            "Bulk Orders",
            "Express Delivery",
            "Festive Hampers",
          ]}
          cta="Shop Hampers"
          delay={0.2}
          flip={true}
        />
      </div>

      <motion.div
        className="flex items-center justify-center gap-8 mt-14 flex-wrap"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        {[
          "Secure Checkout",
          "Trusted by Thousands",
          "Both Powered by Yuukke",
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-px h-3 bg-gray-200" />}
            <span
              className="text-[11px] text-gray-500 uppercase tracking-[0.2em]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FINAL CTA SECTION
───────────────────────────────────────────────────────────── */
function FinalCTA() {
  return (
    <section id="cta" className="relative bg-white py-0 px-8 lg:px-20">
      <div className="flex items-center mb-16">
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${B}40, transparent)`,
          }}
        />
        <span
          className="mx-4 text-xs tracking-[0.4em] uppercase"
          style={{ color: B, fontFamily: "'Cinzel', serif" }}
        >
          Get In Touch
        </span>
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to left, ${B}40, transparent)`,
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.4em] mb-4"
            style={{ color: B, fontFamily: "'Cinzel', serif" }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            ✦ Customized Workplace Solutions
          </motion.p>
          <motion.h2
            className="font-black leading-[1.05] mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              color: INK,
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Tell Us Your
            <br />
            <span style={{ color: B, fontStyle: "italic" }}>Requirement</span>
          </motion.h2>
          <motion.p
            className="text-gray-500 leading-relaxed mb-10 max-w-md text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            We'll curate the right products, hampers, and services tailored to
            your organization — from procurement to delivery, we handle it all.
          </motion.p>
          {/* <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="https://shop.yuukke.com/products/EOY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 text-white font-bold text-sm uppercase tracking-[0.2em]"
              style={{
                background: `linear-gradient(135deg, ${BD}, ${BL})`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Phone size={15} />
              Get in Touch
            </a>
            <a
              href="https://gift.yuukke.com/EOY"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 font-bold text-sm uppercase tracking-[0.2em] border transition-colors hover:bg-red-50"
              style={{
                borderColor: `${B}40`,
                color: B,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Request a Callback
            </a>
          </motion.div> */}
        </div>

        {/* Why list */}
        <motion.div
          className="grid grid-cols-1 gap-3"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {[
            { icon: CheckCircle, text: "Verified women-led businesses" },
            { icon: Leaf, text: "Sustainable & ethical sourcing" },
            { icon: Tag, text: "Bulk order & customization support" },
            { icon: Globe, text: "Pan-India delivery" },
            { icon: Users, text: "End-to-end corporate procurement" },
            { icon: Star, text: "Custom branding on all products" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ borderColor: `${B}15`, background: CREAM }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i + 0.2 }}
              whileHover={{
                borderColor: `${B}40`,
                boxShadow: `0 4px 20px ${B}10`,
              }}
            >
              <span style={{ color: B }}>
                <item.icon size={18} strokeWidth={1.8} />
              </span>
              <span
                className="text-sm font-medium"
                style={{ color: INK, fontFamily: "'DM Sans', sans-serif" }}
              >
                {item.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: INK }} className="px-8 lg:px-20 py-14">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <div
            className="text-2xl font-black tracking-widest text-white mb-1"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            YUUKKE
          </div>
          <div
            className="text-[11px] tracking-[0.3em] uppercase"
            style={{ color: `${B}99`, fontFamily: "'DM Sans', sans-serif" }}
          >
            Workplace Procurement · Corporate Gifting
          </div>
        </div>
        <div className="flex gap-6">
          <a
            href="https://shop.yuukke.com/products/EOY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Shop Products
          </a>
          <div className="w-px bg-white/10" />
          <a
            href="https://gift.yuukke.com/EOY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] uppercase tracking-[0.25em] text-white/40 hover:text-white transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Gift Hampers
          </a>
        </div>
        <div
          className="text-[11px] tracking-[0.2em] uppercase"
          style={{
            color: "rgba(255,255,255,0.15)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          © Yuukke Global · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function EOYLandingPage() {
  return (
    <>
      <FontLoader />
      <CursorGlow />
      <main
        className="min-h-screen overflow-x-hidden"
        style={{ background: "#fff" }}
      >
        <HeroSlider />
        <Ticker />
        <IntroSection />
        <OrnamentDivider />
        <OfferSection />
        <OrnamentDivider />
        <PathsSection />
        <FinalCTA />
        <OrnamentDivider />
        {/* <Footer /> */}
      </main>
    </>
  );
}
