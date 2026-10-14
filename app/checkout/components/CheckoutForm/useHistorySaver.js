"use client";
import { useRef, useEffect } from "react";

// Sends { name, email, phone, cart_items } to /api/history_save:
//  - name  : on blur (>= 3 chars, only if changed)
//  - email : 300ms after it becomes valid (only if changed)
//  - phone : when it reaches 10 digits (only if changed)
// Tries fetchWithAuth first, then plain fetch, then sendBeacon.
export default function useHistorySaver(
  { name = "", email = "", contact = "" },
  fetchWithAuth,
) {
  const lastSentRef = useRef({ name: null, email: null, contact: null });
  const emailTimerRef = useRef(null);
  const sendSeqRef = useRef(0);

  // keep latest name for blur handler
  const latestNameRef = useRef((name || "").toString());

  useEffect(() => {
    latestNameRef.current = (name || "").toString();
  }, [name]);

  // Utility: only digits
  const digitsOnly = (s) => (s || "").toString().replace(/\D/g, "");

  // Simple email validator
  const isValidEmail = (s) =>
    typeof s === "string" &&
    s.length > 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const sendHistory = async (payload) => {
    let cartPreview = null;

    // 🔹 Safely read minimal cart info from localStorage
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cartItemPreview");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            cartPreview = parsed;
          }
        }
      }
    } catch (err) {
      // ignore
    }

    const body = {
      name: payload.name || "",
      email: payload.email || "",
      phone: payload.contact || "",

      // 🔥 event tracking (optional)
      event: payload.event || null,
      coupon_code: payload.coupon_code || null,

      cart_items: cartPreview, // [{ id, product_id, name, image }, ...]
    };

    // remove empty noise
    Object.keys(body).forEach((k) => body[k] === null && delete body[k]);

    // 👀 Debug log (safe)
    try {
      console.log(
        "%c[history_save payload]",
        "color:#A00300; font-weight:bold;",
        JSON.stringify(body, null, 2),
      );
    } catch {}

    ++sendSeqRef.current;

    // 1) authenticated fetch
    try {
      await fetchWithAuth("/api/history_save", { method: "POST", body });
      return;
    } catch (err) {}

    // 2) plain fetch
    try {
      const res = await fetch("/api/history_save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      await res.json().catch(() => null);
      return;
    } catch (err2) {}

    // 3) beacon
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(body)], {
          type: "application/json",
        });
        const ok = navigator.sendBeacon("/api/history_save", blob);
        if (ok) return;
      }
    } catch (beErr) {}
  };

  // NAME: onNameBlur handler
  const onNameBlur = () => {
    const currentName = (latestNameRef.current || "").toString();

    if (currentName.length < 3) return;
    if (lastSentRef.current.name === currentName) return;

    lastSentRef.current.name = currentName;
    sendHistory({ name: currentName, email, contact });
  };

  // EMAIL: send when email becomes valid
  useEffect(() => {
    const currentEmail = (email || "").toString().trim();

    if (!isValidEmail(currentEmail)) return;

    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    emailTimerRef.current = setTimeout(() => {
      if (lastSentRef.current.email === currentEmail) return;
      lastSentRef.current.email = currentEmail;
      sendHistory({ name, email: currentEmail, contact });
    }, 300);

    return () => {
      if (emailTimerRef.current) {
        clearTimeout(emailTimerRef.current);
        emailTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, name, contact]);

  // PHONE: send when 10 digits
  useEffect(() => {
    const digits = digitsOnly(contact);

    if (digits.length === 10) {
      if (lastSentRef.current.contact === digits) return;
      lastSentRef.current.contact = digits;
      sendHistory({ name, email, contact: digits });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact, name, email]);

  return { onNameBlur };
}
