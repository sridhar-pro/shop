"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown as ChevronDownIcon,
  PackageCheck as PackageCheckIcon,
  Filter as FilterIcon,
  X as XIcon,
  Circle as CircleIcon,
  CheckCircle2 as CheckCircle2Icon,
  IndianRupee as IndianRupeeIcon,
  ArrowUpDown as ArrowUpDownIcon,
} from "lucide-react";

export function MobileActionButtons({
  selectedCategory,
  inStock,
  priceRange,
  onOpenFilters,
  onOpenSort,
}) {
  return (
    <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50">
      <div className="flex w-full">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenFilters}
          className="bg-white shadow-lg px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-200 flex-1 relative"
        >
          <FilterIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {(selectedCategory || inStock || priceRange !== 100000) && (
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
          )}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSort}
          className="bg-white shadow-lg px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-200 flex-1"
        >
          <ArrowUpDownIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Sort</span>
        </motion.button>
      </div>
    </div>
  );
}

export function MobileFilterDrawer({
  show,
  onClose,
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
  fetchProductsByCategory,
  setSortBy,
  setCurrentPage,
  updateUrl,
  currentPage,
  sortBy,
  onApplyFilters,
}) {
  const hasClearableFilter =
    selectedCategory ||
    selectedSubcategory ||
    selectedSubSubcategory ||
    inStock ||
    priceRange !== 100000;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden bottom-16"
          onClick={onClose}
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
              <div className="flex flex-col border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm sm:text-base">
                    <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span>Filters</span>
                  </div>
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
                <AnimatePresence mode="wait">
                  {hasClearableFilter && (
                    <motion.button
                      key="clear-filters"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedSubcategory(null);
                        setSelectedSubSubcategory(null);
                        setInStock(false);
                        setPriceRange(100000);
                        setSortBy("");
                        setCurrentPage(1);
                        updateUrl("/products");
                        fetchProductsByCategory(
                          null,
                          null,
                          null,
                          1,
                          "",
                          false,
                          [1, 100000],
                          "",
                        );
                      }}
                      className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                      <span>Clear filters</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={onClose}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="space-y-6">
              <div className="space-y-3 border-b border-gray-200 pb-4">
                {/* Availability */}
                <div className="space-y-3 border- border-gray-200 b pb-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                    <PackageCheckIcon className="w-4 h-4 text-gray-500" />
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
                  <div className="space-y-4 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                      <FilterIcon className="w-4 h-4 text-gray-500" />
                      Price Range
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm text-gray-700 font-medium font-odop">
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          <IndianRupeeIcon className="w-3.5 h-3.5" />
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

                {/* Mobile Categories */}
                <div className="space-y-0">
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
                                    <ChevronDownIcon
                                      className={`w-4 h-4 transition-transform ${
                                        isSelected
                                          ? "rotate-180 text-black"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  )}
                                </motion.button>

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
                                                  initial={{
                                                    opacity: 0,
                                                    x: -5,
                                                  }}
                                                  animate={{ opacity: 1, x: 0 }}
                                                  transition={{
                                                    delay: subIndex * 0.03,
                                                  }}
                                                  onClick={() => {
                                                    const isSubSel =
                                                      selectedSubcategory ===
                                                      sub.id;
                                                    setSelectedSubcategory(
                                                      isSubSel ? null : sub.id,
                                                    );
                                                    setSelectedSubSubcategory(
                                                      null,
                                                    );
                                                    fetchProductsByCategory(
                                                      selectedCategory,
                                                      isSubSel ? null : sub.id,
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
                                                    <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                                                  ) : (
                                                    <CircleIcon className="w-4 h-4 text-gray-300" />
                                                  )}
                                                  {sub.name}
                                                  {sub.sub_subcategories
                                                    ?.length > 0 && (
                                                    <ChevronDownIcon
                                                      className={`w-3 h-3 ml-auto ${
                                                        isSubSelected
                                                          ? "rotate-180 text-black"
                                                          : "text-gray-400"
                                                      }`}
                                                    />
                                                  )}
                                                </motion.button>

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
                                                                  <CheckCircle2Icon className="w-3 h-3 text-emerald-600" />
                                                                ) : (
                                                                  <CircleIcon className="w-3 h-3 text-gray-300" />
                                                                )}
                                                                {subsub.name}
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

            <div className="sticky bottom-0 pt-4">
              <button
                onClick={onApplyFilters}
                className="w-full bg-black text-white py-3 rounded-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MobileSortDrawer({
  show,
  onClose,
  sortOptions,
  sortBy,
  setSortBy,
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden bottom-16"
          onClick={onClose}
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
              <button onClick={onClose}>
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value);
                    onClose();
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
  );
}
