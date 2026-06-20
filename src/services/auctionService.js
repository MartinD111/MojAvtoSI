// auctionService.js — Auction (dražba) data layer (Supabase + Fastify API)
//
// Bid placement is now server-authoritative via POST /api/auctions/:id/bids.
// Live updates use Supabase Realtime (postgres_changes on auctions + bids tables).

import { supabase } from '../lib/supabase.js';
import { api } from '../lib/apiClient.js';
import { sampleAuctionState } from '../data/sampleAuctions.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function sampleAuction(listingId) {
    return sampleAuctionState[listingId] || null;
}

function normalizeAuctionRow(row) {
    const d = row.data || {};
    const endsAtRaw = row.ends_at ?? row.endsAt;
    const endsAtMs = endsAtRaw ? new Date(endsAtRaw).getTime() : null;
    return {
        ...d,
        id: row.id,
        listingId: row.listing_id ?? row.listingId,
        sellerId: row.seller_id ?? row.sellerId,
        status: row.status,
        auctionType: d.auctionType ?? row.auctionType ?? 'live',
        currentPhase: d.currentPhase ?? row.currentPhase ?? null,
        startPriceEur: row.starting_bid ?? d.startPriceEur ?? 0,
        currentBidEur: row.current_bid ?? d.currentBidEur ?? 0,
        currentBidderId: row.current_bidder ?? d.currentBidderId ?? null,
        bidCount: d.bidCount ?? row.bidCount ?? 0,
        bidderCount: d.bidderCount ?? row.bidderCount ?? 0,
        priceSeries: d.priceSeries ?? [],
        bindingContract: d.bindingContract ?? false,
        cashAllowed: d.cashAllowed ?? false,
        signatureRequired: d.signatureRequired ?? false,
        buyerPremiumPercent: d.buyerPremiumPercent ?? BUYER_PREMIUM_PCT * 100,
        listingFee: d.listingFee ?? 0,
        proxyMaxEur: d.proxyMaxEur ?? null,
        winnerId: row.winner_id ?? d.winnerId ?? null,
        finalPriceEur: d.finalPriceEur ?? null,
        sold: d.sold ?? null,
        reservePriceEur: d.reservePriceEur ?? null,
        endsAt: endsAtMs != null ? { toMillis: () => endsAtMs } : null,
        startsAt: row.created_at ? { toMillis: () => new Date(row.created_at).getTime() } : null,
        prebidEndsAt: d.prebidEndsAt ?? null,
        antiSnipExtensions: d.antiSnipExtensions ?? 0,
    };
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS  = 24 * 60 * 60 * 1000;

// ── Duration / listing fees ───────────────────────────────────────────────────
export const AUCTION_DURATIONS = {
    d7:  { id: 'd7',  days: 7,  price: 0 },
    d10: { id: 'd10', days: 10, price: 4.99 },
};
export const EXTENDED_DURATION_FEE = 4.99;
export const BINDING_CONTRACT_FEE  = 49.99;

// ── Buyer's premium ───────────────────────────────────────────────────────────
export const BUYER_PREMIUM_PCT = 0.03;
export const ESCROW_AUTO_RELEASE_HOURS = 48;

export function calcBuyerPremium(finalPriceEur) {
    return Math.max(0, Number(finalPriceEur) || 0) * BUYER_PREMIUM_PCT;
}

export function calcBuyerTotal(finalPriceEur) {
    const price = Math.max(0, Number(finalPriceEur) || 0);
    return price + calcBuyerPremium(price);
}

export function calcListingFee({ durationDays = 7, bindingContract = false } = {}) {
    let fee = Number(durationDays) >= 10 ? EXTENDED_DURATION_FEE : 0;
    if (bindingContract) fee += BINDING_CONTRACT_FEE;
    return Math.round(fee * 100) / 100;
}

// ── Auction types ─────────────────────────────────────────────────────────────
export const AUCTION_TYPES = ['silent', 'prebid', 'live'];

export function normalizeAuctionType(type) {
    if (type === 'regular' || type == null) return 'live';
    return AUCTION_TYPES.includes(type) ? type : 'live';
}

export function isLivePhase(auction) {
    const type = normalizeAuctionType(auction?.auctionType);
    if (type === 'live') return true;
    if (type === 'prebid') return auction?.currentPhase === 'live';
    return false;
}

export const ANTI_SNIP_WINDOW_MS = 2 * 60 * 1000;
export const ANTI_SNIP_EXTEND_MS = 2 * 60 * 1000;
export const PREBID_LIVE_PHASE_MS = 2 * 60 * 60 * 1000;
export const MIN_BID_INCREMENT = 50;

export function minNextBid(auction) {
    if (!auction) return 0;
    const start = Number(auction.startPriceEur) || 0;
    if (normalizeAuctionType(auction.auctionType) === 'silent') return start;
    const base = Number(auction.currentBidEur) || start;
    return auction.bidCount > 0 ? base + MIN_BID_INCREMENT : base;
}

export function isAuctionActive(auction) {
    if (!auction || auction.status !== 'active') return false;
    const endsAt = auction.endsAt;
    const ms = endsAt?.toMillis?.() ?? (endsAt instanceof Date ? endsAt.getTime() : null) ?? (typeof endsAt === 'number' ? endsAt : null);
    return ms === null || ms > Date.now();
}

// ── Create ────────────────────────────────────────────────────────────────────
export async function createAuction(listingId, opts) {
    const result = await api.post('/api/auctions', {
        listingId,
        startPriceEur: opts.startPriceEur,
        durationDays: opts.durationDays || 7,
        auctionType: normalizeAuctionType(opts.auctionType),
        reservePriceEur: opts.reservePriceEur ?? null,
        bindingContract: !!opts.bindingContract,
        cashAllowed: !!opts.cashAllowed,
        sellerContract: opts.sellerContract || null,
    });
    return result?.id ?? listingId;
}

// ── Read ──────────────────────────────────────────────────────────────────────
export async function getAuction(listingId) {
    const demo = sampleAuction(listingId);
    if (demo) return demo.auction;
    try {
        const row = await api.get(`/api/auctions/${listingId}`, { auth: false });
        return row ? normalizeAuctionRow(row) : null;
    } catch {
        return null;
    }
}

export function subscribeAuction(listingId, cb) {
    const demo = sampleAuction(listingId);
    if (demo) { Promise.resolve().then(() => cb(demo.auction)); return () => {}; }

    // Fire once immediately
    getAuction(listingId).then(a => { if (a) cb(a); });

    const channel = supabase
        .channel(`auction-${listingId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions', filter: `id=eq.${listingId}` },
            async () => { const a = await getAuction(listingId); cb(a); })
        .subscribe();

    return () => supabase.removeChannel(channel);
}

export function subscribeBids(listingId, cb) {
    const demo = sampleAuction(listingId);
    if (demo) { Promise.resolve().then(() => cb(demo.bids)); return () => {}; }

    const fetchBids = async () => {
        const { data } = await supabase.from('bids').select('*').eq('auction_id', listingId).order('created_at', { ascending: false });
        cb((data || []).map(normalizeBidRow));
    };
    fetchBids();

    const channel = supabase
        .channel(`bids-${listingId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `auction_id=eq.${listingId}` },
            () => fetchBids())
        .subscribe();

    return () => supabase.removeChannel(channel);
}

export async function getBids(listingId) {
    const demo = sampleAuction(listingId);
    if (demo) return demo.bids;
    const { data } = await supabase.from('bids').select('*').eq('auction_id', listingId).order('created_at', { ascending: false });
    return (data || []).map(normalizeBidRow);
}

function normalizeBidRow(row) {
    const ts = row.created_at ? new Date(row.created_at).getTime() : 0;
    return {
        id: row.id,
        bidderId: row.bidder_id ?? row.bidderId,
        bidderName: row.bidderName ?? 'Ponudnik',
        amountEur: row.amount ?? row.amountEur ?? 0,
        isProxy: row.isProxy ?? false,
        contract: row.contract ?? {},
        notify: row.notify ?? {},
        createdAt: { toMillis: () => ts, toDate: () => new Date(ts) },
    };
}

// ── Bid — now server-authoritative ───────────────────────────────────────────
export async function placeBid(listingId, amountEur, user, contract = {}, notifyPref = {}, maxBidEur = null) {
    if (!user) throw new Error('Za oddajo ponudbe se morate prijaviti.');
    if (sampleAuction(listingId)) throw new Error('To je predstavitvena dražba — ponudb ni mogoče oddati.');
    const amount = Number(amountEur);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Neveljaven znesek ponudbe.');

    const result = await api.post(`/api/auctions/${listingId}/bids`, {
        amountEur: amount,
        maxBidEur: maxBidEur && Number.isFinite(Number(maxBidEur)) && Number(maxBidEur) > amount ? Number(maxBidEur) : null,
        contract,
        notifyPref,
    });

    return {
        bidId: result?.bidId ?? result?.id ?? '',
        antiSnipExtended: result?.antiSnipExtended ?? false,
        proxyClaimed: result?.proxyClaimed ?? false,
    };
}

// ── Admin / seller state changes ──────────────────────────────────────────────
export async function setAuctionStatus(listingId, status) {
    await supabase.from('auctions').update({ status, updated_at: new Date().toISOString() }).eq('id', listingId);
}

export function resolveAuctionOutcome(a) {
    const top = Number(a.currentBidEur) || 0;
    const hasBids = (a.bidCount || 0) > 0 && !!a.currentBidderId;
    if (!hasBids) return { sold: false, winnerId: null, finalPriceEur: top, reason: 'no_bids' };
    if (normalizeAuctionType(a.auctionType) === 'silent' && a.reservePriceEur != null) {
        if (top < Number(a.reservePriceEur)) return { sold: false, winnerId: null, finalPriceEur: top, reason: 'reserve_not_met' };
    }
    return { sold: true, winnerId: a.currentBidderId, finalPriceEur: top, reason: 'sold' };
}

export async function advancePrebidPhase(listingId) {
    const { data } = await supabase.from('auctions').select('*').eq('id', listingId).single();
    if (!data) throw new Error('Dražba ne obstaja.');
    if (normalizeAuctionType(data.auctionType) !== 'prebid') return;
    const d = data.data || {};
    if (d.currentPhase !== 'prebid') return;
    await supabase.from('auctions').update({
        data: { ...d, currentPhase: 'live', endsAt: new Date(Date.now() + PREBID_LIVE_PHASE_MS).toISOString() },
        updated_at: new Date().toISOString(),
    }).eq('id', listingId);
}

export async function forceCloseAuction(listingId) {
    const { data } = await supabase.from('auctions').select('*').eq('id', listingId).single();
    if (!data) throw new Error('Dražba ne obstaja.');
    const a = normalizeAuctionRow(data);
    const outcome = resolveAuctionOutcome(a);
    const d = data.data || {};
    await supabase.from('auctions').update({
        status: 'ended',
        winner_id: outcome.sold ? outcome.winnerId : null,
        data: {
            ...d,
            sold: outcome.sold,
            finalPriceEur: outcome.sold ? outcome.finalPriceEur : null,
            buyerPremiumEur: outcome.sold ? calcBuyerPremium(outcome.finalPriceEur) : null,
            endedAt: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
    }).eq('id', listingId);
}

// ── Auction alerts ────────────────────────────────────────────────────────────
export async function createAuctionAlert(email, criteria = {}, userId = null) {
    if (!email || !/.+@.+\..+/.test(email)) throw new Error('Vnesite veljaven e-poštni naslov.');
    const { data, error } = await supabase.from('auction_alerts').insert({
        email: email.trim().toLowerCase(),
        criteria,
        user_id: userId,
        active: true,
    }).select('id').single();
    if (error) throw new Error(error.message);
    return data.id;
}

export async function getAuctionAlerts() {
    const { data } = await supabase.from('auction_alerts').select('*').order('created_at', { ascending: false });
    return data || [];
}
