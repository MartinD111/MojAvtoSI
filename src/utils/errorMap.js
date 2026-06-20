// Error taxonomy — MojAvto.si
// Not all errors are equal. mapError() turns any thrown error (from apiClient,
// fetch, Supabase, or a plain Error) into a user-facing descriptor: a severity,
// an i18n title/message key, a recommended action, and (where present) the
// server's field-level issues[] or 500 errorId.
//
// Server contract (server/src/app.ts):
//   { error, statusCode, issues?: [{path, message}], errorId? }
// apiClient (src/lib/apiClient.js) throws Error with .status + .data = that body.
//
// Usage:
//   import { mapError } from '../utils/errorMap.js';
//   const mapped = mapError(err);
//   renderError(container, { mapped, onRetry: load });

/**
 * @typedef {Object} MappedError
 * @property {'info'|'warning'|'error'} severity
 * @property {string} titleKey      i18n key for the heading
 * @property {string} messageKey    i18n key for the body
 * @property {'retry'|'login'|'support'|'dismiss'|'none'} action
 * @property {Array<{path:string,message:string}>=} issues  validation field errors
 * @property {string=} errorId      server error id (500), shown so users can quote it
 * @property {number=} status       raw HTTP status, if any
 */

/**
 * Map any error to a user-facing descriptor.
 * @param {any} err
 * @returns {MappedError}
 */
export function mapError(err) {
    // Network / offline / aborted fetch — no HTTP status reached us.
    if (isNetworkError(err)) {
        return { severity: 'warning', titleKey: 'err_network_title', messageKey: 'err_network_msg', action: 'retry' };
    }

    const status = errStatus(err);
    const data = err && typeof err === 'object' ? err.data : null;

    switch (status) {
        case 400:
            return {
                severity: 'info',
                titleKey: 'err_validation_title',
                messageKey: 'err_validation_msg',
                action: 'dismiss',
                issues: Array.isArray(data?.issues) ? data.issues : undefined,
                status,
            };
        case 401:
            return { severity: 'warning', titleKey: 'err_auth_title', messageKey: 'err_auth_msg', action: 'login', status };
        case 402: // payment required — paywall/quota (forward-compatible with backend enforcement)
            return { severity: 'info', titleKey: 'err_paywall_title', messageKey: 'err_paywall_msg', action: 'dismiss', status };
        case 403:
            return { severity: 'error', titleKey: 'err_forbidden_title', messageKey: 'err_forbidden_msg', action: 'dismiss', status };
        case 404:
            return { severity: 'info', titleKey: 'err_notfound_title', messageKey: 'err_notfound_msg', action: 'dismiss', status };
        case 409:
            return { severity: 'warning', titleKey: 'err_conflict_title', messageKey: 'err_conflict_msg', action: 'dismiss', status };
        case 429:
            return { severity: 'warning', titleKey: 'err_ratelimit_title', messageKey: 'err_ratelimit_msg', action: 'retry', status };
    }

    if (status >= 500) {
        return {
            severity: 'error',
            titleKey: 'err_server_title',
            messageKey: 'err_server_msg',
            action: 'support',
            errorId: typeof data?.errorId === 'string' ? data.errorId : undefined,
            status,
        };
    }

    // Unknown / client-side thrown Error with no status.
    return { severity: 'error', titleKey: 'err_generic_title', messageKey: 'err_generic_msg', action: 'support' };
}

function errStatus(err) {
    if (!err || typeof err !== 'object') return 0;
    // apiClient sets .status; Supabase/PostgREST errors expose numeric-string .code/.status
    const s = err.status ?? err.statusCode ?? err.data?.statusCode;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}

function isNetworkError(err) {
    if (!err) return false;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    // fetch() rejects with a TypeError ("Failed to fetch") when the request never
    // reached the server. Aborted requests surface as AbortError.
    if (err.name === 'AbortError') return true;
    if (err instanceof TypeError && /fetch|network/i.test(err.message || '')) return true;
    return false;
}
