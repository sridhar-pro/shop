"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  TrendingUp,
  Wallet2,
  ChevronDown,
  ChevronUp,
  Timer,
  Truck,
} from "lucide-react"; // Adjust if you're using different icon lib
import RazorpayButton from "./RazorpayButton";
import { useAuth } from "@/app/utils/AuthContext";
import { toast } from "react-toastify";
import { validateFormData } from "../utils/validateForm";
import CheckoutAddress from "./CheckoutAddress";
import { useSession } from "../context/SessionContext";
import Link from "next/link";
import CashfreeButton from "./CashfreeButton";

const CheckoutForm = ({
  onPaymentSuccess,
  onProcessingStart,
  onPaymentFailure,
  cartItems = [],
  subtotal = 0,
  total,
  tax = 0,
  shipping = 0,
  customizedTexts, // ✅ NEW
}) => {
  const razorRef = useRef(null);
  const cashfreeRef = useRef(null);

  // Debounce timer ref
  const debounceRef = useRef(null);
  const hotDealHistorySentRef = useRef(false);

  const isApplyingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const skipNextApplyRef = useRef(false);

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const { getValidToken, isAuthReady } = useAuth();

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

  const [bogoOffers, setBogoOffers] = useState([]);
  const [applyingOffer, setApplyingOffer] = useState(false); // track button state

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    console.log("🧪 [CheckoutForm] customizedTexts:", customizedTexts);
    console.log("🧪 [CheckoutForm] cartItems:", cartItems);
  }, [customizedTexts, cartItems]);

  function useHistorySaver(
    { name = "", email = "", contact = "" },
    opts = { logging: true },
  ) {
    const lastSentRef = useRef({ name: null, email: null, contact: null });
    const nameTimerRef = useRef(null);
    const emailTimerRef = useRef(null);
    const sendSeqRef = useRef(0);

    // keep latest name for blur handler
    const latestNameRef = useRef((name || "").toString());

    // update latestNameRef whenever name changes
    useEffect(() => {
      latestNameRef.current = (name || "").toString();
    }, [name]);

    // const log = (...args) =>
    //   opts.logging && console.log("[history-save]", ...args);

    const log = () => {}; // disable all logging

    // Utility: only digits
    const digitsOnly = (s) => (s || "").toString().replace(/\D/g, "");

    // Simple email validator
    const isValidEmail = (s) =>
      typeof s === "string" &&
      s.length > 3 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

    // Unified sendHistory which prefers your auth wrappers if present
    const sendHistory = async (payload) => {
      let cartPreview = null;

      // 🔹 Safely read minimal cart info from localStorage
      try {
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("cartItemPreview");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              cartPreview = parsed;
            }
          }
        }
      } catch (err) {
        // log or ignore
        // console.warn("[history-save] failed to read cartItemPreview:", err);
      }

      const body = {
        name: payload.name || "",
        email: payload.email || "",
        phone: payload.contact || "",

        // 🔥 event tracking (optional)
        event: payload.event || null,
        coupon_code: payload.coupon_code || null,

        cart_items: cartPreview, // 🔥 includes [{ id, product_id, name, image }, ...]
      };

      // remove empty noise
      Object.keys(body).forEach((k) => body[k] === null && delete body[k]);

      // 👀 Debug log (safe)
      try {
        console.log(
          "%c[history_save payload]",
          "color:#A00300; font-weight:bold;",
          JSON.stringify(body, null, 2),
        );
      } catch {}

      const seq = ++sendSeqRef.current;
      // log(`#${seq} → preparing to send`, body);

      const authFetch =
        typeof fetchWithAuth === "function"
          ? fetchWithAuth
          : typeof fetchWithAuthHis === "function"
            ? fetchWithAuthHis
            : null;

      if (authFetch) {
        try {
          const res = await authFetch("/api/history_save", {
            method: "POST",
            body,
          });
          return;
        } catch (err) {}
      }

      try {
        const res = await fetch("/api/history_save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        });

        if (!res.ok) {
          const text = await res.text().catch(() => null);
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        await res.json().catch(() => null);
        return;
      } catch (err2) {}

      try {
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(body)], {
            type: "application/json",
          });
          const ok = navigator.sendBeacon("/api/history_save", blob);
          if (ok) return;
        }
      } catch (beErr) {}
    };

    // ----------------------------
    // NAME: onNameBlur handler
    // ----------------------------
    const onNameBlur = () => {
      const currentName = (latestNameRef.current || "").toString();

      if (currentName.length < 3) {
        // log("onNameBlur: name < 3 chars — not sending", currentName);
        return;
      }

      if (lastSentRef.current.name === currentName) {
        // log("onNameBlur: name unchanged (already sent), skipping:", currentName);
        return;
      }

      lastSentRef.current.name = currentName;
      // log("onNameBlur: sending name (>=3 chars) with other field values.");
      sendHistory({ name: currentName, email, contact });
    };

    // ----------------------------
    // EMAIL: send when email becomes valid
    // ----------------------------
    useEffect(() => {
      const currentEmail = (email || "").toString().trim();

      if (!isValidEmail(currentEmail)) {
        // log("email not valid yet:", currentEmail);
        return;
      }

      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
      emailTimerRef.current = setTimeout(() => {
        if (lastSentRef.current.email === currentEmail) {
          // log("email unchanged, skipping:", currentEmail);
          return;
        }
        lastSentRef.current.email = currentEmail;
        // log("email validated — sending history payload.");
        sendHistory({ name, email: currentEmail, contact });
      }, 300);

      return () => {
        if (emailTimerRef.current) {
          clearTimeout(emailTimerRef.current);
          emailTimerRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, name, contact]);

    // ----------------------------
    // PHONE: send when 10 digits
    // ----------------------------
    useEffect(() => {
      const digits = digitsOnly(contact);

      if (digits.length === 10) {
        if (lastSentRef.current.contact === digits) {
          // log("phone unchanged, skipping:", digits);
          return;
        }
        lastSentRef.current.contact = digits;
        // log("phone reached 10 digits — sending history payload.");
        sendHistory({ name, email, contact: digits });
      } else {
        // log("phone length not 10 yet:", digits.length);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contact, name, email]);

    return { onNameBlur };
  }

  const FORM_STORAGE_KEY = "checkout_form_v1";

  const emptyForm = {
    name: "",
    lastName: "",
    email: "",
    country: "",
    contact: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pin: "",
  };

  const [formData, setFormData] = useState(() => {
    // 👇 Safe on server / during SSR
    if (typeof window === "undefined") return emptyForm;

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) return emptyForm;

      const parsed = JSON.parse(saved);

      // Merge only known keys
      return {
        ...emptyForm,
        ...Object.fromEntries(
          Object.entries(parsed).filter(([key]) =>
            Object.prototype.hasOwnProperty.call(emptyForm, key),
          ),
        ),
      };
    } catch (err) {
      console.error("Error restoring form data from localStorage:", err);
      return emptyForm;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch (err) {
      console.error("Error saving form data to localStorage:", err);
    }
  }, [formData]);

  // ⬇⬇⬇ ADD THIS EXACTLY HERE ⬇⬇⬇
  const { onNameBlur } = useHistorySaver(
    {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
    },
    { logging: true },
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error as user types
    setFormError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      lastName: "",
      email: "",
      country: "",
      contact: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pin: "",
    });
  };

  const { isLoggedIn } = useSession();

  const [formError, setFormError] = useState({});

  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);
  const formRef = useRef(null);

  const [code, setCode] = useState("");

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state
  const [couponValue, setCouponValue] = useState(0);

  const [orderDetails, setOrderDetails] = useState(null);

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry",
    "Ladakh",
    "Jammu and Kashmir",
  ];

  //   const [showSuccess, setShowSuccess] = useState(false);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  const handleOrderAndPay = async () => {
    if (isProcessing) return; // double-click shield
    setIsProcessing(true);

    const errors = validateFormData(formData);
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      console.warn("❌ Form validation failed", errors);
      setIsProcessing(false);
      return;
    }

    setFormError({});

    try {
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        setIsProcessing(false);
        return;
      }

      // ✅ Store only the name in localStorage before proceeding
      localStorage.setItem("checkout_name", formData.name);
      localStorage.setItem("checkout_email", formData.email);
      localStorage.setItem("checkout_contact", formData.contact);

      const token = await getValidToken();

      const cartId = localStorage.getItem("cart_id");

      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      let effectiveCoupon = "";

      // ✅ Try backend first
      try {
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
      } catch (e) {
        console.warn("Coupon fetch failed, fallback to localStorage");
      }

      // ✅ fallback (safe)
      if (!effectiveCoupon) {
        const rawLast = localStorage.getItem("last_applied_coupon");
        const couponValue = Number(
          localStorage.getItem("cart_coupon_value") || 0,
        );

        if (rawLast && rawLast !== "0" && couponValue > 0) {
          effectiveCoupon = rawLast;
        }
      }

      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: `${formData.name} ${formData.lastName}`,
          email: formData.email,
          phone: formData.contact,
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.pin,
          country: formData.country || "India",
        },
        company_id: 0,
        cart_id: cartId,
        ...(effectiveCoupon && { coupon_code: effectiveCoupon }),
      };

      console.log("📦 createOrder coupon_code =>", effectiveCoupon);

      console.log("📦 Sending payload to /api/createOrder:", customerPayload);

      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("❌ Error Response:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      console.log("✅ Order created successfully:", result);

      const paymentType = result?.type || "razorpay";

      // 🔥 CASHFREE FLOW
      if (paymentType === "cashfree") {
        if (!result?.r_response?.payment_session_id) {
          throw new Error("Cashfree session missing");
        }

        // ✅ 🔥 ADD THIS (VERY IMPORTANT)
        localStorage.setItem("order_id_data", JSON.stringify(result));

        window.dispatchEvent(
          new CustomEvent("orderIdDataUpdated", {
            detail: result?.order_id,
          }),
        );

        setOrderDetails({
          payment_session_id: result.r_response.payment_session_id,
          order_id: result.r_response.order_id,
          sale_id: result.sale_id,
        });

        setTimeout(() => {
          cashfreeRef.current?.click();
        }, 100);

        return; // 🚨 IMPORTANT: stop here
      }

      // 🧾 Extract amount and order id
      const razorpayOrder = result?.r_response?.data;
      if (!razorpayOrder?.id || !razorpayOrder?.amount) {
        throw new Error("Razorpay order data missing from response");
      }

      // ✅ Save to state for RazorpayButton
      setOrderDetails({
        sale_id: result.sale_id,
        order_id: result.order_id, // your internal reference
        r_order_id: razorpayOrder.id, // ✅ actual Razorpay order ID
        amount: razorpayOrder.amount,
      });

      // 👇 Trigger Razorpay button via ref

      // 🧾 Store order data in localStorage
      localStorage.setItem("order_id_data", JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id, // send just what you need
        }),
      );

      // Trigger Razorpay manually after state is updated
      setTimeout(() => {
        razorRef.current?.click();
      }, 100);
    } catch (err) {
      console.error("🚨 Order creation error:", err);
      toast.error(
        err.message || "Something went wrong while creating the order.",
      );

      // ❗ Only re-enable on error
      setIsProcessing(false);
    }
  };

  const [isApplied, setIsApplied] = useState(false);

  // Limited-deal config
  const LIMITED_DEAL_CODE = "FLATY100"; //Test50  //FLATY100
  const LIMITED_DEAL_DURATION = 600; // ⭐ NEW: 10 minutes in seconds

  const [limitedDealApplied, setLimitedDealApplied] = useState(false);
  const [dealTimer, setDealTimer] = useState(LIMITED_DEAL_DURATION); // ⭐ UPDATED

  const handleApply = async () => {
    // ✅ kill pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    const cartId = localStorage.getItem("cart_id");
    const trimmed = code.trim();

    // 🔹 Basic guard: no cart / no code
    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      setCouponValue(0);
      return;
    }

    try {
      // 1️⃣ Apply coupon
      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: trimmed },
      });

      const failed =
        applyResponse?.status === false ||
        applyResponse?.status === "error" ||
        applyResponse?.success === false;

      if (failed) {
        setCouponMessage(applyResponse?.message || "Invalid coupon");
        setIsApplied(false);
        setCouponValue(0);
        try {
          localStorage.removeItem("applied_coupon");
          localStorage.setItem("last_applied_coupon", "0");
        } catch (e) {
          console.warn("Error clearing coupon storage", e);
        }

        // Let OrderSummary & others refresh
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }

      // ✅ Success
      setCouponMessage("Discount applied successfully!");
      setIsApplied(true);

      skipNextApplyRef.current = true;

      // A normal coupon overrides any active hot deal
      setLimitedDealApplied(false);
      setDealTimer(0);

      // ⭐ Normal coupon kills hot-deal expiry
      try {
        localStorage.removeItem("limited_deal_expiry");
      } catch (e) {
        console.warn(
          "Error clearing limited_deal_expiry after manual coupon",
          e,
        );
      }

      try {
        localStorage.setItem("applied_coupon", trimmed);
        localStorage.setItem("last_applied_coupon", trimmed);
      } catch (e) {
        console.warn("Error persisting coupon storage", e);
      }

      // Trigger global cart refresh (OrderSummary will pull latest totals)
      window.dispatchEvent(new Event("cart-updated"));

      // 2️⃣ Fetch updated cart summary (tax, totals, items)
      const summaryResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      const cartData = summaryResponse?.cart_data;
      if (!cartData) return;

      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";

      // Keep discount amount in sync
      setCouponValue(
        appliedCoupon ? parseCurrency(cartData.coupon_value || 0) : 0,
      );

      if (appliedCoupon) {
        // Sync input with backend coupon id
        setCode(cartData.coupon_id);
      }

      // Persist full tax/summary snapshot
      try {
        localStorage.setItem(
          "cart_tax_details",
          JSON.stringify(summaryResponse),
        );
      } catch (e) {
        console.warn("Error saving cart_tax_details", e);
      }

      // Notify any listeners relying on this snapshot
      window.dispatchEvent(
        new CustomEvent("local-storage-update", {
          detail: { key: "cart_tax_details" },
        }),
      );
    } catch (err) {
      console.error("❌ Error applying coupon or fetching cart summary:", err);
      setCouponMessage("Failed to apply coupon. Try again.");
      setIsApplied(false);
    } finally {
      isApplyingRef.current = false;
    }
  };

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

  // 🚀 Auto-apply limited-time hot deal (silent, invisible coupon)
  //  - Triggers after 5 seconds (testing)
  //  - Lasts for 2 minutes (120s) then removes itself
  const autoApplyLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: LIMITED_DEAL_CODE },
      });

      const ok = res?.status === true || res?.success === true;
      if (!ok) {
        console.info("Limited deal not applied:", res);
        return;
      }

      // Persist "seen once" + tracking of last coupon
      try {
        localStorage.setItem("limited_deal_applied_once", "1");
        localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
      } catch (e) {
        console.warn("Could not persist limited-deal flag", e);
      }

      // Mark local hot-deal state and start 2-minute countdown
      setLimitedDealApplied(true);
      setDealTimer(120);

      // ⭐ Persist absolute expiry time for the countdown (in seconds)
      try {
        const expiresAt = Date.now() + LIMITED_DEAL_DURATION * 1000;
        localStorage.setItem("limited_deal_expiry", expiresAt.toString());
      } catch (e) {
        console.warn("Could not persist limited_deal_expiry", e);
      }

      // Refresh cart summary so couponValue & totals are correct
      const summaryResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      const cartData = summaryResponse?.cart_data;
      if (cartData) {
        setCouponValue(parseCurrency(cartData.coupon_value || 0));

        try {
          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify(summaryResponse),
          );
        } catch (e) {
          console.warn("Error saving cart_tax_details", e);
        }

        window.dispatchEvent(
          new CustomEvent("local-storage-update", {
            detail: { key: "cart_tax_details" },
          }),
        );
      }

      // Let other components (OrderSummary / header) refresh totals
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to apply limited-time deal:", err);
    }

    // 🔥 Send history event ONCE after successful hot-deal apply
    if (!hotDealHistorySentRef.current) {
      hotDealHistorySentRef.current = true;

      try {
        const token = await getValidToken();

        // ❌ Client-side IP (not guaranteed accurate)
        const clientIp = await getClientIP();

        await fetch("/api/history_save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ REQUIRED
          },
          body: JSON.stringify({
            event: "HOT_DEAL_APPLIED",
            coupon_code: LIMITED_DEAL_CODE,
            ip_address: clientIp, // ⚠️ client-sent IP
            cart_items: JSON.parse(
              localStorage.getItem("cartItemPreview") || "[]",
            ),
          }),
          keepalive: true,
        });
      } catch (e) {
        console.warn("Hot deal history event failed", e);
      }
    }
  };

  // ⭐ NEW: Restore limited-deal timer from localStorage on mount
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

  // 🧹 Remove hot deal when timer expires
  const removeLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        body: { cart_id: cartId, coupon_code: "0" }, // clear coupon server-side
      });

      const ok = res?.status === true || res?.success === true;
      if (!ok) {
        console.info("Server did not remove limited deal:", res);
      }
    } catch (err) {
      console.error("Failed to remove limited deal coupon:", err);
    } finally {
      setLimitedDealApplied(false);
      setDealTimer(0);

      try {
        localStorage.setItem("last_applied_coupon", "0");
      } catch (e) {
        console.error("Failed to update last_applied_coupon on removal:", e);
      }

      // ⭐ Clear stored expiry when deal is removed
      try {
        localStorage.removeItem("limited_deal_expiry");
      } catch (e) {
        console.error("Failed to clear limited_deal_expiry on removal:", e);
      }

      try {
        const summaryResponse = await fetchWithAuth("/api/getTax", {
          method: "POST",
          body: { cart_id: cartId },
        });

        const cartData = summaryResponse?.cart_data;
        if (cartData) {
          setCouponValue(parseCurrency(cartData.coupon_value || 0));

          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify(summaryResponse),
          );

          window.dispatchEvent(
            new CustomEvent("local-storage-update", {
              detail: { key: "cart_tax_details" },
            }),
          );
        }
      } catch (e) {
        console.error("Failed silent refresh after removing limited deal:", e);
      }

      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  // ⏰ Auto-apply hot deal after 5s (testing)
  // Skips if user already applied a coupon or has seen the hot deal once
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const manualCoupon = localStorage.getItem("applied_coupon");
        const limitedOnce =
          localStorage.getItem("limited_deal_applied_once") === "1";
        const lastCoupon = localStorage.getItem("last_applied_coupon");

        if (lastCoupon && lastCoupon !== "0") return;

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

  // ⏳ Deal countdown: 2 minutes total (120 seconds)
  useEffect(() => {
    if (!limitedDealApplied) return;

    const interval = setInterval(() => {
      setDealTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          // Fire and forget – do not await here
          removeLimitedDeal().catch((e) =>
            console.error("removeLimitedDeal failed", e),
          );
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [limitedDealApplied]);

  // 👇 Debounced live validation
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!code.trim()) {
      setCouponMessage("");
      setIsApplied(false);
      setCouponValue(0);

      // ✅ NO API CALL
      return;
    }

    // ✅ HANDLE DOUBLE CALL AFTER SUCCESS
    if (skipNextApplyRef.current) {
      skipNextApplyRef.current = false;
      return;
    }

    // ❌ REMOVE isApplied check (important)
    if (isApplyingRef.current) return;

    debounceRef.current = setTimeout(() => {
      handleApply();
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  useEffect(() => {
    fetchBogoOffers();
  }, []);

  const fetchBogoOffers = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      console.warn("⚠️ No cart_id found in localStorage");
      return;
    }

    try {
      const response = await fetchWithAuth("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { cart_id: cartId },
      });

      if (response?.bogo_offers) {
        setBogoOffers(response.bogo_offers);
      } else {
        setBogoOffers([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch BOGO offers:", err);
    }
  };

  const [offerApplied, setOfferApplied] = useState(false);

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || offerApplied) return; // 🚫 prevent double-click

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const data = await fetchWithAuth("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          bogo_id: Number(bogoId),
          cart_id: cartId,
        },
      });

      console.log("Bogo res:", data);

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      // ✅ mark offer as applied
      setOfferApplied(true);

      // ✅ refresh cart globally
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false);
    }
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  return (
    <div className="flex-1 order-1 lg:order-none overflow-y-auto px-6 lg:px-12 py-6 lg:py-8 scrollbar-hide">
      {/* mob-only */}
      <div className="border-b border-gray-300 pb-4 mb-4 lg:hidden">
        {/* 🔽 Header toggle for mobile */}
        <div
          className="flex items-center justify-between lg:hidden cursor-pointer"
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-[400] tracking-tight">Order Summary</h1>
            {isSummaryOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>

          <span className="text-xl font-[800] text-gray-800">
            ₹{total.toFixed(2)}
          </span>
        </div>

        {/* 🧾 Content wrapper */}
        <div className={`space-y-6 ${!isSummaryOpen ? "hidden" : ""} lg:block`}>
          {/* 🛍 Cart Items */}
          {cartItems.map((item) => (
            <div key={item.rowid} className="flex items-start gap-4 mt-6">
              <img
                src={getImageSrc(item.image)}
                alt={item.name}
                className="w-16 h-16 rounded-md object-cover"
              />

              <div className="flex-1">
                <p className="text-sm font-medium">
                  <span dangerouslySetInnerHTML={{ __html: item.name }} />{" "}
                  <br />x {item.qty}
                </p>

                <p className="text-sm mt-1 text-right">
                  ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                </p>

                {item.deliveryDays && (
                  <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Delivered in {item.deliveryDays} days
                  </p>
                )}

                {/* ✅ CUSTOM PRINT — THIS WAS MISSING / WRONG */}
                {customizedTexts?.[item.rowid] && (
                  <div className="mt-2 px-2 py-1 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300]">
                      Custom Print
                    </p>
                    <p className="text-xs font-medium text-gray-800 break-words">
                      “{customizedTexts[item.rowid]}”
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 📦 Summary */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between items-start">
              <span>Subtotal</span>

              <div className="flex flex-col items-end">
                <span>₹{subtotal.toFixed(2)}</span>
                <span className="text-xs text-gray-500">
                  (Incl. GST ₹{tax.toFixed(2)})
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>

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
        </div>
      </div>
      <div ref={formRef} className="space-y-6 pb-0 md:pb-16">
        {/* Contact Section */}
        <div className="relative">
          {isLoggedIn && (
            <>
              <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
            </>
          )}
          <CheckoutAddress
            cartItems={cartItems}
            subtotal={subtotal}
            total={total}
            tax={tax}
            shipping={shipping}
            onSuccess={onPaymentSuccess}
            onFailure={onPaymentFailure}
            customizedTexts={customizedTexts} // ✅ ADD THIS
          />
        </div>

        {/* Everything below will be hidden if user is logged in */}
        {!isLoggedIn && (
          <>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full mt-2 rounded-lg px-4 py-3 bg-white"
              value={formData.email}
              onChange={handleChange}
            />
            {formError.email && (
              <p className="text-red-600 text-sm mt-1">{formError.email}</p>
            )}

            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                defaultChecked
                className="accent-black bg-white"
              />
              Email us for news and offers
            </label>
            {/* Delivery Section */}
            <div>
              <h1 className="text-xl font-[800] tracking-tight ">Delivery</h1>
              {/* Country Selector */}
              <div className="relative mt-2">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full appearance-none rounded-lg px-4 py-3 bg-white border text-sm pr-10 ${
                    formError.country ? "border-red-500" : "border-gray-400"
                  } ${
                    formData.country === "" ? "text-gray-400" : "text-black"
                  }`}
                >
                  <option value="" disabled hidden>
                    Country
                  </option>
                  <option value="india">India</option>
                </select>

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                  ▼
                </span>

                {formError.country && (
                  <p className="text-red-600 text-sm mt-1">
                    {formError.country}
                  </p>
                )}
              </div>

              {/* Name Fields */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name Field */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="name"
                    placeholder="First name"
                    className="input bg-white"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={onNameBlur}
                  />
                  {formError.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {formError.name}
                    </p>
                  )}
                </div>

                {/* Last Name Field */}
                <div className="flex flex-col">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className="input bg-white"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address Fields */}
              {/* Address Line 1 */}
              <div className="mt-4">
                <input
                  type="text"
                  name="addressLine1"
                  placeholder="Flat, House no, Building, Company"
                  className="input w-full pr-10 bg-white"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
                {formError.addressLine1 && (
                  <p className="text-red-600 text-sm mt-1">
                    {formError.addressLine1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="mt-4">
                <input
                  type="text"
                  name="addressLine2"
                  placeholder="Area, Street, Village"
                  className="input w-full bg-white"
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
                {formError.addressLine2 && (
                  <p className="text-red-600 text-sm mt-1">
                    {formError.addressLine2}
                  </p>
                )}
              </div>

              {/* City, State, PIN */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    className="input bg-white w-full"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {formError.city && (
                    <p className="text-red-600 text-sm mt-1">
                      {formError.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`input bg-white appearance-none pr-10 w-full px-4 py-3 border border-gray-400 rounded-lg text-sm ${
                      formData.state === "" ? "text-gray-400" : "text-black"
                    }`}
                  >
                    <option value="" disabled hidden>
                      State
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
                    ▼
                  </span>
                  {formError.state && (
                    <p className="text-red-600 text-sm mt-1">
                      {formError.state}
                    </p>
                  )}
                </div>
                {/* PIN Code */}
                <div>
                  <input
                    type="text"
                    name="pin"
                    placeholder="PIN code"
                    className="input bg-white w-full"
                    value={formData.pin}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="\d*"
                    onChange={async (e) => {
                      const val = e.target.value.replace(/\D/g, ""); // only digits

                      if (val.length <= 6) {
                        handleChange({ target: { name: "pin", value: val } });
                      }

                      // clear old error while typing
                      if (formError.pin) {
                        setFormError((prev) => ({ ...prev, pin: "" }));
                      }

                      if (val.length === 6 && isAuthReady) {
                        const cartId = localStorage.getItem("cart_id");
                        if (!cartId) {
                          console.warn("🛒 No cart_id found in localStorage");
                          return;
                        }

                        try {
                          const token = await getValidToken();
                          const res = await fetch("/api/shipping", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              cart_id: cartId,
                              pincode: val,
                              delivery_country: "IN",
                            }),
                          });

                          const data = await res.json();

                          if (!res.ok)
                            throw new Error("Failed to fetch shipping details");

                          // 🧩 If backend says error, show it
                          if (data?.cart?.error) {
                            setFormError((prev) => ({
                              ...prev,
                              pin: data.cart.msg || "Invalid pincode",
                            }));
                            return;
                          }

                          // ✅ valid pincode, refresh cart
                          window.dispatchEvent(new Event("cart-updated"));
                        } catch (err) {
                          console.error(
                            "🚨 Error fetching shipping data:",
                            err,
                          );
                          setFormError((prev) => ({
                            ...prev,
                            pin: "Something went wrong. Try again.",
                          }));
                        }
                      }
                    }}
                  />

                  {formError.pin && (
                    <p className="text-red-600 text-sm mt-1">{formError.pin}</p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <input
                type="tel"
                name="contact"
                placeholder="Phone"
                className="input mt-4 bg-white"
                value={formData.contact}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                autoComplete="off"
              />
              {formError.contact && (
                <p className="text-red-600 text-sm mt-1">{formError.contact}</p>
              )}
            </div>

            <div className="w-full lg:w-[400px] order-2 lg:order-none sticky lg:top-0 h-fit lg:h-screen overflow-y-auto py-8 border-t lg:border-t-0 lg:border-l border-gray-300 block lg:hidden">
              <div className="space-y-6">
                {/* 💸 More Offers */}
                {bogoOffers.length > 0 && (
                  <div className="mt-6">
                    <h2 className="text-base font-bold mb-3">More offers</h2>

                    <div className="space-y-4">
                      {bogoOffers.map((offer) => (
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
          cartItems.length === 0 || applyingOffer || offerApplied
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-[#A00300] hover:bg-red-700"
        }`}
                                onClick={() =>
                                  cartItems.length > 0 &&
                                  applyBogoOffer(offer.id)
                                }
                                disabled={
                                  cartItems.length === 0 ||
                                  applyingOffer ||
                                  offerApplied
                                }
                              >
                                {applyingOffer
                                  ? "Applying..."
                                  : offerApplied
                                    ? "Applied"
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
                      ))}
                    </div>
                  </div>
                )}
                <h1 className="text-xl font-[800] tracking-tight">
                  Order Summary
                </h1>

                {/* 🛍 Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.rowid} className="flex items-start gap-4 mt-6">
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        <span dangerouslySetInnerHTML={{ __html: item.name }} />
                        <br />x {item.qty}
                      </p>

                      <p className="text-sm mt-1 text-right">
                        ₹{(Number(item.price) * Number(item.qty)).toFixed(2)}
                      </p>

                      {item.deliveryDays && (
                        <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-red-700" />
                          Delivered in {item.deliveryDays} days
                        </p>
                      )}

                      {/* ✅ Custom Print */}
                      {customizedTexts?.[item.rowid] && (
                        <div className="mt-2 px-2 py-1 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300]">
                            Custom Print
                          </p>
                          <p className="text-xs font-medium text-gray-800 break-words">
                            “{customizedTexts[item.rowid]}”
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 🎁 Discount Input */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={code}
                      onChange={(e) => {
                        const newCode = e.target.value;

                        // ✅ ONLY clear when actual change happens
                        if (newCode !== code) {
                          setIsApplied(false);
                          setCouponValue(0);
                          setCouponMessage("");
                        }

                        setCode(newCode);
                      }}
                      className="input flex-1 bg-white"
                    />

                    <div className="flex flex-col items-center relative">
                      <button
                        onClick={handleApply}
                        disabled={isApplied}
                        className={`bg-gray-200 text-sm font-bold p-4 rounded-md relative z-10 transition-all duration-200 ${
                          isApplied ? "text-green-600" : "text-gray-600"
                        }`}
                      >
                        {isApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  </div>

                  {/* Coupon message (error or success) */}
                  {couponMessage && (
                    <p
                      className={`text-xs font-medium mt-1 ${
                        isApplied ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* 📦 Summary */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between items-start">
                    <span>Subtotal</span>

                    <div className="flex flex-col items-end">
                      <span>₹{subtotal.toFixed(2)}</span>
                      <span className="text-xs text-gray-500">
                        (Incl. GST ₹{tax.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>

                  {couponValue > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        {limitedDealApplied
                          ? "Hot Deal Discount"
                          : "Coupon Discount"}
                      </span>
                      <span>-₹{couponValue.toFixed(2)}</span>
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
                          limitedDealApplied
                            ? "text-green-600 text-xl"
                            : "text-lg"
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

                {/* Pay Now (Mobile Only) */}
                {/* <div className="block lg:hidden">
          <RazorpayButton />
        </div> */}
              </div>
            </div>

            {/* Payment Section */}
            <div className="">
              <h1 className="text-xl font-[800] tracking-tight">Payment</h1>
              <p className="text-gray-400 text-xs">
                All transactions are secure and encrypted.
              </p>

              <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
                <label
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between "
                  onClick={handleToggle}
                >
                  <div className="flex items-start gap-2 sm:items-center">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={selectedMethod === "razorpay"}
                      onChange={handleRadioChange}
                      className="accent-black w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium">
                      Razorpay Secure
                      <br className="block sm:hidden" />
                      <br className="hidden lg:block" />
                      <span className="text-xs text-gray-600">
                        (UPI, Cards, Wallets, NetBanking)
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 justify-end sm:justify-normal">
                    <img
                      src="/upi.svg"
                      alt="UPI"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                    <img
                      src="/visa.svg"
                      alt="Visa"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                    <img
                      src="/master.svg"
                      alt="Master"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                    <img
                      src="/rupay.svg"
                      alt="Rupay"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    />
                    <div className="relative group">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer group-hover:bg-gray-200">
                        +16
                      </div>
                      <div className="absolute bottom-12 right-0 hidden group-hover:grid grid-cols-4 gap-2 bg-black shadow-xl rounded-lg border p-2 z-20 w-[176px]">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <img
                            key={i}
                            src={`/${i + 1}.svg`}
                            alt={`Payment ${i + 1}`}
                            className="w-7 h-7 object-contain"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </label>

                <AnimatePresence initial={false}>
                  <motion.div
                    key={showInfo ? "visible" : "hidden"}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      marginBottom: showInfo ? 16 : 0, // Prevents button jump
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {showInfo && (
                      <div className="border-t pt-4 mt-6 text-center bg-gray-50">
                        <div className="flex justify-center mb-3">
                          <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                        </div>
                        <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                          After clicking “Pay now”, you'll be redirected to
                          Razorpay Payment Gateway to securely complete your
                          purchase using UPI, Cards, Wallets or NetBanking.
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Button Section */}
            <div className="mt-6">
              {/* Trigger */}
              <button
                onClick={handleOrderAndPay}
                disabled={isProcessing}
                className={`py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 
    ${
      isProcessing
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-black text-white hover:bg-gray-900"
    }
  `}
              >
                {isProcessing ? "Processing..." : "Proceed to Pay"}
              </button>
              {/* Hidden RazorpayButton for manual trigger */}
              <div style={{ display: "none" }}>
                <RazorpayButton
                  ref={razorRef}
                  total={total}
                  formData={formData}
                  clearForm={clearForm}
                  onSuccess={onPaymentSuccess}
                  onProcessingStart={onProcessingStart}
                  onFailure={onPaymentFailure}
                  formError={formError}
                  setFormError={setFormError}
                  orderDetails={orderDetails} // ✅ pass order details here
                />
              </div>
              <div style={{ display: "none" }}>
                <CashfreeButton
                  ref={cashfreeRef}
                  orderDetails={orderDetails}
                  formData={formData}
                  onSuccess={onPaymentSuccess}
                  onFailure={onPaymentFailure}
                  onProcessingStart={onProcessingStart}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
