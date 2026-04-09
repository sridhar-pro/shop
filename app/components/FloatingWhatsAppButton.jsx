"use client";
import React from "react";

const PHONE_E164 = "917305888112";
const DEFAULT_MSG = "Hi! I’d like to know more about your products.";

export default function FloatingWhatsAppButton() {
  const href = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
    DEFAULT_MSG,
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="
        group fixed z-50
        right-2 md:right-7
        bottom-20

        h-14 w-14 rounded-full
        bg-[#25D366] text-white shadow-lg
        flex items-center justify-center
        hover:shadow-xl hover:scale-105 active:scale-95
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] font-gift
      "
    >
      {/* Pulse */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#25D366]"
      />

      {/* ✅ Real WhatsApp logo */}
      <svg
        className="relative h-7 w-7 fill-white"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.06 3C9.44 3 4.07 8.37 4.07 15c0 2.21.58 4.29 1.62 6.14L4 29l7.08-1.87c1.75.96 3.74 1.47 5.98 1.47 6.63 0 12-5.37 12-12S22.69 3 16.06 3zm0 21.82c-1.88 0-3.67-.55-5.22-1.51l-.37-.23-4.16 1.1 1.1-4.06-.24-.41a9.7 9.7 0 0 1-1.44-5.1c0-5.37 4.36-9.73 9.73-9.73S25.2 9.23 25.2 14.6c0 5.36-4.36 9.73-9.73 9.73zm5.05-7.27c-.28-.14-1.64-.81-1.89-.9-.25-.1-.44-.14-.63.14-.19.28-.73.9-.9 1.08-.17.19-.33.21-.6.07-.27-.14-1.14-.42-2.16-1.3-.79-.69-1.33-1.54-1.49-1.8-.16-.26-.02-.41.12-.55.12-.12.27-.3.41-.45.14-.16.2-.28.29-.46.1-.17.04-.33-.03-.47-.07-.14-.62-1.48-.85-2.03-.22-.55-.45-.47-.63-.47h-.53c-.18 0-.44.07-.67.33-.23.27-.88.85-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.94 2.96 4.68 4.15.65.28 1.15.45 1.54.58.65.21 1.25.18 1.72.11.53-.08 1.66-.67 1.89-1.31.24-.64.24-1.19.16-1.31-.07-.13-.25-.2-.53-.34z" />
      </svg>

      {/* Tooltip */}
      <span
        className="
          hidden md:block
          absolute left-[-10px] translate-x-[-100%]
          bg-black text-white text-xs font-medium
          px-3 py-1 rounded-full shadow-md
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none whitespace-nowrap
        "
      >
        Chat on WhatsApp
      </span>
    </a>
  );
}
