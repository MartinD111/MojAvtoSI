// Stripe Connect helpers for AutoHub auction settlement.
//
// MODEL — "separate charges and transfers" so we can hold funds in escrow:
//   1. The winning buyer pays (price + 3 % premium) with a PaymentIntent on the
//      PLATFORM account. The money lands on the platform balance (= escrow).
//   2. The Stripe webhook (payment_intent.succeeded) marks the payment paid and
//      starts the 48 h hold (escrow_release_at = now + AUCTION_ESCROW_HOURS).
//   3. After 48 h, releasePriceToSeller() creates a Transfer of the VEHICLE PRICE
//      to the seller's connected account. The 3 % premium stays with the platform.
//   4. A dispute (charge.dispute.created) freezes the auto-release. The platform
//      does NOT arbitrate — see docs/AUCTIONS_HANDOFF.md §"izvzetje iz sporov".
//
// CASH SALES (cashAllowed): the vehicle price is settled off-platform in cash, so
// we only charge the 3 % premium ('premium_only' flow) and never transfer to the
// seller.
//
// Amounts are computed in integer cents to avoid float drift.
import Stripe from 'stripe';
import { env } from '../config/env.js';

let _client: Stripe | null = null;

/** Lazily-constructed Stripe client. Throws (→ 503 upstream) when unconfigured. */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    const err = new Error('Stripe ni konfiguriran') as Error & { statusCode?: number };
    err.statusCode = 503;
    throw err;
  }
  if (!_client) {
    // Use the SDK's pinned API version (don't hard-code a literal that drifts
    // with SDK upgrades). The account's default version applies otherwise.
    _client = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return _client;
}

export const isStripeConfigured = (): boolean => !!env.STRIPE_SECRET_KEY;

/** EUR (or any major unit) → integer cents, rounded half-up. */
export function toCents(amount: number): number {
  return Math.round((Number(amount) || 0) * 100);
}

/** 3 % buyer's premium (cents) on a final price (major units). */
export function premiumCents(finalPrice: number): number {
  return Math.round(toCents(finalPrice) * env.AUCTION_BUYER_PREMIUM);
}

export interface AuctionChargeInput {
  auctionId: string;
  buyerId: string;
  finalPrice: number;      // winning price in EUR
  /** Buyer's idempotency key (Stripe will collapse duplicate submits). */
  idempotencyKey?: string;
}

/**
 * Create the PaymentIntent the winning buyer pays.
 * For auctions, this is now always the premium only, since the vehicle price is handled off-platform.
 */
export async function createAuctionPaymentIntent(
  input: AuctionChargeInput,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  const premium = premiumCents(input.finalPrice);
  const price = 0; // The platform no longer escrows the vehicle price
  const amount = premium;

  return stripe.paymentIntents.create(
    {
      amount,
      currency: 'eur',
      capture_method: 'automatic',
      metadata: {
        kind: 'auction',
        auctionId: input.auctionId,
        buyerId: input.buyerId,
        flow: 'premium_only',
        priceCents: String(price),
        premiumCents: String(premium),
      },
      description: `AutoHub kupčeva premija — dražba ${input.auctionId}`,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
}

/** Charge the up-front seller listing fee. */
export async function createListingFeePaymentIntent(opts: {
  auctionId: string;
  sellerId: string;
  feeEur: number;
  idempotencyKey?: string;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.create(
    {
      amount: toCents(opts.feeEur),
      currency: 'eur',
      metadata: { kind: 'auction_listing_fee', auctionId: opts.auctionId, sellerId: opts.sellerId },
      description: `AutoHub objava dražbe — ${opts.auctionId}`,
    },
    opts.idempotencyKey ? { idempotencyKey: opts.idempotencyKey } : undefined,
  );
}
