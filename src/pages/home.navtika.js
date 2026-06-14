// ═══════════════════════════════════════════════════════════════════════════════
// Home — MojaNavtika (vessel landing page)
// Rotating hero words (boat terms via lang overlay) + a simple search:
// vrsta plovila (category) · dolžina (length) · moč motorja (power).
// ═══════════════════════════════════════════════════════════════════════════════
import { getListings } from '../services/listingService.js';
import { MAIN_CATEGORIES } from '../data/categories.js';
import { t } from '../core/i18n.js';
import { initWordSlider } from './home.js';
import { initCustomSelects } from '../utils/customSelect.js';

const SEA_JOKES = {
    sl: [
        { text: '🚤 Najboljše ime za čoln je "Manjka meter"', sub: 'ker manjka vedno en meter do kaj.' },
        { text: '⚓ "Štart ob 9" – pristane ob 17', sub: 'Morski čas je edini urnik, ki ga nihče ne spoštuje.' },
        { text: '🌊 "Banka na vodi"', sub: 'Čoln je luknja v morju, v katero greš met denar.' },
        { text: '🦈 "Neizplačana Hipoteka"', sub: 'Vsak lastnik čolna jo pozna.' },
        { text: '🪝 "Vikend Projekt"', sub: 'Popravil ga bom naslednji vikend. In naslednji. In...' },
        { text: '⛵ "Moja Terapevtka"', sub: 'Cenejša od psihologa – razen vzdrževanja.' },
        { text: '🐟 "Ribe Niso Doma"', sub: 'Optimistično ime za realiste.' },
        { text: '🌅 "Jutri Odplujemo"', sub: 'Jadralec ve, da je jutri vedno malo preveč vetra.' },
        { text: '⚡ "Brez Bencina"', sub: 'Klasika. Vedno se zgodi ravno na sredini jezera.' },
        { text: '🗺️ "GPS Je Goljuf"', sub: 'Kje pa je zdaj ta plaža? Tu piše tu!' },
        { text: '🍺 "Dve Pivi Do Pristanišča"', sub: 'Uradna merska enota za razdaljo na morju.' },
    ],
    en: [
        { text: '🌊 Why don\'t boats ever get stressed?', sub: 'They just go with the flow.' },
        { text: '😂 What do you call a boat that tells jokes?', sub: 'A laugh yacht.' },
        { text: '✏️ Why did the sailor bring a pencil on board?', sub: 'In case he needed to draw the anchor.' },
        { text: '🏥 What do boats do when they\'re sick?', sub: 'They visit the dock-tor.' },
        { text: '📚 Why was the boat so good at school?', sub: 'It always stayed afloat in class.' },
        { text: '🗣️ What did one boat say to the other?', sub: '"Are you shore about that?"' },
        { text: '🏴‍☠️ Why couldn\'t the pirate learn the alphabet?', sub: 'He kept getting lost at C.' },
        { text: '🎵 What\'s a boat\'s favorite type of music?', sub: 'Anything with a good current beat.' },
        { text: '🎶 Why did the fisherman get kicked out of the orchestra?', sub: 'He kept casting instead of conducting.' },
        { text: '😬 What do you call a nervous boat?', sub: 'A jitter-ship.' },
        { text: '💔 Why did the sailboat break up with the motorboat?', sub: 'It felt the relationship was going nowhere fast.' },
        { text: '👋 How do boats say goodbye?', sub: '"Sea you later!"' },
        { text: '🤝 What kind of boat never sinks?', sub: 'A friendship.' },
        { text: '😎 Why was the captain always calm?', sub: 'He knew how to weather any situation.' },
        { text: '😤 What do you call a boat full of rude people?', sub: 'A discourtesy vessel.' },
        { text: '😳 Why did the yacht blush?', sub: 'It saw the ocean\'s bottom.' },
        { text: '🥣 What do sailors eat for breakfast?', sub: 'Captain Crunch.' },
        { text: '🤫 Why are boats terrible at keeping secrets?', sub: 'They always leak something.' },
        { text: '📈 What happened when the boat got promoted?', sub: 'It rose through the ranks of the fleet.' },
        { text: '💸 Why did the boat apply for a loan?', sub: 'It was a little underwater.' },
    ],
};

function initSeaJoke() {
    const jokes = SEA_JOKES.en;
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    const el = document.getElementById('seaJokeText');
    const sub = document.getElementById('seaJokeQuote');
    if (el) el.textContent = joke.text;
    if (sub) sub.textContent = joke.sub;
}

export async function initNavtikaHomePage() {
    console.log('[NavtikaHome] init');

    fillCategorySelect();
    initCustomSelects();
    bindSearch();
    initSeaJoke();

    try {
        const listings = await getListings();
        renderFeatured(listings);
        renderSponsored(listings);
        initAutoScroll('rotating-ads-container', 'rot-prev-btn', 'rot-next-btn', 0.5);
        initAutoScroll('featured-container', 'featured-prev-btn', 'featured-next-btn', 0.4);
    } catch (e) {
        console.error('[NavtikaHome] listings load failed', e);
    }

    if (window.lucide) window.lucide.createIcons();
}

// "Vrsta plovila" select = the platform's main categories.
function fillCategorySelect() {
    const sel = document.getElementById('nav-home-cat');
    if (!sel) return;
    sel.innerHTML = Object.values(MAIN_CATEGORIES)
        .map(c => `<option value="${c.slug}">${t(c.label)}</option>`).join('');
    const advLink = document.getElementById('navHomeAdvLink');
    fillSubcatSelect(sel.value);

    const form = document.getElementById('navtikaHomeSearch');

    const updateAdvLink = () => {
        if (!advLink) return;
        const cat = sel.value;
        const params = new URLSearchParams({ cat });
        const sc = document.getElementById('nav-home-subcat')?.value;
        if (sc) params.set('vtype', sc);
        const lf = document.getElementById('nav-home-length-from')?.value;
        const lt = document.getElementById('nav-home-length-to')?.value;
        const pt = document.getElementById('nav-home-power-to')?.value;
        const ht = document.getElementById('nav-home-hours-to')?.value;
        if (lf && Number(lf) > 3) params.set('lengthFrom', lf);
        if (lt && Number(lt) < 50) params.set('lengthTo', lt);
        if (pt) params.set('powerTo', pt);
        if (ht) params.set('engineHoursTo', ht);
        const prodaja = document.getElementById('homeNavProdajaToggle')?.checked;
        const najem = document.getElementById('homeNavNajemToggle')?.checked;
        if (prodaja) params.set('prodaja', '1');
        if (najem) params.set('najem', '1');
        advLink.dataset.target = `#/iskanje?${params.toString()}`;
    };

    updateAdvLink();
    advLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = advLink.dataset.target || '#/iskanje?cat=colni';
        const hash = target.startsWith('#') ? target.slice(1) : target;
        window.location.hash = hash;
    });
    sel.addEventListener('change', () => { fillSubcatSelect(sel.value); updateAdvLink(); });

    if (form) {
        form.addEventListener('change', updateAdvLink);
        form.addEventListener('input', updateAdvLink);
    }
}

// Returns the flat list of { value, label } vehicle types for a category slug.
// jet_ski exposes vehicleTypes at the top level; others nest them under subcategories.
function vehicleTypesForCat(catSlug) {
    const cat = Object.values(MAIN_CATEGORIES).find(c => c.slug === catSlug);
    if (!cat) return [];
    if (Array.isArray(cat.vehicleTypes)) return cat.vehicleTypes;
    if (cat.subcategories) {
        return Object.values(cat.subcategories).flatMap(s => s.vehicleTypes || []);
    }
    return [];
}

// "Kategorija" select — depends on the chosen "Vrsta plovila".
function fillSubcatSelect(catSlug) {
    const sel = document.getElementById('nav-home-subcat');
    if (!sel) return;
    const types = vehicleTypesForCat(catSlug);
    if (!types.length) {
        sel.innerHTML = `<option value="">${t('all', 'Vse')}</option>`;
        sel.disabled = true;
    } else {
        sel.innerHTML = `<option value="">${t('all', 'Vse')}</option>` +
            types.map(vt => `<option value="${vt.value}">${t(vt.label)}</option>`).join('');
        sel.disabled = false;
    }
    // Rebuild the custom pill dropdown to reflect the new options.
    initCustomSelects();
}

function bindSearch() {
    const form = document.getElementById('navtikaHomeSearch');
    if (!form) return;

    // Search-mode pills (Išči oglase / Išči dražbe).
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

    // Length slider live display (Dual range)
    const sliderFrom = document.getElementById('nav-home-length-from');
    const sliderTo = document.getElementById('nav-home-length-to');
    const displayMin = document.getElementById('navHomeLengthMinDisplay');
    const displayMax = document.getElementById('navHomeLengthMaxDisplay');
    const track = document.getElementById('navHomeSliderTrack');
    const sliderWrap = document.getElementById('navHomeSliderWrap');

    if (sliderFrom && sliderTo && displayMin && displayMax && track) {
        const updateSlider = (e) => {
            let vMin = Number(sliderFrom.value);
            let vMax = Number(sliderTo.value);

            if (vMin > vMax) {
                if (e && e.target === sliderFrom) {
                    sliderFrom.value = vMax;
                    vMin = vMax;
                } else if (e && e.target === sliderTo) {
                    sliderTo.value = vMin;
                    vMax = vMin;
                } else {
                    sliderFrom.value = vMax;
                    vMin = vMax;
                }
            }

            displayMin.textContent = vMin;
            displayMax.textContent = vMax >= 50 ? '50+' : vMax;

            const pctMin = ((vMin - 3) / (50 - 3)) * 100;
            const pctMax = ((vMax - 3) / (50 - 3)) * 100;
            track.style.background = `linear-gradient(to right, rgba(255,255,255,0.08) ${pctMin}%, var(--color-primary-start) ${pctMin}%, var(--color-primary-start) ${pctMax}%, rgba(255,255,255,0.08) ${pctMax}%)`;
        };

        sliderFrom.addEventListener('input', updateSlider);
        sliderTo.addEventListener('input', updateSlider);

        // Bring the closer thumb to top on hover
        if (sliderWrap) {
            sliderWrap.addEventListener('mousemove', (e) => {
                const rect = sliderWrap.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const val = 3 + (clickX / width) * (50 - 3);
                const vMin = Number(sliderFrom.value);
                const vMax = Number(sliderTo.value);
                if (Math.abs(val - vMin) < Math.abs(val - vMax)) {
                    sliderFrom.style.zIndex = '4';
                    sliderTo.style.zIndex = '3';
                } else {
                    sliderTo.style.zIndex = '4';
                    sliderFrom.style.zIndex = '3';
                }
            });
        }

        updateSlider();
    }

    // Reset: restore slider display
    form.addEventListener('reset', () => {
        setTimeout(() => {
            if (sliderFrom && sliderTo) {
                sliderFrom.value = 3;
                sliderTo.value = 50;
                sliderFrom.dispatchEvent(new Event('input'));
            }
        }, 0);
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (e.submitter?.id === 'navHomeAdvLink') return;
        const cat = document.getElementById('nav-home-cat')?.value || 'colni';
        const sc = document.getElementById('nav-home-subcat')?.value || '';
        const lf = sliderFrom?.value || '';
        const lt = sliderTo?.value || '';
        const pt = document.getElementById('nav-home-power-to')?.value || '';
        const ht = document.getElementById('nav-home-hours-to')?.value || '';
        const prodaja = document.getElementById('homeNavProdajaToggle')?.checked;
        const najem = document.getElementById('homeNavNajemToggle')?.checked;
        const params = new URLSearchParams({ cat });
        if (sc) params.set('vtype', sc);
        if (lf && Number(lf) > 3) params.set('lengthFrom', lf);
        if (lt && Number(lt) < 50) params.set('lengthTo', lt);
        if (pt) params.set('powerTo', pt);
        if (ht) params.set('engineHoursTo', ht);
        if (prodaja) params.set('prodaja', '1');
        if (najem) params.set('najem', '1');
        const dest = homeSearchMode === 'drazbe' ? '/drazbe' : '/oglasi';
        window.location.hash = `${dest}?${params.toString()}`;
    });
}


// ── Sections ──────────────────────────────────────────────────────────────────
function renderFeatured(listings) {
    const section = document.getElementById('featured-section');
    const container = document.getElementById('featured-container');
    if (!container) return;
    const featured = listings.filter(l => l.isPremium || l.promotion?.tier === 'homepage' || l.promotion?.tier === 'sponsored');
    const list = (featured.length ? featured : listings).slice(0, 10);
    if (!list.length) return;
    if (section) section.style.display = '';
    container.innerHTML = list.map(card).join('');
    if (window.lucide) window.lucide.createIcons();
}

function renderSponsored(listings) {
    const track = document.getElementById('rotating-ads-container');
    if (!track) return;
    const list = listings.slice(0, 8);
    track.innerHTML = list.map(card).join('');
    if (window.lucide) window.lucide.createIcons();
}

function powerHp(l) {
    return l.powerHp || l.enginePowerHp || (l.enginePowerKw ? Math.round(l.enginePowerKw * 1.341) : (l.powerKw ? Math.round(l.powerKw * 1.341) : null));
}

function fmt(n) { return new Intl.NumberFormat('sl-SI').format(n); }

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initAutoScroll(trackId, prevId, nextId, speed = 0.5) {
    const track = document.getElementById(trackId);
    if (!track || !track.children.length) return;
    track.innerHTML += track.innerHTML;
    track.style.transition = 'none';
    let x = 0, paused = false;
    requestAnimationFrame(() => {
        const half = track.scrollWidth / 2;
        function tick() {
            if (!paused) {
                x += speed;
                if (x >= half) x = 0;
            }
            track.style.transform = `translateX(-${x}px)`;
            requestAnimationFrame(tick);
        }
        tick();
    });
    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });
    track.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    track.addEventListener('touchend', () => { setTimeout(() => { paused = false; }, 1200); }, { passive: true });
    const JUMP = 300;
    document.getElementById(prevId)?.addEventListener('click', () => { x = Math.max(0, x - JUMP); });
    document.getElementById(nextId)?.addEventListener('click', () => { x = Math.min(track.scrollWidth / 2, x + JUMP); });
}

function card(l) {
    const img = l.images?.exterior?.[0] || '/images/porsche.png';
    const price = l.isRental
        ? (l.rentalPricing?.perWeek ? `${fmt(l.rentalPricing.perWeek)} € / teden` : (l.price || '—'))
        : (l.price || (l.priceRaw ? `${fmt(l.priceRaw)} €` : '—'));
    const pills = [];
    if (l.lengthM) pills.push(`${l.lengthM} m`);
    const hp = powerHp(l); if (hp) pills.push(`${hp} KM`);
    if (l.year) pills.push(l.year);
    return `
    <a href="#/oglas?id=${encodeURIComponent(l.id)}" class="glass-card carousel-card" style="min-width:260px;max-width:280px;overflow:hidden;border-radius:1.25rem;text-decoration:none;color:inherit;display:flex;flex-direction:column;">
        <div style="position:relative;aspect-ratio:4/3;background:#e2e8f0;overflow:hidden;">
            <img src="${img}" alt="${esc(l.title || '')}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
            ${l.isRental ? `<span class="rental-badge" style="position:absolute;top:.6rem;left:.6rem;">Najem</span>` : ''}
        </div>
        <div style="padding:.85rem 1rem;display:flex;flex-direction:column;gap:.3rem;">
            <strong style="font-size:.95rem;">${esc(l.title || `${l.make} ${l.model}`)}</strong>
            <div style="display:flex;flex-wrap:wrap;gap:.3rem;">${pills.map(p => `<span class="adv-chip adv-chip-sm" style="font-size:.7rem;padding:.18rem .5rem;">${esc(String(p))}</span>`).join('')}</div>
            <strong style="color:var(--color-primary-start);">${esc(price)}</strong>
        </div>
    </a>`;
}
