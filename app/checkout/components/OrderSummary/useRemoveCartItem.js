"use client";
import { useState } from "react";
import { toast } from "react-toastify";

// Trash-icon flow: /api/cartRemove (by rowid) -> cart-updated.
//
// Removes by ROWID (unique per cart line). It used to remove by product_id,
// which deleted the wrong line when the same product was in the cart twice
// (e.g. with different custom-print text). Because the rowid is already known,
// the extra /getTax lookup that only existed to find it is gone too.
export default function useRemoveCartItem({ getValidToken, setCartItems }) {
  const [processingItems, setProcessingItems] = useState({});

  const setProcessing = (id, value) =>
    setProcessingItems((prev) => ({ ...prev, [id]: value }));

  const removeItem = async (rowid) => {
    if (processingItems[rowid]) return;
    setProcessing(rowid, true);

    try {
      const token = await getValidToken();
      const res = await fetch("/api/cartRemove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: localStorage.getItem("cart_id"),
          rowid,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setCartItems((prev) => {
          const updatedCart = prev.filter((item) => item.rowid !== rowid);
          if (updatedCart.length === 0) {
            toast.info("Your cart is empty — taking you to products!", {
              position: "top-right",
              autoClose: 1800,
            });
            setTimeout(() => {
              window.location.href = "/products";
            }, 1800);
          }
          return updatedCart;
        });

        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Item removed from cart", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        throw new Error(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setProcessing(rowid, false);
    }
  };

  return { processingItems, removeItem };
}
