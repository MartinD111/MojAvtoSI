import { escHtml } from '../utils/escHtml.js';
import { SAMPLE_LISTINGS } from '../data/sampleListings.js';
import { getListings } from '../services/listingService.js';
import { COUNTRIES, getRegions } from '../data/locationData.js';
import { key as lsKey } from '../config/storageKeys.js';
import { 
    getFuelPill, 
    getPowerPill, 
    getConsumptionPill, 
    getTransmissionPill,
    getYearPill,
    getKmPill,
    getDisplacementPill
} from '../utils/listingUtils.js';
import { t } from '../core/i18n.js';
import { setupNumericFormatter, parseFormattedNumber } from '../utils/inputFormatters.js';
import { MAIN_CATEGORIES } from '../data/categories.js';
import { brandsFileFor } from '../data/brandFiles.js';
import { popularBrandsFor } from '../data/popularBrands.js';
import { PLATFORM } from '../config/platform.js';
import { navigateTo } from '../router.js';
import { getSiteSettings } from '../services/adminService.js';

let allListings = [];

// First/primary category of the active platform (e.g. 'avto' | 'colni').
const PRIMARY_CATEGORY = Object.values(MAIN_CATEGORIES)[0]?.slug || 'avto';

export async function initHomePage() {
    console.log('[HomePage] init');

    // MojaNavtika uses a dedicated home view + controller (simple vessel search).
    if (PLATFORM.id === 'navtika') {
        const m = await import('./home.navtika.js');
        return m.initNavtikaHomePage();
    }

    // Setup rotating sponsored ads
    setupRotatingAds();

    // Initialize search form immediately — doesn't need listings data
    setupSearchForm();
    setupCarousels();
    initWordSlider();
    loadHeroBackground();

    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Fetch listings in background so the search form is interactive right away
    getListings()
        .then(listings => {
            allListings = listings;
            updateHomeCategory(PRIMARY_CATEGORY);
        })
        .catch(err => {
            console.error('[HomePage] Failed to load listings:', err);
            // Still initialize brand dropdowns with empty set
            updateHomeCategory(PRIMARY_CATEGORY);
        });
}

async function loadHeroBackground() {
    const element = document.getElementById('homeHeroBackground');
    if (!element) return;
    try {
        const settings = await getSiteSettings();
        if (settings.heroBackgroundUrl) {
            element.style.backgroundImage = `url("${settings.heroBackgroundUrl.replace(/"/g, '')}")`;
            element.classList.add('has-image');
        }
    } catch (error) {
        console.warn('[HomePage] Could not load hero background:', error);
    }
}

/**
 * Updates the homepage content based on selected category
 * @param {string} category - Category ID (avto, motor, gospodarska)
 */
function updateHomeCategory(category) {
    // Filter featured listings for this category
    const categoryListings = allListings.filter(l => l.category === category);
    const featured = categoryListings.filter(l => {
        if (!l.isPremium && l.promotion?.tier !== 'homepage' && l.promotion?.tier !== 'sponsored') return false;
        const exp = l.promotion?.expiresAt;
        if (!exp) return true;
        const ms = exp?.toMillis?.() ?? (typeof exp === 'number' ? exp : null);
        return ms === null || ms > Date.now();
    });
    
    renderListingsSection('featured-container', 'featured-section', featured, false);
    
    // Reload brands for the search form
    reloadBrands(category);

    // Update advanced search links
    const catSlug = category === 'motor' ? 'moto' : category;
    const homeAdvLink = document.getElementById('homeAdvancedSearchLink');
    if (homeAdvLink) {
        homeAdvLink.href = `/iskanje?cat=${catSlug}`;
    }
    const headerAdvLink = document.getElementById('oglasiMenuBtn');
    if (headerAdvLink) {
        headerAdvLink.href = `/iskanje?cat=${catSlug}`;
    }
}

function setupRotatingAds() {
    const track = document.getElementById('rotating-ads-container');
    const prevBtn = document.getElementById('rot-prev-btn');
    const nextBtn = document.getElementById('rot-next-btn');
    if (!track || !prevBtn || !nextBtn) return;

    // Filter for rotating ads — include both 'homepage' tier (isPremium) and 'sponsored' tier
    const sponsored = allListings.length > 0
        ? allListings.filter(l => l.isPremium || l.promotion?.tier === 'sponsored' || l.promotion?.tier === 'homepage')
        : [...SAMPLE_LISTINGS];
    if (sponsored.length === 0) return;

    function renderAdCard(car) {
        const img = car.images?.exterior?.[0] || 'https://via.placeholder.com/120x80?text=Ni+slike';
        const isMoto = car.category === 'motor' || car.category === 'moto';
        const price = typeof car.price === 'number'
            ? new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(car.price)
            : car.price;

        const motoSpecs = `
            <div class="sponsored-specs centered">
                <div class="spec-row centered">
                    ${getYearPill(car.year)}
                    ${getKmPill(car.mileage)}
                </div>
                <div class="spec-row centered">
                    ${car.engineCc ? `<div class="spec-pill displacement-pill" data-cc="${car.engineCc}"><i data-lucide="cog"></i><span>${new Intl.NumberFormat('sl-SI').format(car.engineCc)} cc</span></div>` : ''}
                    ${car.engineStroke ? `<div class="spec-pill stroke-pill" title="Takt motorja: ${car.engineStroke}"><i data-lucide="activity"></i><strong>${car.engineStroke}</strong></div>` : ''}
                </div>
                ${car.engineType ? `<div class="spec-row centered"><div class="spec-pill type-pill" title="Vrsta motorja: ${car.engineType}"><i data-lucide="cpu"></i><strong>${car.engineType}</strong></div></div>` : ''}
            </div>`;

        const carSpecs = `
            <div class="sponsored-specs centered">
                <div class="spec-row centered">
                    ${getYearPill(car.year)}
                    ${getKmPill(car.mileage)}
                </div>
                <div class="spec-row centered">
                    ${getFuelPill(car)}
                    ${getTransmissionPill(car)}
                </div>
                <div class="spec-row centered">
                    ${getConsumptionPill(car)}
                </div>
            </div>`;

        return `
            <div class="sponsored-mini-card-wrapper">
                <a href="#/oglas?id=${car.id}" class="sponsored-mini-card">
                    <img src="${img}" alt="${escHtml(car.title)}">
                    <h4 class="sponsored-title">${escHtml(car.make)} ${escHtml(car.model)}</h4>
                    ${isMoto ? motoSpecs : carSpecs}
                    <div class="sponsored-price">${price}</div>
                </a>
            </div>
        `;
    }

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Hide nav buttons directly in case CSS specificity doesn't win
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';

        // Render doubled items for seamless loop
        track.innerHTML = [...sponsored, ...sponsored].map(car => renderAdCard(car)).join('');
        if (window.lucide) window.lucide.createIcons();

        // Auto-scroll via scrollLeft on the container so touch drag coexists
        const container = track.parentElement;
        let isPaused = false;

        function mobileAutoScroll() {
            if (!isPaused) {
                container.scrollLeft += 0.8;
                if (container.scrollLeft >= track.scrollWidth / 2) {
                    container.scrollLeft = 0;
                }
            }
            requestAnimationFrame(mobileAutoScroll);
        }

        container.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        container.addEventListener('touchend', () => {
            setTimeout(() => { isPaused = false; }, 1200);
        }, { passive: true });

        mobileAutoScroll();
        return;
    }

    // Desktop: render twice for seamless loop
    track.innerHTML = [...sponsored, ...sponsored].map(car => renderAdCard(car)).join('');
    if (window.lucide) window.lucide.createIcons();

    let scrollAmount = 0;
    let targetScroll = 0;
    let step = 0.8; // Speed of auto-scroll
    let isPaused = false;

    function startAnimation() {
        if (!isPaused) {
            targetScroll += step;
            if (targetScroll >= track.scrollWidth / 2) {
                targetScroll = 0;
                scrollAmount = 0;
            }
        }
        scrollAmount += (targetScroll - scrollAmount) * 0.1;
        track.style.transform = `translateX(-${scrollAmount}px)`;
        requestAnimationFrame(startAnimation);
    }

    startAnimation();

    track.addEventListener('mouseenter', () => { isPaused = true; });
    track.addEventListener('mouseleave', () => { isPaused = false; });

    const jumpSize = 400;
    nextBtn.addEventListener('click', () => { targetScroll += jumpSize; });
    prevBtn.addEventListener('click', () => { targetScroll -= jumpSize; });
}

function renderListingsSection(containerId, sectionId, listings, hideIfEmpty = false) {
    const container = document.getElementById(containerId);
    const section = document.getElementById(sectionId);
    if (!container || !section) return;

    if (!listings || listings.length === 0) {
        if (hideIfEmpty) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
            container.innerHTML = `<p style="padding: 2rem; color: #6b7280; text-align: center; width: 100%;">${t('no_featured_listings', 'Currently no featured listings in this category.')}</p>`;
        }
        return;
    }

    section.style.display = 'block';

    // Render as mini-cards matching the sponsored carousel style
    const html = listings.map(listing => {
        const imgUrl = listing.images?.exterior?.[0] || 'https://via.placeholder.com/300x200?text=Ni+slike';
        const price = typeof listing.price === 'number' ?
            new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(listing.price) :
            listing.price;

        return `
            <div class="sponsored-mini-card-wrapper">
                <a href="#/oglas?id=${listing.id}" class="sponsored-mini-card" onclick="window.scrollTo({top:0,behavior:'smooth'})">
                    <img src="${imgUrl}" alt="${escHtml(listing.make)} ${escHtml(listing.model)}">
                    <h4 class="sponsored-title">${escHtml(listing.make)} ${escHtml(listing.model)}</h4>
                    <div class="sponsored-specs centered">
                        <div class="spec-row centered">
                            ${getYearPill(listing.year)}
                            ${getKmPill(listing.mileage)}
                        </div>
                        <div class="spec-row centered">
                            ${getFuelPill(listing)}
                            ${getTransmissionPill(listing)}
                        </div>
                    </div>
                    <div class="sponsored-price">${price}</div>
                </a>
            </div>
        `;
    }).join('');

    // Double items for seamless loop
    container.innerHTML = html + html;
    if (window.lucide) window.lucide.createIcons();
}


function setupCarousels() {
    // Auto-scroll the featured (auction) carousel — identical to the sponsored carousel
    const featuredTrack = document.getElementById('featured-container');
    if (featuredTrack) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const featuredContainer = featuredTrack.parentElement;
            let isPaused = false;
            function featuredAutoScroll() {
                if (!isPaused) {
                    featuredContainer.scrollLeft += 0.8;
                    if (featuredContainer.scrollLeft >= featuredTrack.scrollWidth / 2) {
                        featuredContainer.scrollLeft = 0;
                    }
                }
                requestAnimationFrame(featuredAutoScroll);
            }
            featuredContainer.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
            featuredContainer.addEventListener('touchend', () => {
                setTimeout(() => { isPaused = false; }, 1200);
            }, { passive: true });
            featuredAutoScroll();
        } else {
            let scrollAmount = 0;
            let targetScroll = 0;
            let isPaused = false;
            function featuredDesktopScroll() {
                if (!isPaused) {
                    targetScroll += 0.8;
                    if (targetScroll >= featuredTrack.scrollWidth / 2) {
                        targetScroll = 0;
                        scrollAmount = 0;
                    }
                }
                scrollAmount += (targetScroll - scrollAmount) * 0.1;
                featuredTrack.style.transform = `translateX(-${scrollAmount}px)`;
                requestAnimationFrame(featuredDesktopScroll);
            }
            featuredTrack.addEventListener('mouseenter', () => { isPaused = true; });
            featuredTrack.addEventListener('mouseleave', () => { isPaused = false; });
            featuredDesktopScroll();
        }
    }

    // Recently-viewed still uses click-scroll arrows
    const rvTrack = document.getElementById('recently-viewed-container');
    const rvPrev = document.getElementById('recent-prev-btn');
    const rvNext = document.getElementById('recent-next-btn');
    if (rvTrack && rvPrev && rvNext) {
        const scrollAmount = 300;
        rvPrev.addEventListener('click', () => rvTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        rvNext.addEventListener('click', () => rvTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    }
}

function reloadBrands(category) {
    const brandSelect = document.getElementById("home-make");
    const modelSelect = document.getElementById("home-model");
    if (!brandSelect || !modelSelect) return;

    const jsonFile = brandsFileFor(category);

    fetch(jsonFile)
        .then(res => res.ok ? res.json() : {})
        .then(brandModelData => {
            // Clear current options
            brandSelect.innerHTML = `<option value="">${t('all_brands', 'All makes')}</option>`;
            modelSelect.innerHTML = `<option value="">${t('all_models', 'All models')}</option>`;
            modelSelect.disabled = true;

            // Surface the top-10 popular brands in a group at the top, mirroring
            // the advanced-search make dropdown (customSelect styles/handles the
            // data-popular* options).
            const popular = popularBrandsFor(category).filter(b => brandModelData[b]);
            if (popular.length) {
                const lbl = document.createElement('option');
                lbl.value = ''; lbl.textContent = '— Najbolj priljubljene —';
                lbl.disabled = true; lbl.dataset.popularLabel = 'true';
                brandSelect.appendChild(lbl);
                popular.forEach(brand => {
                    const o = document.createElement('option');
                    o.value = brand; o.textContent = brand;
                    o.dataset.popular = 'true';
                    brandSelect.appendChild(o);
                });
                const sep = document.createElement('option');
                sep.value = ''; sep.textContent = '──────────────';
                sep.disabled = true; sep.dataset.popularLabel = 'true';
                brandSelect.appendChild(sep);
            }

            Object.keys(brandModelData).sort().forEach(brand => {
                const option = document.createElement("option");
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });

            // Update custom selects
            import('../utils/customSelect.js').then(m => {
                m.createCustomSelect(brandSelect);
                m.createCustomSelect(modelSelect);
            });

            const variantSelect = document.getElementById("home-variant");
            const resetVariants = () => {
                if (!variantSelect) return;
                variantSelect.innerHTML = `<option value="">${t('cl_trim_variant', 'Različica')}</option>`;
                variantSelect.disabled = true;
                import('../utils/customSelect.js').then(m => m.createCustomSelect(variantSelect));
            };

            // Brand change: reset model + variant
            brandSelect.addEventListener("change", function () {
                const selectedMake = brandSelect.value;
                modelSelect.innerHTML = `<option value="">${t('all_models', 'All models')}</option>`;
                modelSelect.disabled = true;
                resetVariants();

                if (selectedMake && brandModelData[selectedMake]) {
                    const models = brandModelData[selectedMake];
                    const modelKeys = Array.isArray(models) ? models : Object.keys(models);
                    modelKeys.forEach(model => {
                        const option = document.createElement("option");
                        option.value = model;
                        option.textContent = model;
                        modelSelect.appendChild(option);
                    });
                    modelSelect.disabled = false;
                }

                import('../utils/customSelect.js').then(m => m.createCustomSelect(modelSelect));
            });

            // Model change: populate variants
            modelSelect.addEventListener("change", function () {
                resetVariants();
                const mk = brandSelect.value;
                const md = modelSelect.value;
                if (!mk || !md || !brandModelData[mk]) return;
                const entry = brandModelData[mk][md];
                if (!entry) return;
                import('../utils/bodyType.js').then(({ getModelVariants }) => {
                    const variants = getModelVariants(entry);
                    if (!variants || !variants.length || !variantSelect) return;
                    variants.forEach(v => {
                        const name = typeof v === 'string' ? v : (v.trim || v.name || '');
                        if (!name) return;
                        const opt = document.createElement("option");
                        opt.value = name;
                        opt.textContent = name;
                        variantSelect.appendChild(opt);
                    });
                    variantSelect.disabled = false;
                    import('../utils/customSelect.js').then(m => m.createCustomSelect(variantSelect));
                });
            });
        });
}

function setupSearchForm() {
    const yearSelect = document.getElementById("home-reg-from");
    if (!yearSelect) return;

    // Populate years
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
        const option = document.createElement("option");
        option.value = y;
        option.textContent = y;
        yearSelect.appendChild(option);
    }

    import('../utils/customSelect.js').then(m => {
        m.createCustomSelect(yearSelect);
        
        const fuelSelect = document.getElementById("home-fuel-type");
        if (fuelSelect) m.createCustomSelect(fuelSelect);
        
        const mileageSelect = document.getElementById("home-mileage-to");
        if (mileageSelect) m.createCustomSelect(mileageSelect);
    });

    const priceInput = document.getElementById("home-price-to");
    if (priceInput) setupNumericFormatter(priceInput);

    // Country + Region selects with localStorage persistence
    const countrySelect = document.getElementById('home-country');
    const regionSelect = document.getElementById('home-region');
    if (countrySelect && regionSelect) {
        const savedCountry = localStorage.getItem(lsKey('filterCountry')) || '';
        const savedRegion = localStorage.getItem(lsKey('filterRegion')) || '';

        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = t('cl_sel_country') || 'Vse države';
        countrySelect.appendChild(emptyOpt);

        COUNTRIES.forEach(c => {
            const o = document.createElement('option');
            o.value = c.code;
            o.textContent = c.label;
            countrySelect.appendChild(o);
        });

        const populateRegions = (code, selectValue) => {
            regionSelect.innerHTML = '';
            const empty = document.createElement('option');
            empty.value = '';
            empty.textContent = t('cl_sel_region') || 'Vse regije';
            regionSelect.appendChild(empty);
            if (code) {
                getRegions(code).forEach(r => {
                    const o = document.createElement('option');
                    o.value = r; o.textContent = r;
                    regionSelect.appendChild(o);
                });
                regionSelect.disabled = false;
            } else {
                regionSelect.disabled = true;
            }
            if (selectValue) regionSelect.value = selectValue;
        };

        if (savedCountry) {
            countrySelect.value = savedCountry;
            populateRegions(savedCountry, savedRegion);
        } else {
            populateRegions('', '');
        }

        // Apply custom select styling
        import('../utils/customSelect.js').then(m => {
            m.createCustomSelect(countrySelect);
            m.createCustomSelect(regionSelect);
        });

        countrySelect.addEventListener('change', () => {
            const code = countrySelect.value;
            localStorage.setItem(lsKey('filterCountry'), code);
            localStorage.setItem(lsKey('filterRegion'), '');
            populateRegions(code, '');
        });

        regionSelect.addEventListener('change', () => {
            localStorage.setItem(lsKey('filterRegion'), regionSelect.value);
        });
    }

    // Search-mode pills (Išči oglase / Išči dražbe) — drive the submit target.
    let homeSearchMode = 'oglasi';
    const modePills = document.getElementById('homeSearchMode');
    if (modePills) {
        modePills.querySelectorAll('.home-search-mode-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                homeSearchMode = pill.dataset.searchMode;
                modePills.querySelectorAll('.home-search-mode-pill')
                    .forEach(p => p.classList.toggle('active', p === pill));
            });
        });
    }

    // Simple search redirect
    const form = document.getElementById('homeSearchForm');

    // Reset button — fire change events so custom select triggers update their display
    const resetBtn = form ? form.querySelector('button[type="reset"]') : null;
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const fireChange = (id) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.selectedIndex = 0;
                el.dispatchEvent(new Event('change'));
            };
            // Reset make first — its change listener cascades to clear model + variant
            fireChange('home-make');
            // Reset remaining selects
            fireChange('home-reg-from');
            fireChange('home-mileage-to');
            fireChange('home-fuel-type');
            // Reset country — its change listener clears + disables region
            fireChange('home-country');
            // Reset price text input
            const priceEl = document.getElementById('home-price-to');
            if (priceEl) priceEl.value = '';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-btn.active');
            const category = activeTab ? activeTab.getAttribute('data-category') : 'avto';
            const catSlug = category === 'motor' ? 'moto' : (category === 'gospodarska' ? 'gospodarska' : 'avto');
            
            const make = document.getElementById('home-make')?.value || '';
            const model = document.getElementById('home-model')?.value || '';
            const variant = document.getElementById('home-variant')?.value || '';
            const year = document.getElementById('home-reg-from')?.value || '';
            const mileage = document.getElementById('home-mileage-to')?.value || '';
            const priceVal = document.getElementById('home-price-to')?.value || '';
            const price = parseFormattedNumber(priceVal) || '';
            const country = document.getElementById('home-country')?.value || '';
            const region = document.getElementById('home-region')?.value || '';

            let query = `?cat=${catSlug}`;
            if (make) query += `&make=${encodeURIComponent(make)}`;
            if (model) query += `&model=${encodeURIComponent(model)}`;
            if (variant) query += `&variant=${encodeURIComponent(variant)}`;
            if (year) query += `&yearFrom=${year}`;
            if (mileage) query += `&mileageTo=${mileage}`;
            if (price) query += `&priceTo=${price}`;
            if (country) query += `&country=${encodeURIComponent(country)}`;
            if (region) query += `&region=${encodeURIComponent(region)}`;

            const target = homeSearchMode === 'drazbe' ? '/drazbe' : '/oglasi';
            navigateTo(`${target}${query}`);
        });
    }

    // "Več filtrov" link — use SPA navigation so the router handles it
    const advLink = document.getElementById('homeAdvancedSearchLink');
    if (advLink) {
        advLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(advLink.getAttribute('href'));
        });
    }

    // Connect Tab Buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            updateHomeCategory(category);

            const bodyTypeGroup = document.getElementById('group-home-bodyType');
            if (bodyTypeGroup) {
                if (category === 'motor' || category === 'gospodarska') {
                    bodyTypeGroup.style.display = 'none';
                } else {
                    bodyTypeGroup.style.display = 'flex';
                }
            }
        });
    });
}

export function initWordSlider() {
    if (window._wordSliderTimeout) {
        clearTimeout(window._wordSliderTimeout);
        window._wordSliderTimeout = null;
    }

    const items = document.querySelector('.hero-word-items');
    if (!items) return;

    const prefixItems = document.querySelector('.hero-prefix-items');

    const WORD_COUNT = 10; // real words (index 0–9); index 10 = car_loop clone
    const HOLD = 2000;     // ms each word is visible
    const SLIDE = 350;     // ms for the slide transition
    let current = 0;

    items.style.transform = 'translateY(0)';
    if (prefixItems) {
        prefixItems.style.transform = 'translateY(0)';
    }

    function slideToNext() {
        const isLast = current === WORD_COUNT - 1;
        const targetIndex = isLast ? WORD_COUNT : current + 1;

        items.style.transition = `transform ${SLIDE}ms ease-in-out`;
        items.style.transform = `translateY(${-targetIndex * 1.4}em)`;

        if (prefixItems) {
            prefixItems.style.transition = `transform ${SLIDE}ms ease-in-out`;
            prefixItems.style.transform = `translateY(${-targetIndex * 1.4}em)`;
        }

        window._wordSliderTimeout = setTimeout(() => {
            if (isLast) {
                // Arrived at car_loop (avto) — snap silently back to position 0
                items.style.transition = 'none';
                items.style.transform = 'translateY(0)';

                if (prefixItems) {
                    prefixItems.style.transition = 'none';
                    prefixItems.style.transform = 'translateY(0)';
                }

                current = 0;
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    window._wordSliderTimeout = setTimeout(slideToNext, HOLD);
                }));
            } else {
                current++;
                window._wordSliderTimeout = setTimeout(slideToNext, HOLD);
            }
        }, SLIDE);
    }

    window._wordSliderTimeout = setTimeout(slideToNext, HOLD);
}
