# MojAvto / MojaNavtika API server

Fastify + TypeScript API, deployed as a container on **AWS ECS Fargate**.
This is the backend that replaces the old direct-to-Firebase access.

## Stack at a glance

| Concern            | Service           | Where in code                         |
| ------------------ | ----------------- | ------------------------------------- |
| Database + Auth    | Supabase Pro      | `src/lib/supabase.ts`, `plugins/auth` |
| Public images      | Cloudflare R2     | `src/lib/r2.ts`, `routes/uploads`     |
| Private files      | AWS S3            | `src/lib/s3.ts`                       |
| Search / filtering | Typesense         | `src/lib/typesense.ts`, `routes/search` |
| Rate limiting      | Upstash Redis     | `src/lib/redis.ts`, `plugins/rateLimit` |
| Email              | Resend            | `src/lib/resend.ts`, `routes/emails`  |
| Error tracking     | Sentry            | `src/lib/sentry.ts`                   |
| Analytics          | PostHog           | `src/lib/posthog.ts`                  |
| Compute            | ECS Fargate       | `Dockerfile`, `../infra/`             |
| Edge / WAF / CDN   | Cloudflare        | `../infra/cloudflare-notes.md`        |

## Local development

```bash
cd server
cp .env.example .env   # fill in credentials
npm install
npm run dev            # http://localhost:8080/healthz
```

Optionally run Typesense + Redis locally instead of cloud — see the root
`docker-compose.yml`.

## Useful commands

```bash
npm run typecheck          # tsc --noEmit
npm run build && npm start  # production build
npm run typesense:sync     # (re)create + backfill the search index
```

## Deploy (Fargate)

```bash
docker build -t mojavto-api ./server
# push to ECR, then update the ECS service — see ../infra/ecs-task-definition.json
```

All routes are under `/api`. `/healthz` and `/readyz` are unprefixed for the
load balancer health checks.
