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

// ── Duration / listing fees (AutoHub model) ───────────────────────────────────
// Listing is FREE for 7 days (default). A 10-day duration costs 4.99 €.
// "Obvezna prodaja" (binding sale contract) is a 49.99 € add-on available on any
// auction type; it also unlocks the cash-on-pickup option. There is NO platform
// success fee on the seller — the platform earns the 3 % buyer's premium instead.
export const AUCTION_DURATIONS = {
    d7:  { id: 'd7',  days: 7,  price: 0 },
    d10: { id: 'd10', days: 10, price: 4.99 },
};
export const EXTENDED_DURATION_FEE = 4.99;   // 10-day upgrade
export const BINDING_CONTRACT_FEE  = 49.99;  // "Obvezna prodaja" add-on (seller pays)

// ── Buyer's premium ───────────────────────────────────────────────────────────
// The winning buyer pays a 3 % buyer's premium on the final price as the fee for
// using the TECHNICAL platform (it is NOT a sales-brokerage commission). Charged
// via Stripe Connect — see docs/AUCTIONS_HANDOFF.md + server/src/lib/stripe.ts.
export const BUYER_PREMIUM_PCT = 0.03;
// Once the buyer pays, the vehicle price is held in escrow and auto-released to
// the seller after this many hours UNLESS the buyer opens an official dispute
// (police report / lawyer's letter). The platform does NOT arbitrate disputes —
// see handoff §"izvzetje iz sporov".
export const ESCROW_AUTO_RELEASE_HOURS = 48;

/** Buyer's premium (EUR) on a given final price. */
export function calcBuyerPremium(finalPriceEur) {
    return Math.max(0, Number(finalPriceEur) || 0) * BUYER_PREMIUM_PCT;
}

/** Total the winning buyer is charged for a non-cash sale: price + premium. */
export function calcBuyerTotal(finalPriceEur) {
    const price = Math.max(0, Number(finalPriceEur) || 0);
    return price + calcBuyerPremium(price);
}

/**
 * Up-front listing fee the seller pays.
 * @param {{durationDays?:number, bindingContract?:boolean}} o
 * @returns {number} 0 | 4.99 | 49.99 | 54.98
 */
export function calcListingFee({ durationDays = 7, bindingContract = false } = {}) {
    let fee = Number(durationDays) >= 10 ? EXTENDED_DURATION_FEE : 0;
    if (bindingContract) fee += BINDING_CONTRACT_FEE;
    return Math.round(fee * 100) / 100;
}

// ── Auction types ─────────────────────────────────────────────────────────────
// 'silent' — sealed bids, amounts hidden until close; optional (hidden) reserve.
// 'prebid' — public pre-bid window, then flips to a live phase.
// 'live'   — classic real-time public auction.
export const AUCTION_TYPES = ['silent', 'prebid', 'live'];

/** Normalize legacy/unknown types to the current set. Legacy 'regular' → 'live'. */
export function normalizeAuctionType(type) {
    if (type === 'regular' || type == null) return 'live';
    return AUCTION_TYPES.includes(type) ? type : 'live';
}

/** True when bidding is in a public phase where anti-snip + proxy apply. */
export function isLivePhase(auction) {
    const type = normalizeAuctionType(auction?.auctionType);
    if (type === 'live') return true;
    if (type === 'prebid') return auction?.currentPhase === 'live';
    return false; // silent never has a "live" outbidding phase
}

// ── Anti-sniping ──────────────────────────────────────────────────────────────
// If a bid lands in the last 2 minutes the auction is extended by 2 minutes.
// Repeated sniping keeps extending until 2 full minutes pass without a new bid.
// Applies to live auctions and to pre-bid auctions while in their live phase.
export const ANTI_SNIP_WINDOW_MS = 2 * 60 * 1000;  // 2 min
export const ANTI_SNIP_EXTEND_MS = 2 * 60 * 1000;  // +2 min per trigger

// Pre-bid auctions run a public pre-bid window (durationDays), then flip into a
// live phase of this length. The close job reads this on transition.
export const PREBID_LIVE_PHASE_MS = 2 * 60 * 60 * 1000; // 2 h (configurable)

// Minimum bid increment in EUR. Public bids must beat the current price by this.
export const MIN_BID_INCREMENT = 50;

/** Compute the lowest valid next bid for an auction doc. */
export function minNextBid(auction) {
    if (!auction) return 0;
    const start = Number(auction.startPriceEur) || 0;
    // Silent: bids are sealed, so the floor is just the start price — comparing to
    // the current top would leak it. Any positive bid >= start is accepted.
    if (normalizeAuctionType(auction.auctionType) === 'silent') return start;
    const base = Number(auction.currentBidEur) || start;
    // First public bid may equal the start price; subsequent bids must beat current.
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
 *   sellerId, startPriceEur, durationDays? (7|10), auctionType ('silent'|'prebid'|'live'),
 *   reservePriceEur (silent only), bindingContract?, cashAllowed?, sellerContract
 * }
 */
export async function createAuction(listingId, opts) {
    const auctionType = normalizeAuctionType(opts.auctionType);
    const days = Number(opts.durationDays) === 10 ? 10 : 7;
    const bindingContract = !!opts.bindingContract;
    // Cash-on-pickup is only offered together with a binding sale contract.
    const cashAllowed = bindingContract && !!opts.cashAllowed;
    // A handwritten/printed signature is mandatory whenever money or delivery
    // happens off-platform under a binding contract.
    const signatureRequired = bindingContract || cashAllowed;

    const startsAt = Date.now();
    const startPrice = Number(opts.startPriceEur) || 0;

    // Pre-bid: the configured days are the PUBLIC pre-bid window; a live phase of
    // PREBID_LIVE_PHASE_MS follows once it flips (handled by the close job).
    const prebidEndsAt = auctionType === 'prebid' ? startsAt + days * DAY_MS : null;
    const endsAt = auctionType === 'prebid' ? prebidEndsAt : startsAt + days * DAY_MS;
    const currentPhase = auctionType === 'prebid' ? 'prebid' : null;

    const listingFee = calcListingFee({ durationDays: days, bindingContract });

    const auction = {
        listingId,
        sellerId: opts.sellerId,
        status: 'active',                       // active | paused | ended | cancelled
        auctionType,                            // 'silent' | 'prebid' | 'live'
        currentPhase,                           // 'prebid' | 'live' | null
        startPriceEur: startPrice,
        // Reserve is silent-only (hidden). Ignored for live/prebid.
        reservePriceEur: auctionType === 'silent' && opts.reservePriceEur
            ? Number(opts.reservePriceEur) : null,
        currentBidEur: startPrice,
        currentBidderId: null,
        // Proxy bidding: the current leader's declared maximum, for auto-escalation.
        proxyMaxEur: null,
        bidCount: 0,
        bidderCount: 0,
        antiSnipExtensions: 0,
        durationDays: days,
        // ── AutoHub commercial flags ──
        bindingContract,                        // 49.99 € "Obvezna prodaja"
        cashAllowed,                            // gotovinsko plačilo ob prevzemu
        signatureRequired,                      // bindingContract || cashAllowed
        buyerPremiumPercent: BUYER_PREMIUM_PCT * 100, // 3
        listingFee,                             // 0 | 4.99 | 49.99 | 54.98
        startsAt: Timestamp.fromMillis(startsAt),
        endsAt: Timestamp.fromMillis(endsAt),
        prebidEndsAt: prebidEndsAt ? Timestamp.fromMillis(prebidEndsAt) : null,
        // Seller's commitment to sell at the final price (signed at create time).
        sellerContract: opts.sellerContract || { type: null, signatureData: null, signedAt: null },
        // ── Payment / escrow stubs — set authoritatively by the backend ──
        listingFeePaid: listingFee === 0,      // free listings need no payment
        paymentRef: null,
        // Settlement (filled at close + on the buyer's payment):
        winnerId: null,
        finalPriceEur: null,
        sold: null,                             // true | false once resolved
        buyerPremiumEur: null,
        paymentIntentId: null,
        escrowReleaseAt: null,                  // now + 48h once the buyer pays
        escrowReleased: false,
        disputeOpenedAt: null,
        // Denormalized series for the price-over-time chart on the detail page.
        priceSeries: [{ t: startsAt, amount: startPrice, bidders: 0 }],
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

        const type = normalizeAuctionType(a.auctionType);
        const live = isLivePhase(a);  // anti-snip + proxy only in a live phase

        // ── Silent auction: sealed bids ─────────────────────────────────────────
        // Amounts are private (hidden in the UI). The floor is the start price so
        // nothing about the current top leaks. We record every bid and quietly
        // track the highest so the close job can resolve the winner.
        if (type === 'silent') {
            const min = minNextBid(a); // = startPrice
            if (amount < min) {
                throw new Error(`Ponudba mora biti vsaj ${min.toLocaleString('sl-SI')} €.`);
            }
            const isNewBidder = a.currentBidderId !== user.uid;
            tx.set(bidRef, buildBidDoc(user, amount, contract, notifyPref, false));
            const upd = {
                bidCount: (a.bidCount || 0) + 1,
                bidderCount: (a.bidderCount || 0) + (a.bidCount === 0 || isNewBidder ? 1 : 0),
                updatedAt: serverTimestamp(),
            };
            // Promote the (hidden) leader only when this bid is a new top.
            if (amount > (Number(a.currentBidEur) || 0)) {
                upd.currentBidEur = amount;
                upd.currentBidderId = user.uid;
            }
            tx.update(auctionRef, upd);
            return;
        }

        const min = minNextBid({ ...a, bidCount: a.bidCount });

        // ── Proxy check: can the current leader auto-escalate to beat this bid? ──
        const prevProxy = (live && a.currentBidderId && a.currentBidderId !== user.uid)
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

        // Anti-sniping extension (live phase only — pre-bid windows don't extend).
        const endsAtMs = toMillis(a.endsAt);
        const timeLeft = endsAtMs - now;
        const newEndsAt = (live && timeLeft > 0 && timeLeft < ANTI_SNIP_WINDOW_MS)
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
 * Determine the outcome of an auction at close. Client mirror of the backend's
 * authoritative logic (server/src/jobs/closeAuctions). Used by the admin manual
 * close and for display once an auction has ended.
 * @returns {{sold:boolean, winnerId:string|null, finalPriceEur:number, reason:string}}
 */
export function resolveAuctionOutcome(a) {
    const top = Number(a.currentBidEur) || 0;
    const hasBids = (a.bidCount || 0) > 0 && !!a.currentBidderId;
    if (!hasBids) return { sold: false, winnerId: null, finalPriceEur: top, reason: 'no_bids' };
    // Silent: must clear the (hidden) reserve to be a successful sale.
    if (normalizeAuctionType(a.auctionType) === 'silent' && a.reservePriceEur != null) {
        if (top < Number(a.reservePriceEur)) {
            return { sold: false, winnerId: null, finalPriceEur: top, reason: 'reserve_not_met' };
        }
    }
    return { sold: true, winnerId: a.currentBidderId, finalPriceEur: top, reason: 'sold' };
}

/**
 * Flip a pre-bid auction from its pre-bid window into the live phase. Normally
 * the close job does this at prebidEndsAt; exposed for admin/manual control.
 */
export async function advancePrebidPhase(listingId) {
    const ref = doc(db, 'auctions', listingId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Dražba ne obstaja.');
    const a = snap.data();
    if (normalizeAuctionType(a.auctionType) !== 'prebid' || a.currentPhase !== 'prebid') return;
    await updateDoc(ref, {
        currentPhase: 'live',
        endsAt: Timestamp.fromMillis(Date.now() + PREBID_LIVE_PHASE_MS),
        updatedAt: serverTimestamp(),
    });
}

/**
 * Manual close (admin). Resolves the winner per auction type and records the
 * buyer's premium owed. TODO(backend): the close job runs this automatically at
 * endsAt and creates the Stripe Connect PaymentIntent.
 */
export async function forceCloseAuction(listingId) {
    const auctionRef = doc(db, 'auctions', listingId);
    const aSnap = await getDoc(auctionRef);
    if (!aSnap.exists()) throw new Error('Dražba ne obstaja.');
    const a = aSnap.data();
    const outcome = resolveAuctionOutcome(a);
    await updateDoc(auctionRef, {
        status: 'ended',
        sold: outcome.sold,
        winnerId: outcome.sold ? outcome.winnerId : null,
        finalPriceEur: outcome.sold ? outcome.finalPriceEur : null,
        buyerPremiumEur: outcome.sold ? calcBuyerPremium(outcome.finalPriceEur) : null,
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
