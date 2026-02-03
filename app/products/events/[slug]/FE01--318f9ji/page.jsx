//app/products/events/[slug]/FE01--318f9ji/page.jsx
//featured
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function FeaturedPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const featuredSlug = stored.featured?.slug || null; // key="featured"
    setSlug(featuredSlug);
  }, []);

  return <ProductsPage {...props} isFeaturedPage={true} FeaturedSlug={slug} />;
}
