"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getCartSummary } from "../../lib/cartSummaryService";

// Offers + BOGO for the logged-in checkout. Loaded once on mount through the
// shared /getTax request; also syncs `appliedCoupon` from the server.
export default function useAddressOffers({
  fetchWithAuthBogo,
  setAppliedCoupon,
}) {
  const [bogoOffers, setBogoOffers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applyingOffer, setApplyingOffer] = useState(false); // track button state
  const [appliedOffers, setAppliedOffers] = useState([]); // applied BOGO offer IDs

  const fetchBogoOffers = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const response = await getCartSummary(cartId, fetchWithAuthBogo);

      setBogoOffers(response?.bogo_offers || []);
      setOffers(response?.offers || []);

      const applied = response?.cart_data?.coupon_id;
      if (applied && applied !== "0") {
        setAppliedCoupon(applied);
      } else {
        setAppliedCoupon("");
      }
    } catch (err) {
      console.error("❌ Failed to fetch offers:", err);
    }
  };

  useEffect(() => {
    fetchBogoOffers();
  }, []);

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return;

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const data = await fetchWithAuthBogo("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      setAppliedOffers((prev) => [...prev, bogoId]);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false);
    }
  };

  return { bogoOffers, offers, applyingOffer, appliedOffers, applyBogoOffer };
}
