// Service Entry Page — for verified mechanics / B2B users
import { supabase } from '../lib/supabase.js';
import { addServiceRecord } from '../services/serviceBookService.js';
import { t } from '../core/i18n.js';

function getServiceTypes() {
    return [
        { value: 'mali_servis',    label: t('st_minor', 'Mali servis') },
        { value: 'veliki_servis',  label: t('st_major', 'Veliki servis') },
        { value: 'popravilo',      label: t('st_repair', 'Popravilo') },
        { value: 'pnevmatike',     label: t('st_tires', 'Pnevmatike') },
        { value: 'drugo',          label: t('st_other', 'Drugo') },
    ];
}

function isAuthorized(user) {
    if (!user) return false;
    const profile = window.__currentUserProfile || {};
    return (
        profile.businessTier === 'verified' ||
        profile.role === 'mechanic' ||
        user.email?.endsWith('@mojavto.si')
    );
}

export async function initServiceEntryPage() {
    const page = document.getElementById('service-entry-page');
    if (!page) return;

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!isAuthorized(user)) {
        renderAccessDenied(page);
    } else {
        renderForm(page, user);
    }
}

function renderAccessDenied(page) {
    page.innerHTML = `
        <div style="max-width:480px;margin:4rem auto;text-align:center;padding:2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
            <h2 style="font-size:1.3rem;font-weight:800;color:#1e293b;margin:0 0 0.5rem;">${t('access_denied_title', 'Dostop zavrnjen')}</h2>
            <p style="color:#64748b;margin:0 0 1.5rem;">${t('access_denied_mechanic', 'Ta stran je dostopna le verificiranim delavnicam in serviserjem.')}</p>
            <a href="#/dashboard" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">${t('back_to_dashboard', '← Nazaj na nadzorno ploščo')}</a>
        </div>`;
}

function renderForm(page, user) {
    const typeOptions = getServiceTypes().map(item =>
        `<option value="${item.value}">${item.label}</option>`
    ).join('');

    page.innerHTML = `
        <div class="se-container">
            <div class="se-card glass-card">
                <div class="se-card-header">
                    <i data-lucide="wrench"></i>
                    <h1 class="se-title">${t('service_entry_title', 'Vnos v digitalno servisno knjižico')}</h1>
                </div>
                <p class="se-subtitle">${t('service_entry_subtitle', 'Vneseni podatki se trajno povežejo z VIN številko vozila.')}</p>

                <form id="serviceEntryForm" class="se-form" novalidate>
                    <div class="se-field">
                        <label for="se-vin">${t('service_vin_label', 'VIN številka')} <span class="se-required">*</span></label>
                        <input id="se-vin" type="text" maxlength="17" placeholder="npr. WBA3A5G59DNP26082" required />
                    </div>
                    <div class="se-row">
                        <div class="se-field">
                            <label for="se-date">${t('service_date_label', 'Datum servisa')} <span class="se-required">*</span></label>
                            <input id="se-date" type="date" required />
                        </div>
                        <div class="se-field">
                            <label for="se-mileage">${t('service_mileage_label', 'Stanje števca (km)')}</label>
                            <input id="se-mileage" type="number" min="0" placeholder="npr. 125000" />
                        </div>
                    </div>
                    <div class="se-field">
                        <label for="se-type">${t('service_type_label', 'Vrsta servisa')} <span class="se-required">*</span></label>
                        <select id="se-type" required>
                            ${typeOptions}
                        </select>
                    </div>
                    <div class="se-field">
                        <label for="se-desc">${t('service_desc_label', 'Opis opravljenih del')}</label>
                        <textarea id="se-desc" rows="4" placeholder="${t('service_desc_placeholder', 'Menjava olja, filtri, pregled zavor...')}"></textarea>
                    </div>
                    <div id="se-error" class="se-error" style="display:none;"></div>
                    <button type="submit" class="se-submit-btn" id="seSubmitBtn">
                        <i data-lucide="save"></i>
                        ${t('service_save_record', 'Shrani vnos')}
                    </button>
                </form>

                <div id="se-toast" class="se-toast" style="display:none;"></div>
            </div>
        </div>`;

    if (window.lucide) window.lucide.createIcons();

    const form = document.getElementById('serviceEntryForm');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('seSubmitBtn');
        const errorEl = document.getElementById('se-error');
        const vin = document.getElementById('se-vin').value.trim();
        const date = document.getElementById('se-date').value;
        const mileage = document.getElementById('se-mileage').value;
        const serviceType = document.getElementById('se-type').value;
        const description = document.getElementById('se-desc').value.trim();

        errorEl.style.display = 'none';

        if (!vin) { showError(errorEl, t('service_err_vin_req', 'VIN številka je obvezna.')); return; }
        if (vin.length < 5) { showError(errorEl, t('service_err_vin_short', 'VIN številka mora imeti vsaj 5 znakov.')); return; }
        if (!date) { showError(errorEl, t('service_err_date_req', 'Datum servisa je obvezen.')); return; }

        btn.disabled = true;
        btn.textContent = t('service_saving', 'Shranjevanje...');

        try {
            await addServiceRecord({
                vin,
                date,
                mileage: mileage || null,
                serviceType,
                description,
                mechanicId: user.id,
                mechanicName: user.user_metadata?.display_name || user.email || 'Service',
            });
            showToast(t('service_toast_success', '✅ Vnos uspešno shranjen!'));
            form.reset();
        } catch (err) {
            console.error('[ServiceEntry]', err);
            showError(errorEl, t('service_err_generic', 'Prišlo je do napake. Prosimo, poskusite znova.'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="save"></i> ${t('service_save_record', 'Shrani vnos')}`;
            if (window.lucide) window.lucide.createIcons();
        }
    });
}

function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
}

function showToast(msg) {
    const toast = document.getElementById('se-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
}
