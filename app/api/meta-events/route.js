import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/app/lib/metaCapi";

export async function POST(request) {
  try {
    const body = await request.json();

    const clientIpAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const clientUserAgent = request.headers.get("user-agent") || "";

    const result = await sendMetaEvent({
      ...body,
      clientIpAddress,
      clientUserAgent,
    });

    return NextResponse.json(result ?? { success: false });
  } catch (err) {
    console.error("Meta events route error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
