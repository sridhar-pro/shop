"use client";
import useShippingUpdating from "./useShippingUpdating";

// The shipping price. While it is being recalculated a small spinner
// replaces the (old) amount.
export default function ShippingAmount({ value }) {
  const updating = useShippingUpdating();

  if (updating) {
    return (
      <span
        role="status"
        aria-label="Updating shipping"
        className="inline-block w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin align-middle"
      />
    );
  }

  return <>₹{value.toFixed(2)}</>;
}
