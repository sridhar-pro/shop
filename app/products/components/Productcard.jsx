"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/app/components/WishlistButton";
import CartSidebar from "@/app/components/CartSideBar";
import { itemVariants } from "@/app/utils/variants";
import { useRouter } from "next/navigation";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

function getImageSrc(image) {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

export default function ProductCard({ product, isCartOpen, setIsCartOpen }) {
  const router = useRouter();

  const [selectedVariant, setSelectedVariant] = useState(
    product.product_variants?.[0] || null,
  );
  const [isAdding, setIsAdding] = useState(null);

  const isOutOfStock = !product.quantity || Number(product.quantity) <= 0;

  const firstVariant =
    product.product_variants && product.product_variants.length > 0
      ? product.product_variants[0]
      : null;

  const basePrice = firstVariant
    ? Number(firstVariant.price)
    : Number(product.price);

  const promoPrice = product.promo_price ? Number(product.promo_price) : null;

  const isPromoActive =
    promoPrice &&
    product.end_date &&
    product.promotion == 1 &&
    new Date(product.end_date + "T23:59:59") >= new Date();

  const isDropdownVariantRequired =
    product.variant_dropdown &&
    (product.variant_dropdown === 1 ||
      product.variant_dropdown === "1" ||
      product.variant_dropdown === true);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDropdownVariantRequired) {
      toast.info(
        <div className="flex items-start gap-2 font-odop">
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">Options required</span>
            <span className="text-xs opacity-80">
              Select product options to continue
            </span>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 2200,
          className:
            "bg-white border border-[#A00300]/20 shadow-md rounded-xl px-3 py-2",
          bodyClassName: "p-0 m-0",
          progressClassName: "bg-[#A00300]",
        },
      );

      setTimeout(() => {
        router.push(`/products/${product.slug}`);
      }, 600); // small delay for UX feel

      return;
    }

    if (isAdding === product.id) return;

    if (product.product_variants?.length > 0 && !selectedVariant) {
      toast.warning("⚠️ Please select a variant");
      return;
    }

    setIsAdding(product.id);

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
        product_id: product.id,
        historypincode: Number(localStorage.getItem("user_pincode") || 600002),
        qty: 1,
        cart_id: cartId,
        variant_id: selectedVariant
          ? selectedVariant.id
          : product.product_variants?.length > 0
            ? null
            : [],
      };

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

      let token = localStorage.getItem("authToken");
      if (!token) token = await fetchToken();

      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status !== "success") {
        console.warn("Cart failed:", result);
        const errorMessage =
          result?.errors?.[0] || result?.error || "Unable to add item to cart";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          className: "font-odop",
        });
        return;
      }
      setIsCartOpen?.(true);
      toast.success("🛒 Added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(null);
    }
  };

  const isVariantRequired =
    product.product_variants?.length > 0 && !selectedVariant;

  const displayImage =
    selectedVariant?.front_view ||
    product.product_variants?.[0]?.front_view ||
    product.image;

  const isTextVariantOnly = product.product_variants.every(
    (v) => v.type === "text",
  );

  return (
    <motion.div
      variants={itemVariants}
      className={`group flex flex-col h-full rounded-xl sm:rounded-3xl bg-white transition-all duration-300 overflow-hidden relative ${
        isOutOfStock ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <WishlistButton productId={product.id} />
      </div>

      <Link
        href={isOutOfStock ? "#" : `/products/${product.slug}`}
        title={
          isOutOfStock
            ? `${product.name} is Out of Stock`
            : `View ${product.name}`
        }
        className={isOutOfStock ? "pointer-events-none" : ""}
      >
        <div className="relative">
          {/* Premium / Verified Badges */}
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
          <div
            className={`relative w-full h-32 sm:h-40 md:h-56 rounded-lg sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 md:mb-4 group ${
              isOutOfStock ? "blur-[1.5px]" : ""
            }`}
          >
            <Image
              src={getImageSrc(displayImage)}
              alt={product.name || "Image not found!"}
              title={product.name || "Image not found!"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-contain"
            />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/10 z-30 rounded-2xl flex items-center justify-center">
              <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-5">
          {/* BOGO Tag */}
          {product.bogo_offer && (
            <div className="relative inline-block mb-2 font-odop">
              <span className="bogo-badge">
                {product.bogo_offer || "Special BOGO!"}
              </span>
              <span className="bogo-flash"></span>
            </div>
          )}

          <h2
            className="text-xs sm:text-sm md:text-base line-clamp-2 mb-1 capitalize"
            style={{ minHeight: "2.75rem" }}
          >
            {product.name}
          </h2>

          {/* 🔥 Variant Selector */}
          {product.product_variants?.length > 0 && (
            <>
              <p className="text-[10px] text-gray-500 mt-2">
                {isTextVariantOnly ? "Options" : "Colours"}:
              </p>

              {/* 🔽 TEXT VARIANT → DROPDOWN */}
              {isTextVariantOnly ? (
                <select
                  value={selectedVariant?.id || ""}
                  onChange={(e) => {
                    const selected = product.product_variants.find(
                      (v) => v.id === e.target.value,
                    );
                    setSelectedVariant(selected);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#A00300]"
                >
                  <option value="">Select Option</option>
                  {product.product_variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ))}
                </select>
              ) : (
                /* 🎨 COLOR VARIANT → EXISTING UI */
                <div className="mt-1 flex gap-2 flex-wrap">
                  {product.product_variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;

                    if (variant.type === "color") {
                      return (
                        <button
                          key={variant.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedVariant(variant);
                          }}
                          className={`w-6 h-6 rounded-full border ${
                            isSelected
                              ? "border-[#A00300] ring-2 ring-[#A00300]/30 scale-110"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: variant.color || "#ccc" }}
                        />
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between mt-1">
            {(() => {
              const hasVariants =
                product.product_variants && product.product_variants.length > 0;
              const selectedVariantData = hasVariants
                ? selectedVariant || product.product_variants[0]
                : null;
              const variantPrice = selectedVariantData
                ? Number(selectedVariantData.price || 0)
                : 0;

              const variantDiscount = selectedVariantData
                ? Number(selectedVariantData.discount_price || 0)
                : 0;

              const variantPromoPercent = selectedVariantData
                ? Math.max(0, Number(selectedVariantData.promo_percentage) || 0)
                : 0;

              const productPrice = Number(product.price);
              const productPromo = Number(product.promo_price || 0);

              const isPromoActive =
                product.promotion == 1 &&
                product.end_date &&
                new Date(product.end_date + "T23:59:59") >= new Date();

              let finalPrice;
              let originalPrice;
              let discountPercent;

              if (hasVariants) {
                const isVariantPromoValid =
                  isPromoActive &&
                  variantPromoPercent > 0 &&
                  variantDiscount > 0;

                finalPrice = isVariantPromoValid
                  ? variantDiscount
                  : variantPrice;
                originalPrice = isVariantPromoValid ? variantPrice : null;
                discountPercent = isVariantPromoValid ? variantPromoPercent : 0;
              } else {
                const isProductPromoValid =
                  isPromoActive &&
                  productPromo > 0 &&
                  productPromo < productPrice;

                finalPrice = isProductPromoValid ? productPromo : productPrice;
                originalPrice = isProductPromoValid ? productPrice : null;
                discountPercent = isProductPromoValid
                  ? Math.round(
                      ((productPrice - productPromo) / productPrice) * 100,
                    )
                  : 0;
              }

              return (
                <div className="flex justify-between w-full">
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 md:gap-2 text-[#a00030]">
                      <p className="text-sm md:text-lg font-bold">
                        ₹ {finalPrice.toFixed(2)}
                      </p>

                      {originalPrice && (
                        <p className="text-xs md:text-sm text-gray-400 line-through">
                          ₹ {originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {discountPercent > 0 && (
                      <span className="mt-1 text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg w-fit">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Promo Tag */}
          {product.promo_tag && (
            <div className="mt-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md 
                    bg-green-600/90 text-white text-[11px] sm:text-xs font-medium
                    shadow-sm hover:shadow-md transition-all duration-300
                    hover:-translate-y-[1px]"
              >
                {/* Dot Indicator */}
                <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>

                {/* Text */}
                <span className="tracking-wide">{product.promo_tag}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div
        className={`relative w-full flex justify-center px-3 pb-4 ${
          product.product_variants?.length > 0 ? "mt-auto" : "mt-2"
        }`}
      >
        {isAdding === product.id && (
          <div className="absolute -top-14 z-50">
            <img
              src="/add.gif"
              alt="Loading..."
              title="Loading..."
              className="w-12 h-12"
            />
          </div>
        )}
        <button
          disabled={
            isAdding === product.id || isOutOfStock || isVariantRequired
          }
          onClick={handleAddToCart}
          className={`
    group relative w-full overflow-hidden rounded-xl py-2.5 px-4
    font-semibold text-sm transition-all duration-300
    flex items-center justify-center gap-2
    whitespace-nowrap
    ${
      isAdding === product.id || isVariantRequired
        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
        : isOutOfStock
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-white text-[#A00300] border border-[#A00300] hover:bg-[#A00300] hover:text-white active:scale-[0.97]"
    }
  `}
          style={{
            transition: "background 0.22s, color 0.22s, transform 0.12s",
          }}
        >
          <ShoppingCart
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
              isAdding === product.id
                ? ""
                : "group-hover:-translate-y-0.5 group-hover:scale-110"
            }`}
          />
          <span>
            {isAdding === product.id
              ? "Adding..."
              : isDropdownVariantRequired
                ? "View Options"
                : isVariantRequired
                  ? "Select Variant"
                  : "Add to Cart"}
          </span>

          {isAdding !== product.id && !isOutOfStock && (
            <span
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(circle at 60% 50%, #fff 0%, transparent 70%)",
              }}
            />
          )}
        </button>
      </div>
    </motion.div>
  );
}
