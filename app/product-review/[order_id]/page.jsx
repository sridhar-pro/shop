"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductReviewPage() {
  const { order_id } = useParams();

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);

  const [activeReview, setActiveReview] = useState({});
  const [submittedProducts, setSubmittedProducts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ✅ FIX: persist promise across renders
  const loginPromiseRef = useRef(null);

  // 🔐 Token getter (stable)
  const getTokenDirect = async () => {
    let token = localStorage.getItem("authToken");
    if (token) return token;

    if (!loginPromiseRef.current) {
      loginPromiseRef.current = fetch("/api/login", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.status === "success" && data?.token) {
            localStorage.setItem("authToken", data.token);
            return data.token;
          }
          throw new Error("Login failed");
        })
        .finally(() => {
          loginPromiseRef.current = null;
        });
    }

    return loginPromiseRef.current;
  };

  // 📦 Fetch Order (with retry)
  useEffect(() => {
    if (!order_id) return;

    let cancelled = false;

    const fetchOrder = async (retry = true) => {
      setLoading(true);
      setError(null);

      try {
        const token = await getTokenDirect();

        const res = await fetch("/api/viewdetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (data.status === "success") {
          setOrderData(data);
          return;
        }

        // 🔁 Retry once (fixes first-load issue)
        if (retry) {
          console.log("Retrying order fetch...");
          await new Promise((r) => setTimeout(r, 700));
          return fetchOrder(false);
        }

        setError("Order not found or inaccessible.");
        setOrderData(null);
      } catch (err) {
        console.error("Fetch failed:", err);

        if (retry) {
          await new Promise((r) => setTimeout(r, 700));
          return fetchOrder(false);
        }

        if (!cancelled) {
          setError("Failed to load order. Please try again.");
          setOrderData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [order_id]);

  // ⭐ Set rating
  const setRating = (productId, value) => {
    if (submittedProducts[productId]) return;

    setActiveReview((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        product_ratings: value,
      },
    }));
  };

  // ✍️ Update fields
  const updateField = (productId, field, value) => {
    if (submittedProducts[productId]) return;

    setActiveReview((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  // 🚀 Submit Review
  const submitReview = async (item) => {
    const review = activeReview[item.product_id];

    if (!review?.product_ratings) {
      toast.error("Please select a star rating ⭐");
      return;
    }
    if (!review?.headline?.trim()) {
      toast.error("Headline is required");
      return;
    }
    if (!review?.written_review?.trim()) {
      toast.error("Please write your review");
      return;
    }
    if (submittedProducts[item.product_id]) return;

    setSubmitting(true);

    try {
      const token = await getTokenDirect();

      const res = await fetch("/api/addreview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderData.order_id,
          product_id: item.product_id,
          written_review: review.written_review,
          headline: review.headline,
          product_ratings: review.product_ratings,
          created_by: orderData.invoice.customer_id,
        }),
      });

      const data = await res.json();

      if (data.status === true) {
        toast.success("Review added successfully 🎉");
        setSubmittedProducts((prev) => ({
          ...prev,
          [item.product_id]: true,
        }));
      } else {
        toast.error("Failed to submit review");
      }
    } catch (err) {
      console.error("Review submit failed", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // 🔄 Loader
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-red-50">
        <div className="relative">
          <motion.div
            className="h-16 w-16 rounded-full border-4 border-gray-200"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 h-16 w-16 rounded-full border-4 border-t-[#A00300] border-transparent"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          />
        </div>
        <p className="mt-6 text-sm text-gray-600">Preparing your experience…</p>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        {error}
      </div>
    );
  }

  // ❌ Fallback
  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Order not found
      </div>
    );
  }

  const isCompleted = orderData.invoice?.sale_status === "completed";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 px-4 py-12 font-odop">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            Rate Us ⭐
          </h1>
          <p className="mt-1 text-sm md:text-base text-gray-500">
            Share your experience
          </p>
        </div>

        {orderData.seller_group.map((group) =>
          group.items.map((item) => {
            const isSubmitted = submittedProducts[item.product_id];
            const canReview = isCompleted && item.product_review === true;

            const isFormValid =
              activeReview[item.product_id]?.product_ratings &&
              activeReview[item.product_id]?.headline?.trim() &&
              activeReview[item.product_id]?.written_review?.trim();

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.product_name}
                    className="w-full sm:w-32 h-72 sm:h-32 rounded-xl object-cover border"
                    onError={(e) => (e.currentTarget.src = "/fallback.jpeg")}
                  />

                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {item.product_name}
                    </h2>
                    <p className="mt-3 text-sm text-gray-600">
                      We’d love to hear how this hamper worked out for you.
                    </p>
                  </div>
                </div>

                {canReview && (
                  <div className="mt-8 border-t pt-6">
                    <div className="flex justify-center sm:justify-start gap-3 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          disabled={isSubmitted}
                          onClick={() => setRating(item.product_id, star)}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <=
                              (activeReview[item.product_id]?.product_ratings ||
                                0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <input
                      disabled={isSubmitted}
                      placeholder="Headline *"
                      className="w-full mb-4 rounded-xl border px-4 py-3"
                      onChange={(e) =>
                        updateField(item.product_id, "headline", e.target.value)
                      }
                    />

                    <textarea
                      disabled={isSubmitted}
                      rows={4}
                      placeholder="Write your review *"
                      className="w-full mb-6 rounded-xl border px-4 py-3 resize-none"
                      onChange={(e) =>
                        updateField(
                          item.product_id,
                          "written_review",
                          e.target.value,
                        )
                      }
                    />

                    <div className="flex justify-center sm:justify-end">
                      <button
                        disabled={!isFormValid || submitting || isSubmitted}
                        onClick={() => submitReview(item)}
                        className="px-8 py-3 rounded-xl bg-black text-white disabled:opacity-50"
                      >
                        {isSubmitted ? "Review Submitted ✓" : "Submit Review"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          }),
        )}
      </div>
    </div>
  );
}
