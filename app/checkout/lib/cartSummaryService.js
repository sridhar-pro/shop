// Single place that talks to /api/getTax.
//
// Problem before: CheckoutPage, OrderSummary, CheckoutForm and CheckoutAddress
// each called /api/getTax on mount and again on every "cart-updated" event,
// so one cart change fired 3-4 identical requests.
//
// Now: concurrent callers for the same cart share ONE in-flight request.
// - No long-lived cache, so data is never staler than a request already
//   in progress.
// - "cart-updated" clears the in-flight entry first (this listener is
//   registered at import time, before any component listener), so every
//   listener that reacts to that event joins the same fresh request.
// - After you mutate the cart yourself (applyCoupon, bogo, etc.) and need
//   the new numbers immediately, pass { force: true }.

const inflight = new Map();

export const invalidateCartSummary = () => inflight.clear();

/**
 * @param {string} cartId
 * @param {(url: string, options?: object) => Promise<any>} fetchJson
 *        the caller's own fetchWithAuth (keeps each component's auth behaviour)
 * @param {{ force?: boolean }} [opts]
 */
export const getCartSummary = (cartId, fetchJson, { force = false } = {}) => {
  if (!force && inflight.has(cartId)) return inflight.get(cartId);

  const request = fetchJson("/api/getTax", {
    method: "POST",
    body: { cart_id: cartId },
  }).finally(() => {
    if (inflight.get(cartId) === request) inflight.delete(cartId);
  });

  inflight.set(cartId, request);
  return request;
};

if (typeof window !== "undefined") {
  window.addEventListener("cart-updated", invalidateCartSummary);
}
