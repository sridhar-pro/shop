"use client";
import { motion } from "framer-motion";

// "Available offers" cards with Apply buttons + coupon message.
// Renders nothing when there are no active offers.
export default function GuestOfferCards({
  offers,
  couponSource,
  appliedOfferCode,
  handleApplyOfferCode,
  isApplyingRef,
  couponMessage,
  isManualCouponApplied,
}) {
  // ✅ Filter only ACTIVE offers (status null / 0)
  const filteredOffers = (offers || []).filter(
    (offer) =>
      offer.status === null || offer.status === "0" || offer.status === 0,
  );

  if (filteredOffers.length === 0) return null;

  return (
    <div className="mt-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="15"
          height="15"
          viewBox="0 0 20 20"
          fill="none"
          className="flex-shrink-0"
        >
          <path
            d="M17 9L11 3H3v8l6 6 8-8z"
            stroke="#A00300"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="7.5" cy="7.5" r="1.4" fill="#A00300" />
        </svg>
        <h2 className="text-[13px] font-medium text-gray-900 tracking-[0.01em]">
          Available offers
        </h2>
        <span className="ml-auto text-[10.5px] font-medium text-[#A00300] bg-[#FEF2F2] rounded-full px-2.5 py-0.5">
          {filteredOffers.length}{" "}
          {filteredOffers.length === 1 ? "offer" : "offers"}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {filteredOffers.map((offer, index) => {
          const isAppliedOffer =
            couponSource === "offer" && appliedOfferCode === offer.code;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.32,
                ease: "easeOut",
              }}
              className={`relative overflow-hidden rounded-2xl border flex items-center gap-3 px-4 py-3.5 group transition-all duration-200 ${
                isAppliedOffer
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:-translate-y-px hover:border-[#A00300]"
              }`}
            >
              {/* Left accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-[#A00300] transition-opacity duration-200 ${
                  isAppliedOffer
                    ? "opacity-0"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />

              {/* Hover shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A00300]/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />

              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors duration-250 ${
                  isAppliedOffer ? "bg-green-100" : "bg-[#FEF2F2]"
                }`}
              >
                {isAppliedOffer ? (
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="#15803D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                      stroke="#A00300"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                      isAppliedOffer
                        ? "bg-green-500"
                        : "bg-[#A00300] animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-[9.5px] font-medium uppercase tracking-[0.09em] ${
                      isAppliedOffer ? "text-green-600" : "text-[#A00300]"
                    }`}
                  >
                    {isAppliedOffer ? "Applied" : "Special offer"}
                  </span>
                </div>
                <p className="text-[13px] font-bold text-gray-800 mt-0.5 leading-snug uppercase">
                  {offer.reference || "Save more on your order"}
                </p>
              </div>

              {/* Divider */}
              <div className="w-px h-7 bg-gray-200 flex-shrink-0" />

              {/* Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleApplyOfferCode(offer.code)}
                disabled={isAppliedOffer || isApplyingRef.current}
                className={`flex-shrink-0 text-[11.5px] font-medium px-[14px] py-[7px] rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap ${
                  isAppliedOffer
                    ? "bg-green-50 text-green-700 border-green-300 cursor-default"
                    : "bg-transparent text-[#A00300] border-[#A00300] hover:bg-[#A00300] hover:text-white"
                }`}
              >
                {isAppliedOffer ? "Applied ✓" : "Apply"}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Coupon message (error or success) */}
      {couponMessage && (
        <p
          className={`text-xs font-medium mt-4 px-2 ${
            isManualCouponApplied ? "text-green-600" : "text-red-500"
          }`}
        >
          {couponMessage}
        </p>
      )}
    </div>
  );
}
