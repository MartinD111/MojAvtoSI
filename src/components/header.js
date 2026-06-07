// Header component — MojAvto.si
// Renders the nav with Material 3 Expressive styling and dynamic API items
import { onAuth, logout } from '../auth/auth.js';
import { t } from '../core/i18n.js';
import { PLATFORM } from '../config/platform.js';
import { key as lsKey } from '../config/storageKeys.js';
import { ApiNavService } from '../services/apiNavService.js';

export function initHeader() {
  const headerEl = document.getElementById('header');

  async function render(user) {
    const hash = window.location.hash;
    
    // Fetch dynamic navigation items
    const navData = await ApiNavService.fetchNavigation();
    const navItems = navData.navItems || [];

    // Helper to generate nav items from JSON
    const renderNavItems = () => {
      return navItems.map(item => {
        const isActive = item.href
          ? (item.href === '#/' ? hash === '#/' || hash === '#' : hash.startsWith(item.href))
          : (item.children && item.children.some(c => hash.startsWith(c.href)));
        
        if (item.children) {
          return `
            <div class="mega-menu-wrapper" id="${item.id}MenuWrapper">
              <button type="button" class="nav-pill mega-trigger ${isActive ? 'active-pill' : ''}" id="${item.id}Trigger" aria-haspopup="true" aria-expanded="false">
                <i data-lucide="${item.icon}"></i> ${item.label}
                <i data-lucide="chevron-down" class="mega-caret"></i>
              </button>
              <div class="mega-menu" id="${item.id}Mega" role="menu">
                <div class="mega-vertical-list">
                  ${item.children.map(child => `
                  <a href="${child.href}" class="mega-vertical-item ${hash.includes(child.href) ? 'active' : ''}" role="menuitem">
                    <i data-lucide="${child.icon}"></i> ${child.label}
                  </a>`).join('')}
                </div>
              </div>
            </div>
          `;
        }
        
        return `
          <a href="${item.href}" class="nav-pill ${isActive ? 'active-pill' : ''}">
            <i data-lucide="${item.icon}"></i> ${item.label}
          </a>
        `;
      }).join('');
    };

    const isDark = document.body.classList.contains('dark-mode');
    headerEl.innerHTML = `
      <div class="sticky-nav">
        <div class="nav-container">
          <div class="m3-app-bar nav-inner" style="background: var(--md-sys-color-surface-container); border-radius: var(--md-sys-shape-corner-extra-large); padding: 12px 24px; box-shadow: var(--md-sys-elevation-2); display: flex; align-items: center; justify-content: space-between;">

            <!-- LEFT: logo (desktop) / burger (mobile) -->
            <div class="nav-left">
              <a href="#/" class="logo-text">${PLATFORM.brandName}<span class="logo-accent">${PLATFORM.tld}</span></a>
              <button class="burger-btn" id="burgerBtn" aria-label="Meni" aria-expanded="false" aria-controls="navLinks">
                <i data-lucide="menu"></i>
              </button>
            </div>

            <!-- CENTER: nav links (desktop) / page title (mobile) -->
            <nav id="navLinks" class="desktop-links">
              ${renderNavItems()}
            </nav>
            <span class="mobile-page-title" id="mobilePageTitle"></span>

            <!-- RIGHT: actions (desktop) / profile (mobile) -->
            <div class="nav-actions" style="display: flex; align-items: center; gap: 12px;">
              <button class="pill-btn secondary btn-icon desktop-only-action" id="themeToggleBtn" aria-label="Preklopi temo" style="border-radius: 50%;">
                <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
              </button>

              ${user ? `
                <div id="userMenu" class="relative desktop-only-action">
                  <button id="userMenuBtn" class="pill-btn secondary user-btn" style="border-radius: var(--md-sys-shape-corner-large);">
                    ${user.photoURL
                      ? `<img src="${user.photoURL}" class="avatar" style="border-radius:50%; width:24px; height:24px; object-fit:cover;" alt="Profil" />`
                      : `<i data-lucide="user"></i>`}
                    <span>${user.displayName?.split(' ')[0] || t('my_profile')}</span>
                  </button>
                  <div id="userDropdown" class="glass-dropdown" style="background: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-outline-variant); border-radius: var(--md-sys-shape-corner-large);">
                    <a href="#/novi-oglas" class="dropdown-publish-listing"><i data-lucide="plus"></i> ${t('publish_listing')}</a>
                    <div class="dropdown-divider dropdown-publish-listing"></div>
                    <a href="#/dashboard"><i data-lucide="layout-dashboard"></i> ${t('dashboard_link')}</a>
                    <a href="#/profil"><i data-lucide="user"></i> ${t('my_profile')}</a>
                    <a href="#/garaža"><i data-lucide="warehouse"></i> ${t('my_garage')}</a>
                    <a href="#/primerjava" style="display: flex; align-items: center; justify-content: space-between;">
                        <span><i data-lucide="scale"></i> ${t('compare_corner')}</span>
                        <span id="compareBadgeDropdown" class="compare-badge-small" style="display: none; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; align-items: center; justify-content: center; font-weight: 800;">0</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="logoutBtn" class="dropdown-logout"><i data-lucide="log-out"></i> ${t('logout')}</button>
                    <a href="#/admin" style="color: #f59e0b;"><i data-lucide="shield"></i> Admin</a>
                  </div>
                </div>
                <a href="#/novi-oglas" class="pill-btn primary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);"><i data-lucide="plus"></i><span> ${t('publish_listing')}</span></a>
              ` : `
                <a href="#/profil" class="pill-btn secondary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);">
                  <i data-lucide="user"></i><span> ${t('my_profile')}</span>
                </a>
                <a href="#/novi-oglas" class="pill-btn primary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);">
                  <i data-lucide="plus"></i><span> ${t('publish_listing')}</span>
                </a>
              `}

              <!-- Mobile profile button (right side) -->
              <div class="mobile-profile-wrap">
                <button id="mobileProfileBtn" class="nav-avatar-mobile" aria-label="Profil" aria-haspopup="true" aria-expanded="false">
                  ${user?.photoURL
                    ? `<img src="${user.photoURL}" alt="Profil" />`
                    : `<i data-lucide="user"></i>`}
                </button>
                <div id="mobileProfileDropdown" class="glass-dropdown mobile-profile-dropdown" style="background: var(--md-sys-color-surface-container-high); border: 1px solid var(--md-sys-color-outline-variant); border-radius: var(--md-sys-shape-corner-large);">
                  ${user ? `
                    <a href="#/novi-oglas" class="dropdown-publish-listing"><i data-lucide="plus"></i> ${t('publish_listing')}</a>
                    <div class="dropdown-divider dropdown-publish-listing"></div>
                    <a href="#/dashboard"><i data-lucide="layout-dashboard"></i> ${t('dashboard_link')}</a>
                    <a href="#/profil"><i data-lucide="user"></i> ${t('my_profile')}</a>
                    <a href="#/garaža"><i data-lucide="warehouse"></i> ${t('my_garage')}</a>
                    <a href="#/primerjava"><i data-lucide="scale"></i> ${t('compare_corner')}</a>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-theme-toggle" id="themeToggleMobileProfileBtn">
                      <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                      ${isDark ? 'Svetla tema' : 'Temna tema'}
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-logout" id="mobileProfileLogoutBtn"><i data-lucide="log-out"></i> ${t('logout')}</button>
                  ` : `
                    <a href="#/prijava"><i data-lucide="log-in"></i> ${t('login')}</a>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-theme-toggle" id="themeToggleMobileProfileBtn">
                      <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                      ${isDark ? 'Svetla tema' : 'Temna tema'}
                    </button>
                  `}
                </div>
              </div>
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
      navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) navLinks.classList.remove('open');
      });
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

    // ── Dropdowns / Mega Menu Binding for dynamic items ──
    navItems.forEach(item => {
      if (!item.children) return;
      const wrapper = document.getElementById(`${item.id}MenuWrapper`);
      const trigger = document.getElementById(`${item.id}Trigger`);
      const mega = document.getElementById(`${item.id}Mega`);
      if (wrapper && trigger && mega) {
        const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
        let leaveTimeout = null;

        wrapper.addEventListener('mouseenter', () => {
          if (!isMobile()) {
            if (leaveTimeout) clearTimeout(leaveTimeout);
            mega.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
          }
        });
        wrapper.addEventListener('mouseleave', () => {
          if (!isMobile()) {
            leaveTimeout = setTimeout(() => {
              mega.classList.remove('open');
              trigger.setAttribute('aria-expanded', 'false');
            }, 300);
          }
        });

        trigger.addEventListener('click', (e) => {
          if (!isMobile()) {
            window.location.hash = item.children[0].href;
          } else {
            e.preventDefault();
            e.stopPropagation();
            const open = mega.classList.toggle('open');
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
          }
        });

        mega.addEventListener('click', () => {
          if (leaveTimeout) clearTimeout(leaveTimeout);
          mega.classList.remove('open');
        });

        document.addEventListener('click', (e) => {
          if (!wrapper.contains(e.target)) {
            if (leaveTimeout) clearTimeout(leaveTimeout);
            mega.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });

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

    // ── Mobile profile dropdown ──
    const mobileProfileBtn = document.getElementById('mobileProfileBtn');
    const mobileProfileDropdown = document.getElementById('mobileProfileDropdown');
    if (mobileProfileBtn && mobileProfileDropdown) {
      mobileProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileProfileDropdown.classList.toggle('open');
        mobileProfileBtn.setAttribute('aria-expanded', mobileProfileDropdown.classList.contains('open') ? 'true' : 'false');
      });
      document.addEventListener('click', (e) => {
        if (!mobileProfileBtn.contains(e.target) && !mobileProfileDropdown.contains(e.target)) {
          mobileProfileDropdown.classList.remove('open');
          mobileProfileBtn.setAttribute('aria-expanded', 'false');
        }
      });
      mobileProfileDropdown.addEventListener('click', (e) => {
        if (e.target.closest('a')) mobileProfileDropdown.classList.remove('open');
      });
    }

    document.getElementById('themeToggleMobileProfileBtn')?.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      render(user);
    });

    document.getElementById('mobileProfileLogoutBtn')?.addEventListener('click', async () => {
      await logout();
      window.location.hash = '/';
    });

    // ── Mobile page title ──
    const updatePageTitle = () => {
      const titleEl = document.getElementById('mobilePageTitle');
      if (!titleEl) return;
      const hash = window.location.hash;
      const active = navItems.find(item =>
        item.href ? (item.href === '#/' ? hash === '#/' || hash === '#' : hash.startsWith(item.href))
                  : item.children?.some(c => hash.startsWith(c.href))
      );
      if (active?.children) {
        const child = active.children.find(c => hash.startsWith(c.href));
        titleEl.textContent = child ? child.label : active.label;
      } else {
        titleEl.textContent = active?.label ?? (PLATFORM.brandName + PLATFORM.tld);
      }
    };
    updatePageTitle();

    window._currentUser = user;
    
    // Call the badge update after render
    if (window.updateHeaderCompare) {
        window.updateHeaderCompare();
    }
  }

  window.updateHeaderCompare = () => {
    const compareList = JSON.parse(localStorage.getItem(lsKey('compare')) || '[]');
    const badge = document.getElementById('compareBadgeDropdown');

    if (badge) {
      badge.innerText = compareList.length;
      badge.style.display = compareList.length > 0 ? 'flex' : 'none';
    }
  };

  // First render triggers API fetch
  render(null);

  setTimeout(window.updateHeaderCompare, 0);

  onAuth(user => {
    render(user);
    window.updateHeaderCompare();
  });

  window.addEventListener('hashchange', () => {
    render(window._currentUser || null);
  });
}
