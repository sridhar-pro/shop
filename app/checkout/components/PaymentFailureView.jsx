"use client";
import { motion } from "framer-motion";
import { RefreshCcw, ShoppingBag } from "lucide-react";
import { getImageSrc } from "../lib/checkoutHelpers";

// Shown when paymentFailure is true.
// onContinue: go home + clear cart items. onRetry: back to normal checkout.
export default function PaymentFailureView({
  idordered,
  orderDate,
  cartItems,
  subtotal,
  tax,
  shipping,
  total,
  onContinue,
  onRetry,
}) {
  return (
    <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
      >
        <motion.img
          src="/Failure.gif" // make sure the gif itself is non-looping!
          alt="Success Animation"
          title="Success Animation"
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, type: "spring", stiffness: 80 }}
          className="w-32 h-32 mx-auto  object-contain"
        />

        {/* Title and message */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-3xl font-bold text-black capitalize"
        >
          Payment Failed !
        </motion.h1>

        <button
          onClick={onContinue}
          className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
        >
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
        </button>

        {/* Retry Payment */}
        <button
          onClick={onRetry}
          className="mt-4 ml-3 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-md"
        >
          <RefreshCcw className="w-5 h-5" />
          Retry Payment
        </button>

        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
          {/* Header */}
          <div className="bg-red-600 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-semibold text-xl text-left uppercase">
                Order ID :{" "}
                <span className="">{idordered || "Not Available"}</span>
              </p>
              <p className="text-xs mt-1 text-left text-yellow-200">
                Order Date : <span className="font-medium">{orderDate}</span>
              </p>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  title={item.name}
                  className="w-14 h-14 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p
                    className="font-medium text-sm text-left"
                    dangerouslySetInnerHTML={{ __html: item.name }}
                  />
                </div>
                <div className="text-right px-5">
                  <p className="text-sm mt-1 text-right">
                    ₹
                    {(
                      Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                      Number(item.qty)
                    ).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-3 border-gray-200" />

          {/* Price Summary */}
          <div className="px-5 pb-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Item cost</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping fee</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>

            <hr className="border-gray-300" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Cost</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
