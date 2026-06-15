// Leads + contact-reveal — the most abuse-prone endpoints on a classifieds site
// (spam lead floods, contact-scraping bots). Defense in depth:
//   honeypot → Turnstile → per-IP rate limit → idempotency → strict Zod (.strip).
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { boundedText, emailField, LIMITS } from '../lib/validation.js';
import { requireTurnstile } from '../lib/turnstile.js';
import { honeypotGuard } from '../lib/honeypot.js';
import { requireIdempotency } from '../lib/idempotency.js';
import { enforceIpLimit, ipEmailLimiter } from '../plugins/rateLimit.js';
import { ipUploadLimiter } from '../plugins/rateLimit.js';

const leadBody = z
  .object({
    businessId: z.string().uuid(),
    name: boundedText(2, 80),
    contactEmail: emailField.optional(),
    contactPhone: z.string().max(32).regex(/^[+0-9 ()/-]*$/).optional(),
    message: boundedText(1, LIMITS.message),
    turnstileToken: z.string().max(2048).optional(),
    // honeypot fields are accepted (then checked by honeypotGuard) but stripped:
  })
  .strip();

export const leadRoutes: FastifyPluginAsync = async (app) => {
  // Submit a lead to a business. Auth required + full anti-abuse stack.
  app.post(
    '/leads',
    { preHandler: [app.requireAuth, honeypotGuard, requireTurnstile, requireIdempotency()] },
    async (req) => {
      await enforceIpLimit(ipEmailLimiter, req.ip); // throws 429
      const body = leadBody.parse(req.body);

      // Resolve the target business's owner = the provider who receives the lead.
      const { data: biz } = await supabaseAdmin
        .from('businesses')
        .select('owner_id')
        .eq('id', body.businessId)
        .maybeSingle();
      if (!biz) throw Object.assign(new Error('Podjetje ne obstaja'), { statusCode: 404 });

      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert({
          provider_id: biz.owner_id,
          from_user: req.user!.id,
          status: 'new',
          data: {
            name: body.name,
            message: body.message,
            contactEmail: body.contactEmail ?? req.user!.email,
            contactPhone: body.contactPhone ?? null,
          },
        })
        .select('id')
        .single();
      if (error) throw Object.assign(new Error(error.message), { statusCode: 400 });
      return { id: data.id };
    },
  );

  // Reveal a seller's contact details on explicit button click. Contact info is
  // NEVER in the listing payload (anti-scraping) — it's fetched here, gated by
  // Turnstile + a strict per-IP limit so it can't be harvested in bulk.
  app.post(
    '/listings/:id/contact',
    { preHandler: [app.requireAuth, requireTurnstile] },
    async (req) => {
      await enforceIpLimit(ipUploadLimiter, req.ip); // reuse the very-low limiter
      const { id } = z.object({ id: z.string().uuid() }).strip().parse(req.params);

      const { data: listing } = await supabaseAdmin
        .from('listings')
        .select('owner_id, status')
        .eq('id', id)
        .maybeSingle();
      if (!listing || listing.status !== 'active') {
        throw Object.assign(new Error('Ni najdeno'), { statusCode: 404 });
      }
      const { data: owner } = await supabaseAdmin
        .from('profiles')
        .select('phone, email, prefs')
        .eq('id', listing.owner_id)
        .single();

      // Respect the seller's choice of what to expose.
      const prefs = (owner?.prefs ?? {}) as { hideEmail?: boolean; hidePhone?: boolean };
      return {
        phone: prefs.hidePhone ? null : owner?.phone ?? null,
        email: prefs.hideEmail ? null : owner?.email ?? null,
      };
    },
  );
};
