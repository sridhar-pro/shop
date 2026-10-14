"use client";
import { useSyncExternalStore } from "react";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
} from "./shippingUpdateStore";

// true while the shipping price is being recalculated
export default function useShippingUpdating() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    .updating;
}
