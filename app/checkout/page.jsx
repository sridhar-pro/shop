"use client";
import { useState, useEffect, useRef } from "react";
import { RefreshCcw, ShoppingBag } from "lucide-react";
import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/AuthContext";
import { useSession } from "../context/SessionContext";
import ScratchCardPopup from "./ScratchCard";
import { toast } from "react-toastify";

export default function CheckoutPage({ formData }) {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const { getValidToken } = useAuth();
  const { isLoggedIn } = useSession();

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customizedTexts, setCustomizedTexts] = useState({});

  const [orderData, setOrderData] = useState(null);

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [couponValue, setCouponValue] = useState(0);

  const [showScratch, setShowScratch] = useState(true);

  const [code, setCode] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state

  const [bogoOffers, setBogoOffers] = useState([]);

  const [applyingOffer, setApplyingOffer] = useState(false); // track button state

  useEffect(() => {
    // 🎉 Auto-trigger scratch card after page load
    const timer = setTimeout(() => {
      setShowScratch(true);
    }, 1500); // Delay for cinematic effect 😎
    return () => clearTimeout(timer);
  }, [setShowScratch]);

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

  const fetchSummary = async () => {
    const cartId = localStorage.getItem("cart_id");
    // 🛑 No cart ID found — redirect immediately
    if (!cartId) {
      toast.error("Please add a product to continue checkout", {
        style: {
          background: "#000",
          color: "#fff",
          fontFamily: "var(--font-odop)",
        },
        position: "top-right",
        className: "!mt-8",
      });

      setTimeout(() => router.push("/products"), 1000);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      const data = await response;
      console.log("CartData", data);

      // ✅ If cart_data is missing or contents empty, redirect
      const cartData = response?.cart_data;

      // ✍️ Collect personalised text per item
      const textsMap = {};

      Object.values(cartData.contents || {}).forEach((item) => {
        if (item?.customize_text) {
          textsMap[item.rowid] = item.customize_text;
        }
      });

      setCustomizedTexts(textsMap);

      console.log("✍️ Checkout personalised texts:", textsMap);

      const isEmpty =
        !cartData ||
        !cartData.contents ||
        Object.keys(cartData.contents).length === 0;
      if (isEmpty && !hasRedirected.current) {
        hasRedirected.current = true; // ✅ avoid toast spam
        toast.error("Your cart is empty. Please select a product", {
          style: {
            background: "#000",
            color: "#fff",
          },
          position: "top-right",
          className: "!mt-8",
        });

        setTimeout(() => router.push("/products"), 1000);
        return;
      }

      // ✅ Save bogo_offers
      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
      }

      // const cartData = response?.cart_data;
      // if (!cartData) return;

      // 🛒 Extract items from cart_data.contents
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

      // Totals from cart_data
      setSubtotal(parseCurrency(cartData.subtotal));
      setShipping(parseCurrency(cartData.shipping));
      setTax(parseCurrency(cartData.total_item_tax));
      setTotal(parseCurrency(cartData.grand_total));

      // ✅ Set coupon applied state
      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";
      setIsApplied(Boolean(appliedCoupon));
      // ✅ Persist coupon code in input if applied
      if (appliedCoupon) {
        setCode(cartData.coupon_id);
        setCouponMessage(""); // Clear any previous message
        setCouponValue(parseCurrency(cartData.coupon_value || 0));
      } else {
        setCouponValue(0);
      }
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId || !code.trim()) return;

    try {
      const response = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: code.trim() },
      });

      if (response.status === false) {
        // ❌ Coupon not applied, show message
        setCouponMessage(response.message || "Failed to apply coupon");
        // Optional: clear input field if you want
        // setCode("");
      } else {
        // ✅ Coupon applied, keep the entered code in the input
        setCouponMessage("");
        setIsApplied(true);
      }

      await fetchSummary(); // Refresh summary after coupon applied
    } catch (err) {
      console.error("❌ Error applying coupon:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
    }
  };

  useEffect(() => {
    fetchSummary();

    const handleCartUpdate = () => fetchSummary();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer) return; // safety check

    try {
      setApplyingOffer(true); // 🔒 disable button

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const res = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      const data = await res;

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      // 🔔 Trigger cart-updated event so UI can refresh
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false); // 🔓 re-enable button
    }
  };

  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("razorpay_payment_id");
    if (storedId) setPaymentId(storedId);

    const handlePaymentIdUpdate = (e) => {
      setPaymentId(e.detail); // Instantly update from custom event
    };

    window.addEventListener("razorpayPaymentIdUpdated", handlePaymentIdUpdate);

    return () => {
      window.removeEventListener(
        "razorpayPaymentIdUpdated",
        handlePaymentIdUpdate,
      );
    };
  }, []);

  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const storedOrderId = localStorage.getItem("razorpay_order_id");
    if (storedOrderId) setOrderId(storedOrderId);
  }, []);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const [showInfo, setShowInfo] = useState(true);

  const handleToggle = () => {
    setShowInfo((prev) => !prev);
  };

  const [selectedMethod, setSelectedMethod] = useState("razorpay");

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
  };

  const updateSummaryFromStorage = () => {
    const shippingRaw = localStorage.getItem("cart_shipping_details");
    const taxRaw = localStorage.getItem("cart_tax_details");

    let sourceData = shippingRaw
      ? JSON.parse(shippingRaw)
      : JSON.parse(taxRaw || "{}");

    const itemsArray = Object.values(sourceData.contents || {});
    setCartItems(itemsArray);

    setSubtotal(parseCurrency(sourceData.subtotal));
    setShipping(parseCurrency(sourceData.shipping));
    setTax(parseCurrency(sourceData.total_item_tax));
    setTotal(parseCurrency(sourceData.grand_total));
  };

  useEffect(() => {
    updateSummaryFromStorage();

    const handleStorageChange = (e) => {
      if (e.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    const handleCustomStorageUpdate = (e) => {
      if (e.detail.key === "cart_shipping_details") {
        updateSummaryFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange); // other tabs
    window.addEventListener("local-storage-update", handleCustomStorageUpdate); // same tab

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "local-storage-update",
        handleCustomStorageUpdate,
      );
    };
  }, []);

  const today = new Date();
  const orderDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 7);

  const estimatedDelivery = deliveryDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentFailure, setPaymentFailure] = useState(false);

  const handleProcessingStart = () => {
    setIsProcessingPayment(true);
    setPaymentFailure(false);

    // 🧹 clear old order
    setOrderData(null);
    localStorage.removeItem("order_success_details");
  };

  const handlePaymentSuccess = () => {
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
  };

  const handlePaymentFailure = () => {
    setIsProcessingPayment(false); // 🔥 THIS FIXES YOUR BUG
    setPaymentFailure(true);
  };

  useEffect(() => {
    if (isProcessingPayment && !paymentSuccess) {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 👈 optional — can set to "auto" for instant
      });
    }
  }, [isProcessingPayment, paymentSuccess]);

  useEffect(() => {
    if (paymentFailure) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  useEffect(() => {
    if (paymentSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const notifyBackend = async () => {
        const storedOrder = JSON.parse(localStorage.getItem("order_id_data"));
        const saleid = storedOrder?.sale_id;

        if (!saleid) {
          console.warn("🚫 No sale_id found in localStorage!");
          return;
        }

        let token = await getValidToken();

        // 🔥 Retry once if token missing
        if (!token && isLoggedIn) {
          console.warn("🔁 Retrying token fetch...");
          await new Promise((res) => setTimeout(res, 500));
          token = await getValidToken();
        }

        if (!token && isLoggedIn) {
          console.error("🔐 Token still missing, skipping notify");
          return;
        }

        // ✅ Capture cart_id ONCE (important)
        const cartId = localStorage.getItem("cart_id");

        // Save order confirmation data before clearing
        const shippingDetails = localStorage.getItem("cart_shipping_details");
        const taxDetails = localStorage.getItem("cart_tax_details");
        const orderConfirmation = {
          orderDetails: shippingDetails ? JSON.parse(shippingDetails) : null,
          taxDetails: taxDetails ? JSON.parse(taxDetails) : null,
          orderId: idordered,
          paymentId,
          orderDate,
        };
        localStorage.setItem(
          "order_confirmation",
          JSON.stringify(orderConfirmation),
        );
        const savedName = localStorage.getItem("checkout_name");
        const savedEmail = localStorage.getItem("checkout_email");
        const savedContact = localStorage.getItem("checkout_contact");

        // Prefer last_applied_coupon (covers hot deal + manual)
        // Fallback to applied_coupon for safety
        let effectiveCoupon = "";

        try {
          if (cartId) {
            const summary = await fetchWithAuth("/api/getTax", {
              method: "POST",
              body: { cart_id: cartId },
            });

            const cartData = summary?.cart_data;

            const couponId = cartData?.coupon_id;
            const couponValue = parseCurrency(cartData?.coupon_value || 0);

            if (couponId && couponId !== "0" && couponValue > 0) {
              effectiveCoupon = couponId;
            }
          }
        } catch (e) {
          console.warn("⚠️ Failed to fetch latest coupon for paymentNotify", e);
        }

        // ✅ FINAL coupon (backend truth)
        const finalCoupon = effectiveCoupon;

        // 🧼 Immediately clear local coupon memory (prevents reuse bugs)
        localStorage.removeItem("applied_coupon");
        localStorage.removeItem("last_applied_coupon");
        localStorage.removeItem("cart_coupon_value");
        localStorage.removeItem("limited_deal_applied_once");
        localStorage.removeItem("limited_deal_expiry");

        // 🔥 Force UI reset
        window.dispatchEvent(new Event("coupon-cleared"));

        // ✅ Build payload AFTER cleanup (using safe variable)
        const payload = !isLoggedIn
          ? {
              saleid,
              msg: "success",
              name: localStorage.getItem("checkout_name") || "",
              email: localStorage.getItem("checkout_email") || "",
              phone: localStorage.getItem("checkout_contact") || "",
              guest: true,
              coupon_code: finalCoupon,
              cart_id: cartId,
            }
          : {
              saleid,
              msg: "success",
              guest: false,
              coupon_code: finalCoupon,
              cart_id: cartId,
            };
        try {
          const res = await fetch("/api/paymentNotify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          const data = await res.json();
          // console.log("✅ Payment notification response:", data);

          // ✅ update state (THIS triggers re-render)
          setOrderData(data.data);

          // optional backup
          localStorage.setItem(
            "order_success_details",
            JSON.stringify(data.data),
          );

          // Clear only the cart data, keep confirmation data
          const keysToRemove = [
            "cart_tax_details",
            "cart_data",
            "cart_id",
            "order_id_data",
            "cart_shipping_details",
          ];

          keysToRemove.forEach((key) => localStorage.removeItem(key));

          // ✅ Remove ALL personalised text entries (safe + scalable)
          const removedPersonalisedKeys = [];

          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("personalised_text_")) {
              localStorage.removeItem(key);
              removedPersonalisedKeys.push(key);
            }
          });

          // 🔔 Notify app state
          window.dispatchEvent(
            new CustomEvent("cart-cleared", {
              detail: {
                clearedKeys: keysToRemove,
                clearedPersonalisedKeys: removedPersonalisedKeys,
              },
            }),
          );

          console.log("🧼 Cart & personalised messages cleared successfully");

          // console.log("🧼 Cart data cleared after successful payment.");
        } catch (err) {
          console.error("❌ Failed to send payment notification:", err);
        }
      };

      notifyBackend();
    }
  }, [paymentSuccess, isLoggedIn]);

  const [idordered, setIdOrdered] = useState(null);

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("order_id_data");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIdOrdered(parsed?.order_id || null);
      } catch (e) {
        console.error("⚠️ Failed to parse order_id_data from localStorage", e);
      }
    }

    // Listen for instant updates via custom event
    const handleOrderIdUpdate = (e) => {
      setIdOrdered(e.detail); // 👈 no need to re-parse localStorage
    };

    window.addEventListener("orderIdDataUpdated", handleOrderIdUpdate);

    return () => {
      window.removeEventListener("orderIdDataUpdated", handleOrderIdUpdate);
    };
  }, []);

  {
    /* Load order_success_details from localStorage */
  }
  // ✅ Get success data from localStorage
  const orderSuccessData = orderData || {};

  const customer = orderSuccessData?.customer || {};
  const address = orderSuccessData?.address || {};

  const formattedAddress = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  // ✅ Parse currency strings safely
  const parsePrice = (price) =>
    Number(price?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  // ✅ Summary values
  const success_subtotal = parsePrice(orderSuccessData?.subtotal);
  const success_tax = parsePrice(orderSuccessData?.total_item_tax);
  const success_shipping = parsePrice(orderSuccessData?.shipping);
  const success_total = parsePrice(orderSuccessData?.grand_total);

  return (
    <div className="min-h-screen bg-gray-100 font-odop">
      {isProcessingPayment && !paymentSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full space-y-0 text-center p-4 backdrop-blur-sm"
        >
          {/* 🌀 Skeleton Animation */}
          <div className="w-32 h-32 mx-auto bg-gray-200 animate-pulse rounded-full" />
          {/* Title Skeleton */}
          <div className="mt-4 w-64 h-8 bg-gray-200 mx-auto rounded-md animate-pulse" />
          {/* Button Skeleton */}
          <div className="mt-6 w-52 h-10 bg-gray-200 mx-auto rounded-full animate-pulse" />

          {/* Skeleton Card */}
          <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
            {/* Header */}
            <div className="bg-gray-300 animate-pulse p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="w-56 h-5 bg-gray-200 rounded" />
                <div className="w-40 h-3 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Ordered Items Skeleton */}
            <div className="divide-y divide-gray-200 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-md animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="w-1/3 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Payment Method Skeleton */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            </div>

            <hr className="my-3 border-gray-200" />

            {/* Price Summary Skeleton */}
            <div className="px-5 pb-4 text-sm space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="w-28 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
              <hr className="border-gray-300" />
              <div className="flex justify-between font-bold text-lg">
                <div className="w-32 h-5 bg-gray-300 rounded animate-pulse" />
                <div className="w-24 h-5 bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ) : paymentSuccess ? (
        <>
          <style>{`
    @keyframes oss-fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes oss-fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes oss-scaleIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
    @keyframes oss-dashCircle { from { stroke-dashoffset:220; } to { stroke-dashoffset:0; } }
    @keyframes oss-dashCheck { from { stroke-dashoffset:60; } to { stroke-dashoffset:0; } }
    @keyframes oss-shimmer { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
    @keyframes oss-progressBar { from { width:0; } to { width:28%; } }

    .oss-check-ring { animation: oss-scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; display:inline-block; }
    .oss-ring-anim { animation: oss-dashCircle 0.65s ease-out 0.1s both; }
    .oss-tick-anim { animation: oss-dashCheck 0.4s ease-out 0.6s both; }
    .oss-hero-h1 { animation: oss-fadeUp 0.4s ease 0.25s both; }
    .oss-hero-p { animation: oss-fadeUp 0.4s ease 0.35s both; }
    .oss-hero-btn { animation: oss-fadeIn 0.4s ease 0.45s both; }
    .oss-grid { animation: oss-fadeUp 0.5s ease 0.5s both; }
    .oss-timeline { animation: oss-fadeUp 0.5s ease 0.65s both; }
    .oss-notify { animation: oss-fadeIn 0.5s ease 0.8s both; }
    .oss-progress-bar { animation: oss-progressBar 1.2s ease 0.8s both; width:0; }

    .oss-step-dot-active { animation: oss-shimmer 2s ease-in-out infinite; }

    .oss-cta-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:10px 22px; border-radius:999px; border:0.5px solid #d1d5db;
      background:#fff; color:#111827; font-size:13px; font-weight:500;
      cursor:pointer; transition:background 0.15s, transform 0.1s;
    }
    .oss-cta-btn:hover { background:#f9fafb; }
    .oss-cta-btn:active { transform:scale(0.97); }

    .oss-items-list::-webkit-scrollbar { width:4px; }
    .oss-items-list::-webkit-scrollbar-track { background:transparent; }
    .oss-items-list::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:2px; }
  `}</style>
          <div className="w-full">
            <div
              style={{
                maxWidth: 1400, // your control now 😏
                width: "100%",
                margin: "0 auto",
                padding: "1.5rem 0.75rem",
              }}
            >
              {/* ✅ Hero */}
              <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
                <div className="oss-check-ring">
                  <svg width="88" height="88" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="34" fill="#dcfce7" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#16a34a"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="220"
                      strokeDashoffset="220"
                      className="oss-ring-anim"
                    />
                    <polyline
                      points="24,41 35,52 56,30"
                      stroke="#16a34a"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      strokeDasharray="60"
                      strokeDashoffset="60"
                      className="oss-tick-anim"
                    />
                  </svg>
                </div>

                <h1
                  className="oss-hero-h1"
                  style={{
                    fontSize: "clamp(20px, 5vw, 26px)",
                    fontWeight: 500,
                    color: "#111827",
                    margin: "4px 0 6px",
                  }}
                >
                  Payment confirmed!
                </h1>

                <p
                  className="oss-hero-p"
                  style={{
                    fontSize: 14,
                    color: "#6b7280",
                    margin: "0 0 20px",
                  }}
                >
                  Your order has been placed successfully. A confirmation email
                  is on its way.
                </p>

                <button
                  className="oss-cta-btn oss-hero-btn w-full sm:w-auto justify-center"
                  onClick={() => {
                    localStorage.removeItem("checkout_name");
                    localStorage.removeItem("checkout_email");
                    localStorage.removeItem("checkout_contact");
                    localStorage.removeItem("applied_coupon");
                    localStorage.removeItem("last_applied_coupon");
                    localStorage.removeItem("cart_coupon_value");
                    setCartItems([]);
                    router.push("/");
                  }}
                >
                  <ShoppingBag style={{ width: 14, height: 14 }} />
                  Continue shopping
                </button>
              </div>

              {/* 🧍 LEFT + 📦 RIGHT */}
              <div
                className="oss-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                style={{
                  display: "grid",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                {/* LEFT — Customer */}
                <div
                  style={{
                    background: "#fff",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "18px 20px",
                      borderBottom: "0.5px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: "#dcfce7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#166534",
                        flexShrink: 0,
                      }}
                    >
                      {customer?.name
                        ? customer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()
                        : "?"}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 500,
                          color: "#111827",
                          margin: "0 0 2px",
                        }}
                      >
                        {customer?.name || "—"}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        Customer
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#9ca3af",
                          margin: "0 0 3px",
                        }}
                      >
                        Email
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          color: "#6b7280",
                          margin: 0,
                          wordBreak: "break-all",
                        }}
                      >
                        {customer?.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#9ca3af",
                          margin: "0 0 3px",
                        }}
                      >
                        Phone
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        {customer?.phone || "—"}
                      </p>
                    </div>

                    <hr
                      style={{
                        border: "none",
                        borderTop: "0.5px solid #e5e7eb",
                        margin: 0,
                      }}
                    />

                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "#9ca3af",
                          margin: "0 0 6px",
                        }}
                      >
                        Deliver to
                      </p>
                      {formattedAddress ? (
                        <div
                          style={{
                            fontSize: 15,
                            color: "#6b7280",
                            lineHeight: 1.65,
                          }}
                        >
                          <p
                            style={{
                              fontWeight: 500,
                              color: "#111827",
                              margin: "0 0 4px",
                            }}
                          >
                            {address?.name || customer?.name}
                          </p>
                          <p style={{ margin: 0 }}>{formattedAddress}</p>
                          {/* <p style={{ marginTop: 6, color: "#9ca3af" }}>
                            {address?.phone || customer?.phone}
                          </p> */}
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: 13,
                            color: "#9ca3af",
                            fontStyle: "italic",
                            margin: 0,
                          }}
                        >
                          No address available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Order Summary */}
                <div
                  style={{
                    background: "#fff",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Green Header */}
                  <div
                    style={{
                      background: "#14532d",
                      padding: "20px 20px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#86efac",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        margin: "0 0 4px",
                      }}
                    >
                      Order confirmed
                    </p>
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: "#fff",
                        margin: "0 0 4px",
                        letterSpacing: "0.03em",
                      }}
                    >
                      #{idordered || "—"}
                    </p>
                    <p style={{ fontSize: 11, color: "#bbf7d0", margin: 0 }}>
                      {orderDate}
                      {orderSuccessData?.reference_no && (
                        <> &nbsp;·&nbsp; Ref: {orderSuccessData.reference_no}</>
                      )}
                    </p>
                  </div>

                  {/* Items */}
                  <div
                    className="oss-items-list"
                    style={{
                      padding: "0 20px",
                      maxHeight: 200,
                      overflowY: "auto",
                      flex: 1,
                    }}
                  >
                    {cartItems.map((item, idx) => (
                      <div
                        key={item.rowid || idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 0",
                          borderBottom: "0.5px solid #e5e7eb",
                        }}
                      >
                        <img
                          src={getImageSrc(item.image)}
                          alt={item.name}
                          title={item.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 8,
                            objectFit: "cover",
                            background: "#f3f4f6",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#111827",
                              margin: "0 0 3px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            dangerouslySetInnerHTML={{ __html: item.name }}
                          />
                          <p
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              margin: 0,
                            }}
                          >
                            Qty: {item.qty}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#111827",
                            flexShrink: 0,
                            marginLeft: "auto",
                          }}
                        >
                          ₹{(item.price * Number(item.qty)).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderTop: "0.5px solid #e5e7eb",
                      padding: "16px 20px",
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      <span>Item cost</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 8,
                      }}
                    >
                      <span>Shipping</span>
                      <span
                        style={
                          success_shipping === 0
                            ? { color: "#15803d", fontWeight: 500 }
                            : {}
                        }
                      >
                        {success_shipping === 0
                          ? "Free"
                          : `₹${success_shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 15,
                        fontWeight: 500,
                        color: "#111827",
                        paddingTop: 10,
                        borderTop: "0.5px solid #e5e7eb",
                      }}
                    >
                      <span>Total paid</span>
                      <span style={{ color: "#15803d" }}>
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              {/* <div
                style={{
                  height: 3,
                  background: "#e5e7eb",
                  borderRadius: 2,
                  marginBottom: 14,
                  overflow: "hidden",
                }}
              >
                <div
                  className="oss-progress-bar"
                  style={{
                    height: "100%",
                    background: "#16a34a",
                    borderRadius: 2,
                  }}
                />
              </div> */}

              {/* 🔔 Notification Strip */}
              <div
                className="oss-notify"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#f9fafb",
                  border: "0.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "14px 18px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                  You'll receive a shipping notification via SMS and email once
                  your order is dispatched.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : paymentFailure ? (
        <div className="w-full min-h-[70vh] flex  justify-center bg-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full space-y-0 text-center p-4  backdrop-blur-sm"
          >
            <motion.img
              src="/Failure.gif" // make sure the gif itself is non-looping!
              alt="Success Animation"
              title="Success Animation"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, type: "spring", stiffness: 80 }}
              className="w-32 h-32 mx-auto  object-contain"
            />

            {/* Title and message */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-3xl font-bold text-black capitalize"
            >
              Payment Failed !
            </motion.h1>

            <button
              onClick={() => {
                router.push("/");

                setCartItems([]);
              }}
              className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-white hover:bg-gray-50 text-black font-semibold rounded-full transition-all duration-300 shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>

            {/* Retry Payment */}
            <button
              onClick={() => {
                setPaymentFailure(false); // go back to normal checkout
              }}
              className="mt-4 ml-3 inline-flex items-center gap-2 justify-center px-6 py-3 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-md"
            >
              <RefreshCcw className="w-5 h-5" />
              Retry Payment
            </button>
            <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 mt-4">
              {/* Header */}
              <div className="bg-red-600 text-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-semibold text-xl text-left uppercase">
                    Order ID :{" "}
                    <span className="">{idordered || "Not Available"}</span>
                  </p>
                  <p className="text-xs mt-1 text-left text-yellow-200">
                    Order Date :{" "}
                    <span className="font-medium">{orderDate}</span>{" "}
                    {/* &nbsp; | */}
                    {/* &nbsp;
                    <span className="text-yellow-300">
                      Estimated delivery : {estimatedDelivery}
                    </span> */}
                  </p>
                </div>
                {/* <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm bg-white text-[#A00300] font-semibold rounded-full hover:bg-gray-100 transition">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Download Invoice
                  </button>
                  <button className="px-4 py-2 text-sm bg-white hover:bg-gray-50 text-[#A00300] font-semibold rounded-full transition">
                    Track Order
                  </button>
                </div> */}
              </div>

              {/* Ordered Items */}
              <div className="divide-y divide-gray-400 px-10 py-4 max-h-[320px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      title={item.name}
                      className="w-14 h-14 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <p
                        className="font-medium text-sm text-left"
                        dangerouslySetInnerHTML={{ __html: item.name }}
                      />
                    </div>
                    <div className="text-right px-5">
                      <p className="text-sm mt-1 text-right">
                        ₹
                        {(
                          Number(
                            item.price?.toString().replace(/[^0-9.-]+/g, ""),
                          ) * Number(item.qty)
                        ).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              {/* <hr className="my-3 border-gray-200" /> */}

              {/* Address / Payment / Delivery */}
              {/* <div className="px-5 pb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Payment method</p>
                    <span className="text-sm text-gray-700 break-all">
                      Razorpay • Payment Failed
                    </span>
                  </div> */}

              <hr className="my-3 border-gray-200" />

              {/* Price Summary */}
              <div className="px-5 pb-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Item cost</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping fee</span>
                  <span>₹{shipping.toFixed(2)}</span>{" "}
                  {/* You can make this dynamic if needed */}
                </div>

                <hr className="border-gray-300" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Cost</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // 🧾 Normal checkout layout (split screen)
        <>
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row min-h-screen lg:min-h-screen">
            <div className="w-full min-h-[70vh] flex justify-center bg-transparent">
              {/* Left: Scrollable Form Section */}
              <CheckoutForm
                total={total}
                onPaymentSuccess={handlePaymentSuccess}
                onProcessingStart={handleProcessingStart}
                onPaymentFailure={handlePaymentFailure}
                cartItems={cartItems}
                subtotal={subtotal}
                tax={tax}
                shipping={shipping}
                customizedTexts={customizedTexts} // ✅ ADD THIS
              />

              {/* Right: Sticky Summary */}
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                total={total}
                tax={tax}
                shipping={shipping}
                selectedMethod={selectedMethod}
                handleRadioChange={handleRadioChange}
                handleToggle={handleToggle}
                showInfo={showInfo}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
