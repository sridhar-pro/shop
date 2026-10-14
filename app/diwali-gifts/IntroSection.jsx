"use client";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { IMAGES, bg, scrollToId } from "./config";

/* Henna-style mandala, centred on the bottom-right corner and cropped by it */
function Mandala() {
  const ring = (count, r, len, width, delay = 0) =>
    Array.from({ length: count }).map((_, i) => (
      <path
        key={`${r}-${i}`}
        transform={`rotate(${(360 / count) * i + delay})`}
        d={`M0 ${-r} C ${width} ${-r - len * 0.35}, ${width} ${-r - len * 0.75}, 0 ${-r - len} C ${-width} ${-r - len * 0.75}, ${-width} ${-r - len * 0.35}, 0 ${-r}`}
      />
    ));

  return (
    <svg
      aria-hidden
      viewBox="-100 -100 200 200"
      className="pointer-events-none absolute -bottom-16 -right-16 hidden h-56 w-56 text-[#e6c9b4] md:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
    >
      <circle r="10" />
      <circle r="16" />
      {ring(12, 16, 22, 7)}
      <circle r="42" />
      {ring(18, 42, 26, 8, 10)}
      <circle r="72" />
      {ring(24, 72, 20, 6)}
      <circle r="94" strokeDasharray="1 3" />
    </svg>
  );
}

export default function IntroSection() {
  return (
    <section
      id="intro"
      className="relative overflow-hidden bg-[#f8efe4] pt-4 pb-4"
    >
      <div className="grid items-center gap-6 md:grid-cols-[1fr_1.7fr_1.1fr]">
        {/* arch photo with layered back arch */}
        <div className="relative h-56 md:h-full md:min-h-[205px]">
          {/* lighter back arch peeking out bottom-right */}
          <div className="absolute -right-7 bottom-0 top-[45%] left-[60%] hidden rounded-tr-[70px] bg-[#ecdcc8] md:block" />

          {/* main photo arch */}
          <div
            className="absolute inset-0 rounded-tr-[90px] md:rounded-tr-[110px]"
            style={bg(
              IMAGES.intro,
              "linear-gradient(135deg, #e9c9a8 0%, #c79b74 50%, #8a5a3a 100%)",
            )}
          />
        </div>

        {/* headline */}
        <Reveal className="px-5 py-2 md:px-0 md:py-10 ml-4">
          <p className="mb-3 text-[9px] uppercase tracking-[0.25em] text-[#6d0f2b]">
            A more meaningful Diwali
          </p>
          <h2
            className={`${serif.className} text-4xl uppercase leading-[1.02] text-[#1c1620] sm:text-5xl lg:text-6xl`}
          >
            This Diwali,
            <br />
            give a little
            <br />
            <span className="italic text-[#6d0f2b]">more meaning.</span>
          </h2>
        </Reveal>

        {/* paragraph + ornaments */}
        <div className="relative px-5 pb-10 md:px-0 md:py-10 md:pr-10">
          {/* top-right diamond + line */}
          <svg
            className="absolute right-5 top-0 hidden h-24 w-5 text-[#8b2c3a] md:block"
            viewBox="0 0 20 96"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M10 2 L18 12 L10 22 L2 12 Z" />
            <path d="M10 22 V96" />
          </svg>

          <p className="max-w-[260px] text-[12.5px] md:text-[14px] font-light leading-relaxed text-[#3a2f33]">
            At Yuukke, we believe in gifts that go beyond the expected. Our
            Diwali collection brings together beautiful products, meaningful
            hampers and thoughtful choices to help you celebrate the people who
            make your world brighter.
          </p>

          <button
            onClick={() => scrollToId("diwali-edit")}
            className="relative z-10 mt-6 flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] text-[#3a2f33]"
          >
            <span className="relative flex h-8 w-2 justify-center">
              <span className="h-full w-px bg-[#3a2f33]" />
              <span className="absolute bottom-0 h-1.5 w-1.5 rotate-45 border-b border-r border-[#3a2f33]" />
            </span>
            Scroll to discover
          </button>
        </div>
      </div>

      {/* bottom-right corner mandala */}
      <Mandala />
    </section>
  );
}
