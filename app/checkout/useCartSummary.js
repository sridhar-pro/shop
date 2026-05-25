"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../utils/AuthContext";

export const useCartSummary = () => {
  const { getValidToken } = useAuth();

  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    raw: null,
  });

  const [loading, setLoading] = useState(false);

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

    if (!res.ok) throw new Error(`HTTP error! ${res.status}`);

    return res.json();
  };

  const fetchSummary = useCallback(async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    try {
      setLoading(true);

      const response = await fetchWithAuth("/api/getTax", {
        method: "POST",
        body: { cart_id: cartId },
      });

      const cart = response?.cart_data;
      if (!cart) return;

      const items = Object.values(cart.contents || {}).map((item) => ({
        ...item,
        price: parseCurrency(item.price),
      }));

      setCartData({
        items,
        subtotal: parseCurrency(cart.subtotal),
        shipping: parseCurrency(cart.shipping),
        tax: parseCurrency(cart.total_item_tax),
        total: parseCurrency(cart.grand_total),
        raw: response,
      });
    } catch (err) {
      console.error("❌ Shared getTax failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();

    const handler = () => fetchSummary();
    window.addEventListener("cart-updated", handler);

    return () => window.removeEventListener("cart-updated", handler);
  }, [fetchSummary]);

  return { cartData, loading, refreshSummary: fetchSummary };
};
