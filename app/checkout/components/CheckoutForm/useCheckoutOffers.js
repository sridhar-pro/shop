"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCartSummary } from "../../lib/cartSummaryService";

// Offers shown in the mobile summary: coupon offers (`offers`) + BOGO offers.
// Loaded once on mount via the shared /getTax request (not refreshed on
// cart-updated — same as before).
export default function useCheckoutOffers({ fetchWithAuth }) {
  const [bogoOffers, setBogoOffers] = useState([]);
  const [applyingOffer, setApplyingOffer] = useState(false); // track button state
  const [offers, setOffers] = useState([]);
  const [offerApplied, setOfferApplied] = useState(false);

  const fetchBogoOffers = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    try {
      const response = await getCartSummary(cartId, fetchWithAuth);

      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
        setOffers(response?.offers || []);
      } else {
        setBogoOffers([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch BOGO offers:", err);
    }
  };

  useEffect(() => {
    fetchBogoOffers();
  }, []);

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || offerApplied) return; // 🚫 prevent double-click

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const data = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          bogo_id: Number(bogoId),
          cart_id: cartId,
        },
      });

      console.log("Bogo res:", data);

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      // ✅ mark offer as applied
      setOfferApplied(true);

      // ✅ refresh cart globally
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false);
    }
  };

  return { bogoOffers, offers, applyingOffer, offerApplied, applyBogoOffer };
}
