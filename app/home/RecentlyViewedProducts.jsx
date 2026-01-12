"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "../context/SessionContext"; // 👈 adjust path if needed

const RECENTLY_VIEWED_KEY = "recentlyViewedProducts";

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const getImageSrc = (src) => src || "/placeholder-product.jpg";

// 🔹 Title section (no i18n here, just plain text)
const renderTitleSection = () => (
  <motion.div
    className="relative mb-10 flex flex-col items-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.h3
      className="relative text-center text-[28px] md:text-[30px] font-semibold text-[#A00300] uppercase"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
    >
      Recently Viewed
    </motion.h3>

    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="mt-2"
    >
      <Link
        href="/products"
        className="text-[12px] font-medium text-[#000d45] hover:text-[var(--primary-color)] underline underline-offset-4 transition-all duration-300"
      >
        View All Products →
      </Link>
    </motion.div>
  </motion.div>
);

export default function RecentlyViewedProducts() {
  const [items, setItems] = useState([]);
  const { isLoggedIn } = useSession(); // 👈 from SessionContext

  useEffect(() => {
    // If logged in, don't even bother reading localStorage
    if (isLoggedIn) {
      setItems([]);
      return;
    }

    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      setItems(parsed);
    } catch (err) {
      console.warn("Failed to read recently viewed:", err);
    }
  }, [isLoggedIn]);

  // 🔒 Hide entire section for logged-in users or if no items
  if (isLoggedIn || !items || items.length === 0) return null;

  return (
    <section className="mt-10 px-4 md:px-20">
      {/* 🔹 Fancy animated title */}
      {renderTitleSection()}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product) => {
          const isOutOfStock =
            typeof product.quantity === "number" && product.quantity <= 0;

          const hasPromo =
            typeof product.promo_price === "number" &&
            product.promo_price > 0 &&
            product.promo_price < product.price;

          const finalBasePrice = Number(product.price || 0);
          const finalPromoPrice = hasPromo
            ? Number(product.promo_price || 0)
            : null;

          const discountPercent =
            hasPromo && finalBasePrice > 0
              ? `${Math.round(
                  ((finalBasePrice - finalPromoPrice) / finalBasePrice) * 100
                )}`
              : null;

          const review = Number(product.review || 0);

          // Try to compute hover image if HTML blob is stored
          let hoverImage = null;
          if (product.image_g) {
            try {
              const matches = product.image_g?.match(/src="([^"]+)"/g) || [];
              const urls = matches.map((src) => src.replace(/src="|"/g, ""));
              hoverImage = urls[1] || null;
            } catch {
              hoverImage = null;
            }
          }

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
              className={`relative group rounded-3xl p-3 md:p-6 flex flex-col h-full ${
                isOutOfStock ? "bg-gray-50 cursor-not-allowed" : "bg-white"
              }`}
            >
              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/10 z-20 rounded-2xl flex items-center justify-center">
                  <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Business Type Badges */}
              {product.business_type === "3" && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
                  Premium
                </span>
              )}

              {product.business_type === "2" && (
                <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] sm:text-sm font-semibold px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-lg shadow-md z-10 border border-[#A00300]/20">
                  Verified
                </span>
              )}

              {/* Product Image */}
              <Link
                href={
                  !isOutOfStock
                    ? `/products/${product.slug || product.id}`
                    : "#"
                }
                passHref
              >
                <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={product.name || "Image not found!"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className={`object-contain ${
                      isOutOfStock ? "opacity-70" : ""
                    }`}
                  />

                  {/* Hover Image (if available) */}
                  {!isOutOfStock && hoverImage && (
                    <Image
                      src={getImageSrc(hoverImage)}
                      alt="Hover preview"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
                    />
                  )}
                </div>
              </Link>

              {/* Product Info */}
              <div className="flex flex-col h-full">
                <div className="min-h-[50px] md:min-h-[60px]">
                  {product.promo_tag && (
                    <div className="mb-1 md:mb-2">
                      <span className="inline-flex items-center bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                        {product.promo_tag}
                      </span>
                    </div>
                  )}

                  {product.bogo_value && (
                    <div className="relative inline-block mt-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-xs md:text-sm font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                        {product.bogo_value}
                      </span>
                    </div>
                  )}

                  <Link href={`/products/${product.slug}`} passHref>
                    <h3
                      className={`text-xs md:text-base font-semibold line-clamp-2 mb-0.5 md:mb-1 capitalize ${
                        isOutOfStock
                          ? "text-gray-500"
                          : "text-gray-950 hover:text-[#A00300]"
                      } cursor-pointer transition-colors`}
                    >
                      {product.name}
                    </h3>
                  </Link>

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

                {/* Price section */}
                <div className="mt-0">
                  <div className="space-y-1 mt-1">
                    {hasPromo ? (
                      <>
                        <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                          <p
                            className={`text-sm md:text-lg font-bold ${
                              isOutOfStock ? "text-gray-500" : "text-[#A00300]"
                            }`}
                          >
                            ₹{finalPromoPrice.toFixed(2)}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400 line-through">
                            ₹{finalBasePrice.toFixed(2)}
                          </p>
                        </div>

                        {discountPercent && (
                          <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                        <p
                          className={`text-sm md:text-lg font-bold ${
                            isOutOfStock ? "text-gray-500" : "text-gray-950"
                          }`}
                        >
                          ₹{finalBasePrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
