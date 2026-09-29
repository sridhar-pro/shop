"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

// ── Hooks ──────────────────────────────────────────────────────────────────
import { useFeaturedProducts } from "./hooks/useFeaturedProducts";
import { useQuickView } from "./hooks/useQuickView";
import { createQuickAddHandler } from "./hooks/useQuickAdd";

// ── Components ─────────────────────────────────────────────────────────────
import SectionTitle from "./components/SectionTitle";
import ProductCard from "./components/ProductCard";
import ProductCardSkeletons from "./components/ProductCardSkeletons";
import QuickViewModal from "./components/QuickViewModal";
import CartSidebar from "../../components/CartSideBar";

// ── Styles ─────────────────────────────────────────────────────────────────
import { QUICK_ADD_STYLES } from "./constants/quickAddStyles";

// Instantiate the quick-add handler once (not a hook — safe outside render)
const handleQuickAdd = createQuickAddHandler();

export default function FeaturedProducts() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    giftProducts,
    newArrivalProducts,
    featuredProducts,
    festivalProducts,
    wellnessProducts,
    corporateProducts,
    returnProducts,
    getTitle9,
    getTitle10,
    getTitle11,
    getTitle12,
    error,
    allLoaded,
  } = useFeaturedProducts();

  // ── Quick view state ──────────────────────────────────────────────────────
  const {
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
  } = useQuickView();

  // ── Cart sidebar ──────────────────────────────────────────────────────────
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // ── Sections config ───────────────────────────────────────────────────────
  const sections = [
    { key: "return", products: returnProducts, margin: "" },
    { key: "gift", products: giftProducts, margin: "mt-32" },
    { key: "featured", products: featuredProducts, margin: "mt-32" },
    { key: "festival", products: festivalProducts, margin: "mt-32" },
    { key: "wellness", products: wellnessProducts, margin: "mt-20" },
    { key: "corporate", products: corporateProducts, margin: "mt-32" },
    { key: "gettitle10", products: getTitle10, margin: "mt-32" },
    { key: "gettitle11", products: getTitle11, margin: "mt-32" },
    { key: "gettitle12", products: getTitle12, margin: "mt-32" },
  ];

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderProductCards = (products) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-0 md:px-20">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selectedVariants={selectedVariants}
          setSelectedVariants={setSelectedVariants}
          setQuickViewProduct={setQuickViewProduct}
          setQuantity={setQuantity}
          handleQuickAdd={handleQuickAdd}
        />
      ))}
    </div>
  );

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 md:px-20 py-16 flex justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // ── Skeleton loading placeholder titles ───────────────────────────────────
  const skeletonSections = [
    "Bestselling Gift",
    "WorkZen Essentials",
    "Nature's Wellness Box",
    "Most-Saved Items",
    "Bites Of Goodness",
    "Corporate Gifts",
    "Return Gifts",
  ];

  return (
    <div className="px-4 md:px-0 py-20">
      {/* Scoped quick-add styles — no global side-effects */}
      <style>{QUICK_ADD_STYLES}</style>

      <div className="homepage-wrapper">
        {!allLoaded ? (
          <>
            {skeletonSections.map((title, i) => (
              <div key={title} className={i > 0 ? "mt-32" : ""}>
                <SectionTitle title={title} sectionKey="" />
                <ProductCardSkeletons />
              </div>
            ))}
          </>
        ) : (
          <section className="relative overflow-hidden">
            {/* ── Soft organic background shapes ── */}
            <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
              <div className="absolute -right-40 top-20 w-[420px] h-[420px] rounded-[45%_55%_60%_40%/60%_40%_55%_45%] bg-[#F3E5E4] opacity-80" />
              <div className="absolute -left-40 bottom-10 w-[350px] h-[350px] rounded-[60%_40%_45%_55%/50%_60%_40%_50%] bg-[#E8EDF9] opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fff9f9] to-white opacity-70" />
            </div>

            {sections.map(({ key, products, margin }, index) =>
              products?.length > 0 ? (
                <div key={key} className={`relative overflow-hidden ${margin}`}>
                  {/* Alternating organic shape per section */}
                  <div className="absolute inset-0 -z-10 pointer-events-none">
                    {index % 2 === 0 ? (
                      <div className="absolute -right-40 top-10 w-[420px] h-[420px] rounded-[45%_55%_60%_40%/60%_40%_55%_45%] bg-[#F3E5E4] opacity-80" />
                    ) : (
                      <div className="absolute -left-40 top-10 w-[420px] h-[420px] rounded-[60%_40%_45%_55%/50%_60%_40%_50%] bg-[#E8EDF9] opacity-80" />
                    )}
                  </div>

                  <SectionTitle
                    title={products[0]?.homePageTitle || "You may also like"}
                    sectionKey={key}
                  />

                  {renderProductCards(products)}
                </div>
              ) : null,
            )}
          </section>
        )}
      </div>

      {/* ── Quick View Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            quickViewProduct={quickViewProduct}
            setQuickViewProduct={setQuickViewProduct}
            mainImage={mainImage}
            setMainImage={setMainImage}
            quantity={quantity}
            setQuantity={setQuantity}
            isAdding={isAdding}
            setIsAdding={setIsAdding}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
            modalRef={modalRef}
            MIN_LIMIT={MIN_LIMIT}
            MAX_LIMIT={MAX_LIMIT}
            increaseQty={increaseQty}
            decreaseQty={decreaseQty}
            quickVariants={quickVariants}
            selectedQuickVariant={selectedQuickVariant}
            setCartItems={setCartItems}
          />
        )}
      </AnimatePresence>

      {/* ── Cart Sidebar ──────────────────────────────────────────────────── */}
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
    </div>
  );
}
