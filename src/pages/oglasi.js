// Oglasi (Listings Board) page — MojAvto.si
// Renders car listing cards + comparison tray logic

const MAX_COMPARE = 3;
const MAX_NOTE_CHARS = 110;

import { sampleCars } from '../data/sampleListings.js';
import { auth } from '../firebase.js';
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite, getFavourites } from '../services/garageService.js';
// import { useSearchStore } from '../store/useSearchStore.js'; // TODO: module not yet created
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import AdvancedSearch from './AdvancedSearch.jsx'; // TODO: component not yet created

import {
    getFuelPill,
    getPowerPill,
    getConsumptionPill,
    getTransmissionPill,
    getYearPill,
    getKmPill
} from '../utils/listingUtils.js';

import { getVehicleRating } from '../utils/valuationScore.js';

// ── Render star SVG (sm size, inline) ────────────────────────
function renderStarBadge(stars) {
    const dim = 13;
    const color = 'var(--color-primary-start, #f59e0b)';
    let svgs = '';
    for (let i = 1; i <= 5; i++) {
        const fill = stars >= i ? 'full' : stars >= i - 0.5 ? 'half' : 'empty';
        const fc = fill === 'empty' ? '#374151' : color;
        const gradId = `sg-${i}-${Math.random().toString(36).slice(2, 6)}`;
        if (fill === 'half') {
            svgs += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" fill="none" style="display:block"><defs><linearGradient id="${gradId}"><stop offset="50%" stop-color="${color}"/><stop offset="50%" stop-color="#374151"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#${gradId})"/></svg>`;
        } else {
            svgs += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" style="display:block"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${fc}"/></svg>`;
        }
    }
    return `<div style="display:inline-flex;align-items:center;gap:1px;">${svgs}</div>`;
}

// ── Power unit toggle ────────────────────────────────────────
let currentPowerUnit = 'kw';

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
    if (label) label.textContent = unit === 'kw' ? 'show in HP' : 'show in kW';
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
        return { score: 2, label: 'Average price', color: 'amber' };
    }

    const avgPrice = comps.reduce((s, c) => s + c.priceRaw, 0) / comps.length;
    const ratio = car.priceRaw / avgPrice;

    if (ratio <= 0.88) return { score: 3, label: 'Great price', color: 'green' };
    if (ratio <= 1.08) return { score: 2, label: 'Average price', color: 'amber' };
    return { score: 1, label: 'Above average', color: 'red' };
}

// ── Comparison State ─────────────────────────────────────────
let compareList = [];
try {
    compareList = JSON.parse(localStorage.getItem('mojavto_compare') || '[]');
    if (!Array.isArray(compareList)) compareList = [];
} catch (e) {
    console.error('[Oglasi] Failed to parse comparison list from localStorage:', e);
    compareList = [];
}

function saveCompareState() {
    try {
        localStorage.setItem('mojavto_compare', JSON.stringify(compareList));
    } catch (e) {
        console.error('[Oglasi] Failed to save comparison state:', e);
    }
}

function isInCompare(carId) {
    return compareList.some(c => c.id === carId);
}

function addToCompare(car) {
    if (compareList.length >= MAX_COMPARE) {
        alert(`Lahko primerjate največ ${MAX_COMPARE} vozila naenkrat.`);
        return false;
    }
    if (isInCompare(car.id)) return false;
    const rating = getPriceRating(car, sampleCars);
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
    let user = auth.currentUser;

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
        userFavouritesCache.delete(carId);
    } else {
        btn.classList.add('active');
        userFavouritesCache.add(carId);
    }

    btn.disabled = true;
    try {
        if (liked) {
            await removeFromFavourites(user.uid, carId);
        } else {
            await addToFavourites(user.uid, car);
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
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const favs = await getFavourites(user.uid);
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
function renderCarCard(car) {
    const inCompare = isInCompare(car.id);
    // Display logic: 1st exterior and 1st interior if available, otherwise first 2 images
    let displayImages = [];
    if (car.images) {
        if (car.images.exterior?.[0]) displayImages.push(car.images.exterior[0]);
        if (car.images.interior?.[0]) {
            displayImages.push(car.images.interior[0]);
        } else if (car.images.exterior?.[1]) {
            displayImages.push(car.images.exterior[1]);
        }
    }
    if (displayImages.length === 0) displayImages.push(car.image || '/images/car-placeholder.png');
    
    // Ensure unique images and limit to 2 for the board view
    const images = [...new Set(displayImages)].slice(0, 2);

    try {
        const rating = getPriceRating(car, sampleCars);

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
        const allListingsShape = (sampleCars || []).map(c => ({
            ...c,
            year: parseInt(c.year, 10) || 0,
            priceEur: c.priceRaw,
            equipment: c.equipment || [],
        }));
        const vRating = getVehicleRating(listingShape, allListingsShape);
        const showStars = vRating && vRating.confidence !== 'low';

        const note = car.sellerNote
            ? (car.sellerNote.length > MAX_NOTE_CHARS
                ? car.sellerNote.slice(0, MAX_NOTE_CHARS) + '…'
                : car.sellerNote)
            : null;

        return `
    <div class="listing-card" data-car-id="${car.id}">
        <!-- Image Container -->
        <div class="listing-card-img" data-current-idx="0">
            <div class="carousel-track">
                ${images.map(img => `<img src="${img}" alt="${car.title}" loading="lazy">`).join('')}
            </div>
            
            ${car.isNew ? '<span class="badge-new-pill overlay">NEW</span>' : ''}
            
            ${images.length > 1 ? `
                <div class="listing-carousel-dots">
                    ${images.map((_, i) => `<span class="mini-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                </div>
                <button class="carousel-btn prev" aria-label="Previous image">
                    <i data-lucide="chevron-left"></i>
                </button>
                <button class="carousel-btn next" aria-label="Next image">
                    <i data-lucide="chevron-right"></i>
                </button>
            ` : ''}
        </div>

        <!-- Content Area -->
        <div class="listing-card-content">
            <div class="listing-card-header">
                <div class="car-info">
                    <h2 class="listing-card-title">${car.title}</h2>
                    <span class="spec-pill condition-pill">${car.condition}</span>
                </div>
                
                <div class="car-price-box">
                    <span class="price-value">${car.price}</span>
                    ${showStars
                        ? `<span class="price-rating" title="${vRating.label} · ${vRating.priceSignal}">${renderStarBadge(vRating.stars)}</span>`
                        : `<span class="price-rating rating-${rating.color}">${rating.label}</span>`
                    }
                </div>
            </div>

            <div class="listing-card-action-bar">
                <div class="primary-specs">
                    ${getYearPill(car.year)}
                    ${getKmPill(car.mileage)}
                    ${getPowerPill(car.powerKw)}
                </div>

                <div class="listing-card-actions">
                    <button class="action-pill-btn listing-fav-btn ${userFavouritesCache.has(car.id) ? 'active' : ''}" data-car-id="${car.id}" title="Save to favorites">
                        <i data-lucide="heart"></i>
                    </button>
                    <button class="action-pill-btn listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${car.id}" title="Compare">
                        <i data-lucide="scale"></i>
                    </button>
                </div>
            </div>

            <div class="listing-card-specs">
                <div class="spec-row secondary">
                    <div class="spec-group-left">
                        ${getFuelPill(car.fuel)}
                        ${getTransmissionPill(car.transmission)}
                        ${getConsumptionPill(car)}
                    </div>
                </div>
            </div>

            <div class="note-contact-row">
                ${note ? `
                <div class="seller-note-card">
                    <i data-lucide="bell-ring"></i>
                    <span>"${note}"</span>
                </div>
                ` : '<div style="flex: 1;"></div>'}
                <button class="action-pill-btn contact-btn accent" data-car-id="${car.id}" onclick="showContactPopup('${car.id}'); event.stopPropagation();" title="Contact">
                    <i data-lucide="phone"></i>
                </button>
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
    const car = sampleCars.find(c => c.id === carId);
    if (!car) return;

    const overlay = document.createElement('div');
    overlay.className = 'contact-popup-overlay active';
    overlay.innerHTML = `
        <div class="contact-popup-card">
            <button class="close-btn">
                <i data-lucide="x"></i>
            </button>
            <div class="contact-popup-header">
                <img src="${car.sellerImage}" class="seller-avatar">
                <h3 class="seller-name">${car.seller}</h3>
                <p class="seller-type-label">${car.sellerType === 'dealer' ? 'Authorized Dealer' : 'Private Seller'}</p>
            </div>
            <div class="contact-popup-info-box">
                <div class="contact-row">
                    <i data-lucide="map-pin" class="row-icon"></i>
                    <span class="row-text">${typeof car.location === 'object' ? car.location.city : car.location}</span>
                </div>
                <div class="contact-row">
                    <i data-lucide="phone" class="row-icon"></i>
                    <span class="row-text">+1 (555) 123-4567</span>
                </div>
                <div class="contact-row">
                    <i data-lucide="mail" class="row-icon"></i>
                    <span class="row-text">info@mojavto.com</span>
                </div>

                ${car.sellerType === 'dealer' && car.openingHours ? `
                <div class="contact-popup-footer-row">
                    <i data-lucide="clock" class="footer-row-icon"></i>
                    <div>
                        <p class="footer-row-label">Business Hours</p>
                        <p class="footer-row-value">${car.openingHours}</p>
                    </div>
                </div>` : ''}

                ${car.sellerType !== 'dealer' && car.sellerNote ? `
                <div class="contact-popup-footer-row">
                    <i data-lucide="info" class="footer-row-icon"></i>
                    <div>
                        <p class="footer-row-label">Seller Note</p>
                        <p class="footer-row-value">${car.sellerNote}</p>
                    </div>
                </div>` : ''}
            </div>
            <button class="pill-btn primary w-full">Send Message</button>
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
    const container = document.getElementById('carListingsContainer');
    if (!container) return;
    container.innerHTML = cars.map(renderCarCard).join('');

    if (window.lucide) window.lucide.createIcons();
    applyPowerUnit(currentPowerUnit);

    // Card click → navigate to listing
    container.querySelectorAll('.listing-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.pill-btn') || e.target.closest('.action-pill-btn') ||
                e.target.closest('.action-circle-btn') ||
                e.target.closest('.carousel-btn') || e.target.closest('.carousel-dots')) return;
            window.location.hash = `#/oglas?id=${card.getAttribute('data-car-id')}`;
        });
    });

    // Contact buttons
    container.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const carId = btn.getAttribute('data-car-id');
            showContactPopup(carId);
        });
    });

    // Favourite buttons
    container.querySelectorAll('.listing-fav-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const carId = btn.getAttribute('data-car-id');
            const car = cars.find(c => c.id === carId);
            if (!car) return;
            await toggleFavourite(btn, carId, car);
        });
    });

    // Compare buttons
    container.querySelectorAll('.listing-compare-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.stopPropagation();
            const carId = btn.getAttribute('data-car-id');
            const user = auth.currentUser;

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

            const car = cars.find(c => c.id === carId);
            if (!car) return;

            if (isInCompare(carId)) {
                removeFromCompare(carId);
                btn.classList.remove('active');
            } else {
                const added = addToCompare(car);
                if (added) btn.classList.add('active');
            }
            if (window.updateHeaderCompare) window.updateHeaderCompare();
        });
    });

    // Carousel
    container.querySelectorAll('.listing-card-img').forEach(imageWrapper => {
        const track = imageWrapper.querySelector('.carousel-track');
        const dots = imageWrapper.querySelectorAll('.mini-dot');
        const prevBtn = imageWrapper.querySelector('.carousel-btn.prev');
        const nextBtn = imageWrapper.querySelector('.carousel-btn.next');
        const imagesCount = imageWrapper.querySelectorAll('img').length;

        if (imagesCount <= 1) return;
        let currentIdx = 0;

        function updateCarousel() {
            if (track) track.style.transform = `translateX(-${currentIdx * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIdx));
        }

        prevBtn?.addEventListener('click', e => {
            e.stopPropagation();
            currentIdx = (currentIdx - 1 + imagesCount) % imagesCount;
            updateCarousel();
        });
        nextBtn?.addEventListener('click', e => {
            e.stopPropagation();
            currentIdx = (currentIdx + 1) % imagesCount;
            updateCarousel();
        });
    });

    // Async: mark already-favourited cars
    checkFavouriteStates();
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

    overlay.style.display = 'none';
}

// ── Sidebar React mount (single root, safe to call repeatedly) ───────────────
let _sidebarRoot = null;

function mountSidebarFilters() {
    const container = document.getElementById('react-sidebar-filters-root');
    if (!container) return;

    if (!_sidebarRoot) {
        _sidebarRoot = ReactDOM.createRoot(container);
    }
    _sidebarRoot.render(
        React.createElement(AdvancedSearch, { variant: 'sidebar', compact: true })
    );
}

function unmountSidebarFilters() {
    if (_sidebarRoot) {
        _sidebarRoot.unmount();
        _sidebarRoot = null;
    }
}

// ── Filter listings with current store state ─────────────────────────────────
function applyStoreFilters() {
    const { filters } = useSearchStore.getState();
    const { brand, model, price, year, fuel } = filters;

    const filtered = sampleCars.filter(car => {
        if (brand.length && !brand.includes(car.make)) return false;
        if (model && car.model !== model) return false;
        const carYear = parseInt(car.year, 10) || 0;
        if (carYear < year.min || carYear > year.max) return false;
        const carPrice = car.priceRaw || 0;
        if (carPrice < price.min || carPrice > price.max) return false;
        if (fuel.length && !fuel.includes(car.fuel)) return false;
        return true;
    });

    renderListings(filtered);
}

function parseHashParams() {
    const hash = window.location.hash.slice(1) || '/';
    const qIndex = hash.indexOf('?');
    if (qIndex === -1) return new URLSearchParams();
    return new URLSearchParams(hash.slice(qIndex + 1));
}

function applyUrlFilters(params) {
    const cat = params.get('cat');
    const make = params.get('make');
    const model = params.get('model');
    const yearFrom = parseInt(params.get('yearFrom'), 10) || 0;
    const priceTo = parseInt(params.get('priceTo'), 10) || Infinity;
    const mileageTo = parseInt(params.get('mileageTo'), 10) || Infinity;

    const filtered = sampleCars.filter(car => {
        if (cat && car.category !== cat) return false;
        if (make && car.make !== make) return false;
        if (model && car.model !== model) return false;
        
        const carYear = parseInt(car.year, 10) || 0;
        if (carYear < yearFrom) return false;
        
        const carPrice = car.priceRaw || 0;
        if (carPrice > priceTo) return false;
        
        const carMileage = car.mileageKm || (parseInt(car.mileage?.replace(/[^0-9]/g, ''), 10) || 0);
        if (carMileage > mileageTo) return false;
        
        return true;
    });

    renderListings(filtered);
}

// ── View Mode ────────────────────────────────────────────────
function applyViewMode(mode) {
    const container = document.getElementById('carListingsContainer');
    if (!container) return;
    container.classList.toggle('grid-layout', mode === 'grid');
    container.classList.toggle('list-layout', mode === 'list');

    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === mode);
    });
}

function initViewToggle() {
    const { viewMode } = useSearchStore.getState();
    applyViewMode(viewMode);

    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            useSearchStore.getState().setViewMode(btn.dataset.view);
        });
    });
}

// ── Page Init ────────────────────────────────────────────────
export function initOglasiPage() {
    console.log('[OglasiPage] init, sampleCars count:', sampleCars?.length);

    const container = document.getElementById('carListingsContainer');
    if (!container) {
        console.error('[OglasiPage] carListingsContainer NOT FOUND!');
    }

    // Mount React sidebar filters
    // mountSidebarFilters(); // TODO: module not yet created

    // Parse URL parameters for initial filtering
    const params = parseHashParams();
    if (params.size > 0) {
        applyUrlFilters(params);
    } else if (sampleCars && sampleCars.length > 0) {
        renderListings(sampleCars);
    } else {
        console.warn('[OglasiPage] No sampleCars found to render');
        if (container) container.innerHTML = '<p class="no-results">Ni oglasov za prikaz.</p>';
    }

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

    // Mobile filter toggle
    const mobileToggle = document.getElementById('mobileFilterToggle');
    const filtersCard = document.getElementById('filtersCard');
    const chevron = document.getElementById('mobileFilterChevron');

    if (mobileToggle && filtersCard) {
        mobileToggle.addEventListener('click', () => {
            filtersCard.classList.toggle('mobile-open');
            if (chevron) {
                chevron.style.transform = filtersCard.classList.contains('mobile-open')
                    ? 'rotate(180deg)' : '';
            }
        });
    }

    // Payment toggle
    document.querySelectorAll('.payment-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-toggle button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    initLegendPopup();

    if (window.lucide) window.lucide.createIcons();
}

export function destroyOglasiPage() {
    if (window._oglasiUnsubscribe) {
        window._oglasiUnsubscribe();
        delete window._oglasiUnsubscribe;
    }
    unmountSidebarFilters();
}

if (window.lucide) window.lucide.createIcons();
