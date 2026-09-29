"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { useSession } from "@/app/context/SessionContext";

/**
 * MobileSearchBar
 * ──────────────
 * Always-visible fixed search strip, mobile only (< lg).
 * Rendered inside Navbar's return, after the closing </nav> tag but still
 * inside the spacer div. Position is controlled via inline style using
 * the isScrolled prop passed from Navbar — no CSS var inheritance needed.
 */
const MobileSearchBar = ({ isScrolled }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const { isLoggedIn, companyId } = useSession();
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  // Navbar heights:
  //   mobile marquee  = 48px (h-12), navbar body ≈ 62px → total 110px unscrolled
  //   md marquee      = 36px (h-9),  navbar body ≈ 62px → total 98px  unscrolled
  //   scrolled        = marquee gone, navbar snaps to top-0, body ≈ 62px
  //
  // The <nav> uses translateY(48px) on mobile when unscrolled, so its visual
  // bottom = 0 + 48 + ~62 = 110px. When scrolled: translateY(0) + ~62 = 62px.
  // We nudge +2px so the strip kisses the nav border cleanly.
  const stripTop = isScrolled ? "64px" : "112px";

  const handleSearch = async (searchTerm) => {
    const cleanedTerm = searchTerm.trim();
    if (!cleanedTerm) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        "/api/getProducts",
        {
          filters: { page: 1, query: cleanedTerm, limit: 8 },
          ...(isLoggedIn && companyId ? { company_id: companyId } : {}),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data?.products) {
        setResults(res.data.products);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Mobile search failed:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    timeoutRef.current = setTimeout(() => handleSearch(value), 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products/query?query=${encodeURIComponent(query)}`, {
      scroll: false,
    });
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        .msb-strip {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 68;
  background: transparent;
  border-bottom: none;
  padding: 7px 12px;
  box-shadow: none;
  transition: top 500ms ease-in-out;
}
        .msb-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid rgba(160,3,0,0.13);
          border-radius: 14px;
          padding: 8px 10px 8px 14px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 1px 8px rgba(0,0,0,0.04);
        }
        .msb-form:focus-within {
          border-color: #A00300;
          box-shadow: 0 0 0 3px rgba(160,3,0,0.07), 0 2px 16px rgba(160,3,0,0.09);
        }
        .msb-icon {
          width: 16px; height: 16px;
          color: #A00300; flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .msb-form:focus-within .msb-icon { transform: scale(1.12); }
        .msb-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 14px; font-weight: 400; color: #1a1a1a; min-width: 0;
        }
        .msb-input::placeholder { color: #bbb; font-weight: 300; }
        .msb-loading {
          width: 40px; height: 2px; border-radius: 2px; flex-shrink: 0;
          background: linear-gradient(90deg, #A00300 0%, #ff6b6b 50%, #A00300 100%);
          background-size: 200% 100%;
          animation: msb-shimmer 1.1s linear infinite;
        }
        @keyframes msb-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .msb-clear {
          width: 24px; height: 24px; border-radius: 50%; border: none;
          background: #f0f0f0; display: flex; align-items: center;
          justify-content: center; cursor: pointer; color: #888; flex-shrink: 0;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .msb-clear:hover { background: #ffe5e5; color: #A00300; transform: rotate(90deg); }
        .msb-submit {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 10px; border: none;
          background: #A00300; color: #fff; cursor: pointer; flex-shrink: 0;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .msb-submit:hover  { background: #850200; transform: scale(1.05); }
        .msb-submit:active { transform: scale(0.95); }
        .msb-submit svg { width: 14px; height: 14px; }
        .msb-dropdown {
          position: absolute; left: 12px; right: 12px; top: calc(100% + 6px);
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 12px 36px rgba(0,0,0,0.13);
          overflow: hidden; z-index: 200;
          animation: msb-dropIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes msb-dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .msb-results { max-height: 300px; overflow-y: auto; scrollbar-width: none; }
        .msb-results::-webkit-scrollbar { display: none; }
        .msb-result-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 14px;
          cursor: pointer; transition: background 0.12s ease;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .msb-result-item:last-child { border-bottom: none; }
        .msb-result-item:active { background: #fff5f5; }
        .msb-result-img {
          width: 48px; height: 48px; border-radius: 10px;
          object-fit: cover; flex-shrink: 0; background: #f5f5f5;
        }
        .msb-result-text { flex: 1; min-width: 0; }
        .msb-result-name {
          font-size: 13.5px; font-weight: 600; color: #111;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          text-transform: capitalize; margin-bottom: 3px;
        }
        .msb-result-desc {
          font-size: 11.5px; color: #999;
          display: -webkit-box; -webkit-line-clamp: 1;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .msb-view-all {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; width: 100%; padding: 11px;
          background: linear-gradient(135deg, #A00300 0%, #c40400 100%);
          color: #fff; border: none; font-size: 12.5px; font-weight: 600;
          cursor: pointer; letter-spacing: 0.03em; text-transform: uppercase;
          transition: background 0.2s ease;
        }
        .msb-view-all:active { background: #850200; }
        .msb-view-all svg { width: 13px; height: 13px; }
      `}</style>

      <div
        className="msb-strip lg:hidden font-odop"
        ref={containerRef}
        style={{ top: stripTop }}
      >
        <form onSubmit={handleSubmit} className="msb-form">
          <Search className="msb-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search products…"
            className="msb-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {isLoading && <div className="msb-loading" />}
          {query && (
            <button
              type="button"
              className="msb-clear"
              onClick={clearQuery}
              aria-label="Clear search"
            >
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
          <button type="submit" className="msb-submit" aria-label="Search">
            <ArrowRight />
          </button>
        </form>

        {showDropdown && results.length > 0 && (
          <div className="msb-dropdown">
            <div className="msb-results">
              {results.map((product) => (
                <div
                  key={product.id}
                  className="msb-result-item"
                  onClick={() => {
                    router.push(`/products/${product.slug}`);
                    setShowDropdown(false);
                    setQuery("");
                  }}
                >
                  <img
                    src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${product.image}`}
                    alt={product.name}
                    className="msb-result-img"
                  />
                  <div className="msb-result-text">
                    <p className="msb-result-name">{product.name}</p>
                    <p className="msb-result-desc">
                      {product.details || "Perfect for every occasion!"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="msb-view-all"
              onClick={() => {
                router.push(
                  `/products/query?query=${encodeURIComponent(query)}`,
                );
                setShowDropdown(false);
              }}
            >
              View all results <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileSearchBar;
