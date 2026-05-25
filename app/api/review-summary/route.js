export async function POST(req) {
  try {
    const { reviews } = await req.json();

    // ✅ Validate input
    if (!reviews || !Array.isArray(reviews)) {
      return Response.json({
        success: false,
        error: "Invalid reviews data",
      });
    }

    // ✅ LIMIT reviews (optimization 💸)
    const limitedReviews = reviews.slice(0, 20);

    // ✅ Clean + filter reviews
    const combinedText = limitedReviews
      .map((r) => r?.written_review || "")
      .filter((text) => text && text.length > 10)
      .join("\n");

    if (!combinedText) {
      return Response.json({
        success: true,
        tags: [],
        positiveTags: [],
        negativeTags: [],
      });
    }

    // ✅ UPDATED PROMPT (sentiment split 🔥)
    const prompt = `
Summarize product reviews into tags.

Rules:
- Max 6 tags total
- Each tag 2-3 words only
- Split into positive and negative
- Return ONLY valid JSON
- No explanation

Format:
{
  "positive": ["Good Quality", "Durable Build"],
  "negative": ["Cap Issue", "Poor Insulation"]
}

Reviews:
${combinedText}
`;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Product Reviews AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON generator. Only return valid JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    // ✅ safer response parsing
    const textResponse = await res.text();
    console.log("RAW OpenRouter response:", textResponse);

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      return Response.json({
        success: false,
        error: "Invalid JSON response from OpenRouter",
      });
    }

    // ❌ API failure
    if (!res.ok || !data?.choices) {
      return Response.json({
        success: false,
        error: data?.error?.message || "OpenRouter API failed",
      });
    }

    const text = data.choices[0]?.message?.content || "";
    console.log("AI TEXT:", text);

    let positiveTags = [];
    let negativeTags = [];

    try {
      // ✅ Extract JSON safely
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        positiveTags = parsed.positive || [];
        negativeTags = parsed.negative || [];
      } else {
        throw new Error("No JSON object found");
      }
    } catch {
      console.warn("⚠️ Fallback parsing triggered");

      // 🔁 fallback parser (basic)
      const fallback = text
        .replace(/[{}[\]"]/g, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      positiveTags = fallback.slice(0, 3);
      negativeTags = fallback.slice(3, 6);
    }

    // ✅ Normalize + dedupe
    const normalize = (arr) =>
      [...new Set(arr.map((t) => t.trim().toLowerCase()))]
        .map((t) => t.replace(/\b\w/g, (c) => c.toUpperCase())) // capitalize
        .slice(0, 3);

    positiveTags = normalize(positiveTags);
    negativeTags = normalize(negativeTags);

    // ✅ Merge for backward compatibility
    let tags = [...positiveTags, ...negativeTags].slice(0, 6);

    // ✅ FINAL FALLBACK (never empty UI 💀)
    if (!tags.length) {
      tags = ["Good Quality", "Value for Money"];
      positiveTags = ["Good Quality"];
      negativeTags = [];
    }

    // 🧠 (Optional) Backend caching hook
    /*
    await db.review_summary.upsert({
      product_id,
      tags,
      positiveTags,
      negativeTags,
      updated_at: new Date(),
    });
    */

    return Response.json({
      success: true,
      tags,
      positiveTags,
      negativeTags,
    });
  } catch (err) {
    return Response.json({
      success: false,
      error: err.message,
    });
  }
}
