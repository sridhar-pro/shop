"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";

// Manual coupon apply, debounced live validation, and "apply offer" cards.
export default function useCouponActions({
  fetchWithAuth,
  fetchSummary,
  coupon,
}) {
  const {
    debounceRef,
    codeInputRef,
    isApplyingRef,
    lastAppliedCodeRef,
    code,
    setCode,
    setIsApplied,
    setCouponMessage,
    setCouponSource,
    setAppliedOfferCode,
    setIsManualCouponApplied,
  } = coupon;

  const handleApply = async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current); // 🧠 kill duplicate trigger
    }

    if (isApplyingRef.current) return;
    isApplyingRef.current = true; // ✅ LOCK START

    const cartId = localStorage.getItem("cart_id");
    const trimmed = code.trim();

    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      setIsManualCouponApplied(false);
      isApplyingRef.current = false;
      return;
    }

    try {
      const response = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: trimmed },
      });

      const failed =
        response?.status === false ||
        response?.status === "error" ||
        response?.success === false;

      if (failed) {
        setCouponMessage(response?.message || "Invalid coupon");
        lastAppliedCodeRef.current = null;
        setIsApplied(false);
        setIsManualCouponApplied(false);
        localStorage.removeItem("applied_coupon");
      } else {
        setCouponMessage("");
        setIsApplied(true);
        setIsManualCouponApplied(true); // ✅ mark as manual
        setCouponSource("manual");
        localStorage.setItem("coupon_source", "manual");

        // Clear any previously applied offer code since manual coupon takes over
        setAppliedOfferCode(null);
        localStorage.removeItem("applied_offer_code");

        lastAppliedCodeRef.current = trimmed;

        // Manual coupon: track both manual and "last applied"
        localStorage.setItem("applied_coupon", trimmed);
        localStorage.setItem("last_applied_coupon", trimmed);

        // cart-updated also invalidates the shared /getTax request, so the
        // fetchSummary below is guaranteed to see the new coupon.
        window.dispatchEvent(new Event("cart-updated"));
        console.log("🎉 Coupon applied — cart-updated event dispatched!");
      }

      // ⚠️ Refresh WITHOUT flipping to skeleton, so input stays mounted
      await fetchSummary({ showSpinner: false });

      // Keep focus in the field for continued typing if needed
      requestAnimationFrame(() => {
        codeInputRef.current && codeInputRef.current.focus();
      });
    } catch (err) {
      console.error("❌ Error applying coupon:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
    } finally {
      isApplyingRef.current = false; // ✅ release lock
    }
  };

  // 👇 Debounced live validation (no full-page loading state)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Avoid spamming API when user clears the field
    if (!code.trim()) {
      setCouponMessage("");
      setIsApplied(false);
      setIsManualCouponApplied(false);
      lastAppliedCodeRef.current = null;
      // (couponValue is NOT zeroed here: the server discount is still applied
      //  until the cart is refreshed, so the discount row must keep showing it)
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

  const handleApplyOfferCode = async (offerCode) => {
    if (isApplyingRef.current) return;

    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      isApplyingRef.current = true;

      const response = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: offerCode },
      });

      const failed =
        response?.status === false ||
        response?.status === "error" ||
        response?.success === false;

      if (failed) {
        toast.error(response?.message || "Failed to apply offer ❌");
      } else {
        toast.success("🎉 Offer applied successfully!");
        setCouponMessage("This offer applied successfully");
        setIsApplied(true);
        setIsManualCouponApplied(false); // offer applied — NOT manual
        setCouponSource("offer");
        localStorage.setItem("coupon_source", "offer");

        setAppliedOfferCode(offerCode);
        localStorage.setItem("applied_offer_code", offerCode);

        lastAppliedCodeRef.current = null;
        setCode(""); // keep empty

        localStorage.setItem("last_applied_coupon", offerCode);

        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong ❌");
    } finally {
      isApplyingRef.current = false;
    }
  };

  return { handleApply, handleApplyOfferCode };
}
