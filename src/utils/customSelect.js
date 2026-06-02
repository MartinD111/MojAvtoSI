import { t } from '../core/i18n.js';

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
export function initCustomSelects() {
    const selects = document.querySelectorAll('select:not(.custom-select-hidden)');
    selects.forEach(select => {
        // Skip already processed
        // We allow hidden selects if they are form inputs or have explicit glass-select class
        const isFormInput = select.classList.contains('pill-input') || 
                           select.classList.contains('cl-select') || 
                           select.classList.contains('pill-select') ||
                           select.classList.contains('glass-select');
                           
        if (select.offsetParent === null && !isFormInput) return;
        createCustomSelect(select);
    });
}

export function createCustomSelect(select) {
    if (select.dataset.customSelectInit) return;
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
    const initialOpt = select.options[select.selectedIndex];
    const initialValHtml = (isColorSelect && initialOpt && initialOpt.value)
        ? `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(initialOpt.value)}<span>${initialOpt.text}</span></div>`
        : initialOpt?.text || '';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `
        <span class="custom-select-value">${initialValHtml}</span>
        <i data-lucide="chevron-down" class="select-icon"></i>
    `;

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';

    const noSearch = select.dataset.noSearch === "true";
    let searchInput = null;

    if (!noSearch) {
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'custom-select-search-wrapper';
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = t('search_placeholder', 'Search...');
        searchWrapper.appendChild(searchInput);
        menu.appendChild(searchWrapper);
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';

    menu.appendChild(optionsContainer);
    container.appendChild(trigger);
    container.appendChild(menu);

    select.parentNode.insertBefore(container, select);

    // Sync options
    function updateOptions() {
        optionsContainer.innerHTML = '';
        Array.from(select.options).forEach((opt, index) => {
            const optionElem = document.createElement('div');
            optionElem.className = 'custom-select-option';
            if (index === select.selectedIndex) optionElem.classList.add('selected');
            
            if (isColorSelect && opt.value) {
                optionElem.innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
            } else {
                optionElem.textContent = opt.text;
            }
            optionElem.dataset.value = opt.value;

            optionElem.addEventListener('click', () => {
                if (select.disabled) return;
                select.selectedIndex = index;
                select.dispatchEvent(new Event('change'));
                if (isColorSelect && opt.value) {
                    trigger.querySelector('.custom-select-value').innerHTML = `<div style="display:flex;align-items:center;gap:4px;">${getColorDotHtml(opt.value)}<span>${opt.text}</span></div>`;
                } else {
                    trigger.querySelector('.custom-select-value').textContent = opt.text;
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
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedOpt?.text || '';
            }
        }
        syncDisabledState();
    }

    function syncDisabledState() {
        if (select.disabled) {
            container.classList.add('disabled');
        } else {
            container.classList.remove('disabled');
        }
    }

    updateOptions();

    // Toggle menu
    trigger.addEventListener('click', (e) => {
        if (select.disabled) return;
        e.stopPropagation();
        const isOpen = menu.classList.contains('open');
        closeAllMenus();
        if (!isOpen) {
            container.classList.add('open');
            menu.classList.add('open');
            trigger.classList.add('open');
            
            // Lift parent container to ensure dropdown overlaps subsequent sections
            const liftParent = container.closest('.search-box, .adv-accordion, .glass-card, .search-box-container');
            if (liftParent) {
                // Store original z-index if not already stored
                if (!liftParent.dataset.hadZIndex) {
                    liftParent.dataset.hadZIndex = liftParent.style.zIndex || 'undefined';
                }
                liftParent.style.zIndex = "4000";
                
                // Store original overflow to restore it later
                if (!liftParent.dataset.oldOverflow) {
                    liftParent.dataset.oldOverflow = liftParent.style.overflow || 'undefined';
                }
                liftParent.style.overflow = "visible";

                if (window.getComputedStyle(liftParent).position === 'static') {
                    liftParent.style.position = 'relative';
                }
            }

            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
                // Trigger input event to show all options if there was a previous search
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });

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

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const options = optionsContainer.querySelectorAll('.custom-select-option');
            let hasResults = false;

            options.forEach(opt => {
                const text = opt.textContent.toLowerCase();
                if (text.includes(term)) {
                    opt.classList.remove('hidden');
                    hasResults = true;
                } else {
                    opt.classList.add('hidden');
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

    function closeMenu() {
        container.classList.remove('open');
        if (menu) menu.classList.remove('open');
        if (trigger) trigger.classList.remove('open');
        
        // Find the highest parent we lifted
        const liftParent = container.closest('.search-box-container, .main-search-card, .adv-accordion, .glass-card, .search-box');
        if (liftParent) {
            // Restore z-index
            if (liftParent.dataset.hadZIndex !== undefined) {
                liftParent.style.zIndex = liftParent.dataset.hadZIndex === 'undefined' ? "" : liftParent.dataset.hadZIndex;
                delete liftParent.dataset.hadZIndex;
            }
            
            // Restore overflow
            if (liftParent.dataset.oldOverflow !== undefined) {
                liftParent.style.overflow = liftParent.dataset.oldOverflow === 'undefined' ? "" : liftParent.dataset.oldOverflow;
                delete liftParent.dataset.oldOverflow;
            }
        }
        
        if (searchInput) searchInput.value = '';
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
            } else {
                trigger.querySelector('.custom-select-value').textContent = selectedText;
            }
        }
        // Highlight correct option
        optionsContainer.querySelectorAll('.custom-select-option').forEach((opt, idx) => {
            opt.classList.toggle('selected', idx === select.selectedIndex);
        });
    });


    if (window.lucide) window.lucide.createIcons({ scope: container });
}

function closeAllMenus() {
    document.querySelectorAll('.custom-select-container.open').forEach(container => {
        container.classList.remove('open');
        const menu = container.querySelector('.custom-select-menu');
        const trigger = container.querySelector('.custom-select-trigger');
        if (menu) menu.classList.remove('open');
        if (trigger) trigger.classList.remove('open');
        
        const liftParent = container.closest('.search-box-container, .main-search-card, .adv-accordion, .glass-card, .search-box');
        if (liftParent) {
            // Restore z-index
            if (liftParent.dataset.hadZIndex !== undefined) {
                liftParent.style.zIndex = liftParent.dataset.hadZIndex === 'undefined' ? "" : liftParent.dataset.hadZIndex;
                delete liftParent.dataset.hadZIndex;
            }

            // Restore overflow
            if (liftParent.dataset.oldOverflow !== undefined) {
                liftParent.style.overflow = liftParent.dataset.oldOverflow === 'undefined' ? "" : liftParent.dataset.oldOverflow;
                delete liftParent.dataset.oldOverflow;
            }
        }
    });
}

document.addEventListener('click', closeAllMenus);
