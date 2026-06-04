"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Basic Plan",
    tag: "Free Forever",
    tagIcon: <Zap size={11} />,
    price: "Free",
    priceSuffix: null,
    accent: "#000930",
    accentLight: "#f0f1f8",
    featured: false,
    Icon: Zap,
    features: [
      { text: "Upload up to 5 Products", available: true },
      { text: "B2B Listing", available: false },
      { text: "Dedicated Page", available: false },
      { text: "ONDC Listing", available: false },
      { text: "International Shipping", available: false },
      { text: "Expo Access", available: false },
      { text: "Billing & Sales Software", available: false },
      { text: "Dedicated Support for a Month", available: true },
    ],
  },
  {
    name: "Verified Plan",
    tag: "Most Popular",
    tagIcon: <Sparkles size={11} />,
    price: "₹2,900",
    priceSuffix: "/ year",
    accent: "#A00300",
    accentLight: "#fff3f3",
    featured: true,
    Icon: Sparkles,
    features: [
      { text: "Upload up to 25 Products", available: true },
      { text: "B2B Listing (10 Products)", available: true },
      { text: "Dedicated Page", available: false },
      { text: "ONDC Listing", available: false },
      { text: "International Shipping (5 Countries)", available: true },
      { text: "2 Expo (Discounted)", available: true },
      { text: "Billing & Sales Software", available: true },
      { text: "Dedicated Support for 3 Months", available: true },
    ],
  },
  {
    name: "Premium Plan",
    tag: "Best Value",
    tagIcon: <Crown size={11} />,
    price: "₹9,900",
    priceSuffix: "/ year",
    accent: "#000930",
    accentLight: "#f0f1f8",
    featured: false,
    Icon: Crown,
    features: [
      { text: "Unlimited Products", available: true },
      { text: "B2B Listing (25 Products)", available: true },
      { text: "Dedicated Page", available: true },
      { text: "ONDC Listing", available: true },
      { text: "International Shipping (5 Countries)", available: true },
      { text: "5 Expo (Discounted)", available: true },
      { text: "Billing & Sales Software", available: true },
      { text: "Dedicated Support for a Year", available: true },
    ],
  },
];

/* ── Feature row ── */
function FeatureRow({ feature, index, accent, isVisible, featured }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: 0.35 + index * 0.055 }}
      className="flex items-center gap-3"
    >
      {feature.available ? (
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: `${accent}15`,
            border: `1.5px solid ${accent}35`,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke={accent}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <span
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            background: "#f5f5f8",
            border: "1.5px solid #e0e0ec",
          }}
        >
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 2l6 6M8 2l-6 6"
              stroke="#b0b0c8"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      )}
      <span
        className="text-sm leading-snug"
        style={{
          color: featured
            ? feature.available
              ? "#ffffff"
              : "rgba(255,255,255,0.45)"
            : feature.available
              ? "#1a1a2e"
              : "#000000",
          fontWeight: feature.available ? 500 : 400,
          textDecoration: feature.available ? "none" : "none",
        }}
      >
        {feature.text}
      </span>
    </motion.li>
  );
}

/* ── Plan card ── */
function PlanCard({ plan, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.13,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ perspective: 1000, zIndex: plan.featured ? 2 : 1 }}
      className={`relative ${plan.featured ? "md:-mt-6 md:mb-6" : ""}`}
    >
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative h-full rounded-3xl overflow-hidden flex flex-col"
        style={{
          background: plan.featured
            ? "linear-gradient(160deg, #A00300 0%, #7a0200 100%)"
            : "#ffffff",
          border: plan.featured
            ? "2px solid #A00300"
            : `2px solid ${hovered ? plan.accent + "40" : "#e8e8f2"}`,
          boxShadow: plan.featured
            ? hovered
              ? "0 32px 64px rgba(160,3,0,0.40), 0 8px 24px rgba(160,3,0,0.25)"
              : "0 20px 50px rgba(160,3,0,0.30), 0 4px 16px rgba(160,3,0,0.18)"
            : hovered
              ? `0 20px 48px rgba(0,9,48,0.12), 0 0 0 2px ${plan.accent}25`
              : "0 4px 20px rgba(0,9,48,0.07)",
          transition: "border-color 0.35s, box-shadow 0.35s",
        }}
      >
        {/* Featured shimmer overlay */}
        {plan.featured && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.10) 0%, transparent 65%)",
            }}
          />
        )}

        {/* Top accent bar (non-featured) */}
        {!plan.featured && (
          <motion.div
            className="absolute top-0 left-0 h-[3px] rounded-t-3xl"
            animate={{ width: hovered ? "100%" : "0%" }}
            transition={{ duration: 0.4 }}
            style={{
              background: `linear-gradient(to right, ${plan.accent}, ${plan.accent}88)`,
            }}
          />
        )}

        {/* Header */}
        <div className="px-8 pt-9 pb-7">
          {/* Tag pill */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: index * 0.13 + 0.2 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-[11px] font-black tracking-[0.18em] uppercase"
            style={
              plan.featured
                ? {
                    background: "rgba(255,255,255,0.18)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }
                : {
                    background: plan.accentLight,
                    color: plan.accent,
                    border: `1.5px solid ${plan.accent}30`,
                  }
            }
          >
            {plan.tagIcon}
            {plan.tag}
          </motion.div>

          {/* Plan name */}
          <h3
            className="font-black mb-1 leading-tight"
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "1.35rem",
              color: plan.featured ? "#ffffff" : "#000930",
            }}
          >
            {plan.name}
          </h3>

          {/* Price */}
          <div className="flex items-end gap-1.5 mt-3 mb-6">
            <motion.span
              className="font-black leading-none"
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: plan.price === "Free" ? "2.8rem" : "2.6rem",
                color: plan.featured ? "#ffffff" : plan.accent,
              }}
            >
              {plan.price}
            </motion.span>
            {plan.priceSuffix && (
              <span
                className="mb-1 text-sm font-medium"
                style={{
                  color: plan.featured ? "rgba(255,255,255,0.65)" : "#8888a8",
                }}
              >
                {plan.priceSuffix}
              </span>
            )}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const section = document.getElementById("verify-phone");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all"
            style={
              plan.featured
                ? {
                    background: "#ffffff",
                    color: "#A00300",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    fontSize: "0.92rem",
                  }
                : {
                    background: `linear-gradient(135deg, ${plan.accent} 0%, ${plan.accent}dd 100%)`,
                    color: "#ffffff",
                    boxShadow: `0 4px 18px ${plan.accent}35`,
                    fontSize: "0.92rem",
                  }
            }
          >
            Get Started →
          </motion.button>
        </div>

        {/* Divider */}
        <div
          className="mx-8"
          style={{
            height: 1,
            background: plan.featured ? "rgba(255,255,255,0.18)" : "#ebebf4",
          }}
        />

        {/* Features */}
        <ul className="px-8 py-7 flex flex-col gap-3.5 flex-1">
          {plan.features.map((feature, fIdx) => (
            <FeatureRow
              key={fIdx}
              feature={feature}
              index={fIdx}
              accent={plan.featured ? "#ffffff" : plan.accent}
              isVisible={inView}
              featured={plan.featured}
            />
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

/* ── Main export ── */
export default function Pricing() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true });

  return (
    <section
      className="relative py-14 overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #00093012 1.2px, transparent 1.2px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 900,
          height: 320,
          background:
            "radial-gradient(ellipse, rgba(160,3,0,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        {/* ── Heading ── */}
        <div ref={headingRef} className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-5"
          >
            <span className="h-px w-12" style={{ background: "#A00300" }} />
            <span
              className="font-black uppercase tracking-[0.35em]"
              style={{ fontSize: 11, color: "#A00300" }}
            >
              Choose Your Plan
            </span>
            <span className="h-px w-12" style={{ background: "#A00300" }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              fontWeight: 900,
              color: "#000930",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
            }}
          >
            Pricing &{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A00300, #d40400)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Plans
            </span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={headingInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 4,
              width: 80,
              background: "linear-gradient(to right, #A00300, #d40400)",
              borderRadius: 99,
              margin: "0 auto 1.75rem",
              transformOrigin: "left",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.4 }}
            className="flex flex-col items-center gap-1"
          >
            <p
              className="font-black"
              style={{
                fontSize: "1.45rem",
                color: "#000930",
                fontFamily: "'Georgia', serif",
              }}
            >
              Grow Your Business
            </p>
            <p
              className="font-semibold tracking-widest uppercase"
              style={{
                fontSize: "0.78rem",
                color: "#8888a8",
                letterSpacing: "0.22em",
              }}
            >
              By Unlocking This Opportunity
            </p>
            <p
              className="mt-2 font-medium"
              style={{ fontSize: "0.95rem", color: "#66667a" }}
            >
              Stand Out Among Sellers — Apply For Your Badge Today!
            </p>
          </motion.div>
        </div>

        {/* ── Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, idx) => (
            <PlanCard key={idx} plan={plan} index={idx} />
          ))}
        </div>

        {/* ── Footer note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
          style={{ fontSize: "0.85rem", color: "#9898b8" }}
        >
          All plans include access to the Yuukke seller dashboard. No hidden
          fees. Cancel anytime.
        </motion.p>
      </div>
    </section>
  );
}
