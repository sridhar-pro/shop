"use client";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  scrollToTop = false,
}) {
  const handlePage = (page) => {
    setCurrentPage(page);
    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      {/* First Page */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePage(1)}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <ChevronsLeft className="w-4 h-4 text-gray-600" />
      </motion.button>

      {/* Prev */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </motion.button>

      {/* Page Numbers */}
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
              onClick={() => handlePage(pageNumber)}
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
        onClick={() => handlePage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </motion.button>

      {/* Last Page */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePage(totalPages)}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        <ChevronsRight className="w-4 h-4 text-gray-600" />
      </motion.button>
    </div>
  );
}
