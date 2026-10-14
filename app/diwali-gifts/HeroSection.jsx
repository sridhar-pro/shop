"use client";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { IMAGES, bg, scrollToId } from "./config";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#070b1e] text-white">
      {/* photo (right side) + fallback glow */}
      <div
        className="absolute inset-0"
        style={bg(
          IMAGES.hero,
          "radial-gradient(circle at 78% 55%, #7a2a1a 0%, #3a0f1a 35%, #070b1e 75%)",
        )}
      />
      {/* dark fade from the left so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b1e] via-[#070b1e]/85 to-transparent md:via-[#070b1e]/60 md:to-transparent" />

      {/* right vertical menu */}
      <ul className="absolute right-4 top-6 hidden border-l border-white/30 pl-3 text-[9px] uppercase leading-[1.9] tracking-[0.2em] text-white/80 md:block lg:right-8">
        <li>Gifts</li>
        <li>Home</li>
        <li>Lifestyle</li>
        <li>Wellness</li>
        <li>and more</li>
      </ul>

      <div className="relative flex min-h-[440px] flex-col justify-between px-5 py-8 sm:px-8 md:min-h-[540px] lg:px-[5%]">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
          Yuukke / Diwali 2026
        </p>

        <Reveal className="my-8 max-w-xl">
          <h1
            className={`${serif.className} text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl md:text-7xl`}
          >
            Light up
            <br />
            <span className="italic text-[#e8c88e]">Every moment</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-white/90 md:text-[15px]">
            Celebrate Diwali with thoughtful gifts, unforgettable moments and
            beautifully chosen products.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToId("festive-decor")}
              className="flex items-center gap-2 border border-[#7b1230] bg-[#7b1230] px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] transition hover:bg-[#9a1a3d]"
            >
              Shop Diwali <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => scrollToId("diwali-edit")}
              className="border border-white/70 px-6 py-3 text-[10px] font-medium uppercase tracking-[0.18em] transition hover:bg-white hover:text-[#070b1e]"
            >
              Explore Collection
            </button>
          </div>
        </Reveal>

        <button
          onClick={() => scrollToId("intro")}
          className="flex w-fit items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-white/70 transition hover:text-white"
        >
          <span className="flex h-8 flex-col items-center">
            <span className="h-full w-px bg-white/60" />
            <span className="-mt-1 h-1.5 w-1.5 rotate-45 border-b border-r border-white/60" />
          </span>
          Scroll to discover
        </button>
      </div>
    </section>
  );
}
