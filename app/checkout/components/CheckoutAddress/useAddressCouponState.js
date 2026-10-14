"use client";
import { useState, useRef } from "react";

// State + refs for the logged-in coupon UI. No API calls here.
// Actions: useAddressCouponActions.js  |  Hot deal: useAddressLimitedDeal.js
export default function useAddressCouponState() {
  // Debounce timer + re-entry guards
  const debounceRef = useRef(null);
  const isApplyingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  // the code we last applied successfully (so the debounce doesn't re-apply it)
  const lastAppliedCodeRef = useRef(null);

  const [code, setCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponValue, setCouponValue] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  return {
    debounceRef,
    isApplyingRef,
    isFirstRenderRef,
    lastAppliedCodeRef,
    code,
    setCode,
    couponMessage,
    setCouponMessage,
    couponValue,
    setCouponValue,
    isApplied,
    setIsApplied,
    appliedCoupon,
    setAppliedCoupon,
  };
}
