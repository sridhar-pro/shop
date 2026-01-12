"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { TrendingUp, Trash2, Timer, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OrderSummary = () => {
  const { getValidToken } = useAuth();
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // 🔁 Split loading states so we don't unmount the input while typing
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [processingItems, setProcessingItems] = useState({});
  const [applyingOffer, setApplyingOffer] = useState(false);
  const [couponValue, setCouponValue] = useState(0);
  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [appliedOffers, setAppliedOffers] = useState([]);
  const [couponMessage, setCouponMessage] = useState("");
  const [bogoOffers, setBogoOffers] = useState([]);

  // Limited-deal config
  const LIMITED_DEAL_CODE = "TEST30"; //TEST50 //FLATY100
  const LIMITED_DEAL_DURATION = 600; // seconds (10 minutes)
  const [limitedDealApplied, setLimitedDealApplied] = useState(false);
  const [dealTimer, setDealTimer] = useState(LIMITED_DEAL_DURATION);

  // Debounce timer + stable focus
  const debounceRef = useRef(null);
  const codeInputRef = useRef(null);

  const setProcessing = (id, value) =>
    setProcessingItems((prev) => ({ ...prev, [id]: value }));

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getValidToken();
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  /**
   * fetchSummary({ showSpinner = false, silent = false })
   * - silent: when true, update cart totals & items but DO NOT touch coupon UI state
   */
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

      const response = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      // ✅ Save bogo_offers
      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
      }

      const cartData = response?.cart_data;
      if (!cartData) return;

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
        deliveryDays: item.deliveryDays || null, // ✅ NEW
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
              JSON.stringify(minimalCartPreview)
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
            setLimitedDealApplied(true);
            setCouponMessage("");
            setCouponValue(parseCurrency(cartData.coupon_value || 0));

            // persist the "applied once" guard + last applied coupon
            try {
              localStorage.setItem("limited_deal_applied_once", "1");
              localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
            } catch (e) {
              console.warn("Could not persist limited-deal flag", e);
            }

            // IMPORTANT:
            // Do NOT show it as applied in the normal coupon UI
            setIsApplied(false); // keep button active (user coupons separate)
            // leave `code` as-is so user input isn't hijacked
          } else {
            // Normal coupon flow (user-entered coupon)
            setIsApplied(true);
            setCode(cartData.coupon_id);
            setCouponMessage("");
            setCouponValue(parseCurrency(cartData.coupon_value || 0));

            // If a normal coupon is now applied, this overrides hot-deal flag
            setLimitedDealApplied(false);

            // Track the last applied coupon for checkout payload
            try {
              localStorage.setItem("last_applied_coupon", cartData.coupon_id);
            } catch (e) {
              console.warn(
                "Could not persist last_applied_coupon from cartData",
                e
              );
            }
          }
        } else {
          // No coupon on cart
          setCouponValue(0);
          setIsApplied(false);

          // Keep local last_applied_coupon in sync with backend
          try {
            localStorage.setItem("last_applied_coupon", "0");
          } catch (e) {
            console.warn("Could not clear last_applied_coupon", e);
          }
          // don't touch limitedDealApplied here; timed removal handles it
        }
      } else {
        // Silent refresh: just keep totals in sync
        setCouponValue(parseCurrency(cartData.coupon_value || 0));

        if (appliedCoupon) {
          if (isLimitedCoupon) {
            setLimitedDealApplied(true);
            try {
              localStorage.setItem("limited_deal_applied_once", "1");
              localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
            } catch (e) {
              console.warn("Could not persist limited-deal flag (silent)", e);
            }
          } else {
            // Normal coupon during silent refresh
            setLimitedDealApplied(false);
            try {
              localStorage.setItem("last_applied_coupon", cartData.coupon_id);
            } catch (e) {
              console.warn(
                "Could not persist last_applied_coupon from cartData (silent)",
                e
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

  const handleApply = async () => {
    const cartId = localStorage.getItem("cart_id");
    const trimmed = code.trim();

    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      return;
    }

    try {
      const response = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: trimmed },
      });

      const failed =
        response?.status === false ||
        response?.status === "error" ||
        response?.success === false;

      if (failed) {
        setCouponMessage(response?.message || "Failed to apply coupon");
        setIsApplied(false);
        localStorage.removeItem("applied_coupon");
      } else {
        setCouponMessage("");
        setIsApplied(true);

        // Manual coupon: track both manual and "last applied"
        localStorage.setItem("applied_coupon", trimmed);
        localStorage.setItem("last_applied_coupon", trimmed);

        window.dispatchEvent(new Event("cart-updated"));
        console.log("🎉 Coupon applied — cart-updated event dispatched!");
      }

      // ⚠️ Refresh WITHOUT flipping to skeleton, so input stays mounted
      await fetchSummary({ showSpinner: false });

      // Keep focus in the field for continued typing if needed
      requestAnimationFrame(() => {
        codeInputRef.current && codeInputRef.current.focus();
      });
    } catch (err) {
      console.error("❌ Error applying coupon:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
    }
  };

  // 👇 Debounced live validation (no full-page loading state)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Avoid spamming API when user clears the field
    if (!code.trim()) {
      setCouponMessage("");
      setIsApplied(false);
      setCouponValue(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      handleApply();
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  // 🔁 Restore limited-deal timer from localStorage on mount
  useEffect(() => {
    try {
      const expiryRaw = localStorage.getItem("limited_deal_expiry");
      if (!expiryRaw) return;

      const expiry = parseInt(expiryRaw, 10);
      if (!expiry || Number.isNaN(expiry)) return;

      const now = Date.now();
      const remaining = Math.floor((expiry - now) / 1000);

      if (remaining > 0) {
        setLimitedDealApplied(true);
        setDealTimer(remaining);
      } else {
        // expired, clean up stale value
        localStorage.removeItem("limited_deal_expiry");
      }
    } catch (e) {
      console.warn("Failed to restore limited deal timer:", e);
    }
  }, []);

  // Auto apply limited deal (2 mins here via 120000ms)
  // Skip if user already saw/applied the limited deal once (persisted)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const manualCoupon = localStorage.getItem("applied_coupon");
        const limitedOnce =
          localStorage.getItem("limited_deal_applied_once") === "1";

        // 🚫 HARD STOP: user already applied coupon manually
        if (manualCoupon) return;

        // 🚫 HARD STOP: limited deal already used once
        if (limitedOnce) return;

        // ✅ Safe to auto-apply
        autoApplyLimitedDeal();
      } catch (e) {
        console.warn("Auto deal check failed", e);
      }
    }, 120000); // 2 minutes

    return () => clearTimeout(timer);
  }, []);

  const autoApplyLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      // Fire the apply endpoint but keep the application "silent" — do NOT mutate coupon UI state
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: LIMITED_DEAL_CODE },
      });

      const ok = res?.status === true || res?.success === true;
      if (ok) {
        // persist that we've auto-applied this limited deal once
        try {
          const expiry = Date.now() + LIMITED_DEAL_DURATION * 1000;
          localStorage.setItem("limited_deal_applied_once", "1");
          localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
          localStorage.setItem("limited_deal_expiry", expiry.toString());

          const remaining = Math.floor((expiry - Date.now()) / 1000);
          setDealTimer(remaining > 0 ? remaining : 0);
        } catch (e) {
          console.warn("Could not persist limited-deal flag", e);
        }

        // Set our local "limited deal" flag so we can show the custom banner and start countdown
        setLimitedDealApplied(true);

        // Refresh totals silently (so totals/couponValue update) but we DO NOT change coupon input or apply-badge
        await fetchSummary({ showSpinner: false, silent: true });
      } else {
        console.info("Limited deal not applied:", res);
      }
    } catch (err) {
      console.error("Failed to apply limited-time deal:", err);
    }
  };

  // remove limited deal server-side by sending coupon_code: "0", then refresh totals
  const removeLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      // Use applyCoupon endpoint with coupon_code "0" to clear coupon on server
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: "0" },
      });

      const ok = res?.status === true || res?.success === true;
      if (!ok) {
        console.info(
          "Server didn't remove limited deal coupon (applyCoupon returned):",
          res
        );
      }
    } catch (err) {
      console.error(
        "Failed to remove limited deal coupon (via applyCoupon '0'):",
        err
      );
    } finally {
      // clear local flags + refresh totals (silent so it won't touch coupon UI)
      setLimitedDealApplied(false);
      setDealTimer(0);

      try {
        // No coupon active anymore from hot deal's side
        localStorage.setItem("last_applied_coupon", "0");
        localStorage.removeItem("limited_deal_expiry");
      } catch (e) {
        console.error("Failed to update last_applied_coupon on removal:", e);
      }

      try {
        await fetchSummary({ showSpinner: true, silent: true });
      } catch (e) {
        console.error("Failed silent refresh after removing limited deal:", e);
      }
    }
  };

  // Deal countdown (runs only when limitedDealApplied)
  useEffect(() => {
    if (!limitedDealApplied) return;

    const interval = setInterval(() => {
      setDealTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // call async remover (do not await here)
          removeLimitedDeal().catch((e) =>
            console.error("removeLimitedDeal failed", e)
          );
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitedDealApplied]);

  useEffect(() => {
    fetchSummary({ showSpinner: true });

    const handleCartUpdate = () => fetchSummary({ showSpinner: true });
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return;

    const toastId = toast.loading("Applying offer...");

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.update(toastId, {
          render: "Cart ID not found ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
        return;
      }

      const res = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      const message = res?.message?.toLowerCase() || "";
      if (message.includes("offer applied successfully")) {
        toast.update(toastId, {
          render: "Offer applied successfully 🎉",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setAppliedOffers((prev) => [...prev, bogoId]);
        window.dispatchEvent(new Event("cart-updated"));
      } else if (res?.status === "error") {
        toast.update(toastId, {
          render: res?.message || "Failed to apply offer ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: error.message || "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  const removeItem = async (productId) => {
    if (processingItems[productId]) return;
    setProcessing(productId, true);

    try {
      const cartResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: localStorage.getItem("cart_id") },
      });

      const cartDataAPI = cartResponse?.cart_data;
      if (!cartDataAPI) throw new Error("Cart is empty");

      const cartItemsArray = Object.values(cartDataAPI.contents || {});
      const itemToRemove = cartItemsArray.find(
        (item) => item.product_id === productId
      );
      if (!itemToRemove) throw new Error("Item not found in cart");

      const { rowid } = itemToRemove;
      const token = await getValidToken();
      const res = await fetch("/api/cartRemove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id: localStorage.getItem("cart_id"),
          rowid,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        setCartItems((prev) => {
          const updatedCart = prev.filter((item) => item.rowid !== rowid);
          if (updatedCart.length === 0) {
            toast.info("Your cart is empty — taking you to products!", {
              position: "top-right",
              autoClose: 1800,
            });
            setTimeout(() => {
              window.location.href = "/products";
            }, 1800);
          }
          return updatedCart;
        });

        window.dispatchEvent(new Event("cart-updated"));
        toast.success("Item removed from cart", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        throw new Error(data.message || "Failed to remove item");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    } finally {
      setProcessing(productId, false);
    }
  };

  const decodeHTML = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  return (
    <div className="w-full lg:w-[440px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-gray-300 hidden md:block hide-scrollbar">
      <div className="space-y-6">
        <h1 className="text-xl font-[800] tracking-tight">Order Summary</h1>

        {/* Initial skeleton only on first mount */}
        {initialLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
            <div className="flex gap-2 items-center">
              <div className="flex-1 h-10 bg-gray-200 rounded" />
              <div className="h-10 w-20 bg-gray-200 rounded" />
            </div>
            <div className="border-t pt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-16" />
                  <div className="h-3 bg-gray-200 rounded w-10" />
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <div className="h-4 bg-gray-300 rounded w-20" />
                <div className="h-4 bg-gray-300 rounded w-14" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
            </div>
            <div className="mt-6">
              <div className="h-4 bg-gray-300 rounded w-32 mb-3" />
              <div className="h-16 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* 🛍 Cart Items */}
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between gap-4 border-b border-gray-200 py-3"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {decodeHTML(item.name)} <br /> x {item.qty}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                      {item.deliveryDays && (
                        <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-red-700" />
                          Delivered in {item.deliveryDays} days
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-gray-500 hover:text-black transition p-1 flex-shrink-0 flex items-center justify-center w-6 h-6 relative"
                    disabled={processingItems[item.product_id]}
                  >
                    {processingItems[item.product_id] ? (
                      <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 🎁 Discount Input (never unmounted during refresh) */}
            <div className="flex gap-2 items-center">
              <input
                ref={codeInputRef}
                type="text"
                placeholder="Discount code"
                value={code}
                autoComplete="off"
                onChange={(e) => {
                  setCode(e.target.value);
                  setCouponMessage("");
                  setCouponValue(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApply();
                  }
                }}
                className="input flex-1 bg-white"
              />

              <div className="flex flex-col items-center relative">
                <button
                  onClick={handleApply}
                  disabled={isApplied}
                  className={`bg-gray-200 text-sm font-bold px-4 py-2 rounded-md relative z-10 transition-all duration-200 ${
                    isApplied ? "text-green-600" : "text-gray-600"
                  }`}
                  title={isApplied ? "Coupon already applied" : "Apply coupon"}
                >
                  {isApplied ? "Applied" : "Apply"}
                </button>
                {isApplied && (
                  <span className="mt-1 text-xs text-green-600 font-medium">
                    Coupon Applied
                  </span>
                )}
              </div>
            </div>

            {/* Inline light refresh indicator (doesn't unmount input) */}
            {isRefreshing && (
              <div className="text-xs text-gray-500 mt-1">Updating…</div>
            )}

            {/* Always show below Apply button */}
            {couponMessage ? (
              <span className="mt-1 text-xs text-red-600 font-medium px-4 text-center flex justify-center">
                {couponMessage}
              </span>
            ) : null}

            {/* 📦 Summary */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>

              {couponValue > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount price</span>
                  <span>- ₹{couponValue.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 items-start">
                <div className="flex flex-col">
                  <span className="font-bold text-lg flex items-center gap-2">
                    Total
                    {limitedDealApplied && (
                      <span className="text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-amber-500/10 text-[#A00300] border border-amber-400/40">
                        Hot Deal
                      </span>
                    )}
                  </span>

                  {limitedDealApplied && (
                    <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                      {/* Old total slashed */}
                      <span className="line-through text-gray-500">
                        ₹{(total + (couponValue || 100)).toFixed(2)}
                      </span>

                      {/* Savings */}
                      <span className="text-red-700 tracking-wider font-semibold">
                        -₹{(couponValue || 100).toFixed(2)} saved
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end">
                  {/* Final total */}
                  <span
                    className={`font-bold ${
                      limitedDealApplied ? "text-green-600 text-xl" : "text-lg"
                    }`}
                  >
                    ₹{total.toFixed(2)}
                  </span>

                  {limitedDealApplied && (
                    <span className="mt-1 text-[13px] font-semibold text-[#A00300] tracking-wide flex items-center gap-1">
                      <Timer className="w-4 h-4 text-[#A00300]" />
                      {Math.floor(dealTimer / 60)
                        .toString()
                        .padStart(2, "0")}
                      :{(dealTimer % 60).toString().padStart(2, "0")} left
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Including ₹{tax.toFixed(2)} in taxes
              </p>
            </div>

            {/* 💸 More Offers */}
            {bogoOffers.length > 0 && (
              <div className="mt-6">
                <h2 className="text-base font-bold mb-3">More offers</h2>

                <div className="space-y-4">
                  {bogoOffers.map((offer) => {
                    const isOfferApplied = appliedOffers.includes(offer.id);
                    return (
                      <div
                        key={offer.id}
                        className="relative flex bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        {/* Ribbon Left */}
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-b from-[#A00300] to-red-700 flex items-center justify-center">
                          <span className="text-[26px] font-extrabold text-white transform -rotate-90 whitespace-nowrap tracking-wider uppercase italic shadow-md">
                            {offer.title}
                          </span>
                        </div>

                        {/* Offer Content */}
                        <div className="flex-1 pl-20 p-5">
                          <div className="flex justify-between items-start capitalize mb-3">
                            <span
                              className="font-bold text-sm text-gray-600 text-justify"
                              dangerouslySetInnerHTML={{
                                __html: offer.description,
                              }}
                            />
                            <button
                              className={`text-xs font-semibold text-white px-3 py-1 rounded-lg shadow transition-colors ml-4 shrink-0
                              ${
                                isOfferApplied
                                  ? "bg-gray-500 cursor-not-allowed"
                                  : "bg-[#A00300] hover:bg-red-700"
                              }`}
                              onClick={() =>
                                !isOfferApplied && applyBogoOffer(offer.id)
                              }
                              disabled={applyingOffer || isOfferApplied}
                              title={
                                isOfferApplied
                                  ? "Offer already applied"
                                  : "Click to apply offer"
                              }
                            >
                              {isOfferApplied
                                ? "APPLIED"
                                : applyingOffer
                                ? "Applying"
                                : "APPLY"}
                            </button>
                          </div>

                          <hr className="my-3 border-dashed border-gray-300" />

                          {/* Eligible Products */}
                          <details className="mt-2 group">
                            <summary className="cursor-pointer text-xs font-semibold text-gray-600 hover:text-[#A00300] flex items-center gap-1">
                              <Link
                                href="/products/special-offers"
                                className="hover:text-[#A00300] flex items-center gap-1"
                              >
                                <TrendingUp className="w-4 h-4 text-[#A00300]" />
                                Eligible Products
                              </Link>
                            </summary>
                          </details>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
