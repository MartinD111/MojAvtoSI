// ═══════════════════════════════════════════════════════════════════════════════
// Listing Detail Page — MojAvto.si
// ═══════════════════════════════════════════════════════════════════════════════

import { escHtml } from '../utils/escHtml.js';
import { getListingById, recordListingView, getListingViewStats, formatPrice, getListings } from '../services/listingService.js';
import { kmToMiles, kwToHp, l100kmToMpg, formatDisplacement, showCompareLimitToast } from '../utils/listingUtils.js';
import { getVehicleRating } from '../utils/valuationScore.js';
import { renderRatingBlockDetail } from '../utils/priceRatingUi.js';
import { getEquipmentLabel, EQUIPMENT_GROUPS } from '../data/equipment.js';
import { currentUser } from '../lib/currentUser.js';
import { supabase } from '../lib/supabase.js';
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite } from '../services/garageService.js';
import { key as lsKey } from '../config/storageKeys.js';
import React from 'react';
import { mountReactComponent } from '../core/reactRootTracker.js';
import CostPanel from '../components/CostPanel.jsx';
import { getServiceHistoryByVin } from '../services/serviceBookService.js';
import { t, getCurrentLang } from '../core/i18n.js';
import { renderError } from '../utils/uiState.js';
import { mapError } from '../utils/errorMap.js';
import { getBrandLogo } from '../data/brandLogos.js';
import { getBrandRgb } from '../data/brandColors.js';

export async function initListingPage() {
    console.log('[ListingPage] init');

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const page = document.getElementById('listingPage');

    if (!id) {
        if (page) renderError(page, { mapped: mapError({ status: 404 }) });
        return;
    }

    try {
        const [listing, allListings] = await Promise.all([
            getListingById(id),
            getListings().catch(() => []),
        ]);
        if (!listing) { if (page) renderError(page, { mapped: mapError({ status: 404 }) }); return; }
        recordListingView(id);      // log this view (local timeline + Firestore daily) before rendering stats
        renderListing(listing, allListings);
        injectRating(listing, allListings);
        injectServiceHistory(listing);
    } catch (err) {
        console.error('[ListingPage]', err);
        if (page) renderError(page, { mapped: mapError(err), onRetry: initListingPage });
    }
}

// ── Service history injection ─────────────────────────────────────────────────
async function injectServiceHistory(listing) {
    const vin = listing.vin || listing.vinDetails?.vin;
    if (!vin) return;

    const records = await getServiceHistoryByVin(vin);
    if (!records.length) return;

    // Trust badge
    const badgeSlot = document.getElementById('lpServiceBadge');
    if (badgeSlot) {
        badgeSlot.innerHTML = `
            <div class="trust-badge">
                <i data-lucide="shield-check"></i>
                ${t('verified_service_history')}
            </div>`;
        if (window.lucide) window.lucide.createIcons();
    }

    // Timeline
    const container = document.getElementById('service-history-container');
    if (!container) return;

    const typeLabels = {
        mali_servis: t('minor_service'),
        veliki_servis: t('major_service'),
        popravilo: t('repair'),
        pnevmatike: t('tires'),
        drugo: t('other'),
    };

    const items = records.map(r => {
        const dateStr = r.date ? new Date(r.date).toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
        const km = r.mileage ? new Intl.NumberFormat('sl-SI').format(r.mileage) + ' km' : null;
        const typeLabel = typeLabels[r.serviceType] || r.serviceType || t('other');
        return `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-type">${escHtml(typeLabel)}</span>
                        <span class="timeline-date">${escHtml(dateStr)}</span>
                    </div>
                    ${km ? `<div class="timeline-km">${escHtml(km)}</div>` : ''}
                    <div class="timeline-mechanic">${escHtml(r.mechanicName || '')}</div>
                    ${r.description ? `<div class="timeline-desc">${escHtml(r.description)}</div>` : ''}
                </div>
            </div>`;
    }).join('');

    container.innerHTML = `
        <section class="lp-section">
            <h2 class="lp-section-title">${t('service_history')}</h2>
            <div class="service-timeline">${items}</div>
        </section>`;
    container.style.display = 'block';
}

// ── Rating injection ──────────────────────────────────────────────────────────
function injectRating(listing, allListings) {
    const slot = document.getElementById('lpRatingBlock');
    if (!slot) return;

    const rating = getVehicleRating(listing, allListings);

    // Low confidence or no rating — fall back to a neutral 3-star "fair price"
    // so we always show the star system (never an English pill).
    if (!rating || rating.confidence === 'low') {
        slot.innerHTML = renderRatingBlockDetail(
            { stars: 3, label: 'Poštena cena' },
            { rareFeaturesLabel: t('rare_features') }
        );
        return;
    }

    const confidenceLabel = rating.confidence === 'high'
        ? t('high_confidence') + ` (${rating.comparablesCount} ${t('listings').toLowerCase()})`
        : t('medium_confidence') + ` (${rating.comparablesCount} ${t('listings').toLowerCase()})`;

    // rating.label is already Slovenian (from valuationScore.js).
    slot.innerHTML = renderRatingBlockDetail(rating, {
        confidenceLabel,
        rareFeaturesLabel: t('rare_features'),
    });
}

// ── View statistics card ──────────────────────────────────────────────────────
function renderViewStatsHtml(l) {
    const stats = getListingViewStats(l);
    const fmt = n => new Intl.NumberFormat('sl-SI').format(n);

    const cell = (num, label) => `
        <div class="lp-view-stat">
            <span class="lp-view-num">${fmt(num)}</span>
            <span class="lp-view-label">${escHtml(label)}</span>
        </div>`;

    return `
        <div class="lp-sidebar-card lp-views-card">
            <div class="lp-views-title">
                <i data-lucide="eye"></i>
                <span>${t('views_stats_title', 'Ogledi oglasa')}</span>
            </div>
            <div class="lp-views-grid">
                ${cell(stats.today, t('views_today', 'Danes'))}
                ${cell(stats.week, t('views_week', 'Ta teden'))}
                ${cell(stats.total, t('views_total', 'Skupaj'))}
            </div>
        </div>`;
}

// ── Animation helper — re-triggers on every click ────────────────────────────
function popBtn(btn) {
    btn.classList.remove('lp-btn-pop');
    void btn.offsetWidth; // force reflow so animation restarts
    btn.classList.add('lp-btn-pop');
    // Button + icon run two animations of differing length — use a timer so the
    // class isn't stripped early (animationend fires per-animation).
    clearTimeout(btn._popTimer);
    btn._popTimer = setTimeout(() => btn.classList.remove('lp-btn-pop'), 480);
}

// ── Favourite button ──────────────────────────────────────────────────────────
// localStorage is the UI source-of-truth so the heart colour never snaps back
// due to Firebase latency / permission errors. Firebase is synced in the background.
const FAV_STORE_KEY = lsKey('liked');

function getLikedSet() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_STORE_KEY) || '[]')); }
    catch { return new Set(); }
}
function setLikedSet(s) {
    try { localStorage.setItem(FAV_STORE_KEY, JSON.stringify([...s])); } catch { /* ignore */ }
}

async function initFavBtn(l) {
    const btn = document.getElementById('lpFavBtn');
    if (!btn) return;

    // Immediately reflect local liked state — no async wait needed.
    if (getLikedSet().has(l.id)) btn.classList.add('active');

    // Async: sync with Firebase liked state once auth resolves.
    const syncWithFirebase = async (user) => {
        if (!user) return;
        try {
            const liked = await isFavourite(user.id, l.id);
            const localSet = getLikedSet();
            if (liked) { localSet.add(l.id); btn.classList.add('active'); }
            else { localSet.delete(l.id); btn.classList.remove('active'); }
            setLikedSet(localSet);
        } catch { /* non-critical */ }
    };

    syncWithFirebase(currentUser());

    btn.addEventListener('click', async () => {
        let user = currentUser();

        // Auth gate for logged-out users — revert only on cancel, not on Firebase errors.
        if (!user) {
            try {
                user = await showAuthGate({
                    icon: '❤️',
                    title: t('save_to_favorites_title'),
                    message: t('save_to_favorites_msg'),
                });
            } catch {
                return; // user cancelled auth gate — don't touch the button
            }
        }

        // Optimistic update: toggle immediately and persist locally right away.
        const wasActive = btn.classList.contains('active');
        const newActive = !wasActive;
        if (newActive) btn.classList.add('active'); else btn.classList.remove('active');
        const localSet = getLikedSet();
        if (newActive) localSet.add(l.id); else localSet.delete(l.id);
        setLikedSet(localSet);
        popBtn(btn);

        // Background Firebase sync — never revert the visual state on failure.
        btn.disabled = true;
        try {
            if (wasActive) {
                await removeFromFavourites(user.id, l.id);
            } else {
                await addToFavourites(user.id, { id: l.id, title: l.make + ' ' + l.model, price: l.priceEur || l.price, images: l.images });
            }
        } catch (err) {
            console.warn('[lpFavBtn] Firebase sync failed (local state kept):', err);
        } finally {
            btn.disabled = false;
        }
    });
}

// ── Compare button ────────────────────────────────────────────────────────────
function initCompareBtn(l) {
    const btn = document.getElementById('lpCompareBtn');
    if (!btn) return;

    // Reflect state immediately from localStorage — no auth wait needed.
    const getList = () => { try { return JSON.parse(localStorage.getItem(lsKey('compare')) || '[]'); } catch { return []; } };
    if (getList().some(c => c.id === l.id)) btn.classList.add('active');

    btn.addEventListener('click', async () => {
        const list = getList();
        const idx = list.findIndex(c => c.id === l.id);

        if (idx !== -1) {
            // Already in compare — remove without requiring auth.
            list.splice(idx, 1);
            btn.classList.remove('active');
            popBtn(btn);
            localStorage.setItem(lsKey('compare'), JSON.stringify(list));
            if (window.updateHeaderCompare) window.updateHeaderCompare();
            return;
        }

        // Adding — require auth (same gate as the board).
        let user = currentUser();
        if (!user) {
            try {
                user = await showAuthGate({
                    icon: '⚖️',
                    title: t('compare_vehicles_title'),
                    message: t('compare_vehicles_msg'),
                });
            } catch { return; }
        }

        if (list.length >= 3) {
            showCompareLimitToast();
            return;
        }

        list.push({ id: l.id, title: l.make + ' ' + l.model, image: l.images?.exterior?.[0] || '', price: l.priceEur || l.price });
        btn.classList.add('active');
        popBtn(btn);
        localStorage.setItem(lsKey('compare'), JSON.stringify(list));
        if (window.updateHeaderCompare) window.updateHeaderCompare();
    });
}

// ── Title card (Make, Model, Subtitle + full quality logo + brand gradient) ───
function renderTitleCardHtml(l) {
    let brandLogo = getBrandLogo(l.make);
    const makeStr = (l.make || '').toLowerCase();
    if (!brandLogo && (makeStr.includes('porsche') || (l.title || '').toLowerCase().includes('porsche'))) {
        brandLogo = '/images/brand-logos/porsche.png';
    }
    if (!brandLogo && (makeStr.includes('tesla') || (l.title || '').toLowerCase().includes('tesla'))) {
        brandLogo = '/images/brand-logos/tesla.png';
    }
    const brandRgb = getBrandRgb(l.make || '');

    const make = escHtml(l.make || '');
    const model = escHtml(l.model || '');
    const fullName = `${l.make || ''} ${l.model || ''}`.trim();
    // If combined brand + model exceeds 12 chars or either make/model is long, stack model under brand to prevent logo overlap
    const isLong = fullName.length > 12 || (l.make && l.make.length > 9) || (l.model && l.model.length > 9);

    return `
        <div class="lp-sidebar-card lp-title-card" style="--brand-rgb: ${brandRgb};">
            <div class="lp-title-card-content">
                <h1 class="lp-title ${isLong ? 'lp-title--stacked' : ''}">
                    <span class="lp-title-make">${make}</span>
                    ${model ? `<span class="lp-title-model">${model}</span>` : ''}
                </h1>
                ${l.variant ? `<div class="lp-subtitle">${escHtml(l.variant)}</div>` : ''}
                ${(l.createdAt || l.viewCount) ? `
                <div class="lp-title-meta">
                    ${l.createdAt ? `<span>📅 ${formatDate(l.createdAt)}</span>` : ''}
                    ${l.viewCount ? `<span>👁 ${t('views_count', { count: l.viewCount })}</span>` : ''}
                </div>` : ''}
            </div>
            ${brandLogo ? `
            <div class="lp-title-card-logo">
                <img src="${escHtml(brandLogo)}" alt="${make}" />
            </div>` : ''}
        </div>`;
}

// ── Main render ───────────────────────────────────────────────────────────────
// Exported so the auction detail page (auction-listing.js) can render an
// identical listing layout and then inject auction-specific UI on top.
export { renderListing, injectRating, injectServiceHistory };

function renderListing(l, preloadedAll = []) {
    const page = document.getElementById('listingPage');
    if (!page) return;

    const exteriorImages = l.images?.exterior || [];
    const interiorImages = l.images?.interior || [];
    const isSponsored = l.promotion?.tier === 'sponsored';

    page.innerHTML = `
        <div class="lp-container">

            <!-- Breadcrumb -->
            <nav class="lp-breadcrumb">
                <a href="#/">${t('nav_home')}</a>
                <span class="lp-bc-sep">›</span>
                <a href="#/iskanje?cat=${encodeURIComponent(l.category || '')}">
                    ${escHtml(catLabel(l.category))}
                </a>
                ${l.make ? `<span class="lp-bc-sep">›</span><span class="lp-bc-current">${escHtml(l.make)} ${escHtml(l.model || '')} ${escHtml(l.variant || '')}</span>` : ''}
            </nav>

            <!-- Sponsored tag (subtle) -->
            ${isSponsored ? `<div class="lp-sponsored-tag">${t('sponsored_listing')}</div>` : ''}

            <!-- Two-column layout -->
            <div class="lp-layout">

                <!-- LEFT: main content -->
                <div class="lp-main">

                    <!-- Image gallery -->
                    ${renderGalleryHtml(exteriorImages, interiorImages, l.condition)}

                    <!-- Service history (populated async by injectServiceHistory) -->
                    <div id="service-history-container" style="display:none;"></div>

                    <!-- Description -->
                    ${l.description ? `
                    <section class="lp-section">
                        <h2 class="lp-section-title">${t('vehicle_description')}</h2>
                        <div class="lp-description">${escHtml(l.description).replace(/\n/g, '<br>')}</div>
                    </section>` : ''}

                    <!-- Technical specs + equipment (combined) -->
                    ${renderSpecsHtml(l)}

                    <!-- Seller note (private sellers) -->
                    ${l.sellerNote ? `
                    <section class="lp-section lp-seller-note-section">
                        <div class="lp-seller-note-block">
                            <div class="lp-seller-note-icon">
                                <i data-lucide="message-square"></i>
                            </div>
                            <div class="lp-seller-note-content">
                                <span class="lp-seller-note-label">${t('seller_note', 'Opomba prodajalca')}</span>
                                <p class="lp-seller-note-text">${escHtml(l.sellerNote)}</p>
                            </div>
                        </div>
                    </section>` : ''}

                    <!-- Seller info pill & dealership dropdown -->
                    <section class="lp-section lp-seller-section">
                        ${renderSellerCardHtml(l)}
                    </section>

                    <!-- Similar -->
                    <section class="lp-similar">
                        <h2 class="lp-section-title">${t('similar_listings')}</h2>
                        <div id="similarGrid" class="lp-similar-grid">
                            <p style="color:#94a3b8;font-size:0.85rem;">${t('loading_similar_listings')}</p>
                        </div>
                    </section>

                </div>

                <!-- RIGHT: sidebar (Sticky) -->
                <aside class="lp-sidebar">

                    <!-- Title card (brand, model, variant + faded logo watermark) -->
                    ${renderTitleCardHtml(l)}

                    <!-- Price block -->
                    <div class="lp-header-price lp-sidebar-card">
                        <div class="lp-price-pill-container">
                            ${l.salePriceEur ? `
                            <div class="lp-price-discount-wrapper">
                                <div class="lp-sale-price">${formatPrice(l.salePriceEur, false)}</div>
                                <div class="lp-original-price-row">
                                    <span class="lp-original-price">${formatPrice(l.priceEur || l.priceRaw || l.price || 0, false)}</span>
                                    <span class="lp-discount-pct">
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                        -${Math.round((1 - l.salePriceEur / (l.priceEur || l.priceRaw || l.price)) * 100)}%
                                    </span>
                                </div>
                            </div>` : `
                            <div class="lp-price">${formatPrice(l.priceRaw || l.priceEur || l.price || 0, l.callForPrice)}</div>`}
                        </div>
                        <div id="lpRatingBlock"></div>
                        <div id="lpServiceBadge"></div>
                        ${l.priceNegotiable ? `<div class="lp-price-sub">${t('price_is_negotiable')}</div>` : ''}
                        ${l.leaseAvailable && !l.leasingConditions ? `<div class="lp-price-sub">${t('financing_available')}</div>` : ''}
                        ${l.leasingConditions ? `
                        <button class="lp-leasing-btn" id="btnShowLeasing">
                            <i data-lucide="credit-card"></i> ${t('check_financing_options')}
                        </button>` : ''}
                    </div>

                    <!-- Price Card wrapper (keeps compatibility with auction pages) -->
                    <div class="lp-price-card" style="display: none;"></div>

                    <!-- Save + Compare actions (no background card) -->
                    <div class="lp-action-row lp-sidebar-actions" style="margin-top: 0; margin-bottom: 0;">
                        <button class="lp-action-btn lp-fav-btn" id="lpFavBtn" data-listing-id="${l.id}" title="${t('save_to_favorites_title')}">
                            <i data-lucide="heart"></i>
                            <span>${t('save_btn')}</span>
                        </button>
                        <button class="lp-action-btn lp-compare-btn" id="lpCompareBtn" data-listing-id="${l.id}" title="${t('compare_vehicles_title')}">
                            <i data-lucide="scale"></i>
                            <span>${t('compare_btn')}</span>
                        </button>
                    </div>

                    <!-- View statistics -->
                    ${renderViewStatsHtml(l)}

                    <!-- Cost Panel -->
                    <div id="react-cost-panel-root"></div>

                </aside>
            </div>

        </div>
    `;


    // Cost Panel (React)
    const costPanelRoot = document.getElementById('react-cost-panel-root');
    const cpPrice = l.priceRaw || l.priceEur || l.price;
    const cpKw = l.powerKw || l.power;
    if (costPanelRoot && cpPrice && cpKw) {
        mountReactComponent('react-cost-panel-root',
            React.createElement(CostPanel, {
                price: Number(cpPrice),
                powerKw: Number(cpKw),
                fuelType: l.fuel || '',
                mpg: l.fuelL100km ? (235.215 / l.fuelL100km) : null,
                kWhPer100km: l.electricConsumption || null,
                isNew: l.isNew !== false,
                make: l.make || '',
                category: l.category || 'sedan',
                vin: l.vin || '',
            })
        );
    }

    // Leasing popup
    if (l.leasingConditions) {
        const modal = document.createElement('div');
        modal.id = 'leasingModal';
        modal.className = 'lp-modal-overlay';
        modal.innerHTML = `
            <div class="lp-modal">
                <div class="lp-modal-header">
                    <h3 class="lp-modal-title">${t('financing_modal_title')}</h3>
                    <button class="lp-modal-close" id="btnCloseLeasingModal" aria-label="Close">✕</button>
                </div>
                <div class="lp-modal-body">${escHtml(l.leasingConditions).replace(/\n/g, '<br>')}</div>
            </div>`;
        document.body.appendChild(modal);

        document.getElementById('btnShowLeasing')?.addEventListener('click', () => {
            modal.classList.add('active');
        });
        document.getElementById('btnCloseLeasingModal')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // Init gallery interactivity
    initGallery(exteriorImages, interiorImages);

    // Favourite button
    initFavBtn(l);

    // Compare button
    initCompareBtn(l);

    // Report listing
    document.getElementById('lpReportBtn')?.addEventListener('click', () => showReportModal(l.id));

    // Phone reveal
    document.getElementById('btnShowPhone')?.addEventListener('click', () => {
        const btn = document.getElementById('btnShowPhone');
        const reveal = document.getElementById('phoneReveal');
        if (reveal && btn) {
            reveal.style.display = 'flex';
            btn.style.display = 'none';
        }
    });

    // Owner edit bar — shown async once auth resolves
    const injectOwnerBar = (user) => {
        if (!user || user.id !== l.authorId) return;
        if (document.getElementById('lpOwnerBar')) return;
        const bar = document.createElement('div');
        bar.id = 'lpOwnerBar';
        bar.className = 'lp-owner-bar';
        bar.innerHTML = `
            <span class="lp-owner-bar-label"><i data-lucide="pencil-ruler"></i> ${t('owner_bar_label', 'Vaš oglas')}</span>
            <a class="lp-owner-bar-btn" href="#/novi-oglas?edit=${encodeURIComponent(l.id)}">
                <i data-lucide="pencil"></i> ${t('owner_bar_edit', 'Uredi oglas')}
            </a>`;
        const container = document.getElementById('listingPage');
        container?.insertAdjacentElement('afterbegin', bar);
        if (window.lucide) window.lucide.createIcons({ nodes: [bar] });
    };
    injectOwnerBar(currentUser());

    // Init icons
    // Relocate layout elements on stacked/mobile widths:
    const syncResponsiveLayout = () => {
        const isMobile = window.innerWidth <= 900;
        const titleCard = page.querySelector('.lp-title-card');
        const priceBlock = page.querySelector('.lp-header-price');
        const actionRow = page.querySelector('.lp-action-row.lp-sidebar-actions');
        const sidebar = page.querySelector('.lp-sidebar');
        const gallery = page.querySelector('.lp-gallery, .lp-gallery-empty');

        if (isMobile) {
            if (gallery) {
                let target = gallery;
                if (titleCard) {
                    target.insertAdjacentElement('afterend', titleCard);
                    target = titleCard;
                }
                if (priceBlock) {
                    target.insertAdjacentElement('afterend', priceBlock);
                    target = priceBlock;
                }
                if (actionRow) {
                    target.insertAdjacentElement('afterend', actionRow);
                }
            }
        } else {
            if (sidebar) {
                const firstStatic = sidebar.querySelector('.lp-views-card') || sidebar.querySelector('#react-cost-panel-root');
                if (titleCard && titleCard.parentNode !== sidebar) {
                    sidebar.insertBefore(titleCard, firstStatic || sidebar.firstChild);
                }
                if (priceBlock && priceBlock.parentNode !== sidebar) {
                    if (titleCard && titleCard.parentNode === sidebar) {
                        titleCard.insertAdjacentElement('afterend', priceBlock);
                    } else {
                        sidebar.insertBefore(priceBlock, firstStatic || sidebar.firstChild);
                    }
                }
                if (actionRow && actionRow.parentNode !== sidebar) {
                    if (priceBlock && priceBlock.parentNode === sidebar) {
                        priceBlock.insertAdjacentElement('afterend', actionRow);
                    } else {
                        sidebar.insertBefore(actionRow, firstStatic || sidebar.firstChild);
                    }
                }
            }
        }
    };
    syncResponsiveLayout();
    window.addEventListener('resize', syncResponsiveLayout);

    if (window.lucide) window.lucide.createIcons();

    // Load similar
    loadSimilar(l, preloadedAll);

    // Set sidebar sticky top dynamically
    const sidebarElement = page.querySelector('.lp-sidebar');
    if (sidebarElement) {
        const updateSidebarStickyTop = () => {
            // Keep the sidebar sticky at 85px below the navigation bar so the model card remains visible at all times on scroll
            sidebarElement.style.top = '85px';
        };
        setTimeout(updateSidebarStickyTop, 300); // Wait for React cost panel and similar grid to render
        window.addEventListener('resize', updateSidebarStickyTop);
        const cleanUp = () => {
            window.removeEventListener('resize', updateSidebarStickyTop);
            window.removeEventListener('resize', syncResponsiveLayout);
            document.removeEventListener('routeChanged', cleanUp);
        };
        document.addEventListener('routeChanged', cleanUp);
    }

    // Accordion Logic (Local implementation for listing page)
    const accTriggers = page.querySelectorAll('.adv-acc-trigger');
    accTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const accordion = trigger.closest('.adv-accordion');
            const body = accordion.querySelector('.adv-acc-body');
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';

            // Toggle
            const newState = !isOpen;
            trigger.setAttribute('aria-expanded', String(newState));
            if (body) {
                body.style.display = newState ? 'flex' : 'none';
            }
        });
    });
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function renderGalleryHtml(exteriorImages, interiorImages, condition) {
    if (exteriorImages.length === 0 && interiorImages.length === 0) {
        return `<div class="lp-gallery-empty">📷 ${t('no_photos')}</div>`;
    }

    const images = exteriorImages.length > 0 ? exteriorImages : interiorImages;
    const isExtActive = exteriorImages.length > 0;

    const thumbs = images.slice(0, 6).map((url, i) => `
        <div class="lp-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${escHtml(url)}" alt="Photo ${i + 1}" loading="lazy" />
            ${i === 5 && images.length > 6 ? `<div class="lp-thumb-more">+${images.length - 6}</div>` : ''}
        </div>`).join('');

    return `
        <section class="lp-gallery">
            <div class="lp-gallery-main">
                <img id="galleryMainImg" src="${escHtml(images[0])}" alt="${t('main_photo')}" />
                ${condition ? `<span class="condition-overlay-badge" data-condition="${escHtml(condition)}">${escHtml(condition)}</span>` : ''}
                ${images.length > 1 ? `
                <button class="lp-gallery-nav lp-gallery-prev" id="gallPrev">&#10094;</button>
                <button class="lp-gallery-nav lp-gallery-next" id="gallNext">&#10095;</button>
                <span class="lp-gallery-counter" id="gallCounter">1 / ${images.length}</span>` : ''}
            </div>
            ${images.length > 1 ? `<div class="lp-thumbs" id="gallThumbs">${thumbs}</div>` : '<div id="gallThumbs"></div>'}
            <div class="lp-gallery-footer">
                <div class="lp-view-toggle">
                    <button class="lp-view-btn ${isExtActive ? 'active' : ''} ${exteriorImages.length === 0 ? 'disabled' : ''}" data-view="exterior" ${exteriorImages.length === 0 ? 'disabled' : ''}>${t('exterior')}</button>
                    <button class="lp-view-btn ${!isExtActive ? 'active' : ''} ${interiorImages.length === 0 ? 'disabled' : ''}" data-view="interior" ${interiorImages.length === 0 ? 'disabled' : ''}>${t('interior')}</button>
                </div>
            </div>
        </section>`;
}

function initGallery(exteriorImages, interiorImages) {
    if (exteriorImages.length === 0 && interiorImages.length === 0) return;

    let currentImages = exteriorImages.length > 0 ? exteriorImages : interiorImages;
    let current = 0;

    const mainImg = document.getElementById('galleryMainImg');
    const counter = document.getElementById('gallCounter');

    function setImg(idx) {
        current = (idx + currentImages.length) % currentImages.length;
        if (mainImg) mainImg.src = currentImages[current];
        if (counter) counter.textContent = `${current + 1} / ${currentImages.length}`;
        document.querySelectorAll('.lp-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === current);
        });
    }

    function switchView(images) {
        currentImages = images;
        current = 0;
        if (mainImg) mainImg.src = currentImages[0];
        if (counter) counter.textContent = `1 / ${currentImages.length}`;

        const thumbsContainer = document.getElementById('gallThumbs');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = currentImages.slice(0, 6).map((url, i) => `
                <div class="lp-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
                    <img src="${escHtml(url)}" alt="Photo ${i + 1}" loading="lazy" />
                    ${i === 5 && currentImages.length > 6 ? `<div class="lp-thumb-more">+${currentImages.length - 6}</div>` : ''}
                </div>`).join('');
            thumbsContainer.querySelectorAll('.lp-thumb').forEach(thumb => {
                thumb.addEventListener('click', () => setImg(Number(thumb.dataset.idx)));
            });
        }

        const prevBtn = document.getElementById('gallPrev');
        const nextBtn = document.getElementById('gallNext');
        if (prevBtn) prevBtn.style.display = currentImages.length > 1 ? '' : 'none';
        if (nextBtn) nextBtn.style.display = currentImages.length > 1 ? '' : 'none';
        if (counter) counter.style.display = currentImages.length > 1 ? '' : 'none';
    }

    document.getElementById('gallPrev')?.addEventListener('click', () => setImg(current - 1));
    document.getElementById('gallNext')?.addEventListener('click', () => setImg(current + 1));

    document.querySelectorAll('.lp-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => setImg(Number(thumb.dataset.idx)));
    });

    // Touch swipe support for mobile
    const galleryMain = document.querySelector('.lp-gallery-main');
    if (galleryMain) {
        let touchStartX = 0;
        galleryMain.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        galleryMain.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) setImg(dx < 0 ? current + 1 : current - 1);
        }, { passive: true });
    }

    document.querySelectorAll('.lp-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lp-view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switchView(btn.dataset.view === 'interior' ? interiorImages : exteriorImages);
        });
    });
}

// ── Key info strip ────────────────────────────────────────────────────────────
function renderKeyStripHtml(l) {
    const km = l.mileageKm || l.mileage;
    const kw = l.powerKw || l.power;
    const fuelStr = (l.fuel || '').toLowerCase().trim();
    const isElectric = fuelStr === 'elektrika' || fuelStr === 'električno' || fuelStr === 'electric' || fuelStr === 'e';
    const isMoto = l.category === 'moto' || l.category === 'motor';

    const items = [
        km ? { icon: 'gauge', label: fmtKm(km) } : null,
        l.year ? { icon: 'calendar', label: l.year } : null,
        isElectric ? { icon: 'zap', label: 'E' } : null,
        (l.transmission && !isElectric) ? { icon: 'settings-2', label: escHtml(l.transmission) } : null,
        (isMoto && l.engineStroke) ? { icon: 'activity', label: escHtml(l.engineStroke) } : null,
        (isMoto && l.engineType) ? { icon: 'cpu', label: escHtml(l.engineType) } : null,
        kw ? { icon: 'zap', label: t('hp_val', { val: Math.round(kw * 1.34102) }) } : null,
        l.driveType ? { icon: 'navigation', label: escHtml(l.driveType) } : null,
        l.color ? { icon: 'palette', label: escHtml(l.color) } : null,
        l.doorsCount ? { icon: 'door-open', label: t('doors_count', { count: l.doorsCount }) } : null,
    ].filter(Boolean);

    if (items.length === 0) return '';

    return `
        <div class="lp-key-strip">
            ${items.map(it => `
                <div class="lp-key-item">
                    <i data-lucide="${it.icon}"></i>
                    <span>${it.label}</span>
                </div>`).join('')}
        </div>`;
}

// ── Helper: Derive engine layout ─────────────────────────────────────────────
function getEngineLayout(l, isElectric) {
    if (l.engineLayout) return l.engineLayout;
    if (l.cylinderLayout) return l.cylinderLayout;
    if (l.engineConfig) return l.engineConfig;

    const title = `${l.title || ''} ${l.subtitle || ''} ${l.variant || ''}`.toLowerCase();
    const make = (l.make || '').toLowerCase();
    const model = (l.model || '').toLowerCase();

    if (isElectric) {
        if (title.includes('tri-motor') || title.includes('tri motor')) return '3x Elektromotor';
        if (title.includes('dual') || title.includes('4x4') || title.includes('awd') || (l.driveType && l.driveType.includes('4'))) return '2x Elektromotor';
        return 'Elektromotor';
    }

    // Explicit text matching
    if (/\bv12\b/i.test(title)) return 'V12';
    if (/\bv10\b/i.test(title)) return 'V10';
    if (/\bv8\b/i.test(title)) return 'V8';
    if (/\bv6\b/i.test(title)) return 'V6';
    if (/\bboxer[- ]?6\b|\bb6\b/i.test(title)) return 'Boxer-6';
    if (/\bboxer[- ]?4\b|\bb4\b/i.test(title)) return 'Boxer-4';
    if (/\b(?:inline|vrstni)[- ]?6\b|\br6\b/i.test(title)) return 'Vrstni 6 (Inline-6)';
    if (/\b(?:inline|vrstni)[- ]?5\b|\br5\b/i.test(title)) return 'Vrstni 5 (Inline-5)';
    if (/\b(?:inline|vrstni)[- ]?4\b|\br4\b/i.test(title)) return 'Vrstni 4 (Inline-4)';
    if (/\b(?:inline|vrstni)[- ]?3\b|\br3\b/i.test(title)) return 'Vrstni 3 (Inline-3)';

    // Make/model conventions
    if (make === 'porsche') {
        if (model.includes('911')) return 'Boxer-6';
        if (model.includes('718') || model.includes('cayman') || model.includes('boxster')) return 'Boxer-4';
        if (model.includes('cayenne') || model.includes('panamera')) {
            return (l.powerKw && l.powerKw > 340) ? 'V8' : 'V6';
        }
    }
    if (make === 'subaru') {
        return (l.engineCc && l.engineCc > 2500) ? 'Boxer-6' : 'Boxer-4';
    }

    // Cylinders count
    const cyl = parseInt(l.cylinders, 10);
    if (cyl === 12) return 'V12';
    if (cyl === 10) return 'V10';
    if (cyl === 8) return 'V8';
    if (cyl === 6) {
        if (make === 'bmw') return 'Vrstni 6 (Inline-6)';
        return 'V6';
    }
    if (cyl === 5) return 'Vrstni 5 (Inline-5)';
    if (cyl === 4) return 'Vrstni 4 (Inline-4)';
    if (cyl === 3) return 'Vrstni 3 (Inline-3)';

    // Fallback by engine displacement
    const cc = l.engineCc || 0;
    if (cc >= 4000) return 'V8';
    if (cc >= 2800) {
        if (make === 'bmw') return 'Vrstni 6 (Inline-6)';
        if (make === 'porsche') return 'Boxer-6';
        return 'V6';
    }
    if (cc >= 1300) return 'Vrstni 4 (Inline-4)';
    if (cc > 0 && cc < 1300) return 'Vrstni 3 (Inline-3)';

    return 'Vrstni 4 (Inline-4)';
}

// ── Technical specs ───────────────────────────────────────────────────────────
function renderSpecsHtml(l) {
    const km = l.mileageKm || l.mileage;
    const powerKw = l.powerKw || (l.power ? parseInt(l.power, 10) : null);
    const hp = powerKw ? Math.round(powerKw * 1.34102) : null;
    const powerLabel = powerKw ? `${powerKw} kW / ${hp} KM` : (l.power ? String(l.power).replace('(', '/ ').replace(')', '') : 'Ni podatka');

    const fuelStr = (l.fuel || '').toLowerCase().trim();
    const isElectric = fuelStr.includes('elektr') || fuelStr === 'electric' || fuelStr === 'ev';
    const isHybrid = fuelStr.includes('hibrid') || fuelStr.includes('hybrid');

    // 1. Prevoženi km
    let kmFormatted = '0 km';
    if (km) {
        const num = typeof km === 'number' ? km : parseFloat(String(km).replace(/[^\d.-]/g, ''));
        kmFormatted = isNaN(num) ? String(km) : String(Math.round(num)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' km';
    } else if (l.isNew || l.condition === 'Novo vozilo') {
        kmFormatted = '0 km';
    } else {
        kmFormatted = 'Ni podatka';
    }

    // 2. Moč motorja (powerLabel above)

    // 3. Vrsta goriva
    let fuelLabel = l.fuel || 'Bencin';
    if (isElectric) fuelLabel = 'Elektrika';
    else if (isHybrid) fuelLabel = l.hybridType ? `Hibrid (${l.hybridType})` : 'Hibrid';
    else if (fuelStr.includes('bencin') || fuelStr.includes('petrol') || fuelStr.includes('gasoline')) fuelLabel = 'Bencin';
    else if (fuelStr.includes('dizel') || fuelStr.includes('diesel')) fuelLabel = 'Dizel';

    // 4. 1. registracija
    const regLabel = l.firstRegistration || l.year || 'Novo vozilo';

    // 5. Menjalnik
    let transmissionLabel = l.transmission;
    if (!transmissionLabel) {
        transmissionLabel = isElectric ? 'Avtomatski' : 'Ročni';
    }

    // 6. Oblika motorja
    const engineLayoutLabel = getEngineLayout(l, isElectric);

    // 7. Prejšnji lastniki
    let ownersLabel = '';
    if (l.condition === 'Novo vozilo') {
        ownersLabel = 'Novo vozilo (0)';
    } else if (l.previousOwnersCount) {
        ownersLabel = `${l.previousOwnersCount}. lastnik`;
    } else if (l.previousOwners) {
        ownersLabel = `${l.previousOwners}`;
    } else if (l.isNew && !l.previousOwnersCount) {
        ownersLabel = 'Novo vozilo (0)';
    } else {
        ownersLabel = '1. lastnik';
    }

    // 8. Pogon
    let driveLabel = l.driveType || 'Spredaj';
    if (driveLabel.toLowerCase() === '4x4' || driveLabel.toLowerCase().includes('štiri')) {
        driveLabel = '4x4';
    } else if (driveLabel.toLowerCase() === 'zadaj') {
        driveLabel = 'Zadaj';
    } else if (driveLabel.toLowerCase() === 'spredaj') {
        driveLabel = 'Spredaj';
    }

    // 9. Delovna prostornina (pri SUS) ALI obvezno Domet (pri EV)
    let spec9Label = t('spec_displacement', 'Delovna prostornina');
    let spec9Value = '';
    let spec9Svg = '';

    if (isElectric) {
        spec9Label = t('spec_range', 'Domet (WLTP)');
        const range = l.electricRangeKm || l.rangeKm || 500;
        spec9Value = `${range} km`;
        spec9Svg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="17" height="12" rx="2"></rect>
            <line x1="22" y1="10" x2="22" y2="14"></line>
            <path d="M11 9l-3 4h4l-2 4 4-5h-3z" fill="currentColor"></path>
        </svg>`;
    } else {
        spec9Label = t('spec_displacement', 'Delovna prostornina');
        if (l.engineCc) {
            const ccNum = Math.round(Number(l.engineCc));
            spec9Value = `${String(ccNum).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} cm³`;
        } else if (l.displacement) {
            spec9Value = `${l.displacement}`;
        } else {
            spec9Value = 'Ni podatka';
        }
        spec9Svg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3h12v7a6 6 0 0 1-12 0V3z"></path>
            <line x1="6" y1="3" x2="18" y2="3"></line>
            <line x1="12" y1="13" x2="12" y2="21"></line>
            <path d="M9 21h6"></path>
        </svg>`;
    }

    const specs9 = [
        // Row 1 (2-col: Prevoženi km & Prva registracija)
        {
            label: t('spec_mileage', 'Prevoženi km'),
            value: kmFormatted,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="3" x2="4" y2="21"></line>
                <line x1="20" y1="3" x2="20" y2="21"></line>
                <line x1="12" y1="3" x2="12" y2="7"></line>
                <line x1="12" y1="11" x2="12" y2="15"></line>
                <line x1="12" y1="19" x2="12" y2="21"></line>
            </svg>`
        },
        {
            label: t('spec_first_registration', 'Prva registracija'),
            value: regLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`
        },
        // Row 2 (2-col: Vrsta goriva & Moč motorja)
        {
            label: t('spec_fuel', 'Vrsta goriva'),
            value: fuelLabel,
            svg: isElectric ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>` : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 21h11"></path>
                <path d="M4 21V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v17"></path>
                <path d="M13 13h2a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.5a2 2 0 0 0-.6-1.4L18 5"></path>
                <path d="M4 8h9"></path>
            </svg>`
        },
        {
            label: t('spec_power', 'Moč motorja'),
            value: powerLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 14l3.5-3.5"></path>
                <path d="M20.2 17.5a9 9 0 1 0-16.4 0"></path>
                <circle cx="12" cy="14" r="2" fill="currentColor"></circle>
            </svg>`
        },
        // Row 3 (2-col: Menjalnik & Pogon)
        {
            label: t('spec_gearbox', 'Menjalnik'),
            value: transmissionLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 5v14M18 5v14M6 12h12M12 5v14"></path>
                <circle cx="6" cy="5" r="1.5" fill="currentColor"></circle>
                <circle cx="12" cy="5" r="1.5" fill="currentColor"></circle>
                <circle cx="18" cy="5" r="1.5" fill="currentColor"></circle>
                <circle cx="6" cy="19" r="1.5" fill="currentColor"></circle>
                <circle cx="18" cy="19" r="1.5" fill="currentColor"></circle>
            </svg>`
        },
        {
            label: t('spec_drive_type', 'Pogon'),
            value: driveLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <line x1="12" y1="3" x2="12" y2="21"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <circle cx="12" cy="12" r="3.5"></circle>
            </svg>`
        },
        // Row 4 (2-col: Prejšnji lastniki & Oblika motorja)
        {
            label: t('spec_previous_owners', 'Prejšnji lastniki'),
            value: ownersLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M16 11l2 2 4-4"></path>
            </svg>`
        },
        {
            label: t('spec_engine_layout', 'Oblika motorja'),
            value: engineLayoutLabel,
            svg: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"></path>
                <path d="M4 14v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"></path>
                <rect x="2" y="10" width="20" height="4" rx="1"></rect>
                <path d="M8 5V3M16 5V3M8 21v-2M16 21v-2"></path>
            </svg>`
        },
        // Row 5 (2-col: Delovna prostornina / Domet)
        {
            label: spec9Label,
            value: spec9Value,
            svg: spec9Svg
        }
    ];

    // Secondary specs for the accordion
    const secondarySpecs = [
        [t('condition', 'Stanje'), l.condition],
        [t('color', 'Barva'), l.color ? (l.colorType && l.colorType !== 'solid' ? `${l.color} (${l.colorType})` : l.color) : null],
        [t('doors', 'Vrata'), l.doorsCount],
        [t('seats', 'Sedeži'), l.seatsCount],
        [t('co2_emissions', 'Emisije CO2'), l.co2 ? t('unit_gkm', { val: l.co2 }) : null],
        [t('emission_class', 'Emisijski razred'), l.emissionClass],
        [t('hybrid_type', 'Vrsta hibrida'), l.hybridType],
        [t('consumption_combined', 'Poraba (kombinirana)'), l.fuelL100kmCombined ? t('unit_l100km', { val: l.fuelL100kmCombined }) : (l.fuelL100km ? t('unit_l100km', { val: l.fuelL100km }) : null)],
        [t('consumption_city', 'Poraba (mesto)'), l.fuelL100kmCity ? t('unit_l100km', { val: l.fuelL100kmCity }) : null],
        [t('consumption_highway', 'Poraba (avtocesta)'), l.fuelL100kmHighway ? t('unit_l100km', { val: l.fuelL100kmHighway }) : null],
        [t('battery_capacity', 'Kapaciteta baterije'), l.batteryKwh ? t('unit_kwh', { val: l.batteryKwh }) : null],
        [t('battery_health', 'Zdravje baterije'), l.batteryHealth ? `${l.batteryHealth} %` : null],
        [t('consumption', 'Poraba'), l.consumptionKwh100 ? `${l.consumptionKwh100} kWh/100 km` : null],
        [t('towing_capacity', 'Vlečna zmogljivost'), l.towingKg ? t('unit_kg', { val: l.towingKg }) : null],
        [t('registered_until', 'Registriran do'), l.registeredUntil],
    ].filter(([, v]) => v !== null && v !== undefined && v !== '');

    return `
        <section class="lp-section">
            <h2 class="lp-section-title centered">${t('technical_specifications', 'Tehnične specifikacije')}</h2>
            
            <div class="lp-specs-container">
                <!-- Primary 9-Specs Box (Reference Design) -->
                <div class="lp-key-specs-box">
                    <div class="lp-specs-grid-9">
                        ${specs9.map(s => `
                            <div class="lp-spec-card-item">
                                <div class="lp-spec-icon-box">
                                    ${s.svg}
                                </div>
                                <div class="lp-spec-text-box">
                                    <span class="lp-spec-item-label">${escHtml(s.label)}</span>
                                    <span class="lp-spec-item-value">${escHtml(String(s.value))}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Secondary Specs Accordion -->
                ${secondarySpecs.length > 0 ? `
                <div class="adv-accordion glass-card">
                    <div class="adv-acc-header">
                        <button type="button" class="adv-acc-trigger" aria-expanded="false">
                            <span class="adv-acc-title">
                                <i data-lucide="list"></i>
                                ${t('all_specs_and_details', 'Vse specifikacije')}
                            </span>
                            <div class="adv-acc-right">
                                <i data-lucide="chevron-down" class="adv-acc-chevron"></i>
                            </div>
                        </button>
                    </div>
                    <div class="adv-acc-body" style="display:none; padding: 1.25rem 1.5rem; flex-direction: column; gap: 0.5rem;">
                        <div class="lp-specs-content" style="width: 100%;">
                            ${secondarySpecs.map(([label, val]) => `
                                <div class="lp-spec-item">
                                    <span class="lp-spec-label">${escHtml(label)}</span>
                                    <span class="lp-spec-value">${escHtml(String(val))}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Equipment dropdowns (inline under specs) -->
                ${renderEquipmentAccordions(l)}
            </div>
        </section>
    `;
}

function renderEquipmentAccordions(l) {
    const eq = Array.isArray(l.equipment) ? l.equipment : [];
    const customEq = Array.isArray(l.customEquipment) ? l.customEquipment : [];
    if (eq.length === 0 && customEq.length === 0) return '';

    // Build per-group sections — each group that has at least one matching item
    // gets its own titled chip-row so the buyer can scan by category.
    const groupSections = EQUIPMENT_GROUPS
        .map(group => {
            const items = group.items.filter(i => eq.includes(i.value));
            return items.length ? { group, items } : null;
        })
        .filter(Boolean);

    if (groupSections.length === 0 && customEq.length === 0) return '';

    const groupHtml = groupSections.map(({ group, items }) => `
        <div class="lp-eq-group">
            <div class="lp-eq-group-header">
                <i data-lucide="${group.icon}" class="lp-eq-group-icon"></i>
                <span class="lp-eq-group-label">${escHtml(t(group.label, group.id))}</span>
            </div>
            <div class="lp-eq-chips">
                ${items.map(i => `
                    <span class="lp-eq-chip">
                        <i data-lucide="${i.icon}"></i>
                        ${escHtml(t(i.label, i.value))}
                    </span>`).join('')}
            </div>
        </div>`).join('');

    const customHtml = customEq.length ? `
        <div class="lp-eq-group">
            <div class="lp-eq-group-header">
                <i data-lucide="plus-circle" class="lp-eq-group-icon"></i>
                <span class="lp-eq-group-label">${t('equipment_custom', 'Dodatna oprema')}</span>
            </div>
            <div class="lp-eq-chips">
                ${customEq.map(ce => `<span class="lp-eq-chip lp-eq-chip--custom">${escHtml(ce.value || '')}</span>`).join('')}
            </div>
        </div>` : '';

    const total = eq.length + customEq.length;

    return `
        <div class="adv-accordion glass-card lp-eq-accordion">
            <div class="adv-acc-header">
                <button type="button" class="adv-acc-trigger" aria-expanded="false">
                    <span class="adv-acc-title">
                        <i data-lucide="list-checks"></i>
                        ${t('additional_equipment', 'Dodatna oprema')}
                        <span class="lp-eq-count">${total}</span>
                    </span>
                    <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                </button>
            </div>
            <div class="adv-acc-body lp-eq-body" style="display:none;">
                ${groupHtml}
                ${customHtml}
            </div>
        </div>`;
}

function buildConsumptionLabel(l) {
    const f = (l.fuel || '').toLowerCase();

    if (f === 'elektrika') {
        const d = l.rangeKm || l.electricRangeKm;
        return d ? t('unit_km_wltp', { val: d }) : null;
    }

    let parts = [];
    const cons = l.fuelL100kmCombined || l.fuelL100km;
    if (cons) parts.push(t('unit_l100km', { val: cons }));

    // Hybrid logic
    if ((f.includes('hibrid')) && l.electricRangeKm) {
        parts.push(t('unit_km_el', { val: l.electricRangeKm }));
    }

    return parts.length > 0 ? parts.join(' + ') : null;
}

// ── Seller card ───────────────────────────────────────────────────────────────
const BH_DAY_LABELS = { mon: t('mon'), tue: t('tue'), wed: t('wed'), thu: t('thu'), fri: t('fri'), sat: t('sat'), sun: t('sun') };
const BH_DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function renderSellerCardHtml(l) {
    const contact = l.contact || {};
    const dd = l.dealerDetails || {};
    const isBusiness = l.sellerType === 'business' || l.sellerType === 'dealer' || Boolean(l.dealerDetails);
    const name = l.authorName || contact.name || l.seller || dd.companyName || (isBusiness ? t('dealer', 'Avtohiša') : t('private_seller', 'Zasebni prodajalec'));
    const initial = name.charAt(0).toUpperCase();
    const phone = contact.phone || dd.phone || l.phone;
    const email = contact.email || dd.email || l.email;
    const loc = l.location || {};
    const city = loc.city || (dd.address ? dd.address.split(',').pop().trim() : '') || loc.region || '';
    const sellerImage = l.sellerImage || dd.logo;

    const avatarHtml = sellerImage
        ? `<img src="${escHtml(sellerImage)}" alt="${escHtml(name)}" />`
        : `<span>${initial}</span>`;

    const sellerBadge = isBusiness
        ? `<span class="lp-seller-pill-badge lp-seller-pill-badge--dealer"><i data-lucide="building-2"></i> ${t('dealer', 'Avtohiša')}</span>`
        : `<span class="lp-seller-pill-badge lp-seller-pill-badge--private"><i data-lucide="user"></i> ${t('private_seller', 'Zasebni prodajalec')}</span>`;

    const hasContacts = Boolean(phone || email || city);
    const contactsHtml = hasContacts ? `
        <div class="lp-seller-contacts-bar">
            <div class="lp-seller-pill-contacts">
                ${phone ? `
                <a href="tel:${escHtml(phone)}" class="lp-seller-pill-link" onclick="event.stopPropagation()" title="${t('call', 'Pokliči')}">
                    <i data-lucide="phone"></i> <span>${escHtml(phone)}</span>
                </a>` : ''}
                ${email ? `
                <a href="mailto:${escHtml(email)}" class="lp-seller-pill-link" onclick="event.stopPropagation()" title="${t('email', 'E-pošta')}">
                    <i data-lucide="mail"></i> <span>${escHtml(email)}</span>
                </a>` : ''}
                ${city ? `
                <span class="lp-seller-pill-loc">
                    <i data-lucide="map-pin"></i> <span>${escHtml(city)}</span>
                </span>` : ''}
            </div>
        </div>
    ` : '';

    // If private seller: clean card matching glass design
    if (!isBusiness) {
        return `
            <div class="glass-card lp-seller-accordion lp-seller-card--private">
                <div class="lp-seller-static-pill">
                    <div class="lp-seller-pill-left">
                        <div class="lp-seller-pill-avatar">${avatarHtml}</div>
                        <div class="lp-seller-pill-info">
                            <span class="lp-seller-pill-name">${escHtml(name)}</span>
                            ${sellerBadge}
                        </div>
                    </div>
                    <div class="lp-seller-pill-right">
                        <button type="button" class="lp-report-text-btn" id="lpReportBtn" title="${t('report_listing', 'Prijavi oglas')}">
                            <i data-lucide="flag"></i> <span class="lp-report-text">${t('report_listing', 'Prijavi oglas')}</span>
                        </button>
                    </div>
                </div>
                ${contactsHtml}
            </div>`;
    }

    // Dealership: expandable dropdown accordion with registration info
    const hoursData = dd.workingHours || l.businessHours || {};
    const hasHours = hoursData && Object.keys(hoursData).length > 0;
    const hoursHtml = hasHours
        ? BH_DAY_ORDER.map(d => {
            const h = hoursData[d];
            return h && h.from && h.to ? `
                <div class="lp-bh-row">
                    <span class="lp-bh-day">${BH_DAY_LABELS[d] || d}</span>
                    <span class="lp-bh-time">${escHtml(h.from)} – ${escHtml(h.to)}</span>
                </div>` : `
                <div class="lp-bh-row closed">
                    <span class="lp-bh-day">${BH_DAY_LABELS[d] || d}</span>
                    <span class="lp-bh-time">Zaprto</span>
                </div>`;
        }).join('')
        : `<p style="color:#94a3b8;font-size:0.84rem;margin:0;">Delovni čas ni naveden</p>`;

    const address = dd.address || (city ? `${city}, Slovenija` : '');
    const cleanWebsite = dd.website ? dd.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
    const authBrands = dd.authorizedBrands || (l.make ? [l.make] : []);
    const services = dd.services || ['Financiranje in leasing', 'Menjava staro za novo', 'Garancija na vozila'];
    const description = dd.description || '';

    return `
        <div class="adv-accordion glass-card lp-seller-accordion lp-seller-card--dealer" id="sellerAccordion">
            <div class="adv-acc-header">
                <button type="button" class="adv-acc-trigger lp-seller-trigger" aria-expanded="false" id="sellerAccTrigger">
                    <div class="lp-seller-pill-left">
                        <div class="lp-seller-pill-avatar">${avatarHtml}</div>
                        <div class="lp-seller-pill-info">
                            <span class="lp-seller-pill-name">${escHtml(name)}</span>
                            ${sellerBadge}
                        </div>
                    </div>
                    <div class="adv-acc-right">
                        <span class="lp-seller-more-badge">Več informacij</span>
                        <i data-lucide="chevron-down" class="adv-acc-chevron"></i>
                    </div>
                </button>
            </div>
            ${contactsHtml}
            <div class="adv-acc-body lp-dealer-dropdown-body" style="display:none;">
                
                <!-- Action buttons -->
                <div class="lp-dealer-action-buttons">
                    ${phone ? `
                    <a href="tel:${escHtml(phone)}" class="lp-dealer-btn lp-dealer-btn--call">
                        <i data-lucide="phone-call"></i>
                        <div>
                            <span class="lp-dealer-btn-sub">Pokličite prodajalca</span>
                            <span class="lp-dealer-btn-main">${escHtml(phone)}</span>
                        </div>
                    </a>` : ''}
                    ${email ? `
                    <a href="mailto:${escHtml(email)}" class="lp-dealer-btn lp-dealer-btn--mail">
                        <i data-lucide="mail"></i>
                        <div>
                            <span class="lp-dealer-btn-sub">Pošljite povpraševanje</span>
                            <span class="lp-dealer-btn-main">${escHtml(email)}</span>
                        </div>
                    </a>` : ''}
                    ${dd.website ? `
                    <a href="${escHtml(dd.website)}" target="_blank" rel="noopener noreferrer" class="lp-dealer-btn lp-dealer-btn--web">
                        <i data-lucide="globe"></i>
                        <div>
                            <span class="lp-dealer-btn-sub">Uradna spletna stran</span>
                            <span class="lp-dealer-btn-main">${escHtml(cleanWebsite)}</span>
                        </div>
                    </a>` : ''}
                    <a href="#/iskanje?seller=${encodeURIComponent(name)}" class="lp-dealer-btn lp-dealer-btn--stock">
                        <i data-lucide="car"></i>
                        <div>
                            <span class="lp-dealer-btn-sub">Zaloga vozil</span>
                            <span class="lp-dealer-btn-main">Vsa vozila ponudnika</span>
                        </div>
                    </a>
                </div>

                <!-- Registration info grid -->
                <div class="lp-dealer-details-grid">
                    <!-- Column 1: Working hours -->
                    <div class="lp-dealer-col">
                        <div class="lp-dealer-col-header">
                            <i data-lucide="clock"></i>
                            <span>Delovni čas</span>
                        </div>
                        <div class="lp-dealer-hours-list">
                            ${hoursHtml}
                        </div>
                    </div>

                    <!-- Column 2: Showroom & Location -->
                    <div class="lp-dealer-col">
                        <div class="lp-dealer-col-header">
                            <i data-lucide="map-pin"></i>
                            <span>Salon & Lokacija</span>
                        </div>
                        ${address ? `<p class="lp-dealer-address-text">${escHtml(address)}</p>` : ''}
                        ${address ? `
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank" rel="noopener noreferrer" class="lp-dealer-map-link">
                            <i data-lucide="navigation"></i> <span>Odpri v Google Zemljevidih</span>
                        </a>` : ''}
                    </div>

                    <!-- Column 3: Company data -->
                    <div class="lp-dealer-col">
                        <div class="lp-dealer-col-header">
                            <i data-lucide="building"></i>
                            <span>Podatki o podjetju</span>
                        </div>
                        <div class="lp-dealer-company-data">
                            <div class="lp-dealer-data-row">
                                <span class="lp-dealer-data-lbl">Podjetje:</span>
                                <span class="lp-dealer-data-val font-semibold">${escHtml(dd.companyName || name)}</span>
                            </div>
                            ${dd.taxNumber ? `
                            <div class="lp-dealer-data-row">
                                <span class="lp-dealer-data-lbl">ID za DDV:</span>
                                <span class="lp-dealer-data-val font-mono">${escHtml(dd.taxNumber)}</span>
                            </div>` : ''}
                            ${dd.regNumber ? `
                            <div class="lp-dealer-data-row">
                                <span class="lp-dealer-data-lbl">Matična št.:</span>
                                <span class="lp-dealer-data-val font-mono">${escHtml(dd.regNumber)}</span>
                            </div>` : ''}
                            <div class="lp-dealer-verified-badge">
                                <i data-lucide="shield-check"></i> Preverjen trgovec MojAvto
                            </div>
                        </div>
                    </div>
                </div>

                <!-- About & Services -->
                ${(description || (authBrands && authBrands.length) || (services && services.length)) ? `
                <div class="lp-dealer-about-box">
                    ${description ? `<p class="lp-dealer-desc-text">${escHtml(description)}</p>` : ''}
                    <div class="lp-dealer-services-chips">
                        ${authBrands.map(b => `
                            <span class="lp-dealer-service-chip">
                                <i data-lucide="award"></i> Pooblaščeni za ${escHtml(b)}
                            </span>`).join('')}
                        ${services.map(s => `
                            <span class="lp-dealer-service-chip">
                                <i data-lucide="check-circle-2"></i> ${escHtml(s)}
                            </span>`).join('')}
                    </div>
                </div>` : ''}

                <!-- Dropdown footer -->
                <div class="lp-dealer-dropdown-footer">
                    <button type="button" class="lp-report-text-btn" id="lpReportBtn" title="Prijavi oglas">
                        <i data-lucide="flag"></i> <span class="lp-report-text">Prijavi nepravilnost v oglasu</span>
                    </button>
                </div>

            </div>
        </div>`;
}


// ── Report listing modal ──────────────────────────────────────────────────────
const REPORT_REASONS = [
    { value: 'spam', label: 'Spam ali prevara' },
    { value: 'napacna_cena', label: 'Napačna cena ali podatki' },
    { value: 'ze_prodano', label: 'Vozilo je že prodano' },
    { value: 'neprimerno', label: 'Neprimerna vsebina' },
    { value: 'ostalo', label: 'Drugo' },
];

function showReportModal(listingId) {
    const existing = document.getElementById('reportModalOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'reportModalOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1.5rem;';

    overlay.innerHTML = `
        <div style="background:#fff;border-radius:1.5rem;padding:2rem;max-width:360px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.18);">
            <h3 style="margin:0 0 0.25rem;font-size:1.05rem;font-weight:800;color:#0f172a;">Prijavi oglas</h3>
            <p style="margin:0 0 1.25rem;font-size:0.82rem;color:#64748b;">Izberite razlog za prijavo:</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;">
                ${REPORT_REASONS.map(r => `
                <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-size:0.88rem;color:#334155;padding:0.5rem 0.75rem;border-radius:0.75rem;border:1.5px solid #e2e8f0;transition:border-color 0.15s;">
                    <input type="radio" name="reportReason" value="${r.value}" style="accent-color:#f97316;">
                    ${r.label}
                </label>`).join('')}
            </div>
            <div id="reportFeedback" style="min-height:1.2rem;font-size:0.82rem;color:#dc2626;margin-bottom:0.75rem;"></div>
            <div style="display:flex;gap:0.5rem;">
                <button id="reportSubmitBtn" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:0.9rem;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:inherit;">Pošlji</button>
                <button id="reportCancelBtn" style="padding:0.7rem 1rem;background:#f1f5f9;color:#475569;border:none;border-radius:0.9rem;font-weight:600;font-size:0.9rem;cursor:pointer;font-family:inherit;">Prekliči</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#reportCancelBtn').addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelector('#reportSubmitBtn').addEventListener('click', async () => {
        const selected = overlay.querySelector('input[name="reportReason"]:checked');
        const feedback = overlay.querySelector('#reportFeedback');
        if (!selected) {
            feedback.textContent = 'Prosimo, izberite razlog.';
            return;
        }
        const btn = overlay.querySelector('#reportSubmitBtn');
        btn.disabled = true;
        btn.textContent = 'Pošiljam...';
        try {
            await supabase.from('reports').insert({
                listing_id: listingId,
                reporter_id: currentUser()?.id || null,
                reason: selected.value,
                status: 'pending',
            });
            overlay.querySelector('div').innerHTML = `
                <div style="text-align:center;padding:1rem 0;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">✅</div>
                    <p style="font-weight:700;color:#0f172a;margin:0 0 0.25rem;">Hvala za prijavo!</p>
                    <p style="font-size:0.82rem;color:#64748b;margin:0 0 1.25rem;">Preverili jo bomo čim prej.</p>
                    <button id="reportDoneBtn" style="padding:0.6rem 1.5rem;background:#f1f5f9;color:#475569;border:none;border-radius:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Zapri</button>
                </div>`;
            overlay.querySelector('#reportDoneBtn').addEventListener('click', close);
        } catch {
            feedback.textContent = 'Napaka pri pošiljanju. Poskusite znova.';
            btn.disabled = false;
            btn.textContent = 'Pošlji';
        }
    });
}

// ── Similar listings ──────────────────────────────────────────────────────────
async function loadSimilar(current, preloadedAll = []) {
    const grid = document.getElementById('similarGrid');
    if (!grid) return;

    try {
        let all = Array.isArray(preloadedAll) && preloadedAll.length > 0 ? preloadedAll : null;
        if (!all) {
            const { getListings } = await import('../services/listingService.js');
            all = await getListings();
        }

        const similar = all
            .filter(l =>
                l.id !== current.id &&
                (!l.status || l.status === 'active') &&
                (l.make === current.make || l.category === current.category)
            )
            .slice(0, 4);

        if (similar.length === 0) {
            grid.innerHTML = `<p style="color:#94a3b8;font-size:0.85rem;">${t('no_similar_listings')}</p>`;
            return;
        }

        grid.innerHTML = similar.map(l => renderSimilarCard(l)).join('');
        if (window.lucide) window.lucide.createIcons();
    } catch {
        grid.innerHTML = '';
    }
}

const DISCOUNT_TAG_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;

function renderSimilarCard(l) {
    const img = l.images?.exterior?.[0] || `https://placehold.co/300x200?text=${encodeURIComponent(t('no_photos'))}`;
    const price = formatPrice(l.priceEur || l.price || 0, l.callForPrice);
    const km = l.mileageKm || l.mileage;
    const isSponsored = l.promotion?.tier === 'sponsored';

    return `
        <a class="lp-similar-card listing-card ${isSponsored ? 'sponsored' : ''}" href="#/oglas?id=${l.id}">
            <div class="lp-similar-img-wrap">
                <img src="${escHtml(img)}" alt="${escHtml(l.make || '')} ${escHtml(l.model || '')}" loading="lazy" />
                ${isSponsored ? `<span class="listing-sponsored-badge">${t('sponsored_listing')}</span>` : ''}
                ${l.salePriceEur ? `<span class="discount-tag-icon" title="Znižana cena" style="position:absolute;top:8px;left:8px;">${DISCOUNT_TAG_SVG}</span>` : ''}
            </div>
            <div class="lp-similar-body">
                <div class="lp-similar-title">${escHtml(buildTitle(l))}</div>
                <div class="lp-similar-meta">${l.year || ''}${km ? ' · ' + fmtKm(km) : ''}${l.fuel ? ' · ' + l.fuel : ''}</div>
                <div class="lp-similar-price">${price}</div>
            </div>
        </a>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildTitle(l) {
    return [l.make, l.model, l.variant].filter(Boolean).join(' ');
}

function catLabel(cat) {
    const map = {
        avto: t('cat_cars'),
        moto: t('cat_moto'),
        gospodarska: t('cat_commercial'),
        mehanizacija: t('cat_machinery'),
        'prosti-cas': t('cat_leisure'),
        deli: t('cat_parts')
    };
    return map[cat] || t('header_listings');
}

function fmtKm(n) {
    return new Intl.NumberFormat('sl-SI').format(Math.round(n)) + ' km';
}

function formatDate(ts) {
    const d = ts?.toDate ? ts.toDate() : new Date(ts?.seconds * 1000 || ts);
    const lang = getCurrentLang();
    return d.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long', year: 'numeric' });
}


function errorHtml(title, msg) {
    return `
        <div style="text-align:center;padding:4rem 1rem;max-width:500px;margin:0 auto;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
            <h2 style="font-size:1.4rem;font-weight:700;margin:0 0 0.5rem;">${title}</h2>
            <p style="color:#64748b;margin-bottom:1.5rem;">${escHtml(msg)}</p>
            <a href="#/" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">← ${t('back_to_home')}</a>
        </div>`;
}
