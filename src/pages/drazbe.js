// Dražbe (Auctions Board) — MojAvto.si / MojaNavtika.si

import { getListings } from '../services/listingService.js';
import { getAuction } from '../services/auctionService.js';
import { PLATFORM } from '../config/platform.js';
import { endsAtMillis, startCountdown } from '../utils/countdown.js';
import { newsletterWidgetHtml, bindNewsletterWidget } from '../utils/auctionNewsletter.js';
import { renderCarCard, bindCardEvents, initDrazbeFilters } from './oglasi.js';

const PRIMARY_ITEM_TYPES = PLATFORM.id === 'navtika' ? ['plovilo', 'motor', 'vehicle'] : ['vehicle'];
const _timers = [];

function fmtEur(n) {
    return (Number(n) || 0).toLocaleString('sl-SI') + ' €';
}

// All fetched auction rows (listing + live auction state), sorted by end time.
let _auctionRows = [];

function renderAuctionCards(filtered) {
    const grid = document.getElementById('carListingsContainer');
    const countEl = document.getElementById('drazbeCount');
    if (!grid) return;

    // Stop previous countdowns
    _timers.forEach(stop => stop());
    _timers.length = 0;

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="drazbe-empty">
            <p>🔨 Trenutno ni aktivnih dražb za izbrane filtre.</p>
            <p class="drazbe-empty-sub">Prijavite se na obvestila spodaj in sporočili vam bomo, ko se odpre dražba.</p>
        </div>`;
        if (countEl) countEl.textContent = '';
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    // For each filtered listing find its auction state
    const rows = filtered.map(l => {
        const row = _auctionRows.find(r => r.listing.id === l.id);
        return row || { listing: l, auction: null };
    });

    grid.innerHTML = rows.map(r => {
        const currentPrice = r.auction
            ? (r.auction.currentBidEur ?? r.auction.startPriceEur)
            : (r.listing.startPriceEur ?? r.listing.priceEur);
        return renderCarCard({ ...r.listing, price: fmtEur(currentPrice), priceRaw: currentPrice }, r.auction);
    }).join('');

    if (countEl) countEl.textContent = `(${rows.length} dražb)`;

    bindCardEvents(grid, filtered);

    // Wire live countdowns
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

export async function initDrazbePage() {
    console.log('[Drazbe] init');
    const grid = document.getElementById('carListingsContainer');
    const nlWrap = document.getElementById('drazbeNewsletterWrap');
    if (!grid) return;

    _timers.forEach(stop => stop());
    _timers.length = 0;

    if (nlWrap) {
        nlWrap.innerHTML = newsletterWidgetHtml();
        bindNewsletterWidget(nlWrap);
    }

    let listings = [];
    try {
        listings = await getListings();
    } catch (err) {
        console.error('[Drazbe] failed to load listings', err);
    }

    const auctionListings = listings.filter(l =>
        l.entryType === 'auction'
        && (l.status === undefined || l.status === 'active')
        && (PRIMARY_ITEM_TYPES.includes(l.itemType) || (PLATFORM.id !== 'navtika' && !l.itemType))
    );

    if (auctionListings.length === 0) {
        grid.innerHTML = `<div class="drazbe-empty">
            <p>🔨 Trenutno ni aktivnih dražb.</p>
            <p class="drazbe-empty-sub">Prijavite se na obvestila spodaj in sporočili vam bomo, ko se odpre dražba.</p>
        </div>`;
        const countEl = document.getElementById('drazbeCount');
        if (countEl) countEl.textContent = '';
        if (window.lucide) window.lucide.createIcons();
        // Still init sidebar so it looks correct (empty state)
        initDrazbeFilters([], renderAuctionCards);
        return;
    }

    // Fetch live auction states
    const states = await Promise.all(auctionListings.map(l => getAuction(l.id).catch(() => null)));

    // Sort by soonest ending first, store globally for renderAuctionCards
    _auctionRows = auctionListings.map((l, i) => ({ listing: l, auction: states[i] }));
    _auctionRows.sort((a, b) => {
        const ea = endsAtMillis(a.auction?.endsAt || a.listing.endsAt) ?? Infinity;
        const eb = endsAtMillis(b.auction?.endsAt || b.listing.endsAt) ?? Infinity;
        return ea - eb;
    });

    const sortedListings = _auctionRows.map(r => r.listing);

    // Hand off to sidebar — it will call renderAuctionCards whenever filters change
    initDrazbeFilters(sortedListings, renderAuctionCards);

    // View toggle
    const container = document.getElementById('carListingsContainer');
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.view;
            document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
            if (container) {
                container.classList.toggle('list-layout', mode === 'list');
                container.classList.toggle('grid-layout', mode === 'grid');
            }
        });
    });

    // Sort select
    const sortSelect = document.getElementById('drazbeSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const val = sortSelect.value;
            const base = [...sortedListings];
            if (val === 'price-asc') base.sort((a, b) => (a.priceRaw ?? Infinity) - (b.priceRaw ?? Infinity));
            else if (val === 'price-desc') base.sort((a, b) => (b.priceRaw ?? 0) - (a.priceRaw ?? 0));
            else if (val === 'year-desc') base.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
            else if (val === 'km-asc') base.sort((a, b) => (a.mileageKm ?? Infinity) - (b.mileageKm ?? Infinity));
            renderAuctionCards(base);
        });
    }

    // Legend popup
    const legendBtn = document.getElementById('legendBtn');
    const legendOverlay = document.getElementById('legendOverlay');
    const legendCloseBtn = document.getElementById('legendCloseBtn');
    if (legendBtn && legendOverlay) {
        legendOverlay.style.display = 'none';
        legendBtn.addEventListener('click', () => {
            legendOverlay.style.display = 'flex';
            requestAnimationFrame(() => legendOverlay.classList.add('active'));
            if (window.lucide) window.lucide.createIcons({ context: legendOverlay });
        });
        const closeLegend = () => {
            legendOverlay.classList.remove('active');
            setTimeout(() => { legendOverlay.style.display = 'none'; }, 250);
        };
        legendCloseBtn?.addEventListener('click', closeLegend);
        legendOverlay.addEventListener('click', e => { if (e.target === legendOverlay) closeLegend(); });
    }
}
