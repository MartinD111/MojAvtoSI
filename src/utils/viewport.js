// ═══════════════════════════════════════════════════════════════════════════════
// Viewport helpers — shared mobile/desktop detection & conditional scrolling.
// Mirrors the breakpoint used in src/components/header.js (max-width: 767px).
// Used to suppress automatic auto-scroll on desktop while keeping it on mobile.
// ═══════════════════════════════════════════════════════════════════════════════

export const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;

export function scrollToTopOnMobile(opts = { top: 0, behavior: 'smooth' }) {
    if (isMobileViewport()) window.scrollTo(opts);
}

export function scrollIntoViewOnMobile(el, opts) {
    if (el && isMobileViewport()) el.scrollIntoView(opts);
}
