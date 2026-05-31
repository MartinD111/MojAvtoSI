// Service Entry Page — for verified mechanics / B2B users
import { auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { addServiceRecord } from '../services/serviceBookService.js';

const SERVICE_TYPES = [
    { value: 'mali_servis',    label: 'Minor Service' },
    { value: 'veliki_servis',  label: 'Major Service' },
    { value: 'popravilo',      label: 'Repair' },
    { value: 'pnevmatike',     label: 'Tires' },
    { value: 'drugo',          label: 'Other' },
];

function isAuthorized(user) {
    if (!user) return false;
    const profile = window.__currentUserProfile || {};
    return (
        profile.businessTier === 'verified' ||
        profile.role === 'mechanic' ||
        user.email?.endsWith('@mojavto.si')
    );
}

export function initServiceEntryPage() {
    const page = document.getElementById('service-entry-page');
    if (!page) return;

    onAuthStateChanged(auth, user => {
        if (!isAuthorized(user)) {
            renderAccessDenied(page);
            return;
        }
        renderForm(page, user);
    });
}

function renderAccessDenied(page) {
    page.innerHTML = `
        <div style="max-width:480px;margin:4rem auto;text-align:center;padding:2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
            <h2 style="font-size:1.3rem;font-weight:800;color:#1e293b;margin:0 0 0.5rem;">Access Denied</h2>
            <p style="color:#64748b;margin:0 0 1.5rem;">This page is accessible only to verified workshops and mechanics.</p>
            <a href="#/dashboard" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">← Back to Dashboard</a>
        </div>`;
}

function renderForm(page, user) {
    const typeOptions = SERVICE_TYPES.map(t =>
        `<option value="${t.value}">${t.label}</option>`
    ).join('');

    page.innerHTML = `
        <div class="se-container">
            <div class="se-card glass-card">
                <div class="se-card-header">
                    <i data-lucide="wrench"></i>
                    <h1 class="se-title">Digital Service Record Entry</h1>
                </div>
                <p class="se-subtitle">Entered data is permanently linked to the vehicle's VIN number.</p>

                <form id="serviceEntryForm" class="se-form" novalidate>
                    <div class="se-field">
                        <label for="se-vin">VIN Number <span class="se-required">*</span></label>
                        <input id="se-vin" type="text" maxlength="17" placeholder="e.g. WBA3A5G59DNP26082" required />
                    </div>
                    <div class="se-row">
                        <div class="se-field">
                            <label for="se-date">Service Date <span class="se-required">*</span></label>
                            <input id="se-date" type="date" required />
                        </div>
                        <div class="se-field">
                            <label for="se-mileage">Odometer Reading (mi)</label>
                            <input id="se-mileage" type="number" min="0" placeholder="e.g. 77400" />
                        </div>
                    </div>
                    <div class="se-field">
                        <label for="se-type">Service Type <span class="se-required">*</span></label>
                        <select id="se-type" required>
                            ${typeOptions}
                        </select>
                    </div>
                    <div class="se-field">
                        <label for="se-desc">Description of Work Performed</label>
                        <textarea id="se-desc" rows="4" placeholder="Oil change, filters, brake inspection..."></textarea>
                    </div>
                    <div id="se-error" class="se-error" style="display:none;"></div>
                    <button type="submit" class="se-submit-btn" id="seSubmitBtn">
                        <i data-lucide="save"></i>
                        Save Record
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

        if (!vin) { showError(errorEl, 'VIN number is required.'); return; }
        if (vin.length < 5) { showError(errorEl, 'VIN number must be at least 5 characters.'); return; }
        if (!date) { showError(errorEl, 'Service date is required.'); return; }

        btn.disabled = true;
        btn.textContent = 'Saving...';

        try {
            await addServiceRecord({
                vin,
                date,
                mileage: mileage || null,
                serviceType,
                description,
                mechanicId: user.uid,
                mechanicName: user.displayName || user.email || 'Service',
            });
            showToast('✅ Record saved successfully!');
            form.reset();
        } catch (err) {
            console.error('[ServiceEntry]', err);
            showError(errorEl, 'An error occurred. Please try again.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="save"></i> Save Record';
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
