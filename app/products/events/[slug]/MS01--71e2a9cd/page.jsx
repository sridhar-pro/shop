//app/products/events/[slug]/most-saved/page.jsx
//festival
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function MostSavedPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const mostSavedSlug = stored.featured?.slug || null; // key="featured"
    setSlug(mostSavedSlug);
  }, []);

  return (
    <ProductsPage {...props} isMostSavedPage={true} mostSavedSlug={slug} />
  );
}
