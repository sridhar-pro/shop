// app/api/vendorlogo/route.js
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import axios from "axios";

// In-memory TOKEN cache only
let cachedToken = null;
let tokenExpiry = 0;

// ⏱ Token valid for 1 hour
const TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const now = Date.now();

    // 🔐 Step 1: Get a valid token (cache only token)
    if (!cachedToken || now > tokenExpiry) {
      // console.log("🔄 Token expired or missing, fetching new token...");
      const loginRes = await axios.post(
        `${process.env.BACKEND_BASE_URL}/api_login`,
        {
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD,
        },
        { timeout: 30000 },
      );

      const token = loginRes.data.token;
      if (!token) throw new Error("Login failed: No token received");

      cachedToken = token;
      tokenExpiry = now + TOKEN_TTL;
      // console.log("🔑 New token cached for 1 hour");
    } else {
      // console.log("✅ Using cached token");
    }

    // 🚀 Step 2: ALWAYS fetch fresh logos (no response cache)
    // console.log("🆕 Fetching fresh logos from backend...");
    const logosRes = await axios.get(`${process.env.LIVE_API_URL}/vendorLogo`, {
      headers: {
        Authorization: `Bearer ${cachedToken}`,
      },
      timeout: 30000,
    });

    return NextResponse.json(logosRes.data, { status: 200 });
  } catch (err) {
    console.error(
      "❌ Failed to fetch vendor logos:",
      err.response?.data || err.message,
    );
    return NextResponse.json(
      { error: "Failed to fetch logos" },
      { status: 500 },
    );
  }
}
