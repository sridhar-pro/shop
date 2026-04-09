"use client";
import { Store } from "lucide-react";

function getFirstSentence(html) {
  const text = html.replace(/<[^>]*>/g, "");
  const first = text.indexOf(".");
  const second = first !== -1 ? text.indexOf(".", first + 1) : -1;
  return second !== -1 ? text.slice(0, second + 1) : text;
}

export default function WarehouseBanner({ warehouse }) {
  if (!warehouse) return null;

  const hasVideo = warehouse?.about_video;

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wh-card { animation: fadeSlideUp 0.5s ease both; }
        .wh-logo-wrap:hover img { transform: scale(1.04); }
        .wh-logo-wrap img { transition: transform 0.4s ease; }
        .wh-about p { margin: 0 0 0.4em 0; }
        .wh-about br { display: none; }
      `}</style>

      <div
        className="wh-card relative overflow-hidden mb-8 flex flex-col md:flex-row"
        style={{
          borderRadius: "20px",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(0,9,48,0.10), 0 0 0 1px rgba(0,9,48,0.07)",
          background: "#ffffff",
        }}
      >
        {/* LEFT PANEL */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden flex-shrink-0 w-full md:w-[38%]"
          style={{
            background: "#f7f7f8",
            padding: "36px 28px",
            borderRight: "1px solid rgba(0,9,48,0.07)",
            minHeight: "300px",
          }}
        >
          <div
            className="wh-logo-wrap flex items-center justify-center flex-shrink-0"
            style={{
              width: "90px",
              height: "90px",
              background: "#ffffff",
              borderRadius: "10px",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,9,48,0.08)",
              border: "1px solid rgba(0,9,48,0.06)",
            }}
          >
            {warehouse.store_logo ? (
              <img
                src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${warehouse.store_logo}`}
                alt={warehouse.company_name || "Warehouse Logo"}
                style={{ width: "62px", height: "62px", objectFit: "contain" }}
              />
            ) : (
              <Store
                size={34}
                strokeWidth={1.5}
                color="#000930"
                style={{ opacity: 0.35 }}
              />
            )}
          </div>

          {hasVideo && (
            <p
              className="text-center mt-4"
              style={{
                color: "#000000",
                fontSize: "0.92rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "0",
              }}
            >
              {warehouse.company_name}
            </p>
          )}

          <div
            style={{
              marginTop: "14px",
              width: "24px",
              height: "2px",
              borderRadius: "2px",
              background: "#A00300",
              opacity: 0.7,
              flexShrink: 0,
            }}
          />

          {hasVideo && warehouse.about_us && (
            <div
              style={{
                position: "relative",
                marginTop: "12px",
                width: "100%",
                overflow: "hidden",
                maxHeight: "80px",
              }}
            >
              <p
                className="text-center"
                style={{
                  color: "#000930",
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  lineHeight: 1.65,
                  opacity: 0.55,
                  margin: 0,
                }}
              >
                {getFirstSentence(warehouse.about_us)}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            padding: "32px 40px",
            background: "#fafafa",
            minHeight: hasVideo ? "auto" : "100px",
          }}
        >
          {/* No-video layout */}
          {!hasVideo && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#A00300",
                  marginBottom: "10px",
                  display: "block",
                  flexShrink: 0,
                }}
              >
                About Us
              </span>

              <h2
                style={{
                  fontSize: "clamp(1.2rem, 2.5vw, 1.65rem)",
                  fontWeight: 800,
                  color: "#000930",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                  marginBottom: "14px",
                  flexShrink: 0,
                }}
                className="capitalize"
              >
                {warehouse.company_name}
              </h2>

              <div
                className="flex items-center gap-3 mb-5"
                style={{ flexShrink: 0 }}
              >
                <div
                  className="h-px w-10"
                  style={{
                    background:
                      "linear-gradient(to right, #A00300, transparent)",
                  }}
                />
                <div
                  className="w-1.5 h-1.5 rotate-45 flex-shrink-0"
                  style={{ background: "#A00300" }}
                />
              </div>

              {warehouse.about_us && (
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                    minHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <p
                    style={{
                      color: "#000930",
                      fontSize: "0.975rem",
                      fontWeight: 400,
                      lineHeight: 1.85,
                      opacity: 0.68,
                      margin: 0,
                    }}
                    className="text-center md:text-left"
                  >
                    {getFirstSentence(warehouse.about_us)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video layout */}
          {hasVideo && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div style={{ marginBottom: "12px", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#A00300",
                  }}
                >
                  About Us
                </span>
              </div>

              <div
                className="relative overflow-hidden"
                style={{
                  borderRadius: "12px",
                  height: "240px",
                  boxShadow:
                    "0 2px 8px rgba(0,9,48,0.08), 0 0 0 1px rgba(0,9,48,0.06)",
                }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                >
                  <source
                    src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${warehouse.about_video}`}
                    type="video/mp4"
                  />
                </video>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
