// Paywall — MojAvto.si
// UI-only gating for the free-tier listing quota. When a user is at/over the
// limit, a paywall modal blocks the action and upsells the paid package.
//
// NOTE: This is a FRONTEND gate only — it can be bypassed via devtools. The
// authoritative check belongs on the server: add a per-user active-listing count
// in POST /listings (server/src/routes/listings.ts) returning 402 when exceeded.
// errorMap.js already maps 402 → paywall, so the same modal can be triggered from
// a server response later with no UI changes.

import { t } from '../core/i18n.js';
import { openModal } from './modal.js';
import { navigateTo } from '../router.js';
import { key } from '../config/storageKeys.js';

// Default free-tier limit. Overridable (e.g. by admin/site-settings) via a
// platform-scoped localStorage key, so the number isn't hard-baked.
const DEFAULT_FREE_LIMIT = 5;

/** Resolve the active free-tier active-listing limit. */
export function getListingLimit() {
    try {
        const override = Number(localStorage.getItem(key('listing_limit')));
        if (Number.isFinite(override) && override > 0) return override;
    } catch { /* ignore */ }
    return DEFAULT_FREE_LIMIT;
}

/**
 * Returns true when the user is allowed to proceed; false (and shows the paywall)
 * when the quota is reached.
 * @param {{ used: number }} args  number of active listings the user already has
 * @returns {boolean}
 */
export function enforceListingQuota({ used } = {}) {
    const limit = getListingLimit();
    if (typeof used !== 'number' || used < limit) return true;
    showPaywall({ limit, used });
    return false;
}

/** Open the paywall upsell modal. */
export function showPaywall({ limit, used } = {}) {
    const benefits = [0, 1, 2].map(i => `<li>${t('paywall_benefit_' + i)}</li>`).join('');
    openModal({
        icon: '🚀',
        title: t('paywall_title'),
        bodyHtml: `
            <p class="ui-modal__text">${t('paywall_msg', { limit: String(limit ?? getListingLimit()) })}</p>
            <ul class="ui-modal__benefits">${benefits}</ul>
        `,
        actions: [
            { labelKey: 'paywall_dismiss', variant: 'ghost' },
            { labelKey: 'paywall_cta', variant: 'primary', onClick: () => { markUpgradeIntent(); navigateTo('/paketi'); } },
        ],
    });
}

// Records that the user opened the upgrade flow, so an abandoned upgrade can be
// re-surfaced on return. Imported lazily to avoid a circular dependency.
function markUpgradeIntent() {
    import('./abandonment.js').then(m => m.markIntent('upgrade_checkout', { at: Date.now() })).catch(() => {});
}
