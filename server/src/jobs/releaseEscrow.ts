// Escrow auto-release worker. Finds paid auction payments whose 48 h hold has
// elapsed and which are NOT under dispute, then transfers the vehicle price to
// the seller's connected account. The 3 % premium stays on the platform balance.
//
// This is the operational half of the dispute-exemption design: the default is
// always "money goes to the seller" so the platform never decides who is right.
// A dispute (set by the Stripe webhook) freezes the row and excludes it here.
//
// Idempotent: status guard ('paid' → 'released') + a Stripe transfer idempotency
// key per auction. Invoke via POST /internal/cron/release-escrow.
import { supabaseAdmin } from '../lib/supabase.js';
import { isStripeConfigured, releasePriceToSeller, toCents } from '../lib/stripe.js';

interface PaymentRow {
  id: string;
  auction_id: string;
  seller_id: string;
  flow: string;            // 'escrow' | 'premium_only'
  price_amount: number;
  payment_intent_id: string | null;
  status: string;
  escrow_release_at: string | null;
  dispute_opened_at: string | null;
}

export async function runReleaseDueEscrow(): Promise<{ released: number; skipped: number }> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('auction_payments')
    .select('id, auction_id, seller_id, flow, price_amount, payment_intent_id, status, escrow_release_at, dispute_opened_at')
    .eq('status', 'paid')
    .is('dispute_opened_at', null)
    .lte('escrow_release_at', nowIso);

  if (error) throw new Error(`release-escrow query failed: ${error.message}`);
  const rows = (data ?? []) as PaymentRow[];

  let released = 0;
  let skipped = 0;

  for (const p of rows) {
    // Cash sale: nothing to transfer — the price was settled off-platform. Just
    // close the record so it isn't re-scanned.
    if (p.flow === 'premium_only' || Number(p.price_amount) <= 0) {
      await markReleased(p.id, p.auction_id);
      released++;
      continue;
    }

    // Need the seller's connected account to transfer to.
    const { data: seller } = await supabaseAdmin
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', p.seller_id)
      .single();
    const account = seller?.stripe_account_id as string | undefined;
    if (!account || !isStripeConfigured()) {
      skipped++;
      continue; // retry next sweep once the seller is onboarded / Stripe is configured
    }

    try {
      await releasePriceToSeller({
        auctionId: p.auction_id,
        sellerStripeAccountId: account,
        priceCents: toCents(p.price_amount),
        sourcePaymentIntentId: p.payment_intent_id ?? undefined,
      });
      await markReleased(p.id, p.auction_id);
      released++;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(`[release-escrow] transfer failed for payment ${p.id}:`, (e as Error).message);
      skipped++;
    }
  }

  return { released, skipped };
}

async function markReleased(paymentId: string, auctionId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  await supabaseAdmin
    .from('auction_payments')
    .update({ status: 'released', released_at: nowIso })
    .eq('id', paymentId)
    .eq('status', 'paid'); // release once
  await supabaseAdmin
    .from('auctions')
    .update({ escrow_released: true })
    .eq('id', auctionId);
}
