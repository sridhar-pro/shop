// app/products/events/[slug]/getTitle12/page.jsx
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function GetTitle12Page(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const title12Slug = stored.title12?.slug || null;

    setSlug(title12Slug);
  }, []);

  return <ProductsPage {...props} isGetTitle12Page={true} title12Slug={slug} />;
}
