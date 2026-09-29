"use client";

import { Zap, Sparkles, Crown } from "lucide-react";

// ─── Domain ────────────────────────────────────────────────────────────────────
export const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

// ─── Redirect helper ───────────────────────────────────────────────────────────
export function redirectToDashboard() {
  const token = localStorage.getItem("access_token");
  if (token) {
    window.location.href = `https://marketplace.${DOMAIN_KEY}.com/Oauth/tLogin/${token}`;
    return { ok: true };
  }
  return { ok: false };
}

// ─── Derive status from sellerPlan ─────────────────────────────────────────────
export function getSellerStatus(sellerPlan) {
  if (!sellerPlan) return "new";
  const planNum = parseInt(sellerPlan.plan);
  const paid = sellerPlan.payment_id && sellerPlan.payment_id !== "0";

  if ((planNum === 2 || planNum === 3) && paid) return "active";
  if ((planNum === 2 || planNum === 3) && !paid) return "pending_payment";
  if (planNum === 1) return "upgrade";
  return "new";
}

// ─── Plan data ─────────────────────────────────────────────────────────────────
export const plans = [
  {
    id: 1,
    name: "Basic Plan",
    tag: "Free Forever",
    tagIcon: <Zap size={11} />,
    price: "Free",
    priceSuffix: null,
    accent: "#000930",
    featured: false,
    Icon: Zap,
    cta: "Get Started Free",
    features: [
      { text: "Upload up to 5 Products", available: true },
      { text: "B2B Listing", available: false },
      { text: "Dedicated Page", available: false },
      { text: "ONDC Listing", available: false },
      { text: "International Shipping", available: false },
      { text: "Expo Access", available: false },
      { text: "Billing & Sales Software", available: false },
      { text: "Dedicated Support for a Month", available: true },
    ],
  },
  {
    id: 2,
    name: "Verified Plan",
    tag: "Most Popular",
    tagIcon: <Sparkles size={11} />,
    price: "₹2,900",
    priceSuffix: "/ year",
    accent: "#A00300",
    featured: true,
    Icon: Sparkles,
    cta: "Subscribe Now",
    features: [
      { text: "Upload up to 25 Products", available: true },
      { text: "B2B Listing (10 Products)", available: true },
      { text: "Dedicated Page", available: false },
      { text: "ONDC Listing", available: false },
      { text: "International Shipping (5 Countries)", available: true },
      { text: "2 Expo (Discounted)", available: true },
      { text: "Billing & Sales Software", available: true },
      { text: "Dedicated Support for 3 Months", available: true },
    ],
  },
  {
    id: 3,
    name: "Premium Plan",
    tag: "Best Value",
    tagIcon: <Crown size={11} />,
    price: "₹9,900",
    priceSuffix: "/ year",
    accent: "#000930",
    featured: false,
    Icon: Crown,
    cta: "Go Premium",
    features: [
      { text: "Unlimited Products", available: true },
      { text: "B2B Listing (25 Products)", available: true },
      { text: "Dedicated Page", available: true },
      { text: "ONDC Listing", available: true },
      { text: "International Shipping (5 Countries)", available: true },
      { text: "5 Expo (Discounted)", available: true },
      { text: "Billing & Sales Software", available: true },
      { text: "Dedicated Support for a Year", available: true },
    ],
  },
];

// ─── Trust bar items ───────────────────────────────────────────────────────────
export { Shield, RefreshCw, HeadphonesIcon } from "lucide-react";
export const trustItems = [
  { label: "Secure Payments", sub: "Razorpay encrypted" },
  { label: "Instant Activation", sub: "Start using benefits immediately" },
  { label: "Dedicated Support", sub: "Real humans, fast" },
];
