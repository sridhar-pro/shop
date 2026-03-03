"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingBag, Sparkles, Timer, Gift } from "lucide-react";

export default function SherisexHero({
  containerVariants,
  itemVariants,
  floatAnimation,
}) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 px-6 pt-12 pb-20 md:px-12 md:pt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE */}
          <div className="space-y-8">
            <motion.div variants={itemVariants} className="inline-block">
              <motion.div
                className="inline-flex items-center gap-3 px-5 py-2 
                           bg-white/80 backdrop-blur-sm 
                           rounded-full border border-[#A00300]/30 
                           shadow-lg"
              >
                <img
                  src="/sale.gif"
                  alt="Sale"
                  className="w-14 h-14 object-contain"
                />
                <span className="text-sm font-semibold text-[#A00300] tracking-wide uppercase">
                  Celebrating Women's Day
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative w-full text-center md:text-left font-odop"
            >
              {/* Background Ghost Text */}
              <motion.h3
                className="select-none pointer-events-none 
               text-[18vw] md:text-[8vw] 
               leading-none font-bold uppercase 
               text-[#A00300]/10 blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                SaleWeek
              </motion.h3>
              {/* Foreground Logo */}
              <motion.div
                className="absolute inset-0 flex flex-col 
  items-start 
  justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="relative w-60 md:w-80 lg:w-[420px] mt-16">
                  <Image
                    src="/sherise-logo.png"
                    alt="Sherise X Logo"
                    width={500}
                    height={200}
                    priority
                    className="object-contain"
                  />
                </div>

                <div className="mt-6 h-1 w-24 bg-gradient-to-r from-[#A00300] to-[#000940] rounded-full" />
              </motion.div>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-lg mt-20 px-2"
              style={{ fontFamily: "'Crimson Text', serif" }}
            >
              March 1-8: Join us in celebrating the incredible women
              entrepreneurs who power our marketplace. Discover exclusive deals
              on handpicked treasures.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => {
                  document
                    .getElementById("registration-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(160, 3, 0, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-[#A00300] to-[#000b50] text-white rounded-xl font-bold text-lg shadow-xl"
              >
                Explore Now →
              </motion.button>
            </motion.div>
          </div>
          {/* RIGHT SIDE – FLOATING CARDS */}
          <motion.div
            variants={itemVariants}
            className="relative h-auto md:h-[620px] mt-10 md:mt-0"
          >
            {/* ================= MOBILE ================= */}
            <div className="flex flex-col gap-6 md:hidden w-full max-w-md mx-auto px-4">
              {/* Card 1 – Sale Live */}
              <motion.div
                animate={floatAnimation}
                className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 min-h-[110px] flex items-center"
              >
                <div className="flex items-start gap-4">
                  <ShoppingBag className="w-6 h-6 text-[#A00300] mt-1" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      SHErise Week Sale is LIVE 🎉
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Shop Exclusive Deals Before They’re Gone
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 – Special Collections */}
              <motion.div
                animate={floatAnimation}
                className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 min-h-[130px] flex items-center"
              >
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Curated Festive Collections
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Discover handcrafted candles, diya sets & beauty
                      essentials at special SHErise prices.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 – Limited Time */}
              <motion.div
                animate={floatAnimation}
                className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 min-h-[130px] flex items-center"
              >
                <div className="flex items-start gap-4">
                  <Timer className="w-6 h-6 text-pink-600 mt-1" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Limited Time Offers
                    </p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Celebrate empowerment with savings. Don’t miss the biggest
                      deals of SHErise Week.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            {/* ================= DESKTOP ================= */}
            <div className="hidden md:block relative h-full">
              {/* Card 1 – Sale Live */}
              <motion.div
                animate={floatAnimation}
                className="absolute top-0 right-0 w-80 min-h-[170px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-7 flex items-center"
              >
                <div className="flex gap-4">
                  <ShoppingBag className="w-7 h-7 text-[#A00300]" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      SHErise Week Sale is LIVE 🎉
                    </p>
                    <p className="text-sm text-red-800 mt-2">
                      Exclusive Online Offers • Shop Now
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 – Sale Highlights */}
              <motion.div
                animate={{
                  ...floatAnimation,
                  transition: { ...floatAnimation.transition, delay: 0.4 },
                }}
                className="absolute bottom-0 left-0 w-72 min-h-[190px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-7 flex items-center"
              >
                <div className="flex gap-4">
                  <Gift className="w-14 h-14 text-pink-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Festive Special Editions
                    </p>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      Premium handcrafted candles, diya sets & beauty
                      collections — now at celebratory prices.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 – Celebration Message */}
              <motion.div
                animate={{
                  ...floatAnimation,
                  transition: { ...floatAnimation.transition, delay: 0.8 },
                }}
                className="absolute top-1/3 right-40 w-72 min-h-[180px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-7 flex items-center"
              >
                <div className="flex gap-4">
                  <Sparkles className="w-14 h-14 text-purple-600" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      Celebrate With Savings
                    </p>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      Yuukke SHErise Week 2026 Sale is now live. Empower, gift &
                      glow — for less.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
