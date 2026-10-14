"use client";
import { isShippingUpdating } from "../../lib/shippingUpdateStore";
import { freezeHotDeal, unfreezeHotDeal } from "../../lib/hotDealEngine";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { parseCurrency } from "../../lib/checkoutHelpers";

// "Pay Now" flow for logged-in users:
// checks -> coupon (cart_summary_cache / localStorage) -> affiliate ->
// AddPaymentInfo -> /api/createOrder -> click hidden Razorpay / Cashfree button.
export default function useLoggedPay({
  addresses,
  selectedAddressId,
  companyId,
  isAuthReady,
  getValidToken,
  total,
  cartItems,
}) {
  const razorRef = useRef(null);
  const cashfreeRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleOrderAndPayLogged = async () => {
    if (processingRef.current) return;
    if (isShippingUpdating()) return; // wait for the new shipping price

    processingRef.current = true;
    setIsProcessing(true);
    try {
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        console.warn("⚠️ Auth not ready: isAuthReady =", isAuthReady);
        return;
      }

      const token = await getValidToken();

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Please select products before proceeding!");
        console.error("Cart ID not found!");
        return;
      }

      const activeAddresses = addresses.filter((addr) => addr.active === "1");

      if (!activeAddresses.length) {
        toast.error("Please select an active address before proceeding.");
        console.warn("⚠️ No active address selected!");
        return;
      }

      const addressId = selectedAddressId || activeAddresses[0]?.id || null;

      // ❄️ Payment is starting: freeze the Hot Deal (no auto-apply / expiry-removal
      // from here on) and let any apply that is already running finish, BEFORE
      // the coupon is read for the order.
      await freezeHotDeal();

      let couponToSend = "";

      try {
        const raw = localStorage.getItem("cart_summary_cache");
        const cached = raw ? JSON.parse(raw) : {};

        const cartData = cached?.cart_data;

        const couponId = cartData?.coupon_id;
        const couponValue = parseCurrency(cartData?.coupon_value || 0);

        if (couponId && couponId !== "0" && couponValue > 0) {
          couponToSend = couponId;
        }
      } catch (e) {
        console.warn("⚠️ Failed to read cart_summary_cache", e);
      }

      if (!couponToSend) {
        const rawLast =
          localStorage.getItem("last_applied_coupon") ||
          localStorage.getItem("applied_coupon");

        if (rawLast && rawLast !== "0") {
          couponToSend = rawLast;
        }
      }

      let affiliateCode = null;

      try {
        const affiliateRes = await fetch("/api/referral/current", {
          method: "GET",
          credentials: "include",
        });

        if (!affiliateRes.ok) {
          throw new Error(`HTTP ${affiliateRes.status}`);
        }

        const affiliateData = await affiliateRes.json();

        affiliateCode = affiliateData?.affiliate_code || null;
      } catch (err) {
        console.warn("Failed to fetch affiliate status:", err);
      }

      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: "",
          email: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
        },
        company_id: companyId,
        address_id: addressId,
        cart_id: cartId,
        coupon_code: couponToSend,
        ...(affiliateCode && { affiliate_code: affiliateCode }),
      };

      // ✅ Fire AddPaymentInfo when logged-in user clicks Pay
      const { trackEvent } = await import("@/app/lib/trackEvent");
      trackEvent({
        eventName: "AddPaymentInfo",
        customData: {
          value: total,
          currency: "INR",
          contentIds: cartItems.map((item) => item.product_id?.toString()),
          contentType: "product",
        },
      });

      console.log(
        "📦 Payload being sent to /api/createOrder:",
        customerPayload,
      );

      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      console.log("📥 Raw API Response:", result);

      if (!res.ok) {
        console.error("❌ Error creating order:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      console.log("✅ Logged-in order created successfully:", result);

      const paymentType = result?.type || "razorpay";

      if (paymentType === "cashfree") {
        if (!result?.r_response?.payment_session_id) {
          throw new Error("Cashfree session missing");
        }

        localStorage.setItem("order_id_data", JSON.stringify(result));

        window.dispatchEvent(
          new CustomEvent("orderIdDataUpdated", {
            detail: result?.order_id,
          }),
        );

        setOrderDetails({
          payment_session_id: result.r_response.payment_session_id,
          order_id: result.r_response.order_id,
          sale_id: result.sale_id,
        });

        setTimeout(() => {
          cashfreeRef.current?.click();
        }, 100);

        return;
      }

      const razorpayOrder = result?.r_response?.data;
      if (!razorpayOrder?.id || !razorpayOrder?.amount) {
        throw new Error("Razorpay order data missing from response");
      }

      setOrderDetails({
        sale_id: result.sale_id,
        order_id: result.order_id,
        r_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
      });

      localStorage.setItem("order_id_data", JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id,
        }),
      );

      setTimeout(() => {
        razorRef.current?.click();
      }, 100);
    } catch (err) {
      console.error("🚨 Logged-in Order creation error:", err);
      unfreezeHotDeal(); // order was not created → the deal may continue
      toast.error(
        err.message || "Something went wrong while creating the order.",
      );
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  return {
    razorRef,
    cashfreeRef,
    isProcessing,
    orderDetails,
    handleOrderAndPayLogged,
  };
}
