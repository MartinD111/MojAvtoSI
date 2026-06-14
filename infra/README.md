# infra/

Deployment & edge configuration for the backend.

| File                       | What it is                                                     |
| -------------------------- | ------------------------------------------------------------- |
| `ecs-task-definition.json` | AWS ECS Fargate task def for the API container (secrets via Secrets Manager). |
| `cloudflare-notes.md`      | Cloudflare DNS / WAF / CDN / R2 binding configuration.         |
| `typesense-listings.schema.json` | The Typesense `listings` collection schema (also created by `server` `npm run typesense:sync`). |

## First deploy outline

1. **Supabase**: create project (Pro), run `supabase/schema.sql` then `supabase/policies.sql`.
2. **R2 + S3 + Upstash + Typesense + Resend + Sentry + PostHog**: create resources, collect keys.
3. **Secrets Manager**: store all keys under `mojavto/api` (keys match `server/.env.example`).
4. **ECR**: `docker build -t mojavto-api ./server` → push.
5. **ECS**: register `ecs-task-definition.json`, create a Fargate service behind an ALB.
6. **Cloudflare**: point `api.*` at the ALB, bind `cdn.*` to R2, enable WAF — see notes.
7. Run `npm run typesense:sync` (from `server/`) to build the search index.
