"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "../context/SessionContext";

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const { isLoggedIn, companyId } = useSession();

  const handleSearch = async (searchTerm) => {
    const cleanedTerm = searchTerm.trim();

    if (!cleanedTerm) {
      setResults([]);
      return;
    }

    if (!isLoggedIn) {
      try {
        localStorage.setItem("guest_last_search_term", cleanedTerm);
        window.dispatchEvent(
          new CustomEvent("guest-search-updated", {
            detail: { term: cleanedTerm },
          }),
        );
      } catch (storageError) {
        console.error("Failed to store guest search term:", storageError);
      }
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        "/api/getProducts",
        {
          filters: {
            page: 1,
            query: cleanedTerm,
            limit: 10,
          },
          ...(isLoggedIn && companyId ? { company_id: companyId } : {}),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.products) {
        setResults(res.data.products);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Search failed:", err);
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

    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setIsActive(false);
      setShowDropdown(false);
      setQuery("");
      setResults([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products/query?query=${encodeURIComponent(query)}`, {
        scroll: false,
      });
      setIsActive(false);
      setShowDropdown(false);
    }
  };

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isActive) {
        setIsActive(false);
        setShowDropdown(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isActive && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isActive]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');

        .sb-root * {
          font-family: 'Sora', sans-serif;
          box-sizing: border-box;
        }

        /* Trigger button */
        .sb-trigger {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.85);
          border: 1.5px solid rgba(160,3,0,0.12);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 0 rgba(160,3,0,0);
          overflow: hidden;
        }
        .sb-trigger::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(160,3,0,0.04), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .sb-trigger:hover::before { opacity: 1; }
        .sb-trigger:hover {
          border-color: rgba(160,3,0,0.3);
          box-shadow: 0 4px 20px rgba(160,3,0,0.12), 0 0 0 3px rgba(160,3,0,0.06);
          transform: translateY(-1px);
        }
        .sb-trigger:active { transform: translateY(0); }
        .sb-trigger-icon {
          width: 16px;
          height: 16px;
          color: #A00300;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }
        .sb-trigger:hover .sb-trigger-icon { transform: rotate(-10deg) scale(1.1); }
        .sb-trigger-text {
          font-size: 13px;
          font-weight: 500;
          color: #555;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
        .sb-trigger-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #A00300;
          animation: sb-pulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sb-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }

        /* Overlay backdrop */
        .sb-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.2);
          backdrop-filter: blur(3px);
          z-index: 998;
          animation: sb-fadeIn 0.2s ease;
        }
        @keyframes sb-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Search panel */
        .sb-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 999;
          padding: 20px 16px 16px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(160,3,0,0.08);
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          animation: sb-slideDown 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes sb-slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Form */
        .sb-form {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 2px solid rgba(160,3,0,0.15);
          border-radius: 18px;
          padding: 10px 12px 10px 18px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 2px 20px rgba(0,0,0,0.05);
        }
        .sb-form.focused {
          border-color: #A00300;
          box-shadow: 0 0 0 4px rgba(160,3,0,0.08), 0 4px 24px rgba(160,3,0,0.12);
        }
        .sb-form-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          color: #A00300;
          transition: transform 0.3s ease;
        }
        .sb-form.focused .sb-form-icon { transform: scale(1.15); }

        .sb-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 15px;
          font-weight: 400;
          color: #1a1a1a;
          letter-spacing: 0.01em;
          min-width: 0;
        }
        .sb-input::placeholder { color: #aaa; font-weight: 300; }

        /* Loading shimmer in input */
        .sb-loading-bar {
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, #A00300 0%, #ff6b6b 50%, #A00300 100%);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: sb-shimmer 1.2s linear infinite;
          flex-shrink: 0;
        }
        @keyframes sb-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Clear & Submit buttons */
        .sb-clear-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          color: #888;
        }
        .sb-clear-btn:hover { background: #ffe5e5; color: #A00300; transform: rotate(90deg); }

        .sb-submit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #A00300;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .sb-submit-btn:hover { background: #850200; transform: scale(1.04); box-shadow: 0 4px 16px rgba(160,3,0,0.35); }
        .sb-submit-btn:active { transform: scale(0.97); }
        .sb-submit-btn svg { width: 14px; height: 14px; transition: transform 0.2s ease; }
        .sb-submit-btn:hover svg { transform: translateX(3px); }

        /* Dropdown */
        .sb-dropdown {
          max-width: 680px;
          margin: 10px auto 0;
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 16px 48px rgba(0,0,0,0.14);
          overflow: hidden;
          animation: sb-dropIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes sb-dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sb-results-list {
          max-height: 340px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .sb-results-list::-webkit-scrollbar { display: none; }

        .sb-result-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.15s ease;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .sb-result-item:last-child { border-bottom: none; }
        .sb-result-item:hover { background: #fff5f5; }

        .sb-result-img-wrap {
          position: relative;
          width: 62px;
          height: 62px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f5f5f5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .sb-result-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .sb-result-item:hover .sb-result-img { transform: scale(1.06); }

        .sb-result-text { flex: 1; min-width: 0; }
        .sb-result-name {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
          text-transform: capitalize;
        }
        .sb-result-desc {
          font-size: 12px;
          color: #888;
          font-weight: 300;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .sb-result-arrow {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.2s ease;
          color: #A00300;
        }
        .sb-result-item:hover .sb-result-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* View all */
        .sb-view-all {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #A00300 0%, #c40400 100%);
          color: white;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          font-family: 'Sora', sans-serif;
        }
        .sb-view-all:hover { background: linear-gradient(135deg, #850200 0%, #A00300 100%); }
        .sb-view-all svg { width: 14px; height: 14px; transition: transform 0.2s ease; }
        .sb-view-all:hover svg { transform: translateX(4px); }

        /* Close hint */
        .sb-hint {
          max-width: 680px;
          margin: 8px auto 0;
          display: flex;
          justify-content: flex-end;
        }
        .sb-hint-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: #888;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Sora', sans-serif;
        }
        .sb-hint-btn:hover { border-color: #A00300; color: #A00300; }
        .sb-hint-btn kbd {
          font-size: 11px;
          font-weight: 600;
          background: #f0f0f0;
          border-radius: 4px;
          padding: 1px 5px;
        }

        /* Mobile trigger – icon only */
        .sb-trigger-mobile {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(160,3,0,0.15);
          background: rgba(255,255,255,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .sb-trigger-mobile:hover { border-color: #A00300; box-shadow: 0 0 0 3px rgba(160,3,0,0.1); }

        /* Escape key listener */
        @media (max-width: 767px) {
          .sb-panel { padding: 16px 12px 12px; }
          .sb-submit-btn span { display: none; }
          .sb-submit-btn { padding: 8px 10px; }
          .sb-result-img-wrap { width: 50px; height: 50px; }
        }
      `}</style>

      <div className="sb-root relative">
        {/* ── TRIGGER ── */}
        {!isActive && (
          <>
            {/* Mobile: icon only */}
            <button
              onClick={() => {
                setIsActive(true);
                setQuery("");
                setResults([]);
                setShowDropdown(false);
              }}
              className="sb-trigger-mobile md:hidden"
              aria-label="Open search"
            >
              <Search style={{ width: 16, height: 16, color: "#A00300" }} />
            </button>
          </>
        )}

        {/* ── ACTIVE STATE ── */}
        {isActive && (
          <>
            {/* Backdrop */}
            <div
              className="sb-backdrop"
              onClick={() => {
                setIsActive(false);
                setShowDropdown(false);
                setQuery("");
                setResults([]);
              }}
            />

            {/* Panel */}
            <div className="sb-panel" ref={containerRef}>
              {/* Search Form */}
              <form
                onSubmit={handleSubmit}
                className={`sb-form ${isFocused ? "focused" : ""}`}
              >
                <Search className="sb-form-icon" />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Search for the perfect gift…"
                  className="sb-input"
                  autoComplete="off"
                />

                {isLoading && <div className="sb-loading-bar" />}

                {query && (
                  <button
                    type="button"
                    className="sb-clear-btn"
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setShowDropdown(false);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear"
                  >
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                )}

                <button
                  type="submit"
                  className="sb-submit-btn"
                  aria-label="Search"
                >
                  <span>Search</span>
                  <ArrowRight />
                </button>
              </form>

              {/* Dropdown */}
              {showDropdown && results.length > 0 && (
                <div className="sb-dropdown">
                  <div className="sb-results-list">
                    {results.map((product) => (
                      <div
                        key={product.id}
                        className="sb-result-item"
                        onClick={() => {
                          router.push(`/products/${product.slug}`);
                          setIsActive(false);
                          setShowDropdown(false);
                          setQuery("");
                        }}
                      >
                        <div className="sb-result-img-wrap">
                          <img
                            src={`https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${product.image}`}
                            alt={product.name}
                            className="sb-result-img"
                          />
                        </div>
                        <div className="sb-result-text">
                          <p className="sb-result-name">{product.name}</p>
                          <p className="sb-result-desc">
                            {product.details || "Perfect for every occasion!"}
                          </p>
                        </div>
                        <div className="sb-result-arrow">
                          <ArrowRight style={{ width: 13, height: 13 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="sb-view-all"
                    onClick={() => {
                      router.push(
                        `/products/query?query=${encodeURIComponent(query)}`,
                      );
                      setIsActive(false);
                      setShowDropdown(false);
                    }}
                  >
                    View all results
                    <ArrowRight />
                  </button>
                </div>
              )}

              {/* Close hint */}
              <div className="sb-hint">
                <button
                  className="sb-hint-btn"
                  type="button"
                  onClick={() => {
                    setIsActive(false);
                    setShowDropdown(false);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  <kbd>Esc</kbd> to close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SearchBar;
