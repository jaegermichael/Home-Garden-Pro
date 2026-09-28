const FALLBACK_PRODUCTS = [
  { name: "Indiana Brown", slug: "indiana-brown", image: "/assets/client-indiana.webp", summary: "Tall open-form garden sculpture with a warm, weathered finish." },
  { name: "Funduzi Granite", slug: "funduzi-granite", image: "/assets/client-funduzi.webp", summary: "Tall tapered concrete vessel in a speckled granite finish." },
  { name: "Water Feature", slug: "water-feature", image: "/assets/client-water-feature.webp", summary: "Low circular concrete basin designed as a calm garden focal point." },
  { name: "Curo Trough", slug: "curo-trough", image: "/assets/client-curo.webp", summary: "Linear concrete planter for layered planting and structured edges." },
  { name: "Round Planters", slug: "round-planters", image: "/assets/client-round-planters.webp", summary: "Low rounded concrete planters with generous planting space." },
  { name: "Protea", slug: "protea", image: "/assets/client-protea.webp", summary: "Tall planter with a softly rounded base and restrained profile." },
];

const BUSINESS_CONTEXT = `Home & Garden Pro makes concrete planters, water features, troughs and sculptural garden forms in Zimbabwe.
The display is at Boxpark, 18 Crowhill Road, Helensvale, Harare, Zimbabwe.
Phone and WhatsApp: +263 77 230 2335.
The public WhatsApp catalogue is https://wa.me/c/30404207759615.
Prices, finishes and availability can change. If the supplied catalogue does not show a price, tell the visitor to ask for the current price; never invent one.`;

function corsHeaders(origin, allowedOrigin) {
  const allowed = String(allowedOrigin || "*").split(",").map((value) => value.trim()).filter(Boolean);
  const permitted = allowed.includes("*") || !origin || allowed.includes(origin);
  const responseOrigin = permitted ? (origin || allowed[0] || "*") : (allowed[0] || "null");
  return {
    "Access-Control-Allow-Origin": responseOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function catalogueContext(url) {
  if (!url) return { products: FALLBACK_PRODUCTS, text: FALLBACK_PRODUCTS.map((item) => `${item.name} — ${item.summary} Price is not publicly listed.`).join("\n") };
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Catalogue unavailable");
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error("Invalid catalogue");
    const products = data.items.filter((item) => item.visible !== false && item.archived !== true).map((item) => ({
      name: String(item.name || "Garden piece"),
      slug: String(item.slug || item.id || ""),
      image: String(item.image || item.images?.[0] || ""),
      summary: String(item.summary || item.family || "Concrete garden form."),
      category: String(item.categoryLabel || item.category || "Garden piece"),
      prices: item.showPrice ? [item.priceFrom, item.priceTo, ...(item.sizes || []).map((size) => size.price)].filter(Boolean) : [],
    }));
    const text = products.map((item) => {
      const price = item.prices.length ? ` Prices shown: ${item.prices.join("–")}.` : " Price is not publicly listed.";
      return `${item.name} — ${item.category}; ${item.summary}${price}`;
    }).join("\n");
    return products.length ? { products, text } : { products: FALLBACK_PRODUCTS, text: FALLBACK_PRODUCTS.map((item) => `${item.name} — ${item.summary}`).join("\n") };
  } catch {
    return { products: FALLBACK_PRODUCTS, text: FALLBACK_PRODUCTS.map((item) => `${item.name} — ${item.summary} Price is not publicly listed.`).join("\n") };
  }
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-8).flatMap((message) => {
    const role = message?.role === "assistant" ? "model" : message?.role === "user" ? "user" : null;
    const text = typeof message?.text === "string" ? message.text.trim().slice(0, 1200) : "";
    return role && text ? [{ role, parts: [{ text }] }] : [];
  });
}

export async function handleRequest(request, env) {
  const origin = request.headers.get("Origin") || "";
  const headers = corsHeaders(origin, env.SITE_ORIGIN);
  const allowedOrigins = String(env.SITE_ORIGIN || "*").split(",").map((value) => value.trim());
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, headers);
  if (!allowedOrigins.includes("*") && origin && !allowedOrigins.includes(origin)) return json({ error: "Origin not allowed." }, 403, headers);
  if (!env.GEMINI_API_KEY) return json({ error: "Chat is not configured yet." }, 503, headers);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Send a JSON request." }, 400, headers); }
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 600) return json({ error: "Ask a question of up to 600 characters." }, 400, headers);

  const catalogue = await catalogueContext(env.CATALOG_URL);
  const systemInstruction = `${BUSINESS_CONTEXT}\n\nCURRENT CATALOGUE:\n${catalogue.text}\n\nWrite like a knowledgeable person in the Home & Garden Pro showroom, not a generic assistant. Answer only questions about the business, its products, choosing garden pieces, care, visits and enquiries. Use the catalogue as the source of truth. Use natural, concise sentences and usually stay under 55 words. Begin with the useful answer—never with filler such as “Certainly”, “Great question”, or “I'd be happy to help”. Return plain text without Markdown. When recommending a catalogue item, use its exact product name so the site can show its image. Do not claim live stock, exact delivery timing or unlisted prices. If a request is unrelated, briefly say you can only help with Home & Garden Pro.`;
  const contents = [...cleanHistory(body.history), { role: "user", parts: [{ text: message }] }];
  const model = env.GEMINI_MODEL || "gemini-3.8-flash";
  const geminiRequest = {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents, generationConfig: { temperature: 0.25, maxOutputTokens: 1024 } }),
  };
  let response;
  let result;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, geminiRequest);
    result = await response.json();
    if (response.ok || (response.status !== 429 && response.status < 500)) break;
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 700));
  }
  if (!response.ok) {
    console.error("Gemini error", response.status, result?.error?.message || "Unknown error");
    return json({ error: "The garden assistant is unavailable right now." }, 502, headers);
  }
  const reply = result?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!reply) return json({ error: "I couldn't form an answer. Please try again." }, 502, headers);
  const replyText = reply.toLowerCase();
  const products = catalogue.products.filter((item) => item.slug && item.image && replyText.includes(item.name.toLowerCase())).slice(0, 3).map(({ name, slug, image, summary, category }) => ({ name, slug, image, summary, category }));
  return json({ reply, products }, 200, headers);
}

export default { fetch: handleRequest };
