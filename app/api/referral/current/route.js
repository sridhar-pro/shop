import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const response = await fetch(
      "https://yuukkev1.betalearnings.com/admin/api/referral/current",
      {
        method: "GET",
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
      },
    );

    const data = await response.json();

    const res = NextResponse.json(data, {
      status: response.status,
    });

    // Forward any Set-Cookie headers if present
    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (error) {
    console.error("Referral current proxy error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch current referral",
      },
      {
        status: 500,
      },
    );
  }
}
