"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Truck } from "lucide-react";
import { getImageSrc } from "../../lib/checkoutHelpers";

const decodeHTML = (str) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

// 🛍 Cart items (image + qty badge, price, delivery days, trash, custom print)
export default function CartItemsList({
  cartItems,
  customizedTexts,
  processingItems,
  onRemove,
}) {
  return (
    <AnimatePresence>
      {cartItems.map((item) => (
        <motion.div
          key={item.rowid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="border-b border-gray-200 py-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Image + Badge */}
              <div className="relative flex-shrink-0">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  title={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />

                {/* Quantity Badge */}
                <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-gray-300 text-gray-700 text-[11px] font-semibold min-w-[18px] h-[18px] px-[4px] flex items-center justify-center rounded-full shadow-sm">
                  {item.qty}
                </span>
              </div>

              <div>
                <p
                  className={`text-sm font-medium ${
                    item.code?.includes("FREE") || item.is_free_item
                      ? "text-green-700"
                      : "text-gray-900"
                  }`}
                >
                  {decodeHTML(item.name)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ₹{(item.price * item.qty).toFixed(2)}
                </p>

                {item.deliveryDays && (
                  <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Delivered in {item.deliveryDays} days
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onRemove(item.rowid)}
              className="text-gray-500 hover:text-black transition p-1 flex items-center justify-center w-6 h-6"
              disabled={processingItems[item.rowid]}
            >
              {processingItems[item.rowid] ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* ✅ Custom Print Text */}
          {customizedTexts[item.rowid] && (
            <div className="mt-2 ml-20 px-3 py-2 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300] mb-0.5">
                Custom Print
              </p>
              <p className="text-xs font-medium text-gray-900 break-words">
                "{customizedTexts[item.rowid]}"
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
