"use client";
import React from "react";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "../utils/variants";
import useMetaUpdater from "../hooks/useMetaUpdater";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  IndianRupee,
  PackageCheck,
  Filter,
  X,
  Circle,
  CheckCircle2,
  ArrowRightCircle,
  ArrowUpDown,
  Gift,
  PackageSearch,
  Store,
} from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../components/WishlistButton";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

export default function AllProductsPage({
  logos,
  categorySlug: categorySlugFromProps,
  subCategorySlug: subCategorySlugFromProps,
  subSubCategorySlug: subSubCategorySlugFromProps,
  params,
  searchParams,
}) {
  const productCache = useRef({});
  const search = useSearchParams();
  const categorySlugFromQuery = search.get("category");
  const subCategorySlugFromQuery = search.get("sub");
  const subSubCategorySlugFromQuery = search.get("subsub");

  const categorySlug = categorySlugFromProps || categorySlugFromQuery;
  const subCategorySlug = subCategorySlugFromProps || subCategorySlugFromQuery;
  const subSubCategorySlug =
    subSubCategorySlugFromProps || subSubCategorySlugFromQuery;
  const warehousesId = search.get("warehouses_id");

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const resolvedParams = React.use(params) || {};
  let slug = resolvedParams.slug;

  // Normalize slug to a string
  if (Array.isArray(slug)) {
    slug = slug[slug.length - 1]; // or join('-') depending on your routing structure
  }

  slug = slug ?? ""; // fallback to empty string if undefined

  const title = slug
    ? slug
        .toString()
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";

  const [products, setProducts] = useState([]);
  const [warehouse, setWarehouse] = useState(null);
  const hasFetched = useRef(false);
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [inStock, setInStock] = useState(false);
  const [priceRange, setPriceRange] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  // 👇 raw state
  const [currentPage, setCurrentPageState] = useState(1);

  // 👇 single place to persist page
  const setCurrentPage = (page) => {
    setCurrentPageState(page);
    if (typeof window !== "undefined") {
      // You can key it per-path if you want:
      const key = `allProductsCurrentPage:${window.location.pathname}`;
      localStorage.setItem(key, String(page));
    }
  };
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);

  // 🔽 SORT state + setter (with persistence)
  const [sortBy, setSortByState] = useState(""); // default to "Featured"
  const setSortBy = (value) => {
    setSortByState(value);
    if (typeof window !== "undefined") {
      const key = `allProductsSortBy:${window.location.pathname}`;
      localStorage.setItem(key, value || "");
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);

  const pathname = usePathname();
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
  const isWomensday = "/products/womensday-saleweek";

  const searchQuery = search.get("query"); // like how warehousesId or categorySlug is handled

  // Format today as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const [categoryMeta, setCategoryMeta] = useState(null);

  // Helper to push clean URL without reload/flicker
  const router = useRouter();
  const updateUrl = (url) => {
    window.history.replaceState(null, "", url);
  };

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

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  const sortOptions = [
    { value: "1nto", label: "Newest" },
    { value: "1f", label: "Featured" },
    { value: "1bs", label: "Best Seller" },
    { value: "1plth", label: "Price: Low to High" },
    { value: "1phtl", label: "Price: High to Low" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort by";

  // 🧙 Match category, subcategory, sub-subcategory from slugs
  useEffect(() => {
    if (!categorySlug || categories.length === 0) return;

    const matchedCategory = categories.find((cat) => cat.slug === categorySlug);
    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);

      if (subCategorySlug) {
        const matchedSub = matchedCategory.subcategories?.find(
          (sub) => sub.slug === subCategorySlug,
        );
        if (matchedSub) {
          setSelectedSubcategory(matchedSub.id);

          if (subSubCategorySlug) {
            const matchedSubSub = matchedSub.sub_subcategories?.find(
              (subsub) => subsub.slug === subSubCategorySlug,
            );
            if (matchedSubSub) {
              setSelectedSubSubcategory(matchedSubSub.id);
            }
          }
        }
      }
    }
  }, [categorySlug, subCategorySlug, subSubCategorySlug, categories]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const pageKey = `allProductsCurrentPage:${window.location.pathname}`;
      const sortKey = `allProductsSortBy:${window.location.pathname}`;

      const savedPage = localStorage.getItem(pageKey);
      const savedSort = localStorage.getItem(sortKey);

      if (savedPage) {
        const n = Number(savedPage);
        if (!isNaN(n) && n > 0) {
          // use raw setter to avoid re-writing localStorage again
          setCurrentPageState(n);
        }
      }

      if (savedSort) {
        setSortByState(savedSort);
      }
    } catch (err) {
      console.error("❌ Failed to restore page/sort from storage:", err);
    }
  }, []);

  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await fetchWithAuthGlobal(
          "/api/homeCategory",
          {},
          getValidToken,
        );

        if (!data) {
          console.warn("⚠️ No category data received.");
          return;
        }

        // console.log("✅ Categories fetched:", data);
        setCategories(data);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [getValidToken, isAuthReady]);

  const fetchProductsByCategory = async (
    categoryId,
    subcategoryId,
    subSubcategoryId,
    page = 1,
    sortValue = "",
    inStockValue = false,
    priceRange = [1, 100000],
    searchQuery = "",
    retry = false,
  ) => {
    const token = localStorage.getItem("authToken");
    // console.time("🛒 fetchProducts");
    setIsLoading(true);
    setHasLoadedOnce(false);

    const isValidId = (val) => val !== null && val !== undefined;

    const cacheKey = JSON.stringify({
      categoryId,
      subcategoryId,
      subSubcategoryId,
      page,
      sortValue,
      inStockValue,
      priceRange,
      warehousesId,
      searchQuery,
    });

    // 🧠 1. Check in-memory cache first
    if (productCache.current[cacheKey]) {
      // console.log("⚡️Using cached data for:", cacheKey);
      const cached = productCache.current[cacheKey];
      setProducts(cached.products);
      setTotalPages(cached.totalPages);
      setHasLoadedOnce(true);
      setIsLoading(false);
      // console.timeEnd("🛒 fetchProducts");
      return;
    }

    const isMobile = window.innerWidth < 768; // or use a responsive hook

    // 🎯 Smart price filter handling
    const isDefaultRange = priceRange[0] === 1 && priceRange[1] === 100000;

    const body = {
      filters: {
        gifts_products: "",
        category: isValidId(categoryId) ? { id: categoryId } : {},
        subcategory: isValidId(subcategoryId) ? { id: subcategoryId } : {},
        sub_subcategory: isValidId(subSubcategoryId)
          ? { id: subSubcategoryId }
          : {},
        query: searchQuery,
        brand: "",
        sorting: "name-asc",
        ...(isDefaultRange
          ? { min_price: "1", max_price: "0" }
          : { min_price: `${priceRange[0]}`, max_price: `${priceRange[1]}` }),
        in_stock: inStockValue ? "1" : "0",
        sort_by_v: sortValue,
        page: `${page}`,
        limit: 24,
        offset: `${(page - 1) * 24}`,
        warehouses_id: warehousesId || "",
        ...(isOffersPage && {
          promotion: {
            promotion: 1,
            start_date: today,
          },
        }),

        ...(isFestivalGifting && { best_selling: "1" }), // ✅ Added this
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

    // console.log("📦 Request Body :", body);

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
        console.warn("🛑 Unauthorized! Retrying once after clearing token...");
        localStorage.removeItem("authToken");

        return await fetchProductsByCategory(
          categoryId,
          subcategoryId,
          subSubcategoryId,
          page,
          sortValue,
          inStockValue,
          priceRange,
          true, // retry = true
        );
      }

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data = await res.json();

      // console.log("✅ Products fetched :", data);

      // console.log("✅ Products fetched with warehousesId:", warehousesId, data);

      // console.log("✅ Products fetched from API for:", {
      //   categoryId,
      //   subcategoryId,
      //   subSubcategoryId,
      // });

      if (data.metaData) {
        setCategoryMeta(data.metaData); // 👈 store metadata
      }

      // If coming from logo slider API
      if (data.warehouse) {
        setWarehouse(data.warehouse);
      } else {
        // 🔥 Clear old warehouse if this response doesn't have one
        setWarehouse(null);
      }

      setProducts(data?.products || []);
      setTotalPages(data?.info?.total_page || 1);
      setHasLoadedOnce(true);

      // 💾 2. Save to memory cache
      productCache.current[cacheKey] = {
        products: data?.products || [],
        totalPages: data?.info?.total_page || 1,
      };
    } catch (err) {
      console.error("❌ Fetching products failed:", err);
      setHasLoadedOnce(true);
    } finally {
      setIsLoading(false);
      // console.timeEnd("🛒 fetchProducts");
    }
  };

  useMetaUpdater(categoryMeta);
  // Detecting search page
  const isSearchPage = !!searchQuery;

  // console.log("searchQuery:", searchQuery);

  const hasVideo = warehouse?.about_video;

  // 👇 New Effect: reset pagination when search changes
  useEffect(() => {
    if (!isAuthReady) return;

    const timeout = setTimeout(() => {
      if (isSearchPage && searchQuery) {
        // console.log("🔍 Fetching search products for:", searchQuery);

        if (currentPage === 1) setProducts([]);

        fetchProductsByCategory(
          null,
          null,
          null,
          currentPage,
          sortBy,
          inStock,
          [1, 100000],
          searchQuery,
        );
      } else if (categories.length > 0) {
        fetchProductsByCategory(
          selectedCategory,
          selectedSubcategory,
          selectedSubSubcategory,
          currentPage,
          sortBy,
          inStock,
        );
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    currentPage,
    sortBy,
    inStock,
    isAuthReady,
    categories,
    searchQuery, // ✅ now correctly refetches when query changes
  ]);

  const getCategoryName = (id) => {
    const category = categories.find((cat) => cat.id === id);
    return category?.name || "Unknown";
  };

  const decodeHtml = (str) => {
    if (typeof window === "undefined") return str; // SSR safe
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const OtherProductsGrid = () => {
    const [otherProducts, setOtherProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchOtherProducts = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await fetch("/api/getProducts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              filters: {
                page: "1",
                limit: 12,
                min_price: "1",
                max_price: "0",
                sort_by_v: "",
              },
            }),
          });

          const data = await res.json();
          setOtherProducts(data?.products || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchOtherProducts();
    }, []);

    return (
      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-800 font-odop uppercase">
          <Gift className="w-5 h-5 text-[#A00300]" />
          You Might Like
        </h3>

        {loading ? (
          <div className="flex space-x-1 mt-4">
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-0"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-300"></span>
          </div>
        ) : otherProducts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherProducts.map((product) => {
              const isOutOfStock =
                !product.quantity || Number(product.quantity) <= 0;

              return (
                <Link
                  key={product.id}
                  href={isOutOfStock ? "#" : `/products/${product.slug}`}
                  className={`group rounded-xl sm:rounded-3xl bg-white transition-all duration-300 overflow-hidden relative ${
                    isOutOfStock
                      ? "opacity-70 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Product Image */}
                  <div
                    className={`relative w-full h-32 sm:h-40 md:h-56 rounded-lg sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 md:mb-4 group ${
                      isOutOfStock ? "blur-[1.5px]" : ""
                    }`}
                  >
                    <img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-5">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold line-clamp-2 mb-1 capitalize">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      {product.promo_price &&
                      product.end_date &&
                      product.promotion &&
                      new Date(product.end_date) > new Date() ? (
                        <div className="flex justify-between w-full">
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5 md:gap-2 text-[#a00030]">
                              <p className="text-sm md:text-lg font-bold">
                                ₹{Number(product.promo_price).toFixed(2)}
                              </p>
                              <p className="text-xs md:text-sm text-gray-400 line-through">
                                ₹{Number(product.price).toFixed(2)}
                              </p>
                            </div>
                            <span className="mt-1 text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg w-fit">
                              {Math.round(
                                ((Number(product.price) -
                                  Number(product.promo_price)) /
                                  Number(product.price)) *
                                  100,
                              )}
                              % OFF
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm md:text-lg font-bold text-gray-950">
                          ₹ {Number(product.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    {product.promo_tag && (
                      <div>
                        <span className="text-green-700 text-[10px] sm:text-sm italic font-semibold">
                          {product.promo_tag}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No other products found.</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen font-odop">
        {/* mobile devices */}
        <div className="block md:hidden">
          {/* Mobile Action Buttons - Only visible on mobile */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50">
            <div className="flex w-full">
              {/* Filter Button - Full width */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMobileFilters(true)}
                className="bg-white shadow-lg px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-200 flex-1 relative"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {(selectedCategory || inStock || priceRange !== 100000) && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                )}
                {/* Black separator line */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
              </motion.button>

              {/* Sort Button - Full width */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowMobileSort(true)}
                className="bg-white shadow-lg px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-200 flex-1"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="text-sm font-medium">Sort</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden bottom-16"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    {/* Clear Filters Header */}
                    <div className="flex flex-col border-b border-gray-200 pb-3">
                      {/* Filters heading + Selected category badge */}
                      <div className="flex items-center justify-between">
                        {/* Filters heading */}
                        <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm sm:text-base">
                          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          <span>Filters</span>
                        </div>

                        {/* Selected Category Badge - Hidden on mobile if too long */}
                        {(selectedCategory ||
                          selectedSubcategory ||
                          selectedSubSubcategory) && (
                          <div className="hidden sm:flex items-center gap-1">
                            {selectedCategory && (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium truncate max-w-[10rem] sm:max-w-[15rem]">
                                {getCategoryName(selectedCategory)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mobile-only selected category (simplified) */}
                      {(selectedCategory ||
                        selectedSubcategory ||
                        selectedSubSubcategory) && (
                        <div className="sm:hidden flex items-center gap-1 mt-1">
                          {selectedCategory && (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-medium truncate max-w-[80vw]">
                              {getCategoryName(selectedCategory)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Clear Filters Button */}
                      <AnimatePresence mode="wait">
                        {(selectedCategory ||
                          selectedSubcategory ||
                          selectedSubSubcategory ||
                          inStock ||
                          priceRange !== 100000) && (
                          <motion.button
                            key="clear-filters"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => {
                              // 1) Reset filter state
                              setSelectedCategory(null);
                              setSelectedSubcategory(null);
                              setSelectedSubSubcategory(null);
                              setInStock(false);
                              setPriceRange(100000);

                              // 2) Reset sort AND persist empty sort to localStorage (uses your wrapper)
                              setSortBy(""); // this writes to localStorage via your wrapper

                              // 3) Reset pagination (this persists via setCurrentPage)
                              setCurrentPage(1);

                              // 4) Update URL to base products page (keeps history clean)
                              updateUrl("/products");

                              // 5) Fetch fresh results explicitly with cleared parameters
                              //    Pass explicit values to avoid relying on async state updates
                              fetchProductsByCategory(
                                null, // category
                                null, // subcategory
                                null, // subSubcategory
                                1, // page
                                "", // sortValue
                                false, // inStockValue
                                [1, 100000], // priceRange (default)
                                "", // searchQuery
                              );
                            }}
                            className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Clear filters</span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={() => setShowMobileFilters(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Include your existing filter content here */}
                  <div className="space-y-6">
                    {/* Availability */}
                    <div className="space-y-3 border-b border-gray-200 pb-4">
                      {/* Availability */}
                      <div className="space-y-3 border- border-gray-200 b pb-4">
                        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                          <PackageCheck className="w-4 h-4 text-gray-500" />
                          Availability
                        </div>

                        <motion.label
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all px-3 py-2 rounded-lg border border-gray-200"
                        >
                          <span className="text-sm font-medium text-gray-800">
                            In Stock Only
                          </span>

                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={inStock}
                              onChange={(e) => setInStock(e.target.checked)}
                              className="sr-only"
                            />
                            <div
                              className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-all ${
                                inStock ? "bg-emerald-500" : ""
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                                  inStock ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </div>
                          </div>
                        </motion.label>
                      </div>

                      {/* Price Filter */}
                      <div className="space-y-4 pb-0">
                        {/* Price Filter - Redesigned */}
                        <div className="space-y-4 border-b border-gray-200">
                          <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                            <Filter className="w-4 h-4 text-gray-500" />{" "}
                            {/* Using Filter icon instead of Wallet */}
                            Price Range
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm text-gray-700 font-medium font-odop">
                              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                <IndianRupee className="w-3.5 h-3.5" />
                                {priceRange.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Max : ₹1,00,000
                              </span>
                            </div>

                            <input
                              type="range"
                              min="0"
                              max="100000"
                              step="100"
                              value={priceRange}
                              onChange={(e) =>
                                setPriceRange(Number(e.target.value))
                              }
                              className="w-full h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer 
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-gray-700
        [&::-webkit-slider-thumb]:border-2
        [&::-webkit-slider-thumb]:border-white
        [&::-webkit-slider-thumb]:shadow-sm"
                            />

                            {/* <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>₹1L</span>
                  </div> */}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                              fetchProductsByCategory(
                                selectedCategory,
                                selectedSubcategory,
                                selectedSubSubcategory,
                                currentPage,
                                sortBy,
                                inStock,
                                [0, priceRange],
                              )
                            }
                            className=""
                          ></motion.button>
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="space-y-0">
                        {/* Categories Section */}
                        {/* Categories Section */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="p-4 sm:p-2"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-lg font-bold text-black uppercase tracking-wide">
                              Categories
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {loadingCategories
                              ? [...Array(6)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="h-5 w-2/3 rounded bg-gray-200 animate-pulse"
                                  />
                                ))
                              : categories.map((cat, index) => {
                                  const isSelected =
                                    selectedCategory === cat.id;
                                  return (
                                    <motion.div
                                      key={cat.id}
                                      layout
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -10 }}
                                      transition={{
                                        duration: 0.4,
                                        delay: index * 0.05,
                                      }}
                                    >
                                      {/* Category button */}
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          const isCatSelected =
                                            selectedCategory === cat.id;
                                          setSelectedCategory(
                                            isCatSelected ? null : cat.id,
                                          );
                                          setSelectedSubcategory(null);
                                          setSelectedSubSubcategory(null);
                                          fetchProductsByCategory(
                                            isCatSelected ? null : cat.id,
                                            null,
                                            null,
                                          );
                                        }}
                                        className={`flex items-center justify-between w-full px-1 py-1 text-sm font-medium transition-colors duration-300 group ${
                                          isSelected
                                            ? "text-black font-semibold"
                                            : "text-gray-600 hover:text-black"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                              isSelected
                                                ? "bg-black"
                                                : "bg-gray-400 group-hover:bg-black"
                                            }`}
                                          />
                                          <span>{cat.name}</span>
                                        </div>
                                        {cat.subcategories?.length > 0 && (
                                          <ChevronDown
                                            className={`w-4 h-4 transition-transform ${
                                              isSelected
                                                ? "rotate-180 text-black"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        )}
                                      </motion.button>

                                      {/* Subcategories */}
                                      <AnimatePresence>
                                        {isSelected &&
                                          cat.subcategories?.length > 0 && (
                                            <motion.div
                                              initial={{
                                                opacity: 0,
                                                height: 0,
                                              }}
                                              animate={{
                                                opacity: 1,
                                                height: "auto",
                                              }}
                                              exit={{ opacity: 0, height: 0 }}
                                              transition={{ duration: 0.3 }}
                                              className="ml-4 mt-1 space-y-3"
                                            >
                                              {cat.subcategories.map(
                                                (sub, subIndex) => {
                                                  const isSubSelected =
                                                    selectedSubcategory ===
                                                    sub.id;
                                                  return (
                                                    <div key={sub.id}>
                                                      <motion.button
                                                        initial={{
                                                          opacity: 0,
                                                          x: -5,
                                                        }}
                                                        animate={{
                                                          opacity: 1,
                                                          x: 0,
                                                        }}
                                                        transition={{
                                                          delay:
                                                            subIndex * 0.03,
                                                        }}
                                                        onClick={() => {
                                                          const isSubSelected =
                                                            selectedSubcategory ===
                                                            sub.id;
                                                          setSelectedSubcategory(
                                                            isSubSelected
                                                              ? null
                                                              : sub.id,
                                                          );
                                                          setSelectedSubSubcategory(
                                                            null,
                                                          );
                                                          fetchProductsByCategory(
                                                            selectedCategory,
                                                            isSubSelected
                                                              ? null
                                                              : sub.id,
                                                            null,
                                                          );
                                                        }}
                                                        className={`flex items-center gap-2 w-full text-left text-sm transition-colors duration-200 ${
                                                          isSubSelected
                                                            ? "text-black font-medium"
                                                            : "text-gray-500 hover:text-black"
                                                        }`}
                                                      >
                                                        {isSubSelected ? (
                                                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                          <Circle className="w-4 h-4 text-gray-300" />
                                                        )}
                                                        {sub.name}
                                                        {sub.sub_subcategories
                                                          ?.length > 0 && (
                                                          <ChevronDown
                                                            className={`w-3 h-3 ml-auto ${
                                                              isSubSelected
                                                                ? "rotate-180 text-black"
                                                                : "text-gray-400"
                                                            }`}
                                                          />
                                                        )}
                                                      </motion.button>

                                                      {/* Sub-Subcategories (products) */}
                                                      <AnimatePresence>
                                                        {isSubSelected &&
                                                          sub.sub_subcategories
                                                            ?.length > 0 && (
                                                            <motion.div
                                                              initial={{
                                                                opacity: 0,
                                                                height: 0,
                                                              }}
                                                              animate={{
                                                                opacity: 1,
                                                                height: "auto",
                                                              }}
                                                              exit={{
                                                                opacity: 0,
                                                                height: 0,
                                                              }}
                                                              transition={{
                                                                duration: 0.3,
                                                              }}
                                                              className="ml-6 mt-1 space-y-2"
                                                            >
                                                              {sub.sub_subcategories.map(
                                                                (subsub) => {
                                                                  const isSubSubSelected =
                                                                    selectedSubSubcategory ===
                                                                    subsub.id;
                                                                  return (
                                                                    <motion.button
                                                                      key={
                                                                        subsub.id
                                                                      }
                                                                      whileHover={{
                                                                        scale: 1.01,
                                                                      }}
                                                                      whileTap={{
                                                                        scale: 0.99,
                                                                      }}
                                                                      onClick={() => {
                                                                        setSelectedSubSubcategory(
                                                                          subsub.id,
                                                                        );
                                                                        fetchProductsByCategory(
                                                                          selectedCategory,
                                                                          selectedSubcategory,
                                                                          subsub.id,
                                                                        );
                                                                      }}
                                                                      className={`flex items-center gap-2 w-full text-left text-sm transition-colors duration-200 ${
                                                                        isSubSubSelected
                                                                          ? "text-black font-medium"
                                                                          : "text-gray-500 hover:text-black"
                                                                      }`}
                                                                    >
                                                                      {isSubSubSelected ? (
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                      ) : (
                                                                        <Circle className="w-3 h-3 text-gray-300" />
                                                                      )}
                                                                      {
                                                                        subsub.name
                                                                      }
                                                                    </motion.button>
                                                                  );
                                                                },
                                                              )}
                                                            </motion.div>
                                                          )}
                                                      </AnimatePresence>
                                                    </div>
                                                  );
                                                },
                                              )}
                                            </motion.div>
                                          )}
                                      </AnimatePresence>
                                    </motion.div>
                                  );
                                })}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0  pt-4">
                    <button
                      onClick={() => {
                        fetchProductsByCategory(
                          selectedCategory,
                          selectedSubcategory,
                          selectedSubSubcategory,
                          currentPage,
                          sortBy,
                          inStock,
                          [0, priceRange],
                        );
                        setShowMobileFilters(false);
                      }}
                      className="w-full bg-black text-white py-3 rounded-lg font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Sort Drawer */}
          <AnimatePresence>
            {showMobileSort && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden bottom-16"
                onClick={() => setShowMobileSort(false)}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Sort By</h3>
                    <button onClick={() => setShowMobileSort(false)}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowMobileSort(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg ${
                          option.value === sortBy
                            ? "bg-gray-100 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar - Stacked on top for mobile */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:block w-full lg:w-80"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 space-y-6"
              >
                {/* Clear Filters Header */}
                <div className="flex flex-col border-b border-gray-200 pb-3">
                  {/* Filters heading + Selected category badge */}
                  <div className="flex items-center justify-between">
                    {/* Filters heading */}
                    <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span>Filters</span>
                    </div>

                    {/* Selected Category Badge */}
                    {(selectedCategory ||
                      selectedSubcategory ||
                      selectedSubSubcategory) && (
                      <div className="flex items-center gap-1">
                        {selectedCategory && (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-medium truncate max-w-[10rem]">
                            {getCategoryName(selectedCategory)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Clear Filters Button */}
                  <AnimatePresence mode="wait">
                    {(selectedCategory ||
                      selectedSubcategory ||
                      selectedSubSubcategory ||
                      inStock ||
                      priceRange !== 100000) && (
                      <motion.button
                        key="clear-filters"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                          // 1) Reset filter state
                          setSelectedCategory(null);
                          setSelectedSubcategory(null);
                          setSelectedSubSubcategory(null);
                          setInStock(false);
                          setPriceRange(100000);

                          // 2) Reset sort AND persist empty sort to localStorage (uses your wrapper)
                          setSortBy(""); // this writes to localStorage via your wrapper

                          // 3) Reset pagination (this persists via setCurrentPage)
                          setCurrentPage(1);

                          // 4) Update URL to base products page (keeps history clean)
                          updateUrl("/products");

                          // 5) Fetch fresh results explicitly with cleared parameters
                          //    Pass explicit values to avoid relying on async state updates
                          fetchProductsByCategory(
                            null, // category
                            null, // subcategory
                            null, // subSubcategory
                            1, // page
                            "", // sortValue
                            false, // inStockValue
                            [1, 100000], // priceRange (default)
                            "", // searchQuery
                          );
                        }}
                        className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Clear filters</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Availability */}
                <div className="space-y-3 border- border-gray-200 b pb-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                    <PackageCheck className="w-4 h-4 text-gray-500" />
                    Availability
                  </div>

                  <motion.label
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all px-3 py-2 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      In Stock Only
                    </span>

                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-all ${
                          inStock ? "bg-emerald-500" : ""
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all ${
                            inStock ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.label>
                </div>

                {/* Price Filter - Redesigned */}
                <div className="space-y-4 border-b border-gray-200  pb-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                    <Filter className="w-4 h-4 text-gray-500" />{" "}
                    {/* Using Filter icon instead of Wallet */}
                    Price Range
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-700 font-medium font-odop">
                      <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {priceRange.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Max : ₹1,00,000
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="100"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer 
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-gray-700
        [&::-webkit-slider-thumb]:border-2
        [&::-webkit-slider-thumb]:border-white
        [&::-webkit-slider-thumb]:shadow-sm"
                    />

                    {/* <div className="flex justify-between text-xs text-gray-500">
                    <span>₹0</span>
                    <span>₹1L</span>
                  </div> */}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      fetchProductsByCategory(
                        selectedCategory,
                        selectedSubcategory,
                        selectedSubSubcategory,
                        currentPage,
                        sortBy,
                        inStock,
                        [0, priceRange],
                      )
                    }
                    className="w-full bg-gray-100 text-gray-800 py-2 px-3 rounded-md font-medium border border-gray-200 
      hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Apply Filters
                    <ArrowRightCircle className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>

                {/* Categories Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-4 sm:p-2"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-lg font-bold text-black uppercase tracking-wide">
                      Categories
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {loadingCategories
                      ? [...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="h-5 w-2/3 rounded bg-gray-200 animate-pulse"
                          />
                        ))
                      : categories.map((cat, index) => {
                          const isSelected = selectedCategory === cat.id;
                          return (
                            <motion.div
                              key={cat.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{
                                duration: 0.4,
                                delay: index * 0.05,
                              }}
                            >
                              {/* Category button */}
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  const isCatSelected =
                                    selectedCategory === cat.id;
                                  setSelectedCategory(
                                    isCatSelected ? null : cat.id,
                                  );
                                  handleCategorySelect(cat.slug, cat.id);
                                  setSelectedSubcategory(null);
                                  setSelectedSubSubcategory(null);
                                  fetchProductsByCategory(
                                    isCatSelected ? null : cat.id,
                                    null,
                                    null,
                                  );
                                }}
                                className={`flex items-center justify-between w-full px-1 py-1 text-sm font-medium transition-colors duration-300 group ${
                                  isSelected
                                    ? "text-black font-semibold"
                                    : "text-gray-600 hover:text-black"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                      isSelected
                                        ? "bg-black"
                                        : "bg-gray-400 group-hover:bg-black"
                                    }`}
                                  />
                                  <span>{cat.name}</span>
                                </div>
                                {cat.subcategories?.length > 0 && (
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform ${
                                      isSelected
                                        ? "rotate-180 text-black"
                                        : "text-gray-400"
                                    }`}
                                  />
                                )}
                              </motion.button>

                              {/* Subcategories */}
                              <AnimatePresence>
                                {isSelected &&
                                  cat.subcategories?.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="ml-4 mt-1 space-y-3"
                                    >
                                      {cat.subcategories.map(
                                        (sub, subIndex) => {
                                          const isSubSelected =
                                            selectedSubcategory === sub.id;
                                          return (
                                            <div key={sub.id}>
                                              <motion.button
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                  delay: subIndex * 0.03,
                                                }}
                                                onClick={() => {
                                                  const isSubSelected =
                                                    selectedSubcategory ===
                                                    sub.id;

                                                  if (isSubSelected) {
                                                    setSelectedSubcategory(
                                                      null,
                                                    );
                                                    router.push(
                                                      `/products/category/${cat.slug}`,
                                                    ); // go back to just category
                                                  } else {
                                                    handleSubcategorySelect(
                                                      cat.slug,
                                                      sub.slug,
                                                      sub.id,
                                                    );
                                                  }

                                                  fetchProductsByCategory(
                                                    selectedCategory,
                                                    isSubSelected
                                                      ? null
                                                      : sub.id,
                                                    null,
                                                  );
                                                }}
                                                className={`flex items-center gap-2 w-full text-left text-sm transition-colors duration-200 ${
                                                  isSubSelected
                                                    ? "text-black font-medium"
                                                    : "text-gray-500 hover:text-black"
                                                }`}
                                              >
                                                {isSubSelected ? (
                                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                  <Circle className="w-4 h-4 text-gray-300" />
                                                )}
                                                {decodeHtml(sub.name)}
                                                {sub.sub_subcategories?.length >
                                                  0 && (
                                                  <ChevronDown
                                                    className={`w-3 h-3 ml-auto ${
                                                      isSubSelected
                                                        ? "rotate-180 text-black"
                                                        : "text-gray-400"
                                                    }`}
                                                  />
                                                )}
                                              </motion.button>

                                              {/* Sub-Subcategories (products) */}
                                              <AnimatePresence>
                                                {isSubSelected &&
                                                  sub.sub_subcategories
                                                    ?.length > 0 && (
                                                    <motion.div
                                                      initial={{
                                                        opacity: 0,
                                                        height: 0,
                                                      }}
                                                      animate={{
                                                        opacity: 1,
                                                        height: "auto",
                                                      }}
                                                      exit={{
                                                        opacity: 0,
                                                        height: 0,
                                                      }}
                                                      transition={{
                                                        duration: 0.3,
                                                      }}
                                                      className="ml-6 mt-1 space-y-2"
                                                    >
                                                      {sub.sub_subcategories.map(
                                                        (subsub) => {
                                                          const isSubSubSelected =
                                                            selectedSubSubcategory ===
                                                            subsub.id;
                                                          return (
                                                            <motion.button
                                                              key={subsub.id}
                                                              whileHover={{
                                                                scale: 1.01,
                                                              }}
                                                              whileTap={{
                                                                scale: 0.99,
                                                              }}
                                                              onClick={() => {
                                                                const isSubSubSelected =
                                                                  selectedSubSubcategory ===
                                                                  subsub.id;
                                                                setSelectedSubSubcategory(
                                                                  isSubSubSelected
                                                                    ? null
                                                                    : subsub.id,
                                                                );

                                                                handleSubSubcategorySelect(
                                                                  cat.slug,
                                                                  sub.slug,
                                                                  subsub.slug,
                                                                  subsub.id,
                                                                );

                                                                fetchProductsByCategory(
                                                                  selectedCategory,
                                                                  selectedSubcategory,
                                                                  isSubSubSelected
                                                                    ? null
                                                                    : subsub.id,
                                                                );
                                                              }}
                                                              className={`flex items-center gap-2 w-full text-left text-sm transition-colors duration-200 ${
                                                                isSubSubSelected
                                                                  ? "text-black font-medium"
                                                                  : "text-gray-500 hover:text-black"
                                                              }`}
                                                            >
                                                              {isSubSubSelected ? (
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                              ) : (
                                                                <Circle className="w-3 h-3 text-gray-300" />
                                                              )}
                                                              {decodeHtml(
                                                                subsub.name,
                                                              )}
                                                            </motion.button>
                                                          );
                                                        },
                                                      )}
                                                    </motion.div>
                                                  )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        },
                                      )}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                  </div>
                </motion.div>
              </motion.div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1"
            >
              {/* Top Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 sm:mb-8">
                {/* Sort Dropdown */}
                <div
                  className="relative w-full sm:w-52 hidden lg:block z-40"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full rounded-xl border border-gray-200 bg-white/90 backdrop-blur-md py-2 px-4 pr-10 text-left shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:ring-1 focus:ring-[#A00300]/30 focus:border-[#A00300] text-xs sm:text-sm font-medium text-gray-800 flex items-center justify-between"
                  >
                    {selected}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute mt-1 w-full rounded-xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-lg z-20 overflow-hidden animate-fade-in">
                      {sortOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setIsOpen(false);
                          }}
                          className={`cursor-pointer px-4 py-2 text-xs sm:text-sm transition-all duration-150 ${
                            option.value === sortBy
                              ? "bg-[#FFF0EE] text-[#A00300] font-semibold"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="hidden lg:flex items-center justify-center sm:justify-end gap-1.5 py-3 w-full sm:w-auto">
                  {/* First Page */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronsLeft className="w-4 h-4 text-gray-600" />
                  </motion.button>

                  {/* Prev */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </motion.button>

                  {/* Pages */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                      const startPage = Math.max(
                        1,
                        Math.min(currentPage - 1, totalPages - 3),
                      );
                      const pageNumber = startPage + i;

                      return (
                        <motion.button
                          key={pageNumber}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-sm"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm"
                          }`}
                        >
                          {pageNumber}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Next */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </motion.button>

                  {/* Last Page */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronsRight className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Warehouse Info Section */}
              {warehouse && (
                <>
                  <style>{`
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .wh-card { animation: fadeSlideUp 0.5s ease both; }
      .wh-logo-wrap:hover img { transform: scale(1.04); }
      .wh-logo-wrap img { transition: transform 0.4s ease; }
    `}</style>

                  <div
                    className="wh-card relative flex flex-col md:flex-row overflow-hidden mb-8"
                    style={{
                      borderRadius: "20px",
                      boxShadow:
                        "0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,9,48,0.10), 0 0 0 1px rgba(0,9,48,0.07)",
                      background: "#ffffff",
                      minHeight: "240px",
                    }}
                  >
                    {/* LEFT PANEL */}
                    <div
                      className={`relative flex flex-col items-center justify-center overflow-hidden flex-shrink-0
          ${hasVideo ? "w-full md:w-[38%]" : "w-full md:w-[38%]"}`}
                      style={{
                        background: "#f7f7f8",
                        padding: "44px 32px",
                        minHeight: "240px",
                        borderRight: "1px solid rgba(0,9,48,0.07)",
                      }}
                    >
                      {/* Logo or Fallback Icon */}
                      <div
                        className="wh-logo-wrap flex items-center justify-center"
                        style={{
                          width: "100px",
                          height: "100px",
                          background: "#ffffff",
                          borderRadius: "10px",
                          boxShadow:
                            "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,9,48,0.08)",
                          border: "1px solid rgba(0,9,48,0.06)",
                        }}
                      >
                        {warehouse.store_logo ? (
                          <img
                            src={`https://marketplace.yuukke.com/assets/uploads/${warehouse.store_logo}`}
                            alt={warehouse.company_name || "Warehouse Logo"}
                            style={{
                              width: "68px",
                              height: "68px",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Store
                            size={36}
                            strokeWidth={1.5}
                            color="#000930"
                            style={{ opacity: 0.35 }}
                          />
                        )}
                      </div>

                      {/* Company name — video layout */}
                      {hasVideo && (
                        <p
                          className="text-center mt-5"
                          style={{
                            color: "#000930",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            opacity: 0.7,
                          }}
                        >
                          {warehouse.company_name}
                        </p>
                      )}

                      {/* Red rule */}
                      <div
                        style={{
                          marginTop: hasVideo ? "12px" : "16px",
                          width: "24px",
                          height: "2px",
                          borderRadius: "2px",
                          background: "#A00300",
                          opacity: 0.7,
                        }}
                      />
                    </div>

                    {/* RIGHT PANEL */}
                    <div
                      className="flex-1 flex flex-col justify-center"
                      style={{ padding: "36px 40px", background: "#fafafa" }}
                    >
                      {/* No-video: company name + address */}
                      {!hasVideo && (
                        <>
                          <div style={{ marginBottom: "4px" }}></div>

                          <h2
                            style={{
                              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                              fontWeight: 800,
                              color: "#000930",
                              letterSpacing: "-0.025em",
                              lineHeight: 1.2,
                              marginBottom: "20px",
                            }}
                            className="capitalize"
                          >
                            {warehouse.company_name}
                          </h2>

                          {/* Divider */}
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className="h-px w-10"
                              style={{
                                background:
                                  "linear-gradient(to right, #A00300, transparent)",
                              }}
                            />
                            <div
                              className="w-1.5 h-1.5 rotate-45 flex-shrink-0"
                              style={{ background: "#A00300" }}
                            />
                          </div>

                          <div className="flex items-start gap-3">
                            <div></div>
                          </div>
                        </>
                      )}

                      {/* Video layout */}
                      {hasVideo && (
                        <>
                          <div style={{ marginBottom: "14px" }}>
                            <span
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                letterSpacing: "0.2em",
                                textTransform: "uppercase",
                                color: "#A00300",
                              }}
                            >
                              About Us
                            </span>
                          </div>

                          <div
                            className="relative overflow-hidden"
                            style={{
                              borderRadius: "12px",
                              height: "210px",
                              boxShadow:
                                "0 2px 8px rgba(0,9,48,0.08), 0 0 0 1px rgba(0,9,48,0.06)",
                            }}
                          >
                            <video
                              autoPlay
                              muted
                              loop
                              playsInline
                              controls
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            >
                              <source
                                src={`https://marketplace.yuukke.com/assets/uploads/${warehouse.about_video}`}
                                type="video/mp4"
                              />
                            </video>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ✅ Modern Classic Offers Section */}
              {isOffersPage && (
                <div className="w-full my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Limited Time
                        </span>
                        <h2 className="text-3xl md:text-4xl  font-bold text-gray-950">
                          Today's Exclusive Deal
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Modern border effect on hover */}
                      <div className="">
                        <p className="text-gray-700 leading-relaxed">
                          Don't miss our special offers curated just for you.
                          Limited quantities available.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ⭐ Best Seller Section */}
              {isFestivalGifting && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Festive Gifting
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          Yuukke Hot Picks
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isWomensday && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Women's Day
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          Yuukke Sale-Week
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ⭐ Best Seller Section */}
              {isNewarrivalsPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCorporateEssentialsPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isMostSavedPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isWellnessPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isReturnGiftsPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isFeaturedPage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCorporatePage && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGetTitle9Page && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGetTitle10Page && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGetTitle11Page && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isGetTitle12Page && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Featured Collection
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          {title}
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Discover our most popular products, loved by thousands
                          of happy customers!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ⭐ BOGO Offers Section */}
              {isBogo && (
                <div className="w-full my-0 md:my-10 mb-4">
                  <div className="relative group">
                    {/* Decorative accent */}
                    <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>

                    {/* Content container */}
                    <div className="pl-4">
                      {/* Section header */}
                      <div className="flex flex-col space-y-1 mb-6">
                        <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                          Special Offers
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                          Buy More, Get More!
                        </h2>
                        <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          Explore our exciting deals — buy any product and enjoy
                          additional free items. Limited time only!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1.5 mb-10 w-full md:hidden">
                {/* First Page */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronsLeft className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Prev */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Pages */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                    const startPage = Math.max(
                      1,
                      Math.min(currentPage - 1, totalPages - 3),
                    );
                    const pageNumber = startPage + i;

                    return (
                      <motion.button
                        key={pageNumber}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-sm"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm"
                        }`}
                      >
                        {pageNumber}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Next */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Last Page */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronsRight className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                // 🧼 skeleton loader
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl bg-white overflow-hidden"
                    >
                      <div className="relative w-full h-40 md:h-56 rounded-2xl overflow-hidden mb-3 md:mb-4 bg-gray-200 animate-pulse"></div>
                      <div className="p-5">
                        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-1/3 bg-gray-200 rounded mt-3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                // ✅ show actual product grid
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={`grid gap-4 sm:gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product) => {
                    const isOutOfStock =
                      !product.quantity || Number(product.quantity) <= 0;

                    return (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        className={`group rounded-xl sm:rounded-3xl bg-white transition-all duration-300 overflow-hidden relative ${
                          isOutOfStock
                            ? "opacity-70 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {/* Wishlist Button */}
                        <div className="absolute top-3 right-3 flex gap-2 z-10">
                          <WishlistButton productId={product.id} />
                        </div>

                        <Link
                          href={
                            isOutOfStock ? "#" : `/products/${product.slug}`
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
                                src={getImageSrc(product.image)}
                                alt={product.name || "Image not found!"}
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
                            {/* ⭐ BOGO Tag with Flash */}
                            {product.bogo_offer && (
                              <div className="relative inline-block mb-2 font-odop">
                                <span className="bogo-badge">
                                  {product.bogo_offer || "Special BOGO!"}
                                </span>
                                <span className="bogo-flash"></span>
                              </div>
                            )}

                            <h3
                              className="text-xs sm:text-sm md:text-base  line-clamp-2 mb-1 capitalize"
                              style={{ minHeight: "2.75rem" }}
                            >
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between mt-1">
                              {product.promo_price &&
                              product.end_date &&
                              product.promotion == 1 &&
                              new Date(product.end_date) > new Date() ? (
                                <div className="flex justify-between w-full">
                                  <div className="flex flex-col">
                                    <div className="flex items-baseline gap-1.5 md:gap-2 text-[#a00030]">
                                      <p className="text-sm md:text-lg font-bold">
                                        ₹{" "}
                                        {Number(product.promo_price).toFixed(2)}
                                      </p>
                                      <p className="text-xs md:text-sm text-gray-400 line-through">
                                        ₹ {Number(product.price).toFixed(2)}
                                      </p>
                                    </div>
                                    <span className="mt-1 text-[10px] md:text-xs font-bold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg w-fit">
                                      {Math.round(
                                        ((Number(product.price) -
                                          Number(product.promo_price)) /
                                          Number(product.price)) *
                                          100,
                                      )}
                                      % OFF
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm md:text-lg font-medium text-gray-950">
                                  ₹ {Number(product.price).toFixed(2)}
                                </p>
                              )}
                            </div>

                            {/* ✅ Promo Tag (appears only if available) */}
                            {product.promo_tag && (
                              <div className="">
                                <span className="text-green-700 text-[10px] sm:text-sm italic font-semibold">
                                  {product.promo_tag}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                hasLoadedOnce &&
                products.length === 0 && (
                  <>
                    {/* ❌ No Products Found */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center p-4 text-center font-odop"
                    >
                      {/* Header row with image + title */}
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <h2 className="text-3xl font-bold text-gray-700">
                          We couldn’t find any matches
                        </h2>
                        <PackageSearch className="w-8 h-8 text-gray-700 opacity-80" />
                      </div>

                      {/* Description below */}
                      <p className="text-gray-500 max-w-3xl">
                        {/* We couldn’t find any products matching your search or
                        filters.  */}
                        Try adjusting your filters, searching for something
                        else, or explore our featured products below.
                      </p>
                    </motion.div>

                    {/* 🌟 Other Products */}
                    <div className="mt-8">
                      <OtherProductsGrid />
                    </div>
                  </>
                )
              )}
            </motion.main>
          </div>
        </div>
        {/* Pagination Section */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-end justify-end gap-1.5 mb-10 w-full px-4">
            {/* First Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronsLeft className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Prev */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Pages */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                const startPage = Math.max(
                  1,
                  Math.min(currentPage - 1, totalPages - 3),
                );
                const pageNumber = startPage + i;

                return (
                  <motion.button
                    key={pageNumber}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCurrentPage(pageNumber);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                      currentPage === pageNumber
                        ? "bg-gradient-to-r from-[#A00300] to-[#D44A47] text-white shadow-sm"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm"
                    }`}
                  >
                    {pageNumber}
                  </motion.button>
                );
              })}
            </div>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </motion.button>

            {/* Last Page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage(totalPages);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronsRight className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
        )}
      </div>
    </>
  );
}
