import crypto from "crypto";

function hashData(value) {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

export async function sendMetaEvent(params) {
  const PIXEL_ID = process.env.META_PIXEL_ID;
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error("❌ Meta CAPI: Missing PIXEL_ID or ACCESS_TOKEN");
    return;
  }

  const user_data = {};
  if (params.userEmail) user_data.em = hashData(params.userEmail);
  if (params.userPhone) user_data.ph = hashData(params.userPhone);
  if (params.clientIpAddress)
    user_data.client_ip_address = params.clientIpAddress;
  if (params.clientUserAgent)
    user_data.client_user_agent = params.clientUserAgent;
  if (params.fbp) user_data.fbp = params.fbp;
  if (params.fbc) user_data.fbc = params.fbc;

  const payload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.sourceUrl,
        action_source: "website",
        user_data,
        ...(params.customData && {
          custom_data: {
            ...(params.customData.value && { value: params.customData.value }),
            ...(params.customData.currency && {
              currency: params.customData.currency,
            }),
            ...(params.customData.orderId && {
              order_id: params.customData.orderId,
            }),
            ...(params.customData.contentIds && {
              content_ids: params.customData.contentIds,
            }),
            ...(params.customData.contentType && {
              content_type: params.customData.contentType,
            }),
          },
        }),
      },
    ],
    // test_event_code: "TEST66618",
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const result = await res.json();

    if (!res.ok) {
      console.error("❌ Meta CAPI Error:", result);
      return { success: false, error: result };
    }

    console.log("✅ Meta CAPI Success:", result);
    return { success: true, result };
  } catch (err) {
    console.error("❌ Meta CAPI Fetch Error:", err);
    return { success: false, err };
  }
}
