"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/AuthContext";
import { useSession } from "../context/SessionContext";
import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm";
import { createFetchWithAuth } from "./lib/checkoutHelpers";
import useCheckoutSummary from "./components/useCheckoutSummary";
import useOrderIdentifiers from "./components/useOrderIdentifiers";
import usePaymentSuccess from "./components/usePaymentSuccess";
import PaymentProcessingView from "./components/PaymentProcessingView";
import PaymentSuccessView from "./components/PaymentSuccessView";
import PaymentFailureView from "./components/PaymentFailureView";
import { unfreezeHotDeal } from "./lib/hotDealEngine";

// Orchestrator only: wires hooks + decides which view to show.
//   summary / totals      -> useCheckoutSummary
//   payment + order ids   -> useOrderIdentifiers
//   post-payment effects  -> usePaymentSuccess
//   screens               -> Payment{Processing,Success,Failure}View
export default function CheckoutPage({ formData }) {
  const router = useRouter();
  const { getValidToken } = useAuth();
  const { isLoggedIn } = useSession();

  const fetchWithAuth = createFetchWithAuth(getValidToken);

  const {
    cartItems,
    setCartItems,
    subtotal,
    shipping,
    tax,
    total,
    customizedTexts,
  } = useCheckoutSummary({ fetchWithAuth });

  const { paymentId, idordered } = useOrderIdentifiers();

  const [orderData, setOrderData] = useState(null);

  // Props still handed to <OrderSummary /> (unchanged from before)
  const [showInfo, setShowInfo] = useState(true);
  const handleToggle = () => setShowInfo((prev) => !prev);
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const handleRadioChange = (e) => setSelectedMethod(e.target.value);

  const orderDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ── Payment state machine ────────────────────────────────────────────────
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState(false);

  const handleProcessingStart = () => {
    setIsProcessingPayment(true);
    setPaymentFailure(false);

    // 🧹 clear old order
    setOrderData(null);
    localStorage.removeItem("order_success_details");
  };

  const handlePaymentSuccess = () => {
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
  };

  const handlePaymentFailure = () => {
    unfreezeHotDeal(); // payment failed → the customer is back to deciding; deal may continue
    setIsProcessingPayment(false);
    setPaymentFailure(true);
  };

  useEffect(() => {
    if (isProcessingPayment && !paymentSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isProcessingPayment, paymentSuccess]);

  useEffect(() => {
    if (paymentFailure) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  usePaymentSuccess({
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
  });

  // ── Screen actions ───────────────────────────────────────────────────────
  const handleSuccessContinue = () => {
    localStorage.removeItem("checkout_name");
    localStorage.removeItem("checkout_email");
    localStorage.removeItem("checkout_contact");
    localStorage.removeItem("applied_coupon");
    localStorage.removeItem("last_applied_coupon");
    localStorage.removeItem("cart_coupon_value");
    setCartItems([]);
    router.push("/");
  };

  const handleFailureContinue = () => {
    router.push("/");
    setCartItems([]);
  };

  const handleRetryPayment = () => {
    setPaymentFailure(false); // go back to normal checkout
  };

  return (
    <div className="min-h-screen bg-gray-100 font-odop">
      {isProcessingPayment && !paymentSuccess ? (
        <PaymentProcessingView />
      ) : paymentSuccess ? (
        <PaymentSuccessView
          orderData={orderData}
          idordered={idordered}
          orderDate={orderDate}
          cartItems={cartItems}
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          total={total}
          onContinue={handleSuccessContinue}
        />
      ) : paymentFailure ? (
        <PaymentFailureView
          idordered={idordered}
          orderDate={orderDate}
          cartItems={cartItems}
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          total={total}
          onContinue={handleFailureContinue}
          onRetry={handleRetryPayment}
        />
      ) : (
        // 🧾 Normal checkout layout (split screen)
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row min-h-screen lg:min-h-screen">
          <div className="w-full min-h-[70vh] flex justify-center bg-transparent">
            {/* Left: Scrollable Form Section */}
            <CheckoutForm
              total={total}
              onPaymentSuccess={handlePaymentSuccess}
              onProcessingStart={handleProcessingStart}
              onPaymentFailure={handlePaymentFailure}
              cartItems={cartItems}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              customizedTexts={customizedTexts}
            />

            {/* Right: Sticky Summary */}
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              total={total}
              tax={tax}
              shipping={shipping}
              selectedMethod={selectedMethod}
              handleRadioChange={handleRadioChange}
              handleToggle={handleToggle}
              showInfo={showInfo}
            />
          </div>
        </div>
      )}
    </div>
  );
}
