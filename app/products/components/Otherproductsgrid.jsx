"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

function getImageSrc(image) {
  if (!image) return "/fallback.png";
  if (image.startsWith("http") || image.startsWith("/")) return image;
  const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

export default function OtherProductsGrid() {
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
              page: "2",
              limit: 12,
              min_price: "1",
              max_price: "0",
              sort_by_v: "1bs",
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
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[1px] bg-gray-200"></div>

        <h2 className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-semibold text-[#000930]">
          {/* <Gift className="w-4 h-4 text-[#A00300]" /> */}
          You Might Like
        </h2>

        <div className="flex-1 h-[1px] bg-gray-200"></div>
      </div>

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
                title={
                  isOutOfStock
                    ? `${product.name} is Out of Stock`
                    : `View ${product.name}`
                }
                className={`group rounded-xl sm:rounded-3xl bg-white transition-all duration-300 overflow-hidden relative ${
                  isOutOfStock
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <div className="relative w-full h-32 sm:h-40 md:h-56 rounded-lg sm:rounded-2xl overflow-hidden mb-2 sm:mb-3 md:mb-4 group">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    title={product.name}
                    className={`object-contain w-full h-full ${
                      isOutOfStock ? "blur-[1.5px]" : ""
                    }`}
                  />

                  {/* Out of Stock Badge */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-[#A00300] text-white text-[10px] sm:text-xs md:text-sm font-bold px-3 py-1 rounded-md shadow-lg">
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5">
                  <h2 className="text-xs sm:text-sm md:text-base font-medium line-clamp-2 mb-1 capitalize">
                    {product.name}
                  </h2>
                  <div className="flex items-center justify-between mt-1">
                    {product.promo_price &&
                    product.end_date &&
                    product.promotion &&
                    new Date(product.end_date + "T23:59:59") >= new Date() ? (
                      <div className="flex justify-between w-full">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-1.5 md:gap-2 text-[#a00030]">
                            <p className="text-sm md:text-lg font-semibold">
                              ₹{Number(product.promo_price).toFixed(2)}
                            </p>
                            <p className="text-xs md:text-sm text-gray-400 line-through">
                              ₹{Number(product.price).toFixed(2)}
                            </p>
                          </div>
                          <span className="mt-1 text-[10px] md:text-xs font-semibold text-red-600 bg-transparent md:bg-green-100 px-1.5 md:px-2 py-[1px] md:py-0.5 rounded-lg w-fit">
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
                      <p className="text-sm md:text-lg font-semibold text-gray-950">
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
}
