// Auctions — the AutoHub auction resource. Reads are public; creating an auction
// and bidding require auth. Bidding is server-authoritative via the atomic
// `place_auction_bid` Postgres function (anti-snip + per-type rules live there).
//
// Settlement (winner → Stripe PaymentIntent → 48 h escrow → seller transfer) is
// driven by the close/release jobs and the Stripe webhook, NOT here.
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin, supabaseForUser } from '../lib/supabase.js';
import { writeLimiter } from '../plugins/rateLimit.js';
import { assertOwner } from '../lib/ownership.js';
import { audit } from '../lib/audit.js';
import { isProd } from '../config/env.js';

// Up-front seller listing fee for the AutoHub model.
function listingFee(durationDays: number, binding: boolean): number {
  return (durationDays >= 10 ? 4.99 : 0) + (binding ? 49.99 : 0);
}

const createInput = z
  .object({
    listingId: z.string().uuid(),
    platform: z.enum(['avto', 'navtika']),
    auctionType: z.enum(['silent', 'prebid', 'live']).default('live'),
    startPrice: z.number().nonnegative().max(100_000_000).default(0),
    reservePrice: z.number().nonnegative().max(100_000_000).optional(),
    durationDays: z.union([z.literal(7), z.literal(10)]).default(7),
    bindingContract: z.boolean().default(false),
    cashAllowed: z.boolean().default(false),
  })
  .strip();

const bidInput = z.object({ amount: z.number().positive().max(100_000_000), signed: z.boolean().optional() }).strip();

export const auctionRoutes: FastifyPluginAsync = async (app) => {
  // Public: a single auction's live state.
  app.get('/auctions/:id', async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).strip().parse(req.params);
    const { data, error } = await supabaseAdmin.from('auctions').select('*').eq('id', id).single();
    if (error || !data) return reply.code(404).send({ error: 'Not found', statusCode: 404 });
    return data;
  });

  // Create an auction for a listing the caller owns.
  app.post('/auctions', { preHandler: app.requireAuth }, async (req, reply) => {
    if (isProd) {
      const { success } = await writeLimiter.limit(req.user!.id);
      if (!success) return reply.code(429).send({ error: 'Too many requests', statusCode: 429 });
    }
    const input = createInput.parse(req.body);
    await assertOwner('listings', input.listingId, req.user!.id); // 403/404 if not the owner

    // cash-on-pickup is only valid together with a binding contract.
    const cashAllowed = input.bindingContract && input.cashAllowed;
    const signatureRequired = input.bindingContract || cashAllowed;
    const fee = listingFee(input.durationDays, input.bindingContract);
    const now = Date.now();
    const endsMs = now + input.durationDays * 86_400_000;
    const isPrebid = input.auctionType === 'prebid';

    const db = supabaseForUser(req.accessToken!); // RLS enforces seller_id = auth.uid()
    const { data, error } = await db
      .from('auctions')
      .insert({
        listing_id: input.listingId,
        seller_id: req.user!.id,
        platform: input.platform,
        auction_type: input.auctionType,
        current_phase: isPrebid ? 'prebid' : null,
        starting_bid: input.startPrice,
        current_bid: input.startPrice,
        reserve_price: input.auctionType === 'silent' ? (input.reservePrice ?? null) : null,
        binding_contract: input.bindingContract,
        cash_allowed: cashAllowed,
        signature_required: signatureRequired,
        buyer_premium_percent: 3,
        listing_fee: fee,
        listing_fee_paid: fee === 0,
        duration_days: input.durationDays,
        status: 'active',
        ends_at: new Date(endsMs).toISOString(),
        prebid_ends_at: isPrebid ? new Date(endsMs).toISOString() : null,
      })
      .select('*')
      .single();
    if (error) return reply.code(400).send({ error: error.message, statusCode: 400 });
    return reply.code(201).send(data);
  });

  // Place a bid (atomic, server-authoritative). Runs as the authenticated user so
  // place_bid()'s auth.uid() resolves to the bidder; the function row-locks the
  // auction, enforces per-type rules and applies the +2 min anti-snip.
  app.post('/auctions/:id/bids', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).strip().parse(req.params);
    const body = bidInput.parse(req.body);
    if (isProd) {
      const { success } = await writeLimiter.limit(`bid:${req.user!.id}`);
      if (!success) return reply.code(429).send({ error: 'Too many requests', statusCode: 429 });
    }
    const db = supabaseForUser(req.accessToken!);
    const { data, error } = await db.rpc('place_bid', { p_auction: id, p_amount: body.amount });
    // A raised exception in the function (too low, ended, own auction…) → 400.
    if (error) return reply.code(400).send({ error: error.message, statusCode: 400 });
    return reply.send(data);
  });

  // Buyer opens an official dispute → freezes the 48 h escrow auto-release.
  // The platform does NOT arbitrate; this only stops the automatic payout so the
  // parties can resolve it directly (see handoff §"izvzetje iz sporov").
  app.post('/auctions/:id/dispute', { preHandler: app.requireAuth }, async (req, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).strip().parse(req.params);
    const { reference } = z.object({ reference: z.string().max(500).optional() }).strip().parse(req.body ?? {});
    const nowIso = new Date().toISOString();

    // Only the winning buyer of a still-held payment may open a dispute.
    const { data: pay } = await supabaseAdmin
      .from('auction_payments')
      .select('id, buyer_id, status')
      .eq('auction_id', id)
      .eq('buyer_id', req.user!.id)
      .in('status', ['paid', 'pending'])
      .maybeSingle();
    if (!pay) return reply.code(404).send({ error: 'No releasable payment for this buyer', statusCode: 404 });

    await supabaseAdmin
      .from('auction_payments')
      .update({ status: 'disputed', dispute_opened_at: nowIso })
      .eq('id', pay.id);
    await supabaseAdmin.from('auctions').update({ dispute_opened_at: nowIso }).eq('id', id);
    await audit({
      actorId: req.user!.id,
      action: 'auction.dispute',
      targetType: 'auction',
      targetId: id,
      metadata: { reference: reference ?? null },
    });
    return reply.send({ ok: true, disputeOpenedAt: nowIso });
  });
};
