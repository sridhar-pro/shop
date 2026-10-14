"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, Minus, Plus, Trash2 } from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { getImageSrc, getPriceInfo } from "./utils";
import { useAuth } from "@/app/utils/AuthContext";
import { useCartQty } from "@/app/hooks/useCartQty";
import { QUICK_ADD_STYLES } from "@/app/home/Products/constants/quickAddStyles";
import { createQuickAddHandler } from "@/app/home/Products/hooks/useQuickAdd";
import QuickViewModal from "@/app/home/Products/components/QuickViewModal";

const handleQuickAdd = createQuickAddHandler();

const SKELETON_COUNT = 10;
const CACHE_KEY = "diwali_edit_products_v2"; // bumped: new API + new data shape
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const FILTERS = {
  gifts_products: "",
  category: "",
  sub_subcategory: "",
  title9: "1",
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

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (!Array.isArray(data) || Date.now() - ts > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // storage full or blocked, just skip caching
  }
}

function getAlternateImage(imageHtml) {
  if (!imageHtml) return null;

  const tags = [...imageHtml.matchAll(/<img\b[^>]*>/gi)].map(([tag]) => tag);

  // Prefer the explicitly marked back image.
  // Otherwise, use the second image if available.
  const selectedTag =
    tags.find((tag) => /\bclass=["'][^"']*\bback-img\b/i.test(tag)) || tags[1];

  const src = selectedTag?.match(/\bsrc=["']([^"']+)["']/i)?.[1];

  if (!src) return null;

  const imageSrc = src.replace(/&amp;/g, "&");

  return imageSrc.startsWith("http") || imageSrc.startsWith("/")
    ? imageSrc
    : getImageSrc(imageSrc);
}

// Same call AllProductsPage makes (token + one 401 retry)
async function fetchProducts(getValidToken, retry = false) {
  const token = await getValidToken();
  if (!token) throw new Error("No valid token");

  const res = await fetch("/api/getProducts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ filters: FILTERS }),
  });

  if (res.status === 401 && !retry) {
    localStorage.removeItem("authToken");
    return fetchProducts(getValidToken, true);
  }
  if (!res.ok) throw new Error(`Products API error: ${res.status}`);

  const data = await res.json();
  return Array.isArray(data?.products) ? data.products : [];
}

// Shared across component instances so two mounts don't fire two requests
let inflight = null;

async function loadProducts(getValidToken) {
  const cached = readCache();
  if (cached) return cached;

  if (!inflight) {
    inflight = fetchProducts(getValidToken)
      .then((list) => {
        if (list.length > 0) writeCache(list);
        return list;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

const TABS = [
  { label: "All", keywords: [] },
  { label: "Gifts", keywords: ["gift", "hamper", "box", "combo"] },
  {
    label: "Home",
    keywords: [
      "candle",
      "diya",
      "lamp",
      "decor",
      "home",
      "bowl",
      "urli",
      "light",
    ],
  },
  {
    label: "Personalised",
    keywords: ["personal", "custom", "name", "engrav", "monogram"],
  },
  { label: "Corporate", keywords: ["corporate", "bulk", "hamper", "combo"] },
  { label: "Bestsellers", keywords: [] },
];

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

function DiwaliCard({ product, onQuickView }) {
  const router = useRouter();

  // getProducts returns `product_variants`; the old getTitle9 returned `variants`
  const hasVariants =
    (Array.isArray(product.variants) && product.variants.length > 0) ||
    (Array.isArray(product.product_variants) &&
      product.product_variants.length > 0);

  const availableQty =
    Array.isArray(product.variants) && product.variants.length > 0
      ? Number(product.variants?.[0]?.variant_quantity || 0)
      : Number(product.quantity || 0);

  const isOutOfStock = availableQty <= 0;

  const alternateImage =
    getAlternateImage(product.image_g) ||
    (product.product_variants?.[0]?.back_view
      ? getImageSrc(product.product_variants[0].back_view)
      : null);

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
            {/* Main image - visible by default */}
            <img
              src={getImageSrc(product.image)}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-contain p-3 sm:p-4 transition-opacity duration-300 ${
                alternateImage
                  ? "opacity-100 group-hover/image:opacity-0"
                  : "opacity-100"
              }`}
            />

            {/* Alternate image - visible on hover */}
            {alternateImage && (
              <img
                src={alternateImage}
                alt={`${product.name} - alternate view`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain p-3 sm:p-4 opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
              />
            )}
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
      <div className="flex flex-1 flex-col p-2 sm:p-2.5">
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

export default function DiwaliEdit() {
  const { getValidToken } = useAuth();
  // keep latest getValidToken without re-triggering the fetch effect
  const getValidTokenRef = useRef(getValidToken);
  getValidTokenRef.current = getValidToken;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

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

  useEffect(() => {
    let cancelled = false;

    loadProducts(() => getValidTokenRef.current())
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch((err) => {
        console.error("Diwali products fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // No slice/limit: every product returned by the API is shown
  const visible = useMemo(() => {
    const tab = TABS.find((t) => t.label === activeTab);
    return tab?.keywords.length
      ? products.filter((p) =>
          tab.keywords.some((k) => (p.name || "").toLowerCase().includes(k)),
        )
      : products;
  }, [products, activeTab]);

  return (
    <section
      id="diwali-edit"
      className="bg-[#fbf6ef] px-5 py-12 sm:px-8 lg:px-[5%] lg:py-16"
    >
      <style>{QUICK_ADD_STYLES}</style>

      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-[#6d0f2b]">
            Curated for you
          </p>
          <h2
            className={`${serif.className} text-4xl uppercase text-[#1c1620] md:text-5xl`}
          >
            The Diwali <span className="italic text-[#6d0f2b]">Edit</span>
          </h2>
          <p className="mt-2 text-sm font-light text-[#5b4f53]">
            A considered collection for gifting, celebrating and sharing.
          </p>
        </div>
      </Reveal>

      {/* grid: 2 on mobile, 3 on tablet, 4 on desktop */}
      <div className="mt-6 grid grid-cols-2 gap-2 font-odop sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse bg-[#efe4d6]" />
          ))
        ) : visible.length > 0 ? (
          visible.map((product, i) => (
            <DiwaliCard
              key={product.id ?? i}
              product={product}
              onQuickView={openQuickView}
            />
          ))
        ) : (
          <p className="col-span-full py-10 text-center text-sm text-[#7a6f72]">
            No products found in this collection yet.
          </p>
        )}
      </div>

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
