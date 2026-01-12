// utils/authServer.js
import axios from "axios";

let cachedToken = null;
let lastFetched = null;
const TOKEN_TTL = 1000 * 60 * 10; // 10 minutes

export async function getServerToken() {
  // Return cached token if still valid
  if (cachedToken && lastFetched && Date.now() - lastFetched < TOKEN_TTL) {
    return cachedToken;
  }

  try {
    const backendUrl = process.env.BACKEND_BASE_URL; // TEST or LIVE base URL
    const res = await axios.post(
      `${backendUrl}/api_login`,
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      },
      { timeout: 30000 }
    );

    if (res.data?.status === "success" && res.data?.token) {
      cachedToken = res.data.token;
      lastFetched = Date.now();
      return cachedToken;
    }

    throw new Error("Server login failed - invalid response");
  } catch (err) {
    console.error("❌ Server token fetch error:", err.message);
    throw err;
  }
}
