// Tracks "the shipping price is being updated" for the whole checkout page.
//
// Flow it covers:
//   guest      -> PIN reaches 6 digits   -> /api/shipping -> cart refresh
//   logged in  -> select / edit address  -> /api/shipping -> cart refresh
//
// While anything is pending:
//   - the Pay buttons are disabled  (PayButtonSection, LoggedPayButton)
//   - the shipping amount shows a loader instead of the old price (ShippingAmount)
//
// "Pending" lasts until the cart refresh that follows /api/shipping has
// finished, so Pay is only enabled once the NEW shipping price is on screen.
//
// Usage:
//   const finish = beginShippingUpdate();      // idempotent finisher
//   try { ...call /api/shipping...; window.dispatchEvent(cart-updated);
//         await finishAfterCartRefresh(finish, cartId, fetchJson); }
//   finally { finish(); }

import { getCartSummary } from "./cartSummaryService";

const WATCHDOG_MS = 20000; // never leave Pay disabled forever if a request hangs

const IDLE = Object.freeze({ updating: false });
const UPDATING = Object.freeze({ updating: true });

let state = IDLE;
let pending = 0;
const listeners = new Set();

const setState = (next) => {
  if (state === next) return;
  state = next;
  listeners.forEach((fn) => fn());
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getSnapshot = () => state;
export const getServerSnapshot = () => IDLE;
export const isShippingUpdating = () => state.updating;

export const beginShippingUpdate = () => {
  let done = false;
  pending += 1;
  setState(UPDATING);

  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    pending = Math.max(0, pending - 1);
    if (pending === 0) setState(IDLE);
  };
  const timer = setTimeout(finish, WATCHDOG_MS);

  return finish;
};

// Call right AFTER dispatching "cart-updated". The listeners have already
// started the refresh (shared request), so this joins it, waits for it and
// then lets React apply the new totals before releasing the lock.
export const finishAfterCartRefresh = async (finish, cartId, fetchJson) => {
  try {
    await getCartSummary(cartId, fetchJson);
    await new Promise((resolve) => setTimeout(resolve, 0));
  } catch (e) {
    console.warn("Cart refresh after shipping update failed", e);
  } finally {
    finish();
  }
};
