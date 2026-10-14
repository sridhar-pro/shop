// Helpers that were copy-pasted in CheckoutPage / OrderSummary /
// CheckoutForm / CheckoutAddress. Behaviour is identical to the originals.

const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";

// 🧮 Currency parser
export const parseCurrency = (val) =>
  Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

export const getImageSrc = (image) => {
  if (!image) return "/fallback.png";

  if (image.startsWith("http") || image.startsWith("/")) return image;

  const originalUrl = `https://marketplace.${DOMAIN_KEY}.com/assets/uploads/${image}`;
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
};

// Same JSON fetch + one 401 retry that every component defined locally.
// Usage: const fetchWithAuth = createFetchWithAuth(getValidToken);
export const createFetchWithAuth = (getValidToken) => {
  const fetchWithAuth = async (url, options = {}, retry = false) => {
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
      return fetchWithAuth(url, options, true);
    }

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  };

  return fetchWithAuth;
};
