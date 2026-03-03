// app/products/events/[slug]/getTitle11/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function GetTitle11Page(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const title11Slug = stored.title11?.slug || null;

    setSlug(title11Slug);
  }, []);

  return <ProductsPage {...props} isGetTitle11Page={true} title11Slug={slug} />;
}
