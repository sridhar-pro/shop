"use client";
import Image from "next/image";
import Link from "next/link";
import { Store, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductStore({ product, DOMAIN_KEY }) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-200 pt-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
        <Store className="w-5 h-5 text-[#A00300] mr-2" />
        {t("Sold By")}
      </h2>

      <Link
        href={{
          pathname: "/products",
          query: {
            warehouses_id: product.store_details?.[0]?.slug || "",
          },
        }}
        title="Browse all Products"
        passHref
      >
        <div className="bg-[#fcfcfc] rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
          {product.store_details?.[0]?.store_logo && (
            <div className="w-full h-[320px] bg-gray-50 flex items-center justify-center px-6">
              <Image
                src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${product.store_details[0].store_logo}`}
                alt={product.store_details[0].company_name || "Store logo"}
                title={product.store_details[0].company_name || "Store logo"}
                width={640}
                height={519}
                className="object-contain w-full h-full"
              />
            </div>
          )}

          <div className="p-6 text-center">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {product.store_details?.[0]?.company_name || "Seller Information"}
            </h4>

            {(() => {
              const type = product.seller?.business_type;
              if (type === "2") {
                return (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {t("Verified Seller")}
                    </span>
                  </div>
                );
              }
              if (type === "3") {
                return (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 mr-2 text-[#A00300]" />
                    <span className="text-sm font-medium text-[#A00300]">
                      {t("Premium Seller")}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </Link>
    </div>
  );
}
