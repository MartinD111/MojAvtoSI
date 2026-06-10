// Auction (Dražba) detail page — MojAvto.si / MojaNavtika.si
//
// Reuses the standard listing layout (renderListing from listing.js / .navtika.js)
// so an auction looks exactly like a normal listing, then injects auction UI:
//   • live countdown timer
//   • current bid + bidder/bid counts + reserve indicator
//   • bid form → contract modal (finger sign or print PDF) → placeBid
//   • price-over-time chart (canvas) + live bid history
//   • newsletter signup
//
// Live updates come from Firestore onSnapshot (subscribeAuction / subscribeBids).

import { getListingById, getListings } from '../services/listingService.js';
import {
    subscribeAuction, subscribeBids, placeBid, minNextBid, isAuctionActive, MIN_BID_INCREMENT,
} from '../services/auctionService.js';
import { auth } from '../firebase.js';
import { PLATFORM } from '../config/platform.js';
import { t } from '../core/i18n.js';
import { startCountdown, endsAtMillis } from '../utils/countdown.js';
import { drawPriceChart } from '../utils/priceChart.js';
import { contractWidgetHtml, mountContractWidget, isContractComplete } from '../utils/auctionContract.js';
import { newsletterWidgetHtml, bindNewsletterWidget } from '../utils/auctionNewsletter.js';

let _unsubAuction = null;
let _unsubBids = null;
let _stopCountdown = null;
let _listing = null;
let _auction = null;

function cleanup() {
    if (_unsubAuction) { _unsubAuction(); _unsubAuction = null; }
    if (_unsubBids) { _unsubBids(); _unsubBids = null; }
    if (_stopCountdown) { _stopCountdown(); _stopCountdown = null; }
}
document.addEventListener('beforeRouteChange', cleanup);

const fmtEur = n => (Number(n) || 0).toLocaleString('sl-SI') + ' €';

export async function initAuctionListingPage() {
    console.log('[AuctionListing] init');
    cleanup();

    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const id = params.get('id');
    const page = document.getElementById('listingPage');
    if (!id || !page) {
        if (page) page.innerHTML = `<div class="error-page"><h1>404</h1><p>Dražba ni najdena.</p></div>`;
        return;
    }

    try {
        const [listing, allListings] = await Promise.all([
            getListingById(id),
            getListings().catch(() => []),
        ]);
        _listing = listing;

        // Render the standard listing layout (gallery, specs, seller, etc.).
        const mod = PLATFORM.id === 'navtika'
            ? await import('./listing.navtika.js')
            : await import('./listing.js');
        mod.renderListing(listing);
        mod.injectRating(listing, allListings);
        mod.injectServiceHistory(listing);

        // Swap the price card for the auction box and add chart/history/newsletter.
        injectAuctionUI(listing);

        // Go live.
        _unsubAuction = subscribeAuction(id, (auction) => {
            _auction = auction;
            updateAuctionUI(auction);
        });
        _unsubBids = subscribeBids(id, (bids) => {
            renderBidHistory(bids);
        });
    } catch (err) {
        console.error('[AuctionListing]', err);
        if (page) page.innerHTML = `<div class="error-page"><h1>404</h1><p>${err.message}</p></div>`;
    }
}

// ── Inject auction box in place of the price card ─────────────────────────────
function injectAuctionUI(listing) {
    const priceCard = document.querySelector('.lp-price-card');
    if (!priceCard) return;

    const box = document.createElement('div');
    box.className = 'lp-sidebar-card auction-box';
    box.innerHTML = `
        <div class="auction-countdown">
            <i data-lucide="clock"></i>
            <span class="ac-timer-val" id="acTimer">—</span>
        </div>
        <p class="auction-countdown-label" id="acTimerLabel">${t('auction_time_left', 'do zaključka dražbe')}</p>

        <div class="auction-current">
            <span class="auction-current-label">${t('auction_current_bid', 'Trenutna ponudba')}</span>
            <span class="auction-current-value" id="acCurrent">—</span>
        </div>
        <div class="auction-meta-row">
            <span>🔨 <strong id="acBidCount">0</strong> ${t('auction_bids', 'ponudb')}</span>
            <span>👤 <strong id="acBidderCount">0</strong> ${t('auction_bidders', 'ponudnikov')}</span>
            <span id="acStartPrice"></span>
        </div>
        <div class="auction-reserve" id="acReserve" style="display:none;"></div>

        <form class="auction-bid-form" id="acBidForm">
            <div class="auction-bid-input-row">
                <input type="number" class="auction-bid-input" id="acBidInput" inputmode="numeric" step="1" />
                <button type="submit" class="auction-bid-btn" id="acBidBtn">${t('auction_place_bid', 'Oddaj ponudbo')}</button>
            </div>
            <span class="auction-bid-hint" id="acBidHint"></span>
            <label class="auction-bid-notify">
                <input type="checkbox" id="acNotifyOutbid" checked />
                ${t('auction_notify_outbid', 'Obvesti me po e-pošti, ko me nekdo prehiti')}
            </label>
            <label class="auction-bid-notify">
                ${t('auction_notify_threshold', 'Obvesti me, ko cena preseže')}
                <input type="number" id="acNotifyThreshold" class="auction-bid-input" style="height:34px;max-width:120px;" placeholder="€" />
            </label>
            <span class="auction-bid-status" id="acBidStatus"></span>
        </form>
    `;
    priceCard.replaceWith(box);

    // Chart + history go in the main column under the specs.
    const main = document.querySelector('.lp-main');
    if (main) {
        const extra = document.createElement('div');
        extra.innerHTML = `
            <section class="lp-section auction-chart-section">
                <h3>${t('auction_price_history', 'Potek cene')}</h3>
                <canvas class="auction-chart-canvas" id="acChart"></canvas>
                <div class="auction-chart-legend">
                    <span><span class="swatch" style="background:var(--color-primary-start);"></span>${t('auction_price', 'Cena')}</span>
                    <span><span class="swatch" style="background:#94a3b8;"></span>${t('auction_bidders', 'ponudniki')}</span>
                </div>
            </section>
            <section class="lp-section auction-bid-history">
                <h3>${t('auction_bid_history', 'Zgodovina ponudb')}</h3>
                <div id="acBidHistory"><p style="color:#94a3b8;font-size:0.85rem;">${t('auction_no_bids', 'Še ni ponudb. Bodite prvi!')}</p></div>
            </section>
            <section class="lp-section">
                <div id="acNewsletter"></div>
            </section>`;
        main.appendChild(extra);

        const nl = extra.querySelector('#acNewsletter');
        nl.innerHTML = newsletterWidgetHtml({
            interest: [listing.make, listing.model].filter(Boolean).join(' '),
        });
        bindNewsletterWidget(extra);
    }

    document.getElementById('acBidForm').addEventListener('submit', onBidSubmit);
    if (window.lucide) window.lucide.createIcons();
}

// ── Live update from the auction snapshot ─────────────────────────────────────
function updateAuctionUI(auction) {
    if (!auction) return;
    const isOwn = auth.currentUser && auth.currentUser.uid === auction.sellerId;
    const active = isAuctionActive(auction);
    const min = minNextBid(auction);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('acCurrent', fmtEur(auction.currentBidEur ?? auction.startPriceEur));
    setText('acBidCount', auction.bidCount || 0);
    setText('acBidderCount', auction.bidderCount || 0);
    setText('acStartPrice', `${t('auction_start', 'Izklicna')}: ${fmtEur(auction.startPriceEur)}`);

    // Reserve indicator
    const reserveEl = document.getElementById('acReserve');
    if (reserveEl) {
        if (auction.reservePriceEur) {
            const met = (auction.currentBidEur ?? 0) >= auction.reservePriceEur;
            reserveEl.style.display = 'block';
            reserveEl.className = `auction-reserve ${met ? 'met' : 'unmet'}`;
            reserveEl.textContent = met
                ? `✓ ${t('auction_reserve_met', 'Minimalna cena dosežena')}`
                : `⚠ ${t('auction_reserve_unmet', 'Minimalna cena še ni dosežena')}`;
        } else {
            reserveEl.style.display = 'none';
        }
    }

    // Countdown
    const timerEl = document.getElementById('acTimer');
    const endMs = endsAtMillis(auction.endsAt);
    if (_stopCountdown) { _stopCountdown(); _stopCountdown = null; }
    if (timerEl && endMs) {
        _stopCountdown = startCountdown(timerEl, endMs, (_txt, { ended }) => {
            if (ended) disableBidding(t('auction_ended', 'Dražba je zaključena.'));
        });
    }

    // Bid form state
    const input = document.getElementById('acBidInput');
    const hint = document.getElementById('acBidHint');
    const btn = document.getElementById('acBidBtn');
    if (input && hint && btn) {
        input.min = String(min);
        if (!input.value || Number(input.value) < min) input.value = min;
        hint.textContent = `${t('auction_min_next', 'Najnižja naslednja ponudba')}: ${fmtEur(min)} (korak ${fmtEur(MIN_BID_INCREMENT)})`;
        if (isOwn) disableBidding(t('auction_own', 'To je vaša dražba.'));
        else if (!active) disableBidding(t('auction_ended', 'Dražba je zaključena.'));
        else { btn.disabled = false; input.disabled = false; }
    }

    // Redraw chart from the denormalized series.
    drawChart(auction);
}

function disableBidding(message) {
    const btn = document.getElementById('acBidBtn');
    const input = document.getElementById('acBidInput');
    const status = document.getElementById('acBidStatus');
    if (btn) btn.disabled = true;
    if (input) input.disabled = true;
    if (status && message) { status.textContent = message; status.className = 'auction-bid-status'; }
}

function drawChart(auction) {
    const canvas = document.getElementById('acChart');
    if (!canvas) return;
    const dark = document.body.classList.contains('dark-mode');
    const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary-start').trim() || '#2563eb';
    drawPriceChart(canvas, auction.priceSeries || [], { primary, dark });
}

// ── Bid history ───────────────────────────────────────────────────────────────
function renderBidHistory(bids) {
    const wrap = document.getElementById('acBidHistory');
    if (!wrap) return;
    if (!bids || bids.length === 0) {
        wrap.innerHTML = `<p style="color:#94a3b8;font-size:0.85rem;">${t('auction_no_bids', 'Še ni ponudb. Bodite prvi!')}</p>`;
        return;
    }
    wrap.innerHTML = bids.map(b => {
        const when = b.createdAt?.toDate ? b.createdAt.toDate() : null;
        const time = when ? when.toLocaleString('sl-SI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
        const name = (b.bidderName || 'Ponudnik').replace(/(.{2}).*/, '$1***');
        return `<div class="bid-row">
            <span class="bid-name">${name}</span>
            <span class="bid-amount">${fmtEur(b.amountEur)}</span>
            <span class="bid-time">${time}</span>
        </div>`;
    }).join('');
}

// ── Bid submit → contract modal → placeBid ────────────────────────────────────
async function onBidSubmit(e) {
    e.preventDefault();
    if (!auth.currentUser) {
        const { showAuthGate } = await import('../utils/authGate.js');
        showAuthGate();
        return;
    }
    const amount = Number(document.getElementById('acBidInput').value);
    const min = minNextBid(_auction);
    const status = document.getElementById('acBidStatus');
    if (!Number.isFinite(amount) || amount < min) {
        status.textContent = `${t('auction_err_low', 'Ponudba mora biti vsaj')} ${fmtEur(min)}.`;
        status.className = 'auction-bid-status err';
        return;
    }
    const notify = {
        onOutbid: document.getElementById('acNotifyOutbid')?.checked || false,
        thresholdEur: Number(document.getElementById('acNotifyThreshold')?.value) || null,
    };
    openContractModal(amount, notify);
}

function openContractModal(amount, notify) {
    const overlay = document.createElement('div');
    overlay.className = 'auction-modal-overlay';
    overlay.innerHTML = `
        <div class="auction-modal">
            <h2>${t('auction_contract_title', 'Zaveza k nakupu')}</h2>
            <p class="auction-modal-sub">
                ${t('auction_contract_sub', 'Z oddajo ponudbe se zavezujete, da boste vozilo kupili po tej ceni, če ob zaključku dražbe zmagate.')}
                <strong>${fmtEur(amount)}</strong>
            </p>
            ${contractWidgetHtml({
                party: 'buyer',
                title: t('auction_contract_widget_title', 'Podpis zaveze'),
                body: t('auction_contract_widget_body', 'Podpišite s prstom ali prenesite PDF za podpis. Hranimo le do zaključka dražbe.'),
            })}
            <div class="auction-modal-actions">
                <button class="auction-modal-cancel" id="acmCancel">${t('cancel', 'Prekliči')}</button>
                <button class="auction-modal-confirm" id="acmConfirm" disabled>${t('auction_confirm_bid', 'Potrdi ponudbo')}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons();

    let getContract = null;
    const confirmBtn = overlay.querySelector('#acmConfirm');
    const contractRoot = overlay.querySelector('.ac-contract');
    mountContractWidget(contractRoot, {
        title: 'Zaveza k nakupu na dražbi — MojAvto.si',
        fileName: 'zaveza-nakup-drazba',
        lines: [
            `Ponudnik se zavezuje, da bo predmet dražbe kupil po ceni ${fmtEur(amount)},`,
            'če bo ob zaključku dražbe oddal najvišjo veljavno ponudbo (zmagal).',
            '',
            'Ta dokument se hrani le do zaključka dražbe.',
        ],
    }, (contract) => {
        confirmBtn.disabled = !isContractComplete(contract);
    }).then(g => { getContract = g; });

    const close = () => overlay.remove();
    overlay.querySelector('#acmCancel').addEventListener('click', close);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) close(); });

    confirmBtn.addEventListener('click', async () => {
        const contract = getContract && getContract();
        if (!isContractComplete(contract)) return;
        confirmBtn.disabled = true;
        const status = document.getElementById('acBidStatus');
        try {
            await placeBid(_listing.id, amount, auth.currentUser,
                { type: contract.type, signatureData: contract.signatureData }, notify);
            status.textContent = t('auction_bid_ok', '✓ Ponudba oddana!');
            status.className = 'auction-bid-status ok';
            close();
        } catch (err) {
            status.textContent = err.message;
            status.className = 'auction-bid-status err';
            close();
        }
    });
}
