import { t } from '../core/i18n.js';

export async function initTransportPage() {
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const transportForm = document.getElementById('transportRequestForm');
    const compareSelect = document.getElementById('transportCompareSelect');
    const urlInput = document.getElementById('transportUrl');
    const fareResultArea = document.getElementById('fareResultArea');
    const fareAmountDisplay = document.getElementById('fareAmountDisplay');
    const acceptFareBtn = document.getElementById('acceptFareBtn');
    const statusAlert = document.getElementById('transportStatusAlert');
    
    const driverForm = document.getElementById('transportDriverForm');
    const driverAlert = document.getElementById('driverStatusAlert');

    // 1. Populate Compared Cars
    const compareList = JSON.parse(localStorage.getItem('mojavto_compare') || '[]');
    if (compareList.length > 0) {
        compareList.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id || car.title;
            // E.g., "2019 BMW 320d" or similar
            option.textContent = car.title || `Vehicle #${car.id}`;
            compareSelect.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.disabled = true;
        option.textContent = "No compared cars found";
        compareSelect.appendChild(option);
    }

    // Mutual exclusivity between URL and Compare Select
    urlInput.addEventListener('input', () => {
        if (urlInput.value.trim() !== '') {
            compareSelect.value = "";
        }
    });

    compareSelect.addEventListener('change', () => {
        if (compareSelect.value !== '') {
            urlInput.value = "";
        }
    });

    // 2. Handle Fare Calculation
    transportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset previous state
        statusAlert.classList.remove('active');
        statusAlert.classList.remove('success');
        statusAlert.classList.add('info');
        
        // Basic validation
        if (!urlInput.value && !compareSelect.value) {
            alert("Please provide a URL or select a compared vehicle.");
            return;
        }

        const zip = document.getElementById('transportDestZip').value;
        if (!zip) return;

        // Mock calculation based on ZIP code to make it look dynamic
        // A simple hash of the ZIP string to get a price between $300 and $1500
        let hash = 0;
        for (let i = 0; i < zip.length; i++) {
            hash = zip.charCodeAt(i) + ((hash << 5) - hash);
        }
        const baseFare = 300;
        const variableFare = Math.abs(hash % 1200);
        const totalFare = baseFare + variableFare;

        fareAmountDisplay.textContent = `$${totalFare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        fareResultArea.classList.add('active');
        
        // Re-enable accept button if it was disabled in a previous run
        acceptFareBtn.disabled = false;
        acceptFareBtn.innerHTML = `<i data-lucide="check-circle"></i> <span>${t('transport_accept_btn') || 'Accept & Request Driver'}</span>`;
        if (window.lucide) window.lucide.createIcons();
    });

    // 3. Handle Accepting Fare & Finding Driver
    acceptFareBtn.addEventListener('click', () => {
        acceptFareBtn.disabled = true;
        
        // Show searching state
        statusAlert.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> <span>${t('transport_req_success') || 'Request sent! Searching for a driver...'}</span>`;
        statusAlert.className = 'transport-alert info active';
        if (window.lucide) window.lucide.createIcons();

        // Simulate network delay for finding driver (3 seconds)
        setTimeout(() => {
            statusAlert.innerHTML = `<i data-lucide="check-circle"></i> <span>${t('transport_driver_found') || 'Driver found! John D. will deliver your vehicle.'}</span>`;
            statusAlert.className = 'transport-alert success active';
            if (window.lucide) window.lucide.createIcons();
        }, 3000);
    });

    // 4. Handle Driver Application
    driverForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = driverForm.querySelector('.pill-btn');
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin"></i> <span>Submitting...</span>`;
        if (window.lucide) window.lucide.createIcons();

        // Simulate network delay
        setTimeout(() => {
            driverAlert.classList.add('active');
            driverForm.reset();
            
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="send"></i> <span>${t('transport_driver_btn') || 'Submit Application'}</span>`;
            if (window.lucide) window.lucide.createIcons();
            
            // Hide alert after 5 seconds
            setTimeout(() => {
                driverAlert.classList.remove('active');
            }, 5000);
        }, 1500);
    });
}
