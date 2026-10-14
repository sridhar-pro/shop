"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Minus, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import WishlistButton from "@/app/components/WishlistButton";
import { getImageSrc } from "../utils/imageHelpers";
import { useCartQty } from "@/app/hooks/useCartQty";
import { useAuth } from "@/app/utils/AuthContext";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

export default function ProductCard({
  product,
  selectedVariants,
  setSelectedVariants,
  setQuickViewProduct,
  setQuantity,
  handleQuickAdd,
}) {
  const { t } = useTranslation();

  const { getValidToken } = useAuth();
  const {
    qty: cartQty,
    increment,
    decrement,
    processing: qtyProcessing,
  } = useCartQty(product.id, getValidToken);

  // ── Promo / price calculations ─────────────────────────────────────────────
  const now = new Date();
  const promoEndDate = product.end_date
    ? new Date(product.end_date + "T23:59:59")
    : null;
  const isPromoActive = promoEndDate ? now <= promoEndDate : false;
  const hasPromo =
    isPromoActive &&
    product.promotion === "1" &&
    product.promo_price &&
    product.promo_price > 0;

  const originalPrice = Number(product.price);

  // ── Best offer ─────────────────────────────────────────────────────────────
  let bestOffer = null;
  try {
    const parsedOffers = product.offers ? JSON.parse(product.offers) : [];
    if (Array.isArray(parsedOffers) && parsedOffers.length > 0) {
      const validOffers = parsedOffers.filter((offer) => {
        const qty = Number(offer.offer_qty);
        const price = Number(offer.offer_price);
        return (
          offer.offer_qty !== "" &&
          offer.offer_price !== "" &&
          !isNaN(qty) &&
          !isNaN(price) &&
          qty > 0 &&
          price > 0
        );
      });
      if (validOffers.length > 0) {
        bestOffer = validOffers.reduce((max, offer) =>
          Number(offer.offer_qty) > Number(max.offer_qty) ? offer : max,
        );
      }
    }
  } catch (err) {
    console.warn("Offer parse error:", err);
  }

  const showPromoTag = product.promo_tag;
  const review = Number(product.review);

  // ── Stock check ────────────────────────────────────────────────────────────
  const quantityStr = product.quantity?.toString() || "";
  const quantityNum = parseFloat(quantityStr);
  const isOutOfStock =
    quantityStr === "0" ||
    quantityStr === "" ||
    isNaN(quantityNum) ||
    quantityNum <= 0;

  // ── Variants ───────────────────────────────────────────────────────────────
  const variants = Array.isArray(product.product_variants)
    ? product.product_variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        quantity: Number(variant.quantity),
        color: variant.color,
        frontImage: variant.front_view || null,
        backImage: variant.back_view || null,
        zoomImage: variant.zoom_view || null,
        discount_price: Number(variant.discount_price) || 0,
        promo_percentage: Number(variant.promo_percentage) || 0,
      }))
    : [];

  const hasVariants = variants.length > 0;

  // The currently selected variant for this card (from global state or first)
  const selectedVariant =
    selectedVariants[product.id] || (hasVariants ? variants[0] : null);

  const variantPrice = Number(
    selectedVariant?.price || variants[0]?.price || 0,
  );
  const variantDiscount = Number(selectedVariant?.discount_price || 0);
  const variantPromoPercent = Math.max(
    0,
    Number(selectedVariant?.promo_percentage) || 0,
  );

  const basePrice = hasVariants ? variantPrice : Number(product.price);

  let promoBasePrice;
  if (hasVariants) {
    promoBasePrice =
      hasPromo && variantPromoPercent > 0 && variantDiscount > 0
        ? variantDiscount
        : variantPrice;
  } else {
    promoBasePrice =
      hasPromo && product.promo_price
        ? Number(product.promo_price)
        : Number(product.price);
  }

  // ── Main image + hover media ───────────────────────────────────────────────
  const mainImageSrc = selectedVariant?.frontImage
    ? getImageSrc(selectedVariant.frontImage)
    : getImageSrc(product.image);

  const variantHoverImage =
    hasVariants && selectedVariant
      ? selectedVariant.backImage || selectedVariant.zoomImage || null
      : null;

  const galleryHoverImage = (() => {
    const matches = product.image_g?.match(/src="([^"]+)"/g) || [];
    const urls = matches.map((src) => src.replace(/src="|"/g, ""));
    return urls[1] || null;
  })();

  const hasHoverMedia =
    !isOutOfStock &&
    !!(product.product_video || variantHoverImage || galleryHoverImage);

  // ── Minimum order quantity ─────────────────────────────────────────────────
  const productMoq =
    Number(product.minimum_order_qty) > 1
      ? Number(product.minimum_order_qty)
      : 1;

  // ── Stock vs MOQ check ──────────────────────────────────────────────────────
  // A product can be "in stock" (quantity > 0) but still have fewer units
  // left than its minimum order quantity — e.g. MOQ 10, only 3 in stock.
  // In that case a valid order literally cannot be placed, so quick-add
  // must be disabled even though isOutOfStock is false.
  const insufficientStockForMoq =
    !isOutOfStock && productMoq > 1 && quantityNum < productMoq;

  // The list API returns variant_dropdown as a plain string:
  //   "1"  -> product has option groups that require the product page
  //   "0" / null -> quick-add is fine
  // The single-product detail API returns it as an array of objects.
  // Both shapes are handled defensively below.
  const needsProductPage =
    product.variant_dropdown === "1" ||
    (Array.isArray(product.variant_dropdown) &&
      product.variant_dropdown.length > 0) ||
    hasVariants; // ← variants need the product page to pick colour/size properly
  // ── Pill label — reflects product type ────────────────────────────────────
  // needsProductPage       → "Options"  (pill links to product page)
  // insufficientStockForMoq→ "Only N left" (disabled — MOQ can't be met)
  // plain, MOQ 1           → "Add"
  // MOQ > 1                → "Add 5"
  // variant selected       → "Add · Red"
  // MOQ + variant           → "Add 5 · Red"
  const pillLabel = (() => {
    if (needsProductPage) return "Options";
    if (insufficientStockForMoq) return `Only ${quantityNum} left`;
    const qtyPart = productMoq > 1 ? `Add ${productMoq}` : "Add";
    const variantPart =
      hasVariants && selectedVariant?.name ? ` · ${selectedVariant.name}` : "";
    return `${qtyPart}${variantPart}`;
  })();

  // aria-label for screen readers
  const pillAriaLabel = (() => {
    if (needsProductPage)
      return `View options for ${product.name} on product page`;
    if (insufficientStockForMoq)
      return `${product.name} requires a minimum order of ${productMoq}, but only ${quantityNum} left in stock`;
    const base = `Quick add ${productMoq > 1 ? productMoq + " of " : ""}${product.name}`;
    const variant =
      hasVariants && selectedVariant?.name ? ` (${selectedVariant.name})` : "";
    const moqNote = productMoq > 1 ? " — minimum order quantity" : "";
    return `${base}${variant}${moqNote} to cart`;
  })();

  return (
    <div
      className={`relative group rounded-3xl p-3 md:p-4 flex flex-col h-full font-odop ${
        isOutOfStock ? "bg-gray-50 cursor-not-allowed" : "bg-white"
      }`}
    >
      {/* Out of Stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/10 z-50 rounded-2xl flex items-center justify-center">
          <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
            Out of Stock
          </span>
        </div>
      )}

      {/* Business Type Badges */}
      {product.business_type === "3" && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
          {t("Premium")}
        </span>
      )}
      {product.business_type === "2" && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
          {t("Verified")}
        </span>
      )}

      {/* Wishlist */}
      {!isOutOfStock && (
        <div className="relative group">
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 hover:z-[70] transition-z-index duration-200">
            <WishlistButton productId={product.id} />
          </div>
        </div>
      )}

      {/* Product Image */}
      <Link
        href={!isOutOfStock ? `/products/${product.slug || product.id}` : "#"}
        title={
          !isOutOfStock
            ? `View ${product.name}`
            : `${product.name} is Out of Stock`
        }
        passHref
      >
        <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
          <Image
            src={mainImageSrc}
            alt={product.name || "Image not found!"}
            title={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-contain transition-opacity duration-300 ${
              isOutOfStock
                ? "opacity-70"
                : hasHoverMedia
                  ? "group-hover:opacity-0"
                  : ""
            }`}
          />

          {/* Hover media — video takes highest priority */}
          {!isOutOfStock &&
            (() => {
              if (product.product_video) {
                const videoUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${product.product_video}`;
                return (
                  <video
                    src={videoUrl}
                    muted
                    loop
                    playsInline
                    preload="none"
                    onMouseEnter={(e) => {
                      const video = e.currentTarget;
                      const playPromise = video.play();
                      if (playPromise !== undefined)
                        playPromise.catch(() => {});
                    }}
                    onMouseLeave={(e) => {
                      const video = e.currentTarget;
                      const playPromise = video.play();
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => {
                            video.pause();
                            video.currentTime = 0;
                          })
                          .catch(() => {
                            video.currentTime = 0;
                          });
                      } else {
                        video.pause();
                        video.currentTime = 0;
                      }
                    }}
                    className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
                  />
                );
              }

              // Variant hover → gallery fallback
              let hoverImage = null;
              if (hasVariants && selectedVariant) {
                hoverImage =
                  selectedVariant.backImage ||
                  selectedVariant.zoomImage ||
                  null;
              }
              if (!hoverImage) {
                const matches = product.image_g?.match(/src="([^"]+)"/g) || [];
                const urls = matches.map((src) => src.replace(/src="|"/g, ""));
                hoverImage = urls[1] || null;
              }

              return (
                hoverImage && (
                  <Image
                    src={getImageSrc(hoverImage)}
                    alt="Hover preview"
                    title="Hover preview"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
                  />
                )
              );
            })()}

          {/* Quick View – glass pill on desktop hover, compact icon on mobile */}
          {!isOutOfStock && (
            <>
              {/* soft scrim so the pill reads on any product photo */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 z-20" />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewProduct(product);
                  setQuantity(1);
                }}
                aria-label="Quick View"
                title="Quick View"
                className="absolute z-30 flex items-center justify-center gap-2 cursor-pointer
        bottom-2 right-2 h-9 w-9 rounded-full
        md:bottom-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:h-10 md:w-auto md:px-5
        bg-white/80 backdrop-blur-md text-[#A00300]
        border border-white/70 ring-1 ring-[#A00300]/10
        shadow-[0_4px_20px_rgba(160,3,0,0.18)]
        md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0
        transition-all duration-300 ease-out
        hover:bg-[#A00300] hover:text-white hover:ring-[#A00300]
        hover:shadow-[0_6px_24px_rgba(160,3,0,0.35)]
        active:scale-95"
              >
                <Eye className="w-4 h-4" strokeWidth={1.75} />
                <span className="hidden md:inline text-[11px] font-semibold uppercase tracking-[0.14em] whitespace-nowrap">
                  {t("Quick View")}
                </span>
              </button>
            </>
          )}
        </div>
      </Link>

      {/* Product info */}
      <div className="flex flex-col h-full">
        <div className="min-h-[50px] md:min-h-[60px]">
          {showPromoTag && (
            <div className="mb-1 md:mb-2">
              <span className="inline-flex items-center bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                {product.promo_tag}
              </span>
            </div>
          )}

          {/* BOGO badge */}
          {product.bogo_value && (
            <div className="relative inline-block mt-2 mb-2 font-odop">
              <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                {product.bogo_value}
              </span>
              <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg" />
            </div>
          )}

          <Link
            href={`/products/${product.slug}`}
            title={`View ${product.name}`}
            passHref
          >
            <h3
              className={`text-xs md:text-base line-clamp-2 mb-0.5 md:mb-1 capitalize ${
                isOutOfStock
                  ? "text-gray-500"
                  : "text-gray-950 hover:text-[#A00300]"
              } cursor-pointer transition-colors`}
            >
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          {review > 0 && (
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      i < Math.floor(review)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] md:text-xs text-gray-600 ml-1 font-odop">
                ({Number(review.toFixed(1))})
              </span>
            </div>
          )}
        </div>

        <div className="mt-0">
          {/* ── Color / size variant dropdown (product_variants) ─────────────
               Always shown when variants exist — independent of whether
               the product also has option groups (variant_dropdown array).
               Even if the pill becomes a "View Options" link, the user
               can still see which colour/size they'd be viewing.           */}

          <div className="space-y-1 mt-1">
            {/* Price row + quick-add pill */}
            <div className="flex items-center justify-between gap-1 min-w-0">
              <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                <p
                  className={`text-sm md:text-lg font-bold ${
                    isOutOfStock ? "text-gray-500" : "text-[#A00300]"
                  }`}
                >
                  ₹
                  {(hasPromo && (!hasVariants || variantPromoPercent > 0)
                    ? promoBasePrice
                    : basePrice
                  ).toFixed(2)}
                </p>

                {hasPromo && (!hasVariants || variantPromoPercent > 0) && (
                  <p className="text-xs md:text-sm text-gray-400 line-through">
                    ₹{basePrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* ── Quick-add pill / View Options link / disabled state ──────
                   variant_dropdown="1"      → Link pill → product page
                   insufficientStockForMoq   → disabled pill, no handler
                   everything else           → button pill → quick-add handler */}
              {!isOutOfStock &&
                (cartQty > 0 && !needsProductPage ? (
                  /* ── In-cart stepper ── */
                  <div className="flex items-center shrink-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        decrement();
                      }}
                      disabled={qtyProcessing}
                      className="w-7 h-8 md:w-auto md:h-auto md:px-2 md:py-1.5 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 shrink-0"
                      aria-label="Decrease quantity"
                    >
                      {cartQty === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </button>

                    <span className="text-xs md:text-sm font-semibold text-[#A00300] px-1 min-w-[20px] text-center shrink-0">
                      {qtyProcessing ? (
                        <span className="w-3 h-3 border border-[#A00300] border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        cartQty
                      )}
                    </span>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        increment();
                      }}
                      disabled={qtyProcessing}
                      className="w-7 h-8 md:w-auto md:h-auto md:px-2 md:py-1.5 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 shrink-0"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 md:w-3 md:h-3 text-gray-700 stroke-[2.5]" />
                    </button>
                  </div>
                ) : needsProductPage ? (
                  /* ── existing "Options" link pill ── */
                  <Link
                    href={`/products/${product.slug || product.id}`}
                    aria-label={pillAriaLabel}
                    onClick={(e) => e.stopPropagation()}
                    className="qa-pill qa-has-moq"
                  >
                    <span className="qa-pill-icon ml-1">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                    <span className="qa-pill-label">Options</span>
                  </Link>
                ) : insufficientStockForMoq ? (
                  /* ── disabled pill — stock can't cover the MOQ ── */
                  <button
                    type="button"
                    disabled
                    aria-label={pillAriaLabel}
                    title={`Minimum order is ${productMoq}, only ${quantityNum} left in stock`}
                    className="qa-pill qa-has-moq max-w-[140px] md:max-w-[170px] opacity-50 cursor-not-allowed"
                  >
                    <span className="qa-pill-icon ml-1 shrink-0">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </span>
                    <span className="qa-pill-label min-w-0 truncate">
                      {pillLabel}
                    </span>
                  </button>
                ) : (
                  /* ── existing quick-add pill ── */
                  <button
                    onClick={(e) =>
                      handleQuickAdd(
                        e,
                        product,
                        selectedVariants,
                        e.currentTarget,
                        productMoq,
                      )
                    }
                    aria-label={pillAriaLabel}
                    className={`qa-pill ${productMoq > 1 || hasVariants ? "qa-has-moq" : ""} max-w-[140px] md:max-w-[170px]`}
                  >
                    <span className="qa-pill-icon ml-1 shrink-0">
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                    </span>
                    <span className="qa-pill-label min-w-0 truncate">
                      {pillLabel}
                    </span>
                  </button>
                ))}
            </div>

            {/* MOQ note / stock-remaining note */}
            {!isOutOfStock && productMoq > 1 && (
              <span className="block text-[10px] md:text-xs text-gray-500 font-medium">
                {insufficientStockForMoq
                  ? `${t("Only")} ${quantityNum} ${t("left in stock")} · ${t("Min. order")}: ${productMoq}`
                  : `${t("Min. order")}: ${productMoq}`}
              </span>
            )}
            {/* Discount % badge */}
            {hasPromo && (!hasVariants || variantPromoPercent > 0) && (
              <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                {hasVariants && variantPromoPercent > 0
                  ? variantPromoPercent
                  : Math.round(
                      ((Number(product.price) - Number(product.promo_price)) /
                        Number(product.price)) *
                        100,
                    )}
                {t("% OFF")}
              </span>
            )}
          </div>

          {hasVariants && !isOutOfStock && !needsProductPage && (
            <div className="relative mt-2 mb-2 font-odop w-[90px] md:w-[110px]">
              <select
                aria-label="Select product variant"
                value={selectedVariant?.id}
                onChange={(e) => {
                  const v = variants.find(
                    (v) => String(v.id) === e.target.value,
                  );
                  setSelectedVariants((prev) => ({
                    ...prev,
                    [product.id]: v,
                  }));
                }}
                className="appearance-none text-xs md:text-sm uppercase font-medium pl-3 pr-8 py-1.5 md:py-2 rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer w-full truncate focus:outline-none focus:ring-2 focus:ring-[#A00300] focus:border-[#A00300] hover:border-[#A00300]/70 transition-all duration-200"
              >
                {variants.map((variant) => (
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

          {/* Best offer badge */}
          {bestOffer && (
            <div className="mt-2 mb-1">
              <div className="relative inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[12px] md:text-sm font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                Buy {bestOffer.offer_qty} for ₹{bestOffer.offer_price}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
