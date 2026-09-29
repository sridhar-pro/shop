"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Crown,
  LayoutDashboard,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { redirectToDashboard, DOMAIN_KEY } from "./config";

// ─── Active Plan Status ────────────────────────────────────────────────────────
function ActiveStatus({ sellerPlan, onAuthError }) {
  const [hovered, setHovered] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const planName =
    sellerPlan?.plan === "2"
      ? "Verified Plan"
      : sellerPlan?.plan === "3"
        ? "Premium Plan"
        : "Plan";

  const planAccent = sellerPlan?.plan === "2" ? "#A00300" : "#000930";
  const PlanIcon = sellerPlan?.plan === "2" ? Sparkles : Crown;

  const handleRedirect = () => {
    setRedirecting(true);
    setTimeout(() => {
      const result = redirectToDashboard();
      if (!result.ok) {
        setRedirecting(false);
        onAuthError();
      }
    }, 320);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        paddingBottom: 0,
      }}
    >
      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px 6px 10px",
          borderRadius: 999,
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          marginBottom: 28,
        }}
      >
        <CheckCircle2 size={14} color="#22c55e" strokeWidth={2.2} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {planName} · Active
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(36px, 5.5vw, 58px)",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          margin: "0 auto 16px",
          maxWidth: 600,
          textAlign: "center",
        }}
      >
        Your subscription is{" "}
        <span
          style={{
            background: "linear-gradient(90deg, #22c55e, #4ade80)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          active
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        style={{
          color: "#8892a4",
          fontSize: 16,
          margin: "0 auto 40px",
          maxWidth: 420,
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        Jump into your Seller Dashboard to manage products, track orders and
        grow your storefront.
      </motion.p>

      {/* Dashboard CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleRedirect}
        disabled={redirecting}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 40px",
          borderRadius: 16,
          border: "none",
          cursor: redirecting ? "wait" : "pointer",
          background: redirecting
            ? "rgba(255,255,255,0.7)"
            : "linear-gradient(135deg, #ffffff 0%, #f0f2f8 100%)",
          color: "#000930",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.01em",
          boxShadow:
            "0 20px 60px rgba(0,9,48,0.35), 0 0 0 1px rgba(255,255,255,0.18)",
          opacity: redirecting ? 0.8 : 1,
          transition: "opacity 0.2s, box-shadow 0.25s",
        }}
      >
        <LayoutDashboard size={18} />
        {redirecting ? "Opening Dashboard…" : "Open Seller Dashboard"}
        {!redirecting && (
          <motion.span
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            <ArrowRight size={17} strokeWidth={2.2} />
          </motion.span>
        )}
        {redirecting && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            style={{ display: "flex" }}
          >
            <RefreshCw size={16} />
          </motion.span>
        )}
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        style={{ color: "#3e4a5e", fontSize: 12, marginTop: 12 }}
      >
        No extra login required
      </motion.p>
    </div>
  );
}

// ─── Pending Payment Status ────────────────────────────────────────────────────
function PendingStatus({ sellerPlan, cardsRef }) {
  const planName = sellerPlan?.plan === "2" ? "Verified Plan" : "Premium Plan";
  const planAccent = sellerPlan?.plan === "2" ? "#A00300" : "#000930";

  const scrollToCard = () => {
    cardsRef?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Status pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px 6px 10px",
          borderRadius: 999,
          background: "rgba(240,165,0,0.1)",
          border: "1px solid rgba(240,165,0,0.3)",
          marginBottom: 28,
        }}
      >
        <Clock size={14} color="#f0a500" strokeWidth={2} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#f0a500",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          Payment Pending
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(34px, 5.5vw, 56px)",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          margin: "0 auto 16px",
          maxWidth: 580,
          textAlign: "center",
        }}
      >
        One step to activate{" "}
        <span
          style={{
            background: "linear-gradient(90deg, #f0a500, #f0c040)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          your {planName}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        style={{
          color: "#8892a4",
          fontSize: 16,
          margin: "0 auto 40px",
          maxWidth: 420,
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        Your plan selection is saved. Complete payment below to unlock dashboard
        access and all plan features.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={scrollToCard}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 40px",
          borderRadius: 16,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #c98000, #f0a500)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.01em",
          boxShadow: "0 16px 48px rgba(240,165,0,0.35)",
        }}
      >
        <ArrowRight
          size={17}
          strokeWidth={2.2}
          style={{ transform: "rotate(90deg)" }}
        />
        Complete Payment Below
      </motion.button>
    </div>
  );
}

// ─── Upgrade / Free Plan Status ────────────────────────────────────────────────
function UpgradeStatus({ cardsRef, onAuthError }) {
  const [redirecting, setRedirecting] = useState(false);

  const scrollToPlans = () => {
    cardsRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDashboard = () => {
    setRedirecting(true);
    setTimeout(() => {
      const result = redirectToDashboard();
      if (!result.ok) {
        setRedirecting(false);
        onAuthError();
      }
    }, 320);
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {/* Free plan badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 16px 6px 10px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.14)",
          marginBottom: 28,
        }}
      >
        <Zap size={13} color="#8892a4" strokeWidth={2} />
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#8892a4",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Basic Plan · Free
        </span>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(34px, 5.5vw, 58px)",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          margin: "0 auto 16px",
          maxWidth: 640,
          textAlign: "center",
        }}
      >
        Scale your store{" "}
        <span
          style={{
            background: "linear-gradient(90deg, #e05050, #A00300)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          with the right plan
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        style={{
          color: "#8892a4",
          fontSize: 16,
          margin: "0 auto 16px",
          maxWidth: 460,
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        You're on the Free plan. Upgrade to unlock B2B listing, ONDC,
        international shipping and more.
      </motion.p>

      {/* Upgrade feature chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {[
          "B2B Listing",
          "ONDC",
          "25+ Products",
          "Expo Access",
          "Intl. Shipping",
        ].map((feat) => (
          <span
            key={feat}
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              color: "#c8cde0",
              padding: "4px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              letterSpacing: "0.01em",
            }}
          >
            {feat}
          </span>
        ))}
      </motion.div>

      {/* CTA row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38 }}
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Primary: View Plans */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={scrollToPlans}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "15px 34px",
            borderRadius: 14,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg, #A00300 0%, #c43030 100%)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em",
            boxShadow: "0 16px 48px rgba(160,3,0,0.4)",
          }}
        >
          <Sparkles size={15} />
          View Plans
          <ArrowRight size={15} strokeWidth={2.5} />
        </motion.button>

        {/* Secondary: Dashboard */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDashboard}
          disabled={redirecting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            padding: "15px 28px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#c8cde0",
            fontSize: 15,
            fontWeight: 500,
            cursor: redirecting ? "wait" : "pointer",
            opacity: redirecting ? 0.7 : 1,
            transition: "background 0.2s, opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!redirecting)
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          }}
        >
          {redirecting ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                style={{ display: "flex" }}
              >
                <RefreshCw size={14} />
              </motion.span>
              Opening…
            </>
          ) : (
            <>
              <LayoutDashboard size={14} />
              Go to Dashboard
              <ArrowRight size={14} strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Divider hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 36,
          color: "#3a4255",
          fontSize: 12,
        }}
      >
        <div
          style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)" }}
        />
        <TrendingUp size={11} color="#3a4255" />
        <span>Compare plans below</span>
        <div
          style={{ width: 40, height: 1, background: "rgba(255,255,255,0.08)" }}
        />
      </motion.div>
    </div>
  );
}

// ─── New Visitor Status ────────────────────────────────────────────────────────
function NewStatus({ cardsRef }) {
  const scrollToPlans = () => {
    cardsRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 14px",
          borderRadius: 20,
          border: "1px solid rgba(160,3,0,0.35)",
          background: "rgba(160,3,0,0.1)",
          marginBottom: 28,
        }}
      >
        <Sparkles size={12} color="#e05050" />
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: "#e05050",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Seller Plans
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(36px, 6vw, 58px)",
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          margin: "0 auto 16px",
          maxWidth: 640,
          textAlign: "center",
        }}
      >
        Grow your business{" "}
        <span
          style={{
            background: "linear-gradient(90deg, #e05050, #A00300)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          the right way
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22 }}
        style={{
          fontSize: 16,
          color: "#8892a4",
          maxWidth: 440,
          margin: "0 auto 40px",
          lineHeight: 1.65,
          textAlign: "center",
        }}
      >
        Choose a plan that fits your scale. Upgrade or cancel at any time — no
        hidden fees.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={scrollToPlans}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          padding: "15px 34px",
          borderRadius: 14,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg, #A00300 0%, #c43030 100%)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.02em",
          boxShadow: "0 16px 48px rgba(160,3,0,0.4)",
        }}
      >
        <Sparkles size={15} />
        See All Plans
        <ArrowRight size={15} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}

// ─── StatusHero — unified entry point ─────────────────────────────────────────
export default function StatusHero({
  status,
  sellerPlan,
  cardsRef,
  onAuthError,
}) {
  return (
    <div
      style={{
        background:
          "linear-gradient(160deg, #08091e 0%, #000930 55%, #130008 100%)",
        padding: "80px 24px 100px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 320,
          borderRadius: "50%",
          background:
            status === "active"
              ? "radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)"
              : status === "pending_payment"
                ? "radial-gradient(ellipse, rgba(240,165,0,0.1) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(160,3,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "background 0.8s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "15%",
          width: 360,
          height: 220,
          background:
            "radial-gradient(ellipse, rgba(0,9,48,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: "10%",
          width: 280,
          height: 180,
          background:
            "radial-gradient(ellipse, rgba(160,3,0,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {status === "active" && (
          <ActiveStatus sellerPlan={sellerPlan} onAuthError={onAuthError} />
        )}
        {status === "pending_payment" && (
          <PendingStatus sellerPlan={sellerPlan} cardsRef={cardsRef} />
        )}
        {status === "upgrade" && (
          <UpgradeStatus cardsRef={cardsRef} onAuthError={onAuthError} />
        )}
        {status === "new" && <NewStatus cardsRef={cardsRef} />}
      </div>

      {/* Decorative bottom fade into card section */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background:
            "linear-gradient(to bottom, transparent, rgba(250,249,247,0.06))",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
