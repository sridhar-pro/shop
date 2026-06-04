"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { useRef, useState } from "react";

import {
  Megaphone,
  Headset,
  BadgePercent,
  Globe2,
  TrendingUp,
  Gem,
  TicketPercent,
  User,
  ShieldCheck,
} from "lucide-react";

const advantages = [
  {
    icon: Headset,
    title: "Seller Support",
    desc: "Our Dedicated Seller Support Team is available via phone, email, chat, and social media to help resolve any questions or issues 7 days a week.",
    accent: "#A00300",
    tag: "24/7 CARE",
    number: "01",
  },
  {
    icon: User,
    title: "Reach the Right Buyers",
    desc: "Connect with a curated audience actively looking for handmade, artisan, and homemade products across India.",
    accent: "#000930",
    tag: "VISIBILITY",
    number: "02",
  },

  {
    icon: BadgePercent,
    title: "Low Platform Charges",
    desc: "Yuukke has a competitive commission fee of only 5% per transaction, lower than many other marketplaces. No monthly fee or additional costs.",
    accent: "#A00300",
    tag: "5% ONLY",
    number: "03",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Timely Payments",
    desc: "Get paid directly to your bank account. Transparent commissions with no hidden charges.",
    accent: "#000930",
    tag: "SCALE",
    number: "04",
  },
  {
    icon: TrendingUp,
    title: "Yuukke Growth Tools",
    desc: "Yuukke Marketplace Sellers get access to mentorship, webinars, community access and more on our Yuukke Platform.",
    accent: "#A00300",
    tag: "GROWTH",
    number: "05",
  },
  {
    icon: TicketPercent,
    title: "Discounted Membership",
    desc: "Get discounts for participating and displaying your products in Yuukke events like expos, conferences and premium membership.",
    accent: "#000930",
    tag: "SAVINGS",
    number: "06",
  },
];

/* ── Tilt card hook ── */
function useTilt(ref) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(
      y,
      [-0.5, 0.5],
      typeof window !== "undefined" && window.innerWidth < 768
        ? [0, 0]
        : [6, -6],
    ),
    {
      stiffness: 300,
      damping: 28,
    },
  );

  const rotateY = useSpring(
    useTransform(
      x,
      [-0.5, 0.5],
      typeof window !== "undefined" && window.innerWidth < 768
        ? [0, 0]
        : [-6, 6],
    ),
    {
      stiffness: 300,
      damping: 28,
    },
  );

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();

    if (!rect) return;

    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, onMouseMove, onMouseLeave };
}

/* ── Individual card ── */
function AdvantageCard({ item, index }) {
  const ref = useRef(null);

  const inView = useInView(ref, {
    once: true,
    margin: "-60px",
  });

  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(ref);

  const [hovered, setHovered] = useState(false);

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.65,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={() => {
          onMouseLeave();
          setHovered(false);
        }}
        onMouseEnter={() => setHovered(true)}
        className="relative h-full rounded-[30px] cursor-default [transform:translateZ(0)]"
      >
        <div
          className="relative h-full overflow-hidden rounded-[30px] transition-all duration-500"
          style={{
            background: hovered ? "#ffffff" : "#fafafa",
            border: `1.5px solid ${hovered ? item.accent + "50" : "#e8e8ee"}`,
            boxShadow: hovered
              ? window.innerWidth < 768
                ? `0 10px 24px rgba(0,0,0,0.08)`
                : `0 30px 60px rgba(0,0,0,0.12), 0 0 0 1px ${item.accent}20`
              : "0 8px 24px rgba(0,9,48,0.06)",
          }}
        >
          {/* Glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: `radial-gradient(circle at top, ${item.accent}12 0%, transparent 65%)`,
            }}
          />

          {/* Accent bar */}
          <motion.div
            className="absolute top-0 left-0 h-[4px] rounded-t-[30px]"
            initial={{ width: "0%" }}
            animate={
              inView ? { width: hovered ? "100%" : "38%" } : { width: "0%" }
            }
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            style={{
              background: `linear-gradient(to right, ${item.accent}, ${item.accent}80)`,
            }}
          />

          <div className="relative z-10 p-8 lg:p-9 flex flex-col h-full">
            {/* Top */}
            <div className="flex items-start justify-between mb-4">
              {/* Icon */}
              <motion.div
                animate={{
                  scale: hovered ? 1.08 : 1,
                  y: hovered ? -2 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, ${item.accent}20, ${item.accent}08)`,
                  border: `1px solid ${item.accent}25`,
                  boxShadow: `0 10px 30px ${item.accent}18`,
                }}
              >
                <Icon
                  size={window.innerWidth < 768 ? 30 : 38}
                  strokeWidth={2.2}
                  style={{ color: item.accent }}
                />

                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={
                    hovered
                      ? {
                          scale: [1, 1.18, 1],
                          opacity: [0.5, 0, 0.5],
                        }
                      : {}
                  }
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                  style={{
                    border: `1.5px solid ${item.accent}40`,
                  }}
                />
              </motion.div>

              {/* Tag + Number */}
              <div className="flex flex-col items-end gap-3">
                <span
                  className="text-[11px] font-black tracking-[0.25em] px-4 py-1.5 rounded-full uppercase"
                  style={{
                    color: item.accent,
                    background: `${item.accent}12`,
                    border: `1px solid ${item.accent}20`,
                  }}
                >
                  {item.tag}
                </span>

                <span
                  className="text-5xl font-black leading-none select-none"
                  style={{
                    color: hovered ? `${item.accent}15` : "#0009300d",
                    fontFamily: "'Georgia', serif",
                    transition: "0.4s",
                  }}
                >
                  {item.number}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1">
              <h3
                className="text-[24px] leading-tight font-black mb-2"
                style={{
                  color: hovered ? item.accent : "#111827",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {item.title}
              </h3>

              <p
                className="text-[15px] leading-8 font-medium"
                style={{
                  color: "#64647a",
                }}
              >
                {item.desc}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Floating Dot ── */
function Dot({ style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{
        y:
          typeof window !== "undefined" && window.innerWidth < 768
            ? [0, -8, 0]
            : [0, -22, 0],
        opacity: [0.2, 0.55, 0.2],
      }}
      transition={{
        duration: style.duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: style.delay,
      }}
    />
  );
}

/* ── Main Section ── */
export default function OurAdvantages() {
  const headingRef = useRef(null);

  const headingInView = useInView(headingRef, {
    once: true,
  });

  const dots = [
    {
      top: "10%",
      left: "5%",
      width: 6,
      height: 6,
      background: "#A00300",
      opacity: 0.18,
      duration: 5,
      delay: 0,
    },
    {
      top: "20%",
      left: "94%",
      width: 4,
      height: 4,
      background: "#000930",
      opacity: 0.15,
      duration: 7,
      delay: 1,
    },
    {
      top: "50%",
      left: "2%",
      width: 5,
      height: 5,
      background: "#A00300",
      opacity: 0.12,
      duration: 6,
      delay: 2,
    },
  ];

  return (
    <section
      className="relative py-8 md:py-14 overflow-hidden font-odop [transform:translateZ(0)]"
      style={{ background: "#ffffff" }}
      id="learn-more"
    >
      {/* Texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #00093010 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(160,3,0,0.06) 0%, transparent 70%)",
        }}
      />

      {dots.map((d, i) => (
        <Dot key={i} style={d} />
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-4 mb-6"
          >
            <span className="h-px w-14 bg-red-700" />

            <span
              className="text-[12px] font-black tracking-[0.35em] uppercase"
              style={{ color: "#A00300" }}
            >
              Seller Benefits
            </span>

            <span className="h-px w-14 bg-red-700" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-none tracking-tight mb-6"
            style={{
              fontFamily: "'Georgia', serif",
              color: "#000930",
            }}
          >
            Why{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A00300, #d40400)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sell With Us
            </span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={headingInView ? { scaleX: 1 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="h-[4px] w-24 mx-auto rounded-full origin-left mb-6"
            style={{
              background: "linear-gradient(to right, #A00300, #d40400)",
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={headingInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.45,
            }}
            className="text-lg max-w-2xl mx-auto leading-9"
            style={{ color: "#64647a" }}
          >
            Everything you need to launch, grow, and thrive — built into one
            powerful platform.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {advantages.map((item, index) => (
            <AdvantageCard key={index} item={item} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 text-center"
        >
          <div
            className="inline-flex flex-wrap items-center justify-center gap-6 px-10 py-5 rounded-[26px]"
            style={{
              background: "#f7f7fb",
              border: "1.5px solid #e4e4f0",
            }}
          >
            <span
              className="text-[15px] font-semibold"
              style={{ color: "#64647a" }}
            >
              Ready to grow your business?
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                document.getElementById("verify-phone")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="px-7 py-3 rounded-2xl text-sm font-bold tracking-wide text-white"
              style={{
                background: "linear-gradient(135deg, #A00300 0%, #c50400 100%)",
                boxShadow: "0 8px 24px rgba(160,3,0,0.28)",
              }}
            >
              Register as Seller →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
