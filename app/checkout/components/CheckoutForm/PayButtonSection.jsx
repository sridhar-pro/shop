"use client";
import RazorpayButton from "../../RazorpayButton";
import CashfreeButton from "../../CashfreeButton";
import useShippingUpdating from "../../lib/useShippingUpdating";

// "Proceed to Pay" + the hidden gateway buttons that useOrderAndPay clicks
// programmatically via razorRef / cashfreeRef.
export default function PayButtonSection({
  handleOrderAndPay,
  isProcessing,
  razorRef,
  cashfreeRef,
  orderDetails,
  total,
  formData,
  clearForm,
  formError,
  setFormError,
  onPaymentSuccess,
  onProcessingStart,
  onPaymentFailure,
}) {
  // Pay stays disabled until the new shipping price is fully applied
  const shippingUpdating = useShippingUpdating();

  return (
    <div className="mt-6">
      {/* Trigger */}
      <button
        onClick={handleOrderAndPay}
        disabled={isProcessing || shippingUpdating}
        className={`py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 
    ${
      isProcessing || shippingUpdating
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-900"
    }
  `}
      >
        {isProcessing
          ? "Processing..."
          : shippingUpdating
            ? "Updating shipping..."
            : "Proceed to Pay"}
      </button>

      {/* Hidden RazorpayButton for manual trigger */}
      <div style={{ display: "none" }}>
        <RazorpayButton
          ref={razorRef}
          total={total}
          formData={formData}
          clearForm={clearForm}
          onSuccess={onPaymentSuccess}
          onProcessingStart={onProcessingStart}
          onFailure={onPaymentFailure}
          formError={formError}
          setFormError={setFormError}
          orderDetails={orderDetails}
        />
      </div>
      <div style={{ display: "none" }}>
        <CashfreeButton
          ref={cashfreeRef}
          orderDetails={orderDetails}
          formData={formData}
          onSuccess={onPaymentSuccess}
          onFailure={onPaymentFailure}
          onProcessingStart={onProcessingStart}
        />
      </div>
    </div>
  );
}
