"use client";
import usePincodeLookup from "./usePincodeLookup";
import { STATES } from "./constants";

// Guest-only fields: email, newsletter checkbox, and the Delivery block
// (country, names, address lines, city/state/PIN, phone).
export default function GuestDetailsForm({
  formData,
  handleChange,
  formError,
  setFormError,
  onNameBlur,
  isAuthReady,
  getValidToken,
}) {
  const { handlePinChange } = usePincodeLookup({
    handleChange,
    formError,
    setFormError,
    isAuthReady,
    getValidToken,
  });

  return (
    <>
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full mt-2 rounded-lg px-4 py-3 bg-white"
        value={formData.email}
        onChange={handleChange}
      />
      {formError.email && (
        <p className="text-red-600 text-sm mt-1">{formError.email}</p>
      )}

      <label className="mt-2 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          defaultChecked
          className="accent-black bg-white"
        />
        Email us for news and offers
      </label>

      {/* Delivery Section */}
      <div>
        <h1 className="text-xl font-[800] tracking-tight ">Delivery</h1>

        {/* Country Selector */}
        <div className="relative mt-2">
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`w-full appearance-none rounded-lg px-4 py-3 bg-white border text-sm pr-10 ${
              formError.country ? "border-red-500" : "border-gray-400"
            } ${formData.country === "" ? "text-gray-400" : "text-black"}`}
          >
            <option value="" disabled hidden>
              Country
            </option>
            <option value="india">India</option>
          </select>

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
            ▼
          </span>

          {formError.country && (
            <p className="text-red-600 text-sm mt-1">{formError.country}</p>
          )}
        </div>

        {/* Name Fields */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name Field */}
          <div className="flex flex-col">
            <input
              type="text"
              name="name"
              placeholder="First name"
              className="input bg-white"
              value={formData.name}
              onChange={handleChange}
              onBlur={onNameBlur}
            />
            {formError.name && (
              <p className="text-red-600 text-sm mt-1">{formError.name}</p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="flex flex-col">
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              className="input bg-white"
              value={formData.lastName || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Address Line 1 */}
        <div className="mt-4">
          <input
            type="text"
            name="addressLine1"
            placeholder="Flat, House no, Building, Company"
            className="input w-full pr-10 bg-white"
            value={formData.addressLine1}
            onChange={handleChange}
          />
          {formError.addressLine1 && (
            <p className="text-red-600 text-sm mt-1">
              {formError.addressLine1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="mt-4">
          <input
            type="text"
            name="addressLine2"
            placeholder="Area, Street, Village"
            className="input w-full bg-white"
            value={formData.addressLine2}
            onChange={handleChange}
          />
          {formError.addressLine2 && (
            <p className="text-red-600 text-sm mt-1">
              {formError.addressLine2}
            </p>
          )}
        </div>

        {/* City, State, PIN */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="input bg-white w-full"
              value={formData.city}
              onChange={handleChange}
            />
            {formError.city && (
              <p className="text-red-600 text-sm mt-1">{formError.city}</p>
            )}
          </div>

          {/* State */}
          <div className="relative">
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`input bg-white appearance-none pr-10 w-full px-4 py-3 border border-gray-400 rounded-lg text-sm ${
                formData.state === "" ? "text-gray-400" : "text-black"
              }`}
            >
              <option value="" disabled hidden>
                State
              </option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">
              ▼
            </span>
            {formError.state && (
              <p className="text-red-600 text-sm mt-1">{formError.state}</p>
            )}
          </div>

          {/* PIN Code */}
          <div>
            <input
              type="text"
              name="pin"
              placeholder="PIN code"
              className="input bg-white w-full"
              value={formData.pin}
              maxLength={6}
              inputMode="numeric"
              pattern="\d*"
              onChange={handlePinChange}
            />

            {formError.pin && (
              <p className="text-red-600 text-sm mt-1">{formError.pin}</p>
            )}
          </div>
        </div>

        {/* Contact */}
        <input
          type="tel"
          name="contact"
          placeholder="Phone"
          className="input mt-4 bg-white"
          value={formData.contact}
          onChange={handleChange}
          maxLength={10}
          inputMode="numeric"
          autoComplete="off"
        />
        {formError.contact && (
          <p className="text-red-600 text-sm mt-1">{formError.contact}</p>
        )}
      </div>
    </>
  );
}
