"use client";
import { motion } from "framer-motion";

// Shown while isProcessingPayment && !paymentSuccess
export default function PaymentProcessingView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-0 text-center p-4 backdrop-blur-sm"
    >
      {/* 🌀 Skeleton Animation */}
      <div className="w-32 h-32 mx-auto bg-gray-200 animate-pulse rounded-full" />
      {/* Title Skeleton */}
      <div className="mt-4 w-64 h-8 bg-gray-200 mx-auto rounded-md animate-pulse" />
      {/* Button Skeleton */}
      <div className="mt-6 w-52 h-10 bg-gray-200 mx-auto rounded-full animate-pulse" />

      {/* Skeleton Card */}
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
        {/* Header */}
        <div className="bg-gray-300 animate-pulse p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="w-56 h-5 bg-gray-200 rounded" />
            <div className="w-40 h-3 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Ordered Items Skeleton */}
        <div className="divide-y divide-gray-200 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="w-14 h-14 bg-gray-200 rounded-md animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-1/3 h-3 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Payment Method Skeleton */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Price Summary Skeleton */}
        <div className="px-5 pb-4 text-sm space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
          <hr className="border-gray-300" />
          <div className="flex justify-between font-bold text-lg">
            <div className="w-32 h-5 bg-gray-300 rounded animate-pulse" />
            <div className="w-24 h-5 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
