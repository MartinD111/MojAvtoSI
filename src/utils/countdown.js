// countdown.js — auction countdown helpers (shared by board + detail page).

/** Milliseconds from a Firestore Timestamp | Date | number | ISO string. */
export function endsAtMillis(endsAt) {
    if (!endsAt) return null;
    if (typeof endsAt.toMillis === 'function') return endsAt.toMillis();
    if (endsAt.seconds) return endsAt.seconds * 1000;
    if (endsAt instanceof Date) return endsAt.getTime();
    if (typeof endsAt === 'number') return endsAt;
    const parsed = Date.parse(endsAt);
    return Number.isNaN(parsed) ? null : parsed;
}

/** Human countdown string in Slovene, e.g. "2 dni 4 h 12 min" or "Zaključeno". */
export function formatCountdown(endMs, now = Date.now()) {
    if (endMs == null) return '';
    let diff = endMs - now;
    if (diff <= 0) return 'Zaključeno';
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    if (d > 0) return `${d} ${d === 1 ? 'dan' : 'dni'} ${h} h ${m} min`;
    if (h > 0) return `${h} h ${m} min ${s} s`;
    return `${m} min ${s} s`;
}

/** True when within the final hour — callers can render an "urgent" style. */
export function isEndingSoon(endMs, now = Date.now()) {
    if (endMs == null) return false;
    const diff = endMs - now;
    return diff > 0 && diff <= 3600000;
}

/**
 * Attach a 1s-ticking countdown to an element. Returns a stop() fn.
 * onTick(text, { ended, endingSoon }) optional.
 */
export function startCountdown(el, endMs, onTick) {
    if (!el) return () => {};
    const update = () => {
        const text = formatCountdown(endMs);
        el.textContent = text;
        const ended = endMs != null && endMs - Date.now() <= 0;
        el.classList.toggle('ending-soon', isEndingSoon(endMs));
        el.classList.toggle('ended', ended);
        if (onTick) onTick(text, { ended, endingSoon: isEndingSoon(endMs) });
        if (ended) { clearInterval(timer); }
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
}
