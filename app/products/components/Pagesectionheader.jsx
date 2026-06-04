"use client";
import { Sparkles, Flower2, Gift, Truck } from "lucide-react";
import Link from "next/link";

function SectionHeader({ label, title, description }) {
  return (
    <div className="w-full my-0 md:my-10 mb-4">
      <div className="relative group">
        <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>
        <div className="pl-4">
          <div className="flex flex-col space-y-1 mb-6">
            <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
              {label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
              {title}
            </h2>
            <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
          </div>
          <div>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FestivalGiftingHeader() {
  return (
    <div className="w-full mb-4">
      <div className="relative overflow-hidden px-4 pt-8 pb-0">
        {/* Faint gift illustration — right */}
        <svg
          className="absolute right-0 top-0 bottom-0 h-full w-48 pointer-events-none"
          viewBox="0 0 200 280"
          fill="none"
          preserveAspectRatio="xMaxYMid meet"
        >
          <g opacity="0.08" stroke="#A00300" strokeWidth="1" fill="none">
            <rect x="30" y="100" width="140" height="160" rx="2" />
            <rect x="22" y="74" width="156" height="34" rx="2" />
            <line x1="100" y1="74" x2="100" y2="260" />
            <line x1="22" y1="91" x2="178" y2="91" />
            <ellipse
              cx="82"
              cy="72"
              rx="24"
              ry="15"
              transform="rotate(-28 82 72)"
            />
            <ellipse
              cx="118"
              cy="72"
              rx="24"
              ry="15"
              transform="rotate(28 118 72)"
            />
            <circle cx="100" cy="74" r="10" />
          </g>
          <g opacity="0.06" stroke="#c97d00" strokeWidth="0.8" fill="none">
            <circle cx="160" cy="40" r="20" />
            <circle cx="160" cy="40" r="12" />
            <line x1="160" y1="20" x2="160" y2="10" />
            <line x1="160" y1="60" x2="160" y2="70" />
            <line x1="140" y1="40" x2="130" y2="40" />
            <line x1="180" y1="40" x2="190" y2="40" />
          </g>
        </svg>

        {/* Label row */}
        <div className="flex items-center gap-2.5 mb-[18px] animate-rise-1">
          <div className="w-7 h-0.5 bg-[#A00300] rounded flex-shrink-0" />
          <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#A00300]">
            Festive Gifting
          </span>
          <div className="w-1 h-1 rounded-full bg-[#c97d00] flex-shrink-0" />
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#c97d00]">
            Yuukke Picks
          </span>
        </div>

        {/* Title */}
        <div className="mb-5">
          <p className="text-[13px] font-normal tracking-[0.08em] uppercase text-[#7a3a00] mb-1.5 animate-rise-1">
            Most loved this season
          </p>
          <h2 className="font-serif text-[clamp(2.6rem,6vw,3.8rem)] font-semibold leading-none text-[#140200] flex flex-wrap items-baseline gap-x-3 animate-rise-2">
            <span>Yuukke</span>
            <em className="italic text-[#A00300] relative">
              Hot Picks
              <span className="absolute bottom-0.5 left-0 right-0 h-[1.5px] bg-[#c97d00] origin-left animate-expand-rule" />
            </em>
          </h2>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-1.5 mb-[18px] animate-expand-rule origin-left">
          <div className="w-9 h-px bg-[#e8cdb0]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300] flex-shrink-0" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
          <div className="w-[72px] h-px bg-[#e8cdb0]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300] flex-shrink-0" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
          <div className="w-7 h-px bg-[#e8cdb0]" />
        </div>

        {/* Description */}
        <p className="text-[14px] font-light text-[#5c2a00] leading-[1.85] max-w-[400px] mb-[22px] animate-rise-3">
          Discover our most popular products, loved by thousands of happy
          customers!
        </p>

        {/* Bottom rule */}
        <div className="mt-6 h-px bg-gradient-to-r from-[rgba(160,3,0,0.25)] via-[rgba(201,125,0,0.15)] to-transparent" />
      </div>
    </div>
  );
}

function FathersDayHero() {
  return (
    <div className="relative overflow-hidden pb-4 grid grid-cols-[1fr_200px] items-center gap-0">
      <style>{`
        @keyframes fd-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fd-slide-r { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fd-shimmer { from{transform:translateX(-120%)} to{transform:translateX(220%)} }
        @keyframes fd-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes fd-pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.55);opacity:0} }
        @keyframes fd-line-in { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .fd-a1 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .05s both }
        .fd-a2 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .18s both }
        .fd-a3 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .30s both }
        .fd-a4 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .42s both }
        .fd-a5 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .54s both }
        .fd-a6 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .64s both }
        .fd-gift { animation: fd-float 3.4s ease-in-out infinite, fd-slide-r .7s cubic-bezier(.22,1,.36,1) .1s both }

        .fd-badge::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.55) 50%, transparent 100%);
          transform: translateX(-120%);
          animation: fd-shimmer 3s infinite 1.2s;
        }
        .fd-live-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #A00300;
          animation: fd-pulse-ring 1.6s ease-out infinite;
        }
        .fd-accent-line {
          transform-origin: left;
          animation: fd-line-in .5s cubic-bezier(.22,1,.36,1) .35s both;
        }
        .fd-btn-shimmer::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          transform: translateX(-120%);
          animation: fd-shimmer 3.2s infinite 2s;
        }
      `}</style>

      {/* Faint background rings */}
      <div
        className="absolute top-0 right-0 w-60 h-full pointer-events-none overflow-hidden opacity-[0.035]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 240 380"
          width="240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="120" cy="190" r="160" stroke="#0a0a1a" strokeWidth="1" />
          <circle
            cx="120"
            cy="190"
            r="120"
            stroke="#0a0a1a"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <circle cx="120" cy="190" r="80" stroke="#0a0a1a" strokeWidth="1" />
          <circle
            cx="120"
            cy="190"
            r="40"
            stroke="#0a0a1a"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
        </svg>
      </div>

      {/* ── Left: Copy ── */}
      <div className="relative z-10 max-w-[680px]">
        {/* Badge */}
        <div
          className="fd-badge fd-a1 inline-flex items-center gap-[7px] text-[11px] font-semibold tracking-[.13em] uppercase px-[13px] pl-[9px] py-[5px] rounded-full relative overflow-hidden"
          style={{
            background: "rgba(160,3,0,.08)",
            border: "1px solid rgba(160,3,0,.2)",
            color: "#A00300",
          }}
        >
          <span
            className="fd-live-dot w-[7px] h-[7px] rounded-full flex-shrink-0 relative"
            style={{ background: "#A00300" }}
          />
          Father's Day Sale
        </div>

        {/* Headline */}
        <div className="fd-a2 mt-[18px]">
          {/* H1 */}
          <h1
            className="font-serif font-black leading-[1.06] tracking-[-0.028em] m-0"
            style={{
              fontSize: "clamp(1.9rem, 4.8vw, 3.1rem)",
              color: "#0a0a1a",
            }}
          >
            Father's Day Gifts &amp; Hampers
          </h1>

          {/* H2 */}
          <h2
            className="font-serif font-semibold mt-[6px] m-0"
            style={{
              fontSize: "clamp(1.1rem, 2.8vw, 1.7rem)", // smaller than H1
              color: "#A00300",
              lineHeight: "1.2",
            }}
          >
            For the Man who does it all
          </h2>

          <div className="flex items-center gap-[10px] mt-3 flex-wrap">
            <span
              className="text-[13px]"
              style={{ color: "rgba(10,10,26,.3)" }}
            >
              —
            </span>

            <span
              className="inline-flex items-baseline gap-[3px] text-[13px] font-semibold tracking-[.01em] rounded-[6px] px-2 py-[2px]"
              style={{
                color: "#A00300",
                background: "rgba(160,3,0,.07)",
              }}
            >
              From ₹200
            </span>

            <span
              className="text-[13px]"
              style={{ color: "rgba(10,10,26,.3)" }}
            >
              ·
            </span>

            {/* Highlighted Delivery */}
            <span
              className="inline-flex items-center gap-[6px] text-[13px] font-semibold rounded-full px-[10px] py-[5px]"
              style={{
                color: "#0F6D3A",
                background: "rgba(15,109,58,.08)",
                border: "1px solid rgba(15,109,58,.15)",
              }}
            >
              <Truck size={14} strokeWidth={2.2} />
              Delivery within 3 days
            </span>
          </div>
        </div>

        {/* Accent rule */}
        <div className="fd-a3 mt-4">
          <div
            className="fd-accent-line h-[2px] w-12 rounded-sm"
            style={{ background: "#A00300" }}
          />
        </div>

        {/* CTAs */}
        <div className="fd-a5 flex gap-[10px] flex-wrap mt-3">
          <Link
            href="https://gift.yuukke.com/own-hamper"
            target="_blank"
            rel="noopener noreferrer"
            className="fd-btn-shimmer relative inline-flex items-center justify-center overflow-hidden text-white text-[13px] font-semibold tracking-[.06em] uppercase px-[30px] py-[14px] rounded-full transition-all duration-[180ms]"
            style={{ background: "#A00300" }}
          >
            Customize Your Own Hamper
          </Link>
          <button
            className="bg-transparent text-[13px] font-medium tracking-[.06em] uppercase px-[28px] py-[13px] rounded-full cursor-pointer transition-all duration-[180ms]"
            style={{
              color: "#0a0a1a",
              border: "1.5px solid rgba(10,10,26,.16)",
            }}
            onClick={() => {
              window.scrollBy({
                top: 500, // adjust scroll distance
                behavior: "smooth",
              });
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(10,10,26,.38)";
              e.currentTarget.style.background = "rgba(10,10,26,.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(10,10,26,.16)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Explore Collections
          </button>
        </div>

        {/* Trust chips */}
        <div
          className="fd-a6 flex items-center gap-2 flex-wrap mt-7 pt-5"
          style={{ borderTop: "0.5px solid rgba(10,10,26,.08)" }}
        >
          {[
            {
              label: "Delivery in 3 days",
              icon: (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A00300"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 5v4h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
            },

            {
              label: "Starting ₹200",
              icon: (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#A00300"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M9 14l2 2 4-4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              ),
            },
          ].map(({ label, icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-[13px] py-[7px] rounded-full"
              style={{
                background: "rgba(10,10,26,.04)",
                border: "0.5px solid rgba(10,10,26,.1)",
              }}
            >
              {icon}
              <span
                className="text-[12px] font-medium"
                style={{ color: "rgba(10,10,26,.55)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OffersHeader() {
  return (
    <div className="w-full mb-4">
      <div className="relative overflow-hidden px-4 pt-2 pb-0">
        {/* 🎯 Subtle % pattern instead of gift */}
        <svg
          className="absolute right-0 top-0 bottom-0 h-full w-48 pointer-events-none"
          viewBox="0 0 200 280"
          fill="none"
          preserveAspectRatio="xMaxYMid meet"
        >
          <g opacity="0.06" stroke="#b91c1c" strokeWidth="1.2">
            <circle cx="60" cy="120" r="18" />
            <circle cx="140" cy="200" r="18" />
            <line x1="70" y1="210" x2="130" y2="110" />
          </g>
          <g opacity="0.05" stroke="#f97316" strokeWidth="1">
            <circle cx="150" cy="60" r="22" />
            <circle cx="150" cy="60" r="10" />
          </g>
        </svg>

        {/* Label row (same pattern) */}
        <div className="flex items-center gap-2.5 mb-[18px] animate-rise-1">
          <div className="w-7 h-0.5 bg-[#b91c1c] rounded flex-shrink-0" />
          <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#b91c1c]">
            Exclusive Offers
          </span>
          <div className="w-1 h-1 rounded-full bg-[#f97316] flex-shrink-0" />
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#f97316]">
            Limited Deals
          </span>
        </div>

        {/* Title */}
        <div className="mb-5">
          <p className="text-[13px] tracking-[0.08em] uppercase text-[#7a3a00] mb-1.5 animate-rise-1">
            Best value picks for you
          </p>

          <h2 className="font-serif text-[clamp(2.6rem,6vw,3.8rem)] font-semibold leading-none text-[#140200] flex flex-wrap items-baseline gap-x-3 animate-rise-2">
            <span>Yuukke</span>
            <em className="italic text-[#b91c1c] relative">
              Deals
              <span className="absolute bottom-0.5 left-0 right-0 h-[1.5px] bg-[#f97316] origin-left animate-expand-rule" />
            </em>
          </h2>
        </div>

        {/* Ornament (same style consistency 👌) */}
        <div className="flex items-center gap-1.5 mb-[18px] animate-expand-rule origin-left">
          <div className="w-9 h-px bg-[#f5d0c5]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#f97316]" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#b91c1c]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#f97316]" />
          <div className="w-[72px] h-px bg-[#f5d0c5]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#f97316]" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#b91c1c]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#f97316]" />
          <div className="w-7 h-px bg-[#f5d0c5]" />
        </div>

        {/* Description */}
        <p className="text-[14px] font-light text-[#5c2a00] leading-[1.85] max-w-[400px] mb-[22px] animate-rise-3">
          Explore curated offers designed to give you the best value — premium
          products at irresistible prices.
        </p>

        {/* Bottom rule */}
        <div className="mt-6 h-px bg-gradient-to-r from-[rgba(185,28,28,0.25)] via-[rgba(249,115,22,0.15)] to-transparent" />
      </div>
    </div>
  );
}

function ExpoHeader() {
  return (
    <div className="w-full mb-4">
      <div className="relative overflow-hidden px-4 pt-2 pb-0">
        {/* 🎯 Abstract pattern */}
        <svg
          className="absolute right-0 top-0 bottom-0 h-full w-48 pointer-events-none"
          viewBox="0 0 200 280"
          fill="none"
          preserveAspectRatio="xMaxYMid meet"
        >
          <g opacity="0.06" stroke="#A00300" strokeWidth="1.2">
            <circle cx="60" cy="120" r="18" />
            <circle cx="140" cy="200" r="18" />
            <line x1="70" y1="210" x2="130" y2="110" />
          </g>
          <g opacity="0.05" stroke="#000930" strokeWidth="1">
            <circle cx="150" cy="60" r="22" />
            <circle cx="150" cy="60" r="10" />
          </g>
        </svg>

        {/* Label row */}
        <div className="flex items-center gap-2.5 mb-[18px] animate-rise-1">
          <div className="w-7 h-0.5 bg-[#A00300] rounded flex-shrink-0" />
          <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#A00300]">
            IRIS EXPO 2026
          </span>
          <div className="w-1 h-1 rounded-full bg-[#000930] flex-shrink-0" />
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#000930]">
            Chennai
          </span>
        </div>

        {/* Title */}
        <div className="mb-5">
          <h2 className="font-serif text-[clamp(2.6rem,6vw,3.8rem)] font-semibold leading-none text-[#000930] flex flex-wrap items-baseline gap-x-3 animate-rise-2">
            <span>IRIS</span>
            <em className="italic text-[#A00300] relative">
              Expo
              <span className="absolute bottom-0.5 left-0 right-0 h-[1.5px] bg-[#000930] origin-left animate-expand-rule" />
            </em>
          </h2>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-1.5 mb-[18px] animate-expand-rule origin-left">
          <div className="w-9 h-px bg-[rgba(160,3,0,0.2)]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#000930]" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#000930]" />
          <div className="w-[72px] h-px bg-[rgba(160,3,0,0.2)]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#000930]" />
          <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300]" />
          <div className="w-[3px] h-[3px] rotate-45 bg-[#000930]" />
          <div className="w-7 h-px bg-[rgba(160,3,0,0.2)]" />
        </div>

        {/* Description */}
        <p className="text-[14px] font-light text-[#1a1a2e] leading-[1.85] max-w-[440px] mb-[22px] animate-rise-3">
          Experience IRIS Expo Chennai 2026 — where innovation meets vision.
        </p>

        {/* Bottom rule */}
        <div className="mt-6 h-px bg-gradient-to-r from-[rgba(160,3,0,0.25)] via-[rgba(0,9,48,0.15)] to-transparent" />
      </div>
    </div>
  );
}

export default function PageSectionHeader({
  isOffersPage,
  isFestivalGifting,
  isWomensday,
  isNewarrivalsPage,
  isCorporateEssentialsPage,
  isMostSavedPage,
  isWellnessPage,
  isReturnGiftsPage,
  isFeaturedPage,
  isCorporatePage,
  isGetTitle9Page,
  isGetTitle10Page,
  isGetTitle11Page,
  isGetTitle12Page,
  isBogo,
  title,
  isEOY,
}) {
  const featuredDescription =
    "Discover our most popular products, loved by thousands of happy customers!";

  // if (isOffersPage) {
  //   return (
  //     <div className="w-full my-10 mb-4">
  //       <div className="relative group">
  //         <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>
  //         <div className="pl-4">
  //           <div className="flex flex-col space-y-1 mb-6">
  //             <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
  //               Limited Time
  //             </span>
  //             <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
  //               Today's Exclusive Deal
  //             </h2>
  //             <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
  //           </div>
  //           <div>
  //             <p className="text-gray-700 leading-relaxed">
  //               Don't miss our special offers curated just for you. Limited
  //               quantities available.
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  if (isOffersPage) {
    return <OffersHeader />;
  }

  // if (isFestivalGifting) {
  //   return (
  //     <SectionHeader
  //       label="Festive Gifting"
  //       title="Yuukke Hot Picks"
  //       description={featuredDescription}
  //     />
  //   );
  // }

  if (isFestivalGifting) {
    return <FestivalGiftingHeader />;
  }

  // if (isWomensday) {
  //   return (
  //     <SectionHeader
  //       label="Puthandu Sale"
  //       title="Celebrate Tamil New Year with Yuukke"
  //       description={featuredDescription}
  //     />
  //   );
  // }

  if (isWomensday) {
    return <FathersDayHero />;
  }

  if (isEOY) {
    return <ExpoHeader />;
  }

  if (isBogo) {
    return (
      <SectionHeader
        label="Special Offers"
        title="Buy More, Get More!"
        description="Explore our exciting deals — buy any product and enjoy additional free items. Limited time only!"
      />
    );
  }

  // All "Featured Collection" pages share same structure, just different title
  const featuredPages = [
    isNewarrivalsPage,
    isCorporateEssentialsPage,
    isMostSavedPage,
    isWellnessPage,
    isReturnGiftsPage,
    isFeaturedPage,
    isCorporatePage,
    isGetTitle9Page,
    isGetTitle10Page,
    isGetTitle11Page,
    isGetTitle12Page,
  ];

  function FeaturedCollectionHeader({ title }) {
    const formatTitle = (title) => {
      if (!title) return "";

      const decoded = title.replace(/[’‘]/g, "'");

      return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
    };
    return (
      <div className="w-full mb-4">
        <div className="relative overflow-hidden px-4 pt-2 pb-0">
          {/* Decorative SVG — right */}
          <svg
            className="absolute right-0 top-0 bottom-0 h-full w-48 pointer-events-none"
            viewBox="0 0 200 280"
            fill="none"
            preserveAspectRatio="xMaxYMid meet"
          >
            <g opacity="0.06" stroke="#A00300" strokeWidth="1.2">
              <circle cx="140" cy="80" r="40" />
              <circle cx="140" cy="80" r="24" />
              <circle cx="140" cy="80" r="10" />
            </g>
            <g opacity="0.05" stroke="#c97d00" strokeWidth="1">
              <line x1="100" y1="160" x2="190" y2="260" />
              <line x1="120" y1="140" x2="190" y2="230" />
              <circle cx="155" cy="210" r="16" />
            </g>
          </svg>

          {/* Label row */}
          <div className="flex items-center gap-2.5 mb-[18px] animate-rise-1">
            <div className="w-7 h-0.5 bg-[#A00300] rounded flex-shrink-0" />
            <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-[#A00300]">
              Featured Collection
            </span>
            <div className="w-1 h-1 rounded-full bg-[#c97d00] flex-shrink-0" />
            <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-[#c97d00]">
              Yuukke Picks
            </span>
          </div>

          {/* Title */}
          <div className="mb-5">
            <p className="text-[13px] tracking-[0.08em] uppercase text-[#7a3a00] mb-1.5 animate-rise-1">
              Curated just for you
            </p>
            <h2 className="font-serif text-[clamp(2.6rem,6vw,3.8rem)] font-semibold leading-none text-[#140200] flex flex-wrap items-baseline gap-x-3 animate-rise-2">
              <span>{formatTitle(title)}</span>
            </h2>
          </div>

          {/* Ornament */}
          <div className="flex items-center gap-1.5 mb-[18px] animate-expand-rule origin-left">
            <div className="w-9 h-px bg-[#e8cdb0]" />
            <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
            <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300] flex-shrink-0" />
            <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
            <div className="w-[72px] h-px bg-[#e8cdb0]" />
            <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
            <div className="w-[5px] h-[5px] rotate-45 bg-[#A00300] flex-shrink-0" />
            <div className="w-[3px] h-[3px] rotate-45 bg-[#c97d00] flex-shrink-0" />
            <div className="w-7 h-px bg-[#e8cdb0]" />
          </div>

          {/* Description */}
          <p className="text-[14px] font-light text-[#5c2a00] leading-[1.85] max-w-[400px] mb-[22px] animate-rise-3">
            Discover our most popular products, loved by thousands of happy
            customers!
          </p>

          {/* Bottom rule */}
          <div className="mt-6 h-px bg-gradient-to-r from-[rgba(160,3,0,0.25)] via-[rgba(201,125,0,0.15)] to-transparent" />
        </div>
      </div>
    );
  }

  if (featuredPages.some(Boolean)) {
    return <FeaturedCollectionHeader title={title} />;
  }

  return null;
}
