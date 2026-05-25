"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Utilities ──────────────────────────────────────────── */
const fmt = (v) =>
  Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const statusColors = (label = "") => {
  const l = label.toLowerCase();
  if (["completed", "paid", "delivered", "success"].some((k) => l.includes(k)))
    return {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    };
  if (["pending", "processing", "partial"].some((k) => l.includes(k)))
    return {
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      dot: "bg-amber-500",
    };
  if (["marketplace", "online", "web"].some((k) => l.includes(k)))
    return {
      badge: "bg-blue-50 text-blue-700 border border-blue-200",
      dot: "bg-blue-500",
    };
  return {
    badge: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  };
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

/* ─── Shared Components ──────────────────────────────────── */
const StatusBadge = ({ label }) => {
  const c = statusColors(label);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-md ${c.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {label}
    </span>
  );
};

const LogoMark = ({ size = 28 }) => (
  <div
    className="rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0"
    style={{ width: size, height: size }}
  >
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect
        x="1"
        y="1"
        width="5"
        height="5"
        rx="1.5"
        fill="white"
        fillOpacity="0.9"
      />
      <rect
        x="8"
        y="1"
        width="5"
        height="5"
        rx="1.5"
        fill="white"
        fillOpacity="0.5"
      />
      <rect
        x="1"
        y="8"
        width="5"
        height="5"
        rx="1.5"
        fill="white"
        fillOpacity="0.5"
      />
      <rect
        x="8"
        y="8"
        width="5"
        height="5"
        rx="1.5"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  </div>
);

/* ─── Spinner ────────────────────────────────────────────── */
const Spinner = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin" />
      <div className="absolute inset-[7px] rounded-full border-2 border-transparent border-b-red-500 animate-[spin_1.1s_linear_infinite_reverse]" />
    </div>
    <p className="text-[11px] tracking-[0.14em] uppercase text-gray-400 font-medium">
      Loading order
    </p>
  </div>
);

/* ══════════════════════════════════════════════════════════
   SALE VIEW — warehouse-style: clean, monochrome, sectioned
══════════════════════════════════════════════════════════ */
const SaleView = ({ order, saleid }) => {
  const {
    sale,
    sale_items: items = [],
    customer_address: address,
    customer,
    payments,
    biller,
  } = order;

  const payment = payments?.[0];
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";
  const getImage = (img) =>
    img
      ? `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${img}`
      : "/fallback.jpeg";

  const totalSavings =
    (Number(sale.product_discount) || 0) + (Number(sale.coupon_value) || 0);
  const statusPills = [sale.sale_status, sale.payment_status].filter(Boolean);
  const itemsTotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased font-odop">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-12 bg-white border-b border-gray-200 gap-3">
        <div className="flex items-center gap-2">
          <LogoMark size={22} />
          <div className="flex items-center gap-1 text-[15px] text-gray-400">
            <span>Orders</span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">
          {sale.reference_no}
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 pb-16 space-y-3">
        {/* ── 1. Order Reference + Status + Total ── */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.02)}
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-1">
                  Order Reference
                </p>
                <p className="text-lg font-bold text-gray-900 tracking-tight font-mono leading-tight">
                  {sale.reference_no}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(sale.date).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                  {" · "}
                  {new Date(sale.date).toLocaleTimeString("en-IN", {
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-1">
                  Grand Total
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                  ₹{fmt(sale.grand_total)}
                </p>
                {sale.total_items && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sale.total_items} items
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {statusPills.map((lbl) => (
                <StatusBadge key={lbl} label={lbl} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── 2. Customer ── */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.06)}
        >
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Customer
            </p>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xl font-semibold text-gray-900 leading-tight">
                {customer?.name}
              </p>
              <p className="text-sm text-gray-400 mt-0.5 truncate">
                {customer?.email}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-700">
                {address?.phone || "—"}
              </p>
            </div>
          </div>
          <div className="px-5 pb-4 border-t border-gray-100 pt-3">
            <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">
              Delivery Address
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {address?.line1}
              {address?.line2 ? `, ${address.line2}` : ""}, {address?.city},{" "}
              {address?.state} – {address?.postal_code}
            </p>
          </div>
        </motion.div>

        {/* ── 3. Items ── */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.1)}
        >
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gray-400">
              Items — {items.length} product{items.length !== 1 ? "s" : ""}
            </p>
          </div>

          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50/80 transition-colors ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.12 + idx * 0.05 }}
              >
                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={getImage(item.image)}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50"
                    onError={(e) => {
                      e.target.src = "/fallback.jpeg";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-gray-900 text-white text-[10px] font-bold font-mono flex items-center justify-center border-2 border-white shadow-sm">
                    {parseInt(item.quantity)}
                  </div>
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                    {item.product_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {item.variant && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.variant}
                      </span>
                    )}
                    {item.variant_dropdown?.trim() && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.variant_dropdown.trim()}
                      </span>
                    )}
                    {item.product_unit_code && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.product_unit_code}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {item.tax_name} · HSN {item.tax_code}
                    {item.product_code ? ` · SKU ${item.product_code}` : ""}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900 tabular-nums">
                    ₹{fmt(item.subtotal)}
                  </p>
                  <p className="font-mono text-[10px] text-gray-400 mt-0.5">
                    ₹{fmt(item.unit_price)} × {parseInt(item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Summary rows */}
          <div className="border-t border-gray-100 bg-gray-50/50">
            {[
              { label: "Items subtotal", val: `₹${fmt(sale.total)}`, cls: "" },
              ...(Number(sale.product_discount) > 0
                ? [
                    {
                      label: "Product discount",
                      val: `−₹${fmt(sale.product_discount)}`,
                      cls: "text-red-600",
                    },
                  ]
                : []),
              ...(Number(sale.coupon_value) > 0
                ? [
                    {
                      label: "Coupon",
                      val: `−₹${fmt(sale.coupon_value)}`,
                      cls: "text-red-600",
                    },
                  ]
                : []),
              {
                label: `Tax (${items[0]?.tax_name})`,
                val: `₹${fmt(sale.total_tax)}`,
                cls: "",
              },
              {
                label: "Shipping",
                val:
                  Number(sale.shipping) === 0
                    ? "Free"
                    : `₹${fmt(sale.shipping)}`,
                cls:
                  Number(sale.shipping) === 0
                    ? "text-emerald-600 font-semibold"
                    : "",
              },
            ].map(({ label, val, cls }, i) => (
              <div
                key={i}
                className={`flex justify-between items-center px-5 py-2.5 text-xs ${i > 0 ? "border-t border-gray-50" : ""}`}
              >
                <span className="text-gray-500">{label}</span>
                <span className={`font-medium tabular-nums ${cls}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* Savings bar */}
          {totalSavings > 0 && (
            <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 2l1.3 3.5H12l-2.9 2.2 1.1 3.5L7 9l-3.2 2.2 1.1-3.5L2 5.5h3.7L7 2z"
                    fill="currentColor"
                  />
                </svg>
                Total savings on this order
              </span>
              <span className="text-sm font-bold text-emerald-700 tabular-nums">
                −₹{fmt(totalSavings)}
              </span>
            </div>
          )}

          {/* Grand total */}
          <div className="flex justify-between items-center px-5 py-4 bg-gray-900 border-t border-gray-200">
            <span className="text-xs font-medium text-white/50 tracking-widest uppercase">
              Grand Total
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              ₹{fmt(sale.grand_total)}
            </span>
          </div>
        </motion.div>

        {/* ── 5. Biller ── */}
        {biller && (
          <motion.div
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            {...fadeUp(0.18)}
          >
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gray-400">
                Biller
              </p>
            </div>
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 4h10M2 7h10M2 10h5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-tight">
                  {biller?.company}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {biller?.address}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   WAREHOUSE VIEW — unchanged
══════════════════════════════════════════════════════════ */
const WarehouseView = ({ order, saleid, warehouseid }) => {
  const {
    sale,
    sale_items: items = [],
    customer_address: address,
    customer,
    payments,
    biller,
  } = order;

  const payment = payments?.[0];
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";
  const getImage = (img) =>
    img
      ? `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${img}`
      : "/fallback.jpeg";

  const totalSavings =
    (Number(sale.product_discount) || 0) + (Number(sale.coupon_value) || 0);
  const statusPills = [sale.sale_status, sale.payment_status].filter(Boolean);
  const itemsTotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased font-odop">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-12 bg-white border-b border-gray-200 gap-3">
        <div className="flex items-center gap-2">
          <LogoMark size={22} />
          <div className="flex items-center gap-1 text-[15px] text-gray-400">
            <span>Orders</span>
          </div>
        </div>
        <span className="font-mono text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded">
          {sale.reference_no}
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 pb-16 space-y-3">
        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.02)}
        >
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                  Order Reference
                </p>
                <p className="text-lg font-bold text-gray-900 tracking-tight font-mono leading-tight">
                  {sale.reference_no}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(sale.date).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  })}
                  {" · "}
                  {new Date(sale.date).toLocaleTimeString("en-IN", {
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                  ₹{fmt(itemsTotal)}
                </p>
                {/* {sale.total_items && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {sale.total_items} items
                  </p>
                )} */}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {statusPills.map((lbl) => (
                <StatusBadge key={lbl} label={lbl} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.06)}
        >
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-[15px] font-semibold tracking-[0.12em] uppercase text-gray-400">
              Customer
            </p>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xl font-semibold text-gray-900 leading-tight">
                {customer?.name}
              </p>
              <p className="text-md text-gray-400 mt-0.5 truncate">
                {customer?.email}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-700">
                {address?.phone || "—"}
              </p>
            </div>
          </div>
          <div className="px-5 pb-4 border-t border-gray-100 pt-3">
            <p className="text-[9px] font-semibold tracking-[0.12em] uppercase text-gray-400 mb-1.5">
              Delivery Address
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {address?.line1}
              {address?.line2 ? `, ${address.line2}` : ""}, {address?.city},{" "}
              {address?.state} – {address?.postal_code}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          {...fadeUp(0.1)}
        >
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[15px] font-semibold tracking-[0.12em] uppercase text-gray-400">
              Items — {items.length} product{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50/80 transition-colors ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.12 + idx * 0.05 }}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={getImage(item.image)}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 bg-gray-50"
                    onError={(e) => {
                      e.target.src = "/fallback.jpeg";
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-gray-900 text-white text-[10px] font-bold font-mono flex items-center justify-center border-2 border-white shadow-sm">
                    {parseInt(item.quantity)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                    {item.product_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {item.variant && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.variant}
                      </span>
                    )}
                    {item.variant_dropdown?.trim() && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {item.variant_dropdown.trim()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-md font-bold text-gray-900 tabular-nums">
                    ₹{fmt(item.subtotal)}
                  </p>
                  <p className="font-mono text-[15px] text-gray-400 mt-0.5">
                    ₹{fmt(item.unit_price)} × {parseInt(item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="flex justify-between items-center px-5 py-4 bg-gray-900 border-t border-gray-200">
            <span className="text-xs font-medium text-white/50 tracking-widest uppercase">
              Total
            </span>
            <span className="text-lg font-bold text-white tabular-nums">
              ₹{fmt(itemsTotal)}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ─── Root Page ──────────────────────────────────────────── */

const Page = ({ params }) => {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug || [];

  let saleid = null;
  let warehouseid = null;

  if (slug[0]) {
    const parts = slug[0].split("-");
    saleid = parts[0];
    warehouseid = parts[1] || null;
  }

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  /* ───────────────── FETCH ORDER WITH TOKEN ───────────────── */
  useEffect(() => {
    if (!saleid) return;

    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        setOrder(null); // 🔥 important: reset state

        let activeToken = null;

        // ✅ STEP 1: ALWAYS generate fresh token (no localStorage)
        let tokenRetry = 0;

        while (!activeToken && tokenRetry < 3) {
          try {
            const res = await fetch("/api/login", {
              method: "POST",
            });

            const data = await res.json();

            if (data?.status === "success" && data?.token) {
              activeToken = data.token;
              break;
            }
          } catch (err) {
            console.log("Login retry failed");
          }

          tokenRetry++;
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (!activeToken) {
          throw new Error("Token generation failed after retries");
        }

        if (cancelled) return;

        setToken(activeToken);

        // ✅ STEP 2: Fetch order ONLY after token
        let orderData = null;
        let orderRetry = 0;

        const body = {
          saleid: Number(saleid),
          ...(warehouseid && { warehouseid: Number(warehouseid) }),
        };

        while (!orderData && orderRetry < 3) {
          try {
            const res = await fetch("/api/seller_orderdetails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${activeToken}`,
              },
              body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data?.status && data?.data) {
              orderData = data.data;
              break;
            }
          } catch (err) {
            console.log("Order retry failed");
          }

          orderRetry++;
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (cancelled) return;

        // ✅ FINAL DECISION AFTER ALL RETRIES
        if (orderData) {
          setOrder(orderData);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [saleid, warehouseid]);

  /* ───────────────── UI STATES ───────────────── */

  if (loading) return <Spinner />;

  // 👇 only show error AFTER loading is done
  if (!loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center max-w-sm w-full">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
              <span className="text-xl">📦</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800">
            Order Not Found
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 mt-2">
            We couldn’t find your order details. It might have expired or the
            link is invalid.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
            >
              Retry
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return warehouseid ? (
    <WarehouseView order={order} saleid={saleid} warehouseid={warehouseid} />
  ) : (
    <SaleView order={order} saleid={saleid} />
  );
};

export default Page;
