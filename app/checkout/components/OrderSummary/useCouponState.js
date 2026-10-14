"use client";
import { useState, useEffect, useRef } from "react";

// State + refs for the discount input / offers. No API calls here.
// Actions live in useCouponActions.js, server sync lives in useCartSummary.js.
export default function useCouponState() {
  // Debounce timer + stable focus + re-entry guards
  const debounceRef = useRef(null);
  const codeInputRef = useRef(null);
  const isApplyingRef = useRef(false);
  // the code we last applied successfully (so the debounce doesn't re-apply it)
  const lastAppliedCodeRef = useRef(null);

  const [couponValue, setCouponValue] = useState(0);
  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponSource, setCouponSource] = useState(null); // "manual" | "offer"
  const [appliedOfferCode, setAppliedOfferCode] = useState(null);

  // true only when a manual coupon (not an offer) is applied
  const [isManualCouponApplied, setIsManualCouponApplied] = useState(false);

  // Listen for "coupon-cleared" (fired after successful payment)
  useEffect(() => {
    const handleCouponCleared = () => {
      setCode("");
      setIsApplied(false);
      setIsManualCouponApplied(false);
      setCouponValue(0);
      setCouponMessage("");
    };

    window.addEventListener("coupon-cleared", handleCouponCleared);

    return () => {
      window.removeEventListener("coupon-cleared", handleCouponCleared);
    };
  }, []);

  // Restore offer source from localStorage on mount
  useEffect(() => {
    const storedSource = localStorage.getItem("coupon_source");
    const storedOfferCode = localStorage.getItem("applied_offer_code");

    if (storedSource === "offer" && storedOfferCode) {
      setCouponSource("offer");
      setAppliedOfferCode(storedOfferCode);
    }
  }, []);

  return {
    debounceRef,
    codeInputRef,
    isApplyingRef,
    lastAppliedCodeRef,
    couponValue,
    setCouponValue,
    code,
    setCode,
    isApplied,
    setIsApplied,
    couponMessage,
    setCouponMessage,
    couponSource,
    setCouponSource,
    appliedOfferCode,
    setAppliedOfferCode,
    isManualCouponApplied,
    setIsManualCouponApplied,
  };
}
