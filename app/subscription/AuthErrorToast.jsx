"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export default function AuthErrorToast({ onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.28 }}
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#1a0a0a",
        border: "1px solid #A0030055",
        borderRadius: 14,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(160,3,0,0.25)",
        minWidth: 320,
        maxWidth: "90vw",
      }}
    >
      <AlertCircle
        size={18}
        color="#e05050"
        strokeWidth={2}
        style={{ flexShrink: 0 }}
      />
      <div style={{ flex: 1 }}>
        <p
          style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "#fff" }}
        >
          Session not found
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#8892a4" }}>
          Please log in again to access your Seller Dashboard.
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#8892a4",
          padding: 4,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
