"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Menu,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../SearchBar";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingCart } from "lucide-react";
import CartSidebar from "../CartSideBar";
import { useAuth } from "@/app/utils/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import LogoutButton from "../Logout";
import { useSession } from "@/app/context/SessionContext";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function Navbar() {
  const { t } = useTranslation();

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const pathname = usePathname();

  const { itemCount } = useCart();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOdopOpen, setIsOdopOpen] = useState(false);

  const { getValidToken, isAuthReady } = useAuth();
  const { isLoggedIn } = useSession();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isAuthReady) return;

    let retryTimeout;

    const CACHE_KEY = "navbar_news";

    // ✅ 1. Load from sessionStorage instantly
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.length > 0) {
          setMessages(parsed); // ⚡ instant UI
        }
      } catch (e) {
        console.warn("Cache parse failed");
      }
    }

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async () => {
      for (let i = 0; i < 5; i++) {
        const token = await getValidToken();
        if (token) return token;
        await wait(300);
      }
      return null;
    };

    const fetchNews = async (retryCount = 0) => {
      try {
        const token = await getTokenWithRetry();

        if (!token) {
          if (retryCount < 3) {
            retryTimeout = setTimeout(() => {
              fetchNews(retryCount + 1);
            }, 1000);
          }
          return;
        }

        const res = await fetch("/api/getNews", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // 🔥 FIX START
        if (res.status === 401 && retryCount < 2) {
          localStorage.removeItem("authToken");

          await wait(300); // small delay
          return fetchNews(retryCount + 1);
        }
        // 🔥 FIX END

        if (!res.ok) throw new Error("Failed to fetch news");

        const data = await res.json();

        const cleaned = data
          .map((item) => {
            const div = document.createElement("div");
            div.innerHTML = item.news || "";
            return div.textContent || div.innerText || "";
          })
          .filter(Boolean);

        if (cleaned.length > 0) {
          setMessages(cleaned);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(cleaned));
        }
      } catch (err) {
        console.error("❌ News fetch error:", err);
      }
    };

    fetchNews();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isAuthReady]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [productCategories, setProductCategories] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const toggleCart = () => {
    const storedCart = localStorage.getItem("cart_data");
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      const cartString = JSON.stringify(cartItems);
      const newCartString = JSON.stringify(parsed);

      if (cartString !== newCartString) {
        setCartItems(parsed);
      }
    }

    setIsCartOpen((prev) => !prev);
  };

  const router = useRouter();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setIsProductsOpen(false);
        setIsOdopOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/homeCategory");

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return;
        }

        const data = await res.json();
        if (!data) return;

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/thumbs/${cat.image}`,
          slug: cat.slug,
          subcategories: cat.subcategories || [],
        }));

        setProductCategories(mapped);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Marquee navigation handlers
  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  useEffect(() => {
    if (messages.length < 2) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [messages, handleNext]);

  return (
    <>
      {/* Top Marquee */}
      <div
        className="bg-black text-white text-[10px] md:text-sm lg:text-base h-16 md:h-10 flex items-center justify-center  relative overflow-hidden font-odop"
        translate="no"
      >
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          className="absolute left-4 bg-gray-200 text-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>

        {/* Message */}
        <div className="relative w-full max-w-[300px] md:max-w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute text-center px-4"
            >
              {messages[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 bg-gray-200 text-black w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all"
        >
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#f9f9f959] shadow-sm px-0 lg:px-6 py-3 top-0 z-[100] font-odop">
        <div className="px-3 flex justify-around md:justify-between items-center mt-0 md:mt-5 mb-0 md:mb-5">
          {/* Logo */}
          <Link href="/" title="Yuukke Home" className="flex items-center">
            <div className="relative w-[135px] h-[50px] lg:w-[170px] lg:h-[45px]">
              <Image
                src="/new-logo.png"
                alt="Yuukke Eco-Friendly Marketplace Logo"
                title="Yuukke - Eco-Friendly Fashion, Home & Beauty Marketplace"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links – zoom-friendly */}
          <div className="hidden md:flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-6 text-sm md:text-base  text-neutral-600 mt-2 tracking-wider">
            {/* Products Dropdown */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Products Dropdown - Updated to use group-hover like ODOP */}
              <div className="relative group">
                <Link
                  href="/products"
                  title="Yuukke Products"
                  className="group transition-all flex items-center gap-1 py-2 px-1  text-gray-700 hover:text-[#A00300] cursor-pointer"
                >
                  {t("Products")}
                  <ChevronDown className="w-4 h-4 mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                <div className="absolute left-0 top-full mt-1 w-[42rem] bg-white border border-gray-100 rounded-xl shadow-xl z-[100] p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out ">
                  {productCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                      {productCategories.map((category) => (
                        <Link
                          key={category.id || category.slug}
                          href={`/products/category/${category.slug}`}
                          title={`${category.name} Products`}
                          className="group flex flex-col items-center hover:bg-gray-50 rounded-lg p-4 transition-all duration-200"
                        >
                          {/* 🔹 Category Image/Icon */}
                          <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                            <img
                              src={category.image || "/placeholder.png"}
                              alt={category.name}
                              title={`${category.name} Products on Yuukke`}
                              className="w-12 h-12 object-contain"
                            />
                          </div>

                          {/* 🔹 Category Name */}
                          <span className="text-sm  text-gray-800 group-hover:text-black text-center">
                            {category.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center py-8 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-100"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-300 animate-pulse delay-200"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Offers */}
              <Link
                href={{ pathname: "/products/offers" }}
                title="Yuukke Offers"
                className="transition-all py-2 px-1  text-gray-700 hover:text-[#A00300] shrink-0 whitespace-nowrap"
              >
                {t("Offers")}
              </Link>

              {/* Personalized Gifting */}
              <Link
                href={{ pathname: "/products/festival-gifting" }}
                title="Yuukke Gifting"
                className="transition-all py-2 px-1  text-gray-700  hover:text-[#A00300] shrink-0 whitespace-nowrap"
              >
                {t("Personalized Gifting")}
              </Link>

              {/* Corporate Gifting (badge kept subtle on tight widths) */}
              <Link
                href="https://gift.yuukke.com/#featured-products"
                title="Yuukke Gifting"
                aria-label="Corporate Gifting – Premium, Classic"
                className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full  text-gray-700 hover:text-[#A00300] transition-all duration-200 group shrink-0 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">
                  {t("Corporate Gifting")}
                </span>
              </Link>

              {/* Sherise */}
              {/* <Link
                href="/sherise"
                className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full  text-[#A00300] hover:text-[#180d0d] transition-all duration-200 group shrink-0 whitespace-nowrap"
              >
                
                <span className="absolute -top-3 left-12 inline-flex items-center gap-1 rounded-full bg-red-50 text-[#A00300] text-[10px] font-bold px-2 py-0.5 ring-1 ring-red-200 shadow-sm animate-bounce ">
                  <Flame className="w-3 h-3" />
                  SALE
                </span>
                <span className="whitespace-nowrap font-medium">
                  {t("Sherise-Week")}
                </span>
              </Link> */}

              {/* Track Order */}
              <Link
                href="/track-order"
                title="Track your Yuukke Orders"
                className="transition-all py-2 px-1 text-gray-700 hover:text-gray-900 shrink-0 whitespace-nowrap"
              >
                {t("Track Order")}
              </Link>
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2 ml-3 md:ml-0">
            <div className="hidden md:flex space-x-6">
              <SearchBar />

              {/* Profile/Login */}

              <div className="relative" ref={dropdownRef}>
                {!isLoggedIn ? (
                  <Link
                    href={
                      pathname && pathname !== "/login"
                        ? `/login?from=${encodeURIComponent(pathname)}`
                        : "/login"
                    }
                    title="Login to your Yuukke account"
                    aria-label="Profile"
                    className="rounded-full hover:bg-gray-100 p-2 transition flex items-center justify-center w-full h-full"
                  >
                    <User className="w-5 h-5 text-black cursor-pointer" />
                  </Link>
                ) : (
                  <div className="relative flex items-center gap-2 z-50">
                    {/* Regular Profile Icon */}
                    <div className="relative">
                      <button
                        onClick={() => setOpen((prev) => !prev)}
                        className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shadow-md hover:bg-gray-300 transition"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                      </button>

                      {open && (
                        <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg z-50">
                          <Link
                            href="/orders"
                            title="Your Yuukke Orders"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                            onClick={() => setOpen(false)}
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <div className="border-t my-1" />
                          <div className="px-0 py-2 hover:bg-gray-100 transition">
                            <LogoutButton />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Dashboard Icon for group_id 4 */}
                    {Number(localStorage.getItem("group_id")) === 4 && (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("access_token");
                          if (token) {
                            window.location.href = `https://marketplace.${DOMAIN_KEY}.com/Oauth/tLogin/${token}`;
                          } else {
                            alert("Access token missing. Please login again.");
                          }
                        }}
                        aria-label="Dashboard"
                        className="w-9 h-9 rounded-full bg-[#a00300] flex items-center justify-center shadow-md hover:bg-red-900 transition"
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 🌐 Language Switcher (Lucide Globe) */}
              <LanguageSwitcher />

              {/* Wishlist */}
              <a
                href={!isLoggedIn ? "/login" : "/orders?tab=Wishlist"}
                title={
                  !isLoggedIn ? "Login to View Wishlist" : "View Your Wishlist"
                }
                aria-label="Favorites"
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Heart className="w-5 h-5 text-black" />
              </a>

              {/* Cart */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-5 h-5 text-black cursor-pointer" />

                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-[6px] min-w-[18px] h-[18px] flex items-center justify-center shadow-md leading-none font-odop">
                    {itemCount}
                  </span>
                )}
              </button>
              <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                setCartItems={setCartItems}
              />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2 px-2 py-1.5">
              {/* ✅ Search bar takes flexible width */}
              <div className="flex-1">
                <SearchBar />
              </div>

              {/* ✅ Language Switcher */}
              <div className="flex-shrink-0">
                <LanguageSwitcher />
              </div>

              {/* ✅ Cart Icon */}
              <button
                aria-label="Cart"
                className="p-2 hover:bg-gray-100 rounded-full transition relative"
                onClick={toggleCart}
              >
                <ShoppingCart className="w-4 h-4 text-black" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px]  rounded-full px-[6px] min-w-[18px] h-[18px] flex items-center justify-center shadow-md leading-none font-odop">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* ✅ Cart Sidebar */}
              {isCartOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
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

              {/* ✅ Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-900" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden mt-4 px-4 space-y-2 text-lg text-gray-700"
          >
            <div className="block py-1">
              <button
                onClick={() => setIsProductsOpen(!isProductsOpen)}
                className="w-full text-left hover:text-black transition"
              >
                {t("Products")}
                {isProductsOpen ? "▲" : "▼"}
              </button>
              {isProductsOpen && (
                <div className="ml-4 mt-2 space-y-0 text-gray-600">
                  {productCategories.map((category) => (
                    <Link
                      key={category.id || category.slug}
                      href={`/products/category/${category.slug}`}
                      title={`${category.name} Products`}
                      className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-md rounded"
                      onClick={() => {
                        setIsProductsOpen(false);
                        setMobileMenuOpen(false); // Add this to close the entire menu
                      }}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Offers Link */}
            <Link
              href={{
                pathname: "/products/offers", // dedicated offers route
              }}
              title="Yuukke Offers"
              className="block py-1 hover:text-black transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Offers")}
            </Link>

            {/* Best-sellers Link */}
            <Link
              href={{
                pathname: "/products/festival-gifting", // dedicated offers route
              }}
              title="Yuukke Gifting"
              className="block py-1 hover:text-black transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Personalized Gifting")}
            </Link>

            {/* Offers Link */}
            <Link
              href="https://gift.yuukke.com/#featured-products"
              title="Yuukke Gifting"
              aria-label="Corporate Gifting – Premium, Classic"
              className="
    relative items-center
    gap-2 px-1 py-2 rounded-full
     text-gray-700
   
    active:translate-y-0
    transition-all duration-200 group
    block 
  "
            >
              {/* HOT badge */}
              {/* <span
                className="
      absolute -top-3 left-36
      inline-flex items-center gap-1
      rounded-full bg-red-50 text-[#A00300]
      text-[12px] font-bold px-2 py-0.5
      ring-1 ring-red-200 shadow-sm animate-bounce
    "
              >
                <Flame className="w-4 h-4" />
                HOT
              </span> */}

              {/* Text */}
              <span className="whitespace-nowrap">Corporate Gifting</span>

              {/* Right sparkle */}
              {/* <Sparkle className="w-4 h-4 opacity-90 group-hover:rotate-12 transition-transform" /> */}

              {/* Attention dot */}
              <span className="absolute -left-1.5 top-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white/90"></span>
                </span>
              </span>
            </Link>

            {/* Sherise – Premium */}
            {/* <Link
              href={{
                pathname: "/sherise", // dedicated offers route
              }}
              onClick={() => setMobileMenuOpen(false)}
              className="relative inline-flex items-center gap-2 px-2 py-2 mt-2 rounded-full  text-gray-600 hover:text-[#A00300] transition-all duration-200 group shrink-0 whitespace-nowrap"
            >
            
              <span className="absolute -top-3 left-12 inline-flex items-center gap-1 rounded-full bg-red-50 text-[#A00300] text-[10px] font-bold px-2 py-0.5 ring-1 ring-red-200 shadow-sm animate-bounce ">
                <Flame className="w-3 h-3" />
                SALE
              </span>
              <span className="whitespace-nowrap font-medium">
                {t("Sherise-Week")}
              </span>
            </Link> */}

            {/* Tracking Link */}
            <Link
              href="/track-order"
              title="Track your Yuukke Orders"
              className="transition-all py-2 px-1  text-gray-700 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("Track Order")}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
