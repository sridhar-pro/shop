"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MobileCartItems from "./MobileCartItems";
import MobilePriceSummary from "./MobilePriceSummary";

// 🔽 Collapsible "Order Summary ₹total" header at the top (mobile only).
export default function MobileSummaryAccordion({
  cartItems,
  customizedTexts,
  subtotal,
  tax,
  shipping,
  couponValue,
  total,
  limitedDealApplied,
  dealTimer,
}) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 pb-4 mb-4 lg:hidden">
      {/* 🔽 Header toggle for mobile */}
      <div
        className="flex items-center justify-between lg:hidden cursor-pointer"
        onClick={() => setIsSummaryOpen(!isSummaryOpen)}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-[400] tracking-tight">Order Summary</h1>
          {isSummaryOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>

        <span className="text-xl font-[800] text-gray-800">
          ₹{total.toFixed(2)}
        </span>
      </div>

      {/* 🧾 Content wrapper */}
      <div className={`space-y-6 ${!isSummaryOpen ? "hidden" : ""} lg:block`}>
        <MobileCartItems cartItems={cartItems} customizedTexts={customizedTexts} />

        <MobilePriceSummary
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          couponValue={couponValue}
          total={total}
          limitedDealApplied={limitedDealApplied}
          dealTimer={dealTimer}
          showCouponDiscount={false}
        />
      </div>
    </div>
  );
}
