// ═══════════════════════════════════════════════════════════════════════════════
// Listing Detail Page — MojAvto.si
// ═══════════════════════════════════════════════════════════════════════════════

import { getListingById, recordListingView, getListingViewStats, formatPrice, getListings } from '../services/listingService.js';
import { kmToMiles, kwToHp, l100kmToMpg, formatDisplacement } from '../utils/listingUtils.js';
import { getVehicleRating } from '../utils/valuationScore.js';
import { getEquipmentLabel, EQUIPMENT_GROUPS } from '../data/equipment.js';
import { auth } from '../firebase.js';
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite } from '../services/garageService.js';
import { key as lsKey } from '../config/storageKeys.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import CostPanel from '../components/CostPanel.jsx';
import { getServiceHistoryByVin } from '../services/serviceBookService.js';
import { t, getCurrentLang } from '../core/i18n.js';

export async function initNavtikaListingPage() {
    console.log('[ListingPage] init');

    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const id = params.get('id');
    const page = document.getElementById('listingPage');

    if (!id) {
        if (page) page.innerHTML = errorHtml(t('error_listing_not_found'), t('error_missing_id'));
        return;
    }

    try {
        const [listing, allListings] = await Promise.all([
            getListingById(id),
            getListings().catch(() => []),
        ]);
        recordListingView(id);      // log this view (local timeline + Firestore daily) before rendering stats
        renderListing(listing);
        injectRating(listing, allListings);
        injectServiceHistory(listing);
    } catch (err) {
        console.error('[ListingPage]', err);
        if (page) page.innerHTML = errorHtml(t('error_listing_not_found'), err.message);
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
        const dateStr = r.date ? new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
        const km = r.mileage ? new Intl.NumberFormat(getCurrentLang() === 'sl' ? 'sl-SI' : 'en-US').format(r.mileage) + ' km' : null;
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

    // Low confidence or no rating — show a neutral pill
    if (!rating || rating.confidence === 'low') {
        slot.innerHTML = `
            <div style="margin:0.6rem 0 0.1rem;">
                <span style="display:inline-block; font-size:0.72rem; font-weight:600; padding:0.25rem 0.7rem; border-radius:999px; background:rgba(255,255,255,0.05); color:#64748b; border:1px solid rgba(255,255,255,0.08);">
                    ${t('price_rating_unavailable')}
                </span>
            </div>`;
        return;
    }

    const confidenceLabel = rating.confidence === 'high'
        ? t('high_confidence') + ` (${rating.comparablesCount} ${t('listings').toLowerCase()})`
        : t('medium_confidence') + ` (${rating.comparablesCount} ${t('listings').toLowerCase()})`;

    // Pick badge colour by label
    const labelColor = {
        'Great value': '#22c55e',
        'Good value': '#86efac',
        'Fair price': '#94a3b8',
        'Above average': '#fb923c',
        'Overpriced': '#ef4444',
    }[rating.label] || 'var(--color-primary-start)';

    const translatedLabel = t(rating.label.toLowerCase().replace(' ', '_'));

    slot.innerHTML = `
        <div style="margin:0.75rem 0 0.25rem; padding:0.75rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                ${renderStarsHtml(rating.stars, 18)}
                <span style="font-size:0.9rem; font-weight:700; color:${labelColor};">${escHtml(translatedLabel)}</span>
            </div>
            <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">${escHtml(rating.priceSignal)}</div>
            ${rating.equipmentSignal ? `<div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${t('rare_features')}: ${escHtml(rating.equipmentSignal)}</div>` : ''}
            <div style="margin-top:6px;">
                <span style="font-size:0.72rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:999px; background:rgba(255,255,255,0.05); color:#64748b;">${escHtml(confidenceLabel)}</span>
            </div>
            ${rating.warning ? `
            <div style="margin-top:0.6rem; padding:0.5rem 0.75rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:0.5rem; font-size:0.8rem; color:#fca5a5; display:flex; gap:0.4rem; align-items:center;">
                <span>⚠️</span>${escHtml(rating.warning)}
            </div>` : ''}
        </div>`;
}

function renderStarsHtml(stars, dim) {
    const color = 'var(--color-primary-start, #f59e0b)';
    let html = '<div style="display:inline-flex;align-items:center;gap:2px;">';
    for (let i = 1; i <= 5; i++) {
        const fill = stars >= i ? 'full' : stars >= i - 0.5 ? 'half' : 'empty';
        const fc = fill === 'empty' ? '#374151' : color;
        const gid = `lp-s${i}`;
        if (fill === 'half') {
            html += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="${gid}"><stop offset="50%" stop-color="${color}"/><stop offset="50%" stop-color="#374151"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#${gid})"/></svg>`;
        } else {
            html += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${fc}"/></svg>`;
        }
    }
    html += '</div>';
    return html;
}

// ── View statistics card ──────────────────────────────────────────────────────
function renderViewStatsHtml(l) {
    const stats = getListingViewStats(l);
    const fmt = n => new Intl.NumberFormat(getCurrentLang() === 'sl' ? 'sl-SI' : 'en-US').format(n);

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
            const liked = await isFavourite(user.uid, l.id);
            const localSet = getLikedSet();
            if (liked) { localSet.add(l.id); btn.classList.add('active'); }
            else        { localSet.delete(l.id); btn.classList.remove('active'); }
            setLikedSet(localSet);
        } catch { /* non-critical */ }
    };

    // auth.currentUser can be null on first render — wait for auth to settle.
    if (auth.currentUser) {
        syncWithFirebase(auth.currentUser);
    } else {
        const unsub = auth.onAuthStateChanged(user => {
            unsub();
            syncWithFirebase(user);
        });
    }

    btn.addEventListener('click', async () => {
        let currentUser = auth.currentUser;

        // Auth gate for logged-out users — revert only on cancel, not on Firebase errors.
        if (!currentUser) {
            try {
                currentUser = await showAuthGate({
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
                await removeFromFavourites(currentUser.uid, l.id);
            } else {
                await addToFavourites(currentUser.uid, { id: l.id, title: l.make + ' ' + l.model, price: l.priceEur || l.price, images: l.images });
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
        const idx  = list.findIndex(c => c.id === l.id);

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
        let currentUser = auth.currentUser;
        if (!currentUser) {
            try {
                currentUser = await showAuthGate({
                    icon: '⚖️',
                    title: t('compare_vehicles_title'),
                    message: t('compare_vehicles_msg'),
                });
            } catch { return; }
        }

        if (list.length >= 3) {
            alert(t('compare_limit_3'));
            return;
        }

        list.push({ id: l.id, title: l.make + ' ' + l.model, image: l.images?.exterior?.[0] || '', price: l.priceEur || l.price });
        btn.classList.add('active');
        popBtn(btn);
        localStorage.setItem(lsKey('compare'), JSON.stringify(list));
        if (window.updateHeaderCompare) window.updateHeaderCompare();
    });
}

// ── Main render ───────────────────────────────────────────────────────────────
function renderListing(l) {
    const page = document.getElementById('listingPage');
    if (!page) return;

    const exteriorImages = l.images?.exterior || [];
    const interiorImages = l.images?.interior || [];
    const isVin = l.vinVerified || l.entryType === 'vin';
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

            <!-- Header: title -->
            <header class="lp-header">
                <div class="lp-header-main">
                    <h1 class="lp-title">${escHtml(buildTitle(l))}</h1>
                    <div class="lp-meta-row">
                        <div class="lp-view-toggle">
                            <button class="lp-view-btn active" data-view="exterior">${t('exterior')}</button>
                            <button class="lp-view-btn ${interiorImages.length === 0 ? 'disabled' : ''}" data-view="interior" ${interiorImages.length === 0 ? 'disabled' : ''}>${t('interior')}</button>
                        </div>
                        ${l.createdAt ? `<span>📅 ${formatDate(l.createdAt)}</span>` : ''}
                        ${l.viewCount ? `<span>👁 ${t('views_count', { count: l.viewCount })}</span>` : ''}
                        ${isVin ? `<span class="lp-vin-badge-inline"><i data-lucide="shield-check"></i> ${t('vin_verified')}</span>` : ''}
                    </div>
                </div>
            </header>

            <!-- Two-column layout -->
            <div class="lp-layout">

                <!-- LEFT: main content -->
                <div class="lp-main">

                    <!-- Image gallery -->
                    ${renderGalleryHtml(exteriorImages, interiorImages, l.condition)}

                    <!-- VIN verified block -->
                    ${isVin ? renderVinBlockHtml(l) : ''}

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
                    <section class="lp-section">
                        <div class="lp-seller-note-block">
                            <i data-lucide="message-circle"></i>
                            <div>
                                <span class="lp-seller-note-label">${t('seller_note')}</span>
                                <p class="lp-seller-note-text">${escHtml(l.sellerNote)}</p>
                            </div>
                        </div>
                    </section>` : ''}

                </div>

                <!-- RIGHT: sidebar (Sticky) -->
                <aside class="lp-sidebar">

                    <!-- Price Card (Pilled and Centered) -->
                    <div class="lp-sidebar-card lp-price-card centered">
                        <div class="lp-price-pill-container">
                            ${l.salePriceEur ? `
                            <div>
                                <div class="lp-sale-price">${formatPrice(l.salePriceEur, false)}</div>
                                <div class="lp-original-price">${formatPrice(l.priceEur || l.priceRaw || l.price || 0, false)}</div>
                                <div class="lp-discount-pct">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                    -${Math.round((1 - l.salePriceEur / (l.priceEur || l.priceRaw || l.price)) * 100)}%
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

                        <!-- Like + Compare actions -->
                        <div class="lp-action-row">
                            <button class="lp-action-btn lp-fav-btn" id="lpFavBtn" data-listing-id="${l.id}" title="${t('save_to_favorites_title')}">
                                <i data-lucide="heart"></i>
                                <span>${t('save_btn')}</span>
                            </button>
                            <button class="lp-action-btn lp-compare-btn" id="lpCompareBtn" data-listing-id="${l.id}" title="${t('compare_vehicles_title')}">
                                <i data-lucide="scale"></i>
                                <span>${t('compare_btn')}</span>
                            </button>
                        </div>
                    </div>

                    <!-- View statistics -->
                    ${renderViewStatsHtml(l)}

                    <!-- Cost Panel -->
                    <div id="react-cost-panel-root"></div>

                    <!-- Seller card -->
                    ${renderSellerCardHtml(l)}

                </aside>
            </div>



            <!-- Similar -->
            <section class="lp-similar">
                <h2 class="lp-section-title">${t('similar_listings')}</h2>
                <div id="similarGrid" class="lp-similar-grid">
                    <p style="color:#94a3b8;font-size:0.85rem;">${t('loading_similar_listings')}</p>
                </div>
            </section>

        </div>
    `;


    // Cost Panel (React)
    const costPanelRoot = document.getElementById('react-cost-panel-root');
    const cpPrice = l.priceRaw || l.priceEur || l.price;
    const cpKw = l.powerKw || l.power;
    if (costPanelRoot && cpPrice && cpKw) {
        ReactDOM.createRoot(costPanelRoot).render(
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

    // Phone reveal
    document.getElementById('btnShowPhone')?.addEventListener('click', () => {
        const btn = document.getElementById('btnShowPhone');
        const reveal = document.getElementById('phoneReveal');
        if (reveal && btn) {
            reveal.style.display = 'flex';
            btn.style.display = 'none';
        }
    });

    // Init icons
    // Mobile layout: move price card right after gallery so order is
    // gallery → price → specs/description/seller-note → TCO → seller card
    if (window.innerWidth <= 900) {
        const gallery = page.querySelector('.lp-gallery, .lp-gallery-empty');
        const priceCard = page.querySelector('.lp-price-card');
        if (gallery && priceCard) gallery.insertAdjacentElement('afterend', priceCard);
    }

    if (window.lucide) window.lucide.createIcons();

    // Load similar
    loadSimilar(l);

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

    const thumbs = images.slice(0, 6).map((url, i) => `
        <div class="lp-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
            <img src="${escHtml(url)}" alt="Photo ${i + 1}" loading="lazy" />
            ${i === 5 && images.length > 6 ? `<div class="lp-thumb-more">+${images.length - 6}</div>` : ''}
        </div>`).join('');

    return `
        <section class="lp-gallery">
            <div class="lp-gallery-main">
                <img id="galleryMainImg" src="${escHtml(images[0])}" alt="${t('main_photo')}" />
                ${condition ? `<span class="lp-condition-badge">${escHtml(condition)}</span>` : ''}
                ${images.length > 1 ? `
                <button class="lp-gallery-nav lp-gallery-prev" id="gallPrev">&#10094;</button>
                <button class="lp-gallery-nav lp-gallery-next" id="gallNext">&#10095;</button>
                <span class="lp-gallery-counter" id="gallCounter">1 / ${images.length}</span>` : ''}
            </div>
            ${images.length > 1 ? `<div class="lp-thumbs" id="gallThumbs">${thumbs}</div>` : '<div id="gallThumbs"></div>'}
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

// ── VIN verified block ────────────────────────────────────────────────────────
function renderVinBlockHtml(l) {
    const d = l.vinData;
    if (!d) return '';

    const hasOverrides = l.vinOverrides && Object.keys(l.vinOverrides).length > 0;

    const accRow = () => {
        if (d.accidentCount === null || d.accidentCount === undefined) return vinRow('💥', t('accidents'), t('no_data'), '');
        if (d.accidentCount === 0) return vinRow('💥', t('accidents'), `✓ ${t('none_recorded')}`, 'clean');
        return vinRow('💥', t('accidents'), `⚠ ${d.accidentCount} ${t('recorded')}${d.accidentSeverity === 'major' ? ` (${t('major')})` : ` (${t('minor')})`}`, d.accidentSeverity === 'major' ? 'danger' : 'warn');
    };

    const recallRow = () => {
        if (d.hasOpenRecalls) return vinRow('🔔', t('recalls'), `⚠ ${t('open_recalls_check')}`, 'warn');
        return vinRow('🔔', t('recalls'), `✓ ${t('no_open_recalls')}`, 'clean');
    };

    return `
        <section class="lp-vin-block">
            <div class="lp-vin-block-header">
                <div class="lp-vin-badge">
                    <i data-lucide="shield-check"></i>
                    ${t('vin_verified')}
                </div>
                <span class="lp-vin-code">${escHtml(l.vin || '')}</span>
            </div>
            <div class="lp-vin-rows">
                ${d.make || d.model ? vinRow('🏭', t('make_model'), `${d.make || ''} ${d.model || ''}`.trim(), '') : ''}
                ${d.year ? vinRow('📅', t('year_of_manufacture'), d.year, '') : ''}
                ${d.engineType ? vinRow('⚙️', t('engine'), `${d.engineType}${d.engineCc ? ' / ' + formatDisplacement(d.engineCc, localStorage.getItem(lsKey('displacement_unit')) || 'cc', getCurrentLang()) : ''}${d.powerKw ? ' / ' + t('hp_val', { val: Math.round(d.powerKw * 1.34102) }) : ''}`, '') : ''}
                ${d.countryOfOrigin ? vinRow('🌍', t('country_of_origin'), d.countryOfOrigin, '') : ''}
                ${d.previousOwners !== null && d.previousOwners !== undefined ? vinRow('👤', t('previous_owners'), d.previousOwners, '') : ''}
                ${accRow()}
                ${recallRow()}
            </div>
            ${hasOverrides ? `
            <div class="lp-vin-edit-note">
                ✎ ${t('vin_edit_note')}
            </div>` : ''}
            <div class="lp-vin-source">${t('vin_data_source')}</div>
        </section>`;
}

function vinRow(icon, label, value, cls) {
    return `
        <div class="lp-vin-row">
            <span class="lp-vin-icon">${icon}</span>
            <span class="lp-vin-label">${escHtml(label)}</span>
            <span class="lp-vin-value ${cls}">${escHtml(String(value))}</span>
        </div>`;
}

// ── Technical specs ───────────────────────────────────────────────────────────
function renderSpecsHtml(l) {
    const keySpecs = [];
    if (l.year) keySpecs.push({ label: t('spec_first_registration', 'Letnik'), value: l.year, icon: 'calendar-days' });
    if (l.lengthM) keySpecs.push({ label: 'Dolžina', value: `${l.lengthM} m`, icon: 'ruler' });
    if (l.fuel) keySpecs.push({ label: 'Gorivo', value: l.fuel, icon: 'fuel' });
    if (l.enginePowerHp || l.powerHp) keySpecs.push({ label: 'Moč motorja', value: `${l.enginePowerHp || l.powerHp} KM`, icon: 'zap' });
    if (l.engineHours) keySpecs.push({ label: 'Ure motorja', value: `${l.engineHours} h`, icon: 'clock' });
    if (l.cabins) keySpecs.push({ label: 'Kabine', value: l.cabins, icon: 'bed' });

    const secondarySpecs = [];
    if (l.beamM) secondarySpecs.push(['Širina', `${l.beamM} m`]);
    if (l.draftM) secondarySpecs.push(['Ugrez', `${l.draftM} m`]);
    if (l.hullMaterial) secondarySpecs.push(['Material trupa', l.hullMaterial]);
    if (l.ceCategory) secondarySpecs.push(['CE kategorija', l.ceCategory]);
    if (l.engineCount) secondarySpecs.push(['Število motorjev', l.engineCount]);
    if (l.engineMountType) secondarySpecs.push(['Tip motorja', l.engineMountType]);
    if (l.berths) secondarySpecs.push(['Ležišča', l.berths]);

    return `
        <section class="lp-section">
            <h2 class="lp-section-title centered">${t('technical_specifications', 'Tehnični podatki')}</h2>
            
            <div class="lp-specs-container">
                <div class="lp-key-specs-box">
                    <div class="lp-key-specs-grid">
                        ${keySpecs.map(s => `
                            <div class="lp-key-spec-item" title="${escHtml(s.label)}">
                                <i data-lucide="${s.icon}" class="lp-key-spec-icon"></i>
                                <span class="lp-key-spec-value">${escHtml(String(s.value))}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${secondarySpecs.length > 0 ? `
                <div class="adv-accordion glass-card">
                    <div class="adv-acc-header">
                        <button type="button" class="adv-acc-trigger" aria-expanded="false">
                            <span class="adv-acc-title">
                                <i data-lucide="list"></i>
                                ${t('all_specs_and_details')}
                            </span>
                            <div class="adv-acc-right">
                                <i data-lucide="chevron-down" class="adv-acc-chevron"></i>
                            </div>
                        </button>
                    </div>
                    <div class="adv-acc-body" style="display:none; padding: 1.5rem; flex-direction: column; gap: 0.5rem;">
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
    const eq = l.equipment;
    if (!eq || eq.length === 0) return '';

    // Map group IDs into two top-level dropdowns
    const INTERIOR_IDS = new Set(['udobje', 'parkiranje']);
    const EQUIPMENT_IDS = new Set(['varnost', 'razsvetljava', 'multimedija', 'asistenti', 'prtljaga', 'garancija', 'moto', 'gospodarska']);

    const interiorItems = [];
    const equipmentItems = [];

    for (const group of EQUIPMENT_GROUPS) {
        const matched = group.items.filter(i => eq.includes(i.value));
        if (matched.length === 0) continue;
        if (INTERIOR_IDS.has(group.id)) {
            interiorItems.push(...matched);
        } else if (EQUIPMENT_IDS.has(group.id)) {
            equipmentItems.push(...matched);
        }
    }

    const accordionHtml = (icon, label, items) => {
        if (items.length === 0) return '';
        return `
            <div class="adv-accordion glass-card">
                <div class="adv-acc-header">
                    <button type="button" class="adv-acc-trigger" aria-expanded="false">
                        <span class="adv-acc-title">
                            <i data-lucide="${icon}"></i>
                            ${escHtml(label)}
                            <span style="font-size:0.75rem; color:#94a3b8; margin-left:0.4rem;">(${items.length})</span>
                        </span>
                        <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                    </button>
                </div>
                <div class="adv-acc-body" style="display:none; padding:1rem 1.5rem 1.25rem; flex-direction:row; flex-wrap:wrap; gap:0.6rem;">
                    ${items.map(i => `<span class="adv-chip" style="cursor:default;">${escHtml(i.label)}</span>`).join('')}
                </div>
            </div>`;
    };

    if (interiorItems.length === 0 && equipmentItems.length === 0) return '';

    return `
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(0,0,0,0.06);">
            <span style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">${t('equipment_and_features')}</span>
        </div>
        ${accordionHtml('sofa', t('interior_and_comfort'), interiorItems)}
        ${accordionHtml('shield-check', t('equipment_safety_etc'), equipmentItems)}
    `;
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
    const isBusiness = l.sellerType === 'business';
    const name = l.authorName || contact.name || (isBusiness ? t('dealer') : t('private_seller'));
    const initial = name.charAt(0).toUpperCase();
    const phone = contact.phone;
    const email = contact.email;
    const loc = l.location || {};

    const sellerBadge = isBusiness
        ? `<span class="lp-seller-badge lp-seller-badge--business"><i data-lucide="building-2"></i> ${t('dealer')}</span>`
        : `<span class="lp-seller-badge lp-seller-badge--private"><i data-lucide="user"></i> ${t('private_seller')}</span>`;

    // Business hours accordion
    let hoursHtml = '';
    if (isBusiness && l.businessHours && Object.keys(l.businessHours).length > 0) {
        const rows = BH_DAY_ORDER
            .filter(d => l.businessHours[d])
            .map(d => `
                <div class="lp-bh-row">
                    <span class="lp-bh-day">${BH_DAY_LABELS[d]}</span>
                    <span class="lp-bh-time">${escHtml(l.businessHours[d].from)} – ${escHtml(l.businessHours[d].to)}</span>
                </div>`)
            .join('');
        hoursHtml = `
            <div class="adv-accordion lp-bh-accordion" style="margin-top:0.75rem;">
                <div class="adv-acc-header">
                    <button type="button" class="adv-acc-trigger" aria-expanded="false" style="padding:0.6rem 0.85rem;">
                        <span class="adv-acc-title" style="font-size:0.82rem;">
                            <i data-lucide="clock"></i> ${t('business_hours')}
                        </span>
                        <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                    </button>
                </div>
                <div class="adv-acc-body" style="display:none; padding:0.75rem 1rem; flex-direction:column; gap:0.35rem;">
                    ${rows}
                </div>
            </div>`;
    }

    // Seller note
    let noteHtml = '';
    if (l.sellerNote) {
        noteHtml = `
            <div class="lp-seller-note">
                <i data-lucide="message-circle"></i>
                <span>${escHtml(l.sellerNote)}</span>
            </div>`;
    }

    return `
        <div class="lp-sidebar-card lp-seller-card centered">
            <div class="lp-seller-avatar">${initial}</div>
            <div class="lp-seller-name">${escHtml(name)}</div>
            ${sellerBadge}

            ${loc.city ? `
            <div class="lp-seller-location">
                📍 ${escHtml(loc.city)}${loc.region ? ', ' + escHtml(loc.region) : ''}
            </div>` : ''}

            <div class="lp-seller-actions">
                ${phone ? `
                <a href="tel:${escHtml(phone)}" class="lp-btn lp-btn--pill-phone">
                    <i data-lucide="phone"></i> ${escHtml(phone)}
                </a>` : ''}
                ${email ? `
                <a href="mailto:${escHtml(email)}" class="lp-btn lp-btn--pill-mail">
                    <i data-lucide="mail"></i> ${escHtml(email)}
                </a>` : ''}
            </div>
            ${noteHtml}
            ${hoursHtml}
        </div>`;
}


// ── Similar listings ──────────────────────────────────────────────────────────
async function loadSimilar(current) {
    const grid = document.getElementById('similarGrid');
    if (!grid) return;

    try {
        const { getListings } = await import('../services/listingService.js');
        const all = await getListings();

        const similar = all
            .filter(l =>
                l.id !== current.id &&
                l.status === 'active' &&
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
                ${l.vinVerified ? `<span class="listing-vin-badge">🛡 ${t('vin_verified')}</span>` : ''}
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
        deli: t('cat_parts'),
        plovila: 'Plovila',
        colni: 'Čolni',
        motorji: 'Motorji'
    };
    return map[cat] || t('header_listings');
}

function fmtKm(n) {
    const lang = getCurrentLang();
    if (lang === 'sl') {
        return new Intl.NumberFormat('sl-SI').format(Math.round(n)) + ' km';
    }
    return new Intl.NumberFormat('en-US').format(Math.round(n * 0.621371)) + ' mi';
}

function formatDate(ts) {
    const d = ts?.toDate ? ts.toDate() : new Date(ts?.seconds * 1000 || ts);
    const lang = getCurrentLang();
    const locale = lang === 'sl' ? 'sl-SI' : 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function escHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
