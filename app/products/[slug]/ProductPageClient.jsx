"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "@/app/utils/AuthContext";
import CartSidebar from "@/app/components/CartSideBar";
import { useTranslation } from "react-i18next";
import useMetaUpdater from "@/app/hooks/useMetaUpdater";
import { useSession } from "@/app/context/SessionContext";
import { trackProductHistory } from "@/app/utils/productHistory";

// Sub-components
import ProductImageGallery from "./ProductImageGallery";
import ProductMobileInfo from "./ProductMobileInfo";
import ProductVariants from "./ProductVariants";
import ProductPersonalisedText from "./ProductPersonalisedText";
import ProductPriceSection from "./ProductPriceSection";
import ProductOffersSection from "./ProductOffersSection";
import ProductSpecifications from "./ProductSpecifications";
import ProductDescription from "./ProductDescription";
import ProductReviews from "./ProductReviews";
import ProductStore from "./ProductStore";
import ProductSellerProducts from "./ProductSellerProducts";
import ProductActions from "./ProductActions";
import ProductRelatedItems from "./ProductRelatedItems";

export default function ProductPageClient() {
  const { t } = useTranslation();
  const reviewsRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useSession();
  const [showPopupenq, setShowPopupenq] = useState(false);
  const [sms, setSms] = useState("");
  const [loadingenq, setLoadingenq] = useState(false);

  const [invalidVideos, setInvalidVideos] = useState([]);

  const [summaryTags, setSummaryTags] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [positiveTags, setPositiveTags] = useState([]);
  const [negativeTags, setNegativeTags] = useState([]);

  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [customModelText, setCustomModelText] = useState("");

  const [personalisedText, setPersonalisedText] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const key = `personalised_text_product_${product?.id}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored)?.text || "" : "";
    } catch {
      return "";
    }
  });

  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

  const { getValidToken } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(() => {
    if (Number(product?.minimum_order_limit) === 1) {
      return Number(product?.minimum_order_qty) > 0
        ? Number(product.minimum_order_qty)
        : 1;
    }
    return 1;
  });

  useEffect(() => {
    if (Number(product?.minimum_order_limit) === 1) {
      setQuantity(
        Number(product?.minimum_order_qty) > 0
          ? Number(product.minimum_order_qty)
          : 1,
      );
    } else {
      setQuantity(1);
    }
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    const key = `personalised_text_product_${product.id}`;
    if (personalisedText?.trim()) {
      localStorage.setItem(
        key,
        JSON.stringify({ text: personalisedText, updatedAt: Date.now() }),
      );
      console.log("💾 Personalised Text Auto-Saved:", {
        key,
        value: personalisedText,
      });
    }
  }, [personalisedText, product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    const key = `personalised_text_product_${product.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setPersonalisedText(JSON.parse(stored)?.text || "");
        console.log("🔄 Personalised Text Restored:", key);
      } catch {
        setPersonalisedText("");
      }
    }
  }, [product?.id]);

  const [showPopup, setShowPopup] = useState(false);
  const [pincode, setPincode] = useState(() => {
    return localStorage.getItem("user_pincode") || "600002";
  });
  const [city, setCity] = useState("Chennai");
  const [locationUpdated, setLocationUpdated] = useState(false);

  const handleUpdate = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  const handleSave = async (retry = false) => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }
    const toastId = toast.loading("Validating pincode...");
    try {
      const token = await getValidToken();
      if (!token) {
        if (!retry) {
          localStorage.removeItem("authToken");
          await login();
          toast.dismiss(toastId);
          return handleSave(true);
        } else {
          throw new Error("Authentication failed");
        }
      }
      const res = await fetch("/api/pincode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pincode, country: "IN" }),
      });
      const data = await res.json();
      const result = data?.data?.data;
      if (result?.pincode && result?.country === "IN" && result?.city) {
        setCity(result.city);
        setPincode(result.pincode);
        localStorage.setItem("user_pincode", result.pincode);
        setShowPopup(false);
        setLocationUpdated(true);
        toast.update(toastId, {
          render: "Location updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Invalid pincode or city not found.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error("Error validating pincode:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong while fetching city.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleEnquire = () => {
    setShowPopupenq(true);
  };

  // name, email, phone come from ProductActions local state via handleModalSubmit
  const handleSubmit = async ({ name, email, phone } = {}) => {
    try {
      setLoadingenq(true);
      const company_id = localStorage.getItem("company_id");

      const payload = {
        product_id: product?.id,
        company_id: company_id ? parseInt(company_id) : 0,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        sms,
      };

      const token = await getValidToken();
      const res = await fetch("/api/addenquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send enquiry");
      setShowPopupenq(false);
      setSms("");
      toast.success("Enquiry submitted successfully 🎉");
    } catch (err) {
      console.error("Error submitting enquiry:", err);
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoadingenq(false);
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const [viewerCount, setViewerCount] = useState(
    () => Math.floor(Math.random() * 16) + 15,
  );
  const [lastUpdated, setLastUpdated] = useState("just now");

  const [showFullDesc, setShowFullDesc] = useState(false);

  const { isShort, limitedText } = useMemo(() => {
    if (!product?.description) return { isShort: true, limitedText: "" };
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = product.description;
    const fullText = tempDiv.textContent.trim();
    const words = fullText.split(/\s+/);
    if (words.length <= 70) return { isShort: true, limitedText: fullText };
    const trimmed = words.slice(0, 70).join(" ");
    const lastDotIndex = trimmed.lastIndexOf(".");
    const finalCut =
      lastDotIndex !== -1 && lastDotIndex > 20
        ? trimmed.slice(0, lastDotIndex + 1)
        : trimmed + "...";
    return { isShort: false, limitedText: finalCut };
  }, [product]);

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const col3Ref = useRef(null);

  useEffect(() => {
    // Returns which column element the pointer is currently inside, or null
    const getHoveredCol = (x, y) => {
      const cols = [col1Ref.current, col2Ref.current, col3Ref.current];
      for (const col of cols) {
        if (!col) continue;
        const rect = col.getBoundingClientRect();
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          return col;
        }
      }
      return null;
    };

    const handleScrollRedirect = (e) => {
      // Only intercept on desktop (lg breakpoint = 1024px)
      if (window.innerWidth < 1024) return;

      const col = getHoveredCol(e.clientX, e.clientY);

      // Cursor is not over any of the 3 columns — let page scroll normally
      if (!col) return;

      const scrollingDown = e.deltaY > 0;
      const colScrollTop = col.scrollTop;
      const colMaxScroll = col.scrollHeight - col.clientHeight;
      const windowScrollTop = window.scrollY;

      const atTop = colScrollTop <= 1;
      const atBottom = colMaxScroll <= 1 || colScrollTop >= colMaxScroll - 1;
      // colMaxScroll <= 1 means this column has no internal scroll (col1, col3 are typically not scrollable)

      if (scrollingDown) {
        if (!atBottom) {
          // Column still has room — scroll it
          e.preventDefault();
          col.scrollTop += e.deltaY;
        }
        // else: column exhausted — let the page scroll naturally (don't preventDefault)
      } else {
        // Scrolling up
        if (windowScrollTop > 0 && atTop) {
          // Column is at top AND page is scrolled — scroll page up first
          e.preventDefault();
          window.scrollBy({ top: e.deltaY, behavior: "auto" });
        } else if (!atTop) {
          // Column still has upward room — scroll it
          e.preventDefault();
          col.scrollTop += e.deltaY;
        }
        // else: both column at top and page at top — nothing to do
      }
    };

    document.addEventListener("wheel", handleScrollRedirect, {
      passive: false,
    });
    return () => document.removeEventListener("wheel", handleScrollRedirect);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(
      () => setLastUpdated("1 minute ago"),
      60000,
    );
    const countInterval = setInterval(
      () => {
        const direction = Math.random() < 0.55 ? 1 : -1;
        const amount = Math.floor(Math.random() * 2) + 1;
        setViewerCount((prev) =>
          Math.max(15, Math.min(30, prev + direction * amount)),
        );
      },
      8000 + Math.random() * 7000,
    );
    return () => {
      clearInterval(timeInterval);
      clearInterval(countInterval);
    };
  }, []);

  const params = useParams();
  const slug = params?.slug;

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      const productSlug = Array.isArray(slug) ? slug[0] : slug;
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));

      const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const token = await getValidToken();
          if (token && typeof token === "string" && token.length > 10)
            return token;
          if (attempt === Math.floor(maxAttempts / 2))
            localStorage.removeItem("authToken");
          await wait(delay);
        }
        throw new Error("❌ Auth token unavailable after multiple retries.");
      };

      try {
        let token = await getTokenWithRetry();

        const fetchData = async (retry = false) => {
          const res = await fetch("/api/quantityCheck", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              slug: productSlug,
              id: productSlug.split("-").pop() || "",
            }),
          });
          if (res.status === 401 && !retry) {
            localStorage.removeItem("authToken");
            token = await getTokenWithRetry();
            return fetchData(true);
          }
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return await res.json();
        };

        const data = await fetchData();
        console.log("Single product data : ", data);

        if (data?.status === "No Data Found") {
          setTimeout(() => window.location.replace("/products"), 300);
          return;
        }

        if (!data?.data?.[0]) throw new Error("Product data not found");
        const p = data.data[0];

        try {
          const recentItem = {
            id: p.id,
            slug: p.slug || productSlug,
            name: p.name,
            image: p.p_image || "/placeholder-product.jpg",
            price: p.price
              ? parseFloat(p.price.toString().replace(/,/g, ""))
              : 0,
            promo_price: p.promo_price
              ? parseFloat(p.promo_price.toString().replace(/,/g, ""))
              : null,
            business_type: p.business_type,
            quantity: p.quantity,
            promo_tag: p.promo_tag,
            bogo_value: p.bogo_value,
            review: p.review,
            image_g: p.product_image || null,
          };
          const raw = localStorage.getItem("recentlyViewedProducts");
          let existing = [];
          if (raw) {
            try {
              existing = JSON.parse(raw);
              if (!Array.isArray(existing)) existing = [];
            } catch {
              existing = [];
            }
          }
          const filtered = existing.filter((item) => item.id !== recentItem.id);
          const updated = [recentItem, ...filtered].slice(0, 4);
          localStorage.setItem(
            "recentlyViewedProducts",
            JSON.stringify(updated),
          );
        } catch (storageErr) {
          console.warn("Failed to update recently viewed:", storageErr);
        }

        setProduct({
          id: p.id,
          name: p.name,
          description: p.product_details || "No description available",
          price: p.price ? parseFloat(p.price.toString().replace(/,/g, "")) : 0,
          promo_price: p.promo_price
            ? parseFloat(p.promo_price.toString().replace(/,/g, ""))
            : null,
          end_date: p.end_date,
          promo_tag: p.promo_tag,
          promotion: Number(p.promotion || 0),
          quantity: p.quantity,
          review: p.review,
          review_count: Array.isArray(p.all_reviews) ? p.all_reviews.length : 0,
          all_reviews: p.all_reviews || [],
          category: p.category,
          brand: p.brand,
          weight: p.weight,
          dimensions: p.dimensions,
          specifications: p.specifications,
          image: p.p_image || "/placeholder-product.jpg",
          product_video: p.product_video,
          image_g: Array.isArray(p.product_image)
            ? [...p.product_image].reverse()
            : [],
          store_details: p.store_details || [],
          sellerproduct: p.sellerproduct || [],
          related_items: p.related_items || [],
          seller: p.seller || {},
          length: p.length || 0,
          width: p.width || 0,
          height: p.height || 0,
          product_returnable: p.product_returnable,
          minimum_order_qty: p.minimum_order_qty,
          minimum_order_limit: p.minimum_order_limit,
          offers: p.offers,
          customize: p.customize === "1",
          bogo_offer: p.bogo_offer
            ? Array.isArray(p.bogo_offer)
              ? p.bogo_offer.map((b) => ({ ...b, bogo_title: b.title }))
              : [{ ...p.bogo_offer, bogo_title: p.bogo_offer.title }]
            : [],
          variants: (p.product_variants || []).map((v) => ({
            ...v,
            variant_quantity: v.quantity,
            front_view: v.front_view || null,
            back_view: v.back_view || null,
            side_view: v.side_view || null,
            top_view: v.top_view || null,
            zoom_view: v.zoom_view || null,
          })),
          variant_dropdown: p.variant_dropdown || [],
        });

        setSelectedImage(p.p_image || "/placeholder-product.jpg");

        if (data.metaData) setMetaData(data.metaData);
        else if (p.meta_title || p.meta_description || p.meta_image)
          setMetaData({
            title: p.meta_title || "",
            description: p.meta_description || "",
            image: p.meta_image || "",
            keywords: p.meta_keywords || "",
          });
      } catch (err) {
        console.error("[Silent Catch] Product fetch failed:", err.message);
        if (err.message !== "No Data Found")
          setError("Something went wrong loading product.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProductDetails();
  }, [slug, getValidToken]);

  const reviews = Array.isArray(product?.all_reviews)
    ? product.all_reviews
    : [];

  const handleReviewClick = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getReviewSignature = (reviews) =>
    reviews.map((r) => `${r.id}-${r.updated_at || r.created_at}`).join("|");

  useEffect(() => {
    console.group("🧠 Review Summary Engine");
    if (!product?.id) {
      console.warn("⛔ No product ID → skipping execution");
      console.groupEnd();
      return;
    }
    if (!reviews?.length) {
      console.warn("🟡 No reviews available → nothing to process");
      console.groupEnd();
      return;
    }
    console.log("📦 Product ID:", product.id);
    console.log("📝 Total Reviews:", reviews.length);

    const cacheKey = `review_summary_${product.id}`;
    const signatureKey = `review_signature_${product.id}`;
    const currentSignature = getReviewSignature(reviews);
    console.log("🔑 Current Signature:", currentSignature);

    const cachedTags = localStorage.getItem(cacheKey);
    const cachedSignature = localStorage.getItem(signatureKey);

    if (cachedTags && cachedSignature === currentSignature) {
      console.log("⚡ CACHE HIT → Using stored summary");
      try {
        const parsed = JSON.parse(cachedTags);
        setSummaryTags(parsed.positiveTags || []);
        setPositiveTags(parsed.positiveTags || []);
        setNegativeTags(parsed.negativeTags || []);
        console.log("🏷️ Cached Tags:", parsed);
      } catch (err) {
        console.error("❌ Failed to parse cached data:", err);
      }
      console.groupEnd();
      return;
    }

    console.log("🚀 CACHE MISS → Fetching new summary from API");
    const controller = new AbortController();

    fetch("/api/review-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews }),
      signal: controller.signal,
    })
      .then((res) => {
        console.log("🌐 API Response Status:", res.status);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          console.log("✅ API SUCCESS");
          console.log("🏷️ Generated Tags:", data.tags);
          setSummaryTags(data.positiveTags || []);
          setPositiveTags(data.positiveTags || []);
          setNegativeTags(data.negativeTags || []);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              tags: data.tags,
              positiveTags: data.positiveTags,
              negativeTags: data.negativeTags,
            }),
          );
          localStorage.setItem(signatureKey, currentSignature);
          console.log("💾 Cache Stored Successfully");
        } else {
          console.warn("⚠️ API returned success=false");
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("🛑 Fetch aborted (expected during re-render)");
        } else {
          console.error("❌ API ERROR:", err);
        }
      });

    return () => {
      console.log("🧹 Cleanup → Aborting fetch if needed");
      controller.abort();
      console.groupEnd();
    };
  }, [reviews, product?.id]);

  useMetaUpdater(metaData);

  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    if (!product) return;
    const activeVariant =
      selectedVariants?.[product.id] ||
      (product.variants?.length > 0 ? product.variants[0] : null);

    const BASE_URL = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/`;
    const variantImages = activeVariant
      ? [
          activeVariant.front_view,
          activeVariant.back_view,
          activeVariant.side_view,
          activeVariant.top_view,
          activeVariant.zoom_view,
        ]
          .filter(Boolean)
          .map((img) => (img.startsWith("http") ? img : `${BASE_URL}${img}`))
      : [];

    const productImages = (product.image_g || []).map((img) =>
      img.startsWith("http") ? img : `${BASE_URL}${img}`,
    );

    const imagesToShow =
      variantImages.length > 0 ? variantImages : productImages;
    if (imagesToShow.length > 0) setSelectedImage(imagesToShow[0]);
    else setSelectedImage(product.image || null);
  }, [selectedVariants, product]);

  useEffect(() => {
    if (!product) return;
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariants((prev) => ({ ...prev, [product.id]: firstVariant }));
      const firstVariantQty = Number(firstVariant?.variant_quantity || 1);
      setQuantity(firstVariantQty > 0 ? 1 : 0);
    } else {
      setQuantity(Number(product.minimum_order_qty) || 1);
    }
  }, [product]);

  const hitProductHistory = async (product) => {
    if (!product?.id) return;
    try {
      const token = await getValidToken();
      if (!token) return;
      await fetch("/api/product_history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          view_count: 1,
          cart_count: 0,
          warehouse_id: product?.seller?.warehouse_id,
        }),
      });
    } catch (err) {
      console.error("📊 Product history failed:", err);
    }
  };

  const persistPersonalisedText = (cartId, productId) => {
    if (!personalisedText?.trim()) {
      console.log("🟡 Personalised Text SKIPPED (empty or whitespace only)");
      return;
    }
    const storageKey = `personalised_text_${cartId}_${productId}`;
    const payload = {
      text: personalisedText.trim(),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      console.group("✅ Personalised Text Stored");
      console.log("📦 Storage Key:", storageKey);
      console.log("📝 Stored Text:", payload.text);
      console.log("🕒 Timestamp:", payload.createdAt);
      console.groupEnd();
    } catch (e) {
      console.error("❌ Failed to store personalised text", e);
    }
  };

  useEffect(() => {
    if (!product?.id) return;
    hitProductHistory(product);
  }, [product?.id]);

  const handleBuyNow = async () => {
    const availableQty =
      Array.isArray(product.variants) &&
      product.variants.length > 0 &&
      selectedVariants?.[product.id]
        ? Number(selectedVariants[product.id].variant_quantity || 0)
        : Number(product.quantity || 0);

    if (!availableQty || availableQty < 1) {
      toast.error("🚫 This product is out of stock.");
      return;
    }
    if (quantity > availableQty) {
      toast.error(`🚫 Only ${availableQty} item(s) left in stock.`);
      return;
    }

    const toastId = toast.loading("Processing your order...");
    try {
      if (!product?.id) throw new Error("No product selected");

      let cartId = localStorage.getItem("cart_id");
      if (!cartId) {
        cartId =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        localStorage.setItem("cart_id", cartId);
      }

      const payload = {
        selected_country: "IN",
        product_id: product.id,
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id
            : [],
        historypincode: Number(
          localStorage.getItem("user_pincode") || pincode || 600002,
        ),
        qty: quantity,
        cart_id: cartId,
        ...(personalisedText?.trim() && {
          customize_text: personalisedText.trim(),
        }),
        variant_dropdown: selectedModel
          ? selectedModel.name.toLowerCase() === "others"
            ? `${selectedModel.name}-${customModelText}`
            : selectedModel.options?.length > 0
              ? `${selectedModel.name}-${selectedOption?.name || ""}`
              : selectedModel.name
          : null,
      };

      let token = localStorage.getItem("authToken");
      const fetchToken = async () => {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (data?.status === "success" && data?.token) {
          localStorage.setItem("authToken", data.token);
          return data.token;
        }
        throw new Error("Authentication failed");
      };

      if (!token) token = await fetchToken();

      let response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        token = await fetchToken();
        response = await fetch("/api/addcart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result?.status === "error") {
        const message =
          result?.errors?.[0] ||
          result?.error ||
          "Unable to add items to cart.";
        toast.dismiss(toastId);
        toast.error(`🚫 ${message}`, { autoClose: 3000 });
        return;
      }

      trackProductHistory({
        token,
        productId: product.id,
        cartCount: quantity,
        warehouseId: product?.seller?.warehouse_id,
      });

      persistPersonalisedText(cartId, product.id);

      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });

        let taxData;
        if (taxRes.status === 401) {
          localStorage.removeItem("authToken");
          const retryToken = await fetchToken();
          const retryTaxRes = await fetch("/api/getTax", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${retryToken}`,
            },
            body: JSON.stringify({ cart_id: cartId }),
          });
          taxData = await retryTaxRes.json();
          window.dispatchEvent(new Event("cart-updated"));
        } else {
          taxData = await taxRes.json();
          window.dispatchEvent(new Event("cart-updated"));
        }
        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      toast.update(toastId, {
        render: "Redirecting to checkout...",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      router.push("/checkout");
    } catch (err) {
      console.error("Buy now error:", err);
      toast.update(toastId, {
        render: err.message || "Something went wrong!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getValidToken();
    const finalOptions = {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    };
    const res = await fetch(url, finalOptions);
    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ TAX API ERROR RESPONSE:", res.status, errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  };

  const handleAddToCart = async () => {
    if (isAdding || !product?.id) return;
    setIsAdding(true);

    try {
      let offersData = [];
      try {
        offersData = product.offers ? JSON.parse(product.offers) : [];
      } catch (e) {
        console.error("Error parsing offers:", e);
        offersData = [];
      }

      const matchingOffer = offersData.find(
        (offer) =>
          offer.offer_qty &&
          offer.offer_price &&
          Number(offer.offer_qty) === quantity,
      );

      let cartId =
        localStorage.getItem("cart_id") ||
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);

      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]",
      );
      const existingIndex = existingCart.findIndex(
        (item) => item.id === product.id,
      );

      const availableQty =
        Array.isArray(product.variants) &&
        product.variants.length > 0 &&
        selectedVariants?.[product.id]
          ? Number(selectedVariants[product.id].variant_quantity || 0)
          : Number(product.quantity || 0);

      if (quantity > availableQty) {
        toast.error(`No items available in stock.`);
        setIsAdding(false);
        return;
      }

      const isPromoValid =
        product?.promo_price &&
        product?.end_date &&
        new Date(product.end_date + "T23:59:59") >= new Date();

      const selectedVariant = selectedVariants?.[product.id] || null;

      const baseProductPrice =
        product.promo_price &&
        Number(product.promo_price) > 0 &&
        product.end_date &&
        new Date(product.end_date + "T23:59:59") >= new Date() &&
        Number(product.promo_price) < Number(product.price)
          ? Number(product.promo_price)
          : Number(product.price);

      const variantPrice = selectedVariant
        ? Number(selectedVariant.price || 0)
        : 0;
      const totalPrice = baseProductPrice + variantPrice;

      const finalPrice = matchingOffer
        ? Number(matchingOffer.offer_price) / quantity
        : isPromoValid
          ? Number(product.promo_price)
          : totalPrice;

      const cartItem = {
        id: product.id,
        name: product.name,
        qty: quantity,
        price: finalPrice,
        image: product.image,
        ...(matchingOffer && {
          isOffer: true,
          offerTotal: Number(matchingOffer.offer_price),
        }),
      };

      const updatedCart =
        existingIndex >= 0
          ? matchingOffer
            ? [
                ...existingCart.slice(0, existingIndex),
                cartItem,
                ...existingCart.slice(existingIndex + 1),
              ]
            : existingCart.map((item, i) =>
                i === existingIndex
                  ? { ...item, qty: quantity, price: finalPrice }
                  : item,
              )
          : [...existingCart, cartItem];

      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      const isValidOffer = (offer) =>
        offer?.promo_price ||
        offer?.promo_tag ||
        offer?.bogo ||
        offer?.matchingQtyOffer ||
        offer?.end_date;

      const offerPayload = {
        promo_price: product.promo_price,
        end_date: product.end_date,
        promo_tag: product.promo_tag,
        bogo: Array.isArray(product.bogo_offer)
          ? product.bogo_offer.length > 0
          : !!product.bogo_offer,
        matchingQtyOffer: matchingOffer
          ? {
              offer_qty: matchingOffer.offer_qty,
              offer_price: matchingOffer.offer_price,
            }
          : null,
        createdAt: Date.now(),
      };

      const now = Date.now();
      if (offerPayload.end_date && now > new Date(offerPayload.end_date)) {
        offerPayload.end_date = null;
      }

      if (isValidOffer(offerPayload)) {
        localStorage.setItem(
          `offer_${product.id}`,
          JSON.stringify(offerPayload),
        );
      } else {
        localStorage.removeItem(`offer_${product.id}`);
      }

      const token = await getValidToken();
      if (!token) {
        toast.error("🔐 Login required to add item to cart.");
        return;
      }

      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: Number(
          localStorage.getItem("user_pincode") || pincode || 600002,
        ),
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id
            : [],
        qty: quantity,
        cart_id: cartId,
        ...(personalisedText?.trim() && {
          customize_text: personalisedText.trim(),
        }),
        ...(matchingOffer && {
          is_offer: true,
          offer_price: matchingOffer.offer_price,
        }),
        variant_dropdown: selectedModel
          ? selectedModel.name.toLowerCase() === "others"
            ? `${selectedModel.name}-${customModelText}`
            : selectedModel.options?.length > 0
              ? `${selectedModel.name}-${selectedOption?.name || ""}`
              : selectedModel.name
          : null,
      };

      console.log("Payload data:", payload);

      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("⚠️ Session expired. Please login again.");
        return;
      }

      const result = await response.json();

      if (result?.status === "error") {
        const message =
          result?.errors?.[0] ||
          result?.error ||
          "Unable to add items to cart.";
        toast.error(`🚫 ${message}`, { autoClose: 3000 });
        return;
      }

      trackProductHistory({
        token,
        productId: product.id,
        cartCount: quantity,
        warehouseId: product?.seller?.warehouse_id,
      });

      persistPersonalisedText(cartId, product.id);

      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        const taxData = await taxRes.json();
        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        window.dispatchEvent(new Event("cart-updated"));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      setIsCartOpen?.(true);
      toast.success("🛒 Added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("💥 Add to cart failed:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddOfferToCart = async (offer) => {
    if (isAdding || !product?.id || !offer?.offer_qty || !offer?.offer_price)
      return;
    setIsAdding(true);

    try {
      const offerQty = Number(offer.offer_qty);
      const offerPrice = Number(offer.offer_price);

      let cartId =
        localStorage.getItem("cart_id") ||
        Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);

      const existingCart = JSON.parse(
        localStorage.getItem("cart_data") || "[]",
      );
      const existingIndex = existingCart.findIndex(
        (item) => item.id === product.id,
      );

      const maxQty = product.quantity || 0;
      if (offerQty > maxQty) {
        toast.error(`Only ${maxQty} items available in stock.`);
        setIsAdding(false);
        return;
      }

      const preparedCartItem = {
        id: product.id,
        name: product.name,
        qty: offerQty,
        price: offerPrice / offerQty,
        image: product.image,
        isOffer: true,
        offerTotal: offerPrice,
        variant_id:
          selectedVariants?.[product.id]?.id ||
          (product.variants?.length > 0 ? product.variants[0].id : null),
      };

      const updatedCart =
        existingIndex >= 0
          ? [
              ...existingCart.slice(0, existingIndex),
              preparedCartItem,
              ...existingCart.slice(existingIndex + 1),
            ]
          : [...existingCart, preparedCartItem];

      localStorage.setItem("cart_data", JSON.stringify(updatedCart));
      setCartItems(updatedCart);

      const token = await getValidToken();
      if (!token) {
        toast.error("🔐 Login required to add item to cart.");
        return;
      }

      const payload = {
        selected_country: "IN",
        product_id: product.id,
        historypincode: Number(
          localStorage.getItem("user_pincode") || pincode || 600002,
        ),
        variant_id:
          Array.isArray(product.variants) && product.variants.length > 0
            ? selectedVariants?.[product.id]?.id || product.variants[0].id
            : [],
        qty: offerQty,
        cart_id: cartId,
        is_offer: true,
        offer_price: offer.offer_price,
        ...(personalisedText?.trim() && {
          customize_text: personalisedText.trim(),
        }),
      };

      const response = await fetch("/api/addcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error("⚠️ Session expired. Please login again.");
        return;
      }

      const result = await response.json();

      if (result?.status === "error") {
        const message =
          result?.errors?.[0] ||
          result?.error ||
          "Unable to add items to cart.";
        toast.error(`🚫 ${message}`, { autoClose: 3000 });
        return;
      }

      trackProductHistory({
        token,
        productId: product.id,
        cartCount: quantity,
        warehouseId: product?.seller?.warehouse_id,
      });

      persistPersonalisedText(cartId, product.id);

      try {
        const taxRes = await fetch("/api/getTax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart_id: cartId }),
        });
        const taxData = await taxRes.json();
        localStorage.setItem("cart_tax_details", JSON.stringify(taxData));
        window.dispatchEvent(new Event("cart-updated"));
      } catch (taxError) {
        console.error("🚫 Failed to fetch tax details:", taxError);
      }

      setIsCartOpen?.(true);
      toast.success("✅ Offer added to cart!");
    } catch (err) {
      console.error("💥 Add offer to cart failed:", err);
      toast.error("Something went wrong!");
    } finally {
      setIsAdding(false);
    }
  };

  const BASE_URL = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/`;

  const activeVariant = product?.id
    ? selectedVariants?.[product.id] ||
      (product.variants?.length > 0 ? product.variants[0] : null)
    : null;

  const variantImages = activeVariant
    ? [
        activeVariant.front_view,
        activeVariant.back_view,
        activeVariant.side_view,
        activeVariant.top_view,
        activeVariant.zoom_view,
      ]
        .filter(Boolean)
        .map((img) => (img.startsWith("http") ? img : `${BASE_URL}${img}`))
    : [];

  const productImages = (product?.image_g || []).map((img) =>
    img.startsWith("http") ? img : `${BASE_URL}${img}`,
  );

  const mediaList =
    variantImages.length > 0
      ? variantImages
      : [
          ...productImages,
          ...(product?.product_video
            ? [`${BASE_URL}${product.product_video}`]
            : []),
        ];

  const filteredMedia = mediaList.filter(
    (item) => !invalidVideos.includes(item),
  );

  const handleModelChange = (modelId) => {
    const model = product.variant_dropdown.find((m) => m.id === modelId);
    setSelectedModel(model);
    setSelectedOption(null);
  };

  const isCustomizationRequired =
    product?.customize && !personalisedText?.trim();

  const isDropdownRequired =
    Array.isArray(product?.variant_dropdown) &&
    product.variant_dropdown.length > 0 &&
    (!selectedModel ||
      (selectedModel?.name?.toLowerCase() === "others"
        ? !customModelText.trim()
        : selectedModel?.options?.length > 0 && !selectedOption));

  const isBlocked = isAdding || isCustomizationRequired || isDropdownRequired;
  const isOthersSelected = selectedModel?.name?.toLowerCase() === "others";

  const availableQty =
    Array.isArray(product?.variants) &&
    product.variants.length > 0 &&
    selectedVariants?.[product.id]
      ? Number(selectedVariants[product.id].variant_quantity || 0)
      : Number(product?.quantity || 0);

  const isOutOfStock = availableQty <= 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <Link
          href="/"
          title="Yuukke Home"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-odop">
      {/* Breadcrumb */}
      <nav className="bg-white py-4 px-6 shadow-sm">
        <div className="container mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                title="Yuukke Home"
                className="text-[#A00300] hover:underline"
              >
                {t("Home")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link
                href="/products"
                title="Browse all Products"
                className="text-[#A00300] hover:underline"
              >
                {t("Products")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="text-gray-600 line-clamp-1">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* 3-Column Layout */}
      <div className="w-full flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden mt-8">
        {/* Column 1 — Image Gallery (40%) */}
        <div
          ref={col1Ref}
          className="w-full lg:w-[40%] lg:sticky top-0 overflow-hidden order-1"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
            {/* Mobile Info (name, price, stars, etc.) */}
            <ProductMobileInfo
              product={product}
              selectedVariants={selectedVariants}
              reviews={reviews}
              handleReviewClick={handleReviewClick}
            />

            {/* Image Gallery */}
            <ProductImageGallery
              product={product}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              filteredMedia={filteredMedia}
              variantImages={variantImages}
              productImages={productImages}
              invalidVideos={invalidVideos}
              setInvalidVideos={setInvalidVideos}
              DOMAIN_KEY={DOMAIN_KEY}
            />
          </div>

          {/* Mobile Variants + Personalised Text */}
          <ProductVariants
            product={product}
            selectedVariants={selectedVariants}
            setSelectedVariants={setSelectedVariants}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            customModelText={customModelText}
            setCustomModelText={setCustomModelText}
            isOthersSelected={isOthersSelected}
            handleModelChange={handleModelChange}
            isMobile={true}
          />

          {product?.customize && (
            <ProductPersonalisedText
              personalisedText={personalisedText}
              setPersonalisedText={setPersonalisedText}
              isMobile={true}
            />
          )}
        </div>

        {/* Column 2 — Product Details (35%) */}
        <div
          ref={col2Ref}
          className="w-full lg:w-[35%] px-4 py-0 overflow-visible lg:overflow-y-auto scrollbar-hide order-3 lg:order-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="py-0 px-4">
            <div className="space-y-6">
              {/* Desktop: Price, Name, Stars */}
              <ProductPriceSection
                product={product}
                selectedVariants={selectedVariants}
                handleReviewClick={handleReviewClick}
                reviews={reviews}
              />

              {/* Desktop: Variants + Personalised Text */}
              <div className="space-y-4">
                <ProductVariants
                  product={product}
                  selectedVariants={selectedVariants}
                  setSelectedVariants={setSelectedVariants}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  customModelText={customModelText}
                  setCustomModelText={setCustomModelText}
                  isOthersSelected={isOthersSelected}
                  handleModelChange={handleModelChange}
                  isMobile={false}
                />

                {product?.customize && (
                  <ProductPersonalisedText
                    personalisedText={personalisedText}
                    setPersonalisedText={setPersonalisedText}
                    isMobile={false}
                  />
                )}
              </div>

              {/* Offers */}
              <ProductOffersSection
                product={product}
                handleAddOfferToCart={handleAddOfferToCart}
              />

              {/* Specifications */}
              <ProductSpecifications product={product} />

              {/* Description */}
              <ProductDescription
                product={product}
                isShort={isShort}
                limitedText={limitedText}
                showFullDesc={showFullDesc}
                setShowFullDesc={setShowFullDesc}
              />

              {/* Reviews */}
              <ProductReviews
                product={product}
                reviews={reviews}
                reviewsRef={reviewsRef}
                summaryTags={summaryTags}
              />

              {/* Static Badges */}
              <div className="grid grid-cols-3 gap-x-2 mt-4">
                {["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"].map(
                  (img, i) => (
                    <div
                      key={i}
                      className="flex justify-center items-center p-2"
                    >
                      <Image
                        src={`/${img}`}
                        alt={`${product.name || "Product"} Image ${i + 1}`}
                        title={`${product.name || "Product"} Image ${i + 1}`}
                        width={300}
                        height={300}
                        className="object-cover"
                      />
                    </div>
                  ),
                )}
              </div>

              {/* Store */}
              <ProductStore product={product} DOMAIN_KEY={DOMAIN_KEY} />

              {/* More from Seller */}
              <ProductSellerProducts
                product={product}
                DOMAIN_KEY={DOMAIN_KEY}
              />
            </div>
          </div>
        </div>

        {/* Column 3 — Actions (25%) */}
        <div
          ref={col3Ref}
          className="w-full lg:w-[25%] bg-white px-4 py-6 border-t lg:border-t-0 lg:border-l border-gray-100 order-2 lg:order-3"
        >
          <ProductActions
            product={product}
            selectedVariants={selectedVariants}
            quantity={quantity}
            setQuantity={setQuantity}
            isAdding={isAdding}
            isOutOfStock={isOutOfStock}
            isBlocked={isBlocked}
            isCustomizationRequired={isCustomizationRequired}
            isDropdownRequired={isDropdownRequired}
            handleAddToCart={handleAddToCart}
            handleBuyNow={handleBuyNow}
            handleEnquire={handleEnquire}
            showPopupenq={showPopupenq}
            setShowPopupenq={setShowPopupenq}
            sms={sms}
            setSms={setSms}
            loadingenq={loadingenq}
            handleSubmit={handleSubmit}
            pincode={pincode}
            setPincode={setPincode}
            city={city}
            locationUpdated={locationUpdated}
            showPopup={showPopup}
            handleUpdate={handleUpdate}
            handleClose={handleClose}
            handleSave={handleSave}
          />
        </div>

        {isCartOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsCartOpen(false)}
            />
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          </>
        )}
      </div>

      {/* Related Products */}
      <ProductRelatedItems product={product} DOMAIN_KEY={DOMAIN_KEY} />
    </div>
  );
}
