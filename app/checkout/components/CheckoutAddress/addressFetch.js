// The three fetch helpers CheckoutAddress used locally. Kept separate from
// lib/checkoutHelpers because they behave slightly differently:
//  - fetchWithAuth      : waits/retries for a token (up to 10x), body must be
//                         pre-stringified by the caller
//  - fetchWithAuthBogo  : standard helper (body object is stringified)
//  - fetchSummaryWithRetry : adapter so getCartSummary() can call /getTax
//                         through fetchWithAuth (keeps the token-retry behaviour
//                         the coupon flow had before)

export const createAddressFetchers = (getValidToken) => {
  // 🛡️ Helper: wait
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  // 🛡️ Helper: robust token fetcher
  const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
    let attempt = 0;
    while (attempt < maxAttempts) {
      const token = await getValidToken();

      if (token && typeof token === "string" && token.length > 10) {
        return token;
      }

      if (attempt === 5) {
        localStorage.removeItem("authToken");
      }

      await wait(delay);
      attempt++;
    }

    throw new Error("❌ Auth token unavailable after multiple retries.");
  };

  // 🛡️ Helper: universal fetcher (works for POST too)
  const fetchWithAuth = async (url, options = {}, retry = false) => {
    const token = await getTokenWithRetry();

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const fetchWithAuthBogo = async (url, options = {}, retry = false) => {
    const token = await getValidToken();
    const res = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401 && !retry) {
      localStorage.removeItem("authToken");
      // (unchanged quirk: the retry goes through fetchWithAuth)
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  const fetchSummaryWithRetry = (url, options = {}) =>
    fetchWithAuth(url, {
      method: options.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body),
    });

  return { fetchWithAuth, fetchWithAuthBogo, fetchSummaryWithRetry };
};
