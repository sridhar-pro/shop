"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

// ─── Feature Row ──────────────────────────────────────────────────────────────
export function FeatureRow({ text, available, accent, delay }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom: "11px",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 1,
          background: available
            ? accent === "#A00300"
              ? "#fff0f0"
              : "#eef0f8"
            : "#f2f2f2",
        }}
      >
        {available ? (
          <Check size={10} strokeWidth={2.8} color={accent} />
        ) : (
          <X size={10} strokeWidth={2.5} color="#c0c4cc" />
        )}
      </span>
      <span
        style={{
          fontSize: 13.5,
          lineHeight: 1.45,
          color: available ? "#1a1e2e" : "#9fa6b3",
          fontWeight: available ? 450 : 400,
          letterSpacing: "0.01em",
        }}
      >
        {text}
      </span>
    </motion.li>
  );
}
