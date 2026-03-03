"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useAuth } from "../utils/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const FormInput = ({
  label,
  icon,
  name,
  value,
  onChange,
  error,
  type = "text",
}) => {
  return (
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
};

const EnquiryForm = () => {
  const { getValidToken } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const scaleFade = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    organisation: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";

    if (!formData.phone) newErrors.phone = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Mobile number must be exactly 10 digits";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.city.trim()) newErrors.city = "City is required";

    if (!formData.organisation.trim())
      newErrors.organisation = "Organisation name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Allow only digits & max 10 length
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const payload = {
      full_name: formData.name,
      email: formData.email,
      mobile: formData.phone,
      location: formData.city,
      brand: formData.organisation,
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

      if (!response.ok || result.status === false) {
        throw new Error(result.message || "Submission failed");
      }

      // Success
      toast.success("Registration submitted successfully ");

      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        organisation: "",
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-16 bg-gradient-to-br from-slate-50 via-white to-rose-50"
      id="registration-form"
    >
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          variants={scaleFade}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100"
        >
          {/* Heading */}
          <motion.div variants={fadeUp} className="text-center mb-10 space-y-4">
            <span className="rounded-full bg-[#A00300]/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-[#A00300] uppercase">
              Join The Movement
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900  mt-6">
              Register Your Interest
            </h2>

            <p className="text-gray-600 max-w-md mx-auto">
              Be part of SHErise Week. Support women-led businesses and grow
              together through purposeful commerce.
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={containerVariants}
            className="space-y-6"
          >
            <motion.div variants={fadeUp}>
              <FormInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={<User size={18} />}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FormInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={<Phone size={18} />}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
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

            <motion.div variants={fadeUp}>
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                icon={<MapPin size={18} />}
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <FormInput
                label="Organisation Name"
                name="organisation"
                value={formData.organisation}
                onChange={handleChange}
                error={errors.organisation}
                icon={<Building2 size={18} />}
              />
            </motion.div>

            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#A00300] to-[#000940] text-white font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default EnquiryForm;
