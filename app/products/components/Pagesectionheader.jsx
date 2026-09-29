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

function MandalaSVG({ className = "" }) {
  const C = 200; // cx/cy — origin at top-left corner
  const col = "#C89A3C";

  // Generate spoke lines (fine radiating lines)
  const spokes = Array.from({ length: 36 }, (_, i) => {
    const angle = (i * 10 * Math.PI) / 180;
    return {
      x2: C + Math.cos(angle) * 190,
      y2: C + Math.sin(angle) * 190,
    };
  });

  // Petal arcs at different radii
  const petalRings = [
    { r: 55, count: 12, rInner: 38, w: 22 },
    { r: 88, count: 16, rInner: 70, w: 18 },
    { r: 130, count: 20, rInner: 108, w: 22 },
  ];

  function petalPath(cx, cy, angle, rOuter, rInner, halfSpread) {
    const a1 = angle - halfSpread;
    const a2 = angle + halfSpread;
    const ox1 = cx + Math.cos(a1) * rOuter;
    const oy1 = cy + Math.sin(a1) * rOuter;
    const ox2 = cx + Math.cos(a2) * rOuter;
    const oy2 = cy + Math.sin(a2) * rOuter;
    const ix1 = cx + Math.cos(a1) * rInner;
    const iy1 = cy + Math.sin(a1) * rInner;
    const ix2 = cx + Math.cos(a2) * rInner;
    const iy2 = cy + Math.sin(a2) * rInner;
    const peakX = cx + Math.cos(angle) * (rOuter + 10);
    const peakY = cy + Math.sin(angle) * (rOuter + 10);
    return `M${ix1},${iy1} L${ox1},${oy1} Q${peakX},${peakY} ${ox2},${oy2} L${ix2},${iy2} Z`;
  }

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g opacity="0.7">
        {/* Fine spoke lines from corner origin */}
        {spokes.map((s, i) => (
          <line
            key={i}
            x1={0}
            y1={0}
            x2={s.x2}
            y2={s.y2}
            stroke={col}
            strokeWidth="0.35"
            opacity="0.25"
          />
        ))}

        {/* Concentric circle rings */}
        {[30, 55, 80, 108, 135, 158, 178].map((r, i) => (
          <circle
            key={r}
            cx={0}
            cy={0}
            r={r}
            stroke={col}
            strokeWidth={i === 3 ? "0.9" : "0.45"}
            strokeDasharray={i % 2 === 1 ? "2.5 3" : "none"}
            opacity={i === 3 ? 0.55 : 0.3}
            fill="none"
          />
        ))}

        {/* Petal ring 1 — innermost */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 55, 38, 0.2)}
              fill={col}
              fillOpacity="0.12"
              stroke={col}
              strokeWidth="0.5"
              opacity="0.7"
            />
          );
        })}

        {/* Petal ring 2 */}
        {Array.from({ length: 16 }, (_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 92, 72, 0.16)}
              fill={col}
              fillOpacity="0.09"
              stroke={col}
              strokeWidth="0.45"
              opacity="0.65"
            />
          );
        })}

        {/* Petal ring 3 — outer */}
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i * 18 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, angle, 138, 112, 0.13)}
              fill={col}
              fillOpacity="0.07"
              stroke={col}
              strokeWidth="0.4"
              opacity="0.55"
            />
          );
        })}

        {/* Dot ring at r=108 */}
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i * 11.25 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 108}
              cy={Math.sin(a) * 108}
              r="1.4"
              fill={col}
              opacity="0.4"
            />
          );
        })}

        {/* Dot ring at r=55 */}
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i * 18 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={Math.cos(a) * 55}
              cy={Math.sin(a) * 55}
              r="1"
              fill={col}
              opacity="0.35"
            />
          );
        })}

        {/* Centre star / rose */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          return (
            <path
              key={i}
              d={petalPath(0, 0, a, 22, 8, 0.28)}
              fill={col}
              fillOpacity="0.3"
              stroke={col}
              strokeWidth="0.5"
            />
          );
        })}

        {/* Teardrop hanging drops (lower portion of reference) */}
        {[0, 15, -15, 30, -30].map((deg, i) => {
          const a = ((90 + deg) * Math.PI) / 180;
          const r1 = 155 + i * 3;
          const r2 = 172 + i * 2;
          const mx = Math.cos(a) * r1;
          const my = Math.sin(a) * r1;
          const ex = Math.cos(a) * r2;
          const ey = Math.sin(a) * r2;
          return (
            <g key={i} opacity="0.45">
              <line
                x1={mx}
                y1={my}
                x2={ex}
                y2={ey}
                stroke={col}
                strokeWidth="0.6"
              />
              <circle
                cx={ex}
                cy={ey}
                r="2.5"
                fill={col}
                fillOpacity="0.35"
                stroke={col}
                strokeWidth="0.4"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ─── Decorative SVG — Botanical leaves (top-right / bottom-left) ─────────────
// Mirrors reference image 2: large multi-lobed leaves with vein detail,
// scattered smaller leaves floating away.

function BotanicalSVG({ className = "", flip = false }) {
  const col = "#C89A3C";

  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scale(-1,1)" } : undefined}
      aria-hidden="true"
    >
      <g opacity="0.65" stroke={col} fill="none">
        {/* ── Main large leaf cluster — top-left origin ── */}

        {/* Leaf 1 — tallest centre leaf */}
        <path
          d="M10 10 C 30 -10, 80 20, 95 80 C 80 60, 50 30, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        {/* veins leaf 1 */}
        <path
          d="M10 10 C 40 35, 70 55, 95 80"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M35 22 C 50 42, 65 55, 78 72"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M55 30 C 65 48, 72 60, 82 74"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 2 — splays right */}
        <path
          d="M10 10 C 60 0, 120 30, 140 75 C 110 55, 65 20, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        <path
          d="M10 10 C 60 25, 105 45, 140 75"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M40 12 C 80 28, 110 48, 132 70"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M70 16 C 98 30, 120 50, 134 72"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 3 — splays further right, lower */}
        <path
          d="M10 10 C 70 15, 145 60, 155 120 C 120 90, 65 40, 10 10Z"
          fill={col}
          fillOpacity="0.08"
          strokeWidth="0.6"
        />
        <path
          d="M10 10 C 70 40, 120 75, 155 120"
          strokeWidth="0.35"
          opacity="0.4"
        />
        <path
          d="M50 18 C 95 55, 128 82, 148 115"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 4 — splays down */}
        <path
          d="M10 10 C 20 60, 50 120, 40 175 C 25 130, 5 70, 10 10Z"
          fill={col}
          fillOpacity="0.1"
          strokeWidth="0.7"
        />
        <path
          d="M10 10 C 22 65, 38 115, 40 175"
          strokeWidth="0.4"
          opacity="0.5"
        />
        <path
          d="M8 35 C 18 78, 32 118, 37 168"
          strokeWidth="0.3"
          opacity="0.4"
        />
        <path
          d="M6 60 C 14 95, 28 128, 35 162"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Leaf 5 — between down and right */}
        <path
          d="M10 10 C 50 40, 100 90, 105 150 C 75 110, 35 60, 10 10Z"
          fill={col}
          fillOpacity="0.09"
          strokeWidth="0.6"
        />
        <path
          d="M10 10 C 50 50, 88 95, 105 150"
          strokeWidth="0.35"
          opacity="0.4"
        />
        <path
          d="M25 22 C 60 60, 90 100, 100 144"
          strokeWidth="0.3"
          opacity="0.35"
        />

        {/* Pointed tip extensions */}
        <path
          d="M95 80 C 100 88, 103 100, 98 108"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M140 75 C 148 82, 155 92, 150 102"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M40 175 C 38 184, 33 192, 28 196"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Tiny leaf D — isolated floater */}
        <path
          d="M195 155 C 204 148, 215 152, 217 163 C 210 158, 200 156, 195 155Z"
          fill={col}
          fillOpacity="0.08"
          strokeWidth="0.45"
        />
        <path
          d="M195 155 C 204 156, 212 159, 217 163"
          strokeWidth="0.22"
          opacity="0.3"
        />

        {/* Bud dots */}
        <circle
          cx="97"
          cy="108"
          r="2.2"
          fill={col}
          fillOpacity="0.3"
          stroke="none"
        />
        <circle
          cx="152"
          cy="102"
          r="1.8"
          fill={col}
          fillOpacity="0.28"
          stroke="none"
        />
        <circle
          cx="29"
          cy="196"
          r="2"
          fill={col}
          fillOpacity="0.28"
          stroke="none"
        />
        <circle
          cx="172"
          cy="176"
          r="1.5"
          fill={col}
          fillOpacity="0.22"
          stroke="none"
        />
        <circle
          cx="185"
          cy="209"
          r="1.3"
          fill={col}
          fillOpacity="0.2"
          stroke="none"
        />
        <circle
          cx="218"
          cy="164"
          r="1.2"
          fill={col}
          fillOpacity="0.18"
          stroke="none"
        />
      </g>
    </svg>
  );
}

/**
 * Hero for /products/offers — the page FestivalShowcase's "View all
 * products" button lands on. Deliberately shares its color tokens
 * (#2B0A1F ink, #7A0000 maroon, #C89A3C gold, #FBF1DE cream) and ambient
 * glow treatment with FestivalShowcase, so arriving here reads as a
 * continuation of that section rather than a different page.
 *
 * `productCount` is optional and only renders the stat card when a real
 * number is passed in from the offers page's own fetch — no placeholder
 * count is invented when it's missing.
 */
function FestivalOffersHero({ productCount }) {
  return (
    <section className="relative overflow-hidden pt-4 md:pt-10 pb-6 px-4 sm:px-5 md:px-10 bg-[#FBF1DE]">
      {/* ── Edge blending — fades all four sides into surrounding white ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-20" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent z-20" />

      {/* ── Corner decorations (mirrors FestivalShowcase) ── */}

      {/* Top-left: Mandala */}
      <MandalaSVG className="pointer-events-none absolute -top-2 -left-2 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[300px] md:h-[300px]" />

      {/* Top-right: Botanical leaves flipped */}
      <BotanicalSVG
        className="pointer-events-none absolute -top-2 -right-2 w-[170px] h-[170px] sm:w-[210px] sm:h-[210px] md:w-[250px] md:h-[250px]"
        flip
      />

      {/* Bottom-right: Botanical leaves rotated */}
      <BotanicalSVG className="pointer-events-none absolute -bottom-2 -right-2 w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px] rotate-180" />

      {/* Bottom-left: Mandala rotated, reduced opacity */}
      <MandalaSVG className="pointer-events-none absolute -bottom-2 -left-2 w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rotate-180 opacity-50" />

      {/* Ambient glow — warm centre wash */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-48 rounded-full bg-[#C89A3C]/8 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -left-20 w-96 h-96 rounded-full bg-[#C89A3C]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-0 w-[26rem] h-[26rem] rounded-full bg-[#7A0000]/10 blur-3xl" />

      <style>{`
        @keyframes fd-rise { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fd-shimmer { from{transform:translateX(-120%)} to{transform:translateX(220%)} }
        @keyframes fd-pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.6);opacity:0} }
        @keyframes fd-line-in { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fd-count-in { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }

        .fd-a1 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .05s both }
        .fd-a2 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .18s both }
        .fd-a3 { animation: fd-rise .65s cubic-bezier(.22,1,.36,1) .30s both }
        .fd-stat { animation: fd-count-in .6s cubic-bezier(.22,1,.36,1) .35s both }

        .fd-badge::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.55) 50%, transparent 100%);
          transform: translateX(-120%);
          animation: fd-shimmer 3s infinite 1.2s;
        }
        .fd-live-dot::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #7A0000;
          animation: fd-pulse-ring 1.6s ease-out infinite;
        }
        .fd-accent-line {
          transform-origin: left;
          animation: fd-line-in .5s cubic-bezier(.22,1,.36,1) .35s both;
        }
        .fd-ring::after {
          content: ''; position: absolute; inset: 0; border-radius: 9999px;
          border: 1px solid rgba(200,154,60,.4);
          animation: fd-pulse-ring 2.4s ease-out infinite;
        }
      `}</style>

      <div className="relative z-10 max-w-[1440px] mx-auto w-full grid grid-cols-1 md:grid-cols-[1fr_220px] items-center gap-8">
        {/* ── Left: Copy ── */}
        <div className="min-w-0">
          {/* Breadcrumb */}
          <nav className="fd-a1 flex items-center gap-2 text-[13px] text-[#2B0A1F]/50 mb-3">
            <Link href="/" className="hover:text-[#7A0000] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#7A0000] font-medium">Festival offers</span>
          </nav>

          {/* Badge */}
          <div
            className="fd-badge fd-a1 inline-flex items-center gap-[7px] text-[11px] font-semibold tracking-[.13em] uppercase px-[13px] pl-[9px] py-[5px] rounded-full relative overflow-hidden"
            style={{
              background: "rgba(122,0,0,.08)",
              border: "1px solid rgba(122,0,0,.2)",
              color: "#7A0000",
            }}
          >
            <span
              className="fd-live-dot w-[7px] h-[7px] rounded-full flex-shrink-0 relative"
              style={{ background: "#7A0000" }}
            />
            All festival offers
          </div>

          {/* Headline */}
          <div className="fd-a2 mt-[18px]">
            <h1
              className="font-serif font-black leading-[1.06] tracking-[-0.028em] m-0"
              style={{
                fontSize: "clamp(1.9rem, 4.8vw, 3.1rem)",
                color: "#2B0A1F",
              }}
            >
              Your Festive Essentials
            </h1>

            <div className="flex items-center gap-[10px] mt-3 flex-wrap">
              <span
                className="text-[13px]"
                style={{ color: "rgba(43,10,31,.3)" }}
              >
                —
              </span>
              <span
                className="inline-flex items-baseline gap-[3px] text-[13px] font-semibold tracking-[.01em] rounded-[6px] px-2 py-[2px]"
                style={{ color: "#7A0000", background: "rgba(122,0,0,.07)" }}
              >
                Handcrafted for every celebration.
              </span>
              <span
                className="text-[13px]"
                style={{ color: "rgba(43,10,31,.3)" }}
              >
                ·
              </span>
            </div>
          </div>

          {/* Accent rule */}
          <div className="fd-a3 mt-4">
            <div
              className="fd-accent-line h-[2px] w-12 rounded-sm"
              style={{ background: "#C89A3C" }}
            />
          </div>
        </div>

        {/* ── Right: live count ── */}
        {typeof productCount === "number" && productCount > 0 && (
          <div className="fd-stat relative hidden md:flex items-center justify-center">
            <div
              className="fd-ring absolute w-32 h-32 rounded-full"
              aria-hidden="true"
            />
            <div
              className="relative flex flex-col items-center justify-center w-28 h-28 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #7A0000, #2B0A1F)",
                boxShadow: "0 20px 40px rgba(122,0,0,.25)",
              }}
            >
              <Sparkle className="w-4 h-4 mb-1" style={{ color: "#C89A3C" }} />
              <span
                className="text-2xl font-bold leading-none"
                style={{ color: "#FBF1DE" }}
              >
                {productCount}
              </span>
              <span
                className="text-[10px] font-medium mt-1 tracking-wide"
                style={{ color: "rgba(251,241,222,.7)" }}
              >
                live offers
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bridge rule into product grid */}
      <div className="relative z-10 max-w-[1440px] mx-auto mt-10 h-px bg-gradient-to-r from-transparent via-[#2B0A1F]/15 to-transparent" />
    </section>
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

function OdopHeader() {
  return (
    <div className="w-full mb-4">
      <div
        className="relative overflow-hidden rounded-2xl border px-9 pt-9 pb-8"
        style={{ background: "#fdf8f2", borderColor: "#e8d5c0" }}
      >
        {/* Background district stamp watermark */}
        <svg
          className="absolute right-[-24px] top-1/2 -translate-y-1/2 pointer-events-none"
          width="260"
          height="260"
          viewBox="0 0 260 260"
          fill="none"
          style={{ opacity: 0.055 }}
          aria-hidden="true"
        >
          <circle
            cx="130"
            cy="130"
            r="118"
            stroke="#c94b2b"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <circle cx="130" cy="130" r="96" stroke="#f5a623" strokeWidth="1" />
          <circle cx="130" cy="130" r="72" stroke="#c94b2b" strokeWidth="0.8" />
          <text
            x="130"
            y="118"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="48"
            fontWeight="700"
            fill="#c94b2b"
          >
            1D
          </text>
          <text
            x="130"
            y="148"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="18"
            fill="#c94b2b"
            letterSpacing="8"
          >
            1P
          </text>
          <text
            x="130"
            y="175"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontSize="8"
            fill="#c94b2b"
            letterSpacing="5"
          >
            ODOP
          </text>
          <line
            x1="60"
            y1="192"
            x2="200"
            y2="192"
            stroke="#f5a623"
            strokeWidth="0.8"
          />
          <polygon points="130,204 133,198 127,198" fill="#c94b2b" />
        </svg>

        {/* Eyebrow pills */}
        <div className="flex items-center gap-2.5 mb-5 animate-rise-1">
          <span
            className="text-[10px] font-medium tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "#fff0d6",
              color: "#a05c00",
              border: "0.5px solid #f5c060",
            }}
          >
            One District · One Product
          </span>
          <div
            className="w-[3px] h-[3px] rounded-full flex-shrink-0"
            style={{ background: "#c94b2b" }}
          />
          <span
            className="text-[10px] font-medium tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
            style={{
              background: "#fde8e4",
              color: "#8c2c18",
              border: "0.5px solid #e8a090",
            }}
          >
            Limited Deals
          </span>
        </div>

        {/* Title block */}
        <div className="mb-[18px] animate-rise-2">
          <p
            className="text-[11px] tracking-[0.14em] uppercase mb-1.5"
            style={{ color: "#8c5a30" }}
          >
            Handpicked from India's heartland
          </p>
          <h2
            className="font-serif text-[clamp(2.2rem,5.5vw,3.4rem)] font-bold leading-none flex flex-wrap items-baseline gap-x-2.5"
            style={{ color: "#1a0f00" }}
          >
            <span>Authentic</span>
            <em
              className="italic font-normal relative"
              style={{ color: "#c94b2b" }}
            >
              craft,
            </em>
            <br />
            <span>honest prices.</span>
          </h2>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-1.5 mb-[18px] origin-left animate-expand-rule">
          <div className="h-px w-7" style={{ background: "#e8c9a0" }} />
          <div
            className="w-[5px] h-[5px] rotate-45 flex-shrink-0"
            style={{ background: "#f5a623" }}
          />
          <div
            className="w-[7px] h-[7px] rotate-45 flex-shrink-0"
            style={{ background: "#c94b2b" }}
          />
          <div
            className="w-[5px] h-[5px] rotate-45 flex-shrink-0"
            style={{ background: "#f5a623" }}
          />
          <div className="h-px w-[52px]" style={{ background: "#e8c9a0" }} />
          <div
            className="w-[5px] h-[5px] rotate-45 flex-shrink-0"
            style={{ background: "#f5a623" }}
          />
          <div
            className="w-[7px] h-[7px] rotate-45 flex-shrink-0"
            style={{ background: "#c94b2b" }}
          />
          <div
            className="w-[5px] h-[5px] rotate-45 flex-shrink-0"
            style={{ background: "#f5a623" }}
          />
          <div className="h-px w-5" style={{ background: "#e8c9a0" }} />
        </div>

        {/* Description */}
        <p
          className="text-[14px] font-light leading-[1.9] max-w-[380px] mb-6 animate-rise-3"
          style={{ color: "#4a2a10" }}
        >
          Every product here traces back to a single district — made by artisans
          whose craft has been passed down for generations. Shop directly,
          support communities, and get genuine regional goods at their best
          value.
        </p>

        {/* Craft tags */}
        <div className="flex flex-wrap gap-2 mb-6 animate-rise-3">
          {[
            "Madhubani Paintings",
            "Banarasi Silk",
            "Pashmina Weaves",
            "Bidriware",
            "Channapatna Toys",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[11px] tracking-[0.06em] px-2.5 py-1 rounded"
              style={{
                background: "#fff5e8",
                color: "#7a4a20",
                border: "0.5px solid #e8c080",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
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
  isOdopPage,
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

  if (isOdopPage) {
    return <OdopHeader />;
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
    return <FestivalOffersHero />;
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
      const decoded = title.replace(/['']/g, "'");
      return decoded.replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
      <div className="w-full mb-4">
        <style>{`
        @keyframes fch-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fch-line { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fch-fade { from{opacity:0} to{opacity:1} }

        .fch-a1 { animation: fch-rise .55s cubic-bezier(.22,1,.36,1) .05s both }
        .fch-a2 { animation: fch-rise .6s  cubic-bezier(.22,1,.36,1) .15s both }
        .fch-a3 { animation: fch-rise .6s  cubic-bezier(.22,1,.36,1) .25s both }
        .fch-line { transform-origin:left; animation: fch-line .5s cubic-bezier(.22,1,.36,1) .3s both }
        .fch-geo  { animation: fch-fade .8s ease .1s both }
      `}</style>

        <div className="relative overflow-hidden px-4 pt-3 pb-0">
          {/* Geometric background — large offset circle, minimal opacity */}
          <svg
            className="fch-geo absolute right-0 top-0 h-full w-56 pointer-events-none select-none"
            viewBox="0 0 224 220"
            fill="none"
            preserveAspectRatio="xMaxYMid meet"
            aria-hidden="true"
          >
            {/* Single large arc — restrained, intentional */}
            <circle
              cx="180"
              cy="60"
              r="110"
              stroke="#A00300"
              strokeWidth="0.6"
              opacity="0.08"
            />
            {/* Tight inner ring */}
            <circle
              cx="180"
              cy="60"
              r="58"
              stroke="#c97d00"
              strokeWidth="0.5"
              opacity="0.1"
            />
            {/* Single slash line for tension */}
            <line
              x1="110"
              y1="180"
              x2="224"
              y2="30"
              stroke="#A00300"
              strokeWidth="0.5"
              opacity="0.07"
            />
          </svg>

          {/* ── Label row ── */}
          <div className="fch-a1 flex items-center gap-2 mb-5">
            <span
              className="inline-flex items-center gap-[6px] text-[10px] font-semibold tracking-[.18em] uppercase px-[10px] py-[4px] rounded-full"
              style={{
                color: "#A00300",
                background: "rgba(160,3,0,.07)",
                border: "0.5px solid rgba(160,3,0,.2)",
              }}
            >
              <span
                className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                style={{ background: "#A00300" }}
              />
              Featured collection
            </span>
            <span
              className="text-[10px] font-medium tracking-[.1em] uppercase"
              style={{ color: "#c97d00" }}
            >
              Yuukke picks
            </span>
          </div>

          {/* ── Title ── */}
          <div className="fch-a2 mb-4">
            <h2
              className="font-serif font-semibold leading-[1.04] tracking-[-0.025em] m-0"
              style={{
                fontSize: "clamp(2.2rem, 5.5vw, 3.4rem)",
                color: "#140200",
              }}
            >
              {formatTitle(title)}
            </h2>
          </div>

          {/* ── Gold rule — single clean line, not diamond ornaments ── */}
          <div className="fch-line mb-5 flex items-center gap-3">
            <div
              className="h-[1.5px] w-10 rounded-sm"
              style={{ background: "#A00300" }}
            />
            <div
              className="h-[1.5px] w-16 rounded-sm"
              style={{ background: "#c97d00", opacity: 0.5 }}
            />
            <div
              className="h-[1.5px] flex-1 rounded-sm"
              style={{ background: "rgba(232,205,176,0.6)" }}
            />
          </div>

          {/* ── Description ── */}
          <p
            className="fch-a3 text-[14px] font-light leading-[1.85] m-0 mb-6"
            style={{ color: "#5c2a00", maxWidth: "38ch" }}
          >
            Our most loved products — handpicked by the Yuukke team for quality,
            craft, and celebration.
          </p>

          {/* ── Bottom bridge ── */}
          <div
            className="mt-2 h-px"
            style={{
              background:
                "linear-gradient(to right, rgba(160,3,0,.2), rgba(201,125,0,.1), transparent)",
            }}
          />
        </div>
      </div>
    );
  }

  if (featuredPages.some(Boolean)) {
    return <FeaturedCollectionHeader title={title} />;
  }

  return null;
}
