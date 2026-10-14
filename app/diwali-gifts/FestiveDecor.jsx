"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Minus,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { bg } from "./config";
import { getImageSrc, getPriceInfo } from "./utils";
import { useAuth } from "@/app/utils/AuthContext";
import { useCartQty } from "@/app/hooks/useCartQty";
import { QUICK_ADD_STYLES } from "@/app/home/Products/constants/quickAddStyles";
import { createQuickAddHandler } from "@/app/home/Products/hooks/useQuickAdd";
import QuickViewModal from "@/app/home/Products/components/QuickViewModal";

// Common to every category. Only subcategory / sub_subcategory change.
const BASE_FILTERS = {
  gifts_products: "",
  category: { id: "807" },
  sub_subcategory: "",
  query: "",
  brand: "",
  sorting: "name-asc",
  min_price: "1",
  max_price: "0",
  in_stock: "0",
  sort_by_v: "1nto",
  page: "1",
  limit: 50,
  offset: "0",
  warehouses_id: "",
};

const buildFilters = (subId) => ({
  ...BASE_FILTERS,
  subcategory: { id: String(subId) },
});

// TODO: replace the sub / subSub ids below with the real ones for each category.
// Put photos in /public/diwali/ with these names.
// Missing files fall back to the gradient, so nothing looks broken.
const CATEGORIES = [
  {
    label: "Rangoli Mats",
    img: "/diwali/rangoli.jpg",
    filters: buildFilters("948"), // TODO
    fallback: "linear-gradient(135deg, #e8a33d 0%, #b8102c 100%)",
  },
  {
    label: "Torans",
    img: "/diwali/torans.png",
    filters: buildFilters("949"), // TODO
    fallback: "linear-gradient(135deg, #f1d9c4 0%, #c9a063 100%)",
  },
  {
    label: "Candles & Candle Holders",
    img: "/diwali/candles.jpg",
    filters: buildFilters("947"), // TODO
    fallback: "linear-gradient(135deg, #c9863a 0%, #5a2a14 100%)",
  },
  {
    label: "Diyas",
    img: "/diwali/diyas.jpg",
    filters: buildFilters("951"), // TODO
    fallback: "linear-gradient(135deg, #e8c88e 0%, #7b1230 100%)",
  },
  {
    label: "Fairy Lights",
    img: "/diwali/lights.jpg",
    filters: buildFilters("950"), // TODO
    fallback: "linear-gradient(135deg, #1f6b4a 0%, #e8a33d 100%)",
  },
  {
    label: "Pooja Essentials",
    img: "/diwali/pooja.jpg",
    filters: buildFilters("941"), // TODO
    fallback: "linear-gradient(135deg, #e8a33d 0%, #a8321e 100%)",
  },
];
const handleQuickAdd = createQuickAddHandler();

const CartIcon = () => (
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
);

// ── Per-item stepper/pill — own component so useCartQty can be called ────────
function DiwaliItemAction({ item, itemMoq, availableQty, needsProductPage }) {
  const { getValidToken } = useAuth();
  const {
    qty: cartQty,
    increment,
    decrement,
    processing: qtyProcessing,
  } = useCartQty(item.id, getValidToken);

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
      <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            decrement();
          }}
          disabled={qtyProcessing}
          className="px-2 py-1.5 transition hover:bg-gray-100 disabled:opacity-50"
          aria-label="Decrease quantity"
        >
          {cartQty === 1 ? (
            <Trash2 className="h-3 w-3 text-gray-500" />
          ) : (
            <Minus className="h-3 w-3 text-gray-600" />
          )}
        </button>
        <span className="min-w-[18px] px-1 text-center text-xs font-semibold text-[#A00300] md:text-sm">
          {qtyProcessing ? (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-[#A00300] border-t-transparent" />
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
          className="px-2 py-1.5 transition hover:bg-gray-100 disabled:opacity-50"
          aria-label="Increase quantity"
        >
          <Plus className="h-3 w-3 text-gray-600" />
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
        className="qa-pill qa-has-moq cursor-not-allowed opacity-50"
      >
        <span className="qa-pill-icon">
          <CartIcon />
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
        <CartIcon />
      </span>
      <span className="qa-pill-label">{pillLabel}</span>
    </button>
  );
}

// ── Product card (same as The Diwali Edit) ──────────────────────────
function DiwaliCard({ product, onQuickView }) {
  const router = useRouter();

  // getProducts returns `product_variants`; getTitle9 returns `variants`
  const hasVariants =
    (Array.isArray(product.variants) && product.variants.length > 0) ||
    (Array.isArray(product.product_variants) &&
      product.product_variants.length > 0);

  const availableQty =
    Array.isArray(product.variants) && product.variants.length > 0
      ? Number(product.variants?.[0]?.variant_quantity || 0)
      : Number(product.quantity || 0);

  const isOutOfStock = availableQty <= 0;

  const itemMoq =
    Number(product.minimum_order_qty) > 1
      ? Number(product.minimum_order_qty)
      : 1;

  const insufficientStockForMoq =
    !isOutOfStock && itemMoq > 1 && availableQty < itemMoq;

  const needsProductPage =
    product.variant_dropdown === "1" ||
    (Array.isArray(product.variant_dropdown) &&
      product.variant_dropdown.length > 0) ||
    hasVariants;

  // Products that need customization / a dropdown choice / MOQ of 1 must be
  // configured on the product page, so the eye sends them there instead.
  const requiresProductPage =
    product.variant_dropdown === "1" ||
    product.variant_dropdown === 1 ||
    product.variant_dropdown === true ||
    product.customize === "1" ||
    product.customize === 1 ||
    product.customize === true ||
    Number(product.minimum_order_limit || 0) === 1;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresProductPage || !onQuickView) {
      router.push(`/products/${product.slug}`);
      return;
    }
    onQuickView(product);
  };

  const { onPromo, price, promo, off } = getPriceInfo(product);

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-lg border border-[#efe4d6] bg-white transition duration-300 hover:shadow-lg ${
        isOutOfStock ? "opacity-70" : ""
      }`}
    >
      {/* image */}
      {isOutOfStock ? (
        <div className="relative aspect-square cursor-not-allowed overflow-hidden bg-[#f4eadc]">
          <img
            src={getImageSrc(product.image)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 blur-[1.5px]"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-md bg-[#A00300] px-3 py-1 text-[10px] font-bold text-white shadow-lg sm:text-xs">
              OUT OF STOCK
            </span>
          </div>
        </div>
      ) : (
        <div className="group/image relative aspect-square overflow-hidden bg-[#f4eadc]">
          <Link
            href={`/products/${product.slug}`}
            title={`View ${product.name}`}
            className="absolute inset-0 block"
          >
            <img
              src={getImageSrc(product.image)}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Quick view: glass pill on hover devices, compact icon on touch */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-1/3 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover/image:opacity-100" />

          <button
            type="button"
            onClick={handleQuickView}
            aria-label={`Quick view ${product.name}`}
            title="Quick view"
            className="absolute bottom-2 right-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-full
    border border-white/70 bg-white/80 text-[#A00300] ring-1 ring-[#A00300]/10 backdrop-blur-md
    shadow-[0_4px_20px_rgba(160,3,0,0.18)]
    transition-all duration-300 ease-out active:scale-95
    hover:bg-[#A00300] hover:text-white hover:ring-[#A00300] hover:shadow-[0_6px_24px_rgba(160,3,0,0.35)]
    [@media(hover:hover)]:bottom-3 [@media(hover:hover)]:left-1/2 [@media(hover:hover)]:right-auto [@media(hover:hover)]:-translate-x-1/2
    [@media(hover:hover)]:h-9 [@media(hover:hover)]:w-auto [@media(hover:hover)]:px-4
    [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0
    [@media(hover:hover)]:group-hover/image:pointer-events-auto [@media(hover:hover)]:group-hover/image:translate-y-0 [@media(hover:hover)]:group-hover/image:opacity-100
    [@media(hover:hover)]:focus-visible:pointer-events-auto [@media(hover:hover)]:focus-visible:translate-y-0 [@media(hover:hover)]:focus-visible:opacity-100"
          >
            <Eye className="h-4 w-4" strokeWidth={1.75} />
            <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] [@media(hover:hover)]:inline">
              Quick View
            </span>
          </button>
        </div>
      )}

      {/* details */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="line-clamp-1 text-xs font-medium capitalize text-[#1c1620] sm:text-[13px]">
          {isOutOfStock ? (
            product.name
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-[#A00300]"
            >
              {product.name}
            </Link>
          )}
        </h3>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13px] font-semibold text-[#1c1620] sm:text-sm">
              ₹{(onPromo ? promo : price).toLocaleString("en-IN")}
            </span>
            {onPromo && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="rounded-sm bg-[#b8102c] px-1.5 py-[3px] text-[9px] font-semibold uppercase text-white">
                  {off}% off
                </span>
              </>
            )}
          </div>

          {!isOutOfStock && (
            <DiwaliItemAction
              item={product}
              itemMoq={itemMoq}
              availableQty={availableQty}
              needsProductPage={needsProductPage}
            />
          )}
        </div>

        {!isOutOfStock && itemMoq > 1 && (
          <span className="mt-1 block text-[10px] font-medium text-gray-500">
            {insufficientStockForMoq
              ? `Only ${availableQty} left in stock · Min. order: ${itemMoq}`
              : `Min. order: ${itemMoq}`}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FestiveDecor() {
  const { getValidToken } = useAuth();

  const scroller = useRef(null);
  const resultsRef = useRef(null);
  const requestId = useRef(0); // ignores late responses from older clicks

  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(null); // selected category label
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // ── Quick view modal ─────────────────────────────────────────────
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingQuick, setIsAddingQuick] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [, setCartItems] = useState([]);
  const modalRef = useRef(null);

  const quickVariants = quickViewProduct?.product_variants || [];
  const selectedQuickVariant = quickViewProduct
    ? selectedVariants[quickViewProduct.id] || quickVariants[0] || null
    : null;

  const MIN_LIMIT = Number(quickViewProduct?.minimum_order_qty) || 1;
  const MAX_LIMIT = Math.max(
    Number(quickViewProduct?.quantity) || 1,
    MIN_LIMIT,
  );

  const increaseQty = () => setQuantity((q) => Math.min(q + 1, MAX_LIMIT));
  const decreaseQty = () => setQuantity((q) => Math.max(q - 1, MIN_LIMIT));

  const openQuickView = useCallback((p) => {
    setMainImage(null);
    setQuantity(Number(p?.minimum_order_qty) || 1);
    const firstVariant = p?.product_variants?.[0];
    if (firstVariant) {
      setSelectedVariants((prev) => ({ ...prev, [p.id]: firstVariant }));
    }
    // The modal's thumbnail strip reads `image_g`; some listings return `images_g`
    setQuickViewProduct({ ...p, image_g: p.image_g || p.images_g });
  }, []);

  const scrollBy = (dir) =>
    scroller.current?.scrollBy({
      left: dir * Math.round(scroller.current.clientWidth * 0.8),
      behavior: "smooth",
    });

  // Same call AllProductsPage makes (token + one 401 retry)
  const fetchProducts = async (filters, retry = false) => {
    const token = await getValidToken();
    if (!token) throw new Error("No valid token");

    const res = await fetch("/api/getProducts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ filters }),
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchProducts(filters, true);
    }
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    return data?.products || [];
  };

  const handleSelect = async (category) => {
    const id = ++requestId.current;
    setActive(category.label);
    setProducts([]);
    setError(false);
    setLoading(true);

    try {
      const list = await fetchProducts(category.filters);
      if (id !== requestId.current) return;
      setProducts(list);
    } catch (err) {
      console.error("festive decor products:", err);
      if (id === requestId.current) setError(true);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const handleClose = () => {
    requestId.current++;
    setActive(null);
    setProducts([]);
    setLoading(false);
    setError(false);
  };

  // bring the results into view when a category is picked
  useEffect(() => {
    if (active) {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [active]);

  return (
    <section
      id="festive-decor"
      className="bg-[#fbf6ef] px-5 py-12 sm:px-8 lg:px-[5%] lg:py-16"
    >
      <style>{QUICK_ADD_STYLES}</style>

      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-[#a8321e]">
            Decor for every corner
          </p>
          <h2
            className={`${serif.className} text-4xl uppercase text-[#1c1620] md:text-5xl`}
          >
            Festive <span className="italic text-[#6d0f2b]">Decor</span>
          </h2>
          <p
            className={`mt-3 text-sm font-light leading-relaxed text-[#5b4f53] ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            Give your home a celebratory glow this Diwali. Our festive decor
            brings together glowing diyas, fairy lights, handcrafted torans,
            floral candles and reusable rangolis, each chosen to add warmth,
            colour and a little festive magic to your space. From elegant
            accents to vibrant statement pieces, find something for every room
            and every occasion.
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#a00300] transition hover:text-[#6d0f2b]"
          >
            {expanded ? "View Less" : "View More"}
          </button>
        </div>

        {/* arrows */}
        <div className="hidden gap-2 md:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex h-10 w-10 items-center justify-center border border-[#6d0f2b]/40 text-[#6d0f2b] transition hover:bg-[#6d0f2b] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex h-10 w-10 items-center justify-center border border-[#6d0f2b]/40 text-[#6d0f2b] transition hover:bg-[#6d0f2b] hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </Reveal>

      {/* horizontal scroller (scrollbar hidden without global CSS) */}
      <div
        ref={scroller}
        className="-mx-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:gap-6 sm:px-8 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((c) => {
          const isActive = active === c.label;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => handleSelect(c)}
              aria-pressed={isActive}
              className="group w-36 shrink-0 snap-start text-center sm:w-44 lg:w-[calc((100%-7.5rem)/6)] lg:min-w-[150px]"
            >
              <div
                className={`aspect-square overflow-hidden rounded-full border bg-[#efe4d6] p-1 transition ${
                  isActive
                    ? "border-[#a00300] ring-2 ring-[#a00300]/30"
                    : "border-[#e3cfb3]"
                }`}
              >
                <div
                  className="h-full w-full rounded-full transition-transform duration-500 group-hover:scale-105"
                  style={bg(c.img, c.fallback)}
                />
              </div>
              <p
                className={`mt-4 text-[11px] font-medium uppercase leading-snug tracking-[0.15em] transition group-hover:text-[#a00300] font-odop ${
                  isActive ? "text-[#a00300]" : "text-[#1c1620]"
                }`}
              >
                {c.label}
              </p>
              <span
                className={`mx-auto mt-2 block h-px bg-[#a00300]/60 transition-all duration-300 group-hover:w-14 ${
                  isActive ? "w-14" : "w-8"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ── Products for the selected category ── */}
      {active && (
        <div
          ref={resultsRef}
          className="mt-10 scroll-mt-24 border-t border-[#e3cfb3] pt-8"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[9px] uppercase tracking-[0.25em] text-[#a8321e]">
                Showing
              </p>
              <h3
                className={`${serif.className} text-2xl uppercase text-[#1c1620] md:text-3xl`}
              >
                {active}
                {!loading && !error && (
                  <span className="ml-2 text-base font-normal text-[#5b4f53]">
                    ({products.length})
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close products"
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#6d0f2b]/40 text-[#6d0f2b] transition hover:bg-[#6d0f2b] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse bg-[#efe4d6]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#7a6f72]">
                Couldn&apos;t load products right now.
              </p>
              <button
                onClick={() =>
                  handleSelect(CATEGORIES.find((c) => c.label === active))
                }
                className="mt-3 border border-[#6d0f2b] px-5 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#6d0f2b] transition hover:bg-[#6d0f2b] hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 font-odop sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {products.map((product) => (
                <DiwaliCard
                  key={product.id}
                  product={product}
                  onQuickView={openQuickView}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-[#7a6f72]">
              No products found in this category yet.
            </p>
          )}
        </div>
      )}

      {/* Quick view modal */}
      <QuickViewModal
        quickViewProduct={quickViewProduct}
        setQuickViewProduct={setQuickViewProduct}
        mainImage={mainImage}
        setMainImage={setMainImage}
        quantity={quantity}
        setQuantity={setQuantity}
        isAdding={isAddingQuick}
        setIsAdding={setIsAddingQuick}
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
    </section>
  );
}
