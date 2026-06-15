# supabase/

Database schema + auth for both portals. Supabase Pro replaces Firestore +
Firebase Auth.

| File                  | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `schema.sql`          | Tables, enums, triggers (maps the old Firestore collections). |
| `policies.sql`        | Row Level Security — replaces `firestore.rules`.         |
| `security.sql`        | Hardening: `place_bid` row-locking, append-only audit log, `private` schema. |
| `auctions_autohub.sql`| AutoHub auction model: extra `auctions` columns, `auction_payments` escrow ledger, and the type-aware `place_bid` (supersedes the basic one). **Run last.** |

## Apply (in order)

**Hosted (Pro project):** SQL editor → run `schema.sql`, then `policies.sql`, then `security.sql`, then `auctions_autohub.sql`.

**Local (Supabase CLI):**
```bash
supabase start
supabase db execute --file supabase/schema.sql
supabase db execute --file supabase/policies.sql
supabase db execute --file supabase/security.sql
supabase db execute --file supabase/auctions_autohub.sql
```

> After applying: Dashboard → API → **Exposed schemas** must stay `public` only
> (never expose `private`). See `docs/SECURITY.md`.

## Auth notes
- Email verification + password reset are built in (replaces the Firebase Auth
  flows). Configure Slovenian email templates + redirect URLs in
  Authentication → Templates / URL Configuration.
- Google sign-in: enable the Google provider and add the OAuth client.
- A `profiles` row is auto-created per new `auth.users` (trigger in `schema.sql`).
- Admin = `profiles.is_admin = true`; the API also reads `app_metadata.role`.

## Collection → table mapping (migration cheat-sheet)
| Firestore                | Postgres table        |
| ------------------------ | --------------------- |
| `users`                  | `profiles`            |
| `listings`               | `listings`            |
| `auctions` / bids        | `auctions` / `bids`   |
| `businesses`             | `businesses`          |
| `inventory`              | `inventory`           |
| `leads`                  | `leads`               |
| `bookings`               | `bookings`            |
| `tire_storage`           | `tire_storage`        |
| `tire_orders`            | `tire_orders`         |
| `reviews`                | `reviews`             |
| `reports`                | `reports`             |
| `taxonomy_proposals`     | `taxonomy_proposals`  |

`businesses/{uid}/services` subcollection → store under `businesses.data.services`
(or split into its own table later if it needs querying).
