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
  isCash: boolean;         // cash-on-pickup → charge premium only
  /** Buyer's idempotency key (Stripe will collapse duplicate submits). */
  idempotencyKey?: string;
}

/**
 * Create the PaymentIntent the winning buyer pays. For a normal sale this is
 * (price + premium) held in escrow on the platform balance; for a cash sale it
 * is the premium only. The seller transfer happens later via releasePriceToSeller.
 */
export async function createAuctionPaymentIntent(
  input: AuctionChargeInput,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  const premium = premiumCents(input.finalPrice);
  const price = input.isCash ? 0 : toCents(input.finalPrice);
  const amount = price + premium;

  return stripe.paymentIntents.create(
    {
      amount,
      currency: 'eur',
      // Auto-capture to the PLATFORM balance — this IS the escrow hold.
      capture_method: 'automatic',
      metadata: {
        kind: 'auction',
        auctionId: input.auctionId,
        buyerId: input.buyerId,
        flow: input.isCash ? 'premium_only' : 'escrow',
        priceCents: String(price),
        premiumCents: String(premium),
      },
      description: input.isCash
        ? `AutoHub kupčeva premija — dražba ${input.auctionId}`
        : `AutoHub dražba ${input.auctionId} (cena + premija)`,
    },
    input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
  );
}

export interface ReleaseInput {
  auctionId: string;
  sellerStripeAccountId: string; // acct_...
  priceCents: number;            // vehicle price to transfer (premium stays w/ platform)
  sourcePaymentIntentId?: string;
}

/**
 * Release the held vehicle price to the seller's connected account (the 48 h
 * escrow auto-release). The 3 % premium is NOT transferred — it stays on the
 * platform balance as the platform-usage fee.
 */
export async function releasePriceToSeller(input: ReleaseInput): Promise<Stripe.Transfer> {
  const stripe = getStripe();
  if (input.priceCents <= 0) {
    const err = new Error('Nič za sprostiti (gotovinska prodaja).') as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }
  return stripe.transfers.create(
    {
      amount: input.priceCents,
      currency: 'eur',
      destination: input.sellerStripeAccountId,
      metadata: { kind: 'auction_release', auctionId: input.auctionId },
    },
    // Idempotent per auction so a retry of the release job never double-pays.
    { idempotencyKey: `auction_release_${input.auctionId}` },
  );
}

/** Charge the up-front seller listing fee (10-day upgrade and/or binding contract). */
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
