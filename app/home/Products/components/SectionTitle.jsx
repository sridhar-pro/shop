"use client";

import { useTranslation } from "react-i18next";

const sectionStatic = {
  arrival: "NA01--4c91bafe",
  gift: "CE01--2dd33e70",
  wellness: "WP01--9a33f1d2",
  return: "RG01--bc119f84",
  festival: "MS01--71e2a9cd",
  featured: "FE01--318f9ji",
  corporate: "CP01--3jhfdkjs",
  gettitle9: "G01--3f7a9c2d",
  gettitle10: "G02--8bd14e6f",
  gettitle11: "G03--c29fa781",
  gettitle12: "G04--6e5b3d90",
};

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function SectionTitle({ title, sectionKey }) {
  const { t } = useTranslation();

  const slug = slugify(title);
  const staticTail = sectionStatic[sectionKey];
  const btnLink = `/products/events/${slug}/${staticTail}`;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative mb-20 flex flex-col items-center">
        {/* Title container */}
        <div className="relative w-full text-center font-odop px-6 md:px-12 lg:px-20">
          {/* Background ghost text */}
          <h3 className="select-none pointer-events-none relative text-[18vw] md:text-[8vw] leading-none font-semibold uppercase text-[#A00300]/8 blur-[1px]">
            {t(title).split(" ")[0]}
          </h3>

          {/* Foreground main title */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <h2 className="text-[26px]  lg:text-[42px] font-semibold text-[#A00300] uppercase leading-relaxed tracking-normal">
              {t(title)}
            </h2>
          </div>
        </div>

        {/* View All link */}
        <a
          href={btnLink}
          title="Browse All Products"
          className="group relative mt-3 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#000d45]"
        >
          <span className="relative">
            {t("View All Products")}
            <span className="absolute left-0 -bottom-1 h-[1px] w-full bg-[#000d45] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
          </span>
          <span className="inline-block text-[14px]">→</span>
        </a>
      </div>
    </div>
  );
}
