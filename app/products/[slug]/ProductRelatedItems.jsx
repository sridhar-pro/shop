"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/app/utils/variants";
import WishlistButton from "@/app/components/WishlistButton";
import { useTranslation } from "react-i18next";

export default function ProductRelatedItems({ product, DOMAIN_KEY }) {
  const { t } = useTranslation();

  if (!product.related_items?.length) return null;

  return (
    <section className="w-full border-t border-gray-100 pt-14 pb-20 px-6 bg-white">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="w-full mx-auto"
      >
        <div className="flex justify-between items-center mb-10 px-4">
          <h2 className="text-2xl font-semibold uppercase text-[#A00300] tracking-tight">
            {t("Related Products")}
          </h2>
          <Link
            href="/products"
            title="Browse all Products"
            className="text-sm font-medium text-gray-900 hover:underline flex items-center gap-1"
          >
            {t("View all")} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-24 gap-y-16 md:gap-y-20">
          {product.related_items.slice(1, 17).map((item) => {
            const availableQty =
              Array.isArray(item?.variants) && item.variants.length > 0
                ? Number(item.variants?.[0]?.variant_quantity || 0)
                : Number(item?.quantity || 0);

            const isOutOfStock = availableQty <= 0;

            const hasValidPromo =
              item?.promo_price !== null &&
              item?.promo_price !== undefined &&
              !isNaN(Number(item.promo_price)) &&
              Number(item.promo_price) > 0 &&
              Number(item.promo_price) < Number(item.price) &&
              item?.end_date &&
              new Date(item.end_date).getTime() > Date.now();

            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={`relative group flex flex-col transition ${
                  isOutOfStock ? "opacity-70" : ""
                }`}
                style={{ height: "100%" }}
              >
                {item.is_premium && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-[#A00300] to-[#D62D20] text-white text-[10px] font-bold px-2 py-[2px] rounded-tl-lg rounded-br-lg z-10">
                    {t("Premium")}
                  </span>
                )}

                <div className="absolute top-2 right-2 z-10">
                  <WishlistButton productId={item.id} variant="icon" />
                </div>

                {isOutOfStock ? (
                  <div className="block w-full overflow-hidden mb-2 cursor-not-allowed">
                    <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                      <Image
                        src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
                        alt={item.name}
                        title={item.name}
                        fill
                        className="object-contain opacity-80"
                      />
                      <div className="absolute inset-0 bg-white/10 z-30 rounded-2xl flex items-center justify-center">
                        <span className="bg-[#A00300] text-white text-sm font-bold px-3 py-1 rounded-lg">
                          Out of Stock
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/products/${item.slug}`}
                    title="Browse product"
                    className="block w-full overflow-hidden group mb-2"
                  >
                    <div className="relative w-full h-[220px] bg-[#fcfcfc]">
                      <Image
                        src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`}
                        alt={item.name}
                        title={item.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                )}

                <div className="flex flex-col ml-4">
                  <h4
                    className="text-sm text-gray-950 hover:text-[#A00300] transition-colors mb-1 capitalize
                      line-clamp-2 md:line-clamp-none"
                    style={{ maxWidth: "30ch", wordBreak: "break-word" }}
                  >
                    {item.name}
                  </h4>
                  {item.promo_tag && (
                    <div className="mb-1 md:mb-2">
                      <span className="text-green-700 text-[14px] sm:text-sm italic font-semibold">
                        {product.promo_tag}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline gap-1.5 flex-wrap">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-sm font-medium text-[#A00300]">
                        ₹
                        {hasValidPromo
                          ? Number(item.promo_price).toFixed(2)
                          : Number(item.price).toFixed(2)}
                      </p>
                      {hasValidPromo && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{Number(item.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    {hasValidPromo && (
                      <span className="text-[10px] font-medium text-red-600 ml-auto">
                        {Math.round(
                          ((Number(item.price) - Number(item.promo_price)) /
                            Number(item.price)) *
                            100,
                        )}
                        {t("% OFF")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
