// Transaction abandonment recovery — MojAvto.si
// Persists a user's in-flight intent so that, if they leave and come back, we can
// offer to resume. Covers three flows:
//   - 'auction_payment'  : auction winner opened Stripe checkout, didn't finish
//   - 'create_listing'   : a half-filled new-listing draft
//   - 'upgrade_checkout' : opened the paywall/upgrade flow, didn't pay
//
// Intents live in platform-scoped localStorage and expire after MAX_AGE_MS.

import { key } from '../config/storageKeys.js';
import { confirmModal } from './modal.js';
import { t } from '../core/i18n.js';
import { navigateTo } from '../router.js';

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

/** @typedef {'auction_payment'|'create_listing'|'upgrade_checkout'} IntentKind */

/** Persist an intent (overwrites any existing one of the same kind). */
export function markIntent(kind, payload = {}) {
    try {
        localStorage.setItem(key('intent', kind), JSON.stringify({ ts: Date.now(), payload }));
    } catch { /* ignore quota */ }
}

/** Read a fresh intent, or null if missing/expired. */
export function getIntent(kind) {
    try {
        const raw = localStorage.getItem(key('intent', kind));
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (!entry || Date.now() - entry.ts > MAX_AGE_MS) { clearIntent(kind); return null; }
        return entry;
    } catch {
        return null;
    }
}

/** Remove an intent (call on success/cancel). */
export function clearIntent(kind) {
    try { localStorage.removeItem(key('intent', kind)); } catch { /* ignore */ }
}

// Where each resumable intent should send the user. auction_payment carries an
// auctionId in its payload so we can deep-link back to the listing.
const RESUME_TARGETS = {
    auction_payment: (p) => (p && p.auctionId ? `/drazba/${p.auctionId}` : '/drazbe'),
    create_listing: () => '/novi-oglas',
    upgrade_checkout: () => '/paketi',
};

// Priority order — only one prompt per app load to avoid nagging.
const RESUME_ORDER = ['auction_payment', 'create_listing', 'upgrade_checkout'];

/**
 * On app load, if there's a fresh resumable intent, ask the user to continue.
 * Shows at most one prompt. Safe to call once after boot.
 */
export async function promptResume() {
    for (const kind of RESUME_ORDER) {
        const intent = getIntent(kind);
        if (!intent) continue;

        const ok = await confirmModal({
            icon: '↩️',
            title: t('abandon_resume_title'),
            message: t('abandon_resume_msg_' + kind),
            confirmKey: 'abandon_resume_yes',
            cancelKey: 'abandon_resume_no',
        });

        if (ok) {
            const target = (RESUME_TARGETS[kind] || (() => '/'))(intent.payload);
            navigateTo(target.replace(/^#/, ''));
        } else {
            clearIntent(kind);
        }
        return; // one prompt only
    }
}
