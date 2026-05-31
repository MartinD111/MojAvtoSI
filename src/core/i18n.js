
let translations = {};
// Slovenian market — single language
let currentLang = 'sl';

export async function initI18n() {
    currentLang = 'sl';
    await loadTranslations(currentLang);
    document.documentElement.lang = currentLang;
}

async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        translations = await response.json();
    } catch (error) {
        console.error(`Could not load language file: ${lang}.json`, error);
    }
}

export function t(key, replacements = {}) {
    let translation = translations[key];
    
    // Support fallback as second argument if it's a string
    if (!translation) {
        if (typeof replacements === 'string') return replacements;
        return key;
    }

    if (typeof replacements !== 'object') return translation;

    for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return translation;
}

export async function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('mojavto_lang', lang);
    await loadTranslations(lang);
    document.documentElement.lang = lang;
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


