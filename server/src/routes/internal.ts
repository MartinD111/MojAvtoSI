// Internal cron endpoints. An external scheduler (AWS EventBridge / Cloudflare
// cron) hits these on an interval to drive the auction lifecycle. They are NOT
// part of /api and require the shared CRON_SECRET in the `X-Cron-Secret` header —
// no user JWT. Unset secret → 503 (disabled), so they can't be poked in dev.
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { runCloseDueAuctions } from '../jobs/closeAuctions.js';
import { runReleaseDueEscrow } from '../jobs/releaseEscrow.js';

function requireCronSecret(req: FastifyRequest, reply: FastifyReply): boolean {
  if (!env.CRON_SECRET) {
    reply.code(503).send({ error: 'Cron not configured', statusCode: 503 });
    return false;
  }
  const header = req.headers['x-cron-secret'];
  if (header !== env.CRON_SECRET) {
    reply.code(401).send({ error: 'Invalid cron secret', statusCode: 401 });
    return false;
  }
  return true;
}

export const internalRoutes: FastifyPluginAsync = async (app) => {
  // Close due auctions + flip pre-bid windows into their live phase.
  app.post('/cron/close-auctions', async (req, reply) => {
    if (!requireCronSecret(req, reply)) return;
    const result = await runCloseDueAuctions();
    req.log.info(result, 'cron close-auctions');
    return reply.send({ ok: true, ...result });
  });

  // Auto-release escrow payments past their 48 h hold (skips disputed rows).
  app.post('/cron/release-escrow', async (req, reply) => {
    if (!requireCronSecret(req, reply)) return;
    const result = await runReleaseDueEscrow();
    req.log.info(result, 'cron release-escrow');
    return reply.send({ ok: true, ...result });
  });
};
