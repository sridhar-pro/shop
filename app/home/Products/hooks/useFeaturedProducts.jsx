"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/utils/AuthContext";

export function useFeaturedProducts() {
  const [giftProducts, setGiftProducts] = useState([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [festivalProducts, setFestivalProducts] = useState([]);
  const [wellnessProducts, setWellnessProducts] = useState([]);
  const [corporateProducts, setCorporateProducts] = useState([]);
  const [returnProducts, setReturnProducts] = useState([]);

  const [getTitle9, setGetTitle9] = useState([]);
  const [getTitle10, setGetTitle10] = useState([]);
  const [getTitle11, setGetTitle11] = useState([]);
  const [getTitle12, setGetTitle12] = useState([]);

  const [error, setError] = useState(null);
  const [homePageTitles, setHomePageTitles] = useState({});

  const [loading, setLoading] = useState({
    gift: true,
    arrival: true,
    featured: true,
    festival: true,
    wellness: true,
    corporate: true,
    return: true,
  });

  const hasFetched = useRef(false);
  const { getValidToken, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady || hasFetched.current) return;

    const fetchAllData = async () => {
      hasFetched.current = true;

      const fetchers = [
        { key: "gift", url: "/api/getGiftsProducts", setter: setGiftProducts },
        {
          key: "arrival",
          url: "/api/newArraivals",
          setter: setNewArrivalProducts,
        },
        {
          key: "featured",
          url: "/api/featuredProducts",
          setter: setFeaturedProducts,
        },
        {
          key: "festival",
          url: "/api/festivalProducts",
          setter: setFestivalProducts,
        },
        {
          key: "wellness",
          url: "/api/wellnessProducts",
          setter: setWellnessProducts,
        },
        {
          key: "corporate",
          url: "/api/getCorporateGifts",
          setter: setCorporateProducts,
        },
        {
          key: "return",
          url: "/api/getReturnGifts",
          setter: setReturnProducts,
        },
        { key: "gettitle9", url: "/api/getTitle9", setter: setGetTitle9 },
        { key: "gettitle10", url: "/api/getTitle10", setter: setGetTitle10 },
        { key: "gettitle11", url: "/api/getTitle11", setter: setGetTitle11 },
        { key: "gettitle12", url: "/api/getTitle12", setter: setGetTitle12 },
      ];

      const TTL = 2 * 60 * 60 * 1000; // 2 hours

      const fetchWithCache = async (key, url, setter) => {
        setLoading((prev) => ({ ...prev, [key]: true }));
        const cacheKey = `${key}_cache`;

        try {
          const cachedStr = localStorage.getItem(cacheKey);
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (cached.timestamp && Date.now() - cached.timestamp < TTL) {
              setter(Array.isArray(cached.data) ? cached.data : []);
              const title = cached.data[0]?.homePageTitle || null;
              if (title)
                setHomePageTitles((prev) => ({ ...prev, [key]: title }));
              setLoading((prev) => ({ ...prev, [key]: false }));
              return;
            }
          }

          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();

          const validData = Array.isArray(data) ? data : [];
          setter(validData);

          const title = validData[0]?.homePageTitle || null;
          if (title) {
            const slug = title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");

            const existing = JSON.parse(
              localStorage.getItem("homepage_slugs") || "{}",
            );
            localStorage.setItem(
              "homepage_slugs",
              JSON.stringify({ ...existing, [key]: { title, slug } }),
            );

            setHomePageTitles((prev) => ({ ...prev, [key]: title }));
          }

          localStorage.setItem(
            cacheKey,
            JSON.stringify({ data: validData, timestamp: Date.now() }),
          );
        } catch (err) {
          console.error(`[${key}] Fetch error:`, err.message);
          setError(err.message);

          const cachedStr = localStorage.getItem(cacheKey);
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            setter(Array.isArray(cached.data) ? cached.data : []);
            const title = cached.data[0]?.homePageTitle || null;
            if (title) setHomePageTitles((prev) => ({ ...prev, [key]: title }));
          }
        } finally {
          setLoading((prev) => ({ ...prev, [key]: false }));
        }
      };

      await Promise.all(
        fetchers.map(({ key, url, setter }) =>
          fetchWithCache(key, url, setter),
        ),
      );
    };

    const timer = setTimeout(fetchAllData, 300);
    return () => clearTimeout(timer);
  }, [getValidToken, isAuthReady]);

  const allLoaded = Object.values(loading).every((v) => v === false);

  return {
    giftProducts,
    newArrivalProducts,
    featuredProducts,
    festivalProducts,
    wellnessProducts,
    corporateProducts,
    returnProducts,
    getTitle9,
    getTitle10,
    getTitle11,
    getTitle12,
    error,
    loading,
    allLoaded,
    homePageTitles,
  };
}
