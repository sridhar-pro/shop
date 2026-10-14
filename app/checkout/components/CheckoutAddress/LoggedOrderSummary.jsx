"use client";
import { Truck } from "lucide-react";
import { getImageSrc } from "../../lib/checkoutHelpers";
import MobilePriceSummary from "./MobilePriceSummary";

// Order summary shown under the Payment card on mobile (lg:hidden):
// heading, cart items, discount input, price summary.
// Item markup differs slightly from the guest version (plain-text names),
// so it stays local here.
export default function LoggedOrderSummary({
  cartItems,
  customizedTexts,
  subtotal,
  tax,
  shipping,
  total,
  coupon, // useAddressCouponState()
  setAppliedCoupon,
  handleApply,
  limitedDealApplied,
  dealTimer,
}) {
  const {
    code,
    setCode,
    couponMessage,
    setCouponMessage,
    couponValue,
    isApplied,
    setIsApplied,
  } = coupon;

  return (
    <div className=" block lg:hidden">
      <h1 className="text-xl font-[800] tracking-tight mt-8">Order Summary</h1>

      {/* 🛍 Cart Items */}
      {cartItems.map((item) => (
        <div key={item.rowid} className="flex items-start gap-4 mt-6 mb-4">
          <img
            src={getImageSrc(item.image)}
            alt={item.name}
            title={item.name}
            className="w-16 h-16 rounded-md object-cover"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {item.name} <br /> x {item.qty}
            </p>
            <p className="text-sm mt-1 text-right">
              ₹
              {(
                Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                Number(item.qty)
              ).toFixed(2)}
            </p>
            {item.deliveryDays && (
              <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-red-700" />
                Delivered in {item.deliveryDays} days
              </p>
            )}

            {/* ✍️ Custom Print */}
            {customizedTexts?.[item.rowid] && (
              <div className="mt-2 px-2 py-1 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300]">
                  Custom Print
                </p>
                <p className="text-xs font-medium text-gray-800 break-words">
                  "{customizedTexts[item.rowid]}"
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 🎁 Discount Input */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Discount code"
            value={code}
            onChange={(e) => {
              const newCode = e.target.value;

              if (newCode !== code) {
                setIsApplied(false);
                setCouponMessage("");
                // couponValue stays: the server discount is still applied
                setAppliedCoupon("");
              }

              setCode(newCode);
            }}
            className="input flex-1 bg-white"
          />

          <div className="flex flex-col items-center relative">
            <button
              // arrow fn: don't let the click event become `overrideCode`
              onClick={() => handleApply()}
              disabled={isApplied}
              className={`bg-gray-200 text-sm font-bold p-4 rounded-md relative z-10 transition-all duration-200 ${
                isApplied ? "text-green-600" : "text-gray-600"
              }`}
            >
              {isApplied ? "Applied" : "Apply"}
            </button>
          </div>
        </div>

        {/* Coupon message (error or success) */}
        {couponMessage && (
          <p
            className={`text-xs font-medium mt-1 ${
              isApplied ? "text-green-600" : "text-red-500"
            }`}
          >
            {couponMessage}
          </p>
        )}
      </div>

      {/* 📦 Summary */}
      <MobilePriceSummary
        subtotal={subtotal}
        tax={tax}
        shipping={shipping}
        couponValue={couponValue}
        total={total}
        limitedDealApplied={limitedDealApplied}
        dealTimer={dealTimer}
        showCouponDiscount
        couponLabel="Coupon Discount"
      />
    </div>
  );
}
