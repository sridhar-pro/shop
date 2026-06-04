"use client";

import { useRef, useState } from "react";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";

import {
  UserPlus,
  LogIn,
  CreditCard,
  PackagePlus,
  BadgeCheck,
  LayoutDashboard,
} from "lucide-react";

const registrationSteps = [
  {
    title: "Registration",
    desc: 'Register as a "Seller" through the website to begin your journey on the Yuukke Marketplace.',
    icon: UserPlus,
    position: "right",
    step: "01",
  },
  {
    title: "Login",
    desc: "Use your email credentials to log in to your seller account.",
    icon: LogIn,
    position: "left",
    step: "02",
  },
  {
    title: "Setup Payment Gateway",
    desc: "Setup your payment gateway with your bank account details to receive payments seamlessly.",
    icon: CreditCard,
    position: "right",
    step: "03",
  },
  {
    title: "Add Products",
    desc: "Upload your product or service details with images, descriptions, and pricing.",
    icon: PackagePlus,
    position: "left",
    step: "04",
  },
  {
    title: "Approval",
    desc: "Your submitted products are reviewed and approved by the Marketplace Admin team.",
    icon: BadgeCheck,
    position: "right",
    step: "05",
  },
  {
    title: "Homepage Listing",
    desc: "Approved products go live on the Marketplace Homepage — visible to thousands of buyers!",
    icon: LayoutDashboard,
    position: "left",
    step: "06",
  },
];

/* ─────────────────────────────────────────
   Scroll-driven timeline line
───────────────────────────────────────── */
function TimelineLine({ containerRef }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 30%"],
  });

  const rawHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const height = useSpring(rawHeight, {
    stiffness: 50,
    damping: 18,
  });

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 hidden md:block"
      style={{ width: 3 }}
    >
      {/* Track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "#ececf4" }}
      />

      {/* Fill */}
      <motion.div
        className="absolute top-0 left-0 w-full rounded-full"
        style={{
          height,
          background: "linear-gradient(to bottom, #A00300, #ff2a27)",
          boxShadow: "0 0 14px 2px rgba(160,3,0,0.35)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Center node icon
───────────────────────────────────────── */
function NodeIcon({ step, index, inView, isActive, isPast }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.07 + 0.1,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className="relative flex items-center justify-center"
      style={{ width: 90, height: 90 }}
    >
      {/* Pulse */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: [1, 1.45, 1],
            opacity: [0.55, 0, 0.55],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
          }}
          style={{
            border: "2px solid #A00300",
          }}
        />
      )}

      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: isActive
            ? "0 0 0 8px rgba(160,3,0,0.12), 0 10px 35px rgba(160,3,0,0.28)"
            : isPast
              ? "0 6px 20px rgba(160,3,0,0.18)"
              : "0 4px 16px rgba(0,9,48,0.08)",
        }}
      />

      {/* Circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full z-10"
        animate={{
          background:
            isActive || isPast
              ? "linear-gradient(135deg, #A00300 0%, #d40400 100%)"
              : "#ffffff",
          borderColor: isActive || isPast ? "#A00300" : "#dde0f0",
        }}
        transition={{ duration: 0.3 }}
        style={{
          width: 82,
          height: 82,
          border: "2.5px solid",
        }}
      >
        <Icon
          size={38}
          strokeWidth={2.3}
          style={{
            color: isActive || isPast ? "#ffffff" : "#A00300",
          }}
        />
      </motion.div>

      {/* Step badge */}
      <motion.div
        className="absolute -bottom-2 -right-1 flex items-center justify-center rounded-full text-white font-black"
        animate={{
          background: isActive || isPast ? "#A00300" : "#000930",
        }}
        transition={{ duration: 0.3 }}
        style={{
          width: 26,
          height: 26,
          fontSize: 11,
          fontFamily: "'Georgia', serif",
          zIndex: 20,
        }}
      >
        {index + 1}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Card
───────────────────────────────────────── */
function Card({ step, index, isActive, isPast, align, onEnter, onLeave }) {
  return (
    <motion.div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-3xl cursor-default w-full"
      style={{
        background: isActive ? "#ffffff" : isPast ? "#fffafa" : "#fafafa",

        border: `2px solid ${
          isActive ? "#A00300" : isPast ? "#f5cece" : "#e8e8f0"
        }`,

        boxShadow: isActive
          ? "0 20px 50px rgba(160,3,0,0.13), 0 4px 12px rgba(0,0,0,0.06)"
          : isPast
            ? "0 4px 18px rgba(160,3,0,0.08)"
            : "0 2px 14px rgba(0,9,48,0.05)",

        transition: "border-color 0.35s, box-shadow 0.35s, background 0.35s",
      }}
    >
      {/* Top accent */}
      <motion.div
        className="absolute top-0 left-0 h-[4px] rounded-t-3xl"
        animate={{
          width: isActive ? "100%" : isPast ? "55%" : "0%",
        }}
        transition={{ duration: 0.4 }}
        style={{
          background: "linear-gradient(to right, #A00300, #d40400aa)",
        }}
      />

      <div
        className={`px-8 py-8 ${
          align === "right" ? "text-right" : "text-left"
        }`}
      >
        {/* Step pill */}
        <div
          className={`flex items-center gap-2 mb-4 ${
            align === "right" ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className="text-[11px] font-black tracking-[0.22em] uppercase px-4 py-1.5 rounded-full"
            style={{
              color: isActive || isPast ? "#A00300" : "#8888a8",

              background: isActive || isPast ? "#A0030012" : "#f2f2f8",

              border: `1.5px solid ${
                isActive || isPast ? "#A0030030" : "#e4e4f2"
              }`,
            }}
          >
            Step {step.step}
          </span>

          <AnimatePresence>
            {isPast && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="text-[11px] font-bold"
                style={{ color: "#A00300" }}
              >
                ✓
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Title */}
        <h3
          className="font-black mb-4 leading-snug"
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "1.5rem",
            color: isActive ? "#A00300" : "#000930",
          }}
        >
          {step.title}
        </h3>

        {/* Description */}
        <p
          className="leading-relaxed"
          style={{
            fontSize: "1rem",
            color: "#55556e",
            lineHeight: 1.85,
          }}
        >
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Single step row
───────────────────────────────────────── */
function StepRow({ step, index, totalSteps, activeStep, setActiveStep }) {
  const ref = useRef(null);

  const inView = useInView(ref, {
    once: true,
    margin: "-60px",
  });

  const isRight = step.position === "right";

  const isActive = activeStep === index;

  const isPast = activeStep !== null && activeStep > index;

  return (
    <div
      ref={ref}
      className="relative flex items-center w-full"
      style={{ minHeight: 140 }}
    >
      {/* Desktop */}
      <div className="hidden md:flex w-full items-center">
        {/* Left */}
        <div className="flex-1 flex justify-end pr-12">
          {!isRight ? (
            <motion.div
              className="w-full max-w-[390px]"
              initial={{ opacity: 0, x: -60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: index * 0.08,
              }}
            >
              <Card
                step={step}
                index={index}
                isActive={isActive}
                isPast={isPast}
                align="right"
                onEnter={() => setActiveStep(index)}
                onLeave={() => setActiveStep(null)}
              />
            </motion.div>
          ) : (
            <div className="flex items-center justify-end gap-2 w-full">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-px rounded-full"
                  style={{
                    width: 22,
                    background: isPast ? "#A00300" : "#dde0f0",
                    opacity: 1 - i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Node */}
        <div
          className="flex-shrink-0 flex justify-center"
          style={{ width: 110 }}
        >
          <NodeIcon
            step={step}
            index={index}
            inView={inView}
            isActive={isActive}
            isPast={isPast}
          />
        </div>

        {/* Right */}
        <div className="flex-1 flex justify-start pl-12">
          {isRight ? (
            <motion.div
              className="w-full max-w-[390px]"
              initial={{ opacity: 0, x: 60 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.65,
                delay: index * 0.08,
              }}
            >
              <Card
                step={step}
                index={index}
                isActive={isActive}
                isPast={isPast}
                align="left"
                onEnter={() => setActiveStep(index)}
                onLeave={() => setActiveStep(null)}
              />
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-px rounded-full"
                  style={{
                    width: 22,
                    background: isPast ? "#A00300" : "#dde0f0",
                    opacity: 1 - i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden w-full items-start gap-5">
        <div className="flex flex-col items-center flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              duration: 0.45,
              delay: index * 0.07,
            }}
            className="rounded-full flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              background:
                isPast || isActive
                  ? "linear-gradient(135deg,#A00300,#c50400)"
                  : "#fff",

              border: `2.5px solid ${
                isPast || isActive ? "#A00300" : "#dde0f0"
              }`,
            }}
          >
            <step.icon
              size={30}
              strokeWidth={2.2}
              style={{
                color: isPast || isActive ? "#fff" : "#A00300",
              }}
            />
          </motion.div>

          {index < totalSteps - 1 && (
            <div
              style={{
                width: 2,
                flex: 1,
                minHeight: 40,
                marginTop: 6,
                background: isPast ? "#A00300" : "#e8e8f4",
                borderRadius: 2,
              }}
            />
          )}
        </div>

        <motion.div
          className="flex-1 pb-8"
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.55,
            delay: index * 0.07,
          }}
        >
          <Card
            step={step}
            index={index}
            isActive={isActive}
            isPast={isPast}
            align="left"
            onEnter={() => setActiveStep(index)}
            onLeave={() => setActiveStep(null)}
          />
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main export
───────────────────────────────────────── */
export default function RegistrationSection() {
  const headingRef = useRef(null);

  const containerRef = useRef(null);

  const headingInView = useInView(headingRef, { once: true });

  const [activeStep, setActiveStep] = useState(null);

  return (
    <section
      className="relative  py-8 md:py-14  overflow-hidden"
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

      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 300,
          background:
            "radial-gradient(ellipse, rgba(160,3,0,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-5"
          >
            <span className="h-px w-12" style={{ background: "#A00300" }} />

            <span
              className="font-black uppercase tracking-[0.35em]"
              style={{
                fontSize: 11,
                color: "#A00300",
              }}
            >
              How It Works
            </span>

            <span className="h-px w-12" style={{ background: "#A00300" }} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.1,
            }}
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              fontWeight: 900,
              color: "#000930",
              lineHeight: 1,
              marginBottom: "1.25rem",
              textTransform: "uppercase",
            }}
          >
            Registration{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A00300, #d40400)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Process
            </span>
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={headingInView ? { scaleX: 1 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            style={{
              height: 4,
              width: 80,
              background: "linear-gradient(to right, #A00300, #d40400)",
              borderRadius: 99,
              margin: "0 auto 1.5rem",
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={headingInView ? { opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.45,
            }}
            style={{
              fontSize: "1.05rem",
              maxWidth: 460,
              margin: "0 auto",
              lineHeight: 1.8,
              color: "#666680",
            }}
          >
            Six simple steps to get your products live on the Yuukke
            Marketplace.
          </motion.p>
        </div>

        {/* Timeline */}
        <div ref={containerRef} className="relative">
          <TimelineLine containerRef={containerRef} />

          <div className="flex flex-col gap-12 md:gap-16">
            {registrationSteps.map((step, index) => (
              <StepRow
                key={index}
                step={step}
                index={index}
                totalSteps={registrationSteps.length}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
