"use client";
import Image from "next/image";
import Link from "next/link";
import { Package, IndianRupee } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ProductSellerProducts({ product, DOMAIN_KEY }) {
  const { t } = useTranslation();

  if (!product.sellerproduct?.length) return null;

  return (
    <div className="border-t border-gray-200 pt-6 pb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center uppercase">
        <Package className="w-5 h-5 text-[#A00300] mr-2" />
        {t("More from this Seller")}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {product.sellerproduct.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            title={`View ${item.name}`}
            className="group"
          >
            <div className="relative flex flex-col h-full">
              {item?.promo_price !== null &&
                item?.promo_price !== undefined &&
                !isNaN(Number(item.promo_price)) &&
                Number(item.promo_price) > 0 &&
                Number(item.promo_price) < Number(item.price) &&
                item?.end_date &&
                new Date(item.end_date).getTime() > Date.now() && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-[2px] rounded z-10">
                    {Math.round(
                      ((Number(item.price) - Number(item.promo_price)) /
                        Number(item.price)) *
                        100,
                    )}
                    {t("% OFF")}
                  </div>
                )}

              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
                  alt={item.name}
                  title={item.name}
                  fill
                  className="object-cover w-full h-full transition-opacity group-hover:opacity-85"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 30vw, 20vw"
                />
              </div>

              <div className="p-3 flex flex-col justify-between h-full">
                <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {item.name}
                </h4>
                <div
                  className="flex items-center gap-1 text-sm text-gray-800 mt-auto leading-tight"
                  translate="no"
                >
                  <IndianRupee className="w-4 h-4 text-[#A00300]" />
                  {item.promo_price !== null &&
                  item.promo_price !== undefined &&
                  item.end_date &&
                  new Date(item.end_date) > new Date() &&
                  Number(item.promo_price) > 0 &&
                  Number(item.promo_price) < Number(item.price) ? (
                    <>
                      <span className="font-semibold text-[#A00300]">
                        {Number(item.promo_price).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {Number(item.price).toFixed(0)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-[#A00300]">
                      {Number(item.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
