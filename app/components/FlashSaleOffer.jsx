"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/utils/AuthContext";
import { X } from "lucide-react";
import { ColourfulText } from "./ui/colourful-text";
import { fetchWithAuthGlobal } from "../utils/fetchWithAuth";

const pad = (n) => String(n).padStart(2, "0");

const TimerUnit = ({ value, label, size = "md" }) => {
  const isLg = size === "lg";
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg"
      style={{
        background: "#fff",
        border: "0.5px solid rgba(0, 9, 64, 0.2)",
        width: isLg ? 52 : 40,
        padding: isLg ? "10px 6px 8px" : "7px 4px 6px",
      }}
    >
      <span
        style={{
          fontSize: isLg ? 28 : 20,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum"',
          color: "#A00300",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: isLg ? 9 : 8,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginTop: isLg ? 4 : 3,
          color: "#7c82b0",
        }}
      >
        {label}
      </span>
    </div>
  );
};

const TimerSep = ({ size = "md" }) => (
  <span
    style={{
      fontSize: size === "lg" ? 22 : 16,
      fontWeight: 800,
      color: "#A00300",
      opacity: 0.5,
      alignSelf: "center",
      paddingBottom: 14,
      lineHeight: 1,
    }}
  >
    :
  </span>
);

// --------------------------------------------------
// Mobile-only presentational piece
// (visual layer only — no state, no logic)
// --------------------------------------------------
const MobileDigit = ({ value, label }) => (
  <span
    className="tabular-nums"
    style={{
      fontSize: 13,
      fontWeight: 700,
      color: "#000940",
      fontFeatureSettings: '"tnum"',
    }}
  >
    {value}
    <span style={{ fontSize: 10, fontWeight: 500, color: "#7c82b0" }}>
      {label}
    </span>
  </span>
);

const FlashSaleOffer = () => {
  const { getValidToken, isAuthReady } = useAuth();
  const router = useRouter();

  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [attention, setAttention] = useState(false);

  const [mobileManuallyClosed, setMobileManuallyClosed] = useState(false);

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  // --------------------------------------------------
  // Detect mobile
  // --------------------------------------------------
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  // --------------------------------------------------
  // Image
  // --------------------------------------------------
  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    const cleanImage = image.trim().replace(/^\/+/, "");

    if (cleanImage.startsWith("http") || cleanImage.startsWith("/")) {
      return cleanImage;
    }

    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${cleanImage}`;
  };

  // --------------------------------------------------
  // Fetch flash sale
  // --------------------------------------------------
  useEffect(() => {
    if (!isAuthReady) return;

    const fetchFlashSale = async () => {
      try {
        const data = await fetchWithAuthGlobal(
          "/api/flashsale",
          { method: "POST" },
          getValidToken,
        );

        if (!data?.flash_sales) return;

        const offerData = data.flash_sales;

        const now = Date.now();
        const start = new Date(offerData.start_time).getTime();
        const end = new Date(offerData.end_time).getTime();

        if (now >= start && now <= end) {
          setOffer(offerData);
          setVisible(true);
        }
      } catch (err) {
        console.error("Flash Sale fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSale();
  }, [getValidToken, isAuthReady]);

  // --------------------------------------------------
  // Countdown
  // --------------------------------------------------
  useEffect(() => {
    if (!offer) return;

    const endTime = new Date(offer.end_time).getTime();

    const updateTimer = () => {
      const diff = endTime - Date.now();

      if (diff <= 0) {
        setRemainingTime(0);
        setVisible(false);
        return;
      }

      setRemainingTime(diff);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  // --------------------------------------------------
  // Attention animation
  //
  // Every few seconds the offer gives a small pop
  // to grab attention without being annoying.
  // --------------------------------------------------
  useEffect(() => {
    if (!visible) return;

    const attentionInterval = setInterval(() => {
      setAttention(true);

      setTimeout(() => {
        setAttention(false);
      }, 900);
    }, 6000);

    return () => clearInterval(attentionInterval);
  }, [visible]);

  useEffect(() => {
    if (!isMobile || !offer || mobileManuallyClosed) return;

    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 30000);

    return () => clearInterval(interval);
  }, [isMobile, offer, mobileManuallyClosed]);

  // --------------------------------------------------
  // Close offer
  //
  // Hide it for 20 seconds and then bring it back.
  // Change 20000 to whatever delay you want.
  // --------------------------------------------------
  const handleClose = useCallback(
    (permanent = false) => {
      setVisible(false);

      // Desktop behavior stays exactly the same
      if (!isMobile) {
        if (permanent) return;

        const reopenTimer = setTimeout(() => {
          if (offer) {
            const now = Date.now();
            const end = new Date(offer.end_time).getTime();

            if (now < end) {
              setVisible(true);
            }
          }
        }, 20000);

        return () => clearTimeout(reopenTimer);
      }

      // Mobile: manual close = stay closed for minimum 20 minutes
      if (permanent) {
        setMobileManuallyClosed(true);

        const reopenTimer = setTimeout(
          () => {
            if (offer) {
              const now = Date.now();
              const end = new Date(offer.end_time).getTime();

              if (now < end) {
                setMobileManuallyClosed(false);
                setVisible(true);
              }
            }
          },
          20 * 60 * 1000,
        );

        return () => clearTimeout(reopenTimer);
      }

      // Mobile automatic close
      const reopenTimer = setTimeout(
        () => {
          if (offer && !mobileManuallyClosed) {
            const now = Date.now();
            const end = new Date(offer.end_time).getTime();

            if (now < end) {
              setVisible(true);
            }
          }
        },
        20 * 60 * 1000,
      );

      return () => clearTimeout(reopenTimer);
    },
    [offer, isMobile, mobileManuallyClosed],
  );

  if (loading || !offer) return null;

  const totalSec = Math.max(0, Math.floor(remainingTime / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* =====================================================
              DESKTOP
          ===================================================== */}
          {!isMobile && (
            <motion.div
              initial={{
                opacity: 0,
                x: 100,
                scale: 0.7,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: attention ? 1.06 : 1,
              }}
              exit={{
                opacity: 0,
                x: 100,
                scale: 0.7,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
              }}
              className="fixed bottom-12 md:bottom-32 right-2 z-[90] font-odop"
            >
              {/* Completely transparent wrapper */}
              <div className="relative w-96 bg-transparent border-none outline-none shadow-none">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  aria-label="Close flash sale"
                  className="
                    absolute
                    -top-2
                    right-2
                    z-30
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-black/70
                    text-white
                    shadow-lg
                    backdrop-blur-sm
                    transition-all
                    duration-200
                    hover:scale-110
                    hover:bg-black
                  "
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                {/* Offer */}
                <div
                  className="
                    relative
                    cursor-pointer
                    overflow-visible
                    bg-transparent
                    border-none
                    outline-none
                    shadow-none
                  "
                  onClick={() => {
                    handleClose(true);
                    router.push("/products/festival-season");
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full h-36 overflow-visible bg-transparent flex justify-end">
                    <img
                      src={getImageSrc(offer?.image)}
                      alt="Flash Sale"
                      className="
  block
  w-[280px]
  h-[140px]
  object-contain
  bg-transparent
  border-none
  outline-none
  shadow-none
"
                    />
                  </div>

                  {/* Timer */}
                  <div className="mt-1 ml-28">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#000940] opacity-60 mb-1.5">
                      Offer ends in
                    </p>
                    <div className="flex items-center gap-1">
                      {days > 0 && (
                        <>
                          <TimerUnit value={pad(days)} label="Days" size="lg" />
                          <TimerSep size="lg" />
                        </>
                      )}
                      <TimerUnit value={pad(hours)} label="Hrs" size="lg" />
                      <TimerSep size="lg" />
                      <TimerUnit value={pad(minutes)} label="Min" size="lg" />
                      <TimerSep size="lg" />
                      <TimerUnit value={pad(seconds)} label="Sec" size="lg" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* =====================================================
              MOBILE
              Plain, clean, structured horizontal card: image left,
              label + timer right, single close button. No motifs,
              no heavy gradients — just clear hierarchy.
          ===================================================== */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: attention ? 1.03 : 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed bottom-52 right-3 z-[100] font-odop"
            >
              <div
                className="relative flex items-center bg-white"
                style={{
                  width: 232,
                  borderRadius: 16,
                  border: "1px solid rgba(0,9,64,0.1)",
                  boxShadow: "0 8px 20px rgba(0,9,64,0.12)",
                  padding: 8,
                  gap: 10,
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => handleClose(true)}
                  aria-label="Close flash sale"
                  className="absolute flex items-center justify-center"
                  style={{
                    top: -7,
                    right: -7,
                    height: 20,
                    width: 20,
                    borderRadius: 999,
                    background: "#fff",
                    border: "1px solid rgba(0,9,64,0.12)",
                    color: "#000940",
                    boxShadow: "0 2px 6px rgba(0,9,64,0.15)",
                  }}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>

                {/* Tap target */}
                <button
                  onClick={() => {
                    handleClose(true);
                    router.push("/products/festival-season");
                  }}
                  className="flex items-center text-left"
                  style={{ gap: 10, width: "100%" }}
                >
                  {/* Image */}
                  <img
                    src={getImageSrc(offer?.image)}
                    alt="Flash Sale"
                    className="object-contain flex-shrink-0"
                    style={{ height: 52, width: 58, borderRadius: 10 }}
                  />

                  {/* Text + timer */}
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#A00300",
                      }}
                    >
                      Flash sale
                    </span>
                    <div className="flex items-center" style={{ gap: 3 }}>
                      {days > 0 && (
                        <>
                          <MobileDigit value={pad(days)} label="d" />
                          <span style={{ color: "#c7cae2", fontSize: 11 }}>
                            :
                          </span>
                        </>
                      )}
                      <MobileDigit value={pad(hours)} label="h" />
                      <span style={{ color: "#c7cae2", fontSize: 11 }}>:</span>
                      <MobileDigit value={pad(minutes)} label="m" />
                      <span style={{ color: "#c7cae2", fontSize: 11 }}>:</span>
                      <MobileDigit value={pad(seconds)} label="s" />
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default FlashSaleOffer;
