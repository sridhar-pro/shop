"use client";
import { motion } from "framer-motion";

// "Available offers" cards for logged-in checkout (md:hidden).
// Applied state = the server's coupon (appliedCoupon) matches offer.code.
export default function LoggedOfferCards({
  offers,
  appliedCoupon,
  handleApplyOfferCode,
  isApplyingRef,
  couponMessage,
  isApplied,
}) {
  // ✅ Filter only ACTIVE offers (status null / 0)
  const filteredOffers = (offers || []).filter(
    (offer) =>
      offer.status === null || offer.status === "0" || offer.status === 0,
  );

  if (filteredOffers.length === 0) return null;

  return (
    <div className="mt-6 mb-6 block md:hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          width="16"
          height="16"
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
          <circle cx="7.5" cy="7.5" r="1.5" fill="#A00300" />
        </svg>
        <h2 className="text-[15px] font-medium text-gray-900 tracking-[0.01em]">
          Available offers
        </h2>
        <span className="ml-auto text-[11px] font-medium text-[#A00300] bg-[#FEF2F2] rounded-full px-2.5 py-0.5">
          {filteredOffers.length}{" "}
          {filteredOffers.length === 1 ? "offer" : "offers"}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5">
        {filteredOffers.map((offer, index) => {
          const isAppliedOffer = appliedCoupon === offer.code;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.09,
                duration: 0.32,
                ease: "easeOut",
              }}
              className={`relative overflow-hidden rounded-[18px] border flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ${
                isAppliedOffer
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white active:scale-[0.985]"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                  isAppliedOffer ? "bg-green-100" : "bg-[#FEF2F2]"
                }`}
              >
                {isAppliedOffer ? (
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M4 10l4 4 8-8"
                      stroke="#15803D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
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
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isAppliedOffer
                        ? "bg-green-500"
                        : "bg-[#A00300] animate-pulse"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium uppercase tracking-[0.09em] ${
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
              <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

              {/* Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleApplyOfferCode(offer.code)}
                disabled={isAppliedOffer || isApplyingRef.current}
                className={`flex-shrink-0 text-[12px] font-medium px-4 py-2 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap ${
                  isAppliedOffer
                    ? "bg-green-50 text-green-700 border-green-300 cursor-default"
                    : "bg-transparent text-[#A00300] border-[#A00300] active:bg-[#A00300] active:text-white"
                }`}
              >
                {isAppliedOffer ? "Applied ✓" : "Apply"}
              </motion.button>
            </motion.div>
          );
        })}

        {/* Coupon message (error or success) */}
        {couponMessage && (
          <p
            className={`text-xs font-medium mt-1 mb-3 px-2 ${
              isApplied ? "text-green-600" : "text-red-500"
            }`}
          >
            {couponMessage}
          </p>
        )}
      </div>
    </div>
  );
}
