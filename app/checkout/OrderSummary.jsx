"use client";

import { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { createFetchWithAuth } from "./lib/checkoutHelpers";
import useCouponState from "./components/OrderSummary/useCouponState";
import useCartSummary from "./components/OrderSummary/useCartSummary";
import useCouponActions from "./components/OrderSummary/useCouponActions";
import useHotDeal from "./lib/useHotDeal";
import useBogoOffer from "./components/OrderSummary/useBogoOffer";
import useRemoveCartItem from "./components/OrderSummary/useRemoveCartItem";
import OrderSummarySkeleton from "./components/OrderSummary/OrderSummarySkeleton";
import CartItemsList from "./components/OrderSummary/CartItemsList";
import DiscountInput from "./components/OrderSummary/DiscountInput";
import AvailableOffers from "./components/OrderSummary/AvailableOffers";
import PriceSummary from "./components/OrderSummary/PriceSummary";

// Orchestrator only. Where to look when debugging:
//   coupon input / apply / offers  -> useCouponState + useCouponActions
//   totals, items, /getTax sync    -> useCartSummary
//   hot deal timer                 -> checkout/lib/hotDealEngine (shared) via useHotDeal
//   BOGO apply                     -> useBogoOffer
//   trash icon                     -> useRemoveCartItem
//   UI                             -> OrderSummary/*.jsx
const OrderSummary = () => {
  const { getValidToken } = useAuth();
  const fetchWithAuth = createFetchWithAuth(getValidToken);

  // Order matters: state hooks first, then the ones that use them
  const coupon = useCouponState();
  const summary = useCartSummary({ fetchWithAuth, coupon });
  const { handleApply, handleApplyOfferCode } = useCouponActions({
    fetchWithAuth,
    fetchSummary: summary.fetchSummary,
    coupon,
  });
  // Shared Hot Deal engine (one timer for OrderSummary + CheckoutForm + CheckoutAddress)
  const deal = useHotDeal({ getValidToken });
  const { applyingOffer, appliedOffers, applyBogoOffer } = useBogoOffer({
    fetchWithAuth,
  });
  const { processingItems, removeItem } = useRemoveCartItem({
    getValidToken,
    setCartItems: summary.setCartItems,
  });

  // Kept in the parent so it survives the skeleton refresh
  const [showAllOffers, setShowAllOffers] = useState(false);

  return (
    <div className="w-full lg:w-[440px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-300 hidden lg:block hide-scrollbar">
      <div className="space-y-6">
        <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

        {/* Initial skeleton only on first mount */}
        {summary.initialLoading ? (
          <OrderSummarySkeleton />
        ) : (
          <>
            <CartItemsList
              cartItems={summary.cartItems}
              customizedTexts={summary.customizedTexts}
              processingItems={processingItems}
              onRemove={removeItem}
            />

            <DiscountInput
              coupon={coupon}
              handleApply={handleApply}
              isRefreshing={summary.isRefreshing}
            />

            <AvailableOffers
              offers={summary.offers}
              bogoOffers={summary.bogoOffers}
              appliedOffers={appliedOffers}
              applyingOffer={applyingOffer}
              applyBogoOffer={applyBogoOffer}
              couponSource={coupon.couponSource}
              appliedOfferCode={coupon.appliedOfferCode}
              handleApplyOfferCode={handleApplyOfferCode}
              isApplyingRef={coupon.isApplyingRef}
              showAllOffers={showAllOffers}
              setShowAllOffers={setShowAllOffers}
            />

            <PriceSummary
              subtotal={summary.subtotal}
              tax={summary.tax}
              shipping={summary.shipping}
              couponValue={coupon.couponValue}
              total={summary.total}
              limitedDealApplied={deal.limitedDealApplied}
              dealTimer={deal.dealTimer}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
