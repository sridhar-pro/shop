"use client";
import { useEffect, useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  retain,
  release,
  setAuth,
} from "./hotDealEngine";

// Reads the shared Hot Deal state. Every component that calls this sees the
// same values; the engine runs once no matter how many components mount.
//
// setCouponValue (optional): the caller's coupon-state setter. When the engine
// applies/removes the deal it measures the discount and pushes it here, so the
// caller's price summary shows the right amount.
export default function useHotDeal({ getValidToken, setCouponValue } = {}) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep the engine's token getter current (before the engine starts)
  useEffect(() => {
    setAuth(getValidToken);
  });

  useEffect(() => {
    retain();
    return release;
  }, []);

  useEffect(() => {
    if (setCouponValue && snap.couponValue !== null) {
      setCouponValue(snap.couponValue);
    }
  }, [snap.couponValue]);

  return { limitedDealApplied: snap.applied, dealTimer: snap.remaining };
}
