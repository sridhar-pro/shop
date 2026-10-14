"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { getImageSrc, getPriceInfo } from "./utils";

export default function ProductCard({ product, variant = "small", badge, className = "" }) {
  const [liked, setLiked] = useState(false);
  const large = variant === "large";
  const isOutOfStock = !product.quantity || Number(product.quantity) <= 0;
  const { onPromo, price, promo, off } = getPriceInfo(product);

  return (
    <div
      className={`group relative flex flex-col overflow-hidden border border-[#efe4d6] bg-white ${
        isOutOfStock ? "opacity-70" : ""
      } ${className}`}
    >
      {/* badge */}
      {badge && (
        <span
          className={`absolute left-2 top-2 z-10 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.15em] text-white ${
            badge === "New" ? "bg-[#7b1230]" : "bg-[#2b2b33]/90"
          }`}
        >
          {badge}
        </span>
      )}

      {/* wishlist (outside the Link so no nested interactive elements) */}
      <button
        type="button"
        aria-label="Add to wishlist"
        onClick={() => setLiked((v) => !v)}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110"
      >
        <Heart
          className={`h-3.5 w-3.5 ${liked ? "fill-[#a00300] text-[#a00300]" : "text-[#3a2f33]"}`}
        />
      </button>

      <Link
        href={isOutOfStock ? "#" : `/products/${product.slug}`}
        title={isOutOfStock ? `${product.name} is Out of Stock` : `View ${product.name}`}
        className={`flex h-full flex-col ${isOutOfStock ? "cursor-not-allowed" : ""}`}
      >
        <div
          className={`relative overflow-hidden bg-[#f3ebe2] ${
            large ? "min-h-[230px] flex-1" : "h-32 sm:h-36"
          }`}
        >
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? "blur-[1.5px]" : ""
            }`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-md bg-[#A00300] px-3 py-1 text-[10px] font-bold text-white shadow-lg sm:text-xs">
                OUT OF STOCK
              </span>
            </div>
          )}
        </div>

        <div className={large ? "p-3 sm:p-4" : "p-3"}>
          <h3
            className={`line-clamp-1 capitalize text-[#1c1620] ${
              large ? "text-sm sm:text-[15px]" : "text-xs sm:text-[13px]"
            }`}
          >
            {product.name}
          </h3>

          {large && product.promo_tag && (
            <p className="mt-1 line-clamp-1 text-[11px] font-light text-[#7a6f72]">
              {product.promo_tag}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-[#1c1620] sm:text-[15px]">
              ₹{(onPromo ? promo : price).toLocaleString("en-IN")}
            </span>
            {onPromo && (
              <>
                <span className="text-[11px] text-gray-400 line-through">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="bg-[#b8102c] px-1.5 py-[3px] text-[9px] font-semibold uppercase text-white">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <span className="mt-3 flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.18em] text-[#1c1620]">
            View product <ArrowRight className="h-3 w-3 text-[#a00300]" />
          </span>
        </div>
      </Link>
    </div>
  );
}
