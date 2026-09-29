// app/products/offers/page.jsx
"use client";

import ProductsPage from "../page"; // reuse your main products page

export default function OdopPage(props) {
  return <ProductsPage {...props} isOdopPage={true} />;
}
