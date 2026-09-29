// app/hooks/useCartQty.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export function useCartQty(productId, getValidToken) {
  const [cartEntry, setCartEntry] = useState(null);
  const [processing, setProcessing] = useState(false);

  const syncFromCache = useCallback(() => {
    try {
      const raw = localStorage.getItem("cart_summary_cache");
      if (!raw) return setCartEntry(null);
      const data = JSON.parse(raw);
      const contents = data?.cart_data?.contents || {};
      const match = Object.values(contents).find(
        (item) => String(item.product_id) === String(productId),
      );
      if (!match) {
        setCartEntry(null);
      } else {
        setCartEntry({
          qty: Number(match.qty) || 1,
          rowid: match.rowid,
          variantId: match.option || null,
        });
      }
    } catch {
      setCartEntry(null);
    }
  }, [productId]);

  useEffect(() => {
    syncFromCache();
    window.addEventListener("cart-updated", syncFromCache);
    return () => window.removeEventListener("cart-updated", syncFromCache);
  }, [syncFromCache]);

  const patchCache = useCallback(
    (updater) => {
      try {
        const raw = localStorage.getItem("cart_summary_cache");
        if (!raw) return;
        const data = JSON.parse(raw);
        const contents = data?.cart_data?.contents;
        if (!contents) return;
        const key = Object.keys(contents).find(
          (k) => String(contents[k].product_id) === String(productId),
        );
        if (key === undefined) return;
        updater(contents, key);
        localStorage.setItem("cart_summary_cache", JSON.stringify(data));
      } catch {}
    },
    [productId],
  );

  // ── API: update qty ───────────────────────────────────────────────────────
  // rowid alone uniquely identifies the cart row — never send variant_id here.
  // Sending variant_id on an update causes the server to create a second row
  // for the same product instead of updating the existing one.
  const callQtyApi = useCallback(
    async (entry, newQty) => {
      const cartId = localStorage.getItem("cart_id");
      if (!cartId) return { ok: false, message: "No cart found" };

      const token = await getValidToken();
      const payload = {
        selected_country: "IN",
        historypincode: Number(localStorage.getItem("user_pincode") || 600002),
        cart_id: cartId,
        is_update: 1,
        rowid: entry.rowid,
        product_id: productId,
        qty: newQty,
        // No variant_id — rowid already identifies the exact cart row.
        // Including variant_id causes the server to insert a duplicate row.
      };

      const res = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.status === "error") {
        return { ok: false, message: data.message || "Failed to update cart" };
      }
      return { ok: true, message: null };
    },
    [productId, getValidToken],
  );

  // ── API: remove row ───────────────────────────────────────────────────────
  const callRemoveApi = useCallback(
    async (entry) => {
      const cartId = localStorage.getItem("cart_id");
      if (!cartId) return { ok: false, message: "No cart found" };

      const token = await getValidToken();
      const res = await fetch("/api/cartRemove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart_id: cartId, rowid: entry.rowid }),
      });
      const data = await res.json();

      if (data.status !== "success") {
        return { ok: false, message: data.message || "Failed to remove item" };
      }
      return { ok: true, message: null };
    },
    [getValidToken],
  );

  // ── increment ─────────────────────────────────────────────────────────────
  const increment = useCallback(async () => {
    if (processing || !cartEntry) return;
    setProcessing(true);

    const newQty = cartEntry.qty + 1;
    const snapshot = cartEntry;

    setCartEntry((prev) => prev && { ...prev, qty: newQty });

    const { ok, message } = await callQtyApi(snapshot, newQty);

    if (ok) {
      patchCache((contents, key) => {
        contents[key].qty = newQty;
      });
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      setCartEntry(snapshot);
      toast.error(message, { position: "top-right", autoClose: 3000 });
    }

    setProcessing(false);
  }, [processing, cartEntry, callQtyApi, patchCache]);

  // ── decrement ─────────────────────────────────────────────────────────────
  const decrement = useCallback(async () => {
    if (processing || !cartEntry) return;
    setProcessing(true);

    const snapshot = cartEntry;

    if (cartEntry.qty <= 1) {
      setCartEntry(null);

      const { ok, message } = await callRemoveApi(snapshot);

      if (ok) {
        patchCache((contents, key) => {
          delete contents[key];
        });
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        setCartEntry(snapshot);
        toast.error(message, { position: "top-right", autoClose: 3000 });
      }
    } else {
      const newQty = cartEntry.qty - 1;

      setCartEntry((prev) => prev && { ...prev, qty: newQty });

      const { ok, message } = await callQtyApi(snapshot, newQty);

      if (ok) {
        patchCache((contents, key) => {
          contents[key].qty = newQty;
        });
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        setCartEntry(snapshot);
        toast.error(message, { position: "top-right", autoClose: 3000 });
      }
    }

    setProcessing(false);
  }, [processing, cartEntry, callQtyApi, callRemoveApi, patchCache]);

  return {
    qty: cartEntry?.qty ?? 0,
    increment,
    decrement,
    processing,
  };
}
