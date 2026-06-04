"use client";

export default function ProductOffersSection({
  product,
  handleAddOfferToCart,
}) {
  if (!product.offers) return null;

  let offersData = [];
  try {
    offersData = JSON.parse(product.offers || "[]");
  } catch (e) {
    console.error("❌ Invalid offers JSON:", product.offers);
  }

  const validOffers = offersData.filter(
    (offer) => offer.offer_label || offer.offer_qty || offer.offer_price,
  );

  if (!validOffers.length) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-[#a00300] mb-3 uppercase italic">
        Available Offers
      </h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 cursor-pointer">
        {validOffers.map((offer, index) => (
          <div
            key={index}
            className="relative p-6 bg-orange-50 border rounded-md text-center shadow-sm border-orange-500 hover:shadow-md transition-all"
            onClick={() => handleAddOfferToCart(offer)}
          >
            {offer.offer_label && (
              <span className="absolute -top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow">
                {offer.offer_label}
              </span>
            )}
            <p className="text-lg font-bold text-gray-800">
              Set of {offer.offer_qty}
            </p>
            <p className="mt-1 text-gray-700 font-medium">
              ₹{offer.offer_price}
              <span className="text-gray-500 text-sm">
                {" "}
                / {offer.offer_qty > 1 ? `${offer.offer_qty} pieces` : "piece"}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
