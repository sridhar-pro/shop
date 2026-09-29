"use client";

import { toast } from "react-toastify";

export function createQuickAddHandler() {
  return async function handleQuickAdd(
    e,
    product,
    selectedVariants,
    btnEl,
    moq = 1,
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (!btnEl) return;
    if (btnEl.classList.contains("qa-loading")) return;

    const variants = Array.isArray(product.product_variants)
      ? product.product_variants
      : [];
    const hasVariants = variants.length > 0;

    const activeVariant =
      selectedVariants?.[product.id] || (hasVariants ? variants[0] : null);
    const activeVariantId = activeVariant?.id ?? null;

    const iconEl = btnEl.querySelector(".qa-pill-icon");
    const labelEl = btnEl.querySelector(".qa-pill-label");
    const defaultIcon = iconEl.innerHTML;
    const defaultLabel = moq > 1 ? `Add ${moq}` : "Add";

    const resetPill = () => {
      btnEl.classList.remove("qa-loading", "qa-added", "qa-error");
      labelEl.textContent = defaultLabel;
      iconEl.innerHTML = defaultIcon;
    };

    btnEl.classList.add("qa-loading");
    labelEl.textContent = "Adding…";
    iconEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>`;

    try {
      // ── Cart ID ──────────────────────────────────────────────────────────
      let cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        cartId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", cartId);
      }

      // ── Auth ─────────────────────────────────────────────────────────────
      const fetchToken = async () => {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data?.status === "success" && data?.token) {
          localStorage.setItem("authToken", data.token);
          return data.token;
        }
        throw new Error("Authentication failed");
      };

      let token = localStorage.getItem("authToken");
      if (!token) token = await fetchToken();

      // ── API payload ───────────────────────────────────────────────────────
      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: Number(localStorage.getItem("user_pincode") || 600002),
        qty: moq,
        cart_id: cartId,
        variant_id: activeVariantId ? [activeVariantId] : [],
      };

      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        const retryToken = await fetchToken();
        token = retryToken;
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${retryToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.status !== "success") {
        btnEl.classList.remove("qa-loading");
        btnEl.classList.add("qa-error");
        labelEl.textContent = "Failed";
        toast.error("Failed to add to cart");
        setTimeout(resetPill, 1600);
        return;
      }

      // ── Resolve display price ─────────────────────────────────────────────
      let resolvedPrice;
      if (hasVariants && activeVariant) {
        const variantPromoPercent = Number(activeVariant.promo_percentage) || 0;
        const variantDiscount = Number(activeVariant.discount_price) || 0;
        const variantBase = Number(activeVariant.price) || 0;
        const isPromoActive =
          product.promotion === "1" &&
          product.end_date &&
          new Date(product.end_date + "T23:59:59") >= new Date();
        resolvedPrice =
          isPromoActive && variantPromoPercent > 0 && variantDiscount > 0
            ? variantDiscount
            : variantBase;
      } else {
        const isPromoActive =
          product.promo_price &&
          product.end_date &&
          new Date(product.end_date) > new Date() &&
          Number(product.promo_price) > 0 &&
          Number(product.promo_price) < Number(product.price);
        resolvedPrice = isPromoActive
          ? Number(product.promo_price)
          : Number(product.price);
      }

      // ── Fetch real rowid from getTax ──────────────────────────────────────
      // The addcart response never returns a rowid, but the update API requires
      // the real server-assigned rowid. We fetch getTax right now (while the
      // pill shows "Added!") so the cache has the correct rowid before the
      // stepper ever tries to use it.
      let realRowid = null;
      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        if (taxRes.ok) {
          const taxData = await taxRes.json();
          // Write the authoritative cache immediately — this is the only source
          // of truth for rowids and will power both the stepper and CartSidebar.
          localStorage.setItem("cart_summary_cache", JSON.stringify(taxData));

          // Extract the real rowid for this product so we can confirm it landed
          const contents = taxData?.cart_data?.contents || {};
          const match = Object.values(contents).find(
            (item) => String(item.product_id) === String(product.id),
          );
          realRowid = match?.rowid || null;
        }
      } catch (taxErr) {
        // getTax failed — fall back to synthetic rowid; stepper will fail once
        // then CartSidebar open will correct it.
        console.warn("getTax after add failed:", taxErr);
        _patchSummaryCache({
          productId: product.id,
          qty: moq,
          rowid: `qa_${product.id}_${Date.now()}`,
          option: activeVariantId,
          name: product.name,
          image: activeVariant?.front_view || product.image || "",
          subtotal: `₹${(resolvedPrice * moq).toFixed(2)}`,
        });
      }

      // ── Update legacy cart_data (navbar badge etc.) ───────────────────────
      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]",
      );
      const existingIndex = existingCart.findIndex(
        (item) =>
          item.id === product.id &&
          (item.variant_id ?? null) === (activeVariantId ?? null),
      );
      const updatedCart =
        existingIndex >= 0
          ? existingCart.map((item, i) =>
              i === existingIndex ? { ...item, qty: item.qty + moq } : item,
            )
          : [
              ...existingCart,
              {
                id: product.id,
                name: product.name,
                qty: moq,
                price: resolvedPrice,
                image: activeVariant?.front_view || product.image,
                variant_id: activeVariantId,
                variant_name: activeVariant?.name ?? null,
              },
            ];
      localStorage.setItem("cart_data", JSON.stringify(updatedCart));

      // Notify — useCartQty re-reads the cache (now with real rowid)
      window.dispatchEvent(new Event("cart-updated"));

      // ── Success pill ──────────────────────────────────────────────────────
      btnEl.classList.remove("qa-loading");
      btnEl.classList.add("qa-added");
      labelEl.textContent = "Added!";
      iconEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(resetPill, 1600);

      const variantLabel = activeVariant?.name
        ? ` · ${activeVariant.name}`
        : "";
      toast.success(`🛒 Added to cart!${variantLabel}`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Quick-add error:", err);
      btnEl.classList.remove("qa-loading");
      btnEl.classList.add("qa-error");
      labelEl.textContent = "Failed";
      toast.error("Failed to add to cart");
      setTimeout(resetPill, 1600);
    }
  };
}

/**
 * Fallback: writes a synthetic cache row when getTax isn't available.
 * The real getTax call above is always preferred.
 */
function _patchSummaryCache({
  productId,
  qty,
  rowid,
  option,
  name,
  image,
  subtotal,
}) {
  try {
    let data;
    const raw = localStorage.getItem("cart_summary_cache");

    if (raw) {
      data = JSON.parse(raw);
    } else {
      data = {
        cart_data: {
          contents: {},
          subtotal: "₹0.00",
          grand_total: "₹0.00",
          shipping: "₹0.00",
          total_item_tax: "₹0.00",
        },
      };
    }

    const contents = data.cart_data?.contents;
    if (!contents) return;

    const existingKey = Object.keys(contents).find(
      (k) => String(contents[k].product_id) === String(productId),
    );

    if (existingKey) {
      contents[existingKey].qty = qty;
      contents[existingKey].rowid = rowid;
    } else {
      const newKey = rowid || `qa_${productId}`;
      contents[newKey] = {
        rowid,
        product_id: productId,
        id: productId,
        name,
        image,
        qty,
        subtotal,
        option: option || null,
        options: [],
      };
    }

    localStorage.setItem("cart_summary_cache", JSON.stringify(data));
  } catch (err) {
    console.warn("_patchSummaryCache error:", err);
  }
}
