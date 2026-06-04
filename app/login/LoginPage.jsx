"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../utils/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "../context/SessionContext";

import InitialScreen from "./InitialScreen";
import MobileScreen from "./MobileScreen";
import OTPScreen from "./Otpscreen";
import EmailScreen from "./Emailscreen";
import RegisterScreen from "./Registerscreen";
import ForgetPasswordScreen from "./Forgetpasswordscreen";
import CheckMailScreen from "./Checkmailscreen";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { handleLogin } = useSession();

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const [currentFlow, setCurrentFlow] = useState("initial");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false); // keep for other flows if needed

  const [mobileError, setMobileError] = useState("");

  const { getValidToken } = useAuth();

  const safeJson = async (res) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const handleSendOTP = async () => {
    if (loading) return;
    setMobileError("");
    setLoading(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/mobile_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_number: `91${mobileNumber}`,
        }),
      });
      const data = await safeJson(res);
      if (data.error) {
        setMobileError(data.error);
        return; // ❗ STOP here — don't move to OTP screen
      }

      if (!res.ok) {
        toast.error(data?.message || data?.error || "Failed to send OTP ❌");
        return;
      }
      setCurrentFlow("otp");
    } catch (error) {
      console.error("Mobile Login API Error ❌", error);
      toast.error("Unable to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (verifyLoading) return;
    setVerifyLoading(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_number: `91${mobileNumber}`,
          otp,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok || data?.status !== "success") {
        toast.error(
          data?.message || data?.error || "OTP verification failed ❌",
        );
        return;
      }
      const { company_id, user_id, group_id, name } = data.data;
      const { access_token, refresh_token } = data.token;
      handleLogin({
        company_id,
        name,
        user_id,
        access_token,
        refresh_token,
        group_id,
      });
      toast.success(data.message || "You are successfully logged in! 🎉");
      if (group_id == 4) {
        localStorage.setItem("access_token", access_token);
        window.location.href = `https://marketplace.${DOMAIN_KEY}.com/Oauth/tLogin/${access_token}`;
      } else {
        router.push(from || "/");
      }
    } catch (error) {
      console.error("OTP Verification Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleReSendOTP = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/resend_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile_number: `91${mobileNumber}`,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Failed to resend OTP ❌");
        return;
      }
      toast.success(data?.message || "OTP has been re-sent successfully! 📲");
      setCurrentFlow("otp");
    } catch (error) {
      console.error("Resend OTP Error ❌", error);
      toast.error("Unable to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleMailLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/email_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailLogin, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || data?.status !== "success") {
        toast.dismiss();
        toast.error(
          data?.message || data?.error || "Invalid email or password ❌",
          {
            toastId: "email-login-error",
          },
        );
        return;
      }
      const { company_id, user_id, group_id, name } = data.data;
      const { access_token, refresh_token } = data.token;
      handleLogin({
        company_id,
        name,
        user_id,
        access_token,
        refresh_token,
        group_id,
      });
      toast.success(data.message || "Login successful 🎉");
      if (group_id == 4) {
        sessionStorage.setItem("access_token", access_token);
        window.location.href = `https://marketplace.${DOMAIN_KEY}.com/Oauth/tLogin/${access_token}`;
      } else {
        router.push(from || "/");
      }
    } catch (error) {
      console.error("Email Login API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!firstName.trim()) return toast.error("First Name is required");
    if (!lastName.trim()) return toast.error("Last Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Invalid email format");
    if (!mobile.trim()) return toast.error("Mobile number is required");
    if (!/^\d{10}$/.test(mobile))
      return toast.error("Mobile number must be 10 digits");
    setLoading(true);
    try {
      const token = await getValidToken();
      const payload = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobile.startsWith("91") ? mobile : `91${mobile}`,
        email,
      };
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (res.ok && data?.success) {
        toast.success("Registration successful! Redirecting to login...");
        setCurrentFlow("initial");
      } else {
        toast.error(
          data?.keycloak_message === "USER_EXISTS"
            ? "User already exists ❌"
            : data?.message || "Registration failed ❌",
        );
      }
    } catch (error) {
      console.error("Register API Error ❌", error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgetSendMail = async () => {
    if (loading) return;
    if (!email?.trim()) return toast.error("Email is required 📧");
    if (!/\S+@\S+\.\S+/.test(email))
      return toast.error("Invalid email format ❌");
    setLoading(true);
    try {
      const token = await getValidToken();
      const res = await fetch("/api/forget_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        toast.error(data?.message || "Failed to send reset email ❌");
        return;
      }
      toast.success("Password reset email sent! 📧");
      setCurrentFlow("checkmail");
    } catch (error) {
      console.error("Forget Password Error ❌", error);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[48rem] w-full md:min-h-screen bg-gradient-to-b from-pink-900 to-indigo-950 flex items-center justify-center p-4 font-odop">
      <AnimatePresence mode="wait">
        {currentFlow === "initial" && (
          <InitialScreen key="initial" setCurrentFlow={setCurrentFlow} />
        )}
        {currentFlow === "mobile" && (
          <MobileScreen
            key="mobile"
            setCurrentFlow={setCurrentFlow}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            handleSendOTP={handleSendOTP}
            loading={loading}
            mobileError={mobileError}
          />
        )}
        {currentFlow === "otp" && (
          <OTPScreen
            key="otp"
            setCurrentFlow={setCurrentFlow}
            mobileNumber={mobileNumber}
            otp={otp}
            setOtp={setOtp}
            handleVerifyOTP={handleVerifyOTP}
            handleReSendOTP={handleReSendOTP}
            loading={loading}
            verifyLoading={verifyLoading}
            resendLoading={resendLoading}
          />
        )}
        {currentFlow === "email" && (
          <EmailScreen
            key="email"
            setCurrentFlow={setCurrentFlow}
            emailLogin={emailLogin}
            setEmailLogin={setEmailLogin}
            password={password}
            setPassword={setPassword}
            handleMailLogin={handleMailLogin}
            loading={loading}
          />
        )}
        {currentFlow === "register" && (
          <RegisterScreen
            key="register"
            setCurrentFlow={setCurrentFlow}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            mobile={mobile}
            setMobile={setMobile}
            handleRegister={handleRegister}
            loading={loading}
          />
        )}
        {currentFlow === "forget" && (
          <ForgetPasswordScreen
            key="forget"
            setCurrentFlow={setCurrentFlow}
            email={email}
            setEmail={setEmail}
            handleForgetSendMail={handleForgetSendMail}
            loading={loading}
          />
        )}
        {currentFlow === "checkmail" && (
          <CheckMailScreen key="checkmail" setCurrentFlow={setCurrentFlow} />
        )}
      </AnimatePresence>
    </div>
  );
}
