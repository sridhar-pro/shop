"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/app/utils/variants";
import WishlistButton from "@/app/components/WishlistButton";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/app/utils/AuthContext";
import { useCartQty } from "@/app/hooks/useCartQty";

import { QUICK_ADD_STYLES } from "@/app/home/Products/constants/quickAddStyles";
import { createQuickAddHandler } from "@/app/home/Products/hooks/useQuickAdd";

const handleQuickAdd = createQuickAddHandler();

// ── Per-item stepper/pill — needs its own component to call useCartQty ────────
function RelatedItemAction({ item, itemMoq, availableQty, needsProductPage }) {
  const { t } = useTranslation();
  const { getValidToken } = useAuth();
  const {
    qty: cartQty,
    increment,
    decrement,
    processing: qtyProcessing,
  } = useCartQty(item.id, getValidToken);

  // In stock (availableQty > 0, guaranteed by the parent only rendering
  // this when !isOutOfStock) but not enough units to cover the MOQ —
  // a valid order can't be placed, so quick-add must be disabled.
  const insufficientStockForMoq = itemMoq > 1 && availableQty < itemMoq;

  const pillLabel = insufficientStockForMoq
    ? `Only ${availableQty} left`
    : itemMoq > 1
      ? `Add ${itemMoq}`
      : "Add";

  if (needsProductPage) {
    return (
      <Link
        href={`/products/${item.slug}`}
        aria-label={`View options for ${item.name} on product page`}
        onClick={(e) => e.stopPropagation()}
        className="qa-pill qa-has-moq"
      >
        <span className="qa-pill-icon">
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
    );
  }

  if (cartQty > 0 && !insufficientStockForMoq) {
    return (
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            decrement();
          }}
          disabled={qtyProcessing}
          className="px-2 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          {cartQty === 1 ? (
            <Trash2 className="w-3 h-3 text-gray-500" />
          ) : (
            <Minus className="w-3 h-3 text-gray-600" />
          )}
        </button>
        <span className="text-xs md:text-sm font-semibold text-[#A00300] px-1 min-w-[18px] text-center">
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
          className="px-2 py-1.5 hover:bg-gray-100 transition disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <Plus className="w-3 h-3 text-gray-600" />
        </button>
      </div>
    );
  }

  if (insufficientStockForMoq) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${item.name} requires a minimum order of ${itemMoq}, but only ${availableQty} left in stock`}
        title={`Minimum order is ${itemMoq}, only ${availableQty} left in stock`}
        className="qa-pill qa-has-moq opacity-50 cursor-not-allowed"
      >
        <span className="qa-pill-icon">
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
        <span className="qa-pill-label">{pillLabel}</span>
      </button>
    );
  }

  return (
    <button
      onClick={(e) => handleQuickAdd(e, item, {}, e.currentTarget, itemMoq)}
      aria-label={
        itemMoq > 1
          ? `Quick add ${itemMoq} of ${item.name} to cart (minimum order quantity)`
          : `Quick add ${item.name} to cart`
      }
      className={`qa-pill ${itemMoq > 1 ? "qa-has-moq" : ""}`}
    >
      <span className="qa-pill-icon">
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
      <span className="qa-pill-label">{pillLabel}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductRelatedItems({ product, DOMAIN_KEY }) {
  const { t } = useTranslation();

  if (!product.related_items?.length) return null;

  return (
    <section className="w-full bg-white border-t border-red-50 pt-16 pb-20 px-6">
      <style>{QUICK_ADD_STYLES}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-[1600px] mx-auto"
      >
        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-12 max-md:flex-col max-md:items-start max-md:gap-4 max-md:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block h-px w-6 bg-red-700 opacity-40" />
              <span
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  color: "#b06060",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {t("You may also like")}
              </span>
            </div>

            <h2
              className="m-0 leading-[0.9] tracking-[-0.04em]"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(30px, 4.5vw, 60px)",
                fontWeight: 400,
                color: "#1c1210",
              }}
            >
              {t("Related")}
              <em
                style={{
                  display: "inline",
                  fontStyle: "italic",
                  color: "#A00300",
                  fontWeight: 300,
                  marginLeft: "0.3em",
                }}
              >
                {t("Products")}
              </em>
            </h2>
          </div>

          <Link
            href="/products"
            title="Browse all Products"
            className="group flex items-center gap-2 no-underline pb-[2px]"
            style={{ borderBottom: "1px solid rgba(185,28,28,0.22)" }}
          >
            <span
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                color: "#4b2020",
              }}
            >
              {t("View all")}
            </span>
            <span
              className="w-5 h-5 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
              style={{
                border: "1px solid rgba(185,28,28,0.30)",
                color: "#b91c1c",
              }}
            >
              <ArrowUpRight size={11} strokeWidth={1.8} />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-24 gap-y-16 md:gap-y-20">
          {product.related_items.slice(1, 17).map((item) => {
            const availableQty =
              Array.isArray(item?.variants) && item.variants.length > 0
                ? Number(item.variants?.[0]?.variant_quantity || 0)
                : Number(item?.quantity || 0);

            const isOutOfStock = availableQty <= 0;

            const hasValidPromo =
              item?.promo_price !== null &&
              item?.promo_price !== undefined &&
              !isNaN(Number(item.promo_price)) &&
              Number(item.promo_price) > 0 &&
              Number(item.promo_price) < Number(item.price) &&
              item?.end_date &&
              new Date(item.end_date).getTime() > Date.now();

            const itemMoq =
              Number(item.minimum_order_qty) > 1
                ? Number(item.minimum_order_qty)
                : 1;

            const insufficientStockForMoq =
              !isOutOfStock && itemMoq > 1 && availableQty < itemMoq;

            const hasVariants =
              Array.isArray(item.variants) && item.variants.length > 0;

            const needsProductPage =
              item.variant_dropdown === "1" ||
              (Array.isArray(item.variant_dropdown) &&
                item.variant_dropdown.length > 0) ||
              hasVariants;

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={`relative group flex flex-col transition ${
                  isOutOfStock ? "opacity-70" : ""
                }`}
                style={{ height: "100%" }}
              >
                {item.is_premium && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg z-10">
                    {t("Premium")}
                  </span>
                )}

                <div className="absolute top-2 right-2 z-10">
                  <WishlistButton productId={item.id} variant="icon" />
                </div>

                {isOutOfStock ? (
                  <div className="block w-full overflow-hidden mb-2 cursor-not-allowed">
                    <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                      <Image
                        src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
                        alt={item.name}
                        title={item.name}
                        fill
                        className="object-contain opacity-80"
                      />
                      <div className="absolute inset-0 bg-white/10 z-30 rounded-2xl flex items-center justify-center">
                        <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/products/${item.slug}`}
                    title="Browse product"
                    className="block w-full overflow-hidden group mb-2"
                  >
                    <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                      <Image
                        src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
                        alt={item.name}
                        title={item.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                )}

                <div className="flex flex-col ml-4">
                  <h4
                    className="h-[40px] md:h-[44px] text-sm md:text-base leading-5 md:leading-[22px] text-gray-950 hover:text-[#A00300] transition-colors mb-1 capitalize line-clamp-2 overflow-hidden"
                    style={{ maxWidth: "30ch", wordBreak: "break-word" }}
                  >
                    {item.name}
                  </h4>

                  {item.promo_tag && (
                    <div className="mb-1 md:mb-2">
                      <span className="text-green-700 text-[14px] sm:text-sm italic font-semibold">
                        {item.promo_tag}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-[#A00300]">
                        ₹
                        {hasValidPromo
                          ? Number(item.promo_price).toFixed(2)
                          : Number(item.price).toFixed(2)}
                      </p>
                      {hasValidPromo && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                      )}
                      {hasValidPromo && (
                        <span className="text-[10px] font-medium text-red-600">
                          {Math.round(
                            ((Number(item.price) - Number(item.promo_price)) /
                              Number(item.price)) *
                              100,
                          )}
                          {t("% OFF")}
                        </span>
                      )}
                    </div>

                    {/* ── Pill / stepper — delegated to RelatedItemAction ── */}
                    {!isOutOfStock && (
                      <RelatedItemAction
                        item={item}
                        itemMoq={itemMoq}
                        availableQty={availableQty}
                        needsProductPage={needsProductPage}
                      />
                    )}
                  </div>

                  {!isOutOfStock && itemMoq > 1 && (
                    <span className="block text-[10px] text-gray-500 font-medium mt-0.5">
                      {insufficientStockForMoq
                        ? `${t("Only")} ${availableQty} ${t("left in stock")} · ${t("Min. order")}: ${itemMoq}`
                        : `${t("Min. order")}: ${itemMoq}`}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
