import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = await fetch(
      "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "Admin@123",
        }),
      }
    );

    const data = await res.json();
    if (data.status !== "success") throw new Error("Login failed");

    return NextResponse.json({ token: data.token });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
