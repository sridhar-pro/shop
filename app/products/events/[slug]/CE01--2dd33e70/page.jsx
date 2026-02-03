//app/products/events/[slug]/corporate-essentials/page.jsx
//gift
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function CorporateEssentialsPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const corporateSlug = stored.gift?.slug || null; // key = "gift"
    setSlug(corporateSlug);
  }, []);

  return (
    <ProductsPage
      {...props}
      isCorporateEssentialsPage={true}
      corporateSlug={slug}
    />
  );
}
