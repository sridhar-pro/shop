"use client";
import React, { useState, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";

const PHONE = "917305888112";
const MSG = "Hi! I'd like to know more about your products.";
const WA_HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG)}`;

const WaIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 32 32" fill="currentColor">
    <path d="M16.06 3C9.44 3 4.07 8.37 4.07 15c0 2.21.58 4.29 1.62 6.14L4 29l7.08-1.87c1.75.96 3.74 1.47 5.98 1.47 6.63 0 12-5.37 12-12S22.69 3 16.06 3zm5.05 18.55c-.28-.14-1.64-.81-1.89-.9-.25-.1-.44-.14-.63.14-.19.28-.73.9-.9 1.08-.17.19-.33.21-.6.07-.27-.14-1.14-.42-2.16-1.3-.79-.69-1.33-1.54-1.49-1.8-.16-.26-.02-.41.12-.55.12-.12.27-.3.41-.45.14-.16.2-.28.29-.46.1-.17.04-.33-.03-.47-.07-.14-.62-1.48-.85-2.03-.22-.55-.45-.47-.63-.47h-.53c-.18 0-.44.07-.67.33-.23.27-.88.85-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.94 2.96 4.68 4.15.65.28 1.15.45 1.54.58.65.21 1.25.18 1.72.11.53-.08 1.66-.67 1.89-1.31.24-.64.24-1.19.16-1.31-.07-.13-.25-.2-.53-.34z" />
  </svg>
);

export default function FloatingWhatsAppButton() {
  const [open, setOpen] = useState(false);
  const hideTimer = useRef();

  const show = () => {
    clearTimeout(hideTimer.current);
    setOpen(true);
  };

  const hide = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className="fixed z-50 right-4 md:right-5 bottom-20 flex flex-col items-end gap-3 font-odop">
      {/* Popup card */}
      <div
        className={`
          flex flex-col items-center text-center gap-2 w-52 p-5 rounded-2xl
          bg-white border border-black/10 shadow-xl
          transition-all duration-[280ms] ease-[cubic-bezier(.22,1,.36,1)] origin-bottom-right
          ${
            open
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-4 scale-95 pointer-events-none"
          }
        `}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-[#0F6E56] flex items-center justify-center">
          <WaIcon className="w-6 h-6 text-[#E1F5EE]" />
        </div>

        <p className="text-xs text-gray-500 leading-snug m-0">
          Questions? I'm just a message away.
        </p>

        {/* CTA */}
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex items-center gap-2 w-full justify-center
            bg-[#1D9E75] hover:bg-[#0F6E56]
            text-[#E1F5EE] text-xs font-medium
            rounded-full py-2 px-4 mt-1
            transition-all duration-150 hover:scale-[1.03]
            no-underline
          "
        >
          <WaIcon className="w-4 h-4" />
          Chat with me
        </a>
      </div>

      {/* FAB */}
      <div onMouseEnter={show} onMouseLeave={hide}>
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="
            relative w-14 h-14 rounded-full
            bg-[#1D9E75] text-[#E1F5EE]
            flex items-center justify-center
            hover:scale-110 active:scale-95
            transition-transform duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]
          "
        >
          <span className="absolute inset-0 rounded-full bg-[#1D9E75] animate-ping opacity-30" />
          <FaWhatsapp className="relative w-7 h-7" />
        </a>
      </div>
    </div>
  );
}
