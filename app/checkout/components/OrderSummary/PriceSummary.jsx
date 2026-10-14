"use client";
import { Timer } from "lucide-react";
import ShippingAmount from "../../lib/ShippingAmount";

// 📦 Subtotal / shipping / discount / total (+ Hot Deal badge, strike-through, countdown)
export default function PriceSummary({
  subtotal,
  tax,
  shipping,
  couponValue,
  total,
  limitedDealApplied,
  dealTimer,
}) {
  return (
    <div className="border-t pt-4 space-y-2 text-sm">
      <div className="flex justify-between items-start">
        <span>Subtotal</span>

        <div className="flex flex-col items-end">
          <span>₹{subtotal.toFixed(2)}</span>
          <span className="text-xs text-gray-500">
            (Incl. GST ₹{tax.toFixed(2)})
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <span>Shipping</span>
        <span>
          <ShippingAmount value={shipping} />
        </span>
      </div>

      {/* Hot Deal already shows its own strike-through + "saved" line below */}
      {couponValue > 0 && !limitedDealApplied && (
        <div className="flex justify-between text-green-600">
          <span>Discount price</span>
          <span>- ₹{couponValue.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between pt-2 items-start">
        <div className="flex flex-col">
          <span className="font-bold text-lg flex items-center gap-2">
            Total
            {limitedDealApplied && (
              <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-amber-500/10 text-[#A00300] border border-amber-400/40">
                Hot Deal
              </span>
            )}
          </span>

          {limitedDealApplied && (
            <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
              {/* Old total slashed */}
              <span className="line-through text-gray-500">
                ₹{(total + (couponValue || 100)).toFixed(2)}
              </span>

              {/* Savings */}
              <span className="text-red-700 tracking-wider font-semibold">
                -₹{(couponValue || 100).toFixed(2)} saved
              </span>
            </div>
          )}
        </div>

        <div className="text-right flex flex-col items-end">
          {/* Final total */}
          <span
            className={`font-bold ${
              limitedDealApplied ? "text-green-600 text-xl" : "text-lg"
            }`}
          >
            ₹{total.toFixed(2)}
          </span>

          {limitedDealApplied && (
            <span className="mt-1 text-[13px] font-semibold text-[#A00300] tracking-wide flex items-center gap-1">
              <Timer className="w-4 h-4 text-[#A00300]" />
              {Math.floor(dealTimer / 60)
                .toString()
                .padStart(2, "0")}
              :{(dealTimer % 60).toString().padStart(2, "0")} left
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Including ₹{tax.toFixed(2)} in taxes
      </p>
    </div>
  );
}
