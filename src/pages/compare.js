// Compare page — renders side-by-side comparison of selected vehicles/vessels
import { escHtml } from '../utils/escHtml.js';
import { key as lsKey } from '../config/storageKeys.js';

const ALL_FIELDS = [
    { key: 'year',         label: 'Letnik',           icon: 'calendar'   },
    { key: 'mileage',      label: 'Prevoženi km',     icon: 'gauge'       },
    { key: 'power',        label: 'Moč',              icon: 'settings-2'  },
    { key: 'fuel',         label: 'Gorivo',           icon: 'fuel'        },
    { key: 'transmission', label: 'Menjalnik',        icon: 'cog'         },
    { key: 'consumption',  label: 'Poraba',           icon: 'droplets'    },
    { key: 'owners',       label: 'Število lastnikov', icon: 'users'     },
    { key: 'location',     label: 'Lokacija',         icon: 'map-pin'     },
    { key: 'seller',       label: 'Prodajalec',       icon: 'user'        },
    { key: 'engineType',   label: 'Tip motorja',      icon: 'cpu',        motoOnly: true },
    { key: 'engineStroke', label: 'Takt motorja',     icon: 'activity',   motoOnly: true },
];

const STORAGE_KEY_FIELDS = lsKey('compare_fields');
const DEFAULT_VISIBLE = ['year', 'mileage', 'power', 'fuel', 'location', 'seller'];

function getVisibleFields() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_FIELDS);
        if (saved) return JSON.parse(saved);
    } catch (_) {}
    return DEFAULT_VISIBLE;
}

function saveVisibleFields(keys) {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(keys));
}

export function initComparePage() {
    console.log('[ComparePage] init');
    renderComparison();
}

function renderComparison() {
    const container = document.getElementById('compareContent');
    if (!container) return;

    const compareList = JSON.parse(localStorage.getItem(lsKey('compare')) || '[]');

    if (compareList.length === 0) {
        container.innerHTML = `
            <div class="compare-empty">
                <i data-lucide="scale" class="compare-empty-icon"></i>
                <h2>Niste izbrali nobenega vozila za primerjavo</h2>
                <p>Pojdite na oglasno desko in pri oglasih kliknite na ikono tehtnice, da jih dodate v primerjavo.</p>
                <a href="#/oglasi"><i data-lucide="search" style="width:16px;height:16px;"></i> Pojdi na oglase</a>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    const visibleFields = getVisibleFields();
    const colClass = compareList.length === 2 ? 'cols-2' : (compareList.length === 3 ? 'cols-3' : 'cols-2');

    let gridHTML = `<div class="compare-grid ${colClass}">`;

    compareList.forEach(car => {
        const rating = car.priceRating || { score: 2, label: 'Povprečna cena', color: 'amber' };

        const specRows = ALL_FIELDS
            .filter(f => visibleFields.includes(f.key))
            .map(f => `
                <div class="compare-spec-row">
                    <span class="compare-spec-label"><i data-lucide="${f.icon}"></i> ${f.label}</span>
                    <span class="compare-spec-value">${escHtml(car[f.key] || '—')}</span>
                </div>`)
            .join('');

        gridHTML += `
        <div class="compare-col" data-compare-id="${car.id}">
            <div class="compare-col-img">
                <img src="${car.image}" alt="${escHtml(car.title)}" loading="lazy">
            </div>
            <div class="compare-col-header">
                <h2 class="compare-col-title">${escHtml(car.title)}</h2>
                <p class="compare-col-subtitle">${escHtml(car.subtitle || '')}</p>
                <div class="compare-col-price-row">
                    <span class="compare-col-price">${car.price || '—'}</span>
                    <span class="price-rating rating-${rating.color}">${rating.label}</span>
                </div>
            </div>
            <div class="compare-specs">${specRows}</div>
            <div class="compare-col-footer">
                <button class="compare-remove-btn" data-remove-id="${car.id}">
                    <i data-lucide="x"></i> Odstrani
                </button>
                <button class="compare-contact-btn">
                    <i data-lucide="mail"></i> Kontakt
                </button>
            </div>
        </div>`;
    });

    gridHTML += '</div>';

    gridHTML += `
        <div class="compare-actions">
            <button class="compare-clear-all" id="clearAllCompare">Počisti vse</button>
            <button class="compare-edit-fields-btn" id="editFieldsBtn">
                <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i> Uredi polja
            </button>
            ${compareList.length < 3 ? '<a href="#/oglasi" class="compare-add-more"><i data-lucide="plus" style="width:16px;height:16px;"></i> Dodaj vozilo</a>' : ''}
        </div>
    `;

    // Field editor modal
    gridHTML += buildFieldModal(visibleFields, compareList);

    container.innerHTML = gridHTML;

    if (window.lucide) window.lucide.createIcons();

    // Remove buttons
    container.querySelectorAll('.compare-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const removeId = btn.getAttribute('data-remove-id');
            let list = JSON.parse(localStorage.getItem(lsKey('compare')) || '[]');
            list = list.filter(c => c.id !== removeId);
            localStorage.setItem(lsKey('compare'), JSON.stringify(list));
            if (window.updateHeaderCompare) window.updateHeaderCompare();
            renderComparison();
        });
    });

    // Clear all
    const clearBtn = document.getElementById('clearAllCompare');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            localStorage.setItem(lsKey('compare'), JSON.stringify([]));
            if (window.updateHeaderCompare) window.updateHeaderCompare();
            renderComparison();
        });
    }

    // Edit fields modal
    bindFieldModal(container);
}

function buildFieldModal(visibleFields, compareList) {
    const hasMoto = compareList.some(c => c.category === 'moto');
    const fields = ALL_FIELDS.filter(f => !f.motoOnly || hasMoto);

    const checkboxes = fields.map(f => `
        <label class="cfe-field-row">
            <input type="checkbox" class="cfe-checkbox" value="${f.key}" ${visibleFields.includes(f.key) ? 'checked' : ''}>
            <i data-lucide="${f.icon}" class="cfe-field-icon"></i>
            <span>${f.label}</span>
            <span class="cfe-toggle" aria-hidden="true"></span>
        </label>`).join('');

    return `
        <div class="cfe-backdrop" id="cfeBackdrop" style="display:none;">
            <div class="cfe-modal" role="dialog" aria-modal="true" aria-label="Uredi prikazana polja">
                <div class="cfe-modal-header">
                    <span class="cfe-modal-title">Prikazana polja</span>
                    <button class="cfe-close-btn" id="cfeClose" aria-label="Zapri">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="cfe-field-list">${checkboxes}</div>
                <div class="cfe-modal-footer">
                    <button class="cfe-reset-btn" id="cfeReset">Privzeto</button>
                    <button class="cfe-save-btn" id="cfeSave">Shrani</button>
                </div>
            </div>
        </div>
    `;
}

function bindFieldModal(container) {
    const backdrop = container.querySelector('#cfeBackdrop');
    const openBtn  = container.querySelector('#editFieldsBtn');
    const closeBtn = container.querySelector('#cfeClose');
    const saveBtn  = container.querySelector('#cfeSave');
    const resetBtn = container.querySelector('#cfeReset');

    const open  = () => { backdrop.style.display = 'flex'; if (window.lucide) window.lucide.createIcons(); };
    const close = () => { backdrop.style.display = 'none'; };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    saveBtn.addEventListener('click', () => {
        const checked = [...container.querySelectorAll('.cfe-checkbox:checked')].map(cb => cb.value);
        saveVisibleFields(checked);
        close();
        renderComparison();
    });

    resetBtn.addEventListener('click', () => {
        container.querySelectorAll('.cfe-checkbox').forEach(cb => {
            cb.checked = DEFAULT_VISIBLE.includes(cb.value);
        });
    });
}
