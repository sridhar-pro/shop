"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import WishlistButton from "@/app/components/WishlistButton";
import { useTranslation } from "react-i18next";

/* ─── Framer variants ─── */
const cardReveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.065 },
  }),
};

/* ─────────────────────────────────────────
   BACKGROUND DECORATIONS
───────────────────────────────────────── */

/* Corner bracket — reusable, flipped via CSS transform */
function CornerBracket({ style = {} }) {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute pointer-events-none z-10"
      style={style}
    >
      {/* outer L */}
      <path
        d="M4 4 L4 36"
        stroke="#b91c1c"
        strokeWidth="1"
        strokeOpacity="0.18"
      />
      <path
        d="M4 4 L36 4"
        stroke="#b91c1c"
        strokeWidth="1"
        strokeOpacity="0.18"
      />
      {/* inner L */}
      <path
        d="M11 11 L11 24"
        stroke="#b91c1c"
        strokeWidth="0.5"
        strokeOpacity="0.10"
      />
      <path
        d="M11 11 L24 11"
        stroke="#b91c1c"
        strokeWidth="0.5"
        strokeOpacity="0.10"
      />
      {/* corner pip */}
      <circle cx="4" cy="4" r="2" fill="#b91c1c" fillOpacity="0.22" />
      <circle cx="4" cy="4" r="1" fill="#b91c1c" fillOpacity="0.35" />
    </svg>
  );
}

/* Scattered background motif — a floral / mandala stamp */
function BgStamp({ style = {} }) {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={style}
    >
      {/* outer ring */}
      <circle
        cx="80"
        cy="80"
        r="74"
        stroke="#b91c1c"
        strokeWidth="0.5"
        strokeOpacity="0.08"
        strokeDasharray="4 6"
      />
      {/* mid ring */}
      <circle
        cx="80"
        cy="80"
        r="52"
        stroke="#b91c1c"
        strokeWidth="0.4"
        strokeOpacity="0.06"
      />
      {/* inner ring */}
      <circle
        cx="80"
        cy="80"
        r="30"
        stroke="#b91c1c"
        strokeWidth="0.4"
        strokeOpacity="0.07"
        strokeDasharray="2 4"
      />
      {/* 8 radial spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="80"
          y1="80"
          x2={80 + 74 * Math.cos((deg * Math.PI) / 180)}
          y2={80 + 74 * Math.sin((deg * Math.PI) / 180)}
          stroke="#b91c1c"
          strokeWidth="0.4"
          strokeOpacity="0.05"
        />
      ))}
      {/* petal dots on mid ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <circle
          key={`d-${deg}`}
          cx={80 + 52 * Math.cos((deg * Math.PI) / 180)}
          cy={80 + 52 * Math.sin((deg * Math.PI) / 180)}
          r="2.5"
          fill="#b91c1c"
          fillOpacity="0.09"
        />
      ))}
      {/* center pip */}
      <circle cx="80" cy="80" r="4" fill="#b91c1c" fillOpacity="0.08" />
      <circle cx="80" cy="80" r="1.5" fill="#b91c1c" fillOpacity="0.14" />
    </svg>
  );
}

/* Thin diagonal cross-hatch region */
function HatchBlock({ style = {} }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute pointer-events-none"
      style={style}
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={i}
          x1={i * 14}
          y1="0"
          x2={i * 14 - 120}
          y2="120"
          stroke="#b91c1c"
          strokeWidth="0.5"
          strokeOpacity="0.06"
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────── */
function ProductCard({ item, index }) {
  const { t } = useTranslation();

  const imgSrc =
    item?.p_image ||
    item?.image ||
    item?.product_image?.[0] ||
    "/placeholder-product.jpg";

  const variantList = item?.product_variants ?? item?.variants ?? [];

  const availableQty =
    Array.isArray(variantList) && variantList.length > 0
      ? Number(
          variantList[0]?.variant_quantity ||
            variantList[0]?.quantity ||
            variantList[0]?.qty ||
            0,
        )
      : Number(item?.qty ?? item?.quantity ?? 0);

  const isOutOfStock = availableQty <= 0;

  /* =========================================================
     PROMOTION / OFFER LOGIC
     Same principle as ProductPriceSection
     ========================================================= */

  const productPrice = Number(item?.price || 0);
  const productPromoPrice = Number(item?.promo_price || 0);

  /*
   * Promotion is valid only when:
   * - promotion === 1
   * - promo_price exists
   * - promo_price < original price
   * - end_date exists
   * - end_date has not expired
   */
  const isPromoValid =
    Number(item?.promotion || 0) === 1 &&
    productPromoPrice > 0 &&
    productPromoPrice < productPrice &&
    item?.end_date &&
    new Date(`${item.end_date}T23:59:59`).getTime() >= Date.now();

  /* =========================================================
     VARIANT PROMOTION
     ========================================================= */

  const selectedVariant =
    Array.isArray(variantList) && variantList.length > 0
      ? variantList[0]
      : null;

  const variantPrice = selectedVariant
    ? Number(selectedVariant?.price || 0)
    : 0;

  const variantDiscountPrice = selectedVariant
    ? Number(
        selectedVariant?.discount_price || selectedVariant?.promo_price || 0,
      )
    : 0;

  const variantPromoPercentage = selectedVariant
    ? Math.max(
        0,
        Number(
          selectedVariant?.promo_percentage ||
            selectedVariant?.discount_percentage ||
            0,
        ),
      )
    : 0;

  const isVariantPromoValid =
    selectedVariant &&
    Number(item?.promotion || 0) === 1 &&
    variantDiscountPrice > 0 &&
    variantPrice > 0 &&
    variantDiscountPrice < variantPrice &&
    item?.end_date &&
    new Date(`${item.end_date}T23:59:59`).getTime() >= Date.now();

  /* =========================================================
     FINAL PRICE
     ========================================================= */

  const hasVariants = Boolean(selectedVariant);

  const hasActivePromo = hasVariants ? isVariantPromoValid : isPromoValid;

  const originalPrice = hasVariants ? variantPrice : productPrice;

  const displayPrice = hasVariants
    ? isVariantPromoValid
      ? variantDiscountPrice
      : variantPrice
    : isPromoValid
      ? productPromoPrice
      : productPrice;

  /* =========================================================
     DISCOUNT %
     ========================================================= */

  const discountPercent = hasVariants
    ? isVariantPromoValid
      ? variantPromoPercentage > 0
        ? variantPromoPercentage
        : Math.round(
            ((variantPrice - variantDiscountPrice) / variantPrice) * 100,
          )
      : 0
    : isPromoValid
      ? Math.round(((productPrice - productPromoPrice) / productPrice) * 100)
      : 0;

  /* =========================================================
     PROMO TAG
     ========================================================= */

  const hasPromoTag =
    Boolean(item?.promo_tag) && String(item.promo_tag).trim().length > 0;

  /* =========================================================
     QUANTITY OFFERS
     ========================================================= */

  const parsedOffers = (() => {
    if (!item?.offers) return [];

    try {
      const parsed =
        typeof item.offers === "string" ? JSON.parse(item.offers) : item.offers;

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const validOffers = parsedOffers.filter(
    (offer) =>
      offer && Number(offer?.offer_qty) > 0 && Number(offer?.offer_price) > 0,
  );

  const hasQuantityOffer = validOffers.length > 0;

  /* =========================================================
     BOGO
     ========================================================= */

  const hasBogoOffer = Array.isArray(item?.bogo_offer)
    ? item.bogo_offer.length > 0
    : Boolean(item?.bogo_offer);

  const bogoTitle = Array.isArray(item?.bogo_offer)
    ? item.bogo_offer[0]?.title ||
      item.bogo_offer[0]?.bogo_title ||
      item?.bogo_value
    : typeof item?.bogo_offer === "object"
      ? item?.bogo_offer?.title ||
        item?.bogo_offer?.bogo_title ||
        item?.bogo_value
      : item?.bogo_value;

  /* =========================================================
     ANY OFFER
     ========================================================= */

  const hasAnyOffer =
    hasActivePromo ||
    hasPromoTag ||
    hasQuantityOffer ||
    hasBogoOffer ||
    Boolean(item?.bogo_value);

  /* =========================================================
     OFFER LABEL
     Priority:
     1. Promo tag
     2. BOGO
     3. Quantity offer
     4. Percentage discount
     5. Promotion
     ========================================================= */

  const offerLabel = hasPromoTag
    ? String(item.promo_tag).trim()
    : hasBogoOffer
      ? bogoTitle || "BOGO"
      : hasQuantityOffer
        ? "OFFER"
        : discountPercent > 0
          ? `${discountPercent}% OFF`
          : Number(item?.promotion || 0) === 1
            ? "PROMO"
            : null;

  return (
    <Link href={`/products/${item.slug}`} title={item.name} className="block">
      <motion.article
        custom={index}
        variants={cardReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="group relative flex flex-col cursor-pointer"
      >
        {/* IMAGE FRAME */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "6/7",
            background: "linear-gradient(145deg, #f5ede8 0%, #f0ecec 100%)",
          }}
        >
          <Image
            src={imgSrc}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] ${
              isOutOfStock ? "brightness-[0.75] saturate-[0.5]" : ""
            }`}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 20vw"
          />

          {/* BOTTOM VIGNETTE */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(240,228,220,0.22) 0%, rgba(240,228,220,0.025) 38%, transparent 100%)",
            }}
          />

          {/* =================================================
    OFFER BADGE
    ================================================= */}
          {hasAnyOffer && !isOutOfStock && (
            <div
              className="absolute left-0 top-3 z-10 flex items-center overflow-hidden rounded-r-xl shadow-[0_6px_18px_rgba(127,29,29,0.28)]"
              style={{
                background:
                  "linear-gradient(135deg, #b91c1c 0%, #991b1b 55%, #7f1d1d 100%)",
              }}
            >
              {hasActivePromo && discountPercent > 0 ? (
                <>
                  {/* Percentage */}
                  <div
                    className="flex items-center justify-center px-3 py-2.5"
                    style={{
                      background:
                        "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: "22px",
                        fontWeight: 700,
                        fontStyle: "italic",
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        color: "#fff",
                        textShadow: "0 1px 2px rgba(0,0,0,0.18)",
                      }}
                    >
                      {discountPercent}%
                    </span>
                  </div>

                  {/* OFF label */}
                  <div className="flex flex-col justify-center px-2.5 py-2">
                    <span
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        fontSize: "8px",
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: "0.16em",
                        color: "#fff",
                      }}
                    >
                      OFF
                    </span>

                    <span
                      className="mt-1"
                      style={{
                        fontFamily: "ui-sans-serif, system-ui, sans-serif",
                        fontSize: "6px",
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: "0.08em",
                        color: "rgba(255,255,255,0.72)",
                        textTransform: "uppercase",
                      }}
                    >
                      Deal
                    </span>
                  </div>
                </>
              ) : (
                /* Other offer types */
                <div className="flex items-center gap-1.5 px-3 py-2.5">
                  <span
                    className="text-[10px] font-bold text-white"
                    style={{
                      fontFamily: "ui-sans-serif, system-ui, sans-serif",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {offerLabel}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          <div
            className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(185,28,28,0.18)",
                boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
              }}
            >
              <WishlistButton productId={item.id} variant="icon" />
            </div>
          </div>

          {/* OUT OF STOCK */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <span
                className="font-semibold tracking-[0.2em] px-4 py-2"
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "7.5px",
                  color: "#4b3a35",
                  border: "1px solid rgba(75,58,53,0.28)",
                  background: "rgba(255,255,255,0.72)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {t("OUT OF STOCK")}
              </span>
            </div>
          )}

          {/* HOVER CTA */}
          {!isOutOfStock && (
            <div
              className="combo-drawer absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 py-[11px] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                borderTop: "1px solid rgba(185,28,28,0.12)",
              }}
            >
              <span
                className="font-semibold tracking-[0.13em]"
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "8.5px",
                  color: "#2c1e1e",
                  textTransform: "uppercase",
                }}
              >
                {hasAnyOffer ? t("View offer") : t("View piece")}
              </span>

              <span
                className="w-[26px] h-[26px] flex items-center justify-center rounded-full flex-shrink-0 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                style={{
                  border: "1px solid rgba(185,28,28,0.35)",
                  color: "#b91c1c",
                }}
              >
                <ArrowUpRight size={12} strokeWidth={1.8} />
              </span>
            </div>
          )}
        </div>

        {/* INFO STRIP */}
        <div
          className="pt-2.5 pb-3"
          style={{
            borderBottom: "1px solid rgba(185,28,28,0.10)",
          }}
        >
          {/* CATEGORY */}
          {item.category && (
            <p
              className="truncate mb-[3px]"
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: "7px",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9ca3af",
              }}
            >
              {item.category}
            </p>
          )}

          {/* NAME */}
          <span
            className="block mb-[7px] transition-colors duration-200 group-hover:text-red-700"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "#1c1412",
              lineHeight: 1.32,
              minHeight: "34.32px",
              maxHeight: "34.32px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {item.name}
          </span>

          {/* PRICE */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-[6px]">
              <span
                className="font-bold"
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "14px",
                  color: "#b91c1c",
                }}
              >
                ₹{Number(displayPrice).toFixed(0)}
              </span>

              {hasActivePromo && originalPrice > displayPrice && (
                <span
                  className="line-through"
                  style={{
                    fontFamily: "ui-sans-serif, system-ui, sans-serif",
                    fontSize: "10px",
                    color: "#c4b5b5",
                  }}
                >
                  ₹{Number(originalPrice).toFixed(0)}
                </span>
              )}
            </div>

            {isOutOfStock ? (
              <span
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "7.5px",
                  color: "#c4b5b5",
                  letterSpacing: "0.04em",
                }}
              >
                {t("Unavailable")}
              </span>
            ) : (
              <ArrowUpRight
                size={13}
                strokeWidth={1.6}
                color="#b91c1c"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </div>

          {/* DISCOUNT */}
          {hasActivePromo && discountPercent > 0 && (
            <div
              className="mt-1.5 inline-flex items-center px-2 py-[2px] rounded-full"
              style={{
                background: "#ecfdf3",
                color: "#15803d",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: "7px",
                fontWeight: 600,
              }}
            >
              {discountPercent}% {t("OFF")}
            </div>
          )}

          {/* QUANTITY OFFER */}
          {hasQuantityOffer && (
            <div
              className="mt-1.5 flex items-center gap-1"
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: "7px",
                color: "#9f6b6b",
              }}
            >
              <span>✦</span>

              <span>{t("Special quantity offer available")}</span>
            </div>
          )}

          {/* BOGO OFFER */}
          {hasBogoOffer && (
            <div
              className="mt-1.5 flex items-center gap-1"
              style={{
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
                fontSize: "7px",
                color: "#9f6b6b",
              }}
            >
              <span>✦</span>

              <span>{bogoTitle || t("Buy one get one offer")}</span>
            </div>
          )}
        </div>
      </motion.article>
    </Link>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function ProductComboItems({ product, DOMAIN_KEY }) {
  const { t } = useTranslation();

  if (!product?.combo_items?.length) return null;

  const items = product.combo_items.slice(0, 10);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-red-50 to-gray-50">
      {/* ════════════════════════════════════
          BACKGROUND LAYER
      ════════════════════════════════════ */}

      {/* subtle dot grid — printed textile feel */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(185,28,28,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.45,
        }}
      />

      {/* large Fraunces watermark — top right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none z-0 top-[-6%] right-[-3%]"
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: "clamp(220px, 30vw, 480px)",
          fontStyle: "italic",
          fontWeight: 700,
          lineHeight: 0.8,
          letterSpacing: "-0.07em",
          color: "rgba(185,28,28,0.035)",
          userSelect: "none",
        }}
      >
        ✦
      </div>

      {/* mandala stamp — top left */}
      <BgStamp style={{ top: "-40px", left: "-40px", opacity: 0.9 }} />
      {/* mandala stamp — bottom right, rotated */}
      <BgStamp
        style={{
          bottom: "-50px",
          right: "-50px",
          opacity: 0.8,
          transform: "rotate(22deg)",
        }}
      />
      {/* small mandala — mid right */}
      <BgStamp
        style={{
          top: "38%",
          right: "-60px",
          opacity: 0.5,
          transform: "scale(0.6) rotate(-15deg)",
        }}
      />

      {/* hatch block — bottom left area */}
      <HatchBlock style={{ bottom: "60px", left: "5%", opacity: 0.7 }} />
      {/* hatch block — top right area */}
      <HatchBlock
        style={{
          top: "40px",
          right: "12%",
          opacity: 0.5,
          transform: "rotate(90deg)",
        }}
      />

      {/* warm crimson soft bloom — top left */}
      <div
        className="absolute pointer-events-none z-0 rounded-full"
        style={{
          width: "500px",
          height: "500px",
          top: "-180px",
          left: "-180px",
          background:
            "radial-gradient(circle, rgba(185,28,28,0.07) 0%, transparent 68%)",
        }}
      />
      {/* blush bloom — bottom right */}
      <div
        className="absolute pointer-events-none z-0 rounded-full"
        style={{
          width: "420px",
          height: "420px",
          bottom: "-140px",
          right: "-120px",
          background:
            "radial-gradient(circle, rgba(185,28,28,0.05) 0%, transparent 65%)",
        }}
      />

      {/* top border rule — gradient crimson */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(185,28,28,0.30) 25%, rgba(185,28,28,0.30) 75%, transparent 100%)",
        }}
      />
      {/* bottom border rule */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(185,28,28,0.30) 25%, rgba(185,28,28,0.30) 75%, transparent 100%)",
        }}
      />

      {/* corner brackets × 4 */}
      <CornerBracket style={{ top: "20px", left: "20px" }} />
      <CornerBracket
        style={{ top: "20px", right: "20px", transform: "scaleX(-1)" }}
      />
      <CornerBracket
        style={{ bottom: "20px", left: "20px", transform: "scaleY(-1)" }}
      />
      <CornerBracket
        style={{ bottom: "20px", right: "20px", transform: "scale(-1,-1)" }}
      />

      {/* ════════════════════════════════════
          CONTENT
      ════════════════════════════════════ */}
      <div className="relative z-[2] w-full max-w-[1600px] mx-auto px-10 pt-10 pb-14 max-md:px-5 max-md:pt-10 max-md:pb-14">
        {/* ── HEADER ── */}
        <div className="flex items-end justify-between mb-14 max-md:flex-col max-md:items-start max-md:gap-5 max-md:mb-10">
          <div>
            {/* eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <span className="inline-block h-px w-7 flex-shrink-0 bg-red-700 opacity-50" />
              <span
                style={{
                  fontFamily: "ui-sans-serif, system-ui, sans-serif",
                  fontSize: "9.5px",
                  letterSpacing: "0.14em",
                  color: "#9f6b6b",
                }}
              >
                {t("Curated for this piece")}
              </span>
            </div>

            {/* heading */}
            <h2
              className="m-0"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: "clamp(30px, 5vw, 60px)",
                fontWeight: 400,
                color: "#1c1210",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                maxWidth: "1000px",
              }}
            >
              {t("Customers who viewed this item")}
              <em
                style={{
                  display: "block",
                  fontStyle: "italic",
                  color: "#A00300",
                  fontWeight: 300,
                  marginLeft: "0.4em",
                }}
              >
                {t("also viewed")}
              </em>
            </h2>
          </div>

          {/* right descriptor */}
          <p
            className="max-w-[260px] text-right max-md:text-left max-md:max-w-none"
            style={{
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              fontSize: "11px",
              color: "#9f6b6b",
              lineHeight: 1.75,
            }}
          >
            {t(
              "A considered selection of pieces by Yuukke artisans — chosen to belong together.",
            )}
          </p>
        </div>

        {/* ── PRODUCT RAIL — 5 columns ── */}
        <div className="combo-grid">
          {items.map((item, index) => (
            <ProductCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className="flex items-center justify-center gap-5 mt-16">
          <span
            className="flex-1 h-px max-w-[100px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(185,28,28,0.25))",
            }}
          />
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "11px",
              fontStyle: "italic",
              color: "#9f6b6b",
            }}
          >
            {t("Selected especially for you")} ✦
          </span>
          <span
            className="flex-1 h-px max-w-[100px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(185,28,28,0.25), transparent)",
            }}
          />
        </div>
      </div>

      {/* ── Responsive grid ── */}
      <style jsx>{`
        .combo-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 22px 16px;
        }
        @media (max-width: 1280px) {
          .combo-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        @media (max-width: 960px) {
          .combo-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .combo-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px 12px;
          }
        }
        @media (max-width: 380px) {
          .combo-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
      `}</style>
    </section>
  );
}
