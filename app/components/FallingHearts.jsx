"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const HEARTS_COUNT = 28;

export default function FallingHearts() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // ⏳ Start animation AFTER first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hearts = useMemo(() => {
    return Array.from({ length: HEARTS_COUNT }).map((_, i) => {
      const depth = Math.random();

      return {
        id: i,
        left: Math.random() * 100,
        size: 10 + depth * 26,
        duration: 7 + Math.random() * 6 + (1 - depth) * 6,
        delay: Math.random() * 0.6,
        repeatDelay: Math.random() * 0.6,
        sway: 12 + Math.random() * 30,
        opacity: 0.25 + depth * 0.6,
        z: -400 + depth * 400,
        rotateX: -30 + Math.random() * 60,
        rotateZ: -20 + Math.random() * 40,
        blur: (1 - depth) * 2,
      };
    });
  }, []);

  if (!mounted || shouldReduceMotion) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {hearts.map((heart, index) => (
        <motion.div
          key={heart.id}
          className="absolute top-[-15%]"
          style={{
            left: `${heart.left}%`,
            transformStyle: "preserve-3d",
            willChange: "transform, opacity",
          }}
          initial={{
            y: "-15vh",
            opacity: 0,
            scale: 0.9,
            rotateX: heart.rotateX,
            rotateZ: heart.rotateZ,
            z: heart.z,
          }}
          animate={{
            y: ["-15vh", "80vh", "100vh"],
            x: [0, heart.sway * 0.6, 0],
            rotateX: [heart.rotateX, heart.rotateX + 10, heart.rotateX],
            rotateZ: [heart.rotateZ, heart.rotateZ + 8, heart.rotateZ],
            scale: [0.9, 1, 0.9],
            opacity: [0, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay + index * 0.02, // 🎯 soft stagger
            repeat: Infinity,
            repeatDelay: heart.repeatDelay,
            ease: ["easeOut", "linear", "linear"],
            times: [0, 0.82, 1],
          }}
        >
          <Heart
            size={heart.size}
            fill="currentColor"
            className="text-[#A00300]"
            style={{
              filter: `blur(${heart.blur}px)`,
              willChange: "transform",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
