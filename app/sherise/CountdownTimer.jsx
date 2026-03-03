"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const getTargetDate = () => {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Feb 26, 6:30 PM (18:30)
  const target = new Date(currentYear, 1, 26, 18, 30, 0);
  // Month index: 1 = February

  // If already passed, target next year
  if (now > target) {
    return new Date(currentYear + 1, 1, 26, 18, 30, 0);
  }

  return target;
};

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    Days: 0,
    Hours: 0,
    Minutes: 0,
    Seconds: 0,
  });

  useEffect(() => {
    const targetDate = getTargetDate();

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        Days: days,
        Hours: hours,
        Minutes: minutes,
        Seconds: seconds,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative z-10 px-6 py-16 md:px-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#A00300] to-[#000940] rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h3
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sale Starts In
            </h3>
            <p className="text-white/80 text-lg">
              Don’t miss out on incredible deals!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <motion.div
                key={unit}
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 md:p-6 shadow-xl text-center"
              >
                <motion.div
                  key={value}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-6xl font-bold text-[#A00300] mb-2"
                >
                  {value.toString().padStart(2, "0")}
                </motion.div>

                <div className="text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  {unit}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
