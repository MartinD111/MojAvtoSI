# Cloudflare — edge, WAF & "internet safety"

Cloudflare sits in front of everything. Two jobs here:

1. **CDN + R2 public images** — `cdn.mojavto.si` / `cdn.mojanavtika.si` are custom
   domains bound to the R2 bucket. `R2_PUBLIC_BASE_URL` (server `.env`) points here.
2. **Edge security in front of the API + the static sites.**

This is configuration, not code — captured here so it's not forgotten.

## DNS / proxying
- `api.mojavto.si` → CNAME to the ALB in front of ECS Fargate, **proxied (orange cloud)**.
- `mojavto.si` / `mojanavtika.si` → static frontend host (Pages / S3+CloudFront / current host).
- `cdn.*` → R2 bucket binding.

## WAF / security ("internet safety")
- **WAF Managed Rules**: enable the Cloudflare Managed Ruleset + OWASP Core Ruleset.
- **Rate limiting rules** (edge-level, complements the app's Upstash limiter):
  - `/api/auth/*` and `/api/emails/*`: stricter (e.g. 10 req/min/IP).
- **Bot Fight Mode** on; challenge known bad ASNs.
- **Always Use HTTPS** + **HSTS** on.
- **Turnstile** (free CAPTCHA) on register / contact-seller / lead forms to stop spam.
- **Geo rules**: optional — most traffic is SI/EU; can challenge outside EU.

## TLS
- SSL/TLS mode **Full (strict)**. ACM cert on the ALB; Cloudflare edge cert public-side.

## Cache rules
- Cache `cdn.*` (images) aggressively (immutable, 1y — filenames are content-hashed/UUID).
- **Bypass cache for `/api/*`** (dynamic).

## CORS
The API's allowed origins are set via `CORS_ORIGINS` (the two portal domains).
Keep Cloudflare from stripping the `Authorization` header (default: it doesn't).

## Block DB/API introspection at the edge (#14)
The Supabase REST surface should not be enumerable from the internet.
- WAF rule: **block `OPTIONS`** to `*.supabase.co` paths and to the PostgREST
  root spec (`/rest/v1/` with no table) — these reveal the schema/columns.
- Block requests to the Supabase project's REST root that carry no/anon-only key.
- Keep **Exposed schemas = `public`** in the Supabase dashboard; the `private`
  schema (audit log etc.) is never reachable via REST.
- Prefer routing all data access through `api.*` (our Fastify API) so the
  Supabase project URL isn't a public attack surface for writes.
