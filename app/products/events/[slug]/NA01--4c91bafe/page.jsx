//app/products/events/[slug]/new-arraivals/page.jsx
//arraival
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function NewarrivalsPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const arrivalSlug = stored.arrival?.slug || null;

    setSlug(arrivalSlug);
  }, []);

  return (
    <ProductsPage {...props} isNewarrivalsPage={true} arrivalSlug={slug} />
  );
}
