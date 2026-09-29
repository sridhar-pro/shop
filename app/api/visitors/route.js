export async function POST(req) {
  try {
    const body = await req.json();

    // 👇 Check whether the visited page exists
    const pageUrl = body.page_url;

    let pageStatus = "Valid Page";

    if (pageUrl) {
      try {
        const res = await fetch(pageUrl, {
          method: "HEAD",
          cache: "no-store",
        });

        if (!res.ok) {
          pageStatus = "Page Not Found";
        }
        if (pageStatus === "Page Not Found") {
          body.page_title = "not-found";
        }
      } catch {
        pageStatus = "Unable to Verify";
      }
    }

    // country/state/city now arrive directly from the client
    // (see VisitorTracking.jsx) instead of being resolved here,
    // since server-side IP (x-forwarded-for/x-real-ip) is unreliable
    // in dev (localhost) and in some proxy/CDN setups.
    const payload = {
      ...body,
      page_status:
        body.event_type === "external_link_click"
          ? "External Link Click"
          : pageStatus,
    };

    // console.log("========== VISITOR API ==========");
    // console.log(payload);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/api/visitors/shop`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("VISITOR API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to submit visitor data",
      },
      {
        status: 500,
      },
    );
  }
}
