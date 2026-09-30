const FALLBACK_PRODUCTS = [
  { name: "Arizona", slug: "arizona", image: "/assets/products/arizona.jpg", summary: "Low rounded garden vessel with a pebble-like silhouette.", category: "Sculptural planter", prices: [150, 300] },
  { name: "Bubble Set", slug: "bubble-set", image: "/assets/products/bubble-set.jpg", summary: "Set of rounded planters with organic openings.", category: "Planter set", prices: [600, 900] },
  { name: "Colorado", slug: "colorado", image: "/assets/products/colorado.jpg", summary: "Large planter with softened corners.", category: "Large planter", prices: [250] },
  { name: "Egg Pot", slug: "egg-pot", image: "/assets/products/egg-pot.jpg", summary: "Egg-shaped planter with a textured mineral finish.", category: "Rounded planter", prices: [250, 400] },
  { name: "Garden Sculpture Set", slug: "garden-sculpture-set", image: "/assets/products/garden-sculpture-set.jpg", summary: "Grouping of flowing open garden sculptures.", category: "Sculptural set", prices: [900, 1200] },
  { name: "Nebraska", slug: "nebraska", image: "/assets/products/nebraska.jpg", summary: "Tall softly tapered planter.", category: "Tall planter", prices: [250, 500] },
  { name: "Rosa", slug: "rosa", image: "/assets/products/rosa.jpg", summary: "Compact rounded bowl planter.", category: "Low planter", prices: [40, 60] },
  { name: "Sodwana", slug: "sodwana", image: "/assets/products/sodwana.jpg", summary: "Wide-bellied vessel with a narrow neck.", category: "Statement planter", prices: [250] },
  { name: "Tennessee", slug: "tennessee", image: "/assets/products/tennessee.jpg", summary: "Clean cylindrical planter in a range of sizes.", category: "Cylinder planter", prices: [60, 250] },
  { name: "Troughs", slug: "troughs", image: "/assets/products/troughs.jpg", summary: "Rectangular troughs for structured planting.", category: "Garden troughs", prices: [100, 300] },
  { name: "Baobab Pot", slug: "baobab-pot", image: "/assets/products/baobab-pot.jpg", summary: "Raised bowl planter on a ribbed pedestal.", category: "Pedestal planter", prices: [100, 400] },
  { name: "Funduzi", slug: "funduzi", image: "/assets/products/funduzi.jpg", summary: "Tall tapered statement planter.", category: "Tall planter", prices: [300, 400] },
  { name: "Protea+", slug: "protea-plus", image: "/assets/products/protea-plus.jpg", summary: "Pair of slender tapered planters.", category: "Tall planter set", prices: [150, 250] },
  { name: "Rum", slug: "rum", image: "/assets/products/rum.jpg", summary: "Softly rounded planter in several sizes.", category: "Rounded planter", prices: [40, 250] },
  { name: "Water Feature", slug: "water-feature", image: "/assets/products/water-feature.jpg", summary: "Circular garden water feature.", category: "Water feature", prices: [250, 550] },
  { name: "Estancia", slug: "estancia", image: "/assets/products/estancia.jpg", summary: "Set of softly tapered indoor vases.", category: "Indoor vase set", prices: [40, 150] },
  { name: "Nevada Tall", slug: "nevada-tall", image: "/assets/products/nevada-tall.jpg", summary: "Pair of tall angular indoor vases.", category: "Tall indoor vase set", prices: [300, 700] },
  { name: "Niagra", slug: "niagra", image: "/assets/products/niagra.jpg", summary: "Pair of pale curved indoor vases.", category: "Indoor vase pair", prices: [400] },
  { name: "Maluti", slug: "maluti", image: "/assets/products/maluti.jpg", summary: "Tall slender indoor vase.", category: "Tall indoor vase", prices: [300, 600] },
  { name: "Geni", slug: "geni", image: "/assets/products/geni.jpg", summary: "Large lidded urn with ribbed neck detail.", category: "Statement indoor vase", prices: [250, 400] },
  { name: "Tequila", slug: "tequila", image: "/assets/products/tequila.jpg", summary: "Narrow tapered indoor vase.", category: "Tall indoor vase", prices: [50, 150] },
  { name: "Ridge Planter", slug: "ridge-planter", image: "/assets/products/ridge-planter.jpg", summary: "Tall vase with broad horizontal ridges.", category: "Textured indoor vase", prices: [150, 200] },
  { name: "Crete", slug: "crete", image: "/assets/products/crete.jpg", summary: "Broad dark statement vase.", category: "Statement indoor vase", prices: [450] },
  { name: "Delia", slug: "delia", image: "/assets/products/delia.jpg", summary: "Low wide rounded indoor vessel.", category: "Low indoor vase", prices: [60, 250] },
  { name: "Hamilton Planter", slug: "hamilton-planter", image: "/assets/products/hamilton-planter.jpg", summary: "Rounded planter with a circular opening.", category: "Sculptural indoor planter", prices: [200, 400] },
  { name: "Portion G", slug: "portion-g", image: "/assets/products/portion-g.jpg", summary: "Low rounded granite-finish vase.", category: "Low indoor vase", prices: [50, 100] },
  { name: "Nevada Set", slug: "nevada-set", image: "/assets/products/nevada-set.jpg", summary: "Graduated set of softly tapered vases.", category: "Indoor vase set", prices: [100, 400] },
  { name: "Indoor Vases", slug: "indoor-vases", image: "/assets/products/indoor-vases.jpg", summary: "Curated indoor vase collection.", category: "Indoor collection", prices: [200, 750] },
  { name: "Artificial Flowers", slug: "artificial-flowers", image: "/assets/products/artificial-flowers.jpg", summary: "Decorative flowers and greenery for indoor vases.", category: "Indoor accessory", prices: [10, 60] },
  { name: "White Pebble Stones", slug: "white-pebble-stones", image: "/assets/products/white-pebble-stones.jpg", summary: "Decorative finishing stones.", category: "Decorative accessory", prices: [13] },
];

const BUSINESS_CONTEXT = `Home & Garden Pro makes concrete planters, water features, troughs and sculptural garden forms in Zimbabwe.
The display is at Boxpark, 18 Crowhill Road, Helensvale, Harare, Zimbabwe.
Phone and WhatsApp: +263 77 230 2335.
The public WhatsApp catalogue is https://wa.me/c/30404207759615.
Prices, finishes and availability can change. If the supplied catalogue does not show a price, tell the visitor to ask for the current price; never invent one.`;

let cachedCatalogue;
let catalogueCachedAt = 0;

function fallbackCatalogue() {
  return {
    products: FALLBACK_PRODUCTS,
    text: FALLBACK_PRODUCTS.map((item) => `${item.name} — ${item.category}; ${item.summary} Prices shown: ${item.prices.join("–")}.`).join("\n"),
  };
}

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
  if (cachedCatalogue && Date.now() - catalogueCachedAt < 300_000) return cachedCatalogue;
  if (!url) return fallbackCatalogue();
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
    cachedCatalogue = products.length ? { products, text } : fallbackCatalogue();
    catalogueCachedAt = Date.now();
    return cachedCatalogue;
  } catch {
    return fallbackCatalogue();
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
