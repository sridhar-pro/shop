//app/products/events/[slug]/wellness-products/page.jsx
//wellness
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function WellnessProductsPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const wellnessSlug = stored.wellness?.slug || null; // key="wellness"
    setSlug(wellnessSlug);
  }, []);

  return <ProductsPage {...props} isWellnessPage={true} wellnessSlug={slug} />;
}
