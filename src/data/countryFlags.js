// Country flags and signature colors data for MojAvto.si / MojaNavtika.si

export const COUNTRY_COLORS_RGB = {
  'SI': '0, 85, 184',       // Slovenian Blue
  'HR': '238, 28, 37',      // Croatian Red
  'RS': '198, 54, 60',      // Serbian Red
  'BA': '0, 35, 102',       // Bosnian Blue
  'IT': '0, 140, 69',       // Italian Green
  'AT': '200, 16, 46',      // Austrian Red
  'HU': '71, 112, 80',      // Hungarian Green
  'SK': '11, 78, 162',      // Slovak Blue
  'CZ': '17, 69, 126',      // Czech Blue
  'PL': '220, 20, 60',      // Polish Crimson
  'ES': '170, 21, 27',      // Spanish Red
};

const NAME_TO_CODE = {
  'slovenija': 'SI',
  'slovenia': 'SI',
  'si': 'SI',
  'hrvaska': 'HR',
  'hrvaška': 'HR',
  'croatia': 'HR',
  'hr': 'HR',
  'srbija': 'RS',
  'serbia': 'RS',
  'rs': 'RS',
  'bosna in hercegovina': 'BA',
  'bosna': 'BA',
  'bosnia': 'BA',
  'ba': 'BA',
  'italija': 'IT',
  'italy': 'IT',
  'it': 'IT',
  'avstrija': 'AT',
  'austria': 'AT',
  'at': 'AT',
  'madzarska': 'HU',
  'madžarska': 'HU',
  'hungary': 'HU',
  'hu': 'HU',
  'slovaska': 'SK',
  'slovaška': 'SK',
  'slovakia': 'SK',
  'sk': 'SK',
  'ceska': 'CZ',
  'češka': 'CZ',
  'czechia': 'CZ',
  'czech republic': 'CZ',
  'cz': 'CZ',
  'poljska': 'PL',
  'poland': 'PL',
  'pl': 'PL',
  'spanija': 'ES',
  'španija': 'ES',
  'spain': 'ES',
  'es': 'ES',
};

export function resolveCountryCode(valueOrName) {
  if (!valueOrName) return '';
  const clean = String(valueOrName).trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (NAME_TO_CODE[clean]) return NAME_TO_CODE[clean];
  const upper = String(valueOrName).trim().toUpperCase();
  if (COUNTRY_COLORS_RGB[upper]) return upper;
  return '';
}

export function getCountryRgb(valueOrName) {
  const code = resolveCountryCode(valueOrName);
  return COUNTRY_COLORS_RGB[code] || '37, 99, 235';
}

export function getCountryFlag(valueOrName) {
  const code = resolveCountryCode(valueOrName);
  if (!code) return null;
  return `/images/flags/${code.toLowerCase()}.svg`;
}

export function getCountryOptionHtml(optText, optValue) {
  if (!optValue) return optText;
  const flagUrl = getCountryFlag(optValue || optText);
  const countryRgb = getCountryRgb(optValue || optText);
  if (flagUrl) {
    return `<div class="custom-select-country-item" style="--country-rgb: ${countryRgb};">` +
      `<span class="custom-select-country-name">${optText}</span>` +
      `<div class="custom-select-country-watermark">` +
        `<div class="custom-select-country-flag-wrap">` +
          `<img src="${flagUrl}" class="custom-select-country-flag" alt="${optText}" loading="lazy" onerror="this.parentElement.style.display='none';" />` +
        `</div>` +
      `</div>` +
    `</div>`;
  }
  return optText;
}

export function getCountryTriggerHtml(optText, optValue) {
  if (!optValue) return optText;
  const flagUrl = getCountryFlag(optValue || optText);
  const countryRgb = getCountryRgb(optValue || optText);
  if (flagUrl) {
    return `<div class="custom-select-country-item trigger-item" style="--country-rgb: ${countryRgb};">` +
      `<span class="custom-select-country-name">${optText}</span>` +
      `<div class="custom-select-country-watermark">` +
        `<div class="custom-select-country-flag-wrap">` +
          `<img src="${flagUrl}" class="custom-select-country-flag" alt="${optText}" onerror="this.parentElement.style.display='none';" />` +
        `</div>` +
      `</div>` +
    `</div>`;
  }
  return optText;
}
