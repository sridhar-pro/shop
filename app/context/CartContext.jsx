"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/app/utils/AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { getValidToken } = useAuth();
  const [items, setItems] = useState([]);

  const itemCount = items.reduce((sum, x) => sum + x.qty, 0);

  const refreshCart = async () => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      setItems([]);
      return;
    }

    const token = await getValidToken();

    const res = await fetch("/api/getTax", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cart_id: cartId }),
    });

    const data = await res.json();
    const cart = data.cart_data || {};

    const itemsArr = Object.values(cart.contents || {}).map((item) => ({
      rowid: item.rowid,
      qty: item.qty,
      subtotal: item.subtotal,
      name: item.name,
      image: item.image,
      product_id: item.product_id,
    }));

    setItems(itemsArr);
  };

  useEffect(() => {
    refreshCart();
    window.addEventListener("cart-updated", refreshCart);
    return () => window.removeEventListener("cart-updated", refreshCart);
  }, []);

  return (
    <CartContext.Provider value={{ items, itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
