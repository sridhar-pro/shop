import AllProductsPage from "./AllProductsPage";

export default function ProductsPage(props) {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Products | Yuukke",
    url: "https://shop.yuukke.com/products",
    description:
      "Explore eco-friendly, handmade, and sustainable products from women-owned brands on Yuukke.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />

      <AllProductsPage {...props} />
    </>
  );
}
