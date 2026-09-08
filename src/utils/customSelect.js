import { t } from '../core/i18n.js';
import { getBrandLogo, getBrandInitial, isBrandMonochrome } from '../data/brandLogos.js';
import { getBrandRgb } from '../data/brandColors.js';
import { getCountryRgb, getCountryOptionHtml, getCountryTriggerHtml } from '../data/countryFlags.js';

function getBrandOptionHtml(optText, optValue) {
    if (!optValue) return optText;
    const logoUrl = getBrandLogo(optValue);
    const brandRgb = getBrandRgb(optValue || optText);
    const initial = getBrandInitial(optText);
    const isAdaptive = isBrandMonochrome(optValue || optText);
    const adaptiveClass = isAdaptive ? 'logo-adaptive' : '';
    if (logoUrl) {
        return `<div class="custom-select-brand-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span><div class="custom-select-brand-watermark"><img src="${logoUrl}" class="custom-select-brand-logo ${adaptiveClass}" alt="" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" /><span class="custom-select-brand-badge" style="display:none;">${initial}</span></div></div>`;
    }
    return `<div class="custom-select-brand-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span><div class="custom-select-brand-watermark"><span class="custom-select-brand-badge">${initial}</span></div></div>`;
}

function getBrandTriggerHtml(optText, optValue) {
    if (!optValue) return optText;
    const logoUrl = getBrandLogo(optValue);
    const brandRgb = getBrandRgb(optValue || optText);
    const initial = getBrandInitial(optText);
    const isAdaptive = isBrandMonochrome(optValue || optText);
    const adaptiveClass = isAdaptive ? 'logo-adaptive' : '';
    if (logoUrl) {
        return `<div class="custom-select-brand-item trigger-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span><div class="custom-select-brand-watermark"><img src="${logoUrl}" class="custom-select-brand-logo ${adaptiveClass}" alt="" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" /><span class="custom-select-brand-badge" style="display:none;">${initial}</span></div></div>`;
    }
    return `<div class="custom-select-brand-item trigger-item" style="--brand-rgb: ${brandRgb};"><span class="custom-select-brand-name">${optText}</span><div class="custom-select-brand-watermark"><span class="custom-select-brand-badge">${initial}</span></div></div>`;
}

function getColorDotHtml(colorName) {
    if (!colorName) return '';
    const map = {
        'Bela': '#ffffff',
        'Črna': '#000000',
        'Siva': '#808080',
        'Srebrna': '#c0c0c0',
        'Modra': '#1e40af',
        'Rdeča': '#dc2626',
        'Zelena': '#16a34a',
        'Rumena': '#facc15',
        'Rjava': '#78350f',
        'Oranžna': '#ea580c',
        'Vijolična': '#7c3aed',
        'Zlata': '#fbbf24',
        'Bronasta': '#cd7f32',
    };
    
    const normalized = colorName.trim();
    let bg = map[normalized];
    if (!bg) {
        const enMap = {
            'white': '#ffffff',
            'black': '#000000',
            'grey': '#808080',
            'silver': '#c0c0c0',
            'blue': '#1e40af',
            'red': '#dc2626',
            'green': '#16a34a',
            'yellow': '#facc15',
            'brown': '#78350f',
            'orange': '#ea580c',
            'purple': '#7c3aed',
            'gold': '#fbbf24',
            'bronze': '#cd7f32',
        };
        bg = enMap[normalized.toLowerCase()];
    }

    if (normalized === 'Druga' || normalized.toLowerCase() === 'druga' || normalized.toLowerCase() === 'other' || !bg) {
        bg = 'linear-gradient(45deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)';
    }

    const borderStyle = (normalized === 'Bela' || normalized.toLowerCase() === 'white')
        ? 'border: 1px solid rgba(0,0,0,0.25);'
        : (normalized === 'Črna' || normalized.toLowerCase() === 'black')
            ? 'border: 1px solid rgba(255,255,255,0.4);'
            : 'border: 1px solid rgba(0,0,0,0.15);';

    return `<span class="custom-select-color-dot" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${bg};${borderStyle}margin-right:8px;vertical-align:middle;flex-shrink:0;"></span>`;
}

/**
 * CustomSelect - Transforms standard HTML selects into searchable, pill-shaped dropdowns.
 */
export function initCustomSelects(scope = document) {
    const selects = scope.querySelectorAll('select:not(.custom-select-hidden)');
    selects.forEach(select => {
        createCustomSelect(select);
    });
}

export function createCustomSelect(select) {
    if (!select || select.dataset.customSelectInit) return;
    select.dataset.customSelectInit = "true";
    select.classList.add('custom-select-hidden');
    select.style.display = 'none';

    // Hide any hardcoded static sibling select-icon to prevent double chevron arrows
    if (select.parentNode && typeof select.parentNode.querySelector === 'function') {
        const staticChevron = select.parentNode.querySelector(':scope > .select-icon');
        if (staticChevron) {
            staticChevron.style.display = 'none';
        }
    }

    const container = document.createElement('div');
    container.className = 'custom-select-container';

    const isColorSelect = select.id === 'fColor';
    const isBrandSelect = select.name === 'make' ||
                          select.id === 'home-make' ||
                          select.id === 'nav-home-make' ||
                          select.id === 'make' ||
                          select.id === 'sidebarMake' ||
                          select.id === 'eval-make' ||
                          select.id === 'fMake' ||
                          select.name === 'engineMake' ||
                          select.id === 'advEngineMake' ||
                          select.id === 'sidebarEngineMake' ||
                          select.dataset.type === 'make' ||
                          select.dataset.type === 'brand';
    const isCountrySelect = select.name === 'country' ||
                            select.id === 'home-country' ||
                            select.id === 'sidebarCountry' ||
                            select.id === 'vendor-country' ||
                            select.id === 'country' ||
                            select.id === 'reCountry' ||
                            select.dataset.type === 'country';
    const initialOpt = select.options[select.selectedIndex];
    let initialValHtml = initialOpt?.text || '';
    if (isColorSelect && initialOpt && initialOpt.value) {
        initialValHtml = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(initialOpt.value)}<span>${initialOpt.text}</span></div>`;
    } else if (isBrandSelect && initialOpt && initialOpt.value) {
        initialValHtml = getBrandTriggerHtml(initialOpt.text, initialOpt.value);
    } else if (isCountrySelect && initialOpt && initialOpt.value) {
        initialValHtml = getCountryTriggerHtml(initialOpt.text, initialOpt.value);
    }

    const noChevron = select.dataset.noChevron === "true";

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `
        <span class="custom-select-value">${initialValHtml}</span>
        ${noChevron ? '' : '<i data-lucide="chevron-down" class="select-icon"></i>'}
    `;

    function syncTriggerBrand(opt) {
        if (!isBrandSelect || !trigger) return;
        if (opt && opt.value) {
            const rgb = getBrandRgb(opt.value || opt.text);
            trigger.style.setProperty('--brand-rgb', rgb);
            trigger.classList.add('brand-selected');
        } else {
            trigger.style.removeProperty('--brand-rgb');
            trigger.classList.remove('brand-selected');
        }
    }
    syncTriggerBrand(initialOpt);

    function syncTriggerCountry(opt) {
        if (!isCountrySelect || !trigger) return;
        if (opt && opt.value) {
            const rgb = getCountryRgb(opt.value || opt.text);
            trigger.style.setProperty('--country-rgb', rgb);
            trigger.classList.add('country-selected');
        } else {
            trigger.style.removeProperty('--country-rgb');
            trigger.classList.remove('country-selected');
        }
    }
    syncTriggerCountry(initialOpt);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.addEventListener('click', (e) => e.stopPropagation());

    const noSearch = select.dataset.noSearch === "true";
    let searchInput = null;

    if (!noSearch) {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'custom-select-search-wrapper';
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = t('search_placeholder', 'Search...');
        searchInput.autocomplete = 'off';
        searchInput.autocapitalize = 'none';
        searchInput.spellcheck = false;
        searchWrapper.appendChild(searchInput);
        menu.appendChild(searchWrapper);
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    menu.appendChild(optionsContainer);
    container.appendChild(trigger);
    container.appendChild(menu);

    select.parentNode.insertBefore(container, select);

    let liftedAncestors = [];

    function openMenu() {
        container.classList.add('open');
        menu.classList.add('open');
        trigger.classList.add('open');

        // Check if menu would overflow viewport bottom, open upward if needed
        const rect = container.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 280 && spaceAbove > spaceBelow) {
            menu.classList.add('open-up');
        } else {
            menu.classList.remove('open-up');
        }

        // Lift ancestor elements to ensure dropdown is not clipped and displays above other sections
        liftedAncestors = [];
        let curr = container.parentElement;
        const z = 99999;
        while (curr && curr !== document.body && curr !== document.documentElement) {
            const comp = window.getComputedStyle(curr);
            const overflowHidden = comp.overflow !== 'visible' || comp.overflowX !== 'visible' || comp.overflowY !== 'visible';
            const positionStatic = comp.position === 'static';

            liftedAncestors.push({
                el: curr,
                hadZIndex: curr.style.zIndex,
                hadOverflow: curr.style.overflow,
                hadPosition: curr.style.position
            });
            curr.style.zIndex = String(z);
            if (overflowHidden) {
                curr.style.overflow = 'visible';
            }
            if (positionStatic) {
                curr.style.position = 'relative';
            }
            curr = curr.parentElement;
        }

        if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            const isMobile = window.innerWidth < 768 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
            if (!isMobile) {
                searchInput.focus({ preventScroll: true });
            }
        }

        // Scroll so the label is visible above the pill — mobile only
        if (window.innerWidth < 768) {
            const fieldGroup = container.closest('.form-group, .field-group, .adv-field-group');
            const scrollTarget = fieldGroup || container;
            const stickyNav = document.querySelector('.sticky-nav');
            const navHeight = stickyNav ? stickyNav.getBoundingClientRect().height : 0;
            const targetRect = scrollTarget.getBoundingClientRect();
            const absoluteTop = targetRect.top + window.scrollY - navHeight - 8;
            window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
        }
    }

    function closeMenu() {
        container.classList.remove('open');
        if (menu) {
            menu.classList.remove('open');
            menu.classList.remove('open-up');
        }
        if (trigger) trigger.classList.remove('open');

        liftedAncestors.forEach(({ el, hadZIndex, hadOverflow, hadPosition }) => {
            el.style.zIndex = hadZIndex || '';
            el.style.overflow = hadOverflow || '';
            el.style.position = hadPosition || '';
        });
        liftedAncestors = [];

        if (searchInput) {
            searchInput.value = '';
            if (document.activeElement === searchInput) {
                searchInput.blur();
            }
        }
    }

    container.__closeMenu = closeMenu;

    function syncDisabledState() {
        const isDisabled = Boolean(select.disabled);
        container.classList.toggle('disabled', isDisabled);
        if (isDisabled) {
            closeMenu();
        }
    }

    // Intercept JS property assignments to select.disabled
    try {
        let disabledVal = select.disabled;
        Object.defineProperty(select, 'disabled', {
            get() {
                return disabledVal;
            },
            set(val) {
                disabledVal = Boolean(val);
                if (val) {
                    select.setAttribute('disabled', '');
                } else {
                    select.removeAttribute('disabled');
                }
                syncDisabledState();
            },
            configurable: true
        });
    } catch (e) {
        // Fallback for non-configurable properties
    }

    // Sync options
    function updateOptions() {
        optionsContainer.innerHTML = '';
        Array.from(select.options).forEach((opt, index) => {
            const optionElem = document.createElement('div');
            optionElem.className = 'custom-select-option';
            if (index === select.selectedIndex) optionElem.classList.add('selected');
            if (opt.dataset.popularLabel) optionElem.classList.add('popular-label');
            if (opt.dataset.popular) optionElem.dataset.popular = 'true';

            if (opt.dataset.popularLabel) {
                optionElem.textContent = opt.text;
            } else if (isColorSelect && opt.value) {
                optionElem.innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
            } else if (isBrandSelect && opt.value) {
                optionElem.classList.add('brand-option');
                const brandRgb = getBrandRgb(opt.value || opt.text);
                optionElem.style.setProperty('--brand-rgb', brandRgb);
                optionElem.innerHTML = getBrandOptionHtml(opt.text, opt.value);
            } else if (isCountrySelect && opt.value) {
                optionElem.classList.add('country-option');
                const countryRgb = getCountryRgb(opt.value || opt.text);
                optionElem.style.setProperty('--country-rgb', countryRgb);
                optionElem.innerHTML = getCountryOptionHtml(opt.text, opt.value);
            } else {
                optionElem.textContent = opt.text;
            }
            optionElem.dataset.value = opt.value;

            optionElem.addEventListener('click', (e) => {
                e.stopPropagation();
                if (select.disabled) return;
                select.selectedIndex = index;
                select.dispatchEvent(new Event('change'));
                if (isColorSelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
                } else if (isBrandSelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(opt.text, opt.value);
                    syncTriggerBrand(opt);
                } else if (isCountrySelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(opt.text, opt.value);
                    syncTriggerCountry(opt);
                } else {
                    trigger.querySelector('.custom-select-value').textContent = opt.text;
                    if (isBrandSelect) syncTriggerBrand(null);
                    if (isCountrySelect) syncTriggerCountry(null);
                }
                closeMenu();
            });
            optionsContainer.appendChild(optionElem);
        });
        // Sync trigger text with currently selected option
        if (trigger.querySelector('.custom-select-value')) {
            const selectedOpt = select.options[select.selectedIndex];
            if (isColorSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(selectedOpt.value)}<span>${selectedOpt.text}</span></div>`;
            } else if (isBrandSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerBrand(selectedOpt);
            } else if (isCountrySelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerCountry(selectedOpt);
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedOpt?.text || '';
                if (isBrandSelect) syncTriggerBrand(null);
                if (isCountrySelect) syncTriggerCountry(null);
            }
        }
        syncDisabledState();
    }

    updateOptions();

    // Toggle menu
    trigger.addEventListener('click', (e) => {
        syncDisabledState();
        if (select.disabled) return;
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllMenus();
        if (!isOpen) {
            openMenu();
        }
    });

    // Associated label click listener
    if (select.id) {
        const label = document.querySelector(`label[for="${select.id}"]`);
        if (label) {
            label.addEventListener('click', (e) => {
                syncDisabledState();
                if (select.disabled) return;
                e.preventDefault();
                trigger.click();
            });
        }
    }

    // Search logic
    let highlightedIndex = -1;
    function getVisibleOptions() {
        return Array.from(optionsContainer.querySelectorAll('.custom-select-option:not(.hidden):not(.no-results)'));
    }

    function highlightOption(index) {
        const visible = getVisibleOptions();
        visible.forEach(opt => opt.classList.remove('highlighted'));
        if (index >= 0 && index < visible.length) {
            visible[index].classList.add('highlighted');
            visible[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            highlightedIndex = index;
        } else {
            highlightedIndex = -1;
        }
    }

    function normStr(str) {
        return (str || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = normStr(searchInput.value.trim());
            const options = optionsContainer.querySelectorAll('.custom-select-option');
            let hasResults = false;

            options.forEach(opt => {
                // When searching, always hide the popular group (labels + duplicates)
                if (term && (opt.classList.contains('popular-label') || opt.dataset.popular === 'true')) {
                    opt.classList.add('hidden');
                    opt.style.display = 'none';
                    return;
                }
                const text = normStr(opt.textContent);
                const value = normStr(opt.dataset.value);
                let isAliasMatch = false;
                if (value === 'dmc' && 'delorean'.includes(term)) isAliasMatch = true;

                if (!term || text.includes(term) || isAliasMatch) {
                    opt.classList.remove('hidden');
                    opt.style.display = '';
                    if (!opt.classList.contains('popular-label')) {
                        hasResults = true;
                    }
                } else {
                    opt.classList.add('hidden');
                    opt.style.display = 'none';
                }
            });

            highlightedIndex = -1;
            options.forEach(opt => opt.classList.remove('highlighted'));

            // No results message
            let noRes = optionsContainer.querySelector('.no-results');
            if (!hasResults) {
                if (!noRes) {
                    noRes = document.createElement('div');
                    noRes.className = 'custom-select-option no-results';
                    noRes.textContent = t('no_results_found', 'No results found');
                    optionsContainer.appendChild(noRes);
                }
            } else if (noRes) {
                noRes.remove();
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            const visible = getVisibleOptions();
            if (visible.length === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = (highlightedIndex + 1) % visible.length;
                highlightOption(next);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = (highlightedIndex - 1 + visible.length) % visible.length;
                highlightOption(prev);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedIndex >= 0 && visible[highlightedIndex]) {
                    visible[highlightedIndex].click();
                } else if (visible.length === 1) {
                    visible[0].click();
                }
            } else if (e.key === 'Escape') {
                closeMenu();
            }
        });

        // Prevent click inside search from closing
        searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    // Observer to handle dynamic content changes in original select
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const currentSearch = searchInput ? searchInput.value : '';
                updateOptions();
                // If the menu is open and we had a search term, re-apply it
                if (container.classList.contains('open') && currentSearch && searchInput) {
                    searchInput.value = currentSearch;
                    searchInput.dispatchEvent(new Event('input'));
                }
            } else if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
                syncDisabledState();
            }
        });
    });
    observer.observe(select, { childList: true, attributes: true });

    // Sync trigger text when original select changes via JS
    select.addEventListener('change', () => {
        const selectedOpt = select.options[select.selectedIndex];
        const selectedText = selectedOpt?.text || '';
        if (trigger.querySelector('.custom-select-value')) {
            if (isColorSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(selectedOpt.value)}<span>${selectedOpt.text}</span></div>`;
            } else if (isBrandSelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getBrandTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerBrand(selectedOpt);
            } else if (isCountrySelect && selectedOpt && selectedOpt.value) {
                trigger.querySelector('.custom-select-value').innerHTML = getCountryTriggerHtml(selectedOpt.text, selectedOpt.value);
                syncTriggerCountry(selectedOpt);
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedText;
                if (isBrandSelect) syncTriggerBrand(null);
                if (isCountrySelect) syncTriggerCountry(null);
            }
        }
        // Highlight correct option
        optionsContainer.querySelectorAll('.custom-select-option').forEach((opt, idx) => {
            opt.classList.toggle('selected', idx === select.selectedIndex);
        });
    });

    if (window.lucide) window.lucide.createIcons({ scope: container });
}

export function closeAllMenus() {
    document.querySelectorAll('.custom-select-container.open').forEach(container => {
        if (typeof container.__closeMenu === 'function') {
            container.__closeMenu();
        } else {
            container.classList.remove('open');
            const menu = container.querySelector('.custom-select-menu');
            const trigger = container.querySelector('.custom-select-trigger');
            if (menu) menu.classList.remove('open');
            if (trigger) trigger.classList.remove('open');
        }
    });
}

document.addEventListener('click', closeAllMenus);

let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWindowWidth) {
        lastWindowWidth = window.innerWidth;
        closeAllMenus();
    }
});
