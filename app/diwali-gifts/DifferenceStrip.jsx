"use client";
import { Star, ShieldCheck, Gift, Truck } from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";

const FEATURES = [
  {
    icon: Star,
    title: "Thoughtfully Curated",
    text: "Handpicked with purpose",
  },
  { icon: ShieldCheck, title: "Premium Quality", text: "Products you'll love" },
  { icon: Gift, title: "Meaningful Gifting", text: "For every relationship" },
  { icon: Truck, title: "Pan India Delivery", text: "Spread joy, everywhere" },
];

export default function DifferenceStrip() {
  return (
    <section className="bg-[#6d0a28] font-odop text-white">
      <div className="flex flex-col items-center gap-9 px-5 py-10 sm:px-8 lg:flex-row lg:gap-12 lg:px-[5%]">
        <Reveal className="flex w-full items-center gap-5 lg:w-auto">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/60">
              The Yuukke difference
            </p>
            <h3
              className={`${serif.className} mt-2 text-3xl uppercase leading-tight sm:text-4xl`}
            >
              More than
              <br />
              just gifts.
            </h3>
          </div>
        </Reveal>

        <ul className="grid w-full flex-1 grid-cols-2 gap-y-8 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex flex-col items-center px-3 text-center lg:border-l lg:border-white/20"
            >
              <Icon className="mb-3 h-7 w-7 text-[#e8c88e]" strokeWidth={1.2} />
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1.5 text-[11px] font-light text-white/60 sm:text-xs">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
