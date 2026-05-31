// Profile page — MojAvto.si
// Moja garaža: add/manage vehicles with tire info
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../services/garageService.js';
import { getBrands, getModels } from '../services/adminService.js';
import { t } from '../core/i18n.js';

export async function initProfilePage() {
    const container = document.getElementById('app-container');
    if (!container) return;

    const user = window.__currentUser;
    if (!user) { window.location.hash = '/prijava'; return; }

    container.innerHTML = `
    <div style="max-width:900px;margin:2rem auto;padding:0 1rem;">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
        ${user.photoURL
            ? `<img src="${user.photoURL}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;" />`
            : `<div style="width:56px;height:56px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">👤</div>`}
        <div>
          <h1 style="margin:0;font-size:1.5rem;font-weight:700;">${user.displayName || t('profile_user_fallback')}</h1>
          <p style="margin:0;color:#6b7280;font-size:0.9rem;">${user.email}</p>
        </div>
        <a href="#/dashboard" class="profile-back-link" style="margin-left:auto;font-size:0.85rem;font-weight:600;color:#2563eb;text-decoration:none;">${t('profile_back_to_dashboard')}</a>
      </div>

      <!-- Moja garaža -->
      <div class="profile-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <h2>${t('profile_my_garage')}</h2>
          <button id="btn-add-vehicle" style="font-size:0.85rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#2563eb,#4f46e5);border:none;padding:8px 20px;border-radius:9999px;cursor:pointer;transition:all 0.2s;">${t('profile_add_vehicle')}</button>
        </div>

        <!-- Add/edit form (hidden by default) -->
        <div id="vehicle-form-wrap" style="display:none;margin-bottom:1.5rem;">
          <div class="profile-form-container">
            <h3 id="vehicle-form-title">${t('profile_new_vehicle')}</h3>
            <form id="vehicle-form" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <div style="grid-column:1/-1;">
                <label>${t('profile_nickname_label')}</label>
                <input id="vf-nickname" type="text" placeholder="${t('profile_nickname_placeholder')}">
              </div>

              <div>
                <label>${t('profile_make_label')}</label>
                <select id="vf-make" required>
                  <option value="">${t('profile_select_make')}</option>
                </select>
              </div>
              <div>
                <label>${t('profile_model_label')}</label>
                <select id="vf-model" required>
                  <option value="">${t('profile_select_make_first')}</option>
                </select>
              </div>

              <div>
                <label>${t('profile_year_label')}</label>
                <input id="vf-year" type="number" min="1950" max="2026" required placeholder="${t('profile_year_placeholder')}">
              </div>
              <div>
                <label>${t('profile_fuel_label')}</label>
                <select id="vf-fuel">
                  <option value="">${t('profile_select_generic')}</option>
                  <option value="Petrol">${t('profile_fuel_petrol')}</option>
                  <option value="Dizel">${t('profile_fuel_diesel')}</option>
                  <option value="Električni">${t('profile_fuel_electric')}</option>
                  <option value="Hibrid">${t('profile_fuel_hybrid')}</option>
                  <option value="Plug-in hibrid">${t('profile_fuel_plugin_hybrid')}</option>
                  <option value="LPG">${t('profile_fuel_lpg')}</option>
                  <option value="CNG">${t('profile_fuel_cng')}</option>
                </select>
              </div>

              <div>
                <label>${t('profile_plate_label')}</label>
                <input id="vf-plate" type="text" placeholder="${t('profile_plate_placeholder')}" style="text-transform:uppercase;">
              </div>
              <div>
                <label>${t('profile_mileage_label')}</label>
                <input id="vf-km" type="number" min="0" placeholder="${t('profile_mileage_placeholder')}">
              </div>

              <!-- Tire section -->
              <div style="grid-column:1/-1;margin-top:0.5rem;">
                <div style="border-top:1.5px solid rgba(255,255,255,0.1);padding-top:1rem;">
                  <h4 style="margin:0 0 0.75rem;font-size:0.9rem;font-weight:700;">${t('profile_tires_title')}</h4>
                </div>
              </div>

              <div style="grid-column:1/-1;">
                <label>${t('profile_current_tire_type')}</label>
                <select id="vf-tire-season">
                  <option value="">${t('profile_select_generic')}</option>
                  <option value="letne">${t('profile_tire_summer')}</option>
                  <option value="zimske">${t('profile_tire_winter')}</option>
                  <option value="celoletne">${t('profile_tire_all_season')}</option>
                </select>
              </div>

              <!-- Letne pnevmatike -->
              <div style="grid-column:1/-1;">
                <p style="font-size:0.78rem;font-weight:700;color:#f59e0b;margin:0.5rem 0 0.4rem;">${t('profile_summer_tires_label')}</p>
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_width')}</label>
                <input id="vf-summer-width" type="number" placeholder="205">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_profile')}</label>
                <input id="vf-summer-profile" type="number" placeholder="55">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_rim')}</label>
                <input id="vf-summer-rim" type="number" placeholder="16">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_brand')}</label>
                <input id="vf-summer-brand" type="text" placeholder="Michelin">
              </div>

              <!-- Zimske pnevmatike -->
              <div style="grid-column:1/-1;">
                <p style="font-size:0.78rem;font-weight:700;color:#3b82f6;margin:0.5rem 0 0.4rem;">${t('profile_winter_tires_label')}</p>
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_width')}</label>
                <input id="vf-winter-width" type="number" placeholder="195">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_profile')}</label>
                <input id="vf-winter-profile" type="number" placeholder="65">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_rim')}</label>
                <input id="vf-winter-rim" type="number" placeholder="15">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t('profile_tire_brand')}</label>
                <input id="vf-winter-brand" type="text" placeholder="Continental">
              </div>

              <!-- Buttons -->
              <div style="grid-column:1/-1;display:flex;gap:0.75rem;margin-top:0.5rem;">
                <button type="submit" id="vf-submit" style="flex:1;padding:10px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border:none;border-radius:0.75rem;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:inherit;">${t('profile_save_vehicle')}</button>
                <button type="button" id="vf-cancel" style="padding:10px 20px;background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">${t('profile_cancel')}</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Vehicle list -->
        <div id="vehicles-container">
          <div style="text-align:center;padding:2rem;color:#9ca3af;">
            <i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i>
            <p style="margin:0.5rem 0 0;font-size:0.85rem;">${t('profile_loading_vehicles')}</p>
          </div>
        </div>
      </div>

      <!-- Nastavitve TCO -->
      <div class="profile-card" style="margin-top:2rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <div>
            <h2>💰 ${t('tco_settings_title') || 'TCO Settings'}</h2>
            <p style="margin:0.25rem 0 0;color:#64748b;font-size:0.85rem;">
              ${t('tco_settings_subtitle') || 'Configure your vehicle cost estimates'}
            </p>
          </div>
          <a href="#/nastavitve-tco" style="font-size:0.85rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#16a34a,#15803d);padding:8px 20px;border-radius:9999px;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
            ${t('cl_edit') || 'Edit'}
          </a>
        </div>
        <p style="margin:0;font-size:0.82rem;color:#64748b;">
          ${t('tco_settings_card_desc') || 'Adjust annual mileage, fuel prices, and other parameters to calculate the total cost of ownership (TCO) for vehicles.'}
        </p>
      </div>

      <!-- Back link -->
      <div style="text-align:center;margin-top:1.5rem;">
        <a href="#/dashboard" class="profile-back-link" style="font-size:0.9rem;color:#6b7280;text-decoration:none;">${t('profile_back_to_dashboard_link')}</a>
      </div>
    </div>
    `;

    // ── Load brands into make select ─────────────────────────────────────────
    const makeSelect = document.getElementById('vf-make');
    const modelSelect = document.getElementById('vf-model');
    let brandsCache = [];

    try {
        brandsCache = await getBrands('avto');
        brandsCache.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.name;
            opt.textContent = b.name;
            opt.dataset.brandId = b.id;
            makeSelect.appendChild(opt);
        });
    } catch (err) {
        console.error('[Profile] Failed to load brands:', err);
        // Fallback: let user type freely
        makeSelect.insertAdjacentHTML('afterend',
            `<input id="vf-make-text" type="text" placeholder="${t('profile_enter_make')}" style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-size:0.9rem;font-family:inherit;margin-top:4px;">`);
    }

    // ── Load models when brand changes ───────────────────────────────────────
    makeSelect.addEventListener('change', async () => {
        modelSelect.innerHTML = `<option value="">${t('profile_loading_generic')}</option>`;
        const brand = brandsCache.find(b => b.name === makeSelect.value);
        if (!brand) {
            modelSelect.innerHTML = `<option value="">${t('profile_select_model')}</option>`;
            return;
        }
        try {
            const models = await getModels(brand.id);
            modelSelect.innerHTML = `<option value="">${t('profile_select_model')}</option>`;
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.name;
                opt.textContent = m.name;
                modelSelect.appendChild(opt);
            });
        } catch {
            modelSelect.innerHTML = `<option value="">${t('profile_enter_model')}</option>`;
        }
    });

    // ── Show/hide form ───────────────────────────────────────────────────────
    const formWrap = document.getElementById('vehicle-form-wrap');
    const form = document.getElementById('vehicle-form');
    let editingId = null;

    document.getElementById('btn-add-vehicle').addEventListener('click', () => {
        editingId = null;
        form.reset();
        document.getElementById('vehicle-form-title').textContent = t('profile_new_vehicle_title');
        document.getElementById('vf-submit').textContent = t('profile_save_vehicle');
        formWrap.style.display = 'block';
        formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    document.getElementById('vf-cancel').addEventListener('click', () => {
        formWrap.style.display = 'none';
        editingId = null;
    });

    // ── Form submit ──────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('vf-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = t('profile_saving');

        const vehicle = {
            nickname: document.getElementById('vf-nickname').value.trim(),
            make: makeSelect.value || document.getElementById('vf-make-text')?.value?.trim() || '',
            model: modelSelect.value || '',
            year: Number(document.getElementById('vf-year').value) || 0,
            fuel: document.getElementById('vf-fuel').value,
            plate: document.getElementById('vf-plate').value.trim().toUpperCase(),
            mileageKm: Number(document.getElementById('vf-km').value) || 0,
            tires: {
                currentSeason: document.getElementById('vf-tire-season').value,
                summer: {
                    width: Number(document.getElementById('vf-summer-width').value) || null,
                    profile: Number(document.getElementById('vf-summer-profile').value) || null,
                    rim: Number(document.getElementById('vf-summer-rim').value) || null,
                    brand: document.getElementById('vf-summer-brand').value.trim(),
                },
                winter: {
                    width: Number(document.getElementById('vf-winter-width').value) || null,
                    profile: Number(document.getElementById('vf-winter-profile').value) || null,
                    rim: Number(document.getElementById('vf-winter-rim').value) || null,
                    brand: document.getElementById('vf-winter-brand').value.trim(),
                },
            },
        };

        try {
            if (editingId) {
                await updateVehicle(user.uid, editingId, vehicle);
            } else {
                await addVehicle(user.uid, vehicle);
            }
            formWrap.style.display = 'none';
            editingId = null;
            await renderVehicles();
        } catch (err) {
            console.error('[Profile] Save vehicle error:', err);
            alert(t('profile_error_saving'));
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = editingId ? t('profile_update_vehicle') : t('profile_save_vehicle');
        }
    });

    // ── Render vehicles list ─────────────────────────────────────────────────
    async function renderVehicles() {
        const vc = document.getElementById('vehicles-container');
        try {
            const vehicles = await getVehicles(user.uid);

            if (vehicles.length === 0) {
                vc.innerHTML = `
                    <div style="text-align:center;padding:2.5rem 1rem;color:#94a3b8;">
                        <div style="font-size:2.5rem;margin-bottom:0.5rem;">🚗</div>
                        <p style="margin:0;font-size:0.9rem;font-weight:500;">${t('profile_garage_empty')}</p>
                        <p style="margin:0.25rem 0 0;font-size:0.8rem;">${t('profile_garage_empty_hint')}</p>
                    </div>`;
                return;
            }

            vc.innerHTML = vehicles.map(v => {
                const tireLabel = formatTireLabel(v.tires);
                const seasonBadge = v.tires?.currentSeason
                    ? `<span style="font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:9999px;${seasonStyle(v.tires.currentSeason)}">${seasonText(v.tires.currentSeason)}</span>`
                    : '';

                return `
                <div class="profile-vehicle-card">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                                <span style="font-size:1.3rem;">🚗</span>
                                <h3>
                                    ${v.nickname || (v.make + ' ' + v.model)}
                                </h3>
                                ${seasonBadge}
                            </div>
                            <p>
                                ${v.nickname ? `${v.make} ${v.model}` : ''}
                                ${v.year ? (v.nickname ? ' · ' : '') + t('profile_year_label_short') + ' ' + v.year : ''}
                                ${v.fuel ? ' · ' + fuelText(v.fuel) : ''}
                                ${v.mileageKm ? ' · ' + formatNumber(v.mileageKm) + ' km' : ''}
                            </p>
                            ${v.plate ? `<p style="margin:0.15rem 0 0;font-size:0.78rem;color:#94a3b8;font-weight:600;letter-spacing:1px;">${v.plate}</p>` : ''}
                            ${tireLabel ? `<div style="margin-top:0.5rem;font-size:0.78rem;color:#475569;">${tireLabel}</div>` : ''}
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-shrink:0;">
                            <button class="edit-vehicle-btn" data-id="${v.id}" style="padding:6px 14px;font-size:0.78rem;font-weight:600;border:1.5px solid #e2e8f0;background:#f8fafc;color:#475569;border-radius:0.5rem;cursor:pointer;font-family:inherit;">${t('profile_edit')}</button>
                            <button class="delete-vehicle-btn" data-id="${v.id}" style="padding:6px 14px;font-size:0.78rem;font-weight:600;border:1.5px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:0.5rem;cursor:pointer;font-family:inherit;">${t('profile_delete')}</button>
                        </div>
                    </div>
                </div>`;
            }).join('');

            // Bind edit buttons
            vc.querySelectorAll('.edit-vehicle-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const v = vehicles.find(x => x.id === btn.dataset.id);
                    if (!v) return;
                    editingId = v.id;
                    document.getElementById('vehicle-form-title').textContent = t('profile_edit_vehicle_title');
                    document.getElementById('vf-submit').textContent = t('profile_update_vehicle');

                    document.getElementById('vf-nickname').value = v.nickname || '';
                    makeSelect.value = v.make || '';
                    makeSelect.dispatchEvent(new Event('change'));
                    setTimeout(() => { modelSelect.value = v.model || ''; }, 500);
                    document.getElementById('vf-year').value = v.year || '';
                    document.getElementById('vf-fuel').value = v.fuel || '';
                    document.getElementById('vf-plate').value = v.plate || '';
                    document.getElementById('vf-km').value = v.mileageKm || '';
                    document.getElementById('vf-tire-season').value = v.tires?.currentSeason || '';
                    document.getElementById('vf-summer-width').value = v.tires?.summer?.width || '';
                    document.getElementById('vf-summer-profile').value = v.tires?.summer?.profile || '';
                    document.getElementById('vf-summer-rim').value = v.tires?.summer?.rim || '';
                    document.getElementById('vf-summer-brand').value = v.tires?.summer?.brand || '';
                    document.getElementById('vf-winter-width').value = v.tires?.winter?.width || '';
                    document.getElementById('vf-winter-profile').value = v.tires?.winter?.profile || '';
                    document.getElementById('vf-winter-rim').value = v.tires?.winter?.rim || '';
                    document.getElementById('vf-winter-brand').value = v.tires?.winter?.brand || '';

                    formWrap.style.display = 'block';
                    formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
            });

            // Bind delete buttons
            vc.querySelectorAll('.delete-vehicle-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm(t('profile_confirm_delete'))) return;
                    btn.disabled = true;
                    btn.textContent = t('profile_deleting');
                    try {
                        await deleteVehicle(user.uid, btn.dataset.id);
                        await renderVehicles();
                    } catch (err) {
                        console.error('[Profile] Delete error:', err);
                        alert(t('profile_error_deleting'));
                        btn.disabled = false;
                        btn.textContent = t('profile_delete');
                    }
                });
            });

        } catch (err) {
            console.error('[Profile] Load vehicles error:', err);
            vc.innerHTML = `<p style="color:#ef4444;text-align:center;font-size:0.85rem;">${t('profile_error_loading')}</p>`;
        }
    }

    // ── Initial load ─────────────────────────────────────────────────────────
    await renderVehicles();
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTireLabel(tires) {
    if (!tires) return '';
    const parts = [];
    if (tires.summer?.width) {
        const s = tires.summer;
        parts.push(`${t('profile_summer_short')} ${s.width}/${s.profile} R${s.rim}${s.brand ? ' (' + s.brand + ')' : ''}`);
    }
    if (tires.winter?.width) {
        const w = tires.winter;
        parts.push(`${t('profile_winter_short')} ${w.width}/${w.profile} R${w.rim}${w.brand ? ' (' + w.brand + ')' : ''}`);
    }
    return parts.join('<br>');
}

function seasonStyle(season) {
    switch (season) {
        case 'letne': return 'background:#fef3c7;color:#d97706;border:1px solid #fde68a;';
        case 'zimske': return 'background:#dbeafe;color:#2563eb;border:1px solid #bfdbfe;';
        case 'celoletne': return 'background:#d1fae5;color:#059669;border:1px solid #a7f3d0;';
        default: return 'background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;';
    }
}

function seasonText(season) {
    switch (season) {
        case 'letne': return t('profile_tire_summer');
        case 'zimske': return t('profile_tire_winter');
        case 'celoletne': return t('profile_tire_all_season');
        default: return season;
    }
}

function fuelText(fuel) {
    if (!fuel) return '';
    switch (fuel) {
        case 'Petrol': return t('profile_fuel_petrol');
        case 'Dizel': return t('profile_fuel_diesel');
        case 'Električni': return t('profile_fuel_electric');
        case 'Hibrid': return t('profile_fuel_hybrid');
        case 'Plug-in hibrid': return t('profile_fuel_plugin_hybrid');
        case 'LPG': return t('profile_fuel_lpg');
        case 'CNG': return t('profile_fuel_cng');
        default: return fuel;
    }
}

function formatNumber(num) {
    const lang = localStorage.getItem('mojavto_lang') || 'en';
    const locale = lang === 'sl' ? 'sl-SI' : 'en-US';
    return new Intl.NumberFormat(locale).format(num);
}
