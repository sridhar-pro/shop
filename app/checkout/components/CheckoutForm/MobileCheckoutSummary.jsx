"use client";
import GuestOfferCards from "./GuestOfferCards";
import GuestBogoOffers from "./GuestBogoOffers";
import MobileCartItems from "./MobileCartItems";
import MobilePriceSummary from "./MobilePriceSummary";

// The block shown between the delivery fields and the Payment section on
// mobile (hidden on lg+): offers, BOGO, order summary, discount input, totals.
export default function MobileCheckoutSummary({
  cartItems,
  customizedTexts,
  subtotal,
  tax,
  shipping,
  total,
  coupon, // return value of useCheckoutCoupon
  offersState, // return value of useCheckoutOffers
  limitedDealApplied,
  dealTimer,
}) {
  const {
    code,
    setCode,
    couponMessage,
    couponValue,
    setCouponMessage,
    isApplied,
    setIsApplied,
    couponSource,
    appliedOfferCode,
    isManualCouponApplied,
    setIsManualCouponApplied,
    isApplyingRef,
    handleApply,
    handleApplyOfferCode,
  } = coupon;

  const { bogoOffers, offers, applyingOffer, offerApplied, applyBogoOffer } =
    offersState;

  return (
    <div className="w-full lg:w-[400px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto py-8 border-t lg:border-t-0 lg:border-l border-gray-300 block lg:hidden">
      <div className="space-y-6">
        <GuestOfferCards
          offers={offers}
          couponSource={couponSource}
          appliedOfferCode={appliedOfferCode}
          handleApplyOfferCode={handleApplyOfferCode}
          isApplyingRef={isApplyingRef}
          couponMessage={couponMessage}
          isManualCouponApplied={isManualCouponApplied}
        />

        <GuestBogoOffers
          bogoOffers={bogoOffers}
          cartItems={cartItems}
          applyingOffer={applyingOffer}
          offerApplied={offerApplied}
          applyBogoOffer={applyBogoOffer}
        />

        <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

        <MobileCartItems
          cartItems={cartItems}
          customizedTexts={customizedTexts}
        />

        {/* 🎁 Discount Input */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Discount code"
              value={code}
              onChange={(e) => {
                const newCode = e.target.value;

                if (newCode !== code) {
                  setIsApplied(false);
                  setIsManualCouponApplied(false);
                  setCouponMessage("");
                  // couponValue stays: the server discount is still applied
                }

                setCode(newCode);
              }}
              className="input flex-1 bg-white"
            />

            <div className="flex flex-col items-center relative">
              <button
                // arrow fn: don't let the click event become `overrideCode`
                onClick={() => handleApply()}
                disabled={isManualCouponApplied || isApplyingRef.current}
                className={`bg-gray-200 text-sm font-bold p-4 rounded-md relative z-10 transition-all duration-200 ${
                  isApplied ? "text-green-600" : "text-gray-600"
                }`}
              >
                {isManualCouponApplied ? "Applied" : "Apply"}
              </button>
            </div>
          </div>

          {/* Coupon message (error or success) */}
          {couponMessage && (
            <p
              className={`text-xs font-medium mt-1 ${
                isManualCouponApplied ? "text-green-600" : "text-red-500"
              }`}
            >
              {couponMessage}
            </p>
          )}
        </div>

        <MobilePriceSummary
          subtotal={subtotal}
          tax={tax}
          shipping={shipping}
          couponValue={couponValue}
          total={total}
          limitedDealApplied={limitedDealApplied}
          dealTimer={dealTimer}
          showCouponDiscount
        />
      </div>
    </div>
  );
}
