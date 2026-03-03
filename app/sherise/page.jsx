"use client";
import React from "react";
import { motion } from "framer-motion";
import SliderSection from "./SliderSection";
import CountdownTimer from "./CountdownTimer";
import SherisexHero from "./SherisexHero";
import Features from "./Features";
import AboutSection from "./AboutSection";
import EnquiryForm from "./Form";
import BlogSection from "./Blog";
import AgendaSection from "./AgendaSection";

export default function SherisexLanding() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const floatAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50 overflow-hidden font-odop">
      {/* Slider */}
      {/* <SliderSection /> */}

      {/* Hero */}
      <SherisexHero
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        floatAnimation={floatAnimation}
      />

      {/* <AgendaSection /> */}
      {/* Countdown */}
      {/* <CountdownTimer /> */}

      <AboutSection />
      <Features />
      <EnquiryForm />
      <BlogSection />
    </div>
  );
}
