"use client";
import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { useSession } from "../context/SessionContext";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { createAddressFetchers } from "./components/CheckoutAddress/addressFetch";
import useAddressBook from "./components/CheckoutAddress/useAddressBook";
import useAddressCrud from "./components/CheckoutAddress/useAddressCrud";
import useAddressCouponState from "./components/CheckoutAddress/useAddressCouponState";
import useAddressLimitedDeal from "./components/CheckoutAddress/useAddressLimitedDeal";
import useAddressCouponActions from "./components/CheckoutAddress/useAddressCouponActions";
import useAddressOffers from "./components/CheckoutAddress/useAddressOffers";
import useLoggedPay from "./components/CheckoutAddress/useLoggedPay";
import AddressListSkeleton from "./components/CheckoutAddress/AddressListSkeleton";
import AddressList from "./components/CheckoutAddress/AddressList";
import AddressFormModal from "./components/CheckoutAddress/AddressFormModal";
import DeleteConfirmModal from "./components/CheckoutAddress/DeleteConfirmModal";
import LoggedOfferCards from "./components/CheckoutAddress/LoggedOfferCards";
import LoggedBogoOffers from "./components/CheckoutAddress/LoggedBogoOffers";
import LoggedOrderSummary from "./components/CheckoutAddress/LoggedOrderSummary";
import LoggedPayButton from "./components/CheckoutAddress/LoggedPayButton";
import GuestPaymentSection from "./components/CheckoutForm/GuestPaymentSection";

// Orchestrator only. Where to look when debugging:
//   saved addresses / selection / shipping   -> useAddressBook
//   add / edit / delete address              -> useAddressCrud (+ AddressFormModal)
//   coupon input + offer apply               -> useAddressCouponState + useAddressCouponActions
//   Hot Deal timer                           -> useAddressLimitedDeal
//   offers + BOGO                            -> useAddressOffers
//   Pay Now                                  -> useLoggedPay
//   UI                                       -> checkout/CheckoutAddress/*.jsx
const CheckoutAddress = ({
  cartItems,
  subtotal,
  total,
  tax,
  shipping,
  onSuccess,
  onFailure,
  customizedTexts,
}) => {
  const router = useRouter();
  const { getValidToken, isAuthReady } = useAuth();
  const { companyId } = useSession();

  const { fetchWithAuth, fetchWithAuthBogo, fetchSummaryWithRetry } =
    createAddressFetchers(getValidToken);

  // Order matters: coupon state -> deal (needs setCouponValue) -> coupon actions
  const coupon = useAddressCouponState();
  const deal = useAddressLimitedDeal({
    fetchWithAuth,
    fetchSummaryWithRetry,
    setCouponValue: coupon.setCouponValue,
  });
  const { handleApply, handleApplyOfferCode } = useAddressCouponActions({
    coupon,
    fetchWithAuth,
    fetchSummaryWithRetry,
  });
  const offersState = useAddressOffers({
    fetchWithAuthBogo,
    setAppliedCoupon: coupon.setAppliedCoupon,
  });

  const book = useAddressBook({ fetchWithAuth, getValidToken, companyId });
  const crud = useAddressCrud({
    getValidToken,
    companyId,
    selectedAddress: book.selectedAddress,
    setSelectedAddress: book.setSelectedAddress,
    selectedAddressId: book.selectedAddressId,
    handleSelectAddress: book.handleSelectAddress,
    fetchAddresses: book.fetchAddresses,
  });

  const pay = useLoggedPay({
    addresses: book.addresses,
    selectedAddressId: book.selectedAddressId,
    companyId,
    isAuthReady,
    getValidToken,
    total,
    cartItems,
  });

  // UI-only state kept in the parent (survives the skeleton swap)
  const [showInactive, setShowInactive] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  // ⚠️ Keep these early returns AFTER every hook above
  if (!companyId) {
    return (
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
        <button
          onClick={() => router.push("/login")}
          className="text-gray-700 transition underline"
        >
          Log In
        </button>
      </div>
    );
  }

  if (book.loadingadd) return <AddressListSkeleton />;

  return (
    <>
      {/* ── Premium Delete Confirmation Modal ─────────────────────────────── */}
      <AnimatePresence>
        {crud.deleteModalOpen && (
          <DeleteConfirmModal
            isOpen={crud.deleteModalOpen}
            onClose={crud.closeDeleteModal}
            onConfirm={crud.confirmDelete}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4 relative">
        <AddressList
          addresses={book.addresses}
          showInactive={showInactive}
          setShowInactive={setShowInactive}
          selectedAddressId={book.selectedAddressId}
          handleSelectAddress={book.handleSelectAddress}
          handleEditClick={crud.handleEditClick}
          handleDeleteAddress={crud.handleDeleteAddress}
          onAdd={() => crud.setIsAddModalOpen(true)}
        />

        {/* Add Address Modal */}
        {crud.isAddModalOpen && (
          <AddressFormModal
            mode="add"
            formData={crud.formData}
            errors={crud.errors}
            handleChange={crud.handleChange}
            onSubmit={crud.handleAddAddress}
            onClose={() => crud.setIsAddModalOpen(false)}
          />
        )}

        {/* Edit Address Modal */}
        {crud.isEditModalOpen && (
          <AddressFormModal
            mode="edit"
            formData={crud.formData}
            errors={crud.errors}
            handleChange={crud.handleChange}
            onSubmit={crud.handleUpdateAddress}
            onClose={() => crud.setIsEditModalOpen(false)}
          />
        )}

        {/* Payment Section */}
        <div className="">
          <GuestPaymentSection
            selectedMethod={selectedMethod}
            showInfo={showInfo}
            handleRadioChange={handleRadioChange}
            handleToggle={handleToggle}
          />

          <LoggedOfferCards
            offers={offersState.offers}
            appliedCoupon={coupon.appliedCoupon}
            handleApplyOfferCode={handleApplyOfferCode}
            isApplyingRef={coupon.isApplyingRef}
            couponMessage={coupon.couponMessage}
            isApplied={coupon.isApplied}
          />

          <LoggedBogoOffers
            bogoOffers={offersState.bogoOffers}
            appliedOffers={offersState.appliedOffers}
            applyingOffer={offersState.applyingOffer}
            applyBogoOffer={offersState.applyBogoOffer}
          />

          <LoggedOrderSummary
            cartItems={cartItems}
            customizedTexts={customizedTexts}
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            total={total}
            coupon={coupon}
            setAppliedCoupon={coupon.setAppliedCoupon}
            handleApply={handleApply}
            limitedDealApplied={deal.limitedDealApplied}
            dealTimer={deal.dealTimer}
          />
        </div>

        <LoggedPayButton
          handleOrderAndPayLogged={pay.handleOrderAndPayLogged}
          selectedAddressId={book.selectedAddressId}
          isProcessing={pay.isProcessing}
          razorRef={pay.razorRef}
          cashfreeRef={pay.cashfreeRef}
          orderDetails={pay.orderDetails}
          total={total}
          onSuccess={onSuccess}
          onFailure={onFailure}
        />
      </div>
    </>
  );
};

export default CheckoutAddress;
