"use client";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { validateFormData } from "@/app/utils/validateForm";
import { parseCurrency } from "../../lib/checkoutHelpers";
import { getCartSummary } from "../../lib/cartSummaryService";
import { isShippingUpdating } from "../../lib/shippingUpdateStore";
import { freezeHotDeal, unfreezeHotDeal } from "../../lib/hotDealEngine";

// "Proceed to Pay" flow for guests:
// validate -> save checkout_* -> affiliate -> coupon -> AddPaymentInfo ->
// /api/createOrder -> click the hidden Razorpay / Cashfree button.
export default function useOrderAndPay({
  formData,
  setFormError,
  scrollToFirstError,
  fetchWithAuth,
  getValidToken,
  isAuthReady,
  total,
  cartItems,
}) {
  const razorRef = useRef(null);
  const cashfreeRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleOrderAndPay = async () => {
    if (isProcessing) return; // double-click shield
    if (isShippingUpdating()) return; // wait for the new shipping price
    setIsProcessing(true);

    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      console.warn("❌ Form validation failed", errors);
      setIsProcessing(false);
      scrollToFirstError(errors); // bring the error into view on mobile
      return;
    }

    setFormError({});

    try {
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        setIsProcessing(false);
        return;
      }

      // ❄️ Payment is starting: freeze the Hot Deal (no auto-apply / expiry-removal
      // from here on) and let any apply that is already running finish, BEFORE
      // the coupon is read for the order.
      await freezeHotDeal();

      // ✅ Store checkout details in localStorage before proceeding
      localStorage.setItem("checkout_name", formData.name);
      localStorage.setItem("checkout_email", formData.email);
      localStorage.setItem("checkout_contact", formData.contact);

      const token = await getValidToken();

      const cartId = localStorage.getItem("cart_id");

      if (!cartId) {
        toast.error("Cart ID not found!");
        setIsProcessing(false); // 🔓 re-enable the Pay button
        return;
      }

      // Check current affiliate
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

        if (affiliateCode) {
          console.log("✅ Affiliate Code Found:", affiliateCode);
        } else {
          console.log("ℹ️ No affiliate code available.");
        }
      } catch (err) {
        console.warn("Failed to fetch affiliate status:", err);
      }

      let effectiveCoupon = "";

      // ✅ Try backend first (force: must be the latest server state at pay time)
      try {
        const summary = await getCartSummary(cartId, fetchWithAuth, {
          force: true,
        });

        const cartData = summary?.cart_data;
        const couponId = cartData?.coupon_id;
        const couponValue = parseCurrency(cartData?.coupon_value || 0);

        if (couponId && couponId !== "0" && couponValue > 0) {
          effectiveCoupon = couponId;
        }
      } catch (e) {
        console.warn("Coupon fetch failed, fallback to localStorage");
      }

      // ✅ fallback (safe)
      if (!effectiveCoupon) {
        const rawLast = localStorage.getItem("last_applied_coupon");
        const couponValue = Number(
          localStorage.getItem("cart_coupon_value") || 0,
        );

        if (rawLast && rawLast !== "0" && couponValue > 0) {
          effectiveCoupon = rawLast;
        }
      }

      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: `${formData.name} ${formData.lastName}`,
          email: formData.email,
          phone: formData.contact,
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pin,
          country: formData.country || "India",
        },
        company_id: 0,
        cart_id: cartId,
        ...(effectiveCoupon && { coupon_code: effectiveCoupon }),
        ...(affiliateCode && { affiliate_code: affiliateCode }),
      };

      console.log("📦 createOrder coupon_code =>", effectiveCoupon);

      // ✅ Fire AddPaymentInfo when guest clicks Pay
      const { trackEvent } = await import("@/app/lib/trackEvent");
      trackEvent({
        eventName: "AddPaymentInfo",
        userEmail: formData.email,
        userPhone: formData.contact,
        customData: {
          value: total,
          currency: "INR",
          contentIds: cartItems.map((item) => item.product_id?.toString()),
          contentType: "product",
        },
      });

      console.log("📦 Sending payload to /api/createOrder:", customerPayload);

      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Error Response:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      console.log("✅ Order created successfully:", result);

      const paymentType = result?.type || "razorpay";

      // 🔥 CASHFREE FLOW
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

        return; // 🚨 IMPORTANT: stop here
      }

      // 🧾 Extract amount and order id
      const razorpayOrder = result?.r_response?.data;
      if (!razorpayOrder?.id || !razorpayOrder?.amount) {
        throw new Error("Razorpay order data missing from response");
      }

      // ✅ Save to state for RazorpayButton
      setOrderDetails({
        sale_id: result.sale_id,
        order_id: result.order_id, // your internal reference
        r_order_id: razorpayOrder.id, // actual Razorpay order ID
        amount: razorpayOrder.amount,
      });

      // 🧾 Store order data in localStorage
      localStorage.setItem("order_id_data", JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id,
        }),
      );

      // Trigger Razorpay manually after state is updated
      setTimeout(() => {
        razorRef.current?.click();
      }, 100);
    } catch (err) {
      console.error("🚨 Order creation error:", err);
      unfreezeHotDeal(); // order was not created → the deal may continue
      toast.error(
        err.message || "Something went wrong while creating the order.",
      );

      // ❗ Only re-enable on error
      setIsProcessing(false);
    }
  };

  return {
    razorRef,
    cashfreeRef,
    isProcessing,
    orderDetails,
    handleOrderAndPay,
  };
}
