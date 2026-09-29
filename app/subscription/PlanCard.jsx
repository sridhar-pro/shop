"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Check,
  ArrowRight,
  LayoutDashboard,
  RefreshCw,
  LogIn,
  Clock,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";
import { FeatureRow } from "./PlanCardParts";
import { redirectToDashboard, DOMAIN_KEY } from "./config";

import { useRouter } from "next/navigation";

export default function PlanCard({
  plan,
  sellerStatus,
  sellerPlan,
  index,
  onAuthError,
  isPendingTarget,
}) {
  const {
    id,
    name,
    tag,
    tagIcon,
    price,
    priceSuffix,
    accent,
    featured,
    cta,
    features,
  } = plan;

  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const router = useRouter();

  const { getValidToken } = useAuth();

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const currentPlanNum = Number(sellerPlan?.plan ?? 0);
  const paymentId = String(sellerPlan?.payment_id ?? "0");

  const isCurrentPlan = currentPlanNum === id;

  const hasPendingPlan = [2, 3].includes(currentPlanNum) && paymentId === "0";

  const isPendingPayment = isCurrentPlan && hasPendingPlan;

  const isPaid = paymentId !== "0";

  const isActivePlan = isCurrentPlan && isPaid;

  const isUpgradePath =
    sellerStatus === "upgrade" && !hasPendingPlan && !isCurrentPlan && id > 1;

  const isLocked = hasPendingPlan && !isPendingPayment;

  useEffect(() => {
    if (isPendingTarget && ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [isPendingTarget]);

  // ── Razorpay loader ──────────────────────────────────────────────────────
  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });

  // ── Payment handler ──────────────────────────────────────────────────────
  const handlePayment = async (paymentInfo, sellerId, email, phone) => {
    try {
      await loadRazorpay();

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_lclCyKLWqjYCIJ",
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        name: "Yuukke Seller Upgrade",
        description: `Upgrade to ${name}`,
        order_id: paymentInfo.order_id,
        prefill: { email, contact: phone },

        handler: async (response) => {
          try {
            const token = await getValidToken();
            const res = await fetch("/api/update_paymentseller", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: sellerId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const data = await res.json();

            if (data.status === "success") {
              toast.success("Plan upgraded 🎉");
              localStorage.setItem(
                "seller_plan",
                JSON.stringify({
                  user_id: sellerPlan.user_id,
                  plan: String(id),
                  payment_id: response.razorpay_payment_id,
                }),
              );
              setTimeout(() => {
                redirectToDashboard();
              }, 800);
            } else {
              toast.error(data.message || "Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Something went wrong after payment");
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },

        theme: { color: accent },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      toast.error("Unable to load payment");
    }
  };

  // ── Upgrade API ──────────────────────────────────────────────────────────
  const handleUpgradeApi = async () => {
    setLoading(true);
    try {
      const token = await getValidToken();
      const payload = {
        user_id: sellerPlan?.user_id || localStorage.getItem("user_id"),
        business_type: id,
      };
      const res = await fetch("/api/seller_plan_update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setApiResponse(data);

      if (data.status === "success" && data.data?.paymentInfo) {
        await handlePayment(
          data.data.paymentInfo,
          data.id,
          data.data.email,
          data.data.phone,
        );
      } else {
        toast.error(data.message || "Unable to create payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upgrade failed");
      setApiResponse({ _fetchError: true, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── CTA handler ──────────────────────────────────────────────────────────
  const handleCta = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/seller-registration");
      return;
    }

    // Block every other plan while payment is pending
    if (isLocked) {
      toast.info("Please complete your pending payment first.");
      return;
    }

    // Retry payment
    if (isPendingPayment) {
      handleUpgradeApi();
      return;
    }

    // Upgrade
    if (isUpgradePath) {
      handleUpgradeApi();
      return;
    }

    // Active plan
    setRedirecting(true);

    setTimeout(() => {
      const result = redirectToDashboard();

      if (!result.ok) {
        setRedirecting(false);
        onAuthError();
      }
    }, 320);
  };

  const isBusy = loading || redirecting;

  // ── Derive CTA label ─────────────────────────────────────────────────────
  let ctaLabel = cta;
  let ctaHint = "Opens your Seller Dashboard";

  if (isActivePlan) {
    ctaLabel = "Open Seller Dashboard";
    ctaHint = "Redirects securely via your session";
  } else if (isPendingPayment) {
    ctaLabel = "Complete Payment";
    ctaHint = "Finish payment to activate this plan";
  } else if (isLocked) {
    ctaLabel = "Complete Pending Payment First";
    ctaHint = "Finish your pending payment first";
  } else if (isUpgradePath) {
    ctaLabel = loading
      ? "Sending request…"
      : `Upgrade to ${name.split(" ")[0]}`;
    ctaHint = "";
  } else if (sellerStatus === "active" && !isActivePlan) {
    if (currentPlanNum === 1) {
      // Free → can upgrade immediately
      ctaLabel = `Upgrade to ${name.split(" ")[0]}`;
      ctaHint = "Activate this plan now";
    } else {
      // Verified/Premium → no switching before expiry
      ctaLabel = "Available after current plan expires";
      ctaHint = "You can choose this plan after your current plan ends";
    }
  }

  const pendingPulse = isPendingTarget;
  const isOutlineBtn = !featured && !isActivePlan && !isPendingPayment;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        flex: "1 1 320px",
        width: "100%",
        maxWidth: "100%",
        minWidth: window.innerWidth < 768 ? "100%" : 0,
        zIndex: featured ? 2 : 1,
      }}
    >
      {/* Pulse ring for pending */}
      {pendingPulse && (
        <motion.div
          animate={{ opacity: [0.5, 0.15, 0.5], scale: [1, 1.015, 1] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 23,
            border: "2px solid #f0a500",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Featured glow */}
      {featured && !pendingPulse && (
        <motion.div
          animate={{ opacity: hovered ? 0.6 : 0.38 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: 23,
            background: `radial-gradient(ellipse at 50% 0%, ${accent}55 0%, transparent 65%)`,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Card shell */}
      <motion.div
        animate={{
          boxShadow: pendingPulse
            ? "0 12px 40px -8px rgba(240,165,0,0.22)"
            : featured
              ? hovered
                ? `0 32px 72px -12px ${accent}44, 0 0 0 1.5px ${accent}66`
                : `0 20px 56px -10px ${accent}33, 0 0 0 1.5px ${accent}44`
              : hovered
                ? "0 16px 40px -8px rgba(0,9,48,0.14)"
                : "0 4px 20px -4px rgba(0,9,48,0.08)",
          y: featured ? (hovered ? -8 : -4) : hovered ? -4 : 0,
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: 20,
          background: "#ffffff",
          border: pendingPulse
            ? "1.5px solid rgba(240,165,0,0.4)"
            : featured
              ? `1.5px solid ${accent}44`
              : "1.5px solid #e8eaf2",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 4,
            background: pendingPulse
              ? "linear-gradient(90deg, #f0a500, #f0c040)"
              : featured
                ? `linear-gradient(90deg, ${accent}, ${accent}aa)`
                : "linear-gradient(90deg, #d0d4e8, #e8eaf2)",
          }}
        />

        {/* Active checkmark badge */}
        {isActivePlan && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${accent}55`,
              zIndex: 10,
            }}
          >
            <Check size={12} strokeWidth={3} color="#fff" />
          </div>
        )}

        {/* Pending badge */}
        {isPendingPayment && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: "3px 9px",
              borderRadius: 999,
              background: "rgba(240,165,0,0.12)",
              border: "1px solid rgba(240,165,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              zIndex: 10,
            }}
          >
            <Clock size={10} color="#f0a500" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#f0a500",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Pending
            </span>
          </div>
        )}

        {/* Card header */}
        <div
          style={{
            padding: window.innerWidth < 768 ? "20px 18px 0" : "28px 28px 0",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px 4px 8px",
              borderRadius: 20,
              background: featured ? `${accent}12` : "#f0f1f8",
              marginBottom: 18,
            }}
          >
            <span style={{ color: accent, display: "flex" }}>{tagIcon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: accent,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8892a4",
              marginBottom: 6,
            }}
          >
            {name}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize:
                  window.innerWidth < 768
                    ? price === "Free"
                      ? 30
                      : 28
                    : price === "Free"
                      ? 38
                      : 36,
                fontWeight: 700,
                color: "#0a0d1a",
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {price}
            </span>
            {priceSuffix && (
              <span style={{ fontSize: 13, color: "#8892a4", fontWeight: 400 }}>
                {priceSuffix}
              </span>
            )}
          </div>

          <div
            style={{ height: 1, background: "#f0f1f8", margin: "22px 0 20px" }}
          />
        </div>

        {/* Features list */}
        <div
          style={{
            padding: window.innerWidth < 768 ? "0 18px" : "0 28px",
            flex: 1,
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {features.map((f, i) => (
              <FeatureRow
                key={f.text}
                text={f.text}
                available={f.available}
                accent={accent}
                delay={inView ? 0.1 + i * 0.04 : 0}
              />
            ))}
          </ul>
        </div>

        {/* CTA section */}
        <div
          style={{
            padding: window.innerWidth < 768 ? "18px" : "20px 28px 28px",
          }}
        >
          {/* Destination hint */}
          {(isActivePlan || isPendingPayment) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 10,
                marginBottom: 12,
                background: isActivePlan
                  ? `${accent}09`
                  : "rgba(240,165,0,0.06)",
                border: `1px dashed ${isActivePlan ? accent + "33" : "rgba(240,165,0,0.3)"}`,
              }}
            >
              {isActivePlan ? (
                <LayoutDashboard
                  size={12}
                  color={accent}
                  strokeWidth={1.8}
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <Clock
                  size={12}
                  color="#f0a500"
                  strokeWidth={1.8}
                  style={{ flexShrink: 0 }}
                />
              )}
              <span
                style={{
                  fontSize: window.innerWidth < 768 ? 13 : 16.5,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  color: isActivePlan ? "#16a34a" : "#c89000",
                }}
              >
                {isActivePlan ? (
                  <strong style={{ fontWeight: 700 }}>✓ Active plan</strong>
                ) : (
                  "Payment required to activate this plan"
                )}
              </span>
            </div>
          )}

          {/* CTA button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCta}
            disabled={isBusy || isLocked}
            style={{
              width: "100%",
              padding: window.innerWidth < 768 ? "12px 14px" : "13px 20px",
              borderRadius: 12,
              border: "none",
              cursor: isLocked ? "not-allowed" : isBusy ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
              background: isPendingPayment
                ? "linear-gradient(135deg, #c98000, #f0a500)"
                : featured || isActivePlan
                  ? redirecting
                    ? `${accent}99`
                    : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
                  : isUpgradePath
                    ? loading
                      ? `${accent}99`
                      : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`
                    : "transparent",
              color:
                featured || isActivePlan || isPendingPayment || isUpgradePath
                  ? "#ffffff"
                  : accent,
              boxShadow: isPendingPayment
                ? "0 4px 16px rgba(240,165,0,0.35)"
                : (featured || isActivePlan || isUpgradePath) && !isBusy
                  ? `0 4px 16px ${accent}44`
                  : "none",
              outline:
                isOutlineBtn && !isUpgradePath
                  ? `1.5px solid ${accent}44`
                  : "none",
              opacity: isLocked ? 0.55 : isBusy ? 0.75 : 1,
              transition: "background 0.2s, box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              if (isOutlineBtn && !isUpgradePath && !isBusy) {
                e.currentTarget.style.background = `${accent}0c`;
                e.currentTarget.style.outline = `1.5px solid ${accent}99`;
              }
            }}
            onMouseLeave={(e) => {
              if (isOutlineBtn && !isUpgradePath) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.outline = `1.5px solid ${accent}44`;
              }
            }}
          >
            {loading || redirecting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "linear",
                  }}
                  style={{ display: "flex" }}
                >
                  <RefreshCw size={14} strokeWidth={2.2} />
                </motion.span>
                {redirecting ? "Redirecting to Dashboard…" : "Sending request…"}
              </>
            ) : (
              <>
                {isActivePlan && <LayoutDashboard size={14} />}
                {ctaLabel}
                <ArrowRight size={15} strokeWidth={2.2} />
              </>
            )}
          </motion.button>

          {/* Sub-hint */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              marginTop: 8,
            }}
          >
            <LogIn size={10} color="#b0b8cc" strokeWidth={2} />
            <span
              style={{
                fontSize: 11,
                color: "#b0b8cc",
                letterSpacing: "0.01em",
              }}
            >
              {ctaHint}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
