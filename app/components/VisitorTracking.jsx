"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracking() {
  const pathname = usePathname();

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  // --------------------------------------------------
  // Track page visits
  // --------------------------------------------------
  useEffect(() => {
    // Don't track localhost
    if (isLocalhost) return;

    const timer = setTimeout(() => {
      collectVisitorData();
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, isLocalhost]);

  // --------------------------------------------------
  // Track external link clicks
  // --------------------------------------------------
  useEffect(() => {
    // Don't track localhost
    if (isLocalhost) return;

    const handleExternalClick = (e) => {
      const link = e.target.closest("a[href]");

      if (!link) return;

      const href = link.href;

      // Ignore mail, tel, javascript links
      if (
        !href ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      let destination;

      try {
        destination = new URL(href);
      } catch {
        return;
      }

      // Ignore internal links
      if (destination.origin === window.location.origin) {
        return;
      }

      const payload = {
        visitor_id: generateSessionId(),

        page_url: href,
        page_title: href,
        route: destination.pathname || "/",

        // Current page is the referrer for the external destination
        referrer: window.location.href,

        browser: getBrowser(),
        os: getOS(),
        device: getDeviceType(),

        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

        event_type: "external_link_click",
      };

      try {
        navigator.sendBeacon(
          "/api/visitors",
          new Blob([JSON.stringify(payload)], {
            type: "application/json",
          }),
        );
      } catch (err) {
        console.error("External click tracking failed:", err);
      }
    };

    document.addEventListener("click", handleExternalClick);

    return () => {
      document.removeEventListener("click", handleExternalClick);
    };
  }, [isLocalhost]);

  // --------------------------------------------------
  // Session ID
  // --------------------------------------------------
  const generateSessionId = () => {
    let id = sessionStorage.getItem("session_id");

    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("session_id", id);
    }

    return id;
  };

  // --------------------------------------------------
  // Device
  // --------------------------------------------------
  const getDeviceType = () => {
    const width = window.innerWidth;

    if (width < 768) return "Mobile";
    if (width < 1024) return "Tablet";

    return "Desktop";
  };

  // --------------------------------------------------
  // Browser
  // --------------------------------------------------
  const getBrowser = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";

    return "Unknown";
  };

  // --------------------------------------------------
  // Operating System
  // --------------------------------------------------
  const getOS = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    if (ua.includes("Mac")) return "MacOS";
    if (ua.includes("Linux")) return "Linux";

    return "Unknown";
  };

  // --------------------------------------------------
  // UTM parameters
  // --------------------------------------------------
  const getUTM = () => {
    const params = new URLSearchParams(window.location.search);

    return {
      utm_campaign: params.get("utm_campaign") || "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    };
  };

  // --------------------------------------------------
  // Geo location
  // --------------------------------------------------
  const getLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Geo lookup failed");
      }

      const geo = await res.json();

      return {
        country: geo.country_name || "",
        state: geo.region || "",
        city: geo.city || "",
      };
    } catch (err) {
      console.log("Geo lookup failed:", err?.message);

      return {
        country: "",
        state: "",
        city: "",
      };
    }
  };

  // --------------------------------------------------
  // Previous page
  // --------------------------------------------------
  const getPreviousPath = () => {
    return sessionStorage.getItem("previous_page_url") || "";
  };

  // --------------------------------------------------
  // Save current page
  // --------------------------------------------------
  const saveCurrentPath = () => {
    sessionStorage.setItem("previous_page_url", window.location.href);
  };

  // --------------------------------------------------
  // Get referrer
  // --------------------------------------------------
  const getReferrer = () => {
    const previousPage = getPreviousPath();

    // ----------------------------------------------
    // Internal navigation
    // ----------------------------------------------
    if (previousPage) {
      try {
        const previousUrl = new URL(previousPage);

        if (
          previousUrl.origin === window.location.origin &&
          previousPage !== window.location.href
        ) {
          return previousPage;
        }
      } catch {
        // Ignore invalid stored URL
      }
    }

    // ----------------------------------------------
    // External source
    // ----------------------------------------------
    if (document.referrer) {
      return document.referrer;
    }

    // ----------------------------------------------
    // Direct visit
    // ----------------------------------------------
    return "Direct Visit";
  };

  // --------------------------------------------------
  // Entry point
  // --------------------------------------------------
  const getEntryPoint = () => {
    return sessionStorage.getItem("entry_point") || "";
  };

  const saveEntryPoint = (entryPoint) => {
    sessionStorage.setItem("entry_point", entryPoint);
  };

  const getCurrentEntryPoint = () => {
    const route = window.location.pathname;

    // Homepage
    if (route === "/" || route === "") {
      return "Direct Visit";
    }

    // Example:
    // /contact-us              -> contact-us
    // /products                -> products
    // /products/some-product   -> products
    // /business-exchange       -> business-exchange
    // /affiliate/register      -> affiliate
    const entryPoint = route.replace(/^\/+|\/+$/g, "").split("/")[0];

    return entryPoint || "Direct Visit";
  };

  // --------------------------------------------------
  // Traffic source
  // --------------------------------------------------
  const getTrafficSource = () => {
    const params = new URLSearchParams(window.location.search);

    const source = params.get("utm_source");

    const allowedSources = {
      instagram: "Instagram",
      facebook: "Facebook",
      whatsapp: "WhatsApp",
      linkedin: "LinkedIn",
      twitter: "Twitter",
    };

    return allowedSources[source?.toLowerCase()] || "";
  };

  // --------------------------------------------------
  // Collect visitor data
  // --------------------------------------------------
  const collectVisitorData = async () => {
    const route = window.location.pathname;

    // ----------------------------------------------
    // IMPORTANT:
    // Get the previous page BEFORE saving the current page
    // ----------------------------------------------
    const referrer = getReferrer();

    // ----------------------------------------------
    // First entry point of this session
    // ----------------------------------------------
    let entryPoint = getEntryPoint();

    if (!entryPoint) {
      entryPoint = getCurrentEntryPoint();

      // IMPORTANT:
      // Persist entry point so it stays the same
      // throughout the entire session
      saveEntryPoint(entryPoint);
    }

    // ----------------------------------------------
    // Save current page AFTER getting referrer
    // ----------------------------------------------
    saveCurrentPath();

    // ----------------------------------------------
    // Get location
    // ----------------------------------------------
    const location = await getLocation();

    // ----------------------------------------------
    // Build payload
    // ----------------------------------------------
    const payload = {
      visitor_id: generateSessionId(),

      page_url: window.location.href,
      page_title: route === "/" ? "Home" : route,
      route,

      // Previous page / external source
      referrer,

      // First page/source of this session
      entry_point: entryPoint,

      time_on_page: 0,

      browser: getBrowser(),
      os: getOS(),
      device: getDeviceType(),

      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      ...getUTM(),
      ...location,

      traffic_source: getTrafficSource(),
    };

    console.log("Visitor Tracking:", {
      current_page: window.location.href,
      referrer,
      entry_point: entryPoint,
      traffic_source: payload.traffic_source,
    });

    // ----------------------------------------------
    // Send to API
    // ----------------------------------------------
    try {
      await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Visitor tracking failed:", err);
    }
  };

  return null;
}
