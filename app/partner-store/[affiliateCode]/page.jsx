import AffiliateStore from "./AffiliateStore";
import Link from "next/link";

async function getAffiliateStore(code) {
  try {
    const res = await fetch(
      `https://yuukkev1.betalearnings.com/admin/api/affiliate-store/${code}`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function Page({ params }) {
  const { affiliateCode } = await params;

  const data = await getAffiliateStore(affiliateCode);

  if (!data || !data.products) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6 selection:bg-black selection:text-white">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-gray-300 mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold text-black tracking-tight mb-4">
            Store Unavailable
          </h1>

          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            We couldn't locate the showcase for code{" "}
            <span className="font-mono text-black font-semibold bg-gray-100 px-2 py-1 rounded-md">
              "{affiliateCode}"
            </span>
            . The link may have expired or is incorrect.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-transform active:scale-95"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <AffiliateStore affiliate={data} />;
}
