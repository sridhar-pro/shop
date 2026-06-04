"use client";

import { motion } from "framer-motion";

import {
  ArrowUpRight,
  FileText,
  Sparkles,
  BarChart3,
  Waves,
  GaugeCircle,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";

export default function YuukkeSellerHero() {
  const floatingIcons = [
    {
      icon: Sparkles,
      className: "left-[5%] top-[22%] bg-[#000930] text-white w-14 h-14",
    },
    {
      icon: FileText,
      className:
        "left-[8%] bottom-[26%] bg-[#A00300]/10 text-[#A00300] w-14 h-14",
    },
    {
      icon: BarChart3,
      className:
        "right-[7%] top-[20%] bg-[#A00300]/10 text-[#A00300] w-14 h-14",
    },
    {
      icon: Waves,
      className:
        "right-[10%] bottom-[28%] border border-[#000930]/20 text-[#000930] w-16 h-16 bg-white/70 backdrop-blur-xl",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#fafafa] md:min-h-screen px-5 sm:px-6 lg:px-10 pt-10 pb-16">
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#000930 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[radial-gradient(circle,_rgba(160,3,0,0.08),_transparent_70%)]" />

      {/* Floating Icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={i}
            animate={{
              y: [0, -12, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute hidden lg:flex rounded-3xl items-center justify-center shadow-xl ${item.className}`}
          >
            <Icon size={26} />
          </motion.div>
        );
      })}

      {/* Main */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Content */}
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-7 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#A00300]/20 bg-white shadow-sm"
          >
            <Sparkles size={15} className="text-[#A00300]" />

            <span className="text-[12px] tracking-[0.2em] font-bold uppercase text-[#A00300]">
              Women Powered Marketplace
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl text-[42px] sm:text-[58px] lg:text-[92px] leading-[1.02] tracking-[-1px] font-black text-[#000930]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Start selling on Yuukke
            <br />
            <span className="text-[#A00300] relative inline-block">
              India's first women-powered marketplace
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-7  max-w-3xl text-[16px] sm:text-[18px] leading-[1.9] text-[#000930]/65 px-2"
          >
            Built for women entrepreneurs & Indie Makers.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-4 flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={() => {
                document.getElementById("verify-phone")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="group bg-[#A00300] hover:bg-[#870200] text-white px-9 sm:px-10 py-4 rounded-2xl text-[15px] font-bold shadow-[0_10px_30px_rgba(160,3,0,0.25)] transition-all duration-300 flex items-center gap-2"
            >
              Register Now
              <ArrowDown size={22} className="animate-bounce" />
            </button>

            <button
              onClick={() => {
                document.getElementById("learn-more")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="bg-white border border-[#000930]/10 hover:border-[#000930]/30 hover:bg-white text-[#000930] px-9 sm:px-10 py-4 rounded-2xl text-[15px] font-semibold shadow-sm transition-all duration-300"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Bottom Cards */}
        <div className="mt-0 hidden md:flex flex-nowrap justify-center items-end gap-6 w-full overflow-x-auto">
          {/* Image Card */}
          <div className="w-[220px] h-[410px] rounded-[34px] overflow-hidden bg-[#ececec]">
            <img
              src="/Geometric South Asian women in sarees.png"
              alt="seller"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Seller Count Card */}
          <div className="w-[210px] h-[310px] rounded-[34px] bg-[#000930] text-white p-10 flex flex-col justify-center">
            <h2 className="text-6xl font-semibold">10K+</h2>

            <p className="mt-6 text-[20px] leading-[1.6] text-white/85">
              Active Sellers Growing with Yuukke
            </p>
          </div>

          {/* Products Card */}
          <div className="w-[320px] h-[240px] rounded-[34px] bg-white p-8 flex flex-col justify-between shadow-sm">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#A00300]/10 flex items-center justify-center">
                <BarChart3 className="text-[#A00300]" size={22} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="w-1 h-1 rounded-full bg-gray-300" />
                <div className="w-1 h-1 rounded-full bg-gray-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[#666]">
                <span className="text-lg">Products Listed</span>

                <span className="text-sm text-[#A00300] font-medium">
                  ↗ 12%
                </span>
              </div>

              <h2 className="text-[56px] leading-none font-semibold text-[#000930] mt-3">
                25K+
              </h2>

              <p className="mt-2 text-[#888] text-md">
                Added by <span className="text-[#A00300]">new sellers</span>{" "}
                this month
              </p>
            </div>
          </div>

          {/* Support Card */}
          <div className="w-[210px] h-[310px] rounded-[34px] bg-[#A00300]/10 text-[#000930] p-10 flex flex-col justify-center">
            <h2 className="text-6xl font-semibold text-[#A00300]">100%</h2>

            <p className="mt-6 text-[20px] leading-[1.6]">
              Secure Seller Support & Easy Onboarding
            </p>
          </div>

          {/* Growth Card */}
          <div className="w-[220px] h-[410px] rounded-[34px] bg-[#000930] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_#A00300,_transparent_60%)]" />

            <div className="relative z-10 w-14 h-14 rounded-full border border-white/30 flex items-center justify-center">
              <GaugeCircle size={28} />
            </div>

            <div className="relative z-10">
              <h3 className="text-[30px] leading-[1.25] font-medium">
                Reach More Buyers and Grow Your Brand Faster
              </h3>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-sm text-[#666]"
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#A00300]" />

            <span>Trusted Seller Platform</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-[#ccc]" />

          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[#A00300]" />

            <span>Fast Onboarding</span>
          </div>

          <div className="w-1.5 h-1.5 rounded-full bg-[#ccc]" />

          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="text-[#A00300]" />

            <span>Premium Marketplace Visibility</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
