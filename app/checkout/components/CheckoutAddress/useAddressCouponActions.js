"use client";
import { useEffect } from "react";
import { parseCurrency } from "../../lib/checkoutHelpers";
import { getCartSummary } from "../../lib/cartSummaryService";
import { cancelHotDeal } from "../../lib/hotDealEngine";

// Apply coupon (manual or from an offer card) + debounced live validation.
// handleApply(overrideCode?) -> overrideCode is used by the offer cards.
export default function useAddressCouponActions({
  coupon, // useAddressCouponState()
  fetchWithAuth,
  fetchSummaryWithRetry,
}) {
  const {
    debounceRef,
    isApplyingRef,
    isFirstRenderRef,
    lastAppliedCodeRef,
    code,
    setCode,
    setCouponMessage,
    setCouponValue,
    setIsApplied,
    setAppliedCoupon,
  } = coupon;
  const handleApply = async (overrideCode = null) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    const cartId = localStorage.getItem("cart_id");
    // use the override only if it's a real code string (offer cards pass one);
    // anything else (e.g. a click event) falls back to the input value
    const finalCode = typeof overrideCode === "string" ? overrideCode : code;
    const trimmed = finalCode.trim();

    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      isApplyingRef.current = false;
      return;
    }

    try {
      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, coupon_code: trimmed }),
      });

      const failed =
        applyResponse?.status === false ||
        applyResponse?.status === "error" ||
        applyResponse?.success === false;
      if (failed) {
        setCouponMessage(applyResponse?.message || "Invalid coupon");
        setIsApplied(false);
        lastAppliedCodeRef.current = null;

        try {
          localStorage.removeItem("applied_coupon");
          localStorage.setItem("last_applied_coupon", "0");
        } catch (e) {
          console.warn("Error clearing coupon storage", e);
        }

        try {
          const summaryResponse = await getCartSummary(
            cartId,
            fetchSummaryWithRetry,
          );

          const cartData = summaryResponse?.cart_data;

          const newCouponValue =
            cartData?.coupon_id && cartData?.coupon_id !== "0"
              ? parseCurrency(cartData.coupon_value || 0)
              : 0;

          setCouponValue(newCouponValue);

          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify({ cart_data: cartData }),
          );

          window.dispatchEvent(
            new CustomEvent("local-storage-update", {
              detail: { key: "cart_tax_details" },
            }),
          );
        } catch (err) {
          console.error("❌ Failed to sync after invalid coupon", err);
        }

        window.dispatchEvent(new Event("cart-updated"));

        return;
      }

      setCouponMessage("Discount applied successfully!");
      setIsApplied(true);
      setAppliedCoupon(trimmed);

      // manual: remember it so the debounce doesn't re-apply it; offer: nothing to remember
      lastAppliedCodeRef.current = overrideCode ? null : trimmed;

      // A normal coupon replaces the hot deal (also clears limited_deal_expiry)
      cancelHotDeal();

      try {
        localStorage.setItem("applied_coupon", trimmed);
        localStorage.setItem("last_applied_coupon", trimmed);
      } catch (e) {
        console.warn("Error persisting coupon storage", e);
      }

      // cart-updated also invalidates the shared /getTax request, so the
      // read below is guaranteed to include the new coupon.
      window.dispatchEvent(new Event("cart-updated"));

      const summaryResponse = await getCartSummary(
        cartId,
        fetchSummaryWithRetry,
      );

      const cartData = summaryResponse?.cart_data;
      if (!cartData) return;

      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";

      setCouponValue(
        appliedCoupon ? parseCurrency(cartData.coupon_value || 0) : 0,
      );

      if (appliedCoupon) {
        if (!overrideCode) {
          setCode(cartData.coupon_id);
        }
      }

      try {
        localStorage.setItem(
          "cart_tax_details",
          JSON.stringify({ cart_data: cartData }),
        );
      } catch (e) {
        console.warn("Error saving cart_tax_details", e);
      }

      window.dispatchEvent(
        new CustomEvent("local-storage-update", {
          detail: { key: "cart_tax_details" },
        }),
      );
    } catch (err) {
      console.error("❌ Error applying coupon or fetching cart summary:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
      setIsApplied(false);
    } finally {
      isApplyingRef.current = false;
    }
  };

  const handleApplyOfferCode = (offerCode) => {
    if (!offerCode) return;
    handleApply(offerCode);
  };

  // 👇 Debounced live validation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!code.trim()) {
      setIsApplied(false);
      setCouponMessage("");
      lastAppliedCodeRef.current = null;
      // (couponValue is NOT zeroed: the server discount stays applied until the
      //  cart is refreshed, so the discount row must keep showing it)
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

  return { handleApply, handleApplyOfferCode };
}
