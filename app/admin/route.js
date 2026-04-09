// app/admin/route.js
import { redirect } from "next/navigation";

export async function GET() {
  const DOMAIN_KEY = process.env.NEXT_PUBLIC_DOMAIN_KEY || "yuukke";
  // Replace with your actual external URL
  redirect(`https://marketplace.${DOMAIN_KEY}.com/admin/login`);
}
