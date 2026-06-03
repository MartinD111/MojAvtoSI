// Oglasi (Listings Board) page — MojAvto.si
// Renders car listing cards + comparison tray logic

const MAX_COMPARE = 3;
const MAX_NOTE_CHARS = 110;

import { sampleCars } from '../data/sampleListings.js';
import { auth } from '../firebase.js';
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite, getFavourites } from '../services/garageService.js';
import { getListings } from '../services/listingService.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { getCurrentLang } from '../core/i18n.js';

import {
    getFuelPill,
    getPowerPill,
    getConsumptionPill,
    getTransmissionPill,
    getYearPill,
    getKmPill,
    getDisplacementPill,
    formatDisplacement
} from '../utils/listingUtils.js';

import { getVehicleRating } from '../utils/valuationScore.js';
import { getModelVariants } from '../utils/bodyType.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';

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
            ${car.condition ? `<span class="condition-overlay-badge">${car.condition}</span>` : ''}

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
                    <button class="action-pill-btn contact-btn accent grid-contact-btn" data-car-id="${car.id}" title="Contact">
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
                <button class="action-pill-btn contact-btn accent" data-car-id="${car.id}" title="Contact">
                    <i data-lucide="phone"></i>
                </button>
            </div>

            <div class="note-contact-row">
                ${note ? `
                <div class="seller-note-card">
                    <i data-lucide="bell-ring"></i>
                    <span>"${note}"</span>
                </div>
                ` : '<div style="flex: 1;"></div>'}
                <button class="action-pill-btn contact-btn accent list-contact-btn" data-car-id="${car.id}" title="Contact">
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
        localStorage.setItem('mojavto_displacement_unit', unit);
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
        const initialUnit = localStorage.getItem('mojavto_displacement_unit') || 'cc';
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
let currentViewMode = localStorage.getItem('mojavto_viewmode') || 'list';

function applyViewMode(mode) {
    const container = document.getElementById('carListingsContainer');
    if (!container) return;
    currentViewMode = mode;
    localStorage.setItem('mojavto_viewmode', mode);

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
    console.log('[OglasiPage] init, sampleCars count:', sampleCars?.length);

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

async function initSidebarFiltering() {
    // 1. Fetch all listings
    try {
        const userListings = await getListings();
        // Exclude parts & tires — those live under "Gume in deli", not the vehicle feed.
        _allActiveListings = [...sampleCars, ...userListings].filter(l => !l.itemType || l.itemType === 'vehicle');
    } catch (e) {
        console.error("Failed to load user listings, using sampleCars only:", e);
        _allActiveListings = sampleCars;
    }

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

    // Brands
    fetch("json/brands_models_global.json")
      .then(res => res.json())
      .then(data => {
          window._sidebarBrandModelData = data;
          makeSelect.innerHTML = '<option value="">Vse znamke</option>';
          Object.keys(data).sort().forEach(brand => {
              const o = document.createElement("option");
              o.value = brand;
              o.textContent = brand;
              makeSelect.appendChild(o);
          });

          // Sync custom selects once populated
          initCustomSelects();

          // Prefill from URL
          prefillSidebarFromUrl();
      });

    // 3. Bind events
    const modelSelect = document.getElementById("sidebarModel");
    const variantSelect = document.getElementById("sidebarVariant");
    const form = document.getElementById("sidebarFiltersForm");
    const resetBtn = document.getElementById("sidebarResetBtn");

    makeSelect.addEventListener("change", () => {
        const data = window._sidebarBrandModelData;
        const brand = makeSelect.value;
        modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
        modelSelect.disabled = true;
        
        if (variantSelect) {
            variantSelect.innerHTML = '<option value="">Vse različice</option>';
            variantSelect.disabled = true;
        }

        if (brand && data && data[brand]) {
            const models = data[brand];
            const keys = typeof models === 'object' && !Array.isArray(models) ? Object.keys(models).sort() : (Array.isArray(models) ? models.sort() : []);
            keys.forEach(m => {
                const o = document.createElement("option");
                o.value = m;
                o.textContent = m;
                modelSelect.appendChild(o);
            });
            if (keys.length) modelSelect.disabled = false;
        }

        // Notify custom select to update
        modelSelect.dispatchEvent(new Event('change'));
        if (variantSelect) variantSelect.dispatchEvent(new Event('change'));
        applySidebarFilters();
    });

    if (modelSelect) {
        modelSelect.addEventListener("change", () => {
            const data = window._sidebarBrandModelData;
            const brand = makeSelect.value;
            const model = modelSelect.value;
            
            if (variantSelect) {
                variantSelect.innerHTML = '<option value="">Vse različice</option>';
                variantSelect.disabled = true;
                
                if (brand && model && data && data[brand]) {
                    const variants = getModelVariants(data[brand][model]);
                    variants.forEach(v => {
                        const trim = typeof v === 'string' ? v : (v && v.trim) ? v.trim : '';
                        if (!trim) return;
                        const o = document.createElement("option");
                        o.value = trim;
                        o.textContent = trim;
                        variantSelect.appendChild(o);
                    });
                    if (variants.length) variantSelect.disabled = false;
                }
                
                variantSelect.dispatchEvent(new Event('change'));
            }
            applySidebarFilters();
        });
    }

    if (variantSelect) {
        variantSelect.addEventListener("change", () => {
            if (window._isPrefilling) {
                applySidebarFilters();
                return;
            }
            
            const make = makeSelect.value;
            const model = modelSelect.value;
            const variant = variantSelect.value;
            
            if (make && model && variant) {
                const params = parseHashParams();
                let vehicles = [];
                try {
                    const vRaw = params.get('vehicles');
                    if (vRaw) {
                        vehicles = JSON.parse(vRaw);
                        if (!Array.isArray(vehicles)) vehicles = [];
                    }
                } catch(e) {}
                
                vehicles.push({ make, model, variant });
                
                // Clear selection dropdowns
                makeSelect.value = '';
                makeSelect.dispatchEvent(new Event('change'));
                
                params.set('vehicles', JSON.stringify(vehicles));
                params.delete('make');
                params.delete('model');
                params.delete('variant');
                
                const paramStr = params.toString();
                window.location.hash = `/oglasi${paramStr ? '?' + paramStr : ''}`;
            } else {
                applySidebarFilters();
            }
        });
    }

    if (form) {
        form.querySelectorAll("input, select").forEach(el => {
            if (el !== makeSelect && el !== modelSelect && el !== variantSelect) {
                el.addEventListener("change", applySidebarFilters);
                el.addEventListener("input", applySidebarFilters);
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (form) form.reset();
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
                modelSelect.disabled = true;
                modelSelect.dispatchEvent(new Event('change'));
            }
            if (variantSelect) {
                variantSelect.innerHTML = '<option value="">Vse različice</option>';
                variantSelect.disabled = true;
                variantSelect.dispatchEvent(new Event('change'));
            }
            if (makeSelect) makeSelect.dispatchEvent(new Event('change'));
            
            // Clear URL search params as well, except category context
            const params = parseHashParams();
            const cat = params.get('cat');
            window.location.hash = `/oglasi${cat ? '?cat=' + cat : ''}`;
        });
    }
}

function applySidebarFilters() {
    const make = document.getElementById("sidebarMake")?.value || '';
    const model = document.getElementById("sidebarModel")?.value || '';
    const variant = document.getElementById("sidebarVariant")?.value || '';
    const yearFrom = parseInt(document.getElementById("sidebarYearFrom")?.value, 10) || 0;
    const yearTo = parseInt(document.getElementById("sidebarYearTo")?.value, 10) || Infinity;
    const priceTo = parseFormattedNumber(document.getElementById("sidebarPriceTo")?.value) || Infinity;

    // Parse multi-select checkboxes for fuel and transmission
    const form = document.getElementById("sidebarFiltersForm");
    let fuels = [];
    let transmissions = [];
    if (form) {
        const fd = new FormData(form);
        fuels = fd.getAll("fuel").filter(Boolean);
        transmissions = fd.getAll("transmission").filter(Boolean);
    }

    // Check category context from URL
    const params = parseHashParams();
    const cat = params.get('cat');
    const najem = params.get('najem');
    const variantParam = params.get('variant');
    const mileageToParam = parseInt(params.get('mileageTo'), 10) || Infinity;

    // Parse multi-vehicle search array
    let vehiclesParam = [];
    try {
        const vRaw = params.get('vehicles');
        if (vRaw) {
            vehiclesParam = JSON.parse(vRaw);
            if (!Array.isArray(vehiclesParam)) vehiclesParam = [];
        }
    } catch(e) {
        console.warn("Failed to parse vehicles query parameter:", e);
    }

    const filtered = _allActiveListings.filter(car => {
        const carCat = (car.category === 'motor' || car.category === 'moto') ? 'moto' : car.category;
        const filterCat = (cat === 'motor' || cat === 'moto') ? 'moto' : cat;
        if (filterCat && carCat !== filterCat) return false;
        if (najem === '1' && !car.isRental) return false;

        // Vehicle (Make / Model / Variant) filtering:
        // Rule: If sidebar selection for make is not empty, use sidebar selections.
        // Otherwise, if the URL contains 'vehicles' array, match against any of them.
        // Otherwise, if URL contains 'make' or 'model', match against those (and optionally 'variant' from URL).
        if (make) {
            if (car.make !== make) return false;
            if (model && car.model !== model) return false;
            
            // If the user selected a variant in the sidebar, filter by it.
            // Otherwise, filter by variantParam from the URL if it matches.
            if (variant) {
                const titleStr = (car.title || '').toLowerCase();
                const subtitleStr = (car.subtitle || '').toLowerCase();
                const variantLower = variant.toLowerCase();
                if (!titleStr.includes(variantLower) && !subtitleStr.includes(variantLower)) return false;
            } else {
                const urlMake = params.get('make');
                const urlModel = params.get('model');
                if (make === urlMake && (!urlModel || model === urlModel) && variantParam) {
                    const titleStr = (car.title || '').toLowerCase();
                    const subtitleStr = (car.subtitle || '').toLowerCase();
                    const variantLower = variantParam.toLowerCase();
                    if (!titleStr.includes(variantLower) && !subtitleStr.includes(variantLower)) return false;
                }
            }
        } else {
            if (vehiclesParam.length > 0) {
                const match = vehiclesParam.some(v => {
                    if (v.make && car.make !== v.make) return false;
                    if (v.model && car.model !== v.model) return false;
                    if (v.variant) {
                        const titleStr = (car.title || '').toLowerCase();
                        const subtitleStr = (car.subtitle || '').toLowerCase();
                        const vLower = v.variant.toLowerCase();
                        if (!titleStr.includes(vLower) && !subtitleStr.includes(vLower)) return false;
                    }
                    return true;
                });
                if (!match) return false;
            } else {
                const urlMake = params.get('make');
                const urlModel = params.get('model');
                if (urlMake && car.make !== urlMake) return false;
                if (urlModel && car.model !== urlModel) return false;
                if (variantParam) {
                    const titleStr = (car.title || '').toLowerCase();
                    const subtitleStr = (car.subtitle || '').toLowerCase();
                    const variantLower = variantParam.toLowerCase();
                    if (!titleStr.includes(variantLower) && !subtitleStr.includes(variantLower)) return false;
                }
            }
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
            if (!fuels.includes(normalizedCarFuel)) return false;
        }
        if (transmissions.length > 0 && !transmissions.includes(car.transmission)) return false;

        return true;
    });

    renderListings(filtered);

    // Update count in header
    const countEl = document.querySelector(".results-header h1 span");
    if (countEl) {
        countEl.textContent = `(${filtered.length} vozil)`;
    }
}

function renderSidebarVehicleCards(vehicles) {
    const container = document.getElementById("sidebarVehicleCards");
    if (!container) return;
    
    if (!vehicles || vehicles.length === 0) {
        container.innerHTML = "";
        return;
    }
    
    container.innerHTML = vehicles.map((v, i) => {
        const parts = [v.make];
        if (v.model) parts.push(v.model);
        if (v.variant) parts.push(v.variant);
        return `
            <div class="vehicle-entry-card" style="margin-bottom:0.25rem;">
                <div class="vec-info">
                    ${parts.map(p => `<span>${p}</span>`).join('<span class="vec-sep">›</span>')}
                </div>
                <button type="button" class="vec-remove" data-idx="${i}">&times;</button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.vec-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            vehicles.splice(idx, 1);
            
            // Update URL hash with updated vehicles
            const params = parseHashParams();
            if (vehicles.length > 0) {
                params.set('vehicles', JSON.stringify(vehicles));
            } else {
                params.delete('vehicles');
            }
            const paramStr = params.toString();
            window.location.hash = `/oglasi${paramStr ? '?' + paramStr : ''}`;
        });
    });
}

function prefillSidebarFromUrl() {
    window._isPrefilling = true;
    const params = parseHashParams();
    const make = params.get("make");
    const model = params.get("model");
    const variant = params.get("variant");
    const yearFrom = params.get("yearFrom");
    const yearTo = params.get("yearTo");
    const priceTo = params.get("priceTo");
    const fuel = params.get("fuel");
    const transmission = params.get("transmission");

    // Parse and render multi-vehicle search array
    let vehicles = [];
    try {
        const vRaw = params.get('vehicles');
        if (vRaw) {
            vehicles = JSON.parse(vRaw);
            if (!Array.isArray(vehicles)) vehicles = [];
        }
    } catch(e) {
        console.warn("Failed to parse vehicles query parameter:", e);
    }
    renderSidebarVehicleCards(vehicles);

    const makeSelect = document.getElementById("sidebarMake");
    const modelSelect = document.getElementById("sidebarModel");
    const variantSelect = document.getElementById("sidebarVariant");
    const yearFromSelect = document.getElementById("sidebarYearFrom");
    const yearToSelect = document.getElementById("sidebarYearTo");
    const priceToInput = document.getElementById("sidebarPriceTo");

    if (make && makeSelect) {
        makeSelect.value = make;
        makeSelect.dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            if (model && modelSelect) {
                modelSelect.value = model;
                modelSelect.dispatchEvent(new Event('change'));
                
                setTimeout(() => {
                    if (variant && variantSelect) {
                        variantSelect.value = variant;
                        variantSelect.dispatchEvent(new Event('change'));
                    }
                    applySidebarFilters();
                }, 50);
            }
        }, 50);
    }
    if (yearFrom && yearFromSelect) {
        yearFromSelect.value = yearFrom;
        yearFromSelect.dispatchEvent(new Event('change'));
    }
    if (yearTo && yearToSelect) {
        yearToSelect.value = yearTo;
        yearToSelect.dispatchEvent(new Event('change'));
    }
    if (priceTo && priceToInput) {
        priceToInput.value = priceTo;
    }

    if (fuel) {
        const fuels = fuel.split(',').map(f => {
            if (f === 'Petrol') return 'Bencin';
            return f;
        });
        const fuelCheckboxes = document.querySelectorAll('#sidebarFiltersForm input[name="fuel"]');
        fuelCheckboxes.forEach(cb => {
            cb.checked = fuels.includes(cb.value);
        });
    }

    if (transmission) {
        const transList = transmission.split(',');
        const transCheckboxes = document.querySelectorAll('#sidebarFiltersForm input[name="transmission"]');
        transCheckboxes.forEach(cb => {
            cb.checked = transList.includes(cb.value);
        });
    }

    // Only apply immediately if make is not present (as make sets off a async populate chain)
    if (!make) {
        applySidebarFilters();
    }

    setTimeout(() => {
        window._isPrefilling = false;
    }, 200);
}

export function destroyOglasiPage() {
    if (window._oglasiUnsubscribe) {
        window._oglasiUnsubscribe();
        delete window._oglasiUnsubscribe;
    }
    unmountSidebarFilters();
}

if (window.lucide) window.lucide.createIcons();
