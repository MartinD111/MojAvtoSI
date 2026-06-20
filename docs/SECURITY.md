# Security hardening — backend

Maps each hardening concern to where it lives in code/config. Companion to
`docs/BACKEND_ARCHITECTURE.md`.

## 1. Row Level Security + connection pooling

**The risk:** RLS decides access from `auth.uid()`, which is read from the JWT
claims set on the Postgres session. Supabase fronts Postgres with a pooler
(Supavisor). In **transaction mode** (port `6543`) physical connections are
reused across requests — if you set the JWT claims at *session* scope, request B
can inherit request A's identity.

**How we avoid it:**
- The API talks to the DB through **PostgREST** (`supabaseForUser(jwt)` in
  `server/src/lib/supabase.ts`), which sets claims **per request** and runs as
  the `authenticated` role. RLS is correct regardless of pooling. This is the
  default path — prefer it.
- The **service-role** client (`supabaseAdmin`) bypasses RLS. It is server-only,
  never shipped to the browser, and used only for trusted operations.
- **If/when you add direct SQL** (e.g. `pg`/Drizzle through the transaction
  pooler), set claims with `set_local` **inside a transaction**, never `set`:

  ```sql
  begin;
  select set_config('request.jwt.claims', $1, true);  -- true = LOCAL to tx
  set_local role authenticated;
  -- ...queries run with the caller's RLS identity...
  commit;  -- claims are discarded; the pooled connection is clean for the next user
  ```
  Use **session mode** (port `5432`) only for migrations/admin, never for
  per-user request traffic.
- Connect with the least-privileged role; never run app queries as `postgres`.

## 2. Onboarding character / data minimization (GDPR)

- Collect the **minimum**: signup needs only email + password. `display_name` is
  optional (`registerWithEmail`), and the `profiles` table requires only `id`
  (everything else nullable — see `supabase/schema.sql`).
- No phone/address asked up front; B2B details are gathered later, only from
  businesses that need them.
- PostHog session replay **masks all inputs** (`maskAllInputs: true` in
  `src/lib/analytics.js`) so personal data isn't captured in recordings.
- Consent/notification prefs live in `profiles.prefs` (jsonb) — opt-in, not
  assumed.

## 3. Zero-emoji tolerance

- Server authority: `server/src/lib/validation.ts` — `EMOJI_RE`, `noEmoji()`,
  `boundedText()`. Applied to names, business names, listing titles, messages.
- Frontend mirror: `src/lib/validation.js` — `hasEmoji()`, `stripEmoji()` for
  live input cleaning. UX only; the server rejects regardless.
- Covers pictographs, regional-indicator flags, variation selectors (`U+FE0F`)
  and ZWJ (`U+200D`) so combined/sequence emoji can't slip through.

## 4. Max send per **IP** (not per account)

- `server/src/plugins/rateLimit.ts` → `ipEmailLimiter` (5/hour/IP),
  `ipAuthLimiter` (10/15min/IP), enforced via `enforceIpLimit(limiter, req.ip)`.
- Keyed by `ip:<addr>` so creating many accounts does **not** raise the ceiling.
- `req.ip` is trustworthy because Fastify runs with `trustProxy: true` behind the
  ALB/Cloudflare (`server/src/app.ts`).
- Applied to `/api/emails/contact-seller`; reuse on any new send/lead endpoint.
- Edge complement: a Cloudflare rate-limiting rule on `/api/emails/*` and
  `/api/auth/*` (`infra/cloudflare-notes.md`).
- Supabase's own auth endpoints have built-in per-IP limits — tune them in
  dashboard → Auth → Rate Limits.

## 5. Turnstile where needed

- **Our API endpoints**: `server/src/lib/turnstile.ts` (`verifyTurnstile`,
  `requireTurnstile` preHandler) → on `contact-seller`; add to lead-submit.
  Fails **closed** (network error ⇒ reject); no-op only when the secret is unset.
- **Login / register / password reset**: use Supabase's **native captcha** — the
  frontend obtains a token (`src/lib/turnstile.js → getTurnstileToken`) and
  passes it as `captchaToken` (`src/lib/auth.js`). Enable Turnstile in dashboard
  → Auth → Attack Protection with the **same** site/secret keys.

## 6. Max character input on login

- Server: `loginPasswordField` (≤128), `emailField` (≤254),
  `signupPasswordField` (8–72; bcrypt ignores bytes past 72) in
  `server/src/lib/validation.ts`.
- Frontend: `clamp()` before any auth call (`src/lib/auth.js`) + `LIMITS` for the
  `maxLength` attribute on inputs.
- Stops long-input DoS and the silent bcrypt-truncation footgun.

## 7 & 8. Anti-enumeration / wrong-password reverse-engineering

- **One generic error** for login: `Napačen e-naslov ali geslo.` — never reveals
  whether the email exists vs the password is wrong (`loginWithEmail` in
  `src/lib/auth.js`). Supabase already returns a uniform "Invalid login
  credentials"; we normalize and translate it.
- **Registration** never confirms an address is already taken (enable
  dashboard → Auth → "Confirm email"; Supabase then returns an obfuscated user).
  We surface a generic failure on any error.
- **Password reset** always reports success regardless of whether the email
  exists (`sendPasswordReset` returns `{ ok: true }`, swallows errors) — no
  enumeration via the reset form.
- **Timing**: account checks happen inside Supabase's constant-ish auth path;
  don't add early-return branches that differ by "email exists". The per-IP
  limiter (§4) also blunts timing/brute-force probing.
- **No PII in errors/logs**: error responses are generic; Sentry scrubs and we
  don't log credentials. Keep it that way when adding endpoints.

## 9. SQL injection

**Status: mitigated by construction.** The API never builds SQL from strings.

- **All DB access goes through the Supabase client** (`.from().select()/.eq()/
  .insert()/.rpc()` in `server/src/lib/supabase.ts` and the route handlers).
  PostgREST binds every value as a parameter — user input is data, never SQL
  text. There is **no** raw `pg`/`client.query`, no `` sql`…` `` template, and no
  string concatenation into a query anywhere in `server/src`.
- **Business logic that needs SQL lives in Postgres functions** (`place_bid`,
  `debit_wallet` in `supabase/security.sql`), declared `security definer` with a
  pinned `search_path`. They take typed args (`uuid`, `numeric`) — not
  interpolated text — and run row-locked (`for update`) to also close race
  conditions.
- **Input is validated before it reaches the DB** with Zod `.strip()` schemas
  (`server/src/lib/validation.ts`), which additionally drops unknown keys
  (mass-assignment / prototype-pollution defence).

**Keeping it that way — regression guard.** If direct SQL is ever introduced,
follow the `set_local`-inside-a-transaction rule in §1 **and** parameterize.
A lightweight CI check fails the build if raw-SQL patterns appear in `server/src`:

```bash
npm run check:sql   # scripts/check-no-raw-sql.mjs — greps for sql`` / client.query / string-concat SQL
```

## Dashboard checklist (Supabase)
- [ ] Auth → Confirm email: **ON**
- [ ] Auth → Attack Protection: enable **Turnstile** (same keys as the app)
- [ ] Auth → Rate Limits: tighten email/OTP/sign-in per IP
- [ ] Auth → Leaked password protection (HIBP): **ON**
- [ ] Auth → set Site URL + redirect allow-list to the two portals only
- [ ] Email templates: Slovenian copy + correct sender per platform
- [ ] API → **Exposed schemas = `public` only** (never expose `private`)

---

# Hardening pass 2 — implementation map

| # | Concern | Where |
| - | ------- | ----- |
| 1 | Supply-chain scanning + strict lockfile | `.github/dependabot.yml`, `.github/workflows/security.yml` (`npm ci` + `npm audit --audit-level=high` + optional Snyk) |
| 2 | IDOR / mass-assignment | UUID PKs (`gen_random_uuid()`); `server/src/lib/ownership.ts` `assertOwner()` on every mutation (uploads, listing delete) on top of RLS |
| 3 | Secret leakage | `.gitleaks.toml` + gitleaks in CI; prod secrets injected at runtime from AWS Secrets Manager (`infra/ecs-task-definition.json`), never on disk |
| 4 | Cookie security | `SECURE_COOKIE` (HttpOnly, Secure, SameSite=Strict) registered as `@fastify/cookie` defaults in `server/src/app.ts` |
| 5 | WORM backups | `infra/s3-object-lock.md` — S3 Object Lock **COMPLIANCE** mode on the backups bucket |
| 6 | SECURITY DEFINER search_path | `set search_path = public, pg_temp` on `handle_new_user`, `is_admin`, `place_bid` (`supabase/*.sql`) |
| 7 | JWT algorithm pinning | `server/src/plugins/auth.ts` — `jwtVerify(..., { algorithms: ['HS256'] })` rejects `alg:none` / RS-HS confusion |
| 8 | Typesense key scoping | `createScopedSearchKey` — 15-min TTL + embedded `platform` + `status:=active` filters baked into the key |
| 9 | Presigned-URL throttle | `ipUploadLimiter` (15/min/IP) enforced in `routes/uploads.ts` |
| 10 | Prototype pollution | `.strip()` on Zod schemas (uploads, listings) + Fastify's secure-json-parse default |
| 11 | CSP | `buildCsp()` strict allow-list in `server/src/app.ts` (frontend host must set the same on the SPA) |
| 12 | Race conditions | `public.place_bid()` with `SELECT ... FOR UPDATE` row lock (`supabase/security.sql`); payments must use the same pattern |
| 13 | SSRF | `server/src/lib/ssrf.ts` `safeFetchImage()` — https-only, DNS-resolved private/link-local/metadata IP block, no redirects, size + content-type caps |
| 14 | Introspection lockdown | `private` schema (not REST-exposed) + dashboard "Exposed schemas=public" + edge OPTIONS/root block (`infra/cloudflare-notes.md`) |
| 15 | Webhook signatures | `server/src/lib/webhooks.ts` `verifySvixSignature()` (constant-time + 5-min replay window), raw-body route `routes/webhooks.ts` |
| 16 | Audit trail | `private.audit_log`, INSERT-only (update/delete revoked, no policies); `server/src/lib/audit.ts` writes via service role |
| 17 | Error hiding | `app.ts` error handler — generic message + `errorId` (UUID) to the client; full error + stack only to Sentry/logs; no DB detail leaked |

## Notes / follow-ups
- **CSP lives in two places.** `app.ts` sets it for API responses; the **SPA host**
  (Pages/CloudFront) must send the same `Content-Security-Policy` for the actual
  pages — that's where script injection matters most.
- **Payments** (when added): reuse the `place_bid` locking pattern (`FOR UPDATE`
  or a unique constraint on the idempotency key) and verify the gateway webhook
  signature exactly like Resend (`verifySvixSignature` → adapt for Stripe).
- **External photo import** (when the AI/bulk import grows URL support): route
  every outbound fetch through `safeFetchImage()`.
- `SUPABASE_JWT_SECRET` must be set in prod to get local HS256 verification;
  without it the plugin falls back to a network `getUser()` call (slower, still
  safe, but no explicit alg pin).
