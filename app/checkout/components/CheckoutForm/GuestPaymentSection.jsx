"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Wallet2 } from "lucide-react";

// "Payment" heading + Razorpay radio row + payment icons + info panel.
export default function GuestPaymentSection({
  selectedMethod,
  showInfo,
  handleRadioChange,
  handleToggle,
}) {
  return (
    <div className="">
      <h1 className="text-xl font-[800] tracking-tight">Payment</h1>
      <p className="text-gray-400 text-xs">
        All transactions are secure and encrypted.
      </p>

      <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
        <label
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between "
          onClick={handleToggle}
        >
          <div className="flex items-start gap-2 sm:items-center">
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={selectedMethod === "razorpay"}
              onChange={handleRadioChange}
              className="accent-black w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
            />
            <span className="text-sm font-medium">
              Razorpay Secure
              <br className="block sm:hidden" />
              <br className="hidden lg:block" />
              <span className="text-xs text-gray-600">
                (UPI, Cards, Wallets, NetBanking)
              </span>
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2 justify-end sm:justify-normal">
            <img
              src="/upi.svg"
              alt="UPI"
              title="UPI"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <img
              src="/visa.svg"
              alt="Visa"
              title="Visa"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <img
              src="/master.svg"
              alt="Master"
              title="Master"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <img
              src="/rupay.svg"
              alt="Rupay"
              title="Rupay"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <div className="relative group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer group-hover:bg-gray-200">
                +16
              </div>
              <div className="absolute bottom-12 right-0 hidden group-hover:grid grid-cols-4 gap-2 bg-black shadow-xl rounded-lg border p-2 z-20 w-[176px]">
                {Array.from({ length: 16 }).map((_, i) => (
                  <img
                    key={i}
                    src={`/${i + 1}.svg`}
                    alt={`Payment ${i + 1}`}
                    title={`Supported Payment Method ${i + 1}`}
                    className="w-7 h-7 object-contain"
                  />
                ))}
              </div>
            </div>
          </div>
        </label>

        <AnimatePresence initial={false}>
          <motion.div
            key={showInfo ? "visible" : "hidden"}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              marginBottom: showInfo ? 16 : 0, // Prevents button jump
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {showInfo && (
              <div className="border-t pt-4 mt-6 text-center bg-gray-50">
                <div className="flex justify-center mb-3">
                  <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                  After clicking “Pay now”, you'll be redirected to Razorpay
                  Payment Gateway to securely complete your purchase using UPI,
                  Cards, Wallets or NetBanking.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
