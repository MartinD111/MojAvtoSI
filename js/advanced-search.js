document.addEventListener("DOMContentLoaded", () => {
    // --- Load header and menu ---
    fetch("header.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("header").innerHTML = data;
        const userMenuScript = document.createElement('script');
        userMenuScript.src = 'js/userMenu.js';
        document.body.appendChild(userMenuScript);
      });

    fetch("footer.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("footer").innerHTML = data;
      });

    // --- DOM elements ---
    const searchForm = document.getElementById("advancedSearchForm");
    const saveSearchBtn = document.getElementById("saveSearchBtn");
    const resetBtn = searchForm.querySelector('button[type="reset"]');
    const brandSelect = document.getElementById("make");
    const modelSelect = document.getElementById("model");
    const yearFromSelect = document.getElementById("year-from");
    const yearToSelect = document.getElementById("year-to");
    const fuelSelect = document.getElementById("fuel");
    const hybridOptions = document.getElementById("hybrid-options");
    const priceSlider = document.getElementById("price-slider");

    // --- Price slider initialization ---
    if (priceSlider && typeof noUiSlider !== 'undefined') {
        noUiSlider.create(priceSlider, {
            start: [0, 100000],
            connect: true,
            range: {
                'min': 0,
                'max': 100000
            },
            step: 500,
            format: {
                to: value => Math.round(value),
                from: value => Number(value)
            }
        });

        priceSlider.noUiSlider.on('update', (values) => {
            document.getElementById('price-lower').textContent = `$${parseInt(values[0]).toLocaleString()}`;
            document.getElementById('price-upper').textContent = `$${parseInt(values[1]).toLocaleString()}`;
        });
    }

    // --- Populate years ---
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1980; y--) {
        const optionFrom = document.createElement('option');
        optionFrom.value = y;
        optionFrom.textContent = y;
        yearFromSelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = y;
        optionTo.textContent = y;
        yearToSelect.appendChild(optionTo);
    }

    // --- Populate makes and models ---
    let brandModelData = {};
    fetch("json/brands_models_global.json")
      .then(res => res.json())
      .then(data => {
        brandModelData = data;
        Object.keys(brandModelData).sort().forEach(brand => {
            const option = document.createElement("option");
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });
      });

    brandSelect.addEventListener("change", function () {
        const selectedMake = brandSelect.value;
        modelSelect.innerHTML = `<option value="" data-i18n-key="all_models">All Models</option>`;
        modelSelect.disabled = true;

        if (selectedMake && brandModelData[selectedMake]) {
            const models = brandModelData[selectedMake];
            const modelKeys = Array.isArray(models) ? models : Object.keys(models);
            modelKeys.forEach(model => {
                const option = document.createElement("option");
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
            modelSelect.disabled = false;
        }
    });

    // --- Show/hide hybrid options ---
    fuelSelect.addEventListener('change', () => {
        if (fuelSelect.value === 'Hibrid') {
            hybridOptions.style.display = 'block';
        } else {
            hybridOptions.style.display = 'none';
            // Clear checkboxes when hidden
            document.getElementById('phfv').checked = false;
            document.getElementById('mild-hybrid').checked = false;
        }
    });

    // --- Form submit ---
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchCriteria = getCriteriaFromForm();
        sessionStorage.setItem('advancedSearchCriteria', JSON.stringify(searchCriteria));

        // Build URL params using state/city/zipCode/searchRadius
        const params = new URLSearchParams();
        if (searchCriteria.state)        params.set('state', searchCriteria.state);
        if (searchCriteria.city)         params.set('city', searchCriteria.city);
        if (searchCriteria.zipCode)      params.set('zipCode', searchCriteria.zipCode);
        if (searchCriteria.searchRadius) params.set('searchRadius', searchCriteria.searchRadius);
        if (searchCriteria.make)         params.set('make', searchCriteria.make);
        if (searchCriteria.model)        params.set('model', searchCriteria.model);
        if (searchCriteria.priceFrom)    params.set('priceFrom', searchCriteria.priceFrom);
        if (searchCriteria.priceTo)      params.set('priceTo', searchCriteria.priceTo);
        if (searchCriteria.yearFrom)     params.set('yearFrom', searchCriteria.yearFrom);
        if (searchCriteria.yearTo)       params.set('yearTo', searchCriteria.yearTo);
        if (searchCriteria.fuel)         params.set('fuel', searchCriteria.fuel);
        if (searchCriteria.gearbox)      params.set('gearbox', searchCriteria.gearbox);

        window.location.href = "index.html?" + params.toString();
    });

    // --- Reset functionality ---
    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();

        // Reset form
        searchForm.reset();

        // Reset price slider
        if (priceSlider && priceSlider.noUiSlider) {
            priceSlider.noUiSlider.set([0, 100000]);
        }

        // Reset model select (disable)
        modelSelect.innerHTML = `<option value="" data-i18n-key="all_models">Vsi modeli</option>`;
        variantSelect.innerHTML = `<option value="" data-i18n-key="cl_trim_variant">Vse oblike</option>`;
        modelSelect.disabled = true;

        // Hide hybrid options
        hybridOptions.style.display = 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    saveSearchBtn.addEventListener('click', () => {
        const loggedUser = JSON.parse(localStorage.getItem("mojavto_loggedUser"));
        if (!loggedUser) {
            alert("You must be signed in to save searches.");
            return;
        }

        const searchName = prompt("Enter a name for this search (e.g. 'Family wagon under 15k'):");
        if (!searchName || searchName.trim() === "") {
            alert("Search name cannot be empty.");
            return;
        }

        const searchCriteria = getCriteriaFromForm();

        // Get current result count for notifications
        const allListings = JSON.parse(localStorage.getItem("mojavto_listings")) || [];
        const resultsCount = applyAdvancedFilters(allListings, searchCriteria).length;

        const newSavedSearch = {
            id: Date.now(),
            name: searchName,
            criteria: searchCriteria,
            savedAt: new Date().toISOString(),
            lastResultCount: resultsCount
        };

        const allSavedSearches = JSON.parse(localStorage.getItem('mojavto_savedSearches')) || {};
        if (!allSavedSearches[loggedUser.username]) {
            allSavedSearches[loggedUser.username] = [];
        }

        allSavedSearches[loggedUser.username].push(newSavedSearch);
        localStorage.setItem('mojavto_savedSearches', JSON.stringify(allSavedSearches));

        alert(`Search "${searchName}" has been saved successfully!`);
    });

    // --- Helper: collect criteria from form ---
    function getCriteriaFromForm() {
        const formData = new FormData(searchForm);
        const criteria = {};

        // Read URL params: state, city, zipCode, searchRadius
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('state'))        criteria.state = urlParams.get('state');
        if (urlParams.get('city'))         criteria.city = urlParams.get('city');
        if (urlParams.get('zipCode'))      criteria.zipCode = urlParams.get('zipCode');
        if (urlParams.get('searchRadius')) criteria.searchRadius = urlParams.get('searchRadius');

        // Price from slider
        if (priceSlider && priceSlider.noUiSlider) {
            const priceValues = priceSlider.noUiSlider.get(true);
            criteria['priceFrom'] = priceValues[0];
            criteria['priceTo'] = priceValues[1];
        }

        // Other form data
        for (const [key, value] of formData.entries()) {
            if (value) {
                // For checkboxes (hybridType) — collect all checked
                if (key === 'hybridType') {
                    if (!criteria.hybridTypes) {
                        criteria.hybridTypes = [];
                    }
                    criteria.hybridTypes.push(value);
                } else {
                    criteria[key] = value;
                }
            }
        }

        // Map form field 'state'/'city'/'zipCode'/'searchRadius' from form entries
        if (formData.get('state'))        criteria.state = formData.get('state');
        if (formData.get('city'))         criteria.city = formData.get('city');
        if (formData.get('zipCode'))      criteria.zipCode = formData.get('zipCode');
        if (formData.get('searchRadius')) criteria.searchRadius = formData.get('searchRadius');

        return criteria;
    }

    // Filter function for immediate result counting
    function applyAdvancedFilters(listings, criteria) {
        let filtered = listings;
        if (!criteria) return [];

        if (criteria.make) filtered = filtered.filter(l => l.make === criteria.make);
        if (criteria.model) filtered = filtered.filter(l => l.model === criteria.model);
        if (criteria.priceFrom) filtered = filtered.filter(l => l.price >= Number(criteria.priceFrom));
        if (criteria.priceTo) filtered = filtered.filter(l => l.price <= Number(criteria.priceTo));
        if (criteria.yearFrom) filtered = filtered.filter(l => l.year >= Number(criteria.yearFrom));
        if (criteria.yearTo) filtered = filtered.filter(l => l.year <= Number(criteria.yearTo));
        if (criteria.mileageTo) filtered = filtered.filter(l => l.mileage <= Number(criteria.mileageTo));
        if (criteria.fuel) filtered = filtered.filter(l => l.fuel === criteria.fuel);
        if (criteria.gearbox) filtered = filtered.filter(l => l.transmission === criteria.gearbox);
        if (criteria.state) filtered = filtered.filter(l => l.state === criteria.state);
        if (criteria.seatMaterial) filtered = filtered.filter(l => l.seatMaterial === criteria.seatMaterial);

        // Hybrid type filter
        if (criteria.hybridTypes && criteria.hybridTypes.length > 0) {
            filtered = filtered.filter(l => {
                return l.hybridType && criteria.hybridTypes.includes(l.hybridType);
            });
        }

        return filtered;
    }
});
