// Shared utilities for vehicle listing cards (US-localized)
import { getCurrentLang } from '../core/i18n.js';

// =====================================================================
// US LOCALIZATION HELPERS
// Stored data may still be in metric (km, kW, l/100km, EUR). These helpers
// convert on display only. Pass values through these before rendering.
// =====================================================================

export const KM_TO_MI = 0.621371;
export const KW_TO_HP = 1.34102;
// MPG (US) from L/100km: 235.215 / L100km
export const L100KM_TO_MPG = (l) => (l > 0 ? 235.215 / l : 0);

export function kmToMiles(km) {
    if (km === undefined || km === null || isNaN(km)) return null;
    return Math.round(Number(km) * KM_TO_MI);
}

export function kwToHp(kw) {
    if (kw === undefined || kw === null || isNaN(kw)) return null;
    return Math.round(Number(kw) * KW_TO_HP);
}

export function l100kmToMpg(l) {
    const v = parseFloat(l);
    if (!v || isNaN(v)) return null;
    return Math.round(L100KM_TO_MPG(v));
}

// Formats price in USD with US thousands separator. Accepts a number stored
// in EUR or USD (we treat stored numeric value as already-USD for display).
export function formatPrice(value) {
    if (value === undefined || value === null || value === '') return '';
    const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, ''));
    if (isNaN(n)) return '';
    return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
}

export function formatMiles(km) {
    const mi = kmToMiles(km);
    if (mi === null) return '';
    return new Intl.NumberFormat('en-US').format(mi) + ' mi';
}

export function formatHp(kw) {
    const hp = kwToHp(kw);
    if (hp === null) return '';
    return hp + ' HP';
}

export function formatMpg(l) {
    if (l === undefined || l === null) return '';
    const v = parseFloat(l);
    if (isNaN(v)) return '';
    return v.toFixed(1) + ' L/100km';
}

export const FUEL_MAP = {
    'petrol':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'bencin':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'benzin':            { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'b':                 { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'gasoline':          { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'gas':               { code: 'P',   cls: 'fuel-pill-P',  icon: 'fuel',     title: 'Petrol' },
    'diesel':            { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'dizel':             { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'd':                 { code: 'D',   cls: 'fuel-pill-D',  icon: 'fuel',     title: 'Diesel' },
    'hibrid':            { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'hybrid':            { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'h':                 { code: 'H',   cls: 'fuel-pill-H',  icon: 'zap',      title: 'Hybrid' },
    'priključni hibrid': { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'plug-in hybrid':    { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'ph':                { code: 'PH',  cls: 'fuel-pill-HB', icon: 'plug-zap', title: 'Plug-in Hybrid' },
    'elektrika':         { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'električno':        { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'electric':          { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'e':                 { code: 'E',   cls: 'fuel-pill-E',  icon: 'zap',      title: 'Electric' },
    'lpg':               { code: 'LPG', cls: 'fuel-pill-LPG',icon: 'flame',    title: 'LPG' },
};

export function getFuelPill(car) {
    if (!car) return '';
    const fuelStr = typeof car === 'object' ? car.fuel : car;
    if (!fuelStr) return '';

    const key = fuelStr.toLowerCase().trim();
    const isElectric = key === 'elektrika' || key === 'električno' || key === 'electric' || key === 'e';
    


    const f = FUEL_MAP[key] || { code: 'E', cls: 'fuel-pill-E', icon: 'zap', title: 'Electric' };
    return `<div class="spec-pill fuel-coded ${f.cls}" title="${f.title}">
        <i data-lucide="${f.icon}"></i>
        <strong>${f.code}</strong>
    </div>`;
}

export function getPowerPill(powerKw) {
    if (!powerKw) return '';
    const hp = kwToHp(powerKw);
    return `<div class="spec-pill power-pill" data-kw="${powerKw}" data-hp="${hp}">
        <i data-lucide="zap"></i>
        <span class="power-val">${hp} HP</span>
    </div>`;
}

export function getConsumptionPill(car) {
    const fuelKey = (car.fuel || '').toLowerCase().trim();

    if (fuelKey === 'elektrika' || fuelKey === 'električno' || fuelKey === 'electric' || fuelKey === 'e') {
        if (!car.electricRangeKm) return '';
        const rangeMi = kmToMiles(car.electricRangeKm);
        let statusCls = 'status-low';
        if (rangeMi <= 155) statusCls = 'status-high';
        else if (rangeMi <= 250) statusCls = 'status-medium';

        return `<div class="spec-pill consumption-pill ${statusCls}" title="EPA Range">
            <i data-lucide="battery-charging"></i>
            ${rangeMi} mi
        </div>`;
    }

    const cons = parseFloat(car.fuelL100kmCombined || car.fuelL100km);
    if (!cons) return '';

    let statusCls = 'status-medium';
    if (cons <= 5.0) statusCls = 'status-low';
    else if (cons >= 7.0) statusCls = 'status-high';

    if (car.electricRangeKm && cons) {
        return `<div class="spec-pill consumption-pill ${statusCls}" title="Consumption / EV Range">
            <i data-lucide="droplets"></i>
            ${cons.toFixed(1)} L/100km · ${kmToMiles(car.electricRangeKm)} mi E
        </div>`;
    }

    return `<div class="spec-pill consumption-pill ${statusCls}" title="Fuel Economy">
        <i data-lucide="droplets"></i>
        ${cons.toFixed(1)} L/100km
    </div>`;
}

export function getTransmissionPill(car) {
    if (!car) return '';
    
    const transStr = typeof car === 'object' ? car.transmission : car;
    const fuelStr = typeof car === 'object' ? car.fuel : '';
    
    const fuelKey = (fuelStr || '').toLowerCase().trim();
    const isElectric = fuelKey === 'elektrika' || fuelKey === 'električno' || fuelKey === 'electric' || fuelKey === 'e';

    // If it's an electric vehicle, there should be no transmission pill at all (since they are all automatic)
    if (isElectric) {
        return '';
    }

    if (!transStr) return '';

    const t = transStr.toLowerCase().trim();
    let code = 'A';
    let label = 'Automatic';
    let typeCls = 'type-auto';

    if (t.includes('roč') || t.includes('manual')) {
        code = 'R';
        label = 'Manual';
        typeCls = 'type-manual';
    }
    else if (t.includes('sekven') || t.includes('sequen')) {
        code = 'S';
        label = 'Sequential';
        typeCls = 'type-auto';
    }

    let html = `<div class="spec-pill transmission-pill ${typeCls}" title="Transmission: ${label}">
        <i data-lucide="settings"></i>
        <strong>${code}</strong>
    </div>`;

    // For motorcycles (pri motorjih), add stroke and engine type pills to the right of transmission
    if (typeof car === 'object' && (car.category === 'moto' || car.category === 'motor')) {
        if (car.engineStroke) {
            html += `
            <div class="spec-pill stroke-pill" title="Takt motorja: ${car.engineStroke}">
                <i data-lucide="activity"></i>
                <strong>${car.engineStroke}</strong>
            </div>`;
        }
        if (car.engineType) {
            html += `
            <div class="spec-pill type-pill" title="Vrsta motorja: ${car.engineType}">
                <i data-lucide="cpu"></i>
                <strong>${car.engineType}</strong>
            </div>`;
        }
    }

    return html;
}

export function getYearPill(year) {
    if (!year) return '';
    return `<div class="spec-pill year-pill">
        <i data-lucide="calendar"></i>
        <span>${year}</span>
    </div>`;
}

export function getKmPill(km) {
    if (km === undefined || km === null) return '';
    const formatted = typeof km === 'number'
        ? new Intl.NumberFormat('en-US').format(kmToMiles(km)) + ' mi'
        : km;
    return `<div class="spec-pill km-pill">
        <i data-lucide="gauge"></i>
        <span>${formatted}</span>
    </div>`;
}

export function formatDisplacement(cc, unit, lang = 'sl') {
    if (!cc || isNaN(cc)) return '';
    
    if (unit === 'l') {
        const liters = cc / 1000;
        // Round to 1 decimal place
        const rounded = Number(liters.toFixed(1));
        const formatted = lang === 'sl'
            ? rounded.toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
            : rounded.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        return formatted + 'L';
    } else {
        // cc format
        const formatted = lang === 'sl'
            ? new Intl.NumberFormat('sl-SI').format(cc)
            : new Intl.NumberFormat('en-US').format(cc);
        return formatted + (lang === 'sl' ? ' cc' : ' cc'); // Slovenians usually write 'cc' or 'ccm' (let's use cc for standard)
    }
}

export function getDisplacementPill(engineCc) {
    if (!engineCc) return '';
    const unit = localStorage.getItem('mojavto_displacement_unit') || 'cc';
    const lang = getCurrentLang();
    const formatted = formatDisplacement(engineCc, unit, lang);
    return `<div class="spec-pill displacement-pill" data-cc="${engineCc}">
        <i data-lucide="cog"></i>
        <span class="displacement-val">${formatted}</span>
    </div>`;
}
