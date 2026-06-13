import { PLATFORM } from '../config/platform.js';
import { key as lsKey } from '../config/storageKeys.js';

let translations = {};
// Default market language is Slovenian; users can switch to English via the
// header language dropdown. The choice is persisted in localStorage.
const SUPPORTED_LANGS = ['sl', 'en'];
const DEFAULT_LANG = 'sl';
let currentLang = DEFAULT_LANG;

// Brand placeholder injected into every translation: "{brand}" → "MojAvto.si" |
// "MojaNavtika.si". Lets one set of language strings serve both platforms.
const BRAND_FULL = `${PLATFORM.brandName}${PLATFORM.tld}`;

// Resolves once translations (incl. the platform overlay) are loaded. The router
// awaits this before rendering the first view so no view paints with stale/base
// strings (otherwise the home hero etc. could show base words before the overlay).
let _resolveReady;
export const i18nReady = new Promise(r => { _resolveReady = r; });

export async function initI18n() {
    const saved = localStorage.getItem(lsKey('lang'));
    currentLang = SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
    await loadTranslations(currentLang);
    document.documentElement.lang = currentLang;
    _resolveReady();
}

/** Supported UI languages (for building the language dropdown). */
export function getSupportedLangs() {
    return [...SUPPORTED_LANGS];
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
    } catch (error) {
        console.error(`Could not load language file: ${lang}.json`, error);
    }
    // Platform overlay: merge e.g. lang/sl.navtika.json over the base so MojaNavtika
    // can override vehicle-specific copy (taglines, hero words) and add its own
    // category/type labels. Base file stays focused on MojAvto.
    if (PLATFORM.id !== 'avto') {
        try {
            const res = await fetch(`lang/${lang}.${PLATFORM.id}.json`);
            if (res.ok) translations = { ...translations, ...(await res.json()) };
        } catch { /* overlay is optional */ }
    }
}

export function t(key, replacements = {}) {
    let translation = translations[key];

    // Support fallback as second argument if it's a string
    if (!translation) {
        if (typeof replacements === 'string') return injectBrand(replacements);
        return key;
    }

    if (typeof replacements !== 'object') return injectBrand(translation);

    for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return injectBrand(translation);
}

// Replace the {brand} placeholder with the active platform's full brand name.
function injectBrand(str) {
    return typeof str === 'string' && str.includes('{brand}')
        ? str.replaceAll('{brand}', BRAND_FULL)
        : str;
}

export async function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(lsKey('lang'), lang);
    await loadTranslations(lang);
    document.documentElement.lang = lang;
}

// Switch the active language and re-translate everything already in the DOM
// (loaded view, header, footer), then notify listeners so JS-rendered views can
// re-render with the new strings. Used by the header language dropdown.
export async function switchLang(lang) {
    if (lang === currentLang || !SUPPORTED_LANGS.includes(lang)) return;
    await setLang(lang);
    translatePage(document);
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

export function getCurrentLang() {
    return currentLang;
}

export function translatePage(container = document) {
    container.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        const target = el.getAttribute('data-i18n-target') || 'textContent';
        const translation = t(key);
        if (translation !== key) {
            if (target === 'textContent') el.textContent = translation;
            else if (target === 'innerHTML') el.innerHTML = translation;
            else if (target === 'placeholder') el.placeholder = translation;
            else el.setAttribute(target, translation);
        }
    });
}


