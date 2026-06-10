// Dražbe (Auctions Board) — MojAvto.si / MojaNavtika.si
// Lists active auction listings (entryType === 'auction') with a live countdown
// and current-bid badge on each card. Filters carried via URL params from search.

import { getListings } from '../services/listingService.js';
import { getAuction } from '../services/auctionService.js';
import { PLATFORM } from '../config/platform.js';
import { endsAtMillis, startCountdown } from '../utils/countdown.js';
import { newsletterWidgetHtml, bindNewsletterWidget } from '../utils/auctionNewsletter.js';

const PRIMARY_ITEM_TYPES = PLATFORM.id === 'navtika' ? ['plovilo', 'motor', 'vehicle'] : ['vehicle'];
const _timers = [];

function parseParams() {
    const hash = window.location.hash.slice(1) || '/';
    const q = hash.indexOf('?');
    return q === -1 ? new URLSearchParams() : new URLSearchParams(hash.slice(q + 1));
}

function fmtEur(n) {
    return (Number(n) || 0).toLocaleString('sl-SI') + ' €';
}

function cardImage(listing) {
    const ext = listing.images?.exterior?.[0];
    return ext || listing.image || '/images/car-placeholder.png';
}

function matchesFilters(listing, params) {
    const make = params.get('make');
    if (make) {
        const wanted = make.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (wanted.length && !wanted.includes((listing.make || '').toLowerCase())) return false;
    }
    const model = params.get('model');
    if (model && (listing.model || '').toLowerCase() !== model.toLowerCase()) return false;
    const yearFrom = Number(params.get('yearFrom'));
    if (yearFrom && (Number(listing.year) || 0) < yearFrom) return false;
    const priceTo = Number(params.get('priceTo'));
    if (priceTo && (Number(listing.priceEur) || 0) > priceTo) return false;
    return true;
}

function renderCard(listing, auction) {
    const current = auction ? (auction.currentBidEur ?? auction.startPriceEur) : (listing.startPriceEur ?? listing.priceEur);
    const bidders = auction?.bidderCount || 0;
    const bids = auction?.bidCount || 0;
    const endMs = endsAtMillis(auction?.endsAt || listing.endsAt);
    const title = [listing.make, listing.model, listing.variant].filter(Boolean).join(' ')
        || listing.title || 'Vozilo';

    return `
    <a class="drazba-card" href="#/drazba?id=${listing.id}">
        <div class="drazba-card-img">
            <img src="${cardImage(listing)}" alt="${title}" loading="lazy">
            <span class="drazba-card-timer" data-ends="${endMs ?? ''}">—</span>
            ${bids > 0 ? `<span class="drazba-card-live">● V ŽIVO</span>` : ''}
        </div>
        <div class="drazba-card-body">
            <h3 class="drazba-card-title">${title}</h3>
            <div class="drazba-card-meta">
                ${listing.year ? `<span>${listing.year}</span>` : ''}
                ${listing.mileageKm ? `<span>${(Number(listing.mileageKm)||0).toLocaleString('sl-SI')} km</span>` : ''}
                ${listing.fuel ? `<span>${listing.fuel}</span>` : ''}
            </div>
            <div class="drazba-card-bid">
                <div>
                    <span class="drazba-bid-label">Trenutna ponudba</span>
                    <span class="drazba-bid-value">${fmtEur(current)}</span>
                </div>
                <div class="drazba-bid-stats">
                    <span title="Število ponudb">🔨 ${bids}</span>
                    <span title="Število ponudnikov">👤 ${bidders}</span>
                </div>
            </div>
        </div>
    </a>`;
}

export async function initDrazbePage() {
    console.log('[Drazbe] init');
    const grid = document.getElementById('drazbeGrid');
    const countEl = document.getElementById('drazbeCount');
    const nlWrap = document.getElementById('drazbeNewsletterWrap');
    if (!grid) return;

    // Clean up any timers from a previous mount.
    _timers.forEach(stop => stop());
    _timers.length = 0;

    if (nlWrap) {
        nlWrap.innerHTML = newsletterWidgetHtml();
        bindNewsletterWidget(nlWrap);
    }

    const params = parseParams();

    let listings = [];
    try {
        listings = await getListings();
    } catch (err) {
        console.error('[Drazbe] failed to load listings', err);
    }

    const auctions = listings.filter(l =>
        l.entryType === 'auction'
        && (l.status === undefined || l.status === 'active')
        && (PRIMARY_ITEM_TYPES.includes(l.itemType) || (PLATFORM.id !== 'navtika' && !l.itemType))
        && matchesFilters(l, params)
    );

    if (auctions.length === 0) {
        grid.innerHTML = `<div class="drazbe-empty">
            <p>🔨 Trenutno ni aktivnih dražb${params.toString() ? ' za izbrane filtre' : ''}.</p>
            <p class="drazbe-empty-sub">Prijavite se na obvestila spodaj in sporočili vam bomo, ko se odpre dražba.</p>
        </div>`;
        if (countEl) countEl.textContent = '';
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // Fetch live auction state per listing (current bid, bidder count, endsAt).
    const states = await Promise.all(auctions.map(l => getAuction(l.id).catch(() => null)));

    // Sort by soonest ending first.
    const rows = auctions.map((l, i) => ({ listing: l, auction: states[i] }));
    rows.sort((a, b) => {
        const ea = endsAtMillis(a.auction?.endsAt || a.listing.endsAt) ?? Infinity;
        const eb = endsAtMillis(b.auction?.endsAt || b.listing.endsAt) ?? Infinity;
        return ea - eb;
    });

    grid.innerHTML = rows.map(r => renderCard(r.listing, r.auction)).join('');
    if (countEl) countEl.textContent = `${rows.length} aktivnih dražb`;

    // Wire live countdowns.
    grid.querySelectorAll('.drazba-card-timer').forEach(el => {
        const ends = Number(el.dataset.ends);
        if (Number.isFinite(ends) && ends > 0) {
            _timers.push(startCountdown(el, ends));
        } else {
            el.textContent = '—';
        }
    });

    if (window.lucide) window.lucide.createIcons();
}
