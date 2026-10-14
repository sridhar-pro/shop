"use client";
import { useState, useEffect, useRef } from "react";
import { parseCurrency } from "../../lib/checkoutHelpers";
import { getCartSummary } from "../../lib/cartSummaryService";
import { syncFromServer } from "../../lib/hotDealEngine";
import { LIMITED_DEAL_CODE } from "./constants";

/**
 * Owns cart items, totals, offers and the fetchSummary() sync with the server.
 *
 * fetchSummary({ showSpinner = false, silent = false })
 * - silent: update totals & items but DO NOT touch coupon UI state
 *
 * The "cart-updated" listener always calls the LATEST fetchSummary (see the
 * ref at the bottom), so it sees current state (initialLoading, code, ...).
 * Hot Deal state is not kept here any more: the shared engine
 * (lib/hotDealEngine.js) is told what coupon the server has via syncFromServer.
 */
export default function useCartSummary({ fetchWithAuth, coupon }) {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // 🔁 Split loading states so we don't unmount the input while typing
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [customizedTexts, setCustomizedTexts] = useState({});
  const [bogoOffers, setBogoOffers] = useState([]);
  const [offers, setOffers] = useState([]);

  const {
    setCode,
    lastAppliedCodeRef,
    couponSource,
    setCouponSource,
    setAppliedOfferCode,
    setIsApplied,
    setIsManualCouponApplied,
    setCouponValue,
    setCouponMessage,
  } = coupon;

  const fetchSummary = async ({ showSpinner = false, silent = false } = {}) => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      setInitialLoading(false);
      return;
    }

    try {
      if (initialLoading) {
        // Only during first mount show skeleton
        setInitialLoading(true);
      } else if (showSpinner) {
        // Light refresh spinner (doesn't unmount input)
        setIsRefreshing(true);
      }

      const response = await getCartSummary(cartId, fetchWithAuth);

      // ✅ Save bogo_offers
      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
      }

      // ✅ Save offers
      if (response?.offers) {
        setOffers(response.offers);
      }

      const cartData = response?.cart_data;
      if (!cartData) {
        // Server has no cart any more: don't keep showing the old items/totals
        setCartItems([]);
        setCustomizedTexts({});
        setSubtotal(0);
        setShipping(0);
        setTax(0);
        setTotal(0);
        setCouponValue(0);
        try {
          localStorage.removeItem("cartItemPreview");
        } catch {}
        return;
      }

      // ✍️ Customized print texts (per item)
      const textsMap = {};
      Object.values(cartData.contents || {}).forEach((item) => {
        if (item?.customize_text) {
          textsMap[item.rowid] = item.customize_text;
        }
      });
      setCustomizedTexts(textsMap);
      console.log("🧾 Custom print texts (per item):", textsMap);

      // 🛒 Extract items
      const itemsArray = Object.values(cartData.contents || {}).map((item) => ({
        rowid: item.rowid,
        product_id: item.product_id,
        id: item.id,
        name: item.name,
        price: parseCurrency(item.price),
        qty: item.qty,
        subtotal:
          item.subtotal ||
          `₹${(parseCurrency(item.price) * item.qty).toFixed(2)}`,
        image: item.image || "/fallback.png",
        deliveryDays: item.deliveryDays || null,
        code: item.code,
        is_free_item: item.is_free_item,
      }));
      setCartItems(itemsArray);

      // 🔹 Keep a lightweight cart preview in localStorage (always in sync)
      try {
        if (typeof window !== "undefined") {
          if (!itemsArray.length) {
            // Cart empty → clear preview
            localStorage.removeItem("cartItemPreview");
          } else {
            const minimalCartPreview = itemsArray.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              name: item.name,
              image: item.image,
            }));

            localStorage.setItem(
              "cartItemPreview",
              JSON.stringify(minimalCartPreview),
            );
          }
        }
      } catch (err) {
        console.warn("[cartItemPreview] failed to write to localStorage:", err);
      }

      // Totals
      setSubtotal(parseCurrency(cartData.subtotal));
      setShipping(parseCurrency(cartData.shipping));
      setTax(parseCurrency(cartData.total_item_tax));
      setTotal(parseCurrency(cartData.grand_total));

      // ✅ Coupon state
      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";
      const isLimitedCoupon = cartData.coupon_id === LIMITED_DEAL_CODE;

      if (!silent) {
        if (appliedCoupon) {
          if (isLimitedCoupon) {
            // 🔒 Treat limited deal coupon as "invisible" in the coupon UI
            syncFromServer(cartData.coupon_id);
            setCouponMessage("");
            setCouponValue(parseCurrency(cartData.coupon_value || 0));

            // persist the "applied once" guard + last applied coupon
            try {
              localStorage.setItem("limited_deal_applied_once", "1");
              localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
            } catch (e) {
              console.warn("Could not persist limited-deal flag", e);
            }

            // Do NOT show it as applied in the normal coupon UI
            setIsApplied(false); // keep button active (user coupons separate)
            setIsManualCouponApplied(false);
            // leave `code` as-is so user input isn't hijacked
          } else {
            // Normal coupon flow (manual OR offer)
            setIsApplied(true);
            setCouponMessage("");
            setCouponValue(parseCurrency(cartData.coupon_value || 0));

            const source =
              couponSource || localStorage.getItem("coupon_source");

            if (source === "manual") {
              setCode(cartData.coupon_id); // ✅ show
              lastAppliedCodeRef.current = cartData.coupon_id;
              setIsManualCouponApplied(true); // ✅ mark manual as applied
            } else {
              setCode(""); // ❌ hide
              setIsManualCouponApplied(false); // ✅ not a manual coupon
            }
            // A normal coupon overrides the hot-deal flag
            syncFromServer(cartData.coupon_id);

            // Track the last applied coupon for checkout payload
            try {
              localStorage.setItem("last_applied_coupon", cartData.coupon_id);
              localStorage.setItem(
                "cart_coupon_value",
                parseCurrency(cartData.coupon_value || 0),
              );
            } catch (e) {
              console.warn(
                "Could not persist last_applied_coupon from cartData",
                e,
              );
            }
          }
        } else {
          // ❌ No coupon → FULL reset
          setCouponValue(0);
          setIsApplied(false);
          setIsManualCouponApplied(false);
          setCouponSource(null);
          localStorage.removeItem("coupon_source");
          setAppliedOfferCode(null);
          localStorage.removeItem("applied_offer_code");
          // Keep local last_applied_coupon in sync with backend
          try {
            localStorage.setItem("last_applied_coupon", "0");
            localStorage.removeItem("applied_coupon");
            localStorage.removeItem("cart_coupon_value");
          } catch (e) {
            console.warn("Could not clear coupon storage", e);
          }
          // don't touch limitedDealApplied here; timed removal handles it
        }
      } else {
        // Silent refresh: just keep totals in sync
        setCouponValue(parseCurrency(cartData.coupon_value || 0));

        if (appliedCoupon) {
          if (isLimitedCoupon) {
            syncFromServer(cartData.coupon_id);
            try {
              localStorage.setItem("limited_deal_applied_once", "1");
              localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
            } catch (e) {
              console.warn("Could not persist limited-deal flag (silent)", e);
            }
          } else {
            // Normal coupon during silent refresh
            syncFromServer(cartData.coupon_id);
            try {
              localStorage.setItem("last_applied_coupon", cartData.coupon_id);
            } catch (e) {
              console.warn(
                "Could not persist last_applied_coupon from cartData (silent)",
                e,
              );
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  // Always points at this render's fetchSummary (fresh initialLoading / code / source)
  const fetchSummaryRef = useRef(fetchSummary);
  fetchSummaryRef.current = fetchSummary;

  // Initial load + refresh whenever anything fires "cart-updated"
  useEffect(() => {
    fetchSummary({ showSpinner: true });

    const handleCartUpdate = () =>
      fetchSummaryRef.current({ showSpinner: true });
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  return {
    fetchSummary,
    cartItems,
    setCartItems,
    subtotal,
    shipping,
    tax,
    total,
    initialLoading,
    isRefreshing,
    customizedTexts,
    bogoOffers,
    offers,
  };
}
