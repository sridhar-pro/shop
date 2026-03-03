// app/products/events/[slug]/getTitle9/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function GetTitle9Page(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const title9Slug = stored.title9?.slug || null;

    setSlug(title9Slug);
  }, []);

  return <ProductsPage {...props} isGetTitle9Page={true} title9Slug={slug} />;
}
