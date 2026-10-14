"use client";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import Reveal from "./Reveal";
import { serif } from "./fonts";
import { IMAGES, bg } from "./config";

const MOMENTS = [
  {
    title: "For Family",
    text: "Warm, meaningful gifts",
    img: IMAGES.family,
    href: "https://gift.yuukke.com/#featured-products",
    fallback: "linear-gradient(135deg, #7a1230 0%, #c9a063 100%)",
  },
  {
    title: "For Friends",
    text: "Celebrate your people",
    img: IMAGES.friends,
    href: "https://gift.yuukke.com/#featured-products",
    fallback: "linear-gradient(135deg, #5a1030 0%, #d9b98a 100%)",
  },
  {
    title: "For Home",
    text: "Beautiful spaces, brighter days",
    img: IMAGES.home,
    href: "https://gift.yuukke.com/#featured-products",
    fallback: "linear-gradient(135deg, #e8d9c4 0%, #b88a5a 100%)",
  },
  {
    title: "For Corporate",
    text: "Impressions that last",
    img: IMAGES.corporate,
    href: "https://gift.yuukke.com/#featured-products",
    fallback: "linear-gradient(135deg, #6d0f2b 0%, #b8102c 100%)",
  },
];

export default function ShopByMoment() {
  return (
    <section
      id="shop-by-moment"
      className="bg-[#f8efe4]  px-5 py-12 sm:px-8 lg:px-[5%]"
    >
      <div>
        <Reveal className="flex items-end justify-between">
          <div>
            <p className="mb-2 text-[9px] uppercase tracking-[0.25em] text-[#a8321e]">
              Gifts for every occasion
            </p>
            <h2
              className={`${serif.className} text-4xl uppercase text-[#1c1620] md:text-5xl`}
            >
              Shop by Moment
            </h2>
            <p className="mt-1 text-sm font-light text-[#5b4f53]">
              Thoughtful gifts for the moments that matter.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#a00300] sm:flex"
          >
            View all →
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {MOMENTS.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="group overflow-hidden border border-[#efe4d6] rounded-lg bg-white transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="h-36 overflow-hidden sm:h-48 lg:h-56">
                <div
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  style={bg(m.img, m.fallback)}
                />
              </div>

              <div className="flex min-h-[90px] items-end justify-between p-4 sm:min-h-[110px] sm:p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#1c1620] sm:text-sm">
                    {m.title}
                  </p>
                  <p className="mt-2 text-xs font-light text-[#5b4f53] sm:text-sm">
                    {m.text}
                  </p>
                </div>

                <ArrowUp className="mb-1 h-4 w-4 shrink-0 text-[#a00300] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
