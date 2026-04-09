"use client";
import React, { useState, useEffect } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
  PackageSearch,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAuth } from "../utils/AuthContext";
import InvoiceDownload from "./InvoiceDownload";
import TrackingResult from "../track-order/TrackingResult";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);

  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const [activeReview, setActiveReview] = useState({});
  const [submittedProducts, setSubmittedProducts] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const [viewedOrder, setViewedOrder] = useState(null);

  const { getValidToken } = useAuth();

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();

      if (token && typeof token === "string" && token.length > 10) {
        return token;
      }

      if (attempt === 5) {
        localStorage.removeItem("authToken"); // force refresh if token exists but is trash
      }

      await wait(delay);
      attempt++;
    }

    throw new Error("❌ Auth token unavailable after multiple retries.");
  };

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getTokenWithRetry();

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true); // Retry once silently
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  // Refactored fetchOrders
  const fetchOrders = async (currentPage = 1) => {
    try {
      setLoading(true);
      const companyId = localStorage.getItem("company_id");

      if (!companyId) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const data = await fetchWithAuth("/api/customer_orders", {
        method: "POST",
        body: JSON.stringify({
          company_id: Number(companyId),
          filters: {
            page: currentPage, // ✅ API expects page inside filters
          },
        }),
      });

      // console.log("Customer Orders Response ✅", data);

      if (data.status && data.data?.orders) {
        setOrders(data.data.orders);
        setLimit(data.data.filters.limit || 12);
        setPage(data.data.info.page || 1);
        setTotal(data.data.info.total || 0);
      } else {
        toast.error(data.message || "Failed to fetch orders ❌");
      }
    } catch (error) {
      console.error("Orders API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, []);

  const totalPages = total || 1;

  const getPageNumbers = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);

    pages.push(1);

    if (left > 2) {
      pages.push("left-ellipsis");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  };

  const handleTrackOrder = async () => {
    try {
      setTrackingLoading(true);
      setTrackingError("");

      const token = await getValidToken();

      const res = await fetch("/api/orderTracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: viewedOrder.invoice.reference_no || viewedOrder.order_id, // 👈 IMPORTANT
          awb: "",
          mobile_number: "",
        }),
      });

      if (!res.ok) {
        throw new Error("Tracking not available for this order");
      }

      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      console.error("Tracking error ❌", err);
      setTrackingError(err.message || "Unable to track order");
    } finally {
      setTrackingLoading(false);
    }
  };

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

  const submitReview = async (item) => {
    const review = activeReview[item.product_id];

    if (!review?.product_ratings) {
      toast.error("Please select a star rating");
      return;
    }

    if (submittedProducts[item.product_id]) return;

    setSubmittingReview(true);

    try {
      const token = await getValidToken();

      const res = await fetch("/api/addreview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: viewedOrder.order_id || viewedOrder.invoice.id,
          product_id: item.product_id,
          written_review: review.written_review || "",
          headline: review.headline || "",
          product_ratings: review.product_ratings,
          created_by: viewedOrder.invoice.customer_id,
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
      console.error("Review error ❌", err);
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 w-full px-6 lg:px-12">
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl p-4 shadow-sm animate-pulse"
          >
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-auto">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-10">
        <h2 className="text-xl font-bold mb-4 text-black">Orders Dashboard</h2>

        {/* Show orders table only if no order is viewed */}
        {!viewedOrder && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.reference_no}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {order.date}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {order.grand_total}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                              order.sale_status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {order.sale_status}
                          </span>
                        </td>

                        {/* view products */}
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200"
                              onClick={async () => {
                                try {
                                  const token = await getValidToken();
                                  const res = await fetch("/api/viewdetails", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      order_id: order.id,
                                    }),
                                  });

                                  const data = await res.json();
                                  // console.log(
                                  //   "📦 View Details Response:",
                                  //   data
                                  // );

                                  if (data.status === "success") {
                                    setViewedOrder(data); // store response
                                  }
                                } catch (err) {
                                  console.error(
                                    "❌ Error fetching view details:",
                                    err,
                                  );
                                }
                              }}
                            >
                              View
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-left">
                          <InvoiceDownload order={order} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <PackageSearch className="w-10 h-10 mb-2 text-gray-400" />
                          <span className="text-sm font-medium">
                            No orders found.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {orders.length > 0 ? (
                orders.map((order, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 p-4 shadow-sm bg-white"
                  >
                    {/* Header: Order + Invoice */}
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        Order: {order.reference_no}
                      </p>
                      <InvoiceDownload order={order} />
                    </div>

                    {/* Date & Total */}
                    <p className="text-xs text-gray-500 mb-1">
                      Date: {order.date}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Total: {order.grand_total}
                    </p>

                    {/* 🔥 Status Labels */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">
                          Payment:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            order.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">
                          Status:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            order.sale_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.sale_status}
                        </span>
                      </div>
                    </div>

                    {/* ⚙️ Actions: View Products */}
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition"
                        onClick={async () => {
                          try {
                            const token = await getValidToken();
                            const res = await fetch("/api/viewdetails", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                order_id: order.id,
                              }),
                            });

                            const data = await res.json();
                            if (data.status === "success") {
                              setViewedOrder(data);
                            }
                          } catch (err) {
                            console.error(
                              "❌ Error fetching view details:",
                              err,
                            );
                          }
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No orders found.</p>
              )}
            </div>

            {/* Pagination */}
            {orders.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex items-center gap-1 rounded-2xl border border-[#A0030033] bg-white px-2 py-1 shadow-sm">
                  {/* Prev button */}
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      if (page === 1) return;
                      fetchOrders(page - 1);
                      scrollToTop();
                    }}
                    className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#A0030011] text-[#A00300] hover:bg-[#A0030022]"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="mx-1 flex items-center gap-1">
                    {getPageNumbers().map((p, idx) =>
                      typeof p === "string" ? (
                        <span
                          key={p + idx}
                          className="px-2 text-xs sm:text-sm text-gray-400 select-none"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => {
                            if (p === page) return;
                            fetchOrders(p);
                            scrollToTop();
                          }}
                          className={`min-w-[2.25rem] rounded-xl px-2 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                            p === page
                              ? "bg-[#A00300] text-white shadow-md scale-[1.03]"
                              : "bg-white text-gray-700 hover:bg-[#A0030011] hover:text-[#A00300]"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>

                  {/* Next button */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => {
                      if (page === totalPages) return;
                      fetchOrders(page + 1);
                      scrollToTop();
                    }}
                    className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-[#A0030011] text-[#A00300] hover:bg-[#A0030022]"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Render products of viewed order */}
        {viewedOrder && viewedOrder.seller_group?.length > 0 && (
          <div className="flex flex-col">
            {/* 🔙 Back + 🚚 Track buttons */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setViewedOrder(null);
                  setTrackingData(null);
                  setTrackingError("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Orders
              </button>

              <button
                onClick={handleTrackOrder}
                className="inline-flex items-center gap-2 px-5 py-2.5
          bg-gradient-to-r from-green-600 to-emerald-600
          text-white rounded-xl shadow-md
          hover:shadow-lg hover:scale-[1.02]
          transition-all duration-200"
              >
                <Truck className="w-5 h-5" />
                Track Order
              </button>
            </div>

            {/* 🚚 Tracking Result Section */}
            {trackingLoading && (
              <p className="text-center text-gray-500 py-4">
                Fetching tracking...
              </p>
            )}

            {trackingError && (
              <p className="text-center text-red-600 py-4">{trackingError}</p>
            )}

            {trackingData && (
              <div className="mb-10">
                <TrackingResult
                  trackingData={trackingData}
                  showBackButton={false}
                />
              </div>
            )}

            {/* 📦 Packages / Products */}
            {viewedOrder.seller_group.map((group, gIdx) => (
              <div key={gIdx} className="mb-12">
                {viewedOrder.seller_group.length > 1 && (
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Package {gIdx + 1}
                  </h2>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {group.items.map((item) => {
                    const isSubmitted = submittedProducts[item.product_id];

                    return (
                      <div
                        key={item.id}
                        className="relative flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 group"
                      >
                        {/* Product Image */}
                        <div className="w-full h-44 flex items-center justify-center overflow-hidden rounded-xl mb-4">
                          <Image
                            src={getImageSrc(item.image)}
                            alt={item.product_name || "Product Image"}
                            width={180}
                            height={180}
                            className="object-contain w-full h-full transition-transform group-hover:scale-105"
                          />
                        </div>

                        {/* Product Name */}
                        <h3
                          className="text-md font-semibold text-center text-gray-800 mb-2 line-clamp-2
             min-h-[3rem]"
                        >
                          {item.product_name}
                        </h3>
                        {/* Price */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <p className="text-lg font-bold text-[#A00300]">
                            ₹{parseFloat(item.subtotal).toFixed(2)}
                          </p>
                          <span className="text-sm text-gray-600">
                            x {parseInt(item.quantity)}
                          </span>
                        </div>

                        {/* ⭐ Review Section */}
                        {item.product_review === true && (
                          <div className="mt-4 w-full border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                              Share your experience
                            </p>

                            {/* Stars */}
                            <div className="flex justify-center gap-2 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  disabled={isSubmitted}
                                  onClick={() =>
                                    setRating(item.product_id, star)
                                  }
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      star <=
                                      (activeReview[item.product_id]
                                        ?.product_ratings || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>

                            {/* Headline */}
                            <input
                              disabled={isSubmitted}
                              type="text"
                              placeholder="Headline (optional)"
                              className="w-full mb-2 rounded-lg border px-3 py-2 text-xs disabled:bg-gray-100"
                              onChange={(e) =>
                                updateField(
                                  item.product_id,
                                  "headline",
                                  e.target.value,
                                )
                              }
                            />

                            {/* Review */}
                            <textarea
                              disabled={isSubmitted}
                              rows={2}
                              placeholder="Write your review (optional)"
                              className="w-full mb-3 rounded-lg border px-3 py-2 text-xs resize-none disabled:bg-gray-100"
                              onChange={(e) =>
                                updateField(
                                  item.product_id,
                                  "written_review",
                                  e.target.value,
                                )
                              }
                            />

                            {/* Submit */}
                            <button
                              disabled={submittingReview || isSubmitted}
                              onClick={() => submitReview(item)}
                              className="w-full rounded-lg bg-black text-white py-2 text-xs font-semibold disabled:opacity-60"
                            >
                              {isSubmitted
                                ? "Review Submitted ✓"
                                : "Submit Review"}
                            </button>
                          </div>
                        )}

                        {/* Hover Border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#A00300] pointer-events-none" />
                      </div>
                    );
                  })}
                </div>

                {/* Cancel (per package) */}
                {group.cancelable?.status === 1 && (
                  <div className="mt-6">
                    <button
                      onClick={() =>
                        handleCancelPackage(
                          group.items[0]?.shiprocket_order_id,
                          gIdx,
                        )
                      }
                      className="px-5 py-2 rounded-lg bg-[#a00300] text-white hover:bg-red-700"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
