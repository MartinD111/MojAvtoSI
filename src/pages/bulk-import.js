// bulk-import.js — B2B bulk listing import from a MojAvto AI Converter JSON file.
// Only accessible to verified business users.

import { mountB2BShell } from '../layouts/b2b-layout.js';
import { isVerifiedBusiness } from '../core/b2bContext.js';
import { createListing } from '../services/listingService.js';
import { ALL_EQUIPMENT_VALUES } from '../data/equipment.js';
import { currentUser } from '../lib/currentUser.js';
import { t } from '../core/i18n.js';

const REQUIRED_FORMAT = 'mojavto-bulk-v1';

// Required fields for vehicle itemType (same gate as createListing)
const VEHICLE_REQUIRED = ['priceEur', 'make', 'model', 'fuel'];

export async function initBulkImportPage() {
    const main = mountB2BShell({ activeRoute: '/b2b/bulk-import', title: t('bi_title', 'Skupinski uvoz oglasov') });
    if (!main) return;

    if (!isVerifiedBusiness()) {
        main.innerHTML = `
            <div class="b2b-empty">
                <p>${t('bi_not_verified', 'Ta funkcija je na voljo samo verificiranim poslovnim uporabnikom.')}</p>
                <a href="#/b2b" class="btn b2b-btn-primary">${t('bi_back_dashboard', 'Nazaj na pregled')}</a>
            </div>`;
        return;
    }

    renderUploadStep(main);
}

// ── Step 1: file picker ───────────────────────────────────────────────────────

function renderUploadStep(main) {
    main.innerHTML = `
        <div class="bi-wrap">
            <div class="b2b-card bi-upload-card">
                <div class="bi-upload-area" id="biDropZone">
                    <i data-lucide="file-json"></i>
                    <p class="bi-upload-hint">${t('bi_drop_hint', 'Povlecite datoteko .mojavto.json sem ali')}</p>
                    <label class="btn b2b-btn-primary bi-file-label">
                        ${t('bi_choose_file', 'Izberite datoteko')}
                        <input type="file" id="biFileInput" accept=".json" hidden>
                    </label>
                    <p class="bi-format-note">${t('bi_format_note', 'Sprejemamo samo datoteke v formatu mojavto-bulk-v1 (MojAvto AI Converter).')}</p>
                </div>
                <div id="biError" class="bi-error" hidden></div>
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    const fileInput = document.getElementById('biFileInput');
    const dropZone = document.getElementById('biDropZone');
    const errorEl = document.getElementById('biError');

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0], main, errorEl);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('bi-drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bi-drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('bi-drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file, main, errorEl);
    });
}

// ── File parsing ──────────────────────────────────────────────────────────────

function handleFile(file, main, errorEl) {
    const reader = new FileReader();
    reader.onload = evt => {
        let parsed;
        try {
            parsed = JSON.parse(evt.target.result);
        } catch {
            showError(errorEl, t('bi_err_json', 'Datoteka ni veljavna JSON datoteka.'));
            return;
        }
        if (parsed.format !== REQUIRED_FORMAT) {
            showError(errorEl, t('bi_err_format', `Format ni podprt. Pričakovano: ${REQUIRED_FORMAT}, prejeto: "${parsed.format || '?'}".`));
            return;
        }
        if (!Array.isArray(parsed.listings) || parsed.listings.length === 0) {
            showError(errorEl, t('bi_err_empty', 'Datoteka ne vsebuje nobenih oglasov.'));
            return;
        }
        renderPreviewStep(main, parsed.listings);
    };
    reader.readAsText(file);
}

function showError(el, msg) {
    el.textContent = msg;
    el.hidden = false;
}

// ── Step 2: preview table ─────────────────────────────────────────────────────

function validateDraft(draft) {
    const missing = VEHICLE_REQUIRED.filter(k => !draft[k]);
    return missing;
}

function filterEquipment(eq) {
    if (!Array.isArray(eq)) return [];
    return eq.filter(v => v && ALL_EQUIPMENT_VALUES.includes(v));
}

function renderPreviewStep(main, rawListings) {
    // Annotate each draft with validity info and cleaned equipment
    const rows = rawListings.map((draft, idx) => {
        const missing = validateDraft(draft);
        const cleanDraft = { ...draft, equipment: filterEquipment(draft.equipment) };
        return { idx, draft: cleanDraft, missing, selected: missing.length === 0 };
    });

    main.innerHTML = `
        <div class="bi-wrap">
            <div class="b2b-card">
                <div class="bi-preview-header">
                    <div>
                        <h2>${t('bi_preview_title', 'Pregled uvoza')}</h2>
                        <p class="bi-preview-sub" id="biSelCount"></p>
                    </div>
                    <div class="bi-preview-actions">
                        <button id="biSelectAll" class="btn b2b-btn-secondary">${t('bi_select_all', 'Izberi vse veljavne')}</button>
                        <button id="biImportBtn" class="btn b2b-btn-primary" disabled>
                            <i data-lucide="upload"></i> <span id="biImportBtnLabel">${t('bi_import_btn', 'Ustvari oglase')}</span>
                        </button>
                    </div>
                </div>

                <div class="bi-table-wrap">
                    <table class="bi-table" id="biTable">
                        <thead>
                            <tr>
                                <th class="bi-col-check"></th>
                                <th>${t('bi_col_vehicle', 'Vozilo')}</th>
                                <th>${t('bi_col_year', 'Letnik')}</th>
                                <th>${t('bi_col_fuel', 'Gorivo')}</th>
                                <th>${t('bi_col_price', 'Cena')}</th>
                                <th>${t('bi_col_status', 'Status')}</th>
                            </tr>
                        </thead>
                        <tbody id="biTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    renderTableRows(rows);
    updateSelCount(rows);

    document.getElementById('biSelectAll').addEventListener('click', () => {
        rows.forEach(r => { if (r.missing.length === 0) r.selected = true; });
        renderTableRows(rows);
        updateSelCount(rows);
    });

    document.getElementById('biImportBtn').addEventListener('click', () => {
        const selected = rows.filter(r => r.selected);
        if (selected.length > 0) runImport(main, selected.map(r => r.draft));
    });
}

function renderTableRows(rows) {
    const tbody = document.getElementById('biTableBody');
    if (!tbody) return;
    tbody.innerHTML = rows.map(r => {
        const valid = r.missing.length === 0;
        const badgeClass = valid ? 'bi-badge-ok' : 'bi-badge-err';
        const badgeLabel = valid
            ? t('bi_valid', 'Veljavno')
            : t('bi_invalid', `Manjka: ${r.missing.join(', ')}`);
        const vehicleName = [r.draft.make, r.draft.model, r.draft.variant].filter(Boolean).join(' ') || '—';
        const price = r.draft.priceEur ? `${Number(r.draft.priceEur).toLocaleString('sl-SI')} €` : '—';
        return `
            <tr class="bi-row ${!valid ? 'bi-row-invalid' : ''} ${r.selected ? 'bi-row-selected' : ''}" data-idx="${r.idx}">
                <td class="bi-col-check">
                    <input type="checkbox" class="bi-row-check" data-idx="${r.idx}"
                        ${r.selected ? 'checked' : ''} ${!valid ? 'disabled' : ''}>
                </td>
                <td class="bi-col-vehicle">${esc(vehicleName)}</td>
                <td>${esc(String(r.draft.year || '—'))}</td>
                <td>${esc(r.draft.fuel || '—')}</td>
                <td>${esc(price)}</td>
                <td><span class="bi-badge ${badgeClass}">${esc(badgeLabel)}</span></td>
            </tr>`;
    }).join('');

    tbody.querySelectorAll('.bi-row-check').forEach(cb => {
        cb.addEventListener('change', () => {
            const idx = Number(cb.dataset.idx);
            const row = rows[idx];
            if (row) {
                row.selected = cb.checked;
                const tr = tbody.querySelector(`tr[data-idx="${idx}"]`);
                tr?.classList.toggle('bi-row-selected', cb.checked);
            }
            updateSelCount(rows);
        });
    });
}

function updateSelCount(rows) {
    const sel = rows.filter(r => r.selected).length;
    const total = rows.length;
    const invalid = rows.filter(r => r.missing.length > 0).length;
    const countEl = document.getElementById('biSelCount');
    const btnEl = document.getElementById('biImportBtn');
    const btnLabel = document.getElementById('biImportBtnLabel');
    if (countEl) {
        let msg = t('bi_sel_count', `Izbrano: ${sel} / ${total}`).replace('{sel}', sel).replace('{total}', total);
        if (invalid > 0) msg += ` — ${invalid} ${t('bi_invalid_count', 'neveljavnih (preskočeno)')}`;
        countEl.textContent = msg;
    }
    if (btnEl) btnEl.disabled = sel === 0;
    if (btnLabel) {
        btnLabel.textContent = sel > 0
            ? t('bi_import_btn_n', `Ustvari ${sel} oglas(ov)`).replace('{n}', sel)
            : t('bi_import_btn', 'Ustvari oglase');
    }
}

// ── Step 3: import execution ──────────────────────────────────────────────────

async function runImport(main, drafts) {
    const user = currentUser();
    if (!user) {
        alert(t('bi_err_auth', 'Niste prijavljeni. Prosimo, prijavite se in poskusite znova.'));
        return;
    }

    main.innerHTML = `
        <div class="bi-wrap">
            <div class="b2b-card">
                <h2>${t('bi_importing', 'Uvažam oglase…')}</h2>
                <div class="bi-progress-bar"><div class="bi-progress-fill" id="biProgressFill" style="width:0%"></div></div>
                <p class="bi-progress-label" id="biProgressLabel">0 / ${drafts.length}</p>
                <div id="biResultsList" class="bi-results-list"></div>
            </div>
        </div>`;

    const results = [];
    const fillEl = document.getElementById('biProgressFill');
    const labelEl = document.getElementById('biProgressLabel');
    const listEl = document.getElementById('biResultsList');

    for (let i = 0; i < drafts.length; i++) {
        const draft = { ...drafts[i], entryType: 'bulk-import' };
        let id = null;
        let err = null;
        try {
            id = await createListing(draft, [], [], user);
        } catch (e) {
            err = e.message || String(e);
        }
        results.push({ draft, id, err });

        const pct = Math.round(((i + 1) / drafts.length) * 100);
        if (fillEl) fillEl.style.width = `${pct}%`;
        if (labelEl) labelEl.textContent = `${i + 1} / ${drafts.length}`;

        // Render row as we go
        if (listEl) {
            const vehicleName = [draft.make, draft.model, draft.variant].filter(Boolean).join(' ') || '—';
            const row = document.createElement('div');
            row.className = `bi-result-row ${err ? 'bi-result-err' : 'bi-result-ok'}`;
            if (err) {
                row.innerHTML = `<i data-lucide="x-circle"></i> <span class="bi-result-name">${esc(vehicleName)}</span> <span class="bi-result-msg">${esc(err)}</span>`;
            } else {
                const editUrl = `#/novi-oglas?id=${id}`;
                row.innerHTML = `<i data-lucide="check-circle"></i> <span class="bi-result-name">${esc(vehicleName)}</span> <a href="${editUrl}" target="_blank" class="bi-result-link">${t('bi_add_photos', 'Dodaj fotografije →')}</a>`;
            }
            listEl.appendChild(row);
            if (window.lucide) window.lucide.createIcons();
        }
    }

    renderResultsStep(main, results);
}

// ── Step 4: completion ────────────────────────────────────────────────────────

function renderResultsStep(main, results) {
    const ok = results.filter(r => r.id);
    const failed = results.filter(r => r.err);

    const linksText = ok.map(r => {
        const name = [r.draft.make, r.draft.model, r.draft.variant].filter(Boolean).join(' ') || r.id;
        return `${name}: ${window.location.origin}${window.location.pathname}#/novi-oglas?id=${r.id}`;
    }).join('\n');

    main.innerHTML = `
        <div class="bi-wrap">
            <div class="b2b-card">
                <h2>${t('bi_done_title', 'Uvoz zaključen')}</h2>
                <p class="bi-done-summary">
                    <span class="bi-badge bi-badge-ok">${ok.length} ${t('bi_done_ok', 'uspešno')}</span>
                    ${failed.length > 0 ? `<span class="bi-badge bi-badge-err">${failed.length} ${t('bi_done_err', 'neuspešno')}</span>` : ''}
                </p>

                ${ok.length > 0 ? `
                <div class="bi-links-section">
                    <div class="bi-links-header">
                        <span>${t('bi_links_title', 'Oglasi — dodajte fotografije')}</span>
                        <button id="biCopyAll" class="btn b2b-btn-secondary bi-copy-btn">
                            <i data-lucide="copy"></i> ${t('bi_copy_links', 'Kopiraj vse povezave')}
                        </button>
                    </div>
                    <div class="bi-links-list">
                        ${ok.map(r => {
                            const name = [r.draft.make, r.draft.model, r.draft.variant].filter(Boolean).join(' ') || r.id;
                            const editUrl = `#/novi-oglas?id=${r.id}`;
                            return `<div class="bi-link-row">
                                <span class="bi-link-name">${esc(name)}</span>
                                <a href="${editUrl}" class="bi-result-link" target="_blank">${t('bi_add_photos', 'Dodaj fotografije →')}</a>
                            </div>`;
                        }).join('')}
                    </div>
                </div>` : ''}

                ${failed.length > 0 ? `
                <div class="bi-errors-section">
                    <h3>${t('bi_failed_title', 'Neuspeli oglasi')}</h3>
                    ${failed.map(r => {
                        const name = [r.draft.make, r.draft.model, r.draft.variant].filter(Boolean).join(' ') || '—';
                        return `<div class="bi-result-row bi-result-err"><i data-lucide="x-circle"></i> ${esc(name)} — ${esc(r.err)}</div>`;
                    }).join('')}
                </div>` : ''}

                <div class="bi-done-actions">
                    <a href="#/b2b" class="btn b2b-btn-secondary">${t('bi_back_dashboard', 'Nazaj na pregled')}</a>
                    <button id="biImportAnother" class="btn b2b-btn-primary">${t('bi_import_another', 'Uvozi novo datoteko')}</button>
                </div>
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('biCopyAll')?.addEventListener('click', () => {
        navigator.clipboard.writeText(linksText).then(() => {
            const btn = document.getElementById('biCopyAll');
            if (btn) btn.textContent = t('bi_copied', 'Kopirano!');
        }).catch(() => {});
    });

    document.getElementById('biImportAnother')?.addEventListener('click', () => {
        renderUploadStep(main);
    });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
