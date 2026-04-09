"use client";
import { Sparkles, Flower2, Gift } from "lucide-react";

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

function PuthanduSaleHeader() {
  return (
    <div className="puthandu-root relative overflow-hidden px-0 py-2  mb-4">
      <div className="px-2 mb-4">
        <div className="relative w-full aspect-[520/600] md:h-auto md:aspect-[16/4] overflow-hidden rounded-2xl">
          {/* 📱 Mobile Image */}
          <img
            src="/puthandu-image.jpeg"
            alt="Puthandu Banner"
            className="block md:hidden w-full h-full object-cover rounded-2xl"
          />

          {/* 💻 Desktop Video */}
          <video
            src="/puthandu-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="hidden md:block w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* ✅ SCROLL INDICATOR (outside banner now) */}
        <div className="flex flex-col items-center mt-3 animate-bounce">
          <span className="text-[10px] tracking-[0.2em] text-[#b5460f]/70 uppercase">
            Scroll
          </span>

          <svg
            className="w-5 h-5 text-[#b5460f]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Kolam motif — background */}
      <div className="absolute inset-0 pointer-events-none animate-fade-in mt-80">
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 opacity-[0.12]"
          viewBox="0 0 300 300"
          fill="none"
        >
          <g stroke="#b5460f" strokeWidth="1.2" fill="none">
            <circle cx="150" cy="150" r="130" strokeDasharray="4 6" />
            <circle cx="150" cy="150" r="110" />
            <circle cx="150" cy="150" r="88" strokeDasharray="3 5" />
            <circle cx="150" cy="150" r="66" />
            <circle cx="150" cy="150" r="44" strokeDasharray="2 4" />
            <circle cx="150" cy="150" r="22" />

            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(0 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(45 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(90 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(135 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(180 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(225 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(270 150 150)"
            />
            <ellipse
              cx="150"
              cy="30"
              rx="14"
              ry="26"
              transform="rotate(315 150 150)"
            />

            <polygon points="150,60 162,140 150,240 138,140" opacity="0.6" />
            <polygon points="60,150 140,162 240,150 140,138" opacity="0.6" />
            <polygon points="90,90 152,138 210,210 148,162" opacity="0.4" />
            <polygon points="210,90 162,148 90,210 138,152" opacity="0.4" />

            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(0 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(45 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(90 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(135 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(180 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(225 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(270 150 150)"
            />
            <circle
              cx="150"
              cy="20"
              r="3"
              fill="#b5460f"
              transform="rotate(315 150 150)"
            />

            <circle cx="150" cy="150" r="8" fill="#c4520f" opacity="0.5" />
            <circle cx="150" cy="150" r="4" fill="#b5460f" />
          </g>
        </svg>

        {/* dot grid — bottom left */}
        <svg
          className="absolute left-0 bottom-0 w-32 h-24 opacity-[0.18]"
          viewBox="0 0 120 80"
          fill="none"
        >
          <g fill="#c4520f">
            <circle cx="10" cy="10" r="4" />
            <circle cx="30" cy="10" r="4" />
            <circle cx="50" cy="10" r="4" />
            <circle cx="10" cy="30" r="4" />
            <circle cx="30" cy="30" r="4" />
            <circle cx="50" cy="30" r="4" />
            <circle cx="70" cy="30" r="4" />
            <circle cx="10" cy="50" r="4" />
            <circle cx="30" cy="50" r="4" />
            <circle cx="50" cy="50" r="4" />
            <circle cx="70" cy="50" r="4" />
            <circle cx="90" cy="50" r="4" />
            <circle cx="30" cy="70" r="4" />
            <circle cx="50" cy="70" r="4" />
            <circle cx="70" cy="70" r="4" />
          </g>
        </svg>
      </div>

      {/* Label pill */}
      <div className="inline-flex items-center gap-3 mb-5 animate-rise-1 px-2">
        <span className="relative overflow-hidden text-[11px] font-medium tracking-[0.14em] uppercase text-[#b5460f] bg-gradient-to-br from-[#fde9d0] to-[#fbd5a0] border border-[#f4b860]/25 px-4 py-1.5 rounded-full">
          <span className="relative z-10">Puthandu Sale</span>

          {/* shimmer layer */}
          <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </span>

        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-[#e07b2a] opacity-40 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#e07b2a] opacity-70 animate-pulse delay-150" />
          <span className="w-1 h-1 rounded-full bg-[#e07b2a] opacity-40 animate-pulse delay-300" />
        </span>
      </div>

      {/* Title */}
      <h2 className="font-serif text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-tight text-[#1a0a00] mb-4 animate-rise-2 px-2">
        Celebrate Tamil New Year
        <br />
        with <em className="italic text-[#A00300]">Yuukke</em>
      </h2>

      {/* Ornamental rule */}
      <div className="flex items-center gap-3 mb-5 animate-expand-rule px-4">
        <div className="h-0.5 w-14 bg-gradient-to-r from-[#c4520f] via-[#e8a24a] to-[#c4520f] rounded" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#c4520f]" />
        <div className="h-0.5 w-28 bg-gradient-to-r from-[#c4520f] via-[#e8a24a] to-[#c4520f] rounded" />
        <div className="w-1.5 h-1.5 rotate-45 bg-[#c4520f]" />
        <div className="h-0.5 w-10 bg-gradient-to-r from-[#c4520f] via-[#e8a24a] to-[#c4520f] rounded" />
      </div>

      {/* Description */}
      <p className="text-[15px] font-light text-[#5a3a1a] leading-relaxed max-w-[480px] animate-rise-3 px-2">
        Discover our most popular products, loved by thousands of happy
        customers!
      </p>

      {/* Badges */}
      {/* <div className="flex flex-wrap gap-2.5 mt-6 animate-rise-4">
        {[
          { icon: Sparkles, label: "Festive Specials" },
          { icon: Flower2, label: "New Arrivals" },
          { icon: Gift, label: "Gift Sets" },
        ].map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs text-[#7a3800] bg-[#fff8ef] border border-[#e8a24a]/30"
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </span>
        ))}
      </div> */}
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
    return <PuthanduSaleHeader />;
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

  if (featuredPages.some(Boolean)) {
    return (
      <SectionHeader
        label="Featured Collection"
        title={title}
        description={featuredDescription}
      />
    );
  }

  return null;
}
