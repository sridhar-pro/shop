import { useRouter } from "next/navigation";
import NoProductImage from "@/public/no-product-page.png";

export default function EmptyState() {
  const router = useRouter();

  return (
    <>
      {/* Animations (keep this, Tailwind won't handle custom keyframes directly) */}
      <style>{`
        @keyframes es-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex flex-col items-center px-0 py-0 font-sans animate-[es-fade-up_0.5s_ease_both]">
        {/* Illustration */}
        <div className="w-[300px] h-[240px] mb-3 flex items-center justify-center shrink-0">
          <img
            src={NoProductImage.src ?? NoProductImage}
            alt="No results found"
            title="No results found"
            className="w-full h-full object-cover select-none pointer-events-none animate-[es-fade-up_0.6s_ease_both]"
          />
        </div>

        {/* Headline */}
        <h2 className="font-serif text-[clamp(28px,5vw,34px)] font-normal text-[#1a1a18] text-center leading-tight mb-2 animate-[es-fade-up_0.6s_0.05s_ease_both]">
          We’re still <span className="text-[#A00300] italic">finding</span> the
          perfect match.
        </h2>

        {/* Sub text */}
        <p className="text-sm text-[#888780] text-center max-w-[360px] leading-[1.7] mb-8 animate-[es-fade-up_0.6s_0.1s_ease_both]">
          Nothing here right now, but plenty worth exploring. Try broader
          filters or check out what’s trending below.
        </p>
        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-[480px] mb-6 animate-[es-fade-up_0.6s_0.18s_ease_both]">
          <div className="flex-1 h-[1px] bg-[#ece9e4]" />
          <span className="text-[11px] uppercase tracking-[0.12em] text-[#c0bdb8] font-medium whitespace-nowrap">
            or explore featured below
          </span>
          <div className="flex-1 h-[1px] bg-[#ece9e4]" />
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/products/offers")}
          className="inline-flex items-center gap-2 px-6 py-[11px] rounded-[9px] border-[1.5px] border-[#A00300] bg-[#A00300] text-white text-sm font-medium tracking-[0.01em] transition-all duration-200 hover:bg-[#860200] hover:border-[#860200] hover:-translate-y-[1px] animate-[es-fade-up_0.6s_0.24s_ease_both]"
        >
          Browse Offers
        </button>
      </div>
    </>
  );
}
