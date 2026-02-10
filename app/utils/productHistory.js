/**
 * Tracks product activity (view / cart / etc.)
 * Pure utility – NO hooks here
 */
export const trackProductHistory = async ({
  token,
  productId,
  viewCount = 0,
  cartCount = 0,
  warehouseId = 109,
}) => {
  if (!productId || !token) return;

  try {
    const payload = {
      product_id: productId,
      view_count: viewCount,
      cart_count: cartCount,
      warehouse_id: warehouseId,
    };

    await fetch("/api/product_history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("📊 product_history failed:", err);
  }
};
