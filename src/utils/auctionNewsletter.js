// auctionNewsletter.js — shared "subscribe to auction alerts" widget.
// Anyone (incl. guests) can subscribe an email for vehicles of interest that may
// come to auction. Writes to auctionAlerts via auctionService.createAuctionAlert.

import { createAuctionAlert } from '../services/auctionService.js';
import { auth } from '../firebase.js';

export function newsletterWidgetHtml(prefill = {}) {
    return `
    <div class="auction-newsletter" id="auctionNewsletter">
        <div class="an-head">
            <span class="an-icon">🔔</span>
            <div>
                <p class="an-title">Obvestila o dražbah</p>
                <p class="an-sub">Pustite e-naslov in obveščali vas bomo o dražbah vozil, ki vas zanimajo.</p>
            </div>
        </div>
        <form class="an-form" id="auctionNewsletterForm">
            <input type="email" class="an-input" id="anEmail" placeholder="vaš@email.si" required
                value="${prefill.email || (auth.currentUser?.email || '')}" />
            <input type="text" class="an-input" id="anInterest" placeholder="Npr. BMW, Audi, kombi …"
                value="${prefill.interest || ''}" />
            <button type="submit" class="an-submit">Prijava</button>
        </form>
        <p class="an-status" id="anStatus" aria-live="polite"></p>
    </div>`;
}

export function bindNewsletterWidget(root = document) {
    const form = root.querySelector('#auctionNewsletterForm');
    if (!form) return;
    const status = root.querySelector('#anStatus');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = root.querySelector('#anEmail').value.trim();
        const interest = root.querySelector('#anInterest').value.trim();
        try {
            await createAuctionAlert(email, { interest }, auth.currentUser?.uid || null);
            if (status) { status.textContent = '✓ Prijavljeni ste na obvestila.'; status.className = 'an-status ok'; }
            form.reset();
        } catch (err) {
            if (status) { status.textContent = err.message || 'Napaka pri prijavi.'; status.className = 'an-status err'; }
        }
    });
}
