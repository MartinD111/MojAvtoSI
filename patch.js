const fs = require('fs');
let code = fs.readFileSync('src/pages/oglasi.navtika.js', 'utf8');

// Replace applySidebarFilters
code = code.replace(/function applySidebarFilters\(\) \{[\s\S]*?\n\s+const params = parseHashParams\(\);/m, 
unction applySidebarFilters() {
    const make = document.getElementById("sidebarMake")?.value || '';
    const model = document.getElementById("sidebarModel")?.value || '';
    const lengthFrom = parseFloat(document.getElementById("sidebarLengthFrom")?.value) || 0;
    const lengthTo = parseFloat(document.getElementById("sidebarLengthTo")?.value) || Infinity;
    const yearFrom = parseInt(document.getElementById("sidebarYearFrom")?.value, 10) || 0;
    const yearTo = parseInt(document.getElementById("sidebarYearTo")?.value, 10) || Infinity;
    const priceTo = parseFormattedNumber(document.getElementById("sidebarPriceTo")?.value) || Infinity;
    const powerFrom = parseInt(document.getElementById("sidebarPowerFrom")?.value, 10) || 0;
    const powerTo = parseInt(document.getElementById("sidebarPowerTo")?.value, 10) || Infinity;
    const engineHoursTo = parseInt(document.getElementById("sidebarEngineHoursTo")?.value, 10) || Infinity;
    const hull = document.getElementById("sidebarHull")?.value || '';
    
    const form = document.getElementById("sidebarFiltersForm");
    let fuels = [];
    if (form) {
        const fd = new FormData(form);
        fuels = fd.getAll("fuel").filter(Boolean);
    }
    const params = parseHashParams(););

// Replace building URL params
code = code.replace(/if \(make\) params\.set\('make', make\);[\s\S]*?if \(sellerType\) params\.set\('sellerType', sellerType\);/m,
if (make) params.set('make', make);
if (model) params.set('model', model);
if (lengthFrom > 0) params.set('lengthFrom', lengthFrom);
if (lengthTo < Infinity) params.set('lengthTo', lengthTo);
if (yearFrom > 0) params.set('yearFrom', yearFrom);
if (yearTo < Infinity) params.set('yearTo', yearTo);
if (priceTo < Infinity) params.set('priceTo', priceTo);
if (powerFrom > 0) params.set('powerFrom', powerFrom);
if (powerTo < Infinity) params.set('powerTo', powerTo);
if (engineHoursTo < Infinity) params.set('engineHoursTo', engineHoursTo);
if (hull) params.set('hull', hull);
if (fuels.length > 0) params.set('fuel', fuels.join(',')););

// Replace the filtering logic
code = code.replace(/const filtered = _allActiveListings\.filter\(car => \{[\s\S]*?const sorted = sortListings\(filtered, currentSort\);/m,
const filtered = _allActiveListings.filter(car => {
    if (!['plovilo', 'motor'].includes(car.itemType)) return false;
    if (cat && car.category !== cat) return false;
    if (najem === '1' && !car.isRental) return false;
    if (najem !== '1' && car.isRental) return false;
    
    const urlMake = params.get('make');
    const urlModel = params.get('model');
    if (urlMake && car.make !== urlMake) return false;
    if (urlModel && car.model !== urlModel) return false;

    const price = car.priceRaw ?? car.priceEur ?? null;
    const pTo = params.get('priceTo') ? parseFloat(params.get('priceTo')) : Infinity;
    if (pTo < Infinity && price != null && price > pTo) return false;

    const year = Number(car.year) || null;
    const yFrom = params.get('yearFrom') ? parseInt(params.get('yearFrom'), 10) : 0;
    const yTo = params.get('yearTo') ? parseInt(params.get('yearTo'), 10) : Infinity;
    if (yFrom > 0 && year && year < yFrom) return false;
    if (yTo < Infinity && year && year > yTo) return false;

    const lFrom = params.get('lengthFrom') ? parseFloat(params.get('lengthFrom')) : 0;
    const lTo = params.get('lengthTo') ? parseFloat(params.get('lengthTo')) : Infinity;
    if (lFrom > 0 && (car.lengthM || 0) < lFrom) return false;
    if (lTo < Infinity && car.lengthM && car.lengthM > lTo) return false;

    const powerHp = (l) => l.powerHp || (l.powerKW ? Math.round(l.powerKW * 1.35962) : null);
    const hp = powerHp(car);
    const pwFrom = params.get('powerFrom') ? parseInt(params.get('powerFrom'), 10) : 0;
    const pwTo = params.get('powerTo') ? parseInt(params.get('powerTo'), 10) : Infinity;
    if (pwFrom > 0 && hp && hp < pwFrom) return false;
    if (pwTo < Infinity && hp && hp > pwTo) return false;

    const ehTo = params.get('engineHoursTo') ? parseInt(params.get('engineHoursTo'), 10) : Infinity;
    if (ehTo < Infinity && car.engineHours && car.engineHours > ehTo) return false;

    const urlHull = params.get('hull');
    if (urlHull && car.hullMaterial !== urlHull) return false;

    const urlFuel = params.get('fuel');
    if (urlFuel) {
        const fuels = urlFuel.split(',');
        if (!fuels.includes(car.fuel)) return false;
    }
    return true;
});

const sorted = sortListings(filtered, currentSort););

// Replace prefilling logic
code = code.replace(/document\.querySelectorAll\('#sidebarFiltersForm input\[name="fuel"\]'\);[\s\S]*?if \(!make\) \{/m,
document.querySelectorAll('#sidebarFiltersForm input[name="fuel"]');
    fuelCheckboxes.forEach(cb => {
        cb.checked = fuels.includes(cb.value);
    });
}
const urlHull = params.get('hull');
if (urlHull) {
    const sel = document.getElementById("sidebarHull");
    if (sel) sel.value = urlHull;
}
const ehto = params.get('engineHoursTo');
if (ehto) {
    const el = document.getElementById("sidebarEngineHoursTo");
    if (el) el.value = ehto;
}
const pfrom = params.get('powerFrom');
if (pfrom) {
    const el = document.getElementById("sidebarPowerFrom");
    if (el) el.value = pfrom;
}
const lfrom = params.get('lengthFrom');
if (lfrom) {
    const el = document.getElementById("sidebarLengthFrom");
    if (el) el.value = lfrom;
}
const lto = params.get('lengthTo');
if (lto) {
    const el = document.getElementById("sidebarLengthTo");
    if (el) el.value = lto;
}
if (!make) {);

fs.writeFileSync('src/pages/oglasi.navtika.js', code, 'utf8');
console.log('Patched');
