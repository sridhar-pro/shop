"use client";
import { ShoppingBag } from "lucide-react";
import { getImageSrc } from "../lib/checkoutHelpers";

// Shown when paymentSuccess is true. Styles stay inside this file.
// orderData = data returned by /api/paymentNotify (customer, address, reference_no)
// onContinue = clears checkout_* keys, empties cart items, navigates to "/"

const styles = `
    @keyframes oss-fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes oss-fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes oss-scaleIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
    @keyframes oss-dashCircle { from { stroke-dashoffset:220; } to { stroke-dashoffset:0; } }
    @keyframes oss-dashCheck { from { stroke-dashoffset:60; } to { stroke-dashoffset:0; } }
    @keyframes oss-shimmer { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
    @keyframes oss-progressBar { from { width:0; } to { width:28%; } }

    .oss-check-ring { animation: oss-scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; display:inline-block; }
    .oss-ring-anim { animation: oss-dashCircle 0.65s ease-out 0.1s both; }
    .oss-tick-anim { animation: oss-dashCheck 0.4s ease-out 0.6s both; }
    .oss-hero-h1 { animation: oss-fadeUp 0.4s ease 0.25s both; }
    .oss-hero-p { animation: oss-fadeUp 0.4s ease 0.35s both; }
    .oss-hero-btn { animation: oss-fadeIn 0.4s ease 0.45s both; }
    .oss-grid { animation: oss-fadeUp 0.5s ease 0.5s both; }
    .oss-timeline { animation: oss-fadeUp 0.5s ease 0.65s both; }
    .oss-notify { animation: oss-fadeIn 0.5s ease 0.8s both; }
    .oss-progress-bar { animation: oss-progressBar 1.2s ease 0.8s both; width:0; }

    .oss-step-dot-active { animation: oss-shimmer 2s ease-in-out infinite; }

    .oss-cta-btn {
      display:inline-flex; align-items:center; gap:7px;
      padding:10px 22px; border-radius:999px; border:0.5px solid #d1d5db;
      background:#fff; color:#111827; font-size:13px; font-weight:500;
      cursor:pointer; transition:background 0.15s, transform 0.1s;
    }
    .oss-cta-btn:hover { background:#f9fafb; }
    .oss-cta-btn:active { transform:scale(0.97); }

    .oss-items-list::-webkit-scrollbar { width:4px; }
    .oss-items-list::-webkit-scrollbar-track { background:transparent; }
    .oss-items-list::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:2px; }
`;

// Repeated inline styles (same values as before, defined once)
const cardStyle = {
  background: "#fff",
  border: "0.5px solid #e5e7eb",
  borderRadius: 16,
  overflow: "hidden",
};

const fieldLabelStyle = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#9ca3af",
  margin: "0 0 3px",
};

const priceRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
  color: "#6b7280",
  marginBottom: 8,
};

export default function PaymentSuccessView({
  orderData,
  idordered,
  orderDate,
  cartItems,
  subtotal,
  tax,
  shipping,
  total,
  onContinue,
}) {
  const orderSuccessData = orderData || {};
  const customer = orderSuccessData?.customer || {};
  const address = orderSuccessData?.address || {};

  const formattedAddress = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <style>{styles}</style>
      <div className="w-full">
        <div
          style={{
            maxWidth: 1400,
            width: "100%",
            margin: "0 auto",
            padding: "1.5rem 0.75rem",
          }}
        >
          {/* ✅ Hero */}
          <div style={{ textAlign: "center", marginBottom: "0.8rem" }}>
            <div className="oss-check-ring">
              <svg width="88" height="88" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="34" fill="#dcfce7" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="220"
                  strokeDashoffset="220"
                  className="oss-ring-anim"
                />
                <polyline
                  points="24,41 35,52 56,30"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray="60"
                  strokeDashoffset="60"
                  className="oss-tick-anim"
                />
              </svg>
            </div>

            <h1
              className="oss-hero-h1"
              style={{
                fontSize: "clamp(20px, 5vw, 26px)",
                fontWeight: 500,
                color: "#111827",
                margin: "4px 0 6px",
              }}
            >
              Payment confirmed!
            </h1>

            <p
              className="oss-hero-p"
              style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}
            >
              Your order has been placed successfully. A confirmation email is
              on its way.
            </p>

            <button
              className="oss-cta-btn oss-hero-btn w-full sm:w-auto justify-center"
              onClick={onContinue}
            >
              <ShoppingBag style={{ width: 14, height: 14 }} />
              Continue shopping
            </button>
          </div>

          {/* 🧍 LEFT + 📦 RIGHT */}
          <div
            className="oss-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
            style={{ display: "grid", gap: 16, marginBottom: 16 }}
          >
            {/* LEFT — Customer */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "18px 20px",
                  borderBottom: "0.5px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#166534",
                    flexShrink: 0,
                  }}
                >
                  {customer?.name
                    ? customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "?"}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#111827",
                      margin: "0 0 2px",
                    }}
                  >
                    {customer?.name || "—"}
                  </p>
                  <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                    Customer
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div>
                  <p style={fieldLabelStyle}>Email</p>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#6b7280",
                      margin: 0,
                      wordBreak: "break-all",
                    }}
                  >
                    {customer?.email || "—"}
                  </p>
                </div>
                <div>
                  <p style={fieldLabelStyle}>Phone</p>
                  <p style={{ fontSize: 16, color: "#111827", margin: 0 }}>
                    {customer?.phone || "—"}
                  </p>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: "0.5px solid #e5e7eb",
                    margin: 0,
                  }}
                />

                <div>
                  <p style={{ ...fieldLabelStyle, margin: "0 0 6px" }}>
                    Deliver to
                  </p>
                  {formattedAddress ? (
                    <div
                      style={{
                        fontSize: 15,
                        color: "#6b7280",
                        lineHeight: 1.65,
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 500,
                          color: "#111827",
                          margin: "0 0 4px",
                        }}
                      >
                        {address?.name || customer?.name}
                      </p>
                      <p style={{ margin: 0 }}>{formattedAddress}</p>
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        fontStyle: "italic",
                        margin: 0,
                      }}
                    >
                      No address available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Order Summary */}
            <div
              style={{ ...cardStyle, display: "flex", flexDirection: "column" }}
            >
              {/* Green Header */}
              <div style={{ background: "#14532d", padding: "20px 20px 16px" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#86efac",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 4px",
                  }}
                >
                  Order confirmed
                </p>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "#fff",
                    margin: "0 0 4px",
                    letterSpacing: "0.03em",
                  }}
                >
                  #{idordered || "—"}
                </p>
                <p style={{ fontSize: 11, color: "#bbf7d0", margin: 0 }}>
                  {orderDate}
                  {orderSuccessData?.reference_no && (
                    <> &nbsp;·&nbsp; Ref: {orderSuccessData.reference_no}</>
                  )}
                </p>
              </div>

              {/* Items */}
              <div
                className="oss-items-list"
                style={{
                  padding: "0 20px",
                  maxHeight: 200,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {cartItems.map((item, idx) => (
                  <div
                    key={item.rowid || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: "0.5px solid #e5e7eb",
                    }}
                  >
                    <img
                      src={getImageSrc(item.image)}
                      alt={item.name}
                      title={item.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        objectFit: "cover",
                        background: "#f3f4f6",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#111827",
                          margin: "0 0 3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        dangerouslySetInnerHTML={{ __html: item.name }}
                      />
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                        Qty: {item.qty}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#111827",
                        flexShrink: 0,
                        marginLeft: "auto",
                      }}
                    >
                      ₹{(item.price * Number(item.qty)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div
                style={{
                  background: "#f9fafb",
                  borderTop: "0.5px solid #e5e7eb",
                  padding: "16px 20px",
                  marginTop: "auto",
                }}
              >
                <div style={priceRowStyle}>
                  <span>Item cost (incl. tax)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div style={priceRowStyle}>
                  <span>Tax (included in price)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                <div style={priceRowStyle}>
                  <span>Shipping</span>
                  <span
                    style={
                      shipping === 0
                        ? { color: "#15803d", fontWeight: 500 }
                        : {}
                    }
                  >
                    {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "#111827",
                    paddingTop: 10,
                    borderTop: "0.5px solid #e5e7eb",
                  }}
                >
                  <span>Total paid</span>
                  <span style={{ color: "#15803d" }}>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🔔 Notification Strip */}
          <div
            className="oss-notify"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f9fafb",
              border: "0.5px solid #e5e7eb",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              You'll receive a shipping notification via SMS and email once your
              order is dispatched.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
