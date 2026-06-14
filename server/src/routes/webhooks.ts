// Signed webhook receivers (#15). These run OUTSIDE /api, use the raw body
// (config.rawBody) so the signature verifies over exact bytes, and are anonymous
// (no JWT) — trust comes from the cryptographic signature, nothing else.
import type { FastifyPluginAsync } from 'fastify';
import { verifySvixSignature } from '../lib/webhooks.js';
import { env } from '../config/env.js';

export const webhookRoutes: FastifyPluginAsync = async (app) => {
  // Resend delivery/bounce/complaint events.
  app.post('/resend', { config: { rawBody: true } }, async (req, reply) => {
    if (!env.RESEND_WEBHOOK_SECRET) {
      return reply.code(503).send({ error: 'Webhook not configured', statusCode: 503 });
    }
    const ok = verifySvixSignature(
      env.RESEND_WEBHOOK_SECRET,
      {
        id: req.headers['svix-id'] as string | undefined,
        timestamp: req.headers['svix-timestamp'] as string | undefined,
        signature: req.headers['svix-signature'] as string | undefined,
      },
      (req.rawBody as Buffer) ?? Buffer.from(''),
    );
    if (!ok) return reply.code(401).send({ error: 'Invalid signature', statusCode: 401 });

    const event = JSON.parse((req.rawBody as Buffer).toString('utf8')) as { type?: string };
    req.log.info({ type: event.type }, 'resend webhook');
    // TODO: update delivery status (bounce → flag email, complaint → suppress).
    return reply.code(200).send({ received: true });
  });
};

// fastify-raw-body augments the request with rawBody when config.rawBody is set.
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer | string;
  }
  interface FastifyContextConfig {
    rawBody?: boolean;
  }
}
