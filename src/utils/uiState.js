// Unified UI-state renderers — MojAvto.si
// Drop-in replacements for the per-page inline loading/empty/error HTML. They
// write into an existing container element (same pattern as `el.innerHTML = …`).
//
// Usage:
//   import { renderLoading, renderEmpty, renderError, clearState } from '../utils/uiState.js';
//   const { destroy } = renderLoading(box, { progressive: true });
//   ...
//   renderError(box, { mapped: mapError(err), onRetry: load });

import { t } from '../core/i18n.js';
import { startProgressiveMessages } from './progressiveLoader.js';
import { navigateTo } from '../router.js';
import { showAuthGate } from './authGate.js';

/**
 * Render a loading state into `target`.
 * @param {HTMLElement} target
 * @param {Object} [opts]
 * @param {boolean} [opts.progressive]  rotate reassuring messages every 3s
 * @param {boolean} [opts.skeleton]     render skeleton rows instead of a spinner
 * @param {number}  [opts.rows]         skeleton row count (default 3)
 * @param {string}  [opts.messageKey]   static message i18n key (non-progressive)
 * @returns {{ el: HTMLElement, destroy: () => void }}
 */
export function renderLoading(target, opts = {}) {
    if (!target) return { el: null, destroy: () => {} };

    if (opts.skeleton) {
        const rows = opts.rows || 3;
        target.innerHTML = `<div class="ui-state ui-state--loading" role="status" aria-live="polite">
            ${Array.from({ length: rows }, () => '<div class="ui-skeleton ui-skeleton--row"></div>').join('')}
        </div>`;
        return { el: target.firstElementChild, destroy: () => {} };
    }

    const msgKey = opts.messageKey || 'loading_default';
    target.innerHTML = `<div class="ui-state ui-state--loading" role="status" aria-live="polite">
        <span class="ui-state__spinner" aria-hidden="true"></span>
        <p class="ui-state__msg"></p>
    </div>`;
    const el = target.firstElementChild;
    const msgEl = el.querySelector('.ui-state__msg');

    let stop = () => {};
    if (opts.progressive) {
        stop = startProgressiveMessages(msgEl, opts.progressiveOpts);
    } else {
        msgEl.textContent = t(msgKey);
    }
    return { el, destroy: () => stop() };
}

/**
 * Render an empty state with an optional call-to-action.
 * @param {HTMLElement} target
 * @param {Object} [opts]
 * @param {string} [opts.icon]      emoji/inline-svg
 * @param {string} [opts.titleKey]
 * @param {string} [opts.msgKey]
 * @param {{ labelKey:string, href?:string, onClick?:Function }} [opts.cta]
 */
export function renderEmpty(target, opts = {}) {
    if (!target) return;
    const icon = opts.icon || '📭';
    const title = t(opts.titleKey || 'empty_default_title');
    const msg = opts.msgKey ? t(opts.msgKey) : '';
    target.innerHTML = `<div class="ui-state ui-state--empty">
        <div class="ui-state__icon" aria-hidden="true">${icon}</div>
        <p class="ui-state__title">${title}</p>
        ${msg ? `<p class="ui-state__msg">${msg}</p>` : ''}
        ${opts.cta ? `<button type="button" class="ui-state__cta">${t(opts.cta.labelKey)}</button>` : ''}
    </div>`;

    if (opts.cta) {
        const btn = target.querySelector('.ui-state__cta');
        btn.addEventListener('click', () => {
            if (opts.cta.onClick) opts.cta.onClick();
            else if (opts.cta.href) navigateTo(opts.cta.href.replace(/^#/, ''));
        });
    }
}

/**
 * Render an error state from a mapped error (see errorMap.js).
 * The action button is chosen from `mapped.action`.
 * @param {HTMLElement} target
 * @param {Object} opts
 * @param {import('./errorMap.js').MappedError} opts.mapped
 * @param {() => void} [opts.onRetry]
 */
export function renderError(target, { mapped, onRetry } = {}) {
    if (!target || !mapped) return;
    const title = t(mapped.titleKey);
    const msg = t(mapped.messageKey, mapped.errorId ? { errorId: mapped.errorId } : {});

    const issuesHtml = mapped.issues && mapped.issues.length
        ? `<ul class="ui-state__issues">${mapped.issues.map(i => `<li>${escapeText(i.message)}</li>`).join('')}</ul>`
        : '';

    const actionBtn = actionButtonHtml(mapped.action);

    target.innerHTML = `<div class="ui-state ui-state--error ui-state--${mapped.severity}" role="alert">
        <div class="ui-state__icon" aria-hidden="true">${severityIcon(mapped.severity)}</div>
        <p class="ui-state__title">${title}</p>
        ${msg ? `<p class="ui-state__msg">${msg}</p>` : ''}
        ${issuesHtml}
        ${actionBtn}
    </div>`;

    const btn = target.querySelector('.ui-state__action');
    if (btn) {
        btn.addEventListener('click', async () => {
            switch (mapped.action) {
                case 'retry':
                    if (onRetry) onRetry();
                    break;
                case 'login':
                    try { await showAuthGate(); if (onRetry) onRetry(); } catch { /* cancelled */ }
                    break;
                case 'support':
                    navigateTo('/kontakt');
                    break;
                default:
                    target.querySelector('.ui-state--error')?.remove();
            }
        });
    }
}

/** Remove any state block from `target`. */
export function clearState(target) {
    if (target) target.innerHTML = '';
}

// ── helpers ──────────────────────────────────────────────────────────────────
function actionButtonHtml(action) {
    const labelKey = {
        retry: 'ui_retry',
        login: 'ui_login',
        support: 'ui_contact_support',
        dismiss: 'ui_dismiss',
    }[action];
    if (!labelKey) return '';
    return `<button type="button" class="ui-state__action">${t(labelKey)}</button>`;
}

function severityIcon(severity) {
    return severity === 'info' ? 'ℹ️' : severity === 'warning' ? '⚠️' : '⛔';
}

function escapeText(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
