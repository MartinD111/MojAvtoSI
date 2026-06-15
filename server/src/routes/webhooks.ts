// Signed webhook receivers (#15). These run OUTSIDE /api, use the raw body
// (config.rawBody) so the signature verifies over exact bytes, and are anonymous
// (no JWT) — trust comes from the cryptographic signature, nothing else.
import type { FastifyPluginAsync } from 'fastify';
import { verifySvixSignature, verifyStripeSignature } from '../lib/webhooks.js';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../lib/supabase.js';

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

  // Stripe payments — PATTERN ONLY (wire up when payments are integrated). The
  // webhook is the SINGLE source of truth that grants a paid boost: verify the
  // signature, then in a DB transaction set listing.promotion + paid_amount.
  app.post('/stripe', { config: { rawBody: true } }, async (req, reply) => {
    const secret = env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return reply.code(503).send({ error: 'Stripe not configured', statusCode: 503 });
    }
    const ok = verifyStripeSignature(
      secret,
      req.headers['stripe-signature'] as string | undefined,
      (req.rawBody as Buffer) ?? Buffer.from(''),
    );
    if (!ok) return reply.code(401).send({ error: 'Invalid signature', statusCode: 401 });

    const event = JSON.parse((req.rawBody as Buffer).toString('utf8')) as {
      id?: string;
      type?: string;
      data?: {
        object?: {
          id?: string;
          payment_intent?: string;
          metadata?: { kind?: string; auctionId?: string; listingId?: string; tier?: string };
        };
      };
    };
    req.log.info({ type: event.type, id: event.id }, 'stripe webhook');
    const obj = event.data?.object;
    const meta = obj?.metadata;

    // ── Auction buyer payment succeeded → start the 48 h escrow hold ──────────
    // The webhook is the ONLY writer that flips a payment to 'paid'. Idempotent
    // on the Stripe event id (auction_payments.stripe_event_id is unique).
    if (event.type === 'payment_intent.succeeded' && meta?.kind === 'auction' && obj?.id) {
      const releaseAt = new Date(Date.now() + env.AUCTION_ESCROW_HOURS * 3600 * 1000).toISOString();
      await supabaseAdmin
        .from('auction_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_event_id: event.id ?? null,
          escrow_release_at: releaseAt,
        })
        .eq('payment_intent_id', obj.id)
        .neq('status', 'paid'); // idempotent: don't re-pay
      if (meta.auctionId) {
        await supabaseAdmin
          .from('auctions')
          .update({ escrow_release_at: releaseAt })
          .eq('id', meta.auctionId);
      }
    }

    // Seller listing fee paid (10-day upgrade / binding contract).
    if (event.type === 'payment_intent.succeeded' && meta?.kind === 'auction_listing_fee' && meta.auctionId) {
      await supabaseAdmin
        .from('auctions')
        .update({ listing_fee_paid: true, payment_ref: obj?.id ?? null })
        .eq('id', meta.auctionId);
    }

    // ── Dispute opened → freeze the escrow auto-release ───────────────────────
    // The platform does NOT arbitrate; we only stop the automatic payout.
    if (event.type === 'charge.dispute.created' && obj?.payment_intent) {
      const nowIso = new Date().toISOString();
      const { data: pay } = await supabaseAdmin
        .from('auction_payments')
        .select('id, auction_id')
        .eq('payment_intent_id', obj.payment_intent)
        .maybeSingle();
      if (pay) {
        await supabaseAdmin
          .from('auction_payments')
          .update({ status: 'disputed', dispute_opened_at: nowIso })
          .eq('id', pay.id);
        await supabaseAdmin.from('auctions').update({ dispute_opened_at: nowIso }).eq('id', pay.auction_id);
      }
    }

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
