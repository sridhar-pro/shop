"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    title: "Handcrafted Luxury",
    subtitle: "Jewelry Collection",
    desc: "Discover timeless pieces crafted by women artisans.",
    image: "/slider.png",
  },
  {
    id: 2,
    title: "Elegant Fashion",
    subtitle: "Up to 60% Off",
    desc: "Premium handbags, accessories & curated fashion picks.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
  },
  // {
  //   id: 3,
  //   title: "Home & Lifestyle",
  //   subtitle: "Curated With Love",
  //   desc: "Artisan ceramics, decor & handcrafted home essentials.",
  //   image:
  //     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000",
  // },
];

export default function SliderSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[60vh] md:h-[50vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slides[current].image})`,
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Gradient Overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" /> */}

          {/* Content */}
          {/* <div className="relative z-10 h-full flex items-center px-6 md:px-20">
            <div className="max-w-2xl text-white space-y-5">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {slides[current].title}
                <br />
                <span className="text-[#A00300]">
                  {slides[current].subtitle}
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-gray-200"
              >
                {slides[current].desc}
              </motion.p>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(160, 3, 0, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#A00300] rounded-full font-bold text-base shadow-xl"
              >
                Explore Now →
              </motion.button>
            </div>
          </div> */}
        </motion.div>
      </AnimatePresence>

      {/* Premium Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div
          className="flex items-center gap-4 px-6 py-3 rounded-full 
                  bg-white/10 backdrop-blur-xl 
                  border border-white/20 
                  shadow-2xl"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className="relative w-14 h-2 rounded-full overflow-hidden bg-white/30"
            >
              {/* Active Fill Animation */}
              {current === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r 
                       from-[#A00300] to-[#000940] 
                       rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
