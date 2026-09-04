// Login page logic — MojAvto.si
import { loginWithEmail, loginWithGoogle } from '../auth/auth.js';
import { navigateTo } from '../router.js';
import { t } from '../core/i18n.js';

export function initLoginPage() {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('error-message');
    const googleBtn = document.getElementById('googleLoginBtn');

    // ── Google ────────────────────────────────────────────────────────────────
    googleBtn?.addEventListener('click', async () => {
        try {
            googleBtn.disabled = true;
            googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t('login_btn_loading', 'Prijavljam...')}`;
            await loginWithGoogle();
            navigateTo('/dashboard');
        } catch (err) {
            errorEl.textContent = err.message;
            googleBtn.disabled = false;
            googleBtn.innerHTML = `<i class="fab fa-google"></i> ${t('login_google', 'Prijava z Google')}`;
        }
    });

    // ── Email / Password ─────────────────────────────────────────────────────
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = t('login_btn_loading', 'Prijavljam...');

        try {
            await loginWithEmail(email, password);
            navigateTo('/dashboard');
        } catch (err) {
            const msgs = {
                'auth/user-not-found': t('login_err_user_not_found', 'Uporabnik s tem e-mailom ne obstaja.'),
                'auth/wrong-password': t('login_err_wrong_password', 'Napačno geslo.'),
                'auth/invalid-credential': t('login_err_invalid', 'Napačen e-mail ali geslo.'),
                'auth/too-many-requests': t('login_err_too_many', 'Preveč poskusov. Počakajte in poskusite znova.'),
            };
            errorEl.textContent = msgs[err.code] || err.message;
            submitBtn.disabled = false;
            submitBtn.textContent = t('login_title', 'Prijava');
        }
    });
}
