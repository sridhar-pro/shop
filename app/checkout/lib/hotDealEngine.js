// Single Hot Deal ("FLATY100") engine for the whole checkout page.
//
// Why: OrderSummary, CheckoutForm and CheckoutAddress were each running their
// OWN copy of the hot-deal logic (2-minute auto-apply timer + 10-minute
// countdown). All three timers fired together, so /api/applyCoupon was called
// 2-3 times, and each copy kept its own private "applied" flag.
//
// Now: one module-level engine. Components subscribe through useHotDeal().
//   - one auto-apply timer, one countdown, one history event
//   - countdown is derived from the persisted expiry timestamp (never drifts,
//     survives reloads)
//   - the engine starts when the first component mounts and stops when the
//     last one unmounts
//   - FREEZE: once the customer clicks Pay, the deal is frozen (no auto-apply,
//     no expiry-removal) so the cart can't change under an order / Razorpay
//     popup that is already open. See freezeHotDeal() / unfreezeHotDeal().

import { createFetchWithAuth, parseCurrency } from "../lib/checkoutHelpers";
import { getCartSummary } from "../lib/cartSummaryService";
import {
  LIMITED_DEAL_CODE,
  LIMITED_DEAL_DURATION,
} from "../components/OrderSummary/constants";

const AUTO_APPLY_DELAY = 120000; // 2 minutes after the checkout page opens
const EXPIRY_KEY = "limited_deal_expiry";
// Cart id that is currently being paid for. Stored (not just in memory) so the
// freeze survives the engine stopping/starting while the page swaps views.
const FROZEN_KEY = "hot_deal_frozen_cart";

// ── observable state ────────────────────────────────────────────────────────
const INITIAL = Object.freeze({
  applied: false,
  remaining: LIMITED_DEAL_DURATION, // seconds
  couponValue: null, // null = engine hasn't measured it yet
});

let state = INITIAL;
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getSnapshot = () => state;
export const getServerSnapshot = () => INITIAL;

// ── internals ───────────────────────────────────────────────────────────────
let consumers = 0;
let autoTimer = null;
let tickTimer = null;
let expiryAt = 0; // ms timestamp
let removing = false;
let historySent = false;
let inflight = null; // the apply/remove currently running (so freeze can wait for it)

let getToken = async () => null;
export const setAuth = (fn) => {
  if (typeof fn === "function") getToken = fn;
};
const fetchJson = createFetchWithAuth((...args) => getToken(...args));

const readExpiry = () => {
  try {
    const n = parseInt(localStorage.getItem(EXPIRY_KEY), 10);
    return n && !Number.isNaN(n) ? n : 0;
  } catch {
    return 0;
  }
};
const writeExpiry = (ms) => {
  try {
    localStorage.setItem(EXPIRY_KEY, String(ms));
  } catch (e) {
    console.warn("Could not persist limited_deal_expiry", e);
  }
};
const clearExpiry = () => {
  try {
    localStorage.removeItem(EXPIRY_KEY);
  } catch {}
};
// true while the CURRENT cart is being paid for
const isFrozenNow = () => {
  try {
    const cartId = localStorage.getItem("cart_id");
    return !!cartId && localStorage.getItem(FROZEN_KEY) === cartId;
  } catch {
    return false;
  }
};

// remember the running apply/remove so freezeHotDeal() can wait for it
const track = (p) => {
  inflight = p;
  const clear = () => {
    if (inflight === p) inflight = null;
  };
  p.then(clear, clear);
  return p;
};

const secondsLeft = (ms) => Math.max(0, Math.ceil((ms - Date.now()) / 1000));

const getClientIP = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip || "unknown";
  } catch (err) {
    console.warn("Failed to fetch client IP", err);
    return "unknown";
  }
};

// Pull the latest cart from the server after the coupon changed
const refreshFromServer = async (cartId) => {
  const summary = await getCartSummary(cartId, fetchJson, { force: true });
  const cartData = summary?.cart_data;
  if (!cartData) return;

  setState({ couponValue: parseCurrency(cartData.coupon_value || 0) });

  try {
    localStorage.setItem("cart_tax_details", JSON.stringify(summary));
  } catch (e) {
    console.warn("Error saving cart_tax_details", e);
  }

  window.dispatchEvent(
    new CustomEvent("local-storage-update", {
      detail: { key: "cart_tax_details" },
    }),
  );
};

// ── countdown ───────────────────────────────────────────────────────────────
const stopTicking = () => {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
};

const startTicking = () => {
  stopTicking();

  // ❄️ Paying: keep showing the time as it was, don't count down / remove
  if (isFrozenNow()) return;

  const tick = () => {
    if (!expiryAt || isFrozenNow()) {
      stopTicking();
      return;
    }
    const left = secondsLeft(expiryAt);
    if (left !== state.remaining) setState({ remaining: left });
    if (left <= 0) {
      stopTicking();
      track(removeDeal()).catch((e) => console.error("removeDeal failed", e));
    }
  };

  tick();
  if (expiryAt) tickTimer = setInterval(tick, 1000);
};

const markApplied = (ms) => {
  expiryAt = ms;
  writeExpiry(ms);
  setState({ applied: true, remaining: secondsLeft(ms) });
  startTicking();
};

// ── apply / remove ──────────────────────────────────────────────────────────
const sendHistoryOnce = async () => {
  if (historySent) return;
  historySent = true;

  try {
    const token = await getToken();
    const clientIp = await getClientIP(); // client-sent IP, not guaranteed accurate

    await fetch("/api/history_save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event: "HOT_DEAL_APPLIED",
        coupon_code: LIMITED_DEAL_CODE,
        ip_address: clientIp,
        cart_items: JSON.parse(localStorage.getItem("cartItemPreview") || "[]"),
      }),
      keepalive: true,
    });
  } catch (e) {
    console.warn("Hot deal history event failed", e);
  }
};

const autoApply = async () => {
  if (isFrozenNow()) return;
  const cartId = localStorage.getItem("cart_id");
  if (!cartId) return;

  let applied = false;

  try {
    const res = await fetchJson("/api/applyCoupon", {
      method: "POST",
      body: { cart_id: cartId, coupon_code: LIMITED_DEAL_CODE },
    });

    const ok = res?.status === true || res?.success === true;
    if (!ok) {
      console.info("Limited deal not applied:", res);
      return;
    }
    applied = true;

    try {
      localStorage.setItem("limited_deal_applied_once", "1");
      localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
    } catch (e) {
      console.warn("Could not persist limited-deal flag", e);
    }

    markApplied(Date.now() + LIMITED_DEAL_DURATION * 1000);

    await refreshFromServer(cartId);

    // Let every component (summary, header, ...) refresh its totals
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.error("Failed to apply limited-time deal:", err);
  }

  // 🔥 history event: once, and only if the deal really got applied
  if (applied) sendHistoryOnce();
};

const removeDeal = async () => {
  if (removing || isFrozenNow()) return;
  removing = true;

  const cartId = localStorage.getItem("cart_id");

  try {
    if (cartId) {
      // Only clear the coupon if the deal is still what's on the cart —
      // never wipe a coupon the customer applied on top of it.
      let shouldRemove = true;
      try {
        const current = await getCartSummary(cartId, fetchJson, {
          force: true,
        });
        shouldRemove = current?.cart_data?.coupon_id === LIMITED_DEAL_CODE;
      } catch {
        shouldRemove = true;
      }

      if (shouldRemove) {
        const res = await fetchJson("/api/applyCoupon", {
          method: "POST",
          body: { cart_id: cartId, coupon_code: "0" },
        });
        const ok = res?.status === true || res?.success === true;
        if (!ok) console.info("Server did not remove limited deal:", res);
      }
    }
  } catch (err) {
    console.error("Failed to remove limited deal coupon:", err);
  } finally {
    expiryAt = 0;
    clearExpiry();
    stopTicking();
    setState({ applied: false, remaining: 0 });

    try {
      localStorage.setItem("last_applied_coupon", "0");
      localStorage.setItem("limited_deal_applied_once", "1");
    } catch (e) {
      console.error("Failed to update last_applied_coupon on removal:", e);
    }

    try {
      if (cartId) await refreshFromServer(cartId);
    } catch (e) {
      console.error("Failed silent refresh after removing limited deal:", e);
    }

    window.dispatchEvent(new Event("cart-updated"));
    removing = false;
  }
};

const maybeAutoApply = () => {
  try {
    if (state.applied) return;
    if (isFrozenNow()) return; // ❄️ payment already started

    const manualCoupon = localStorage.getItem("applied_coupon");
    const limitedOnce =
      localStorage.getItem("limited_deal_applied_once") === "1";
    const lastCoupon = localStorage.getItem("last_applied_coupon");

    // 🚫 any coupon (manual OR an offer card) is already on the cart
    if (lastCoupon && lastCoupon !== "0") return;
    // 🚫 user applied a coupon manually
    if (manualCoupon) return;
    // 🚫 deal already used once
    if (limitedOnce) return;

    track(autoApply());
  } catch (e) {
    console.warn("Auto deal check failed", e);
  }
};

// ── public actions ──────────────────────────────────────────────────────────

// Called with the server's current coupon id every time the cart is fetched.
export const syncFromServer = (couponId) => {
  const isDeal = couponId === LIMITED_DEAL_CODE;
  const hasOtherCoupon = couponId && couponId !== "0" && !isDeal;

  if (isDeal) {
    if (!expiryAt) {
      // Deal is on the cart but we have no record of when it started.
      // Persist a window ONCE so a reload continues it instead of restarting.
      markApplied(readExpiry() || Date.now() + LIMITED_DEAL_DURATION * 1000);
    } else if (!state.applied) {
      setState({ applied: true, remaining: secondsLeft(expiryAt) });
    }
    if (consumers > 0 && !tickTimer) startTicking();
  } else if (hasOtherCoupon) {
    cancelHotDeal(); // a normal coupon replaces the deal
  }
};

// Stop the deal locally (used when a normal coupon replaces it, or after payment)
export const cancelHotDeal = () => {
  stopTicking();
  expiryAt = 0;
  clearExpiry();
  if (state.applied || state.remaining)
    setState({ applied: false, remaining: 0 });
};

const onCouponCleared = () => cancelHotDeal();

// ❄️ Call when the customer clicks Pay (before the coupon is read for the order).
// From now on: no auto-apply, no countdown, no expiry-removal for this cart.
// Waits for an apply/remove that is already running so the cart is stable.
export const freezeHotDeal = async () => {
  try {
    const cartId = localStorage.getItem("cart_id");
    if (cartId) localStorage.setItem(FROZEN_KEY, cartId);
  } catch (e) {
    console.warn("Could not persist hot deal freeze", e);
  }

  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = null;
  stopTicking();

  if (inflight) {
    try {
      await inflight;
    } catch {}
  }
};

// Payment didn't go through (order error / payment failed) or finished:
// release the freeze. The deal resumes normally if the page is still showing it.
export const unfreezeHotDeal = () => {
  try {
    localStorage.removeItem(FROZEN_KEY);
  } catch {}
  if (consumers > 0) arm();
};

// ── lifecycle (ref-counted by useHotDeal) ───────────────────────────────────
// Restore a running deal and (re)arm the auto-apply timer.
// While frozen (payment in progress) it only restores what to DISPLAY.
const arm = () => {
  const stored = readExpiry();
  if (stored) {
    expiryAt = stored;
    const left = secondsLeft(stored);
    setState({ applied: true, remaining: left });
    if (isFrozenNow()) {
      // display only
    } else if (left > 0) {
      startTicking();
    } else {
      // Expired while the page was closed → clean the coupon off the cart
      track(removeDeal()).catch((e) => console.error("removeDeal failed", e));
    }
  }

  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = isFrozenNow()
    ? null
    : setTimeout(maybeAutoApply, AUTO_APPLY_DELAY);
};

const start = () => {
  arm();
  window.addEventListener("coupon-cleared", onCouponCleared);
};

const stop = () => {
  if (autoTimer) clearTimeout(autoTimer);
  autoTimer = null;
  stopTicking();
  window.removeEventListener("coupon-cleared", onCouponCleared);
  expiryAt = 0;
  historySent = false;
  state = INITIAL;
};

export const retain = () => {
  consumers += 1;
  if (consumers === 1) start();
};

export const release = () => {
  consumers = Math.max(0, consumers - 1);
  if (consumers === 0) stop();
};
