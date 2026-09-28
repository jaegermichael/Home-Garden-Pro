import { clearSessionCookie, createSession, sessionFromRequest, verifyCredentials } from "./_auth.js";

export default function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method === "GET") {
    const session = sessionFromRequest(request);
    if (!session) return response.status(401).json({ error: "Access denied" });
    return response.status(200).json({ ok: true, username: session.username });
  }

  if (request.method === "DELETE") {
    response.setHeader("Set-Cookie", clearSessionCookie());
    return response.status(200).json({ ok: true });
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST, DELETE");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = request.body || {};
  if (!verifyCredentials(username, password)) {
    return response.status(401).json({ error: "Username or password incorrect." });
  }

  const session = createSession(username);
  if (!session) return response.status(503).json({ error: "Admin access is not configured." });
  response.setHeader("Set-Cookie", session.cookie);
  return response.status(200).json({ ok: true, username: session.username });
}
