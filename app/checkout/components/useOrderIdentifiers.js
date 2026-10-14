"use client";
import { useState, useEffect } from "react";

// Owns: paymentId (razorpay_payment_id) and idordered (order_id_data.order_id),
// both restored from localStorage and updated live by custom events.
export default function useOrderIdentifiers() {
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("razorpay_payment_id");
    if (storedId) setPaymentId(storedId);

    const handlePaymentIdUpdate = (e) => {
      setPaymentId(e.detail); // Instantly update from custom event
    };

    window.addEventListener("razorpayPaymentIdUpdated", handlePaymentIdUpdate);

    return () => {
      window.removeEventListener(
        "razorpayPaymentIdUpdated",
        handlePaymentIdUpdate,
      );
    };
  }, []);

  const [idordered, setIdOrdered] = useState(null);

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("order_id_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIdOrdered(parsed?.order_id || null);
      } catch (e) {
        console.error("⚠️ Failed to parse order_id_data from localStorage", e);
      }
    }

    // Listen for instant updates via custom event
    const handleOrderIdUpdate = (e) => {
      setIdOrdered(e.detail);
    };

    window.addEventListener("orderIdDataUpdated", handleOrderIdUpdate);

    return () => {
      window.removeEventListener("orderIdDataUpdated", handleOrderIdUpdate);
    };
  }, []);

  return { paymentId, idordered };
}
