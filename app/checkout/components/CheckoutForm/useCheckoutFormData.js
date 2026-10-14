"use client";
import { useState, useEffect, useRef } from "react";
import useHistorySaver from "./useHistorySaver";
import { FORM_STORAGE_KEY, emptyForm, FIELD_ORDER } from "./constants";

// Guest form state: formData (persisted in localStorage), field errors,
// handleChange / clearForm, and scrollToFirstError.
export default function useCheckoutFormData({ fetchWithAuth }) {
  const [formData, setFormData] = useState(() => {
    // 👇 Safe on server / during SSR
    if (typeof window === "undefined") return emptyForm;

    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (!saved) return emptyForm;

      const parsed = JSON.parse(saved);

      // Merge only known keys
      return {
        ...emptyForm,
        ...Object.fromEntries(
          Object.entries(parsed).filter(([key]) =>
            Object.prototype.hasOwnProperty.call(emptyForm, key),
          ),
        ),
      };
    } catch (err) {
      console.error("Error restoring form data from localStorage:", err);
      return emptyForm;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch (err) {
      console.error("Error saving form data to localStorage:", err);
    }
  }, [formData]);

  const { onNameBlur } = useHistorySaver(
    {
      name: formData.name,
      email: formData.email,
      contact: formData.contact,
    },
    fetchWithAuth,
  );

  const [formError, setFormError] = useState({});
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error as user types
    setFormError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const clearForm = () => {
    setFormData({
      name: "",
      lastName: "",
      email: "",
      country: "",
      contact: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pin: "",
    });
  };

  // Scrolls (and focuses) the first invalid field into view. Needed because on
  // mobile the fields sit below the order summary, so an error can be off-screen.
  const scrollToFirstError = (errors) => {
    const firstErrorKey = FIELD_ORDER.find((key) => errors[key]);
    if (!firstErrorKey) return;

    // Wait a tick so the error text has rendered before measuring
    requestAnimationFrame(() => {
      const container = formRef.current;
      const field = container?.querySelector(`[name="${firstErrorKey}"]`);

      if (!field) return;

      field.scrollIntoView({ behavior: "smooth", block: "center" });

      // Focus after the scroll settles so mobile keyboards don't fight it
      setTimeout(() => {
        try {
          field.focus({ preventScroll: true });
        } catch {
          field.focus?.();
        }
      }, 350);
    });
  };

  return {
    formData,
    formError,
    setFormError,
    formRef,
    handleChange,
    clearForm,
    onNameBlur,
    scrollToFirstError,
  };
}
