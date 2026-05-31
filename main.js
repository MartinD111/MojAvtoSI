// Main entry point — MojAvto.si
import { initI18n, translatePage } from './src/core/i18n.js';
import './src/router.js';
import './src/pageController.js';
import { onAuth } from './src/auth/auth.js';
import { initHeader } from './src/components/header.js';
import { bindB2BContext, onB2BChange } from './src/core/b2bContext.js';
import { registerDefaultExtensions } from './src/core/extensions.js';
import './src/index.css';

// Restore saved theme before any render to avoid flash
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Initialize translations
await initI18n();

// Register B2B extension registry (once)
registerDefaultExtensions();

// Boot header (persists across route changes)
initHeader();

// Boot footer
fetch('views/footer.html')
    .then(r => r.text())
    .then(html => {
        const footerEl = document.getElementById('footer');
        if (footerEl) {
            footerEl.innerHTML = html;
            translatePage(footerEl);
        }
    })
    .catch(err => console.error("Error loading footer:", err));


// Track auth state globally so views can use it
window.__authReady = new Promise(resolve => {
    onAuth(user => {
        window.__currentUser = user || null;
        // Bind/unbind B2B profile snapshot whenever auth changes
        bindB2BContext(user);
        resolve(user);
    });
});

// Keep <body> class in sync with B2B mode so CSS can adapt globally
onB2BChange(profile => {
    const isBiz = profile?.sellerType === 'business';
    document.body.classList.toggle('is-b2b', isBiz);
});
