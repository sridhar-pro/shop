"use client";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const languageOptions = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिंदी", short: "HI" },
  { code: "ta", label: "தமிழ்", short: "TA" },
  { code: "gu", label: "ગુજરાતી", short: "GU" },
  { code: "te", label: "తెలుగు", short: "TE" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang.toLowerCase());
    localStorage.setItem("i18nextLng", lang);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentLangCode = i18n?.language
    ? i18n.language.split("-")[0].toLowerCase()
    : "en";

  const currentOption =
    languageOptions.find((l) => l.code === currentLangCode) ||
    languageOptions[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${currentOption.label}`}
        className={`
          relative flex items-center justify-center
          h-[34px] w-[34px] shrink-0
          rounded-full border
          transition-all duration-300 cursor-pointer
          ${
            open
              ? "border-ink bg-black text-white"
              : "border-gray-400 bg-white text-ink hover:border-ink"
          }
        `}
      >
        <Globe size={16} className={open ? "text-white" : "text-ink"} />
        <span
          className={`
            absolute -bottom-[3px] -right-[3px]
            rounded-full px-[3px] py-[1px]
            text-[8px] font-bold leading-none tracking-wide border
            ${
              open
                ? "bg-black text-white border-white/40"
                : "bg-white text-[#A00300] border-ink/15"
            }
          `}
        >
          {currentOption.short}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="
              absolute right-0 mt-2.5
              w-[168px]
              rounded-[18px] border border-[#E6DDD6]
              bg-white p-[6px]
              shadow-[0_10px_30px_rgba(0,0,0,.10)]
              z-50
            "
          >
            {languageOptions.map(({ code, label, short }) => {
              const active = currentLangCode === code;
              return (
                <button
                  key={code}
                  role="option"
                  aria-selected={active}
                  onClick={() => changeLang(code)}
                  className={`
                    flex w-full items-center justify-between
                    rounded-[12px] px-3 py-[9px]
                    text-[13px] font-medium
                    transition-colors duration-200
                    ${
                      active
                        ? "bg-[#A00300]/[0.06] text-[#A00300] font-semibold"
                        : "text-gray-700 hover:bg-black/[0.04]"
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span>{label}</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-[#988D87]">
                      {short}
                    </span>
                  </span>
                  {active && <Check size={14} className="text-[#A00300]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
