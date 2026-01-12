// app/api/[...endpoint]/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// In-memory token cache only
let cachedToken = null;
let tokenExpiry = 0;

// ⏱ Token valid for 1 hour
const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(req, context) {
  try {
    const { params } = context;
    const endpointPath = params.endpoint.join("/");
    console.log("📡 API request for:", endpointPath);

    const now = Date.now();

    // 🔐 Token logic (ONLY cache here)
    if (!cachedToken || now > tokenExpiry) {
      console.log("🔄 Token expired or missing, fetching new token...");
      const loginRes = await axios.post(
        `${process.env.BACKEND_BASE_URL}/api_login`,
        {
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD,
        },
        { timeout: 30000 }
      );

      const token = loginRes.data.token;
      if (!token) throw new Error("Login failed: No token received");

      cachedToken = token;
      tokenExpiry = now + TOKEN_TTL;
      console.log("🔑 New token cached for 1 hour");
    } else {
      console.log("✅ Using cached token");
    }

    // 🚀 ALWAYS fetch fresh data (NO response cache)
    const res = await axios.get(`${process.env.LIVE_API_URL}/${endpointPath}`, {
      headers: {
        Authorization: `Bearer ${cachedToken}`,
      },
      timeout: 30000,
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch:", err.response?.data || err.message);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
