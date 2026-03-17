"use client";
import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import useMetaUpdater from "../hooks/useMetaUpdater";
import { ArrowUp, PackageSearch } from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";
import CartSidebar from "@/app/components/CartSideBar";

// ── Split components ──────────────────────────────────────────────
import ProductCard from "./components/Productcard";
import FilterSidebar from "./components/Filtersidebar";
import {
  MobileActionButtons,
  MobileFilterDrawer,
  MobileSortDrawer,
} from "./components/Mobiledrawers";
import Pagination from "./components/Pagination";
import SortDropdown from "./components/Sortdropdown";
import WarehouseBanner from "./components/Warehousebanner";
import PageSectionHeader from "./components/Pagesectionheader";
import OtherProductsGrid from "./components/Otherproductsgrid";

//  ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12; // every batch loads exactly 12 products

let categoriesCache = null;
let categoriesCacheTime = null;

// ── Skeleton card ─────────────────────────────────────────────────
const SkeletonCard = React.memo(() => (
  <div className="rounded-3xl bg-white overflow-hidden">
    <div className="w-full h-40 md:h-56 rounded-2xl bg-gray-200 animate-pulse mb-3 md:mb-4" />
    <div className="p-5 space-y-2">
      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
      <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mt-1" />
    </div>
  </div>
));

export default function AllProductsPage({
  logos,
  categorySlug: categorySlugFromProps,
  subCategorySlug: subCategorySlugFromProps,
  subSubCategorySlug: subSubCategorySlugFromProps,
  params,
  searchParams,
}) {
  const search = useSearchParams();
  const categorySlugFromQuery = search.get("category");
  const subCategorySlugFromQuery = search.get("sub");
  const subSubCategorySlugFromQuery = search.get("subsub");

  const hasTriggeredInitialFetchRef = useRef(false);
  const observerCooldownRef = useRef(false);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categorySlug = categorySlugFromProps || categorySlugFromQuery;
  const subCategorySlug = subCategorySlugFromProps || subCategorySlugFromQuery;
  const subSubCategorySlug =
    subSubCategorySlugFromProps || subSubCategorySlugFromQuery;
  const warehousesId = search.get("warehouses_id");

  const resolvedParams = React.use(params) || {};
  let slug = resolvedParams.slug;
  if (Array.isArray(slug)) slug = slug[slug.length - 1];
  slug = slug ?? "";

  const title = slug
    ? slug
        .toString()
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  // ── Products state ───────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ── Refs (safe to read inside IO/callbacks without stale closures) ─
  const isFetchingRef = useRef(false); // hard lock — no concurrent fetches
  const nextPageRef = useRef(1); // next page number to request (1-indexed)
  const filtersRef = useRef({}); // latest filter snapshot
  const hasMoreRef = useRef(true); // mirror of hasMore for IO callback
  const observerRef = useRef(null); // holds the IntersectionObserver instance

  // ── Filter states ────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [inStock, setInStock] = useState(false);
  const [priceRange, setPriceRange] = useState(0);
  const [viewMode] = useState("grid");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [sortBy, setSortByState] = useState("");
  const setSortBy = (value) => {
    setSortByState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `allProductsSortBy:${window.location.pathname}`,
        value || "",
      );
    }
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [categoryMeta, setCategoryMeta] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  // ── Page-type flags ──────────────────────────────────────────────
  const isOffersPage = pathname === "/products/offers";
  const isFestivalGifting = pathname === "/products/festival-gifting";
  const isBogo = pathname === "/products/special-offers";
  const isNewarrivalsPage = pathname?.endsWith("/NA01--4c91bafe");
  const isCorporateEssentialsPage = pathname?.endsWith("/CE01--2dd33e70");
  const isMostSavedPage = pathname.includes("/MS01--71e2a9cd");
  const isWellnessPage = pathname.includes("/WP01--9a33f1d2");
  const isReturnGiftsPage = pathname.includes("/RG01--bc119f84");
  const isFeaturedPage = pathname.includes("FE01--318f9ji");
  const isCorporatePage = pathname.includes("CP01--3jhfdkjs");
  const isGetTitle9Page = pathname?.includes("/G01--3f7a9c2d");
  const isGetTitle10Page = pathname?.includes("/G02--8bd14e6f");
  const isGetTitle11Page = pathname?.includes("/G03--c29fa781");
  const isGetTitle12Page = pathname?.includes("/G04--6e5b3d90");
  const isWomensday = pathname === "/products/womensday-saleweek";

  const searchQuery = search.get("query");
  const today = new Date().toISOString().split("T")[0];

  const updateUrl = (url) => window.history.replaceState(null, "", url);

  const handleCategorySelect = (slug, id) => {
    setSelectedCategory(id);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
    updateUrl(`/products/category/${slug}`);
  };
  const handleSubcategorySelect = (catSlug, subSlug, subId) => {
    setSelectedSubcategory(subId);
    setSelectedSubSubcategory(null);
    updateUrl(`/products/category/${catSlug}/${subSlug}`);
  };
  const handleSubSubcategorySelect = (catSlug, subSlug, subsubSlug, id) => {
    setSelectedSubSubcategory(id);
    updateUrl(`/products/category/${catSlug}/${subSlug}/${subsubSlug}`);
  };

  const sortOptions = [
    { value: "1nto", label: "Newest" },
    { value: "1f", label: "Featured" },
    { value: "1bs", label: "Best Seller" },
    { value: "1plth", label: "Price: Low to High" },
    { value: "1phtl", label: "Price: High to Low" },
  ];

  // ── Restore sort from localStorage ──────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(
        `allProductsSortBy:${window.location.pathname}`,
      );
      if (saved) setSortByState(saved);
    } catch (_) {}
  }, []);

  // ── Match category slugs → IDs ───────────────────────────────────
  useEffect(() => {
    if (!categorySlug || categories.length === 0) return;
    const mc = categories.find((c) => c.slug === categorySlug);
    if (mc) {
      setSelectedCategory(mc.id);
      if (subCategorySlug) {
        const ms = mc.subcategories?.find((s) => s.slug === subCategorySlug);
        if (ms) {
          setSelectedSubcategory(ms.id);
          if (subSubCategorySlug) {
            const mss = ms.sub_subcategories?.find(
              (ss) => ss.slug === subSubCategorySlug,
            );
            if (mss) setSelectedSubSubcategory(mss.id);
          }
        }
      }
    }
  }, [categorySlug, subCategorySlug, subSubCategorySlug, categories]);

  // ── Auth + categories ─────────────────────────────────────────────
  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const load = async () => {
      try {
        if (
          categoriesCache &&
          categoriesCacheTime &&
          Date.now() - categoriesCacheTime < ONE_DAY
        ) {
          setCategories(categoriesCache);
          setLoadingCategories(false);
          return;
        }
        setLoadingCategories(true);
        const data = await fetchWithAuthGlobal(
          "/api/homeCategory",
          {},
          getValidToken,
        );
        if (!data) return;
        categoriesCache = data;
        categoriesCacheTime = Date.now();
        setCategories(data);
      } catch (e) {
        console.error("categories:", e);
      } finally {
        setLoadingCategories(false);
      }
    };
    load();
  }, [getValidToken, isAuthReady]);

  // ── Core fetch ────────────────────────────────────────────────────
  // mode "reset" → page 1, clears the list
  // mode "more"  → next page, appends to the list
  //
  // The API receives an incrementing `page` number (1, 2, 3…).
  // `nextPageRef` is advanced only after a successful response.
  const fetchProducts = useCallback(
    async ({
      categoryId,
      subcategoryId,
      subSubcategoryId,
      page = 1,
      sortValue = "",
      inStockValue = false,
      priceRangeVal = [1, 100000],
      query = "",
      mode = "reset",
      retry = false,
    }) => {
      // Hard lock — never allow two fetches at once
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (mode === "reset") setIsInitialLoading(true);
      else setIsFetchingMore(true);

      const token = localStorage.getItem("authToken");
      const isValidId = (v) => v !== null && v !== undefined;
      const isDefRange = priceRangeVal[0] === 1 && priceRangeVal[1] === 100000;
      const offset = (page - 1) * PAGE_SIZE; // derived from page

      const body = {
        filters: {
          gifts_products: "",
          category: isValidId(categoryId) ? { id: categoryId } : {},
          subcategory: isValidId(subcategoryId) ? { id: subcategoryId } : {},
          sub_subcategory: isValidId(subSubcategoryId)
            ? { id: subSubcategoryId }
            : {},
          query,
          brand: "",
          sorting: "name-asc",
          ...(isDefRange
            ? { min_price: "1", max_price: "0" }
            : {
                min_price: `${priceRangeVal[0]}`,
                max_price: `${priceRangeVal[1]}`,
              }),
          in_stock: inStockValue ? "1" : "0",
          sort_by_v: sortValue,
          page: `${page}`, // ← incrementing page: 1, 2, 3 …
          limit: PAGE_SIZE,
          offset: `${offset}`, // ← derived: 0, 12, 24 …
          warehouses_id: warehousesId || "",
          ...(isOffersPage && {
            promotion: { promotion: 1, start_date: today },
          }),
          ...(isFestivalGifting && { best_selling: "1" }),
          ...(isBogo && { bogo: "1" }),
          ...(isNewarrivalsPage && { new_arrivals: "1" }),
          ...(isCorporateEssentialsPage && { gifts_products: "1" }),
          ...(isMostSavedPage && { festival_special: "1" }),
          ...(isWellnessPage && { wellness_products: "1" }),
          ...(isReturnGiftsPage && { return_gifts: "1" }),
          ...(isFeaturedPage && { featured_products: "1" }),
          ...(isCorporatePage && { corporate_gifts: "1" }),
          ...(isGetTitle9Page && { title9: "1" }),
          ...(isGetTitle10Page && { title10: "1" }),
          ...(isGetTitle11Page && { title11: "1" }),
          ...(isGetTitle12Page && { title12: "1" }),
          ...(isWomensday && { title13: "1" }),
        },
      };

      try {
        const res = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (res.status === 401 && !retry) {
          localStorage.removeItem("authToken");
          isFetchingRef.current = false;
          return fetchProducts({
            categoryId,
            subcategoryId,
            subSubcategoryId,
            page,
            sortValue,
            inStockValue,
            priceRangeVal,
            query,
            mode,
            retry: true,
          });
        }
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        const incoming = data?.products || [];
        const total = Number(data?.info?.total_count || 0);

        if (data.metaData) setCategoryMeta(data.metaData);
        if (mode === "reset") setWarehouse(data.warehouse || null);

        if (mode === "reset") {
          setProducts(incoming);
        } else {
          setProducts((prev) => {
            const seen = new Set(prev.map((p) => p.id));
            const fresh = incoming.filter((p) => !seen.has(p.id));
            return [...prev, ...fresh];
          });
        }

        // Advance page pointer ONLY after a successful fetch
        nextPageRef.current = page + 1;

        // hasMore:
        //   Primary  → did the API return a full PAGE_SIZE batch?
        //   Secondary → have we loaded >= total_count (when API provides it)?
        const loadedSoFar = (page - 1) * PAGE_SIZE + incoming.length;
        const noMore =
          incoming.length === 0 ||
          incoming.length < PAGE_SIZE ||
          (total > 0 && loadedSoFar >= total);

        setHasMore(!noMore);
        hasMoreRef.current = !noMore;
        setHasLoadedOnce(true);
      } catch (err) {
        console.error("fetch products:", err);
        setHasLoadedOnce(true);
        setHasMore(false);
        hasMoreRef.current = false;
      } finally {
        isFetchingRef.current = false;
        setIsInitialLoading(false);
        setIsFetchingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      warehousesId,
      today,
      isOffersPage,
      isFestivalGifting,
      isBogo,
      isNewarrivalsPage,
      isCorporateEssentialsPage,
      isMostSavedPage,
      isWellnessPage,
      isReturnGiftsPage,
      isFeaturedPage,
      isCorporatePage,
      isGetTitle9Page,
      isGetTitle10Page,
      isGetTitle11Page,
      isGetTitle12Page,
      isWomensday,
    ],
  );

  useMetaUpdater(categoryMeta);

  // ── Shared reset helper ───────────────────────────────────────────
  const resetAndFetch = useCallback(
    (snapshot) => {
      hasTriggeredInitialFetchRef.current = true; // mark as used
      filtersRef.current = snapshot;
      nextPageRef.current = 1;
      hasMoreRef.current = true;
      setHasMore(true);
      setProducts([]);
      fetchProducts({ ...snapshot, page: 1, mode: "reset" });
    },
    [fetchProducts],
  );
  // ── Trigger reset on filter / sort / auth change ──────────────────
  useEffect(() => {
    if (!isAuthReady) return;

    if (categorySlug && loadingCategories) return;
    if (categorySlug && !selectedCategory) return;

    const snapshot = {
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      subSubcategoryId: selectedSubSubcategory,
      sortValue: sortBy,
      inStockValue: inStock,
      priceRangeVal: priceRange > 0 ? [0, priceRange] : [1, 100000],
      query: searchQuery || "",
    };

    const sameFilters =
      JSON.stringify(filtersRef.current) === JSON.stringify(snapshot);

    if (sameFilters && hasTriggeredInitialFetchRef.current) return;

    hasTriggeredInitialFetchRef.current = true;

    resetAndFetch(snapshot);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    sortBy,
    inStock,
    priceRange,
    isAuthReady,
    searchQuery,
    loadingCategories,
    categorySlug,
  ]);

  // ── IntersectionObserver (callback-ref pattern) ───────────────────
  //
  // KEY DESIGN:
  //   1. Callback ref fires the instant the DOM node mounts — no timing gap.
  //   2. The sentinel is only rendered when {hasMore && !isFetchingMore}.
  //      When hasMore → false, React unmounts the sentinel, the callback ref
  //      receives null, and we disconnect the observer. Zero extra API calls.
  //   3. All values read from refs (hasMoreRef, isFetchingRef, nextPageRef,
  //      filtersRef) — no stale closures, no re-registration needed.
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const setSentinelRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            hasMoreRef.current &&
            !isFetchingRef.current &&
            !observerCooldownRef.current
          ) {
            observerCooldownRef.current = true;

            fetchProducts({
              ...filtersRef.current,
              page: nextPageRef.current,
              mode: "more",
            });

            setTimeout(() => {
              observerCooldownRef.current = false;
            }, 400); // small cooldown
          }
        },
        { threshold: 0, rootMargin: "300px" },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [fetchProducts],
  );

  // ── Helpers ──────────────────────────────────────────────────────
  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "Unknown";

  const decodeHtml = (str) => {
    if (typeof window === "undefined") return str;
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleApplyFilters = () => {
    resetAndFetch({
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory,
      subSubcategoryId: selectedSubSubcategory,
      sortValue: sortBy,
      inStockValue: inStock,
      priceRangeVal: priceRange > 0 ? [0, priceRange] : [1, 100000],
      query: searchQuery || "",
    });
    setShowMobileFilters(false);
  };

  const handleSidebarCategoryFetch = (catId, subId, subsubId) => {
    resetAndFetch({
      ...filtersRef.current,
      categoryId: catId,
      subcategoryId: subId,
      subSubcategoryId: subsubId,
    });
  };

  // ── Shared props ─────────────────────────────────────────────────
  const filterProps = {
    categories,
    loadingCategories,
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    inStock,
    priceRange,
    setInStock,
    setPriceRange,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedSubSubcategory,
    getCategoryName,
    decodeHtml,
    handleCategorySelect,
    handleSubcategorySelect,
    handleSubSubcategorySelect,
    fetchProductsByCategory: handleSidebarCategoryFetch,
    setSortBy,
    setCurrentPage: () => {},
    updateUrl,
    router,
    onApplyFilters: handleApplyFilters,
    currentPage: 1,
    sortBy,
  };

  const pageSectionProps = {
    isOffersPage,
    isFestivalGifting,
    isWomensday,
    isNewarrivalsPage,
    isCorporateEssentialsPage,
    isMostSavedPage,
    isWellnessPage,
    isReturnGiftsPage,
    isFeaturedPage,
    isCorporatePage,
    isGetTitle9Page,
    isGetTitle10Page,
    isGetTitle11Page,
    isGetTitle12Page,
    isBogo,
    title,
  };

  const gridClass =
    "grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-odop">
      {/* Mobile drawers */}
      <div className="block md:hidden">
        <MobileActionButtons
          selectedCategory={selectedCategory}
          inStock={inStock}
          priceRange={priceRange}
          onOpenFilters={() => setShowMobileFilters(true)}
          onOpenSort={() => setShowMobileSort(true)}
        />
        <MobileFilterDrawer
          show={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          {...filterProps}
        />
        <MobileSortDrawer
          show={showMobileSort}
          onClose={() => setShowMobileSort(false)}
          sortOptions={sortOptions}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </div>

      {/* Main layout */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <FilterSidebar {...filterProps} />

          <motion.main
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            {/* Sort bar */}
            <div className="flex items-center justify-between gap-2 mb-6 sm:mb-8">
              <SortDropdown
                sortOptions={sortOptions}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </div>

            <WarehouseBanner warehouse={warehouse} />
            <PageSectionHeader {...pageSectionProps} />

            {/* ── Full skeleton on initial load ── */}
            {isInitialLoading && (
              <div className={gridClass}>
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* ── Loaded products grid ── */}
            {!isInitialLoading && products.length > 0 && (
              <div className={gridClass} style={{ contain: "layout paint" }}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isCartOpen={isCartOpen}
                    setIsCartOpen={setIsCartOpen}
                  />
                ))}
              </div>
            )}

            {/* ── 12-card skeleton while fetching the next page ── */}
            {isFetchingMore && (
              <div className={`${gridClass} mt-4 min-h-[400px]`}>
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <SkeletonCard key={`more-${i}`} />
                ))}
              </div>
            )}

            {/*
              ── Sentinel ─────────────────────────────────────────────
              Only rendered when hasMore=true AND not currently fetching.
              Placed BELOW both the products grid AND the skeleton so it
              stays below the fold until the user actually scrolls down.

              When hasMore becomes false → React unmounts this node →
              callback ref fires with null → observer disconnects →
              getProducts is NEVER called again until filters change.
            */}
            {!isInitialLoading && !isFetchingMore && hasMore && (
              <div
                ref={setSentinelRef}
                className="h-px w-full"
                aria-hidden="true"
              />
            )}

            {/* ── End of list ── */}
            {!isInitialLoading &&
              hasLoadedOnce &&
              !hasMore &&
              products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center py-10"
                >
                  <div className="w-24 h-[1px] bg-gray-300"></div>
                </motion.div>
              )}

            {/* ── Empty state ── */}
            {!isInitialLoading && hasLoadedOnce && products.length === 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center p-4 text-center font-odop"
                >
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-gray-700">
                      We couldn't find any matches
                    </h2>
                    <PackageSearch className="w-8 h-8 text-gray-700 opacity-80" />
                  </div>
                  <p className="text-gray-500 max-w-3xl">
                    Try adjusting your filters, searching for something else, or
                    explore our featured products below.
                  </p>
                </motion.div>
                <div className="mt-8">
                  <OtherProductsGrid />
                </div>
              </>
            )}

            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
          </motion.main>
        </div>
      </div>
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[100] w-12 h-12 rounded-full flex items-center justify-center bg-[#A00300] shadow-lg hover:scale-110 transition-transform"
          aria-label="Go to top"
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </div>
  );
}
