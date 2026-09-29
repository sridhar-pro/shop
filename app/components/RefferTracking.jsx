"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

const COOKIE_NAME = "affiliate_code";
const COOKIE_DAYS = 30;

export default function ReferralTracker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Prevent duplicate execution on the same URL
  const processingRef = useRef(false);

  useEffect(() => {
    let referralCode = searchParams.get("ref");

    // Support /partner-store/TESTUSER97
    if (!referralCode && pathname.startsWith("/partner-store/")) {
      referralCode = pathname.split("/")[2];
    }

    if (!referralCode) return;
    if (processingRef.current) return;

    processingRef.current = true;

    handleReferral(referralCode);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    trackProductVisit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleReferral(code) {
    try {
      console.group("🎯 Referral Tracking");

      console.log("Referral found:", code);

      const existingCode = Cookies.get(COOKIE_NAME);

      console.log("Existing Cookie:", existingCode || "None");

      // Same referral already stored
      if (existingCode === code) {
        console.log("Same referral already exists. Skipping API.");

        cleanUrl();

        console.groupEnd();
        return;
      }

      // Landing URL WITHOUT ?ref
      const landingUrl = new URL(window.location.href);
      landingUrl.searchParams.delete("ref");

      console.log("Landing URL:", landingUrl.toString());

      console.log("Validating referral...");

      const response = await fetch("/api/referral/apply-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          landing_url: landingUrl.toString(),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      console.log("API Response:", result);

      if (result.valid) {
        Cookies.set(COOKIE_NAME, code, {
          expires: COOKIE_DAYS,
          sameSite: "Lax",
          secure: window.location.protocol === "https://",
          path: "/",
        });

        console.log("Referral stored successfully.");

        await trackProductVisit();
      } else {
        Cookies.remove(COOKIE_NAME);

        console.log("Invalid referral. Cookie removed.");
      }

      cleanUrl();
    } catch (error) {
      console.error("Referral validation failed:", error);

      // Still clean URL so user doesn't keep retrying
      cleanUrl();
    } finally {
      processingRef.current = false;
      console.groupEnd();
    }
  }

  async function trackProductVisit() {
    try {
      // Only product pages
      if (!pathname.startsWith("/products")) return;

      const referralCode = Cookies.get(COOKIE_NAME);

      // No affiliate
      if (!referralCode) return;

      const landingUrl = new URL(window.location.href);

      // Remove referral parameter if somehow present
      landingUrl.searchParams.delete("ref");

      const cleanLandingUrl = landingUrl.toString();

      // Prevent duplicate tracking during this session
      const sessionKey = `tracked_product_${window.location.pathname}`;

      if (sessionStorage.getItem(sessionKey)) {
        console.log("📦 Product already tracked:", landingUrl);
        return;
      }

      console.group("📦 Product Referral Tracking");

      console.log("Referral:", referralCode);
      console.log("Product:", landingUrl);

      const response = await fetch("/api/referral/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: referralCode,
          landing_url: cleanLandingUrl,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      console.log("Track Response:", result);

      if (result.tracked) {
        sessionStorage.setItem(sessionKey, "true");
        console.log("✅ Product tracked.");
      }

      console.groupEnd();
    } catch (err) {
      console.error("Product tracking failed:", err);
    }
  }

  function cleanUrl() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("ref");

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });

    console.log("Referral removed from URL.");
  }

  return null;
}
