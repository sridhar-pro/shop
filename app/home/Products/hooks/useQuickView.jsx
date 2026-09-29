"use client";

import { useState, useEffect, useRef } from "react";

export function useQuickView() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const modalRef = useRef(null);

  // Reset main image when product changes
  useEffect(() => {
    setMainImage(null);
  }, [quickViewProduct]);

  // Sync main image to the first image of the product
  useEffect(() => {
    if (quickViewProduct) {
      setMainImage(quickViewProduct.images?.[0] || quickViewProduct.image);
    }
  }, [quickViewProduct]);

  // Auto-select first variant when quick-view product changes
  useEffect(() => {
    if (!quickViewProduct) return;

    if (
      Array.isArray(quickViewProduct.variants) &&
      quickViewProduct.variants.length > 0 &&
      !selectedVariants[quickViewProduct.id]
    ) {
      setSelectedVariants((prev) => ({
        ...prev,
        [quickViewProduct.id]: quickViewProduct.variants[0],
      }));
    }
  }, [quickViewProduct]);

  // Min / max quantity limits derived from the quick-view product
  const minOrderQty = Number(quickViewProduct?.minimum_order_qty) || 1;
  const minOrderLimit = Number(quickViewProduct?.minimum_order_limit) || 1;
  const MIN_LIMIT = minOrderQty > 0 ? minOrderQty : 1;
  const MAX_LIMIT =
    minOrderQty > 1
      ? Math.min(quickViewProduct?.quantity || 100, 30)
      : Math.min(quickViewProduct?.quantity || 100, 10);

  // Keep quantity in bounds when the product changes
  useEffect(() => {
    setQuantity(MIN_LIMIT);
  }, [MIN_LIMIT]);

  const increaseQty = () =>
    setQuantity((prev) => Math.min(prev + 1, MAX_LIMIT));
  const decreaseQty = () =>
    setQuantity((prev) => (prev > MIN_LIMIT ? prev - 1 : MIN_LIMIT));

  // Derived: extract + normalise variants for the quick-view modal
  const quickVariants = Array.isArray(quickViewProduct?.product_variants)
    ? quickViewProduct.product_variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        quantity: Number(v.quantity),
        discount_price: Number(v.discount_price) || 0,
        promo_percentage: Number(v.promo_percentage) || 0,
        frontImage: v.front_view || null,
        backImage: v.back_view || null,
        zoomImage: v.zoom_view || null,
      }))
    : [];

  const selectedQuickVariant =
    selectedVariants[quickViewProduct?.id] ||
    (quickVariants.length > 0 ? quickVariants[0] : null);

  return {
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
  };
}
