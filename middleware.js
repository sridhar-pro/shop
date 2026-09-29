import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();

  console.log("Incoming:", url.pathname);

  const slug = url.pathname.replace(/^\/promo\//, "");

  console.log("Slug:", slug);

  url.pathname = `/products/${slug}`;

  console.log("Redirecting to:", url.pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/promo/:path*"],
};
