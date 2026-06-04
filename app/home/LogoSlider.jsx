"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const LogoSlider = () => {
  const [logos, setLogos] = useState([]);
  const hasFetched = useRef(false);

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchLogos = async () => {
      try {
        const res = await fetch("/api/vendorLogo");
        const data = await res.json();
        if (!data || !Array.isArray(data))
          throw new Error("No logo data received.");
        setLogos(
          data.map((vendor) => ({
            id: vendor.id,
            slug: vendor.slug,
            name: vendor.name,
            logo: `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${vendor.store_logo}`,
          })),
        );
      } catch (error) {
        console.error("⚠️ Error fetching logos:", error);
      }
    };

    fetchLogos();
  }, []);

  const items = [...logos, ...logos];

  return (
    <>
      <style jsx global>{`
        .seller-section {
          padding: 3.5rem 0 4rem;
          position: relative;
          background: #fff;
        }

        .seller-header {
          text-align: center;
          margin-bottom: 2.5rem;
          padding: 0 1rem;
        }

        .seller-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #5f5f5f;
          margin-bottom: 0.75rem;
        }

        .seller-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
        }

        .seller-title {
          font-size: clamp(2rem, 3.5vw, 2.8rem); /* mobile → desktop */
          font-weight: 600;
          color: #a00300;
          margin: 0 0 0.5rem;
          line-height: 1.2;
        }

        .seller-subtitle {
          font-size: 14px;
          font-weight: 300;
          color: #525252;
          margin: 0;
          letter-spacing: 0.01em;
        }

        .seller-divider {
          width: 36px;
          height: 1px;
          background: #e0e0e0;
          margin: 1rem auto 0;
        }

        .seller-track-wrapper {
          position: relative;
          overflow: hidden;
        }

        .seller-fade-left,
        .seller-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 2;
          pointer-events: none;
        }

        .seller-fade-left {
          left: 0;
          background: linear-gradient(to right, #fff 0%, transparent 100%);
        }

        .seller-fade-right {
          right: 0;
          background: linear-gradient(to left, #fff 0%, transparent 100%);
        }

        .seller-track {
          display: flex;
          width: max-content;
          padding: 1.25rem 0;
          animation: seller-scroll 150s linear infinite;
        }

        .seller-track:hover {
          animation-play-state: paused;
        }

        @keyframes seller-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .seller-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 300px;
          height: 185px;
          margin: 0 28px;
          border-radius: 18px;
          border: 0.5px solid #e8e8e8;
          background: #fff;
          transition:
            border-color 0.22s ease,
            transform 0.22s ease,
            background 0.22s ease;
          position: relative;
          flex-shrink: 0;
          overflow: hidden;
          text-decoration: none;
        }

        .seller-card:hover {
          border-color: #a00300;
          transform: translateY(-4px);
          background: #fafafa;
        }

        .seller-logo-img {
          width: 200px;
          height: 124px;
          object-fit: contain;
          filter: none;
          opacity: 1;
          transition: transform 0.22s ease;
        }

        .seller-card:hover .seller-logo-img {
          transform: scale(1.06);
        }

        .seller-card-name {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: #2f2f2f;
          margin-top: 14px;
          text-transform: uppercase;
          transition: color 0.22s ease;

          display: flex;
          justify-content: center; /* horizontal center */
          align-items: center; /* vertical center (if height exists) */
          text-align: center; /* fallback for text */
        }

        .seller-card:hover .seller-card-name {
          color: #a00300;
        }

        .seller-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-top: 2.5rem;
          padding: 1.25rem 1.5rem;
          border-top: 0.5px solid #ebebeb;
          border-bottom: 0.5px solid #ebebeb;
        }

        .seller-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .seller-stat-number {
          font-size: 1.4rem;
          font-weight: 400;
          color: #111;
          line-height: 1;
        }

        .seller-stat-label {
          font-size: 11px;
          font-weight: 300;
          color: #666;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .seller-stat-sep {
          width: 1px;
          height: 28px;
          background: #ebebeb;
        }

        @media (max-width: 768px) {
          .seller-stats {
            gap: 1.25rem;
          }
          .seller-stat-number {
            font-size: 1.15rem;
          }
          .seller-stat-label {
            font-size: 10px;
          }
        }
      `}</style>

      <section className="seller-section font-odop">
        <div className="seller-header">
          <div className="seller-eyebrow">
            <span className="seller-eyebrow-dot" />
            Verified marketplace
            <span className="seller-eyebrow-dot" />
          </div>
          <h2 className="seller-title">Trusted by our sellers</h2>
          <p className="seller-subtitle">
            Handpicked brands, delivered to your door
          </p>
          <div className="seller-divider" />
        </div>

        <div className="seller-track-wrapper">
          <div className="seller-fade-left" />
          <div className="seller-fade-right" />

          <div className="seller-track">
            {items.map((vendor, idx) => (
              <Link
                key={`logo-${idx}`}
                href={{
                  pathname: "/products",
                  query: { warehouses_id: vendor.slug },
                }}
                title={`Explore Products from ${vendor.name}`}
                className="seller-card"
                passHref
              >
                <img
                  src={vendor.logo}
                  alt=""
                  aria-hidden="true"
                  title={vendor.name || vendor.slug}
                  className="seller-logo-img"
                />
                <span className="seller-card-name">{vendor.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LogoSlider;
