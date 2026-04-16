"use client";

import { forwardRef, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import { useSession } from "../context/SessionContext";

const CashfreeButton = forwardRef(
  (
    { orderDetails, formData, onSuccess, onFailure, onProcessingStart },
    ref,
  ) => {
    const { getValidToken } = useAuth();
    const { isLoggedIn } = useSession();

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Cashfree) return resolve(true);

        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const openPayment = async () => {
      const sessionId = orderDetails?.payment_session_id;

      if (!sessionId) {
        toast.error("Missing Cashfree session 😅");
        return;
      }

      const loaded = await loadScript();
      if (!loaded) {
        toast.error("Cashfree SDK failed to load");
        return;
      }

      try {
        const cashfree = window.Cashfree({
          mode: "sandbox",
        });

        // 🔥 IMPORTANT: detect cancel
        await cashfree
          .checkout({
            paymentSessionId: sessionId,
            redirectTarget: "_modal",
          })
          .catch(() => {
            console.log("❌ User closed Cashfree modal");
            onFailure?.();
            return;
          });

        console.log("✅ Cashfree modal closed");

        // 🧪 TEMP verification (until webhook)
        setTimeout(async () => {
          try {
            onProcessingStart?.(); // show loader AFTER payment

            const token = await getValidToken();
            const cartId = localStorage.getItem("cart_id");

            const verificationPayload = {
              sale_id: orderDetails?.sale_id || 0,
              razorpay_payment_id: "",
              razorpay_signature: "",
              razorpay_order_id: orderDetails?.order_id || "",
              guest: !isLoggedIn,
              cart_id: cartId,

              ...(isLoggedIn
                ? {} // logged user → backend already knows user
                : {
                    name: formData?.name,
                    email: formData?.email,
                    phone: `91${formData?.contact}`,
                  }),
            };
            console.log("🧪 Cashfree Verify Payload:", verificationPayload);

            const verifyResponse = await fetch("/api/verifyRazor", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(verificationPayload),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult?.status) {
              console.log("🔥 CASHFREE SUCCESS TRIGGERED");

              toast.success("Payment Verified");

              try {
                localStorage.removeItem("checkout_form_v1");
              } catch (err) {
                console.error("Error clearing checkout form:", err);
              }

              onSuccess?.(); // 🚀 THIS triggers paymentNotify
            } else {
              console.log("❌ CASHFREE VERIFY FAILED");
              toast.error("❌ Verification Failed");
              onFailure?.();
            }
          } catch (err) {
            console.error("❌ Cashfree verify error:", err);
            onFailure?.();
          }
        }, 3000);
      } catch (err) {
        console.error("❌ Cashfree error:", err);
        toast.error("Payment failed");
        onFailure?.();
      }
    };

    useImperativeHandle(ref, () => ({
      click: openPayment,
    }));

    return null;
  },
);

export default CashfreeButton;
