// auctionNewsletter.js — shared "subscribe to auction alerts" widget.
// Anyone (incl. guests) can subscribe an email for vehicles of interest that may
// come to auction. Writes to auctionAlerts via auctionService.createAuctionAlert.

import { createAuctionAlert } from '../services/auctionService.js';
import { currentUser } from '../lib/currentUser.js';
import { t } from '../core/i18n.js';

export function newsletterWidgetHtml(prefill = {}) {
    return `
    <div class="auction-newsletter" id="auctionNewsletter">
        <div class="an-head">
            <span class="an-icon">🔔</span>
            <div>
                <p class="an-title">${t('auction_alerts_title', 'Obvestila o dražbah')}</p>
                <p class="an-sub">${t('auction_alerts_sub', 'Pustite e-naslov in obveščali vas bomo o dražbah vozil, ki vas zanimajo.')}</p>
            </div>
        </div>
        <form class="an-form" id="auctionNewsletterForm">
            <input type="email" class="an-input" id="anEmail" placeholder="vas@email.si" required
                value="${prefill.email || (currentUser()?.email || '')}" />
            <input type="text" class="an-input" id="anInterest" placeholder="${t('auction_interest_placeholder', 'Npr. BMW, Audi, kombi …')}"
                value="${prefill.interest || ''}" />
            <button type="submit" class="an-submit">${t('subscribe', 'Prijava')}</button>
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
            await createAuctionAlert(email, { interest }, currentUser()?.id || null);
            if (status) { status.textContent = t('auction_subscribed_ok', '✓ Prijavljeni ste na obvestila.'); status.className = 'an-status ok'; }
            form.reset();
        } catch (err) {
            if (status) { status.textContent = err.message || t('auction_subscribed_err', 'Napaka pri prijavi.'); status.className = 'an-status err'; }
        }
    });
}
