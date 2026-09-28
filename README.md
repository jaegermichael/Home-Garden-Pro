# Home & Garden Pro

Editorial catalogue website for Home & Garden Pro, a Zimbabwean concrete garden pots, sculptures and water features business in Helensvale, Harare.

## Public site

Serve the project with Vercel or a local HTTP server. The source catalogue in `data/catalog.json` remains visible when the live catalogue API is unavailable.

## Catalogue studio

The discreet `/admin/` workspace manages products, visibility, featured status, images, custom size options, public price ranges and the shared WhatsApp catalogue URL. A successful server-side login creates a signed, expiring, HttpOnly cookie; credentials and authorization state are never stored in the public bundle or browser storage.

Configure these server-only environment variables:

- `HGP_ADMIN_EMAIL`: the verified primary Home & Garden Pro business email
- `HGP_ADMIN_PASSWORD_SALT`: a random hexadecimal salt
- `HGP_ADMIN_PASSWORD_HASH`: a 64-character PBKDF2-SHA256 hash using 210,000 iterations
- `HGP_ADMIN_SESSION_SECRET`: a random secret of at least 32 characters used to sign sessions

Admin access remains disabled until every variable is configured. No fallback email, password or session secret exists in the source.

Vercel Blob provides durable catalogue and image storage. The project expects `BLOB_READ_WRITE_TOKEN`, which is created automatically when its Blob store is connected in Vercel.

```powershell
npm install
vercel dev
```

## Gemini garden assistant on Cloudflare

The site includes an accessible **Ask the garden** widget. Its `/api/chat` endpoint is a Cloudflare Worker, so the Gemini API key never reaches the browser. The Worker reads the current public catalogue before each answer and refuses unrelated questions.

1. Create a Gemini API key in Google AI Studio.
2. Copy `.dev.vars.example` to `.dev.vars` and add the key for local Worker testing.
3. Adjust `SITE_ORIGIN` and `CATALOG_URL` in `wrangler.jsonc` for the production domain.
4. Run `npx wrangler secret put GEMINI_API_KEY`.
5. Run `npm run chat:deploy`.
6. In Cloudflare, attach the Worker to the site's `/api/chat` route. If it runs on a separate `workers.dev` domain instead, set `window.HGP_CHAT_ENDPOINT` to that URL before `app.js` loads.

For local Worker development, use `npm run chat:dev`. The Gemini model is configurable through `GEMINI_MODEL` in `wrangler.jsonc`.
