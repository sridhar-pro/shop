import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://yuukkev1.betalearnings.com/admin/api/referral/apply-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    const res = NextResponse.json(data, {
      status: response.status,
    });

    // Forward any Set-Cookie headers from the backend
    const setCookie = response.headers.get("set-cookie");

    if (setCookie) {
      res.headers.set("set-cookie", setCookie);
    }

    return res;
  } catch (error) {
    console.error("Referral apply proxy error:", error);

    return NextResponse.json(
      {
        message: "Failed to apply referral",
      },
      {
        status: 500,
      },
    );
  }
}
