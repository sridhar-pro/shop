"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WobbleCard } from "@/app/components/ui/wobble-card";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import CategoriesSection from "./CategorieSection";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function WobbleCardDemo() {
  const { t } = useTranslation();
  const hasFetched = useRef(false);

  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  const fadeVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchNewArrivals = async () => {
      try {
        const res = await fetch("/api/getReturnGifts");
        const data = await res.json();
        if (!data) return;

        const strip = (html, limit = 18) => {
          const text = html?.replace(/<[^>]*>/g, "") || "";
          const words = text.split(" ");
          return words.length > limit
            ? words.slice(0, limit).join(" ") + "…"
            : text;
        };

        const latest = data.slice(-8);

        setSlides(
          latest.map((item) => ({
            title: item.name,
            description: strip(item.product_details),
            image: `https://marketplace.yuukke.com/assets/uploads/${item.image}`,
            link: item.slug,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (slides.length ? (prev + 1) % slides.length : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [slides]);

  const active = slides[index] || {};

  return (
    <>
      <CategoriesSection />
      {/* ================= WOMEN'S DAY CAMPAIGN SECTION ================= */}
      <section className="relative overflow-hidden">
        {/* ===== Animated Wave Background ===== */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute bottom-0 w-[200%]"
          >
            <svg viewBox="0 0 1440 320" className="w-full">
              <path
                fill="#A00300"
                fillOpacity="0.08"
                d="M0,224L60,208C120,192,240,160,360,154.7C480,149,600,171,720,186.7C840,203,960,213,1080,197.3C1200,181,1320,139,1380,117.3L1440,96V320H0Z"
              />
            </svg>
          </motion.div>
        </div>

        {/* Smooth Top White Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff8f8] via-40% to-white" />

        <div className="relative z-10 px-4 sm:px-6 md:px-10 lg:px-20 font-odop">
          {/* ===== MODERN CAMPAIGN HEADING ===== */}
          <div className="text-center pt-4 pb-12 relative">
            {/* Decorative blurred circle */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-64 h-64 bg-[#A00300]/10 blur-3xl rounded-full pointer-events-none" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-[10px] tracking-[0.5em] uppercase text-[#000940] font-medium block"
              >
                Limited Time Experience
              </motion.span>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="mt-4 text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#000940]"
              >
                Celebrate Her
                <span className="block mt-2 bg-gradient-to-r from-[#A00300] via-[#c1132c] to-[#000940] bg-clip-text text-transparent font-semibold">
                  Women’s Day Collection
                </span>
              </motion.h1>

              {/* Subtle glowing divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  delay: 0.5,
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-[2px] w-32 mx-auto mt-8 bg-gradient-to-r from-transparent via-[#A00300] to-transparent"
              />
            </motion.div>
          </div>

          {/* ===== MAIN GRID ===== */}
          <div className="pb-0 md:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* LEFT SIDE */}
              <div className="lg:col-span-8 relative">
                <Link href={`/products/${active.link || ""}`}>
                  <WobbleCard containerClassName="relative h-[420px] md:h-[460px] rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-[#A00300] via-[#b11226] to-[#7a0000]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_60%)]" />

                    <AnimatePresence mode="wait">
                      {active.image && (
                        <motion.div
                          key={index}
                          variants={fadeVariants}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            duration: 0.6,
                            ease: "easeInOut",
                          }}
                          className="relative z-10 h-full flex flex-col md:grid md:grid-cols-12"
                        >
                          <div className="relative w-full h-[240px] md:h-auto md:col-span-7 flex items-center justify-center">
                            <Image
                              src={active.image}
                              alt={active.title}
                              fill
                              className="object-contain p-6 md:p-12 drop-shadow-[0_40px_70px_rgba(0,0,0,0.45)]"
                              priority
                            />
                          </div>

                          <div className="md:col-span-5 flex items-center">
                            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 md:p-7 m-4 md:mr-6 md:m-0 border border-[#A00300]/20 shadow-xl">
                              <span className="text-[11px] tracking-widest uppercase text-[#A00300] font-semibold">
                                New Arrival
                              </span>

                              <h2 className="mt-2 text-lg md:text-2xl font-semibold text-gray-900 leading-snug">
                                {active.title}
                              </h2>

                              <p className="hidden md:block mt-3 text-sm md:text-base text-gray-600">
                                {active.description}
                              </p>

                              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A00300]">
                                Explore Product →
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* NAV */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIndex(index === 0 ? slides.length - 1 : index - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white text-[#A00300] rounded-full p-3 shadow-xl hover:scale-110 transition z-20"
                    >
                      <FiArrowLeft />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIndex((index + 1) % slides.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-[#A00300] rounded-full p-3 shadow-xl hover:scale-110 transition z-20"
                    >
                      <FiArrowRight />
                    </button>
                  </WobbleCard>
                </Link>
              </div>

              {/* RIGHT SIDE */}
              <div className="lg:col-span-4 flex flex-col gap-5 h-full">
                {slides.slice(0, 3).map((item, i) => (
                  <Link key={i} href={`/products/${item.link}`}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="
          group flex items-center gap-5 p-5 rounded-3xl
          bg-gradient-to-r from-white to-[#fff5f5]
          border border-[#A00300]/20 shadow-md hover:shadow-xl transition
          min-h-[120px] md:min-h-[unset]
        "
                    >
                      {/* Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-2xl border-2 border-[#A00300]/40 bg-white">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex flex-col justify-center">
                        <h4 className="text-base font-semibold line-clamp-2 text-gray-900 group-hover:text-[#A00300] transition">
                          {item.title}
                        </h4>
                        <span className="text-sm font-medium text-[#A00300]">
                          View Product →
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
