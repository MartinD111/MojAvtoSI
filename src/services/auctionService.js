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

// Auction package pricing (EUR). Mirrors create-listing package picker.
export const AUCTION_PACKAGES = {
    auction3w: { id: 'auction3w', weeks: 3, price: 4.99 },
    auction6w: { id: 'auction6w', weeks: 6, price: 9.99 },
};

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
 * @param {Object} opts { sellerId, startPriceEur, durationWeeks, reservePriceEur, sellerContract, paidAmount, packageId }
 */
export async function createAuction(listingId, opts) {
    const weeks = Number(opts.durationWeeks) || 3;
    const startsAt = Date.now();
    const endsAt = startsAt + weeks * WEEK_MS;
    const startPrice = Number(opts.startPriceEur) || 0;

    const auction = {
        listingId,
        sellerId: opts.sellerId,
        status: 'active',                       // active | paused | ended | cancelled
        startPriceEur: startPrice,
        reservePriceEur: opts.reservePriceEur ? Number(opts.reservePriceEur) : null,
        currentBidEur: startPrice,
        currentBidderId: null,
        bidCount: 0,
        bidderCount: 0,
        durationWeeks: weeks,
        startsAt: Timestamp.fromMillis(startsAt),
        endsAt: Timestamp.fromMillis(endsAt),
        // Seller's commitment to sell at the final price (signed at create time).
        sellerContract: opts.sellerContract || { type: null, signatureData: null, signedAt: null },
        // Payment stub — TODO(backend): set via Stripe webhook.
        packageId: opts.packageId || null,
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
 * @param {string} listingId
 * @param {number} amountEur
 * @param {Object} user        Firebase Auth user
 * @param {Object} contract    { type:'sign'|'print', signatureData:string|null }
 * @param {Object} notifyPref  { onOutbid:boolean, thresholdEur:number|null }
 * @returns {Promise<{bidId:string}>}
 */
export async function placeBid(listingId, amountEur, user, contract = {}, notifyPref = {}) {
    if (!user) throw new Error('Za oddajo ponudbe se morate prijaviti.');
    if (sampleAuction(listingId)) throw new Error('To je predstavitvena dražba — ponudb ni mogoče oddati.');
    const amount = Number(amountEur);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Neveljaven znesek ponudbe.');

    const auctionRef = doc(db, 'auctions', listingId);
    const bidRef = doc(collection(db, 'auctions', listingId, 'bids'));

    await runTransaction(db, async (tx) => {
        const aSnap = await tx.get(auctionRef);
        if (!aSnap.exists()) throw new Error('Dražba ne obstaja.');
        const a = aSnap.data();

        if (a.sellerId === user.uid) throw new Error('Na lastno dražbo ne morete oddati ponudbe.');
        if (!isAuctionActive(a)) throw new Error('Dražba je zaključena.');

        const min = minNextBid({ ...a, bidCount: a.bidCount });
        if (amount < min) {
            throw new Error(`Ponudba mora biti vsaj ${min.toLocaleString('sl-SI')} €.`);
        }

        const isNewBidder = a.currentBidderId !== user.uid;
        const newBidderCount = (a.bidderCount || 0) + (a.bidCount === 0 || isNewBidder ? 1 : 0);
        const series = Array.isArray(a.priceSeries) ? a.priceSeries.slice(-199) : [];
        series.push({ t: Date.now(), amount, bidders: newBidderCount });

        tx.set(bidRef, {
            bidderId: user.uid,
            bidderName: user.displayName || 'Anonimni ponudnik',
            amountEur: amount,
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
        });

        tx.update(auctionRef, {
            currentBidEur: amount,
            currentBidderId: user.uid,
            bidCount: (a.bidCount || 0) + 1,
            bidderCount: newBidderCount,
            priceSeries: series,
            updatedAt: serverTimestamp(),
        });
    });

    return { bidId: bidRef.id };
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
