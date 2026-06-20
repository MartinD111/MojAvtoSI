// Generic modal/popup primitive — MojAvto.si
// Vanilla DOM overlay generalised from the authGate pattern, adding a focus trap
// and ESC handling. Used for paywall + transaction-abandonment prompts.
//
// Usage:
//   import { openModal, confirmModal } from '../utils/modal.js';
//   const m = openModal({ title: '…', bodyHtml: '…', actions: [
//       { labelKey: 'ui_dismiss', variant: 'ghost', onClick: () => m.close() },
//       { labelKey: 'paywall_cta', variant: 'primary', onClick: () => navigateTo('/paketi') },
//   ]});
//   const ok = await confirmModal({ title: '…', message: '…' });

import { t } from '../core/i18n.js';

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
let _active = null;

/**
 * @param {Object} opts
 * @param {string}  [opts.title]
 * @param {string}  [opts.icon]        emoji/inline-svg string
 * @param {string}  [opts.bodyHtml]    raw HTML for body (caller-trusted)
 * @param {Node}    [opts.bodyNode]    node appended to body (preferred over bodyHtml)
 * @param {Array}   [opts.actions]     [{ labelKey|label, variant, onClick, closeOnClick }]
 * @param {boolean} [opts.dismissable] ESC + overlay-click close (default true)
 * @param {() => void} [opts.onClose]
 * @returns {{ close: () => void, el: HTMLElement }}
 */
export function openModal(opts = {}) {
    const { dismissable = true } = opts;
    if (_active) _active.close();

    const prevFocus = document.activeElement;
    const overlay = document.createElement('div');
    overlay.className = 'ui-modal-overlay';

    const card = document.createElement('div');
    card.className = 'ui-modal';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');

    const titleId = 'uiModalTitle_' + Math.random().toString(36).slice(2, 8);
    card.innerHTML = `
        ${dismissable ? `<button class="ui-modal__close" type="button" aria-label="${t('ui_dismiss')}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>` : ''}
        <div class="ui-modal__head">
            ${opts.icon ? `<div class="ui-modal__icon">${opts.icon}</div>` : ''}
            ${opts.title ? `<h3 class="ui-modal__title" id="${titleId}">${opts.title}</h3>` : ''}
        </div>
        <div class="ui-modal__body"></div>
        <div class="ui-modal__actions"></div>
    `;
    if (opts.title) card.setAttribute('aria-labelledby', titleId);

    const bodyEl = card.querySelector('.ui-modal__body');
    if (opts.bodyNode) bodyEl.appendChild(opts.bodyNode);
    else if (opts.bodyHtml) bodyEl.innerHTML = opts.bodyHtml;

    const actionsEl = card.querySelector('.ui-modal__actions');
    (opts.actions || []).forEach(a => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `ui-modal__btn ui-modal__btn--${a.variant || 'ghost'}`;
        btn.textContent = a.label || t(a.labelKey || 'ui_dismiss');
        btn.addEventListener('click', () => {
            if (a.onClick) a.onClick();
            // Close after the action unless the caller opts out (closeOnClick: false).
            if (a.closeOnClick !== false) close();
        });
        actionsEl.appendChild(btn);
    });
    if (!actionsEl.children.length) actionsEl.remove();

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    document.body.classList.add('ui-modal-open');
    requestAnimationFrame(() => overlay.classList.add('active'));

    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        overlay.classList.remove('active');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => {
            overlay.remove();
            if (!document.querySelector('.ui-modal-overlay')) document.body.classList.remove('ui-modal-open');
        }, 250);
        if (_active && _active.el === overlay) _active = null;
        if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
        if (opts.onClose) opts.onClose();
    };

    function onKey(e) {
        if (e.key === 'Escape' && dismissable) { e.preventDefault(); close(); return; }
        if (e.key === 'Tab') trapFocus(card, e);
    }
    document.addEventListener('keydown', onKey, true);

    if (dismissable) {
        card.querySelector('.ui-modal__close')?.addEventListener('click', close);
        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    }

    // Move focus into the dialog.
    const first = card.querySelector(FOCUSABLE);
    (first || card).focus?.();

    const handle = { close, el: overlay };
    _active = handle;
    return handle;
}

/**
 * Promise-based yes/no confirmation.
 * @returns {Promise<boolean>}
 */
export function confirmModal(opts = {}) {
    return new Promise(resolve => {
        let settled = false;
        const done = (val) => { if (!settled) { settled = true; resolve(val); } };
        const m = openModal({
            ...opts,
            bodyHtml: opts.message ? `<p class="ui-modal__text">${opts.message}</p>` : opts.bodyHtml,
            actions: [
                { labelKey: opts.cancelKey || 'abandon_resume_no', variant: 'ghost', onClick: () => { done(false); m.close(); } },
                { labelKey: opts.confirmKey || 'abandon_resume_yes', variant: 'primary', onClick: () => { done(true); m.close(); } },
            ],
            onClose: () => done(false),
        });
    });
}

function trapFocus(container, e) {
    const items = [...container.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
