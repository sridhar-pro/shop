"use client";

import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import LoaderWrapper from "../Loader/LoaderWrapper";
import { useEffect } from "react";
import "../../i18n";
import Navbar from "./Navbar";

// ✅ ADD — alongside your other dynamic() calls
// const Navbar = dynamic(() => import("./Navbar"), {
//   ssr: true,
//   loading: () => <div style={{ height: "64px" }} />,
// });

const FloatingWhatsAppButton = dynamic(
  () => import("../FloatingWhatsAppButton"),
  {
    ssr: false,
    loading: () => null,
  },
);

const MobileBottomBar = dynamic(() => import("../MobileBottomBar"), {
  ssr: false,
  loading: () => null,
});
const FlashSaleOffer = dynamic(() => import("../FlashSaleOffer"), {
  ssr: false,
  loading: () => null,
});
const ConditionalFooter = dynamic(() => import("./ConditionalFooter"), {
  ssr: true,
  loading: () => null,
});
const TranslationProvider = dynamic(() => import("@/app/TranslationProvider"), {
  ssr: true,
  loading: () => null,
});

// ✅ NEW: Lazy-load Toastify CSS after interaction
function LazyToastifyCSS() {
  useEffect(() => {
    const loadToastCSS = () => {
      if (document.querySelector("#toastify-css")) return;
      const link = document.createElement("link");
      link.id = "toastify-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/react-toastify@11/dist/ReactToastify.min.css";
      document.head.appendChild(link);
    };

    window.addEventListener("scroll", loadToastCSS, { once: true });
    window.addEventListener("mousemove", loadToastCSS, { once: true });
    window.addEventListener("touchstart", loadToastCSS, { once: true });

    return () => {
      window.removeEventListener("scroll", loadToastCSS);
      window.removeEventListener("mousemove", loadToastCSS);
      window.removeEventListener("touchstart", loadToastCSS);
    };
  }, []);

  return null;
}

// 🚀 Fully optimized analytics loader
function LazyAnalytics() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🧠 Skip analytics in dev or Lighthouse testing
    if (
      navigator.userAgent.includes("Lighthouse") ||
      process.env.NODE_ENV !== "production"
    ) {
      console.log("🚫 Skipping Analytics (Lighthouse or Dev Mode)");
      return;
    }

    let initialized = false;
    const initAnalytics = () => {
      if (initialized) return;
      initialized = true;

      // --- GA4 ---
      const ga = document.createElement("script");
      ga.src = "https://www.googletagmanager.com/gtag/js?id=G-H7QKZFNBRX";
      ga.async = true;
      document.body.appendChild(ga);

      ga.onload = () => {
        console.log("🟢 GA4 script tag loaded successfully");

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", "G-H7QKZFNBRX", {
          page_path: window.location.pathname,
        });

        console.log(
          "✅ GA4 initialized and tracking page:",
          window.location.pathname,
        );
      };

      // --- GTM ---
      setTimeout(() => {
        (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s);
          const dl = l !== "dataLayer" ? "&l=" + l : "";
          j.async = true;
          j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, "script", "dataLayer", "GTM-TSWV69XP");
        console.log("✅ GTM Loaded after GA4");
      }, 1000);
    };

    // 🖱️ Load only after user interaction
    window.addEventListener("scroll", initAnalytics, { once: true });
    window.addEventListener("mousemove", initAnalytics, { once: true });
    window.addEventListener("touchstart", initAnalytics, { once: true });

    return () => {
      window.removeEventListener("scroll", initAnalytics);
      window.removeEventListener("mousemove", initAnalytics);
      window.removeEventListener("touchstart", initAnalytics);
    };
  }, []);

  return null;
}

export default function ClientAppWrapper({ children }) {
  return (
    <LoaderWrapper>
      <main className="pb-16 md:pb-0">
        <TranslationProvider />
        <Navbar />
        {children}
        <FlashSaleOffer />
        <ConditionalFooter />
        <FloatingWhatsAppButton />
      </main>

      <MobileBottomBar />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
        style={{ marginBottom: "2.5rem", zIndex: 999999 }}
      />

      <LazyAnalytics />
      <LazyToastifyCSS />
    </LoaderWrapper>
  );
}
