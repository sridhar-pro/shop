"use client";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { IMAGES } from "./config";

const FALLBACK =
  "radial-gradient(circle at 70% 55%, #8a4a1a 0%, #3a0f1a 40%, #070b1e 80%)";

// supports both a URL string and a Next.js static import
const bannerSrc =
  typeof IMAGES.banner === "string" ? IMAGES.banner : IMAGES.banner?.src;

const MOMENTS = ["People", "Moments", "Traditions", "New beginnings"];

export default function GiftingBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070b1e] text-white">
      {/* background image: fills the section, subject kept on the right */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-no-repeat [background-position:75%_50%] lg:[background-position:center_right]"
        style={{
          backgroundImage: bannerSrc
            ? `url(${bannerSrc}), ${FALLBACK}`
            : FALLBACK,
        }}
      />

      {/* overlays: bottom-up on mobile, left-to-right on desktop */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#070b1e] via-[#070b1e]/75 to-[#070b1e]/20 lg:hidden" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#070b1e] via-[#070b1e]/80 via-40% to-transparent lg:block" />
      {/* soft vignette for depth */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(7,11,30,0.55)_100%)]" />

      {/* thin gold inset frame */}
      <div className="pointer-events-none absolute inset-3 border border-[#e8c88e]/20 sm:inset-4" />

      <div className="relative mx-auto flex min-h-[340px] items-end justify-between gap-10 px-8 py-12 sm:min-h-[380px] sm:px-12 lg:min-h-[420px] lg:items-center lg:px-[7%]">
        <Reveal className="max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-[#e8c88e]" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#e8c88e]">
              Gifting at Yuukke
            </p>
          </div>

          <h2
            className={`${serif.className} text-4xl uppercase leading-[1.05] sm:text-5xl lg:text-6xl`}
          >
            For the people
            <br />
            who make life
            <br />
            <span className="italic text-[#e8c88e]">brighter.</span>
          </h2>

          <p className="mt-4 max-w-sm text-[13px] font-light leading-relaxed text-white/75">
            Hampers, keepsakes and handcrafted finds, chosen to say what words
            sometimes can&apos;t.
          </p>

          <a
            href="https://gift.yuukke.com/#featured-products"
            className="group mt-7 inline-flex items-center gap-3 border border-white/60 bg-[#7b1230]/85 px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] backdrop-blur-sm transition hover:border-[#e8c88e] hover:bg-[#9a1a3d]"
          >
            Discover Gifting
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>

        {/* moments list */}
        <ul className="hidden shrink-0 space-y-4 border-l border-[#e8c88e]/40 pl-6 lg:block">
          {MOMENTS.map((m) => (
            <li
              key={m}
              className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/85"
            >
              <span className="h-1.5 w-1.5 rotate-45 bg-[#e8c88e]" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
