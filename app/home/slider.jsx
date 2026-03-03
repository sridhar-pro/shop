"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export function ImagesSliderDemo() {
  const [streamLink, setStreamLink] = useState(null);
  const [desktopImages, setDesktopImages] = useState([]);
  const [mobileImages, setMobileImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const baseUrl = "https://marketplace.yuukke.com/assets/uploads/";

  // 🖼️ Fetch slider images from API
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchImages = async () => {
      hasFetched.current = true;
      setLoading(true);

      try {
        const [desktopRes, mobileRes, configRes] = await Promise.all([
          fetch("/api/slider"),
          fetch("/api/mobslider"),
          fetch("/api/mConfig"), // ✅ new API added
        ]);

        if (!desktopRes.ok) throw new Error("Failed to fetch desktop slider");
        if (!mobileRes.ok) throw new Error("Failed to fetch mobile slider");
        if (!configRes.ok) throw new Error("Failed to fetch config");

        const [desktopData, mobileData, configData] = await Promise.all([
          desktopRes.json(),
          mobileRes.json(),
          configRes.json(),
        ]);

        const rawStream = configData?.settings?.stream_link?.trim();

        const streamUrl =
          rawStream && rawStream.startsWith("http") ? rawStream : null;

        const normalizeDesktop = (item) => {
          const src = item.video
            ? `${baseUrl}${item.video}`
            : item.image
              ? `${baseUrl}${item.image}`
              : null;

          const type = item.type ? item.type : item.video ? "video" : "image";

          return {
            src,
            href: item.link || "#",
            title: item.title || "",
            type,
          };
        };

        const normalizeMobile = (item) => {
          const media = item.image || item.banner || item.video || null;

          const src = media
            ? media.startsWith("http")
              ? media
              : `${baseUrl}${media}`
            : null;

          const type = item.type
            ? item.type
            : media?.endsWith(".mp4")
              ? "video"
              : "image";

          return {
            src,
            href: item.link || "#",
            title: item.title || "",
            type,
          };
        };

        const formattedDesktop =
          Object.values(desktopData).map(normalizeDesktop);

        const formattedMobile = Object.values(mobileData).map(normalizeMobile);

        // ✅ Inject YouTube stream as first slide (if exists)
        if (streamUrl) {
          const youtubeSlide = {
            src: streamUrl,
            href: "#",
            title: "Live Stream",
            type: "youtube",
          };

          formattedDesktop.unshift(youtubeSlide);
          formattedMobile.unshift(youtubeSlide);
        }

        setDesktopImages(formattedDesktop);
        setMobileImages(formattedMobile);

        // Preload only images (avoid video/youtube preload)
        const allImages = [...formattedDesktop, ...formattedMobile];
        allImages
          .filter((item) => item.type === "image")
          .slice(1)
          .forEach(({ src }) => {
            const img = new window.Image();
            img.src = src;
          });
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    // 🔄 Debounced resize listener
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const images = isMobile ? mobileImages : desktopImages;
  const currentSlide = images[currentIndex] || null; // ✅ safe & sexy

  // 👆 Swipe support
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((prev) => (prev + 1) % images.length),
    onSwipedRight: () =>
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length),
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  const slideVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  };

  // ⏱️ Auto slide
  useEffect(() => {
    if (images.length <= 1) return;

    if (currentSlide?.type === "video" || currentSlide?.type === "youtube")
      return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images, currentIndex]);

  return (
    <div className="px-2 lg:px-8 mt-2 lg:mt-4">
      <div
        {...swipeHandlers}
        className="relative w-full aspect-[520/600] md:h-auto md:aspect-[16/4] overflow-hidden touch-pan-x rounded-2xl"
      >
        {loading || images.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 lg:rounded-2xl overflow-hidden">
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.a
                key={currentIndex}
                href={images[currentIndex]?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={slideVariants}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 block w-full h-full lg:rounded-2xl overflow-hidden"
              >
                {images[currentIndex]?.type === "video" ? (
                  <video
                    src={currentSlide.src}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => {
                      setCurrentIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="object-contain w-full h-full lg:rounded-2xl"
                  />
                ) : currentSlide?.type === "youtube" && currentSlide?.src ? (
                  <iframe
                    src={`${currentSlide.src}&autoplay=1&mute=1`}
                    title="Live Stream"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full lg:rounded-2xl"
                  />
                ) : (
                  <Image
                    src={images[currentIndex].src || "/fallback.png"}
                    alt={images[currentIndex]?.title || "Slide"}
                    fill
                    className="object-contain lg:rounded-2xl"
                    priority
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />
                )}
              </motion.a>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev - 1 + images.length) % images.length,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition z-50"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev + 1) % images.length)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow transition z-50"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            <div className="absolute bottom-4 z-50 w-full flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-red-600 scale-110 shadow"
                      : "bg-red-600/40 hover:bg-red-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
