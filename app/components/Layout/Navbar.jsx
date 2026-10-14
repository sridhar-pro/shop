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
  Sparkles,
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
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

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

// ─── Login nudge ───────────────────────────────────────────────────────────
function LoginAttentionIcon({ active, wiggle }) {
  const reduce = useReducedMotion();

  return (
    <span className="relative flex items-center justify-center">
      <motion.span
        className="relative block"
        animate={
          wiggle && !reduce ? { rotate: [0, -14, 12, -8, 6, 0] } : { rotate: 0 }
        }
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        <User className="h-5 w-5 text-black" />
      </motion.span>
      {active && (
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#f9f9f9] bg-[#A00300]" />
      )}
    </span>
  );
}

function LoginNudge({ show, onClose, loginHref, variant = "desktop" }) {
  const isMobile = variant === "mobile";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="login-nudge"
          initial={{ opacity: 0, y: -10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          style={{ transformOrigin: "top right" }}
          className={`absolute top-full z-[120] mt-3 w-[250px] rounded-2xl border border-black/5 bg-white p-4 shadow-xl sm:w-[270px] ${
            isMobile ? "-right-[88px]" : "-right-10"
          }`}
          role="dialog"
          aria-label="Login suggestion"
        >
          {/* Arrow pointing at the icon */}
          <span
            className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-black/5 bg-white"
            style={{ right: isMobile ? 64 : 52 }}
          />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/10">
              <Sparkles className="h-[18px] w-[18px] text-[#A00300]" />
            </span>
            <div className="pr-4">
              <p className="text-[14px] font-semibold text-gray-900">
                Welcome to Yuukke! 👋
              </p>
              <p className="mt-1 text-[12px] leading-snug text-gray-600">
                Login to track orders, save your wishlist &amp; unlock exclusive
                offers.
              </p>
            </div>
          </div>

          <Link
            href={loginHref}
            onClick={onClose}
            className="mt-3 flex h-10 items-center justify-center rounded-full bg-[#882236] text-[13px] font-semibold text-white transition-all duration-300 hover:bg-[#6e1a2b]"
          >
            Login / Sign up
          </Link>
          <button
            onClick={onClose}
            className="mt-2 w-full text-center text-[11px] text-gray-400 transition hover:text-gray-700"
          >
            Maybe later
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Logged-in avatar + menu ───────────────────────────────────────────────
function ProfileAvatar({ open, pulse, onClick }) {
  const reduce = useReducedMotion();

  return (
    <button
      onClick={onClick}
      aria-label="Account menu"
      aria-expanded={open}
      className="group relative flex h-10 w-10 items-center justify-center rounded-full p-[2px] transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {/* gradient ring */}
      <span
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-[#882236] via-[#A00300] to-[#e0a458] transition-opacity ${
          open ? "opacity-100" : "opacity-80 group-hover:opacity-100"
        }`}
      />
      {/* soft attention pulse (only while the nudge is visible) */}
      {pulse && !reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-[#A00300]/40"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#f9f9f9]">
        <User className="h-[18px] w-[18px] text-[#882236]" />
      </span>
      {/* online dot */}
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#f9f9f9] bg-emerald-500" />
    </button>
  );
}

function ProfileMenu({ open, onClose, showSubscription }) {
  const items = [
    { href: "/orders?tab=Profile", label: "My Profile", icon: User },
    { href: "/orders", label: "My Orders", icon: ShoppingBag },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-menu"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          style={{ transformOrigin: "top right" }}
          className="absolute right-0 top-full z-[120] mt-3 w-56 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl"
        >
          <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-black/5 bg-white" />

          {/* header */}
          <div className="relative flex items-center gap-3 bg-gradient-to-br from-[#882236]/10 to-[#e0a458]/10 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#882236]">
              <User className="h-[18px] w-[18px] text-white" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">
                Hello there 👋
              </p>
              <p className="text-[11px] text-gray-500">Manage your account</p>
            </div>
          </div>

          {/* links */}
          <div className="p-1.5">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#A00300]/5 hover:text-[#A00300]"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {showSubscription && (
              <Link
                href="/subscription"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 transition hover:bg-[#A00300]/5 hover:text-[#A00300]"
              >
                <Settings className="h-4 w-4" />
                Subscription
              </Link>
            )}
          </div>

          <div className="border-t border-black/5 p-1.5">
            <div className="rounded-xl transition hover:bg-gray-100">
              <LogoutButton />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── "Your profile lives here" tip ─────────────────────────────────────────
function ProfileNudge({ show, onClose, variant = "desktop" }) {
  const isMobile = variant === "mobile";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="profile-nudge"
          initial={{ opacity: 0, y: -10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          style={{ transformOrigin: "top right" }}
          className={`absolute top-full z-[120] mt-3 w-[240px] rounded-2xl border border-black/5 bg-white p-4 shadow-xl ${
            isMobile ? "-right-[88px]" : "right-0"
          }`}
          role="status"
        >
          <span
            className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-black/5 bg-white"
            style={{ right: isMobile ? 64 : 16 }}
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2 top-2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A00300]/10">
              <User className="h-[18px] w-[18px] text-[#A00300]" />
            </span>
            <div className="pr-4">
              <p className="text-[13px] font-semibold text-gray-900">
                Your profile is here ✨
              </p>
              <p className="mt-1 text-[12px] leading-snug text-gray-600">
                Check orders, wishlist &amp; account settings anytime from this
                icon.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Festive campaign pill config ──────────────────────────────────────────────
// Set `active: false` to hide it outside the campaign window
const CAMPAIGN = {
  active: true,
  label: "Diwali",
  tag: "SALE",
  href: "/diwali-gifts",
  // Deep maroon fill, lit warmly from the diya side
  bg: "linear-gradient(105deg,#9d1410 0%,#7a0f1d 55%,#5a1426 100%)",
  // Antique-gold hairline edge
  edge: "linear-gradient(135deg,#f8dd9c 0%,#b8812f 48%,#f1c970 100%)",
};

// Only what Tailwind can't express. One moment of motion: the diya flame.
const CAMPAIGN_PILL_CSS = `
.cp{position:relative;isolation:isolate;overflow:hidden;border-radius:9999px;
  border:1.5px solid transparent;
  background:
    radial-gradient(110px 70px at 24px 50%,rgba(255,170,70,.30),transparent 70%) padding-box,
    var(--cp-bg) padding-box,
    var(--cp-edge) border-box;
  box-shadow:0 8px 18px -8px rgba(90,10,25,.75),0 0 0 1px rgba(90,10,25,.08);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),filter .2s ease,box-shadow .2s ease}
.cp:hover{transform:translateY(-1px) scale(1.04);filter:brightness(1.08);
  box-shadow:0 12px 22px -8px rgba(90,10,25,.85),0 0 16px 0 rgba(255,170,70,.22)}
.cp:active{transform:scale(.96)}
.cp:focus-visible{outline:2px solid #f8dd9c;outline-offset:3px}
.cp.cp-bulge{animation:cp-bulge .7s cubic-bezier(.34,1.56,.64,1)}

/* soft top light so the maroon doesn't read flat */
.cp-gloss{position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(to bottom,rgba(255,255,255,.12),transparent 45%)}

/* diya medallion */
.cp-medal{position:relative;display:inline-flex;align-items:center;justify-content:center;
  border-radius:9999px;background:rgba(255,214,140,.10);
  box-shadow:inset 0 0 0 1px rgba(248,221,156,.38)}
.cp-halo{position:absolute;inset:-4px;border-radius:9999px;pointer-events:none;
  background:radial-gradient(circle,rgba(255,190,90,.55),transparent 65%);
  animation:cp-breathe 3s ease-in-out infinite}

/* flame */
.cp-flame,.cp-flame-in{transform-box:fill-box;transform-origin:50% 100%}
.cp-flame{animation:cp-flicker 1.8s ease-in-out infinite}
.cp-flame-in{animation:cp-flicker 1.3s ease-in-out infinite reverse}

/* gold tag chip */
.cp-tag{border-radius:9999px;line-height:1;color:#5a1426;
  background:linear-gradient(135deg,#fbe5a8,#e9b551);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 1px 2px rgba(0,0,0,.25)}

.cp-arrow{transition:transform .25s ease}
.cp:hover .cp-arrow{transform:translateX(2px)}

@keyframes cp-flicker{
  0%,100%{transform:scale(1,1) rotate(0deg)}
  20%{transform:scale(.93,1.07) rotate(-2.5deg)}
  45%{transform:scale(1.06,.94) rotate(1.8deg)}
  70%{transform:scale(.97,1.04) rotate(-1deg)}}
@keyframes cp-breathe{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1.08)}}
@keyframes cp-bulge{0%{transform:scale(1)}35%{transform:scale(1.12)}60%{transform:scale(.97)}100%{transform:scale(1)}}

@media (prefers-reduced-motion:reduce){
  .cp,.cp.cp-bulge,.cp-halo,.cp-flame,.cp-flame-in,.cp-arrow{animation:none!important;transition:none!important}
}
`;

// Gold diya: boat-shaped clay lamp with oil, wick and a live flame.
// Solid fills only (no gradient ids) so it renders in hidden/duplicate SVGs.
function DiyaIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 40 29" aria-hidden="true" className={className}>
      {/* foot */}
      <rect x="14" y="24.5" width="12" height="3" rx="1.5" fill="#c98428" />
      {/* bowl body with upturned tips */}
      <path
        d="M1.5 12.2C4 12.8 6.5 13.2 9 13.2h22c2.5 0 5-.4 7.5-1C37.6 20 30.6 26 20 26S2.4 20 1.5 12.2z"
        fill="#f0b95a"
      />
      {/* lower shade */}
      <path
        d="M3 16.8C6 22.6 12.2 26 20 26s14-3.4 17-9.2C33.2 20.4 27 22.2 20 22.2S6.8 20.4 3 16.8z"
        fill="#d9963a"
      />
      {/* highlight */}
      <path
        d="M7 16.2c5 1.6 21 1.6 26 0"
        fill="none"
        stroke="#fff3c4"
        strokeOpacity=".55"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* decorative dots */}
      <circle cx="13.5" cy="19.6" r="1" fill="#b8721f" />
      <circle cx="20" cy="20.6" r="1" fill="#b8721f" />
      <circle cx="26.5" cy="19.6" r="1" fill="#b8721f" />
      {/* rim + oil */}
      <ellipse cx="20" cy="13" rx="18.2" ry="2.8" fill="#ffe2a0" />
      <ellipse cx="20" cy="13.3" rx="14.8" ry="1.7" fill="#a8641c" />
      {/* wick */}
      <path d="M19.2 13.4c.1-1.6.4-2.4.8-2.8.4.4.7 1.2.8 2.8z" fill="#4a1a12" />
      {/* flame */}
      <path
        className="cp-flame"
        d="M20 0c3.2 3.2 4.2 5.6 4.2 7.8a4.2 4.2 0 0 1-8.4 0C15.8 5.6 16.8 3.2 20 0z"
        fill="#ffb347"
      />
      <path
        className="cp-flame-in"
        d="M20 4.6c1.5 1.8 2.1 3.1 2.1 4.2a2.1 2.1 0 0 1-4.2 0c0-1.1.6-2.4 2.1-4.2z"
        fill="#fff3c4"
      />
    </svg>
  );
}

function CampaignPill({ variant = "full", pulse, onClick, className = "" }) {
  if (!CAMPAIGN.active) return null;

  const cssVars = { "--cp-bg": CAMPAIGN.bg, "--cp-edge": CAMPAIGN.edge };

  // Round version (small screens): diya + flame on the maroon circle
  if (variant === "icon") {
    return (
      <Link
        href={CAMPAIGN.href}
        onClick={onClick}
        aria-label={`${CAMPAIGN.label} ${CAMPAIGN.tag}`}
        className={`cp flex h-9 w-9 shrink-0 items-center justify-center bg-[#A00300] ${
          pulse ? "cp-bulge" : ""
        } ${className}`}
        style={cssVars}
      >
        <style>{CAMPAIGN_PILL_CSS}</style>
        <span className="cp-gloss" aria-hidden="true" />
        <span className="cp-halo" aria-hidden="true" />
        <DiyaIcon className="relative z-10 h-[17px] w-[23px] shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
      </Link>
    );
  }

  // Full pill: (diya)  Diwali [SALE]  ›
  return (
    <Link
      href={CAMPAIGN.href}
      onClick={onClick}
      className={`cp inline-flex h-11 shrink-0 items-center justify-center gap-2.5 pl-1.5 pr-3.5 text-[15px] font-semibold tracking-[0.01em] text-[#fff1d6] ${
        pulse ? "cp-bulge" : ""
      } ${className}`}
      style={cssVars}
    >
      <style>{CAMPAIGN_PILL_CSS}</style>
      <span className="cp-gloss" aria-hidden="true" />
      <span className="cp-medal relative z-10 h-8 w-8 shrink-0">
        <span className="cp-halo" aria-hidden="true" />
        <DiyaIcon className="relative z-10 h-[19px] w-[26px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
      </span>
      <span className="relative z-10 whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
        {CAMPAIGN.label}
      </span>
      <span className="cp-tag relative z-10 px-2 py-[5px] text-[10.5px] font-extrabold uppercase tracking-[0.08em]">
        {CAMPAIGN.tag}
      </span>
      <ChevronRight className="cp-arrow relative z-10 -ml-0.5 h-4 w-4 shrink-0 text-[#f8dd9c]" />
    </Link>
  );
}

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

  const [pillPulse, setPillPulse] = useState(false);

  const [showLoginNudge, setShowLoginNudge] = useState(false);
  const isLoginPage = pathname === "/login";
  const loginHref =
    pathname && pathname !== "/login"
      ? `/login?from=${encodeURIComponent(pathname)}`
      : "/login";

  const dismissLoginNudge = () => setShowLoginNudge(false);

  useEffect(() => {
    if (isLoggedIn || isLoginPage) {
      setShowLoginNudge(false);
      return;
    }

    const showTimer = setTimeout(() => setShowLoginNudge(true), 3500);
    const hideTimer = setTimeout(() => setShowLoginNudge(false), 15000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoggedIn, isLoginPage]);

  const [showProfileNudge, setShowProfileNudge] = useState(false);
  const dismissProfileNudge = () => setShowProfileNudge(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowProfileNudge(false);
      return;
    }

    const KEY = "profile_nudge_v1";
    const MAX_SHOWS = 3;
    const COOLDOWN = 2 * 24 * 60 * 60 * 1000; // 2 days

    let showTimer, hideTimer;
    try {
      if (sessionStorage.getItem(KEY)) return; // once per session

      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      const count = saved.count || 0;
      const last = saved.last || 0;
      if (count >= MAX_SHOWS || Date.now() - last < COOLDOWN) return;

      showTimer = setTimeout(() => {
        setShowProfileNudge(true);
        sessionStorage.setItem(KEY, "1");
        localStorage.setItem(
          KEY,
          JSON.stringify({ count: count + 1, last: Date.now() }),
        );
        hideTimer = setTimeout(() => setShowProfileNudge(false), 8000);
      }, 6000);
    } catch (e) {
      /* storage unavailable, skip the nudge */
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isLoggedIn]);

  // Pulse the campaign pill every 4s to draw attention
  useEffect(() => {
    if (!CAMPAIGN.active) return;
    const id = setInterval(() => {
      setPillPulse(true);
      setTimeout(() => setPillPulse(false), 700);
    }, 4000);
    return () => clearInterval(id);
  }, []);

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
                {/* Campaign pill: compact icon at lg, full pill from xl */}
                <div className="hidden shrink-0 lg:block xl:hidden">
                  <CampaignPill variant="full" pulse={pillPulse} />
                </div>
                <div className="hidden xl:block">
                  <CampaignPill variant="full" pulse={pillPulse} />
                </div>
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
                {/* <Link
                  href="/track-order"
                  title="Track your Yuukke Orders"
                  className="shrink-0 whitespace-nowrap px-2 py-2 text-gray-700 transition-all hover:text-gray-900 xl:px-3"
                >
                  {t("Track Order")}
                </Link> */}
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
                    <>
                      <Link
                        href={loginHref}
                        title="Login to your Yuukke account"
                        aria-label="Profile"
                        onClick={dismissLoginNudge}
                        className="flex h-full w-full items-center justify-center rounded-full p-2 transition hover:bg-gray-100"
                      >
                        <LoginAttentionIcon
                          active={!isLoginPage}
                          wiggle={showLoginNudge}
                        />
                      </Link>
                      <LoginNudge
                        show={showLoginNudge}
                        onClose={dismissLoginNudge}
                        loginHref={loginHref}
                        variant="desktop"
                      />
                    </>
                  ) : (
                    <div className="relative z-50">
                      <ProfileAvatar
                        open={open}
                        pulse={showProfileNudge}
                        onClick={() => {
                          dismissProfileNudge();
                          setOpen((prev) => !prev);
                        }}
                      />
                      <ProfileNudge
                        show={showProfileNudge && !open}
                        onClose={dismissProfileNudge}
                        variant="desktop"
                      />
                      <ProfileMenu
                        open={open}
                        onClose={() => setOpen(false)}
                        showSubscription={groupId === 4}
                      />
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
                <div className="hidden shrink-0 min-[400px]:block mr-2">
                  <CampaignPill variant="icon" pulse={pillPulse} />
                </div>
                <div className="shrink-0">
                  <LanguageSwitcher />
                </div>

                <div className="relative shrink-0">
                  <a
                    href={!isLoggedIn ? "/login" : "/orders?tab=Profile"}
                    title={
                      !isLoggedIn
                        ? "Login to View Profile"
                        : "View Your Profile"
                    }
                    aria-label="Profile"
                    onClick={
                      !isLoggedIn ? dismissLoginNudge : dismissProfileNudge
                    }
                    className="block rounded-full p-2 transition hover:bg-gray-100"
                  >
                    {!isLoggedIn ? (
                      <LoginAttentionIcon
                        active={!isLoginPage}
                        wiggle={showLoginNudge}
                      />
                    ) : (
                      <span className="relative flex h-5 w-5 items-center justify-center">
                        <User className="h-5 w-5 text-[#882236]" />
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#f9f9f9] bg-emerald-500" />
                      </span>
                    )}
                  </a>
                  {!isLoggedIn ? (
                    <LoginNudge
                      show={showLoginNudge}
                      onClose={dismissLoginNudge}
                      loginHref={loginHref}
                      variant="mobile"
                    />
                  ) : (
                    <ProfileNudge
                      show={showProfileNudge}
                      onClose={dismissProfileNudge}
                      variant="mobile"
                    />
                  )}
                </div>

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
