"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// BOGO ("Buy one get one") offer apply + per-offer applied tracking.
export default function useBogoOffer({ fetchWithAuth }) {
  const router = useRouter();
  const [applyingOffer, setApplyingOffer] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState([]);

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return;

    const toastId = toast.loading("Applying offer...");

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.update(toastId, {
          render: "Cart ID not found ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      const res = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      const message = res?.message?.toLowerCase() || "";

      if (message.includes("offer applied successfully")) {
        toast.update(toastId, {
          render: "Offer applied successfully 🎉",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        setAppliedOffers((prev) => [...prev, bogoId]);
        window.dispatchEvent(new Event("cart-updated"));
      } else if (message.includes("no eligible")) {
        toast.update(toastId, {
          render: (
            <div className="font-odop flex items-start gap-3 p-2">
              {/* Content */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-800">
                  No eligible products in your cart
                </p>

                <p className="text-xs text-gray-500">
                  Add items that qualify for this offer to unlock the deal.
                </p>

                <button
                  onClick={() => {
                    router.push("/products/special-offers");
                  }}
                  className="mt-1 inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow hover:scale-105 transition-transform duration-200 w-fit"
                >
                  View Eligible Products
                </button>
              </div>
            </div>
          ),
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      } else if (res?.status === "error") {
        toast.update(toastId, {
          render: res?.message || "Failed to apply offer ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: error.message || "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  return { applyingOffer, appliedOffers, applyBogoOffer };
}
