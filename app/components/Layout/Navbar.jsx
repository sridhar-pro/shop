"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings,
  X,
  ShoppingBag,
  Percent,
  Gift,
  Building2,
  Truck,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { User, Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";
import { useTranslation } from "react-i18next";
import LogoutButton from "../Logout";
import { useSession } from "@/app/context/SessionContext";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const MobileSearchBar = dynamic(() => import("../MobileSearchBar"), {
  ssr: false,
});

const SearchBar = dynamic(() => import("../SearchBar"), {
  ssr: false,
});

const CartSidebar = dynamic(() => import("../CartSideBar"), {
  ssr: false,
});

const LanguageSwitcher = dynamic(() => import("./LanguageSwitcher"), {
  ssr: false,
});

// ─── Animation variants ────────────────────────────────────────────────────
const mobileMenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.32, ease: [0.32, 0, 0.67, 0] },
      opacity: { duration: 0.18, ease: "easeIn" },
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.38, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.22, ease: "easeOut", delay: 0.04 },
    },
  },
};

const subGridVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.24, ease: [0.32, 0, 0.67, 0] },
      opacity: { duration: 0.14 },
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
      opacity: { duration: 0.18, delay: 0.06 },
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

// Shared timing for the marquee <-> navbar slide so they move in perfect lockstep
const SCROLL_TRANSITION = "transform 500ms ease-in-out";
// ───────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { t } = useTranslation();

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const pathname = usePathname();
  const hideMobileSearchBar =
    pathname === "/login" ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/checkout");

  const { itemCount } = useCart();

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [groupId, setGroupId] = useState(null);

  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOdopOpen, setIsOdopOpen] = useState(false);

  const { getValidToken, isAuthReady } = useAuth();
  const { isLoggedIn } = useSession();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let rafId = null;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = requestAnimationFrame(() => {
        setIsScrolled((prev) => {
          const y = window.scrollY;
          // small hysteresis band avoids rapid true/false flicker right at the threshold
          if (prev && y < 4) return false;
          if (!prev && y > 12) return true;
          return prev;
        });
        ticking = false;
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    setGroupId(Number(localStorage.getItem("group_id")));
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    let retryTimeout;

    const CACHE_KEY = "navbar_news";

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.length > 0) {
          setMessages(parsed);
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

        if (res.status === 401 && retryCount < 2) {
          localStorage.removeItem("authToken");
          await wait(300);
          return fetchNews(retryCount + 1);
        }

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
  // NEW: dedicated ref for the hamburger/X button so the outside-click
  // handler can tell "clicked the toggle" apart from "clicked elsewhere"
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
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
        const res = await fetch("/api/newHomeCategory");

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return;
        }

        const data = await res.json();
        if (!data) return;

        const mapped = data.map((cat) => ({
          name: cat.name,
          image: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${cat.image}`,
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
      setDirection(1);
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setIsProductsOpen(false);
    setIsOdopOpen(false);
  };

  return (
    <>
      {/* Header spacer / layout container */}
      <div className="h-[118px] md:h-[124px]">
        {/* Top Marquee */}
        <div
          className={`relative flex h-12 items-center justify-center overflow-hidden bg-black font-odop text-[11px] text-white transition-transform duration-500 ease-in-out will-change-transform md:h-9 md:text-xs lg:text-sm ${
            isScrolled
              ? "-translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
          style={{ transitionProperty: "transform, opacity" }}
          translate="no"
        >
          <div className="relative flex w-full max-w-[70%] items-center justify-center md:max-w-[80%]">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`${index}-${messages[index]}`}
                custom={direction}
                variants={{
                  enter: (direction) => ({
                    y: direction > 0 ? 14 : -14,
                    opacity: 0,
                  }),
                  center: {
                    y: 0,
                    opacity: 1,
                  },
                  exit: (direction) => ({
                    y: direction > 0 ? -14 : 14,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  y: {
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  },
                  opacity: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                className="absolute inset-x-0 flex items-center justify-center truncate px-4 text-center"
              >
                {messages[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Main Navbar — always fixed top-0, slid with translateY so it moves
            in lockstep with the marquee above (both are compositor-only
            transform animations, so there's no more layout-thread lag) */}
        <nav
          className={`fixed left-0 right-0 top-0 z-[70] border-b border-black/5 font-odop transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-in-out will-change-transform ${
            isScrolled
              ? "translate-y-0 bg-[#f9f9f9]/75 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-[#f9f9f9]/60"
              : "translate-y-[48px] bg-[#f9f9f9] shadow-sm md:translate-y-[36px]"
          }`}
          style={{
            transitionProperty:
              "transform, background-color, box-shadow, backdrop-filter",
            // exposes navbar bottom position as a CSS var for MobileSearchBar
            "--msb-top": isScrolled ? "70px" : "118px",
          }}
        >
          <div className="w-full flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5 lg:px-8 lg:py-3 xl:py-4">
            {/* Logo */}
            <Link
              href="/"
              title="Yuukke Home"
              className="flex w-[126px] min-w-[126px] shrink-0 items-center sm:w-[138px] sm:min-w-[138px] lg:w-[165px] lg:min-w-[165px] xl:w-[185px] xl:min-w-[185px]"
            >
              <Image
                src="/yuukke_logo.png"
                alt="Yuukke Eco-Friendly Marketplace Logo"
                title="Yuukke - Eco-Friendly Fashion, Home & Beauty Marketplace"
                width={185}
                height={52}
                priority
                sizes="126px"
                className="block h-[46px] w-[126px] object-contain sm:h-[50px] sm:w-[138px] lg:h-[58px] lg:w-[165px] xl:h-[62px] xl:w-[185px]"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
              <div className="flex min-w-0 items-center gap-1 text-[13px] tracking-wide text-neutral-600 xl:gap-2 xl:text-sm 2xl:gap-4">
                {/* Products Dropdown */}
                <div className="group relative shrink-0">
                  <Link
                    href="/products"
                    title="Yuukke Products"
                    className="group flex cursor-pointer items-center gap-1 whitespace-nowrap px-2 py-2 text-gray-700 transition-all hover:text-[#A00300] xl:px-3"
                  >
                    {t("Products")}
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>

                  <div className="invisible absolute left-0 top-full z-[100] mt-1 w-[90vw] max-w-[42rem] rounded-xl border border-gray-100 bg-white p-6 opacity-0 shadow-xl transition-all duration-200 ease-out group-hover:visible group-hover:opacity-100">
                    {productCategories.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1 xl:grid-cols-4">
                        {productCategories.map((category) => (
                          <Link
                            key={category.id || category.slug}
                            href={`/products/category/${category.slug}`}
                            title={`${category.name} Products`}
                            className="group flex flex-col items-center rounded-xl p-4 transition-all duration-300 hover:bg-gray-50 hover:shadow-md"
                          >
                            <div className="mb-3 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                              <Image
                                src={category.image || "/placeholder.png"}
                                alt={category.name}
                                width={84}
                                height={84}
                                loading="lazy"
                                className="h-[68px] w-[74px] object-cover"
                              />
                            </div>
                            <span className="text-center text-sm text-gray-800 transition-colors group-hover:text-clay">
                              {category.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-2 py-8">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-gray-300"></div>
                        <div className="h-3 w-3 animate-pulse rounded-full bg-gray-300 delay-100"></div>
                        <div className="h-3 w-3 animate-pulse rounded-full bg-gray-300 delay-200"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Offers */}
                <Link
                  href={{ pathname: "/products/offers" }}
                  title="Yuukke Offers"
                  className="shrink-0 whitespace-nowrap px-2 py-2 text-gray-700 transition-all hover:text-[#A00300] xl:px-3"
                >
                  {t("Offers")}
                </Link>

                {/* Personalized Gifting */}
                <Link
                  href={{ pathname: "/products/festival-gifting" }}
                  title="Yuukke Gifting"
                  className="shrink-0 whitespace-nowrap px-2 py-2 text-gray-700 transition-all hover:text-[#A00300] xl:px-3"
                >
                  {t("Personalized Gifting")}
                </Link>

                {/* Corporate Gifting */}
                <Link
                  href="https://gift.yuukke.com/#featured-products"
                  title="Yuukke Gifting"
                  aria-label="Corporate Gifting – Premium, Classic"
                  className="group relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2 py-2 text-gray-700 transition-all duration-200 hover:text-[#A00300] xl:px-3"
                >
                  <span className="whitespace-nowrap">
                    {t("Corporate Gifting")}
                  </span>
                </Link>

                {/* Track Order */}
                <Link
                  href="/track-order"
                  title="Track your Yuukke Orders"
                  className="shrink-0 whitespace-nowrap px-2 py-2 text-gray-700 transition-all hover:text-gray-900 xl:px-3"
                >
                  {t("Track Order")}
                </Link>
              </div>
            </div>

            {/* Right Side Cluster */}
            <div className="flex shrink-0 items-center gap-2 lg:gap-3 xl:gap-4">
              {/* Seller Registration — desktop only */}
              <Link
                href="/seller-registration"
                className="hidden h-[38px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#882236] px-4 text-[12px] font-semibold text-white transition-all duration-300 hover:bg-[#6e1a2b] lg:flex xl:h-[42px] xl:px-5 xl:text-[13px]"
              >
                {t("Become a Seller")} →
              </Link>

              <div className="hidden items-center gap-1 lg:flex xl:gap-2">
                <div className="shrink-0">
                  <SearchBar />
                </div>
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
                      className="flex h-full w-full items-center justify-center rounded-full p-2 transition hover:bg-gray-100"
                    >
                      <User className="h-5 w-5 cursor-pointer text-black" />
                    </Link>
                  ) : (
                    <div className="relative z-50 flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={() => setOpen((prev) => !prev)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 shadow-md transition hover:bg-gray-300"
                        >
                          <User className="h-5 w-5 text-gray-600" />
                        </button>

                        {open && (
                          <div className="absolute right-0 z-50 mt-2 w-36 rounded-lg border bg-white shadow-lg">
                            <Link
                              href="/orders"
                              title="Your Yuukke Orders"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                              onClick={() => setOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              Profile
                            </Link>
                            <div className="my-1 border-t" />
                            <div className="px-0 py-2 transition hover:bg-gray-100">
                              <LogoutButton />
                            </div>
                          </div>
                        )}
                      </div>
                      {groupId === 4 && (
                        <button
                          onClick={() => router.push("/subscription")}
                          aria-label="Subscription"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a00300] shadow-md transition hover:bg-red-900"
                        >
                          <Settings className="h-5 w-5 text-white" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 🌐 Language Switcher */}
                <LanguageSwitcher />

                {/* Wishlist */}
                <a
                  href={!isLoggedIn ? "/login" : "/orders?tab=Wishlist"}
                  title={
                    !isLoggedIn
                      ? "Login to View Wishlist"
                      : "View Your Wishlist"
                  }
                  aria-label="Favorites"
                  className="rounded-full p-2 transition hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5 text-black" />
                </a>

                {/* Cart */}
                <button
                  aria-label="Cart"
                  className="relative rounded-full p-2 transition hover:bg-gray-100"
                  onClick={toggleCart}
                >
                  <ShoppingCart className="h-5 w-5 cursor-pointer text-black" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-[6px] text-[10px] font-odop leading-none text-white shadow-md">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile / Tablet Cluster (below lg) */}
              <div className="flex min-w-0 items-center gap-1.5 lg:hidden">
                <div className="shrink-0">
                  <LanguageSwitcher />
                </div>

                <a
                  href={!isLoggedIn ? "/login" : "/orders?tab=Profile"}
                  title={
                    !isLoggedIn ? "Login to View Profile" : "View Your Profile"
                  }
                  aria-label="Profile"
                  className="shrink-0 rounded-full p-2 transition hover:bg-gray-100"
                >
                  <User className="h-5 w-5 text-black" />
                </a>

                <a
                  href={!isLoggedIn ? "/login" : "/orders?tab=Wishlist"}
                  title={
                    !isLoggedIn
                      ? "Login to View Wishlist"
                      : "View Your Wishlist"
                  }
                  aria-label="Favorites"
                  className="shrink-0 rounded-full p-2 transition hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5 text-black" />
                </a>

                <button
                  ref={menuButtonRef}
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-label="Toggle Menu"
                  className="shrink-0 rounded-full p-2 transition hover:bg-gray-100"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileMenuOpen ? (
                      <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="block"
                      >
                        <X className="h-4 w-4 text-gray-700" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="open"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="block"
                      >
                        <Menu className="h-5 w-5 text-gray-900" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>

          {/* ── Mobile Menu (animated) ─────────────────────────────────── */}
          <AnimatePresence initial={false}>
            {mobileMenuOpen && (
              <motion.div
                ref={menuRef}
                key="mobile-menu"
                variants={mobileMenuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: "hidden" }}
                className="border-t border-black/5 bg-[#f9f9f9] px-3 py-2 lg:hidden"
              >
                {/* Products */}
                <div className="border-b border-black/5">
                  <button
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-black/5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/8">
                      <ShoppingBag className="h-[18px] w-[18px] text-[#A00300]" />
                    </span>
                    <span className="flex-1 text-[15px] font-medium text-gray-800">
                      {t("Products")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        isProductsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isProductsOpen && (
                      <motion.div
                        key="products-grid"
                        variants={subGridVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{ overflow: "hidden" }}
                      >
                        <div className="grid grid-cols-3 gap-2 px-2 pb-3 sm:grid-cols-4">
                          {productCategories.map((category) => (
                            <Link
                              key={category.id || category.slug}
                              href={`/products/category/${category.slug}`}
                              title={`${category.name} Products`}
                              className="rounded-lg bg-white px-2 py-2 text-center text-xs text-gray-700 shadow-sm transition hover:text-[#A00300]"
                              onClick={closeMobileMenu}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Offers */}
                <Link
                  href={{ pathname: "/products/offers" }}
                  title="Yuukke Offers"
                  className="flex items-center gap-3 rounded-lg border-b border-black/5 px-2 py-3 transition hover:bg-black/5"
                  onClick={closeMobileMenu}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/8">
                    <Percent className="h-[18px] w-[18px] text-[#A00300]" />
                  </span>
                  <span className="text-[15px] font-medium text-gray-800">
                    {t("Offers")}
                  </span>
                </Link>

                {/* Personalized Gifting */}
                <Link
                  href={{ pathname: "/products/festival-gifting" }}
                  title="Yuukke Gifting"
                  className="flex items-center gap-3 rounded-lg border-b border-black/5 px-2 py-3 transition hover:bg-black/5"
                  onClick={closeMobileMenu}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/8">
                    <Gift className="h-[18px] w-[18px] text-[#A00300]" />
                  </span>
                  <span className="text-[15px] font-medium text-gray-800">
                    {t("Personalized Gifting")}
                  </span>
                </Link>

                {/* Corporate Gifting */}
                <Link
                  href="https://gift.yuukke.com/#featured-products"
                  title="Yuukke Gifting"
                  aria-label="Corporate Gifting – Premium, Classic"
                  className="flex items-center gap-3 rounded-lg border-b border-black/5 px-2 py-3 transition hover:bg-black/5"
                  onClick={closeMobileMenu}
                >
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/8">
                    <Building2 className="h-[18px] w-[18px] text-[#A00300]" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A00300]/60"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#A00300]"></span>
                    </span>
                  </span>
                  <span className="text-[15px] font-medium text-gray-800">
                    {t("Corporate Gifting")}
                  </span>
                </Link>

                {/* Track Order */}
                <Link
                  href="/track-order"
                  title="Track your Yuukke Orders"
                  className="flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-black/5"
                  onClick={closeMobileMenu}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200/70">
                    <Truck className="h-[18px] w-[18px] text-gray-700" />
                  </span>
                  <span className="text-[15px] font-medium text-gray-800">
                    {t("Track Order")}
                  </span>
                </Link>

                {/* Become a Seller */}
                <Link
                  href="/seller-registration"
                  className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-[#882236] text-sm font-semibold text-white transition-all duration-300 hover:bg-[#6e1a2b]"
                  onClick={closeMobileMenu}
                >
                  <Store className="h-4 w-4" />
                  {t("Become a Seller")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
        {!hideMobileSearchBar && <MobileSearchBar isScrolled={isScrolled} />}
      </div>
      {/* Compensates for the fixed MobileSearchBar strip height — mobile only, no effect on any page hero */}
      {!hideMobileSearchBar && (
        <div className="h-[54px] lg:hidden" aria-hidden="true" />
      )}

      {/* ── Blur backdrop behind open mobile menu ─────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="menu-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-[69] lg:hidden"
            style={{
              background: "rgba(0, 0, 0, 0.18)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              top: "0",
            }}
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
