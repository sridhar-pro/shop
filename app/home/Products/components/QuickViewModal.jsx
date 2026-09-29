"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Star, ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { trackProductHistory } from "@/app/utils/productHistory";
import { getImageSrc, getImageSrcThumbs } from "../utils/imageHelpers";

export default function QuickViewModal({
  quickViewProduct,
  setQuickViewProduct,
  mainImage,
  setMainImage,
  quantity,
  setQuantity,
  isAdding,
  setIsAdding,
  selectedVariants,
  setSelectedVariants,
  modalRef,
  MIN_LIMIT,
  MAX_LIMIT,
  increaseQty,
  decreaseQty,
  quickVariants,
  selectedQuickVariant,
  setCartItems,
}) {
  const { t } = useTranslation();

  if (!quickViewProduct) return null;

  // ── Auth helper ─────────────────────────────────────────────────────────────
  const fetchToken = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data?.status === "success" && data?.token) {
      localStorage.setItem("authToken", data.token);
      return data.token;
    }
    throw new Error("Authentication failed");
  };

  // ── Add to Cart ─────────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      let cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        cartId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", cartId);
      }

      const payload = {
        selected_country: "IN",
        product_id: quickViewProduct.id,
        historypincode: Number(localStorage.getItem("user_pincode") || 600002),
        qty: quantity,
        cart_id: cartId,
        variant_id: selectedVariants?.[quickViewProduct.id]
          ? [selectedVariants[quickViewProduct.id].id]
          : [],
      };

      let token = localStorage.getItem("authToken");
      if (!token) token = await fetchToken();

      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        const retryToken = await fetchToken();
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${retryToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      const newCartId =
        result.cart_ids && result.cart_ids.length > 0
          ? result.cart_ids[0]
          : cartId;

      if (result.status !== "success") {
        console.warn("🚫 Backend cart sync failed:", result);
        return;
      }

      // ✅ Track product history
      trackProductHistory({
        token,
        productId: quickViewProduct.id,
        cartCount: quantity,
        warehouseId: quickViewProduct?.seller?.warehouse_id,
      });

      // Update localStorage cart
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]",
      );
      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === quickViewProduct.id,
      );

      const selectedVariantId =
        selectedVariants?.[quickViewProduct.id]?.id || null;
      const variantPrice = Number(
        selectedVariants?.[quickViewProduct.id]?.price || 0,
      );

      const basePrice =
        quickViewProduct.promo_price &&
        quickViewProduct.end_date &&
        new Date(quickViewProduct.end_date) > new Date() &&
        Number(quickViewProduct.promo_price) > 0 &&
        Number(quickViewProduct.promo_price) < Number(quickViewProduct.price)
          ? Number(quickViewProduct.promo_price)
          : Number(quickViewProduct.price);

      const updatedCart =
        existingItemIndex >= 0
          ? existingCart.map((item, i) =>
              i === existingItemIndex
                ? { ...item, qty: item.qty + quantity }
                : item,
            )
          : [
              ...existingCart,
              {
                id: quickViewProduct.id,
                name: quickViewProduct.name,
                qty: quantity,
                price: basePrice + variantPrice,
                image: quickViewProduct.image,
                variant_id: selectedVariantId,
                variant_name:
                  selectedVariants?.[quickViewProduct.id]?.name || null,
              },
            ];

      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      // Apply coupon
      try {
        await fetch("/api/applyCoupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: newCartId, coupon_code: "0" }),
        });
      } catch (couponError) {
        console.error("🚫 Error applying coupon after addToCart:", couponError);
      }

      // Fetch tax
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });

        if (taxRes.status === 401) {
          localStorage.removeItem("authToken");
          const retryToken = await fetchToken();
          const retryTaxRes = await fetch("/api/getTax", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${retryToken}`,
            },
            body: JSON.stringify({ cart_id: cartId }),
          });
          const taxData = await retryTaxRes.json();
          localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        } else {
          const taxData = await taxRes.json();
          localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        }
        window.dispatchEvent(new Event("cart-updated"));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      setQuickViewProduct(null);
      toast.success("🛒 Added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  // ── Buy It Now ──────────────────────────────────────────────────────────────
  const handleBuyItNow = async () => {
    let cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      cartId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);
    }

    const payload = {
      selected_country: "IN",
      product_id: quickViewProduct.id,
      historypincode: Number(localStorage.getItem("user_pincode") || 600002),
      qty: quantity,
      cart_id: cartId,
    };

    try {
      let token = localStorage.getItem("authToken");
      if (!token) token = await fetchToken();

      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        const retryToken = await fetchToken();
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${retryToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      trackProductHistory({
        token,
        productId: quickViewProduct.id,
        cartCount: quantity,
        warehouseId: quickViewProduct?.seller?.warehouse_id,
      });

      // Fetch tax
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        if (taxRes.status === 401) {
          localStorage.removeItem("authToken");
          const retryToken = await fetchToken();
          const retryTaxRes = await fetch("/api/getTax", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${retryToken}`,
            },
            body: JSON.stringify({ cart_id: cartId }),
          });
          const taxData = await retryTaxRes.json();
          localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        } else {
          const taxData = await taxRes.json();
          localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        }
        window.dispatchEvent(new Event("cart-updated"));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      if (result.redirect_link) {
        window.location.href = "/checkout";
      } else {
        console.warn("No redirect link returned from API");
      }
    } catch (error) {
      console.error("Buy it now failed:", error);
    }
  };

  // ── Price calculation for modal ─────────────────────────────────────────────
  const renderModalPrice = () => {
    const hasVariants = quickViewProduct?.product_variants?.length > 0;

    const variantPrice = Number(selectedQuickVariant?.price || 0);
    const variantDiscount = Number(selectedQuickVariant?.discount_price || 0);
    const variantPromoPercent = Math.max(
      0,
      Number(selectedQuickVariant?.promo_percentage) || 0,
    );
    const productPrice = Number(quickViewProduct?.price || 0);
    const productPromo = Number(quickViewProduct?.promo_price || 0);

    const isPromoActive =
      quickViewProduct?.promotion === "1" &&
      quickViewProduct?.end_date &&
      new Date(quickViewProduct.end_date + "T23:59:59") >= new Date();

    let finalPrice, originalPrice, discountPercent;

    if (hasVariants) {
      const isVariantPromoValid =
        isPromoActive && variantPromoPercent > 0 && variantDiscount > 0;
      finalPrice = isVariantPromoValid ? variantDiscount : variantPrice;
      originalPrice = isVariantPromoValid ? variantPrice : null;
      discountPercent = isVariantPromoValid ? variantPromoPercent : 0;
    } else {
      const isProductPromoValid =
        isPromoActive && productPromo > 0 && productPromo < productPrice;
      finalPrice = isProductPromoValid ? productPromo : productPrice;
      originalPrice = isProductPromoValid ? productPrice : null;
      discountPercent = isProductPromoValid
        ? Math.round(((productPrice - productPromo) / productPrice) * 100)
        : 0;
    }

    return (
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-800">
          ₹{finalPrice.toFixed(2)}
        </span>
        {originalPrice && (
          <span className="text-lg sm:text-xl text-gray-400 line-through">
            ₹{originalPrice.toFixed(2)}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-sm sm:text-base text-red-600 font-medium">
            {discountPercent}% OFF
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      key="backdrop"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-4 md:py-0 overflow-y-auto font-odop"
      onClick={(e) => e.target === e.currentTarget && setQuickViewProduct(null)}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl p-4 md:p-10 shadow-2xl bg-white backdrop-blur-xl border border-white/20 my-auto"
        ref={modalRef}
      >
        {/* Close button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 md:top-5 md:right-5 p-1 md:p-2 rounded-full bg-white/70 hover:bg-red-100 transition z-[110] cursor-pointer"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-red-500" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* ── Image section ────────────────────────────────────────────── */}
          <div className="order-1 md:order-none">
            <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-none group">
              {(mainImage || quickViewProduct.image) && (
                <AnimatePresence mode="wait">
                  <div
                    key={mainImage || quickViewProduct.image}
                    className="absolute inset-0"
                  >
                    <Image
                      src={getImageSrc(mainImage || quickViewProduct.image)}
                      alt={quickViewProduct.name || "Image not found!"}
                      title={quickViewProduct.name || "Image not found!"}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain"
                    />
                  </div>
                </AnimatePresence>
              )}
            </div>

            {/* Thumbnail strip */}
            {quickViewProduct.image_g && (
              <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto scrollbar-hide py-2">
                {(() => {
                  const matches =
                    quickViewProduct.image_g.match(/src="([^"]+)"/g) || [];
                  const imageUrls = matches.map((src) =>
                    src.replace(/src="|"/g, ""),
                  );
                  const allImages = [
                    getImageSrcThumbs(quickViewProduct.image),
                    ...imageUrls,
                  ].filter(
                    (img, index, self) => img && self.indexOf(img) === index,
                  );

                  return allImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setMainImage(getImageSrc(img))}
                      className={`relative w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm ${
                        getImageSrc(img) === mainImage
                          ? "border-[#A00300] ring-1 ring-[#A00300]"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={getImageSrcThumbs(img)}
                        alt={`thumb-${i}`}
                        title={`thumb-${i}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover rounded-md"
                      />
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* ── Content section ──────────────────────────────────────────── */}
          <div className="flex flex-col justify-between order-2 md:order-none">
            <div>
              {/* Promo tag */}
              {quickViewProduct.promo_tag &&
                quickViewProduct.end_date &&
                new Date(quickViewProduct.end_date) > new Date() && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
                      {quickViewProduct.promo_tag}
                    </span>
                  </div>
                )}

              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-950 mb-2 capitalize">
                {quickViewProduct.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                {Number(quickViewProduct?.review) > 0 && (
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs sm:text-sm text-gray-700 font-medium">
                      {Number(quickViewProduct.review).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-3 md:mb-4">{renderModalPrice()}</div>

              {/* Variant selector */}
              {quickVariants.length > 0 && (
                <div className="relative mt-3 font-odop w-[110px] md:w-[130px]">
                  <select
                    aria-label="Select product variant"
                    value={selectedQuickVariant?.id}
                    onChange={(e) => {
                      const v = quickVariants.find(
                        (v) => String(v.id) === e.target.value,
                      );
                      setSelectedVariants((prev) => ({
                        ...prev,
                        [quickViewProduct.id]: v,
                      }));
                      if (v?.frontImage)
                        setMainImage(getImageSrc(v.frontImage));
                    }}
                    className="appearance-none text-xs md:text-sm uppercase font-medium pl-3 pr-8 py-1.5 md:py-2 rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer w-full truncate focus:outline-none focus:ring-2 focus:ring-[#A00300] focus:border-[#A00300] hover:border-[#A00300]/70 transition-all duration-200"
                  >
                    {quickVariants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              )}

              {/* View Full Details */}
              <div className="mt-4">
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  title={`View ${quickViewProduct.name}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors rounded-lg shadow-md cursor-pointer"
                >
                  {t("View Full Details")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* ── Quantity + Add to Cart + Buy It Now ───────────────────── */}
            <div className="flex flex-col gap-4 mt-3 md:mt-0">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity controller */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/40 backdrop-blur-md shadow-md overflow-hidden h-12 px-1">
                    <button
                      onClick={decreaseQty}
                      disabled={quantity <= MIN_LIMIT}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
                        quantity <= MIN_LIMIT
                          ? "bg-gray-100 cursor-not-allowed text-gray-400"
                          : "bg-white hover:bg-gray-100 text-gray-600"
                      } active:scale-95`}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-10 text-center font-semibold text-gray-800 select-none">
                      {quantity}
                    </div>

                    <button
                      onClick={increaseQty}
                      disabled={quantity >= MAX_LIMIT}
                      className={`w-10 h-10 flex items-center justify-center relative rounded-lg transition-all duration-200 cursor-pointer ${
                        quantity >= MAX_LIMIT
                          ? "bg-gray-100 cursor-not-allowed text-gray-400"
                          : "bg-white hover:bg-gray-100 text-gray-600"
                      } active:scale-95`}
                      aria-label={
                        quantity >= MAX_LIMIT
                          ? `Max ${MAX_LIMIT} available`
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-4 h-4" />
                      {quantity >= MAX_LIMIT && (
                        <span className="absolute -bottom-6 text-[10px] text-red-500 font-medium whitespace-nowrap">
                          Max {MAX_LIMIT} available
                        </span>
                      )}
                    </button>
                  </div>

                  {MIN_LIMIT > 1 && (
                    <span className="text-[10px] text-gray-500 font-medium text-center">
                      {t("Minimum order")}: {MIN_LIMIT}
                    </span>
                  )}
                </div>

                {/* Add to Cart */}
                <div className="relative w-full flex justify-center">
                  {isAdding && (
                    <div className="absolute -top-16 z-50">
                      <img
                        src="/add.gif"
                        alt="Loading..."
                        title="Loading..."
                        className="w-14 h-14"
                      />
                    </div>
                  )}

                  <button
                    disabled={isAdding}
                    onClick={handleAddToCart}
                    className={`group relative flex-1 overflow-hidden rounded-xl py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                      isAdding
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-transparent"
                    }`}
                    style={{ isolation: "isolate" }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-white">
                      <ShoppingCart className="w-5 h-5" />
                      {isAdding ? t("Adding...") : t("Add to Cart")}
                    </span>
                    <span
                      className="absolute left-0 top-0 h-full w-0 bg-black transition-all duration-[900ms] ease-in-out group-hover:w-full z-[1] rounded-xl"
                      style={{
                        transitionProperty: "width, background-color",
                        willChange: "width",
                      }}
                    />
                    <span className="absolute inset-0 z-[-1] rounded-xl border border-transparent group-hover:border-white" />
                  </button>
                </div>
              </div>

              {/* Buy It Now */}
              <button
                onClick={handleBuyItNow}
                className="group relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold border-1 border-white transition-all duration-500 ease-in-out hover:border-black cursor-pointer"
              >
                <span className="relative z-10 flex items-center justify-center gap-2 text-white group-hover:text-black transition-colors duration-500 ease-in-out">
                  {t("Buy It Now")}
                </span>
                <span className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-[900ms] ease-in-out group-hover:w-full z-0" />
                <span className="absolute inset-0 bg-black z-[-1] rounded-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
