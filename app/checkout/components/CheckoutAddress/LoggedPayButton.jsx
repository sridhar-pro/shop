"use client";
import RazorpayButtonLogged from "../../RazorpayButtonLogged";
import CashfreeButton from "../../CashfreeButton";
import useShippingUpdating from "../../lib/useShippingUpdating";

// "Pay Now" + hidden gateway buttons that useLoggedPay clicks programmatically.
export default function LoggedPayButton({
  handleOrderAndPayLogged,
  selectedAddressId,
  isProcessing,
  razorRef,
  cashfreeRef,
  orderDetails,
  total,
  onSuccess,
  onFailure,
}) {
  // Pay stays disabled until the new shipping price is fully applied
  const shippingUpdating = useShippingUpdating();

  return (
    <div className="mt-6">
      <button
        onClick={handleOrderAndPayLogged}
        disabled={!selectedAddressId || isProcessing || shippingUpdating}
        className={`py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 
      ${
        selectedAddressId && !shippingUpdating
          ? "bg-black text-white hover:bg-gray-900 cursor-pointer"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
        title={
          !selectedAddressId
            ? "Select an address"
            : shippingUpdating
              ? "Updating shipping..."
              : ""
        }
      >
        {isProcessing
          ? "Processing..."
          : shippingUpdating
            ? "Updating shipping..."
            : "Pay Now"}
      </button>

      {/* Hidden RazorpayButton for manual trigger */}
      <div style={{ display: "none" }}>
        <RazorpayButtonLogged
          ref={razorRef}
          total={total}
          onSuccess={onSuccess}
          onFailure={onFailure}
          orderDetails={orderDetails}
        />
      </div>
      <div style={{ display: "none" }}>
        <CashfreeButton
          ref={cashfreeRef}
          orderDetails={orderDetails}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </div>
    </div>
  );
}
