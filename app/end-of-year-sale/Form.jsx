"use client";

import { useState } from "react";
import { User, Phone, Mail, Building2 } from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// ─── Reusable Components ───────────────────────────────────────────────────────

const FormInput = ({
  label,
  icon,
  name,
  value,
  onChange,
  error,
  type = "text",
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div
      className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white transition-all shadow-sm ${
        error
          ? "border-red-500"
          : "border-gray-200 focus-within:border-[#A00300]"
      }`}
    >
      <span className="text-[#A00300]">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const MultiSelect = ({ label, options, selected, onChange, error }) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((item, index) => {
        const active = selected.includes(item);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-[#A00300] to-[#000940] text-white border-transparent shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#A00300] hover:text-[#A00300]"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const SingleSelect = ({ label, options, selected, onChange, error }) => (
  <div className="space-y-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((item, index) => {
        const active = selected === item;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
              active
                ? "bg-gradient-to-r from-[#A00300] to-[#000940] text-white border-transparent shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#A00300] hover:text-[#A00300]"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ─── Options ──────────────────────────────────────────────────────────────────

const sourcingOptions = [
  "Corporate gifting",
  "Client / event gifting",
  "Pantry & hygiene products",
  "Bulk / custom procurement",
  "Professional services (training, coaching, workshops)",
  "Wellbeing programs",
  "Office supplies & workplace products",
  "Employee onboarding kits",
  "Not sure yet / need guidance",
];

const whoIsItForOptions = [
  "Employees",
  "Office Use",
  "Leadership / CXO Gifting",
  "Other",
  "Event / Conference",
];

const quantityOptions = [
  "50 - 100",
  "100 - 500",
  "500 - 1000",
  "1000+",
  "Not Sure Yet",
];
const timelineOptions = [
  "Within 1 Week",
  "2 - 4 Weeks",
  "1 - 2 Months",
  "Flexible",
];
const budgetOptions = ["₹1000 – ₹1500", "₹1500 – ₹2500", "Not defined yet"];
const customizationOptions = [
  "Yes (branding, packaging, personalization)",
  "No",
  "Not sure",
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Basic Info", "Sourcing", "Details"];

const StepIndicator = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-10">
    {STEP_LABELS.map((label, i) => {
      const step = i + 1;
      const isCompleted = current > step;
      const isActive = current === step;
      return (
        <div key={step} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "bg-gradient-to-br from-[#A00300] to-[#000940] text-white shadow-md"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {isCompleted ? "✓" : step}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                isActive
                  ? "text-[#A00300]"
                  : isCompleted
                    ? "text-green-500"
                    : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </div>
          {step < 3 && (
            <div
              className={`w-12 h-0.5 mb-4 rounded-full transition-all duration-500 ${
                isCompleted ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Animations ───────────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25, ease: "easeIn" } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Nav Buttons ──────────────────────────────────────────────────────────────

const NavButtons = ({
  onBack,
  onNext,
  nextLabel = "Next →",
  loading = false,
}) => (
  <div className="flex gap-3 pt-4">
    {onBack && (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onBack}
        className="w-1/3 py-4 border border-gray-300 text-gray-600 font-semibold rounded-xl transition-all duration-300 hover:border-[#A00300] hover:text-[#A00300]"
      >
        ← Back
      </motion.button>
    )}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={onNext ? "button" : "submit"}
      onClick={onNext}
      disabled={loading}
      className={`${onBack ? "w-2/3" : "w-full"} py-4 bg-gradient-to-r from-[#A00300] to-[#000940] text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60`}
    >
      {loading ? "Submitting..." : nextLabel}
    </motion.button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const EnquiryForm = () => {
  const { getValidToken } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    organisation: "",
    sourcing: [],
    whoIsItFor: [],
    quantity: "",
    timeline: "",
    budget: "",
    customization: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ── Validation ──

  const validateStep1 = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Full name is required";
    if (!formData.phone) e.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      e.phone = "Must be exactly 10 digits";
    if (!formData.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Enter a valid email";
    if (!formData.organisation.trim())
      e.organisation = "Organisation name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!formData.sourcing.length)
      e.sourcing = "Please select at least one option";
    if (!formData.whoIsItFor.length)
      e.whoIsItFor = "Please select at least one option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!formData.quantity) e.quantity = "Please select a quantity";
    if (!formData.timeline) e.timeline = "Please select a timeline";
    if (!formData.budget) e.budget = "Please select a budget range";
    if (!formData.customization) e.customization = "Please select an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Handlers ──

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((i) => i !== value)
          : [...prev[field], value],
      };
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSingleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const goNext = (validator) => {
    if (validator()) {
      setErrors({});
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    const payload = {
      full_name: formData.name,
      email: formData.email,
      mobile: formData.phone,
      brand: formData.organisation,
      sourcing: formData.sourcing.join(", "),
      who_is_it_for: formData.whoIsItFor.join(", "),
      quantity: formData.quantity,
      timeline: formData.timeline,
      budget: formData.budget,
      customization: formData.customization,
      additional_info: formData.additionalInfo,
      form_type: "end_of_year_sale",
    };

    try {
      const token = await getValidToken();
      const response = await fetch("/api/sherise_x_submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || result.status === false)
        throw new Error(result.message || "Submission failed");

      toast.success("Registration submitted successfully");
      setFormData({
        name: "",
        phone: "",
        email: "",
        organisation: "",
        sourcing: [],
        whoIsItFor: [],
        quantity: "",
        timeline: "",
        budget: "",
        customization: "",
        additionalInfo: "",
      });
      setStep(1);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="py-16 bg-gradient-to-br from-slate-50 via-white to-rose-50 font-odop"
      id="registration-form"
    >
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100"
        >
          <StepIndicator current={step} />

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* ── Step 1: Basic Info ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                  >
                    <FormInput
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      icon={<User size={18} />}
                    />
                  </motion.div>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.05 }}
                  >
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      icon={<Phone size={18} />}
                    />
                  </motion.div>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                  >
                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      icon={<Mail size={18} />}
                    />
                  </motion.div>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.15 }}
                  >
                    <FormInput
                      label="Organisation Name"
                      name="organisation"
                      value={formData.organisation}
                      onChange={handleChange}
                      error={errors.organisation}
                      icon={<Building2 size={18} />}
                    />
                  </motion.div>
                  <NavButtons
                    onNext={() => goNext(validateStep1)}
                    nextLabel="Next →"
                  />
                </motion.div>
              )}

              {/* ── Step 2: Sourcing ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <MultiSelect
                    label="What would you like to source?"
                    options={sourcingOptions}
                    selected={formData.sourcing}
                    onChange={(val) => handleMultiSelect("sourcing", val)}
                    error={errors.sourcing}
                  />
                  <MultiSelect
                    label="Who is this for?"
                    options={whoIsItForOptions}
                    selected={formData.whoIsItFor}
                    onChange={(val) => handleMultiSelect("whoIsItFor", val)}
                    error={errors.whoIsItFor}
                  />
                  <NavButtons
                    onBack={goBack}
                    onNext={() => goNext(validateStep2)}
                    nextLabel="Next →"
                  />
                </motion.div>
              )}

              {/* ── Step 3: Details ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={pageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <SingleSelect
                    label="Approximate quantity"
                    options={quantityOptions}
                    selected={formData.quantity}
                    onChange={(val) => handleSingleSelect("quantity", val)}
                    error={errors.quantity}
                  />
                  <SingleSelect
                    label="When do you need this?"
                    options={timelineOptions}
                    selected={formData.timeline}
                    onChange={(val) => handleSingleSelect("timeline", val)}
                    error={errors.timeline}
                  />
                  <SingleSelect
                    label="Budget range (per unit, if applicable)"
                    options={budgetOptions}
                    selected={formData.budget}
                    onChange={(val) => handleSingleSelect("budget", val)}
                    error={errors.budget}
                  />
                  <SingleSelect
                    label="Would you like customization?"
                    options={customizationOptions}
                    selected={formData.customization}
                    onChange={(val) => handleSingleSelect("customization", val)}
                    error={errors.customization}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tell us a bit more about your requirement
                    </label>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      rows={4}
                      placeholder="E.g. theme, preferences, delivery location, any specific product..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700 placeholder-gray-400 outline-none shadow-sm focus:border-[#A00300] transition-all resize-none"
                    />
                  </div>
                  <NavButtons
                    onBack={goBack}
                    nextLabel="Submit"
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EnquiryForm;
