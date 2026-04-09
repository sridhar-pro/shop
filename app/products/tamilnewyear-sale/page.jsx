// app/products/womensday-saleweek/page.jsx
"use client";

import ProductsPage from "../page"; // reuse your main products page

export default function Womensday(props) {
  return <ProductsPage {...props} isWomensday={true} />;
}
