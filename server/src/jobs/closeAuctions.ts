// Close-auction worker (F1). Scans for auctions whose deadline has passed and:
//   • pre-bid in its pre-bid window  → flips to the live phase (+2 h), no close
//   • everything else                → resolves the winner per type, records the
//                                      buyer's premium, and creates the buyer's
//                                      Stripe PaymentIntent (escrow, or premium-only
//                                      for cash sales).
//
// Idempotent: guarded by status + an `auction_payments` upsert keyed on auction.
// Invoke from an external scheduler via POST /internal/cron/close-auctions, or
// call runCloseDueAuctions() directly.
import { supabaseAdmin } from '../lib/supabase.js';
import { isStripeConfigured, createAuctionPaymentIntent, premiumCents } from '../lib/stripe.js';
import { env } from '../config/env.js';

const PREBID_LIVE_PHASE_MS = 2 * 60 * 60 * 1000; // 2 h live phase after pre-bid

interface AuctionRow {
  id: string;
  seller_id: string;
  auction_type: string;          // 'silent' | 'prebid' | 'live'
  current_phase: string | null;  // 'prebid' | 'live' | null
  status: string;
  reserve_price: number | null;
  cash_allowed: boolean;
  current_bid: number | null;
  current_bidder: string | null;
  ends_at: string;
  prebid_ends_at: string | null;
}

/** Resolve whether an ended auction is a sale, and at what price/winner. */
export function resolveOutcome(a: AuctionRow): {
  sold: boolean;
  winnerId: string | null;
  finalPrice: number;
} {
  const top = Number(a.current_bid) || 0;
  const hasBids = !!a.current_bidder && top > 0;
  if (!hasBids) return { sold: false, winnerId: null, finalPrice: top };
  if (a.auction_type === 'silent' && a.reserve_price != null && top < Number(a.reserve_price)) {
    return { sold: false, winnerId: null, finalPrice: top };
  }
  return { sold: true, winnerId: a.current_bidder, finalPrice: top };
}

export async function runCloseDueAuctions(): Promise<{
  transitioned: number;
  closed: number;
  sold: number;
}> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('auctions')
    .select(
      'id, seller_id, auction_type, current_phase, status, reserve_price, cash_allowed, current_bid, current_bidder, ends_at, prebid_ends_at',
    )
    .in('status', ['active', 'open'])
    .lte('ends_at', nowIso);

  if (error) throw new Error(`close-auctions query failed: ${error.message}`);
  const rows = (data ?? []) as AuctionRow[];

  let transitioned = 0;
  let closed = 0;
  let sold = 0;

  for (const a of rows) {
    // ── Pre-bid → live transition ──
    if (a.auction_type === 'prebid' && a.current_phase === 'prebid') {
      const liveEnds = new Date(Date.now() + PREBID_LIVE_PHASE_MS).toISOString();
      await supabaseAdmin
        .from('auctions')
        .update({ current_phase: 'live', ends_at: liveEnds })
        .eq('id', a.id)
        .eq('current_phase', 'prebid'); // optimistic guard
      transitioned++;
      continue;
    }

    // ── Close + resolve ──
    const outcome = resolveOutcome(a);
    const premium = outcome.sold ? premiumCents(outcome.finalPrice) / 100 : null;

    const { error: upErr } = await supabaseAdmin
      .from('auctions')
      .update({
        status: 'ended',
        ended_at: nowIso,
        sold: outcome.sold,
        winner_id: outcome.winnerId,
        final_price: outcome.sold ? outcome.finalPrice : null,
        buyer_premium: premium,
        current_phase: null,
      })
      .eq('id', a.id)
      .in('status', ['active', 'open']); // only close once
    if (upErr) {
      // Log-and-continue: one bad row shouldn't stall the sweep.
      // eslint-disable-next-line no-console
      console.error(`[close-auctions] update failed for ${a.id}: ${upErr.message}`);
      continue;
    }
    closed++;
    if (!outcome.sold) continue;
    sold++;

    // ── Create the buyer's PaymentIntent (best-effort; safe to retry) ──
    if (!isStripeConfigured()) continue;
    try {
      const pi = await createAuctionPaymentIntent({
        auctionId: a.id,
        buyerId: outcome.winnerId!,
        finalPrice: outcome.finalPrice,
        isCash: !!a.cash_allowed,
        idempotencyKey: `auction_pi_${a.id}`,
      });
      const escrowReleaseAt = new Date(Date.now() + env.AUCTION_ESCROW_HOURS * 3600 * 1000).toISOString();
      await supabaseAdmin.from('auction_payments').upsert(
        {
          auction_id: a.id,
          buyer_id: outcome.winnerId!,
          seller_id: a.seller_id,
          flow: a.cash_allowed ? 'premium_only' : 'escrow',
          price_amount: a.cash_allowed ? 0 : outcome.finalPrice,
          premium_amount: premium,
          payment_intent_id: pi.id,
          status: 'pending',
          escrow_release_at: escrowReleaseAt,
        },
        { onConflict: 'payment_intent_id' },
      );
      await supabaseAdmin
        .from('auctions')
        .update({ payment_intent_id: pi.id, escrow_release_at: escrowReleaseAt })
        .eq('id', a.id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[close-auctions] Stripe PI failed for ${a.id}:`, (e as Error).message);
    }
  }

  return { transitioned, closed, sold };
}
