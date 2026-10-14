"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { beginShippingUpdate } from "../../lib/shippingUpdateStore";
import { EMPTY_ADDRESS_FORM, REQUIRED_ADDRESS_FIELDS } from "./constants";

// Add / edit / delete address: modal open state, form values + validation,
// and the /api/edit_address and /api/delete_address calls.
export default function useAddressCrud({
  getValidToken,
  companyId,
  selectedAddress,
  setSelectedAddress,
  selectedAddressId,
  handleSelectAddress,
  fetchAddresses,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_ADDRESS_FORM });
  const [errors, setErrors] = useState({});

  // Delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

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

  const validateAddressForm = () => {
    let newErrors = {};

    REQUIRED_ADDRESS_FIELDS.forEach((field) => {
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

        // If the edited address is the selected one its shipping must be
        // recalculated. Hold Pay disabled from NOW, so there is no gap while
        // the address list reloads.
        const reprice = selectedAddressId === selectedAddress.id;
        const finish = reprice ? beginShippingUpdate() : null;
        try {
          await fetchAddresses();
          if (reprice) {
            // pass the edited values: the list in handleSelectAddress's closure is stale
            await handleSelectAddress(selectedAddress.id, {
              ...selectedAddress,
              ...formData,
            });
          }
        } finally {
          if (finish) finish();
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
        setFormData({ ...EMPTY_ADDRESS_FORM });
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to add address ❌");
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  // ── Delete: open modal instead of toast ──────────────────────────────────
  const handleDeleteAddress = (id) => {
    setPendingDeleteId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPendingDeleteId(null);
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

  return {
    isEditModalOpen,
    setIsEditModalOpen,
    isAddModalOpen,
    setIsAddModalOpen,
    formData,
    errors,
    handleEditClick,
    handleChange,
    handleUpdateAddress,
    handleAddAddress,
    deleteModalOpen,
    handleDeleteAddress,
    closeDeleteModal,
    confirmDelete,
  };
}
