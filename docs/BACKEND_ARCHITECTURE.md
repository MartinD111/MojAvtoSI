# MojAvto.si / MojaNavtika.si — Backend Architecture

> **Supersedes `docs/BACKEND_PLAN.md`** (the earlier "100% Firebase serverless"
> plan). The project is moving to a Supabase + AWS + Cloudflare stack. This doc
> is the source of truth for the new architecture and the migration off Firebase.

## Stack

| Concern               | Service              | Code / config                                   |
| --------------------- | -------------------- | ----------------------------------------------- |
| Compute (API)         | **AWS ECS Fargate**  | `server/`, `server/Dockerfile`, `infra/ecs-task-definition.json` |
| Database + Auth       | **Supabase Pro**     | `supabase/`, `server/src/lib/supabase.ts`, `src/lib/supabase.js` |
| Public images         | **Cloudflare R2**    | `server/src/lib/r2.ts`, `src/lib/uploads.js`    |
| Private/system files  | **AWS S3**           | `server/src/lib/s3.ts`                          |
| Search / filtering    | **Typesense**        | `server/src/lib/typesense.ts`, `src/lib/search.js` |
| Rate limiting         | **Upstash Redis**    | `server/src/plugins/rateLimit.ts`               |
| Transactional email   | **Resend**           | `server/src/lib/resend.ts`, `routes/emails.ts`  |
| Error tracking        | **Sentry**           | `server/src/lib/sentry.ts`, `src/lib/monitoring.js` |
| Product analytics     | **PostHog**          | `src/lib/analytics.js`, `server/src/lib/posthog.ts` |
| Edge / WAF / CDN      | **Cloudflare**       | `infra/cloudflare-notes.md`                      |

## Request flow

```
Browser (Vite SPA, two portals)
  │  ├─ Supabase JS  ──────────────► Supabase (Auth + Postgres, RLS-guarded)
  │  ├─ Typesense JS (scoped key) ─► Typesense (instant search)
  │  └─ fetch + JWT
  ▼
Cloudflare (DNS, WAF, TLS, rate-limit, Turnstile)
  ▼
ALB ──► ECS Fargate: Fastify API (/api/*)
            ├─ Supabase (service role for trusted ops)
            ├─ R2 / S3 (presigned URLs)
            ├─ Typesense (admin: index writes)
            ├─ Upstash Redis (distributed rate limit)
            ├─ Resend (email)
            └─ Sentry / PostHog (server events)
```

Direct image bytes go **browser → R2** via presigned PUT (never through the API).

## What's scaffolded (this pass)

Everything above exists as wired-but-not-yet-credentialed code:
- Full Fastify API with auth (Supabase JWT), Upstash rate limiting, and routes
  for health, uploads, search, listings, emails.
- Lib clients for all 10 services on both server and frontend.
- Supabase `schema.sql` + `policies.sql` mapping every Firestore collection.
- Docker + ECS task definition + docker-compose (local Typesense/Redis) + Cloudflare notes.
- Frontend `src/lib/*` client layer.

**Not done yet (the "integrate API later" part):** pointing live credentials,
creating the cloud resources, and rewiring the 22 Firebase-importing files.

## Getting it running

1. Create the cloud resources (Supabase, R2, S3, Upstash, Typesense, Resend,
   Sentry, PostHog) — see `infra/README.md`.
2. `supabase/schema.sql` → `supabase/policies.sql`.
3. `server/.env` from `server/.env.example`; `.env.local` (root) from `.env.example`.
4. `cd server && npm install && npm run dev` → `GET /healthz`.
5. Root: `npm install` (adds supabase-js, posthog-js, sentry, typesense).
6. `cd server && npm run typesense:sync` to build the search index.

## Migration off Firebase (incremental, no big-bang)

Firebase stays installed and working until each piece is moved. Suggested order:

1. **Auth** — swap `src/auth/*` to `src/lib/auth.js` (Supabase). Update the auth
   gate (`src/utils/authGate.js`) + user menu. Migrate existing users via Supabase
   import.
2. **Reads** — repoint read-heavy pages (listing boards, listing detail) to
   `src/lib/search.js` (Typesense) and `src/lib/supabase.js` (Postgres).
3. **Writes** — move `create-listing` + `b2bService` writes to `src/lib/apiClient.js`
   (`POST /api/listings`, etc.), which also indexes Typesense.
4. **Images** — replace Firebase Storage uploads with `src/lib/uploads.js` (R2).
5. **Auctions / payments / scheduled jobs** — port the auction close + boost
   expiry logic into the API (or a small scheduled task) per the old plan's items
   C/D/E, now on Supabase/Resend instead of Firestore/Functions.
6. Remove the `firebase` dependency and `src/firebase.js` once nothing imports it.

### Firestore → Postgres collection map
See `supabase/README.md` for the full table. Field-name convention changes:
Firestore camelCase (`providerId`, `createdAt`) → Postgres snake_case
(`provider_id`, `created_at`); category-specific fields live in the `data` jsonb
column.
