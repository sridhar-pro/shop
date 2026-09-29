"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StoreIcon } from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import CartSidebar from "@/app/components/CartSideBar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getImageSrc } from "./utils";
import Theme1 from "./Theme1";
import Theme2 from "./Theme2";
import Theme3 from "./Theme3";
import Theme4 from "./Theme4";
import Theme5 from "./Theme5";

// ══════════════════════════════════════════════════════════════
// ROOT PAGE COMPONENT  (unchanged logic)
// ══════════════════════════════════════════════════════════════
const SellerShopPage = () => {
  const { slug } = useParams();
  const { getValidToken } = useAuth();

  const [shopData, setShopData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        const token = await getValidToken();
        const body = {
          filters: {
            gifts_products: "",
            query: "",
            category: "",
            subcategory: "",
            sub_subcategory: "",
            brand: "",
            sorting: "name-asc",
            min_price: "1",
            max_price: "",
            in_stock: "0",
            page: "1",
            sort_by_v: "",
            limit: 24,
            offset: "0",
            warehouses_id: slug,
          },
        };
        const res = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to fetch shop data");
        const data = await res.json();
        if (!data?.warehouse || data?.warehouse?.warehouses_id === null) {
          setShopData(null);
          setProducts([]);
          setCategories([]);
          return;
        }
        setShopData({ ...data.warehouse });
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch (err) {
        console.error("❌ Error fetching shop data:", err);
        setShopData(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchShopData();
  }, [slug, getValidToken]);

  const videoSrc = shopData?.about_video
    ? getImageSrc(shopData.about_video)
    : null;
  const images = shopData
    ? [shopData.slider, shopData.slider2].filter(Boolean)
    : [];
  const media = [];
  if (videoSrc) media.push({ type: "video", src: videoSrc });
  images.forEach((img) => media.push({ type: "image", src: getImageSrc(img) }));
  const hasMedia = media.length > 0;
  const currentMedia = media[currentIndex];

  useEffect(() => {
    if (media.length <= 1 || currentMedia?.type === "video") return;
    const timer = setTimeout(
      () => setCurrentIndex((p) => (p + 1) % media.length),
      5000,
    );
    return () => clearTimeout(timer);
  }, [currentIndex, media, currentMedia]);

  // ── Skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] animate-pulse">
        {/* Categories */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="h-3 w-24 mx-auto rounded-full bg-[#ddd6cf]" />
            <div className="h-10 w-72 mx-auto rounded-lg bg-[#e2ddd7] mt-5" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] rounded-3xl bg-[#ebe6e0]" />
                <div className="h-5 w-24 mx-auto mt-5 rounded-full bg-[#ddd6cf]" />
              </div>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="h-3 w-24 mx-auto rounded-full bg-[#ddd6cf]" />
              <div className="h-12 w-80 mx-auto rounded-lg bg-[#e2ddd7] mt-5" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-[4/5] rounded-2xl bg-[#f1ede8]" />

                  <div className="mt-5 space-y-3">
                    <div className="h-5 w-4/5 rounded-full bg-[#ddd6cf]" />
                    <div className="h-5 w-20 rounded-full bg-[#e5dfd8]" />

                    <div className="pt-3">
                      <div className="w-11 h-11 rounded-full bg-[#e6e0da]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1a1a] py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#3b3b3b]" />
              <div className="h-4 w-28 bg-[#444] rounded-full mt-8" />
              <div className="h-10 w-72 bg-[#383838] rounded-lg mt-5" />
            </div>

            <div className="grid md:grid-cols-2 gap-16 mt-20">
              <div className="space-y-4">
                <div className="h-4 w-full bg-[#353535] rounded" />
                <div className="h-4 w-5/6 bg-[#353535] rounded" />
                <div className="h-4 w-4/6 bg-[#353535] rounded" />
              </div>

              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#3b3b3b]" />
                    <div className="h-4 flex-1 rounded bg-[#353535]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ── Shop not found ──
  if (!shopData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 py-16 font-odop">
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[20px] w-full max-w-md px-10 py-12 text-center shadow-sm">
          <div className="w-[72px] h-[72px] rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-7">
            <StoreIcon className="w-7 h-7 text-gray-400 dark:text-zinc-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full px-3 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-xs text-gray-500 dark:text-zinc-400 tracking-wide">
              Store unavailable
            </span>
          </div>
          <h1 className="text-[22px] font-medium text-gray-900 dark:text-white tracking-tight leading-snug mb-2">
            This store isn't available
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            The store you're looking for may have moved, been paused, or doesn't
            exist. Check the link or try again later.
          </p>
          <div className="border-t border-gray-100 dark:border-zinc-800 mb-8" />
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full py-3 rounded-[10px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Go to home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-[10px] border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const palette = {
    theme_color: shopData.theme_color,
    text_color: shopData.text_color,
    secondary_text_color: shopData.secondary_text_color,
    section1_color: shopData.section1_color,
    section1_color2: shopData.section1_color2,
    section2_color: shopData.section2_color,
    section2_color2: shopData.section2_color2,
    section3_color: shopData.section3_color,
    section3_color2: shopData.section3_color2,
  };

  const sharedProps = {
    shopData,
    palette,
    products,
    categories,
    media,
    hasMedia,
    currentIndex,
    setCurrentIndex,
    currentMedia,
    loadingProductId,
    setLoadingProductId,
    cartItems,
    setCartItems,
    isCartOpen,
    setIsCartOpen,
    getValidToken,
  };

  const themeType = Number(shopData.theme_type);

  return (
    <>
      {themeType === 2 && <Theme2 {...sharedProps} />}
      {themeType === 3 && <Theme3 {...sharedProps} />}
      {themeType === 4 && <Theme4 {...sharedProps} />}
      {themeType === 5 && <Theme5 {...sharedProps} />}

      {(shopData.theme_type === null || themeType === 1) && (
        <Theme1 {...sharedProps} />
      )}

      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setIsCartOpen(false)}
          />

          <CartSidebar
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            setCartItems={setCartItems}
          />
        </>
      )}
    </>
  );
};

export default SellerShopPage;
