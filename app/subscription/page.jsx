"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { plans, getSellerStatus } from "./config";
import StatusHero from "./StatusHero";
import PlanCard from "./PlanCard";
import TrustBar from "./TrustBar";
import AuthErrorToast from "./AuthErrorToast";

export default function SubscriptionPage() {
  const [sellerPlan, setSellerPlan] = useState(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const cardsRef = useRef(null);

  // Load seller plan from localStorage
  useEffect(() => {
    const data = localStorage.getItem("seller_plan");
    if (data) setSellerPlan(JSON.parse(data));
  }, []);

  // Load fonts once
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;450;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const status = getSellerStatus(sellerPlan);
  const pendingPlanId =
    status === "pending_payment" ? parseInt(sellerPlan?.plan) : null;

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#FAF9F7",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* Unified status-aware hero */}
      <StatusHero
        status={status}
        sellerPlan={sellerPlan}
        cardsRef={cardsRef}
        onAuthError={() => setShowAuthError(true)}
      />

      {/* Plan cards */}
      <div
        ref={cardsRef}
        data-plans
        style={{
          maxWidth: 1060,
          margin: "-40px auto 0",
          padding: "0 20px 80px",
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            sellerPlan={sellerPlan}
            sellerStatus={status}
            index={i}
            onAuthError={() => setShowAuthError(true)}
            isPendingTarget={pendingPlanId === plan.id}
          />
        ))}
      </div>

      {/* Trust bar */}
      <TrustBar />

      {/* Auth error toast */}
      <AnimatePresence>
        {showAuthError && (
          <AuthErrorToast onDismiss={() => setShowAuthError(false)} />
        )}
      </AnimatePresence>

      <style>{`
  @media (max-width: 820px) {
    div[data-plans] {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 16px !important;
    }
  }
`}</style>
    </div>
  );
}
