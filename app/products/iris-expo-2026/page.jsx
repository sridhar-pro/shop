"use client";

import ProductsPage from "../page"; // reuse your main products page

export default function EOY(props) {
  return <ProductsPage {...props} isEOY={true} />;
}
