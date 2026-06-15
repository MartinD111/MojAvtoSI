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
    subscribeAuction, subscribeBids, placeBid, minNextBid, isAuctionActive,
    MIN_BID_INCREMENT, calcBuyerPremium, BUYER_PREMIUM_PCT, ANTI_SNIP_WINDOW_MS,
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
// Parse digits out of the formatted bid input (e.g. "60.050 €" → 60050).
const parseBid = v => Number(String(v).replace(/[^\d]/g, '')) || 0;
// Format a numeric bid for display in the input (e.g. 60050 → "60.050 €").
const fmtBidInput = n => n ? fmtEur(n) : '';

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

        <div class="auction-type-badge" id="acTypeBadge" style="display:none;"></div>

        <div class="auction-current" id="acCurrentWrap">
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
                <input type="text" class="auction-bid-input" id="acBidInput" inputmode="numeric" />
                <button type="submit" class="auction-bid-btn" id="acBidBtn">${t('auction_place_bid', 'Oddaj ponudbo')}</button>
            </div>
            <span class="auction-bid-hint" id="acBidHint"></span>

            <div class="auction-proxy-section" id="acProxySection">
                <label class="auction-proxy-label">
                    <i data-lucide="zap" style="width:14px;height:14px;"></i>
                    ${t('auction_proxy_label', 'Predponudba — samodejno licitiranje do:')}
                </label>
                <div class="auction-proxy-row">
                    <input type="text" class="auction-bid-input auction-proxy-input" id="acProxyInput" inputmode="numeric" placeholder="${t('auction_proxy_placeholder', 'Maks. znesek (neobvezno)')}" />
                </div>
                <span class="auction-proxy-hint">${t('auction_proxy_hint', 'Sistem bo samodejno licitiral za vas do tega zneska, ko vas nekdo prehiti.')}</span>
            </div>

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

        <div class="auction-snip-badge">
            <i data-lucide="shield-check" style="width:14px;height:14px;flex-shrink:0;"></i>
            <span>${t('auction_antisnip', 'Zaščita pred sniperji: ponudba v zadnjih 3 minutah podaljša dražbo za 5 minut.')}</span>
        </div>

        <div class="auction-fee-info" id="acFeeInfo" style="display:none;"></div>
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
    // Live-format both bid inputs as the user types.
    const bidInput = document.getElementById('acBidInput');
    if (bidInput) {
        bidInput.addEventListener('input', () => {
            const n = parseBid(bidInput.value);
            bidInput.value = fmtBidInput(n);
        });
    }
    const proxyInput = document.getElementById('acProxyInput');
    if (proxyInput) {
        proxyInput.addEventListener('input', () => {
            const raw = proxyInput.value.replace(/[^\d]/g, '');
            if (raw) proxyInput.value = fmtBidInput(Number(raw));
        });
    }
    if (window.lucide) window.lucide.createIcons();
}

// ── Live update from the auction snapshot ─────────────────────────────────────
function updateAuctionUI(auction) {
    if (!auction) return;
    const isOwn = auth.currentUser && auth.currentUser.uid === auction.sellerId;
    const isSilent = auction.auctionType === 'silent';
    const active = isAuctionActive(auction);
    const min = minNextBid(auction);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // Silent auction: hide the current bid value from non-sellers until ended.
    const currentWrap = document.getElementById('acCurrentWrap');
    if (isSilent && !isOwn && active) {
        if (currentWrap) currentWrap.style.display = 'none';
    } else {
        if (currentWrap) currentWrap.style.display = '';
        setText('acCurrent', fmtEur(auction.currentBidEur ?? auction.startPriceEur));
    }

    // Silent/type badge
    const typeBadge = document.getElementById('acTypeBadge');
    if (typeBadge && isSilent) {
        typeBadge.style.display = 'flex';
        typeBadge.textContent = `🔒 ${t('auction_type_silent', 'Zaprta dražba — ponudbe so skrite do zaključka')}`;
    }

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

    // Buyer's premium info. Shown to bidders (it's what THEY pay on top of the
    // winning price) — not a seller fee. Hidden on silent auctions while live so
    // the current price doesn't leak.
    const feeEl = document.getElementById('acFeeInfo');
    if (feeEl) {
        const finalBid = auction.currentBidEur ?? auction.startPriceEur ?? 0;
        const hideForSilent = isSilent && !isOwn && active;
        if (finalBid > 0 && !hideForSilent) {
            const premium = calcBuyerPremium(finalBid);
            const pct = BUYER_PREMIUM_PCT * 100;
            feeEl.style.display = 'flex';
            feeEl.innerHTML = `<i data-lucide="info" style="width:14px;height:14px;flex-shrink:0;"></i>
                <span>${t('auction_premium_info', 'Kupčeva premija ob zmagi')}: <strong>${fmtEur(premium)}</strong>
                <span class="auction-fee-note">(${pct} % končne cene — plačilo za uporabo platforme)</span></span>`;
            if (window.lucide) window.lucide.createIcons({ context: feeEl });
        } else {
            feeEl.style.display = 'none';
        }
    }

    // Countdown — restart whenever endsAt changes (anti-snip extensions update it).
    const timerEl = document.getElementById('acTimer');
    const endMs = endsAtMillis(auction.endsAt);
    if (_stopCountdown) { _stopCountdown(); _stopCountdown = null; }
    if (timerEl && endMs) {
        _stopCountdown = startCountdown(timerEl, endMs, (_txt, { ended, remainingMs }) => {
            if (ended) {
                disableBidding(t('auction_ended', 'Dražba je zaključena.'));
                // Reveal final price on silent auctions once ended.
                if (isSilent && currentWrap) {
                    currentWrap.style.display = '';
                    setText('acCurrent', fmtEur(auction.currentBidEur ?? auction.startPriceEur));
                }
            }
            // Flash a notice when we're inside the anti-snip window.
            const label = document.getElementById('acTimerLabel');
            if (label && remainingMs > 0 && remainingMs < ANTI_SNIP_WINDOW_MS) {
                label.textContent = t('auction_antisnip_active', '⚡ Zadnje minute — vsaka ponudba podaljša dražbo za 2 min!');
                label.style.color = '#dc2626';
                label.style.fontWeight = '700';
            } else if (label) {
                label.textContent = t('auction_time_left', 'do zaključka dražbe');
                label.style.color = '';
                label.style.fontWeight = '';
            }
        });
    }

    // Bid form state
    const input = document.getElementById('acBidInput');
    const hint = document.getElementById('acBidHint');
    const btn = document.getElementById('acBidBtn');
    if (input && hint && btn) {
        if (!input.value || parseBid(input.value) < min) input.value = fmtBidInput(min);
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
    const isSilent = _auction?.auctionType === 'silent';
    const isOwn = auth.currentUser && auth.currentUser.uid === _auction?.sellerId;
    const auctionEnded = _auction && !isAuctionActive(_auction);
    // In a silent auction hide amounts from everyone except the seller until it ends.
    const hideBidAmounts = isSilent && !isOwn && !auctionEnded;

    wrap.innerHTML = bids.map(b => {
        const when = b.createdAt?.toDate ? b.createdAt.toDate() : null;
        const time = when ? when.toLocaleString('sl-SI', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
        const name = (b.bidderName || 'Ponudnik').replace(/(.{2}).*/, '$1***');
        const amountHtml = hideBidAmounts
            ? `<span class="bid-amount bid-amount--hidden">• • •</span>`
            : `<span class="bid-amount">${fmtEur(b.amountEur)}</span>`;
        const proxyTag = b.isProxy ? `<span class="bid-proxy-tag">${t('auction_proxy_tag', 'predponudba')}</span>` : '';
        return `<div class="bid-row">
            <span class="bid-name">${name}${proxyTag}</span>
            ${amountHtml}
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
    const amount = parseBid(document.getElementById('acBidInput').value);
    const min = minNextBid(_auction);
    const status = document.getElementById('acBidStatus');
    if (!Number.isFinite(amount) || amount < min) {
        status.textContent = `${t('auction_err_low', 'Ponudba mora biti vsaj')} ${fmtEur(min)}.`;
        status.className = 'auction-bid-status err';
        return;
    }
    const proxyRaw = parseBid(document.getElementById('acProxyInput')?.value || '');
    const maxBidEur = proxyRaw > amount ? proxyRaw : null;
    if (maxBidEur && maxBidEur <= amount) {
        status.textContent = t('auction_err_proxy_low', 'Maksimalna predponudba mora biti višja od vaše ponudbe.');
        status.className = 'auction-bid-status err';
        return;
    }
    const notify = {
        onOutbid: document.getElementById('acNotifyOutbid')?.checked || false,
        thresholdEur: Number(document.getElementById('acNotifyThreshold')?.value) || null,
    };
    openContractModal(amount, notify, maxBidEur);
}

function openContractModal(amount, notify, maxBidEur = null) {
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
            const result = await placeBid(
                _listing.id, amount, auth.currentUser,
                { type: contract.type, signatureData: contract.signatureData },
                notify,
                maxBidEur,
            );
            let msg = t('auction_bid_ok', '✓ Ponudba oddana!');
            if (result.antiSnipExtended) msg += ' ' + t('auction_antisnip_extended', '⏱ Dražba podaljšana za 5 minut.');
            if (result.proxyClaimed) msg = t('auction_proxy_claimed', '✓ Predponudba soponudnika je samodejno preseglaa vašo ponudbo.');
            status.textContent = msg;
            status.className = result.proxyClaimed ? 'auction-bid-status err' : 'auction-bid-status ok';
            close();
        } catch (err) {
            status.textContent = err.message;
            status.className = 'auction-bid-status err';
            close();
        }
    });
}
