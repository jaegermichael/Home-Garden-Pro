import test from "node:test";
import assert from "node:assert/strict";
import { handleRequest } from "../worker/index.js";

const originalFetch = global.fetch;
const env = { GEMINI_API_KEY: "test-key", GEMINI_MODEL: "gemini-test", SITE_ORIGIN: "https://example.com" };

test.afterEach(() => { global.fetch = originalFetch; });

test("chat rejects other origins", async () => {
  const request = new Request("https://worker.example/api/chat", { method: "POST", headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, body: JSON.stringify({ message: "Hello" }) });
  const response = await handleRequest(request, env);
  assert.equal(response.status, 403);
});

test("chat validates message length", async () => {
  const request = new Request("https://worker.example/api/chat", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" }, body: JSON.stringify({ message: "x".repeat(601) }) });
  const response = await handleRequest(request, env);
  assert.equal(response.status, 400);
});

test("chat sends grounded request to Gemini and returns its reply", async () => {
  global.fetch = async (url, options) => {
    assert.match(String(url), /gemini-test:generateContent/);
    assert.equal(options.headers["x-goog-api-key"], "test-key");
    const payload = JSON.parse(options.body);
    assert.match(payload.systemInstruction.parts[0].text, /Home & Garden Pro/);
    assert.equal(payload.contents.at(-1).parts[0].text, "Where can I visit?");
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "Visit us at Boxpark in Helensvale." }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const request = new Request("https://worker.example/api/chat", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" }, body: JSON.stringify({ message: "Where can I visit?" }) });
  const response = await handleRequest(request, env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: "Visit us at Boxpark in Helensvale.", products: [] });
});

test("chat returns linked product details when Gemini names a catalogue piece", async () => {
  global.fetch = async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "The Protea works well beside an entrance." }] } }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  const request = new Request("https://worker.example/api/chat", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": "application/json" }, body: JSON.stringify({ message: "What suits an entrance?" }) });
  const response = await handleRequest(request, env);
  const data = await response.json();
  assert.equal(data.products[0].name, "Protea");
  assert.equal(data.products[0].slug, "protea-plus");
  assert.match(data.products[0].image, /protea-plus/);
});
