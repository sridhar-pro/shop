import { v4 as uuidv4 } from "uuid";

function getCookie(name) {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export async function trackEvent(options) {
  const eventId = uuidv4();
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");

  // 1. Fire Meta Pixel (client-side)
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", options.eventName, options.customData ?? {}, {
      eventID: eventId, // Must match CAPI's eventId
    });
  }

  // 2. Fire CAPI (server-side) via API route
  await fetch("/api/meta-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName: options.eventName,
      eventId,
      sourceUrl: window.location.href,
      userEmail: options.userEmail,
      userPhone: options.userPhone,
      fbp,
      fbc,
      customData: options.customData,
    }),
  });
}
