"use client";
import { useState, forwardRef, useImperativeHandle } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";

const RazorpayButton = forwardRef(
  (
    {
      total,
      formData,
      clearForm,
      onSuccess,
      onFailure,
      formError,
      setFormError,
      onProcessingStart,
      orderDetails, // ✅ new prop
    },
    ref
  ) => {
    const [loading, setLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Expose handlePayment to parent via ref
    useImperativeHandle(ref, () => ({
      click: () => {
        handlePayment();
      },
    }));

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const { getValidToken } = useAuth();

    const handlePayment = async () => {
      if (!orderDetails?.order_id || !orderDetails?.amount) {
        toast.error("Order details are missing. Please retry checkout.");
        return;
      }
      setLoading(true);

      if (
        !formData?.name ||
        !formData?.email ||
        !formData?.country ||
        !formData?.contact ||
        !formData?.addressLine1 ||
        !formData?.addressLine2 ||
        !formData?.city ||
        !formData?.state ||
        !formData?.pin
      ) {
        const errors = {};
        if (!formData.name) errors.name = "Please enter your first name.";
        if (!formData.email) errors.email = "Please enter a valid email.";
        if (!formData.contact)
          errors.contact = "Please enter your phone number.";
        if (!formData.country) errors.country = "Please select your country.";
        if (!formData.addressLine1)
          errors.addressLine1 = "Please enter your flat or building info.";
        if (!formData.addressLine2)
          errors.addressLine2 = "Please enter your area or street info.";
        if (!formData.city) errors.city = "Please enter your city.";
        if (!formData.state) errors.state = "Please select your state.";
        if (!formData.pin) errors.pin = "PIN code is required.";

        setFormError(errors);
        toast.error("⚠️ Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const res = await loadScript();
      if (!res) {
        toast.error("😵 Razorpay SDK failed to load!");
        setLoading(false);
        return;
      }

      // console.log("data:", data);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderDetails.amount,
        currency: "INR",
        name: "Yuukke's MarketPlace",
        description: "Checkout Payment",
        order_id: orderDetails.r_order_id,
        handler: async function (response) {
          // 🚀 Show instant processing skeleton
          onProcessingStart?.();
          // toast.success("🎉 Payment Successful!", {
          //   position: "top-center",
          //   autoClose: 4000,
          // });
          // console.log("✅ Payment ID:", response.razorpay_payment_id);
          // console.log("✅ Order ID:", response.razorpay_order_id);
          // console.log("✅ Signature:", response.razorpay_signature);

          // ✅ Instantly show skeleton
          // setProcessingPayment(true);

          localStorage.setItem(
            "razorpay_payment_id",
            response.razorpay_payment_id
          );
          window.dispatchEvent(
            new CustomEvent("razorpayPaymentIdUpdated", {
              detail: response.razorpay_payment_id,
            })
          );
          localStorage.setItem("razorpay_order_id", response.razorpay_order_id);

          // 🧠 Get sale_id from stored order
          const storedOrder = JSON.parse(localStorage.getItem("order_id_data"));
          const sale_id = storedOrder?.sale_id;

          const cartId = localStorage.getItem("cart_id");

          const verificationPayload = {
            sale_id: orderDetails.sale_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            razorpay_order_id: response.razorpay_order_id,
            guest: true,
            name: formData.name,
            email: formData.email,
            phone: `91${formData.contact}`, // Add 91 prefix to the contact number
            cart_id: cartId,
          };

          // console.log(
          //   "📤 Verifying Payment with Payload:",
          //   verificationPayload
          // );

          try {
            const token = await getValidToken(); // 🧠 Comes from your useAuth()
            if (!token) {
              toast.error("🔐 Login required to verify payment.");
              return;
            }

            const verifyResponse = await fetch("/api/verifyRazor", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(verificationPayload),
            });

            const verifyResult = await verifyResponse.json();
            // console.log("✅ Payment Verified Response:", verifyResult);

            if (verifyResult?.status) {
              // ✅ Clear saved checkout form ONLY on successful payment
              try {
                localStorage.removeItem("checkout_form_v1"); // same as FORM_STORAGE_KEY
              } catch (err) {
                console.error("Error clearing saved checkout form:", err);
              }

              // Reset the fields in the UI
              if (typeof clearForm === "function") {
                clearForm();
              }

              // ✅ Go ahead with post-success actions
              onSuccess?.();
            } else {
              onFailure?.(); // 👈 Trigger failure screen

              toast.error(
                `❌ Verification Failed: ${
                  verifyResult?.message || "Unknown error"
                }`,
                {
                  position: "top-center",
                  autoClose: 5000,
                }
              );
            }
          } catch (verifyError) {
            console.error("❌ Verification Failed:", verifyError);
            toast.error(
              "🚨 Verification request failed. Check your connection or try again."
            );
            //   onFailure?.();
            // } finally {
            //   setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            // console.log(
            //   "⚠️ Payment modal closed by the user without completing payment."
            // );

            // Trigger failure flow
            onFailure?.();

            // Optional: show a toast
            toast.warning("⚠️ Payment was cancelled by you.", {
              position: "top-center",
              autoClose: 4000,
            });
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
        },
        remember: false,
        theme: {
          color: "#A00300",
        },
      };

      // console.log("🧾 Razorpay Prefill Data:", options.prefill);

      if (window.rzp) {
        window.rzp.close();
        window.rzp = null;
      }

      window.rzp = new window.Razorpay(options);
      window.rzp.open();
      // clearForm();
      setLoading(false);
    };

    return (
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {loading ? "Processing..." : `Pay ₹${total}`}
      </button>
    );
  }
);

RazorpayButton.displayName = "RazorpayButton"; // Necessary for forwardRef

export default RazorpayButton;
