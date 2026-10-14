"use client";
import useHotDeal from "../../lib/useHotDeal";

// Hot Deal for the guest form. The logic (auto-apply, countdown, removal,
// history event) now lives in ONE shared engine: checkout/lib/hotDealEngine.js.
// This hook just reads it and feeds the measured discount into the coupon state.
export default function useCheckoutLimitedDeal({
  getValidToken,
  setCouponValue,
}) {
  return useHotDeal({ getValidToken, setCouponValue });
}
