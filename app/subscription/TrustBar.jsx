"use client";

import { motion } from "framer-motion";
import { Shield, RefreshCw, HeadphonesIcon } from "lucide-react";

const trustItems = [
  { Icon: Shield, label: "Secure Payments", sub: "Razorpay encrypted" },
  {
    Icon: RefreshCw,
    label: "Instant Activation",
    sub: "Start using benefits immediately",
  },
  {
    Icon: HeadphonesIcon,
    label: "Dedicated Support",
    sub: "Real humans, fast",
  },
];

export default function TrustBar() {
  return (
    <div
      style={{
        borderTop: "1px solid #e8eaf2",
        background: "#ffffff",
        padding: "32px 18px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          gap: 18,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {trustItems.map(({ Icon, label, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: "1 1 180px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#f0f1f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={16} color="#000930" strokeWidth={1.8} />
            </div>

            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1a1e2e",
                  margin: 0,
                }}
              >
                {label}
              </p>

              <p
                style={{
                  fontSize: 11.5,
                  color: "#8892a4",
                  margin: "2px 0 0",
                  lineHeight: 1.45,
                }}
              >
                {sub}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .trust-item {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
