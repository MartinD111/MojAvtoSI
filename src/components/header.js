// Header component — MojAvto.si
// Renders the nav with category pills that open the advanced search
import { onAuth, logout } from '../auth/auth.js';
import { MAIN_CATEGORIES, buildSearchUrl } from '../data/categories.js';
import { t } from '../core/i18n.js';

export function initHeader() {
  const headerEl = document.getElementById('header');

  function render(user) {
    const hash = window.location.hash;
    const cats = MAIN_CATEGORIES;
    const isSearch = hash.startsWith('#/iskanje') || hash.startsWith('#/oglasi');
    headerEl.innerHTML = `
      <div class="sticky-nav">
        <div class="nav-container">
          <div class="glass-card rounded-pill nav-inner">
            <a href="#/" class="logo-text">MojAvto<span class="logo-accent">.si</span></a>

            <nav id="navLinks" class="desktop-links">
              <!-- Oglasi — hover dropdown holding the 4 vehicle categories -->
              <div class="mega-menu-wrapper" id="oglasiMenuWrapper">
                <button type="button" class="nav-pill mega-trigger ${isSearch ? 'active-pill' : ''}" id="oglasiTrigger" aria-haspopup="true" aria-expanded="false">
                  <i data-lucide="newspaper"></i> ${t('header_listings', 'Oglasi')}
                  <i data-lucide="chevron-down" class="mega-caret"></i>
                </button>
                <div class="mega-menu" id="oglasiMega" role="menu">
                  <div class="mega-vertical-list">
                    <a href="${buildSearchUrl('avto')}" class="mega-vertical-item ${isSearch && hash.includes('cat=avto') ? 'active' : ''}" role="menuitem">
                      <i data-lucide="${cats.avto.icon}"></i> ${t(cats.avto.label)}
                    </a>
                    <a href="${buildSearchUrl('moto')}" class="mega-vertical-item ${isSearch && hash.includes('cat=moto') ? 'active' : ''}" role="menuitem">
                      <i data-lucide="${cats.moto.icon}"></i> ${t(cats.moto.label)}
                    </a>
                    <a href="${buildSearchUrl('gospodarska')}" class="mega-vertical-item ${isSearch && hash.includes('cat=gospodarska') ? 'active' : ''}" role="menuitem">
                      <i data-lucide="${cats.gospodarska.icon}"></i> ${t(cats.gospodarska.label)}
                    </a>
                    <a href="${buildSearchUrl('prosti-cas')}" class="mega-vertical-item ${isSearch && hash.includes('cat=prosti-cas') ? 'active' : ''}" role="menuitem">
                      <i data-lucide="${cats.prosti_cas.icon}"></i> ${t(cats.prosti_cas.label)}
                    </a>
                  </div>
                </div>
              </div>

              <!-- Avtohiše — dealers map -->
              <a href="#/zemljevid" class="nav-pill ${hash.startsWith('#/zemljevid') ? 'active-pill' : ''}">
                <i data-lucide="building-2"></i> ${t('header_dealers')}
              </a>

              <!-- Gume in deli — parts & tires search -->
              <a href="#/gume-in-deli" class="nav-pill ${hash.startsWith('#/gume-in-deli') ? 'active-pill' : ''}">
                <i data-lucide="disc-3"></i> ${t('header_tires_parts', 'Gume in deli')}
              </a>
            </nav>

            <div class="nav-actions">
              ${user ? `
                <a href="#/novi-oglas" class="pill-btn primary btn-sm"><i data-lucide="plus"></i><span> ${t('publish_listing')}</span></a>
                <div id="userMenu" class="relative">
                  <button id="userMenuBtn" class="pill-btn secondary user-btn">
                    ${user.photoURL
          ? `<img src="${user.photoURL}" class="avatar" style="border-radius:50%; width:24px; height:24px; object-fit:cover;" alt="Profil" />`
          : `<i data-lucide="user"></i>`}
                    <span>${user.displayName?.split(' ')[0] || t('my_account')}</span>
                  </button>
                  <div id="userDropdown" class="glass-dropdown">
                    <a href="#/dashboard"><i data-lucide="layout-dashboard"></i> ${t('dashboard_link')}</a>
                    <a href="#/profil"><i data-lucide="user"></i> ${t('my_profile')}</a>
                    <a href="#/garaža"><i data-lucide="warehouse"></i> ${t('my_garage')}</a>
                    <a href="#/primerjava" style="display: flex; align-items: center; justify-content: space-between;">
                        <span><i data-lucide="scale"></i> ${t('compare_corner')}</span>
                        <span id="compareBadgeDropdown" class="compare-badge-small" style="display: none; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; align-items: center; justify-content: center; font-weight: 800;">0</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="logoutBtn" class="dropdown-logout"><i data-lucide="log-out"></i> ${t('logout')}</button>
                    <a href="http://localhost:3000/#/admin" target="_blank" rel="noopener noreferrer" style="color: #f59e0b;"><i data-lucide="shield"></i> Admin</a>
                  </div>
                </div>
              ` : `
                <a href="#/novi-oglas" class="pill-btn primary btn-sm">
                  <i data-lucide="plus"></i><span> ${t('publish_listing')}</span>
                </a>
                <a href="#/prijava" class="pill-btn success btn-sm" style="background: linear-gradient(135deg, #10b981, #059669) !important; color: white !important; font-weight: 700; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4) !important;">
                  <i data-lucide="user"></i> ${t('login')}
                </a>
              `}

              <button class="pill-btn secondary btn-icon" id="themeToggleBtn" aria-label="Preklopi temo">
                <i data-lucide="${document.body.classList.contains('dark-mode') ? 'sun' : 'moon'}"></i>
              </button>

              <button class="burger-btn" id="burgerBtn" aria-label="Meni" aria-expanded="false" aria-controls="navLinks">
                <i data-lucide="menu"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // ── Theme Toggle ──
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      render(user);
    });

    // ── Mobile hamburger: toggle category nav ──
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (burgerBtn && navLinks) {
      burgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = navLinks.classList.toggle('open');
        burgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        burgerBtn.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
        if (window.lucide) window.lucide.createIcons();
      });
      // Close when a category link is tapped
      navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) navLinks.classList.remove('open');
      });
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('open') &&
          !navLinks.contains(e.target) && !burgerBtn.contains(e.target)) {
          navLinks.classList.remove('open');
          burgerBtn.setAttribute('aria-expanded', 'false');
          burgerBtn.innerHTML = '<i data-lucide="menu"></i>';
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }

    // ── Oglasi mega menu (hover on desktop, tap on mobile) ──
    const oglasiWrapper = document.getElementById('oglasiMenuWrapper');
    const oglasiTrigger = document.getElementById('oglasiTrigger');
    const oglasiMega = document.getElementById('oglasiMega');
    if (oglasiWrapper && oglasiTrigger && oglasiMega) {
      const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
      let leaveTimeout = null;

      oglasiWrapper.addEventListener('mouseenter', () => {
        if (!isMobile()) {
          if (leaveTimeout) clearTimeout(leaveTimeout);
          oglasiMega.classList.add('open');
          oglasiTrigger.setAttribute('aria-expanded', 'true');
        }
      });
      oglasiWrapper.addEventListener('mouseleave', () => {
        if (!isMobile()) {
          leaveTimeout = setTimeout(() => {
            oglasiMega.classList.remove('open');
            oglasiTrigger.setAttribute('aria-expanded', 'false');
          }, 300);
        }
      });

      oglasiWrapper.addEventListener('focusin', () => {
        if (!isMobile()) {
          if (leaveTimeout) clearTimeout(leaveTimeout);
          oglasiMega.classList.add('open');
          oglasiTrigger.setAttribute('aria-expanded', 'true');
        }
      });
      oglasiWrapper.addEventListener('focusout', () => {
        if (!isMobile()) {
          leaveTimeout = setTimeout(() => {
            oglasiMega.classList.remove('open');
            oglasiTrigger.setAttribute('aria-expanded', 'false');
          }, 300);
        }
      });

      // Tap (mobile) / keyboard toggle
      oglasiTrigger.addEventListener('click', (e) => {
        if (!isMobile()) {
          // On desktop, clicking "Oglasi" takes us to advanced search for avtomobili
          window.location.hash = buildSearchUrl('avto');
        } else {
          e.preventDefault();
          e.stopPropagation();
          const open = oglasiMega.classList.toggle('open');
          oglasiTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
      });

      // Close the mega when a category is chosen
      oglasiMega.addEventListener('click', () => {
        if (leaveTimeout) clearTimeout(leaveTimeout);
        oglasiMega.classList.remove('open');
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!oglasiWrapper.contains(e.target)) {
          if (leaveTimeout) clearTimeout(leaveTimeout);
          oglasiMega.classList.remove('open');
          oglasiTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // ── User dropdown ──
    const menuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    if (menuBtn && dropdown) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => dropdown.classList.remove('open'), { capture: true });
    }

    // ── Logout ──
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await logout();
      window.location.hash = '/';
    });

    // Store user for hashchange re-renders
    window._currentUser = user;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Compare badge & preview
  // ═══════════════════════════════════════════════════════════════════════
  window.updateHeaderCompare = () => {
    const compareList = JSON.parse(localStorage.getItem('mojavto_compare') || '[]');
    const badge = document.getElementById('compareBadgeDropdown');

    if (badge) {
      badge.innerText = compareList.length;
      badge.style.display = compareList.length > 0 ? 'flex' : 'none';
    }
  };

  // First render (no user yet)
  render(null);

  // Initial badge update
  setTimeout(window.updateHeaderCompare, 0);

  // Keep header in sync with auth state
  onAuth(user => {
    render(user);
    window.updateHeaderCompare();
  });

  // Re-render on hash change to update active pill states
  window.addEventListener('hashchange', () => {
    render(window._currentUser || null);
  });
}
