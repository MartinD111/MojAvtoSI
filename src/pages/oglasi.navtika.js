// Oglasi (Listings Board) page — MojAvto.si
// Renders car listing cards + comparison tray logic

const MAX_COMPARE = 3;
const MAX_NOTE_CHARS = 110;

import { SAMPLE_LISTINGS } from '../data/sampleListings.js';
import { PLATFORM } from '../config/platform.js';
import { MAIN_CATEGORIES } from '../data/categories.navtika.js';
import { auth } from '../firebase.js';

// itemTypes shown on the main listings board for the active platform.
const PRIMARY_ITEM_TYPES = PLATFORM.id === 'navtika' ? ['plovilo', 'motor'] : ['vehicle'];
const isPrimaryItem = l => PRIMARY_ITEM_TYPES.includes(l.itemType) || (PLATFORM.id !== 'navtika' && !l.itemType);
import { showAuthGate } from '../utils/authGate.js';
import { addToFavourites, removeFromFavourites, isFavourite, getFavourites } from '../services/garageService.js';
import { getListings } from '../services/listingService.js';
import { initCustomSelects } from '../utils/customSelect.js';
import { getCurrentLang, t } from '../core/i18n.js';
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

function getCategoryLabel(cat, lang) {
    if (!cat) return '';
    const slMap = {
        'colni': 'Čoln',
        'jadrnice': 'Jadrnica',
        'gumenjaki': 'Gumenjak',
        'jet-ski': 'Jet-ski',
        'izvenkrmni-motorji': 'Izvenkrmni motor',
        'oprema': 'Oprema'
    };
    const enMap = {
        'colni': 'Boat',
        'jadrnice': 'Sailboat',
        'gumenjaki': 'RIB / Inflatable',
        'jet-ski': 'Jet-Ski',
        'izvenkrmni-motorji': 'Outboard Engine',
        'oprema': 'Equipment'
    };
    return lang === 'sl' ? (slMap[cat] || cat) : (enMap[cat] || cat);
}

function getSubcategoryLabel(sub, lang) {
    if (!sub) return '';
    const slMap = {
        'motorni-coln': 'Motorni čoln',
        'jahte': 'Jahta',
        'jadrnica': 'Jadrnica',
        'katamaran': 'Katamaran',
        'rib': 'RIB',
        'mehki-gumenjak': 'Mehki gumenjak',
        'enotrupci': 'Enotrupna',
        'sportni': 'Športni',
        'dnevni-cruiser': 'Dnevni cruiser'
    };
    const enMap = {
        'motorni-coln': 'Motorboat',
        'jahte': 'Yacht',
        'jadrnica': 'Sailboat',
        'katamaran': 'Catamaran',
        'rib': 'RIB',
        'mehki-gumenjak': 'Inflatable',
        'enotrupci': 'Monohull',
        'sportni': 'Sport',
        'dnevni-cruiser': 'Day Cruiser'
    };
    return lang === 'sl' ? (slMap[sub] || sub) : (enMap[sub] || sub);
}

function getEngineMountLabel(mount, lang) {
    if (!mount) return '';
    const slMap = {
        'izvenkrmni': 'Izvenkrmni',
        'krmni': 'Krmni',
        'notranji': 'Notranji',
        'jadrni': 'Jadrni'
    };
    const enMap = {
        'izvenkrmni': 'Outboard',
        'krmni': 'Sterndrive',
        'notranji': 'Inboard',
        'jadrni': 'Saildrive'
    };
    return lang === 'sl' ? (slMap[mount.toLowerCase()] || mount) : (enMap[mount.toLowerCase()] || mount);
}

function getHullMaterialLabel(material, lang) {
    if (!material) return '';
    const slMap = {
        'stekloplastika': 'Stekloplastika',
        'aluminij': 'Aluminij',
        'jeklo': 'Jeklo',
        'les': 'Les',
        'pvc': 'PVC',
        'politeh': 'Politeh'
    };
    const enMap = {
        'stekloplastika': 'Fiberglass',
        'aluminij': 'Aluminum',
        'jeklo': 'Steel',
        'les': 'Wood',
        'pvc': 'PVC',
        'politeh': 'Polytec'
    };
    return lang === 'sl' ? (slMap[material.toLowerCase()] || material) : (enMap[material.toLowerCase()] || material);
}

function getEngineMake(car) {
    if (car.engineMake) return car.engineMake;
    if (car.itemType === 'motor' && car.make) return car.make;
    const text = `${car.title} ${car.subtitle}`.toLowerCase();
    const makes = ['volvo penta', 'mercury', 'yamaha', 'yanmar', 'suzuki', 'honda', 'tohatsu', 'evinrude', 'rotax', 'man', 'mercruiser', 'caterpillar', 'cummins'];
    for (const m of makes) {
        if (text.includes(m)) {
            if (m === 'volvo penta') return 'Volvo Penta';
            if (m === 'mercruiser') return 'MerCruiser';
            return m.charAt(0).toUpperCase() + m.slice(1);
        }
    }
    return '';
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

        const note = car.sellerNote
            ? (car.sellerNote.length > MAX_NOTE_CHARS
                ? car.sellerNote.slice(0, MAX_NOTE_CHARS) + '…'
                : car.sellerNote)
            : null;

            // Build the vessel-specific secondary pills
            const lang = getCurrentLang();
            
            // 1. Boat Category / Type
            let boatTypePill = '';
            const categoryLabel = getCategoryLabel(car.category, lang);
            const subcategoryLabel = getSubcategoryLabel(car.subcategory, lang);
            if (categoryLabel) {
                let text = categoryLabel;
                if (subcategoryLabel && subcategoryLabel !== categoryLabel) {
                    text = `${categoryLabel} (${subcategoryLabel})`;
                }
                boatTypePill = `<div class="spec-pill category-pill" title="${lang === 'sl' ? 'Tip plovila' : 'Boat Type'}">
                    <i data-lucide="ship"></i>
                    <span>${text}</span>
                </div>`;
            }

            // 2. Fuel Type
            const fuelPill = getFuelPill(car); // standard helper

            // 3. Engine Mount Type
            let mountPill = '';
            if (car.engineMountType) {
                const mountLabel = getEngineMountLabel(car.engineMountType, lang);
                mountPill = `<div class="spec-pill mount-pill" title="${lang === 'sl' ? 'Tip pogona' : 'Engine Mount'}">
                    <i data-lucide="cpu"></i>
                    <span>${mountLabel}</span>
                </div>`;
            }

            // 4. Hull Material
            let hullPill = '';
            if (car.hullMaterial) {
                const hullLabel = getHullMaterialLabel(car.hullMaterial, lang);
                hullPill = `<div class="spec-pill hull-pill" title="${lang === 'sl' ? 'Material trupa' : 'Hull Material'}">
                    <i data-lucide="anchor"></i>
                    <span>${hullLabel}</span>
                </div>`;
            }

            // 5. Engine Manufacturer
            let engineMakePill = '';
            const engineMake = getEngineMake(car);
            if (engineMake) {
                engineMakePill = `<div class="spec-pill engine-make-pill" title="${lang === 'sl' ? 'Znamka motorja' : 'Engine Make'}">
                    <i data-lucide="cog"></i>
                    <span>${engineMake}</span>
                </div>`;
            }

            // 6. Cabins / Berths
            let cabinsBerthsPill = '';
            if (car.cabins || car.berths) {
                const cabinsPart = car.cabins ? (lang === 'sl' ? `${car.cabins} kab.` : `${car.cabins} cab.`) : '';
                const berthsPart = car.berths ? (lang === 'sl' ? `${car.berths} lež.` : `${car.berths} berths`) : '';
                const text = [cabinsPart, berthsPart].filter(Boolean).join(' / ');
                cabinsBerthsPill = `<div class="spec-pill berths-pill" title="${lang === 'sl' ? 'Kabine / ležišča' : 'Cabins / Berths'}">
                    <i data-lucide="bed"></i>
                    <span>${text}</span>
                </div>`;
            }

            const kw = car.enginePowerKw || car.powerKw || (car.enginePowerHp ? Math.round(car.enginePowerHp / 1.34102) : (car.powerHp ? Math.round(car.powerHp / 1.34102) : null));

            return `
    <div class="listing-card" data-car-id="${car.id}">
        <!-- Image Container -->
        <div class="listing-card-img" data-current-idx="0">
            <div class="carousel-track">
                ${images.map(img => `<img src="${img}" alt="${car.title}" loading="lazy">`).join('')}
            </div>
            
            ${car.isNew ? '<span class="badge-new-pill overlay">NEW</span>' : ''}
            ${car.isRental
                ? `<span class="rental-overlay-badge">${lang === 'sl' ? 'Najem' : 'Rental'}${car.skipperOptional ? (lang === 'sl' ? ' · skipper opcijsko' : ' · skipper optional') : ''}</span>`
                : (car.condition ? `<span class="condition-overlay-badge">${car.condition}</span>` : '')}

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
                    <h2 class="listing-card-title navtika-title">
                        <span class="navtika-title-make">${car.make || car.title}</span>
                        ${(car.variant || car.model) ? `<span class="navtika-title-model">${car.variant || car.model}</span>` : ''}
                    </h2>
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
                    ${car.lengthM ? `<div class="spec-pill length-pill" title="${lang === 'sl' ? 'Dolžina' : 'Length'}"><i data-lucide="arrow-right-left"></i><span>${car.lengthM} m</span></div>` : ''}
                    ${car.engineHours !== undefined ? `<div class="spec-pill hours-pill" title="${lang === 'sl' ? 'Ure motorja' : 'Engine Hours'}"><i data-lucide="clock"></i><span>${car.engineHours} ur</span></div>` : ''}
                    ${getPowerPill(kw)}
                </div>
            </div>

            <div class="listing-card-specs">
                <div class="spec-row secondary">
                    <div class="spec-group-left">
                        ${boatTypePill}
                        ${fuelPill}
                        ${mountPill}
                        ${hullPill}
                        ${engineMakePill}
                        ${cabinsBerthsPill}
                    </div>
                </div>
            </div>

            <div class="note-contact-row">
                <div class="navtika-card-location">
                    ${car.location?.city ? `
                    <i data-lucide="map-pin"></i>
                    <span>${car.location.region || car.location.city || ''}</span>
                    ` : ''}
                </div>
                <div class="navtika-card-actions">
                    <button class="action-pill-btn listing-fav-btn ${userFavouritesCache.has(car.id) ? 'active' : ''}" data-car-id="${car.id}" title="Save to favorites">
                        <i data-lucide="heart"></i>
                    </button>
                    <button class="action-pill-btn listing-compare-btn ${inCompare ? 'active' : ''}" data-car-id="${car.id}" title="Compare">
                        <i data-lucide="scale"></i>
                    </button>
                    <button class="action-pill-btn contact-btn list-contact-btn" data-car-id="${car.id}" title="Contact">
                        <i data-lucide="phone"></i>
                    </button>
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
                <img src="${car.sellerImage}" class="seller-avatar">
                <h3 class="seller-name">${car.seller}</h3>
                <p class="seller-type-label">${car.sellerType === 'dealer' ? 'Authorized Dealer' : 'Private Seller'}</p>
            </div>
            <div class="contact-popup-info-box">
                <div class="contact-row">
                    <i data-lucide="map-pin" class="row-icon"></i>
                    <span class="row-text">${typeof car.location === 'object' ? (car.location.region || car.location.city || '') : car.location}</span>
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
export function initNavtikaOglasiPage() {
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
            else if (val === 'length-asc') sorted.sort((a, b) => (a.lengthM ?? Infinity) - (b.lengthM ?? Infinity));
            renderListings(sorted);
        });
    }

    // When only URL params change (filter updates from external navigation), re-apply filters.
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

/**
 * Loads the brands/models JSON appropriate for the given category and repopulates
 * the make select. On navtika this is plovila vs izvenkrmni; the file is resolved
 * centrally via brandsFileFor() so create-listing, home search and the board agree.
 */
function loadSidebarBrands(category, onReady) {
    const makeSelect = document.getElementById("sidebarMake");
    const modelSelect = document.getElementById("sidebarModel");
    if (!makeSelect) return;

    const file = brandsFileFor(category);

    // Reset dependent selects whenever we (re)load brands.
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
        // Keep the previously selected brand only if it still exists in the new list.
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
        .catch(err => console.error('[OglasiNavtika] brand file load failed:', file, err));
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

async function initSidebarFiltering() {
    // 1. Fetch all listings
    try {
        const userListings = await getListings();
        // Exclude parts & tires — those live under "Gume in deli", not the vehicle feed.
        _allActiveListings = [...SAMPLE_LISTINGS, ...userListings].filter(isPrimaryItem);
    } catch (e) {
        console.error("Failed to load user listings, using SAMPLE_LISTINGS only:", e);
        _allActiveListings = SAMPLE_LISTINGS;
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

    // Brands — load the file matching the current boat type (plovila vs izvenkrmni)
    const initialCat = parseHashParams().get('cat') || document.getElementById("sidebarBoatType")?.value || '';
    loadSidebarBrands(initialCat, () => {
        // Prefill from URL once the initial brand list is ready
        prefillSidebarFromUrl();
    });

    // Populate engine make dropdown from taxonomy
    const engineMakeSel = document.getElementById('sidebarEngineMake');
    if (engineMakeSel && engineMakeSel.options.length <= 1) {
        fetch('json/brands_models_izvenkrmni.json')
            .then(r => r.ok ? r.json() : {})
            .then(data => {
                Object.keys(data).sort((a, b) => a.localeCompare(b, 'sl')).forEach(brand => {
                    const o = document.createElement('option');
                    o.value = brand; o.textContent = brand;
                    engineMakeSel.appendChild(o);
                });
                // Re-prefill after options are loaded
                const urlVal = parseHashParams().get('engineMake');
                if (urlVal) engineMakeSel.value = urlVal;
            })
            .catch(() => {});
    }

    // 3. Bind events
    const modelSelect = document.getElementById("sidebarModel");
    const variantSelect = document.getElementById("sidebarVariant");
    const form = document.getElementById("sidebarFiltersForm");
    const resetBtn = document.getElementById("sidebarResetBtn");

    const boatTypeSelect = document.getElementById("sidebarBoatType");
    const boatSubcatSelect = document.getElementById("sidebarBoatSubcat");

    // Populate boat type select from taxonomy — labels from i18n like advanced search
    if (boatTypeSelect) {
        const typeOptions = Object.values(MAIN_CATEGORIES).map(cat =>
            `<option value="${cat.slug}">${t(cat.label)}</option>`
        ).join('');
        boatTypeSelect.innerHTML = '<option value="">Vsi tipi</option>' + typeOptions;
    }

    // Helper: populate vehicle types for a given boat type
    const populateVtypes = (catSlug) => {
        if (!boatSubcatSelect) return;
        const vtypes = vtypesForCategory(catSlug);
        boatSubcatSelect.innerHTML = '<option value="">Vse vrste</option>' +
            vtypes.map(vt => `<option value="${vt.value}">${t(vt.label)}</option>`).join('');
        boatSubcatSelect.disabled = vtypes.length === 0;
    };

    // Pre-populate based on initial cat value (e.g. from URL)
    const initialCatForVtype = parseHashParams().get('cat') || boatTypeSelect?.value || '';
    populateVtypes(initialCatForVtype);

    if (boatTypeSelect && boatSubcatSelect) {
        boatTypeSelect.addEventListener("change", () => {
            const val = boatTypeSelect.value;

            populateVtypes(val);
            boatSubcatSelect.value = '';

            // Reload the brand list for this boat type (izvenkrmni motors have their
            // own manufacturer list; all vessel types share the plovila list).
            loadSidebarBrands(val, () => applySidebarFilters());

            applySidebarFilters();
            if (!window._isPrefilling) updateUrlParamsFromInputs();
        });

        boatSubcatSelect.addEventListener("change", () => {
            applySidebarFilters();
            if (!window._isPrefilling) updateUrlParamsFromInputs();
        });
    }

    makeSelect.addEventListener("change", () => {
        if (window._isPrefilling) return;
        const brand = makeSelect.value;

        // Populate model select from taxonomy JSON
        const data = window._sidebarBrandModelData;
        if (modelSelect) {
            modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
            if (brand && data && data[brand]) {
                const models = typeof data[brand] === 'object' && !Array.isArray(data[brand])
                    ? Object.keys(data[brand]).sort()
                    : (Array.isArray(data[brand]) ? data[brand].sort() : []);
                models.forEach(m => {
                    const o = document.createElement('option');
                    o.value = m; o.textContent = m;
                    modelSelect.appendChild(o);
                });
                modelSelect.disabled = models.length === 0;
            } else {
                modelSelect.disabled = true;
            }
        }
        if (variantSelect) {
            variantSelect.innerHTML = '<option value="">Vse različice</option>';
            variantSelect.disabled = true;
        }

        applySidebarFilters();
        updateUrlParamsFromInputs();
        updateFiltersUI();
    });

    if (modelSelect) {
        modelSelect.addEventListener("change", () => {
            if (window._isPrefilling) return;
            const model = modelSelect.value;

            // Populate variant select from taxonomy JSON
            if (variantSelect) {
                const data = window._sidebarBrandModelData;
                const brand = makeSelect?.value;
                const rawVariants = (model && data && brand && data[brand]?.[model])
                    ? getModelVariants(data[brand][model])
                    : [];
                const variants = rawVariants.map(v => typeof v === 'object' ? v.trim : v).filter(Boolean).sort();
                variantSelect.innerHTML = '<option value="">Vse različice</option>' +
                    variants.map(v => `<option value="${v}">${v}</option>`).join('');
                variantSelect.disabled = variants.length === 0;
            }

            applySidebarFilters();
            updateUrlParamsFromInputs();
            updateFiltersUI();
        });
    }

    if (variantSelect) {
        variantSelect.addEventListener("change", () => {
            if (window._isPrefilling) return;
            applySidebarFilters();
            updateUrlParamsFromInputs();
            updateFiltersUI();
        });
    }

    // Toggle fields visibility based on category
    const params = parseHashParams();
    const cat = params.get('cat');
    const carFields = document.getElementById("carSpecificFields");
    const motoFields = document.getElementById("motoSpecificFields");
    if (carFields && motoFields) {
        if (cat === 'moto' || cat === 'motor') {
            carFields.style.display = 'none';
            carFields.querySelectorAll("input, select").forEach(el => el.disabled = true);
            motoFields.style.display = 'flex';
            motoFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
        } else {
            carFields.style.display = 'flex';
            carFields.querySelectorAll("input, select").forEach(el => el.disabled = false);
            motoFields.style.display = 'none';
            motoFields.querySelectorAll("input, select").forEach(el => el.disabled = true);
        }
    }

    const hibridCheck = document.getElementById("sidebarFuelHibrid");
    if (hibridCheck) {
        hibridCheck.addEventListener("change", updateSidebarHybridGroup);
    }

    if (form) {
        form.querySelectorAll("input, select").forEach(el => {
            if (el !== makeSelect && el !== modelSelect && el !== variantSelect && el !== boatTypeSelect && el !== boatSubcatSelect) {
                if (el.id === 'sidebarProdajaToggle' || el.id === 'sidebarNajemToggle') {
                    el.addEventListener("change", () => {
                        applySidebarFilters();
                        updateUrlParamsFromInputs();
                    });
                } else {
                    el.addEventListener("change", () => {
                        applySidebarFilters();
                        updateUrlParamsFromInputs();
                    });
                    el.addEventListener("input", () => {
                        applySidebarFilters();
                        updateUrlParamsFromInputs();
                    });
                }
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
                form.querySelectorAll("input[type=checkbox]").forEach(cb => {
                    cb.checked = false;
                });
                // Restore default offer type checks
                const prodajaToggle = document.getElementById("sidebarProdajaToggle");
                if (prodajaToggle) prodajaToggle.checked = true;
                
                updateSidebarHybridGroup();
            }
            if (modelSelect) {
                modelSelect.innerHTML = '<option value="">Vsi modeli</option>';
                modelSelect.disabled = true;
            }
            if (makeSelect) {
                makeSelect.value = '';
            }
            if (boatSubcatSelect) {
                boatSubcatSelect.innerHTML = '<option value="">Vse kategorije</option>';
                boatSubcatSelect.disabled = true;
            }
            
            const params = parseHashParams();
            const cat = params.get('cat');
            window.location.hash = `/oglasi${cat ? '?cat=' + cat : ''}`;
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

// ── Active filter pills ───────────────────────────────────────────────────────
// ── Active filter pills ───────────────────────────────────────────────────────
function makePill(label, onRemove) {
    const span = document.createElement('span');
    span.className = 'sidebar-active-pill';
    span.innerHTML = `${label} <button type="button" class="sidebar-pill-remove" aria-label="Odstrani">×</button>`;
    span.querySelector('.sidebar-pill-remove').addEventListener('click', onRemove);
    return span;
}

function setSinglePill(containerId, label, onRemove) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    if (label) el.appendChild(makePill(label, onRemove));
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

function getSidebarFormState() {
    const params = parseHashParams();
    
    // Mapping of element suffix to URL parameter key
    const mapping = {
        'BoatType': 'cat',
        'BoatSubcat': 'vtype',
        'Make': 'make',
        'Model': 'model',
        'Variant': 'variant',
        'LengthFrom': 'lengthFrom',
        'LengthTo': 'lengthTo',
        'YearFrom': 'yearFrom',
        'YearTo': 'yearTo',
        'PriceFrom': 'priceFrom',
        'PriceTo': 'priceTo',
        'PowerFrom': 'powerFrom',
        'PowerTo': 'powerTo',
        'EngineHoursTo': 'engineHoursTo',
        'EngineMake': 'engineMake',
        'EngineType': 'engineType',
        'BerthsFrom': 'berthsFrom',
        'CabinsFrom': 'cabinsFrom',
        'EngineMount': 'engineMount',
        'Fuel': 'fuel',
        'Hull': 'hull',
        'SellerType': 'sellerType',
        'Region': 'region'
    };

    Object.keys(mapping).forEach(suffix => {
        const key = mapping[suffix];
        const val = document.getElementById(`sidebar${suffix}`)?.value;
        if (val) params.set(key, val); else params.delete(key);
    });

    const prodajaToggle = document.getElementById("sidebarProdajaToggle");
    const najemToggle = document.getElementById("sidebarNajemToggle");
    if (prodajaToggle) {
        if (prodajaToggle.checked) params.set('prodaja', '1'); else params.delete('prodaja');
    }
    if (najemToggle) {
        if (najemToggle.checked) params.set('najem', '1'); else params.delete('najem');
    }
    return params;
}

function updateUrlParamsFromInputs() {
    const params = getSidebarFormState();
    const hash = window.location.hash.split('?')[0];
    const newParams = params.toString();
    window.history.replaceState(null, '', `${hash}${newParams ? '?' + newParams : ''}`);
}

function updateUrlParams(makes, models) {
    const params = getSidebarFormState();
    if (makes && makes.length > 0) params.set('make', makes.join(',')); else params.delete('make');
    if (models && models.length > 0) params.set('model', models.join(',')); else params.delete('model');
    const paramStr = params.toString();
    window.location.hash = `/oglasi${paramStr ? '?' + paramStr : ''}`;
}

function updateFiltersUI() {
    const params = parseHashParams();
    const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];

    renderActivePills('activeMake', selectedMakes, (val) => {
        const updated = selectedMakes.filter(x => x !== val);
        const data = window._sidebarBrandModelData;
        const remainingModels = selectedModels.filter(m => updated.some(mk => {
            const models = data?.[mk];
            if (!models) return false;
            if (Array.isArray(models)) return models.includes(m);
            return models[m] !== undefined;
        }));
        updateUrlParams(updated, remainingModels);
    });

    renderActivePills('activeModel', selectedModels, (val) => {
        updateUrlParams(selectedMakes, selectedModels.filter(x => x !== val));
    });

    const boatTypeEl = document.getElementById('sidebarBoatType');
    const boatSubcatEl = document.getElementById('sidebarBoatSubcat');
    const engineMakeEl = document.getElementById('sidebarEngineMake');

    setSinglePill('activeBoatType',
        boatTypeEl?.value ? boatTypeEl.selectedOptions[0]?.text : '',
        () => { if (boatTypeEl) { boatTypeEl.value = ''; boatTypeEl.dispatchEvent(new Event('change')); } });

    setSinglePill('activeBoatSubcat',
        boatSubcatEl?.value ? boatSubcatEl.selectedOptions[0]?.text : '',
        () => { if (boatSubcatEl) { boatSubcatEl.value = ''; boatSubcatEl.dispatchEvent(new Event('change')); } });

    setSinglePill('activeEngineMake',
        engineMakeEl?.value || '',
        () => { if (engineMakeEl) { engineMakeEl.value = ''; engineMakeEl.dispatchEvent(new Event('change')); } });

    const engineTypeEl = document.getElementById('sidebarEngineType');
    setSinglePill('activeEngineType',
        engineTypeEl?.value ? engineTypeEl.selectedOptions[0]?.text : '',
        () => { if (engineTypeEl) { engineTypeEl.value = ''; engineTypeEl.dispatchEvent(new Event('change')); } });

    const modelSelect = document.getElementById("sidebarModel");
    const variantSelectEl = document.getElementById("sidebarVariant");
    const currentModel = modelSelect?.value || '';
    const currentVariant = variantSelectEl?.value || '';

    setSinglePill('activeModel', currentModel,
        () => {
            if (modelSelect) { modelSelect.value = ''; modelSelect.dispatchEvent(new Event('change')); }
        });

    setSinglePill('activeVariant', currentVariant,
        () => {
            if (variantSelectEl) { variantSelectEl.value = ''; variantSelectEl.dispatchEvent(new Event('change')); }
        });
}

// Vehicle types for a category — mirrors home.navtika.js typesForCategory
function vtypesForCategory(catSlug) {
    const cat = Object.values(MAIN_CATEGORIES).find(c => c.slug === catSlug);
    if (!cat) return [];
    if (Array.isArray(cat.vehicleTypes)) return cat.vehicleTypes;
    if (cat.subcategories) return Object.values(cat.subcategories).flatMap(s => s.vehicleTypes || []);
    return [];
}

function updateMftPills() {
    const container = document.getElementById('mftActivePills');
    if (!container) return;

    const labels = [];
    const get = id => document.getElementById(id);

    const boatType = get('sidebarBoatType');
    if (boatType?.value) labels.push(boatType.selectedOptions[0]?.text || boatType.value);

    const boatSubcat = get('sidebarBoatSubcat');
    if (boatSubcat?.value) labels.push(boatSubcat.selectedOptions[0]?.text || boatSubcat.value);

    const params = parseHashParams();
    const makes = params.get('make') ? params.get('make').split(',').filter(Boolean) : [];
    makes.forEach(m => labels.push(m));

    const models = params.get('model') ? params.get('model').split(',').filter(Boolean) : [];
    models.forEach(m => labels.push(m));

    const yearFrom = get('sidebarYearFrom')?.value;
    const yearTo = get('sidebarYearTo')?.value;
    if (yearFrom && yearTo) labels.push(`${yearFrom}–${yearTo}`);
    else if (yearFrom) labels.push(`od ${yearFrom}`);
    else if (yearTo) labels.push(`do ${yearTo}`);

    const priceFrom = get('sidebarPriceFrom')?.value;
    const priceTo = get('sidebarPriceTo')?.value;
    if (priceFrom || priceTo) labels.push(`${priceFrom || '0'} – ${priceTo || '∞'} €`);

    const lengthFrom = get('sidebarLengthFrom')?.value;
    const lengthTo = get('sidebarLengthTo')?.value;
    if (lengthFrom || lengthTo) labels.push(`${lengthFrom || '0'}–${lengthTo || '∞'} m`);

    const fuel = get('sidebarFuel');
    if (fuel?.value) labels.push(fuel.selectedOptions[0]?.text || fuel.value);

    const engineType = get('sidebarEngineType');
    if (engineType?.value) labels.push(engineType.selectedOptions[0]?.text || engineType.value);

    const hull = get('sidebarHull');
    if (hull?.value) labels.push(hull.selectedOptions[0]?.text || hull.value);

    const engineMake = get('sidebarEngineMake');
    if (engineMake?.value) labels.push(engineMake.value);

    const berthsFrom = get('sidebarBerthsFrom')?.value;
    if (berthsFrom) labels.push(`${berthsFrom}+ ležišč`);

    const najemToggle = get('sidebarNajemToggle');
    if (najemToggle?.checked) labels.push('Najem');

    const sellerType = get('sidebarSellerType');
    if (sellerType?.value) labels.push(sellerType.selectedOptions[0]?.text || sellerType.value);

    const region = get('sidebarRegion');
    if (region?.value) labels.push(region.selectedOptions[0]?.text || region.value);

    container.innerHTML = labels
        .map(l => `<span class="mft-pill">${l}</span>`)
        .join('');
}

function applySidebarFilters() {
    const prodajaToggle = document.getElementById("sidebarProdajaToggle");
    const najemToggle = document.getElementById("sidebarNajemToggle");
    const fProdaja = prodajaToggle ? prodajaToggle.checked : true;
    const fNajem = najemToggle ? najemToggle.checked : true;

    const cat = document.getElementById("sidebarBoatType")?.value || '';
    const selectedVtype = document.getElementById("sidebarBoatSubcat")?.value || '';
    const lengthFrom = parseFloat(document.getElementById("sidebarLengthFrom")?.value) || 0;
    const lengthTo = parseFloat(document.getElementById("sidebarLengthTo")?.value) || Infinity;
    const yearFrom = parseInt(document.getElementById("sidebarYearFrom")?.value, 10) || 0;
    const yearTo = parseInt(document.getElementById("sidebarYearTo")?.value, 10) || Infinity;
    const priceFrom = parseFormattedNumber(document.getElementById("sidebarPriceFrom")?.value) || 0;
    const priceTo = parseFormattedNumber(document.getElementById("sidebarPriceTo")?.value) || Infinity;
    const powerFrom = parseInt(document.getElementById("sidebarPowerFrom")?.value, 10) || 0;
    const powerTo = parseInt(document.getElementById("sidebarPowerTo")?.value, 10) || Infinity;
    const engineHoursTo = parseInt(document.getElementById("sidebarEngineHoursTo")?.value, 10) || Infinity;
    const berthsFrom = parseInt(document.getElementById("sidebarBerthsFrom")?.value, 10) || 0;
    const cabinsFrom = parseInt(document.getElementById("sidebarCabinsFrom")?.value, 10) || 0;
    const engineMake = document.getElementById("sidebarEngineMake")?.value || '';
    const engineType = document.getElementById("sidebarEngineType")?.value || '';
    const hull = document.getElementById("sidebarHull")?.value || '';

    const fuelVal = document.getElementById("sidebarFuel")?.value || '';
    const engineMountVal = document.getElementById("sidebarEngineMount")?.value || '';
    const fuels = fuelVal ? [fuelVal] : [];
    const engineMounts = engineMountVal ? [engineMountVal] : [];
    const sellerType = document.getElementById("sidebarSellerType")?.value || '';
    const region = document.getElementById("sidebarRegion")?.value || '';

    const params = parseHashParams();
    const extraEquipment = params.get('extraEquipment');

    const selectedMakes = params.get('make') ? params.get('make').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedModels = params.get('model') ? params.get('model').split(',').map(s => s.trim()).filter(Boolean) : [];
    const selectedVariant = document.getElementById("sidebarVariant")?.value || '';

    // Parse multi-vehicle query parameters from advanced search
    let urlVehicles = [];
    let urlExcludedVehicles = [];
    try {
        const urlVehiclesStr = params.get('vehicles');
        if (urlVehiclesStr) urlVehicles = JSON.parse(urlVehiclesStr);
    } catch (e) {
        console.warn("Failed to parse vehicles parameter:", e);
    }
    try {
        const urlExcludedVehiclesStr = params.get('excludedVehicles');
        if (urlExcludedVehiclesStr) urlExcludedVehicles = JSON.parse(urlExcludedVehiclesStr);
    } catch (e) {
        console.warn("Failed to parse excludedVehicles parameter:", e);
    }

    const filtered = _allActiveListings.filter(car => {
        if (!['plovilo', 'motor'].includes(car.itemType)) return false;
        if (cat && car.category !== cat) return false;
        if (selectedVtype && car.bodyType !== selectedVtype) return false;
        if (selectedVariant && car.variant !== selectedVariant) return false;

        // Sale / rental
        if (fNajem || fProdaja) {
            if (fNajem && !fProdaja && !car.isRental) return false;
            if (fProdaja && !fNajem && car.isRental) return false;
        } else {
            return false;
        }

        // Multi-vehicle exclusion logic (AND: listing must not match any excluded entry)
        if (urlExcludedVehicles.length > 0) {
            const isExcluded = urlExcludedVehicles.some(v => {
                if (v.make && car.make !== v.make) return false;
                if (v.model && car.model !== v.model) return false;
                if (v.variant) {
                    const varLower = v.variant.toLowerCase();
                    const carVar = (car.variant || '').toLowerCase();
                    const carTitle = (car.title || '').toLowerCase();
                    const carSub = (car.subtitle || '').toLowerCase();
                    if (!carVar.includes(varLower) && !carTitle.includes(varLower) && !carSub.includes(varLower)) return false;
                }
                return true;
            });
            if (isExcluded) return false;
        }

        // Multi-vehicle inclusion logic (OR between entries)
        if (urlVehicles.length > 0) {
            const match = urlVehicles.some(v => {
                if (v.make && car.make !== v.make) return false;
                if (v.model && car.model !== v.model) return false;
                if (v.variant) {
                    const varLower = v.variant.toLowerCase();
                    const carVar = (car.variant || '').toLowerCase();
                    const carTitle = (car.title || '').toLowerCase();
                    const carSub = (car.subtitle || '').toLowerCase();
                    if (!carVar.includes(varLower) && !carTitle.includes(varLower) && !carSub.includes(varLower)) return false;
                }
                return true;
            });
            if (!match) return false;
        } else {
            // Fallback to single/sidebar make/model/variant filters if no multi-vehicle list is provided
            if (selectedMakes.length > 0 && !selectedMakes.includes(car.make)) return false;
            if (selectedModels.length > 0 && !selectedModels.includes(car.model)) return false;
        }

        const price = car.priceRaw ?? car.priceEur ?? null;
        if (priceFrom > 0 && price != null && price < priceFrom) return false;
        if (priceTo < Infinity && price != null && price > priceTo) return false;

        const carYear = Number(car.year) || null;
        if (yearFrom > 0 && carYear && carYear < yearFrom) return false;
        if (yearTo < Infinity && carYear && carYear > yearTo) return false;

        if (lengthFrom > 0 && (car.lengthM || 0) < lengthFrom) return false;
        if (lengthTo < Infinity && car.lengthM && car.lengthM > lengthTo) return false;

        const hp = car.powerHp || car.enginePowerHp || (car.powerKw ? Math.round(car.powerKw * 1.35962) : null);
        if (powerFrom > 0 && hp && hp < powerFrom) return false;
        if (powerTo < Infinity && hp && hp > powerTo) return false;

        if (engineHoursTo < Infinity && car.engineHours && car.engineHours > engineHoursTo) return false;

        // berths & cabins
        if (berthsFrom > 0 && (car.berths || 0) < berthsFrom) return false;
        if (cabinsFrom > 0 && (car.cabins || 0) < cabinsFrom) return false;

        // engine mount type
        if (engineMounts.length > 0 && !engineMounts.includes(car.engineMountType)) return false;

        // engine manufacturer/make (select value — exact match)
        if (engineMake) {
            const q = engineMake.toLowerCase();
            const makeMatch = car.itemType === 'motor' && car.make && car.make.toLowerCase() === q;
            const engineMakeMatch = car.engineMake && car.engineMake.toLowerCase() === q;
            const titleMatch = car.title && car.title.toLowerCase().includes(q);
            if (!makeMatch && !engineMakeMatch && !titleMatch) return false;
        }

        if (engineType && car.driveSystem !== engineType) return false;
        if (hull && car.hullMaterial !== hull) return false;
        if (fuels.length > 0 && !fuels.includes(car.fuel)) return false;

        if (sellerType && car.sellerType !== sellerType) return false;
        if (region) {
            const carRegion = car.location?.region || '';
            if (carRegion !== region) return false;
        }

        if (extraEquipment) {
            const selectedEqs = extraEquipment.split(',').filter(Boolean);
            if (!car.equipment || !selectedEqs.every(eq => car.equipment.includes(eq))) return false;
        }

        return true;
    });

    renderListings(filtered);
    updateFiltersUI();
    updateMftPills();

    const countEl = document.querySelector(".results-header h1 span");
    if (countEl) {
        countEl.textContent = `(${filtered.length} plovil)`;
    }
}

function prefillSidebarFromUrl() {
    window._isPrefilling = true;
    const params = parseHashParams();

    const prefillSelect = (id, paramName) => {
        const val = params.get(paramName);
        if (val) {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event('change'));
            }
        }
    };
    const prefillInput = (id, paramName) => {
        const val = params.get(paramName);
        if (val) {
            const el = document.getElementById(id);
            if (el) el.value = val;
        }
    };

    prefillSelect("sidebarBoatType", "cat");
    setTimeout(() => {
        prefillSelect("sidebarBoatSubcat", "vtype");
    }, 50);

    prefillSelect("sidebarYearFrom", "yearFrom");
    prefillSelect("sidebarYearTo", "yearTo");
    prefillInput("sidebarPriceFrom", "priceFrom");
    prefillInput("sidebarPriceTo", "priceTo");
    prefillInput("sidebarLengthFrom", "lengthFrom");
    prefillInput("sidebarLengthTo", "lengthTo");
    prefillInput("sidebarPowerFrom", "powerFrom");
    prefillInput("sidebarPowerTo", "powerTo");
    prefillInput("sidebarEngineHoursTo", "engineHoursTo");
    prefillInput("sidebarBerthsFrom", "berthsFrom");
    prefillInput("sidebarCabinsFrom", "cabinsFrom");
    prefillInput("sidebarEngineMake", "engineMake");
    prefillSelect("sidebarEngineType", "engineType");
    prefillSelect("sidebarHull", "hull");
    prefillSelect("sidebarSellerType", "sellerType");
    prefillSelect("sidebarRegion", "region");

    const prodajaVal = params.get("prodaja");
    const najemVal = params.get("najem");
    const prodajaToggle = document.getElementById("sidebarProdajaToggle");
    const najemToggle = document.getElementById("sidebarNajemToggle");
    if (prodajaToggle && najemToggle) {
        if (prodajaVal !== null || najemVal !== null) {
            prodajaToggle.checked = prodajaVal === '1';
            najemToggle.checked = najemVal === '1';
        } else {
            // Default when not in URL: Prodaja checked, Rent unchecked
            prodajaToggle.checked = true;
            najemToggle.checked = false;
        }
    }

    const fuel = params.get("fuel");
    if (fuel) {
        const fuels = fuel.split(',');
        const fuelCheckboxes = document.querySelectorAll('#sidebarFiltersForm input[name="fuel"]');
        fuelCheckboxes.forEach(cb => {
            cb.checked = fuels.includes(cb.value);
        });
    }

    const engineMount = params.get("engineMount");
    if (engineMount) {
        const mounts = engineMount.split(',');
        const mountCheckboxes = document.querySelectorAll('#sidebarFiltersForm input[name="engineMount"]');
        mountCheckboxes.forEach(cb => {
            cb.checked = mounts.includes(cb.value);
        });
    }

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
