// auctionService.js — Auction (dražba) data layer
//
// Auctions reuse the `listings` collection (entryType: 'auction'). Auction-only
// state lives in a sibling doc `auctions/{listingId}` + subcollection
// `auctions/{listingId}/bids`, kept separate so the hot bid path and live
// onSnapshot don't bloat the listing doc and so rules can guard bids tightly.
//
// PHASE NOTE (frontend now, backend later): this module performs best-effort
// client-side bid validation inside a transaction. Server-authoritative
// validation, auction auto-close, email and payment are deferred to Cloud
// Functions — see docs/AUCTIONS_HANDOFF.md. Anything marked TODO(backend) is a
// stub recorded as intent, not actually delivered/charged.

import {
    collection, doc, getDoc, setDoc, addDoc, updateDoc, getDocs,
    query, orderBy, onSnapshot, serverTimestamp, runTransaction, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { sampleAuctionState } from '../data/sampleAuctions.js';

// Demo auctions (entryType:'auction' sample listings) have no Firestore doc.
// We serve their state from sampleAuctionState so the board + detail page render
// and the live box (current bid, history, chart) is populated without a backend.
function sampleAuction(listingId) {
    return sampleAuctionState[listingId] || null;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS  = 24 * 60 * 60 * 1000;

// ── Packages ─────────────────────────────────────────────────────────────────
// Standard auction is free (21 days). Optional 45-day extended visibility costs
// 2.99 €. No upfront payment is required to list.
export const AUCTION_PACKAGES = {
    auctionFree: { id: 'auctionFree', days: 21, weeks: 3, price: 0 },
    auction45d:  { id: 'auction45d',  days: 45, weeks: 7, price: 2.99 },
};

// ── Success fee ───────────────────────────────────────────────────────────────
// 1 % of the final winning bid, capped at 5 000 €. Charged to the seller after
// a successful sale. TODO(backend): trigger via Stripe on auction close.
export const AUCTION_SUCCESS_FEE_PCT = 0.01;
export const AUCTION_SUCCESS_FEE_MAX = 5000;

/** Compute the platform success fee for a given final price (EUR). */
export function calcSuccessFee(finalBidEur) {
    return Math.min(Number(finalBidEur) * AUCTION_SUCCESS_FEE_PCT, AUCTION_SUCCESS_FEE_MAX);
}

// ── Anti-sniping ──────────────────────────────────────────────────────────────
// If a bid lands in the last 3 minutes the auction is extended by 5 minutes.
// Repeated sniping keeps extending until 5 full minutes pass without a new bid.
export const ANTI_SNIP_WINDOW_MS = 3 * 60 * 1000;  // 3 min
export const ANTI_SNIP_EXTEND_MS = 5 * 60 * 1000;  // +5 min per trigger

// Minimum bid increment in EUR. Bids must beat the current price by at least this.
export const MIN_BID_INCREMENT = 50;

/** Compute the lowest valid next bid for an auction doc. */
export function minNextBid(auction) {
    if (!auction) return 0;
    const base = Number(auction.currentBidEur) || Number(auction.startPriceEur) || 0;
    // First bid may equal the start price; subsequent bids must beat current.
    return auction.bidCount > 0 ? base + MIN_BID_INCREMENT : base;
}

/** Is the auction still open for bids right now? */
export function isAuctionActive(auction) {
    if (!auction || auction.status !== 'active') return false;
    const ends = toMillis(auction.endsAt);
    return ends == null || ends > Date.now();
}

function toMillis(ts) {
    if (!ts) return null;
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    if (ts instanceof Date) return ts.getTime();
    if (typeof ts === 'number') return ts;
    return null;
}

// ── Create ──────────────────────────────────────────────────────────────────
/**
 * Creates the auction state doc for a listing. Called by listingService after
 * the listing doc exists.
 * @param {string} listingId
 * @param {Object} opts {
 *   sellerId, startPriceEur, durationDays?, durationWeeks?,
 *   reservePriceEur, auctionType, sellerContract, packageId, paidAmount
 * }
 */
export async function createAuction(listingId, opts) {
    const pkg = AUCTION_PACKAGES[opts.packageId] || AUCTION_PACKAGES.auctionFree;
    const days = Number(opts.durationDays) || pkg.days || 21;
    const weeks = Math.ceil(days / 7);
    const startsAt = Date.now();
    const endsAt = startsAt + days * DAY_MS;
    const startPrice = Number(opts.startPriceEur) || 0;

    const auction = {
        listingId,
        sellerId: opts.sellerId,
        status: 'active',                       // active | paused | ended | cancelled
        // 'regular' = open bidding; 'silent' = bid counts shown, amounts hidden until end.
        auctionType: opts.auctionType || 'regular',
        startPriceEur: startPrice,
        reservePriceEur: opts.reservePriceEur ? Number(opts.reservePriceEur) : null,
        currentBidEur: startPrice,
        currentBidderId: null,
        // Proxy bidding: the current leader's declared maximum, used for auto-escalation.
        proxyMaxEur: null,
        bidCount: 0,
        bidderCount: 0,
        antiSnipExtensions: 0,
        durationDays: days,
        durationWeeks: weeks,
        startsAt: Timestamp.fromMillis(startsAt),
        endsAt: Timestamp.fromMillis(endsAt),
        // Seller's commitment to sell at the final price (signed at create time).
        sellerContract: opts.sellerContract || { type: null, signatureData: null, signedAt: null },
        // Payment stub — TODO(backend): set via Stripe webhook.
        packageId: pkg.id,
        paidAmount: opts.paidAmount ?? null,
        paymentRef: null,
        // Denormalized series for the price-over-time chart on the detail page.
        priceSeries: [{ t: startsAt, amount: startPrice, bidders: 0 }],
        winnerId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // Doc id === listingId for a clean 1:1 lookup.
    await setDoc(doc(db, 'auctions', listingId), auction);
    return listingId;
}

// ── Read ────────────────────────────────────────────────────────────────────
export async function getAuction(listingId) {
    const demo = sampleAuction(listingId);
    if (demo) return demo.auction;
    const snap = await getDoc(doc(db, 'auctions', listingId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Live-subscribe to the auction doc. Returns an unsubscribe fn. */
export function subscribeAuction(listingId, cb) {
    const demo = sampleAuction(listingId);
    if (demo) {
        // No live updates for demo auctions — emit the static snapshot once.
        Promise.resolve().then(() => cb(demo.auction));
        return () => {};
    }
    return onSnapshot(doc(db, 'auctions', listingId), snap => {
        cb(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
}

/** Live-subscribe to the bid history (newest first). Returns an unsubscribe fn. */
export function subscribeBids(listingId, cb) {
    const demo = sampleAuction(listingId);
    if (demo) {
        Promise.resolve().then(() => cb(demo.bids));
        return () => {};
    }
    const q = query(collection(db, 'auctions', listingId, 'bids'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
}

export async function getBids(listingId) {
    const demo = sampleAuction(listingId);
    if (demo) return demo.bids;
    const q = query(collection(db, 'auctions', listingId, 'bids'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Bid ─────────────────────────────────────────────────────────────────────
/**
 * Place a bid. Best-effort client-side validation inside a transaction.
 *
 * Anti-sniping: if the bid lands in the last ANTI_SNIP_WINDOW_MS the auction
 * endsAt is extended by ANTI_SNIP_EXTEND_MS.
 *
 * Proxy bidding: pass maxBidEur > amountEur to register a proxy. If the
 * previous leader had a proxy that beats this bid, the system auto-escalates
 * on their behalf up to their registered maximum.
 *
 * @param {string} listingId
 * @param {number} amountEur   The explicit bid (must meet minNextBid).
 * @param {Object} user        Firebase Auth user
 * @param {Object} contract    { type:'sign'|'print', signatureData:string|null }
 * @param {Object} notifyPref  { onOutbid:boolean, thresholdEur:number|null }
 * @param {number|null} maxBidEur  Optional proxy maximum. Stored on the auction
 *   doc as proxyMaxEur when this user becomes the leader. Cleared when outbid.
 * @returns {Promise<{bidId:string, antiSnipExtended:boolean, proxyClaimed:boolean}>}
 */
export async function placeBid(listingId, amountEur, user, contract = {}, notifyPref = {}, maxBidEur = null) {
    if (!user) throw new Error('Za oddajo ponudbe se morate prijaviti.');
    if (sampleAuction(listingId)) throw new Error('To je predstavitvena dražba — ponudb ni mogoče oddati.');
    const amount = Number(amountEur);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Neveljaven znesek ponudbe.');
    const proxyMax = maxBidEur && Number.isFinite(Number(maxBidEur)) && Number(maxBidEur) > amount
        ? Number(maxBidEur) : null;

    const auctionRef = doc(db, 'auctions', listingId);
    const bidRef = doc(collection(db, 'auctions', listingId, 'bids'));

    let antiSnipExtended = false;
    let proxyClaimed = false;

    await runTransaction(db, async (tx) => {
        const aSnap = await tx.get(auctionRef);
        if (!aSnap.exists()) throw new Error('Dražba ne obstaja.');
        const a = aSnap.data();

        if (a.sellerId === user.uid) throw new Error('Na lastno dražbo ne morete oddati ponudbe.');
        if (!isAuctionActive(a)) throw new Error('Dražba je zaključena.');

        const min = minNextBid({ ...a, bidCount: a.bidCount });

        // ── Proxy check: can the current leader auto-escalate to beat this bid? ──
        const prevProxy = (a.currentBidderId && a.currentBidderId !== user.uid)
            ? (Number(a.proxyMaxEur) || 0) : 0;
        if (prevProxy >= min && prevProxy >= amount) {
            // Leader's proxy beats the incoming bid — auto-raise to the minimum
            // needed to stay ahead, capped at their proxy max.
            const autoAmount = Math.min(prevProxy, amount + MIN_BID_INCREMENT);
            // The incoming bid is still valid (it meets the current minimum), so
            // we record it first, then immediately record the proxy counter-bid.
            if (amount < min) throw new Error(`Ponudba mora biti vsaj ${min.toLocaleString('sl-SI')} €.`);

            const now = Date.now();
            const isNewBidder = a.currentBidderId !== user.uid;
            const newBidderCount = (a.bidderCount || 0) + (isNewBidder ? 1 : 0);
            const series = Array.isArray(a.priceSeries) ? a.priceSeries.slice(-197) : [];
            series.push({ t: now, amount, bidders: newBidderCount });
            series.push({ t: now + 1, amount: autoAmount, bidders: newBidderCount });

            // Incoming bid doc
            tx.set(bidRef, buildBidDoc(user, amount, contract, notifyPref, false));
            // Proxy counter-bid doc
            const proxyBidRef = doc(collection(db, 'auctions', listingId, 'bids'));
            tx.set(proxyBidRef, {
                bidderId: a.currentBidderId,
                bidderName: 'Avtomatska ponudba (predponudba)',
                amountEur: autoAmount,
                isProxy: true,
                contract: { type: null, signatureData: null, signedAt: null },
                notify: { onOutbid: false, thresholdEur: null },
                createdAt: serverTimestamp(),
            });

            // Anti-snip check on the proxy counter as well
            const endsAtMs = toMillis(a.endsAt);
            const timeLeft = endsAtMs - now;
            const newEndsAt = (timeLeft > 0 && timeLeft < ANTI_SNIP_WINDOW_MS)
                ? Timestamp.fromMillis(endsAtMs + ANTI_SNIP_EXTEND_MS) : a.endsAt;
            antiSnipExtended = (newEndsAt !== a.endsAt);

            tx.update(auctionRef, {
                currentBidEur: autoAmount,
                // Leader stays the same; their proxyMaxEur remains until outbid.
                bidCount: (a.bidCount || 0) + 2,
                bidderCount: newBidderCount,
                antiSnipExtensions: (a.antiSnipExtensions || 0) + (antiSnipExtended ? 1 : 0),
                endsAt: newEndsAt,
                priceSeries: series,
                updatedAt: serverTimestamp(),
            });
            proxyClaimed = true;
            return;
        }

        if (amount < min) {
            throw new Error(`Ponudba mora biti vsaj ${min.toLocaleString('sl-SI')} €.`);
        }

        // ── Normal bid path ────────────────────────────────────────────────────
        const now = Date.now();
        const isNewBidder = a.currentBidderId !== user.uid;
        const newBidderCount = (a.bidderCount || 0) + (a.bidCount === 0 || isNewBidder ? 1 : 0);
        const series = Array.isArray(a.priceSeries) ? a.priceSeries.slice(-199) : [];
        series.push({ t: now, amount, bidders: newBidderCount });

        // Anti-sniping extension
        const endsAtMs = toMillis(a.endsAt);
        const timeLeft = endsAtMs - now;
        const newEndsAt = (timeLeft > 0 && timeLeft < ANTI_SNIP_WINDOW_MS)
            ? Timestamp.fromMillis(endsAtMs + ANTI_SNIP_EXTEND_MS) : a.endsAt;
        antiSnipExtended = (newEndsAt !== a.endsAt);

        tx.set(bidRef, buildBidDoc(user, amount, contract, notifyPref, false));

        tx.update(auctionRef, {
            currentBidEur: amount,
            currentBidderId: user.uid,
            // Store new leader's proxy max (null if none given).
            proxyMaxEur: proxyMax,
            bidCount: (a.bidCount || 0) + 1,
            bidderCount: newBidderCount,
            antiSnipExtensions: (a.antiSnipExtensions || 0) + (antiSnipExtended ? 1 : 0),
            endsAt: newEndsAt,
            priceSeries: series,
            updatedAt: serverTimestamp(),
        });
    });

    return { bidId: bidRef.id, antiSnipExtended, proxyClaimed };
}

function buildBidDoc(user, amount, contract, notifyPref, isProxy) {
    return {
        bidderId: user.uid,
        bidderName: user.displayName || 'Anonimni ponudnik',
        amountEur: amount,
        isProxy: isProxy || false,
        // Buyer's commitment to buy if they win. Pruned at auction end — see handoff.
        contract: {
            type: contract.type || null,
            signatureData: contract.signatureData || null,
            signedAt: contract.type ? serverTimestamp() : null,
        },
        // TODO(backend): the email function reads these to send outbid/threshold alerts.
        notify: {
            onOutbid: !!notifyPref.onOutbid,
            thresholdEur: notifyPref.thresholdEur ? Number(notifyPref.thresholdEur) : null,
        },
        createdAt: serverTimestamp(),
    };
}

// ── Seller / admin status changes ─────────────────────────────────────────────
export async function setAuctionStatus(listingId, status) {
    await updateDoc(doc(db, 'auctions', listingId), { status, updatedAt: serverTimestamp() });
}

/**
 * Manual close (admin). Picks the highest bidder as winner.
 * TODO(backend): this runs automatically at endsAt via a scheduled function.
 */
export async function forceCloseAuction(listingId) {
    const auctionRef = doc(db, 'auctions', listingId);
    const aSnap = await getDoc(auctionRef);
    if (!aSnap.exists()) throw new Error('Dražba ne obstaja.');
    const a = aSnap.data();
    await updateDoc(auctionRef, {
        status: 'ended',
        winnerId: a.currentBidderId || null,
        endedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

// ── Newsletter / alerts ───────────────────────────────────────────────────────
/**
 * Subscribe an email to the auction newsletter for vehicles of interest.
 * @param {string} email
 * @param {Object} criteria  free-form { make, model, category, priceMax, ... }
 */
export async function createAuctionAlert(email, criteria = {}, userId = null) {
    if (!email || !/.+@.+\..+/.test(email)) throw new Error('Vnesite veljaven e-poštni naslov.');
    const ref = await addDoc(collection(db, 'auctionAlerts'), {
        email: email.trim().toLowerCase(),
        criteria,
        userId,
        active: true,
        createdAt: serverTimestamp(),
    });
    return ref.id;
}

export async function getAuctionAlerts() {
    const q = query(collection(db, 'auctionAlerts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
