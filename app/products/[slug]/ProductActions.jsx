"use client";
import { useState } from "react";
import {
  ShoppingCart,
  CreditCard,
  ChevronDown,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import WishlistButton from "@/app/components/WishlistButton";

export default function ProductActions({
  product,
  selectedVariants,
  quantity,
  setQuantity,
  isAdding,
  isOutOfStock,
  isBlocked,
  isCustomizationRequired,
  isDropdownRequired,
  handleAddToCart,
  handleBuyNow,
  handleEnquire,
  // Enquiry modal
  showPopupenq,
  setShowPopupenq,
  sms,
  setSms,
  loadingenq,
  handleSubmit,
  // Delivery location
  pincode,
  setPincode,
  city,
  locationUpdated,
  showPopup,
  handleUpdate,
  handleClose,
  handleSave,
}) {
  const { t } = useTranslation();

  // Enquiry form fields — local to this component since only the modal uses them
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const isFormValid =
    name.trim() &&
    sms.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    /^\+?[0-9\s\-()]{7,15}$/.test(phone);

  const handleModalSubmit = () => {
    handleSubmit({ name, email, phone });
  };

  const handleModalClose = () => {
    setShowPopupenq(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <span className="text-lg text-[#A00300] font-medium uppercase">
          {t("Quantity")}:
        </span>
        <div className="relative w-24">
          <select
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="appearance-none w-full py-1 px-3 pr-6 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#A00300] focus:border-[#A00300] bg-white cursor-pointer max-h-[200px] scrollbar-hide overflow-y-auto"
          >
            {(() => {
              const minQty =
                Number(product?.minimum_order_limit) === 1
                  ? Number(product?.minimum_order_qty) || 1
                  : 1;

              const availableQty =
                product.variants?.length > 0 && selectedVariants?.[product.id]
                  ? Number(selectedVariants[product.id].variant_quantity || 0)
                  : Number(product.quantity) || 0;

              const maxQty = Math.min(
                availableQty > 0 ? availableQty : minQty + 9,
                minQty + 9,
              );

              return Array.from(
                { length: maxQty - minQty + 1 },
                (_, i) => minQty + i,
              ).map((val) => (
                <option
                  key={val}
                  value={val}
                  disabled={val > availableQty && availableQty !== 0}
                  className={val > availableQty ? "text-gray-400" : ""}
                >
                  {val}
                </option>
              ));
            })()}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3">
          {/* Add to Cart */}
          <div className="relative group">
            <button
              onClick={handleAddToCart}
              disabled={isBlocked || isOutOfStock}
              className={`relative w-full overflow-hidden rounded-lg py-3 px-4 font-medium
                border border-black transition-all duration-300 ease-in-out
                ${
                  isBlocked || isOutOfStock
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-transparent"
                }`}
              style={{ isolation: "isolate" }}
            >
              <span
                className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-300
                  ${!isOutOfStock && !isBlocked ? "group-hover:text-white" : ""}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock
                  ? "Out of Stock"
                  : isAdding
                    ? t("Adding...")
                    : t("Add to Cart")}
              </span>
              {!isCustomizationRequired && !isOutOfStock && (
                <span className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-300 group-hover:w-full z-[1] rounded-lg" />
              )}
            </button>
            {isCustomizationRequired && (
              <div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
                  whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs text-white
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-odop"
              >
                Please enter a personalised message
              </div>
            )}
          </div>

          {/* Buy Now */}
          <div className="relative group">
            <button
              onClick={handleBuyNow}
              disabled={
                isCustomizationRequired || isOutOfStock || isDropdownRequired
              }
              className={`relative w-full overflow-hidden rounded-lg py-3 px-4 font-medium
                border border-white transition-all duration-300 ease-in-out
                ${
                  isCustomizationRequired || isOutOfStock || isDropdownRequired
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-transparent"
                }`}
              style={{ isolation: "isolate" }}
            >
              <span
                className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-300
                  ${
                    !isOutOfStock && !isCustomizationRequired
                      ? "group-hover:text-black text-white"
                      : "text-white"
                  }`}
              >
                <CreditCard className="w-5 h-5" />
                {isOutOfStock ? "Out of Stock" : t("Buy Now")}
              </span>
              {!isCustomizationRequired && !isOutOfStock && (
                <span className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-300 group-hover:w-full z-[1] rounded-lg" />
              )}
              <span className="absolute inset-0 z-[-1] rounded-lg bg-black" />
            </button>
            {(isCustomizationRequired || isOutOfStock) && (
              <div
                className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
                  whitespace-nowrap rounded-md bg-black px-3 py-1 text-xs text-white
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-odop"
              >
                {isOutOfStock
                  ? "This product is currently out of stock"
                  : isCustomizationRequired
                    ? "Please enter a personalised message"
                    : isDropdownRequired
                      ? "Please select a model"
                      : ""}
              </div>
            )}
          </div>
        </div>

        <WishlistButton productId={product.id} variant="full" />
      </div>

      {/* Enquire Section */}
      <div className="border-t border-gray-200">
        <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#A00300] rounded-t-xl" />
          <p className="text-gray-600 text-sm text-center leading-relaxed">
            Have questions or want to place{" "}
            <span className="font-semibold text-gray-900">bulk orders</span>?
            We&apos;re here to help.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            {["Fast response", "Bulk pricing", "Custom orders"].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#A00300] flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] uppercase tracking-widest text-gray-400">
              get in touch
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            onClick={handleEnquire}
            className="group relative flex items-center gap-2 px-8 py-2.5 border-[1.5px] border-[#A00300] text-[#A00300] text-xs font-medium uppercase tracking-widest overflow-hidden rounded-sm transition-all duration-200"
          >
            <span className="absolute inset-0 bg-[#A00300] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200 ease-in-out z-0" />
            <span className="relative z-10 transition-colors duration-200 group-hover:text-white">
              Enquire Now
            </span>
            <span className="relative z-10 transition-colors duration-200 group-hover:text-white text-base leading-none">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {showPopupenq && (
          <motion.div
            className="fixed inset-0 bg-black/55 backdrop-blur-sm flex justify-center items-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
          >
            <motion.div
              className="relative bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden max-h-[90dvh] overflow-y-auto"
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Red top bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#A00300]" />

              {/* Close button */}
              <button
                onClick={handleModalClose}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-white transition"
              >
                <XCircle className="w-4 h-4" />
              </button>

              <h2
                className="text-lg font-bold text-gray-900 text-center mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Send Your Enquiry
              </h2>
              <p className="text-xs text-gray-400 text-center mb-5">
                We&apos;ll get back to you within 24 hours.
              </p>

              {/* Name */}
              <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                Full Name <span className="text-[#A00300]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className={`w-full border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A00300]/25 focus:border-[#A00300] transition mb-1 ${
                  name !== "" && !name.trim()
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
              />
              {name !== "" && !name.trim() && (
                <p className="text-[11px] text-red-500 mb-3">
                  Name is required.
                </p>
              )}
              {name.trim() && <div className="mb-3" />}
              {name === "" && <div className="mb-3" />}

              {/* Email & Phone side by side */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                    Email <span className="text-[#A00300]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A00300]/25 focus:border-[#A00300] transition ${
                      email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {email !== "" &&
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                      <p className="text-[11px] text-red-500 mt-1">
                        Invalid email.
                      </p>
                    )}
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                    Phone <span className="text-[#A00300]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9+\-\s()]/g, "");
                      setPhone(val);
                    }}
                    placeholder="+91 98765 43210"
                    maxLength={15}
                    className={`w-full border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A00300]/25 focus:border-[#A00300] transition ${
                      phone !== "" && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  />
                  {phone !== "" && !/^\+?[0-9\s\-()]{7,15}$/.test(phone) && (
                    <p className="text-[11px] text-red-500 mt-1">
                      Invalid number.
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                Your Message <span className="text-[#A00300]">*</span>
              </label>
              <textarea
                value={sms}
                onChange={(e) => setSms(e.target.value)}
                placeholder="Describe your requirements, quantities, or questions..."
                maxLength={500}
                className={`w-full border rounded-lg p-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A00300]/25 focus:border-[#A00300] resize-none transition ${
                  sms !== "" && !sms.trim()
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
                rows={4}
              />
              <div className="flex justify-between items-center mt-1 mb-5">
                {sms !== "" && !sms.trim() ? (
                  <p className="text-[11px] text-red-500">
                    Message is required.
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] text-gray-300 ml-auto">
                  {sms?.length ?? 0} / 500
                </span>
              </div>

              <div className="flex justify-end gap-2.5">
                <motion.button
                  onClick={handleModalClose}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </motion.button>

                <motion.button
                  disabled={loadingenq || !isFormValid}
                  whileHover={!loadingenq && isFormValid ? { scale: 1.03 } : {}}
                  whileTap={!loadingenq && isFormValid ? { scale: 0.97 } : {}}
                  onClick={handleModalSubmit}
                  className="px-6 py-2 bg-[#A00300] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition tracking-wide"
                >
                  {loadingenq ? "Sending..." : "Submit"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delivery Location */}
      <div className="relative">
        <div>
          <div className="text-sm text-gray-700 font-medium flex items-center justify-between">
            <span>{t("Delivery to")}</span>
            <button
              onClick={handleUpdate}
              className="flex items-center gap-1 text-[#A00300] text-xs hover:underline cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              {t("Update Location")}
            </button>
          </div>
          <p
            className={`text-sm mt-1 ${
              locationUpdated ? "text-green-700 font-semibold" : "text-gray-900"
            }`}
          >
            {city} {pincode}
          </p>
        </div>

        {showPopup && (
          <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 w-72">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold text-gray-800">
                {t("Update Delivery Location")}
              </h2>
              <button onClick={handleClose}>
                <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A00300]"
              placeholder="Enter 6-digit pincode"
            />
            <button
              onClick={handleSave}
              className="mt-3 w-full bg-[#A00300] text-white text-sm font-semibold py-2 rounded-md hover:bg-[#880200] transition"
            >
              {t("Save")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
