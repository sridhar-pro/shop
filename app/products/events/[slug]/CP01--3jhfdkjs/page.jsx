//app/products/events/[slug]/CP01--3jhfdkjs/page.jsx
//corporate
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function CorporatePage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const corporateSlug = stored.corporate?.slug || null; // key="featured"
    setSlug(corporateSlug);
  }, []);

  return (
    <ProductsPage {...props} isCorporatePage={true} CorporateSlug={slug} />
  );
}
