// Email endpoints. Most transactional mail will be triggered internally (e.g.
// by an auction-close job), but this exposes a guarded endpoint for flows the
// frontend initiates (e.g. "contact seller").
//
// Hardening: Turnstile (anti-bot) + IP-keyed rate limit (NOT account-keyed, so
// multi-account abuse can't bypass it) + bounded, emoji-free message body.
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { sendEmail } from '../lib/resend.js';
import { boundedText, emailField, LIMITS } from '../lib/validation.js';
import { requireTurnstile } from '../lib/turnstile.js';
import { enforceIpLimit, ipEmailLimiter } from '../plugins/rateLimit.js';

const contactBody = z.object({
  platform: z.enum(['avto', 'navtika']),
  listingId: z.string().max(64),
  toEmail: emailField,
  message: boundedText(1, LIMITS.message),
  turnstileToken: z.string().max(2048).optional(),
});

export const emailRoutes: FastifyPluginAsync = async (app) => {
  // Contact the seller of a listing. Auth + Turnstile + per-IP throttle.
  app.post(
    '/emails/contact-seller',
    { preHandler: [app.requireAuth, requireTurnstile] },
    async (req) => {
      await enforceIpLimit(ipEmailLimiter, req.ip); // throws 429 on limit
      const body = contactBody.parse(req.body);
      const result = await sendEmail({
        platform: body.platform,
        to: body.toEmail,
        replyTo: req.user!.email ?? undefined,
        subject: `Novo povpraševanje za oglas ${body.listingId}`,
        html: `<p>${body.message.replace(/</g, '&lt;')}</p>
               <p>— Pošiljatelj: ${req.user!.email ?? 'neznan'}</p>`,
      });
      return { id: result.data?.id ?? null };
    },
  );
};
