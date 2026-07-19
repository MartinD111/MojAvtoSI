// Header component — MojAvto.si
// Renders the nav with Material 3 Expressive styling and dynamic API items
import { onAuth, logout } from '../auth/auth.js';
import { t, getCurrentLang, switchLang } from '../core/i18n.js';
import { PLATFORM } from '../config/platform.js';
import { key as lsKey } from '../config/storageKeys.js';
import { ApiNavService } from '../services/apiNavService.js';
import { navigateTo } from '../router.js';

const FLAG_SL = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width: 100%; height: 100%; object-fit: cover; display: block;">
  <rect width="100" height="33.3" fill="#ffffff"/>
  <rect y="33.3" width="100" height="33.3" fill="#00009c"/>
  <rect y="66.6" width="100" height="33.4" fill="#c8102e"/>
  <g transform="translate(38, 20.3)">
    <path d="M 0,0 L 24,0 L 24,14 A 12,12 0 0 1 0,14 Z" fill="#00009c" stroke="#c8102e" stroke-width="2.5"/>
    <path d="M 3.5,15.5 L 7,10.5 L 9.5,13 L 12,8 L 14.5,13 L 17,10.5 L 20.5,15.5 Z" fill="#ffffff"/>
    <path d="M 5,19.5 Q 8.5,18 12,19.5 T 19,19.5" fill="none" stroke="#00009c" stroke-width="1.5"/>
    <path d="M 5,22 Q 8.5,20.5 12,22 T 19,22" fill="none" stroke="#00009c" stroke-width="1.5"/>
    <polygon points="8.5,1 9.8,3.25 7.2,3.25" fill="#f1c40f"/>
    <polygon points="8.5,4 9.8,1.75 7.2,1.75" fill="#f1c40f"/>
    <polygon points="15.5,1 16.8,3.25 14.2,3.25" fill="#f1c40f"/>
    <polygon points="15.5,4 16.8,1.75 14.2,1.75" fill="#f1c40f"/>
    <polygon points="12,4 13.3,6.25 10.7,6.25" fill="#f1c40f"/>
    <polygon points="12,7 13.3,4.75 10.7,4.75" fill="#f1c40f"/>
  </g>
</svg>
`;

const FLAG_GB = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style="width: 100%; height: 100%; object-fit: cover; display: block;">
  <rect width="100" height="100" fill="#012169"/>
  <path d="M0,0 L100,100 M100,0 L0,100" stroke="#ffffff" stroke-width="20"/>
  <path d="M0,6 L44,50 M100,94 L56,50 M94,0 L50,44 M6,100 L50,56" stroke="#c8102e" stroke-width="12"/>
  <path d="M50,0 v100 M0,50 h100" stroke="#ffffff" stroke-width="33"/>
  <path d="M50,0 v100 M0,50 h100" stroke="#c8102e" stroke-width="20"/>
</svg>
`;

export function initHeader() {
  const headerEl = document.getElementById('header');

  async function render(user) {
    const path = window.location.pathname;

    // Fetch dynamic navigation items
    const navData = await ApiNavService.fetchNavigation();
    const navItems = navData.navItems || [];

    // Translate a nav label via its i18nKey when present, else fall back to the
    // raw (Slovenian) label baked into navigation.json.
    const navLabel = (item) => item.i18nKey ? t(item.i18nKey, item.label) : item.label;

    // Helper to generate nav items from JSON
    const renderNavItems = () => {
      return navItems.map(item => {
        const itemPath = item.href ? item.href.split('?')[0] : null;
        const isActive = item.href
          ? (item.href === '/' ? path === '/' : path.startsWith(itemPath))
          : (item.children && item.children.some(c => path.startsWith(c.href.split('?')[0])));
        
        if (item.children) {
          return `
            <div class="mega-menu-wrapper" id="${item.id}MenuWrapper">
              <button type="button" class="nav-pill mega-trigger ${isActive ? 'active-pill' : ''}" id="${item.id}Trigger" aria-haspopup="true" aria-expanded="false">
                <i data-lucide="${item.icon}"></i> ${navLabel(item)}
                <i data-lucide="chevron-down" class="mega-caret"></i>
              </button>
              <div class="mega-menu" id="${item.id}Mega" role="menu">
                <div class="mega-vertical-list">
                  ${item.children.map(child => `
                  <a href="${child.href}" class="mega-vertical-item ${path.startsWith(child.href.split('?')[0]) ? 'active' : ''}" role="menuitem">
                    <i data-lucide="${child.icon}"></i> ${navLabel(child)}
                  </a>`).join('')}
                </div>
              </div>
            </div>
          `;
        }
        
        return `
          <a href="${item.href}" class="nav-pill ${isActive ? 'active-pill' : ''}">
            <i data-lucide="${item.icon}"></i> ${navLabel(item)}
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
              <a href="/" class="logo-text" aria-label="${PLATFORM.brandName}${PLATFORM.tld}">
                <img src="images/logo-header.png" class="site-logo" alt="${PLATFORM.brandName}${PLATFORM.tld}" />
              </a>
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
              ${PLATFORM.id === 'news' ? `
                <a href="${PLATFORM.siblingUrl}" class="pill-btn secondary btn-sm desktop-only-action" target="_blank" rel="noopener" style="border-radius: var(--md-sys-shape-corner-large);">
                  <i data-lucide="external-link"></i><span> ${PLATFORM.siblingName}</span>
                </a>
              ` : user ? `
                <a href="/novi-oglas" class="pill-btn primary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);"><i data-lucide="plus"></i><span> ${t('publish_listing')}</span></a>
                <div id="userMenu" class="relative desktop-only-action">
                  <button id="userMenuBtn" class="pill-btn secondary user-btn" style="border-radius: var(--md-sys-shape-corner-large);">
                    ${user.user_metadata?.avatar_url
                      ? `<img src="${user.user_metadata.avatar_url}" class="avatar" style="border-radius:50%; width:24px; height:24px; object-fit:cover;" alt="Profil" />`
                      : `<i data-lucide="user"></i>`}
                    <span>${(user.user_metadata?.display_name || user.user_metadata?.full_name || user.email)?.split(' ')[0] || t('my_profile')}</span>
                  </button>
                  <div id="userDropdown" class="glass-dropdown">
                    <a href="/novi-oglas" class="dropdown-publish-listing"><i data-lucide="plus"></i> ${t('publish_listing')}</a>
                    <div class="dropdown-divider dropdown-publish-listing"></div>
                    <a href="/dashboard"><i data-lucide="layout-dashboard"></i> ${t('dashboard_link')}</a>
                    <a href="/profil"><i data-lucide="user"></i> ${t('my_profile')}</a>
                    <a href="/garaža"><i data-lucide="warehouse"></i> ${t('my_garage')}</a>
                    <a href="/primerjava" style="display: flex; align-items: center; justify-content: space-between;">
                        <span><i data-lucide="scale"></i> ${t('compare_btn')}</span>
                        <span id="compareBadgeDropdown" class="compare-badge-small" style="display: none; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; align-items: center; justify-content: center; font-weight: 800;">0</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="logoutBtn" class="dropdown-logout"><i data-lucide="log-out"></i> ${t('logout')}</button>
                    <a href="/admin" style="color: #f59e0b;"><i data-lucide="shield"></i> Admin</a>
                  </div>
                </div>
              ` : `
                <a href="/novi-oglas" class="pill-btn primary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);">
                  <i data-lucide="plus"></i><span> ${t('publish_listing')}</span>
                </a>
                <a href="/profil" class="pill-btn secondary btn-sm desktop-only-action" style="border-radius: var(--md-sys-shape-corner-large);">
                  <i data-lucide="user"></i><span> ${t('my_profile')}</span>
                </a>
              `}

              <!-- Language switcher — always visible, next to sibling link -->
              <div class="relative desktop-only-action" id="langMenuWrapper">
                <button type="button" class="pill-btn secondary btn-sm" id="langMenuBtn" style="border-radius: var(--md-sys-shape-corner-large); gap:6px;">
                  <span class="lang-flag-circle">${getCurrentLang() === 'sl' ? FLAG_SL : FLAG_GB}</span>
                  ${getCurrentLang() === 'sl' ? 'SL' : 'EN'}
                  <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
                </button>
                <div id="langDropdown" class="glass-dropdown lang-dropdown">
                  <button type="button" class="lang-option ${getCurrentLang() === 'sl' ? 'active' : ''}" data-lang="sl">
                    <span class="lang-flag-circle">${FLAG_SL}</span> Slovenščina
                  </button>
                  <button type="button" class="lang-option ${getCurrentLang() === 'en' ? 'active' : ''}" data-lang="en">
                    <span class="lang-flag-circle">${FLAG_GB}</span> English
                  </button>
                </div>
              </div>

              <button class="pill-btn secondary btn-icon desktop-only-action" id="themeToggleBtn" aria-label="Preklopi temo" style="border-radius: 50%;">
                <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
              </button>

              <!-- Mobile profile button (right side) -->
              <div class="mobile-profile-wrap">
                <button id="mobileProfileBtn" class="nav-avatar-mobile" aria-label="Profil" aria-haspopup="true" aria-expanded="false">
                  ${user?.user_metadata?.avatar_url
                    ? `<img src="${user.user_metadata.avatar_url}" alt="Profil" />`
                    : `<i data-lucide="user"></i>`}
                </button>
                <div id="mobileProfileDropdown" class="glass-dropdown mobile-profile-dropdown">
                  ${user ? `
                    <a href="/novi-oglas" class="dropdown-publish-listing"><i data-lucide="plus"></i> ${t('publish_listing')}</a>
                    <div class="dropdown-divider dropdown-publish-listing"></div>
                    <a href="/dashboard"><i data-lucide="layout-dashboard"></i> ${t('dashboard_link')}</a>
                    <a href="/profil"><i data-lucide="user"></i> ${t('my_profile')}</a>
                    <a href="/garaža"><i data-lucide="warehouse"></i> ${t('my_garage')}</a>
                    <a href="/primerjava" style="display:flex;align-items:center;justify-content:space-between;">
                      <span><i data-lucide="scale"></i> ${t('compare_btn')}</span>
                      <span id="compareBadgeMobile" class="compare-badge-small" style="display:none;background:#ef4444;color:white;border-radius:50%;width:18px;height:18px;font-size:0.65rem;align-items:center;justify-content:center;font-weight:800;">0</span>
                    </a>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-theme-toggle" id="themeToggleMobileProfileBtn">
                      <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                      ${isDark ? t('theme_light') : t('theme_dark')}
                    </button>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-lang-row">
                      <button type="button" class="lang-option ${getCurrentLang() === 'sl' ? 'active' : ''}" data-lang="sl">
                        <span class="lang-flag-circle">${FLAG_SL}</span> SL
                      </button>
                      <button type="button" class="lang-option ${getCurrentLang() === 'en' ? 'active' : ''}" data-lang="en">
                        <span class="lang-flag-circle">${FLAG_GB}</span> EN
                      </button>
                    </div>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-logout" id="mobileProfileLogoutBtn"><i data-lucide="log-out"></i> ${t('logout')}</button>
                  ` : `
                    <a href="/novi-oglas" class="dropdown-publish-listing"><i data-lucide="plus"></i> ${t('publish_listing')}</a>
                    <div class="dropdown-divider dropdown-publish-listing"></div>
                    <a href="/prijava"><i data-lucide="log-in"></i> ${t('login')}</a>
                    <div class="dropdown-divider"></div>
                    <button type="button" class="dropdown-theme-toggle" id="themeToggleMobileProfileBtn">
                      <i data-lucide="${isDark ? 'sun' : 'moon'}"></i>
                      ${isDark ? t('theme_light') : t('theme_dark')}
                    </button>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-lang-row">
                      <button type="button" class="lang-option ${getCurrentLang() === 'sl' ? 'active' : ''}" data-lang="sl">
                        <span class="lang-flag-circle">${FLAG_SL}</span> SL
                      </button>
                      <button type="button" class="lang-option ${getCurrentLang() === 'en' ? 'active' : ''}" data-lang="en">
                        <span class="lang-flag-circle">${FLAG_GB}</span> EN
                      </button>
                    </div>
                  `}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // ── Language dropdown ──
    const langMenuBtn = document.getElementById('langMenuBtn');
    const langDropdown = document.getElementById('langDropdown');
    if (langMenuBtn && langDropdown) {
      langMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => langDropdown.classList.remove('open'), { capture: true });
    }

    // ── Theme Toggle ──
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      render(user);
    });

    // Delegate lang-option clicks (covers desktop user dropdown and mobile entries)
    headerEl.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        switchLang(opt.getAttribute('data-lang'));
        // header re-renders via the langChanged listener below
      });
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
            navigateTo(item.children[0].href);
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
      navigateTo('/');
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
      navigateTo('/');
    });

    // ── Mobile page title ──
    const updatePageTitle = () => {
      const titleEl = document.getElementById('mobilePageTitle');
      if (!titleEl) return;
      const curPath = window.location.pathname;
      const active = navItems.find(item =>
        item.href ? (item.href === '/' ? curPath === '/' : curPath.startsWith(item.href.split('?')[0]))
                  : item.children?.some(c => curPath.startsWith(c.href.split('?')[0]))
      );
      if (active?.children) {
        const child = active.children.find(c => curPath.startsWith(c.href.split('?')[0]));
        titleEl.textContent = child ? navLabel(child) : navLabel(active);
      } else {
        titleEl.textContent = active ? navLabel(active) : (PLATFORM.brandName + PLATFORM.tld);
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
    const count = compareList.length;
    [document.getElementById('compareBadgeDropdown'), document.getElementById('compareBadgeMobile')].forEach(badge => {
      if (!badge) return;
      badge.innerText = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  };

  // First render triggers API fetch
  render(null);

  setTimeout(window.updateHeaderCompare, 0);

  onAuth(user => {
    render(user);
    window.updateHeaderCompare();
  });

  window.addEventListener('popstate', () => {
    render(window._currentUser || null);
  });

  // Re-render header when the UI language changes so all t() strings update.
  document.addEventListener('langChanged', () => {
    render(window._currentUser || null);
  });
}
