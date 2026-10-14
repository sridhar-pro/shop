"use client";
import { Truck } from "lucide-react";
import { getImageSrc } from "../../lib/checkoutHelpers";

// Cart items as shown in the mobile summaries (top accordion and the
// block above the payment section — the markup was identical in both).
export default function MobileCartItems({ cartItems, customizedTexts }) {
  return (
    <>
      {cartItems.map((item) => (
        <div key={item.rowid} className="flex items-start gap-4 mt-6">
          <img
            src={getImageSrc(item.image)}
            alt={item.name}
            title={item.name}
            className="w-16 h-16 rounded-md object-cover"
          />

          <div className="flex-1">
            <p className="text-sm font-medium">
              <span dangerouslySetInnerHTML={{ __html: item.name }} /> <br />x{" "}
              {item.qty}
            </p>

            <p className="text-sm mt-1 text-right">
              ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
            </p>

            {item.deliveryDays && (
              <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-red-700" />
                Delivered in {item.deliveryDays} days
              </p>
            )}

            {/* ✅ Custom Print */}
            {customizedTexts?.[item.rowid] && (
              <div className="mt-2 px-2 py-1 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300]">
                  Custom Print
                </p>
                <p className="text-xs font-medium text-gray-800 break-words">
                  “{customizedTexts[item.rowid]}”
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
