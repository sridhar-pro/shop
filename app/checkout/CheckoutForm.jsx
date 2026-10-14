"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/utils/AuthContext";
import { useSession } from "../context/SessionContext";
import CheckoutAddress from "./CheckoutAddress";
import { createFetchWithAuth } from "./lib/checkoutHelpers";
import useCheckoutFormData from "./components/CheckoutForm/useCheckoutFormData";
import useCheckoutCoupon from "./components/CheckoutForm/useCheckoutCoupon";
import useCheckoutLimitedDeal from "./components/CheckoutForm/useCheckoutLimitedDeal";
import useCheckoutOffers from "./components/CheckoutForm/useCheckoutOffers";
import useOrderAndPay from "./components/CheckoutForm/useOrderAndPay";
import MobileSummaryAccordion from "./components/CheckoutForm/MobileSummaryAccordion";
import GuestDetailsForm from "./components/CheckoutForm/GuestDetailsForm";
import MobileCheckoutSummary from "./components/CheckoutForm/MobileCheckoutSummary";
import GuestPaymentSection from "./components/CheckoutForm/GuestPaymentSection";
import PayButtonSection from "./components/CheckoutForm/PayButtonSection";

// Orchestrator only. Where to look when debugging:
//   form fields / persistence / history save -> useCheckoutFormData (+ useHistorySaver)
//   PIN -> shipping                          -> usePincodeLookup
//   coupon input + offer apply               -> useCheckoutCoupon
//   Hot Deal timer                           -> useCheckoutLimitedDeal
//   offers + BOGO                            -> useCheckoutOffers
//   Proceed to Pay                           -> useOrderAndPay
//   UI                                       -> checkout/CheckoutForm/*.jsx
const CheckoutForm = ({
  onPaymentSuccess,
  onProcessingStart,
  onPaymentFailure,
  cartItems = [],
  subtotal = 0,
  total,
  tax = 0,
  shipping = 0,
  customizedTexts,
}) => {
  const { getValidToken, isAuthReady } = useAuth();
  const { isLoggedIn } = useSession();
  const fetchWithAuth = createFetchWithAuth(getValidToken);

  useEffect(() => {
    console.log("🧪 [CheckoutForm] customizedTexts:", customizedTexts);
    console.log("🧪 [CheckoutForm] cartItems:", cartItems);
  }, [customizedTexts, cartItems]);

  const {
    formData,
    formError,
    setFormError,
    formRef,
    handleChange,
    clearForm,
    onNameBlur,
    scrollToFirstError,
  } = useCheckoutFormData({ fetchWithAuth });

  const coupon = useCheckoutCoupon({ fetchWithAuth });

  const { limitedDealApplied, dealTimer } = useCheckoutLimitedDeal({
    fetchWithAuth,
    getValidToken,
    setCouponValue: coupon.setCouponValue,
  });

  const offersState = useCheckoutOffers({ fetchWithAuth });

  const {
    razorRef,
    cashfreeRef,
    isProcessing,
    orderDetails,
    handleOrderAndPay,
  } = useOrderAndPay({
    formData,
    setFormError,
    scrollToFirstError,
    fetchWithAuth,
    getValidToken,
    isAuthReady,
    total,
    cartItems,
  });

  // Payment method radio + info panel
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  return (
    <div className="flex-1 order-1 lg:order-none overflow-y-auto px-6 lg:px-12 py-6 lg:py-8 scrollbar-hide">
      {/* mob-only collapsible summary */}
      <MobileSummaryAccordion
        cartItems={cartItems}
        customizedTexts={customizedTexts}
        subtotal={subtotal}
        tax={tax}
        shipping={shipping}
        couponValue={coupon.couponValue}
        total={total}
        limitedDealApplied={limitedDealApplied}
        dealTimer={dealTimer}
      />

      <div ref={formRef} className="space-y-6 pb-0 md:pb-16">
        {/* Contact Section */}
        <div className="relative">
          {isLoggedIn && (
            <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
          )}
          <CheckoutAddress
            cartItems={cartItems}
            subtotal={subtotal}
            total={total}
            tax={tax}
            shipping={shipping}
            onSuccess={onPaymentSuccess}
            onFailure={onPaymentFailure}
            customizedTexts={customizedTexts}
          />
        </div>

        {/* Everything below is hidden if user is logged in */}
        {!isLoggedIn && (
          <>
            <GuestDetailsForm
              formData={formData}
              handleChange={handleChange}
              formError={formError}
              setFormError={setFormError}
              onNameBlur={onNameBlur}
              isAuthReady={isAuthReady}
              getValidToken={getValidToken}
            />

            <MobileCheckoutSummary
              cartItems={cartItems}
              customizedTexts={customizedTexts}
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
              coupon={coupon}
              offersState={offersState}
              limitedDealApplied={limitedDealApplied}
              dealTimer={dealTimer}
            />

            <GuestPaymentSection
              selectedMethod={selectedMethod}
              showInfo={showInfo}
              handleRadioChange={handleRadioChange}
              handleToggle={handleToggle}
            />

            <PayButtonSection
              handleOrderAndPay={handleOrderAndPay}
              isProcessing={isProcessing}
              razorRef={razorRef}
              cashfreeRef={cashfreeRef}
              orderDetails={orderDetails}
              total={total}
              formData={formData}
              clearForm={clearForm}
              formError={formError}
              setFormError={setFormError}
              onPaymentSuccess={onPaymentSuccess}
              onProcessingStart={onProcessingStart}
              onPaymentFailure={onPaymentFailure}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
