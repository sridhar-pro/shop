"use client";
import { useState, useEffect, useRef } from "react";
import { parseCurrency } from "../../lib/checkoutHelpers";
import { getCartSummary } from "../../lib/cartSummaryService";

// Coupon input + offer-code apply for the guest checkout form.
// handleApply(overrideCode?) -> overrideCode is used by the offer cards.
//
// /getTax is called with { force: true } right after applyCoupon so we never
// read a request that started before the coupon changed.
export default function useCheckoutCoupon({ fetchWithAuth }) {
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
  const [couponSource, setCouponSource] = useState(null); // "manual" | "offer"
  const [appliedOfferCode, setAppliedOfferCode] = useState(null);
  const [isManualCouponApplied, setIsManualCouponApplied] = useState(false);

  const handleApply = async (overrideCode = null) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    const cartId = localStorage.getItem("cart_id");

    // ✅ use override only if it's really a code string (offer cards pass one).
    // Anything else (e.g. a click event) is ignored and the input value is used.
    const finalCode = typeof overrideCode === "string" ? overrideCode : code;
    const trimmed = finalCode.trim();

    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      isApplyingRef.current = false; // 🔓 release the lock on early exit
      return;
    }

    try {
      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: trimmed },
      });

      const failed =
        applyResponse?.status === false ||
        applyResponse?.status === "error" ||
        applyResponse?.success === false;

      if (failed) {
        setCouponMessage(applyResponse?.message || "Invalid coupon");
        setIsApplied(false);
        lastAppliedCodeRef.current = null;

        // ❗ RESET EVERYTHING
        setCouponSource(null);
        setAppliedOfferCode(null);
        setIsManualCouponApplied(false);

        localStorage.removeItem("coupon_source");
        localStorage.removeItem("applied_offer_code");
        localStorage.setItem("last_applied_coupon", "0");

        // ✅ IMPORTANT: STILL SYNC WITH SERVER
        try {
          const summaryResponse = await getCartSummary(cartId, fetchWithAuth, {
            force: true,
          });

          const cartData = summaryResponse?.cart_data;

          const newCouponValue =
            cartData?.coupon_id && cartData?.coupon_id !== "0"
              ? parseCurrency(cartData.coupon_value || 0)
              : 0;

          setCouponValue(newCouponValue);

          localStorage.setItem("cart_coupon_value", newCouponValue);

          window.dispatchEvent(new Event("cart-updated"));
        } catch (e) {
          console.error("Failed to sync cart after invalid coupon", e);
        }

        return;
      }

      setCouponMessage("");
      setIsApplied(true);

      if (overrideCode) {
        // 🎁 OFFER FLOW
        setCouponSource("offer");
        setAppliedOfferCode(trimmed);
        setIsManualCouponApplied(false);

        setCode("");

        localStorage.setItem("coupon_source", "offer");
        localStorage.setItem("applied_offer_code", trimmed);
      } else {
        // 🧑‍💻 MANUAL FLOW
        setCouponSource("manual");
        setIsManualCouponApplied(true);
        setAppliedOfferCode(null);

        setCode(trimmed);

        localStorage.setItem("coupon_source", "manual");
        localStorage.removeItem("applied_offer_code");
      }

      localStorage.setItem("last_applied_coupon", trimmed);
      // manual: remember it so the debounce doesn't re-apply it; offer: nothing to remember
      lastAppliedCodeRef.current = overrideCode ? null : trimmed;

      const summaryResponse = await getCartSummary(cartId, fetchWithAuth, {
        force: true,
      });

      const cartData = summaryResponse?.cart_data;

      const newCouponValue =
        cartData?.coupon_id && cartData?.coupon_id !== "0"
          ? parseCurrency(cartData.coupon_value || 0)
          : 0;

      setCouponValue(newCouponValue);

      // ✅ ALSO STORE (important for fallback consistency)
      localStorage.setItem("cart_coupon_value", newCouponValue);

      // ✅ NOW trigger UI update
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("❌ Apply failed:", err);
      setCouponMessage("Failed to apply coupon");
    } finally {
      isApplyingRef.current = false;
    }
  };

  const handleApplyOfferCode = (offerCode) => {
    if (!offerCode) return;

    handleApply(offerCode); // already handled in override flow
  };

  // 👇 Debounced live validation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!code.trim()) {
      setCouponMessage("");
      setIsApplied(false);
      lastAppliedCodeRef.current = null;
      // (couponValue is NOT zeroed: the server discount stays applied until the
      //  cart is refreshed, so the discount row must keep showing it)

      setCouponSource(null);
      setAppliedOfferCode(null);
      setIsManualCouponApplied(false);

      localStorage.removeItem("coupon_source");
      localStorage.removeItem("applied_offer_code");

      return;
    }

    // 🚫 already applying, or this exact code is what's already applied
    if (isApplyingRef.current) return;
    if (
      lastAppliedCodeRef.current &&
      code.trim().toLowerCase() === lastAppliedCodeRef.current.toLowerCase()
    ) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      handleApply();
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  // Restore coupon source from localStorage on mount
  useEffect(() => {
    const storedSource = localStorage.getItem("coupon_source");
    const storedOfferCode = localStorage.getItem("applied_offer_code");

    if (storedSource === "offer" && storedOfferCode) {
      setCouponSource("offer");
      setAppliedOfferCode(storedOfferCode);
    }

    if (storedSource === "manual") {
      setCouponSource("manual");
      setIsManualCouponApplied(true);
    }
  }, []);

  return {
    isApplyingRef,
    code,
    setCode,
    couponMessage,
    setCouponMessage,
    couponValue,
    setCouponValue,
    isApplied,
    setIsApplied,
    couponSource,
    appliedOfferCode,
    isManualCouponApplied,
    setIsManualCouponApplied,
    handleApply,
    handleApplyOfferCode,
  };
}
