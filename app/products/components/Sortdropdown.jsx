"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function SortDropdown({ sortOptions, sortBy, setSortBy }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

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

  return (
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
  );
}
