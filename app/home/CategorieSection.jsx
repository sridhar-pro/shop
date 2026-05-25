"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FlipWords } from "../components/ui/flip-words";

const CategoriesSection = () => {
  const { t } = useTranslation();
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";
  const [categories, setCategories] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("home_categories_cache");
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);

  const words = [
    { label: "Bags", href: "/products/category/bags" },
    { label: "Stationery", href: "/products/category/stationery" },
    { label: "Beauty", href: "/products/category/beauty" },
    { label: "Fashion", href: "/products/category/fashion" },
    { label: "Home Decor's", href: "/products/category/home-decor" },
    { label: "Groceries", href: "/products/category/groceries" },
  ];

  /* ================= FETCH WITH CACHE ================= */
  useEffect(() => {
    const CACHE_KEY = "home_categories_cache";
    const CACHE_TIME_KEY = "home_categories_cache_time";
    const ONE_DAY = 24 * 60 * 60 * 1000;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/homeCategory");
        const data = await res.json();
        const formatted = data.map((cat) => ({
          name: cat.name,
          slug: cat.slug,
          offer: cat.offer_lable,
          image: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/thumbs/${cat.image}`,
        }));
        setCategories(formatted);
        localStorage.setItem(CACHE_KEY, JSON.stringify(formatted));
        localStorage.setItem(CACHE_TIME_KEY, Date.now());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadCached = () => {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cachedData && cachedTime) {
          const isExpired = Date.now() - cachedTime > ONE_DAY;
          if (!isExpired) {
            setCategories(JSON.parse(cachedData));
            setLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.error("Cache read error:", err);
      }
      return false;
    };

    if (!loadCached()) fetchCategories();
  }, []);

  /* ================= DYNAMIC KEYFRAME ================= */
  // Inject the @keyframes rule once we know the track width
  useEffect(() => {
    if (!trackRef.current || categories.length === 0) return;

    // The track contains two copies; we slide exactly one copy width (50%)
    const styleId = "marquee-keyframes";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes marquee-slide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `;
      document.head.appendChild(style);
    }
  }, [categories]);

  const displayCategories = [...categories, ...categories];

  // Card width + gap in px — must match the inline style below
  const CARD_W = 176; // 160px card + gap ~16px  (mobile)
  const totalCards = categories.length;
  // Duration: how long to scroll one full set. ~18s feels natural.
  const DURATION = Math.max(18, totalCards * 3);

  return (
    <section className="relative bg-[#FBF8F3] py-16 overflow-hidden font-odop">
      {/* TOP BLEND */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent z-20" />
      {/* BOTTOM BLEND */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-20" />

      {/* Soft background circles */}
      <div className="absolute -right-40 top-10 w-[420px] h-[420px] rounded-full bg-[#F3E5E4] opacity-70" />
      <div className="absolute -left-40 bottom-0 w-[320px] h-[320px] rounded-full bg-[#F3E5E4] opacity-60" />

      <div className="relative px-6 lg:px-20 max-w-[1700px] mx-auto">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-20">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs tracking-[0.25em] uppercase text-[#A00300]">
                ✦ {t("Shop by Category")}
              </span>
              <div className="h-px w-12 bg-[#A00300]" />
            </div>

            <h1 className="text-5xl md:text-6xl font-serif text-[#1F1F1F] font-medium tracking-tight">
              {t("Explore our")}{" "}
              <span translate="no">
                <FlipWords className="text-[#A00300]" words={words} />
              </span>
            </h1>

            <p className="mt-6 text-base text-[#6F6F6F] max-w-md">
              {t("Discover curated collections crafted with elegance and care")}
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/products"
            title="Browse All Products"
            className="mt-10 lg:mt-0 inline-flex items-center gap-4 px-6 py-3 rounded-full border border-[#D8CFC6] text-sm text-[#1F1F1F] hover:border-[#A00300] hover:text-[#A00300] transition"
          >
            {t("Discover All Categories")}
            <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* ── MARQUEE SLIDER ── */}
        {/* Outer: clips overflow, no scroll */}
        <div className="overflow-hidden w-full">
          {/* Inner track: CSS animation drives it — browser owns the transform,
              so touch events on child links are never intercepted */}
          <div
            ref={trackRef}
            className="flex gap-6 md:gap-10"
            style={{
              width: "max-content",
              animationName: loading ? "none" : "marquee-slide",
              animationDuration: `${DURATION}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationPlayState: paused ? "paused" : "running",
              willChange: "transform",
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => {
              // Small delay so tap completes before animation resumes
              setTimeout(() => setPaused(false), 300);
            }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 animate-pulse">
                    <div className="w-[160px] h-[160px] md:w-[210px] md:h-[200px] rounded-2xl bg-[#EFE8DE]" />
                    <div className="mt-4 h-4 w-20 mx-auto bg-[#E2D8CC] rounded" />
                  </div>
                ))
              : displayCategories.map((cat, i) => (
                  <Link
                    key={`${cat.slug}-${i}`}
                    href={`/products/category/${cat.slug}`}
                    title={`Explore ${cat.name} Products`}
                    className="group flex-shrink-0 fade-up"
                    draggable={false}
                  >
                    <div className="relative w-[160px] h-[160px] md:w-[210px] md:h-[200px] rounded-2xl bg-[#FDFBF7] border border-[#E6DED3] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
                      {cat.offer && (
                        <span className="absolute top-3 right-3 text-[10px] md:text-[11px] px-2 py-1 rounded-full bg-[#A00300] text-white font-semibold tracking-wide">
                          {cat.offer}
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-8">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          title={`${cat.name} Products on Yuukke`}
                          width={140}
                          height={140}
                          className="object-contain"
                          draggable={false}
                        />
                      </div>
                    </div>
                    <h3 className="mt-4 text-center font-serif text-[13px] md:text-[15px] text-[#1F1F1F] group-hover:text-[#A00300] transition">
                      {cat.name}
                    </h3>
                  </Link>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
