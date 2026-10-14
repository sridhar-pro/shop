"use client";
import { useEffect } from "react";
import { parseCurrency } from "../lib/checkoutHelpers";
import { getCartSummary } from "../lib/cartSummaryService";
import { unfreezeHotDeal } from "../lib/hotDealEngine";

// Runs once when paymentSuccess flips to true:
//  1. scroll to top
//  2. fire Purchase event (Meta CAPI)
//  3. save order_confirmation, resolve final coupon, call /api/paymentNotify,
//     then clear cart + coupon + personalised-text keys from localStorage
export default function usePaymentSuccess({
  paymentSuccess,
  isLoggedIn,
  getValidToken,
  fetchWithAuth,
  total,
  cartItems,
  idordered,
  paymentId,
  orderDate,
  setOrderData,
}) {
  useEffect(() => {
    if (!paymentSuccess) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    // ✅ Fire Purchase event to Meta CAPI
    import("@/app/lib/trackEvent").then(({ trackEvent }) => {
      const savedEmail = localStorage.getItem("checkout_email") || "";
      const savedContact = localStorage.getItem("checkout_contact") || "";

      trackEvent({
        eventName: "Purchase",
        userEmail: savedEmail,
        userPhone: savedContact,
        customData: {
          value: total,
          currency: "INR",
          orderId: idordered?.toString() || "",
          contentIds: cartItems.map((item) => item.product_id?.toString()),
          contentType: "product",
        },
      });
    });

    const notifyBackend = async () => {
      const storedOrder = JSON.parse(localStorage.getItem("order_id_data"));
      const saleid = storedOrder?.sale_id;

      if (!saleid) {
        console.warn("🚫 No sale_id found in localStorage!");
        return;
      }

      let token = await getValidToken();

      // 🔥 Retry once if token missing
      if (!token && isLoggedIn) {
        console.warn("🔁 Retrying token fetch...");
        await new Promise((res) => setTimeout(res, 500));
        token = await getValidToken();
      }

      if (!token && isLoggedIn) {
        console.error("🔐 Token still missing, skipping notify");
        return;
      }

      // ✅ Capture cart_id ONCE (important)
      const cartId = localStorage.getItem("cart_id");

      // Save order confirmation data before clearing
      const shippingDetails = localStorage.getItem("cart_shipping_details");
      const taxDetails = localStorage.getItem("cart_tax_details");
      const orderConfirmation = {
        orderDetails: shippingDetails ? JSON.parse(shippingDetails) : null,
        taxDetails: taxDetails ? JSON.parse(taxDetails) : null,
        orderId: idordered,
        paymentId,
        orderDate,
      };
      localStorage.setItem(
        "order_confirmation",
        JSON.stringify(orderConfirmation),
      );

      // Prefer backend truth for the coupon (covers hot deal + manual)
      let effectiveCoupon = "";

      try {
        if (cartId) {
          // force: we need the latest server state, never a shared in-flight one
          const summary = await getCartSummary(cartId, fetchWithAuth, {
            force: true,
          });

          const cartData = summary?.cart_data;
          const couponId = cartData?.coupon_id;
          const couponValue = parseCurrency(cartData?.coupon_value || 0);

          if (couponId && couponId !== "0" && couponValue > 0) {
            effectiveCoupon = couponId;
          }
        }
      } catch (e) {
        console.warn("⚠️ Failed to fetch latest coupon for paymentNotify", e);
      }

      // ✅ FINAL coupon (backend truth)
      const finalCoupon = effectiveCoupon;

      // 🧼 Immediately clear local coupon memory (prevents reuse bugs)
      localStorage.removeItem("applied_coupon");
      localStorage.removeItem("last_applied_coupon");
      localStorage.removeItem("cart_coupon_value");
      localStorage.removeItem("limited_deal_applied_once");
      localStorage.removeItem("limited_deal_expiry");

      // 🔥 Force UI reset
      window.dispatchEvent(new Event("coupon-cleared"));
      unfreezeHotDeal(); // order is done: clear the freeze marker for this cart

      // ✅ Build payload AFTER cleanup (using safe variable)
      const payload = !isLoggedIn
        ? {
            saleid,
            msg: "success",
            name: localStorage.getItem("checkout_name") || "",
            email: localStorage.getItem("checkout_email") || "",
            phone: localStorage.getItem("checkout_contact") || "",
            guest: true,
            coupon_code: finalCoupon,
            cart_id: cartId,
          }
        : {
            saleid,
            msg: "success",
            guest: false,
            coupon_code: finalCoupon,
            cart_id: cartId,
          };

      try {
        const res = await fetch("/api/paymentNotify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        // ✅ update state (THIS triggers re-render)
        setOrderData(data.data);

        // optional backup
        localStorage.setItem(
          "order_success_details",
          JSON.stringify(data.data),
        );

        // Clear only the cart data, keep confirmation data
        const keysToRemove = [
          "cart_tax_details",
          "cart_data",
          "cart_id",
          "order_id_data",
          "cart_shipping_details",
        ];

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // ✅ Remove ALL personalised text entries (safe + scalable)
        const removedPersonalisedKeys = [];

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("personalised_text_")) {
            localStorage.removeItem(key);
            removedPersonalisedKeys.push(key);
          }
        });

        // 🔔 Notify app state
        window.dispatchEvent(
          new CustomEvent("cart-cleared", {
            detail: {
              clearedKeys: keysToRemove,
              clearedPersonalisedKeys: removedPersonalisedKeys,
            },
          }),
        );

        console.log("🧼 Cart & personalised messages cleared successfully");
      } catch (err) {
        console.error("❌ Failed to send payment notification:", err);
      }
    };

    notifyBackend();
  }, [paymentSuccess, isLoggedIn]);
}
