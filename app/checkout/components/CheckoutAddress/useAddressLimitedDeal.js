"use client";
import { useAuth } from "@/app/utils/AuthContext";
import useHotDeal from "../../lib/useHotDeal";

// Hot Deal for logged-in checkout. The logic (auto-apply, countdown, removal)
// now lives in ONE shared engine: checkout/lib/hotDealEngine.js.
export default function useAddressLimitedDeal({ setCouponValue }) {
  const { getValidToken } = useAuth();
  return useHotDeal({ getValidToken, setCouponValue });
}
