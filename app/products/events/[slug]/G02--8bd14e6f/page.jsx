// app/products/events/[slug]/getTitle10/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function GetTitle10Page(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const title10Slug = stored.title10?.slug || null;

    setSlug(title10Slug);
  }, []);

  return <ProductsPage {...props} isGetTitle10Page={true} title10Slug={slug} />;
}
