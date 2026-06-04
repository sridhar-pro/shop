"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "What can I sell on Yuukke Marketplace?",
    answer:
      "You can sell handmade, vintage, craft supplies, antiques, collectibles, art, clothing, accessories — anything except prohibited items we outline in our policies.",
  },
  {
    question: "How long does seller approval take?",
    answer:
      "After signing up, seller accounts are typically approved within 1 business day as long as all requirements are met. We'll notify you via email once approved.",
  },
  {
    question: "How do I get paid for my sales?",
    answer:
      "You can choose to get paid either through direct bank deposit. Funds are disbursed on a weekly basis once the buyer receives the order.",
  },
  {
    question: "What are Yuukke's seller policies?",
    answer:
      "We encourage reviewing our seller policies before signing up. Key policies cover prohibited items, returns, shipping, fees, quality standards, and more.",
  },
  {
    question: "Do you provide shipping services?",
    answer:
      "Yuukke has negotiated discounted pricing from popular shipping companies, which you can avail directly from your seller account.",
  },
  {
    question: "What marketing tools do you offer?",
    answer:
      "We provide seller education, email marketing, social promotions, ad credits, and more! Check our seller benefits list for full details.",
  },
  {
    question: "How can I get help if I have questions?",
    answer:
      "Our seller support team is available 7 days a week via live chat, email, phone, and social media to assist you with anything you need.",
  },
];

/* ── Single FAQ item ── */
function FAQItem({ item, index, isOpen, onToggle, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative"
    >
      {/* Left accent line — animated on open */}
      <motion.div
        className="absolute left-0 top-0 w-[3px] rounded-full"
        animate={{
          height: isOpen ? "100%" : "0%",
          background: "linear-gradient(to bottom, #A00300, #d40400aa)",
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ borderRadius: 99 }}
      />

      <div
        className="rounded-2xl overflow-hidden transition-all duration-350"
        style={{
          background: isOpen ? "#ffffff" : "#fafafa",
          border: `1.5px solid ${isOpen ? "#A0030030" : "#e8e8f2"}`,
          boxShadow: isOpen
            ? "0 12px 36px rgba(160,3,0,0.09), 0 2px 8px rgba(0,0,0,0.04)"
            : "0 2px 10px rgba(0,9,48,0.04)",
          transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
        }}
      >
        {/* Question row */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-5 text-left transition-colors duration-200"
          style={{ padding: "1.4rem 1.75rem" }}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Number badge */}
            <motion.span
              animate={{
                background: isOpen
                  ? "linear-gradient(135deg, #A00300, #d40400)"
                  : "#f0f0f8",
                color: isOpen ? "#ffffff" : "#8888a8",
                boxShadow: isOpen ? "0 4px 14px rgba(160,3,0,0.30)" : "none",
              }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0 flex items-center justify-center rounded-full font-black"
              style={{
                width: 34,
                height: 34,
                fontSize: "0.78rem",
                fontFamily: "'Georgia', serif",
                border: isOpen ? "none" : "1.5px solid #e0e0f0",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </motion.span>

            {/* Question text */}
            <span
              className="font-bold leading-snug"
              style={{
                fontSize: "1rem",
                color: isOpen ? "#000930" : "#2a2a40",
                fontFamily: "'Georgia', serif",
                transition: "color 0.25s",
              }}
            >
              {item.question}
            </span>
          </div>

          {/* Toggle icon */}
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 flex items-center justify-center rounded-full"
            style={{
              width: 32,
              height: 32,
              background: isOpen ? "#A00300" : "#f0f0f8",
              border: isOpen ? "none" : "1.5px solid #e0e0f0",
              transition: "background 0.3s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M1 7h12"
                stroke={isOpen ? "#ffffff" : "#8888a8"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="flex gap-4"
                style={{
                  padding: "0 1.75rem 1.5rem 1.75rem",
                  paddingLeft: "calc(1.75rem + 34px + 1rem)",
                }}
              >
                {/* Answer accent bar */}
                <div
                  className="flex-shrink-0 w-px self-stretch rounded-full"
                  style={{
                    background:
                      "linear-gradient(to bottom, #A0030040, transparent)",
                  }}
                />
                <motion.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  style={{
                    fontSize: "0.95rem",
                    color: "#55556e",
                    lineHeight: 1.8,
                    paddingLeft: "0.75rem",
                  }}
                >
                  {item.answer}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Main export ── */
export default function FAQ() {
  const headingRef = useRef(null);
  const listRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true });
  const listInView = useInView(listRef, { once: true, margin: "-40px" });
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      className="relative py-8 md:py-14 overflow-hidden"
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

      {/* Top red glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 280,
          background:
            "radial-gradient(ellipse, rgba(160,3,0,0.055) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12">
        {/* ── Heading ── */}
        <div ref={headingRef} className="text-center mb-16">
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
              Got Questions?
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
            Frequently{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #A00300, #d40400)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Asked
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
              margin: "0 auto 1.5rem",
              transformOrigin: "left",
            }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={headingInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{
              fontSize: "1rem",
              color: "#66667a",
              maxWidth: 420,
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Everything you need to know before registering as a Yuukke seller.
          </motion.p>
        </div>

        {/* ── FAQ list ── */}
        <div ref={listRef} className="flex flex-col gap-3.5">
          {faqs.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
              inView={listInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
