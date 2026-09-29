"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, useEffect, useRef } from "react";
import { Package, Award, Shield, Globe, IndianRupee } from "lucide-react";

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL;

// ─── Fonts (inline via @import) ──────────────────────────────────────────────
// Add to your global CSS or layout:
// @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

// ─── Token palette ────────────────────────────────────────────────────────────
// cream:   #FAF7F2   warm white base
// ink:     #1A0A2E   deep plum-ink text
// rose:    #A00300   rose-magenta accent
// blush:   #F5E6C8   warm sable / muted gold
// dust:    #EDE5D8   card / section tint
// mist:    #8B7B8B   muted text

// ─── Tiny helpers ────────────────────────────────────────────────────────────

function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return [copied, copy];
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Signature divider: torn paper / editorial rule ──────────────────────────

function InkDivider({ flip = false }) {
  return (
    <div
      className="w-full overflow-hidden leading-none"
      style={{ transform: flip ? "scaleX(-1)" : "none", height: 48 }}
    >
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M0,32 C80,10 160,44 260,28 C360,12 420,38 540,24 C660,10 720,40 840,22 C960,4 1040,36 1160,20 C1280,4 1360,30 1440,18 L1440,48 L0,48 Z"
          fill="#FAF7F2"
        />
      </svg>
    </div>
  );
}

function DustDivider() {
  return (
    <div className="w-full overflow-hidden leading-none" style={{ height: 48 }}>
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M0,18 C100,38 200,8 340,26 C480,44 560,12 700,28 C840,44 920,10 1060,24 C1200,38 1320,14 1440,30 L1440,48 L0,48 Z"
          fill="#EDE5D8"
        />
      </svg>
    </div>
  );
}

// ─── Sticky floating pill ────────────────────────────────────────────────────

function StickyPill({ code }) {
  const [copied, copy] = useCopy(code);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10 pointer-events-none"
      }`}
    >
      <button
        onClick={copy}
        style={{
          background: "rgba(250,247,242,0.88)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(212,65,122,0.2)",
          boxShadow:
            "0 8px 40px rgba(26,10,46,0.18), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
        className="flex items-center gap-3 px-5 py-3 rounded-full hover:shadow-2xl transition-all duration-300 group"
      >
        <span
          className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
          style={{ backgroundColor: "#A00300" }}
        />
        <span
          className="text-[11px] font-semibold tracking-[0.18em] uppercase"
          style={{ color: "#8B7B8B", fontFamily: "'DM Sans', sans-serif" }}
        >
          Your Code
        </span>
        <span
          className="font-mono font-bold tracking-widest text-sm"
          style={{ color: "#1A0A2E", fontFamily: "'DM Mono', monospace" }}
        >
          {code}
        </span>
        <span
          className="text-xs font-semibold font-mono tracking-wide italic px-3 py-1 rounded-full transition-all duration-300"
          style={
            copied
              ? { background: "#D4F1E3", color: "#1A6B47" }
              : { background: "#FAE8F0", color: "#A00300" }
          }
        >
          {copied ? "✓ Copied" : "Copy"}
        </span>
      </button>
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero({ affiliate, featuredProducts }) {
  const [copied, copy] = useCopy(affiliate.affiliate_code);
  const preview = featuredProducts.slice(0, 4);

  return (
    <section
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#1A0A2E" }}
    >
      {/* Warm ambient glow — rose top-left, gold bottom-right */}
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,65,122,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(245,230,200,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Nav bar */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-14 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "#A00300",
              color: "#FAF7F2",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {affiliate.affiliate_name?.[0] || "Y"}
          </div>
          <span
            className="text-sm font-medium"
            style={{
              color: "rgba(250,247,242,0.5)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {affiliate.affiliate_name}&apos;s picks
          </span>
        </div>
        <a
          href="#products"
          className="text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
          style={{
            color: "rgba(250,247,242,0.4)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Shop →
        </a>
      </nav>

      {/* Hero body */}
      <div className="relative z-10 flex-1 max-w-[90rem] mx-auto w-full px-8 md:px-14 grid lg:grid-cols-[1fr_480px] gap-12 items-center pb-10 pt-8">
        {/* Left — editorial headline */}
        <div className="flex flex-col">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10" style={{ background: "#A00300" }} />
            <span
              className="text-xs font-semibold tracking-[0.25em] uppercase"
              style={{ color: "#A00300", fontFamily: "'DM Sans', sans-serif" }}
            >
              Verified Curator · {affiliate.affiliate_name}
            </span>
          </div>

          {/* Headline — Playfair Display */}
          <h1
            className="leading-[1.0] tracking-tight mb-6"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
              fontWeight: 900,
              color: "#FAF7F2",
            }}
          >
            Things I{" "}
            <em
              style={{
                fontStyle: "italic",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(250,247,242,0.35)",
              }}
            >
              actually
            </em>
            <br />
            use &amp; love.
          </h1>

          <p
            className="text-lg leading-relaxed mb-10 max-w-md"
            style={{
              color: "rgba(250,247,242,0.45)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
            }}
          >
            Every product here is handpicked, personally vetted, and comes with
            an exclusive discount — because you deserve both quality and
            savings.
          </p>

          <a
            href="#products"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{
              color: "rgba(250,247,242,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Browse the full collection
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Right — product mosaic */}
        <div className="hidden lg:grid grid-cols-2 gap-4 h-[520px] self-center">
          {preview.map((product, i) => {
            const hasDiscount =
              product.promo_price &&
              product.promo_price < product.product_price;
            const heights = [
              "h-[260px]",
              "h-[200px]",
              "h-[200px]",
              "h-[260px]",
            ];
            const offsets = [
              "self-start",
              "self-end mt-4",
              "self-start mt-4",
              "self-end",
            ];
            return (
              <div
                key={product.product_id}
                className={`relative ${heights[i]} ${offsets[i]} rounded-2xl overflow-hidden group`}
                style={{
                  background: "rgba(250,247,242,0.06)",
                  border: "1px solid rgba(250,247,242,0.10)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {hasDiscount && (
                  <div
                    className="absolute top-3 left-3 z-10 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: "#A00300",
                      color: "#FAF7F2",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Sale
                  </div>
                )}
                <Image
                  src={`${IMAGE_BASE}/${product.product_image}`}
                  alt={product.product_name}
                  fill
                  className="object-contain p-5 group-hover:scale-105 transition-transform duration-700"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-3"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(26,10,46,0.8), transparent)",
                  }}
                >
                  <p
                    className="text-white text-xs font-medium line-clamp-1 mb-0.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {product.product_name}
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "#F5E6C8",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    ₹{hasDiscount ? product.promo_price : product.product_price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wave into cream */}
      <div className="relative z-10 w-full" style={{ marginBottom: -2 }}>
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ height: 72, display: "block" }}
        >
          <path
            d="M0,40 C200,72 400,8 600,48 C800,88 1000,16 1200,44 C1320,60 1380,32 1440,36 L1440,72 L0,72 Z"
            fill="#FAF7F2"
          />
        </svg>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  {
    icon: Package,
    num: "100+",
    label: "Premium Picks",
  },
  {
    icon: Award,
    num: "25+",
    label: "Top Brands",
  },
  {
    icon: Shield,
    num: "100%",
    label: "Trusted Shopping",
  },
  {
    icon: Globe,
    num: "Nationwide",
    label: "Service Coverage",
  },
];

function StatsSection() {
  const [ref, visible] = useInView();

  return (
    <section
      ref={ref}
      style={{ background: "#FAF7F2", paddingTop: 16, paddingBottom: 40 }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div
          className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden border"
          style={{
            borderColor: "#E8DFD4",
            background: "#FFFFFF",
          }}
        >
          {STATS.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`group flex flex-col items-center justify-center text-center px-6 py-10 transition-all duration-500 hover:-translate-y-1 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  background: index % 2 === 0 ? "#FAF7F2" : "#F6F1EA",
                  borderRight:
                    index !== STATS.length - 1 ? "1px solid #E8DFD4" : "none",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: "rgba(160,3,0,0.08)",
                  }}
                >
                  <Icon
                    size={26}
                    strokeWidth={2}
                    style={{ color: "#A00300" }}
                  />
                </div>

                <h3
                  className="text-2xl md:text-3xl font-bold mb-2 tracking-wide font-odop"
                  style={{
                    color: "#1A0A2E",
                  }}
                >
                  {item.num}
                </h3>

                <p
                  className="text-xs md:text-sm uppercase tracking-[0.18em]"
                  style={{
                    color: "#7A6F78",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
// ─── Code Banner ─────────────────────────────────────────────────────────────

function CodeBanner({ code }) {
  const [copied, copy] = useCopy(code);
  return (
    <section
      style={{ background: "#FAF7F2", paddingTop: 8, paddingBottom: 48 }}
    >
      <div className="max-w-5xl mx-auto px-8 md:px-14">
        <div
          className="relative overflow-hidden rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-10"
          style={{ background: "#1A0A2E" }}
        >
          <div
            className="absolute top-0 right-0 w-[400px] h-full pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at top right, rgba(212,65,122,0.2) 0%, transparent 70%)",
            }}
          />
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <p
              className="text-xs font-semibold tracking-[0.3em] uppercase mb-3"
              style={{
                color: "#A00300",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Crafted With Purpose
            </p>

            <h2
              className="text-3xl md:text-5xl font-bold leading-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#FAF7F2",
              }}
            >
              Thoughtful Gifts.
              <br />
              Lasting Connections.
            </h2>

            <p
              className="text-base md:text-lg leading-8 mt-6 max-w-2xl mx-auto"
              style={{
                color: "rgba(250,247,242,0.72)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Every hamper is thoughtfully curated to celebrate people,
              strengthen relationships, and create memorable experiences. From
              corporate gifting to festive celebrations and special occasions,
              we help you make every gesture meaningful.
            </p>

            <div
              className="mt-8 h-px w-24 mx-auto"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(250,247,242,0.6), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why section ─────────────────────────────────────────────────────────────

const WHY = [
  {
    num: "01",
    title: "Personally vetted",
    body: "No paid placements, no filler. Each item is something I use or have gifted. If I wouldn't buy it, it's not here.",
  },
  {
    num: "02",
    title: "Exclusive price",
    body: "The discount code unlocks a rate you won't find on any other storefront.",
  },
  {
    num: "03",
    title: "Secure checkout",
    body: "Purchases flow directly through each seller's encrypted, verified payment gateway.",
  },
  {
    num: "04",
    title: "Trusted quality",
    body: "Only products with consistently strong real reviews make the cut.",
  },
];

function WhySection() {
  const [ref, visible] = useInView();
  return (
    <section
      ref={ref}
      style={{ background: "#EDE5D8", paddingTop: 64, paddingBottom: 0 }}
    >
      <div className="max-w-5xl mx-auto px-8 md:px-14 pb-16">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: "#A00300" }} />
              <span
                className="text-xs font-semibold tracking-[0.22em] uppercase"
                style={{
                  color: "#A00300",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Why shop here
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1A0A2E",
              }}
            >
              The difference
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                is curation.
              </em>
            </h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {WHY.map((w, i) => (
            <div
              key={w.num}
              className={`rounded-2xl p-7 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{
                background: "#FAF7F2",
                border: "1px solid rgba(26,10,46,0.07)",
                transitionDelay: `${i * 90}ms`,
              }}
            >
              <span
                className="block text-xs font-bold tracking-[0.2em] mb-4"
                style={{ color: "#A00300", fontFamily: "'DM Mono', monospace" }}
              >
                {w.num}
              </span>
              <h3
                className="font-bold text-lg mb-2"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#1A0A2E",
                }}
              >
                {w.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#8B7B8B",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {w.body}
              </p>
            </div>
          ))}
        </div>
      </div>
      <InkDivider />
    </section>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, index }) {
  const [ref, visible] = useInView(0.04);
  const hasDiscount =
    product.promo_price && product.promo_price < product.product_price;
  const discountPct = hasDiscount
    ? Math.round(
        ((product.product_price - product.promo_price) /
          product.product_price) *
          100,
      )
    : null;

  return (
    <Link
      ref={ref}
      href={`/products/${product.slug}`}
      className={`group flex flex-col rounded-[1.5rem] overflow-hidden transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: "#FAF7F2",
        border: "1px solid #EDE5D8",
        boxShadow: "0 2px 12px rgba(26,10,46,0.05)",
        transitionDelay: `${(index % 4) * 55}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 16px 50px rgba(26,10,46,0.13)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,10,46,0.05)";
        e.currentTarget.style.transform = visible
          ? "translateY(0)"
          : "translateY(2rem)";
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ background: "#EDE5D8" }}
      >
        {hasDiscount && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{
                background: "#1A0A2E",
                color: "#FAF7F2",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sale
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-full"
              style={{
                background: "#A00300",
                color: "#FAF7F2",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              -{discountPct}%
            </span>
          </div>
        )}

        <Image
          src={`${IMAGE_BASE}/${product.product_image}`}
          alt={product.product_name}
          fill
          className="object-contain p-7 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* View overlay */}
        <div
          className="absolute inset-0 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            background:
              "linear-gradient(to top, rgba(26,10,46,0.55) 0%, transparent 50%)",
          }}
        >
          <div className="w-full px-4 pb-4">
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(250,247,242,0.95)",
                color: "#1A0A2E",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              View Product →
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2.5">
        {/* Stars */}
        {/* <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill={i < 4 ? "#A00300" : "none"}
              stroke="#A00300"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span
            className="text-[10px] ml-1"
            style={{ color: "#8B7B8B", fontFamily: "'DM Sans', sans-serif" }}
          >
            4.8
          </span>
        </div> */}

        <h3
          className="font-semibold line-clamp-2 leading-snug"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#1A0A2E",
            fontSize: 15,
          }}
        >
          {product.product_name}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto pt-1">
          {hasDiscount ? (
            <>
              <span
                className="flex items-center text-xl font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#1A0A2E",
                }}
              >
                <IndianRupee size={16} strokeWidth={2.5} />
                {product.promo_price}
              </span>
              <span
                className="text-sm line-through"
                style={{
                  color: "#8B7B8B",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                ₹{product.product_price}
              </span>
              <span
                className="ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "#FAE8F0",
                  color: "#A00300",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Save
                <IndianRupee size={12} strokeWidth={2.5} />
                {product.product_price - product.promo_price}
              </span>
            </>
          ) : (
            <span
              className="inline-flex items-center gap-0.5 text-xl font-bold"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#1A0A2E",
              }}
            >
              <IndianRupee size={18} strokeWidth={2.5} />
              <span>
                {new Intl.NumberFormat("en-IN").format(product.product_price)}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Inline promo banner ──────────────────────────────────────────────────────

function PromoBanner({ code }) {
  const [copied, copy] = useCopy(code);
  return (
    <div
      className="relative overflow-hidden rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-5 px-8 py-7"
      style={{
        background: "linear-gradient(135deg, #1A0A2E 0%, #2D1050 100%)",
        border: "1px solid rgba(212,65,122,0.2)",
      }}
    >
      <div
        className="absolute right-0 top-0 h-full w-[300px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(212,65,122,0.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 text-center sm:text-left">
        <p
          className="text-sm mb-0.5"
          style={{
            color: "rgba(250,247,242,0.5)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Use your discount code
        </p>
        <p
          className="text-xl font-bold"
          style={{ fontFamily: "'Playfair Display', serif", color: "#FAF7F2" }}
        >
          <span
            className="font-mono"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "#F5E6C8",
              background: "rgba(245,230,200,0.12)",
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            {code}
          </span>{" "}
          — save at checkout
        </p>
      </div>
      <button
        onClick={copy}
        className="relative z-10 shrink-0 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
        style={
          copied
            ? {
                background: "rgba(159,213,189,0.15)",
                border: "1px solid rgba(159,213,189,0.3)",
                color: "#9FD5BD",
                fontFamily: "'DM Sans', sans-serif",
              }
            : {
                background: "#A00300",
                color: "#FAF7F2",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 18px rgba(212,65,122,0.35)",
              }
        }
      >
        {copied ? "✓ Copied!" : "Copy Code"}
      </button>
    </div>
  );
}

// ─── Products section ─────────────────────────────────────────────────────────

const FILTERS = ["All", "New Arrivals", "Popular", "Best Deals"];

function ProductsSection({ products, affiliateCode }) {
  const [active, setActive] = useState("All");

  return (
    <section
      id="products"
      style={{ background: "#FAF7F2", paddingTop: 64, paddingBottom: 80 }}
    >
      <div className="max-w-[90rem] mx-auto px-8 md:px-14">
        {/* Heading row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: "#A00300" }} />
              <span
                className="text-xs font-semibold tracking-[0.22em] uppercase"
                style={{
                  color: "#A00300",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Featured collection
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#1A0A2E",
              }}
            >
              Carefully selected,
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                exclusively priced.
              </em>
            </h2>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={
                  active === f
                    ? {
                        background: "#1A0A2E",
                        color: "#FAF7F2",
                        fontFamily: "'DM Sans', sans-serif",
                      }
                    : {
                        background: "#EDE5D8",
                        color: "#1A0A2E",
                        fontFamily: "'DM Sans', sans-serif",
                        border: "1px solid transparent",
                      }
                }
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, i) => (
            <Fragment key={product.slug}>
              <ProductCard product={product} index={i} />

              {(i + 1) % 8 === 0 && i !== products.length - 1 && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <PromoBanner code={affiliateCode} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: "Priya M.",
    text: "The discount code worked perfectly and the product arrived faster than expected. Completely trust this curation.",
    rating: 5,
  },
  {
    name: "Ananya R.",
    text: "I trust this page more than any shopping site. Everything I've ordered has been exactly as described.",
    rating: 5,
  },
  {
    name: "Deepa S.",
    text: "Love the collection — not overwhelming, just the best picks. Saved ₹800 with the code!",
    rating: 5,
  },
];

function TestimonialsSection() {
  const [ref, visible] = useInView();
  return (
    <section
      ref={ref}
      style={{ background: "#EDE5D8", paddingTop: 64, paddingBottom: 0 }}
    >
      <div className="max-w-5xl mx-auto px-8 md:px-14 pb-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8" style={{ background: "#A00300" }} />
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#A00300", fontFamily: "'DM Sans', sans-serif" }}
          >
            Community love
          </span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-12"
          style={{ fontFamily: "'Playfair Display', serif", color: "#1A0A2E" }}
        >
          What shoppers say.
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`rounded-2xl p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                background: "#FAF7F2",
                border: "1px solid rgba(26,10,46,0.07)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <svg
                    key={j}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="#A00300"
                    stroke="#A00300"
                    strokeWidth="1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p
                className="leading-relaxed mb-5 text-sm"
                style={{
                  color: "#8B7B8B",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300,
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #A00300, #1A0A2E)",
                    color: "#FAF7F2",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {t.name[0]}
                </div>
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: "#1A0A2E",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <InkDivider />
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How does the affiliate discount work?",
    a: "Add products to your cart on the seller's site and enter the code at checkout. The discount applies instantly — no conditions, no catches.",
  },
  {
    q: "Is checkout secure?",
    a: "Absolutely. All purchases are processed directly through each seller's encrypted payment gateway. Your card details never pass through me.",
  },
  {
    q: "Can I return products?",
    a: "Return policies are set by each individual seller. Most featured products come with standard return windows — check the product page for specifics.",
  },
  {
    q: "How do I know these are genuine recommendations?",
    a: "I only list products I have personally used, tested, or gifted to people I care about. If I wouldn't recommend it to a friend, it doesn't make the page.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section
      style={{ background: "#FAF7F2", paddingTop: 64, paddingBottom: 80 }}
    >
      <div className="max-w-2xl mx-auto px-8 md:px-14">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px w-8" style={{ background: "#A00300" }} />
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#A00300", fontFamily: "'DM Sans', sans-serif" }}
          >
            Questions
          </span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-bold tracking-tight mb-12"
          style={{ fontFamily: "'Playfair Display', serif", color: "#1A0A2E" }}
        >
          Answered.
        </h2>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl transition-all duration-300"
              style={{
                background: open === i ? "#1A0A2E" : "#EDE5D8",
                border: `1px solid ${open === i ? "transparent" : "rgba(26,10,46,0.08)"}`,
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span
                  className="font-semibold text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: open === i ? "#FAF7F2" : "#1A0A2E",
                  }}
                >
                  {faq.q}
                </span>
                <span
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background:
                      open === i
                        ? "rgba(250,247,242,0.15)"
                        : "rgba(26,10,46,0.1)",
                    color: open === i ? "#FAF7F2" : "#1A0A2E",
                    transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-400 ease-out ${open === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{
                    color: "rgba(250,247,242,0.55)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

function BottomCTA({ affiliate }) {
  const [copied, copy] = useCopy(affiliate.affiliate_code);
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#1A0A2E", paddingTop: 96, paddingBottom: 96 }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,65,122,0.2) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: "#A00300" }} />
          <span
            className="text-xs font-semibold tracking-[0.22em] uppercase"
            style={{ color: "#A00300", fontFamily: "'DM Sans', sans-serif" }}
          >
            Ready to explore?
          </span>
          <div className="h-px w-8" style={{ background: "#A00300" }} />
        </div>

        <h2
          className="leading-tight tracking-tight mb-4"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.8rem, 6vw, 5rem)",
            fontWeight: 900,
            color: "#FAF7F2",
          }}
        >
          Discover more
          <br />
          <em
            style={{
              fontStyle: "italic",
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(250,247,242,0.3)",
            }}
          >
            amazing finds.
          </em>
        </h2>

        <p
          className="text-base mb-10"
          style={{
            color: "rgba(250,247,242,0.4)",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 300,
          }}
        >
          Handpicked by {affiliate.affiliate_name}. Browse the collection and
          save with your exclusive code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#products"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "#FAF7F2",
              color: "#1A0A2E",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Browse Collection
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ name }) {
  return (
    <footer
      style={{
        background: "#1A0A2E",
        borderTop: "1px solid rgba(250,247,242,0.06)",
        paddingTop: 28,
        paddingBottom: 28,
      }}
    >
      <div className="max-w-5xl mx-auto px-8 md:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p
          className="text-sm font-medium"
          style={{
            color: "rgba(250,247,242,0.25)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}&apos;s Showcase
        </p>
        <p
          className="text-xs"
          style={{
            color: "rgba(250,247,242,0.15)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          © {new Date().getFullYear()} · Powered by Yuukke
        </p>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AffiliateStore({ affiliate }) {
  const featured = affiliate.products.slice(0, 4);

  return (
    <div className="min-h-screen antialiased" style={{ background: "#FAF7F2" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
        ::selection { background: #A00300; color: #FAF7F2; }
      `}</style>
      <Hero affiliate={affiliate} featuredProducts={featured} />
      <StatsSection />
      <CodeBanner code={affiliate.affiliate_code} />
      <WhySection />
      <ProductsSection
        products={affiliate.products}
        affiliateCode={affiliate.affiliate_code}
      />
      <TestimonialsSection />
      <FAQ />
      <BottomCTA affiliate={affiliate} />
      <Footer name={affiliate.affiliate_name} />
      {/* <StickyPill code={affiliate.affiliate_code} /> */}
    </div>
  );
}
