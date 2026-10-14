"use client";
import { PhoneCallIcon, Pencil, Trash2 } from "lucide-react";

// Empty state, address cards (selected first), "Change Addresses" toggle and
// "+ Add Address". Selection / CRUD logic lives in useAddressBook / useAddressCrud.
export default function AddressList({
  addresses,
  showInactive,
  setShowInactive,
  selectedAddressId,
  handleSelectAddress,
  handleEditClick,
  handleDeleteAddress,
  onAdd,
}) {
  // Separate active and inactive addresses
  const activeAddresses = addresses.filter((addr) => addr.active === "1");
  const inactiveAddresses = addresses.filter((addr) => addr.active === "0");

  // Always show all addresses; active first, then inactive.
  // If no active addresses exist, inactive ones are shown directly.
  const hasActiveAddresses = activeAddresses.length > 0;

  const allAddresses = hasActiveAddresses
    ? [...activeAddresses, ...(showInactive ? inactiveAddresses : [])]
    : addresses;

  // Move the selected address to the top
  const sortedAddresses = [...allAddresses].sort((a, b) => {
    if (a.id === selectedAddressId) return -1;
    if (b.id === selectedAddressId) return 1;
    return 0;
  });

  // ✅ Empty state — only when truly no addresses at all
  if (sortedAddresses.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-white shadow-sm flex flex-col items-center justify-center text-center gap-3">
        <p className="text-gray-500 text-sm">No addresses found.</p>
        <button
          onClick={onAdd}
          className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
        >
          + Add Address
        </button>
      </div>
    );
  }

  return (
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
                {address.state}, {address.country}, Landmark: {address.landmark}
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

      {/* Buttons Row — "Change Addresses" only when there ARE active addresses */}
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
          onClick={onAdd}
          className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
        >
          + Add Address
        </button>
      </div>
    </>
  );
}
