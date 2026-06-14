// Health/readiness probes for the ALB target group and ECS container checks.
// /healthz: liveness (process up). /readyz: readiness (deps reachable).
import type { FastifyPluginAsync } from 'fastify';
import { redis } from '../lib/redis.js';
import { supabaseAdmin } from '../lib/supabase.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/healthz', async () => ({ status: 'ok', ts: Date.now() }));

  app.get('/readyz', async (_req, reply) => {
    const checks: Record<string, boolean> = {};
    try {
      await redis.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    }
    try {
      const { error } = await supabaseAdmin.from('listings').select('id').limit(1);
      checks.supabase = !error;
    } catch {
      checks.supabase = false;
    }
    const ok = Object.values(checks).every(Boolean);
    reply.code(ok ? 200 : 503).send({ status: ok ? 'ready' : 'degraded', checks });
  });
};
