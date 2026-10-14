"use client";

// One modal for both "Add New Address" and "Edit Address" — they were two
// near-identical 300-line blocks. Only the MODES config below differs.
// State / validation / API calls come from useAddressCrud.

const Req = () => <span className="text-red-500">*</span>;

const icons = {
  house: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  city: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
  ),
  shield: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6l9-4 9 4v6c0 5.25-3.6 10.14-9 11.25C6.6 22.14 3 17.25 3 12V6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  lock: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
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
  ),
  globe: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ),
  pin: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  phone: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 4.18 2 2 0 015.07 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006.99 7l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const MODES = {
  add: {
    formId: "add-address-form",
    zClass: "z-[100]",
    title: "Add New Address",
    subtitle: "Enter the address details to save for faster checkout",
    headerIcon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          stroke="#16a34a"
          strokeWidth="1.8"
          fill="none"
        />
        <circle cx="12" cy="9" r="2.5" stroke="#16a34a" strokeWidth="1.8" />
      </svg>
    ),
    line1Label: (
      <>
        Street Address <Req />
      </>
    ),
    line2Label: (
      <>
        Area / Locality <Req />
      </>
    ),
  },
  edit: {
    formId: "edit-address-form",
    zClass: "z-50",
    title: "Edit Address",
    subtitle: "Update your delivery address details",
    headerIcon: (
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
    ),
    line1Label: (
      <>
        Address Line 1 <Req />
      </>
    ),
    line2Label: (
      <>
        Address Line 2{" "}
        <span className="text-gray-400 font-normal">(Optional)</span>
      </>
    ),
  },
};

const Field = ({
  label,
  name,
  placeholder,
  icon,
  formData,
  errors,
  onChange,
  padRight = "pr-3",
  wrapClass = "",
}) => (
  <div className={wrapClass}>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={onChange}
        className={`w-full border rounded-xl pl-10 ${padRight} py-3 text-sm outline-none transition
                  ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100"}`}
      />
    </div>
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
);

export default function AddressFormModal({
  mode, // "add" | "edit"
  formData,
  errors,
  handleChange,
  onSubmit,
  onClose,
}) {
  const m = MODES[mode];
  const shared = { formData, errors, onChange: handleChange };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 ${m.zClass} p-4`}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              {m.headerIcon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{m.title}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{m.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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
          <form onSubmit={onSubmit} id={m.formId}>
            {/* Row 1 + 2: address lines */}
            <Field
              {...shared}
              wrapClass="mb-5"
              label={m.line1Label}
              name="line1"
              placeholder="House / Flat / Building, Street"
              icon={icons.house}
              padRight="pr-4"
            />
            <Field
              {...shared}
              wrapClass="mb-5"
              label={m.line2Label}
              name="line2"
              placeholder="Area, Landmark, Near by place"
              icon={icons.grid}
              padRight="pr-4"
            />

            {/* Row 3: City / State / Postal Code */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <Field
                {...shared}
                label={
                  <>
                    City / Town <Req />
                  </>
                }
                name="city"
                placeholder="Enter city or town"
                icon={icons.city}
              />
              <Field
                {...shared}
                label={
                  <>
                    State <Req />
                  </>
                }
                name="state"
                placeholder="Enter state"
                icon={icons.shield}
              />
              <Field
                {...shared}
                label={
                  <>
                    Pincode <Req />
                  </>
                }
                name="postal_code"
                placeholder="6-digit pincode"
                icon={icons.lock}
              />
            </div>

            {/* Row 4: Country + Landmark */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <Field
                {...shared}
                label={
                  <>
                    Country <Req />
                  </>
                }
                name="country"
                placeholder="Country"
                icon={icons.globe}
              />
              <Field
                {...shared}
                label={
                  <>
                    Landmark <Req />
                  </>
                }
                name="landmark"
                placeholder="Nearby landmark"
                icon={icons.pin}
              />
            </div>

            {/* Row 5: Phone */}
            <Field
              {...shared}
              wrapClass="mb-6"
              label={
                <>
                  Phone Number <Req />
                </>
              }
              name="phone"
              placeholder="Enter 10-digit mobile number"
              icon={icons.phone}
              padRight="pr-4"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
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
            form={m.formId}
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
  );
}
