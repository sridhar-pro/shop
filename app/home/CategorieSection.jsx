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
  const sliderRef = useRef(null);
  const isHoveringRef = useRef(false);
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

        /* Save cache */
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

    const hasCache = loadCached();

    if (!hasCache) {
      fetchCategories();
    }
  }, []);

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (!sliderRef.current || categories.length === 0) return;

    const slider = sliderRef.current;
    let rafId;

    const speed = 0.6; // must be >= 0.6 to visually move consistently
    let position = 0;

    const animate = () => {
      if (!isHoveringRef.current) {
        position += speed;

        const halfWidth = slider.scrollWidth / 2;

        if (position >= halfWidth) {
          position = 0;
        }

        slider.scrollLeft = position;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId);
  }, [categories]);

  const displayCategories = [...categories, ...categories];

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

            <h2 className="text-5xl md:text-6xl font-serif text-[#1F1F1F] font-medium tracking-tight">
              {t("Explore our")}{" "}
              <span className="" translate="no">
                <FlipWords className="text-[#A00300]" words={words} />
              </span>
            </h2>

            <p className="mt-6 text-base text-[#6F6F6F] max-w-md">
              {t("Discover curated collections crafted with elegance and care")}
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/products"
            className="mt-10 lg:mt-0 inline-flex items-center gap-4 px-6 py-3 rounded-full border border-[#D8CFC6] text-sm text-[#1F1F1F] hover:border-[#A00300] hover:text-[#A00300] transition"
          >
            {t("Discover All Categories")}
            <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* SLIDER */}
        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide whitespace-nowrap"
          onMouseEnter={() => (isHoveringRef.current = true)}
          onMouseLeave={() => (isHoveringRef.current = false)}
          onTouchStart={() => (isHoveringRef.current = true)}
          onTouchEnd={() => (isHoveringRef.current = false)}
        >
          <div className="flex gap-10 w-max">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 animate-pulse">
                    <div className="w-[210px] h-[200px] rounded-2xl bg-[#EFE8DE]" />
                    <div className="mt-6 h-4 w-24 mx-auto bg-[#E2D8CC] rounded" />
                  </div>
                ))
              : displayCategories.map((cat, i) => (
                  <Link
                    key={`${cat.slug}-${i}`}
                    href={`/products/category/${cat.slug}`}
                    className="group flex-shrink-0 fade-up"
                  >
                    <div className="relative w-[210px] h-[200px] rounded-2xl bg-[#FDFBF7] border border-[#E6DED3] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
                      {cat.offer && (
                        <span className="absolute top-4 right-4 text-[11px] px-3 py-1 rounded-full bg-[#A00300] text-white font-semibold tracking-wide">
                          {cat.offer}
                        </span>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={140}
                          height={140}
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <h3 className="mt-6 text-center font-serif text-[15px] text-[#1F1F1F] group-hover:text-[#A00300] transition">
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
