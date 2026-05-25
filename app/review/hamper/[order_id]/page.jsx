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

  const [activeReview, setActiveReview] = useState({ hamper: {} });
  const [submitting, setSubmitting] = useState(false);

  const loginPromiseRef = useRef(null);

  // 🔐 Token
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

  // 📦 Fetch Order
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
          body: JSON.stringify({ order_id, order_type: "hamper" }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (data.status === "success") {
          setOrderData(data);
          return;
        }

        if (retry) {
          await new Promise((r) => setTimeout(r, 700));
          return fetchOrder(false);
        }

        setError("Order not found.");
      } catch (err) {
        if (retry) {
          await new Promise((r) => setTimeout(r, 700));
          return fetchOrder(false);
        }
        setError("Failed to load order.");
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
  const setRating = (value) => {
    setActiveReview((prev) => ({
      ...prev,
      hamper: {
        ...prev.hamper,
        product_ratings: value,
      },
    }));
  };

  // ✍️ Update fields
  const updateField = (field, value) => {
    setActiveReview((prev) => ({
      ...prev,
      hamper: {
        ...prev.hamper,
        [field]: value,
      },
    }));
  };

  const updateMedia = (field, files) => {
    console.log("👉 updateMedia called:", field, files);

    setActiveReview((prev) => {
      console.log("🧠 PREV STATE:", prev);

      // 📸 IMAGE
      if (field === "images") {
        if (!files) {
          console.log("❌ Removing images");

          return {
            ...prev,
            hamper: {
              ...prev.hamper,
              images: null,
            },
          };
        }

        const newFiles = Array.from(files);
        console.log("📦 NEW FILES:", newFiles);

        if (newFiles.length > 5) {
          toast.error("Maximum 5 images allowed 📸");
          return prev;
        }

        const updated = {
          ...prev,
          hamper: {
            ...prev.hamper,
            images: newFiles,
          },
        };

        console.log("✅ UPDATED STATE:", updated);

        return updated;
      }

      // 🎥 VIDEO
      if (field === "video") {
        console.log("🎥 VIDEO FILE:", files);

        if (files && prev.hamper?.video) {
          toast.error("Only 1 video allowed 🎥");
          return prev;
        }

        const updated = {
          ...prev,
          hamper: {
            ...prev.hamper,
            video: files,
          },
        };

        console.log("✅ UPDATED STATE:", updated);

        return updated;
      }

      return prev;
    });
  };

  // 🚀 Submit Review
  const submitReviewHamper = async () => {
    const review = activeReview.hamper;

    if (!review?.product_ratings) {
      toast.error("Please select rating ⭐");
      return;
    }
    if (!review?.headline?.trim()) {
      toast.error("Headline required");
      return;
    }
    if (!review?.written_review?.trim()) {
      toast.error("Write your review");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getTokenDirect();

      // 🔥 Create FormData
      const formData = new FormData();

      // 🧾 Basic fields
      formData.append("order_id", orderData.order_id);
      formData.append("order_type", "hamper");
      formData.append("product_id", orderData.hamper_details?.id);
      formData.append("written_review", review.written_review);
      formData.append("headline", review.headline);
      formData.append("product_ratings", review.product_ratings);
      formData.append("created_by", orderData.hamper_order?.customer_id || 0);
      formData.append("customer", orderData.hamper_order?.full_name);

      // 📸 Images (multiple)
      if (Array.isArray(review?.images) && review.images.length > 0) {
        review.images.forEach((file) => {
          formData.append("images[]", file);
        });
      }

      // 🎥 Video (single)
      if (review?.video) {
        formData.append("video", review.video);
      }

      // 🧪 DEBUG (optional — remove later)
      console.log("🚀 FormData content:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // 🚀 API call
      const res = await fetch("/api/addreview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ❗ don't add Content-Type
        },
        body: formData,
      });

      const data = await res.json();

      if (data.status === true) {
        toast.success("Review submitted 🎉");

        // ✅ CLEAR FORM (reset properly)
        setActiveReview({ hamper: {} });
      } else {
        toast.error("Failed to submit");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  // 🔄 Loader
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        {/* Spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#A00300] rounded-full animate-spin"></div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        {error}
      </div>
    );
  }

  if (!orderData) return null;

  const isCompleted = orderData.hamper_order?.payment_status === "1";

  console.log("🎯 RENDER STATE:", activeReview.hamper);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 font-odop">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Rate Your Experience ⭐</h1>

        {/* 🧾 Hamper Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={getImageSrc(orderData.hamper_details?.image)}
              alt={orderData.hamper_details?.name}
              className="w-full sm:w-32 h-32 object-cover rounded-xl border"
            />

            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {orderData.hamper_details?.name}
              </h2>

              <p className="text-sm text-gray-600 mt-2">
                {orderData.hamper_order?.product_item}
              </p>
            </div>
          </div>

          {/* ⭐ Review Section */}
          {isCompleted && (
            <div className="mt-8 border-t pt-6">
              {/* Stars */}
              <div className="flex gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star
                      className={`h-8 w-8 ${
                        star <= (activeReview.hamper?.product_ratings || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Headline */}
              <input
                placeholder="Headline *"
                value={activeReview.hamper?.headline || ""}
                onChange={(e) => updateField("headline", e.target.value)}
                className="w-full mb-4 border rounded-xl px-4 py-3"
              />

              {/* Review */}
              <textarea
                rows={4}
                placeholder="Write your review *"
                value={activeReview.hamper?.written_review || ""}
                onChange={(e) => updateField("written_review", e.target.value)}
                className="w-full mb-6 border rounded-xl px-4 py-3"
              />

              <div className="mb-6">
                <p className="text-sm font-medium mb-2 text-gray-700">
                  Add Photos / Videos (optional)
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* 📸 IMAGE SIDE */}
                  <div className="flex-1">
                    <label className="cursor-pointer border rounded-xl px-4 py-3 text-sm text-gray-600 hover:border-black transition block">
                      Upload Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files; // 🧠 store first

                          console.log("📸 FILE INPUT:", files);

                          updateMedia("images", files);

                          // clear AFTER safe usage (next tick)
                          setTimeout(() => {
                            e.target.value = "";
                          }, 0);
                        }}
                      />
                    </label>

                    {/* 🖼️ Image Preview */}
                    {Array.isArray(activeReview.hamper?.images) &&
                      activeReview.hamper.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Array.from(activeReview.hamper.images).map(
                            (file, i) => (
                              <div key={i} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                />

                                {/* ❌ Remove */}
                                <button
                                  type="button"
                                  onClick={() => updateMedia("images", null)}
                                  className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                  ×
                                </button>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  {/* 🎥 VIDEO SIDE */}
                  <div className="flex-1">
                    <label className="cursor-pointer border rounded-xl px-4 py-3 text-sm text-gray-600 hover:border-black transition block">
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          updateMedia("video", e.target.files[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    {/* 🎥 Video Preview */}
                    {activeReview.hamper?.video && (
                      <div className="mt-3 relative w-fit">
                        <video
                          src={URL.createObjectURL(activeReview.hamper.video)}
                          className="w-40 h-24 rounded-lg border object-cover"
                          controls
                        />

                        {/* ❌ Remove */}
                        <button
                          type="button"
                          onClick={() => updateMedia("video", null)}
                          className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={submitReviewHamper}
                disabled={submitting}
                className="bg-black text-white px-6 py-3 rounded-xl"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
