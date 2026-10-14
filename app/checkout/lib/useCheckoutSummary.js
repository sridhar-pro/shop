"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { parseCurrency } from "../lib/checkoutHelpers";
import { getCartSummary } from "../lib/cartSummaryService";

// Owns: cart items, totals, customised texts, /getTax fetch,
// localStorage sync and the InitiateCheckout event.
export default function useCheckoutSummary({ fetchWithAuth }) {
  const router = useRouter();
  const hasRedirected = useRef(false);

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [customizedTexts, setCustomizedTexts] = useState({});

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
      const response = await getCartSummary(cartId, fetchWithAuth);
      console.log("CartData", response);

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

      // ✅ If cart_data is missing or contents empty, redirect
      const isEmpty =
        !cartData ||
        !cartData.contents ||
        Object.keys(cartData.contents).length === 0;
      if (isEmpty && !hasRedirected.current) {
        hasRedirected.current = true; // ✅ avoid toast spam
        toast.error("Your cart is empty. Please select a product", {
          style: { background: "#000", color: "#fff" },
          position: "top-right",
          className: "!mt-8",
        });

        setTimeout(() => router.push("/products"), 1000);
        return;
      }

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
        deliveryDays: item.deliveryDays || null,
      }));
      setCartItems(itemsArray);

      // Totals from cart_data
      setSubtotal(parseCurrency(cartData.subtotal));
      setShipping(parseCurrency(cartData.shipping));
      setTax(parseCurrency(cartData.total_item_tax));
      setTotal(parseCurrency(cartData.grand_total));
    } catch (err) {
      console.error("❌ Failed to fetch summary:", err);
    }
  };

  // Initial load + refresh on "cart-updated" + InitiateCheckout event
  useEffect(() => {
    fetchSummary();

    // ✅ Fire InitiateCheckout when user lands on checkout
    import("@/app/lib/trackEvent").then(({ trackEvent }) => {
      trackEvent({ eventName: "InitiateCheckout" });
    });

    const handleCartUpdate = () => fetchSummary();
    window.addEventListener("cart-updated", handleCartUpdate);

    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  // Keep in sync with cart_shipping_details / cart_tax_details in localStorage
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

  return {
    cartItems,
    setCartItems,
    subtotal,
    shipping,
    tax,
    total,
    customizedTexts,
  };
}
