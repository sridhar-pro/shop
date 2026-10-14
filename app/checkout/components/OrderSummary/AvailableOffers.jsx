"use client";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

// 🎯 Available offers: BOGO cards (always visible) + coupon offers
// (inside "View coupon offers" toggle).
// showAllOffers stays in the parent on purpose: the parent unmounts this block
// during the skeleton refresh, and the toggle must survive that.
export default function AvailableOffers({
  offers,
  bogoOffers,
  appliedOffers,
  applyingOffer,
  applyBogoOffer,
  couponSource,
  appliedOfferCode,
  handleApplyOfferCode,
  isApplyingRef,
  showAllOffers,
  setShowAllOffers,
}) {
  // ✅ Filter only ACTIVE offers (status null / 0)
  const filteredOffers = (offers || []).filter(
    (offer) =>
      offer.status === null || offer.status === "0" || offer.status === 0,
  );

  const visibleOffers = showAllOffers
    ? filteredOffers
    : filteredOffers.slice(0, 2);

  return (
    <>
      {(filteredOffers.length > 0 || bogoOffers.length > 0) && (
        <div className="mt-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-[22px] h-[22px] rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13 7L9 3H3v6l4 4 6-6z"
                  stroke="#A00300"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="6" cy="6" r="1.2" fill="#A00300" />
              </svg>
            </div>

            <span className="text-[13px] font-medium text-gray-800">
              Available offers
            </span>

            <span className="ml-auto text-[11px] font-medium text-[#A00300] bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
              {filteredOffers.length + bogoOffers.length} offers
            </span>
          </div>

          {/* 🔥 BOGO → SHOWN BY DEFAULT */}
          {bogoOffers.length > 0 && (
            <div className="space-y-4">
              {bogoOffers.map((offer) => {
                const isOfferApplied = appliedOffers.includes(offer.id);

                return (
                  <div
                    key={offer.id}
                    className="relative flex bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-[#A00300] to-red-700 flex items-center justify-center">
                      <span className="text-[26px] font-extrabold text-white transform -rotate-90 whitespace-nowrap tracking-wider uppercase italic shadow-md">
                        {offer.title}
                      </span>
                    </div>

                    <div className="flex-1 pl-20 p-5">
                      <div className="flex justify-between items-start capitalize mb-3">
                        <span
                          className="font-bold text-sm text-gray-600 text-justify"
                          dangerouslySetInnerHTML={{
                            __html: offer.description,
                          }}
                        />

                        <button
                          className={`text-xs font-semibold text-white px-3 py-1 rounded-lg shadow transition-colors ml-4 shrink-0
                    ${
                      isOfferApplied
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-[#A00300] hover:bg-red-700"
                    }`}
                          onClick={() =>
                            !isOfferApplied && applyBogoOffer(offer.id)
                          }
                          disabled={applyingOffer || isOfferApplied}
                        >
                          {isOfferApplied
                            ? "APPLIED"
                            : applyingOffer
                              ? "Applying"
                              : "APPLY"}
                        </button>
                      </div>

                      <hr className="my-3 border-dashed border-gray-300" />

                      <details className="mt-2 group">
                        <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-[#A00300] flex items-center gap-1">
                          <Link
                            href="/products/special-offers"
                            title="Special Offers"
                            className="hover:text-[#A00300] flex items-center gap-1"
                          >
                            <TrendingUp className="w-4 h-4 text-[#A00300]" />
                            Eligible Products
                          </Link>
                        </summary>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 🎁 NORMAL OFFERS → INSIDE VIEW MORE */}
          {showAllOffers && filteredOffers.length > 0 && (
            <div className="flex flex-col gap-2.5 mt-6">
              {visibleOffers.map((offer, index) => {
                const isThisOfferApplied =
                  couponSource === "offer" && appliedOfferCode === offer.code;

                return (
                  <div
                    key={offer.id}
                    onClick={() =>
                      !isThisOfferApplied && handleApplyOfferCode(offer.code)
                    }
                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-[18px] overflow-hidden border transition-all duration-200 cursor-pointer
              ${
                isThisOfferApplied
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:border-[#A00300]"
              }`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex-1">
                      <p className="text-[10px] font-medium uppercase text-[#A00300]">
                        {isThisOfferApplied ? "Applied" : "Special offer"}
                      </p>

                      <p className="text-[13px] font-bold uppercase">
                        {offer.reference}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyOfferCode(offer.code);
                      }}
                      disabled={isApplyingRef.current}
                      className="text-[12px] px-4 py-1.5 rounded-md border border-[#A00300] text-[#A00300] hover:bg-[#A00300] hover:text-white"
                    >
                      {isThisOfferApplied ? "Applied ✓" : "Apply"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Toggle */}
      {filteredOffers.length > 0 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => setShowAllOffers((prev) => !prev)}
            className="text-[12px] font-medium text-[#A00300] hover:underline"
          >
            {showAllOffers ? "Show less" : "View coupon offers"}
          </button>
        </div>
      )}
    </>
  );
}
