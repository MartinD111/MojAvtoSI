// Stale-while-revalidate cache — MojAvto.si
// Returns cached data instantly (if present) while a fresh fetch revalidates in
// the background. Pairs with the `.ui-updating` badge to signal "updating…".
//
// Only cache NON-sensitive, idempotent reads (public lists: listings, inventory,
// taxonomy). NEVER cache tokens, PII, or per-request auth state.
//
// Usage:
//   import { swr, invalidate } from '../lib/cachedFetch.js';
//   const { cached, fresh } = swr('dash_listings_' + uid, () => getUserListings(uid), { ttl: 60_000 });
//   if (cached) render(cached);          // instant, show .ui-updating
//   const data = await fresh;            // revalidated
//   render(data);

import { key } from '../config/storageKeys.js';

const PREFIX = 'swr';

function storageKey(cacheKey) {
    return key(PREFIX, cacheKey);
}

/**
 * Read a cached entry. Returns null on miss, parse error, version mismatch, or expiry.
 * @param {string} cacheKey
 * @param {Object} [opts] { ttl, ver }
 */
export function readCache(cacheKey, opts = {}) {
    try {
        const raw = localStorage.getItem(storageKey(cacheKey));
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (!entry || typeof entry !== 'object') return null;
        if (opts.ver != null && entry.ver !== opts.ver) return null;
        if (opts.ttl && Date.now() - entry.ts > opts.ttl) return null;
        return entry.v;
    } catch {
        return null;
    }
}

/** Write a value to the cache. Silently ignores quota/serialisation failures. */
export function writeCache(cacheKey, value, opts = {}) {
    try {
        localStorage.setItem(storageKey(cacheKey), JSON.stringify({ v: value, ts: Date.now(), ver: opts.ver ?? null }));
    } catch (err) {
        // QuotaExceededError or a non-serialisable value — caching is best-effort.
        if (err && err.name === 'QuotaExceededError') pruneOldest();
    }
}

/** Drop a cached entry (call after a mutation that changes the underlying data). */
export function invalidate(cacheKey) {
    try { localStorage.removeItem(storageKey(cacheKey)); } catch { /* ignore */ }
}

/**
 * Stale-while-revalidate.
 * @param {string} cacheKey
 * @param {() => Promise<any>} producer  fetches fresh data
 * @param {Object} [opts] { ttl, ver }
 * @returns {{ cached: any|null, fresh: Promise<any> }}
 */
export function swr(cacheKey, producer, opts = {}) {
    const cached = readCache(cacheKey, opts);
    const fresh = Promise.resolve()
        .then(producer)
        .then(data => {
            writeCache(cacheKey, data, opts);
            return data;
        });
    return { cached, fresh };
}

// Best-effort eviction when storage is full: remove the oldest swr-prefixed entry.
function pruneOldest() {
    try {
        let oldestKey = null;
        let oldestTs = Infinity;
        const marker = key(PREFIX, '');
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(marker)) continue;
            try {
                const ts = JSON.parse(localStorage.getItem(k))?.ts ?? 0;
                if (ts < oldestTs) { oldestTs = ts; oldestKey = k; }
            } catch { /* skip */ }
        }
        if (oldestKey) localStorage.removeItem(oldestKey);
    } catch { /* ignore */ }
}
