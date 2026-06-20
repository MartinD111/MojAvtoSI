// Progressive loading messages — MojAvto.si
// While a load runs, rotate a reassuring message every 3s across 0–15s to reduce
// perceived wait time and abandonment. After the last bucket it stays put.
//
// Usage:
//   import { startProgressiveMessages } from '../utils/progressiveLoader.js';
//   const stop = startProgressiveMessages(textNode);
//   try { await work(); } finally { stop(); }

import { t } from '../core/i18n.js';

// Default i18n keys, swapped in order. Add/override via opts.keys.
const DEFAULT_KEYS = [
    'loading_msg_0', // 0–3s   "Nalagam…"
    'loading_msg_1', // 3–6s   "Iščem najboljše ponudbe…"
    'loading_msg_2', // 6–9s   "Še trenutek, urejam rezultate…"
    'loading_msg_3', // 9–12s  "Skoraj končano…"
    'loading_msg_4', // 12–15s "Hvala za potrpljenje…"
];

/**
 * Start swapping the text content of a node every `interval` ms.
 * @param {HTMLElement} node  element whose textContent gets updated
 * @param {Object} [opts]
 * @param {string[]} [opts.keys]      i18n keys to cycle through
 * @param {number}   [opts.interval]  ms between swaps (default 3000)
 * @returns {() => void} idempotent stop function
 */
export function startProgressiveMessages(node, opts = {}) {
    if (!node) return () => {};
    const keys = opts.keys && opts.keys.length ? opts.keys : DEFAULT_KEYS;
    const interval = opts.interval || 3000;

    let i = 0;
    let timer = null;

    const apply = () => { node.textContent = t(keys[i]); };
    apply(); // show the first message immediately

    timer = setInterval(() => {
        if (i < keys.length - 1) {
            i += 1;
            apply();
        } else {
            // Reached the last bucket — stop ticking, keep the final message.
            clearInterval(timer);
            timer = null;
        }
    }, interval);

    return function stop() {
        if (timer) { clearInterval(timer); timer = null; }
    };
}
