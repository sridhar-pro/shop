"use client";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ProductDescription({
  product,
  isShort,
  limitedText,
  showFullDesc,
  setShowFullDesc,
}) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-xl text-gray-900 mb-4 flex items-center uppercase">
        <Info className="w-5 h-5 text-[#A00300] mr-1 mb-1" />
        {t("Product Details")}
      </h2>
      <div className="prose prose-lg max-w-none">
        {isShort ? (
          <div
            className="text-gray-700 space-y-4 text-justify"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : showFullDesc ? (
          <>
            <div
              className="text-gray-700 space-y-4 text-justify"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            <button
              onClick={() => setShowFullDesc(false)}
              className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
            >
              {t("Read Less")}
              <ChevronUp className="w-4 h-4 ml-1" />
            </button>
          </>
        ) : (
          <>
            <div className="text-gray-700 space-y-4 text-justify">
              {limitedText}
            </div>
            <button
              onClick={() => setShowFullDesc(true)}
              className="mt-2 text-sm text-[#A00300] font-medium hover:underline flex items-center"
            >
              {t("Read More")}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
