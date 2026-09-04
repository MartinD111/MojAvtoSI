import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';
import { runCloseDueAuctions } from '../jobs/closeAuctions.js';

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
};
