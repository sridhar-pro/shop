"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  X,
  Star,
  ShoppingCart,
  ArrowRight,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import { useSession } from "@/app/context/SessionContext"; // 🔁 adjust path if needed
import CartSidebar from "@/app/components/CartSideBar";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTranslation } from "react-i18next";
import WishlistButton from "@/app/components/WishlistButton";
import { trackProductHistory } from "../utils/productHistory";

const RecentlyViewed = () => {
  const { t } = useTranslation();
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "betalearnings";

  const { getValidToken, isAuthReady } = useAuth();
  const { isLoggedIn, companyId } = useSession();

  const [recentProducts, setRecentProducts] = useState([]);
  const [error, setError] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const modalRef = useRef(null);
  const sliderRef = useRef(null); // 🔹 for horizontal scroll

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({});

  // 🔹 Derived quantity rules (safe even when quickViewProduct is null)
  const minOrderQty = Number(quickViewProduct?.minimum_order_qty) || 1;
  const minOrderLimit = Number(quickViewProduct?.minimum_order_limit) || 1;
  const MIN_LIMIT = minOrderQty > 0 ? minOrderQty : 1;
  const MAX_LIMIT =
    minOrderQty > 1
      ? Math.min(quickViewProduct?.quantity || 100, 30)
      : Math.min(quickViewProduct?.quantity || 100, 10);

  // 🔹 Image helper functions
  const getImageSrcThumbs = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/thumbs/${image}`;
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  // 🔹 Fetch Recently Viewed – POST with company_id
  useEffect(() => {
    if (!isAuthReady) return;
    if (!isLoggedIn || !companyId) return; // only for logged in users
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRecentlyViewed = async () => {
      try {
        setLoading(true);
        const token = await getValidToken();

        const res = await fetch("/api/recentlyviewed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_id: Number(companyId),
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setRecentProducts(data);
        } else {
          setRecentProducts([]);
        }
      } catch (err) {
        console.error("⚠️ Error fetching recently viewed:", err);
        setError(err.message || "Failed to load recently viewed products");
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [isAuthReady, isLoggedIn, companyId, getValidToken]);

  // 🔹 When quickViewProduct changes, reset main image
  useEffect(() => {
    if (quickViewProduct) {
      setMainImage(quickViewProduct.images?.[0] || quickViewProduct.image);
    } else {
      setMainImage(null);
    }
  }, [quickViewProduct]);

  // 🔹 Ensure quantity respects min rules
  useEffect(() => {
    setQuantity(MIN_LIMIT);
  }, [MIN_LIMIT]);

  // 🔹 Initialize selected variant for quick view
  useEffect(() => {
    if (!quickViewProduct) return;

    if (
      Array.isArray(quickViewProduct?.product_variants) &&
      quickViewProduct.product_variants.length > 0 &&
      !selectedVariants[quickViewProduct.id]
    ) {
      const v = quickViewProduct.product_variants[0];
      setSelectedVariants((prev) => ({
        ...prev,
        [quickViewProduct.id]: {
          id: v.id,
          name: v.name,
          price: Number(v.price),
          quantity: Number(v.quantity),
        },
      }));
    }
  }, [quickViewProduct, selectedVariants]);

  // ⛔️ IMPORTANT: all hooks are above this line

  // 1) Not logged in → show nothing
  if (!isLoggedIn) return null;

  // 2) Loaded but nothing to show → show nothing
  if (!loading && (!recentProducts || recentProducts.length === 0)) {
    return null;
  }

  // ---------- Non-hook helpers below (safe) ----------

  const increaseQty = () =>
    setQuantity((prev) => Math.min(prev + 1, MAX_LIMIT));

  const decreaseQty = () =>
    setQuantity((prev) => (prev > MIN_LIMIT ? prev - 1 : MIN_LIMIT));

  const toggleWishlist = (slug) => {
    setWishlist((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  const handleVariantChange = (productId, variant) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const renderTitleSection = (title) => (
    <motion.div
      className="relative mb-20 flex flex-col items-center"
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
        {t(title)}
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

  const renderProductCardSkeletons = (count = 6) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg p-4 shadow-sm bg-white animate-pulse"
        >
          <Skeleton height={180} />
          <Skeleton height={20} style={{ marginTop: "1rem" }} />
          <Skeleton height={20} width={"80%"} />
          <Skeleton height={30} width={"60%"} style={{ marginTop: "1rem" }} />
        </div>
      ))}
    </div>
  );

  // 🔹 Single product card (reusable for grid & slider)
  const renderProductCard = (product, extraWrapperClasses = "") => {
    const now = new Date();
    const promoEndDate = product.end_date ? new Date(product.end_date) : null;
    const isPromoActive =
      promoEndDate && promoEndDate.getTime() > now.getTime();

    const hasPromo =
      isPromoActive &&
      product.promotion === "1" &&
      product.promo_price &&
      product.promo_price > 0;

    const promoPrice =
      hasPromo && product.promo_price
        ? Number(product.promo_price)
        : product.sale_price
          ? Number(product.sale_price)
          : Number(product.price);

    const originalPrice = Number(product.price);
    const discountPercent = hasPromo
      ? Math.round(((originalPrice - promoPrice) / originalPrice) * 100)
      : 0;

    const showPromoTag = product.promo_tag;
    const review = Number(product.review);

    const quantityStr = product.quantity?.toString() || "";
    const quantityNum = parseFloat(quantityStr);
    const isOutOfStock =
      quantityStr === "0" ||
      quantityStr === "" ||
      isNaN(quantityNum) ||
      quantityNum <= 0;

    const variants = Array.isArray(product.product_variants)
      ? product.product_variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          price: Number(variant.price),
          quantity: Number(variant.quantity),
          image: variant.front_view || null,
        }))
      : [];

    const selectedVariant =
      selectedVariants[product.id] ||
      (variants.length > 0 ? variants[0] : null);

    const variantExtra = selectedVariant ? selectedVariant.price : 0;
    const finalPromoPrice =
      hasPromo && product.promo_price
        ? Number(product.promo_price) + variantExtra
        : null;
    const finalBasePrice = Number(product.price) + variantExtra;

    return (
      <motion.div
        key={product.id}
        variants={itemVariants}
        whileHover={!isOutOfStock ? { scale: 1.01 } : {}}
        className={`relative group rounded-3xl p-3 md:p-4 flex flex-col h-full ${
          isOutOfStock ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        } ${extraWrapperClasses}`}
      >
        {/* Out of Stock Overlay */}
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
          passHref
        >
          <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 group">
            <Image
              src={getImageSrc(product.image)}
              alt={product.name || "Image not found!"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className={`object-contain ${isOutOfStock ? "opacity-70" : ""}`}
            />

            {/* Hover Image */}
            {!isOutOfStock &&
              (() => {
                let hoverImage = null;

                if (variants.length > 0 && variants[0]?.image) {
                  hoverImage = variants[0].image;
                } else {
                  const matches =
                    product.image_g?.match(/src="([^"]+)"/g) || [];
                  const urls = matches.map((src) =>
                    src.replace(/src="|"/g, ""),
                  );
                  hoverImage = urls[1] || null;
                }

                return (
                  hoverImage && (
                    <Image
                      src={getImageSrc(hoverImage)}
                      alt="Hover preview"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 object-contain"
                    />
                  )
                );
              })()}
          </div>
        </Link>

        {!isOutOfStock && (
          <>
            {/* Desktop Quick View */}
            <div className="hidden md:block absolute inset-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setQuickViewProduct(product);
                    setQuantity(MIN_LIMIT);
                  }}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition hover:bg-[#A00300] group/quickview cursor-pointer pointer-events-auto"
                >
                  <Eye className="text-gray-700 w-6 h-6 group-hover/quickview:text-white transition-colors" />
                </button>
              </div>
            </div>

            {/* Mobile Quick View */}
            <div className="md:hidden absolute bottom-[7rem] right-3 z-50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewProduct(product);
                  setQuantity(MIN_LIMIT);
                }}
                className="min-w-[40px] min-h-[40px] w-10 h-10 bg-[#A00300] cursor-pointer rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                aria-label="Quick View"
              >
                <Eye className="text-white w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Product Info */}
        <div className="flex flex-col h-full">
          <div className="min-h-[50px] md:min-h-[60px]">
            {showPromoTag && (
              <div className="mb-1 md:mb-2">
                <span className="inline-flex items-center bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-[2px] md:py-1 rounded-tl-lg rounded-br-lg shadow-md">
                  {product.promo_tag}
                </span>
              </div>
            )}

            {product.bogo_value && (
              <div className="relative inline-block mt-2 mb-2 font-odop">
                <span className="bogo-badge inline-flex items-center gap-1 bg-gradient-to-r from-black to-gray-900 text-white text-md font-bold px-2 py-[2px] rounded-tr-lg rounded-bl-lg shadow-md">
                  {product.bogo_value}
                </span>
                <span className="bogo-flash absolute top-0 left-0 w-full h-full rounded-tr-lg rounded-bl-lg"></span>
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

          <div className="mt-0">
            {/* Price Display */}
            <div className="space-y-1 mt-1">
              {hasPromo ? (
                <>
                  <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                    <p
                      className={`text-sm md:text-lg font-bold ${
                        isOutOfStock ? "text-gray-500" : "text-[#A00300]"
                      }`}
                    >
                      ₹
                      {(
                        Number(product.promo_price) +
                        (selectedVariant?.price || 0)
                      ).toFixed(2)}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 line-through">
                      ₹
                      {(
                        Number(product.price) + (selectedVariant?.price || 0)
                      ).toFixed(2)}
                    </p>
                  </div>

                  {/* Show discount badge only on mobile in next line */}
                  <span className="block md:inline text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg md:ml-2">
                    {Math.round(
                      ((Number(product.price) - Number(product.promo_price)) /
                        Number(product.price)) *
                        100,
                    )}
                    {t("% OFF")}
                  </span>
                </>
              ) : (
                <div className="flex items-baseline gap-1.5 md:gap-2 flex-wrap">
                  <p
                    className={`text-sm md:text-lg font-bold ${
                      isOutOfStock ? "text-gray-500" : "text-gray-950"
                    }`}
                  >
                    ₹
                    {(
                      Number(product.price) + (selectedVariant?.price || 0)
                    ).toFixed(2)}
                  </p>

                  {variants.length > 0 && (
                    <div className="relative ml-2 font-odop w-[90px] md:w-[110px]">
                      <select
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
                        className="
        appearance-none
        text-xs md:text-sm
        uppercase font-medium
        pl-3 pr-8
        py-1.5 md:py-2
        rounded-lg
        border border-gray-300
        bg-white
        shadow-sm
        cursor-pointer
        w-full
        truncate
        focus:outline-none
        focus:ring-2 focus:ring-[#A00300] focus:border-[#A00300]
        hover:border-[#A00300]/70
        transition-all duration-200
      "
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
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // 🔹 Grid (<= 4) vs Horizontal slider (> 4) with arrows
  const renderProductCards = (products) => {
    const isSlider = products.length > 4;

    const scrollLeft = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
      }
    };

    const scrollRight = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
      }
    };

    if (!isSlider) {
      // normal grid
      return (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {products.map((product) => renderProductCard(product))}
        </motion.div>
      );
    }

    // horizontal scroll slider with arrows
    return (
      <div className="relative">
        {/* LEFT ARROW (desktop) */}
        <button
          type="button"
          onClick={scrollLeft}
          className="flex absolute left-0 top-1/2 -translate-y-1/2 z-[80] w-10 h-10 rounded-full bg-white shadow-lg border hover:bg-gray-100 active:scale-95 transition cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 mx-auto mt-2" />
        </button>

        {/* PRODUCT SLIDER */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          variants={containerVariants}
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide px-1 md:px-12"
        >
          <div className="flex gap-4 md:gap-6 py-2">
            {products.map((product) =>
              renderProductCard(
                product,
                "min-w-[230px] sm:min-w-[260px] lg:min-w-[280px]",
              ),
            )}
          </div>
        </motion.div>

        {/* RIGHT ARROW (desktop) */}
        <button
          type="button"
          onClick={scrollRight}
          className="flex absolute right-0 top-1/2 -translate-y-1/2 z-[80] w-10 h-10 rounded-full bg-white shadow-lg border hover:bg-gray-100 active:scale-95 transition cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 mx-auto mt-2" />
        </button>
      </div>
    );
  };

  // Quick view variants
  const quickVariants = Array.isArray(quickViewProduct?.product_variants)
    ? quickViewProduct.product_variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: Number(variant.price),
        quantity: Number(variant.quantity),
      }))
    : [];

  const selectedQuickVariant =
    selectedVariants[quickViewProduct?.id] ||
    (quickVariants.length > 0 ? quickVariants[0] : null);

  return (
    <div className="px-4 md:px-20 py-20">
      <div className="homepage-wrapper">
        {error && (
          <div className="px-4 md:px-20 py-4 text-center text-red-500 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <>
            {renderTitleSection("Recently Viewed")}
            {renderProductCardSkeletons()}
          </>
        ) : (
          recentProducts.length > 0 && (
            <>
              {renderTitleSection("Recently Viewed")}
              {renderProductCards(recentProducts)}
            </>
          )
        )}
      </div>

      {/* Quick View Modal + Cart Sidebar re-use same as FeaturedProducts... */}
      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-4 md:py-0 overflow-y-auto"
            onClick={(e) =>
              e.target === e.currentTarget && setQuickViewProduct(null)
            }
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{
                duration: 0.25,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="relative w-full max-w-5xl rounded-3xl p-4 md:p-10 shadow-2xl bg-white backdrop-blur-xl border border-white/20 my-auto"
              ref={modalRef}
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 md:top-5 md:right-5 p-1 md:p-2 rounded-full bg-white/70 hover:bg-red-100 transition z-[110] cursor-pointer"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700 hover:text-red-500" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                {/* Image Section */}
                <div className="order-1 md:order-none">
                  <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-none group">
                    {(mainImage || quickViewProduct.image) && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mainImage || quickViewProduct.image}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={getImageSrc(
                              mainImage || quickViewProduct.image,
                            )}
                            alt={quickViewProduct.name || "Image not found!"}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            className="object-contain"
                          />
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>

                  {quickViewProduct.image_g && (
                    <div className="flex gap-2 md:gap-3 mt-3 md:mt-4 overflow-x-auto scrollbar-hide py-2">
                      {(() => {
                        const matches =
                          quickViewProduct.image_g.match(/src="([^"]+)"/g) ||
                          [];
                        const imageUrls = matches.map((src) =>
                          src.replace(/src="|"/g, ""),
                        );
                        const allImages = [
                          getImageSrcThumbs(quickViewProduct.image),
                          ...imageUrls,
                        ].filter(
                          (img, index, self) =>
                            img && self.indexOf(img) === index,
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

                {/* Content Section */}
                <div className="flex flex-col justify-between order-2 md:order-none">
                  <div>
                    {quickViewProduct.promo_tag &&
                      quickViewProduct.end_date &&
                      new Date(quickViewProduct.end_date) > new Date() && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-md">
                            {quickViewProduct.promo_tag}
                          </span>
                        </div>
                      )}

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-950 mb-2 capitalize">
                      {quickViewProduct.name}
                    </h2>

                    {Number(quickViewProduct?.review) > 0 && (
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">
                          {Number(quickViewProduct.review).toFixed(1)}
                        </span>
                      </div>
                    )}

                    <div className="mb-3 md:mb-4">
                      {quickViewProduct?.price && (
                        <>
                          {quickViewProduct?.promotion === "1" &&
                          quickViewProduct?.promo_price &&
                          quickViewProduct?.end_date &&
                          new Date(quickViewProduct.end_date) > new Date() ? (
                            <>
                              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                                ₹
                                {(
                                  Number(quickViewProduct.promo_price) +
                                  Number(selectedQuickVariant?.price || 0)
                                ).toFixed(2)}
                              </span>
                              <span className="ml-2 sm:ml-4 text-lg sm:text-xl text-gray-400 line-through">
                                ₹
                                {(
                                  Number(quickViewProduct.price) +
                                  Number(selectedQuickVariant?.price || 0)
                                ).toFixed(2)}
                              </span>
                              <span className="ml-2 sm:ml-4 text-sm sm:text-base text-red-600 font-semibold">
                                {Math.round(
                                  ((Number(quickViewProduct.price) -
                                    Number(quickViewProduct.promo_price)) /
                                    Number(quickViewProduct.price)) *
                                    100,
                                )}
                                {t("% OFF")}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                              ₹
                              {(
                                Number(quickViewProduct.price) +
                                Number(selectedQuickVariant?.price || 0)
                              ).toFixed(2)}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/products/${quickViewProduct.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors rounded-lg shadow-md cursor-pointer"
                      >
                        {t("View Full Details")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Quantity + Add to Cart Row */}
                  <div className="flex flex-col gap-4 mt-3 md:mt-0">
                    <div className="flex items-center justify-between gap-4">
                      {/* Quantity Controller */}
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

                      {/* Add to Cart */}
                      <div className="relative w-full flex justify-center">
                        {isAdding && (
                          <div className="absolute -top-16 z-50">
                            <img
                              src="/add.gif"
                              alt="Loading..."
                              className="w-14 h-14"
                            />
                          </div>
                        )}

                        <button
                          disabled={isAdding}
                          onClick={async () => {
                            if (isAdding) return;
                            setIsAdding(true);
                            await new Promise((resolve) =>
                              setTimeout(resolve, 2500),
                            );

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
                                historypincode: Number(
                                  localStorage.getItem("user_pincode") ||
                                    600001,
                                ),
                                qty: quantity,
                                cart_id: cartId,
                                variant_id: selectedVariants?.[
                                  quickViewProduct.id
                                ]
                                  ? [selectedVariants[quickViewProduct.id].id]
                                  : [],
                              };

                              const fetchToken = async () => {
                                const res = await fetch("/api/login", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                });

                                const data = await res.json();

                                if (data?.status === "success" && data?.token) {
                                  localStorage.setItem("authToken", data.token);
                                  return data.token;
                                }

                                throw new Error("Authentication failed");
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
                                console.warn(
                                  "Backend cart sync failed:",
                                  result,
                                );
                                return;
                              }

                              // ✅ Track successful cart addition (Quick View)
                              trackProductHistory({
                                token, // 👈 reuse the same token
                                productId: quickViewProduct.id,
                                cartCount: quantity,
                                warehouseId:
                                  quickViewProduct?.seller?.warehouse_id,
                              });

                              const existingCart = JSON.parse(
                                localStorage.getItem("cart_data") || "[]",
                              );

                              const existingItemIndex = existingCart.findIndex(
                                (item) => item.id === quickViewProduct.id,
                              );

                              const selectedVariantId =
                                selectedVariants?.[quickViewProduct.id]?.id ||
                                null;

                              const variantPrice = Number(
                                selectedVariants?.[quickViewProduct.id]
                                  ?.price || 0,
                              );

                              const basePrice =
                                quickViewProduct.promo_price &&
                                quickViewProduct.end_date &&
                                new Date(quickViewProduct.end_date) >
                                  new Date() &&
                                Number(quickViewProduct.promo_price) > 0 &&
                                Number(quickViewProduct.promo_price) <
                                  Number(quickViewProduct.price)
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
                                          selectedVariants?.[
                                            quickViewProduct.id
                                          ]?.name || null,
                                      },
                                    ];

                              localStorage.setItem(
                                "cart_data",
                                JSON.stringify(updatedCart),
                              );
                              setCartItems(updatedCart);

                              try {
                                const couponRes = await fetch(
                                  "/api/applyCoupon",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      cart_id: newCartId,
                                      coupon_code: "0",
                                    }),
                                  },
                                );

                                if (!couponRes.ok)
                                  throw new Error("Failed to apply coupon");

                                await couponRes.json();
                              } catch (couponError) {
                                console.error(
                                  "Error applying coupon after addToCart:",
                                  couponError,
                                );
                              }

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
                                  const retryTaxRes = await fetch(
                                    "/api/getTax",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${retryToken}`,
                                      },
                                      body: JSON.stringify({ cart_id: cartId }),
                                    },
                                  );

                                  const taxData = await retryTaxRes.json();
                                  localStorage.setItem(
                                    "cart_tax_details",
                                    JSON.stringify(taxData),
                                  );
                                } else {
                                  const taxData = await taxRes.json();
                                  localStorage.setItem(
                                    "cart_tax_details",
                                    JSON.stringify(taxData),
                                  );
                                }
                              } catch (taxError) {
                                console.error(
                                  "Failed to fetch tax details:",
                                  taxError,
                                );
                              }

                              setQuickViewProduct(null);
                              setIsCartOpen(true);
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
                          }}
                          className={`group relative flex-1 overflow-hidden rounded-xl py-3 px-4 font-bold shadow-none border border-black transition-all duration-300 ease-in-out cursor-pointer ${
                            isAdding
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:border-transparent"
                          }`}
                          style={{
                            isolation: "isolate",
                          }}
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
                      onClick={async () => {
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
                          historypincode: Number(
                            localStorage.getItem("user_pincode") || 600001,
                          ),
                          qty: quantity,
                          cart_id: cartId,
                        };

                        try {
                          let token = localStorage.getItem("authToken");

                          const fetchToken = async () => {
                            const res = await fetch("/api/login", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                            });

                            const data = await res.json();

                            if (data?.status === "success" && data?.token) {
                              localStorage.setItem("authToken", data.token);
                              return data.token;
                            }

                            throw new Error("Authentication failed");
                          };

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

                          // ✅ Track successful cart addition (Quick View)
                          trackProductHistory({
                            token, // 👈 reuse the same token
                            productId: quickViewProduct.id,
                            cartCount: quantity,
                            warehouseId: quickViewProduct?.seller?.warehouse_id,
                          });

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
                              localStorage.setItem(
                                "cart_tax_details",
                                JSON.stringify(taxData),
                              );
                            } else {
                              const taxData = await taxRes.json();
                              localStorage.setItem(
                                "cart_tax_details",
                                JSON.stringify(taxData),
                              );
                            }
                          } catch (taxError) {
                            console.error(
                              "Failed to fetch tax details:",
                              taxError,
                            );
                          }

                          if (result.redirect_link) {
                            window.location.href = "/checkout";
                          } else {
                            console.warn("No redirect link returned from API");
                          }
                        } catch (error) {
                          console.error("Buy it now failed:", error);
                        }
                      }}
                      className="group relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold border-1 border-white transition-all duration-500 ease-in-out hover:border-black cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 text-white group-hover:text-black transition-colors duration-500 ease-in-out">
                        {t("Buy It Now")}
                      </span>
                      <span className="absolute left-0 top-0 h-full w-0 bg-white transition-all duration-[900ms] ease-in-out group-hover:w-full z-0"></span>
                      <span className="absolute inset-0 bg-black z-[-1] rounded-xl"></span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isCartOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsCartOpen(false)}
            />
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecentlyViewed;
