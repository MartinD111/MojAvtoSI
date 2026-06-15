# Security Roadmap

Tracks the full security backlog. `docs/SECURITY.md` documents controls that are
**implemented**; this file tracks everything, including config and future work.

**Legend:** ✅ done in code · 🧩 pattern/helper ready (wire on use) · ⚙️ config /
dashboard / infra (no code) · ⬜ todo (needs build-out, often tied to a future feature)

---

## A. Integration & codebase tasks
| Item | Status | Where |
| ---- | ------ | ----- |
| Run + commit backend (compiles clean) | ✅ | `server/` builds via `tsc`; committed |
| Lead-submit endpoint: Turnstile + IP limit + honeypot | ✅ | `server/src/routes/leads.ts` |
| Sample login form (token + Turnstile + honeypot + safe redirect) | ✅ | `src/examples/loginFormExample.js` |
| Idempotent RLS regression test | ✅ | `supabase/test_rls.sql` |
| Stripe webhook pattern (signature verify) | 🧩 | `server/src/lib/webhooks.ts` `verifyStripeSignature`, `routes/webhooks.ts` `/webhooks/stripe` |

## B. Manual dashboard / infra config (no code)
| Item | Status | Where documented |
| ---- | ------ | ---------------- |
| Supabase: confirm email, Turnstile, HIBP, rate limits | ⚙️ | `docs/SECURITY.md` checklist |
| Set `SUPABASE_JWT_SECRET` in prod | ⚙️ | `docs/BACKEND_HANDOFF.md` §6 |
| S3 Object Lock (WORM) on backups bucket | ⚙️ | `infra/s3-object-lock.md` |
| Cloudflare WAF: block `OPTIONS` / introspection | ⚙️ | `infra/cloudflare-notes.md` |
| Exposed schemas = `public` only | ⚙️ | `supabase/security.sql`, `docs/SECURITY.md` |

## C. Anti-DDoS, email & bot layer
| Item | Status | Notes |
| ---- | ------ | ----- |
| Honeypot fields → auto IP ban | ✅ | `server/src/lib/honeypot.ts`; global ban check in `rateLimit.ts` |
| Contact info NOT in payload; reveal-on-click + Turnstile + IP limit | ✅ | `routes/leads.ts` `POST /listings/:id/contact`; **frontend must stop embedding phone/email** |
| SPF / DKIM / DMARC `p=reject` | ⚙️ | Add Resend's SPF+DKIM to DNS; set DMARC reject — see `infra/cloudflare-notes.md` (DNS) |
| Block datacenter ASNs (AWS/DO/Hetzner) + Tor | ⚙️ | Cloudflare WAF ASN/Tor rules — `infra/cloudflare-notes.md` |
| Dynamic DDoS shield (auto "Under Attack" via CF API) | ⬜ | Needs an anomaly-watch worker that calls the Cloudflare API; not built |

## D. B2B profile security & access control
| Item | Status | Notes |
| ---- | ------ | ----- |
| Mandatory MFA/2FA for dealer + admin | ⬜ | Supabase Auth MFA (TOTP) enrollment + app-level enforcement on those roles |
| RBAC sub-accounts (owner/seller/photographer) | ⬜ | Needs `business_members(business_id, user_id, role)` table + RLS keyed on it; roles partly exist in `platform.js` |
| B2B bulk import — XXE protection | ⬜ | When XML import lands: disable external entities in the XML parser (don't use a DTD-enabling parser) |
| B2B import — same strict Zod as manual | 🧩 | Reuse `validation.ts` (`boundedText`, no-emoji, VIN check to add) on every imported row |
| IP allow-list for B2B API keys | ✅ | `apiKeys.ts` `ipAllowed()`; `b2b_api_keys.ip_allowlist` column |
| Ad budget atomic debit (no overspend race) | ✅ | `supabase/security.sql` `debit_wallet()` with `FOR UPDATE` |

## E. Server crash / rebuild / loophole protection
| Item | Status | Notes |
| ---- | ------ | ----- |
| Cache-stampede mutex (single rebuilder) | ✅ | `idempotency.ts` `acquireLock()` |
| External persistent cache survives restart | ✅ | Upstash Redis (`lib/redis.ts`) |
| Mass-assignment / param hijack → strip unknown | ✅ | Zod `.strip()` on all input schemas |
| API-key enumeration defense (store SHA-256 hash) | ✅ | `apiKeys.ts` `hashApiKey` / `verifyApiKey` (constant-time) |
| Compute hard caps (avoid runaway bills on rebuild) | ⚙️ | Supabase has its own limits; if self-hosting Postgres set max connections + ACU caps. Fargate: cap service desiredCount/autoscaling |
| DB connection-pool ceiling | ⚙️ | Use Supabase pooler (Supavisor) transaction mode; cap pool size below DB max |
| Zip/XML-bomb stream guard (abort > ~50 MB) | ⬜ | When bulk import lands: stream-decompress, abort on size threshold |

## F. Frontend / website security
| Item | Status | Notes |
| ---- | ------ | ----- |
| Open-redirect (`returnTo`) validation | ✅ | `src/lib/redirect.js` `safeReturnTo()` (used in sample login) |
| Clickjacking (`frame-ancestors 'none'`) | ✅ | helmet CSP in `server/src/app.ts`; SPA host must send it too |
| Idempotency keys (form replay / double-submit) | ✅ | `idempotency.ts` `requireIdempotency()` |
| Strict CSP | 🧩 | Set on API (`app.ts`); **the SPA host must send the same header** — GitHub Pages can't, so plan CloudFront/Cloudflare in front |
| XSS: entity-encode user input | 🧩 | Server bounds + `.replace('<','&lt;')` in email; ensure frontend never `innerHTML`s raw user text (audit `*.js` render paths) |
| SRI hashes on external scripts | ⬜ | Add `integrity` to Turnstile/analytics `<script>` tags (build step) |
| Source maps off + minify in prod | ⬜ | Vite: ensure `build.sourcemap=false` (default) and no source maps shipped |
| Reverse tabnabbing (`rel="noopener noreferrer"`) | ⬜ | Audit all `target="_blank"` links (esp. user-generated) |
| CSS injection (B2B profile theming) | ⬜ | Restrict to HEX/RGB color pickers; never accept raw CSS |
| SSR 404 cache (fake-id DDoS) | ⬜ | Only relevant once SSR exists; cache 404s 5–10 min. SPA today = N/A |
| CSWSH (WebSocket Origin check) | ⬜ | Only if we add our own WS; Supabase Realtime handles its own auth |

## G. Authentication & login protection
| Item | Status | Notes |
| ---- | ------ | ----- |
| Constant-time comparisons | ✅ | `crypto.timingSafeEqual` in `webhooks.ts`, `apiKeys.ts` |
| User-enumeration protection (generic errors) | ✅ | `src/lib/auth.js` (login/reset/register) |
| Password-reset host poisoning | ⚙️ | Supabase builds reset links from the dashboard Site URL — not the client `Host`. Keep redirect allow-list tight |
| Session fixation (new session on state change) | ⚙️ | Supabase issues a fresh session on login; don't reuse tokens across roles |
| Refresh-token rotation + reuse detection | ⚙️ | Enable in Supabase Auth (rotation + reuse interval); revokes family on reuse |
| Compromised-password block (HIBP) | ⚙️ | Supabase → Auth → Leaked password protection: ON |
| Login input length caps | ✅ | `validation.ts` / `validation.js` `LIMITS` |
| JWT alg pin (reject `none`) | ✅ | `plugins/auth.ts` `algorithms:['HS256']` |

---

## Priority order for the remaining ⬜ items
1. **MFA for dealer/admin** + **RBAC sub-accounts** (account-takeover blast radius).
2. **CDN/CloudFront in front of the SPA** so the strict CSP + security headers
   actually apply to pages (today GitHub Pages can't set them).
3. **B2B import hardening** (XXE, zip-bomb, per-row Zod, VIN validation) — ship
   together with the import feature.
4. **Reverse-tabnabbing + SRI + source-map** audit (cheap frontend hygiene).
5. **Dynamic DDoS auto-shield** worker (nice-to-have; Cloudflare WAF covers most).
