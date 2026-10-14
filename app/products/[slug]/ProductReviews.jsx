"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

// ⚠️ Confirm this path – review files are assumed to live next to product uploads.
// If they sit in a sub-folder (e.g. /assets/uploads/reviews/), change it here only.
const REVIEW_MEDIA_BASE = "https://marketplace.yuukke.com/assets/uploads/";

const toUrl = (file) =>
  /^https?:\/\//i.test(file) ? file : `${REVIEW_MEDIA_BASE}${file}`;

// review_image arrives as a JSON string ('["a.jpeg"]'), but be defensive.
const parseImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (typeof parsed === "string" && parsed) return [parsed];
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// Each media item carries the details of the review it belongs to,
// so the lightbox can show who posted it.
const getReviewMedia = (review) => {
  const meta = {
    name: review?.user_name || "Anonymous",
    rating: Number(review?.product_rating) || 0,
    headline: review?.headline || "",
    text: review?.written_review || "",
    date: review?.created_at || "",
  };
  const images = parseImages(review?.review_image).map((f) => ({
    type: "image",
    src: toUrl(f),
    review: meta,
  }));
  const video = review?.review_video
    ? [{ type: "video", src: toUrl(review.review_video), review: meta }]
    : [];
  return [...images, ...video];
};

function MediaThumb({ item, size = 80, onClick, overlayCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pr-thumb"
      style={{ width: size, height: size }}
      aria-label={
        item.type === "video" ? "Play review video" : "View review photo"
      }
    >
      {item.type === "video" ? (
        <>
          <video
            src={`${item.src}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            className="pr-thumb-media"
          />
          <span className="pr-play">
            <Play size={14} fill="currentColor" />
          </span>
        </>
      ) : (
        <img
          src={item.src}
          alt="Customer review"
          loading="lazy"
          className="pr-thumb-media"
        />
      )}
      {overlayCount > 0 && <span className="pr-more">+{overlayCount}</span>}
    </button>
  );
}

function Lightbox({ items, index, onClose, onChange }) {
  const current = items[index];
  const review = current.review;
  const hasMany = items.length > 1;
  const touchRef = useRef(null);

  const prev = useCallback(
    () => onChange((index - 1 + items.length) % items.length),
    [index, items.length, onChange],
  );
  const next = useCallback(
    () => onChange((index + 1) % items.length),
    [index, items.length, onChange],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMany) prev();
      if (e.key === "ArrowRight" && hasMany) next();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next, hasMany]);

  // Swipe support (mobile). Ignores touches on a video's bottom control bar
  // so scrubbing the seek bar doesn't change the slide.
  const handleTouchStart = (e) => {
    if (!hasMany || e.touches.length !== 1) {
      touchRef.current = null;
      return;
    }
    const t = e.touches[0];
    if (e.target.tagName === "VIDEO") {
      const rect = e.target.getBoundingClientRect();
      if (t.clientY > rect.bottom - 64) {
        touchRef.current = null;
        return;
      }
    }
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  return createPortal(
    <motion.div
      className="pr-lb font-odop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="pr-lb-top" onClick={(e) => e.stopPropagation()}>
        <span className="pr-lb-count">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="pr-lb-btn"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="pr-lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMany && (
          <button
            type="button"
            onClick={prev}
            className="pr-lb-btn pr-lb-nav pr-lb-prev"
            aria-label="Previous"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current.src}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pr-lb-item"
          >
            {current.type === "video" ? (
              <video
                src={current.src}
                controls
                autoPlay
                playsInline
                className="pr-lb-media"
              />
            ) : (
              <img
                src={current.src}
                alt={`Review photo by ${review.name}`}
                className="pr-lb-media"
                draggable={false}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {hasMany && (
          <button
            type="button"
            onClick={next}
            className="pr-lb-btn pr-lb-nav pr-lb-next"
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Reviewer caption */}
      <div className="pr-lb-caption-wrap" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.src}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pr-lb-caption"
          >
            <span className="pr-lb-avatar">
              {review.name.charAt(0).toUpperCase()}
            </span>
            <div className="pr-lb-caption-body">
              <div className="pr-lb-caption-head">
                <span className="pr-lb-name">{review.name}</span>
                <span
                  className="pr-lb-stars"
                  aria-label={`${review.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        color:
                          review.rating >= star
                            ? "#f5b50a"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </span>
              </div>
              {review.headline && (
                <p className="pr-lb-headline">{review.headline}</p>
              )}
              {review.text && <p className="pr-lb-text">{review.text}</p>}
              {review.date && (
                <p className="pr-lb-date">
                  Reviewed on {new Date(review.date).toLocaleDateString()}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {hasMany && (
        <div className="pr-lb-rail" onClick={(e) => e.stopPropagation()}>
          {items.map((it, i) => (
            <button
              key={`${it.src}-${i}`}
              type="button"
              onClick={() => onChange(i)}
              className={`pr-rail-item ${i === index ? "is-active" : ""}`}
              aria-label={`Go to item ${i + 1}`}
            >
              {it.type === "video" ? (
                <>
                  <video
                    src={`${it.src}#t=0.1`}
                    preload="metadata"
                    muted
                    playsInline
                    className="pr-thumb-media"
                  />
                  <span className="pr-play pr-play-sm">
                    <Play size={10} fill="currentColor" />
                  </span>
                </>
              ) : (
                <img src={it.src} alt="" className="pr-thumb-media" />
              )}
            </button>
          ))}
        </div>
      )}
    </motion.div>,
    document.body,
  );
}

export default function ProductReviews({
  product,
  reviews,
  reviewsRef,
  summaryTags,
}) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { items, index }

  // Aggregate media from every review for the top gallery strip
  const allMedia = useMemo(
    () => (reviews || []).flatMap((r) => getReviewMedia(r)),
    [reviews],
  );

  const openLightbox = (items, index) => setLightbox({ items, index });
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const changeLightbox = useCallback(
    (i) => setLightbox((lb) => (lb ? { ...lb, index: i } : lb)),
    [],
  );

  if (!reviews.length) return null;

  const GALLERY_LIMIT = 6;

  return (
    <div
      ref={reviewsRef}
      id="customer-reviews"
      className="mt-10 scroll-mt-28 font-odop"
    >
      <style>{`
        .pr-thumb {
          position: relative; flex-shrink: 0; overflow: hidden;
          border-radius: 12px; border: 1px solid #e5e7eb; background: #f3f4f6;
          padding: 0; cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pr-thumb:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        .pr-thumb-media { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pr-play {
          position: absolute; inset: 0; margin: auto; width: 30px; height: 30px;
          border-radius: 999px; display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.55); color: #fff; backdrop-filter: blur(4px);
          padding-left: 2px; pointer-events: none;
        }
        .pr-play-sm { width: 20px; height: 20px; }
        .pr-more {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          background: rgba(17,24,39,0.62); color: #fff; font-weight: 600; font-size: 16px;
        }
        .pr-strip { display: flex; gap: 8px; flex-wrap: wrap; }

        .pr-lb {
          position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
          background: rgba(10,10,15,0.92); backdrop-filter: blur(6px);
        }
        .pr-lb-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; }
        .pr-lb-count { color: rgba(255,255,255,0.75); font-size: 13px; letter-spacing: 0.04em; }
        .pr-lb-btn {
          width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.12); color: #fff; transition: background 0.2s;
        }
        .pr-lb-btn:hover { background: rgba(255,255,255,0.24); }
        .pr-lb-stage {
          position: relative; flex: 1; min-height: 0; display: flex; align-items: center;
          justify-content: center; padding: 0 64px; touch-action: pan-y;
        }
        .pr-lb-item { max-width: 100%; max-height: 100%; display: flex; }
        .pr-lb-media {
          max-width: 100%; max-height: calc(100vh - 360px); border-radius: 14px;
          object-fit: contain; background: #000; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          -webkit-user-select: none; user-select: none;
        }
        .pr-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; }
        .pr-lb-prev { left: 12px; }
        .pr-lb-next { right: 12px; }

        .pr-lb-caption-wrap { display: flex; justify-content: center; padding: 14px 18px 0; }
        .pr-lb-caption {
          display: flex; gap: 12px; align-items: flex-start; width: 100%; max-width: 560px;
          padding: 12px 16px; border-radius: 16px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px); color: #fff;
        }
        .pr-lb-avatar {
          width: 38px; height: 38px; flex-shrink: 0; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: #7F77DD; color: #fff; font-weight: 600; font-size: 15px;
        }
        .pr-lb-caption-body { min-width: 0; flex: 1; }
        .pr-lb-caption-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .pr-lb-name { font-weight: 600; font-size: 14px; text-transform: capitalize; }
        .pr-lb-stars { font-size: 13px; letter-spacing: 1px; white-space: nowrap; }
        .pr-lb-headline { margin: 4px 0 0; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.92); }
        .pr-lb-text {
          margin: 2px 0 0; font-size: 13px; line-height: 1.45; color: rgba(255,255,255,0.72);
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
        }
        .pr-lb-date { margin: 6px 0 0; font-size: 11px; color: rgba(255,255,255,0.45); }

        .pr-lb-rail {
          display: flex; gap: 8px; justify-content: center; padding: 14px 18px 20px;
          overflow-x: auto;
        }
        .pr-rail-item {
          position: relative; width: 54px; height: 54px; flex-shrink: 0; overflow: hidden;
          border-radius: 10px; padding: 0; cursor: pointer; opacity: 0.55;
          border: 2px solid transparent; transition: opacity 0.2s, border-color 0.2s;
        }
        .pr-rail-item:hover { opacity: 0.85; }
        .pr-rail-item.is-active { opacity: 1; border-color: #7F77DD; }
        @media (max-width: 640px) {
          .pr-lb-stage { padding: 0 8px; }
          .pr-lb-nav { width: 36px; height: 36px; background: rgba(0,0,0,0.5); }
          .pr-lb-prev { left: 6px; }
          .pr-lb-next { right: 6px; }
          .pr-lb-media { max-height: calc(100vh - 380px); }
        }
      `}</style>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      <div className="flex flex-col gap-6 md:gap-8">
        {/* 1. Ratings summary — full width, highlighted */}
        <div className="w-full rounded-2xl bg-[#F7F6FE] border border-[#E4E1FA] p-5 md:p-6">
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

          <div className="space-y-2 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const total = reviews.length;
              const count = reviews.filter(
                (r) => Math.round(Number(r.product_rating)) === star,
              ).length;
              const percent = total ? Math.round((count / total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 w-full">
                  <span className="w-12 text-sm text-gray-700">
                    {star} star
                  </span>
                  <div className="flex-1 h-3 bg-white rounded">
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

          {/* AI Summary Tags — full width, below the bars */}
          {summaryTags.length > 0 && (
            <div className="w-full mt-8">
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

              <div>
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
            </div>
          )}
        </div>

        {/* 2. Photos & videos from customers — full width, highlighted */}
        {allMedia.length > 0 && (
          <div className="rounded-2xl bg-[#F7F6FE] border border-[#E4E1FA] p-5 md:p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 capitalize">
              Photos & videos from customers
            </h3>
            <div className="pr-strip">
              {allMedia.slice(0, GALLERY_LIMIT).map((item, i) => (
                <MediaThumb
                  key={`${item.src}-${i}`}
                  item={item}
                  size={88}
                  overlayCount={
                    i === GALLERY_LIMIT - 1 && allMedia.length > GALLERY_LIMIT
                      ? allMedia.length - GALLERY_LIMIT
                      : 0
                  }
                  onClick={() => openLightbox(allMedia, i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 3. Reviews — full width, one card per review with profile avatar */}
        <div>
          <div className="space-y-4">
            {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review) => {
              const name = review.user_name || "Anonymous";
              return (
                <div
                  key={review.id}
                  className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 md:p-6"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Profile avatar */}
                    <span
                      className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-[#A00300] text-white text-base md:text-lg font-semibold uppercase ring-4 ring-[#EEEDFE]"
                      aria-hidden="true"
                    >
                      {name.trim().charAt(0) || "A"}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 capitalize truncate">
                          {name}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
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
                        <p className="font-medium text-gray-800 mb-1 capitalize">
                          {review.headline}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.written_review}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Reviewed on{" "}
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {reviews.length > 2 && (
              <div className="pt-2 text-center">
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

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            index={lightbox.index}
            onClose={closeLightbox}
            onChange={changeLightbox}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
