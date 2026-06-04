"use client";
import { IndianRupee, Clock, Package, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductPriceSection({
  product,
  selectedVariants,
  handleReviewClick,
  reviews,
}) {
  const { t } = useTranslation();

  const hasVariants = product.variants?.length > 0;
  const selectedVariant =
    selectedVariants?.[product.id] ??
    (product.variants?.length > 0 ? product.variants[0] : null);

  const variantPrice = selectedVariant ? Number(selectedVariant.price) : 0;
  const variantPromoPercent = selectedVariant
    ? Math.max(0, Number(selectedVariant.promo_percentage) || 0)
    : 0;

  const productPrice = Number(product.price);
  const productPromo = Number(product.promo_price || 0);

  const isProductPromoValid =
    Number(product.promotion) === 1 &&
    productPromo > 0 &&
    product.end_date &&
    new Date(product.end_date + "T23:59:59") >= new Date() &&
    productPromo < productPrice;

  const isVariantPromoValid =
    selectedVariant &&
    Number(product.promotion) === 1 &&
    Number(selectedVariant.discount_price) > 0 &&
    product.end_date &&
    new Date(product.end_date + "T23:59:59") >= new Date() &&
    Number(selectedVariant.discount_price) < Number(selectedVariant.price);

  const finalPrice = hasVariants
    ? isVariantPromoValid
      ? Number(selectedVariant.discount_price)
      : Number(selectedVariant.price)
    : isProductPromoValid
      ? productPromo
      : productPrice;

  const originalPrice = hasVariants
    ? isVariantPromoValid
      ? variantPrice
      : null
    : isProductPromoValid
      ? productPrice
      : null;

  const discountPercent = hasVariants
    ? isVariantPromoValid
      ? variantPromoPercent
      : 0
    : isProductPromoValid
      ? Math.round(((productPrice - productPromo) / productPrice) * 100)
      : 0;

  const currentQuantity =
    product.variants.length > 0
      ? Number(
          selectedVariants?.[product.id]?.quantity ??
            product.variants[0]?.quantity ??
            0,
        )
      : Number(product?.quantity);

  return (
    <div className="">
      {/* Stock Status */}
      <div className="hidden md:flex items-center mb-3">
        <div className="flex items-center gap-2 whitespace-nowrap">
          {currentQuantity > 0 ? (
            <>
              <Package className="w-4 h-4 text-[#a00300] flex-shrink-0" />
              <span className="font-medium text-gray-700 mt-0.5">
                Hurry! Only{" "}
                <span className="text-[#a00300] font-bold">
                  {Math.floor(currentQuantity)}
                </span>{" "}
                left in stock!
              </span>
            </>
          ) : (
            <>
              <Ban className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span className="font-medium text-red-700">Out of Stock</span>
            </>
          )}
        </div>
      </div>

      {/* Promo Tag */}
      {product.promo_tag && (
        <div>
          <span className="hidden md:inline-flex items-center gap-1 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-sm font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg shadow-md">
            <Clock className="w-4 h-4 text-white" />
            {product.promo_tag}
          </span>
        </div>
      )}

      {/* Product Name */}
      <h1 className="text-2xl sm:text-3xl text-gray-900 uppercase hidden md:flex">
        {product.name}
      </h1>

      {/* Min Order */}
      {Number(product.minimum_order_limit) === 1 &&
        Number(product.minimum_order_qty) > 0 && (
          <div className="mt-2 mb-2 hidden md:flex">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#ad0000] to-[#e30f00] text-white text-sm font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
              <span className="text-white font-semibold capitalize">
                {t("minimum order quantity")}:
              </span>
              {product.minimum_order_qty}
            </span>
          </div>
        )}

      {/* Category */}
      {product.category && (
        <div className="mt-2 items-center gap-2 hidden md:flex">
          <span className="text-sm font-medium text-gray-500 uppercase">
            {t("Category")}:
          </span>
          <span className="text-sm font-semibold text-[#A00300] tracking-wide">
            {product.category}
          </span>
        </div>
      )}

      {/* Review Stars (Desktop) */}
      {Number(product.review) > 0 && reviews.length > 0 && (
        <div className="relative mt-2 hidden md:flex items-center gap-2 group font-odop">
          <div className="flex items-center gap-[2px] cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => {
              const rating = Number(product.review);
              let fill = "0%";
              if (rating >= star) fill = "100%";
              else if (rating >= star - 0.5) fill = "50%";
              return (
                <div key={star} className="relative w-5 h-5">
                  <svg
                    className="absolute w-5 h-5 text-gray-300"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <div
                    className="absolute top-0 left-0 h-full overflow-hidden"
                    style={{ width: fill }}
                  >
                    <svg
                      className="w-5 h-5 text-[#f5b50a]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
          <span className="text-sm font-bold text-gray-800">
            {Number(product.review).toFixed(1)}
          </span>
          <span
            onClick={handleReviewClick}
            className="text-sm text-blue-600 cursor-pointer hover:underline"
          >
            ({reviews.length.toLocaleString()} reviews)
          </span>
          {/* Hover Card */}
          <div
            className="absolute left-0 top-full mt-3 w-72 bg-white border rounded-lg shadow-xl p-4
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 z-50"
          >
            <p className="font-semibold text-gray-900 mb-1">
              {Number(product.review).toFixed(1)} out of 5
            </p>
            <p className="text-sm text-gray-500 mb-3">
              {reviews.length.toLocaleString()} global ratings
            </p>
            {[5, 4, 3, 2, 1].map((star) => {
              const total = reviews.length;
              const count = reviews.filter(
                (r) => Math.round(Number(r.product_rating)) === star,
              ).length;
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="w-12 text-sm">{star} star</span>
                  <div className="flex-1 h-3 bg-gray-200 rounded">
                    <div
                      className="h-3 bg-orange-400 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-gray-600">{percent}%</span>
                </div>
              );
            })}
            <p
              onClick={handleReviewClick}
              className="text-sm text-blue-600 mt-3 hover:underline cursor-pointer"
            >
              See customer reviews →
            </p>
          </div>
        </div>
      )}

      {/* BOGO Tag */}
      {product.bogo_offer && product.bogo_offer.length > 0 && (
        <div className="hidden md:flex flex-wrap gap-2 mt-2 mb-2">
          {product.bogo_offer.map((b, idx) => (
            <div key={idx} className="relative inline-block font-odop">
              <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                {b.title || "Special BOGO!"}
              </span>
              <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg"></span>
            </div>
          ))}
        </div>
      )}

      {/* Price */}
      <div className="space-y-4" translate="no">
        <div className="items-end gap-3 hidden md:flex">
          <div className="flex items-baseline gap-1">
            <IndianRupee className="w-6 h-6 text-[#A00300]" />
            <span className="text-4xl font-bold text-[#A00300]">
              {finalPrice.toFixed(2)}
            </span>
          </div>
          {originalPrice && (
            <div className="items-center gap-1 hidden md:flex">
              <IndianRupee className="w-4 h-4 text-gray-400" />
              <span className="text-xl text-gray-500 line-through">
                {originalPrice.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        {discountPercent > 0 && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <span className="font-medium">
                {discountPercent}
                {t("% OFF")}
              </span>
            </div>
          </div>
        )}
        <div className="hidden md:block">
          <p className="text-xs text-gray-500 mt-1">
            * Price shown is excluding taxes
          </p>
        </div>
      </div>
    </div>
  );
}
