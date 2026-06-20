/**
 * Escape user-generated content before inserting into innerHTML or HTML attributes.
 * Covers the five characters that are dangerous in both element content and
 * double-quoted attribute values: & < > " '
 */
export function escHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}
