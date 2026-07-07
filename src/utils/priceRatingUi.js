// ═══════════════════════════════════════════════════════════════════════════════
// Price-rating UI — shared 5-star rendering (half-stars) with a Slovenian label
// shown BELOW the stars. Used on listing cards (oglasi) and listing detail pages,
// on both portals (MojAvto + MojaNavtika).
//
// The star value + label come from getVehicleRating() (src/utils/valuationScore.js),
// whose `label` is already Slovenian ("Odlična vrednost", "Poštena cena", …).
// When confidence is too low for a comparables-based rating, callers pass a
// fallback derived from the local price-ratio heuristic — see ratingFallbackStars().
// ═══════════════════════════════════════════════════════════════════════════════
import { escHtml } from './escHtml.js';

const STAR_COLOR = 'var(--color-primary-start, #f59e0b)';
const EMPTY_COLOR = '#374151';

let _gid = 0;

// Render 5 stars (full / half / empty) at the given pixel dimension.
// Gradient ids are unique per call so multiple cards on a page don't collide.
export function renderStarsHtml(stars, dim = 16) {
    let html = '<div style="display:inline-flex;align-items:center;gap:2px;">';
    for (let i = 1; i <= 5; i++) {
        const fill = stars >= i ? 'full' : stars >= i - 0.5 ? 'half' : 'empty';
        const fc = fill === 'empty' ? EMPTY_COLOR : STAR_COLOR;
        if (fill === 'half') {
            const gid = `prg-${(_gid++).toString(36)}`;
            html += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" fill="none" style="display:block"><defs><linearGradient id="${gid}"><stop offset="50%" stop-color="${STAR_COLOR}"/><stop offset="50%" stop-color="${EMPTY_COLOR}"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#${gid})"/></svg>`;
        } else {
            html += `<svg width="${dim}" height="${dim}" viewBox="0 0 24 24" style="display:block"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${fc}"/></svg>`;
        }
    }
    html += '</div>';
    return html;
}

// Fallback when there are too few comparables for getVehicleRating().
// Maps the local getPriceRating() heuristic (score 3/2/1) to a star value
// and a Slovenian label, so we always show stars — never an English text pill.
export function ratingFallbackStars(priceRating) {
    const score = priceRating?.score;
    if (score === 3) return { stars: 4.5, label: 'Odlična vrednost' };
    if (score === 1) return { stars: 2,   label: 'Nad povprečjem' };
    return { stars: 3, label: 'Poštena cena' };
}

// Compact stacked badge for listing cards: stars on top, Slovenian label beneath.
// `rating` = { stars, label }. Pass title text for the hover tooltip.
export function renderRatingBadgeCard(rating, title = '') {
    const titleAttr = title ? ` title="${escHtml(title)}"` : '';
    return `<span class="price-rating price-rating--stacked"${titleAttr}>
        ${renderStarsHtml(rating.stars, 13)}
        <span class="price-rating-label">${escHtml(rating.label)}</span>
    </span>`;
}

// Full rating block for listing detail pages: stars, then label below,
// then the price signal, optional rare-equipment note, confidence + warning.
export function renderRatingBlockDetail(rating, opts = {}) {
    return `
        <div style="margin:0.15rem 0 0; text-align:center; display:flex; flex-direction:column; align-items:center; gap:2px;">
            ${renderStarsHtml(rating.stars, 14)}
            <div style="font-size:0.68rem; font-weight:700; color:${STAR_COLOR}; text-transform:uppercase; letter-spacing:0.04em;">${escHtml(rating.label)}</div>
        </div>`;
}
