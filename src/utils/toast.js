// toast.js — Global Toast Notification System

let toastContainer = null;

function initToastContainer() {
    if (toastContainer) return;
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/**
 * Prikazovanje obvestila (Toast).
 * @param {string} message - Besedilo obvestila.
 * @param {string} icon - Ime Lucide ikone (npr. 'check-circle').
 */
export function showToast(message, icon = 'check-circle') {
    initToastContainer();

    const toast = document.createElement('div');
    toast.className = 'ux-toast';
    
    // Ustvarjanje strukture
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    // Osvežimo Lucide ikone (če lucide obstaja globalno)
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
    }

    // Po treh sekundah odstranimo
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}
