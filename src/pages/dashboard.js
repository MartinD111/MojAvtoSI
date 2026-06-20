// Dashboard page — MojAvto.si
// Shows after login — user's listings, stats, quick actions
import QRCode from 'qrcode';
import { getUserListings, deleteListing } from '../services/listingService.js';
import { navigateTo } from '../router.js';
import {
    getBookingsForUser,
    formatBookingDate,
    getStatusInfo,
    cancelBooking,
} from '../services/bookingService.js';
import { serviceLabels } from '../data/businesses.js';
import { t, getCurrentLang } from '../core/i18n.js';
import { renderLoading, renderEmpty, renderError } from '../utils/uiState.js';
import { swr, invalidate } from '../lib/cachedFetch.js';
import { mapError } from '../utils/errorMap.js';


function isVerifiedBusiness(user) {
    if (!user) return false;
    const profile = window.__currentUserProfile || {};
    return profile.businessTier === 'verified' || profile.role === 'mechanic';
}

export async function initDashboardPage() {
  const container = document.getElementById('app-container');
  if (!container) return;

  const user = window.__currentUser;
  if (!user) {
    navigateTo('/prijava');
    return;
  }

  const userPhoto = user.user_metadata?.avatar_url
    ? "<img src='" + user.user_metadata.avatar_url + "' style='width:56px;height:56px;border-radius:50%;object-fit:cover;' />"
    : "<div style='width:56px;height:56px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:1.5rem;'>👤</div>";

  container.innerHTML = `
    <div class="dashboard-page" style="max-width:900px;margin:2rem auto;padding:0 1rem;">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
        ${userPhoto}
        <div>
          <h1 style="margin:0;font-size:1.5rem;font-weight:700;">${t('dashboard_welcome_user', { name: user.displayName || 'User' })}</h1>
          <p style="margin:0;color:#6b7280;font-size:0.9rem;">${user.email}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
        <a href="#/novi-oglas" class="dashboard-card dashboard-card-new-listing">
          <span class="card-icon">➕</span>
          <span class="card-title">${t('dashboard_post_listing')}</span>
          <span class="card-desc">${t('dashboard_post_new_vehicle')}</span>
        </a>
        <a href="#/garaža" class="dashboard-card dashboard-card-garage">
          <span class="card-icon">🏎️</span>
          <span class="card-title">${t('my_garage')}</span>
          <span class="card-desc">${t('dashboard_manage_vehicles')}</span>
        </a>
        <a href="#/primerjava" class="dashboard-card dashboard-card-compare">
          <span class="card-icon">⚖️</span>
          <span class="card-title">${t('compare_corner')}</span>
          <span class="card-desc">${t('dashboard_compare_selected')}</span>
        </a>
        <a href="#/profil" class="dashboard-card dashboard-card-profile">
          <span class="card-icon">👤</span>
          <span class="card-title">${t('my_profile')}</span>
          <span class="card-desc">${t('dashboard_edit_details')}</span>
        </a>
        ${isVerifiedBusiness(user) ? `
        <a href="#/servis/vnos" class="dashboard-card dashboard-card-service">
          <span class="card-icon">🔧</span>
          <span class="card-title">${t('dashboard_service_record')}</span>
          <span class="card-desc">${t('dashboard_add_service_entry')}</span>
        </a>` : ''}
      </div>

      <div class="dashboard-section">
        <h2>📋 ${t('dashboard_my_active_listings')}</h2>
        <div id="user-listings-container" style="min-height: 100px;"></div>
      </div>

      <!-- Reservations section -->
      <div class="dashboard-section" id="bookings-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <h2 style="margin:0;">📅 ${t('dashboard_my_bookings')}</h2>
          <a href="#/zemljevid" style="font-size:0.85rem;font-weight:700;color:#2563eb;text-decoration:none;padding:8px 16px;background:rgba(37,99,235,0.1);border-radius:9999px;transition:all 0.2s;" onmouseover="this.style.background='rgba(37,99,235,0.2)'" onmouseout="this.style.background='rgba(37,99,235,0.1)'">+ ${t('dashboard_new_booking')}</a>
        </div>
        <div id="bookings-container">
          <div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.85rem;">${t('dashboard_loading_bookings')}</div>
        </div>
      </div>

      <!-- Service history section -->
      <div class="dashboard-section" id="service-history-section">
        <h2 style="margin:0 0 1rem;">🔧 ${t('dashboard_service_book')}</h2>
        <div id="service-history-container">
          <div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.85rem;">${t('dashboard_loading_service_history')}</div>
        </div>
      </div>

    </div>
  `;

  // Fetch and render listings — stale-while-revalidate with progressive loader.
  const listingsContainer = document.getElementById('user-listings-container');

  async function loadListings() {
    const { cached, fresh } = swr('dash_listings_' + user.uid, () => getUserListings(user.uid), { ttl: 60_000 });

    let loader = null;
    if (cached) {
      renderUserListings(listingsContainer, cached);
      listingsContainer.classList.add('ui-updating');
      listingsContainer.setAttribute('data-updating-label', t('ui_updating'));
    } else {
      loader = renderLoading(listingsContainer, { progressive: true });
    }

    try {
      const listings = await fresh;
      loader?.destroy();
      listingsContainer.classList.remove('ui-updating');
      listingsContainer.removeAttribute('data-updating-label');
      renderUserListings(listingsContainer, listings);
    } catch (err) {
      loader?.destroy();
      listingsContainer.classList.remove('ui-updating');
      console.error('Error loading user listings:', err);
      if (!cached) renderError(listingsContainer, { mapped: mapError(err), onRetry: loadListings });
    }
  }

  loadListings();

  // Render bookings and service history
  renderBookingsSection(user.uid);
  renderServiceHistorySection(user.uid);
}

// Renders the user's active-listings list into `listingsContainer`.
function renderUserListings(listingsContainer, listings) {
    if (!listings || listings.length === 0) {
      renderEmpty(listingsContainer, {
        icon: '📋',
        titleKey: 'dashboard_no_listings_yet',
        cta: { labelKey: 'dashboard_post_first_listing', href: '/novi-oglas' },
      });
      return;
    }

      let html = '<div style="display:flex;flex-direction:column;gap:1rem;">';
      listings.forEach(listing => {
        const imgUrl = listing.images?.exterior?.[0] || 'https://via.placeholder.com/150?text=Ni+slike';
        const priceVal = listing.priceEur ?? listing.price;
        const price = priceVal
            ? new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(priceVal)
            : '—';
        const km = listing.mileageKm ?? listing.mileage;
        const isSold = listing.status === 'sold';

        html += `
          <div class="dashboard-item-card" style="${isSold ? 'opacity:0.6;' : ''}">
              <div style="position:relative;flex-shrink:0;">
                  <img src="${imgUrl}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;" alt="${listing.title}">
                  ${isSold ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);border-radius:6px;"><span style="color:#fff;font-size:0.7rem;font-weight:800;letter-spacing:0.05em;background:#16a34a;padding:2px 8px;border-radius:9999px;">PRODANO</span></div>` : ''}
              </div>
              <div style="flex:1;">
                  <h3>${listing.make} ${listing.model} ${listing.variant || listing.type || ''}</h3>
                  <div class="item-specs">
                      <span>${listing.year}</span>
                      <span>${km ? new Intl.NumberFormat('sl-SI').format(Math.round(km)) + ' km' : ''}</span>
                      <span>${listing.fuel}</span>
                  </div>
              </div>
              <div style="text-align:right;">
                  <div style="font-weight:700;font-size:1.2rem;color:${isSold ? '#16a34a' : '#f97316'};margin-bottom:0.5rem;">${isSold ? 'Prodano ✓' : price}</div>
                  ${isSold ? '' : `
                  <div style="display:flex;gap:0.5rem;justify-content:flex-end;flex-wrap:wrap;">
                      <a href="#/novi-oglas?edit=${listing.id}" class="btn btn-outline btn-sm" style="border-color:#f97316;color:#f97316;">✎ Uredi</a>
                      <button class="btn btn-outline btn-sm print-listing-btn" data-id="${listing.id}" style="border-color:#3b82f6;color:#3b82f6;" title="${t('dashboard_print_sheet')}">🖨️ ${t('dashboard_print_sheet')}</button>
                      <button class="btn btn-outline btn-sm delete-listing-btn" data-id="${listing.id}" data-title="${listing.make} ${listing.model}">${t('remove')}</button>
                  </div>`}
              </div>
          </div>
        `;
      });
      html += '</div>';
      listingsContainer.innerHTML = html;

      // Bind delete functionality
      const deleteButtons = listingsContainer.querySelectorAll('.delete-listing-btn');
      deleteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const title = e.target.getAttribute('data-title') || 'this listing';
          showRemoveListingPopup(id, title);
        });
      });

      // Bind print functionality
      const printButtons = listingsContainer.querySelectorAll('.print-listing-btn');
      printButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const listing = listings.find(l => l.id === id);
          if (listing) printListing(listing);
        });
      });
}

// ── Print-to-Sell ─────────────────────────────────────────────
async function printListing(listing) {
  const imgUrl = listing.images?.exterior?.[0] || '';
  const priceVal = listing.priceEur ?? listing.price;
  const price = priceVal
      ? new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(priceVal)
      : '—';
  const km = listing.mileageKm ?? listing.mileage;

  document.getElementById('print-title').textContent = `${listing.make} ${listing.model} ${listing.variant || listing.type || ''}`.trim();
  document.getElementById('print-price').textContent = price;
  document.getElementById('print-image').src = imgUrl;
  document.getElementById('print-year').textContent = listing.year || '—';
  document.getElementById('print-mileage').textContent = km ? new Intl.NumberFormat('sl-SI').format(Math.round(km)) + ' km' : '—';
  document.getElementById('print-fuel').textContent = listing.fuel || '—';
  document.getElementById('print-transmission').textContent = listing.transmission || '—';
  document.getElementById('print-power').textContent = listing.power ? t('hp_val', { val: Math.round(listing.power * 1.34102) }) : '—';

  const qrUrl = `${window.location.origin}/#/oglas/${listing.id}?src=qr_print`;
  const canvas = document.getElementById('print-qr-canvas');
  try {
    await QRCode.toCanvas(canvas, qrUrl, { width: 200, margin: 1 });
  } catch (err) {
    console.error('QR generation failed:', err);
  }

  window.print();
}

// ── Remove / Sold popup ───────────────────────────────────────
function showRemoveListingPopup(listingId, listingTitle) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(8px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1.5rem;';
    overlay.innerHTML = `
        <div style="background:white;border-radius:2rem;padding:2rem;max-width:380px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.18);text-align:center;animation:agCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🗑️</div>
            <h3 style="font-size:1.1rem;font-weight:800;color:#0f172a;margin:0 0 0.4rem;">${t('dashboard_remove_listing_title')}</h3>
            <p style="font-size:0.875rem;color:#64748b;margin:0 0 1.5rem;">"${listingTitle}"</p>
            <p style="font-size:0.82rem;color:#475569;margin:0 0 1.5rem;font-weight:500;">${t('confirm_delete_listing')}</p>
            <div style="display:flex;flex-direction:column;gap:0.6rem;">
                <button id="removeSoldBtn" style="padding:0.75rem 1rem;border:none;border-radius:1rem;background:linear-gradient(135deg,#16a34a,#15803d);color:white;font-size:0.9rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(22,163,74,0.3);">
                    ✅ ${t('dashboard_sold_vehicle_confirm')}
                </button>
                <button id="removeOnlyBtn" style="padding:0.75rem 1rem;border:2px solid #e2e8f0;border-radius:1rem;background:white;color:#334155;font-size:0.9rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;">
                    ${t('dashboard_just_remove_listing')}
                </button>
                <button id="removeCancelBtn" style="padding:0.6rem;border:none;background:none;color:#94a3b8;font-size:0.85rem;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;">
                    ${t('cancel')}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closePopup = () => overlay.remove();

    overlay.querySelector('#removeCancelBtn').addEventListener('click', closePopup);
    overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });

    const doDelete = async (markAsSold) => {
        const btns = overlay.querySelectorAll('button');
        btns.forEach(b => { b.disabled = true; });
        try {
            await deleteListing(listingId, markAsSold ? 'sold' : 'removed');
            const uid = window.__currentUser?.uid;
            if (uid) invalidate('dash_listings_' + uid);
            closePopup();
            initDashboardPage();
        } catch (err) {
            console.error('Delete failed:', err);
            btns.forEach(b => { b.disabled = false; });
        }
    };

    overlay.querySelector('#removeSoldBtn').addEventListener('click', () => doDelete(true));
    overlay.querySelector('#removeOnlyBtn').addEventListener('click', () => doDelete(false));
}

// ── Bookings section ──────────────────────────────────────────
function renderBookingsSection(userId) {
    const container = document.getElementById('bookings-container');
    if (!container) return;

    const bookings = getBookingsForUser(userId);

    if (bookings.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:0.85rem;">
                <div style="font-size:1.75rem;margin-bottom:0.5rem;">📅</div>
                ${t('dashboard_no_bookings_yet')}
                <br><a href="#/zemljevid" style="color:#2563eb;font-weight:600;font-size:0.82rem;">${t('dashboard_find_service_shop')}</a>
            </div>`;
        return;
    }

    // Sort: pending/confirmed first, then by date desc
    const sorted = [...bookings].sort((a, b) => {
        const order = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return b.date?.localeCompare(a.date);
    });

    container.innerHTML = sorted.map(b => {
        const { label, cls } = getStatusInfo(b.status);
        const services = b.services.map(s => serviceLabels[s] || s).join(' · ');
        const statusColors = {
            'status-pending':   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
            'status-confirmed': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
            'status-completed': { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
            'status-cancelled': { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
        };
        const sc = statusColors[cls] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };

        return `
        <div class="dashboard-booking-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.5rem;">
                <span style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.65rem;border-radius:9999px;background:${sc.bg};color:${sc.color};border:1px solid ${sc.border};">${label}</span>
                <span style="font-size:0.75rem;color:#94a3b8;font-weight:500;">${formatBookingDate(b.date)} ob ${b.time || ''}</span>
            </div>
            <div class="booking-title">${b.businessName || 'Unknown business'}</div>
            <div class="booking-services">${services}</div>
            <div style="font-size:0.75rem;color:#94a3b8;">${b.vehicleLabel || ''}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.65rem;flex-wrap:wrap;gap:0.5rem;">
                <span class="booking-price">${b.totalPrice > 0 ? (getCurrentLang() === 'en' ? '$' : '€') + b.totalPrice : t('dashboard_quote_on_inspection')}</span>
                ${(b.status === 'pending' || b.status === 'confirmed')
                    ? `<button onclick="window._cancelBooking('${b.id}','${userId}')" class="btn-cancel">${t('cancel')}</button>`
                    : ''}
            </div>
        </div>`;
    }).join('');

    // Global cancel handler
    window._cancelBooking = (bookingId, uid) => {
        if (!confirm(t('dashboard_cancel_booking_confirm'))) return;
        cancelBooking(uid, bookingId);
        renderBookingsSection(uid);
        renderServiceHistorySection(uid);
    };
}

// ── Service history section ───────────────────────────────────
function renderServiceHistorySection(userId) {
    const container = document.getElementById('service-history-container');
    if (!container) return;

    const completed = getBookingsForUser(userId).filter(b => b.status === 'completed');

    if (completed.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:0.85rem;">
                <div style="font-size:1.75rem;margin-bottom:0.5rem;">🔧</div>
                ${t('dashboard_service_book_empty')}
            </div>`;
        return;
    }

    const sorted = [...completed].sort((a, b) => b.date?.localeCompare(a.date));

    container.innerHTML = sorted.map(b => {
        const services = b.services.map(s => serviceLabels[s] || s).join(' · ');
        return `
        <div class="dashboard-booking-card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
            <div style="width:40px;height:40px;border-radius:0.75rem;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">✓</div>
            <div style="flex:1;min-width:0;">
                <div class="booking-title" style="margin-bottom:0.15rem;">${b.businessName || 'Unknown business'}</div>
                <div class="booking-services">${services}</div>
                <div style="font-size:0.72rem;color:#94a3b8;margin-top:0.1rem;">${b.vehicleLabel || ''} · ${formatBookingDate(b.date)}</div>
            </div>
            <div style="font-size:0.9rem;font-weight:800;color:#16a34a;flex-shrink:0;">${b.totalPrice > 0 ? (getCurrentLang() === 'en' ? '$' : '€') + b.totalPrice : t('dashboard_quote_on_inspection')}</div>
        </div>`;
    }).join('');
}
