//app/products/events/[slug]/return-gifts/page.jsx
//returngift
"use client";

import { useEffect, useState } from "react";
import ProductsPage from "../../../page";

export default function ReturnGiftsPage(props) {
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("homepage_slugs") || "{}");
    const returnSlug = stored.return?.slug || null; // key="return"
    setSlug(returnSlug);
  }, []);

  return (
    <ProductsPage {...props} isReturnGiftsPage={true} returnGiftsSlug={slug} />
  );
}
