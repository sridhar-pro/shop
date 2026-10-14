"use client";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

// 💸 "More offers" — BOGO cards. Renders nothing when there are none.
export default function GuestBogoOffers({
  bogoOffers,
  cartItems,
  applyingOffer,
  offerApplied,
  applyBogoOffer,
}) {
  if (bogoOffers.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-base font-bold mb-3">More offers</h2>

      <div className="space-y-4">
        {bogoOffers.map((offer) => (
          <div
            key={offer.id}
            className="relative flex bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Ribbon Left */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-[#A00300] to-red-700 flex items-center justify-center">
              <span className="text-[26px] font-extrabold text-white transform -rotate-90 whitespace-nowrap tracking-wider uppercase italic shadow-md">
                {offer.title}
              </span>
            </div>

            {/* Offer Content */}
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
          cartItems.length === 0 || applyingOffer || offerApplied
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-[#A00300] hover:bg-red-700"
        }`}
                  onClick={() =>
                    cartItems.length > 0 && applyBogoOffer(offer.id)
                  }
                  disabled={
                    cartItems.length === 0 || applyingOffer || offerApplied
                  }
                >
                  {applyingOffer
                    ? "Applying..."
                    : offerApplied
                      ? "Applied"
                      : "APPLY"}
                </button>
              </div>

              <hr className="my-3 border-dashed border-gray-300" />

              {/* Eligible Products */}
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
        ))}
      </div>
    </div>
  );
}
