"use client";
import React, { useState, useEffect } from "react";
import { Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import { PhoneCallIcon, Edit2, X, Home } from "lucide-react";

const Addresses = () => {
  const { getValidToken } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
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
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const companyId = localStorage.getItem("company_id");

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();
      const res = await fetch("/api/customer_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setAddresses(data.data);
      } else {
        toast.error(data.message || "Failed to fetch addresses ❌");
      }
    } catch (error) {
      console.error("Addresses API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle address add
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Adding address...");
    try {
      const token = await getValidToken();
      const requestBody = { company_id: companyId, ...formData, active: 1 };

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
        toast.update(toastId, {
          render: "Address added successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsAddModalOpen(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to add address ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // Handle address update
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Updating address...");
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
        toast.update(toastId, {
          render: "Address updated successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        setIsEditModalOpen(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to update address ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Update Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    const toastId = toast.loading("Deleting address...");
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
        toast.update(toastId, {
          render: "Address deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        fetchAddresses();
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to delete ❌",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Delete Address API Error ❌", error);
      toast.update(toastId, {
        render: "Something went wrong ❌",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
  };

  const resetForm = () => {
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
    setSelectedAddress(null);
  };

  // Open edit modal with prefilled data
  const openEditModal = (address) => {
    setSelectedAddress(address);
    setFormData({ ...address });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <div className="space-y-8 w-full px-4 md:px-8 lg:px-16 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {/* <MapPin className="w-6 h-6 text-[#a00300]" /> */}
          My Addresses
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#a00300] hover:bg-[#d86f6e] text-white px-5 py-2.5 rounded-xl shadow-md transition-transform hover:scale-105"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {/* Address Card Skeletons */}
          {[1, 2, 3].map((_, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`group relative p-6 rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${
                address.active === 1 ? "border-blue-500" : "border-gray-200"
              }`}
            >
              {/* Show Home Icon ONLY if active === 1 */}
              {address.active == 1 && (
                <div className="absolute top-5 right-5 text-blue-600">
                  <Home size={22} />
                </div>
              )}

              {/* Address Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {address.line1}
                </h3>
                <p className="text-sm text-gray-600">
                  {address.line2}, {address.city} - {address.postal_code}
                </p>
                <p className="text-sm text-gray-600">
                  {address.state}, {address.country}
                </p>
                {address.landmark && (
                  <p className="text-sm text-gray-600">
                    Landmark: {address.landmark}
                  </p>
                )}
                <p className="text-sm text-gray-700 flex items-center mt-3">
                  <PhoneCallIcon className="w-4 h-4 mr-1" />
                  {address.phone}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => openEditModal(address)}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-transform hover:scale-105"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-transform hover:scale-105"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600 text-lg">No addresses found.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  {isAddModalOpen ? (
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
                  ) : (
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
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {isAddModalOpen ? "Add New Address" : "Edit Address"}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {isAddModalOpen
                      ? "Enter the address details to save for faster checkout"
                      : "Update your delivery address details"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-8 pb-0 max-h-[65vh] overflow-y-auto">
              <form
                onSubmit={
                  isAddModalOpen ? handleAddAddress : handleUpdateAddress
                }
                id="address-modal-form"
              >
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
                      value={formData.line1}
                      onChange={handleChange}
                      placeholder="House / Flat / Building, Street"
                      required
                      className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                {/* Row 2: Line 2 full width */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Area / Locality
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
                      value={formData.line2}
                      onChange={handleChange}
                      placeholder="Area, Landmark, Near by place"
                      required
                      className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
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
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city or town"
                        required
                        className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
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
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        required
                        className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
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
                        value={formData.postal_code}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,6}$/.test(value)) {
                            handleChange(e);
                          }
                        }}
                        placeholder="6-digit pincode"
                        required
                        maxLength={6}
                        pattern="\d{6}"
                        title="Postal code must be exactly 6 digits"
                        className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Country + Landmark */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* Country */}
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
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Country"
                        required
                        className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Landmark
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
                        value={formData.landmark}
                        onChange={handleChange}
                        placeholder="Nearby landmark"
                        className="w-full border rounded-xl pl-10 pr-3 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                      />
                    </div>
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
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,10}$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      placeholder="Enter 10-digit mobile number"
                      required
                      maxLength={10}
                      pattern="\d{10}"
                      title="Phone number must be exactly 10 digits"
                      className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
              >
                <X size={13} />
                Cancel
              </button>
              <button
                type="submit"
                form="address-modal-form"
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
                {isAddModalOpen ? "Save Address" : "Update Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
