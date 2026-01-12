import { NextResponse } from "next/server";
import axios from "axios";

export async function POST() {
  try {
    const response = await axios.post(
      `${process.env.BACKEND_BASE_URL}/api_login`,
      {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      },
      {
        timeout: 30000,
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Server login failed:", error.message);

    return NextResponse.json(
      {
        status: "error",
        message: "Authentication failed",
      },
      { status: 500 }
    );
  }
}
