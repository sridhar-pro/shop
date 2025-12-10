"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, User } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Nisha Varghese",
    product: "Coconut Candle",
    text: "Smells amazing and looks so aesthetic! The coconut shell gives it such a natural vibe. Burns evenly and makes my room feel so cozy.",
    rating: 5,
  },
  {
    id: 2,
    name: "Ananya Mehta",
    product: "Handcrafted Tote Bag",
    text: "Absolutely loved the quality! The fabric feels durable and the design is so unique. Perfect for my everyday errands and work.",
    rating: 4,
  },
  {
    id: 3,
    name: "Deepika Sharma",
    product: "Clay Jewellery Set",
    text: "This is such a pretty set! Lightweight, elegant, and handcrafted with care. Got so many compliments wearing it at an event.",
    rating: 5,
  },
  {
    id: 4,
    name: "Farhana Siddiqui",
    product: "Herbal Lip Balm",
    text: "Very smooth texture and keeps my lips soft for hours. Love that it’s chemical-free and has a natural tint. Definitely buying again!",
    rating: 4,
  },
  {
    id: 5,
    name: "Sara Khan",
    product: "Terracotta Planter",
    text: "Beautiful handmade piece! Adds such charm to my balcony. The detailing shows how much effort went into it. Totally worth it.",
    rating: 5,
  },
  {
    id: 6,
    name: "Kavya",
    product: "Scented Soy Wax Melts",
    text: "The fragrance is divine — fills the whole room within minutes. Great for relaxing after work or while journaling.",
    rating: 4,
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // --- In-view detection (intro animations only when visible) ---
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-20% 0px" });

  // --- Simple mobile breakpoint flag (no desktop changes) ---
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getTestimonial = (offset) => {
    const newIndex =
      (index + offset + testimonials.length) % testimonials.length;
    return testimonials[newIndex];
  };

  const visibleCards = [
    getTestimonial(-1),
    getTestimonial(0),
    getTestimonial(1),
  ];
  const cardsToRender = isMobile ? [visibleCards[1]] : visibleCards;

  return (
    <section
      ref={sectionRef}
      className="w-full h-auto flex flex-col items-center justify-center py-0 md:py-16 bg-white overflow-hidden font-odop"
    >
      {/* Title Section */}
      <div className="text-center mb-4 md:mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-bold text-[#960B39]"
        >
          What Our Customers Say
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-gray-600 text-base md:text-lg mt-3 px-4 md:px-0"
        >
          Real stories from real people who found joy through our work.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-4"
        >
          <div className="w-24 h-[3px] bg-gradient-to-r from-[#960B39] via-[#b30f47] to-[#d91e63] rounded-full"></div>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative flex items-center justify-center w-full md:w-[80%] lg:w/[70%] ${
          isMobile ? "h-auto" : "h-[420px]"
        }`}
      >
        {cardsToRender.map((t, i) => {
          const isCenter = isMobile ? true : i === 1;
          const xOffset = isMobile ? 0 : (i - 1) * 400 + direction * 40;
          const scale = isMobile ? 1 : isCenter ? 1.1 : 0.9;
          const zIndex = isMobile ? 1 : isCenter ? 20 : 10;
          const opacity = isMobile ? 1 : isCenter ? 1 : 0.85;

          return (
            <motion.div
              key={t.id}
              className={
                (isMobile ? "relative" : "absolute") +
                " flex flex-col justify-between items-center p-5 rounded-2xl shadow-lg border transition-all duration-500 " +
                (isCenter
                  ? "text-white bg-[linear-gradient(to_bottom_left,#A00300,#000940)] border-white/30"
                  : "bg-white text-gray-700 border-gray-200")
              }
              animate={{
                x: xOffset,
                scale,
                zIndex,
                opacity,
              }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              style={{
                width: isMobile ? "92vw" : isCenter ? 360 : 350,
                maxWidth: isMobile ? 460 : undefined,
                height: isMobile ? "auto" : isCenter ? 350 : 300,
              }}
            >
              <p
                className={`leading-relaxed text-center ${
                  isMobile ? "text-base" : "text-base md:text-lg"
                } ${isCenter ? "mt-1" : ""}`}
              >
                {t.text}
              </p>

              <p
                className={`mt-3 font-semibold text-center ${
                  isCenter ? "text-white" : "text-[#960B39]"
                }`}
              >
                {t.product}
              </p>

              <div className="flex flex-col items-center mt-4">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${
                    isCenter
                      ? "border-white bg-white/20"
                      : "border-gray-300 bg-gray-100"
                  }`}
                >
                  <User
                    className={isCenter ? "text-white" : "text-gray-600"}
                    size={24}
                  />
                </div>
                <h3
                  className={`font-semibold mt-2 ${
                    isCenter ? "text-white" : "text-black"
                  }`}
                >
                  {t.name}
                </h3>
                <div className="flex mt-1">
                  {[...Array(t.rating)].map((_, si) => (
                    <Image
                      key={si}
                      src="/star.png"
                      alt="Star"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Navigation + Pagination Section */}
      <div className="relative w-full flex items-center justify-between mt-6 md:mt-12 px-4 md:px-[28rem]">
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition shadow-sm"
          aria-label="Previous testimonial"
        >
          <ArrowLeft className="text-gray-700" size={18} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute left-1/2 -translate-x-1/2 flex space-x-2">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === index
                  ? "w-8 bg-[#960B39]"
                  : "w-4 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="w-10 h-10 flex items-center justify-center bg-[#960B39] text-white rounded-full hover:bg-[#7c092f] transition shadow-sm"
          aria-label="Next testimonial"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
