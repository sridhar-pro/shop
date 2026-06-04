"use client";

import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/app/utils/AuthContext";

import {
  CheckCircle,
  XCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

import { toast } from "react-toastify";

const VerifyPhoneSection = () => {
  const [step, setStep] = useState("phone");
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    business_type: 1,
  });

  const { getValidToken, isAuthReady } = useAuth();

  const ensureAuthReady = () =>
    new Promise((resolve) => {
      if (isAuthReady) return resolve();

      const interval = setInterval(() => {
        if (isAuthReady) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

  // 🧾 Send OTP
  const handleSendOtp = async () => {
    if (!phone) return toast.warning("Please enter your phone number");

    setLoading(true);

    try {
      await ensureAuthReady();

      const token = await getValidToken();

      const response = await fetch("/api/triggerotp-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: Number(phone),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        toast.error(data.message || "Failed to send OTP");

        throw new Error(data.message || "Failed to send OTP");
      }

      setServerOtp(data.data?.otp);

      toast.success("OTP sent successfully!");

      setStep("verify");
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return toast.warning("Please enter the OTP");

    setLoading(true);

    try {
      await ensureAuthReady();

      const token = await getValidToken();

      const response = await fetch("/api/verifyotp-seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          otp: Number(otp),
          phone: Number(phone),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "OTP verification failed");
      }

      toast.success("OTP verified successfully!");

      setStep("form");
    } catch (err) {
      console.error(err);

      toast.error(err.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "business_type" ? Number(value) : value,
    }));
  };

  // 🚀 Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      business_type,
    } = formData;

    if (!firstname || !lastname || !email || !password) {
      return toast.warning("Please fill all required fields.");
    }

    if (!confirmPassword) {
      return toast.warning("Please confirm your password.");
    }

    if (password.length < 10) {
      return toast.error("Password must be at least 10 characters long.");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match. Please check again!");
    }

    if (!phone) {
      return toast.warning("Phone number is required.");
    }

    setLoading(true);
    try {
      await ensureAuthReady();
      const token = await getValidToken();

      const payload = {
        email: email.trim(),
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        business_type: Number(business_type),
        phone_no: String(phone),
        password,
      };

      console.log("📦 Payload being sent:", payload);

      Object.entries(payload).forEach(([key, value]) => {
        console.log(`${key}:`, value, `→ type: ${typeof value}`);
      });

      const response = await fetch("/api/seller-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("📩 Registration Response:", data);

      if (data.status === "success" && data.code === 201) {
        const sellerId = data.id;
        if (Number(business_type) === 1) {
          toast.success("Registration completed!");
          setStatus("success");
        } else {
          const paymentInfo = data.data?.paymentInfo;
          if (paymentInfo) {
            await handlePayment(paymentInfo, data.data?.phone, sellerId);
          } else {
            console.warn("⚠️ No payment info found for paid plan.");
            toast.error("Payment details missing. Please contact support.");
            setErrorMsg("Payment details missing. Please contact support.");
            setStatus("error");
          }
        }
      } else {
        const msg =
          data.message ||
          data.data?.message ||
          "Registration failed. Please try again.";
        toast.error(msg);
        setErrorMsg(msg);
        setStatus("error");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setErrorMsg("Something went wrong. Please try again later.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // 💳 Razorpay Payment
  const handlePayment = async (paymentInfo, phone, sellerId) => {
    const loadRazorpay = () =>
      new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject("❌ Razorpay SDK failed to load");
        document.body.appendChild(script);
      });

    try {
      await loadRazorpay();

      const options = {
        key: "rzp_test_Gnu8neTnUU656M", //rzp_test_Gnu8neTnUU656M //rzp_live_lclCyKLWqjYCIJ
        amount: paymentInfo.amount,
        currency: paymentInfo.currency || "INR",
        name: "Yuukke Seller Registration",
        description: "Upgrade to Premium or Verified Seller",
        order_id: paymentInfo.order_id,
        prefill: {
          email: formData.email,
          contact: phone,
        },

        // 🟢 SUCCESS handler
        handler: async (response) => {
          console.log("🎉 Payment Successful:", response);

          try {
            await ensureAuthReady();
            const token = await getValidToken();

            const updateRes = await fetch("/api/update_paymentseller", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: sellerId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const updateData = await updateRes.json();
            console.log("✅ Payment Update Response:", updateData);

            if (updateData.status === "success") {
              toast.success("Payment completed successfully!");
              setStatus("success");
            } else {
              setStatus("error");
            }
          } catch (err) {
            console.error("❌ Payment update error:", err);
            setStatus("error");
          }
        },

        // 🔴 Failure / Cancellation handler
        modal: {
          ondismiss: async () => {
            console.warn("⚠️ Payment cancelled or closed by user.");

            try {
              await ensureAuthReady();
              const token = await getValidToken();

              const delRes = await fetch("/api/delete_paymentseller", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  email: formData.email,
                }),
              });

              const delData = await delRes.json();
              console.log("🗑️ Payment Delete Response:", delData);

              if (delData.status === "success") {
                toast.error("Payment cancelled. Please try again.");
                setErrorMsg("Payment cancelled. Please try again.");
              } else {
                toast.error("Payment failed or could not be processed.");
                setErrorMsg("Payment failed or could not be processed.");
              }

              setStatus("error");
            } catch (err) {
              console.error("❌ Payment delete error:", err);
              toast.error("Something went wrong while cancelling payment.");
              setErrorMsg("Something went wrong while cancelling payment.");
              setStatus("error");
            }
          },
        },

        theme: { color: "#000F4D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("💥 Razorpay init error:", err);
      toast.error("Razorpay SDK failed to load. Please refresh and try again.");
      setStatus("error");
    }
  };
  return (
    <section
      id="verify-phone"
      className="relative overflow-hidden bg-[#fafafa] py-16 md:py-10"
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000930 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle,_rgba(160,3,0,0.08),_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#A00300]/10 shadow-sm mb-5">
            <Sparkles size={14} className="text-[#A00300]" />

            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#A00300]">
              Seller Registration
            </span>
          </div>

          <h2
            className="text-[36px] sm:text-[52px] leading-[1.05] font-black tracking-[-2px] text-[#000930]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Join the
            <br />
            <span className="text-[#A00300]">Yuukke Marketplace</span>
          </h2>

          <p className="mt-5 text-[#666680] leading-8 max-w-lg mx-auto">
            Start selling your products through a premium women-powered
            marketplace experience.
          </p>

          {/* Trust line */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-[#666]">
            {/* Secure */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#A00300]/10 flex items-center justify-center">
                <ShieldCheck size={15} className="text-[#A00300]" />
              </div>

              <span>Secure Verification</span>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#d5d5df]" />

            {/* Fast Approval */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#A00300]/10 flex items-center justify-center">
                <Zap size={15} className="text-[#A00300]" />
              </div>

              <span>Fast Approval</span>
            </div>

            <div className="w-1.5 h-1.5 rounded-full bg-[#d5d5df]" />

            {/* Premium */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#A00300]/10 flex items-center justify-center">
                <Crown size={15} className="text-[#A00300]" />
              </div>

              <span>Premium Seller Access</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* SUCCESS */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/95 backdrop-blur-xl border border-white rounded-[34px] p-8 shadow-[0_15px_60px_rgba(0,9,48,0.08)] text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

              <h3
                className="text-3xl font-black text-[#000930]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Registration Successful
              </h3>

              <p className="mt-4 text-[#666680] leading-7">
                Welcome to Yuukke Marketplace. Your seller account has been
                created successfully.
              </p>
            </motion.div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/95 backdrop-blur-xl border border-white rounded-[34px] p-8 shadow-[0_15px_60px_rgba(0,9,48,0.08)] text-center"
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

              <h3
                className="text-3xl font-black text-[#000930]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Registration Failed
              </h3>

              <p className="mt-4 text-[#666680] leading-7">
                {errorMsg || "Something went wrong. Please try again later."}
              </p>

              <button
                onClick={() => {
                  setStep("form");
                  setStatus(null);
                }}
                className="mt-6 bg-[#A00300] hover:bg-[#870200] text-white px-7 py-3 rounded-2xl font-bold transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* STEPS */}
          {!status && (
            <>
              {/* PHONE */}
              {step === "phone" && (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white/95 backdrop-blur-xl border border-white rounded-[34px] p-5 sm:p-6 shadow-[0_15px_60px_rgba(0,9,48,0.08)]"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 border border-[#000930]/10 rounded-2xl px-4 py-2.5 bg-[#fafafa] focus-within:border-[#A00300]/30 transition-all">
                      <PhoneInput
                        country={"in"}
                        value={phone}
                        onChange={(value) => setPhone(value)}
                        inputStyle={{
                          border: "none",
                          boxShadow: "none",
                          width: "100%",
                          background: "transparent",
                          fontSize: "15px",
                          color: "#000930",
                        }}
                        buttonStyle={{
                          border: "none",
                          background: "transparent",
                        }}
                        containerStyle={{
                          width: "100%",
                        }}
                        dropdownStyle={{
                          zIndex: 9999,
                        }}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className={`bg-[#A00300] hover:bg-[#870200] text-white font-bold px-8 py-4 rounded-2xl shadow-[0_10px_30px_rgba(160,3,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "SENDING..." : "SEND OTP"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* VERIFY */}
              {step === "verify" && (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white/95 backdrop-blur-xl border border-white rounded-[34px] p-7 sm:p-8 shadow-[0_15px_60px_rgba(0,9,48,0.08)] text-center"
                >
                  <h3
                    className="text-3xl font-black text-[#000930]"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    Verify OTP
                  </h3>

                  <p className="mt-4 text-[#666680] leading-7">
                    Enter the verification code sent to your registered phone
                    number.
                  </p>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d{0,6}$/.test(value)) {
                        setOtp(value);
                      }
                    }}
                    placeholder="Enter OTP"
                    className="w-full mt-7 border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-4 text-center tracking-[0.4em] text-lg font-semibold outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)] transition-all"
                  />

                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={() => setStep("phone")}
                      className="text-sm text-[#666680] hover:text-[#A00300] transition-all"
                    >
                      Change Number
                    </button>

                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className={`bg-[#A00300] hover:bg-[#870200] text-white font-bold px-7 py-3 rounded-2xl transition-all ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "VERIFYING..." : "VERIFY"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* FORM */}
              {step === "form" && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="bg-white/95 backdrop-blur-xl border border-white rounded-[34px] p-6 sm:p-8 shadow-[0_15px_60px_rgba(0,9,48,0.08)] space-y-5"
                >
                  <h3
                    className="text-3xl font-black text-center text-[#000930]"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    Complete Registration
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstname"
                      placeholder="First Name"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                    />

                    <input
                      type="text"
                      name="lastname"
                      placeholder="Last Name"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className="w-full border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                  />

                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="w-full border border-[#000930]/10 bg-[#fafafa] rounded-2xl px-5 py-3.5 outline-none focus:border-[#A00300]/40 focus:shadow-[0_0_0_4px_rgba(160,3,0,0.08)]"
                  >
                    <option value={1}>Free</option>

                    <option value={2}>Verified</option>

                    <option value={3}>Premium</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#A00300] hover:bg-[#870200] text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(160,3,0,0.25)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {loading ? "SUBMITTING..." : "SUBMIT"}
                  </button>
                </motion.form>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
export default VerifyPhoneSection;
