// ═══════════════════════════════════════════════════════════════════════════════
// Admin Panel — MojAvto.si
// Modular admin controller: 12 modules, sidebar SPA navigation
// ═══════════════════════════════════════════════════════════════════════════════

import {
    checkAdminRole, getUserRole, getDashboardStats, getRecentListings,
    getAllListings, adminUpdateListingStatus, adminDeleteListing, adminSetFeatured,
    getAllUsers, adminUpdateUserRole, adminBanUser, getUserListingsCount,
    getBrands, createBrand, updateBrand, deleteBrand,
    getModels, createModel, updateModel, deleteModel,
    importTaxonomyRows, getReports, resolveReport,
    getSiteSettings, updateSiteSettings,
    getSeoPages, upsertSeoPage,
    getTopBrands, getListingsByDay, getAuditLogs, addAuditLog,
    getScrapingSources, createScrapingSource, updateScrapingSource, deleteScrapingSource,
    getCatalogProductsAdmin, createCatalogProduct, updateCatalogProduct, deleteCatalogProduct,
    clearCarTaxonomy,
    getTaxonomyProposals, approveTaxonomyProposal, rejectTaxonomyProposal,
    getAdminAuctions, getAdminAuctionBids, adminSetAuctionStatus,
    adminForceCloseAuction, getAuctionAlertsAdmin,
} from '../services/adminService.js';
import { PLATFORM } from '../config/platform.js';
import { MAIN_CATEGORIES } from '../data/categories.js';

// ── Global admin state ────────────────────────────────────────────────────────
let _adminUser = null;
let _adminRole = null;
let _activeSection = 'dashboard';
let _listingsPage = { lastDoc: null, filters: {} };
let _chart = null;

// ── Entry point ───────────────────────────────────────────────────────────────
export async function initAdminPage() {
    const user = window.__currentUser;
    if (!user) { window.location.hash = '/prijava'; return; }

    const isAdmin = await checkAdminRole(user.uid);
    if (!isAdmin) {
        document.getElementById('app-container').innerHTML = `
          <div style="text-align:center;padding:6rem 2rem;">
            <div style="font-size:4rem;margin-bottom:1rem;">🔒</div>
            <h2 style="color:#dc2626;margin:0 0 0.5rem;">Dostop zavrnjen</h2>
            <p style="color:#6b7280;">Nimate administratorskih pravic.</p>
            <a href="#/" style="color:#2563eb;font-weight:600;">← Nazaj domov</a>
          </div>`;
        return;
    }

    _adminUser = user;
    _adminRole = await getUserRole(user.uid);

    // hide the main site navbar while on admin page
    if (!document.getElementById('adm-hide-sitenav')) {
        const s = document.createElement('style');
        s.id = 'adm-hide-sitenav';
        s.textContent = '.sticky-nav { display: none !important; }';
        document.head.appendChild(s);
    }

    renderShell();
    attachSidebarNav();
    navigateTo('dashboard');
}

// ── Shell layout ──────────────────────────────────────────────────────────────
const NAV_ICONS = {
    dashboard:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    listings:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,
    users:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>`,
    taxonomy:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h10M4 18h6"/><circle cx="19" cy="17" r="3"/><path d="m21.5 19.5-1.5-1.5"/></svg>`,
    featured:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    reports:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    analytics:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    seo:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
    payments:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    media:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    audit:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    settings:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    vozila:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    webscraping:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    catalog:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="m2 7 2.5-4h15L22 7"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="7" x2="21" y2="7"/></svg>`,
};

function renderShell() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
    <div class="adm-wrap">
      <!-- Sidebar -->
      <aside class="adm-sidebar" id="adm-sidebar">
        <div class="adm-brand">
          <div class="adm-brand-logo">
            <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="${PLATFORM.colors.primaryStart}"/><path d="M6 20h20M9 20l1.5-6h11L23 20M10 17h12" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="11" cy="22" r="1.5" fill="#fff"/><circle cx="21" cy="22" r="1.5" fill="#fff"/></svg>
          </div>
          <div class="adm-brand-text">${PLATFORM.brandName} <span>Admin</span></div>
        </div>

        <div class="adm-sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="adm-global-search" id="adm-global-search" type="search" placeholder="Išči…" />
        </div>

        <nav class="adm-nav">
          <div class="adm-nav-group-label">Pregled</div>
          ${navItem('dashboard',    'dashboard', 'Dashboard')}

          <div class="adm-nav-group-label">Vsebina</div>
          ${navItem('listings',     'listings',  'Oglasi')}
          ${navItem('drazbe',       'featured',  'Dražbe')}
          ${navItem('users',        'users',     'Uporabniki')}
          ${navItem('featured',     'featured',  'Sponzorirani')}
          ${navItem('reports',      'reports',   'Poročila')}

          <div class="adm-nav-group-label">Katalog</div>
          ${navItem('taxonomy',     'taxonomy',  PLATFORM.id === 'navtika' ? 'Taksonomija plovil' : 'Taksonomija vozil')}
          ${navItem('vozila-uvoz',  'vozila',    PLATFORM.id === 'navtika' ? 'Vnos plovil (Excel)' : 'Vnos vozil (Excel)')}

          <div class="adm-nav-group-label">${PLATFORM.id === 'navtika' ? 'Cenik (oprema)' : 'Cenik (Gume in deli)'}</div>
          ${navItem('webscraping',  'webscraping', 'Webscraping')}
          ${navItem('catalog',      'catalog',     'Katalog izdelkov')}

          <div class="adm-nav-group-label">Sistem</div>
          ${navItem('analytics',    'analytics', 'Analitika')}
          ${navItem('seo',          'seo',       'SEO')}
          ${navItem('payments',     'payments',  'Plačila')}
          ${navItem('media',        'media',     'Mediji')}
          ${navItem('audit',        'audit',     'Audit log')}
          ${navItem('settings',     'settings',  'Nastavitve')}
        </nav>

        <div class="adm-sidebar-footer">
          <div class="adm-user-badge">
            <span class="adm-user-avatar">${(_adminUser.displayName || 'A')[0].toUpperCase()}</span>
            <div class="adm-user-info">
              <div class="adm-user-name">${_adminUser.displayName || _adminUser.email}</div>
              <div class="adm-user-role">${roleLabel(_adminRole)}</div>
            </div>
          </div>
          <a href="#/" class="adm-logout-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Na stran
          </a>
        </div>
      </aside>

      <!-- Main content — no topbar, content starts at top -->
      <div class="adm-main">
        <button class="adm-menu-toggle" id="adm-menu-toggle" aria-label="Menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="adm-content" id="adm-content">
          <div class="adm-loading">Nalagam…</div>
        </div>
      </div>
    </div>`;
}

function navItem(id, iconKey, label) {
    return `<button class="adm-nav-item" data-section="${id}">
      <span class="adm-nav-icon">${NAV_ICONS[iconKey] || ''}</span>
      <span class="adm-nav-label">${label}</span>
    </button>`;
}

function roleLabel(role) {
    return { admin: 'Administrator', moderator: 'Moderator', editor: 'Urednik', user: 'Uporabnik' }[role] || role;
}

// ── Sidebar navigation ────────────────────────────────────────────────────────
function attachSidebarNav() {
    document.querySelectorAll('.adm-nav-item').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.section));
    });

    document.getElementById('adm-menu-toggle').addEventListener('click', () => {
        document.getElementById('adm-sidebar').classList.toggle('adm-sidebar--open');
    });

    document.getElementById('adm-global-search').addEventListener('input', debounce(onGlobalSearch, 400));
}

function navigateTo(section) {
    _activeSection = section;
    document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === section));
    document.getElementById('adm-content').innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';
    sections[section]?.();
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION RENDERERS
// ══════════════════════════════════════════════════════════════════════════════

const sections = {
    dashboard:    renderDashboard,
    listings:     renderListings,
    drazbe:       renderDrazbe,
    users:        renderUsers,
    taxonomy:     renderTaxonomy,
    'vozila-uvoz': renderVozilaUvoz,
    webscraping:  renderWebscraping,
    catalog:      renderCatalog,
    featured:     renderFeatured,
    reports:      renderReports,
    analytics:    renderAnalytics,
    seo:          renderSeo,
    payments:     renderPayments,
    media:        renderMedia,
    audit:        renderAudit,
    settings:     renderSettings,
};

// ── 1. DASHBOARD ──────────────────────────────────────────────────────────────
async function renderDashboard() {
    const c = document.getElementById('adm-content');
    try {
        const [stats, recent, topBrands, chartData] = await Promise.all([
            getDashboardStats(), getRecentListings(8),
            getTopBrands(6), getListingsByDay(14),
        ]);

        c.innerHTML = `
          <div class="adm-kpi-grid">
            ${kpi('Skupaj oglasov', stats.totalListings, '📋', 'blue')}
            ${kpi('Aktivnih',       stats.activeCount,   '✅', 'green')}
            ${kpi('V pregledu',     stats.pendingCount,  '⏳', 'yellow')}
            ${kpi('Uporabnikov',    stats.totalUsers,    '👥', 'purple')}
            ${kpi('Novih danes',    stats.newToday,      '🆕', 'orange')}
            ${kpi('Znamk',          stats.totalBrands,   '🏷️', 'teal')}
          </div>

          <div class="adm-grid-2">
            <div class="adm-card">
              <div class="adm-card-header">
                <h3>Novi oglasi (14 dni)</h3>
              </div>
              <canvas id="adm-chart-listings" height="180"></canvas>
            </div>
            <div class="adm-card">
              <div class="adm-card-header">
                <h3>Top znamke (aktivni oglasi)</h3>
              </div>
              <div class="adm-top-brands">
                ${topBrands.map((b, i) => `
                  <div class="adm-brand-row">
                    <span class="adm-brand-rank">#${i + 1}</span>
                    <span class="adm-brand-name">${b.name}</span>
                    <div class="adm-brand-bar-wrap">
                      <div class="adm-brand-bar" style="width:${Math.round((b.count / (topBrands[0]?.count || 1)) * 100)}%"></div>
                    </div>
                    <span class="adm-brand-count">${b.count}</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <div class="adm-card">
            <div class="adm-card-header">
              <h3>Zadnji oglasi</h3>
              <button class="adm-btn adm-btn-sm" onclick="window.__adminNav('listings')">Vsi oglasi →</button>
            </div>
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead><tr>
                  <th>Oglas</th><th>Status</th><th>Avtor</th><th>Cena</th><th>Datum</th><th>Akcija</th>
                </tr></thead>
                <tbody>
                  ${recent.map(l => `
                    <tr>
                      <td><strong>${escHtml(l.make || '')} ${escHtml(l.model || '')}</strong><br><small style="color:#6b7280">${escHtml(l.variant || '')}</small></td>
                      <td>${statusBadge(l.status)}</td>
                      <td style="font-size:.8rem">${escHtml(l.authorName || l.authorId?.slice(0,8) || '—')}</td>
                      <td>${fmtPrice(l.priceEur || l.price)}</td>
                      <td style="font-size:.8rem">${fmtDate(l.createdAt)}</td>
                      <td>
                        <button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__adminApprove('${l.id}')">✓</button>
                        <button class="adm-btn adm-btn-xs adm-btn-red"   onclick="window.__adminReject('${l.id}')">✗</button>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`;

        // Chart.js bar chart
        drawListingsChart(chartData);

        window.__adminNav = navigateTo;
        window.__adminApprove = id => quickStatus(id, 'active');
        window.__adminReject  = id => openRejectModal(id);

    } catch (e) {
        c.innerHTML = errBox(e);
    }
}

function drawListingsChart(data) {
    if (typeof Chart === 'undefined') return;
    if (_chart) { _chart.destroy(); _chart = null; }
    const canvas = document.getElementById('adm-chart-listings');
    if (!canvas) return;
    _chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map(d => d.date.slice(5)),
            datasets: [{ label: 'Oglasi', data: data.map(d => d.count),
                backgroundColor: 'rgba(37,99,235,0.7)', borderRadius: 4 }],
        },
        options: { responsive: true, plugins: { legend: { display: false } },
                   scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
    });
}

// ── 2. LISTINGS ───────────────────────────────────────────────────────────────
async function renderListings() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-toolbar">
        <div class="adm-filter-group">
          <select id="lst-filter-status" class="adm-select">
            <option value="">Vsi statusi</option>
            <option value="active">Aktiven</option>
            <option value="pending">V pregledu</option>
            <option value="rejected">Zavrnjen</option>
            <option value="expired">Potekel</option>
          </select>
          <select id="lst-filter-cat" class="adm-select">
            <option value="">Vse kategorije</option>
            ${Object.values(MAIN_CATEGORIES).map(c => `<option value="${c.slug}">${c.slug}</option>`).join('')}
          </select>
          <button class="adm-btn" id="lst-filter-btn">Filtriraj</button>
        </div>
        <div class="adm-bulk-group" id="lst-bulk-group" style="display:none">
          <span id="lst-selected-count">0 izbranih</span>
          <button class="adm-btn adm-btn-green" id="lst-bulk-approve">✓ Odobri</button>
          <button class="adm-btn adm-btn-red"   id="lst-bulk-reject">✗ Zavrni</button>
          <button class="adm-btn adm-btn-red"   id="lst-bulk-delete">🗑 Izbriši</button>
        </div>
      </div>
      <div class="adm-card">
        <div class="adm-table-wrap" id="lst-table-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
        <div class="adm-pagination" id="lst-pagination"></div>
      </div>`;

    document.getElementById('lst-filter-btn').addEventListener('click', () => {
        _listingsPage = {
            filters: {
                status: document.getElementById('lst-filter-status').value,
                category: document.getElementById('lst-filter-cat').value,
            },
            lastDoc: null,
        };
        loadListingsTable();
    });

    loadListingsTable();
    setupBulkActions();
}

async function loadListingsTable() {
    const wrap = document.getElementById('lst-table-wrap');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div></div>';

    try {
        const { docs } = await getAllListings(_listingsPage.filters, 50, _listingsPage.lastDoc);
        if (docs.length === 0) {
            wrap.innerHTML = '<div class="adm-empty">Ni oglasov za prikaz.</div>';
            return;
        }

        wrap.innerHTML = `
          <table class="adm-table adm-table--selectable">
            <thead><tr>
              <th><input type="checkbox" id="lst-select-all"></th>
              <th>Oglas</th><th>Kategorija</th><th>Status</th>
              <th>Avtor</th><th>Cena</th><th>Objavljeno</th><th>Akcije</th>
            </tr></thead>
            <tbody id="lst-tbody">
              ${docs.map(l => `
                <tr data-id="${l.id}">
                  <td><input type="checkbox" class="lst-row-check" value="${l.id}"></td>
                  <td>
                    <div class="adm-listing-cell">
                      ${l.images?.exterior?.[0] ? `<img src="${l.images.exterior[0]}" class="adm-thumb">` : `<div class="adm-thumb adm-thumb--empty">${PLATFORM.thumbFallback}</div>`}
                      <div>
                        <strong>${escHtml(l.make || '')} ${escHtml(l.model || '')} ${escHtml(l.variant || '')}</strong>
                        <div class="adm-sub">${l.year || ''} · ${fmtMileage(l.mileageKm || l.mileage)} · ${escHtml(l.fuel || '')}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="adm-cat-badge adm-cat-${l.category || 'avto'}">${l.category || 'avto'}</span></td>
                  <td>${statusBadge(l.status)}</td>
                  <td class="adm-sub">${escHtml(l.authorName || l.authorId?.slice(0, 8) || '—')}</td>
                  <td><strong>${fmtPrice(l.priceEur || l.price)}</strong></td>
                  <td class="adm-sub">${fmtDate(l.createdAt)}</td>
                  <td class="adm-actions">
                    <button class="adm-btn adm-btn-xs adm-btn-green" title="Odobri" onclick="window.__lstApprove('${l.id}')">✓</button>
                    <button class="adm-btn adm-btn-xs adm-btn-yellow" title="Zavrni" onclick="window.__lstReject('${l.id}')">✗</button>
                    <button class="adm-btn adm-btn-xs" title="Featured" onclick="window.__lstFeatured('${l.id}')">⭐</button>
                    <button class="adm-btn adm-btn-xs adm-btn-red" title="Izbriši" onclick="window.__lstDelete('${l.id}')">🗑</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        // Select-all toggle
        document.getElementById('lst-select-all').addEventListener('change', e => {
            document.querySelectorAll('.lst-row-check').forEach(cb => cb.checked = e.target.checked);
            updateBulkBar();
        });
        document.querySelectorAll('.lst-row-check').forEach(cb =>
            cb.addEventListener('change', updateBulkBar)
        );

        window.__lstApprove  = id => quickStatus(id, 'active');
        window.__lstReject   = id => openRejectModal(id);
        window.__lstFeatured = id => openFeaturedModal(id);
        window.__lstDelete   = id => confirmAction(`Izbrisati oglas ${id}?`, () => doDeleteListing(id));

    } catch (e) {
        wrap.innerHTML = errBox(e);
    }
}

function setupBulkActions() {
    const bulkGroup = document.getElementById('lst-bulk-group');
    if (!bulkGroup) return;

    document.getElementById('lst-bulk-approve')?.addEventListener('click', () => {
        getSelected().forEach(id => quickStatus(id, 'active'));
    });
    document.getElementById('lst-bulk-reject')?.addEventListener('click', () => {
        getSelected().forEach(id => quickStatus(id, 'rejected'));
    });
    document.getElementById('lst-bulk-delete')?.addEventListener('click', () => {
        const ids = getSelected();
        confirmAction(`Izbrisati ${ids.length} oglasov?`, () => ids.forEach(doDeleteListing));
    });
}

function getSelected() {
    return [...document.querySelectorAll('.lst-row-check:checked')].map(cb => cb.value);
}

function updateBulkBar() {
    const sel = getSelected();
    const bulkGroup = document.getElementById('lst-bulk-group');
    const selCount = document.getElementById('lst-selected-count');
    if (!bulkGroup) return;
    bulkGroup.style.display = sel.length > 0 ? 'flex' : 'none';
    if (selCount) selCount.textContent = `${sel.length} izbranih`;
}

async function quickStatus(id, status) {
    try {
        await adminUpdateListingStatus(id, status);
        await addAuditLog(_adminUser.uid, _adminUser.displayName, `LISTING_${status.toUpperCase()}`, id);
        showToast(`Oglas ${status === 'active' ? 'odobren' : 'posodobljen'}.`, 'success');
        loadListingsTable();
    } catch (e) { showToast('Napaka: ' + e.message, 'error'); }
}

async function doDeleteListing(id) {
    try {
        await adminDeleteListing(id);
        await addAuditLog(_adminUser.uid, _adminUser.displayName, 'LISTING_DELETE', id);
        showToast('Oglas izbrisan.', 'success');
        loadListingsTable();
    } catch (e) { showToast('Napaka: ' + e.message, 'error'); }
}

// ── 3. USERS ──────────────────────────────────────────────────────────────────
async function renderUsers() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Vsi uporabniki</h3>
          <input class="adm-input adm-input-sm" id="user-search" placeholder="Išči po imenu / emailu…">
        </div>
        <div class="adm-table-wrap" id="usr-table-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    document.getElementById('user-search').addEventListener('input', debounce(() => filterUsersTable(), 300));

    let _allUsers = [];
    try {
        _allUsers = await getAllUsers(200);
        renderUsersTable(_allUsers);
    } catch (e) {
        document.getElementById('usr-table-wrap').innerHTML = errBox(e);
    }

    function filterUsersTable() {
        const q = document.getElementById('user-search').value.toLowerCase();
        const filtered = _allUsers.filter(u =>
            (u.displayName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q)
        );
        renderUsersTable(filtered);
    }

    window.__usrBan    = uid => confirmAction('Ban/unban tega uporabnika?', () => doToggleBan(uid, _allUsers));
    window.__usrRole   = uid => openRoleModal(uid, _allUsers);
    window.__usrGlassi = uid => navigateTo('listings'); // shortcut
}

function renderUsersTable(users) {
    const wrap = document.getElementById('usr-table-wrap');
    if (!wrap) return;
    if (users.length === 0) { wrap.innerHTML = '<div class="adm-empty">Ni uporabnikov.</div>'; return; }
    wrap.innerHTML = `
      <table class="adm-table">
        <thead><tr>
          <th>Uporabnik</th><th>Email</th><th>Vloga</th>
          <th>Status</th><th>Registriran</th><th>Akcije</th>
        </tr></thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>
                <div class="adm-user-cell">
                  ${u.photoURL ? `<img src="${escHtml(u.photoURL)}" class="adm-avatar">` : `<div class="adm-avatar adm-avatar--placeholder">${(u.displayName || u.email || '?')[0].toUpperCase()}</div>`}
                  <strong>${escHtml(u.displayName || '—')}</strong>
                </div>
              </td>
              <td class="adm-sub">${escHtml(u.email || '—')}</td>
              <td>${roleBadge(u.role)}</td>
              <td>${u.status === 'banned' ? '<span class="adm-badge adm-badge-red">Blokiran</span>' : '<span class="adm-badge adm-badge-green">Aktiven</span>'}</td>
              <td class="adm-sub">${fmtDate(u.createdAt)}</td>
              <td class="adm-actions">
                <button class="adm-btn adm-btn-xs" onclick="window.__usrRole('${u.id}')">🔑 Vloga</button>
                <button class="adm-btn adm-btn-xs ${u.status === 'banned' ? 'adm-btn-green' : 'adm-btn-red'}" onclick="window.__usrBan('${u.id}')">
                  ${u.status === 'banned' ? '✓ Odblokiraj' : '🚫 Blokiraj'}
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
}

async function doToggleBan(uid, users) {
    const u = users.find(x => x.id === uid);
    const banned = u?.status !== 'banned';
    try {
        await adminBanUser(uid, banned);
        await addAuditLog(_adminUser.uid, _adminUser.displayName, banned ? 'USER_BAN' : 'USER_UNBAN', uid);
        showToast(banned ? 'Uporabnik blokiran.' : 'Uporabnik odblokiran.', 'success');
        renderUsers();
    } catch (e) { showToast('Napaka: ' + e.message, 'error'); }
}

// ── 4. TAXONOMY — unified tree view (source: JSON files) ─────────────────────

const TAX_SOURCES_BY_PLATFORM = {
    avto: {
        avto:        { file: 'json/brands_models_global.json',     label: 'Avtomobili' },
        moto:        { file: 'json/brands_models_moto.json',       label: 'Motorji' },
        gospodarska: { file: 'json/brands_models_gospodarska.json', label: 'Gospodarska' },
        prosti_cas:  { file: 'json/brands_models_prosti_cas.json', label: 'Prosti čas' },
    },
    navtika: {
        plovila:    { file: 'json/brands_models_plovila.json',    label: 'Plovila' },
        izvenkrmni: { file: 'json/brands_models_izvenkrmni.json', label: 'Izvenkrmni motorji' },
    },
};
const TAX_SOURCES = TAX_SOURCES_BY_PLATFORM[PLATFORM.id] || TAX_SOURCES_BY_PLATFORM.avto;
const TAX_FIRST_CAT = Object.keys(TAX_SOURCES)[0];
const _taxCache = {};
let _taxUnsaved = false;

function updateUnsavedBadge() {
    const badge = document.getElementById('tax-unsaved-badge');
    if (badge) badge.style.display = _taxUnsaved ? 'inline-flex' : 'none';
}

async function loadTaxJson(cat) {
    if (_taxCache[cat]) return _taxCache[cat];
    const res = await fetch(TAX_SOURCES[cat].file);
    if (!res.ok) throw new Error(`Napaka pri nalaganju ${TAX_SOURCES[cat].file}`);
    _taxCache[cat] = await res.json();
    return _taxCache[cat];
}

/**
 * Normalizes a variant entry (string or object) to the canonical object shape.
 * Backward compat: string "320d" → { trim: "320d" }
 * Already-object: { trim: "320d", fuel_type: "Diesel", ... } → returned as-is
 */
function normalizeTrimEntry(entry) {
    if (typeof entry === 'string') return { trim: entry };
    if (entry && typeof entry === 'object' && entry.trim) return entry;
    return { trim: String(entry ?? '') };
}

// Parse raw JSON into flat brand list regardless of category format
// avto:        { Brand: { Model: [variants] } }
// moto:        { Brand: { Model: { type, variants[] } } }
// gospodarska: { Brand: { Model: { type, variants[] } } }
function parseTaxData(rawData, cat) {
    return Object.entries(rawData).map(([brandName, modelsObj]) => {
        const models = Object.entries(modelsObj).map(([modelName, val]) => {
            // Array value → simple variants list (avto + navtika plovila/izvenkrmni).
            // Object value → typed model with { type, variants[] } (moto/gospodarska).
            if (Array.isArray(val)) {
                return { name: modelName, type: null, variants: val.map(normalizeTrimEntry) };
            }
            return {
                name:     modelName,
                type:     val.type     || null,
                category: val.category || null,
                variants: Array.isArray(val.variants) ? val.variants.map(normalizeTrimEntry) : [],
            };
        }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
        return { brand: brandName, models };
    }).sort((a, b) => a.brand.localeCompare(b.brand, 'en'));
}

async function renderTaxonomy() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header" style="flex-wrap:wrap;gap:.75rem">
          <h3 style="margin:0">${PLATFORM.id === 'navtika' ? 'Taksonomija plovil' : 'Taksonomija vozil'}</h3>
          <span id="tax-unsaved-badge" class="tax-unsaved-badge" style="display:none">● Nezhranjene spremembe</span>
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-left:auto">
            <div class="adm-tabs" style="margin:0;border:none;gap:.25rem">
              ${Object.entries(TAX_SOURCES).map(([k, v]) => `
                <button class="adm-tab${k === TAX_FIRST_CAT ? ' active' : ''}" data-tax-cat="${k}">${v.label}</button>
              `).join('')}
              ${PLATFORM.id === 'navtika'
                ? `<button class="adm-tab" data-tax-cat="oprema">🛟 Oprema za plovila</button>`
                : `<button class="adm-tab" data-tax-cat="izpuhi">🏍 Izpuhi</button>
                   <button class="adm-tab" data-tax-cat="oprema">🛡 Moto oprema</button>
                   <button class="adm-tab" data-tax-cat="linije">🏎 Linije</button>`}
              <button class="adm-tab" data-tax-cat="predlogi" id="tax-tab-predlogi">💡 Predlogi</button>
            </div>
            <select id="tax-type-filter" class="adm-select adm-input-sm" style="width:140px;display:none">
              <option value="">Vse vrste</option>
            </select>
            <select id="tax-category-filter" class="adm-select adm-input-sm" style="width:160px;display:none">
              <option value="">Vse kategorije</option>
            </select>
            <input id="tax-search" class="adm-input adm-input-sm" type="search" placeholder="Išči…" style="width:170px">
            <button class="adm-btn adm-btn-sm adm-btn-green" id="tax-download-json-btn">⬇ Shrani JSON</button>
            <button class="adm-btn adm-btn-sm adm-btn-green" id="tax-export-btn">⬇ Izvozi Excel</button>
            <button class="adm-btn adm-btn-sm adm-btn-primary" id="tax-add-brand-btn">+ Znamka</button>
          </div>
        </div>
        <div style="padding:.5rem 1rem;border-bottom:1px solid #f1f5f9;font-size:.8rem;color:#6b7280" id="tax-stats"></div>
        <div id="tax-tree"></div>
      </div>`;

    let activeCat = TAX_FIRST_CAT;

    const tabBtns = c.querySelectorAll('[data-tax-cat]');
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCat = btn.dataset.taxCat;
        document.getElementById('tax-search').value = '';
        document.getElementById('tax-type-filter').value = '';
        document.getElementById('tax-category-filter').value = '';
        _taxPage = 1;
        // Hide the table-only controls for brand-list tabs (izpuhi/oprema/linije).
        // Use visibility (not display) so the tab bar keeps its layout and does not
        // shift when switching tabs.
        const taxControlIds = ['tax-search', 'tax-type-filter', 'tax-category-filter', 'tax-export-btn', 'tax-download-json-btn', 'tax-add-brand-btn'];
        const setTaxControls = vis => taxControlIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.visibility = vis ? 'visible' : 'hidden'; el.style.pointerEvents = vis ? '' : 'none'; }
        });

        if (activeCat === 'izpuhi') {
            setTaxControls(false);
            renderExhaustTab();
        } else if (activeCat === 'oprema') {
            setTaxControls(false);
            renderEquipmentBrandsTab();
        } else if (activeCat === 'linije') {
            setTaxControls(false);
            renderVehicleLinesTab();
        } else if (activeCat === 'predlogi') {
            setTaxControls(false);
            renderTaxonomyProposalsTab();
        } else {
            setTaxControls(true);
            // type filter visibility is managed per-category inside renderTaxTable
            renderTaxTable(activeCat);
        }
    }));

    document.getElementById('tax-search').addEventListener('input', debounce(() => { _taxPage = 1; renderTaxTable(activeCat); }, 200));
    document.getElementById('tax-type-filter').addEventListener('change', () => { _taxPage = 1; renderTaxTable(activeCat); });
    document.getElementById('tax-category-filter').addEventListener('change', () => { _taxPage = 1; renderTaxTable(activeCat); });
    document.getElementById('tax-export-btn').addEventListener('click', () => exportTaxExcel(activeCat));
    document.getElementById('tax-add-brand-btn').addEventListener('click', () => openTaxAddBrandModal(activeCat));

    document.getElementById('tax-download-json-btn').addEventListener('click', () => {
        const raw = _taxCache[activeCat];
        if (!raw) { showToast('Podatki niso naloženi.', 'error'); return; }
        const json = JSON.stringify(raw, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = TAX_SOURCES[activeCat].file.split('/').pop();
        a.click();
        _taxUnsaved = false;
        updateUnsavedBadge();
        showToast(`${a.download} prenesen. Kopirajte v public/json/.`, 'success');
    });

    renderTaxTable(TAX_FIRST_CAT);
}

// ── Exhaust brands management ─────────────────────────────────────────────────
let _exhaustCache = null;

async function loadExhaustBrands() {
    if (_exhaustCache) return _exhaustCache;
    const res = await fetch('json/exhaust_brands.json');
    if (!res.ok) throw new Error('Napaka pri nalaganju exhaust_brands.json');
    _exhaustCache = await res.json();
    return _exhaustCache;
}

async function renderExhaustTab() {
    const wrap = document.getElementById('tax-tree');
    const stats = document.getElementById('tax-stats');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';
    try {
        const brands = await loadExhaustBrands();
        if (stats) stats.textContent = `${brands.length} znamk izpuhov`;

        wrap.innerHTML = `
          <div style="padding:1rem">
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;align-items:center;flex-wrap:wrap;">
              <input id="exhaust-new-input" class="adm-input adm-input-sm" style="width:220px" placeholder="Nova znamka izpuha…">
              <button class="adm-btn adm-btn-sm adm-btn-primary" id="exhaust-add-btn">+ Dodaj</button>
              <button class="adm-btn adm-btn-sm adm-btn-green" id="exhaust-download-btn">⬇ Shrani JSON</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:.5rem" id="exhaust-chips">
              ${brands.map((b, i) => `
                <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                  ${escHtml(b)}
                  <button class="exhaust-del-btn" data-idx="${i}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
                </span>`).join('')}
            </div>
          </div>`;

        document.getElementById('exhaust-add-btn').addEventListener('click', () => {
            const input = document.getElementById('exhaust-new-input');
            const name = input.value.trim();
            if (!name) { showToast('Vnesite ime znamke.', 'error'); return; }
            if (_exhaustCache.includes(name)) { showToast('Znamka že obstaja.', 'warn'); return; }
            _exhaustCache.push(name);
            _taxUnsaved = true;
            updateUnsavedBadge();
            input.value = '';
            renderExhaustTab();
            showToast(`"${name}" dodano.`, 'success');
        });

        document.getElementById('exhaust-new-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('exhaust-add-btn').click();
        });

        document.getElementById('exhaust-download-btn').addEventListener('click', () => {
            const json = JSON.stringify(_exhaustCache, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'exhaust_brands.json';
            a.click();
            _taxUnsaved = false;
            updateUnsavedBadge();
            showToast('exhaust_brands.json prenesen. Kopirajte v public/json/.', 'success');
        });

        wrap.querySelectorAll('.exhaust-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const name = _exhaustCache[idx];
                if (!confirm(`Izbrisati "${name}"?`)) return;
                _exhaustCache.splice(idx, 1);
                _taxUnsaved = true;
                updateUnsavedBadge();
                renderExhaustTab();
                showToast(`"${name}" izbrisano.`, 'success');
            });
        });
    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── Equipment brands management (JSON + Excel) — moto gear / boat gear ────────
let _equipmentCache = null;
const EQUIPMENT_FILE = PLATFORM.id === 'navtika' ? 'equipment_brands_navtika.json' : 'equipment_brands.json';
const EQUIPMENT_LABEL = PLATFORM.id === 'navtika' ? 'znamk opreme za plovila' : 'znamk motoristične opreme';

async function loadEquipmentBrands() {
    if (_equipmentCache) return _equipmentCache;
    const res = await fetch(`json/${EQUIPMENT_FILE}`);
    if (!res.ok) throw new Error(`Napaka pri nalaganju ${EQUIPMENT_FILE}`);
    _equipmentCache = await res.json();
    return _equipmentCache;
}

async function renderEquipmentBrandsTab() {
    const wrap = document.getElementById('tax-tree');
    const stats = document.getElementById('tax-stats');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';
    try {
        const brands = await loadEquipmentBrands();
        if (stats) stats.textContent = `${brands.length} ${EQUIPMENT_LABEL}`;

        wrap.innerHTML = `
          <div style="padding:1rem">
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;align-items:center;flex-wrap:wrap;">
              <input id="equip-new-input" class="adm-input adm-input-sm" style="width:220px" placeholder="Nova znamka opreme…">
              <button class="adm-btn adm-btn-sm adm-btn-primary" id="equip-add-btn">+ Dodaj</button>
              <button class="adm-btn adm-btn-sm adm-btn-green" id="equip-download-btn">⬇ Shrani JSON</button>
              <button class="adm-btn adm-btn-sm adm-btn-green" id="equip-export-btn">⬇ Izvozi Excel</button>
              <button class="adm-btn adm-btn-sm" id="equip-import-btn">⬆ Uvozi Excel</button>
              <input type="file" id="equip-import-file" accept=".xlsx,.xls,.csv" style="display:none">
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:.5rem" id="equip-chips">
              ${brands.map((b, i) => `
                <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                  ${escHtml(b)}
                  <button class="equip-del-btn" data-idx="${i}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
                </span>`).join('')}
            </div>
          </div>`;

        const addBrand = (name) => {
            name = (name || '').trim();
            if (!name) { showToast('Vnesite ime znamke.', 'error'); return false; }
            if (_equipmentCache.some(b => b.toLowerCase() === name.toLowerCase())) { showToast('Znamka že obstaja.', 'warn'); return false; }
            _equipmentCache.push(name);
            _equipmentCache.sort((a, b) => a.localeCompare(b, 'sl'));
            _taxUnsaved = true;
            updateUnsavedBadge();
            return true;
        };

        document.getElementById('equip-add-btn').addEventListener('click', () => {
            const input = document.getElementById('equip-new-input');
            if (addBrand(input.value)) {
                input.value = '';
                renderEquipmentBrandsTab();
                showToast('Znamka dodana.', 'success');
            }
        });

        document.getElementById('equip-new-input').addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('equip-add-btn').click();
        });

        document.getElementById('equip-download-btn').addEventListener('click', () => {
            const json = JSON.stringify(_equipmentCache, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = EQUIPMENT_FILE;
            a.click();
            _taxUnsaved = false;
            updateUnsavedBadge();
            showToast(`${EQUIPMENT_FILE} prenesen. Kopirajte v public/json/.`, 'success');
        });

        document.getElementById('equip-export-btn').addEventListener('click', () => {
            if (typeof XLSX === 'undefined') { showToast('XLSX knjižnica ni naložena.', 'error'); return; }
            const rows = [['Znamka'], ..._equipmentCache.map(b => [b])];
            const ws = XLSX.utils.aoa_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Moto oprema');
            XLSX.writeFile(wb, `znamke_opreme_${new Date().toISOString().slice(0, 10)}.xlsx`);
        });

        document.getElementById('equip-import-btn').addEventListener('click', () => {
            document.getElementById('equip-import-file').click();
        });

        document.getElementById('equip-import-file').addEventListener('change', (ev) => {
            const file = ev.target.files?.[0];
            if (!file) return;
            if (typeof XLSX === 'undefined') { showToast('SheetJS ni naložen.', 'error'); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const wb = XLSX.read(e.target.result, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                    // First column = brand name; skip a header row named "znamka"
                    let added = 0;
                    rows.forEach((r, idx) => {
                        const name = String(r[0] ?? '').trim();
                        if (!name) return;
                        if (idx === 0 && /znamka|brand/i.test(name)) return;
                        if (_equipmentCache.some(b => b.toLowerCase() === name.toLowerCase())) return;
                        _equipmentCache.push(name);
                        added++;
                    });
                    if (added > 0) {
                        _equipmentCache.sort((a, b) => a.localeCompare(b, 'sl'));
                        _taxUnsaved = true;
                        updateUnsavedBadge();
                        renderEquipmentBrandsTab();
                        showToast(`Uvoženih ${added} novih znamk. Ne pozabite "Shrani JSON".`, 'success');
                    } else {
                        showToast('Ni novih znamk za uvoz.', 'warn');
                    }
                } catch (err) {
                    showToast('Napaka pri branju datoteke.', 'error');
                }
            };
            reader.readAsArrayBuffer(file);
            ev.target.value = '';
        });

        wrap.querySelectorAll('.equip-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.idx, 10);
                const name = _equipmentCache[idx];
                if (!confirm(`Izbrisati "${name}"?`)) return;
                _equipmentCache.splice(idx, 1);
                _taxUnsaved = true;
                updateUnsavedBadge();
                renderEquipmentBrandsTab();
                showToast(`"${name}" izbrisano.`, 'success');
            });
        });
    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── Vehicle Lines management ──────────────────────────────────────────────────
let _vehicleLinesCache = null;

async function loadVehicleLinesAdmin() {
    if (_vehicleLinesCache) return _vehicleLinesCache;
    const res = await fetch('json/vehicle_lines.json');
    if (!res.ok) throw new Error('Napaka pri nalaganju vehicle_lines.json');
    _vehicleLinesCache = await res.json();
    return _vehicleLinesCache;
}

async function renderVehicleLinesTab() {
    const wrap = document.getElementById('tax-tree');
    const stats = document.getElementById('tax-stats');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';
    try {
        const data = await loadVehicleLinesAdmin();
        const makes = Object.keys(data).sort();
        if (stats) stats.textContent = `${makes.length} znamk z linijami`;

        wrap.innerHTML = `
          <div style="padding:1rem">
            <p style="font-size:.82rem;color:#6b7280;margin:0 0 1rem">
              Linije so specifični paketi opreme za vsako znamko (npr. S line, GT-Line, M-Line). Prikazane so v iskanju kot četrti filter za vozila, ki imajo vsaj eno linijo.
            </p>
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;align-items:flex-end;flex-wrap:wrap">
              <div>
                <label style="font-size:.78rem;color:#6b7280;display:block;margin-bottom:.25rem">Znamka</label>
                <select id="lines-make-sel" class="adm-select adm-input-sm" style="width:200px">
                  <option value="">— izberi znamko —</option>
                  ${makes.map(m => `<option value="${escHtml(m)}">${escHtml(m)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:.78rem;color:#6b7280;display:block;margin-bottom:.25rem">Nova znamka</label>
                <input id="lines-new-make" class="adm-input adm-input-sm" style="width:160px" placeholder="npr. Dacia">
              </div>
              <button class="adm-btn adm-btn-sm adm-btn-primary" id="lines-add-make-btn">+ Dodaj znamko</button>
              <button class="adm-btn adm-btn-sm adm-btn-green" id="lines-download-btn" style="margin-left:auto">⬇ Shrani JSON</button>
            </div>
            <div id="lines-editor" style="display:none;border:1px solid #e5e7eb;border-radius:.5rem;padding:1rem;background:#fafafa">
              <h4 id="lines-editor-title" style="margin:0 0 .75rem;font-size:.9rem;font-weight:700"></h4>
              <div style="display:flex;gap:.5rem;margin-bottom:.75rem;align-items:center;flex-wrap:wrap">
                <input id="lines-new-line" class="adm-input adm-input-sm" style="width:220px" placeholder="Nova linija (npr. GT-Line)">
                <button class="adm-btn adm-btn-sm adm-btn-primary" id="lines-add-line-btn">+ Dodaj linijo</button>
              </div>
              <div id="lines-chips" style="display:flex;flex-wrap:wrap;gap:.5rem"></div>
              <button class="adm-btn adm-btn-sm adm-btn-red" id="lines-del-make-btn" style="margin-top:.75rem">🗑 Odstrani znamko iz seznama</button>
            </div>
          </div>`;

        let selectedMake = null;

        function renderChips() {
            const chips = document.getElementById('lines-chips');
            if (!chips || !selectedMake) return;
            const lines = data[selectedMake] || [];
            chips.innerHTML = lines.map((l, i) => `
              <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                ${escHtml(l)}
                <button class="lines-del-line-btn" data-idx="${i}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
              </span>`).join('') || '<span style="color:#9ca3af;font-size:.82rem">Ni linij.</span>';

            chips.querySelectorAll('.lines-del-line-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = Number(btn.dataset.idx);
                    data[selectedMake].splice(idx, 1);
                    if (data[selectedMake].length === 0) delete data[selectedMake];
                    _taxUnsaved = true;
                    updateUnsavedBadge();
                    if (!data[selectedMake]) {
                        selectedMake = null;
                        document.getElementById('lines-editor').style.display = 'none';
                        renderVehicleLinesTab();
                    } else {
                        renderChips();
                    }
                    showToast('Linija izbrisana.', 'info');
                });
            });
        }

        document.getElementById('lines-make-sel').addEventListener('change', e => {
            selectedMake = e.target.value || null;
            const editor = document.getElementById('lines-editor');
            if (selectedMake) {
                document.getElementById('lines-editor-title').textContent = selectedMake;
                editor.style.display = '';
                renderChips();
            } else {
                editor.style.display = 'none';
            }
        });

        document.getElementById('lines-add-make-btn').addEventListener('click', () => {
            const name = document.getElementById('lines-new-make').value.trim();
            if (!name) { showToast('Vnesite ime znamke.', 'error'); return; }
            if (data[name]) { showToast('Znamka že obstaja.', 'warn'); return; }
            data[name] = [];
            _vehicleLinesCache = data;
            _taxUnsaved = true;
            updateUnsavedBadge();
            showToast(`Znamka "${name}" dodana.`, 'success');
            renderVehicleLinesTab();
        });

        document.getElementById('lines-add-line-btn').addEventListener('click', () => {
            if (!selectedMake) return;
            const val = document.getElementById('lines-new-line').value.trim();
            if (!val) { showToast('Vnesite ime linije.', 'error'); return; }
            if (!data[selectedMake]) data[selectedMake] = [];
            if (data[selectedMake].includes(val)) { showToast('Linija že obstaja.', 'warn'); return; }
            data[selectedMake].push(val);
            _taxUnsaved = true;
            updateUnsavedBadge();
            document.getElementById('lines-new-line').value = '';
            renderChips();
            showToast(`Linija "${val}" dodana.`, 'success');
        });

        document.getElementById('lines-del-make-btn').addEventListener('click', () => {
            if (!selectedMake) return;
            if (!confirm(`Odstraniti znamko "${selectedMake}" in vse njene linije?`)) return;
            delete data[selectedMake];
            _vehicleLinesCache = data;
            selectedMake = null;
            _taxUnsaved = true;
            updateUnsavedBadge();
            showToast('Znamka odstranjena.', 'info');
            renderVehicleLinesTab();
        });

        document.getElementById('lines-download-btn').addEventListener('click', () => {
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'vehicle_lines.json';
            a.click();
            _taxUnsaved = false;
            updateUnsavedBadge();
            showToast('vehicle_lines.json prenesen. Kopirajte v public/json/.', 'success');
        });

    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── Taxonomy Proposals review ─────────────────────────────────────────────────
async function renderTaxonomyProposalsTab() {
    const wrap = document.getElementById('tax-tree');
    const stats = document.getElementById('tax-stats');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam predloge…</div>';

    try {
        const all = await getTaxonomyProposals({ status: 'pending' });
        if (stats) stats.textContent = `${all.length} predlogov čaka na pregled`;

        if (!all.length) {
            wrap.innerHTML = '<div class="adm-empty" style="padding:2rem">Ni novih predlogov.</div>';
            return;
        }

        const typeLabel = { linija: 'Linija', equipment: 'Oprema', make: '⛵ Znamka', model: '⛵ Model', vrsta: '⛵ Vrsta' };
        const typeBadge = { linija: 'adm-badge-blue', equipment: 'adm-badge-green', make: 'adm-badge-orange', model: 'adm-badge-orange', vrsta: 'adm-badge-orange' };
        const rows = all.map(p => `
          <tr data-proposal-id="${escHtml(p.id)}">
            <td><span class="adm-badge ${typeBadge[p.type] || 'adm-badge-gray'}">${typeLabel[p.type] || p.type}</span></td>
            <td>${escHtml(p.brand || '—')}</td>
            <td>${escHtml(p.category || p.model || '—')}</td>
            <td>
              <input class="adm-input adm-input-sm proposal-value-input" style="width:220px"
                value="${escHtml(p.value)}" data-original="${escHtml(p.value)}" />
            </td>
            <td style="white-space:nowrap">
              <button class="adm-btn adm-btn-sm adm-btn-green proposal-approve-btn">✓ Odobri</button>
              <button class="adm-btn adm-btn-sm adm-btn-red proposal-reject-btn" style="margin-left:.25rem">✕ Zavrni</button>
            </td>
          </tr>`).join('');

        wrap.innerHTML = `
          <div style="padding:1rem">
            <p style="font-size:.82rem;color:#6b7280;margin:0 0 1rem">
              Predlogi so linije in oprema, ki so jih uporabniki dodali med objavo oglasa.
              Odobreni predlogi se prikažejo v iskanju za tisto znamko. Vrednost lahko uredite pred odobritvijo.
            </p>
            <div class="adm-table-wrap">
              <table class="adm-table">
                <thead><tr>
                  <th>Vrsta</th><th>Znamka</th><th>Kategorija</th><th>Vrednost</th><th>Akcija</th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>`;

        wrap.querySelectorAll('tr[data-proposal-id]').forEach(row => {
            const id = row.dataset.proposalId;
            const input = row.querySelector('.proposal-value-input');

            row.querySelector('.proposal-approve-btn').addEventListener('click', async () => {
                const edited = input.value.trim();
                if (!edited) { showToast('Vrednost ne sme biti prazna.', 'error'); return; }
                try {
                    await approveTaxonomyProposal(id, edited !== input.dataset.original ? edited : null);
                    row.remove();
                    const remaining = wrap.querySelectorAll('tr[data-proposal-id]').length;
                    if (stats) stats.textContent = `${remaining} predlogov čaka na pregled`;
                    if (!remaining) wrap.querySelector('tbody').innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:1.5rem">Vsi predlogi so obdelani.</td></tr>';
                    showToast('Predlog odobren.', 'success');
                } catch (e) { showToast('Napaka: ' + e.message, 'error'); }
            });

            row.querySelector('.proposal-reject-btn').addEventListener('click', async () => {
                try {
                    await rejectTaxonomyProposal(id);
                    row.remove();
                    const remaining = wrap.querySelectorAll('tr[data-proposal-id]').length;
                    if (stats) stats.textContent = `${remaining} predlogov čaka na pregled`;
                    if (!remaining) wrap.querySelector('tbody').innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:1.5rem">Vsi predlogi so obdelani.</td></tr>';
                    showToast('Predlog zavrnjen.', 'info');
                } catch (e) { showToast('Napaka: ' + e.message, 'error'); }
            });
        });

    } catch (e) { wrap.innerHTML = errBox(e); }
}

async function loadTaxTree(cat) {
    const wrap = document.getElementById('tax-tree');
    if (!wrap) return;
    const search = (document.getElementById('tax-search')?.value || '').toLowerCase().trim();
    const typeFilter = document.getElementById('tax-type-filter')?.value || '';
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';
    try {
        const raw = await loadTaxJson(cat);
        let brands = parseTaxData(raw, cat);

        // Populate type filter for moto/gospodarska
        const typeFilterEl = document.getElementById('tax-type-filter');
        if (cat !== 'avto') {
            const allTypes = [...new Set(brands.flatMap(b => b.models.map(m => m.type)).filter(Boolean))].sort();
            typeFilterEl.style.display = '';
            const curVal = typeFilterEl.value;
            typeFilterEl.innerHTML = '<option value="">Vse vrste</option>' +
                allTypes.map(t => `<option value="${t}"${t === curVal ? ' selected' : ''}>${escHtml(t)}</option>`).join('');
        } else {
            typeFilterEl.style.display = 'none';
        }

        // Apply type filter
        if (typeFilter) {
            brands = brands.map(b => ({
                ...b,
                models: b.models.filter(m => m.type === typeFilter),
            })).filter(b => b.models.length);
        }

        // Apply search
        if (search) {
            brands = brands.map(b => {
                const brandMatch = b.brand.toLowerCase().includes(search);
                const filteredModels = b.models.filter(m =>
                    m.name.toLowerCase().includes(search) ||
                    m.variants.some(v => normalizeTrimEntry(v).trim.toLowerCase().includes(search))
                );
                if (brandMatch) return b;
                if (filteredModels.length) return { ...b, models: filteredModels };
                return null;
            }).filter(Boolean);
        }

        // Stats
        const totalBrands = brands.length;
        const totalModels = brands.reduce((s, b) => s + b.models.length, 0);
        const totalVariants = brands.reduce((s, b) => s + b.models.reduce((ss, m) => ss + m.variants.length, 0), 0);
        const statsEl = document.getElementById('tax-stats');
        if (statsEl) statsEl.textContent = `${totalBrands} znamk · ${totalModels} modelov · ${totalVariants} različic`;

        if (!brands.length) {
            wrap.innerHTML = '<div class="adm-empty">Ni rezultatov.</div>';
            return;
        }

        wrap.innerHTML = brands.map((b, bi) => taxBrandRow(b, bi, cat, search)).join('');

        // Wire expand/collapse on brand rows
        wrap.querySelectorAll('.tax-brand-row').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('button')) return;
                row.classList.toggle('expanded');
                const next = row.nextElementSibling;
                if (next?.classList.contains('tax-models-wrap'))
                    next.style.display = row.classList.contains('expanded') ? 'block' : 'none';
            });
        });

        // Wire expand/collapse on model rows (for variants)
        wrap.querySelectorAll('.tax-model-row').forEach(row => {
            row.addEventListener('click', e => {
                if (e.target.closest('button')) return;
                const varWrap = row.nextElementSibling;
                if (!varWrap?.classList.contains('tax-variants-wrap')) return;
                row.classList.toggle('expanded');
                varWrap.style.display = row.classList.contains('expanded') ? 'block' : 'none';
            });
        });

        // Auto-expand on search
        if (search) {
            wrap.querySelectorAll('.tax-brand-row').forEach(row => {
                row.classList.add('expanded');
                const next = row.nextElementSibling;
                if (next?.classList.contains('tax-models-wrap')) next.style.display = 'block';
            });
            wrap.querySelectorAll('.tax-model-row').forEach(row => {
                const varWrap = row.nextElementSibling;
                if (!varWrap?.classList.contains('tax-variants-wrap')) return;
                const hasMatch = varWrap.querySelector('.tax-variant-match');
                if (hasMatch) { row.classList.add('expanded'); varWrap.style.display = 'block'; }
            });
        }

        // Delete handlers
        window.__taxDelModel = (cat, brand, model) => {
            if (!confirm(`Izbrisati model "${model}" iz znamke "${brand}"?`)) return;
            deleteTaxEntry(cat, brand, model, null);
        };
        window.__taxDelVariant = (cat, brand, model, variant) => {
            if (!confirm(`Izbrisati različico "${variant}"?`)) return;
            deleteTaxEntry(cat, brand, model, variant);
        };
        window.__taxDelBrand = (cat, brand) => {
            if (!confirm(`Izbrisati znamko "${brand}" in vse njene modele?`)) return;
            deleteTaxEntry(cat, brand, null, null);
        };
        window.__taxAddModel = (cat, brand) => openTaxAddModelModal(cat, brand);
        window.__taxAddVariant = (cat, brand, model) => openTaxAddVariantModal(cat, brand, model);

    } catch (e) { wrap.innerHTML = errBox(e); }
}

// State for taxonomy flat table (D-06)
let _taxSortCol = 'brand';   // 'brand' | 'model' | 'trim'
let _taxSortDir = 'asc';     // 'asc' | 'desc'
let _taxPage    = 1;
const TAX_PAGE_SIZE = 50;

async function renderTaxTable(cat) {
    const wrap = document.getElementById('tax-tree');
    if (!wrap) return;

    const search         = (document.getElementById('tax-search')?.value          || '').toLowerCase().trim();
    const typeFilter     = document.getElementById('tax-type-filter')?.value     || '';
    const categoryFilter = document.getElementById('tax-category-filter')?.value || '';

    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>';

    try {
        const raw    = await loadTaxJson(cat);
        let brands   = parseTaxData(raw, cat);

        // Per-category column layout. izvenkrmni = outboard motors (KM column, no
        // Vrsta/type filter); plovila/moto/gospodarska = typed (Vrsta + type filter);
        // avto = fuel + cc columns.
        const isIzvenkrmni = cat === 'izvenkrmni';
        const showType = cat !== 'avto' && !isIzvenkrmni;

        // Populate type filter only for categories that carry a meaningful Vrsta
        const typeFilterEl = document.getElementById('tax-type-filter');
        const catFilterEl  = document.getElementById('tax-category-filter');
        if (showType) {
            const allTypes = [...new Set(brands.flatMap(b => b.models.map(m => m.type)).filter(Boolean))].sort();
            typeFilterEl.style.display = '';
            const curVal = typeFilterEl.value;
            typeFilterEl.innerHTML = '<option value="">Vse vrste</option>' +
                allTypes.map(t => `<option value="${t}"${t === curVal ? ' selected' : ''}>${escHtml(t)}</option>`).join('');
        } else {
            typeFilterEl.style.display = 'none';
        }

        // Populate category filter (plovila only)
        if (cat === 'plovila' && catFilterEl) {
            const allCats = [...new Set(brands.flatMap(b => b.models.map(m => m.category)).filter(Boolean))].sort();
            catFilterEl.style.display = '';
            const curCatVal = catFilterEl.value;
            catFilterEl.innerHTML = '<option value="">Vse kategorije</option>' +
                allCats.map(c => `<option value="${c}"${c === curCatVal ? ' selected' : ''}>${escHtml(c)}</option>`).join('');
        } else if (catFilterEl) {
            catFilterEl.style.display = 'none';
        }

        // Flatten to rows
        let rows = [];
        for (const b of brands) {
            for (const m of b.models) {
                if (typeFilter && m.type !== typeFilter) continue;
                if (categoryFilter && m.category !== categoryFilter) continue;
                if (m.variants.length === 0) {
                    rows.push({ brand: b.brand, model: m.name, type: m.type, category: m.category, trim: '—', specs: {} });
                } else {
                    for (const v of m.variants) {
                        const norm = normalizeTrimEntry(v);
                        rows.push({ brand: b.brand, model: m.name, type: m.type, category: m.category, trim: norm.trim, specs: norm });
                    }
                }
            }
        }

        // Apply search (brand, model, trim, vrsta, kategorija)
        if (search) {
            rows = rows.filter(r =>
                r.brand.toLowerCase().includes(search) ||
                r.model.toLowerCase().includes(search) ||
                r.trim.toLowerCase().includes(search) ||
                (r.type     || '').toLowerCase().includes(search) ||
                (r.category || '').toLowerCase().includes(search)
            );
        }

        // Apply sort
        rows.sort((a, b) => {
            let aVal = a[_taxSortCol] !== undefined ? a[_taxSortCol] : a.specs?.[_taxSortCol];
            let bVal = b[_taxSortCol] !== undefined ? b[_taxSortCol] : b.specs?.[_taxSortCol];

            if (typeof aVal === 'number' || typeof bVal === 'number') {
                const aNum = aVal != null ? Number(aVal) : 0;
                const bNum = bVal != null ? Number(bVal) : 0;
                return _taxSortDir === 'asc' ? aNum - bNum : bNum - aNum;
            }

            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
            return _taxSortDir === 'asc'
                ? aVal.localeCompare(bVal, 'en')
                : bVal.localeCompare(aVal, 'en');
        });

        // Update stats
        const statsEl = document.getElementById('tax-stats');
        if (statsEl) statsEl.textContent = `${rows.length} različic`;

        if (!rows.length) {
            wrap.innerHTML = '<div class="adm-empty">Ni rezultatov.</div>';
            return;
        }

        // Pagination
        const totalPages = Math.max(1, Math.ceil(rows.length / TAX_PAGE_SIZE));
        if (_taxPage > totalPages) _taxPage = totalPages;
        const pageRows = rows.slice((_taxPage - 1) * TAX_PAGE_SIZE, _taxPage * TAX_PAGE_SIZE);

        // Build table
        const hasMotoType = showType;
        const sortArrow   = dir => dir === 'asc' ? ' ▲' : ' ▼';
        const thSort      = col => `style="cursor:pointer" data-sort="${col}"`;

        wrap.innerHTML = `
          <div class="adm-table-wrap tax-table-wrap">
            <div style="padding:.5rem 1rem;display:flex;align-items:center;gap:.75rem">
              <label style="display:flex;align-items:center;gap:.4rem;font-size:.82rem;cursor:pointer">
                <input type="checkbox" id="tax-bulk-check"> Izberi vse
              </label>
              <button class="adm-btn adm-btn-sm adm-btn-red" id="tax-bulk-del-btn" style="display:none">🗑 Briši izbrane</button>
            </div>
            <table class="adm-table tax-table">
              <thead>
                <tr>
                  <th style="width:2rem"></th>
                  <th ${thSort('brand')}>Znamka${_taxSortCol === 'brand' ? sortArrow(_taxSortDir) : ''}</th>
                  <th ${thSort('model')}>Model${_taxSortCol === 'model' ? sortArrow(_taxSortDir) : ''}</th>
                  ${hasMotoType ? '<th>Vrsta</th>' : ''}
                  ${cat === 'plovila' ? '<th>Kategorija</th>' : ''}
                  <th ${thSort('trim')}>Različica${_taxSortCol === 'trim' ? sortArrow(_taxSortDir) : ''}</th>
                  ${cat === 'avto'
                      ? `<th ${thSort('fuel_type')}>Gorivo${_taxSortCol === 'fuel_type' ? sortArrow(_taxSortDir) : ''}</th>
                         <th ${thSort('engine_capacity_cc')}>Prostornina (cc)${_taxSortCol === 'engine_capacity_cc' ? sortArrow(_taxSortDir) : ''}</th>`
                      : isIzvenkrmni
                          ? `<th ${thSort('horsepower_km')}>KM${_taxSortCol === 'horsepower_km' ? sortArrow(_taxSortDir) : ''}</th>`
                          : cat === 'plovila' ? '' : '<th>Specifikacije</th>'
                  }
                  <th style="width:6rem">Akcije</th>
                </tr>
              </thead>
              <tbody>
                ${pageRows.map((r, i) => {
                    const specText = buildSpecSummary(r.specs, cat);
                    return `
                      <tr data-row-idx="${(_taxPage - 1) * TAX_PAGE_SIZE + i}">
                        <td><input type="checkbox" class="tax-row-check" data-brand="${escHtml(r.brand)}" data-model="${escHtml(r.model)}" data-trim="${escHtml(r.trim)}"></td>
                        <td>${escHtml(r.brand)}</td>
                        <td>${escHtml(r.model)}</td>
                        ${hasMotoType ? `<td>${r.type ? `<span class="adm-badge adm-badge-blue" style="font-size:.65rem">${escHtml(r.type)}</span>` : '—'}</td>` : ''}
                        ${cat === 'plovila' ? `<td class="adm-sub">${escHtml(r.category || '—')}</td>` : ''}
                        <td>${escHtml(r.trim)}</td>
                        ${cat === 'avto'
                            ? `<td>${escHtml(r.specs.fuel_type || '—')}</td>
                               <td>${r.specs.engine_capacity_cc ? `${r.specs.engine_capacity_cc} cc` : '—'}</td>`
                            : isIzvenkrmni
                                ? `<td>${r.specs.horsepower_km ? `${r.specs.horsepower_km} KM` : '—'}</td>`
                                : cat === 'plovila' ? '' : `<td class="tax-spec-cell">${specText}</td>`
                        }
                        <td>
                          <span style="display:flex;gap:.35rem">
                            <button class="adm-btn adm-btn-xs adm-btn-primary tax-edit-btn"
                              data-brand="${escHtml(r.brand)}" data-model="${escHtml(r.model)}" data-trim="${escHtml(r.trim)}">✏</button>
                            <button class="adm-btn adm-btn-xs adm-btn-red tax-del-btn"
                              data-brand="${escHtml(r.brand)}" data-model="${escHtml(r.model)}" data-trim="${escHtml(r.trim)}">🗑</button>
                          </span>
                        </td>
                      </tr>`;
                }).join('')}
              </tbody>
            </table>
            <div class="tax-pagination">
              <button class="adm-btn adm-btn-sm" id="tax-prev-btn" ${_taxPage <= 1 ? 'disabled' : ''}>← Nazaj</button>
              <span style="font-size:.85rem;color:#6b7280">Stran ${_taxPage} / ${totalPages} · ${rows.length} vrstic</span>
              <button class="adm-btn adm-btn-sm" id="tax-next-btn" ${_taxPage >= totalPages ? 'disabled' : ''}>Naprej →</button>
            </div>
          </div>`;

        // Wire pagination
        document.getElementById('tax-prev-btn')?.addEventListener('click', () => { _taxPage--; renderTaxTable(cat); });
        document.getElementById('tax-next-btn')?.addEventListener('click', () => { _taxPage++; renderTaxTable(cat); });

        // Wire sort headers
        wrap.querySelectorAll('[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                if (_taxSortCol === col) _taxSortDir = _taxSortDir === 'asc' ? 'desc' : 'asc';
                else { _taxSortCol = col; _taxSortDir = 'asc'; }
                _taxPage = 1;
                renderTaxTable(cat);
            });
        });

        // Wire edit buttons
        wrap.querySelectorAll('.tax-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                openEditVariantModal(cat, btn.dataset.brand, btn.dataset.model, btn.dataset.trim);
            });
        });

        // Wire delete buttons
        wrap.querySelectorAll('.tax-del-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm(`Izbrisati različico "${btn.dataset.trim}"?`)) return;
                await deleteTaxEntry(cat, btn.dataset.brand, btn.dataset.model, btn.dataset.trim);
                renderTaxTable(cat);
            });
        });

        // Wire bulk select
        const bulkCheck  = document.getElementById('tax-bulk-check');
        const bulkDelBtn = document.getElementById('tax-bulk-del-btn');

        const updateBulkBtn = () => {
            const checked = wrap.querySelectorAll('.tax-row-check:checked');
            bulkDelBtn.style.display = checked.length > 0 ? '' : 'none';
        };
        bulkCheck?.addEventListener('change', () => {
            wrap.querySelectorAll('.tax-row-check').forEach(cb => { cb.checked = bulkCheck.checked; });
            updateBulkBtn();
        });
        wrap.querySelectorAll('.tax-row-check').forEach(cb => cb.addEventListener('change', updateBulkBtn));

        bulkDelBtn?.addEventListener('click', async () => {
            const checked = [...wrap.querySelectorAll('.tax-row-check:checked')];
            if (!checked.length) return;
            if (!confirm(`Izbrisati ${checked.length} izbranih različic?`)) return;
            for (const cb of checked) {
                await deleteTaxEntry(cat, cb.dataset.brand, cb.dataset.model, cb.dataset.trim);
            }
            renderTaxTable(cat);
        });

    } catch (e) { wrap.innerHTML = errBox(e); }
}

/**
 * Builds a compact spec summary string for the table cell.
 */
function buildSpecSummary(specs, cat) {
    if (!specs || Object.keys(specs).filter(k => k !== 'trim').length === 0) return '<span style="color:#9ca3af">—</span>';
    const parts = [];
    if (specs.engine_capacity_cc) parts.push(`${specs.engine_capacity_cc}cc`);
    if (specs.fuel_type)          parts.push(escHtml(specs.fuel_type));
    if (specs.fuel_consumption_combined) parts.push(`${specs.fuel_consumption_combined}L/100`);
    if (specs.fuel_consumption)   parts.push(`${specs.fuel_consumption}L/100`);
    if (specs.electric_range_km)  parts.push(`${specs.electric_range_km}km EV`);
    if (specs.engine_type)        parts.push(escHtml(specs.engine_type));
    if (specs.engine_configuration) parts.push(escHtml(specs.engine_configuration));
    if (specs.capacity)           parts.push(escHtml(specs.capacity));
    return parts.map(p => `<span class="adm-badge adm-badge-gray" style="font-size:.65rem;margin:.05rem">${p}</span>`).join('');
}

function taxBrandRow(b, bi, cat, search) {
    const chevron = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>`;
    const mc = b.models.length;
    const catArg = escHtml(cat), brandArg = escHtml(b.brand).replace(/'/g, "\\'");
    return `
      <div class="tax-brand-row">
        <span class="tax-chevron">${chevron}</span>
        <span class="tax-row-name">${escHtml(b.brand)}</span>
        <span class="tax-row-count">${mc} ${mc === 1 ? 'model' : 'modelov'}</span>
        <span class="tax-row-actions">
          <button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__taxAddModel('${catArg}','${brandArg}')">+ Model</button>
          <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__taxDelBrand('${catArg}','${brandArg}')">Briši</button>
        </span>
      </div>
      <div class="tax-models-wrap" style="display:none">
        ${mc ? b.models.map(m => taxModelRow(m, cat, b.brand, search)).join('') : '<div class="tax-model-empty">Ni modelov.</div>'}
      </div>`;
}

function taxModelRow(m, cat, brand, search) {
    const chevron = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg>`;
    const vc = m.variants.length;
    const catArg = escHtml(cat);
    const brandArg = escHtml(brand).replace(/'/g, "\\'");
    const modelArg = escHtml(m.name).replace(/'/g, "\\'");
    const typeBadge = m.type ? `<span class="adm-badge adm-badge-blue" style="font-size:.65rem;padding:.1rem .4rem">${escHtml(m.type)}</span>` : '';
    const variantsHtml = vc ? m.variants.map(v => {
        const vTrim = v.trim;
        const vArg = escHtml(vTrim).replace(/'/g, "\\'");
        const highlight = search && vTrim.toLowerCase().includes(search);
        const specBadge = v.engine_capacity_cc
            ? `<span class="adm-badge adm-badge-gray" style="font-size:.65rem;padding:.1rem .35rem">${v.engine_capacity_cc}cc</span>`
            : v.electric_range_km
            ? `<span class="adm-badge adm-badge-green" style="font-size:.65rem;padding:.1rem .35rem">${v.electric_range_km}km EV</span>`
            : '';
        return `<div class="tax-variant-row${highlight ? ' tax-variant-match' : ''}">
          <span class="tax-variant-name">${escHtml(vTrim)}</span>
          ${specBadge}
          <span class="tax-row-actions">
            <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__taxDelVariant('${catArg}','${brandArg}','${modelArg}','${vArg}')">Briši</button>
          </span>
        </div>`;
    }).join('') : '';
    return `
      <div class="tax-model-row${vc ? ' has-variants' : ''}">
        ${vc ? `<span class="tax-chevron" style="width:12px;height:12px;margin-left:.5rem">${chevron}</span>` : '<span style="width:24px;display:inline-block"></span>'}
        <span class="tax-model-name">${escHtml(m.name)}</span>
        ${typeBadge}
        ${vc ? `<span class="tax-model-slug adm-sub">${vc} različic</span>` : ''}
        <span class="tax-row-actions">
          <button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__taxAddVariant('${catArg}','${brandArg}','${modelArg}')">+ Različica</button>
          <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__taxDelModel('${catArg}','${brandArg}','${modelArg}')">Briši</button>
        </span>
      </div>
      ${vc ? `<div class="tax-variants-wrap" style="display:none">${variantsHtml}</div>` : ''}`;
}

// ── Taxonomy mutations (write back to JSON via download) ──────────────────────

async function deleteTaxEntry(cat, brand, model, variant) {
    const raw = await loadTaxJson(cat);
    if (variant) {
        if (cat === 'avto') {
            raw[brand][model] = raw[brand][model].filter(v => normalizeTrimEntry(v).trim !== variant);
        } else {
            raw[brand][model].variants = raw[brand][model].variants.filter(v => normalizeTrimEntry(v).trim !== variant);
        }
    } else if (model) {
        delete raw[brand][model];
        if (Object.keys(raw[brand]).length === 0) delete raw[brand];
    } else {
        delete raw[brand];
    }
    _taxCache[cat] = raw;
    _taxUnsaved = true;
    updateUnsavedBadge();
    showToast('Izbrisano. Izvozi JSON za trajno spremembo.', 'info');
}

// ── Variant edit modal + spec field helpers (D-07/D-08/D-11) ─────────────────

function buildSpecFieldsHtml(cat, values = {}) {
    const v = values;
    const FUEL_TYPES = ['Petrol','Diesel','Electric','Hybrid','Plug-in Hybrid','LPG','CNG','Hydrogen'];
    const ENGINE_TYPES = ['4-stroke','2-stroke','Electric','Rotary'];
    const ENGINE_CONFIGS = ['Single','Parallel Twin','V-Twin','Triple','Inline-4','Boxer','V4'];

    const fuelOpts = FUEL_TYPES.map(f =>
        `<option value="${f}" ${v.fuel_type === f ? 'selected' : ''}>${f}</option>`
    ).join('');

    if (cat === 'avto') {
        return `
          <div class="adm-form-row">
            <label>Vrsta goriva</label>
            <select id="spec-fuel-type" class="adm-select">
              <option value="">— izberi —</option>
              ${fuelOpts}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Prostornina motorja (cc)</label>
            <input id="spec-engine-cc" class="adm-input" type="number" min="50" max="10000"
              placeholder="npr. 1995" value="${v.engine_capacity_cc || ''}">
          </div>
          <div id="spec-consumption-wrap" class="tax-ev-conditional">
            <div class="adm-form-row">
              <label>Poraba — mesto (l/100km)</label>
              <input id="spec-cons-city" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${v.fuel_consumption_city || ''}">
            </div>
            <div class="adm-form-row">
              <label>Poraba — cesta (l/100km)</label>
              <input id="spec-cons-highway" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${v.fuel_consumption_highway || ''}">
            </div>
            <div class="adm-form-row">
              <label>Poraba — skupna (l/100km)</label>
              <input id="spec-cons-combined" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${v.fuel_consumption_combined || ''}">
            </div>
          </div>
          <div id="spec-ev-wrap" class="tax-ev-conditional" style="display:none">
            <div class="adm-form-row">
              <label>El. doseg (km)</label>
              <input id="spec-ev-range" class="adm-input" type="number" min="1" max="2000"
                value="${v.electric_range_km || ''}">
            </div>
          </div>`;
    }

    if (cat === 'moto') {
        const etOpts = ENGINE_TYPES.map(e => `<option value="${e}" ${v.engine_type === e ? 'selected' : ''}>${e}</option>`).join('');
        const ecOpts = ENGINE_CONFIGS.map(e => `<option value="${e}" ${v.engine_configuration === e ? 'selected' : ''}>${e}</option>`).join('');
        return `
          <div class="adm-form-row">
            <label>Tip motorja</label>
            <select id="spec-engine-type" class="adm-select">
              <option value="">— izberi —</option>
              ${etOpts}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Konfiguracija motorja</label>
            <select id="spec-engine-config" class="adm-select">
              <option value="">— izberi —</option>
              ${ecOpts}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Prostornina (cc)</label>
            <input id="spec-engine-cc" class="adm-input" type="number" min="50" max="10000"
              value="${v.engine_capacity_cc || ''}">
          </div>`;
    }

    // gospodarska (commercial)
    return `
      <div class="adm-form-row">
        <label>Vrsta goriva</label>
        <select id="spec-fuel-type" class="adm-select">
          <option value="">— izberi —</option>
          ${fuelOpts}
        </select>
      </div>
      <div class="adm-form-row">
        <label>Poraba (l/100km)</label>
        <input id="spec-cons-combined" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
          value="${v.fuel_consumption || ''}">
      </div>
      <div class="adm-form-row">
        <label>Tovornost (opcijsko, max 20 znakov)</label>
        <input id="spec-capacity" class="adm-input" type="text" maxlength="20"
          value="${escHtml(v.capacity || '')}">
      </div>`;
}

function collectSpecFields(cat, trimName) {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const obj = { trim: trimName };
    if (cat === 'avto') {
        if (g('spec-fuel-type'))    obj.fuel_type = g('spec-fuel-type');
        if (g('spec-engine-cc'))    obj.engine_capacity_cc = parseInt(g('spec-engine-cc'), 10) || null;
        if (g('spec-cons-city'))    obj.fuel_consumption_city     = parseFloat(g('spec-cons-city'))    || null;
        if (g('spec-cons-highway')) obj.fuel_consumption_highway  = parseFloat(g('spec-cons-highway')) || null;
        if (g('spec-cons-combined'))obj.fuel_consumption_combined = parseFloat(g('spec-cons-combined'))|| null;
        if (g('spec-ev-range'))     obj.electric_range_km = parseInt(g('spec-ev-range'), 10) || null;
        Object.keys(obj).forEach(k => { if (obj[k] === null || obj[k] === '') delete obj[k]; });
    } else if (cat === 'moto') {
        if (g('spec-engine-type'))   obj.engine_type          = g('spec-engine-type');
        if (g('spec-engine-config')) obj.engine_configuration = g('spec-engine-config');
        if (g('spec-engine-cc'))     obj.engine_capacity_cc   = parseInt(g('spec-engine-cc'), 10) || null;
        Object.keys(obj).forEach(k => { if (obj[k] === null || obj[k] === '') delete obj[k]; });
    } else {
        if (g('spec-fuel-type'))    obj.fuel_type = g('spec-fuel-type');
        if (g('spec-cons-combined')) obj.fuel_consumption = parseFloat(g('spec-cons-combined')) || null;
        if (g('spec-capacity'))     obj.capacity = g('spec-capacity').slice(0, 20);
        Object.keys(obj).forEach(k => { if (obj[k] === null || obj[k] === '') delete obj[k]; });
    }
    return obj;
}

function validateSpecFieldsClient(cat, obj) {
    const errs = [];
    const FUEL_TYPES   = ['Petrol','Diesel','Electric','Hybrid','Plug-in Hybrid','LPG','CNG','Hydrogen'];
    const ENGINE_TYPES  = ['4-stroke','2-stroke','Electric','Rotary'];
    const ENGINE_CONFIGS = ['Single','Parallel Twin','V-Twin','Triple','Inline-4','Boxer','V4'];

    if (obj.fuel_type && !FUEL_TYPES.includes(obj.fuel_type))
        errs.push(`Vrsta goriva "${obj.fuel_type}" ni veljavna.`);
    if (obj.engine_capacity_cc != null && (obj.engine_capacity_cc < 50 || obj.engine_capacity_cc > 10000))
        errs.push('Prostornina mora biti med 50 in 10000 cc.');
    if (obj.electric_range_km != null && (obj.electric_range_km < 1 || obj.electric_range_km > 2000))
        errs.push('Električni doseg mora biti med 1 in 2000 km.');
    ['fuel_consumption_city','fuel_consumption_highway','fuel_consumption_combined','fuel_consumption'].forEach(k => {
        if (obj[k] != null && (obj[k] < 0.1 || obj[k] > 99.9))
            errs.push(`Poraba ${k} mora biti med 0.1 in 99.9.`);
    });
    if (obj.engine_type && !ENGINE_TYPES.includes(obj.engine_type))
        errs.push(`Tip motorja "${obj.engine_type}" ni veljaven.`);
    if (obj.engine_configuration && !ENGINE_CONFIGS.includes(obj.engine_configuration))
        errs.push(`Konfiguracija "${obj.engine_configuration}" ni veljavna.`);
    if (obj.capacity && obj.capacity.length > 20)
        errs.push('Tovornost ne sme presegati 20 znakov.');
    return errs;
}

function wireEvConditional(cat) {
    if (cat !== 'avto' && cat !== 'gospodarska') return;
    const fuelSel = document.getElementById('spec-fuel-type');
    if (!fuelSel) return;
    const toggle = () => {
        const isEV = fuelSel.value === 'Electric';
        const consWrap = document.getElementById('spec-consumption-wrap');
        const evWrap   = document.getElementById('spec-ev-wrap');
        if (consWrap) consWrap.style.display = isEV ? 'none' : '';
        if (evWrap)   evWrap.style.display   = isEV ? '' : 'none';
    };
    fuelSel.addEventListener('change', toggle);
    toggle();
}

function openEditVariantModal(cat, brand, model, trimName) {
    const raw = _taxCache[cat];
    if (!raw) { showToast('Taksonomija ni naložena.', 'error'); return; }

    let variantObj = { trim: trimName };
    if (cat === 'avto') {
        const variants = raw[brand]?.[model];
        if (Array.isArray(variants)) {
            const found = variants.find(v => normalizeTrimEntry(v).trim === trimName);
            variantObj = found ? normalizeTrimEntry(found) : { trim: trimName };
        }
    } else {
        const variants = raw[brand]?.[model]?.variants;
        if (Array.isArray(variants)) {
            const found = variants.find(v => normalizeTrimEntry(v).trim === trimName);
            variantObj = found ? normalizeTrimEntry(found) : { trim: trimName };
        }
    }

    const specFieldsHtml = buildSpecFieldsHtml(cat, variantObj);

    openModal(`Uredi različico — ${escHtml(trimName)}`, `
      <div class="adm-form-row">
        <label>Ime različice <span style="color:#ef4444">*</span></label>
        <input id="edit-trim-name" class="adm-input" value="${escHtml(variantObj.trim || trimName)}">
      </div>
      ${specFieldsHtml}
    `, async el => {
        const newTrimName = document.getElementById('edit-trim-name').value.trim();
        if (!newTrimName) { showToast('Ime različice je obvezno.', 'error'); return; }

        const updatedObj = collectSpecFields(cat, newTrimName);
        const validationErrors = validateSpecFieldsClient(cat, updatedObj);
        if (validationErrors.length) {
            showToast(validationErrors[0], 'error');
            return;
        }

        if (cat === 'avto') {
            if (Array.isArray(raw[brand][model])) {
                raw[brand][model] = raw[brand][model].map(v =>
                    normalizeTrimEntry(v).trim === trimName ? updatedObj : v
                );
            }
        } else {
            if (Array.isArray(raw[brand][model].variants)) {
                raw[brand][model].variants = raw[brand][model].variants.map(v =>
                    normalizeTrimEntry(v).trim === trimName ? updatedObj : v
                );
            }
        }
        _taxCache[cat] = raw;
        _taxUnsaved = true;
        updateUnsavedBadge();
        el.remove();
        showToast(`Različica "${newTrimName}" posodobljena.`, 'success');
        renderTaxTable(cat);
    });

    setTimeout(() => wireEvConditional(cat), 50);
}

function openTaxAddBrandModal(cat) {
    const hasType = cat !== 'avto';
    openModal(`Dodaj znamko — ${TAX_SOURCES[cat].label}`, `
      <div class="adm-form-row"><label>Ime znamke</label>
        <input id="tax-new-brand" class="adm-input" placeholder="npr. Lamborghini">
      </div>`, async el => {
        const name = document.getElementById('tax-new-brand').value.trim();
        if (!name) { showToast('Vnesite ime znamke.', 'error'); return; }
        const raw = await loadTaxJson(cat);
        if (raw[name]) { showToast('Znamka že obstaja.', 'warn'); return; }
        raw[name] = {};
        _taxCache[cat] = raw;
        _taxUnsaved = true;
        updateUnsavedBadge();
        el.remove();
        showToast(`Znamka "${name}" dodana.`, 'success');
        renderTaxTable(cat);
    });
}

function openTaxAddModelModal(cat, brand) {
    const hasType = cat !== 'avto';
    const typeOptions = cat === 'moto'
        ? ['SportniMotor', 'SportniTourer', 'Adventure', 'NakedBike', 'Enduro', 'Chopper', 'Tourer', 'Supermoto', 'Trial', 'Cross', 'Skuter', 'Minimoto', 'Gocart', 'MotorneSani', 'EVozila']
        : cat === 'gospodarska'
        ? ['Dostavna','Tovorna','Avtobus','TovornePrikolice','Gradbena','Kmetijska','Komunalna','Gozdarska','Vilicarji']
        : [];
    openModal(`Dodaj model — ${escHtml(brand)}`, `
      <div class="adm-form-row"><label>Ime modela</label>
        <input id="tax-new-model" class="adm-input" placeholder="npr. S 1000 RR">
      </div>
      ${hasType ? `<div class="adm-form-row"><label>Vrsta vozila</label>
        <select id="tax-new-type" class="adm-select">
          ${typeOptions.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select></div>` : ''}`, async el => {
        const name = document.getElementById('tax-new-model').value.trim();
        const type = hasType ? document.getElementById('tax-new-type').value : null;
        if (!name) { showToast('Vnesite ime modela.', 'error'); return; }
        const raw = await loadTaxJson(cat);
        if (!raw[brand]) raw[brand] = {};
        if (cat === 'avto') {
            raw[brand][name] = [];
        } else {
            raw[brand][name] = { type, variants: [] };
        }
        _taxCache[cat] = raw;
        _taxUnsaved = true;
        updateUnsavedBadge();
        el.remove();
        showToast(`Model "${name}" dodan.`, 'success');
        renderTaxTable(cat);
    });
}

function openTaxAddVariantModal(cat, brand, model) {
    const specFieldsHtml = buildSpecFieldsHtml(cat, {});

    openModal(`Dodaj različico — ${escHtml(model)}`, `
      <div class="adm-form-row"><label>Ime različice <span style="color:#ef4444">*</span></label>
        <input id="tax-new-variant" class="adm-input" placeholder="npr. S 1000 RR M">
      </div>
      ${specFieldsHtml}
    `, async el => {
        const name = document.getElementById('tax-new-variant').value.trim();
        if (!name) { showToast('Vnesite ime različice.', 'error'); return; }

        const variantObj = collectSpecFields(cat, name);
        const validationErrors = validateSpecFieldsClient(cat, variantObj);
        if (validationErrors.length) { showToast(validationErrors[0], 'error'); return; }

        const raw = await loadTaxJson(cat);
        if (cat === 'avto') {
            if (!Array.isArray(raw[brand][model])) raw[brand][model] = [];
            const exists = raw[brand][model].some(v => normalizeTrimEntry(v).trim === name);
            if (exists) { showToast('Različica že obstaja.', 'warn'); return; }
            raw[brand][model].push(variantObj);
        } else {
            if (!Array.isArray(raw[brand][model].variants)) raw[brand][model].variants = [];
            const exists = raw[brand][model].variants.some(v => normalizeTrimEntry(v).trim === name);
            if (exists) { showToast('Različica že obstaja.', 'warn'); return; }
            raw[brand][model].variants.push(variantObj);
        }
        _taxCache[cat] = raw;
        _taxUnsaved = true;
        updateUnsavedBadge();
        el.remove();
        showToast(`Različica "${name}" dodana.`, 'success');
        renderTaxTable(cat);
    });

    setTimeout(() => wireEvConditional(cat), 50);
}

async function exportTaxExcel(cat) {
    if (typeof XLSX === 'undefined') { showToast('XLSX knjižnica ni naložena.', 'error'); return; }
    const raw = await loadTaxJson(cat);
    const brands = parseTaxData(raw, cat);
    const search = (document.getElementById('tax-search')?.value || '').toLowerCase().trim();
    const typeFilter = document.getElementById('tax-type-filter')?.value || '';

    const rows = cat === 'avto'
        ? [['Make', 'Model', 'Trim', 'Fuel Type', 'Engine Capacity (cc)']]
        : cat === 'plovila'
            ? [['Znamka', 'Model', 'Različica', 'Vrsta', 'Kategorija']]
            : [['Znamka', 'Model', 'Vrsta', 'Različica']];
    for (const b of brands) {
        for (const m of b.models) {
            if (typeFilter && m.type !== typeFilter) continue;
            if (search && !b.brand.toLowerCase().includes(search) && !m.name.toLowerCase().includes(search)) continue;
            if (m.variants.length) {
                for (const v of m.variants) {
                    const vNorm = normalizeTrimEntry(v);
                    if (search && !b.brand.toLowerCase().includes(search) && !m.name.toLowerCase().includes(search) && !vNorm.trim.toLowerCase().includes(search)) continue;
                    if (cat === 'avto') {
                        rows.push([b.brand, m.name, vNorm.trim, vNorm.fuel_type || '', vNorm.engine_capacity_cc || '']);
                    } else if (cat === 'plovila') {
                        rows.push([b.brand, m.name, vNorm.trim, m.type || '', m.category || '']);
                    } else {
                        rows.push([b.brand, m.name, m.type || '', vNorm.trim]);
                    }
                }
            } else {
                if (cat === 'avto') {
                    rows.push([b.brand, m.name, '', '', '']);
                } else {
                    rows.push([b.brand, m.name, m.type || '', '']);
                }
            }
        }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, TAX_SOURCES[cat].label);
    XLSX.writeFile(wb, `taksonomija_${cat}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function catColor(cat) {
    return { avto: 'blue', moto: 'orange', gospodarska: 'teal', deli: 'purple', pnevmatike: 'green' }[cat] || 'gray';
}

// ── 4b. VOZILA UVOZ — Excel import with duplicate detection ───────────────────

async function renderVozilaUvoz() {
    const c = document.getElementById('adm-content');
    const isNavtika = PLATFORM.id === 'navtika';
    const tplButtons = isNavtika
        ? `<button class="adm-btn adm-btn-sm adm-btn-blue"   id="voz-tpl-plovila">⬇ Predloga Plovila</button>
           <button class="adm-btn adm-btn-sm adm-btn-orange" id="voz-tpl-izvenkrmni">⬇ Predloga Izvenkrmni motorji</button>`
        : `<button class="adm-btn adm-btn-sm adm-btn-blue"   id="voz-tpl-avto">⬇ Predloga Avto</button>
           <button class="adm-btn adm-btn-sm adm-btn-orange" id="voz-tpl-moto">⬇ Predloga Motorji</button>
           <button class="adm-btn adm-btn-sm adm-btn-teal"   id="voz-tpl-gosp">⬇ Predloga Gospodarska</button>`;
    const helpText = isNavtika
        ? `<strong>Plovila:</strong> <code>Znamka · Model · Različica · Vrsta · Kategorija</code><br>
           <strong>Izvenkrmni motorji:</strong> <code>Znamka · Model · KM · Različica</code> (KM = konjska moč).<br>
           Podvojen vnos = ista znamka + model + različica → <strong>preskočen, ne podvojen</strong>.`
        : `<strong>Avto / Gospodarska:</strong> <code>category · brand · model · variant</code><br>
           <strong>Motorji:</strong> <code>Znamka · Model · Različica · Kategorija · Takt · Konfiguracija</code>
           — Kategorija z <code>/</code> loči več tipov (npr. <em>Športni / Naked</em>).<br>
           Podvojen vnos = ista znamka + model + različica → <strong>preskočen, ne podvojen</strong>.`;
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header" style="flex-wrap:wrap;gap:.75rem">
          <h3>${isNavtika ? 'Vnos plovil — Excel uvoz' : 'Vnos vozil — Excel uvoz'}</h3>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;width:100%">
            ${tplButtons}
            ${isNavtika ? '' : '<button class="adm-btn adm-btn-sm adm-btn-red" id="voz-clear-avto-btn" style="margin-left:auto">🗑 Pobriši avto taksonomijo (Firestore)</button>'}
          </div>
        </div>
        <div style="padding:1.25rem">
          <p style="color:#6b7280;font-size:.875rem;margin:0 0 1rem">
            ${helpText}
          </p>
          <div class="adm-dropzone" id="voz-dropzone">
            <div style="font-size:2rem;margin-bottom:.4rem">📂</div>
            <div>Povlecite datoteko sem ali <label for="voz-file" style="color:#2563eb;cursor:pointer;font-weight:600">izberite datoteko</label></div>
            <div style="font-size:.78rem;color:#9ca3af;margin-top:.3rem">.xlsx · .xls · .csv</div>
            <input type="file" id="voz-file" accept=".xlsx,.xls,.csv" style="display:none">
          </div>
          <div id="voz-preview" style="display:none;margin-top:1.25rem">
            <div id="voz-dedup-summary"></div>
            <h4 style="margin:.75rem 0 .5rem;font-size:.875rem;font-weight:700">Predogled (prvih 20 vrstic):</h4>
            <div class="adm-table-wrap" id="voz-preview-table"></div>
            <div style="display:flex;gap:.75rem;margin-top:1rem;align-items:center">
              <button class="adm-btn adm-btn-primary" id="voz-import-btn">📥 Uvozi</button>
              <button class="adm-btn" id="voz-reset-btn">✕ Ponastavi</button>
              <span id="voz-count-label" style="font-size:.82rem;color:#6b7280"></span>
            </div>
          </div>
          <div id="voz-result" style="margin-top:1rem"></div>
        </div>
      </div>`;

    document.getElementById('voz-tpl-avto')?.addEventListener('click', () => downloadVozilaTemplate('avto'));
    document.getElementById('voz-tpl-moto')?.addEventListener('click', () => downloadVozilaTemplate('moto'));
    document.getElementById('voz-tpl-gosp')?.addEventListener('click', () => downloadVozilaTemplate('gospodarska'));
    document.getElementById('voz-tpl-plovila')?.addEventListener('click', () => downloadVozilaTemplate('plovila'));
    document.getElementById('voz-tpl-izvenkrmni')?.addEventListener('click', () => downloadVozilaTemplate('izvenkrmni'));
    document.getElementById('voz-clear-avto-btn')?.addEventListener('click', async () => {
        if (!confirm('Ali ste prepričani, da želite pobrisati CELOTNO avtomobilsko taksonomijo iz Firestore (znamke, modeli in zapisi)? Te akcije ni mogoče razveljaviti.')) return;
        const btn = document.getElementById('voz-clear-avto-btn');
        btn.disabled = true; btn.textContent = '⏳ Brišem…';
        try {
            await clearCarTaxonomy(_adminUser.uid, _adminUser.displayName);
            showToast('Avtomobilska taksonomija je bila uspešno pobrisana iz Firestore.', 'success');
        } catch (e) {
            showToast('Napaka pri brisanju: ' + e.message, 'error');
        }
        btn.disabled = false; btn.textContent = '🗑 Pobriši avto taksonomijo (Firestore)';
    });

    let parsedRows = [];
    let existingBrands = [], existingModels = [];

    // pre-load existing data for dedup preview
    try {
        [existingBrands, existingModels] = await Promise.all([getBrands(), getModels()]);
    } catch { /* ignore — dedup info won't show */ }

    const fileInput = document.getElementById('voz-file');
    const dropzone  = document.getElementById('voz-dropzone');

    fileInput.addEventListener('change', e => handleVozFile(e.target.files[0]));
    dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('adm-dropzone--hover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('adm-dropzone--hover'));
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('adm-dropzone--hover'); handleVozFile(e.dataTransfer.files[0]); });
    dropzone.addEventListener('click', () => fileInput.click());

    document.getElementById('voz-reset-btn')?.addEventListener('click', () => {
        parsedRows = [];
        document.getElementById('voz-preview').style.display = 'none';
        document.getElementById('voz-result').innerHTML = '';
        fileInput.value = '';
    });

    document.getElementById('voz-import-btn')?.addEventListener('click', async () => {
        if (!parsedRows.length) return;
        const btn = document.getElementById('voz-import-btn');
        btn.disabled = true; btn.textContent = '⏳ Uvažam…';
        try {
            const result = await importTaxonomyRows(parsedRows, _adminUser.uid, _adminUser.displayName);
            document.getElementById('voz-result').innerHTML = `
              <div class="adm-alert adm-alert-success">
                ✅ Uvoz končan: <strong>${result.imported}</strong> novih zapisov,
                <strong>${result.skipped}</strong> preskočenih (podvojeni).
                ${result.errors.length ? `<br>⚠️ ${result.errors.length} napak.` : ''}
              </div>`;
            showToast('Uvoz uspešen!', 'success');
            await addAuditLog(_adminUser.uid, _adminUser.displayName, 'VEHICLE_IMPORT', 'taxonomy', { imported: result.imported, skipped: result.skipped });
        } catch (e) {
            document.getElementById('voz-result').innerHTML = `<div class="adm-alert adm-alert-error">Napaka: ${e.message}</div>`;
        }
        btn.disabled = false; btn.textContent = '📥 Uvozi';
    });

    function detectMotoFormat(row) {
        // moto template (v2) SL headers: Znamka, Model, Vrsta, Različica, Prostornina, Takt, Tip motorja, Prenos moči
        // (legacy v1 headers Kategorija/Konfiguracija still accepted for back-compat)
        return 'tip motorja' in row || 'prenos moči' in row || 'prenos moci' in row ||
               'vrsta' in row || 'kategorija' in row || 'takt' in row || 'konfiguracija' in row;
    }

    // Outboard-motor template has a KM (horsepower) column; everything else on the
    // navtika platform is treated as a plovila (vessel) import.
    function detectIzvenkrmniFormat(row) {
        return 'km' in row;
    }

    function handleVozFile(file) {
        if (!file) return;
        if (typeof XLSX === 'undefined') { showToast('SheetJS ni naložen.', 'error'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const wb = XLSX.read(e.target.result, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

                const normalised = raw.map(r => {
                    const row = {};
                    Object.entries(r).forEach(([k, v]) => { row[k.toLowerCase().trim()] = String(v).trim(); });
                    return row;
                });

                const navtikaImport = PLATFORM.id === 'navtika';
                const isIzvenkrmni = navtikaImport && normalised.length > 0 && detectIzvenkrmniFormat(normalised[0]);
                const isPlovila = navtikaImport && !isIzvenkrmni;
                const isMoto = !navtikaImport && normalised.length > 0 && detectMotoFormat(normalised[0]);

                parsedRows = normalised.map(row => {
                    if (isIzvenkrmni) {
                        // Izvenkrmni motorji: Znamka · Model · KM · Različica
                        const kmNum = parseInt(row['km'] || '', 10);
                        return {
                            category:      'izvenkrmni',
                            brand:         row['znamka'] || row['brand'] || '',
                            model:         row['model'] || '',
                            variant:       row['različica'] || row['razlicica'] || row['variant'] || row['trim'] || '',
                            horsepower_km: (kmNum > 0) ? kmNum : '',
                        };
                    }
                    if (isPlovila) {
                        // Plovila: Znamka · Model · Različica · Vrsta · Kategorija
                        return {
                            category:   'plovila',
                            brand:      row['znamka'] || row['brand'] || '',
                            model:      row['model'] || '',
                            variant:    row['različica'] || row['razlicica'] || row['variant'] || row['trim'] || '',
                            vrsta:      row['vrsta'] || '',
                            kategorija: row['kategorija'] || '',
                        };
                    }
                    if (isMoto) {
                        // v2 moto: Znamka·Model·Vrsta·Različica·Prostornina·Takt·Tip motorja·Prenos moči
                        const codeRaw   = row['tip motorja'] || row['konfiguracija'] || '';
                        const eng       = motoEngineFromCode(codeRaw);
                        const prenosRaw = row['prenos moči'] || row['prenos moci'] || row['prenos'] || '';
                        let   electric  = eng.electric;
                        let   drivetrain = motoDrivetrain(prenosRaw);
                        if (prenosRaw.toLowerCase().startsWith('elektrom')) { electric = true; drivetrain = ''; } // column-leak fix
                        const stroke    = motoStroke(row['takt'] || '', electric);
                        const { canon, sub } = motoVrsta(row['vrsta'] || row['kategorija'] || '');
                        const ccNum     = parseInt(row['prostornina'] || row['engine capacity (cc)'] || '', 10);
                        return {
                            category:        'moto',
                            brand:           row['znamka']    || row['brand'] || '',
                            model:           row['model']                     || '',
                            variant:         row['različica'] || row['razlicica'] || row['variant'] || row['trim'] || 'Base',
                            vrsta:           canon,
                            sub_type:        (canon === 'EVozila' && sub) ? sub : '',
                            displacement_cc: (ccNum > 0) ? ccNum : '',
                            stroke:          stroke,
                            engine_code:     eng.group ? codeRaw.trim() : '',
                            engine_type:     eng.group,            // friendly group for display/filter
                            cylinders:       eng.cyl,
                            cylinder_layout: eng.layout,
                            drivetrain:      drivetrain,
                        };
                    }
                    return {
                        category:                   row['category']                  || row['kategorija']           || 'avto',
                        brand:                      row['make']                      || row['brand']                || row['znamka'] || '',
                        model:                      row['model']                                                     || '',
                        variant:                    row['variant']                   || row['različica']             || row['razlicica'] || row['trim'] || '',
                        fuel_type:                  normalizeFuelType(row['fuel type'] || row['fuel_type']           || ''),
                        engine_capacity_cc:         row['engine capacity (cc)']      || row['engine_capacity_cc']   || '',
                        fuel_consumption_city:      row['consumption city (opcijsko)']     || row['consumption city']      || row['fuel_consumption_city']     || '',
                        fuel_consumption_highway:   row['consumption highway (opcijsko)']  || row['consumption highway']   || row['fuel_consumption_highway']  || '',
                        fuel_consumption_combined:  row['consumption combined (opcijsko)'] || row['consumption combined'] || row['fuel_consumption_combined'] || '',
                        electric_range_km:          row['electric range (km) (opcijsko)']  || row['electric range (km)']  || row['electric_range_km']         || '',
                        fuel_consumption:           row['fuel consumption (l/100km) (opcijsko)'] || row['fuel_consumption'] || '',
                        capacity:                   row['capacity (opcijsko)']       || row['capacity']              || '',
                    };
                }).filter(r => r.brand);

                renderVozPreview(parsedRows, isMoto);
            } catch (ex) { showToast('Napaka pri branju: ' + ex.message, 'error'); }
        };
        reader.readAsArrayBuffer(file);
    }

    function renderVozPreview(rows, isMoto) {
        document.getElementById('voz-preview').style.display = 'block';

        // dedup analysis against existing data
        const brandMap = new Map(existingBrands.map(b => [b.name.toLowerCase() + '|' + b.category, b]));
        const modelMap = new Map(existingModels.map(m => [m.name.toLowerCase() + '|' + (m.brandId || ''), m]));

        let newBrands = 0, dupBrands = 0, newModels = 0, dupModels = 0;
        rows.forEach(r => {
            const bKey = r.brand.toLowerCase() + '|' + r.category;
            if (brandMap.has(bKey)) dupBrands++; else newBrands++;
            if (r.model) {
                const existing = existingBrands.find(b => b.name.toLowerCase() === r.brand.toLowerCase() && b.category === r.category);
                const mKey = r.model.toLowerCase() + '|' + (existing?.id || '__new__');
                if (modelMap.has(mKey)) dupModels++; else newModels++;
            }
        });

        document.getElementById('voz-dedup-summary').innerHTML = `
          <div class="voz-dedup-grid">
            <div class="voz-dedup-cell voz-new"><div class="voz-count">${newBrands}</div><div class="voz-label">novih znamk</div></div>
            <div class="voz-dedup-cell voz-dup"><div class="voz-count">${dupBrands}</div><div class="voz-label">obstoječih znamk</div></div>
            <div class="voz-dedup-cell voz-new"><div class="voz-count">${newModels}</div><div class="voz-label">novih modelov</div></div>
            <div class="voz-dedup-cell voz-dup"><div class="voz-count">${dupModels}</div><div class="voz-label">obstoječih modelov</div></div>
          </div>`;

        const show = rows.slice(0, 20);
        const cat0 = rows.length > 0 ? rows[0].category : '';
        const isAvtoFile = cat0 === 'avto';
        const isPlovilaFile = cat0 === 'plovila';
        const isIzvenkrmniFile = cat0 === 'izvenkrmni';
        const headers = isMoto
            ? `<tr><th>Znamka</th><th>Model</th><th>Vrsta</th><th>Različica</th><th>Prostornina</th><th>Takt</th><th>Tip motorja</th><th>Prenos moči</th><th>Status</th></tr>`
            : isPlovilaFile
            ? `<tr><th>Znamka</th><th>Model</th><th>Vrsta</th><th>Kategorija</th><th>Različica</th><th>Status</th></tr>`
            : isIzvenkrmniFile
            ? `<tr><th>Znamka</th><th>Model</th><th>KM</th><th>Različica</th><th>Status</th></tr>`
            : isAvtoFile
            ? `<tr><th>Znamka</th><th>Model</th><th>Trim</th><th>Gorivo</th><th>Prostornina</th><th>Status</th></tr>`
            : `<tr><th>Kat.</th><th>Znamka</th><th>Model</th><th>Različica</th><th>Status</th></tr>`;
        const colSpan = isMoto ? 9 : isPlovilaFile ? 6 : (isAvtoFile ? 6 : 5);

        document.getElementById('voz-preview-table').innerHTML = `
          <table class="adm-table">
            <thead>${headers}</thead>
            <tbody>
              ${show.map(r => {
                  const bKey = r.brand.toLowerCase() + '|' + r.category;
                  const isDup = brandMap.has(bKey);
                  const statusBadge = isDup
                      ? '<span class="adm-badge adm-badge-gray">Obstoječ</span>'
                      : '<span class="adm-badge adm-badge-green">Nov</span>';
                  if (isMoto) {
                      const vrstaLabel = r.vrsta === 'EVozila' && r.sub_type ? `${r.vrsta} (${r.sub_type})` : (r.vrsta || '');
                      const tipLabel = r.engine_code && r.engine_code !== r.engine_type
                          ? `${r.engine_type} · ${r.engine_code}` : (r.engine_type || '');
                      return `<tr class="${isDup ? 'voz-row-dup' : 'voz-row-new'}">
                        <td><strong>${escHtml(r.brand)}</strong></td>
                        <td>${escHtml(r.model)}</td>
                        <td class="adm-sub">${escHtml(vrstaLabel)}</td>
                        <td class="adm-sub">${escHtml(r.variant)}</td>
                        <td class="adm-sub">${r.displacement_cc ? escHtml(String(r.displacement_cc)) + ' ccm' : '—'}</td>
                        <td class="adm-sub">${escHtml(r.stroke || '—')}</td>
                        <td class="adm-sub">${escHtml(tipLabel || '—')}</td>
                        <td class="adm-sub">${escHtml(r.drivetrain || '—')}</td>
                        <td>${statusBadge}</td>
                      </tr>`;
                  }
                  if (r.category === 'avto') {
                      return `<tr class="${isDup ? 'voz-row-dup' : 'voz-row-new'}">
                        <td><strong>${escHtml(r.brand)}</strong></td>
                        <td>${escHtml(r.model)}</td>
                        <td class="adm-sub">${escHtml(r.variant)}</td>
                        <td class="adm-sub">${escHtml(r.fuel_type || '—')}</td>
                        <td class="adm-sub">${r.engine_capacity_cc ? escHtml(String(r.engine_capacity_cc)) + ' cc' : '—'}</td>
                        <td>${statusBadge}</td>
                      </tr>`;
                  }
                  if (r.category === 'plovila') {
                      return `<tr class="${isDup ? 'voz-row-dup' : 'voz-row-new'}">
                        <td><strong>${escHtml(r.brand)}</strong></td>
                        <td>${escHtml(r.model)}</td>
                        <td class="adm-sub">${escHtml(r.vrsta || '—')}</td>
                        <td class="adm-sub">${escHtml(r.kategorija || '—')}</td>
                        <td class="adm-sub">${escHtml(r.variant)}</td>
                        <td>${statusBadge}</td>
                      </tr>`;
                  }
                  if (r.category === 'izvenkrmni') {
                      return `<tr class="${isDup ? 'voz-row-dup' : 'voz-row-new'}">
                        <td><strong>${escHtml(r.brand)}</strong></td>
                        <td>${escHtml(r.model)}</td>
                        <td class="adm-sub">${r.horsepower_km ? escHtml(String(r.horsepower_km)) + ' KM' : '—'}</td>
                        <td class="adm-sub">${escHtml(r.variant)}</td>
                        <td>${statusBadge}</td>
                      </tr>`;
                  }
                  return `<tr class="${isDup ? 'voz-row-dup' : 'voz-row-new'}">
                    <td><span class="adm-badge adm-badge-${catColor(r.category)}">${escHtml(r.category)}</span></td>
                    <td><strong>${escHtml(r.brand)}</strong></td>
                    <td>${escHtml(r.model)}</td>
                    <td class="adm-sub">${escHtml(r.variant)}</td>
                    <td>${statusBadge}</td>
                  </tr>`;
              }).join('')}
              ${rows.length > 20 ? `<tr><td colspan="${colSpan}" style="color:#6b7280;text-align:center;padding:.75rem">… in še ${rows.length - 20} vrstic</td></tr>` : ''}
            </tbody>
          </table>`;

        document.getElementById('voz-count-label').textContent =
            `${rows.length} vrstic skupaj · ${newBrands + newModels} novih zapisov`;
    }
}

// ── Moto normalization helpers (mirror of scripts/build_moto_taxonomy.py) ─────
// Engine code (I1, V2 90°, B2, Elektromotor…) → friendly group + cylinders + layout
function motoEngineFromCode(code) {
    const c = (code || '').trim();
    const cl = c.toLowerCase();
    if (['elektromotor', 'elektrom', 'električni', 'electric'].includes(cl)) return { group: 'Električni', cyl: '', layout: '', electric: true };
    if (cl.includes('hibrid')) return { group: 'Hibridni', cyl: '', layout: '', electric: false };
    if (cl.includes('rotor') || cl === 'wankel') return { group: 'Wankel', cyl: '', layout: '', electric: false };
    if (c === '' || c === '/' || cl === 'veriga') return { group: '', cyl: '', layout: '', electric: false };
    if (cl.includes('kvadratni')) return { group: 'Štirivaljnik (kvadratni)', cyl: '4', layout: '', electric: false };
    const L = c[0].toUpperCase();
    let d = '';
    for (const ch of c) { if (ch >= '0' && ch <= '9') { d = ch; break; } }
    const G = {
        I1: ['Enovaljnik', 'Single'], I2: ['Dvovaljnik (vrstni)', 'Parallel-twin'],
        I3: ['Trivaljnik', 'Inline-three'], I4: ['Štirivaljnik', 'Inline-four'], I6: ['Šestvaljnik', 'Inline-six'],
        V2: ['Dvovaljnik (V)', 'V-twin'], V3: ['Trivaljnik (V)', ''], V4: ['Štirivaljnik (V)', 'V4'], V8: ['Osemvaljnik (V)', ''],
        B2: ['Bokser', 'Boxer'], B4: ['Bokser', 'Boxer-four'], B6: ['Bokser', 'Boxer-six'],
    };
    const hit = G[L + d];
    if (hit) return { group: hit[0], cyl: ['1', '2', '3', '4', '6'].includes(d) ? d : '', layout: hit[1], electric: false };
    return { group: '', cyl: '', layout: '', electric: false };
}
function motoStroke(takt, electric) {
    const t = (takt || '').toLowerCase();
    if (electric) return 'Električni';
    if (t.startsWith('4')) return '4T';
    if (t.startsWith('2')) return '2T';
    if (t.includes('elek')) return 'Električni';
    if (t.includes('wankel')) return 'Wankel';
    return '';
}
function motoDrivetrain(p) {
    p = (p || '').trim().toLowerCase();
    if (p.includes('kardan')) return 'kardan';
    if (p.includes('zobati')) return 'zobati jermen';
    if (p.includes('jekleni')) return 'jekleni jermen';
    if (p.includes('verig')) return 'veriga';
    return '';
}
const MOTO_ELECTRIC_VRSTA = new Set(['e-bike', 'električni skiro', 'elektricni skiro', 'električno kolo', 'elektricno kolo', 'električni motocikel', 'elektricni motocikel', 'e-skuter', 'električni moped', 'elektricni moped']);
const MOTO_VRSTA_MAP = {
    sportnimotor: 'SportniMotor', sportnitourer: 'SportniTourer', adventure: 'Adventure', nakedbike: 'NakedBike',
    enduro: 'Enduro', chopper: 'Chopper', tourer: 'Tourer', supermoto: 'Supermoto', trial: 'Trial', cross: 'Cross',
    skuter: 'Skuter', minimoto: 'Minimoto', gokart: 'Gocart', 'motorne sani': 'MotorneSani', classic: 'Classic',
    cruiser: 'Cruiser', moped: 'Moped', utv: 'UTV', atv: 'ATV', 'side-by-side': 'UTV', trikolesnik: 'Trikolesnik', scrambler: 'NakedBike',
};
function motoVrsta(vrsta) {
    const v = (vrsta || '').trim();
    const vl = v.toLowerCase();
    if (MOTO_ELECTRIC_VRSTA.has(vl)) return { canon: 'EVozila', sub: v };
    return { canon: MOTO_VRSTA_MAP[vl] || v, sub: v };
}

// Normalise car fuel-type labels to the allowed set (PHEV → Plug-in Hybrid, etc.)
function normalizeFuelType(fuel) {
    const f = (fuel || '').trim();
    const map = {
        'phev': 'Plug-in Hybrid', 'plug-in hybrid': 'Plug-in Hybrid', 'plugin hybrid': 'Plug-in Hybrid',
        'petrol/oil': 'Petrol', 'petrol': 'Petrol', 'bencin': 'Petrol', 'gasoline': 'Petrol',
        'diesel': 'Diesel', 'dizel': 'Diesel',
        'electric': 'Electric', 'električni': 'Electric', 'ev': 'Electric',
        'hybrid': 'Hybrid', 'hibrid': 'Hybrid',
        'lpg': 'LPG', 'cng': 'CNG', 'hydrogen': 'Hydrogen', 'vodik': 'Hydrogen', 'steam': 'Steam',
    };
    return map[f.toLowerCase()] || f;
}

function downloadVozilaTemplate(cat) {
    if (typeof XLSX === 'undefined') { showToast('XLSX knjižnica ni naložena.', 'error'); return; }

    const TEMPLATES = {
        avto: {
            sheetName: 'Avtomobili',
            fileName: 'predloga_avto.xlsx',
            notes: 'OPOMBA: Stolpci so Make, Model, Trim, Fuel Type, Engine Capacity (cc). Fuel Type: Petrol|Diesel|Electric|Hybrid|Plug-in Hybrid|LPG|CNG|Hydrogen|Steam. Za Electric vozila pustite Engine Capacity prazno.',
            headers: [
                'Make',
                'Model',
                'Trim',
                'Fuel Type',
                'Engine Capacity (cc)',
            ],
            examples: [
                ['BMW', '3 Series', '320d', 'Diesel', 1995],
                ['BMW', '3 Series', '330e', 'Plug-in Hybrid', 1998],
                ['Tesla', 'Model 3', 'Long Range', 'Electric', ''],
            ],
        },
        moto: {
            sheetName: 'Motorji',
            fileName: 'predloga_motorji.xlsx',
            notes: 'OPOMBA: Vrsta = kategorija vozila (SportniMotor, Adventure, NakedBike, Classic, Cruiser, Moped, Skuter, ATV, UTV, Trikolesnik, E-Bike, Električni skiro …). Takt: 4-taktni|2-taktni|Električni|Wankel. Tip motorja = koda (I1=enovaljnik, I2=vrstni 2, I4=vrstni 4, V2=V-dvovaljnik, V4, B2=bokser, Elektromotor). Prenos moči: veriga|zobati jermen|jekleni jermen|kardan. Prostornina v ccm (pri električnih pustite prazno).',
            headers: [
                'Znamka',
                'Model',
                'Vrsta',
                'Različica',
                'Prostornina',
                'Takt',
                'Tip motorja',
                'Prenos moči',
            ],
            examples: [
                ['BMW Motorrad', 'S 1000 RR', 'SportniMotor', 'S 1000 RR M', 999, '4-taktni', 'I4', 'veriga'],
                ['Ducati', 'Panigale V4', 'SportniMotor', 'Panigale V4S', 1103, '4-taktni', 'V4 90°', 'veriga'],
                ['BMW Motorrad', 'R 1250 GS', 'Adventure', 'R 1250 GS Adventure', 1254, '4-taktni', 'B2', 'kardan'],
                ['Amper', 'E-Bike', 'Električni skiro', 'Amper S45', '', 'Električni', 'Elektromotor', 'zobati jermen'],
            ],
        },
        gospodarska: {
            sheetName: 'Gospodarska',
            fileName: 'predloga_gospodarska.xlsx',
            notes: 'OPOMBA: Fuel Type: Diesel|Petrol|Electric|CNG|LPG. Za Electric vozila izpustite Fuel Consumption. Capacity: max 20 znakov (npr. 3500kg). Stolpci z (opcijsko) niso obvezni.',
            headers: [
                'Brand',
                'Model',
                'Type',
                'Trim',
                'Fuel Type',
                'Fuel Consumption (l/100km) (opcijsko)',
                'Capacity (opcijsko)',
            ],
            examples: [
                ['Mercedes-Benz', 'Sprinter', 'Dostavna', '314 CDI', 'Diesel', 8.4, '3500kg'],
                ['Volkswagen', 'e-Crafter', 'Dostavna', 'e-Crafter 35', 'Electric', '', '3500kg'],
            ],
        },
        plovila: {
            sheetName: 'Plovila',
            fileName: 'predloga_plovila.xlsx',
            notes: 'OPOMBA: Stolpci so Znamka, Model, Različica, Vrsta, Kategorija. Vrsta = tip plovila (Čolni, Jadrnice …). Kategorija = podkategorija (Walkaround, Flybridge, Enotrupna …). Različica = ime variante (privzeto enako modelu).',
            headers: [
                'Znamka',
                'Model',
                'Različica',
                'Vrsta',
                'Kategorija',
            ],
            examples: [
                ['Azimut', 'Atlantis 45', 'Atlantis 45', 'Čolni', 'Športna jahta'],
                ['Bavaria', 'C38', 'C38', 'Jadrnice', 'Enotrupna'],
                ['Bali', '4.2', 'Bali 4.2', 'Jadrnice', 'Jadralni katamaran'],
            ],
        },
        izvenkrmni: {
            sheetName: 'Izvenkrmni motorji',
            fileName: 'predloga_izvenkrmni.xlsx',
            notes: 'OPOMBA: Stolpci so Znamka, Model, KM, Različica. KM = konjska moč (število). Za električne motorje pustite KM prazno ali vnesite nazivno moč v KM.',
            headers: [
                'Znamka',
                'Model',
                'KM',
                'Različica',
            ],
            examples: [
                ['Yamaha', 'F40', 40, 'F40'],
                ['Mercury', 'F150', 150, 'F150'],
                ['ePropulsion', 'Spirit 1.0', '', 'Spirit 1.0 Plus'],
            ],
        },
    };

    const tpl = TEMPLATES[cat];
    if (!tpl) { showToast('Neznana kategorija.', 'error'); return; }

    const rows = [];
    // Row 0: notes hint row
    rows.push([tpl.notes, ...Array(tpl.headers.length - 1).fill('')]);
    // Row 1: column headers
    rows.push(tpl.headers);
    // Rows 2+: example data
    tpl.examples.forEach(ex => rows.push(ex));

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Style header row (row index 1) — Pro XLSX compatibility
    tpl.headers.forEach((_, ci) => {
        const cellAddr = XLSX.utils.encode_cell({ r: 1, c: ci });
        if (!ws[cellAddr]) ws[cellAddr] = { v: tpl.headers[ci], t: 's' };
        ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'DCE6F1' } } };
    });

    // Set column widths for readability
    ws['!cols'] = tpl.headers.map(() => ({ wch: 22 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tpl.sheetName);
    XLSX.writeFile(wb, tpl.fileName);
}

// ── Static taxonomy reference lists ──────────────────────────────────────────

// ── 5. FEATURED / SPONSORED ───────────────────────────────────────────────────
async function renderFeatured() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Sponzorirani in izpostavljeni oglasi</h3>
        </div>
        <div class="adm-table-wrap" id="featured-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    try {
        const { docs } = await getAllListings({}, 100);
        const featured = docs.filter(l => l.promotion?.tier && l.promotion.tier !== 'free');
        const wrap = document.getElementById('featured-table');
        if (!featured.length) { wrap.innerHTML = '<div class="adm-empty">Ni sponzoriranih oglasov.</div>'; return; }
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>Oglas</th><th>Tip</th><th>Aktiviran</th><th>Poteče</th><th>Akcije</th></tr></thead>
            <tbody>
              ${featured.map(l => `
                <tr>
                  <td><strong>${escHtml(l.make || '')} ${escHtml(l.model || '')}</strong></td>
                  <td>${tierBadge(l.promotion?.tier)}</td>
                  <td class="adm-sub">${fmtDate(l.promotion?.activatedAt)}</td>
                  <td class="adm-sub">${l.promotion?.expiresAt ? fmtDate(l.promotion.expiresAt) : '∞'}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__featRemove('${l.id}')">Odstrani</button>
                    <button class="adm-btn adm-btn-xs" onclick="window.__featEdit('${l.id}')">Uredi</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        window.__featRemove = id => confirmAction('Odstraniti sponzoring?', async () => {
            await adminSetFeatured(id, 'free', 0);
            showToast('Sponzoring odstranjen.', 'success');
            renderFeatured();
        });
        window.__featEdit = id => openFeaturedModal(id);
    } catch (e) {
        document.getElementById('featured-table').innerHTML = errBox(e);
    }
}

// ── 6. REPORTS ────────────────────────────────────────────────────────────────
async function renderReports() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Prijavljeni oglasi</h3>
          <select id="report-filter" class="adm-select">
            <option value="">Vsa poročila</option>
            <option value="open">Odprta</option>
            <option value="resolved">Rešena</option>
            <option value="dismissed">Zavrnjena</option>
          </select>
        </div>
        <div class="adm-table-wrap" id="reports-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    document.getElementById('report-filter').addEventListener('change', e => loadReportsTable(e.target.value));
    loadReportsTable('');
}

async function loadReportsTable(status) {
    const wrap = document.getElementById('reports-table');
    if (!wrap) return;
    wrap.innerHTML = '<div class="adm-loading"><div class="adm-spinner"></div></div>';
    try {
        const reports = await getReports(status || null);
        if (!reports.length) { wrap.innerHTML = '<div class="adm-empty">Ni poročil.</div>'; return; }
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>Oglas ID</th><th>Razlog</th><th>Prijavil</th><th>Datum</th><th>Status</th><th>Akcije</th></tr></thead>
            <tbody>
              ${reports.map(r => `
                <tr>
                  <td class="adm-sub">${escHtml(r.listingId || '—')}</td>
                  <td>${reasonBadge(r.reason)}</td>
                  <td class="adm-sub">${escHtml(r.reporterName || r.reporterId?.slice(0,8) || '—')}</td>
                  <td class="adm-sub">${fmtDate(r.createdAt)}</td>
                  <td>${reportStatusBadge(r.status)}</td>
                  <td class="adm-actions">
                    ${r.status === 'open' ? `
                      <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__repResolve('${r.id}','remove')">Odstrani oglas</button>
                      <button class="adm-btn adm-btn-xs" onclick="window.__repResolve('${r.id}','dismiss')">Zavrni</button>
                    ` : '<span class="adm-sub">Zaključeno</span>'}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        window.__repResolve = async (id, action) => {
            await resolveReport(id, action);
            showToast(action === 'dismiss' ? 'Poročilo zavrnjeno.' : 'Oglas odstranjen.', 'success');
            loadReportsTable(status);
        };
    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── Dražbe (auctions) ──────────────────────────────────────────────────────────
async function renderDrazbe() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Dražbe</h3>
          <span class="adm-sub">Backend (samodejno zaprtje, e-pošta, plačila) je še v pripravi — glej docs/AUCTIONS_HANDOFF.md</span>
        </div>
        <div class="adm-table-wrap" id="drazbe-table"><div class="adm-loading"><div class="adm-spinner"></div></div></div>
      </div>
      <div class="adm-card" style="margin-top:1.25rem;">
        <div class="adm-card-header"><h3>Prijave na obvestila (newsletter)</h3></div>
        <div class="adm-table-wrap" id="drazbe-alerts"><div class="adm-loading"><div class="adm-spinner"></div></div></div>
      </div>`;
    loadDrazbeTable();
    loadAlertsTable();
}

function auctionStatusBadge(s) {
    const map = {
        active:   ['Aktivna', 'adm-badge-green'],
        paused:   ['Pavza',   'adm-badge-yellow'],
        ended:    ['Zaključena', 'adm-badge'],
        cancelled:['Preklicana', 'adm-badge-red'],
    };
    const [label, cls] = map[s] || [s || '—', 'adm-badge'];
    return `<span class="adm-badge ${cls}">${label}</span>`;
}

async function loadDrazbeTable() {
    const wrap = document.getElementById('drazbe-table');
    if (!wrap) return;
    try {
        const auctions = await getAdminAuctions();
        if (!auctions.length) { wrap.innerHTML = '<div class="adm-empty">Ni dražb.</div>'; return; }
        const eur = n => (Number(n) || 0).toLocaleString('sl-SI') + ' €';
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>Oglas ID</th><th>Izklicna</th><th>Trenutna</th><th>Ponudb</th><th>Konec</th><th>Status</th><th>Akcije</th></tr></thead>
            <tbody>
              ${auctions.map(a => `
                <tr>
                  <td class="adm-sub"><a href="#/drazba?id=${a.listingId}" target="_blank">${escHtml(a.listingId)}</a></td>
                  <td class="adm-sub">${eur(a.startPriceEur)}</td>
                  <td><strong>${eur(a.currentBidEur)}</strong></td>
                  <td class="adm-sub">🔨 ${a.bidCount || 0} · 👤 ${a.bidderCount || 0}</td>
                  <td class="adm-sub">${fmtDate(a.endsAt)}</td>
                  <td>${auctionStatusBadge(a.status)}</td>
                  <td class="adm-actions">
                    <button class="adm-btn adm-btn-xs" onclick="window.__aucBids('${a.listingId}')">Ponudbe</button>
                    ${a.status === 'active'
                        ? `<button class="adm-btn adm-btn-xs adm-btn-yellow" onclick="window.__aucStatus('${a.listingId}','paused')">Pavza</button>
                           <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__aucClose('${a.listingId}')">Zaključi</button>`
                        : a.status === 'paused'
                            ? `<button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__aucStatus('${a.listingId}','active')">Aktiviraj</button>`
                            : '<span class="adm-sub">—</span>'}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        window.__aucStatus = async (id, status) => {
            await adminSetAuctionStatus(id, status);
            await addAuditLog(_adminUser.uid, _adminUser.displayName || _adminUser.email, 'auction_status', id, { status });
            showToast('Status dražbe posodobljen.', 'success');
            loadDrazbeTable();
        };
        window.__aucClose = async (id) => {
            if (!confirm('Zaključim to dražbo in določim zmagovalca po najvišji ponudbi?')) return;
            await adminForceCloseAuction(id);
            await addAuditLog(_adminUser.uid, _adminUser.displayName || _adminUser.email, 'auction_close', id, {});
            showToast('Dražba zaključena.', 'success');
            loadDrazbeTable();
        };
        window.__aucBids = async (id) => {
            const bids = await getAdminAuctionBids(id);
            alert(bids.length
                ? bids.map(b => `${b.bidderName || b.bidderId?.slice(0,6)} — ${(Number(b.amountEur)||0).toLocaleString('sl-SI')} €`).join('\n')
                : 'Ni ponudb.');
        };
    } catch (e) { wrap.innerHTML = errBox(e); }
}

async function loadAlertsTable() {
    const wrap = document.getElementById('drazbe-alerts');
    if (!wrap) return;
    try {
        const alerts = await getAuctionAlertsAdmin();
        if (!alerts.length) { wrap.innerHTML = '<div class="adm-empty">Ni prijav.</div>'; return; }
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>E-pošta</th><th>Zanima</th><th>Datum</th></tr></thead>
            <tbody>
              ${alerts.map(a => `
                <tr>
                  <td>${escHtml(a.email || '—')}</td>
                  <td class="adm-sub">${escHtml(a.criteria?.interest || '—')}</td>
                  <td class="adm-sub">${fmtDate(a.createdAt)}</td>
                </tr>`).join('')}
            </tbody>
          </table>`;
    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── 7. ANALYTICS ──────────────────────────────────────────────────────────────
async function renderAnalytics() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-kpi-grid" id="ana-kpis">
        <div class="adm-loading" style="grid-column:1/-1"><div class="adm-spinner"></div></div>
      </div>
      <div class="adm-grid-2">
        <div class="adm-card">
          <div class="adm-card-header"><h3>Oglasi po dnevih (30 dni)</h3></div>
          <canvas id="ana-chart-listings" height="180"></canvas>
        </div>
        <div class="adm-card">
          <div class="adm-card-header"><h3>Top znamke</h3></div>
          <canvas id="ana-chart-brands" height="180"></canvas>
        </div>
      </div>
      <div class="adm-card">
        <div class="adm-card-header"><h3>Iskalna analitika (zadnje poizvedbe)</h3></div>
        <div class="adm-table-wrap" id="ana-search-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    try {
        const [stats, chartData30, topBrands, searchLogs] = await Promise.all([
            getDashboardStats(), getListingsByDay(30),
            getTopBrands(8), getSearchAnalytics(20),
        ]);

        document.getElementById('ana-kpis').innerHTML = `
          ${kpi('Skupaj oglasov', stats.totalListings, '📋', 'blue')}
          ${kpi('Aktivni', stats.activeCount, '✅', 'green')}
          ${kpi('Novih danes', stats.newToday, '🆕', 'orange')}
          ${kpi('Skupaj uporabnikov', stats.totalUsers, '👥', 'purple')}`;

        // Listings chart
        if (typeof Chart !== 'undefined') {
            if (_chart) { _chart.destroy(); _chart = null; }
            const ctx1 = document.getElementById('ana-chart-listings');
            if (ctx1) {
                _chart = new Chart(ctx1, {
                    type: 'line',
                    data: {
                        labels: chartData30.map(d => d.date.slice(5)),
                        datasets: [{ label: 'Oglasi', data: chartData30.map(d => d.count),
                            borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)',
                            tension: 0.3, fill: true, pointRadius: 3 }],
                    },
                    options: { responsive: true, plugins: { legend: { display: false } },
                               scales: { y: { beginAtZero: true } } },
                });
            }
            const ctx2 = document.getElementById('ana-chart-brands');
            if (ctx2 && topBrands.length) {
                new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: topBrands.map(b => b.name),
                        datasets: [{ data: topBrands.map(b => b.count),
                            backgroundColor: ['#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2','#ca8a04','#9333ea'] }],
                    },
                    options: { responsive: true, plugins: { legend: { position: 'right' } } },
                });
            }
        }

        // Search analytics table
        const searchWrap = document.getElementById('ana-search-table');
        if (!searchLogs.length) {
            searchWrap.innerHTML = '<div class="adm-empty">Ni podatkov o iskanjih.</div>';
        } else {
            searchWrap.innerHTML = `
              <table class="adm-table">
                <thead><tr><th>Poizvedba</th><th>Kategorija</th><th>Število iskanj</th><th>Brez rezultatov</th></tr></thead>
                <tbody>
                  ${searchLogs.map(s => `
                    <tr>
                      <td><strong>${escHtml(s.query || s.id)}</strong></td>
                      <td>${escHtml(s.category || '—')}</td>
                      <td><strong>${s.count || 0}</strong></td>
                      <td>${s.noResults ? '<span class="adm-badge adm-badge-red">Da</span>' : '<span class="adm-badge adm-badge-green">Ne</span>'}</td>
                    </tr>`).join('')}
                </tbody>
              </table>`;
        }
    } catch (e) {
        document.getElementById('ana-kpis').innerHTML = errBox(e);
    }
}

// ── 8. SEO ────────────────────────────────────────────────────────────────────
async function renderSeo() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>SEO strani</h3>
          <button class="adm-btn adm-btn-primary" id="seo-add-btn">+ Dodaj stran</button>
        </div>
        <div class="adm-table-wrap" id="seo-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    document.getElementById('seo-add-btn').addEventListener('click', () => openSeoModal(null));
    loadSeoTable();
}

async function loadSeoTable() {
    const wrap = document.getElementById('seo-table');
    if (!wrap) return;
    try {
        const pages = await getSeoPages();
        if (!pages.length) { wrap.innerHTML = '<div class="adm-empty">Ni SEO strani. Dodajte prvo.</div>'; return; }
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>Slug / URL</th><th>Meta naslov</th><th>Meta opis</th><th>Akcije</th></tr></thead>
            <tbody>
              ${pages.map(p => `
                <tr>
                  <td><code>${escHtml(p.slug || '')}</code></td>
                  <td>${escHtml(p.metaTitle || '—')}</td>
                  <td class="adm-sub" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(p.metaDescription || '—')}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs" onclick="window.__seoEdit('${p.id}')">✏️ Uredi</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`;

        window.__seoEdit = id => openSeoModal(pages.find(p => p.id === id));
    } catch (e) { wrap.innerHTML = errBox(e); }
}

// ── 9. PAYMENTS ───────────────────────────────────────────────────────────────
async function renderPayments() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-kpi-grid">
        ${kpi('Skupaj transakcij', '—', '💳', 'blue')}
        ${kpi('Uspešnih', '—', '✅', 'green')}
        ${kpi('Neuspešnih', '—', '❌', 'red')}
        ${kpi('Skupni prihodek', '—', '💰', 'purple')}
      </div>
      <div class="adm-card">
        <div class="adm-card-header"><h3>Transakcije</h3></div>
        <div style="padding:2rem;text-align:center;color:#6b7280">
          <div style="font-size:3rem;margin-bottom:1rem">💳</div>
          <h4>Stripe / PayPal integracija</h4>
          <p>Za produkcijsko okolje povežite Stripe webhooks z <code>/api/stripe/webhook</code> endpointom.<br>
          Transakcije se shranjujejo v kolekcijo <code>payments</code> v Firestore.</p>
          <div class="adm-alert adm-alert-warn" style="text-align:left;margin-top:1.5rem">
            ⚠️ Stripe API ključi morajo biti nastavljeni v Firebase Cloud Functions (environment variables), ne v frontend kodi.
          </div>
        </div>
      </div>
      <div class="adm-card" style="margin-top:1rem">
        <div class="adm-card-header"><h3>Paketi</h3></div>
        <div id="pay-packages-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    try {
        const settings = await getSiteSettings();
        const pkgs = settings.packages || {};
        document.getElementById('pay-packages-wrap').innerHTML = `
          <div class="adm-pkg-grid">
            ${Object.entries(pkgs).map(([key, pkg]) => `
              <div class="adm-pkg-card">
                <div class="adm-pkg-name">${escHtml(pkg.name || key)}</div>
                <div class="adm-pkg-price">${pkg.price === 0 ? 'Brezplačno' : pkg.price + ' € / oglas'}</div>
                <ul class="adm-pkg-features">
                  <li>Do ${pkg.maxListings === 999 ? '∞' : pkg.maxListings} oglasov</li>
                  <li>${pkg.durationDays} dni veljavnosti</li>
                </ul>
              </div>`).join('')}
          </div>
          <div style="padding:1.5rem;border-top:1px solid #e5e7eb">
            <button class="adm-btn adm-btn-primary" onclick="window.__adminNav('settings')">⚙️ Uredi pakete v Nastavitvah</button>
          </div>`;
    } catch (e) {
        document.getElementById('pay-packages-wrap').innerHTML = errBox(e);
    }
}

// ── 10. MEDIA ─────────────────────────────────────────────────────────────────
async function renderMedia() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header"><h3>Upravljanje medijev</h3></div>
        <div style="padding:2rem;text-align:center;color:#6b7280">
          <div style="font-size:3rem;margin-bottom:1rem">🖼️</div>
          <p>Slike oglasov se hranijo v Firebase Storage pod <code>/listings/{userId}/</code></p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1.5rem;text-align:left">
            <div class="adm-info-card">
              <div class="adm-info-card-title">Struktura</div>
              <code style="font-size:.8rem">/listings/{uid}/{timestamp}_{rand}_{filename}</code>
            </div>
            <div class="adm-info-card">
              <div class="adm-info-card-title">Optimizacija</div>
              <p style="font-size:.85rem">Priporočena implementacija: Firebase Extensions → Resize Images (sharp)</p>
            </div>
            <div class="adm-info-card">
              <div class="adm-info-card-title">Max velikost</div>
              <p style="font-size:.85rem">Nastavljiva v Nastavitvah sistema (<code>maxImagesPerListing</code>)</p>
            </div>
          </div>
        </div>
      </div>`;
}

// ── 11. AUDIT LOG ─────────────────────────────────────────────────────────────
async function renderAudit() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header"><h3>Audit log (zadnjih 100 akcij)</h3></div>
        <div class="adm-table-wrap" id="audit-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    try {
        const logs = await getAuditLogs(100);
        const wrap = document.getElementById('audit-table');
        if (!logs.length) { wrap.innerHTML = '<div class="adm-empty">Ni logov.</div>'; return; }
        wrap.innerHTML = `
          <table class="adm-table">
            <thead><tr><th>Čas</th><th>Admin</th><th>Akcija</th><th>Target</th><th>Podrobnosti</th></tr></thead>
            <tbody>
              ${logs.map(l => `
                <tr>
                  <td class="adm-sub">${fmtDate(l.createdAt)}</td>
                  <td class="adm-sub">${escHtml(l.adminName || l.adminUid?.slice(0,8) || '—')}</td>
                  <td><code style="font-size:.8rem">${escHtml(l.action || '')}</code></td>
                  <td class="adm-sub">${escHtml(l.target || '')}</td>
                  <td class="adm-sub" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${escHtml(JSON.stringify(l.details || {}))}</td>
                </tr>`).join('')}
            </tbody>
          </table>`;
    } catch (e) {
        document.getElementById('audit-table').innerHTML = errBox(e);
    }
}

// ── 12. SETTINGS ──────────────────────────────────────────────────────────────
async function renderSettings() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header"><h3>Nastavitve sistema</h3></div>
        <div id="settings-form-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;

    try {
        const s = await getSiteSettings();
        document.getElementById('settings-form-wrap').innerHTML = `
          <form id="settings-form" style="padding:1.5rem">
            <div class="adm-form-grid">

              <div class="adm-form-section">
                <h4>Paketi</h4>
                <div class="adm-form-row">
                  <label>Premium cena (€)</label>
                  <input class="adm-input" name="premiumPrice" type="number" step="0.01" value="${s.packages?.premium?.price || 9.99}">
                </div>
                <div class="adm-form-row">
                  <label>Dealer mesečnina (€)</label>
                  <input class="adm-input" name="dealerPrice" type="number" step="0.01" value="${s.packages?.dealer?.price || 49.99}">
                </div>
                <div class="adm-form-row">
                  <label>Featured cena / dan (€)</label>
                  <input class="adm-input" name="featuredPricePerDay" type="number" step="0.01" value="${s.featuredPricePerDay || 2.99}">
                </div>
              </div>

              <div class="adm-form-section">
                <h4>Oglasi</h4>
                <div class="adm-form-row">
                  <label>Max slik / oglas</label>
                  <input class="adm-input" name="maxImagesPerListing" type="number" value="${s.maxImagesPerListing || 20}">
                </div>
                <div class="adm-form-row">
                  <label>Samodejni potek (dni)</label>
                  <input class="adm-input" name="listingAutoExpireDays" type="number" value="${s.listingAutoExpireDays || 90}">
                </div>
                <div class="adm-form-row adm-form-row--check">
                  <label>Oglasi gostov (brez prijave)</label>
                  <input type="checkbox" name="allowGuestListings" ${s.allowGuestListings ? 'checked' : ''}>
                </div>
              </div>

              <div class="adm-form-section">
                <h4>Sistem</h4>
                <div class="adm-form-row adm-form-row--check">
                  <label>Vzdrževalni način</label>
                  <input type="checkbox" name="maintenanceMode" ${s.maintenanceMode ? 'checked' : ''}>
                </div>
              </div>

            </div>
            <div style="padding-top:1.5rem;border-top:1px solid #e5e7eb;display:flex;gap:.75rem">
              <button type="submit" class="adm-btn adm-btn-primary">💾 Shrani nastavitve</button>
            </div>
          </form>`;

        document.getElementById('settings-form').addEventListener('submit', async e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const updates = {
                'packages.premium.price': parseFloat(fd.get('premiumPrice')),
                'packages.dealer.price':  parseFloat(fd.get('dealerPrice')),
                featuredPricePerDay:      parseFloat(fd.get('featuredPricePerDay')),
                maxImagesPerListing:      parseInt(fd.get('maxImagesPerListing')),
                listingAutoExpireDays:    parseInt(fd.get('listingAutoExpireDays')),
                allowGuestListings:       fd.get('allowGuestListings') === 'on',
                maintenanceMode:          fd.get('maintenanceMode') === 'on',
            };
            try {
                await updateSiteSettings(updates);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'SETTINGS_UPDATE', 'siteConfig', updates);
                showToast('Nastavitve shranjene.', 'success');
            } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
        });
    } catch (e) {
        document.getElementById('settings-form-wrap').innerHTML = errBox(e);
    }
}

// ── WEBSCRAPING: approved sources ─────────────────────────────────────────────
function scrapingCatLabel(cat) {
    return { deli: 'Deli', gume: 'Gume', oboje: 'Deli in gume' }[cat] || cat || '—';
}

async function renderWebscraping() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Webscraping — odobreni viri</h3>
          <button class="adm-btn adm-btn-primary" id="ws-add">+ Dodaj vir</button>
        </div>
        <p style="padding:0 1.5rem 1rem;color:#6b7280;font-size:.85rem;">
          Seznam domen, za katere imate <strong>pisno dovoljenje</strong> za zajem cen. Samo viri označeni z
          <em>Odobreno = DA</em> bodo zajeti, ko bo postavljen webscraping backend (gl. <code>docs/WEBSCRAPING_HANDOFF.md</code>).
        </p>
        <div class="adm-table-wrap" id="ws-table-wrap"><div class="adm-loading"><div class="adm-spinner"></div></div></div>
      </div>`;
    document.getElementById('ws-add').addEventListener('click', () => openScrapingSourceModal(null));
    loadScrapingSourcesTable();
}

async function loadScrapingSourcesTable() {
    const wrap = document.getElementById('ws-table-wrap');
    if (!wrap) return;
    try {
        const sources = await getScrapingSources();
        if (!sources.length) {
            wrap.innerHTML = `<div style="padding:2.5rem;text-align:center;color:#9ca3af;">Ni dodanih virov. Kliknite "+ Dodaj vir".</div>`;
            return;
        }
        wrap.innerHTML = `<table class="adm-table">
          <thead><tr><th>Domena</th><th>Naziv</th><th>Kategorija</th><th>Odobreno</th><th>Status</th><th>Zadnji zajem</th><th>Akcije</th></tr></thead>
          <tbody>
            ${sources.map(s => `<tr>
              <td><strong>${escHtml(s.domain || '')}</strong></td>
              <td style="font-size:.85rem">${escHtml(s.name || '—')}</td>
              <td>${scrapingCatLabel(s.category)}</td>
              <td>${s.approved ? '<span class="adm-badge adm-badge-green">DA</span>' : '<span class="adm-badge adm-badge-gray">NE</span>'}</td>
              <td>${s.status === 'paused' ? '<span class="adm-badge adm-badge-gray">Pavza</span>' : '<span class="adm-badge adm-badge-blue">Aktiven</span>'}</td>
              <td style="font-size:.8rem">${s.lastScrapedAt ? fmtDate(s.lastScrapedAt) : '—'}</td>
              <td style="white-space:nowrap">
                <button class="adm-btn adm-btn-xs" data-edit="${s.id}">Uredi</button>
                <button class="adm-btn adm-btn-xs ${s.approved ? '' : 'adm-btn-green'}" data-toggle="${s.id}">${s.approved ? 'Prekliči' : 'Odobri'}</button>
                <button class="adm-btn adm-btn-xs adm-btn-red" data-del="${s.id}">Izbriši</button>
              </td>
            </tr>`).join('')}
          </tbody></table>`;

        wrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
            openScrapingSourceModal(sources.find(x => x.id === b.dataset.edit))));

        wrap.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', async () => {
            const s = sources.find(x => x.id === b.dataset.toggle);
            try {
                await updateScrapingSource(s.id, { approved: !s.approved });
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'SCRAPING_SOURCE_APPROVE', s.domain, { approved: !s.approved });
                showToast('Posodobljeno.', 'success');
                loadScrapingSourcesTable();
            } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
        }));

        wrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
            const s = sources.find(x => x.id === b.dataset.del);
            if (!confirm(`Izbrišem vir "${s.domain}"?`)) return;
            try {
                await deleteScrapingSource(s.id);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'SCRAPING_SOURCE_DELETE', s.domain);
                showToast('Izbrisano.', 'success');
                loadScrapingSourcesTable();
            } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
        }));
    } catch (e) {
        wrap.innerHTML = errBox(e);
    }
}

function openScrapingSourceModal(src) {
    openModal(src ? 'Uredi vir' : 'Dodaj vir', `
      <div class="adm-form-row"><label>Domena *</label>
        <input id="ws-domain" class="adm-input" value="${escHtml(src?.domain || '')}" placeholder="npr. rezervni-deli.si"></div>
      <div class="adm-form-row"><label>Naziv trgovine</label>
        <input id="ws-name" class="adm-input" value="${escHtml(src?.name || '')}" placeholder="npr. Rezervni Deli d.o.o."></div>
      <div class="adm-form-row"><label>Osnovni URL</label>
        <input id="ws-url" class="adm-input" value="${escHtml(src?.baseUrl || '')}" placeholder="https://www.rezervni-deli.si"></div>
      <div class="adm-form-row"><label>Kategorija</label>
        <select id="ws-cat" class="adm-select">
          <option value="oboje" ${src?.category === 'oboje' ? 'selected' : ''}>Deli in gume</option>
          <option value="deli"  ${src?.category === 'deli' ? 'selected' : ''}>Deli</option>
          <option value="gume"  ${src?.category === 'gume' ? 'selected' : ''}>Gume</option>
        </select></div>
      <div class="adm-form-row"><label>Opomba o dovoljenju</label>
        <textarea id="ws-note" class="adm-input" rows="2" placeholder="npr. pisno dovoljenje 2026-05">${escHtml(src?.permissionNote || '')}</textarea></div>
      <div class="adm-form-row adm-form-row--check"><label>Odobreno za zajem</label>
        <input type="checkbox" id="ws-approved" ${src?.approved ? 'checked' : ''}></div>
      <div class="adm-form-row adm-form-row--check"><label>Na pavzi</label>
        <input type="checkbox" id="ws-paused" ${src?.status === 'paused' ? 'checked' : ''}></div>
    `, async (el) => {
        const domain = document.getElementById('ws-domain').value.trim();
        if (!domain) { showToast('Domena je obvezna.', 'error'); return; }
        const data = {
            domain,
            name: document.getElementById('ws-name').value,
            baseUrl: document.getElementById('ws-url').value,
            category: document.getElementById('ws-cat').value,
            permissionNote: document.getElementById('ws-note').value,
            approved: document.getElementById('ws-approved').checked,
            status: document.getElementById('ws-paused').checked ? 'paused' : 'active',
        };
        try {
            if (src) {
                await updateScrapingSource(src.id, data);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'SCRAPING_SOURCE_UPDATE', domain, data);
            } else {
                await createScrapingSource(data);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'SCRAPING_SOURCE_CREATE', domain, data);
            }
            showToast(src ? 'Vir posodobljen.' : 'Vir dodan.', 'success');
            el.remove();
            loadScrapingSourcesTable();
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

// ── CATALOG: price-comparison products (manual ingestion) ─────────────────────
function parseOffersText(text) {
    return String(text || '').split('\n').map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 3 || !parts[0]) return null;
        const [shop, domain, price, url] = parts;
        return { shop, domain, price: Number(String(price).replace(/[^0-9.]/g, '')) || 0, url: url || '', inStock: true };
    }).filter(Boolean);
}
function offersToText(offers = []) {
    return offers.map(o => `${o.shop || ''} | ${o.domain || ''} | ${o.price ?? ''} | ${o.url || ''}`).join('\n');
}

async function renderCatalog() {
    const c = document.getElementById('adm-content');
    c.innerHTML = `
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Katalog izdelkov (cenik)</h3>
          <button class="adm-btn adm-btn-primary" id="cat-add">+ Dodaj izdelek</button>
        </div>
        <p style="padding:0 1.5rem 1rem;color:#6b7280;font-size:.85rem;">
          Ročni vnos izdelkov in ponudb trgovin za primerjavo cen ("od X€"). Do vzpostavitve webscraping backenda
          se na strani <em>Gume in deli</em> prikazujejo mock + ročno vneseni izdelki.
        </p>
        <div class="adm-table-wrap" id="cat-table-wrap"><div class="adm-loading"><div class="adm-spinner"></div></div></div>
      </div>`;
    document.getElementById('cat-add').addEventListener('click', () => openCatalogModal(null));
    loadCatalogTable();
}

async function loadCatalogTable() {
    const wrap = document.getElementById('cat-table-wrap');
    if (!wrap) return;
    try {
        const products = await getCatalogProductsAdmin();
        if (!products.length) {
            wrap.innerHTML = `<div style="padding:2.5rem;text-align:center;color:#9ca3af;">Ni ročno vnesenih izdelkov. (Na strani Gume in deli so vseeno vidni mock izdelki.)</div>`;
            return;
        }
        wrap.innerHTML = `<table class="adm-table">
          <thead><tr><th>Naziv</th><th>Tip</th><th>Vozilo</th><th>Najnižja cena</th><th>Ponudbe</th><th>Status</th><th>Akcije</th></tr></thead>
          <tbody>
            ${products.map(p => `<tr>
              <td><strong>${escHtml(p.title || '')}</strong><br><small style="color:#6b7280">${escHtml(p.brand || '')}</small></td>
              <td>${p.itemType === 'tire' ? 'Guma' : 'Del'}</td>
              <td style="font-size:.8rem">${escHtml(p.vehicleCategory || '')}</td>
              <td>${p.lowestPrice != null ? fmtPrice(p.lowestPrice) : '—'}</td>
              <td>${p.offerCount ?? (p.offers || []).length}</td>
              <td>${p.status === 'hidden' ? '<span class="adm-badge adm-badge-gray">Skrit</span>' : '<span class="adm-badge adm-badge-green">Aktiven</span>'}</td>
              <td style="white-space:nowrap">
                <button class="adm-btn adm-btn-xs" data-edit="${p.id}">Uredi</button>
                <button class="adm-btn adm-btn-xs adm-btn-red" data-del="${p.id}">Izbriši</button>
              </td>
            </tr>`).join('')}
          </tbody></table>`;

        wrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
            openCatalogModal(products.find(x => x.id === b.dataset.edit))));
        wrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
            const p = products.find(x => x.id === b.dataset.del);
            if (!confirm(`Izbrišem izdelek "${p.title}"?`)) return;
            try {
                await deleteCatalogProduct(p.id);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'CATALOG_DELETE', p.title);
                showToast('Izbrisano.', 'success');
                loadCatalogTable();
            } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
        }));
    } catch (e) {
        wrap.innerHTML = errBox(e);
    }
}

function openCatalogModal(prod) {
    const a = prod?.attributes || {};
    openModal(prod ? 'Uredi izdelek' : 'Dodaj izdelek', `
      <div class="adm-form-row"><label>Naziv *</label>
        <input id="cat-title" class="adm-input" value="${escHtml(prod?.title || '')}" placeholder="npr. Michelin Primacy 4 205/55 R16"></div>
      <div class="adm-form-row"><label>Znamka</label>
        <input id="cat-brand" class="adm-input" value="${escHtml(prod?.brand || '')}" placeholder="npr. Michelin"></div>
      <div class="adm-form-row"><label>Tip</label>
        <select id="cat-type" class="adm-select">
          <option value="part" ${prod?.itemType === 'part' ? 'selected' : ''}>Del</option>
          <option value="tire" ${prod?.itemType === 'tire' ? 'selected' : ''}>Guma</option>
        </select></div>
      <div class="adm-form-row"><label>Vozilo</label>
        <select id="cat-vehcat" class="adm-select">
          <option value="avto"        ${prod?.vehicleCategory === 'avto' ? 'selected' : ''}>Avtomobili</option>
          <option value="moto"        ${prod?.vehicleCategory === 'moto' ? 'selected' : ''}>Motorna kolesa</option>
          <option value="gospodarska" ${prod?.vehicleCategory === 'gospodarska' ? 'selected' : ''}>Gospodarska</option>
          <option value="prosti-cas"  ${prod?.vehicleCategory === 'prosti-cas' ? 'selected' : ''}>Prosti čas</option>
        </select></div>
      <div class="adm-form-row"><label>Slika (URL)</label>
        <input id="cat-img" class="adm-input" value="${escHtml(prod?.imageUrl || '')}" placeholder="https://…"></div>

      <div class="adm-form-row"><label>Atributi gume: dimenzija</label>
        <input id="cat-size" class="adm-input" value="${escHtml(a.size || '')}" placeholder="205/55 R16"></div>
      <div class="adm-form-row"><label>Atributi gume: sezona</label>
        <select id="cat-season" class="adm-select">
          <option value="">—</option>
          <option value="letne"     ${a.season === 'letne' ? 'selected' : ''}>Letne</option>
          <option value="zimske"    ${a.season === 'zimske' ? 'selected' : ''}>Zimske</option>
          <option value="celoletne" ${a.season === 'celoletne' ? 'selected' : ''}>Celoletne</option>
        </select></div>
      <div class="adm-form-row"><label>Atributi dela: sklop / vrsta / OEM</label>
        <input id="cat-pgroup" class="adm-input" style="margin-bottom:.4rem" value="${escHtml(a.partGroup || '')}" placeholder="sklop (npr. zavore)">
        <input id="cat-ptype"  class="adm-input" style="margin-bottom:.4rem" value="${escHtml(a.partType || '')}" placeholder="vrsta (npr. ploscice)">
        <input id="cat-oem"    class="adm-input" value="${escHtml(a.oemNumber || '')}" placeholder="OEM številka"></div>

      <div class="adm-form-row"><label>Ponudbe trgovin (1 vrstica = Naziv | domena | cena | url)</label>
        <textarea id="cat-offers" class="adm-input" rows="5" placeholder="Pnevmatike24 | pnevmatike24.si | 89 | https://...">${escHtml(offersToText(prod?.offers))}</textarea></div>
      <div class="adm-form-row adm-form-row--check"><label>Skrij izdelek</label>
        <input type="checkbox" id="cat-hidden" ${prod?.status === 'hidden' ? 'checked' : ''}></div>
    `, async (el) => {
        const title = document.getElementById('cat-title').value.trim();
        if (!title) { showToast('Naziv je obvezen.', 'error'); return; }
        const itemType = document.getElementById('cat-type').value;
        const attributes = itemType === 'tire'
            ? { size: document.getElementById('cat-size').value.trim(), season: document.getElementById('cat-season').value }
            : {
                partGroup: document.getElementById('cat-pgroup').value.trim(),
                partType: document.getElementById('cat-ptype').value.trim(),
                oemNumber: document.getElementById('cat-oem').value.trim(),
            };
        const data = {
            title,
            brand: document.getElementById('cat-brand').value.trim(),
            itemType,
            vehicleCategory: document.getElementById('cat-vehcat').value,
            imageUrl: document.getElementById('cat-img').value.trim(),
            attributes,
            offers: parseOffersText(document.getElementById('cat-offers').value),
            status: document.getElementById('cat-hidden').checked ? 'hidden' : 'active',
        };
        try {
            if (prod) {
                await updateCatalogProduct(prod.id, data);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'CATALOG_UPDATE', title, { offers: data.offers.length });
            } else {
                await createCatalogProduct(data);
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'CATALOG_CREATE', title, { offers: data.offers.length });
            }
            showToast(prod ? 'Izdelek posodobljen.' : 'Izdelek dodan.', 'success');
            el.remove();
            loadCatalogTable();
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

// ══════════════════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════════════════

function openModal(title, bodyHtml, onConfirm = null) {
    document.getElementById('adm-modal-overlay')?.remove();
    const el = document.createElement('div');
    el.id = 'adm-modal-overlay';
    el.className = 'adm-modal-overlay';
    el.innerHTML = `
      <div class="adm-modal">
        <div class="adm-modal-header">
          <h3>${escHtml(title)}</h3>
          <button class="adm-modal-close" id="adm-modal-close">✕</button>
        </div>
        <div class="adm-modal-body">${bodyHtml}</div>
        ${onConfirm ? `<div class="adm-modal-footer">
          <button class="adm-btn" id="adm-modal-cancel">Prekliči</button>
          <button class="adm-btn adm-btn-primary" id="adm-modal-confirm">Potrdi</button>
        </div>` : ''}
      </div>`;
    document.body.appendChild(el);

    const close = () => el.remove();
    el.addEventListener('click', e => { if (e.target === el) close(); });
    document.getElementById('adm-modal-close').addEventListener('click', close);
    document.getElementById('adm-modal-cancel')?.addEventListener('click', close);
    if (onConfirm) {
        document.getElementById('adm-modal-confirm').addEventListener('click', () => {
            onConfirm(el);
        });
    }
    return el;
}

function openRejectModal(listingId) {
    const el = openModal('Zavrni oglas', `
      <div class="adm-form-row">
        <label>Razlog zavrnitve</label>
        <textarea id="reject-reason" class="adm-input" rows="3" placeholder="Npr. Napačni podatki, spam, previsoka cena…"></textarea>
      </div>`, async (modalEl) => {
        const reason = document.getElementById('reject-reason').value;
        await adminUpdateListingStatus(listingId, 'rejected', reason);
        await addAuditLog(_adminUser.uid, _adminUser.displayName, 'LISTING_REJECTED', listingId, { reason });
        showToast('Oglas zavrnjen.', 'success');
        modalEl.remove();
        if (_activeSection === 'listings') loadListingsTable();
        if (_activeSection === 'dashboard') renderDashboard();
    });
}

function openFeaturedModal(listingId) {
    openModal('Nastavi sponzoring', `
      <div class="adm-form-row">
        <label>Tip sponzoringa</label>
        <select id="feat-tier" class="adm-select">
          <option value="homepage">Homepage (premium)</option>
          <option value="sponsored">Sponsored (top)</option>
          <option value="free">Odstrani sponzoring</option>
        </select>
      </div>
      <div class="adm-form-row">
        <label>Trajanje (dni)</label>
        <input id="feat-days" type="number" class="adm-input" value="7" min="1" max="365">
      </div>`, async (el) => {
        const tier = document.getElementById('feat-tier').value;
        const days = parseInt(document.getElementById('feat-days').value) || 7;
        await adminSetFeatured(listingId, tier, days);
        await addAuditLog(_adminUser.uid, _adminUser.displayName, 'LISTING_FEATURED', listingId, { tier, days });
        showToast('Sponzoring nastavljen.', 'success');
        el.remove();
    });
}

function openBrandModal(brand) {
    openModal(brand ? 'Uredi znamko' : 'Dodaj znamko', `
      <div class="adm-form-row"><label>Ime znamke</label>
        <input id="brand-name" class="adm-input" value="${escHtml(brand?.name || '')}" placeholder="npr. BMW">
      </div>
      <div class="adm-form-row"><label>Kategorija</label>
        <select id="brand-cat" class="adm-select">
          <option value="avto"         ${brand?.category === 'avto'         ? 'selected' : ''}>Avto</option>
          <option value="moto"         ${brand?.category === 'moto'         ? 'selected' : ''}>Moto</option>
          <option value="gospodarska"  ${brand?.category === 'gospodarska'  ? 'selected' : ''}>Gospodarska</option>
          <option value="deli"         ${brand?.category === 'deli'         ? 'selected' : ''}>Deli in oprema</option>
          <option value="pnevmatike"   ${brand?.category === 'pnevmatike'   ? 'selected' : ''}>Pnevmatike in platišča</option>
        </select>
      </div>`, async (el) => {
        const name = document.getElementById('brand-name').value.trim();
        const cat  = document.getElementById('brand-cat').value;
        if (!name) { showToast('Ime je obvezno.', 'error'); return; }
        try {
            if (brand) {
                await updateBrand(brand.id, { name, category: cat });
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'BRAND_UPDATE', brand.id, { name, cat });
            } else {
                const id = await createBrand({ name, category: cat });
                await addAuditLog(_adminUser.uid, _adminUser.displayName, 'BRAND_CREATE', id, { name, cat });
            }
            showToast(brand ? 'Znamka posodobljena.' : 'Znamka dodana.', 'success');
            el.remove();
            loadBrandsTable('');
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

function openModelModal(model, brands, defaultBrandId) {
    openModal(model ? 'Uredi model' : 'Dodaj model', `
      <div class="adm-form-row"><label>Znamka</label>
        <select id="model-brand" class="adm-select">
          ${brands.map(b => `<option value="${b.id}" data-name="${escHtml(b.name)}" ${(model?.brandId ?? defaultBrandId) === b.id ? 'selected' : ''}>${escHtml(b.name)}</option>`).join('')}
        </select>
      </div>
      <div class="adm-form-row"><label>Ime modela</label>
        <input id="model-name" class="adm-input" value="${escHtml(model?.name || '')}" placeholder="npr. X5">
      </div>`, async (el) => {
        const brandSel = document.getElementById('model-brand');
        const brandId   = brandSel.value;
        const brandName = brandSel.selectedOptions[0]?.dataset.name || '';
        const name = document.getElementById('model-name').value.trim();
        if (!name || !brandId) { showToast('Vsa polja so obvezna.', 'error'); return; }
        try {
            if (model) {
                await updateModel(model.id, { name, brandId, brandName });
            } else {
                await createModel({ name, brandId, brandName, category: brands.find(b => b.id === brandId)?.category || 'avto' });
            }
            showToast(model ? 'Model posodobljen.' : 'Model dodan.', 'success');
            el.remove();
            const filter = document.getElementById('model-brand-filter')?.value || '';
            loadModelsTable(filter, brands);
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

function openRoleModal(uid, users) {
    const u = users.find(x => x.id === uid);
    openModal('Nastavi vlogo', `
      <div class="adm-form-row"><label>Vloga za ${escHtml(u?.displayName || u?.email || uid)}</label>
        <select id="role-select" class="adm-select">
          <option value="user"      ${u?.role === 'user'      ? 'selected' : ''}>Uporabnik</option>
          <option value="dealer"    ${u?.role === 'dealer'    ? 'selected' : ''}>Dealer</option>
          <option value="editor"    ${u?.role === 'editor'    ? 'selected' : ''}>Urednik</option>
          <option value="moderator" ${u?.role === 'moderator' ? 'selected' : ''}>Moderator</option>
          <option value="admin"     ${u?.role === 'admin'     ? 'selected' : ''}>Administrator</option>
        </select>
      </div>`, async (el) => {
        const role = document.getElementById('role-select').value;
        try {
            await adminUpdateUserRole(uid, role);
            await addAuditLog(_adminUser.uid, _adminUser.displayName, 'USER_ROLE_CHANGE', uid, { role });
            showToast('Vloga posodobljena.', 'success');
            el.remove();
            renderUsers();
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

function openSeoModal(page) {
    openModal(page ? 'Uredi SEO stran' : 'Dodaj SEO stran', `
      <div class="adm-form-row"><label>Slug (URL pot)</label>
        <input id="seo-slug" class="adm-input" value="${escHtml(page?.slug || '')}" placeholder="npr. /bmw/x5">
      </div>
      <div class="adm-form-row"><label>Meta naslov</label>
        <input id="seo-title" class="adm-input" value="${escHtml(page?.metaTitle || '')}" placeholder="BMW X5 rabljeni — MojAvto.si">
      </div>
      <div class="adm-form-row"><label>Meta opis</label>
        <textarea id="seo-desc" class="adm-input" rows="3" placeholder="Opisi, ki se prikazujejo v Googlu…">${escHtml(page?.metaDescription || '')}</textarea>
      </div>`, async (el) => {
        const slug  = document.getElementById('seo-slug').value.trim();
        const title = document.getElementById('seo-title').value.trim();
        const desc  = document.getElementById('seo-desc').value.trim();
        if (!slug) { showToast('Slug je obvezen.', 'error'); return; }
        try {
            await upsertSeoPage(slug, { metaTitle: title, metaDescription: desc });
            showToast('SEO stran shranjena.', 'success');
            el.remove();
            loadSeoTable();
        } catch (err) { showToast('Napaka: ' + err.message, 'error'); }
    });
}

function confirmAction(msg, onConfirm) {
    openModal('Potrdite akcijo', `<p style="margin:0">${escHtml(msg)}</p>`, async (el) => {
        el.remove();
        await onConfirm();
    });
}

// ── Global search ──────────────────────────────────────────────────────────────
async function onGlobalSearch(e) {
    const q = e.target.value.toLowerCase().trim();
    if (!q || q.length < 2) return;

    try {
        const { docs } = await getAllListings({}, 20);
        const results = docs.filter(l =>
            (l.make || '').toLowerCase().includes(q) ||
            (l.model || '').toLowerCase().includes(q) ||
            (l.authorName || '').toLowerCase().includes(q) ||
            (l.id || '').toLowerCase().includes(q)
        );

        if (!results.length) return;

        openModal('Rezultati iskanja: ' + q, `
          <table class="adm-table">
            <thead><tr><th>Oglas</th><th>Status</th><th>Avtor</th><th>Akcija</th></tr></thead>
            <tbody>
              ${results.map(l => `
                <tr>
                  <td><strong>${escHtml(l.make || '')} ${escHtml(l.model || '')}</strong></td>
                  <td>${statusBadge(l.status)}</td>
                  <td class="adm-sub">${escHtml(l.authorName || '—')}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs adm-btn-green" onclick="document.getElementById('adm-modal-overlay').remove();window.__lstApprove?.('${l.id}')">✓</button>
                    <button class="adm-btn adm-btn-xs adm-btn-red" onclick="document.getElementById('adm-modal-overlay').remove();window.__lstDelete?.('${l.id}')">🗑</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>`);
    } catch { /* ignore */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// UI HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function kpi(label, value, icon, color) {
    return `
      <div class="adm-kpi adm-kpi--${color}">
        <div class="adm-kpi-icon">${icon}</div>
        <div class="adm-kpi-value">${value}</div>
        <div class="adm-kpi-label">${label}</div>
      </div>`;
}

function statusBadge(status) {
    const map = {
        active:   ['Aktiven',   'green'],
        pending:  ['V pregledu','yellow'],
        rejected: ['Zavrnjen',  'red'],
        expired:  ['Potekel',   'gray'],
    };
    const [label, color] = map[status] || [status || '—', 'gray'];
    return `<span class="adm-badge adm-badge-${color}">${label}</span>`;
}

function roleBadge(role) {
    const map = {
        admin:     ['Administrator','purple'],
        moderator: ['Moderator',    'blue'],
        editor:    ['Urednik',      'teal'],
        dealer:    ['Dealer',       'orange'],
        user:      ['Uporabnik',    'gray'],
    };
    const [label, color] = map[role] || [role || 'Uporabnik', 'gray'];
    return `<span class="adm-badge adm-badge-${color}">${label}</span>`;
}

function tierBadge(tier) {
    const map = {
        sponsored: ['⭐ Sponsored', 'purple'],
        homepage:  ['🔝 Homepage',  'orange'],
        free:      ['Brezplačni',   'gray'],
    };
    const [label, color] = map[tier] || [tier || '—', 'gray'];
    return `<span class="adm-badge adm-badge-${color}">${label}</span>`;
}

function reasonBadge(reason) {
    const map = {
        scam:     ['🚨 Prevara',         'red'],
        spam:     ['📧 Spam',            'yellow'],
        wrong:    ['❌ Napačni podatki',  'orange'],
        other:    ['❓ Drugo',            'gray'],
    };
    const [label, color] = map[reason] || [escHtml(reason || '—'), 'gray'];
    return `<span class="adm-badge adm-badge-${color}">${label}</span>`;
}

function reportStatusBadge(status) {
    const map = { open: ['Odprto','red'], resolved: ['Rešeno','green'], dismissed: ['Zavrnjeno','gray'] };
    const [label, color] = map[status] || [status || '—', 'gray'];
    return `<span class="adm-badge adm-badge-${color}">${label}</span>`;
}

function fmtPrice(eur) {
    if (!eur && eur !== 0) return '—';
    return new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(eur);
}

function fmtMileage(km) {
    if (!km && km !== 0) return '—';
    return new Intl.NumberFormat('sl-SI').format(km) + ' km';
}

function fmtDate(ts) {
    if (!ts) return '—';
    const d = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function errBox(e) {
    return `<div class="adm-alert adm-alert-error">Napaka: ${escHtml(e?.message || String(e))}</div>`;
}

window.__adminNav = s => navigateTo(s);

function showToast(msg, type = 'success') {
    document.querySelector('.adm-toast')?.remove();
    const el = document.createElement('div');
    el.className = `adm-toast adm-toast--${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('adm-toast--show'), 10);
    setTimeout(() => { el.classList.remove('adm-toast--show'); setTimeout(() => el.remove(), 300); }, 3000);
}

function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
