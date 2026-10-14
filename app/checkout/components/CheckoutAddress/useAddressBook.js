"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { createFetchWithAuth } from "../../lib/checkoutHelpers";
import {
  beginShippingUpdate,
  finishAfterCartRefresh,
} from "../../lib/shippingUpdateStore";

// Saved addresses: list, selection (persisted in localStorage), shipping
// update on select, and fetching for the logged-in company.
export default function useAddressBook({
  fetchWithAuth,
  getValidToken,
  companyId,
}) {
  const [addresses, setAddresses] = useState([]);
  const [loadingadd, setLoadingadd] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);

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

  // addressOverride: pass the freshly edited address so the shipping call uses
  // its NEW pincode (`addresses` in this closure is the list from before the edit)
  const handleSelectAddress = async (id, addressOverride = null) => {
    setSelectedAddressId(id);

    const selected =
      addressOverride || addresses.find((addr) => addr.id === id);

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

      // ✅ Call Shipping API (Pay disabled + loader until the new price is applied)
      const finish = beginShippingUpdate();

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

        // keep Pay disabled until that refresh has applied the new shipping price
        await finishAfterCartRefresh(
          finish,
          cartId,
          createFetchWithAuth(getValidToken),
        );
      } catch (err) {
        console.error("🚨 Error fetching shipping data:", err);
        toast.error("Failed to update shipping details");
      } finally {
        finish(); // idempotent: also covers the error / missing-cart paths
      }
    }
  };

  // Reset selection if the selected address no longer exists
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

  const fetchAddresses = async () => {
    try {
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
      setLoadingadd(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAddresses();
    }
  }, [companyId]);

  return {
    addresses,
    loadingadd,
    selectedAddress,
    setSelectedAddress,
    selectedAddressId,
    handleSelectAddress,
    fetchAddresses,
  };
}
