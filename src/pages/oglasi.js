// Oglasi (Listings Board) page — MojAvto.si
// Renders car listing cards + comparison tray logic

const MAX_COMPARE = 3;

import { SAMPLE_LISTINGS } from '../data/sampleListings.js';
import { PLATFORM } from '../config/platform.js';
import { auth } from '../firebase.js';

// itemTypes shown on the main listings board for the active platform.
const PRIMARY_ITEM_TYPES = PLATFORM.id === 'navtika' ? ['plovilo', 'motor'] : ['vehicle'];
const isPrimaryItem = l => PRIMARY_ITEM_TYPES.includes(l.itemType) || (PLATFORM.id !== 'navtika' && !l.itemType);
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite, getFavourites } from '../services/garageService.js';
import { getListings, getListingsPaged } from '../services/listingService.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { getCurrentLang } from '../core/i18n.js';
import { key as lsKey } from '../config/storageKeys.js';
import { brandsFileFor } from '../data/brandFiles.js';

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
        alert(`Lahko primerjate največ ${MAX_COMPARE} vozila naenkrat.`);
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
        <div class="listing-card-img" data-current-idx="0">
            <div class="carousel-track">
                ${images.map(img => `<img src="${img}" alt="${car.title}" loading="lazy">`).join('')}
            </div>
            
            ${car.isNew ? '<span class="badge-new-pill overlay">NEW</span>' : ''}
            ${car.condition ? `<span class="condition-overlay-badge" data-condition="${car.condition}">${car.condition}</span>` : ''}

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
                    <h2 class="listing-card-title vehicle-title">
                        <span class="vehicle-title-make-model">${car.make || car.title} ${car.make ? (car.model || '') : ''}</span>
                        ${(car.make && car.variant) ? `<span class="vehicle-title-variant">${car.variant}</span>` : ''}
                    </h2>
                    <span class="spec-pill condition-pill">${car.condition}</span>
                </div>
                
                <div class="car-price-box">
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                        <span class="price-value">${car.price}</span>
                        ${car.salePriceEur ? `
                        <span class="discount-tag-icon" title="Znižana cena">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                                <line x1="7" y1="7" x2="7.01" y2="7"/>
                            </svg>
                        </span>` : ''}
                    </div>
                    ${renderRatingBadgeCard(starRating, ratingTitle)}
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
                    <button class="action-pill-btn contact-btn grid-contact-btn" data-car-id="${car.id}" title="Contact">
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

            <!-- Compact action row shown on 13-inch screens (below secondary specs) -->
            <div class="listing-card-bottom-actions">
                <button class="action-pill-btn listing-fav-btn ${userFavouritesCache.has(car.id) ? 'active' : ''}" data-car-id="${car.id}" title="Save to favorites">
                    <i data-lucide="heart"></i>
                </button>
                <button class="action-pill-btn listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${car.id}" title="Compare">
                    <i data-lucide="scale"></i>
                </button>
                <button class="action-pill-btn contact-btn" data-car-id="${car.id}" title="Contact">
                    <i data-lucide="phone"></i>
                </button>
            </div>

            <div class="note-contact-row">
                ${car.location?.city ? `
                <div class="seller-note-card">
                    <i data-lucide="map-pin"></i>
                    <span>${car.location.city}${car.location.region ? ', ' + car.location.region : ''}</span>
                </div>
                ` : '<div style="flex: 1;"></div>'}
                <button class="action-pill-btn contact-btn list-contact-btn" data-car-id="${car.id}" title="Contact">
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

                ${car.sellerNote ? `
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

        // Touch swipe support
        let touchStartX = 0;
        imageWrapper.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        imageWrapper.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) < 30) return;
            e.stopPropagation();
            currentIdx = dx < 0
                ? (currentIdx + 1) % imagesCount
                : (currentIdx - 1 + imagesCount) % imagesCount;
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

    const filtered = SAMPLE_LISTINGS.filter(car => {
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
    localStorage.setItem(lsKey('viewmode'), mode);

    container.classList.toggle('grid-layout', mode === 'grid');
    container.classList.toggle('list-layout', mode === 'list');

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

    // Initialize dynamic sidebar filters (handles loading user listings, population, prefill & events)
    initSidebarFiltering();

    // Setup numeric formatters
    document.querySelectorAll('.js-format-number').forEach(input => setupNumericFormatter(input));


    if (window.updateHeaderCompare) window.updateHeaderCompare();

    // Initialize Grid/List view toggle with persistent settings
    initViewToggle();

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

    if (window.lucide) window.lucide.createIcons();
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
        trigger.addEventListener('click', () => {
            const accordion = trigger.closest('.adv-accordion');
            const body = accordion.querySelector('.adv-acc-body');
            const isOpen = trigger.getAttribute('aria-expanded') === 'true';
            const ns = !isOpen;
            trigger.setAttribute('aria-expanded', String(ns));
            if (body) {
                body.style.display = ns ? 'flex' : 'none';
            }
        });
    });
}

function applySidebarFilters() {
    const yearFrom = parseInt(document.getElementById("sidebarYearFrom")?.value, 10) || 0;
    const yearTo = parseInt(document.getElementById("sidebarYearTo")?.value, 10) || Infinity;
    const priceTo = parseFormattedNumber(document.getElementById("sidebarPriceTo")?.value) || Infinity;

    const bodyType = document.getElementById("sidebarBodyType")?.value || '';
    const powerFrom = parseInt(document.getElementById("sidebarPowerFrom")?.value, 10) || 0;
    const powerTo = parseInt(document.getElementById("sidebarPowerTo")?.value, 10) || Infinity;
    const driveType = document.getElementById("sidebarDriveType")?.value || '';

    const engineType = document.getElementById("sidebarEngineType")?.value || '';
    const engineStroke = document.getElementById("sidebarEngineStroke")?.value || '';

    const color = document.getElementById("sidebarColor")?.value || '';
    const sellerType = document.getElementById("sidebarSellerType")?.value || '';
    const region = document.getElementById("sidebarRegion")?.value || '';

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

        if (cat !== 'moto' && cat !== 'motor') {
            if (bodyType) {
                const seg = (car.segment || '').toLowerCase();
                const title = (car.title || '').toLowerCase();
                const bodyLower = bodyType.toLowerCase();
                if (bodyLower === 'limuzina') {
                    if (!seg.includes('sedan') && !seg.includes('limuzina')) return false;
                } else if (bodyLower === 'karavan') {
                    if (!seg.includes('wagon') && !seg.includes('karavan') && !title.includes('avant') && !title.includes('touring') && !title.includes('karavan')) return false;
                } else if (bodyLower === 'enoprostorec') {
                    if (!seg.includes('minivan') && !seg.includes('enoprostorec') && !seg.includes('mpv')) return false;
                } else if (bodyLower === 'suv') {
                    if (!seg.includes('suv') && !seg.includes('terensko') && !seg.includes('crossover')) return false;
                } else if (bodyLower === 'coupe') {
                    if (!seg.includes('coupe') && !title.includes('coupe')) return false;
                } else if (bodyLower === 'kabriolet') {
                    if (!seg.includes('convertible') && !seg.includes('cabriolet') && !seg.includes('kabriolet') && !title.includes('cabrio') && !title.includes('kabriolet')) return false;
                } else if (bodyLower === 'kombi' || bodyLower === 'dostavnik') {
                    if (!seg.includes('kombi') && !seg.includes('dostav') && !seg.includes('van')) return false;
                } else if (bodyLower === 'drugo') {
                    const commonSegs = ['sedan', 'limuzina', 'wagon', 'karavan', 'minivan', 'enoprostorec', 'mpv', 'suv', 'terensko', 'crossover', 'coupe', 'convertible', 'cabriolet', 'kabriolet', 'kombi', 'dostav', 'van'];
                    if (commonSegs.some(s => seg.includes(s))) return false;
                }
            }
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
        if (region) {
            const carRegion = car.location?.region || '';
            if (carRegion !== region) return false;
        }
        if (onlySale && !car.salePriceEur) return false;
        if (!showNoPrice) {
            const hasPrice = (car.priceRaw && car.priceRaw > 0) || (car.priceEur && car.priceEur > 0) || (car.price && car.price.toLowerCase() !== 'po dogovoru' && !car.callForPrice);
            if (!hasPrice) return false;
        }

        return true;
    });

    renderListings(filtered);
    const countEl = document.querySelector(".results-header h1 span");
    if (countEl) countEl.textContent = `(${filtered.length} vozil)`;
}

function getSidebarFormState() {
    const params = parseHashParams();
    const fields = [
        'yearFrom', 'yearTo', 'priceTo', 'bodyType', 'driveType', 
        'engineType', 'engineStroke', 'color', 'sellerType', 'region', 
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
    const hash = window.location.hash.split('?')[0];
    const newParams = params.toString();
    window.history.replaceState(null, '', `${hash}${newParams ? '?' + newParams : ''}`);
}

function renderActivePills(containerId, values, onRemove) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    values.forEach(val => {
        const pill = document.createElement('span');
        pill.className = 'sidebar-active-pill';
        pill.innerHTML = `${val} <button type="button" class="sidebar-pill-remove" aria-label="Odstrani">&times;</button>`;
        pill.querySelector('.sidebar-pill-remove').addEventListener('click', (e) => {
            e.preventDefault();
            onRemove(val);
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

function updateFiltersUI() {
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
    
    const fields = ['yearFrom', 'yearTo', 'priceTo', 'bodyType', 'driveType', 'engineType', 'engineStroke', 'color', 'sellerType', 'region', 'powerFrom', 'powerTo'];
    fields.forEach(f => {
        const el = document.getElementById(`sidebar${f.charAt(0).toUpperCase() + f.slice(1)}`);
        if (el && params.get(f)) el.value = params.get(f);
    });

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

export function destroyOglasiPage() {
    if (window._oglasiUnsubscribe) {
        window._oglasiUnsubscribe();
        delete window._oglasiUnsubscribe;
    }
    if (window._oglasiParamsListener) {
        document.removeEventListener('routeParamsChanged', window._oglasiParamsListener);
        delete window._oglasiParamsListener;
    }
    unmountSidebarFilters();
}

if (window.lucide) window.lucide.createIcons();
