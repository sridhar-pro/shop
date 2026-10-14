"use client";
import { createFetchWithAuth } from "../../lib/checkoutHelpers";
import {
  beginShippingUpdate,
  finishAfterCartRefresh,
} from "../../lib/shippingUpdateStore";
// PIN input handler: digits only (max 6); at 6 digits calls /api/shipping,
// shows backend error under the field, or fires "cart-updated" when valid.
// While the shipping price is being recalculated, Pay is disabled and the
// shipping amount shows a loader (see lib/shippingUpdateStore.js).
export default function usePincodeLookup({
  handleChange,
  formError,
  setFormError,
  isAuthReady,
  getValidToken,
}) {
  const handlePinChange = async (e) => {
    const val = e.target.value.replace(/\D/g, ""); // only digits

    if (val.length <= 6) {
      handleChange({ target: { name: "pin", value: val } });
    }

    // clear old error while typing
    if (formError.pin) {
      setFormError((prev) => ({ ...prev, pin: "" }));
    }

    if (val.length === 6 && isAuthReady) {
      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        console.warn("🛒 No cart_id found in localStorage");
        return;
      }

      const finish = beginShippingUpdate();

      try {
        const token = await getValidToken();
        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            pincode: val,
            delivery_country: "IN",
          }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error("Failed to fetch shipping details");

        // 🧩 If backend says error, show it
        if (data?.cart?.error) {
          setFormError((prev) => ({
            ...prev,
            pin: data.cart.msg || "Invalid pincode",
          }));
          return;
        }

        // ✅ valid pincode, refresh cart
        window.dispatchEvent(new Event("cart-updated"));

        // keep Pay disabled until that refresh has applied the new shipping price
        await finishAfterCartRefresh(
          finish,
          cartId,
          createFetchWithAuth(getValidToken),
        );
      } catch (err) {
        console.error("🚨 Error fetching shipping data:", err);
        setFormError((prev) => ({
          ...prev,
          pin: "Something went wrong. Try again.",
        }));
      } finally {
        finish(); // idempotent: also covers the error / invalid-pincode paths
      }
    }
  };

  return { handlePinChange };
}
