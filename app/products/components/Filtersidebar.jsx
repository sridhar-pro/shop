"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  PackageCheck,
  Filter,
  X,
  Circle,
  CheckCircle2,
  ArrowRightCircle,
  IndianRupee,
} from "lucide-react";
import { useRef } from "react";

export default function FilterSidebar({
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
  fetchProductsByCategory,
  setSortBy,
  setCurrentPage,
  updateUrl,
  router,
  onApplyFilters,
}) {
  const isClearingRef = useRef(false);
  const hasClearableFilter =
    selectedCategory ||
    selectedSubcategory ||
    selectedSubSubcategory ||
    inStock ||
    priceRange !== 100000;

  return (
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <span>Filters</span>
            </div>
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

          <AnimatePresence mode="wait">
            {hasClearableFilter && (
              <motion.button
                key="clear-filters"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  isClearingRef.current = true; // 🔥 ADD THIS

                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setSelectedSubSubcategory(null);
                  setInStock(false);
                  setPriceRange(100000);
                  // setSortBy("1nto");

                  // router.replace("/products");

                  router.replace("/products", { scroll: false });

                  onApplyFilters({
                    categoryId: null,
                    subcategoryId: null,
                    subSubcategoryId: null,
                    sortValue: "1nto",
                    inStockValue: false,
                    priceRangeVal: [1, 100000],
                    query: "",
                    warehousesId: "",
                  });
                }}
                className="flex items-center gap-1 mt-2 text-sm text-[#A00300] hover:text-gray-700 transition-colors"
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

        {/* Price Filter */}
        <div className="space-y-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
            <Filter className="w-4 h-4 text-gray-500" />
            Price Range
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-700 font-medium font-odop">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <IndianRupee className="w-3.5 h-3.5" />
                {priceRange.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500">Max : ₹1,00,000</span>
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
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              onApplyFilters({
                categoryId: selectedCategory,
                subcategoryId: selectedSubcategory,
                subSubcategoryId: selectedSubSubcategory,
                sortValue: sortBy,
                inStockValue: inStock,
                priceRangeVal: priceRange > 0 ? [0, priceRange] : [1, 100000],
                query: "",
                warehousesId: "",
              })
            }
            className="w-full bg-gray-100 text-gray-800 py-2 px-3 rounded-md font-medium border border-gray-200 
              hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
          >
            Apply Filters
            <ArrowRightCircle className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>

        {/* Categories */}
        <CategoryTree
          categories={categories}
          loadingCategories={loadingCategories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedSubSubcategory={selectedSubSubcategory}
          setSelectedCategory={setSelectedCategory}
          setSelectedSubcategory={setSelectedSubcategory}
          setSelectedSubSubcategory={setSelectedSubSubcategory}
          decodeHtml={decodeHtml}
          handleCategorySelect={handleCategorySelect}
          handleSubcategorySelect={handleSubcategorySelect}
          handleSubSubcategorySelect={handleSubSubcategorySelect}
          fetchProductsByCategory={fetchProductsByCategory}
          router={router}
        />
      </motion.div>
    </motion.aside>
  );
}

function CategoryTree({
  categories,
  loadingCategories,
  selectedCategory,
  selectedSubcategory,
  selectedSubSubcategory,
  setSelectedCategory,
  setSelectedSubcategory,
  setSelectedSubSubcategory,
  decodeHtml,
  handleCategorySelect,
  handleSubcategorySelect,
  handleSubSubcategorySelect,
  fetchProductsByCategory,
  router,
}) {
  return (
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
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  {/* Category button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const isCatSelected = selectedCategory === cat.id;
                      setSelectedCategory(isCatSelected ? null : cat.id);
                      handleCategorySelect(cat.slug, cat.id);
                      setSelectedSubcategory(null);
                      setSelectedSubSubcategory(null);
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
                          isSelected ? "rotate-180 text-black" : "text-gray-400"
                        }`}
                      />
                    )}
                  </motion.button>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {isSelected && cat.subcategories?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 mt-1 space-y-3"
                      >
                        {cat.subcategories.map((sub, subIndex) => {
                          const isSubSelected = selectedSubcategory === sub.id;
                          return (
                            <div key={sub.id}>
                              <motion.button
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: subIndex * 0.03 }}
                                onClick={() => {
                                  const isSubSel =
                                    selectedSubcategory === sub.id;
                                  if (isSubSel) {
                                    setSelectedSubcategory(null);
                                    router.push(
                                      `/products/category/${cat.slug}`,
                                    );
                                  } else {
                                    handleSubcategorySelect(
                                      cat.slug,
                                      sub.slug,
                                      sub.id,
                                    );
                                  }
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
                                {sub.sub_subcategories?.length > 0 && (
                                  <ChevronDown
                                    className={`w-3 h-3 ml-auto ${
                                      isSubSelected
                                        ? "rotate-180 text-black"
                                        : "text-gray-400"
                                    }`}
                                  />
                                )}
                              </motion.button>

                              {/* Sub-Subcategories */}
                              <AnimatePresence>
                                {isSubSelected &&
                                  sub.sub_subcategories?.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="ml-6 mt-1 space-y-2"
                                    >
                                      {sub.sub_subcategories.map((subsub) => {
                                        const isSubSubSelected =
                                          selectedSubSubcategory === subsub.id;
                                        return (
                                          <motion.button
                                            key={subsub.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => {
                                              const isSubSubSel =
                                                selectedSubSubcategory ===
                                                subsub.id;
                                              setSelectedSubSubcategory(
                                                isSubSubSel ? null : subsub.id,
                                              );
                                              handleSubSubcategorySelect(
                                                cat.slug,
                                                sub.slug,
                                                subsub.slug,
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
                                            {decodeHtml(subsub.name)}
                                          </motion.button>
                                        );
                                      })}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
      </div>
    </motion.div>
  );
}
