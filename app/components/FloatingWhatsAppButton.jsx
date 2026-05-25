"use client";

import { MessageCircle } from "lucide-react";
import React, { useState, useRef } from "react";

const PHONE = "917305888112";

const MSG = "Hi! I'd like to know more about your products.";

const WA_HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG)}`;

const WaIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M20.52 3.48A11.86 11.86 0 0012.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.97L0 24l6.3-1.65a11.9 11.9 0 005.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44zm-8.46 18.3h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.86 9.86 0 01-1.52-5.26c0-5.46 4.45-9.9 9.92-9.9 2.65 0 5.13 1.03 7 2.9a9.84 9.84 0 012.9 7c0 5.46-4.45 9.9-9.91 9.9zm5.43-7.41c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.08-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.1 3.2 5.08 4.48.7.3 1.25.48 1.68.62.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35z" />
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
    <div className="fixed right-4 md:right-5 bottom-28 md:bottom-6 z-40 pointer-events-none">
      <div className="flex flex-col items-end gap-2 w-fit font-odop">
        {/* Popup */}
        <div
          className={`
            pointer-events-auto
            flex flex-col items-center text-center gap-2 w-52 p-5 rounded-2xl
            bg-white border border-black/10 shadow-xl
            transition-all duration-[280ms] ease-[cubic-bezier(.22,1,.36,1)] origin-bottom-right
            ${
              open
                ? "opacity-100 translate-y-0 scale-100"
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
            title="Chat with Yuukke on WhatsApp"
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
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          className="pointer-events-auto"
        >
          <a
            href={WA_HREF}
            title="Contact Yuukke on WhatsApp"
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

            <WaIcon className="relative w-7 h-7" />
          </a>
        </div>
      </div>
    </div>
  );
}
