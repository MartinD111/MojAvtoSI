import{t as e}from"./platform-BvWcB7wr.js";import{a as t,c as n,o as r,t as i}from"./extensions-BVPcMrZL.js";import{i as a}from"./auth-4RmUyM8I.js";function o({activeRoute:o=`/b2b`,title:l=``}={}){let u=document.getElementById(`app-container`);if(!u)return null;let d=t();if(!d||d.sellerType!==`business`)return u.innerHTML=`
            <div style="padding:3rem;text-align:center;">
                <h2>Dostop ni mogoč</h2>
                <p>Ta sekcija je namenjena samo poslovnim uporabnikom.</p>
                <a href="#/dashboard" class="btn btn-primary">Domov</a>
            </div>`,null;let f=r(),p=i(f),m=n(),h=d.companyDetails||{};return u.innerHTML=`
        <div class="b2b-shell">
            <!-- Sidebar -->
            <aside class="b2b-sidebar">
                <div class="b2b-brand">
                    <a href="#/" class="b2b-brand-link">
                        <span class="b2b-brand-mark">${e.brandMark}</span>
                        <span class="b2b-brand-text">${e.brandName}<span>${e.tld}</span></span>
                    </a>
                    <div class="b2b-brand-tag">B2B</div>
                </div>

                <div class="b2b-company">
                    <div class="b2b-company-name" title="${c(h.companyName||``)}">${c(h.companyName||d.displayName||`Podjetje`)}</div>
                    <div class="b2b-company-tier ${m?`verified`:`unverified`}">
                        <i data-lucide="${m?`badge-check`:`clock`}"></i>
                        ${m?`Verificirano podjetje`:`V preverjanju`}
                    </div>
                </div>

                <nav class="b2b-nav">
                    ${p.map(e=>`
                        <a href="#${e.route}" class="b2b-nav-item ${o===e.route?`active`:``}" data-route="${e.route}">
                            <i data-lucide="${e.icon}"></i>
                            <span>${c(e.name)}</span>
                        </a>
                    `).join(``)}
                </nav>

                <div class="b2b-sidebar-footer">
                    <a href="#/dashboard" class="b2b-nav-item b2b-exit">
                        <i data-lucide="user"></i> <span>Osebni račun</span>
                    </a>
                    <button id="b2bLogoutBtn" class="b2b-nav-item b2b-logout">
                        <i data-lucide="log-out"></i> <span>Odjava</span>
                    </button>
                </div>
            </aside>

            <!-- Topbar + main -->
            <div class="b2b-main-wrap">
                <header class="b2b-topbar">
                    <div class="b2b-topbar-title">
                        <button class="b2b-sidebar-toggle" id="b2bSidebarToggle" aria-label="Meni"><i data-lucide="menu"></i></button>
                        <h1>${c(l)}</h1>
                    </div>
                    <div class="b2b-topbar-actions">
                        ${m?``:`
                            <div class="b2b-verify-banner">
                                <i data-lucide="info"></i>
                                <span>Vaše podjetje še ni verificirano — nekatere funkcije so omejene.</span>
                            </div>`}
                        <div class="b2b-role-chips">
                            ${f.map(e=>`<span class="b2b-role-chip b2b-role-${e}">${s(e)}</span>`).join(``)}
                        </div>
                    </div>
                </header>

                <main id="b2b-main" class="b2b-main"></main>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons(),document.getElementById(`b2bSidebarToggle`)?.addEventListener(`click`,()=>{document.querySelector(`.b2b-sidebar`)?.classList.toggle(`open`)}),document.getElementById(`b2bLogoutBtn`)?.addEventListener(`click`,async()=>{await a(),window.location.hash=`/`}),document.getElementById(`b2b-main`)}function s(t){return e.b2bRoleLabels&&e.b2bRoleLabels[t]||{dealer:`Avtohiša`,mechanic:`Servis`,vulcanizer:`Vulkanizer`}[t]||t}function c(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{o as t};