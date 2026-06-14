// Upstash Redis (REST) — serverless-friendly, used for rate limiting and any
// short-lived caching (e.g. search result caching, OTP throttles).
import { Redis } from '@upstash/redis';
import { env } from '../config/env.js';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
