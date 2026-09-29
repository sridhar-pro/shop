"use client";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import {
  PhoneCallIcon,
  Pencil,
  Plus,
  Trash2,
  Wallet2,
  TrendingUp,
  Timer,
  Truck,
} from "lucide-react";
import { useSession } from "../context/SessionContext";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import RazorpayButtonLogged from "./RazorpayButtonLogged";
import Link from "next/link";
import CashfreeButton from "./CashfreeButton";

// ─── Premium Delete Confirmation Modal ─────────────────────────────────────────
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

        <div className="px-8 pt-8 pb-7 text-center">
          {/* Icon ring */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>

          <h3 className="text-[17px] font-bold text-gray-900 mb-1.5">
            Remove this address?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed max-w-[220px] mx-auto">
            This address will be permanently deleted and can't be recovered.
          </p>

          <div className="mt-7 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Keep it
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white shadow-sm shadow-red-200 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CheckoutAddress = ({
  cartItems,
  subtotal,
  total,
  tax,
  shipping,
  onSuccess,
  onFailure,
  customizedTexts, // ✅ ADD THIS
}) => {
  const razorRef = useRef(null);
  const cashfreeRef = useRef(null);

  // Debounce timer ref
  const debounceRef = useRef(null);
  const router = useRouter();

  const isApplyingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const skipNextApplyRef = useRef(false);

  const [addresses, setAddresses] = useState([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const [bogoOffers, setBogoOffers] = useState([]);
  const [applyingOffer, setApplyingOffer] = useState(false); // track button state
  const [appliedOffers, setAppliedOffers] = useState([]); // track applied BOGO offer IDs

  const [loadingadd, setLoadingadd] = useState(true);

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});

  const [couponMessage, setCouponMessage] = useState(""); // <-- new state
  const [couponValue, setCouponValue] = useState(0);

  const [isApplied, setIsApplied] = useState(false);

  const [orderDetails, setOrderDetails] = useState(null);

  const [offers, setOffers] = useState([]);
  // ✅ Filter only ACTIVE offers
  const filteredOffers = (offers || []).filter(
    (offer) =>
      offer.status === null || offer.status === "0" || offer.status === 0,
  );
  const [appliedCoupon, setAppliedCoupon] = useState("");

  // ── Delete confirmation modal state ──────────────────────────────────────────
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const stored = localStorage.getItem("selectedAddressId");
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedPhone, setSelectedPhone] = useState(() => {
    const stored = localStorage.getItem("selectedPhone");
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedPostalCode, setSelectedPostalCode] = useState(() => {
    const stored = localStorage.getItem("selectedPostalCode");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSelectAddress = async (id) => {
    setSelectedAddressId(id);

    const selected = addresses.find((addr) => addr.id === id);

    if (selected) {
      setSelectedAddress(selected);
      setSelectedPhone(selected.phone);
      setSelectedPostalCode(selected.postal_code);

      localStorage.setItem("selectedAddressId", JSON.stringify(id));
      localStorage.setItem("selectedPhone", JSON.stringify(selected.phone));
      localStorage.setItem(
        "selectedPostalCode",
        JSON.stringify(selected.postal_code),
      );

      // ✅ Call Shipping API
      try {
        const token = await getValidToken();
        const cartId = localStorage.getItem("cart_id");
        if (!cartId) {
          toast.error("Please select products before proceeding!");
          console.error("Cart ID not found!");
          return;
        }

        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_id: cartId,
            pincode: selected.postal_code,
            delivery_country: "IN",
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch shipping details");
        }

        await res.json();

        // 🚀 Just trigger a global refresh for OrderSummary
        window.dispatchEvent(new Event("cart-updated"));

        toast.success("Shipping details updated successfully!");
      } catch (err) {
        console.error("🚨 Error fetching shipping data:", err);
        toast.error("Failed to update shipping details");
      }
    }
  };

  useEffect(() => {
    if (
      selectedAddressId &&
      !addresses.some((addr) => addr.id === selectedAddressId)
    ) {
      console.warn(
        "⚠️ Selected address no longer exists in the current addresses list. Resetting...",
      );

      setSelectedAddress(null);
      setSelectedAddressId(null);
      setSelectedPhone(null);
      setSelectedPostalCode(null);

      localStorage.removeItem("selectedAddress");
      localStorage.removeItem("selectedAddressId");
      localStorage.removeItem("selectedPhone");
      localStorage.removeItem("selectedPostalCode");
    }
  }, [addresses, selectedAddressId]);

  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);

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

  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    landmark: "",
    phone: "",
  });

  const { getValidToken, isAuthReady } = useAuth();
  const { companyId } = useSession();

  // 🛡️ Helper: wait
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // 🛡️ Helper: robust token fetcher
  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();

      if (token && typeof token === "string" && token.length > 10) {
        return token;
      }

      if (attempt === 5) {
        localStorage.removeItem("authToken");
      }

      await wait(delay);
      attempt++;
    }

    throw new Error("❌ Auth token unavailable after multiple retries.");
  };

  // 🛡️ Helper: universal fetcher (works for POST too)
  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getTokenWithRetry();

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const fetchWithAuthBogo = async (url, options = {}, retry = false) => {
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

  // 🧮 Currency parser
  const parseCurrency = (val) =>
    Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  // 🔥 Limited-time hot deal config
  const LIMITED_DEAL_CODE = "FLATY100";
  const LIMITED_DEAL_DURATION = 600;

  const [limitedDealApplied, setLimitedDealApplied] = useState(false);
  const [dealTimer, setDealTimer] = useState(LIMITED_DEAL_DURATION);

  const handleApply = async (overrideCode = null) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isApplyingRef.current) return;
    isApplyingRef.current = true;

    const cartId = localStorage.getItem("cart_id");
    const finalCode = overrideCode || code;
    const trimmed = finalCode.trim();

    if (!cartId || !trimmed) {
      setCouponMessage("");
      setIsApplied(false);
      setCouponValue(0);

      try {
        localStorage.setItem("last_applied_coupon", "0");
      } catch (e) {
        console.warn("Error resetting last_applied_coupon", e);
      }
      isApplyingRef.current = false;
      return;
    }

    try {
      const applyResponse = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, coupon_code: trimmed }),
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

        try {
          const summaryResponse = await fetchWithAuth("/api/getTax", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart_id: cartId }),
          });

          const cartData = summaryResponse?.cart_data;

          const newCouponValue =
            cartData?.coupon_id && cartData?.coupon_id !== "0"
              ? parseCurrency(cartData.coupon_value || 0)
              : 0;

          setCouponValue(newCouponValue);

          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify({ cart_data: cartData }),
          );

          window.dispatchEvent(
            new CustomEvent("local-storage-update", {
              detail: { key: "cart_tax_details" },
            }),
          );
        } catch (err) {
          console.error("❌ Failed to sync after invalid coupon", err);
        }

        window.dispatchEvent(new Event("cart-updated"));

        return;
      }

      setCouponMessage("Discount applied successfully!");
      setIsApplied(true);
      setAppliedCoupon(trimmed);

      skipNextApplyRef.current = true;

      setLimitedDealApplied(false);
      setDealTimer(0);

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

      window.dispatchEvent(new Event("cart-updated"));

      const summaryResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId }),
      });

      const cartData = summaryResponse?.cart_data;
      if (!cartData) return;

      const appliedCoupon = cartData.coupon_id && cartData.coupon_id !== "0";

      setCouponValue(
        appliedCoupon ? parseCurrency(cartData.coupon_value || 0) : 0,
      );

      if (appliedCoupon) {
        if (!overrideCode) {
          setCode(cartData.coupon_id);
        }
      }

      try {
        localStorage.setItem(
          "cart_tax_details",
          JSON.stringify({ cart_data: cartData }),
        );
      } catch (e) {
        console.warn("Error saving cart_tax_details", e);
      }

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

  const handleApplyOfferCode = (offerCode) => {
    if (!offerCode) return;
    handleApply(offerCode);
  };

  const autoApplyLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartId,
          coupon_code: LIMITED_DEAL_CODE,
        }),
      });

      const ok = res?.status === true || res?.success === true;
      if (!ok) {
        console.info("Limited deal not applied:", res);
        return;
      }

      try {
        localStorage.setItem("limited_deal_applied_once", "1");
        localStorage.setItem("last_applied_coupon", LIMITED_DEAL_CODE);
      } catch (e) {
        console.warn("Could not persist limited-deal flag", e);
      }

      setLimitedDealApplied(true);
      setDealTimer(600);

      try {
        const expiresAt = Date.now() + LIMITED_DEAL_DURATION * 1000;
        localStorage.setItem("limited_deal_expiry", expiresAt.toString());
      } catch (e) {
        console.warn("Could not persist limited_deal_expiry", e);
      }

      const summaryResponse = await fetchWithAuth("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId }),
      });

      const cartData = summaryResponse?.cart_data;
      if (cartData) {
        setCouponValue(parseCurrency(cartData.coupon_value || 0));

        try {
          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify({ cart_data: cartData }),
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

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Failed to apply limited-time deal:", err);
    }
  };

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
        localStorage.removeItem("limited_deal_expiry");
      }
    } catch (e) {
      console.warn("Failed to restore limited deal timer:", e);
    }
  }, []);

  const removeLimitedDeal = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const res = await fetchWithAuth("/api/applyCoupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_id: cartId, coupon_code: "0" }),
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

      try {
        localStorage.removeItem("limited_deal_expiry");
      } catch (e) {
        console.error("Failed to clear limited_deal_expiry on removal:", e);
      }

      try {
        const summaryResponse = await fetchWithAuth("/api/getTax", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart_id: cartId }),
        });

        const cartData = summaryResponse?.cart_data;
        if (cartData) {
          setCouponValue(parseCurrency(cartData.coupon_value || 0));

          localStorage.setItem(
            "cart_tax_details",
            JSON.stringify({ cart_data: cartData }),
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

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const manualCoupon = localStorage.getItem("applied_coupon");
        const limitedOnce =
          localStorage.getItem("limited_deal_applied_once") === "1";

        if (manualCoupon) return;
        if (limitedOnce) return;

        autoApplyLimitedDeal();
      } catch (e) {
        console.warn("Auto deal check failed", e);
      }
    }, 120000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!limitedDealApplied) return;

    const interval = setInterval(() => {
      setDealTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!code.trim()) {
      setIsApplied(false);
      setCouponValue(0);
      setCouponMessage("");
      return;
    }

    if (skipNextApplyRef.current) {
      skipNextApplyRef.current = false;
      return;
    }

    if (isApplyingRef.current) return;

    debounceRef.current = setTimeout(() => {
      handleApply();
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  const fetchBogoOffers = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      const response = await fetchWithAuthBogo("/api/getTax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { cart_id: cartId },
      });

      setBogoOffers(response?.bogo_offers || []);
      setOffers(response?.offers || []);

      const applied = response?.cart_data?.coupon_id;
      if (applied && applied !== "0") {
        setAppliedCoupon(applied);
      } else {
        setAppliedCoupon("");
      }
    } catch (err) {
      console.error("❌ Failed to fetch offers:", err);
    }
  };

  useEffect(() => {
    fetchBogoOffers();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchAddresses();
    }
  }, [companyId]);

  if (!companyId) {
    return (
      <div className="flex justify-between items-center w-full">
        <h1 className="text-xl font-[800] tracking-tight">Contact</h1>
        <button
          onClick={() => router.push("/login")}
          className="text-gray-700 transition underline"
        >
          Log In
        </button>
      </div>
    );
  }

  const applyBogoOffer = async (bogoId) => {
    if (applyingOffer || appliedOffers.includes(bogoId)) return;

    try {
      setApplyingOffer(true);

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Cart ID not found!");
        return;
      }

      const data = await fetchWithAuthBogo("/api/bogo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { bogo_id: Number(bogoId), cart_id: cartId },
      });

      if (data.status === "error") {
        throw new Error(data.message || "Failed to apply offer");
      }

      toast.success(data.message || "Offer applied successfully");

      setAppliedOffers((prev) => [...prev, bogoId]);

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setApplyingOffer(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setLoadingadd(true);

      const data = await fetchWithAuth("/api/customer_address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });

      if (data.status && Array.isArray(data.data) && data.data.length > 0) {
        setAddresses(data.data);

        // ✅ Auto-select first active address if none already selected
        const storedId = localStorage.getItem("selectedAddressId");
        if (!storedId) {
          // Prefer active addresses first, fall back to any address
          const firstActive = data.data.find((addr) => addr.active === "1");
          const firstAny = data.data[0];
          const firstToSelect = firstActive || firstAny;

          if (firstToSelect) {
            setSelectedAddressId(firstToSelect.id);
            setSelectedAddress(firstToSelect);
            setSelectedPhone(firstToSelect.phone);
            setSelectedPostalCode(firstToSelect.postal_code);

            localStorage.setItem(
              "selectedAddressId",
              JSON.stringify(firstToSelect.id),
            );
            localStorage.setItem(
              "selectedPhone",
              JSON.stringify(firstToSelect.phone),
            );
            localStorage.setItem(
              "selectedPostalCode",
              JSON.stringify(firstToSelect.postal_code),
            );
          }
        }
      } else {
        setAddresses([]);
        setSelectedAddressId(null);
        setSelectedAddress(null);
        setSelectedPhone(null);
        setSelectedPostalCode(null);
        localStorage.removeItem("selectedAddressId");
        localStorage.removeItem("selectedPhone");
        localStorage.removeItem("selectedPostalCode");
        // Only toast if it's a real error, not a benign "no addresses" response
        if (data.message && data.message !== "No addresses found") {
          toast.error(data.message || "Failed to fetch addresses ❌");
        }
      }
    } catch (error) {
      console.error("Addresses API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
      setLoadingadd(false);
    }
  };

  // Separate active and inactive addresses
  const activeAddresses = addresses.filter((addr) => addr.active === "1");
  const inactiveAddresses = addresses.filter((addr) => addr.active === "0");

  const handleEditClick = (address) => {
    setSelectedAddress(address);
    setFormData({
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "",
      landmark: address.landmark || "",
      phone: address.phone || "",
    });
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone" || name === "postal_code") {
      value = value.replace(/\D/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    try {
      const token = await getValidToken();
      const requestBody = {
        id: selectedAddress.id,
        company_id: selectedAddress.company_id,
        ...formData,
        active: 1,
      };

      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        toast.success("Address updated successfully ✅");
        setIsEditModalOpen(false);
        await fetchAddresses();
        if (selectedAddressId === selectedAddress.id) {
          handleSelectAddress(selectedAddress.id);
        }
      } else {
        toast.error(data.message || "Failed to update address ❌");
      }
    } catch (error) {
      console.error("Update Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    try {
      const token = await getValidToken();
      const requestBody = {
        company_id: companyId,
        ...formData,
        active: 1,
      };

      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        toast.success("Address added successfully ✅");
        setIsAddModalOpen(false);
        setFormData({
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          landmark: "",
          phone: "",
        });
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to add address ❌");
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  const validateAddressForm = () => {
    let newErrors = {};

    const requiredFields = [
      "line1",
      "line2",
      "city",
      "state",
      "postal_code",
      "country",
      "landmark",
      "phone",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "This field is required";
      }
    });

    const cleanPhone = formData.phone.replace(/\D/g, "");
    const cleanPostal = formData.postal_code.replace(/\D/g, "");

    if (cleanPhone && cleanPhone.length !== 10) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (cleanPostal && cleanPostal.length !== 6) {
      newErrors.postal_code = "Postal code must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Delete: open modal instead of toast ──────────────────────────────────────
  const handleDeleteAddress = (id) => {
    setPendingDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteModalOpen(false);
    const id = pendingDeleteId;
    setPendingDeleteId(null);

    try {
      const token = await getValidToken();
      const res = await fetch("/api/delete_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to delete ❌");
      }
    } catch (error) {
      console.error("Delete Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  const handleOrderAndPayLogged = async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    try {
      if (!isAuthReady) {
        toast.error("Authentication not ready yet. Please try again.");
        console.warn("⚠️ Auth not ready: isAuthReady =", isAuthReady);
        return;
      }

      const token = await getValidToken();

      const cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        toast.error("Please select products before proceeding!");
        console.error("Cart ID not found!");
        return;
      }

      const activeAddresses = addresses.filter((addr) => addr.active === "1");

      if (!activeAddresses.length) {
        toast.error("Please select an active address before proceeding.");
        console.warn("⚠️ No active address selected!");
        return;
      }

      const addressId = selectedAddressId || activeAddresses[0]?.id || null;
      let couponToSend = "";

      try {
        const raw = localStorage.getItem("cart_summary_cache");
        const cached = raw ? JSON.parse(raw) : {};

        const cartData = cached?.cart_data;

        const couponId = cartData?.coupon_id;
        const couponValue = parseCurrency(cartData?.coupon_value || 0);

        if (couponId && couponId !== "0" && couponValue > 0) {
          couponToSend = couponId;
        }
      } catch (e) {
        console.warn("⚠️ Failed to read cart_summary_cache", e);
      }

      if (!couponToSend) {
        const rawLast =
          localStorage.getItem("last_applied_coupon") ||
          localStorage.getItem("applied_coupon");

        if (rawLast && rawLast !== "0") {
          couponToSend = rawLast;
        }
      }

      let affiliateCode = null;

      try {
        const affiliateRes = await fetch("/api/referral/current", {
          method: "GET",
          credentials: "include",
        });

        if (!affiliateRes.ok) {
          throw new Error(`HTTP ${affiliateRes.status}`);
        }

        const affiliateData = await affiliateRes.json();

        affiliateCode = affiliateData?.affiliate_code || null;
      } catch (err) {
        console.warn("Failed to fetch affiliate status:", err);
      }

      const customerPayload = {
        customer: {
          id: 0,
          company: "-",
          name: "",
          email: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
        },
        company_id: companyId,
        address_id: addressId,
        cart_id: cartId,
        coupon_code: couponToSend,
        ...(affiliateCode && { affiliate_code: affiliateCode }),
      };

      // ✅ Fire AddPaymentInfo when logged-in user clicks Pay
      const { trackEvent } = await import("@/app/lib/trackEvent");
      trackEvent({
        eventName: "AddPaymentInfo",
        customData: {
          value: total,
          currency: "INR",
          contentIds: cartItems.map((item) => item.product_id?.toString()),
          contentType: "product",
        },
      });

      console.log(
        "📦 Payload being sent to /api/createOrder:",
        customerPayload,
      );

      const res = await fetch("/api/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerPayload),
      });

      const result = await res.json();

      console.log("📥 Raw API Response:", result);

      if (!res.ok) {
        console.error("❌ Error creating order:", result);
        throw new Error(result?.message || "Failed to create order.");
      }

      console.log("✅ Logged-in order created successfully:", result);

      const paymentType = result?.type || "razorpay";

      if (paymentType === "cashfree") {
        if (!result?.r_response?.payment_session_id) {
          throw new Error("Cashfree session missing");
        }

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

        return;
      }

      const razorpayOrder = result?.r_response?.data;
      if (!razorpayOrder?.id || !razorpayOrder?.amount) {
        throw new Error("Razorpay order data missing from response");
      }

      setOrderDetails({
        sale_id: result.sale_id,
        order_id: result.order_id,
        r_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
      });

      localStorage.setItem("order_id_data", JSON.stringify(result));

      window.dispatchEvent(
        new CustomEvent("orderIdDataUpdated", {
          detail: result?.order_id,
        }),
      );

      setTimeout(() => {
        razorRef.current?.click();
      }, 100);
    } catch (err) {
      console.error("🚨 Logged-in Order creation error:", err);
      toast.error(
        err.message || "Something went wrong while creating the order.",
      );
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  // ── FIXED: Always show all addresses; active first, then inactive ─────────────
  // If no active addresses exist, inactive ones are shown directly (no toggle needed)
  const hasActiveAddresses = activeAddresses.length > 0;

  const allAddresses = hasActiveAddresses
    ? [...activeAddresses, ...(showInactive ? inactiveAddresses : [])]
    : addresses; // no active ones → show everything directly

  // Move the selected address to the top
  const sortedAddresses = [...allAddresses].sort((a, b) => {
    if (a.id === selectedAddressId) return -1;
    if (b.id === selectedAddressId) return 1;
    return 0;
  });

  if (loadingadd) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start animate-pulse"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="mt-1 w-4 h-4 rounded-full bg-gray-300" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* ── Premium Delete Confirmation Modal ─────────────────────────────── */}
      <AnimatePresence>
        {deleteModalOpen && (
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setPendingDeleteId(null);
            }}
            onConfirm={confirmDelete}
          />
        )}
      </AnimatePresence>

      <div className="space-y-4 relative">
        {/* ✅ Empty state — only when truly no addresses at all */}
        {sortedAddresses.length === 0 ? (
          <div className="border rounded-lg p-6 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
            <p className="text-gray-500 text-sm">No addresses found.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
            >
              + Add Address
            </button>
          </div>
        ) : (
          <>
            {sortedAddresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start cursor-pointer transition
          ${
            selectedAddressId === address.id
              ? "border-green-500 ring-2 ring-green-400"
              : "hover:border-blue-400"
          }`}
                onClick={() => handleSelectAddress(address.id)}
              >
                {/* Left: Radio + Address Info */}
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === address.id}
                    onChange={() => handleSelectAddress(address.id)}
                    className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Delivery to {address.line1}
                    </p>
                    <p className="text-sm text-gray-600 ">
                      {address.line2}, {address.city} - {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600 ">
                      {address.state}, {address.country}, Landmark:{" "}
                      {address.landmark}
                    </p>
                    <p className="text-sm text-gray-600 flex">
                      <PhoneCallIcon className="w-4 h-4 mr-1 mt-0.5" />
                      {address.phone}
                    </p>
                  </div>
                </div>

                {/* Right: Edit/Delete Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(address);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Edit address"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Delete address"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Buttons Row — only show Change Addresses toggle when there ARE active addresses */}
            <div className="flex justify-end items-center gap-4 mt-2">
              {hasActiveAddresses && inactiveAddresses.length > 0 && (
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="text-sm font-medium underline text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showInactive ? "Show Less" : "Change Addresses"}
                </button>
              )}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
              >
                + Add Address
              </button>
            </div>
          </>
        )}

        {/* Add Address Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              {/* Header */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                        stroke="#16a34a"
                        strokeWidth="1.8"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="9"
                        r="2.5"
                        stroke="#16a34a"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add New Address
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Enter the address details to save for faster checkout
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="px-8 pb-0 max-h-[65vh] overflow-y-auto">
                <form onSubmit={handleAddAddress} id="add-address-form">
                  {/* Row 1: Line 1 full width */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="9 22 9 12 15 12 15 22"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="line1"
                        placeholder="House / Flat / Building, Street"
                        value={formData.line1}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.line1 ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.line1 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line1}
                      </p>
                    )}
                  </div>

                  {/* Row 2: Line 2 full width */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Area / Locality <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M3 9h18M9 21V9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="line2"
                        placeholder="Area, Landmark, Near by place"
                        value={formData.line2}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.line2 ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.line2 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line2}
                      </p>
                    )}
                  </div>

                  {/* Row 3: City / State / Postal Code */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        City / Town <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="7"
                              width="20"
                              height="14"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="city"
                          placeholder="Enter city or town"
                          value={formData.city}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6l9-4 9 4v6c0 5.25-3.6 10.14-9 11.25C6.6 22.14 3 17.25 3 12V6z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="state"
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M7 11V7a5 5 0 0110 0v4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="postal_code"
                          placeholder="6-digit pincode"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.postal_code ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.postal_code && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.postal_code}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Country + Landmark */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={formData.country}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.country ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Landmark <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <circle
                              cx="12"
                              cy="9"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="landmark"
                          placeholder="Nearby landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.landmark ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.landmark && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Phone */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.07 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter 10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-address-form"
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-sm transition"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1.5 7l4 4 7-7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Save Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Address Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              {/* Header */}
              <div className="px-8 pt-8 pb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                        stroke="#16a34a"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        stroke="#16a34a"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Address
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Update your delivery address details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Form Body */}
              <div className="px-8 pb-0 max-h-[65vh] overflow-y-auto">
                <form onSubmit={handleUpdateAddress} id="edit-address-form">
                  {/* Row 1: Line 1 full width */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="9 22 9 12 15 12 15 22"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="line1"
                        placeholder="House / Flat / Building, Street"
                        value={formData.line1}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.line1 ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.line1 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line1}
                      </p>
                    )}
                  </div>

                  {/* Row 2: Line 2 full width */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Address Line 2{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M3 9h18M9 21V9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="line2"
                        placeholder="Area, Landmark, Near by place"
                        value={formData.line2}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.line2 ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.line2 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line2}
                      </p>
                    )}
                  </div>

                  {/* Row 3: City / State / Postal Code */}
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        City / Town <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="7"
                              width="20"
                              height="14"
                              rx="1"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="city"
                          placeholder="Enter city or town"
                          value={formData.city}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.city ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6l9-4 9 4v6c0 5.25-3.6 10.14-9 11.25C6.6 22.14 3 17.25 3 12V6z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="state"
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.state ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <rect
                              x="3"
                              y="11"
                              width="18"
                              height="11"
                              rx="2"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M7 11V7a5 5 0 0110 0v4"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="postal_code"
                          placeholder="6-digit pincode"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.postal_code ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.postal_code && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.postal_code}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Country + Landmark */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="country"
                          placeholder="Country"
                          value={formData.country}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.country ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Landmark <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <circle
                              cx="12"
                              cy="9"
                              r="2.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                          </svg>
                        </span>
                        <input
                          type="text"
                          name="landmark"
                          placeholder="Nearby landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          className={`w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition
                    ${errors.landmark ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                        />
                      </div>
                      {errors.landmark && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Phone full width */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.07 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter 10-digit mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition
                  ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-address-form"
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold shadow-sm transition"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1.5 7l4 4 7-7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Save Address
                </button>
              </div>
            </div>
          </div>
        )}
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
                  title="UPI"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/visa.svg"
                  alt="Visa"
                  title="Visa"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/master.svg"
                  alt="Master"
                  title="Master"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
                <img
                  src="/rupay.svg"
                  alt="Rupay"
                  title="Rupay"
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
                        title={`Supported Payment Method ${i + 1}`}
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
                  marginBottom: showInfo ? 16 : 0,
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
                      After clicking "Pay now", you'll be redirected to Razorpay
                      Payment Gateway to securely complete your purchase using
                      UPI, Cards, Wallets or NetBanking.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {filteredOffers.length > 0 && (
            <div className="mt-6 mb-6 block md:hidden">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="flex-shrink-0"
                >
                  <path
                    d="M17 9L11 3H3v8l6 6 8-8z"
                    stroke="#A00300"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="7.5" cy="7.5" r="1.5" fill="#A00300" />
                </svg>
                <h2 className="text-[15px] font-medium text-gray-900 tracking-[0.01em]">
                  Available offers
                </h2>
                <span className="ml-auto text-[11px] font-medium text-[#A00300] bg-[#FEF2F2] rounded-full px-2.5 py-0.5">
                  {filteredOffers.length}{" "}
                  {filteredOffers.length === 1 ? "offer" : "offers"}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {filteredOffers.map((offer, index) => {
                  const isAppliedOffer = appliedCoupon === offer.code;

                  return (
                    <motion.div
                      key={offer.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: index * 0.09,
                        duration: 0.32,
                        ease: "easeOut",
                      }}
                      className={`relative overflow-hidden rounded-[18px] border flex items-center gap-3 px-4 py-3.5 transition-all duration-200 ${
                        isAppliedOffer
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-white active:scale-[0.985]"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                          isAppliedOffer ? "bg-green-100" : "bg-[#FEF2F2]"
                        }`}
                      >
                        {isAppliedOffer ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M4 10l4 4 8-8"
                              stroke="#15803D"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                              stroke="#A00300"
                              strokeWidth="1.4"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isAppliedOffer
                                ? "bg-green-500"
                                : "bg-[#A00300] animate-pulse"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-medium uppercase tracking-[0.09em] ${
                              isAppliedOffer
                                ? "text-green-600"
                                : "text-[#A00300]"
                            }`}
                          >
                            {isAppliedOffer ? "Applied" : "Special offer"}
                          </span>
                        </div>
                        <p className="text-[13px] font-bold text-gray-800 mt-0.5 leading-snug uppercase">
                          {offer.reference || "Save more on your order"}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                      {/* Button */}
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => handleApplyOfferCode(offer.code)}
                        disabled={isAppliedOffer || isApplyingRef.current}
                        className={`flex-shrink-0 text-[12px] font-medium px-4 py-2 rounded-full border-[1.5px] transition-all duration-200 whitespace-nowrap ${
                          isAppliedOffer
                            ? "bg-green-50 text-green-700 border-green-300 cursor-default"
                            : "bg-transparent text-[#A00300] border-[#A00300] active:bg-[#A00300] active:text-white"
                        }`}
                      >
                        {isAppliedOffer ? "Applied ✓" : "Apply"}
                      </motion.button>
                    </motion.div>
                  );
                })}
                {/* Coupon message (error or success) */}
                {couponMessage && (
                  <p
                    className={`text-xs font-medium mt-1 mb-3 px-2 ${
                      isApplied ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 💸 More Offers */}
          {bogoOffers.length > 0 && (
            <div className="mt-6 mb-6 block md:hidden">
              <h2 className="text-xl font-bold mb-3">More offers</h2>

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
                          className={`text-xs font-semibold text-white px-3 py-1 rounded-lg shadow transition-colors ml-4 shrink-0 ${
                            appliedOffers.includes(offer.id)
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-[#A00300] hover:bg-red-700"
                          }`}
                          onClick={() => applyBogoOffer(offer.id)}
                          disabled={
                            applyingOffer || appliedOffers.includes(offer.id)
                          }
                        >
                          {appliedOffers.includes(offer.id)
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
                            title="Special Offers"
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

          <div className=" block lg:hidden">
            <h1 className="text-xl font-[800] tracking-tight mt-8">
              Order Summary
            </h1>

            {/* 🛍 Cart Items */}
            {cartItems.map((item) => (
              <div
                key={item.rowid}
                className="flex items-start gap-4 mt-6 mb-4"
              >
                <img
                  src={getImageSrc(item.image)}
                  alt={item.name}
                  title={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.name} <br /> x {item.qty}
                  </p>
                  <p className="text-sm mt-1 text-right">
                    ₹
                    {(
                      Number(item.price?.toString().replace(/[^0-9.-]+/g, "")) *
                      Number(item.qty)
                    ).toFixed(2)}
                  </p>
                  {item.deliveryDays && (
                    <p className="text-xs text-red-700 mt-0.5 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-red-700" />
                      Delivered in {item.deliveryDays} days
                    </p>
                  )}

                  {/* ✍️ Custom Print */}
                  {customizedTexts?.[item.rowid] && (
                    <div className="mt-2 px-2 py-1 rounded-md border border-dashed border-[#A00300]/40 bg-[#A00300]/5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#A00300]">
                        Custom Print
                      </p>
                      <p className="text-xs font-medium text-gray-800 break-words">
                        "{customizedTexts[item.rowid]}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 🎁 Discount Input */}
            <div className="flex flex-col gap-1 mb-4">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={code}
                  onChange={(e) => {
                    const newCode = e.target.value;

                    if (newCode !== code) {
                      setIsApplied(false);
                      setCouponValue(0);
                      setCouponMessage("");
                      setAppliedCoupon("");
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
                  <span>Coupon Discount</span>
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
                      <span className="line-through text-gray-500">
                        ₹{(total + (couponValue || 100)).toFixed(2)}
                      </span>

                      <span className="text-red-700 tracking-wider font-semibold">
                        -₹{(couponValue || 100).toFixed(2)} saved
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end">
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
        <div className="mt-6">
          <button
            onClick={handleOrderAndPayLogged}
            disabled={!selectedAddressId || isProcessing}
            className={`py-3 px-6 rounded-md w-full font-semibold transition-all duration-300 
      ${
        selectedAddressId
          ? "bg-black text-white hover:bg-gray-900 cursor-pointer"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
            title={!selectedAddressId ? "Select an address" : ""}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </button>

          {/* Hidden RazorpayButton for manual trigger */}
          <div style={{ display: "none" }}>
            <RazorpayButtonLogged
              ref={razorRef}
              total={total}
              onSuccess={onSuccess}
              onFailure={onFailure}
              orderDetails={orderDetails}
            />
          </div>
          <div style={{ display: "none" }}>
            <CashfreeButton
              ref={cashfreeRef}
              orderDetails={orderDetails}
              onSuccess={onSuccess}
              onFailure={onFailure}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutAddress;
