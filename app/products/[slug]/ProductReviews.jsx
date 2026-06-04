"use client";
import { useState } from "react";

export default function ProductReviews({
  product,
  reviews,
  reviewsRef,
  summaryTags,
}) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!reviews.length) return null;

  return (
    <div
      ref={reviewsRef}
      id="customer-reviews"
      className="mt-10 scroll-mt-28 font-odop"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Rating Summary */}
        <div className="md:col-span-4">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-900">
                {Number(product.review).toFixed(1)}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      Number(product.review) >= star
                        ? "text-[#f5b50a]"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {reviews.length} global ratings
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const total = reviews.length;
              const count = reviews.filter(
                (r) => Math.round(Number(r.product_rating)) === star,
              ).length;
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-12 text-sm text-gray-700">
                    {star} star
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 rounded">
                    <div
                      className="h-3 bg-[#f5b50a] rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-sm text-gray-600">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-8">
          <div className="space-y-6">
            {/* AI Summary Tags */}
            {summaryTags.length > 0 && (
              <>
                <style>{`
                  @keyframes stTagIn {
                    from { opacity: 0; transform: translateY(14px) scale(0.9); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  @keyframes stHeaderIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to   { opacity: 1; transform: translateX(0); }
                  }
                  @keyframes stPulse {
                    0%, 100% { box-shadow: 0 0 0 0px rgba(127,119,221,0.35); }
                    50%       { box-shadow: 0 0 0 6px rgba(127,119,221,0); }
                  }
                  @keyframes stShimmer {
                    from { background-position: -200% center; }
                    to   { background-position: 200% center; }
                  }
                  .st-tag {
                    opacity: 0;
                    position: relative;
                    overflow: hidden;
                    animation: stTagIn 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
                    transition: transform 0.18s ease;
                  }
                  .st-tag:hover { transform: translateY(-2px) scale(1.04); }
                  .st-tag::before {
                    content: ''; position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%);
                    background-size: 200% 100%; opacity: 0; transition: opacity 0.2s; pointer-events: none;
                  }
                  .st-tag:hover::before { opacity: 1; animation: stShimmer 0.46s ease forwards; }
                `}</style>

                <div className="mb-6">
                  <div
                    className="flex items-center gap-2 mb-3"
                    style={{
                      animation:
                        "stHeaderIn 0.5s cubic-bezier(0.22,1,0.36,1) both",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#7F77DD",
                        display: "inline-block",
                        flexShrink: 0,
                        animation: "stPulse 2.4s ease-in-out infinite",
                      }}
                    />
                    <h2 className="text-xs font-medium tracking-widest uppercase text-gray-400">
                      What customers are saying
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {summaryTags.map((tag, index) => {
                      const palettes = [
                        { bg: "#EEEDFE", border: "#AFA9EC", color: "#3C3489" },
                        { bg: "#E1F5EE", border: "#5DCAA5", color: "#085041" },
                        { bg: "#E6F1FB", border: "#85B7EB", color: "#0C447C" },
                        { bg: "#EAF3DE", border: "#97C459", color: "#27500A" },
                        { bg: "#FBEAF0", border: "#ED93B1", color: "#72243E" },
                        { bg: "#FAEEDA", border: "#EF9F27", color: "#633806" },
                        { bg: "#FAECE7", border: "#F0997B", color: "#712B13" },
                      ];
                      const p = palettes[index % palettes.length];
                      return (
                        <span
                          key={index}
                          className="st-tag"
                          style={{
                            animationDelay: `${0.06 + index * 0.07}s`,
                            padding: "6px 14px",
                            borderRadius: 999,
                            border: `0.5px solid ${p.border}`,
                            background: p.bg,
                            color: p.color,
                            fontSize: 12,
                            fontWeight: 400,
                            cursor: "default",
                            userSelect: "none",
                          }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900 capitalize">
                    {review.user_name || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${
                          Number(review.product_rating) >= star
                            ? "text-[#f5b50a]"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {review.headline && (
                  <p className="font-medium text-gray-800 mb-1">
                    {review.headline}
                  </p>
                )}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.written_review}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Reviewed on {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}

            {reviews.length > 2 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="text-sm font-medium text-[#7F77DD] hover:underline"
                >
                  {showAllReviews
                    ? "Show Less"
                    : `Show More (${reviews.length - 2} more)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
