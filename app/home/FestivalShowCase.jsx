"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useAuth } from "@/app/utils/AuthContext";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

function stripHtml(html, limit = 16) {
  const text = html?.replace(/<[^>]*>/g, "") || "";
  const words = text.split(" ");
  return words.length > limit ? words.slice(0, limit).join(" ") + "…" : text;
}

function useCountdown(targetDate) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!targetDate) {
      setRemaining(null);
      return;
    }

    const normalizedDate = targetDate.includes(" ")
      ? targetDate.replace(" ", "T")
      : targetDate;

    const target = new Date(normalizedDate).getTime();

    if (Number.isNaN(target)) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      const diff = target - Date.now();

      if (diff <= 0) {
        setRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          ended: true,
        });
        return;
      }

      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        ended: false,
      });
    };

    tick();

    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return remaining;
}

// ─── Cart helper (matches existing platform pattern) ─────────────────────────

async function fetchAuthToken() {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (data?.status === "success" && data?.token) {
    localStorage.setItem("authToken", data.token);
    return data.token;
  }
  throw new Error("Authentication failed");
}

async function addToCartApi({ productId, quantity, variantId }) {
  let cartId = localStorage.getItem("cart_id");
  if (!cartId) {
    cartId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("cart_id", cartId);
  }

  const payload = {
    selected_country: "IN",
    product_id: productId,
    historypincode: Number(localStorage.getItem("user_pincode") || 600002),
    qty: quantity,
    cart_id: cartId,
    variant_id: variantId ? [variantId] : [],
  };

  let token = localStorage.getItem("authToken");
  if (!token) token = await fetchAuthToken();

  let response = await fetch("/api/addcart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    token = await fetchAuthToken();
    response = await fetch("/api/addcart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }

  const result = await response.json();
  return { result, cartId, token };
}

// ─── Decorative SVG — Mandala (top-left) ─────────────────────────────────────
// Closely mirrors reference image 1: concentric dotted/line rings,
// radiating petal arcs, fine spoke lines from centre.

function MandalaSVG({ className = "" }) {
  const C = 200; // cx/cy — origin at top-left corner
  const col = "#C89A3C";

  // Generate spoke lines (fine radiating lines)
  const spokes = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * 10 * Math.PI) / 180;
    return {
      x2: C + Math.cos(angle) * 190,
      y2: C + Math.sin(angle) * 190,
    };
  });

  // Petal arcs at different radii
  const petalRings = [
    { r: 55, count: 12, rInner: 38, w: 22 },
    { r: 88, count: 16, rInner: 70, w: 18 },
    { r: 130, count: 20, rInner: 108, w: 22 },
  ];

  function petalPath(cx, cy, angle, rOuter, rInner, halfSpread) {
    const a1 = angle - halfSpread;
    const a2 = angle + halfSpread;
    const ox1 = cx + Math.cos(a1) * rOuter;
    const oy1 = cy + Math.sin(a1) * rOuter;
    const ox2 = cx + Math.cos(a2) * rOuter;
    const oy2 = cy + Math.sin(a2) * rOuter;
    const ix1 = cx + Math.cos(a1) * rInner;
    const iy1 = cy + Math.sin(a1) * rInner;
    const ix2 = cx + Math.cos(a2) * rInner;
    const iy2 = cy + Math.sin(a2) * rInner;
    const peakX = cx + Math.cos(angle) * (rOuter + 10);
    const peakY = cy + Math.sin(angle) * (rOuter + 10);
    return `M${ix1},${iy1} L${ox1},${oy1} Q${peakX},${peakY} ${ox2},${oy2} L${ix2},${iy2} Z`;
  }

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g opacity="0.7">
        {/* Fine spoke lines from corner origin */}
        {spokes.map((s, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={s.x2}
            y2={s.y2}
            stroke={col}
            strokeWidth="0.35"
            opacity="0.25"
          />
        ))}

        {/* Concentric circle rings */}
        {[30, 55, 80, 108, 135, 158, 178].map((r, i) => (
          <circle
            key={r}
            cx={0}
            cy={0}
            r={r}
            stroke={col}
            strokeWidth={i === 3 ? "0.9" : "0.45"}
            strokeDasharray={i % 2 === 1 ? "2.5 3" : "none"}
            opacity={i === 3 ? 0.55 : 0.3}
            fill="none"
          />
        ))}

        {/* Petal ring 1 — innermost */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 55, 38, 0.2)}
              fill={col}
              fillOpacity="0.12"
              stroke={col}
              strokeWidth="0.5"
              opacity="0.7"
            />
          );
        })}

        {/* Petal ring 2 */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 92, 72, 0.16)}
              fill={col}
              fillOpacity="0.09"
              stroke={col}
              strokeWidth="0.45"
              opacity="0.65"
            />
          );
        })}

        {/* Petal ring 3 — outer */}
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i * 18 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 138, 112, 0.13)}
              fill={col}
              fillOpacity="0.07"
              stroke={col}
              strokeWidth="0.4"
              opacity="0.55"
            />
          );
        })}

        {/* Dot ring at r=108 */}
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * 11.25 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 108}
              cy={Math.sin(a) * 108}
              r="1.4"
              fill={col}
              opacity="0.4"
            />
          );
        })}

        {/* Dot ring at r=55 */}
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i * 18 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 55}
              cy={Math.sin(a) * 55}
              r="1"
              fill={col}
              opacity="0.35"
            />
          );
        })}

        {/* Centre star / rose */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, a, 22, 8, 0.28)}
              fill={col}
              fillOpacity="0.3"
              stroke={col}
              strokeWidth="0.5"
            />
          );
        })}

        {/* Teardrop hanging drops (lower portion of reference) */}
        {[0, 15, -15, 30, -30].map((deg, i) => {
          const a = ((90 + deg) * Math.PI) / 180;
          const r1 = 155 + i * 3;
          const r2 = 172 + i * 2;
          const mx = Math.cos(a) * r1;
          const my = Math.sin(a) * r1;
          const ex = Math.cos(a) * r2;
          const ey = Math.sin(a) * r2;
          return (
            <g key={i} opacity="0.45">
              <line
                x1={mx}
                y1={my}
                x2={ex}
                y2={ey}
                stroke={col}
                strokeWidth="0.6"
              />
              <circle
                cx={ex}
                cy={ey}
                r="2.5"
                fill={col}
                fillOpacity="0.35"
                stroke={col}
                strokeWidth="0.4"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Decorative SVG — Botanical leaves (top-right / bottom-left) ─────────────
// Mirrors reference image 2: large multi-lobed leaves with vein detail,
// scattered smaller leaves floating away.

function BotanicalSVG({ className = "", flip = false }) {
  const col = "#C89A3C";

  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scale(-1,1)" } : undefined}
      aria-hidden="true"
    >
      <g opacity="0.65" stroke={col} fill="none">
        {/* ── Main large leaf cluster — top-left origin ── */}

        {/* Leaf 1 — tallest centre leaf */}
        <path
          d="M10 10 C 30 -10, 80 20, 95 80 C 80 60, 50 30, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        {/* veins leaf 1 */}
        <path
          d="M10 10 C 40 35, 70 55, 95 80"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M35 22 C 50 42, 65 55, 78 72"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M55 30 C 65 48, 72 60, 82 74"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 2 — splays right */}
        <path
          d="M10 10 C 60 0, 120 30, 140 75 C 110 55, 65 20, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        <path
          d="M10 10 C 60 25, 105 45, 140 75"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M40 12 C 80 28, 110 48, 132 70"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M70 16 C 98 30, 120 50, 134 72"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 3 — splays further right, lower */}
        <path
          d="M10 10 C 70 15, 145 60, 155 120 C 120 90, 65 40, 10 10Z"
          fill={col}
          fillOpacity="0.08"
          strokeWidth="0.6"
        />
        <path
          d="M10 10 C 70 40, 120 75, 155 120"
          strokeWidth="0.35"
          opacity="0.4"
        />
        <path
          d="M50 18 C 95 55, 128 82, 148 115"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 4 — splays down */}
        <path
          d="M10 10 C 20 60, 50 120, 40 175 C 25 130, 5 70, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        <path
          d="M10 10 C 22 65, 38 115, 40 175"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M8 35 C 18 78, 32 118, 37 168"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M6 60 C 14 95, 28 128, 35 162"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 5 — between down and right */}
        <path
          d="M10 10 C 50 40, 100 90, 105 150 C 75 110, 35 60, 10 10Z"
          fill={col}
          fillOpacity="0.09"
          strokeWidth="0.6"
        />
        <path
          d="M10 10 C 50 50, 88 95, 105 150"
          strokeWidth="0.35"
          opacity="0.4"
        />
        <path
          d="M25 22 C 60 60, 90 100, 100 144"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Pointed tip extensions */}
        <path
          d="M95 80 C 100 88, 103 100, 98 108"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M140 75 C 148 82, 155 92, 150 102"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M40 175 C 38 184, 33 192, 28 196"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Tiny leaf D — isolated floater */}
        <path
          d="M195 155 C 204 148, 215 152, 217 163 C 210 158, 200 156, 195 155Z"
          fill={col}
          fillOpacity="0.08"
          strokeWidth="0.45"
        />
        <path
          d="M195 155 C 204 156, 212 159, 217 163"
          strokeWidth="0.22"
          opacity="0.3"
        />

        {/* Bud dots */}
        <circle
          cx="97"
          cy="108"
          r="2.2"
          fill={col}
          fillOpacity="0.3"
          stroke="none"
        />
        <circle
          cx="152"
          cy="102"
          r="1.8"
          fill={col}
          fillOpacity="0.28"
          stroke="none"
        />
        <circle
          cx="29"
          cy="196"
          r="2"
          fill={col}
          fillOpacity="0.28"
          stroke="none"
        />
        <circle
          cx="172"
          cy="176"
          r="1.5"
          fill={col}
          fillOpacity="0.22"
          stroke="none"
        />
        <circle
          cx="185"
          cy="209"
          r="1.3"
          fill={col}
          fillOpacity="0.2"
          stroke="none"
        />
        <circle
          cx="218"
          cy="164"
          r="1.2"
          fill={col}
          fillOpacity="0.18"
          stroke="none"
        />
      </g>
    </svg>
  );
}

// ─── Festival products cache ────────────────────────────────────────────────
const FESTIVAL_PRODUCTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let festivalProductsCache = {
  data: null,
  timestamp: 0,
};

async function fetchFestivalProductsWithCache() {
  const now = Date.now();

  // Use cached response if it is still valid
  if (
    festivalProductsCache.data &&
    now - festivalProductsCache.timestamp < FESTIVAL_PRODUCTS_CACHE_TTL
  ) {
    return festivalProductsCache.data;
  }

  // Cache expired / unavailable → fresh API hit
  const res = await fetch("/api/getTitle9");

  if (!res.ok) {
    throw new Error(`Festival products API error: ${res.status}`);
  }

  const data = await res.json();

  // Store fresh response
  festivalProductsCache = {
    data,
    timestamp: now,
  };

  return data;
}

function getBackImage(imageHtml) {
  const imgTags = imageHtml?.match(/<img\b[^>]*>/gi) || [];

  const backTag = imgTags.find((tag) =>
    /\bclass=["'][^"']*\bback-img\b/i.test(tag),
  );

  const match = backTag?.match(/\bsrc=["']([^"']+)["']/i);

  return match?.[1] || null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FestivalShowcase() {
  const { t } = useTranslation();
  const { getValidToken, isAuthReady } = useAuth();
  const hasFetched = useRef(false);
  const scrollerRef = useRef(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftRef = useRef(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const handleMouseDown = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    el.classList.add("cursor-grabbing");
    el.classList.remove("cursor-grab");
  };

  const handleMouseMove = (e) => {
    const el = scrollerRef.current;
    if (!el || !isDragging.current) return;
    e.preventDefault();
    el.scrollLeft =
      scrollLeftRef.current - (e.pageX - el.offsetLeft - startX.current) * 1.5;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    const el = scrollerRef.current;
    if (el) {
      el.classList.remove("cursor-grabbing");
      el.classList.add("cursor-grab");
    }
  };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchFestivalProducts = async () => {
      try {
        const data = await fetchFestivalProductsWithCache();

        if (!Array.isArray(data)) return;

        const mapped = data
          .filter((item) => Number(item.homePageTitleStatus ?? 0) !== 1)
          .map((item) => {
            const price = parseFloat(item.price) || 0;

            const promoPrice =
              item.promotion === "1" && item.promo_price
                ? parseFloat(item.promo_price)
                : null;

            const discount =
              promoPrice && price
                ? Math.round(((price - promoPrice) / price) * 100)
                : null;

            return {
              id: item.id,
              title: item.name,
              image: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${item.image}`,
              hoverImage: getBackImage(item.image_g),
              link: item.slug,
              price,
              promoPrice,
              discount,
              endDate: item.promotion === "1" ? item.end_date : null,
              isFestival: item.festival_special === "1",
              warehouseId: item?.seller?.warehouse_id,
              // minimum_order_limit === 1 → must be ordered from the product page
              viewOnly: Number(item.minimum_order_limit ?? 0) === 1,
              minQty: Number(item.minimum_order_qty ?? 0),
            };
          });

        // Keep existing price sorting
        mapped.sort((a, b) => a.price - b.price);

        setItems(mapped);
      } catch (err) {
        console.error("Festival products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFestivalProducts();
  }, []);

  useEffect(() => {
    setTimeout(updateScrollState, 120);
  }, [items, updateScrollState]);

  const [flashSale, setFlashSale] = useState(null);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;

    const fetchFlashSale = async () => {
      try {
        const data = await fetchWithAuthGlobal(
          "/api/flashsale",
          {
            method: "POST",
          },
          getValidToken,
        );

        const sale = data?.flash_sales;

        if (!sale) {
          setFlashSale(null);
          return;
        }

        const now = Date.now();
        const start = new Date(sale.start_time.replace(" ", "T")).getTime();

        const end = new Date(sale.end_time.replace(" ", "T")).getTime();

        // Only use the flash sale while it is active
        if (now >= start && now <= end) {
          setFlashSale(sale);
        } else {
          setFlashSale(null);
        }
      } catch (err) {
        console.error("Flash Sale fetch error:", err);
        setFlashSale(null);
      } finally {
        setFlashSaleLoading(false);
      }
    };

    fetchFlashSale();
  }, [getValidToken, isAuthReady]);

  const countdown = useCountdown(
    flashSale?.end_time ? flashSale.end_time.replace(" ", "T") : null,
  );

  const scrollByCards = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 295, behavior: "smooth" });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#FBF1DE] py-20 px-4 sm:px-6 md:px-10 lg:px-20 font-odop">
      {/* ── Corner decorations ──────────────────────────────────────────── */}

      {/* Top-left: Mandala (like reference image 1) */}
      <MandalaSVG className="pointer-events-none absolute -top-2 -left-2 w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px]" />

      {/* Top-right: Botanical leaves flipped (like reference image 2) */}
      <BotanicalSVG
        className="pointer-events-none absolute -top-2 -right-2 w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-[280px] md:h-[280px]"
        flip
      />

      {/* Bottom-right: Botanical leaves */}
      <BotanicalSVG className="pointer-events-none absolute -bottom-2 -right-2 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px] rotate-180" />

      {/* Bottom-left: Mandala rotated */}
      <MandalaSVG className="pointer-events-none absolute -bottom-2 -left-2 w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rotate-180 opacity-50" />

      {/* Subtle ambient warmth */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-48 rounded-full bg-[#C89A3C]/8 blur-3xl" />

      <div className="relative z-10 max-w-[1440px] mx-auto">
        {/* ── Headline ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#2B0A1F] leading-[1.05] max-w-xl">
              Festive,{" "}
              <span className="relative inline-block">
                Must-Haves
                <svg
                  viewBox="0 0 220 16"
                  className="absolute -bottom-2 left-0 w-full h-3"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10 C 50 2, 100 14, 150 6 S 210 2, 218 8"
                    fill="none"
                    stroke="#C89A3C"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p className="mt-4 text-[15px] text-[#5B4636] max-w-md">
              Handpicked products and offers, live only for the season — before
              shelves reset for the next one.
            </p>
          </div>

          {!flashSaleLoading && flashSale && countdown && !countdown.ended && (
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-[#C89A3C]/30 rounded-2xl px-5 py-4 shadow-sm shrink-0">
              <Clock3 className="w-5 h-5 text-[#7A0000]" />
              <div className="flex items-baseline gap-3 text-[#2B0A1F]">
                <TimeUnit value={countdown.days} label="d" />
                <TimeUnit value={countdown.hours} label="h" />
                <TimeUnit value={countdown.minutes} label="m" />
                <TimeUnit value={countdown.seconds} label="s" />
              </div>
            </div>
          )}
        </div>

        {/* ── Scrollable card row ───────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="relative">
            {/* Left nav arrow */}
            <AnimatePresence>
              {canScrollLeft && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => scrollByCards(-1)}
                  aria-label="Scroll left"
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-20
                             w-11 h-11 flex items-center justify-center rounded-full
                             bg-white border border-[#C89A3C]/50 shadow-md
                             hover:bg-[#FBF1DE] hover:border-[#C89A3C] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#2B0A1F]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Right nav arrow */}
            <AnimatePresence>
              {canScrollRight && (
                <motion.button
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => scrollByCards(1)}
                  aria-label="Scroll right"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-20
                             w-11 h-11 flex items-center justify-center rounded-full
                             bg-white border border-[#C89A3C]/50 shadow-md
                             hover:bg-[#FBF1DE] hover:border-[#C89A3C] transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#2B0A1F]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Card track */}
            <div
              ref={scrollerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory
                         cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((item, i) => (
                <FestivalCard key={item.id} item={item} />
              ))}
            </div>

            {/* Edge fade hints */}
            {canScrollLeft && (
              <div className="pointer-events-none absolute left-0 top-0 h-full w-14 bg-gradient-to-r from-[#FBF1DE] to-transparent z-10" />
            )}
            {canScrollRight && (
              <div className="pointer-events-none absolute right-0 top-0 h-full w-14 bg-gradient-to-l from-[#FBF1DE] to-transparent z-10" />
            )}
          </div>
        )}

        {/* ── View all ─────────────────────────────────────────────────── */}
        <div className="mt-8 mb-2 flex justify-end">
          <Link
            href="/products/festival-season"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#FBF1DE]
                       bg-[#2B0A1F] px-7 py-3.5 rounded-full hover:bg-[#7A0000] transition-colors"
          >
            View all products
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── TimeUnit ────────────────────────────────────────────────────────────────

function TimeUnit({ value, label }) {
  return (
    <span className="text-sm md:text-base tabular-nums">
      <span className="font-semibold">{String(value).padStart(2, "0")}</span>
      <span className="text-[#5B4636] ml-0.5">{label}</span>
    </span>
  );
}

// ─── FestivalCard ─────────────────────────────────────────────────────────────

function FestivalCard({ item }) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);

    // Brief delay so the GIF has a moment to show (matches platform pattern)
    await new Promise((r) => setTimeout(r, 2500));

    try {
      const { result, cartId, token } = await addToCartApi({
        productId: item.id,
        quantity: 1,
        variantId: null,
      });

      if (result.status !== "success") {
        toast.error(t("Failed to add to cart"));
        return;
      }

      // Update local cart
      const existing = JSON.parse(localStorage.getItem("cart_data") || "[]");
      const idx = existing.findIndex((c) => c.id === item.id);
      const basePrice = item.promoPrice ?? item.price;
      const updated =
        idx >= 0
          ? existing.map((c, i) => (i === idx ? { ...c, qty: c.qty + 1 } : c))
          : [
              ...existing,
              {
                id: item.id,
                name: item.title,
                qty: 1,
                price: basePrice,
                image: item.image,
                variant_id: null,
              },
            ];
      localStorage.setItem("cart_data", JSON.stringify(updated));

      // Apply coupon
      const newCartId = result.cart_ids?.[0] ?? cartId;
      await fetch("/api/applyCoupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart_id: newCartId, coupon_code: "0" }),
      }).catch(() => {});

      // Fetch tax
      await fetch("/api/getTax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart_id: cartId }),
      })
        .then((r) => r.json())
        .then((d) => {
          localStorage.setItem("cart_tax_details", JSON.stringify(d));
          window.dispatchEvent(new Event("cart-updated"));
        })
        .catch(() => {});

      toast.success(t("🛒 Added to cart!"), {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to add to cart"));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link
      href={`/products/${item.link}`}
      title={`View ${item.title}`}
      className="snap-start shrink-0 w-[240px] md:w-[275px]"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative bg-white rounded-3xl border border-[#2B0A1F]/10 shadow-sm hover:shadow-lg overflow-hidden h-full group"
      >
        {/* Product image */}
        <div className="relative w-full h-[240px] bg-[#FBF1DE] overflow-hidden">
          {/* Primary image */}
          <Image
            src={item.image}
            alt={item.title}
            fill
            priority={false}
            className={`object-cover transition-all duration-500 ${
              item.hoverImage
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            }`}
          />

          {/* Alternate image — visible on hover */}
          {item.hoverImage && (
            <Image
              src={item.hoverImage}
              alt={`${item.title} - alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
            />
          )}
          {/* Discount / Festival badge */}
          {item.discount ? (
            <span className="absolute top-3 left-3 bg-[#7A0000] text-[#FBF1DE] text-xs font-semibold px-2.5 py-1 rounded-full z-10">
              {item.discount}% off
            </span>
          ) : item.isFestival ? (
            <span className="absolute top-3 left-3 bg-[#C89A3C] text-[#2B0A1F] text-xs font-semibold px-2.5 py-1 rounded-full z-10">
              Festival pick
            </span>
          ) : null}

          {/* Minimum order quantity indicator (only for view-only products) */}
          {item.viewOnly && (
            <span className="absolute bottom-3 left-3 z-10 bg-[#2B0A1F]/90 text-[#FBF1DE] text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
              {item.minQty > 1
                ? `${t("Min. order")}: ${item.minQty} ${t("pcs")}`
                : t("Minimum quantity required")}
            </span>
          )}

          {/* Add-to-cart GIF loader */}
          {isAdding && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10">
              <img src="/add.gif" alt="Adding..." className="w-14 h-14" />
            </div>
          )}
        </div>

        {/* Info + Add to Cart */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-[#2B0A1F] line-clamp-2 min-h-[2.5em]">
            {item.title}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            {item.promoPrice ? (
              <>
                <span className="text-base font-semibold text-[#7A0000]">
                  ₹{item.promoPrice}
                </span>
                <span className="text-xs line-through text-[#2B0A1F]/40">
                  ₹{item.price}
                </span>
              </>
            ) : (
              <span className="text-base font-semibold text-[#2B0A1F]">
                ₹{item.price}
              </span>
            )}
          </div>

          {/* Add to Cart / View Product */}
          <div className="mt-3 relative w-full flex justify-center">
            {item.viewOnly ? (
              // Not a <Link>: the whole card is already a Link to /products/slug
              <div
                role="button"
                aria-label={`View ${item.title}`}
                className="group/btn relative w-full overflow-hidden rounded-xl py-2.5 px-4
                 font-semibold text-sm border border-[#2B0A1F] transition-all duration-300
                 hover:border-transparent cursor-pointer text-center"
                style={{ isolation: "isolate" }}
              >
                <span
                  className="absolute left-0 top-0 h-full w-0 bg-[#2B0A1F]
                   transition-all duration-[900ms] ease-in-out
                   group-hover/btn:w-full z-[1] rounded-xl"
                  style={{ transitionProperty: "width", willChange: "width" }}
                />
                <span
                  className="relative z-10 flex items-center justify-center gap-2
                   text-[#2B0A1F] transition-colors duration-300
                   group-hover/btn:text-[#FBF1DE]"
                >
                  <Eye className="w-4 h-4" />
                  {t("View Product")}
                </span>
              </div>
            ) : (
              <button
                disabled={isAdding}
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className={`group/btn relative w-full overflow-hidden rounded-xl py-2.5 px-4
                 font-semibold text-sm border border-[#2B0A1F] transition-all duration-300
                 ${isAdding ? "opacity-60 cursor-not-allowed" : "hover:border-transparent cursor-pointer"}`}
                style={{ isolation: "isolate" }}
              >
                <span
                  className="absolute left-0 top-0 h-full w-0 bg-[#2B0A1F]
                   transition-all duration-[900ms] ease-in-out
                   group-hover/btn:w-full z-[1] rounded-xl"
                  style={{ transitionProperty: "width", willChange: "width" }}
                />
                <span
                  className="relative z-10 flex items-center justify-center gap-2
                   text-[#2B0A1F] transition-colors duration-300
                   group-hover/btn:text-[#FBF1DE]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {isAdding ? t("Adding...") : t("Add to Cart")}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
