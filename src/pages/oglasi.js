// Oglasi (Listings Board) page — MojAvto.si
// Renders car listing cards + comparison tray logic

const MAX_COMPARE = 3;

import { escHtml } from '../utils/escHtml.js';
import { SAMPLE_LISTINGS } from '../data/sampleListings.js';
import { PLATFORM } from '../config/platform.js';
import { currentUser } from '../lib/currentUser.js';
import { navigateTo } from '../router.js';
import { COUNTRIES, getRegions } from '../data/locationData.js';

// itemTypes shown on the main listings board for the active platform.
const PRIMARY_ITEM_TYPES = PLATFORM.id === 'navtika' ? ['plovilo', 'motor'] : ['vehicle'];
const isPrimaryItem = l => PRIMARY_ITEM_TYPES.includes(l.itemType) || (PLATFORM.id !== 'navtika' && !l.itemType);
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite, getFavourites } from '../services/garageService.js';
import { getListings, getListingsPaged } from '../services/listingService.js';
import { renderLoading } from '../utils/uiState.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { getCurrentLang, t } from '../core/i18n.js';
import { showCompareLimitToast } from '../utils/listingUtils.js';
import { key as lsKey } from '../config/storageKeys.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { COMMERCIAL_BY_KEY } from '../data/commercialTaxonomy.js';
import { showToast } from '../utils/toast.js';

import {
    getFuelPill,
    getPowerPill,
    getConsumptionPill,
    getTransmissionPill,
    getYearPill,
    getKmPill,
    getDisplacementPill,
    getBatteryPill,
    formatDisplacement
} from '../utils/listingUtils.js';

import { getVehicleRating } from '../utils/valuationScore.js';
import { renderRatingBadgeCard, ratingFallbackStars } from '../utils/priceRatingUi.js';
import { getModelVariants } from '../utils/bodyType.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';

// ── Power unit toggle ────────────────────────────────────────
let currentPowerUnit = 'km'; // 'km' = KM/HP (default), 'kw' = kW

function applyPowerUnit(unit) {
    currentPowerUnit = unit;
    document.querySelectorAll('.power-pill').forEach(pill => {
        const val = pill.querySelector('.power-val');
        if (!val) return;
        val.textContent = unit === 'kw'
            ? pill.dataset.kw + ' kW'
            : pill.dataset.hp + ' HP';
    });
    // Sync toggle buttons in legend popup
    document.querySelectorAll('.power-unit-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === unit);
    });
    const label = document.getElementById('powerToggleLabel');
    if (label) label.textContent = unit === 'kw' ? 'kW'  : 'KM';
}

// ── Price Rating Logic ───────────────────────────────────────
function getPriceRating(car, allCars) {
    const yearNum = parseInt(car.year?.split('/').pop(), 10);
    const comps = allCars.filter(c => {
        if (c.id === car.id) return false;
        if (c.segment !== car.segment) return false;
        const cYear = parseInt(c.year?.split('/').pop(), 10);
        return Math.abs(cYear - yearNum) <= 2;
    });

    if (comps.length === 0) {
        return { score: 2, label: t('rating_fair_val', 'Poštena cena'), color: 'amber' };
    }

    const avgPrice = comps.reduce((s, c) => s + c.priceRaw, 0) / comps.length;
    const ratio = car.priceRaw / avgPrice;

    if (ratio <= 0.88) return { score: 3, label: t('rating_excellent_val', 'Odlična vrednost'), color: 'green' };
    if (ratio <= 1.08) return { score: 2, label: t('rating_fair_val', 'Poštena cena'), color: 'amber' };
    return { score: 1, label: t('rating_above_avg', 'Nad povprečjem'), color: 'red' };
}

// ── Comparison State ─────────────────────────────────────────
let compareList = [];
try {
    compareList = JSON.parse(localStorage.getItem(lsKey('compare')) || '[]');
    if (!Array.isArray(compareList)) compareList = [];
} catch (e) {
    console.error('[Oglasi] Failed to parse comparison list from localStorage:', e);
    compareList = [];
}

function saveCompareState() {
    try {
        localStorage.setItem(lsKey('compare'), JSON.stringify(compareList));
    } catch (e) {
        console.error('[Oglasi] Failed to save comparison state:', e);
    }
}

function isInCompare(carId) {
    return compareList.some(c => c.id === carId);
}

function addToCompare(car) {
    if (compareList.length >= MAX_COMPARE) {
        showCompareLimitToast();
        return false;
    }
    if (isInCompare(car.id)) return false;
    const rating = getPriceRating(car, SAMPLE_LISTINGS);
    compareList.push({
        id: car.id,
        title: car.title,
        subtitle: car.subtitle,
        image: car.images?.exterior?.[0] || car.image,
        year: car.year,
        price: car.price,
        priceRaw: car.priceRaw,
        mileage: car.mileage,
        power: car.power,
        fuel: car.fuel,
        location: car.location,
        seller: car.seller,
        sellerType: car.sellerType,
        category: car.category,
        engineType: car.engineType,
        engineStroke: car.engineStroke,
        priceRating: rating
    });
    saveCompareState();
    return true;
}

function removeFromCompare(carId) {
    compareList = compareList.filter(c => c.id !== carId);
    saveCompareState();
}

// ── Favourite toggle ─────────────────────────────────────────
async function toggleFavourite(btn, carId, car) {
    let user = currentUser();

    if (!user) {
        try {
            user = await showAuthGate({
                icon: '❤️',
                title: 'Save to favorites',
                message: 'Sign in to save this listing to your favorites garage.',
            });
        } catch {
            return; // user cancelled
        }
    }

    const liked = btn.classList.contains('active');
    
    // Optimistic UI update
    if (liked) {
        btn.classList.remove('active');
        btn.classList.remove('heart-bump');
        userFavouritesCache.delete(carId);
        showToast('Oglas odstranjen iz priljubljenih', 'info');
    } else {
        btn.classList.add('active');
        btn.classList.add('heart-bump');
        userFavouritesCache.add(carId);
        showToast('Oglas uspešno shranjen!', 'heart');
    }

    btn.disabled = true;
    try {
        if (liked) {
            await removeFromFavourites(user.id, carId);
        } else {
            await addToFavourites(user.id, car);
        }
    } catch (err) {
        // Rollback on error
        if (liked) {
            btn.classList.add('active');
            userFavouritesCache.add(carId);
        } else {
            btn.classList.remove('active');
            userFavouritesCache.delete(carId);
        }
        console.error('[toggleFavourite] Error:', err);
        alert('An error occurred while updating favorites.');
    } finally {
        btn.disabled = false;
    }
}

// ── Check favourites on load ─────────────────────────────────
let userFavouritesCache = new Set();

async function checkFavouriteStates() {
    const user = currentUser();
    if (!user) return;
    
    try {
        const favs = await getFavourites(user.id);
        userFavouritesCache = new Set(favs.map(f => f.listingId));
        
        const btns = document.querySelectorAll('.listing-fav-btn[data-car-id]');
        btns.forEach(btn => {
            const carId = btn.getAttribute('data-car-id');
            if (userFavouritesCache.has(carId)) {
                btn.classList.add('active');
            }
        });
    } catch (err) {
        console.error('[checkFavouriteStates] Error:', err);
    }
}

// ── Render Car Card ──────────────────────────────────────────
// Auction facet badges for a listing card (type + binding sale + cash). Reads the
// live auction state when present, else the denormalized fields on the listing.
function auctionCardBadges(car, auction) {
    if (!(auction || car.entryType === 'auction')) return '';
    let type = auction?.auctionType ?? car.auctionType ?? 'live';
    if (type === 'regular') type = 'live'; // legacy
    const binding = auction?.bindingContract ?? car.auctionBinding ?? false;
    const cash = auction?.cashAllowed ?? car.auctionCash ?? false;
    const meta = ({
        silent: { icon: '🔒', label: 'Tiha' },
        prebid: { icon: '⏱', label: 'Pred-dražba' },
        live:   { icon: '👁', label: 'Živa' },
    })[type] || { icon: '👁', label: 'Živa' };
    const badges = [`<span class="drazba-badge drazba-badge--type">${meta.icon} ${meta.label}</span>`];
    if (binding) badges.push('<span class="drazba-badge drazba-badge--binding">✓ Obvezna prodaja</span>');
    if (cash) badges.push('<span class="drazba-badge drazba-badge--cash">💶 Gotovina</span>');
    return `<div class="drazba-badges">${badges.join('')}</div>`;
}

export function renderCarCard(car, auction = null) {
    const inCompare = isInCompare(car.id);
    let displayImages = [];
    if (car.images) {
        if (car.images.exterior) displayImages.push(...car.images.exterior);
        if (car.images.interior) displayImages.push(...car.images.interior);
    }
    if (displayImages.length === 0) displayImages.push(car.image || 'images/car-placeholder.png');
    
    // Zberi do 5 unikatnih slik za novo UX drsno galerijo
    const images = [...new Set(displayImages)].slice(0, 5);

    try {
        const rating = getPriceRating(car, SAMPLE_LISTINGS);

        // Normalise car to listing shape for getVehicleRating
        const listingShape = {
            ...car,
            id: car.id,
            make: car.make,
            model: car.model,
            year: parseInt(car.year, 10) || 0,
            priceEur: car.priceRaw,
            equipment: car.equipment || [],
        };
        const allListingsShape = (SAMPLE_LISTINGS || []).map(c => ({
            ...c,
            year: parseInt(c.year, 10) || 0,
            priceEur: c.priceRaw,
            equipment: c.equipment || [],
        }));
        const vRating = getVehicleRating(listingShape, allListingsShape);
        // Always show stars + label below — never an English text pill. Use the
        // comparables-based rating when confident, else fall back to the price ratio.
        const starRating = (vRating && vRating.confidence !== 'low')
            ? { stars: vRating.stars, label: vRating.label }
            : ratingFallbackStars(rating);
        const ratingTitle = vRating && vRating.confidence !== 'low'
            ? `${vRating.label} · ${vRating.priceSignal}`
            : starRating.label;

        return `
    <div class="listing-card" data-car-id="${car.id}">
        <!-- Image Container -->
        <div class="listing-card-img card-gallery-wrapper">
            <div class="card-gallery-scroll">
                ${images.map(img => `<img src="${img}" alt="${escHtml(car.title)}" loading="lazy">`).join('')}
            </div>
            
            ${car.isNew ? `<span class="badge-new-pill overlay">${t('badge_new', 'NOVO')}</span>` : ''}
            ${car.condition ? `<span class="condition-overlay-badge" data-condition="${car.condition}">${car.condition}</span>` : ''}
            
            ${(auction || car.entryType === 'auction') ? `
                <span class="drazba-card-timer" data-ends="${(auction?.endsAt || car.endsAt) ? new Date(auction?.endsAt || car.endsAt).getTime() : ''}">—</span>
                ${(auction?.bidCount > 0) ? `<span class="drazba-card-live">${t('auction_live_badge', '● V ŽIVO')}</span>` : ''}
            ` : ''}

            ${images.length > 1 ? `
                <button type="button" class="card-gallery-arrow card-gallery-prev" aria-label="${t('gallery_prev', 'Prejšnja slika')}" title="${t('gallery_prev', 'Prejšnja slika')}">
                    <i data-lucide="chevron-left"></i>
                </button>
                <button type="button" class="card-gallery-arrow card-gallery-next" aria-label="${t('gallery_next', 'Naslednja slika')}" title="${t('gallery_next', 'Naslednja slika')}">
                    <i data-lucide="chevron-right"></i>
                </button>
                <div class="card-gallery-dots">
                    ${images.map((_, i) => `<span class="card-gallery-dot ${i === 0 ? 'active' : ''}" data-dot-idx="${i}"></span>`).join('')}
                </div>
            ` : ''}
        </div>

        <!-- Content Area -->
        <div class="listing-card-content">
            <div class="listing-card-header">
                <div class="car-info">
                    <h2 class="listing-card-title vehicle-title">
                        <span class="vehicle-title-make-model">${escHtml(car.make || car.title)} ${car.make ? escHtml(car.model || '') : ''}</span>
                        ${(car.make && car.variant) ? `<span class="vehicle-title-variant">${escHtml(car.variant)}</span>` : ''}
                    </h2>

                </div>
                
                <div class="car-price-box">
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                        <span class="price-value">${car.price}</span>
                        ${car.salePriceEur ? `
                        <span class="discount-tag-icon" title="${t('discount_reduced_price', 'Znižana cena')}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                        </span>` : ''}
                    </div>
                    ${renderRatingBadgeCard(starRating, ratingTitle)}
                </div>
            </div>

            ${auctionCardBadges(car, auction)}

            <div class="listing-card-action-bar">
                <div class="primary-specs">
                    ${getYearPill(car.year)}
                    ${getKmPill(car.mileage)}
                    ${getPowerPill(car.powerKw)}
                </div>

                <div class="listing-card-actions">
                    <button class="action-pill-btn listing-fav-btn ${userFavouritesCache.has(car.id) ? 'active' : ''}" data-car-id="${car.id}" title="${t('save_favorite', 'Shrani med priljubljene')}">
                        <i data-lucide="heart"></i>
                    </button>
                    <button class="action-pill-btn listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${car.id}" title="${t('compare_btn', 'Primerjaj')}">
                        <i data-lucide="scale"></i>
                    </button>
                    <button class="action-pill-btn contact-btn grid-contact-btn" data-car-id="${car.id}" title="${t('contact_seller', 'Kontaktiraj prodajalca')}">
                        <i data-lucide="phone"></i>
                    </button>
                </div>
            </div>

            <div class="listing-card-specs">
                <div class="spec-row secondary">
                    <div class="spec-group-left">
                        ${getDisplacementPill(car.engineCc)}
                        ${getFuelPill(car)}
                        ${getTransmissionPill(car)}
                        ${getConsumptionPill(car)}
                        ${getBatteryPill(car)}
                    </div>
                </div>
            </div>

            <!-- Bottom footer: on tablet this becomes a single row with
                 contact + location on the left and favourite + compare on the
                 right. Transparent (display:contents) on every other layout. -->
            <div class="listing-card-footer">
                <!-- Compact action row shown on 13-inch screens (below secondary specs).
                     Contact lives in .note-contact-row in list view, so it is omitted
                     here to avoid a duplicate phone button. -->
                <div class="listing-card-bottom-actions">
                    <button class="action-pill-btn listing-fav-btn ${userFavouritesCache.has(car.id) ? 'active' : ''}" data-car-id="${car.id}" title="${t('save_favorite', 'Shrani med priljubljene')}">
                        <i data-lucide="heart"></i>
                    </button>
                    <button class="action-pill-btn listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${car.id}" title="${t('compare_btn', 'Primerjaj')}">
                        <i data-lucide="scale"></i>
                    </button>
                </div>

                <div class="note-contact-row">
                    <button class="action-pill-btn contact-btn list-contact-btn" data-car-id="${car.id}" title="Contact">
                        <i data-lucide="phone"></i>
                    </button>
                    ${car.location?.region ? `
                    <div class="seller-note-card">
                        <i data-lucide="map-pin"></i>
                        <span>${escHtml(car.location.region)}${car.location.country && car.location.country !== 'SI' ? ', ' + escHtml(car.location.country) : ''}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>`;
    } catch (err) {
        console.error('[renderCarCard] Error rendering car:', car?.id, err);
        return `<div class="listing-card error">Error loading listing ${car?.id || ''}</div>`;
    }
}

// ── Contact Popup ────────────────────────────────────────────
window.showContactPopup = function (carId) {
    const car = SAMPLE_LISTINGS.find(c => c.id === carId);
    if (!car) return;

    const overlay = document.createElement('div');
    overlay.className = 'contact-popup-overlay active';
    overlay.innerHTML = `
        <div class="contact-popup-card">
            <button class="close-btn">
                <i data-lucide="x"></i>
            </button>
            <div class="contact-popup-header">
                <img src="${escHtml(car.sellerImage)}" class="seller-avatar">
                <h3 class="seller-name">${escHtml(car.seller)}</h3>
                <p class="seller-type-label">${car.sellerType === 'dealer' ? t('seller_authorized_dealer', 'Pooblaščeni prodajalec') : t('seller_private', 'Zasebni prodajalec')}</p>
            </div>
            <div class="contact-popup-info-box">
                <div class="contact-row">
                    <i data-lucide="map-pin" class="row-icon"></i>
                    <span class="row-text">${escHtml(typeof car.location === 'object' ? (car.location.region || car.location.city || '') : car.location)}</span>
                </div>
                <div class="contact-row">
                    <i data-lucide="phone" class="row-icon"></i>
                    <span class="row-text">+386 1 234 5678</span>
                </div>
                <div class="contact-row">
                    <i data-lucide="mail" class="row-icon"></i>
                    <span class="row-text">info@mojavto.si</span>
                </div>

                ${car.sellerType === 'dealer' && car.openingHours ? `
                <div class="contact-popup-footer-row">
                    <i data-lucide="clock" class="footer-row-icon"></i>
                    <div>
                        <p class="footer-row-label">${t('business_hours', 'Delovni čas')}</p>
                        <p class="footer-row-value">${escHtml(car.openingHours)}</p>
                    </div>
                </div>` : ''}

                ${car.sellerNote ? `
                <div class="contact-popup-footer-row">
                    <i data-lucide="info" class="footer-row-icon"></i>
                    <div>
                        <p class="footer-row-label">${t('seller_note', 'Opomba prodajalca')}</p>
                        <p class="footer-row-value">${escHtml(car.sellerNote)}</p>
                    </div>
                </div>` : ''}
            </div>
            <button class="pill-btn primary w-full">${t('send_message', 'Pošlji sporočilo')}</button>
        </div>
    `;

    document.body.appendChild(overlay);
    if (window.lucide) window.lucide.createIcons();

    const closePopup = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('.close-btn').addEventListener('click', closePopup);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
};

// ── Render All Listings ──────────────────────────────────────
function renderListings(cars) {
    if (_drazbeRenderOverride) {
        _drazbeRenderOverride(cars);
        return;
    }
    const container = document.getElementById('carListingsContainer');
    if (!container) return;
    container.innerHTML = cars.map(c => renderCarCard(c)).join('');
    bindCardEvents(container, cars);
    renderActiveFilterChips();
}

const _containerCarsMap = new WeakMap();

// UX Enhancement: Active Filter Chips
function renderActiveFilterChips() {
    const container = document.getElementById('activeFiltersTopbar');
    if (!container) return;
    const params = parseHashParams();
    let chipsHtml = '';
    
    // We can show chips for interesting parameters
    const ignoreParams = ['cat', 'sort', 'mode'];
    let activeFilterCount = 0;
    for (const [key, value] of params.entries()) {
        if (!ignoreParams.includes(key) && value) {
            // Split comma values
            value.split(',').forEach(val => {
                if (val.trim()) {
                    activeFilterCount++;
                    chipsHtml += `<span class="active-filter-chip" data-key="${key}" data-val="${val}">
                        ${escHtml(val)} <i class="close" title="Odstrani"></i>
                    </span>`;
                }
            });
        }
    }
    if (chipsHtml) {
        chipsHtml += `<span class="active-filter-clear-all">Počisti vse</span>`;
    }
    container.innerHTML = chipsHtml;

    // Update mobile split pill badge & header badge
    const mobileBadge = document.getElementById('mobileFilterBadge');
    if (mobileBadge) {
        if (activeFilterCount > 0) {
            mobileBadge.textContent = activeFilterCount;
            mobileBadge.style.display = 'inline-flex';
        } else {
            mobileBadge.style.display = 'none';
        }
    }
    const headerBadge = document.getElementById('mobileFilterHeaderBadge');
    if (headerBadge) {
        if (activeFilterCount > 0) {
            headerBadge.textContent = activeFilterCount;
            headerBadge.style.display = 'inline-flex';
        } else {
            headerBadge.style.display = 'none';
        }
    }

    // Bind events
    container.onclick = (e) => {
        if (e.target.matches('.close')) {
            const chip = e.target.closest('.active-filter-chip');
            const key = chip.getAttribute('data-key');
            const val = chip.getAttribute('data-val');
            removeSidebarFilter(key, val);
        } else if (e.target.matches('.active-filter-clear-all')) {
            clearAllSidebarFilters();
        }
    };
}

function removeSidebarFilter(key, val) {
    const params = parseHashParams();
    let current = params.get(key) ? params.get(key).split(',') : [];
    current = current.filter(c => c !== val);
    if (current.length) {
        params.set(key, current.join(','));
    } else {
        params.delete(key);
    }
    window.history.replaceState(null, '', `#/oglasi${params.toString() ? '?' + params.toString() : ''}`);
    
    // Update Sidebar UI fields
    const el = document.querySelector(`[name="${key}"]`);
    if (el) el.value = '';
    // Let's just reload the page hash to make things simple and consistent
    window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function clearAllSidebarFilters() {
    window.location.hash = '#/oglasi';
}
export function bindCardEvents(container, cars) {
    _containerCarsMap.set(container, cars);

    if (window.lucide) window.lucide.createIcons({ root: container });
    applyPowerUnit(currentPowerUnit);
    checkFavouriteStates();

    if (container.dataset.eventsBound) return;
    container.dataset.eventsBound = "true";

    // Sync dots on scroll (capture phase because scroll doesn't bubble)
    container.addEventListener('scroll', e => {
        if (!e.target.classList || !e.target.classList.contains('card-gallery-scroll')) return;
        const scrollElem = e.target;
        const wrapper = scrollElem.closest('.card-gallery-wrapper');
        if (!wrapper) return;
        const dots = wrapper.querySelectorAll('.card-gallery-dot');
        if (!dots.length) return;
        
        const scrollLeft = scrollElem.scrollLeft;
        const width = scrollElem.offsetWidth;
        const idx = Math.round(scrollLeft / width);
        dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    }, { capture: true });

    container.addEventListener('click', async e => {
        const card = e.target.closest('.listing-card');
        if (!card) return;
        
        const carId = card.getAttribute('data-car-id');
        const currentCars = _containerCarsMap.get(container) || [];
        const car = currentCars.find(c => String(c.id) === String(carId));

        // Handle Contact Button
        const contactBtn = e.target.closest('.contact-btn');
        if (contactBtn) {
            e.stopPropagation();
            window.showContactPopup(carId);
            return;
        }

        // Handle Favourite Button
        const favBtn = e.target.closest('.listing-fav-btn');
        if (favBtn) {
            e.stopPropagation();
            if (!car) return;
            await toggleFavourite(favBtn, carId, car);
            return;
        }

        // Handle Compare Button
        const compareBtn = e.target.closest('.listing-compare-btn');
        if (compareBtn) {
            e.stopPropagation();
            const user = currentUser();
            if (!user) {
                try {
                    await showAuthGate({
                        icon: '⚖️',
                        title: 'Compare Vehicles',
                        message: 'Sign in to add a vehicle to comparison.',
                    });
                } catch {
                    return;
                }
            }
            if (!car) return;
            if (isInCompare(carId)) {
                removeFromCompare(carId);
                compareBtn.classList.remove('active');
            } else {
                const added = addToCompare(car);
                if (added) compareBtn.classList.add('active');
            }
            if (window.updateHeaderCompare) window.updateHeaderCompare();
            return;
        }

        // Handle Gallery Arrows
        const arrowBtn = e.target.closest('.card-gallery-arrow');
        if (arrowBtn) {
            e.stopPropagation();
            e.preventDefault();
            const wrapper = arrowBtn.closest('.card-gallery-wrapper');
            if (!wrapper) return;
            const scrollElem = wrapper.querySelector('.card-gallery-scroll');
            if (!scrollElem) return;

            const isPrev = arrowBtn.classList.contains('card-gallery-prev');
            const step = scrollElem.clientWidth;
            const currentScroll = scrollElem.scrollLeft;
            const maxScroll = scrollElem.scrollWidth - scrollElem.clientWidth;

            if (isPrev) {
                if (currentScroll <= 10) {
                    scrollElem.scrollTo({ left: maxScroll, behavior: 'smooth' });
                } else {
                    scrollElem.scrollBy({ left: -step, behavior: 'smooth' });
                }
            } else {
                if (currentScroll >= maxScroll - 10) {
                    scrollElem.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollElem.scrollBy({ left: step, behavior: 'smooth' });
                }
            }
            return;
        }

        // Handle Gallery Dot Click
        const dot = e.target.closest('.card-gallery-dot');
        if (dot) {
            e.stopPropagation();
            e.preventDefault();
            const wrapper = dot.closest('.card-gallery-wrapper');
            const scrollElem = wrapper?.querySelector('.card-gallery-scroll');
            const dotIdx = parseInt(dot.getAttribute('data-dot-idx'), 10);
            if (scrollElem && !isNaN(dotIdx)) {
                scrollElem.scrollTo({ left: dotIdx * scrollElem.clientWidth, behavior: 'smooth' });
            }
            return;
        }

        // Handle Card Click (Navigation)
        if (e.target.closest('.pill-btn') || e.target.closest('.action-pill-btn') ||
            e.target.closest('.action-circle-btn') ||
            e.target.closest('.card-gallery-dots') ||
            e.target.closest('.card-gallery-arrow')) {
            return;
        }

        if (car && car.entryType === 'auction') {
            navigateTo(`/drazba?id=${carId}`);
        } else {
            navigateTo(`/oglas?id=${carId}`);
        }
    });

}

// ── Legend popup ─────────────────────────────────────────────
function initLegendPopup() {
    const btn = document.getElementById('legendBtn');
    const overlay = document.getElementById('legendOverlay');
    const closeBtn = document.getElementById('legendCloseBtn');
    if (!btn || !overlay) return;

    const openLegend = () => {
        overlay.style.display = 'flex';
        requestAnimationFrame(() => overlay.classList.add('active'));
        if (window.lucide) window.lucide.createIcons({ context: overlay });
    };

    const closeLegend = () => {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
    };

    btn.addEventListener('click', openLegend);
    closeBtn?.addEventListener('click', closeLegend);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLegend(); });

    // Power unit buttons inside legend
    overlay.querySelectorAll('.power-unit-btn').forEach(puBtn => {
        puBtn.addEventListener('click', () => {
            applyPowerUnit(puBtn.dataset.unit);
        });
    });

    // Clicking the power toggle label also toggles
    document.getElementById('powerToggleLabel')?.addEventListener('click', () => {
        applyPowerUnit(currentPowerUnit === 'kw' ? 'km' : 'kw');
    });

    // Displacement unit buttons inside legend
    const duBtnCc = document.getElementById('duBtnCc');
    const duBtnL = document.getElementById('duBtnL');

    function applyDisplacementUnit(unit) {
        localStorage.setItem(lsKey('displacement_unit'), unit);
        if (duBtnCc) duBtnCc.classList.toggle('active', unit === 'cc');
        if (duBtnL) duBtnL.classList.toggle('active', unit === 'l');

        document.querySelectorAll('.displacement-pill').forEach(pill => {
            const cc = Number(pill.dataset.cc);
            const valSpan = pill.querySelector('.displacement-val');
            if (valSpan && cc) {
                valSpan.textContent = formatDisplacement(cc, unit, getCurrentLang());
            }
        });
    }

    if (duBtnCc && duBtnL) {
        const initialUnit = localStorage.getItem(lsKey('displacement_unit')) || 'cc';
        duBtnCc.classList.toggle('active', initialUnit === 'cc');
        duBtnL.classList.toggle('active', initialUnit === 'l');

        duBtnCc.addEventListener('click', () => applyDisplacementUnit('cc'));
        duBtnL.addEventListener('click', () => applyDisplacementUnit('l'));
    }

    overlay.style.display = 'none';
}


function parseHashParams() {
    return new URLSearchParams(window.location.search);
}

function applyUrlFilters(params) {
    const cat = params.get('cat');
    const make = params.get('make');
    const model = params.get('model');
    const yearFrom = parseInt(params.get('yearFrom'), 10) || 0;
    const priceTo = parseInt(params.get('priceTo'), 10) || Infinity;
    const mileageTo = parseInt(params.get('mileageTo'), 10) || Infinity;
    const engineHoursFrom = parseInt(params.get('engineHoursFrom'), 10) || 0;
    const engineHoursTo = parseInt(params.get('engineHoursTo'), 10) || Infinity;

    const filtered = SAMPLE_LISTINGS.filter(car => {
        const carCat = (car.category === 'motor' || car.category === 'moto') ? 'moto' : car.category;
        const filterCat = (cat === 'motor' || cat === 'moto') ? 'moto' : cat;
        if (filterCat && carCat !== filterCat) return false;
        if (make && car.make !== make) return false;
        if (model && car.model !== model) return false;

        const carYear = parseInt(car.year, 10) || 0;
        if (carYear < yearFrom) return false;

        const carPrice = car.priceRaw || 0;
        if (carPrice > priceTo) return false;

        const carMileage = car.mileageKm || (parseInt(car.mileage?.replace(/[^0-9]/g, ''), 10) || 0);
        if (carMileage > mileageTo) return false;

        // Operating hours (machinery). Only listings recording engineHours match.
        if (engineHoursFrom > 0 || engineHoursTo !== Infinity) {
            if (car.engineHours == null) return false;
            const carHours = Number(car.engineHours) || 0;
            if (carHours < engineHoursFrom || carHours > engineHoursTo) return false;
        }

        return true;
    });

    renderListings(filtered);
}

// ── View Mode ────────────────────────────────────────────────
let currentViewMode = localStorage.getItem(lsKey('viewmode')) || 'list';

function applyViewMode(mode) {
    const container = document.getElementById('carListingsContainer');
    if (!container) return;
    currentViewMode = mode;
    try { localStorage.setItem(lsKey('viewmode'), mode); } catch (e) {}

    container.classList.toggle('grid-layout', mode === 'grid');
    container.classList.toggle('list-layout', mode === 'list');

    const skWrap = container.querySelector('.search-results-skeleton-wrap');
    if (skWrap) {
        skWrap.classList.toggle('skeleton-grid', mode === 'grid');
        skWrap.classList.toggle('skeleton-list', mode === 'list');
        skWrap.querySelectorAll('.card-skeleton').forEach(card => {
            card.classList.toggle('grid-skeleton', mode === 'grid');
            card.classList.toggle('list-skeleton', mode === 'list');
        });
    }

    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === mode);
    });
}

function initViewToggle() {
    applyViewMode(currentViewMode);

    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyViewMode(btn.dataset.view);
        });
    });
}

// ── Page Init ────────────────────────────────────────────────
export function initOglasiPage() {
    console.log('[OglasiPage] init, SAMPLE_LISTINGS count:', SAMPLE_LISTINGS?.length);

    const container = document.getElementById('carListingsContainer');
    if (!container) {
        console.error('[OglasiPage] carListingsContainer NOT FOUND!');
    }

    // Initialize Grid/List view toggle with persistent settings FIRST (so loading skeleton matches layout)
    initViewToggle();

    // Initialize dynamic sidebar filters (handles loading user listings, population, prefill & events)
    initSidebarFiltering();

    // Setup numeric formatters
    document.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));

    if (window.updateHeaderCompare) window.updateHeaderCompare();

    // Subscribe to store — re-render on filter changes, swap layout on viewMode changes.
    /*
    let _prevSnapshot = JSON.stringify(useSearchStore.getState().filters);
    let _prevViewMode = useSearchStore.getState().viewMode;
    const unsubscribe = useSearchStore.subscribe((state) => {
        const snapshot = JSON.stringify(state.filters);
        if (snapshot !== _prevSnapshot) {
            _prevSnapshot = snapshot;
            applyStoreFilters();
        }
        if (state.viewMode !== _prevViewMode) {
            _prevViewMode = state.viewMode;
            applyViewMode(state.viewMode);
        }
    });

    initViewToggle();

    // Store unsubscribe so the router can clean up when navigating away
    window._oglasiUnsubscribe = unsubscribe;
    */



    // Payment toggle
    document.querySelectorAll('.payment-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    initLegendPopup();

    // Sort select
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const val = sortSelect.value;
            if (!_allActiveListings.length) return;
            const sorted = [..._allActiveListings];
            if (val === 'price-asc') sorted.sort((a, b) => (a.priceRaw ?? Infinity) - (b.priceRaw ?? Infinity));
            else if (val === 'price-desc') sorted.sort((a, b) => (b.priceRaw ?? 0) - (a.priceRaw ?? 0));
            else if (val === 'year-desc') sorted.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
            else if (val === 'km-asc') sorted.sort((a, b) => (a.mileageKm ?? Infinity) - (b.mileageKm ?? Infinity));
            renderListings(sorted);
        });
    }

    // When only URL params change (navigating from search/advanced search), re-apply filters.
    const _onRouteParamsChanged = () => prefillSidebarFromUrl();
    document.addEventListener('routeParamsChanged', _onRouteParamsChanged);
    window._oglasiParamsListener = _onRouteParamsChanged;

    // Mobile filter panel toggle (collapsed by default on phones)
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const oglasiSidebar = document.querySelector('.oglasi-sidebar');
    if (mobileFilterToggle && oglasiSidebar) {
        mobileFilterToggle.addEventListener('click', () => {
            const open = oglasiSidebar.classList.toggle('filters-open');
            mobileFilterToggle.classList.toggle('open', open);
            mobileFilterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    // Mobile Floating Split Pill & Bottom Sheets (Alarm-style)
    setupMobileSplitPillAndSheets();

    if (window.lucide) window.lucide.createIcons();
}

function setupMobileSplitPillAndSheets() {
    const splitPill = document.getElementById('mobileSplitPill');
    const filterBtn = document.getElementById('mobilePillFilterBtn');
    const sortBtn = document.getElementById('mobilePillSortBtn');
    const backdrop = document.getElementById('mobileSheetBackdrop');
    const sidebar = document.querySelector('.oglasi-sidebar');
    const sortSheet = document.getElementById('mobileSortSheet');
    const filterCloseBtn = document.getElementById('mobileFilterCloseBtn');
    const sortCloseBtn = document.getElementById('mobileSortCloseBtn');
    const filterApplyBtn = document.getElementById('mobileFilterApplyBtn');
    const filterResetBtn = document.getElementById('mobileFilterResetBtn');
    const sortItems = document.querySelectorAll('.mobile-sort-item');
    const sortSelect = document.getElementById('sortSelect') || document.getElementById('drazbeSortSelect');
    const sortLabel = document.getElementById('mobilePillSortLabel');

    if (!splitPill) return;

    function openFilterSheet() {
        if (sortSheet) sortSheet.classList.remove('sheet-open');
        if (sidebar) sidebar.classList.add('sheet-open');
        if (backdrop) backdrop.classList.add('active');
        document.body.classList.add('mobile-sheet-lock');
        splitPill.classList.add('pill-hidden');
    }

    function openSortSheet() {
        if (sidebar) sidebar.classList.remove('sheet-open');
        if (sortSheet) sortSheet.classList.add('sheet-open');
        if (backdrop) backdrop.classList.add('active');
        document.body.classList.add('mobile-sheet-lock');
        splitPill.classList.add('pill-hidden');
    }

    function closeAllSheets() {
        if (sidebar) sidebar.classList.remove('sheet-open');
        if (sortSheet) sortSheet.classList.remove('sheet-open');
        if (backdrop) backdrop.classList.remove('active');
        document.body.classList.remove('mobile-sheet-lock');
        splitPill.classList.remove('pill-hidden');
    }

    filterBtn?.addEventListener('click', openFilterSheet);
    sortBtn?.addEventListener('click', openSortSheet);
    backdrop?.addEventListener('click', closeAllSheets);
    filterCloseBtn?.addEventListener('click', closeAllSheets);
    sortCloseBtn?.addEventListener('click', closeAllSheets);
    filterApplyBtn?.addEventListener('click', closeAllSheets);
    filterResetBtn?.addEventListener('click', () => {
        clearAllSidebarFilters();
        closeAllSheets();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllSheets();
    });

    // Handle sort options selection
    sortItems.forEach(item => {
        item.addEventListener('click', () => {
            const val = item.getAttribute('data-value');
            sortItems.forEach(i => i.classList.toggle('active', i === item));
            
            if (sortSelect) {
                sortSelect.value = val;
                sortSelect.dispatchEvent(new Event('change'));
            }

            if (sortLabel) {
                if (!val) {
                    sortLabel.textContent = 'Razvrsti';
                } else if (val === 'price-asc') {
                    sortLabel.textContent = 'Cena ↑';
                } else if (val === 'price-desc') {
                    sortLabel.textContent = 'Cena ↓';
                } else if (val === 'year-desc') {
                    sortLabel.textContent = 'Letnik ↓';
                } else if (val === 'km-asc') {
                    sortLabel.textContent = 'Kilometri ↑';
                }
            }

            setTimeout(closeAllSheets, 180);
        });
    });

    // Sync active state of sort options with current sortSelect value
    if (sortSelect) {
        const currentVal = sortSelect.value || '';
        sortItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-value') === currentVal);
        });
    }
}

// ── Sidebar dynamic filtering implementation ──────────────────────────────────
let _allActiveListings = [];
let _sidebarBrandFile = null; // currently loaded brands JSON path (avoids redundant refetch)
let _lastDoc = null;
let _hasMore = false;
let _loadingMore = false;

/**
 * Loads the brands/models JSON appropriate for the given category and repopulates
 * the make select. avto→global, motor/moto→moto, gospodarska→gospodarska — resolved
 * centrally via brandsFileFor() so the home search, create-listing and board agree.
 */
function loadSidebarBrands(category, onReady) {
    const makeSelect = document.getElementById("sidebarMake");
    const modelSelect = document.getElementById("sidebarModel");
    if (!makeSelect) return;

    const file = brandsFileFor(category);

    const resetMake = (data) => {
        window._sidebarBrandModelData = data;
        const prevBrand = makeSelect.value;
        makeSelect.innerHTML = '<option value="">Vse znamke</option>';
        Object.keys(data).sort().forEach(brand => {
            const o = document.createElement("option");
            o.value = brand;
            o.textContent = brand;
            makeSelect.appendChild(o);
        });
        if (prevBrand && data[prevBrand]) {
            makeSelect.value = prevBrand;
        } else if (modelSelect) {
            modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
            modelSelect.disabled = true;
        }
        initCustomSelects();
        if (typeof onReady === 'function') onReady();
    };

    if (file === _sidebarBrandFile && window._sidebarBrandModelData) {
        resetMake(window._sidebarBrandModelData);
        return;
    }

    _sidebarBrandFile = file;
    fetch(file)
        .then(res => res.json())
        .then(resetMake)
        .catch(err => console.error('[Oglasi] brand file load failed:', file, err));

    if (!window._vehicleLinesData) {
        fetch('/json/vehicle_lines.json')
            .then(res => res.json())
            .then(data => { window._vehicleLinesData = data; })
            .catch(() => {});
    }
}

function updateSidebarHybridGroup() {
    const hibridCheck = document.getElementById("sidebarFuelHibrid");
    const group = document.getElementById("sidebarHybridTypeGroup");
    if (hibridCheck && group) {
        const isChecked = hibridCheck.checked;
        group.style.display = isChecked ? 'flex' : 'none';
        if (!isChecked) {
            group.querySelectorAll("input[type=checkbox]").forEach(cb => {
                if (cb.checked) {
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }
    }
}

function setupLoadMore() {
    let btn = document.getElementById('oglasiLoadMoreBtn');
    if (!btn) {
        const container = document.getElementById('carListingsContainer');
        if (!container) return;
        btn = document.createElement('div');
        btn.id = 'oglasiLoadMoreBtn';
        btn.style.cssText = 'text-align:center;padding:2rem 0;';
        container.insertAdjacentElement('afterend', btn);
    }

    const render = () => {
        if (_hasMore) {
            btn.innerHTML = `<button style="padding:0.75rem 2.5rem;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:9999px;font-size:0.95rem;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(249,115,22,0.3);" id="oglasiLoadMoreInner">Naloži več oglasov</button>`;
            document.getElementById('oglasiLoadMoreInner')?.addEventListener('click', loadMoreListings);
        } else {
            btn.innerHTML = '';
        }
    };

    render();
    window._oglasiRefreshLoadMore = render;
}

async function loadMoreListings() {
    if (_loadingMore || !_hasMore) return;
    _loadingMore = true;

    const btn = document.getElementById('oglasiLoadMoreInner');
    if (btn) { btn.disabled = true; btn.textContent = 'Nalagam...'; }

    try {
        const page = await getListingsPaged({ lastDoc: _lastDoc, pageSize: 24 });
        _lastDoc = page.lastDoc;
        _hasMore = page.hasMore;
        const newItems = page.listings.filter(isPrimaryItem);
        _allActiveListings = [..._allActiveListings, ...newItems];
        // Re-apply current filters to the expanded set
        applySidebarFilters();
    } catch (e) {
        console.error('Failed to load more listings:', e);
    } finally {
        _loadingMore = false;
        if (window._oglasiRefreshLoadMore) window._oglasiRefreshLoadMore();
    }
}

async function initSidebarFiltering() {
    // Show skeleton placeholders while the first page loads.
    const _feedContainer = document.getElementById('carListingsContainer');
    if (_feedContainer) renderLoading(_feedContainer, { skeleton: 'cards', rows: 8, viewMode: currentViewMode });

    // 1. Fetch first page of listings
    try {
        const page = await getListingsPaged({ lastDoc: null, pageSize: 24 });
        _lastDoc = page.lastDoc;
        _hasMore = page.hasMore;
        // Exclude parts & tires — those live under "Gume in deli", not the vehicle feed.
        _allActiveListings = page.listings.filter(isPrimaryItem);
    } catch (e) {
        console.error("Failed to load listings, using SAMPLE_LISTINGS only:", e);
        _allActiveListings = [...SAMPLE_LISTINGS].filter(isPrimaryItem);
    }
    setupLoadMore();

    // 2. Populate fields
    const makeSelect = document.getElementById("sidebarMake");
    const yearFromSelect = document.getElementById("sidebarYearFrom");
    const yearToSelect = document.getElementById("sidebarYearTo");
    if (!makeSelect) return;

    // Years
    const currentYear = new Date().getFullYear();
    yearFromSelect.innerHTML = '<option value="">Od</option>';
    yearToSelect.innerHTML = '<option value="">Do</option>';
    for (let y = currentYear; y >= 1980; y--) {
        const o1 = document.createElement("option"); o1.value = y; o1.textContent = y; yearFromSelect.appendChild(o1);
        const o2 = document.createElement("option"); o2.value = y; o2.textContent = y; yearToSelect.appendChild(o2);
    }

    // Country + Region selects (with localStorage persistence)
    const countrySelect = document.getElementById('sidebarCountry');
    const regionSelect = document.getElementById('sidebarRegion');
    if (countrySelect && regionSelect) {
        const savedCountry = localStorage.getItem(lsKey('filterCountry')) || '';
        const savedRegion = localStorage.getItem(lsKey('filterRegion')) || '';

        // Populate countries
        COUNTRIES.forEach(c => {
            const o = document.createElement('option');
            o.value = c.code;
            o.textContent = c.label;
            countrySelect.appendChild(o);
        });

        const populateRegions = (countryCode, selectValue) => {
            regionSelect.innerHTML = '<option value="">Vse regije</option>';
            if (countryCode) {
                getRegions(countryCode).forEach(r => {
                    const o = document.createElement('option');
                    o.value = r;
                    o.textContent = r;
                    regionSelect.appendChild(o);
                });
                regionSelect.disabled = false;
            } else {
                regionSelect.disabled = true;
            }
            if (selectValue) regionSelect.value = selectValue;
        };

        // Restore saved selection
        if (savedCountry) {
            countrySelect.value = savedCountry;
            populateRegions(savedCountry, savedRegion);
        } else {
            regionSelect.disabled = true;
        }

        // Apply custom select styling
        initCustomSelects();

        countrySelect.addEventListener('change', () => {
            const code = countrySelect.value;
            localStorage.setItem(lsKey('filterCountry'), code);
            localStorage.setItem(lsKey('filterRegion'), '');
            populateRegions(code, '');
            applySidebarFilters();
            updateUrlParamsFromInputs();
        });

        regionSelect.addEventListener('change', () => {
            localStorage.setItem(lsKey('filterRegion'), regionSelect.value);
            applySidebarFilters();
            updateUrlParamsFromInputs();
        });
    }

    // Brands — load the file matching the current category (avto/moto/gospodarska)
    const initialCat = parseHashParams().get('cat') || '';
    loadSidebarBrands(initialCat, () => {
        // Prefill from URL once the initial brand list is ready
        prefillSidebarFromUrl();
    });

    // 3. Bind events
    const modelSelect = document.getElementById("sidebarModel");
    const variantSelect = document.getElementById("sidebarVariant");
    const lineSelect = document.getElementById("sidebarLine");
    const form = document.getElementById("sidebarFiltersForm");
    const resetBtn = document.getElementById("sidebarResetBtn");

    makeSelect.addEventListener("change", () => {
        if (window._isPrefilling) return;
        const brand = makeSelect.value;
        if (!brand) return;

        const params = parseHashParams();
        const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
        const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
        const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
        const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

        if (!selectedMakes.includes(brand)) {
            selectedMakes.push(brand);
            updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines);
        }
    });

    if (modelSelect) {
        modelSelect.addEventListener("change", () => {
            if (window._isPrefilling) return;
            const model = modelSelect.value;
            if (!model) return;

            const params = parseHashParams();
            const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

            if (!selectedModels.includes(model)) {
                selectedModels.push(model);
                updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines);
            }
        });
    }

    if (variantSelect) {
        variantSelect.addEventListener("change", () => {
            if (window._isPrefilling) return;
            const variant = variantSelect.value;
            if (!variant) return;

            const params = parseHashParams();
            const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

            if (!selectedVariants.includes(variant)) {
                selectedVariants.push(variant);
                updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines);
            }
        });
    }

    if (lineSelect) {
        lineSelect.addEventListener("change", () => {
            if (window._isPrefilling) return;
            const line = lineSelect.value;
            if (!line) return;

            const params = parseHashParams();
            const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
            const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

            if (!selectedLines.includes(line)) {
                selectedLines.push(line);
                updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines);
            }
        });
    }

    // Toggle fields visibility based on category
    const params = parseHashParams();
    const cat = params.get('cat');
    const carFields = document.getElementById("carSpecificFields");
    const motoFields = document.getElementById("motoSpecificFields");
    const bodyTypeField = document.getElementById("sidebarBodyType");
    const bodyTypeGroup = bodyTypeField?.closest('.form-group');
    if (carFields && motoFields) {
        if (cat === 'moto' || cat === 'motor') {
            carFields.style.display = 'none';
            carFields.querySelectorAll("input, select").forEach(el => el.disabled = true);
            motoFields.style.display = 'flex';
            motoFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
            if (bodyTypeField) bodyTypeField.disabled = true;
            if (bodyTypeGroup) bodyTypeGroup.style.display = 'none';
        } else {
            carFields.style.display = 'flex';
            carFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
            motoFields.style.display = 'none';
            motoFields.querySelectorAll("input, select").forEach(el => el.disabled = true);
            if (bodyTypeField) bodyTypeField.disabled = false;
            if (bodyTypeGroup) bodyTypeGroup.style.display = 'flex';
        }
    }

    const hibridCheck = document.getElementById("sidebarFuelHibrid");
    if (hibridCheck) {
        hibridCheck.addEventListener("change", updateSidebarHybridGroup);
    }
    if (form) {
        form.querySelectorAll("input, select").forEach(el => {
            if (el !== makeSelect && el !== modelSelect && el !== variantSelect) {
                el.addEventListener("change", () => {
                    applySidebarFilters();
                    updateUrlParamsFromInputs();
                });
                el.addEventListener("input", () => {
                    applySidebarFilters();
                    updateUrlParamsFromInputs();
                });
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (form) {
                form.reset();
                form.querySelectorAll("select").forEach(sel => {
                    sel.value = '';
                    sel.dispatchEvent(new Event('change'));
                });
                updateSidebarHybridGroup();
            }
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
                modelSelect.disabled = true;
            }
            if (variantSelect) {
                variantSelect.innerHTML = '<option value="">Vse različice</option>';
                variantSelect.disabled = true;
            }
            const lineSelectReset = document.getElementById("sidebarLine");
            const lineGroupReset = document.getElementById("sidebarLineGroup");
            if (lineSelectReset) lineSelectReset.innerHTML = '<option value="">Vse linije</option>';
            if (lineGroupReset) lineGroupReset.style.display = 'none';

            // Clear country/region and their localStorage state
            const countrySelectReset = document.getElementById('sidebarCountry');
            const regionSelectReset = document.getElementById('sidebarRegion');
            if (countrySelectReset) countrySelectReset.value = '';
            if (regionSelectReset) {
                regionSelectReset.innerHTML = '<option value="">Vse regije</option>';
                regionSelectReset.disabled = true;
            }
            localStorage.removeItem(lsKey('filterCountry'));
            localStorage.removeItem(lsKey('filterRegion'));

            const params = parseHashParams();
            const cat = params.get('cat');
            window.history.replaceState(null, '', `#/oglasi${cat ? '?cat=' + cat : ''}`);
            applySidebarFilters();
        });
    }

    bindSidebarAccordions();
}

function bindSidebarAccordions() {
    const triggers = document.querySelectorAll('#sidebarFiltersForm .adv-acc-trigger');
    triggers.forEach(trigger => {
        const accordion = trigger.closest('.adv-accordion');
        const body = accordion.querySelector('.adv-acc-body');

        // Set up transition — body is always display:flex, max-height collapses it
        if (body) {
            body.style.overflow = 'hidden';
            body.style.transition = 'max-height 0.28s ease, opacity 0.28s ease';
            body.style.display = 'flex';
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            if (!isOpen) {
                body.style.maxHeight = '0';
                body.style.opacity = '0';
            } else {
                // Defer so the DOM is ready to measure
                requestAnimationFrame(() => {
                    body.style.maxHeight = body.scrollHeight + 'px';
                    body.style.opacity = '1';
                });
            }
        }

        trigger.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-pill-remove') || e.target.closest('.sidebar-active-pill')) {
                return;
            }
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            const ns = !isOpen;
            trigger.setAttribute('aria-expanded', String(ns));

            if (body) {
                if (ns) {
                    // Opening
                    body.style.maxHeight = body.scrollHeight + 'px';
                    body.style.opacity = '1';
                } else {
                    // Closing: snap to exact current height then animate to 0
                    body.style.maxHeight = body.scrollHeight + 'px';
                    requestAnimationFrame(() => requestAnimationFrame(() => {
                        body.style.maxHeight = '0';
                        body.style.opacity = '0';
                    }));
                }
            }
        });
    });
}

function applySidebarFilters() {
    const yearFrom = parseInt(document.getElementById("sidebarYearFrom")?.value, 10) || 0;
    const yearTo = parseInt(document.getElementById("sidebarYearTo")?.value, 10) || Infinity;
    const priceTo = parseFormattedNumber(document.getElementById("sidebarPriceTo")?.value) || Infinity;

    let bodyType = document.getElementById("sidebarBodyType")?.value || '';
    if (!bodyType) {
        const urlParams = parseHashParams();
        bodyType = urlParams.get('bodyType') || urlParams.get('bodyTypes') || '';
    }
    const powerFrom = parseInt(document.getElementById("sidebarPowerFrom")?.value, 10) || 0;
    const powerTo = parseInt(document.getElementById("sidebarPowerTo")?.value, 10) || Infinity;
    const driveType = document.getElementById("sidebarDriveType")?.value || '';

    const engineType = document.getElementById("sidebarEngineType")?.value || '';
    const engineStroke = document.getElementById("sidebarEngineStroke")?.value || '';

    const color = document.getElementById("sidebarColor")?.value || '';
    const sellerType = document.getElementById("sidebarSellerType")?.value || '';
    const country = document.getElementById("sidebarCountry")?.value || '';
    const region = document.getElementById("sidebarRegion")?.value || '';

    // Auction-board facets (present only on #/drazbe).
    const aucType = document.getElementById("sidebarAucType")?.value || '';
    const aucStatus = document.getElementById("sidebarAucStatus")?.value || '';
    const aucBinding = document.getElementById("sidebarAucBinding")?.value || '';
    const aucCash = document.getElementById("sidebarAucCash")?.value || '';

    const onlySale = document.getElementById("sidebarOnlySale")?.checked || false;
    const showNoPrice = document.getElementById("sidebarShowNoPrice")?.checked ?? true;

    const form = document.getElementById("sidebarFiltersForm");
    let fuels = [];
    let transmissions = [];
    if (form) {
        const fd = new FormData(form);
        fuels = fd.getAll("fuel").filter(Boolean);
        transmissions = fd.getAll("transmission").filter(Boolean);
    }

    const params = parseHashParams();
    const cat = params.get('cat');
    const najem = params.get('najem');
    const mileageToParam = parseInt(params.get('mileageTo'), 10) || Infinity;
    const engineHoursFromParam = parseInt(params.get('engineHoursFrom'), 10) || 0;
    const engineHoursToParam = parseInt(params.get('engineHoursTo'), 10) || Infinity;

    const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

    const filtered = _allActiveListings.filter(car => {
        const carCat = (car.category === 'motor' || car.category === 'moto') ? 'moto' : car.category;
        const filterCat = (cat === 'motor' || cat === 'moto') ? 'moto' : cat;
        if (filterCat && carCat !== filterCat) return false;
        if (najem === '1' && !car.isRental) return false;

        if (selectedMakes.length > 0 && !selectedMakes.includes(car.make)) return false;
        if (selectedModels.length > 0 && !selectedModels.includes(car.model)) return false;
        if (selectedVariants.length > 0) {
            const titleStr = (car.title || '').toLowerCase();
            const subtitleStr = (car.subtitle || '').toLowerCase();
            const match = selectedVariants.some(v => {
                const variantLower = v.toLowerCase();
                return titleStr.includes(variantLower) || subtitleStr.includes(variantLower);
            });
            if (!match) return false;
        }

        if (selectedLines.length > 0) {
            const titleStr = (car.title || '').toLowerCase();
            const subtitleStr = (car.subtitle || '').toLowerCase();
            const equipmentStr = (car.equipment || []).join(' ').toLowerCase();
            const match = selectedLines.some(l => {
                const lineLower = l.toLowerCase();
                return titleStr.includes(lineLower) || subtitleStr.includes(lineLower) || equipmentStr.includes(lineLower);
            });
            if (!match) return false;
        }

        const carYear = parseInt(car.year, 10) || 0;
        if (carYear < yearFrom || (yearTo !== Infinity && carYear > yearTo)) return false;

        const carPrice = car.priceRaw || car.priceEur || 0;
        if (carPrice > priceTo) return false;

        const carMileage = car.mileageKm || (parseInt(car.mileage?.replace(/[^0-9]/g, ''), 10) || 0);
        if (carMileage > mileageToParam) return false;

        // Operating hours (machinery). Only listings recording engineHours match.
        if (engineHoursFromParam > 0 || engineHoursToParam !== Infinity) {
            if (car.engineHours == null) return false;
            const carHours = Number(car.engineHours) || 0;
            if (carHours < engineHoursFromParam || carHours > engineHoursToParam) return false;
        }

        if (fuels.length > 0) {
            let normalizedCarFuel = car.fuel;
            if (car.fuel === 'Petrol') normalizedCarFuel = 'Bencin';
            if (car.fuel === 'Diesel') normalizedCarFuel = 'Dizel';
            if (car.fuel === 'Hybrid') normalizedCarFuel = 'Hibrid';
            if (car.fuel === 'Electric') normalizedCarFuel = 'Elektrika';
            if (car.fuel === 'Priključni hibrid') normalizedCarFuel = 'Plug-in hibrid';

            const isMatch = fuels.some(f => {
                if (f === normalizedCarFuel) return true;
                if (normalizedCarFuel === 'Hibrid' || normalizedCarFuel === 'Plug-in hibrid' || normalizedCarFuel === 'Priključni hibrid') {
                    if (f === 'Hibrid') return true;
                    const titleText = ((car.title || '') + ' ' + (car.subtitle || '')).toLowerCase();
                    if (f === 'Plug-in hibrid') {
                        return normalizedCarFuel === 'Plug-in hibrid' || normalizedCarFuel === 'Priključni hibrid' || titleText.includes('plug') || titleText.includes('phev');
                    }
                    if (f === 'Blagi hibrid') {
                        const isPlugin = normalizedCarFuel === 'Plug-in hibrid' || normalizedCarFuel === 'Priključni hibrid' || titleText.includes('plug') || titleText.includes('phev');
                        return !isPlugin;
                    }
                    if (f === 'Bencin hibrid') {
                        return titleText.includes('tsi') || titleText.includes('tfsi') || titleText.includes('bencin') || titleText.includes('petrol') || titleText.includes('i-mmd') || (!titleText.includes('tdi') && !titleText.includes('dci') && !titleText.includes('cdi') && !titleText.includes(' 2.0 d') && !titleText.includes('dizel'));
                    }
                    if (f === 'Dizel hibrid') {
                        return titleText.includes('tdi') || titleText.includes('dci') || titleText.includes('cdi') || titleText.includes('dizel') || titleText.includes('diesel') || titleText.includes(' 2.0 d');
                    }
                }
                return false;
            });
            if (!isMatch) return false;
        }

        if (transmissions.length > 0) {
            let normalizedCarTrans = car.transmission;
            if (car.transmission === 'Manual') normalizedCarTrans = 'Ročni';
            if (car.transmission === 'Automatic') normalizedCarTrans = 'Avtomatski';
            if (!transmissions.includes(normalizedCarTrans)) return false;
        }

        if (bodyType) {
            const selectedBodyTypes = bodyType.split(',').map(t => t.trim());
            const isMatch = selectedBodyTypes.some(type => {
                if (type === 'Damaged') return car.isDamaged || car.condition === 'Poškodovano' || car.damaged === 'only';
                if (type === 'Oldtimer') return car.condition === 'Starodobnik' || (car.year && parseInt(car.year, 10) < 1995);
                if (type === 'EVozila') return ['EMoto', 'ESkiro', 'EKolo'].includes(car.bodyType) || ['EMoto', 'ESkiro', 'EKolo'].includes(car.vehicleType);

                // Exact matching for bodyType or vehicleType
                if (car.bodyType === type || car.vehicleType === type) return true;

                // Heuristic matching for cars (only if cat is avto/car or empty)
                if (cat === 'avto' || cat === 'car' || !cat) {
                    const seg = (car.segment || '').toLowerCase();
                    const title = (car.title || '').toLowerCase();
                    const typeLower = type.toLowerCase();
                    if (typeLower === 'limuzina') {
                        return seg.includes('sedan') || seg.includes('limuzina');
                    } else if (typeLower === 'kombilimuzina') {
                        return seg.includes('hatchback') || seg.includes('kombilimuzina');
                    } else if (typeLower === 'karavan') {
                        return seg.includes('wagon') || seg.includes('karavan') || title.includes('avant') || title.includes('touring') || title.includes('karavan');
                    } else if (typeLower === 'terensko' || typeLower === 'suv') {
                        return seg.includes('suv') || seg.includes('terensko') || seg.includes('crossover');
                    } else if (typeLower === 'enoprostorec') {
                        return seg.includes('minivan') || seg.includes('enoprostorec') || seg.includes('mpv');
                    } else if (typeLower === 'coupe') {
                        return seg.includes('coupe') || title.includes('coupe');
                    } else if (typeLower === 'kabriolet') {
                        return seg.includes('convertible') || seg.includes('cabriolet') || seg.includes('kabriolet') || title.includes('cabrio') || title.includes('kabriolet');
                    } else if (typeLower === 'sportni' || typeLower === 'športni') {
                        return seg.includes('sport') || seg.includes('coupe') || title.includes('sport');
                    } else if (typeLower === 'pick-up') {
                        return seg.includes('pick') || seg.includes('pickup') || title.includes('pick') || title.includes('pickup');
                    } else if (typeLower === 'kombi' || typeLower === 'dostavnik') {
                        return seg.includes('kombi') || seg.includes('dostav') || seg.includes('van');
                    } else if (typeLower === 'drugo') {
                        const commonSegs = ['sedan', 'limuzina', 'hatchback', 'kombilimuzina', 'wagon', 'karavan', 'minivan', 'enoprostorec', 'mpv', 'suv', 'terensko', 'crossover', 'coupe', 'convertible', 'cabriolet', 'kabriolet', 'sport', 'pick', 'kombi', 'dostav', 'van'];
                        return !commonSegs.some(s => seg.includes(s));
                    }
                }

                // Heuristic matching for commercial vehicles (gospodarska)
                if (cat === 'gospodarska') {
                    const seg = (car.segment || '').toLowerCase();
                    const typeLower = type.toLowerCase();
                    
                    // Match main Vrste
                    if (typeLower === 'dostavna' && (seg.includes('dostav') || seg.includes('van'))) return true;
                    if (typeLower === 'tovorna' && (seg.includes('tovorn') || seg.includes('truck') || seg.includes('lorry'))) return true;
                    if (typeLower === 'tovorneprikolice' && (seg.includes('prikolic') || seg.includes('trailer'))) return true;
                    if (typeLower === 'avtobus' && (seg.includes('avtobus') || seg.includes('bus') || seg.includes('coach'))) return true;
                    if (typeLower === 'gradbena' && seg.includes('gradben')) return true;
                    if (typeLower === 'kmetijska' && seg.includes('kmetijsk')) return true;
                    if (typeLower === 'gozdarska' && seg.includes('gozdarsk')) return true;
                    if (typeLower === 'komunalna' && seg.includes('komunaln')) return true;
                    if (typeLower === 'vilicarji' && (seg.includes('viličar') || seg.includes('forklift'))) return true;
                    if (typeLower === 'interventna' && seg.includes('interventn')) return true;
                    if (typeLower === 'letaliska' && seg.includes('letališk')) return true;
                    if (typeLower === 'kamnolom' && seg.includes('kamnolom')) return true;
                    if (typeLower === 'zimska' && seg.includes('zimsk')) return true;

                    // Commercial parent-child taxonomy expansion
                    const commVrsta = COMMERCIAL_BY_KEY[type];
                    if (commVrsta) {
                        return commVrsta.categories.some(catObj => {
                            const catVal = typeof catObj === 'object' ? catObj.value : catObj;
                            return car.bodyType === catVal || car.vehicleType === catVal;
                        });
                    }
                }

                return false;
            });
            if (!isMatch) return false;
        }

        if (cat !== 'moto' && cat !== 'motor') {
            const carPower = car.powerKw || 0;
            if (carPower < powerFrom || (powerTo !== Infinity && carPower > powerTo)) return false;
            if (driveType) {
                const carDrive = (car.driveType || '').toLowerCase();
                if (driveType === 'FWD') {
                    if (!carDrive.includes('spredaj') && !carDrive.includes('fwd')) return false;
                } else if (driveType === 'RWD') {
                    if (!carDrive.includes('zadaj') && !carDrive.includes('rwd')) return false;
                } else if (driveType === 'AWD') {
                    if (!carDrive.includes('4x4') && !carDrive.includes('4matic') && !carDrive.includes('awd') && !carDrive.includes('xdrive') && !carDrive.includes('quattro')) return false;
                }
            }
        }

        if (cat === 'moto' || cat === 'motor') {
            if (engineType) {
                const carEng = (car.engineType || '').toLowerCase();
                const filterEng = engineType.toLowerCase();
                if (filterEng === 'vrstni') {
                    if (!carEng.includes('vrstni') && !carEng.startsWith('i') && !carEng.startsWith('inline')) return false;
                } else if (filterEng === 'v-motor') {
                    if (!carEng.includes('v-') && !carEng.includes('v2') && !carEng.includes('v4')) return false;
                } else if (carEng !== filterEng && !carEng.includes(filterEng)) {
                    return false;
                }
            }
            if (engineStroke && car.engineStroke !== engineStroke) return false;
        }

        if (color) {
            const carColor = (car.color || '').toLowerCase();
            const filterColor = color.toLowerCase();
            if (filterColor === 'drugo') {
                const commonColors = ['bela', 'črna', 'siva', 'srebrna', 'modra', 'rdeča', 'zelena', 'rumena', 'rjava', 'zlata', 'oranžna'];
                if (commonColors.includes(carColor)) return false;
            } else {
                if (carColor !== filterColor && !carColor.includes(filterColor)) return false;
            }
        }

        if (sellerType && car.sellerType !== sellerType) return false;
        if (country) {
            const carCountry = car.location?.country || '';
            if (carCountry !== country) return false;
        }
        if (region) {
            const carRegion = car.location?.region || '';
            if (carRegion !== region) return false;
        }
        if (onlySale && !car.salePriceEur) return false;
        if (!showNoPrice) {
            const hasPrice = (car.priceRaw && car.priceRaw > 0) || (car.priceEur && car.priceEur > 0) || (car.price && car.price.toLowerCase() !== 'po dogovoru' && !car.callForPrice);
            if (!hasPrice) return false;
        }

        // ── Auction facets (type / status / binding sale / cash) ──
        if (car.entryType === 'auction' && (aucType || aucStatus || aucBinding || aucCash)) {
            let type = car.auctionType || 'live';
            if (type === 'regular') type = 'live'; // legacy
            if (aucType && type !== aucType) return false;
            if (aucBinding === 'yes' && !car.auctionBinding) return false;
            if (aucBinding === 'no' && car.auctionBinding) return false;
            if (aucCash === 'yes' && !car.auctionCash) return false;
            if (aucCash === 'no' && car.auctionCash) return false;
            if (aucStatus) {
                const endMs = car.endsAt ? new Date(car.endsAt).getTime() : Infinity;
                const ended = endMs <= Date.now();
                if (aucStatus === 'active' && ended) return false;
                if (aucStatus === 'ended' && !ended) return false;
                if (aucStatus === 'upcoming' && !(type === 'prebid' && !ended)) return false;
            }
        }

        return true;
    });

    renderListings(filtered);
    const countEl = document.querySelector(".results-header h1 span");
    if (countEl) countEl.textContent = `(${filtered.length} vozil)`;
    const mobileCount = document.getElementById('mobileFilterCountBadge');
    if (mobileCount) mobileCount.textContent = filtered.length;
    updateAccordionSummaries();
    updateFiltersUI();
}

function getSidebarFormState() {
    const params = parseHashParams();
    const fields = [
        'yearFrom', 'yearTo', 'priceTo', 'bodyType', 'driveType', 
        'engineType', 'engineStroke', 'color', 'sellerType', 'country', 'region', 
        'powerFrom', 'powerTo'
    ];
    
    fields.forEach(f => {
        const val = document.getElementById(`sidebar${f.charAt(0).toUpperCase() + f.slice(1)}`)?.value;
        if (val) params.set(f, val); else params.delete(f);
    });

    const onlySale = document.getElementById("sidebarOnlySale")?.checked ? 'true' : '';
    const showNoPrice = document.getElementById("sidebarShowNoPrice")?.checked ? 'true' : 'false';
    if (onlySale) params.set('onlySale', onlySale); else params.delete('onlySale');
    if (showNoPrice) params.set('showNoPrice', showNoPrice); else params.delete('showNoPrice');

    const form = document.getElementById("sidebarFiltersForm");
    if (form) {
        const fd = new FormData(form);
        const fuels = fd.getAll("fuel").filter(Boolean);
        const trans = fd.getAll("transmission").filter(Boolean);
        if (fuels.length > 0) params.set('fuel', fuels.join(',')); else params.delete('fuel');
        if (trans.length > 0) params.set('transmission', trans.join(',')); else params.delete('transmission');
    }
    return params;
}

function updateUrlParamsFromInputs() {
    const params = getSidebarFormState();
    const newParams = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${newParams ? '?' + newParams : ''}`);
}

function renderActivePills(containerId, values, onRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!values || values.length === 0) return;
    values.forEach(val => {
        const label = typeof val === 'object' ? val.label : val;
        if (!label) return;
        const pill = document.createElement('span');
        pill.className = 'sidebar-active-pill';
        pill.innerHTML = `${escHtml(label)} <span role="button" tabindex="0" class="sidebar-pill-remove" aria-label="Odstrani">&times;</span>`;
        const removeBtn = pill.querySelector('.sidebar-pill-remove');
        const handleRemove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof val === 'object' && typeof val.onRemove === 'function') {
                val.onRemove();
            } else if (onRemove) {
                onRemove(typeof val === 'object' ? val.value || label : val);
            }
        };
        removeBtn.addEventListener('click', handleRemove);
        removeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleRemove(e);
        });
        container.appendChild(pill);
    });
}

function updateUrlParams(makes, models, variants, lines) {
    const params = getSidebarFormState();
    if (makes && makes.length > 0) params.set('make', makes.join(',')); else params.delete('make');
    if (models && models.length > 0) params.set('model', models.join(',')); else params.delete('model');
    if (variants && variants.length > 0) params.set('variant', variants.join(',')); else params.delete('variant');
    if (lines && lines.length > 0) params.set('line', lines.join(',')); else params.delete('line');
    const paramStr = params.toString();
    window.history.replaceState(null, '', `#/oglasi${paramStr ? '?' + paramStr : ''}`);
    updateFiltersUI();
    applySidebarFilters();
}

function updateAccordionSummaries() {
    const params = parseHashParams();

    // Osnovni podatki: make, model, variant, bodyType, onlySale
    const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];
    const bodyTypeEl = document.getElementById('sidebarBodyType');
    const bodyType = bodyTypeEl?.value || '';
    const onlySale = document.getElementById('sidebarOnlySale')?.checked;
    
    const osnovniItems = [];
    selectedMakes.forEach(mk => {
        osnovniItems.push({
            label: mk,
            onRemove: () => {
                const updated = selectedMakes.filter(x => x !== mk);
                const data = window._sidebarBrandModelData;
                const remainingModels = selectedModels.filter(m => updated.some(k => data?.[k]?.[m]));
                updateUrlParams(updated, remainingModels, selectedVariants, selectedLines);
            }
        });
    });
    selectedModels.forEach(md => {
        osnovniItems.push({
            label: md,
            onRemove: () => {
                updateUrlParams(selectedMakes, selectedModels.filter(x => x !== md), selectedVariants, selectedLines);
            }
        });
    });
    selectedVariants.forEach(vr => {
        osnovniItems.push({
            label: vr,
            onRemove: () => {
                updateUrlParams(selectedMakes, selectedModels, selectedVariants.filter(x => x !== vr), selectedLines);
            }
        });
    });
    selectedLines.forEach(ln => {
        osnovniItems.push({
            label: ln,
            onRemove: () => {
                updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines.filter(x => x !== ln));
            }
        });
    });
    if (bodyType) {
        osnovniItems.push({
            label: bodyType,
            onRemove: () => {
                if (bodyTypeEl) {
                    bodyTypeEl.value = '';
                    bodyTypeEl.dispatchEvent(new Event('change'));
                }
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    if (onlySale) {
        osnovniItems.push({
            label: 'Akcija',
            onRemove: () => {
                const saleEl = document.getElementById('sidebarOnlySale');
                if (saleEl) saleEl.checked = false;
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    _setAccSummary('summaryOsnovni', null, osnovniItems);

    // Cena in letnik: yearFrom, yearTo, priceTo
    const cenaItems = [];
    const yearFromEl = document.getElementById('sidebarYearFrom');
    const yearToEl = document.getElementById('sidebarYearTo');
    const priceToEl = document.getElementById('sidebarPriceTo');
    const yearFrom = yearFromEl?.value;
    const yearTo = yearToEl?.value;
    const priceTo = priceToEl?.value;
    if (yearFrom || yearTo) {
        cenaItems.push({
            label: `${yearFrom || '…'}–${yearTo || '…'}`,
            onRemove: () => {
                if (yearFromEl) yearFromEl.value = '';
                if (yearToEl) yearToEl.value = '';
                if (yearFromEl) yearFromEl.dispatchEvent(new Event('change'));
                if (yearToEl) yearToEl.dispatchEvent(new Event('change'));
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    if (priceTo) {
        cenaItems.push({
            label: `do ${priceTo} €`,
            onRemove: () => {
                if (priceToEl) priceToEl.value = '';
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    _setAccSummary('summaryCena', null, cenaItems);

    // Motor in pogon: fuel checkboxes, transmission, driveType, power, color
    const motorItems = [];
    const form = document.getElementById('sidebarFiltersForm');
    if (form) {
        const fuelCbs = form.querySelectorAll('input[name="fuel"]:checked');
        fuelCbs.forEach(cb => {
            motorItems.push({
                label: cb.value,
                onRemove: () => {
                    cb.checked = false;
                    applySidebarFilters();
                    updateUrlParamsFromInputs();
                    updateFiltersUI();
                }
            });
        });
        const transCbs = form.querySelectorAll('input[name="transmission"]:checked');
        transCbs.forEach(cb => {
            motorItems.push({
                label: cb.value,
                onRemove: () => {
                    cb.checked = false;
                    applySidebarFilters();
                    updateUrlParamsFromInputs();
                    updateFiltersUI();
                }
            });
        });
    }
    const driveTypeEl = document.getElementById('sidebarDriveType');
    if (driveTypeEl?.value) {
        motorItems.push({
            label: driveTypeEl.value,
            onRemove: () => {
                driveTypeEl.value = '';
                driveTypeEl.dispatchEvent(new Event('change'));
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    const powerFromEl = document.getElementById('sidebarPowerFrom');
    const powerToEl = document.getElementById('sidebarPowerTo');
    if (powerFromEl?.value || powerToEl?.value) {
        motorItems.push({
            label: `${powerFromEl?.value || '0'}–${powerToEl?.value || '∞'} kW`,
            onRemove: () => {
                if (powerFromEl) powerFromEl.value = '';
                if (powerToEl) powerToEl.value = '';
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    const colorEl = document.getElementById('sidebarColor');
    if (colorEl?.value) {
        motorItems.push({
            label: colorEl.value,
            onRemove: () => {
                colorEl.value = '';
                colorEl.dispatchEvent(new Event('change'));
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    _setAccSummary('summaryMotor', null, motorItems);

    // Prodajalec: sellerType, country, region
    const prodItems = [];
    const sellerTypeEl = document.getElementById('sidebarSellerType');
    const countryEl = document.getElementById('sidebarCountry');
    const regionEl = document.getElementById('sidebarRegion');
    const sellerType = sellerTypeEl?.value;
    const countryCode = countryEl?.value;
    const region = regionEl?.value;

    if (sellerType) {
        prodItems.push({
            label: sellerType === 'private' ? 'Privat' : 'Trgovec',
            onRemove: () => {
                if (sellerTypeEl) {
                    sellerTypeEl.value = '';
                    sellerTypeEl.dispatchEvent(new Event('change'));
                }
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    if (countryCode) {
        const countryLabel = COUNTRIES.find(c => c.code === countryCode)?.label || countryCode;
        prodItems.push({
            label: countryLabel,
            onRemove: () => {
                if (countryEl) {
                    countryEl.value = '';
                    localStorage.setItem(lsKey('filterCountry'), '');
                    localStorage.setItem(lsKey('filterRegion'), '');
                    if (regionEl) {
                        regionEl.value = '';
                        regionEl.disabled = true;
                        regionEl.innerHTML = '<option value="">Vse regije</option>';
                        regionEl.dispatchEvent(new Event('change'));
                    }
                    countryEl.dispatchEvent(new Event('change'));
                }
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    if (region) {
        prodItems.push({
            label: region,
            onRemove: () => {
                if (regionEl) {
                    regionEl.value = '';
                    localStorage.setItem(lsKey('filterRegion'), '');
                    regionEl.dispatchEvent(new Event('change'));
                }
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    _setAccSummary('summaryProdajalec', null, prodItems);
}

function _setAccSummary(id, _unused, parts) {
    const list = Array.isArray(parts) ? parts : (Array.isArray(_unused) ? _unused : []);
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    if (!list || list.length === 0) {
        el.style.display = 'none';
        return;
    }
    el.style.display = 'inline-flex';
    list.forEach(item => {
        const label = typeof item === 'object' ? item.label : item;
        if (!label) return;
        const pill = document.createElement('span');
        pill.className = 'sidebar-active-pill acc-summary-pill';
        pill.innerHTML = `${escHtml(label)} <span role="button" tabindex="0" class="sidebar-pill-remove" aria-label="Odstrani">&times;</span>`;
        const removeBtn = pill.querySelector('.sidebar-pill-remove');
        const handleRemove = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof item === 'object' && typeof item.onRemove === 'function') {
                item.onRemove();
            }
        };
        removeBtn.addEventListener('click', handleRemove);
        removeBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') handleRemove(e);
        });
        el.appendChild(pill);
    });
}

function updateFiltersUI() {
    updateAccordionSummaries();
    const params = parseHashParams();
    const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedVariants = params.get('variant') ? params.get('variant').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedLines = params.get('line') ? params.get('line').split(',').map(s => s.trim()).filter(Boolean) : [];

    renderActivePills('activeMake', selectedMakes, (val) => {
        const updated = selectedMakes.filter(x => x !== val);
        const data = window._sidebarBrandModelData;
        const remainingModels = selectedModels.filter(m => updated.some(mk => data?.[mk]?.[m]));
        updateUrlParams(updated, remainingModels, selectedVariants, selectedLines);
    });

    renderActivePills('activeModel', selectedModels, (val) => {
        updateUrlParams(selectedMakes, selectedModels.filter(x => x !== val), selectedVariants, selectedLines);
    });

    renderActivePills('activeVariant', selectedVariants, (val) => {
        updateUrlParams(selectedMakes, selectedModels, selectedVariants.filter(x => x !== val), selectedLines);
    });

    renderActivePills('activeLine', selectedLines, (val) => {
        updateUrlParams(selectedMakes, selectedModels, selectedVariants, selectedLines.filter(x => x !== val));
    });

    // Body type (Oblika)
    const bodyTypeEl = document.getElementById('sidebarBodyType');
    renderActivePills('activeBodyType', bodyTypeEl && bodyTypeEl.value ? [bodyTypeEl.value] : [], () => {
        bodyTypeEl.value = '';
        bodyTypeEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Cena & Letnik
    const cenaPills = [];
    const yFromEl = document.getElementById('sidebarYearFrom');
    const yToEl = document.getElementById('sidebarYearTo');
    const pToEl = document.getElementById('sidebarPriceTo');
    if (yFromEl?.value || yToEl?.value) {
        cenaPills.push({
            label: `${yFromEl?.value || '…'}–${yToEl?.value || '…'}`,
            onRemove: () => {
                if (yFromEl) yFromEl.value = '';
                if (yToEl) yToEl.value = '';
                if (yFromEl) yFromEl.dispatchEvent(new Event('change'));
                if (yToEl) yToEl.dispatchEvent(new Event('change'));
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    if (pToEl?.value) {
        cenaPills.push({
            label: `do ${pToEl.value} €`,
            onRemove: () => {
                pToEl.value = '';
                applySidebarFilters();
                updateUrlParamsFromInputs();
                updateFiltersUI();
            }
        });
    }
    renderActivePills('activeCenaLetnik', cenaPills);

    // Drive type (Pogon)
    const driveTypeEl = document.getElementById('sidebarDriveType');
    renderActivePills('activeDriveType', driveTypeEl && driveTypeEl.value ? [driveTypeEl.value] : [], () => {
        driveTypeEl.value = '';
        driveTypeEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Color (Barva)
    const colorEl = document.getElementById('sidebarColor');
    renderActivePills('activeColor', colorEl && colorEl.value ? [colorEl.value] : [], () => {
        colorEl.value = '';
        colorEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Seller type (Tip prodajalca)
    const sellerTypeEl = document.getElementById('sidebarSellerType');
    const sVal = sellerTypeEl?.value;
    const sLabel = sVal ? (sVal === 'private' ? 'Fizična oseba' : 'Trgovec') : null;
    renderActivePills('activeSellerType', sLabel ? [sLabel] : [], () => {
        sellerTypeEl.value = '';
        sellerTypeEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Country (Država)
    const countryEl = document.getElementById('sidebarCountry');
    const cVal = countryEl?.value;
    const cLabel = cVal ? (COUNTRIES.find(c => c.code === cVal)?.label || cVal) : null;
    renderActivePills('activeCountry', cLabel ? [cLabel] : [], () => {
        countryEl.value = '';
        localStorage.setItem(lsKey('filterCountry'), '');
        localStorage.setItem(lsKey('filterRegion'), '');
        const rEl = document.getElementById('sidebarRegion');
        if (rEl) {
            rEl.value = '';
            rEl.disabled = true;
            rEl.innerHTML = '<option value="">Vse regije</option>';
            rEl.dispatchEvent(new Event('change'));
        }
        countryEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Region (Regija)
    const regionEl = document.getElementById('sidebarRegion');
    renderActivePills('activeRegion', regionEl && regionEl.value ? [regionEl.value] : [], () => {
        regionEl.value = '';
        localStorage.setItem(lsKey('filterRegion'), '');
        regionEl.dispatchEvent(new Event('change'));
        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    // Keep open accordions unclipped
    document.querySelectorAll('#sidebarFiltersForm .adv-accordion').forEach(acc => {
        const trigger = acc.querySelector('.adv-acc-trigger');
        const body = acc.querySelector('.adv-acc-body');
        if (trigger?.getAttribute('aria-expanded') === 'true' && body) {
            body.style.maxHeight = 'none';
        }
    });

    const modelSelect = document.getElementById("sidebarModel");
    const variantSelect = document.getElementById("sidebarVariant");
    const lineSelect = document.getElementById("sidebarLine");
    const lineGroup = document.getElementById("sidebarLineGroup");
    const data = window._sidebarBrandModelData;

    if (lineSelect && lineGroup) {
        const linesData = window._vehicleLinesData || {};
        const availableLines = new Set();
        selectedMakes.forEach(mk => {
            (linesData[mk] || []).forEach(l => availableLines.add(l));
        });
        lineSelect.innerHTML = '<option value="">Vse linije</option>';
        Array.from(availableLines).sort().forEach(l => {
            if (!selectedLines.includes(l)) {
                const o = document.createElement("option");
                o.value = l; o.textContent = l;
                lineSelect.appendChild(o);
            }
        });
        const hasLines = availableLines.size > 0 || selectedLines.length > 0;
        lineGroup.style.display = hasLines ? 'flex' : 'none';
    }

    if (modelSelect) {
        modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
        modelSelect.disabled = true;
        if (selectedMakes.length > 0 && data) {
            const allModels = new Set();
            selectedMakes.forEach(mk => Object.keys(data[mk] || {}).forEach(m => allModels.add(m)));
            Array.from(allModels).sort().forEach(m => {
                if (!selectedModels.includes(m)) {
                    const o = document.createElement("option");
                    o.value = m; o.textContent = m;
                    modelSelect.appendChild(o);
                }
            });
            if (allModels.size > 0) modelSelect.disabled = false;
        }
    }

    if (variantSelect) {
        variantSelect.innerHTML = '<option value="">Vse različice</option>';
        variantSelect.disabled = true;
        if (data) {
            const allVariants = new Set();
            const source = (selectedModels.length > 0) ? selectedModels : Object.keys(data[selectedMakes[0]] || {});
            selectedMakes.forEach(mk => {
                selectedModels.forEach(md => {
                    const v = getModelVariants(data[mk]?.[md]);
                    v.forEach(x => x && allVariants.add(typeof x === 'object' ? x.trim : x));
                });
            });
            Array.from(allVariants).sort().forEach(v => {
                if (!selectedVariants.includes(v)) {
                    const o = document.createElement("option");
                    o.value = v; o.textContent = v;
                    variantSelect.appendChild(o);
                }
            });
            if (allVariants.size > 0) variantSelect.disabled = false;
        }
    }
}

function prefillSidebarFromUrl() {
    window._isPrefilling = true;
    const params = parseHashParams();
    
    const fields = ['yearFrom', 'yearTo', 'priceTo', 'bodyType', 'driveType', 'engineType', 'engineStroke', 'color', 'sellerType', 'powerFrom', 'powerTo'];
    fields.forEach(f => {
        const el = document.getElementById(`sidebar${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (el && params.get(f)) {
            el.value = params.get(f);
            el.dispatchEvent(new Event('change'));
        }
    });

    // Country → populate regions → set region
    const countryParam = params.get('country');
    const regionParam = params.get('region');
    const countrySel = document.getElementById('sidebarCountry');
    const regionSel = document.getElementById('sidebarRegion');
    if (countrySel && (countryParam || regionParam)) {
        if (countryParam) {
            countrySel.value = countryParam;
            localStorage.setItem(lsKey('filterCountry'), countryParam);
        }
        const codeToUse = countryParam || countrySel.value;
        if (codeToUse && regionSel) {
            regionSel.innerHTML = '<option value="">Vse regije</option>';
            getRegions(codeToUse).forEach(r => {
                const o = document.createElement('option');
                o.value = r; o.textContent = r;
                regionSel.appendChild(o);
            });
            regionSel.disabled = false;
            if (regionParam) {
                regionSel.value = regionParam;
                localStorage.setItem(lsKey('filterRegion'), regionParam);
            }
        }
    }

    const onlySale = params.get("onlySale");
    const showNoPrice = params.get("showNoPrice");
    if (onlySale && document.getElementById("sidebarOnlySale")) document.getElementById("sidebarOnlySale").checked = onlySale === 'true';
    if (showNoPrice && document.getElementById("sidebarShowNoPrice")) document.getElementById("sidebarShowNoPrice").checked = showNoPrice === 'true';

    const fuel = params.get("fuel");
    if (fuel) {
        const fList = fuel.split(',');
        document.querySelectorAll('#sidebarFiltersForm input[name="fuel"]').forEach(cb => cb.checked = fList.includes(cb.value));
    }

    const trans = params.get("transmission");
    if (trans) {
        const tList = trans.split(',');
        document.querySelectorAll('#sidebarFiltersForm input[name="transmission"]').forEach(cb => cb.checked = tList.includes(cb.value));
    }

    updateSidebarHybridGroup();

    updateFiltersUI();

    applySidebarFilters();

    setTimeout(() => {
        window._isPrefilling = false;
    }, 200);
}

// ── Dražbe sidebar integration ────────────────────────────────────────────────
// Called by drazbe.js after it has fetched auction listings.
// Seeds _allActiveListings with the auction set and wires up the full sidebar UI
// (brand loading, year selects, accordions, events). onRender is called with the
// filtered subset whenever the sidebar changes.
let _drazbeRenderOverride = null;

export function initDrazbeFilters(auctionListings, onRender) {
    _allActiveListings = auctionListings;
    _drazbeRenderOverride = onRender;

    const makeSelect = document.getElementById('sidebarMake');
    const yearFromSelect = document.getElementById('sidebarYearFrom');
    const yearToSelect = document.getElementById('sidebarYearTo');
    if (!makeSelect) return;

    // Populate year selects
    const currentYear = new Date().getFullYear();
    if (yearFromSelect) {
        yearFromSelect.innerHTML = '<option value="">Od</option>';
        for (let y = currentYear; y >= 1980; y--) {
            const o = document.createElement('option'); o.value = y; o.textContent = y;
            yearFromSelect.appendChild(o);
        }
    }
    if (yearToSelect) {
        yearToSelect.innerHTML = '<option value="">Do</option>';
        for (let y = currentYear; y >= 1980; y--) {
            const o = document.createElement('option'); o.value = y; o.textContent = y;
            yearToSelect.appendChild(o);
        }
    }

    // Country + Region
    const countrySelect = document.getElementById('sidebarCountry');
    const regionSelect = document.getElementById('sidebarRegion');
    if (countrySelect && regionSelect) {
        COUNTRIES.forEach(c => {
            const o = document.createElement('option'); o.value = c.code; o.textContent = c.label;
            countrySelect.appendChild(o);
        });
        regionSelect.disabled = true;
        countrySelect.addEventListener('change', () => {
            const code = countrySelect.value;
            regionSelect.innerHTML = '<option value="">Vse regije</option>';
            if (code) {
                getRegions(code).forEach(r => {
                    const o = document.createElement('option'); o.value = r; o.textContent = r;
                    regionSelect.appendChild(o);
                });
                regionSelect.disabled = false;
            } else {
                regionSelect.disabled = true;
            }
            applySidebarFilters();
        });
        regionSelect.addEventListener('change', () => applySidebarFilters());
    }

    // Load brands and wire everything
    loadSidebarBrands('', () => {
        initCustomSelects();
        _wireDrazbeSidebarEvents();
        applySidebarFilters();
    });

    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobileFilterToggle');
    const oglasiSidebar = document.querySelector('.oglasi-sidebar');
    if (mobileFilterToggle && oglasiSidebar) {
        mobileFilterToggle.addEventListener('click', () => {
            const open = oglasiSidebar.classList.toggle('filters-open');
            mobileFilterToggle.classList.toggle('open', open);
            mobileFilterToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));
    bindSidebarAccordions();
    if (window.lucide) window.lucide.createIcons();
}

function _wireDrazbeSidebarEvents() {
    const makeSelect = document.getElementById('sidebarMake');
    const modelSelect = document.getElementById('sidebarModel');
    const form = document.getElementById('sidebarFiltersForm');
    const resetBtn = document.getElementById('sidebarResetBtn');

    if (makeSelect) {
        makeSelect.addEventListener('change', () => {
            if (window._isPrefilling) return;
            const brand = makeSelect.value;
            const data = window._sidebarBrandModelData;
            const modelSelect = document.getElementById('sidebarModel');
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
                if (brand && data?.[brand]) {
                    Object.keys(data[brand]).sort().forEach(m => {
                        const o = document.createElement('option'); o.value = m; o.textContent = m;
                        modelSelect.appendChild(o);
                    });
                    modelSelect.disabled = false;
                } else {
                    modelSelect.disabled = true;
                }
                initCustomSelects();
            }
            applySidebarFilters();
        });
    }

    if (modelSelect) {
        modelSelect.addEventListener('change', () => applySidebarFilters());
    }

    if (form) {
        form.querySelectorAll('input, select').forEach(el => {
            if (el === makeSelect || el === modelSelect) return;
            el.addEventListener('change', () => applySidebarFilters());
            el.addEventListener('input', () => applySidebarFilters());
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (form) form.reset();
            const modelSelect = document.getElementById('sidebarModel');
            if (modelSelect) { modelSelect.innerHTML = '<option value="">Vsi modeli</option>'; modelSelect.disabled = true; }
            const countrySelect = document.getElementById('sidebarCountry');
            const regionSelect = document.getElementById('sidebarRegion');
            if (countrySelect) countrySelect.value = '';
            if (regionSelect) { regionSelect.innerHTML = '<option value="">Vse regije</option>'; regionSelect.disabled = true; }
            applySidebarFilters();
        });
    }
}

export function destroyOglasiPage() {
    if (window._oglasiUnsubscribe) {
        window._oglasiUnsubscribe();
        delete window._oglasiUnsubscribe;
    }
    if (window._oglasiParamsListener) {
        document.removeEventListener('routeParamsChanged', window._oglasiParamsListener);
        delete window._oglasiParamsListener;
    }
}

if (window.lucide) window.lucide.createIcons();
