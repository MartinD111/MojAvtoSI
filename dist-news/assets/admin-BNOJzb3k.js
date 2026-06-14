import{t as e}from"./platform-BvWcB7wr.js";import{A as t,B as n,C as r,D as i,E as a,F as o,H as s,I as c,L as l,M as u,N as d,O as f,P as p,R as m,S as h,T as g,V as ee,_ as te,a as ne,c as re,d as ie,f as ae,g as oe,h as se,i as ce,j as le,k as ue,l as de,m as fe,n as pe,o as me,p as he,r as ge,s as _e,t as _,u as ve,v as ye,w as be,x as xe,y as Se,z as Ce}from"./adminService-cyoOq016.js";import{t as we}from"./categories-CGnbRdNO.js";import{a as Te,d as Ee,f as De,i as Oe,l as ke,p as Ae,r as je,t as Me}from"./newsService-Ve7q7qVu.js";var v=null,Ne=null,Pe=`dashboard`,Fe={lastDoc:null,filters:{}},y=null;async function Ie(){let e=window.__currentUser;if(!e){window.location.hash=`/prijava`;return}if(!await ve(e.uid)){document.getElementById(`app-container`).innerHTML=`
          <div style="text-align:center;padding:6rem 2rem;">
            <div style="font-size:4rem;margin-bottom:1rem;">🔒</div>
            <h2 style="color:#dc2626;margin:0 0 0.5rem;">Dostop zavrnjen</h2>
            <p style="color:#6b7280;">Nimate administratorskih pravic.</p>
            <a href="#/" style="color:#2563eb;font-weight:600;">← Nazaj domov</a>
          </div>`;return}if(v=e,Ne=await o(e.uid),!document.getElementById(`adm-hide-sitenav`)){let e=document.createElement(`style`);e.id=`adm-hide-sitenav`,e.textContent=`.sticky-nav { display: none !important; }`,document.head.appendChild(e)}Re(),Be(),x(`dashboard`)}var Le={dashboard:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,listings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`,users:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>`,taxonomy:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h10M4 18h6"/><circle cx="19" cy="17" r="3"/><path d="m21.5 19.5-1.5-1.5"/></svg>`,featured:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,reports:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,analytics:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,seo:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,payments:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,media:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,audit:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,settings:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,vozila:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,webscraping:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,catalog:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="m2 7 2.5-4h15L22 7"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="7" x2="21" y2="7"/></svg>`,news:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`};function Re(){let t=document.getElementById(`app-container`);t.innerHTML=`
    <div class="adm-wrap">
      <!-- Sidebar -->
      <aside class="adm-sidebar" id="adm-sidebar">
        <div class="adm-brand">
          <div class="adm-brand-logo">
            <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="${e.colors.primaryStart}"/><path d="M6 20h20M9 20l1.5-6h11L23 20M10 17h12" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><circle cx="11" cy="22" r="1.5" fill="#fff"/><circle cx="21" cy="22" r="1.5" fill="#fff"/></svg>
          </div>
          <div class="adm-brand-text">${e.brandName} <span>Admin</span></div>
        </div>

        <div class="adm-sidebar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="adm-global-search" id="adm-global-search" type="search" placeholder="Išči…" />
        </div>

        <nav class="adm-nav">
          <div class="adm-nav-group-label">Pregled</div>
          ${b(`dashboard`,`dashboard`,`Dashboard`)}

          <div class="adm-nav-group-label">Vsebina</div>
          ${b(`listings`,`listings`,`Oglasi`)}
          ${b(`drazbe`,`featured`,`Dražbe`)}
          ${b(`users`,`users`,`Uporabniki`)}
          ${b(`featured`,`featured`,`Sponzorirani`)}
          ${b(`news`,`news`,`AutoHub News`)}
          ${b(`reports`,`reports`,`Poročila`)}

          <div class="adm-nav-group-label">Katalog</div>
          ${b(`taxonomy`,`taxonomy`,e.id===`navtika`?`Taksonomija plovil`:`Taksonomija vozil`)}
          ${b(`vozila-uvoz`,`vozila`,e.id===`navtika`?`Vnos plovil (Excel)`:`Vnos vozil (Excel)`)}

          <div class="adm-nav-group-label">${e.id===`navtika`?`Cenik (oprema)`:`Cenik (Gume in deli)`}</div>
          ${b(`webscraping`,`webscraping`,`Webscraping`)}
          ${b(`catalog`,`catalog`,`Katalog izdelkov`)}

          <div class="adm-nav-group-label">Sistem</div>
          ${b(`analytics`,`analytics`,`Analitika`)}
          ${b(`seo`,`seo`,`SEO`)}
          ${b(`payments`,`payments`,`Plačila`)}
          ${b(`media`,`media`,`Mediji`)}
          ${b(`audit`,`audit`,`Audit log`)}
          ${b(`settings`,`settings`,`Nastavitve`)}
        </nav>

        <div class="adm-sidebar-footer">
          <div class="adm-user-badge">
            <span class="adm-user-avatar">${(v.displayName||`A`)[0].toUpperCase()}</span>
            <div class="adm-user-info">
              <div class="adm-user-name">${v.displayName||v.email}</div>
              <div class="adm-user-role">${ze(Ne)}</div>
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
    </div>`}function b(e,t,n){return`<button class="adm-nav-item" data-section="${e}">
      <span class="adm-nav-icon">${Le[t]||``}</span>
      <span class="adm-nav-label">${n}</span>
    </button>`}function ze(e){return{admin:`Administrator`,moderator:`Moderator`,editor:`Urednik`,user:`Uporabnik`}[e]||e}function Be(){document.querySelectorAll(`.adm-nav-item`).forEach(e=>{e.addEventListener(`click`,()=>x(e.dataset.section))}),document.getElementById(`adm-menu-toggle`).addEventListener(`click`,()=>{document.getElementById(`adm-sidebar`).classList.toggle(`adm-sidebar--open`)}),document.getElementById(`adm-global-search`).addEventListener(`input`,pn(an,400))}function x(e){Pe=e,document.querySelectorAll(`.adm-nav-item`).forEach(t=>t.classList.toggle(`active`,t.dataset.section===e)),document.getElementById(`adm-content`).innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>`,Ve[e]?.()}var Ve={dashboard:He,listings:We,drazbe:Dt,users:T,taxonomy:$e,"vozila-uvoz":gt,webscraping:qt,catalog:Zt,featured:wt,news:It,reports:Tt,analytics:jt,seo:Mt,payments:Pt,media:Ft,audit:Wt,settings:Gt};async function He(){let e=document.getElementById(`adm-content`);try{let[t,n,r,i]=await Promise.all([g(),f(8),p(6),a(14)]);e.innerHTML=`
          <div class="adm-kpi-grid">
            ${Y(`Skupaj oglasov`,t.totalListings,`📋`,`blue`)}
            ${Y(`Aktivnih`,t.activeCount,`✅`,`green`)}
            ${Y(`V pregledu`,t.pendingCount,`⏳`,`yellow`)}
            ${Y(`Uporabnikov`,t.totalUsers,`👥`,`purple`)}
            ${Y(`Novih danes`,t.newToday,`🆕`,`orange`)}
            ${Y(`Znamk`,t.totalBrands,`🏷️`,`teal`)}
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
                ${r.map((e,t)=>`
                  <div class="adm-brand-row">
                    <span class="adm-brand-rank">#${t+1}</span>
                    <span class="adm-brand-name">${e.name}</span>
                    <div class="adm-brand-bar-wrap">
                      <div class="adm-brand-bar" style="width:${Math.round(e.count/(r[0]?.count||1)*100)}%"></div>
                    </div>
                    <span class="adm-brand-count">${e.count}</span>
                  </div>`).join(``)}
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
                  ${n.map(e=>`
                    <tr>
                      <td><strong>${Z(e.make||``)} ${Z(e.model||``)}</strong><br><small style="color:#6b7280">${Z(e.variant||``)}</small></td>
                      <td>${on(e.status)}</td>
                      <td style="font-size:.8rem">${Z(e.authorName||e.authorId?.slice(0,8)||`—`)}</td>
                      <td>${dn(e.priceEur||e.price)}</td>
                      <td style="font-size:.8rem">${X(e.createdAt)}</td>
                      <td>
                        <button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__adminApprove('${e.id}')">✓</button>
                        <button class="adm-btn adm-btn-xs adm-btn-red"   onclick="window.__adminReject('${e.id}')">✗</button>
                      </td>
                    </tr>`).join(``)}
                </tbody>
              </table>
            </div>
          </div>`,Ue(i),window.__adminNav=x,window.__adminApprove=e=>w(e,`active`),window.__adminReject=e=>en(e)}catch(t){e.innerHTML=Q(t)}}function Ue(e){if(typeof Chart>`u`)return;y&&=(y.destroy(),null);let t=document.getElementById(`adm-chart-listings`);t&&(y=new Chart(t,{type:`bar`,data:{labels:e.map(e=>e.date.slice(5)),datasets:[{label:`Oglasi`,data:e.map(e=>e.count),backgroundColor:`rgba(37,99,235,0.7)`,borderRadius:4}]},options:{responsive:!0,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,ticks:{stepSize:1}}}}}))}async function We(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
            ${Object.values(we).map(e=>`<option value="${e.slug}">${e.slug}</option>`).join(``)}
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
      </div>`,document.getElementById(`lst-filter-btn`).addEventListener(`click`,()=>{Fe={filters:{status:document.getElementById(`lst-filter-status`).value,category:document.getElementById(`lst-filter-cat`).value},lastDoc:null},S()}),S(),Ge()}async function S(){let t=document.getElementById(`lst-table-wrap`);if(t){t.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div></div>`;try{let{docs:n}=await ye(Fe.filters,50,Fe.lastDoc);if(n.length===0){t.innerHTML=`<div class="adm-empty">Ni oglasov za prikaz.</div>`;return}t.innerHTML=`
          <table class="adm-table adm-table--selectable">
            <thead><tr>
              <th><input type="checkbox" id="lst-select-all"></th>
              <th>Oglas</th><th>Kategorija</th><th>Status</th>
              <th>Avtor</th><th>Cena</th><th>Objavljeno</th><th>Akcije</th>
            </tr></thead>
            <tbody id="lst-tbody">
              ${n.map(t=>`
                <tr data-id="${t.id}">
                  <td><input type="checkbox" class="lst-row-check" value="${t.id}"></td>
                  <td>
                    <div class="adm-listing-cell">
                      ${t.images?.exterior?.[0]?`<img src="${t.images.exterior[0]}" class="adm-thumb">`:`<div class="adm-thumb adm-thumb--empty">${e.thumbFallback}</div>`}
                      <div>
                        <strong>${Z(t.make||``)} ${Z(t.model||``)} ${Z(t.variant||``)}</strong>
                        <div class="adm-sub">${t.year||``} · ${fn(t.mileageKm||t.mileage)} · ${Z(t.fuel||``)}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="adm-cat-badge adm-cat-${t.category||`avto`}">${t.category||`avto`}</span></td>
                  <td>${on(t.status)}</td>
                  <td class="adm-sub">${Z(t.authorName||t.authorId?.slice(0,8)||`—`)}</td>
                  <td><strong>${dn(t.priceEur||t.price)}</strong></td>
                  <td class="adm-sub">${X(t.createdAt)}</td>
                  <td class="adm-actions">
                    <button class="adm-btn adm-btn-xs adm-btn-green" title="Odobri" onclick="window.__lstApprove('${t.id}')">✓</button>
                    <button class="adm-btn adm-btn-xs adm-btn-yellow" title="Zavrni" onclick="window.__lstReject('${t.id}')">✗</button>
                    <button class="adm-btn adm-btn-xs" title="Featured" onclick="window.__lstFeatured('${t.id}')">⭐</button>
                    <button class="adm-btn adm-btn-xs adm-btn-red" title="Izbriši" onclick="window.__lstDelete('${t.id}')">🗑</button>
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`,document.getElementById(`lst-select-all`).addEventListener(`change`,e=>{document.querySelectorAll(`.lst-row-check`).forEach(t=>t.checked=e.target.checked),Ke()}),document.querySelectorAll(`.lst-row-check`).forEach(e=>e.addEventListener(`change`,Ke)),window.__lstApprove=e=>w(e,`active`),window.__lstReject=e=>en(e),window.__lstFeatured=e=>tn(e),window.__lstDelete=e=>J(`Izbrisati oglas ${e}?`,()=>qe(e))}catch(e){t.innerHTML=Q(e)}}}function Ge(){document.getElementById(`lst-bulk-group`)&&(document.getElementById(`lst-bulk-approve`)?.addEventListener(`click`,()=>{C().forEach(e=>w(e,`active`))}),document.getElementById(`lst-bulk-reject`)?.addEventListener(`click`,()=>{C().forEach(e=>w(e,`rejected`))}),document.getElementById(`lst-bulk-delete`)?.addEventListener(`click`,()=>{let e=C();J(`Izbrisati ${e.length} oglasov?`,()=>e.forEach(qe))}))}function C(){return[...document.querySelectorAll(`.lst-row-check:checked`)].map(e=>e.value)}function Ke(){let e=C(),t=document.getElementById(`lst-bulk-group`),n=document.getElementById(`lst-selected-count`);t&&(t.style.display=e.length>0?`flex`:`none`,n&&(n.textContent=`${e.length} izbranih`))}async function w(e,t){try{await _e(e,t),await _(v.uid,v.displayName,`LISTING_${t.toUpperCase()}`,e),$(`Oglas ${t===`active`?`odobren`:`posodobljen`}.`,`success`),S()}catch(e){$(`Napaka: `+e.message,`error`)}}async function qe(e){try{await ge(e),await _(v.uid,v.displayName,`LISTING_DELETE`,e),$(`Oglas izbrisan.`,`success`),S()}catch(e){$(`Napaka: `+e.message,`error`)}}async function T(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Vsi uporabniki</h3>
          <input class="adm-input adm-input-sm" id="user-search" placeholder="Išči po imenu / emailu…">
        </div>
        <div class="adm-table-wrap" id="usr-table-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`,document.getElementById(`user-search`).addEventListener(`input`,pn(()=>n(),300));let t=[];try{t=await Se(200),Je(t)}catch(e){document.getElementById(`usr-table-wrap`).innerHTML=Q(e)}function n(){let e=document.getElementById(`user-search`).value.toLowerCase();Je(t.filter(t=>(t.displayName||``).toLowerCase().includes(e)||(t.email||``).toLowerCase().includes(e)))}window.__usrBan=e=>J(`Ban/unban tega uporabnika?`,()=>Ye(e,t)),window.__usrRole=e=>nn(e,t),window.__usrGlassi=e=>x(`listings`)}function Je(e){let t=document.getElementById(`usr-table-wrap`);if(t){if(e.length===0){t.innerHTML=`<div class="adm-empty">Ni uporabnikov.</div>`;return}t.innerHTML=`
      <table class="adm-table">
        <thead><tr>
          <th>Uporabnik</th><th>Email</th><th>Vloga</th>
          <th>Status</th><th>Registriran</th><th>Akcije</th>
        </tr></thead>
        <tbody>
          ${e.map(e=>`
            <tr>
              <td>
                <div class="adm-user-cell">
                  ${e.photoURL?`<img src="${Z(e.photoURL)}" class="adm-avatar">`:`<div class="adm-avatar adm-avatar--placeholder">${(e.displayName||e.email||`?`)[0].toUpperCase()}</div>`}
                  <strong>${Z(e.displayName||`—`)}</strong>
                </div>
              </td>
              <td class="adm-sub">${Z(e.email||`—`)}</td>
              <td>${sn(e.role)}</td>
              <td>${e.status===`banned`?`<span class="adm-badge adm-badge-red">Blokiran</span>`:`<span class="adm-badge adm-badge-green">Aktiven</span>`}</td>
              <td class="adm-sub">${X(e.createdAt)}</td>
              <td class="adm-actions">
                <button class="adm-btn adm-btn-xs" onclick="window.__usrRole('${e.id}')">🔑 Vloga</button>
                <button class="adm-btn adm-btn-xs ${e.status===`banned`?`adm-btn-green`:`adm-btn-red`}" onclick="window.__usrBan('${e.id}')">
                  ${e.status===`banned`?`✓ Odblokiraj`:`🚫 Blokiraj`}
                </button>
              </td>
            </tr>`).join(``)}
        </tbody>
      </table>`}}async function Ye(e,t){let n=t.find(t=>t.id===e)?.status!==`banned`;try{await pe(e,n),await _(v.uid,v.displayName,n?`USER_BAN`:`USER_UNBAN`,e),$(n?`Uporabnik blokiran.`:`Uporabnik odblokiran.`,`success`),T()}catch(e){$(`Napaka: `+e.message,`error`)}}var Xe={avto:{avto:{file:`json/brands_models_global.json`,label:`Avtomobili`},moto:{file:`json/brands_models_moto.json`,label:`Motorji`},gospodarska:{file:`json/brands_models_gospodarska.json`,label:`Gospodarska`}},navtika:{plovila:{file:`json/brands_models_plovila.json`,label:`Plovila`},izvenkrmni:{file:`json/brands_models_izvenkrmni.json`,label:`Izvenkrmni motorji`}}},E=Xe[e.id]||Xe.avto,Ze=Object.keys(E)[0],D={},O=!1;function k(){let e=document.getElementById(`tax-unsaved-badge`);e&&(e.style.display=O?`inline-flex`:`none`)}async function A(e){if(D[e])return D[e];let t=await fetch(E[e].file);if(!t.ok)throw Error(`Napaka pri nalaganju ${E[e].file}`);return D[e]=await t.json(),D[e]}function j(e){return typeof e==`string`?{trim:e}:e&&typeof e==`object`&&e.trim?e:{trim:String(e??``)}}function Qe(e,t){return Object.entries(e).map(([e,t])=>({brand:e,models:Object.entries(t).map(([e,t])=>Array.isArray(t)?{name:e,type:null,variants:t.map(j)}:{name:e,type:t.type||null,category:t.category||null,variants:Array.isArray(t.variants)?t.variants.map(j):[]}).sort((e,t)=>e.name.localeCompare(t.name,`en`))})).sort((e,t)=>e.brand.localeCompare(t.brand,`en`))}async function $e(){let t=document.getElementById(`adm-content`);t.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header" style="flex-wrap:wrap;gap:.75rem">
          <h3 style="margin:0">${e.id===`navtika`?`Taksonomija plovil`:`Taksonomija vozil`}</h3>
          <span id="tax-unsaved-badge" class="tax-unsaved-badge" style="display:none">● Nezhranjene spremembe</span>
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-left:auto">
            <div class="adm-tabs" style="margin:0;border:none;gap:.25rem">
              ${Object.entries(E).map(([e,t])=>`
                <button class="adm-tab${e===Ze?` active`:``}" data-tax-cat="${e}">${t.label}</button>
              `).join(``)}
              ${e.id===`navtika`?`<button class="adm-tab" data-tax-cat="oprema">🛟 Oprema za plovila</button>`:`<button class="adm-tab" data-tax-cat="izpuhi">🏍 Izpuhi</button>
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
      </div>`;let n=Ze,r=t.querySelectorAll(`[data-tax-cat]`);r.forEach(e=>e.addEventListener(`click`,()=>{r.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),n=e.dataset.taxCat,document.getElementById(`tax-search`).value=``,document.getElementById(`tax-type-filter`).value=``,document.getElementById(`tax-category-filter`).value=``,B=1;let t=[`tax-search`,`tax-type-filter`,`tax-category-filter`,`tax-export-btn`,`tax-download-json-btn`,`tax-add-brand-btn`],i=e=>t.forEach(t=>{let n=document.getElementById(t);n&&(n.style.visibility=e?`visible`:`hidden`,n.style.pointerEvents=e?``:`none`)});n===`izpuhi`?(i(!1),tt()):n===`oprema`?(i(!1),F()):n===`linije`?(i(!1),L()):n===`predlogi`?(i(!1),at()):(i(!0),H(n))})),document.getElementById(`tax-search`).addEventListener(`input`,pn(()=>{B=1,H(n)},200)),document.getElementById(`tax-type-filter`).addEventListener(`change`,()=>{B=1,H(n)}),document.getElementById(`tax-category-filter`).addEventListener(`change`,()=>{B=1,H(n)}),document.getElementById(`tax-export-btn`).addEventListener(`click`,()=>mt(n)),document.getElementById(`tax-add-brand-btn`).addEventListener(`click`,()=>pt(n)),document.getElementById(`tax-download-json-btn`).addEventListener(`click`,()=>{let e=D[n];if(!e){$(`Podatki niso naloženi.`,`error`);return}let t=JSON.stringify(e,null,2),r=new Blob([t],{type:`application/json`}),i=document.createElement(`a`);i.href=URL.createObjectURL(r),i.download=E[n].file.split(`/`).pop(),i.click(),O=!1,k(),$(`${i.download} prenesen. Kopirajte v public/json/.`,`success`)}),H(Ze)}var M=null;async function et(){if(M)return M;let e=await fetch(`json/exhaust_brands.json`);if(!e.ok)throw Error(`Napaka pri nalaganju exhaust_brands.json`);return M=await e.json(),M}async function tt(){let e=document.getElementById(`tax-tree`),t=document.getElementById(`tax-stats`);if(e){e.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>`;try{let n=await et();t&&(t.textContent=`${n.length} znamk izpuhov`),e.innerHTML=`
          <div style="padding:1rem">
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;align-items:center;flex-wrap:wrap;">
              <input id="exhaust-new-input" class="adm-input adm-input-sm" style="width:220px" placeholder="Nova znamka izpuha…">
              <button class="adm-btn adm-btn-sm adm-btn-primary" id="exhaust-add-btn">+ Dodaj</button>
              <button class="adm-btn adm-btn-sm adm-btn-green" id="exhaust-download-btn">⬇ Shrani JSON</button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:.5rem" id="exhaust-chips">
              ${n.map((e,t)=>`
                <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                  ${Z(e)}
                  <button class="exhaust-del-btn" data-idx="${t}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
                </span>`).join(``)}
            </div>
          </div>`,document.getElementById(`exhaust-add-btn`).addEventListener(`click`,()=>{let e=document.getElementById(`exhaust-new-input`),t=e.value.trim();if(!t){$(`Vnesite ime znamke.`,`error`);return}if(M.includes(t)){$(`Znamka že obstaja.`,`warn`);return}M.push(t),O=!0,k(),e.value=``,tt(),$(`"${t}" dodano.`,`success`)}),document.getElementById(`exhaust-new-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&document.getElementById(`exhaust-add-btn`).click()}),document.getElementById(`exhaust-download-btn`).addEventListener(`click`,()=>{let e=JSON.stringify(M,null,2),t=new Blob([e],{type:`application/json`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=`exhaust_brands.json`,n.click(),O=!1,k(),$(`exhaust_brands.json prenesen. Kopirajte v public/json/.`,`success`)}),e.querySelectorAll(`.exhaust-del-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.idx,10),n=M[t];confirm(`Izbrisati "${n}"?`)&&(M.splice(t,1),O=!0,k(),tt(),$(`"${n}" izbrisano.`,`success`))})})}catch(t){e.innerHTML=Q(t)}}}var N=null,P=e.id===`navtika`?`equipment_brands_navtika.json`:`equipment_brands.json`,nt=e.id===`navtika`?`znamk opreme za plovila`:`znamk motoristične opreme`;async function rt(){if(N)return N;let e=await fetch(`json/${P}`);if(!e.ok)throw Error(`Napaka pri nalaganju ${P}`);return N=await e.json(),N}async function F(){let e=document.getElementById(`tax-tree`),t=document.getElementById(`tax-stats`);if(e){e.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>`;try{let n=await rt();t&&(t.textContent=`${n.length} ${nt}`),e.innerHTML=`
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
              ${n.map((e,t)=>`
                <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                  ${Z(e)}
                  <button class="equip-del-btn" data-idx="${t}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
                </span>`).join(``)}
            </div>
          </div>`;let r=e=>(e=(e||``).trim(),e?N.some(t=>t.toLowerCase()===e.toLowerCase())?($(`Znamka že obstaja.`,`warn`),!1):(N.push(e),N.sort((e,t)=>e.localeCompare(t,`sl`)),O=!0,k(),!0):($(`Vnesite ime znamke.`,`error`),!1));document.getElementById(`equip-add-btn`).addEventListener(`click`,()=>{let e=document.getElementById(`equip-new-input`);r(e.value)&&(e.value=``,F(),$(`Znamka dodana.`,`success`))}),document.getElementById(`equip-new-input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&document.getElementById(`equip-add-btn`).click()}),document.getElementById(`equip-download-btn`).addEventListener(`click`,()=>{let e=JSON.stringify(N,null,2),t=new Blob([e],{type:`application/json`}),n=document.createElement(`a`);n.href=URL.createObjectURL(t),n.download=P,n.click(),O=!1,k(),$(`${P} prenesen. Kopirajte v public/json/.`,`success`)}),document.getElementById(`equip-export-btn`).addEventListener(`click`,()=>{if(typeof XLSX>`u`){$(`XLSX knjižnica ni naložena.`,`error`);return}let e=[[`Znamka`],...N.map(e=>[e])],t=XLSX.utils.aoa_to_sheet(e),n=XLSX.utils.book_new();XLSX.utils.book_append_sheet(n,t,`Moto oprema`),XLSX.writeFile(n,`znamke_opreme_${new Date().toISOString().slice(0,10)}.xlsx`)}),document.getElementById(`equip-import-btn`).addEventListener(`click`,()=>{document.getElementById(`equip-import-file`).click()}),document.getElementById(`equip-import-file`).addEventListener(`change`,e=>{let t=e.target.files?.[0];if(!t)return;if(typeof XLSX>`u`){$(`SheetJS ni naložen.`,`error`);return}let n=new FileReader;n.onload=e=>{try{let t=XLSX.read(e.target.result,{type:`array`}),n=t.Sheets[t.SheetNames[0]],r=XLSX.utils.sheet_to_json(n,{header:1,defval:``}),i=0;r.forEach((e,t)=>{let n=String(e[0]??``).trim();n&&(t===0&&/znamka|brand/i.test(n)||N.some(e=>e.toLowerCase()===n.toLowerCase())||(N.push(n),i++))}),i>0?(N.sort((e,t)=>e.localeCompare(t,`sl`)),O=!0,k(),F(),$(`Uvoženih ${i} novih znamk. Ne pozabite "Shrani JSON".`,`success`)):$(`Ni novih znamk za uvoz.`,`warn`)}catch{$(`Napaka pri branju datoteke.`,`error`)}},n.readAsArrayBuffer(t),e.target.value=``}),e.querySelectorAll(`.equip-del-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.dataset.idx,10),n=N[t];confirm(`Izbrisati "${n}"?`)&&(N.splice(t,1),O=!0,k(),F(),$(`"${n}" izbrisano.`,`success`))})})}catch(t){e.innerHTML=Q(t)}}}var I=null;async function it(){if(I)return I;let e=await fetch(`json/vehicle_lines.json`);if(!e.ok)throw Error(`Napaka pri nalaganju vehicle_lines.json`);return I=await e.json(),I}async function L(){let e=document.getElementById(`tax-tree`),t=document.getElementById(`tax-stats`);if(e){e.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>`;try{let n=await it(),r=Object.keys(n).sort();t&&(t.textContent=`${r.length} znamk z linijami`),e.innerHTML=`
          <div style="padding:1rem">
            <p style="font-size:.82rem;color:#6b7280;margin:0 0 1rem">
              Linije so specifični paketi opreme za vsako znamko (npr. S line, GT-Line, M-Line). Prikazane so v iskanju kot četrti filter za vozila, ki imajo vsaj eno linijo.
            </p>
            <div style="display:flex;gap:.5rem;margin-bottom:1rem;align-items:flex-end;flex-wrap:wrap">
              <div>
                <label style="font-size:.78rem;color:#6b7280;display:block;margin-bottom:.25rem">Znamka</label>
                <select id="lines-make-sel" class="adm-select adm-input-sm" style="width:200px">
                  <option value="">— izberi znamko —</option>
                  ${r.map(e=>`<option value="${Z(e)}">${Z(e)}</option>`).join(``)}
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
          </div>`;let i=null;function a(){let e=document.getElementById(`lines-chips`);!e||!i||(e.innerHTML=(n[i]||[]).map((e,t)=>`
              <span class="adm-badge adm-badge-gray" style="font-size:.82rem;padding:.35rem .75rem;display:inline-flex;align-items:center;gap:.4rem">
                ${Z(e)}
                <button class="lines-del-line-btn" data-idx="${t}" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:1rem;line-height:1;padding:0 0 0 .25rem" title="Izbriši">×</button>
              </span>`).join(``)||`<span style="color:#9ca3af;font-size:.82rem">Ni linij.</span>`,e.querySelectorAll(`.lines-del-line-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.idx);n[i].splice(t,1),n[i].length===0&&delete n[i],O=!0,k(),n[i]?a():(i=null,document.getElementById(`lines-editor`).style.display=`none`,L()),$(`Linija izbrisana.`,`info`)})}))}document.getElementById(`lines-make-sel`).addEventListener(`change`,e=>{i=e.target.value||null;let t=document.getElementById(`lines-editor`);i?(document.getElementById(`lines-editor-title`).textContent=i,t.style.display=``,a()):t.style.display=`none`}),document.getElementById(`lines-add-make-btn`).addEventListener(`click`,()=>{let e=document.getElementById(`lines-new-make`).value.trim();if(!e){$(`Vnesite ime znamke.`,`error`);return}if(n[e]){$(`Znamka že obstaja.`,`warn`);return}n[e]=[],I=n,O=!0,k(),$(`Znamka "${e}" dodana.`,`success`),L()}),document.getElementById(`lines-add-line-btn`).addEventListener(`click`,()=>{if(!i)return;let e=document.getElementById(`lines-new-line`).value.trim();if(!e){$(`Vnesite ime linije.`,`error`);return}if(n[i]||(n[i]=[]),n[i].includes(e)){$(`Linija že obstaja.`,`warn`);return}n[i].push(e),O=!0,k(),document.getElementById(`lines-new-line`).value=``,a(),$(`Linija "${e}" dodana.`,`success`)}),document.getElementById(`lines-del-make-btn`).addEventListener(`click`,()=>{i&&confirm(`Odstraniti znamko "${i}" in vse njene linije?`)&&(delete n[i],I=n,i=null,O=!0,k(),$(`Znamka odstranjena.`,`info`),L())}),document.getElementById(`lines-download-btn`).addEventListener(`click`,()=>{let e=JSON.stringify(n,null,2),t=new Blob([e],{type:`application/json`}),r=document.createElement(`a`);r.href=URL.createObjectURL(t),r.download=`vehicle_lines.json`,r.click(),O=!1,k(),$(`vehicle_lines.json prenesen. Kopirajte v public/json/.`,`success`)})}catch(t){e.innerHTML=Q(t)}}}async function at(){let e=document.getElementById(`tax-tree`),t=document.getElementById(`tax-stats`);if(e){e.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam predloge…</div>`;try{let n=await d({status:`pending`});if(t&&(t.textContent=`${n.length} predlogov čaka na pregled`),!n.length){e.innerHTML=`<div class="adm-empty" style="padding:2rem">Ni novih predlogov.</div>`;return}let r={linija:`Linija`,equipment:`Oprema`,make:`⛵ Znamka`,model:`⛵ Model`,vrsta:`⛵ Vrsta`},i={linija:`adm-badge-blue`,equipment:`adm-badge-green`,make:`adm-badge-orange`,model:`adm-badge-orange`,vrsta:`adm-badge-orange`};e.innerHTML=`
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
                <tbody>${n.map(e=>`
          <tr data-proposal-id="${Z(e.id)}">
            <td><span class="adm-badge ${i[e.type]||`adm-badge-gray`}">${r[e.type]||e.type}</span></td>
            <td>${Z(e.brand||`—`)}</td>
            <td>${Z(e.category||e.model||`—`)}</td>
            <td>
              <input class="adm-input adm-input-sm proposal-value-input" style="width:220px"
                value="${Z(e.value)}" data-original="${Z(e.value)}" />
            </td>
            <td style="white-space:nowrap">
              <button class="adm-btn adm-btn-sm adm-btn-green proposal-approve-btn">✓ Odobri</button>
              <button class="adm-btn adm-btn-sm adm-btn-red proposal-reject-btn" style="margin-left:.25rem">✕ Zavrni</button>
            </td>
          </tr>`).join(``)}</tbody>
              </table>
            </div>
          </div>`,e.querySelectorAll(`tr[data-proposal-id]`).forEach(n=>{let r=n.dataset.proposalId,i=n.querySelector(`.proposal-value-input`);n.querySelector(`.proposal-approve-btn`).addEventListener(`click`,async()=>{let a=i.value.trim();if(!a){$(`Vrednost ne sme biti prazna.`,`error`);return}try{await de(r,a===i.dataset.original?null:a),n.remove();let o=e.querySelectorAll(`tr[data-proposal-id]`).length;t&&(t.textContent=`${o} predlogov čaka na pregled`),o||(e.querySelector(`tbody`).innerHTML=`<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:1.5rem">Vsi predlogi so obdelani.</td></tr>`),$(`Predlog odobren.`,`success`)}catch(e){$(`Napaka: `+e.message,`error`)}}),n.querySelector(`.proposal-reject-btn`).addEventListener(`click`,async()=>{try{await l(r),n.remove();let i=e.querySelectorAll(`tr[data-proposal-id]`).length;t&&(t.textContent=`${i} predlogov čaka na pregled`),i||(e.querySelector(`tbody`).innerHTML=`<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:1.5rem">Vsi predlogi so obdelani.</td></tr>`),$(`Predlog zavrnjen.`,`info`)}catch(e){$(`Napaka: `+e.message,`error`)}})})}catch(t){e.innerHTML=Q(t)}}}var R=`brand`,z=`asc`,B=1,V=50;async function H(e){let t=document.getElementById(`tax-tree`);if(!t)return;let n=(document.getElementById(`tax-search`)?.value||``).toLowerCase().trim(),r=document.getElementById(`tax-type-filter`)?.value||``,i=document.getElementById(`tax-category-filter`)?.value||``;t.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div> Nalagam…</div>`;try{let a=Qe(await A(e),e),o=e===`izvenkrmni`,s=e!==`avto`&&!o,c=document.getElementById(`tax-type-filter`),l=document.getElementById(`tax-category-filter`);if(s){let e=[...new Set(a.flatMap(e=>e.models.map(e=>e.type)).filter(Boolean))].sort();c.style.display=``;let t=c.value;c.innerHTML=`<option value="">Vse vrste</option>`+e.map(e=>`<option value="${e}"${e===t?` selected`:``}>${Z(e)}</option>`).join(``)}else c.style.display=`none`;if(e===`plovila`&&l){let e=[...new Set(a.flatMap(e=>e.models.map(e=>e.category)).filter(Boolean))].sort();l.style.display=``;let t=l.value;l.innerHTML=`<option value="">Vse kategorije</option>`+e.map(e=>`<option value="${e}"${e===t?` selected`:``}>${Z(e)}</option>`).join(``)}else l&&(l.style.display=`none`);let u=[];for(let e of a)for(let t of e.models)if(!(r&&t.type!==r)&&!(i&&t.category!==i))if(t.variants.length===0)u.push({brand:e.brand,model:t.name,type:t.type,category:t.category,trim:`—`,specs:{}});else for(let n of t.variants){let r=j(n);u.push({brand:e.brand,model:t.name,type:t.type,category:t.category,trim:r.trim,specs:r})}n&&(u=u.filter(e=>e.brand.toLowerCase().includes(n)||e.model.toLowerCase().includes(n)||e.trim.toLowerCase().includes(n)||(e.type||``).toLowerCase().includes(n)||(e.category||``).toLowerCase().includes(n))),u.sort((e,t)=>{let n=e[R]===void 0?e.specs?.[R]:e[R],r=t[R]===void 0?t.specs?.[R]:t[R];if(typeof n==`number`||typeof r==`number`){let e=n==null?0:Number(n),t=r==null?0:Number(r);return z===`asc`?e-t:t-e}return n=String(n||``).toLowerCase(),r=String(r||``).toLowerCase(),z===`asc`?n.localeCompare(r,`en`):r.localeCompare(n,`en`)});let d=document.getElementById(`tax-stats`);if(d&&(d.textContent=`${u.length} različic`),!u.length){t.innerHTML=`<div class="adm-empty">Ni rezultatov.</div>`;return}let f=Math.max(1,Math.ceil(u.length/V));B>f&&(B=f);let p=u.slice((B-1)*V,B*V),m=s,h=e=>e===`asc`?` ▲`:` ▼`,g=e=>`style="cursor:pointer" data-sort="${e}"`;t.innerHTML=`
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
                  <th ${g(`brand`)}>Znamka${R===`brand`?h(z):``}</th>
                  <th ${g(`model`)}>Model${R===`model`?h(z):``}</th>
                  ${m?`<th>Vrsta</th>`:``}
                  ${e===`plovila`?`<th>Kategorija</th>`:``}
                  <th ${g(`trim`)}>Različica${R===`trim`?h(z):``}</th>
                  ${e===`avto`?`<th ${g(`fuel_type`)}>Gorivo${R===`fuel_type`?h(z):``}</th>
                         <th ${g(`engine_capacity_cc`)}>Prostornina (cc)${R===`engine_capacity_cc`?h(z):``}</th>`:o?`<th ${g(`horsepower_km`)}>KM${R===`horsepower_km`?h(z):``}</th>`:e===`plovila`?``:`<th>Specifikacije</th>`}
                  <th style="width:6rem">Akcije</th>
                </tr>
              </thead>
              <tbody>
                ${p.map((t,n)=>{let r=ot(t.specs,e);return`
                      <tr data-row-idx="${(B-1)*V+n}">
                        <td><input type="checkbox" class="tax-row-check" data-brand="${Z(t.brand)}" data-model="${Z(t.model)}" data-trim="${Z(t.trim)}"></td>
                        <td>${Z(t.brand)}</td>
                        <td>${Z(t.model)}</td>
                        ${m?`<td>${t.type?`<span class="adm-badge adm-badge-blue" style="font-size:.65rem">${Z(t.type)}</span>`:`—`}</td>`:``}
                        ${e===`plovila`?`<td class="adm-sub">${Z(t.category||`—`)}</td>`:``}
                        <td>${Z(t.trim)}</td>
                        ${e===`avto`?`<td>${Z(t.specs.fuel_type||`—`)}</td>
                               <td>${t.specs.engine_capacity_cc?`${t.specs.engine_capacity_cc} cc`:`—`}</td>`:o?`<td>${t.specs.horsepower_km?`${t.specs.horsepower_km} KM`:`—`}</td>`:e===`plovila`?``:`<td class="tax-spec-cell">${r}</td>`}
                        <td>
                          <span style="display:flex;gap:.35rem">
                            <button class="adm-btn adm-btn-xs adm-btn-primary tax-edit-btn"
                              data-brand="${Z(t.brand)}" data-model="${Z(t.model)}" data-trim="${Z(t.trim)}">✏</button>
                            <button class="adm-btn adm-btn-xs adm-btn-red tax-del-btn"
                              data-brand="${Z(t.brand)}" data-model="${Z(t.model)}" data-trim="${Z(t.trim)}">🗑</button>
                          </span>
                        </td>
                      </tr>`}).join(``)}
              </tbody>
            </table>
            <div class="tax-pagination">
              <button class="adm-btn adm-btn-sm" id="tax-prev-btn" ${B<=1?`disabled`:``}>← Nazaj</button>
              <span style="font-size:.85rem;color:#6b7280">Stran ${B} / ${f} · ${u.length} vrstic</span>
              <button class="adm-btn adm-btn-sm" id="tax-next-btn" ${B>=f?`disabled`:``}>Naprej →</button>
            </div>
          </div>`,document.getElementById(`tax-prev-btn`)?.addEventListener(`click`,()=>{B--,H(e)}),document.getElementById(`tax-next-btn`)?.addEventListener(`click`,()=>{B++,H(e)}),t.querySelectorAll(`[data-sort]`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.sort;R===n?z=z===`asc`?`desc`:`asc`:(R=n,z=`asc`),B=1,H(e)})}),t.querySelectorAll(`.tax-edit-btn`).forEach(t=>{t.addEventListener(`click`,()=>{ft(e,t.dataset.brand,t.dataset.model,t.dataset.trim)})}),t.querySelectorAll(`.tax-del-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{confirm(`Izbrisati različico "${t.dataset.trim}"?`)&&(await st(e,t.dataset.brand,t.dataset.model,t.dataset.trim),H(e))})});let ee=document.getElementById(`tax-bulk-check`),te=document.getElementById(`tax-bulk-del-btn`),ne=()=>{let e=t.querySelectorAll(`.tax-row-check:checked`);te.style.display=e.length>0?``:`none`};ee?.addEventListener(`change`,()=>{t.querySelectorAll(`.tax-row-check`).forEach(e=>{e.checked=ee.checked}),ne()}),t.querySelectorAll(`.tax-row-check`).forEach(e=>e.addEventListener(`change`,ne)),te?.addEventListener(`click`,async()=>{let n=[...t.querySelectorAll(`.tax-row-check:checked`)];if(n.length&&confirm(`Izbrisati ${n.length} izbranih različic?`)){for(let t of n)await st(e,t.dataset.brand,t.dataset.model,t.dataset.trim);H(e)}})}catch(e){t.innerHTML=Q(e)}}function ot(e,t){if(!e||Object.keys(e).filter(e=>e!==`trim`).length===0)return`<span style="color:#9ca3af">—</span>`;let n=[];return e.engine_capacity_cc&&n.push(`${e.engine_capacity_cc}cc`),e.fuel_type&&n.push(Z(e.fuel_type)),e.fuel_consumption_combined&&n.push(`${e.fuel_consumption_combined}L/100`),e.fuel_consumption&&n.push(`${e.fuel_consumption}L/100`),e.electric_range_km&&n.push(`${e.electric_range_km}km EV`),e.engine_type&&n.push(Z(e.engine_type)),e.engine_configuration&&n.push(Z(e.engine_configuration)),e.capacity&&n.push(Z(e.capacity)),n.map(e=>`<span class="adm-badge adm-badge-gray" style="font-size:.65rem;margin:.05rem">${e}</span>`).join(``)}async function st(e,t,n,r){let i=await A(e);r?e===`avto`?i[t][n]=i[t][n].filter(e=>j(e).trim!==r):i[t][n].variants=i[t][n].variants.filter(e=>j(e).trim!==r):n?(delete i[t][n],Object.keys(i[t]).length===0&&delete i[t]):delete i[t],D[e]=i,O=!0,k(),$(`Izbrisano. Izvozi JSON za trajno spremembo.`,`info`)}function ct(e,t={}){let n=t,r=[`Petrol`,`Diesel`,`Electric`,`Hybrid`,`Plug-in Hybrid`,`LPG`,`CNG`,`Hydrogen`],i=[`4-stroke`,`2-stroke`,`Electric`,`Rotary`],a=[`Single`,`Parallel Twin`,`V-Twin`,`Triple`,`Inline-4`,`Boxer`,`V4`],o=r.map(e=>`<option value="${e}" ${n.fuel_type===e?`selected`:``}>${e}</option>`).join(``);return e===`avto`?`
          <div class="adm-form-row">
            <label>Vrsta goriva</label>
            <select id="spec-fuel-type" class="adm-select">
              <option value="">— izberi —</option>
              ${o}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Prostornina motorja (cc)</label>
            <input id="spec-engine-cc" class="adm-input" type="number" min="50" max="10000"
              placeholder="npr. 1995" value="${n.engine_capacity_cc||``}">
          </div>
          <div id="spec-consumption-wrap" class="tax-ev-conditional">
            <div class="adm-form-row">
              <label>Poraba — mesto (l/100km)</label>
              <input id="spec-cons-city" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${n.fuel_consumption_city||``}">
            </div>
            <div class="adm-form-row">
              <label>Poraba — cesta (l/100km)</label>
              <input id="spec-cons-highway" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${n.fuel_consumption_highway||``}">
            </div>
            <div class="adm-form-row">
              <label>Poraba — skupna (l/100km)</label>
              <input id="spec-cons-combined" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
                value="${n.fuel_consumption_combined||``}">
            </div>
          </div>
          <div id="spec-ev-wrap" class="tax-ev-conditional" style="display:none">
            <div class="adm-form-row">
              <label>El. doseg (km)</label>
              <input id="spec-ev-range" class="adm-input" type="number" min="1" max="2000"
                value="${n.electric_range_km||``}">
            </div>
          </div>`:e===`moto`?`
          <div class="adm-form-row">
            <label>Tip motorja</label>
            <select id="spec-engine-type" class="adm-select">
              <option value="">— izberi —</option>
              ${i.map(e=>`<option value="${e}" ${n.engine_type===e?`selected`:``}>${e}</option>`).join(``)}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Konfiguracija motorja</label>
            <select id="spec-engine-config" class="adm-select">
              <option value="">— izberi —</option>
              ${a.map(e=>`<option value="${e}" ${n.engine_configuration===e?`selected`:``}>${e}</option>`).join(``)}
            </select>
          </div>
          <div class="adm-form-row">
            <label>Prostornina (cc)</label>
            <input id="spec-engine-cc" class="adm-input" type="number" min="50" max="10000"
              value="${n.engine_capacity_cc||``}">
          </div>`:`
      <div class="adm-form-row">
        <label>Vrsta goriva</label>
        <select id="spec-fuel-type" class="adm-select">
          <option value="">— izberi —</option>
          ${o}
        </select>
      </div>
      <div class="adm-form-row">
        <label>Poraba (l/100km)</label>
        <input id="spec-cons-combined" class="adm-input" type="number" step="0.1" min="0.1" max="99.9"
          value="${n.fuel_consumption||``}">
      </div>
      <div class="adm-form-row">
        <label>Tovornost (opcijsko, max 20 znakov)</label>
        <input id="spec-capacity" class="adm-input" type="text" maxlength="20"
          value="${Z(n.capacity||``)}">
      </div>`}function lt(e,t){let n=e=>document.getElementById(e)?.value?.trim()||``,r={trim:t};return e===`avto`?(n(`spec-fuel-type`)&&(r.fuel_type=n(`spec-fuel-type`)),n(`spec-engine-cc`)&&(r.engine_capacity_cc=parseInt(n(`spec-engine-cc`),10)||null),n(`spec-cons-city`)&&(r.fuel_consumption_city=parseFloat(n(`spec-cons-city`))||null),n(`spec-cons-highway`)&&(r.fuel_consumption_highway=parseFloat(n(`spec-cons-highway`))||null),n(`spec-cons-combined`)&&(r.fuel_consumption_combined=parseFloat(n(`spec-cons-combined`))||null),n(`spec-ev-range`)&&(r.electric_range_km=parseInt(n(`spec-ev-range`),10)||null),Object.keys(r).forEach(e=>{(r[e]===null||r[e]===``)&&delete r[e]})):e===`moto`?(n(`spec-engine-type`)&&(r.engine_type=n(`spec-engine-type`)),n(`spec-engine-config`)&&(r.engine_configuration=n(`spec-engine-config`)),n(`spec-engine-cc`)&&(r.engine_capacity_cc=parseInt(n(`spec-engine-cc`),10)||null),Object.keys(r).forEach(e=>{(r[e]===null||r[e]===``)&&delete r[e]})):(n(`spec-fuel-type`)&&(r.fuel_type=n(`spec-fuel-type`)),n(`spec-cons-combined`)&&(r.fuel_consumption=parseFloat(n(`spec-cons-combined`))||null),n(`spec-capacity`)&&(r.capacity=n(`spec-capacity`).slice(0,20)),Object.keys(r).forEach(e=>{(r[e]===null||r[e]===``)&&delete r[e]})),r}function ut(e,t){let n=[];return t.fuel_type&&![`Petrol`,`Diesel`,`Electric`,`Hybrid`,`Plug-in Hybrid`,`LPG`,`CNG`,`Hydrogen`].includes(t.fuel_type)&&n.push(`Vrsta goriva "${t.fuel_type}" ni veljavna.`),t.engine_capacity_cc!=null&&(t.engine_capacity_cc<50||t.engine_capacity_cc>1e4)&&n.push(`Prostornina mora biti med 50 in 10000 cc.`),t.electric_range_km!=null&&(t.electric_range_km<1||t.electric_range_km>2e3)&&n.push(`Električni doseg mora biti med 1 in 2000 km.`),[`fuel_consumption_city`,`fuel_consumption_highway`,`fuel_consumption_combined`,`fuel_consumption`].forEach(e=>{t[e]!=null&&(t[e]<.1||t[e]>99.9)&&n.push(`Poraba ${e} mora biti med 0.1 in 99.9.`)}),t.engine_type&&![`4-stroke`,`2-stroke`,`Electric`,`Rotary`].includes(t.engine_type)&&n.push(`Tip motorja "${t.engine_type}" ni veljaven.`),t.engine_configuration&&![`Single`,`Parallel Twin`,`V-Twin`,`Triple`,`Inline-4`,`Boxer`,`V4`].includes(t.engine_configuration)&&n.push(`Konfiguracija "${t.engine_configuration}" ni veljavna.`),t.capacity&&t.capacity.length>20&&n.push(`Tovornost ne sme presegati 20 znakov.`),n}function dt(e){if(e!==`avto`&&e!==`gospodarska`)return;let t=document.getElementById(`spec-fuel-type`);if(!t)return;let n=()=>{let e=t.value===`Electric`,n=document.getElementById(`spec-consumption-wrap`),r=document.getElementById(`spec-ev-wrap`);n&&(n.style.display=e?`none`:``),r&&(r.style.display=e?``:`none`)};t.addEventListener(`change`,n),n()}function ft(e,t,n,r){let i=D[e];if(!i){$(`Taksonomija ni naložena.`,`error`);return}let a={trim:r};if(e===`avto`){let e=i[t]?.[n];if(Array.isArray(e)){let t=e.find(e=>j(e).trim===r);a=t?j(t):{trim:r}}}else{let e=i[t]?.[n]?.variants;if(Array.isArray(e)){let t=e.find(e=>j(e).trim===r);a=t?j(t):{trim:r}}}let o=ct(e,a);q(`Uredi različico — ${Z(r)}`,`
      <div class="adm-form-row">
        <label>Ime različice <span style="color:#ef4444">*</span></label>
        <input id="edit-trim-name" class="adm-input" value="${Z(a.trim||r)}">
      </div>
      ${o}
    `,async a=>{let o=document.getElementById(`edit-trim-name`).value.trim();if(!o){$(`Ime različice je obvezno.`,`error`);return}let s=lt(e,o),c=ut(e,s);if(c.length){$(c[0],`error`);return}e===`avto`?Array.isArray(i[t][n])&&(i[t][n]=i[t][n].map(e=>j(e).trim===r?s:e)):Array.isArray(i[t][n].variants)&&(i[t][n].variants=i[t][n].variants.map(e=>j(e).trim===r?s:e)),D[e]=i,O=!0,k(),a.remove(),$(`Različica "${o}" posodobljena.`,`success`),H(e)}),setTimeout(()=>dt(e),50)}function pt(e){q(`Dodaj znamko — ${E[e].label}`,`
      <div class="adm-form-row"><label>Ime znamke</label>
        <input id="tax-new-brand" class="adm-input" placeholder="npr. Lamborghini">
      </div>`,async t=>{let n=document.getElementById(`tax-new-brand`).value.trim();if(!n){$(`Vnesite ime znamke.`,`error`);return}let r=await A(e);if(r[n]){$(`Znamka že obstaja.`,`warn`);return}r[n]={},D[e]=r,O=!0,k(),t.remove(),$(`Znamka "${n}" dodana.`,`success`),H(e)})}async function mt(e){if(typeof XLSX>`u`){$(`XLSX knjižnica ni naložena.`,`error`);return}let t=Qe(await A(e),e),n=(document.getElementById(`tax-search`)?.value||``).toLowerCase().trim(),r=document.getElementById(`tax-type-filter`)?.value||``,i=e===`avto`?[[`Make`,`Model`,`Trim`,`Fuel Type`,`Engine Capacity (cc)`]]:e===`plovila`?[[`Znamka`,`Model`,`Različica`,`Vrsta`,`Kategorija`]]:[[`Znamka`,`Model`,`Vrsta`,`Različica`]];for(let a of t)for(let t of a.models)if(!(r&&t.type!==r)&&!(n&&!a.brand.toLowerCase().includes(n)&&!t.name.toLowerCase().includes(n)))if(t.variants.length)for(let r of t.variants){let o=j(r);n&&!a.brand.toLowerCase().includes(n)&&!t.name.toLowerCase().includes(n)&&!o.trim.toLowerCase().includes(n)||(e===`avto`?i.push([a.brand,t.name,o.trim,o.fuel_type||``,o.engine_capacity_cc||``]):e===`plovila`?i.push([a.brand,t.name,o.trim,t.type||``,t.category||``]):i.push([a.brand,t.name,t.type||``,o.trim]))}else e===`avto`?i.push([a.brand,t.name,``,``,``]):i.push([a.brand,t.name,t.type||``,``]);let a=XLSX.utils.aoa_to_sheet(i),o=XLSX.utils.book_new();XLSX.utils.book_append_sheet(o,a,E[e].label),XLSX.writeFile(o,`taksonomija_${e}_${new Date().toISOString().slice(0,10)}.xlsx`)}function ht(e){return{avto:`blue`,moto:`orange`,gospodarska:`teal`,deli:`purple`,pnevmatike:`green`}[e]||`gray`}async function gt(){let t=document.getElementById(`adm-content`),n=e.id===`navtika`;t.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header" style="flex-wrap:wrap;gap:.75rem">
          <h3>${n?`Vnos plovil — Excel uvoz`:`Vnos vozil — Excel uvoz`}</h3>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;width:100%">
            ${n?`<button class="adm-btn adm-btn-sm adm-btn-blue"   id="voz-tpl-plovila">⬇ Predloga Plovila</button>
           <button class="adm-btn adm-btn-sm adm-btn-orange" id="voz-tpl-izvenkrmni">⬇ Predloga Izvenkrmni motorji</button>`:`<button class="adm-btn adm-btn-sm adm-btn-blue"   id="voz-tpl-avto">⬇ Predloga Avto</button>
           <button class="adm-btn adm-btn-sm adm-btn-orange" id="voz-tpl-moto">⬇ Predloga Motorji</button>
           <button class="adm-btn adm-btn-sm adm-btn-teal"   id="voz-tpl-gosp">⬇ Predloga Gospodarska</button>`}
            ${n?``:`<button class="adm-btn adm-btn-sm adm-btn-red" id="voz-clear-avto-btn" style="margin-left:auto">🗑 Pobriši avto taksonomijo (Firestore)</button>`}
          </div>
        </div>
        <div style="padding:1.25rem">
          <p style="color:#6b7280;font-size:.875rem;margin:0 0 1rem">
            ${n?`<strong>Plovila:</strong> <code>Znamka · Model · Različica · Vrsta · Kategorija</code><br>
           <strong>Izvenkrmni motorji:</strong> <code>Znamka · Model · KM · Različica</code> (KM = konjska moč).<br>
           Podvojen vnos = ista znamka + model + različica → <strong>preskočen, ne podvojen</strong>.`:`<strong>Avto / Gospodarska:</strong> <code>category · brand · model · variant</code><br>
           <strong>Motorji:</strong> <code>Znamka · Model · Različica · Kategorija · Takt · Konfiguracija</code>
           — Kategorija z <code>/</code> loči več tipov (npr. <em>Športni / Naked</em>).<br>
           Podvojen vnos = ista znamka + model + različica → <strong>preskočen, ne podvojen</strong>.`}
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
      </div>`,document.getElementById(`voz-tpl-avto`)?.addEventListener(`click`,()=>U(`avto`)),document.getElementById(`voz-tpl-moto`)?.addEventListener(`click`,()=>U(`moto`)),document.getElementById(`voz-tpl-gosp`)?.addEventListener(`click`,()=>U(`gospodarska`)),document.getElementById(`voz-tpl-plovila`)?.addEventListener(`click`,()=>U(`plovila`)),document.getElementById(`voz-tpl-izvenkrmni`)?.addEventListener(`click`,()=>U(`izvenkrmni`)),document.getElementById(`voz-clear-avto-btn`)?.addEventListener(`click`,async()=>{if(!confirm(`Ali ste prepričani, da želite pobrisati CELOTNO avtomobilsko taksonomijo iz Firestore (znamke, modeli in zapisi)? Te akcije ni mogoče razveljaviti.`))return;let e=document.getElementById(`voz-clear-avto-btn`);e.disabled=!0,e.textContent=`⏳ Brišem…`;try{await ie(v.uid,v.displayName),$(`Avtomobilska taksonomija je bila uspešno pobrisana iz Firestore.`,`success`)}catch(e){$(`Napaka pri brisanju: `+e.message,`error`)}e.disabled=!1,e.textContent=`🗑 Pobriši avto taksonomijo (Firestore)`});let a=[],o=[],s=[];try{[o,s]=await Promise.all([r(),i()])}catch{}let l=document.getElementById(`voz-file`),u=document.getElementById(`voz-dropzone`);l.addEventListener(`change`,e=>p(e.target.files[0])),u.addEventListener(`dragover`,e=>{e.preventDefault(),u.classList.add(`adm-dropzone--hover`)}),u.addEventListener(`dragleave`,()=>u.classList.remove(`adm-dropzone--hover`)),u.addEventListener(`drop`,e=>{e.preventDefault(),u.classList.remove(`adm-dropzone--hover`),p(e.dataTransfer.files[0])}),u.addEventListener(`click`,()=>l.click()),document.getElementById(`voz-reset-btn`)?.addEventListener(`click`,()=>{a=[],document.getElementById(`voz-preview`).style.display=`none`,document.getElementById(`voz-result`).innerHTML=``,l.value=``}),document.getElementById(`voz-import-btn`)?.addEventListener(`click`,async()=>{if(!a.length)return;let e=document.getElementById(`voz-import-btn`);e.disabled=!0,e.textContent=`⏳ Uvažam…`;try{let e=await c(a,v.uid,v.displayName);document.getElementById(`voz-result`).innerHTML=`
              <div class="adm-alert adm-alert-success">
                ✅ Uvoz končan: <strong>${e.imported}</strong> novih zapisov,
                <strong>${e.skipped}</strong> preskočenih (podvojeni).
                ${e.errors.length?`<br>⚠️ ${e.errors.length} napak.`:``}
              </div>`,$(`Uvoz uspešen!`,`success`),await _(v.uid,v.displayName,`VEHICLE_IMPORT`,`taxonomy`,{imported:e.imported,skipped:e.skipped})}catch(e){document.getElementById(`voz-result`).innerHTML=`<div class="adm-alert adm-alert-error">Napaka: ${e.message}</div>`}e.disabled=!1,e.textContent=`📥 Uvozi`});function d(e){return`tip motorja`in e||`prenos moči`in e||`prenos moci`in e||`vrsta`in e||`kategorija`in e||`takt`in e||`konfiguracija`in e}function f(e){return`km`in e}function p(t){if(!t)return;if(typeof XLSX>`u`){$(`SheetJS ni naložen.`,`error`);return}let n=new FileReader;n.onload=t=>{try{let n=XLSX.read(t.target.result,{type:`array`}),r=n.Sheets[n.SheetNames[0]],i=XLSX.utils.sheet_to_json(r,{defval:``}).map(e=>{let t={};return Object.entries(e).forEach(([e,n])=>{t[e.toLowerCase().trim()]=String(n).trim()}),t}),o=e.id===`navtika`,s=o&&i.length>0&&f(i[0]),c=o&&!s,l=!o&&i.length>0&&d(i[0]);a=i.map(e=>{if(s){let t=parseInt(e.km||``,10);return{category:`izvenkrmni`,brand:e.znamka||e.brand||``,model:e.model||``,variant:e.različica||e.razlicica||e.variant||e.trim||``,horsepower_km:t>0?t:``}}if(c)return{category:`plovila`,brand:e.znamka||e.brand||``,model:e.model||``,variant:e.različica||e.razlicica||e.variant||e.trim||``,vrsta:e.vrsta||``,kategorija:e.kategorija||``};if(l){let t=e[`tip motorja`]||e.konfiguracija||``,n=_t(t),r=e[`prenos moči`]||e[`prenos moci`]||e.prenos||``,i=n.electric,a=yt(r);r.toLowerCase().startsWith(`elektrom`)&&(i=!0,a=``);let o=vt(e.takt||``,i),{canon:s,sub:c}=St(e.vrsta||e.kategorija||``),l=parseInt(e.prostornina||e[`engine capacity (cc)`]||``,10);return{category:`moto`,brand:e.znamka||e.brand||``,model:e.model||``,variant:e.različica||e.razlicica||e.variant||e.trim||`Base`,vrsta:s,sub_type:s===`EVozila`&&c?c:``,displacement_cc:l>0?l:``,stroke:o,engine_code:n.group?t.trim():``,engine_type:n.group,cylinders:n.cyl,cylinder_layout:n.layout,drivetrain:a}}return{category:e.category||e.kategorija||`avto`,brand:e.make||e.brand||e.znamka||``,model:e.model||``,variant:e.variant||e.različica||e.razlicica||e.trim||``,fuel_type:Ct(e[`fuel type`]||e.fuel_type||``),engine_capacity_cc:e[`engine capacity (cc)`]||e.engine_capacity_cc||``,fuel_consumption_city:e[`consumption city (opcijsko)`]||e[`consumption city`]||e.fuel_consumption_city||``,fuel_consumption_highway:e[`consumption highway (opcijsko)`]||e[`consumption highway`]||e.fuel_consumption_highway||``,fuel_consumption_combined:e[`consumption combined (opcijsko)`]||e[`consumption combined`]||e.fuel_consumption_combined||``,electric_range_km:e[`electric range (km) (opcijsko)`]||e[`electric range (km)`]||e.electric_range_km||``,fuel_consumption:e[`fuel consumption (l/100km) (opcijsko)`]||e.fuel_consumption||``,capacity:e[`capacity (opcijsko)`]||e.capacity||``}}).filter(e=>e.brand),m(a,l)}catch(e){$(`Napaka pri branju: `+e.message,`error`)}},n.readAsArrayBuffer(t)}function m(e,t){document.getElementById(`voz-preview`).style.display=`block`;let n=new Map(o.map(e=>[e.name.toLowerCase()+`|`+e.category,e])),r=new Map(s.map(e=>[e.name.toLowerCase()+`|`+(e.brandId||``),e])),i=0,a=0,c=0,l=0;e.forEach(e=>{let t=e.brand.toLowerCase()+`|`+e.category;if(n.has(t)?a++:i++,e.model){let t=o.find(t=>t.name.toLowerCase()===e.brand.toLowerCase()&&t.category===e.category),n=e.model.toLowerCase()+`|`+(t?.id||`__new__`);r.has(n)?l++:c++}}),document.getElementById(`voz-dedup-summary`).innerHTML=`
          <div class="voz-dedup-grid">
            <div class="voz-dedup-cell voz-new"><div class="voz-count">${i}</div><div class="voz-label">novih znamk</div></div>
            <div class="voz-dedup-cell voz-dup"><div class="voz-count">${a}</div><div class="voz-label">obstoječih znamk</div></div>
            <div class="voz-dedup-cell voz-new"><div class="voz-count">${c}</div><div class="voz-label">novih modelov</div></div>
            <div class="voz-dedup-cell voz-dup"><div class="voz-count">${l}</div><div class="voz-label">obstoječih modelov</div></div>
          </div>`;let u=e.slice(0,20),d=e.length>0?e[0].category:``,f=d===`avto`,p=d===`plovila`,m=t?`<tr><th>Znamka</th><th>Model</th><th>Vrsta</th><th>Različica</th><th>Prostornina</th><th>Takt</th><th>Tip motorja</th><th>Prenos moči</th><th>Status</th></tr>`:p?`<tr><th>Znamka</th><th>Model</th><th>Vrsta</th><th>Kategorija</th><th>Različica</th><th>Status</th></tr>`:d===`izvenkrmni`?`<tr><th>Znamka</th><th>Model</th><th>KM</th><th>Različica</th><th>Status</th></tr>`:f?`<tr><th>Znamka</th><th>Model</th><th>Trim</th><th>Gorivo</th><th>Prostornina</th><th>Status</th></tr>`:`<tr><th>Kat.</th><th>Znamka</th><th>Model</th><th>Različica</th><th>Status</th></tr>`,h=t?9:p||f?6:5;document.getElementById(`voz-preview-table`).innerHTML=`
          <table class="adm-table">
            <thead>${m}</thead>
            <tbody>
              ${u.map(e=>{let r=e.brand.toLowerCase()+`|`+e.category,i=n.has(r),a=i?`<span class="adm-badge adm-badge-gray">Obstoječ</span>`:`<span class="adm-badge adm-badge-green">Nov</span>`;if(t){let t=e.vrsta===`EVozila`&&e.sub_type?`${e.vrsta} (${e.sub_type})`:e.vrsta||``,n=e.engine_code&&e.engine_code!==e.engine_type?`${e.engine_type} · ${e.engine_code}`:e.engine_type||``;return`<tr class="${i?`voz-row-dup`:`voz-row-new`}">
                        <td><strong>${Z(e.brand)}</strong></td>
                        <td>${Z(e.model)}</td>
                        <td class="adm-sub">${Z(t)}</td>
                        <td class="adm-sub">${Z(e.variant)}</td>
                        <td class="adm-sub">${e.displacement_cc?Z(String(e.displacement_cc))+` ccm`:`—`}</td>
                        <td class="adm-sub">${Z(e.stroke||`—`)}</td>
                        <td class="adm-sub">${Z(n||`—`)}</td>
                        <td class="adm-sub">${Z(e.drivetrain||`—`)}</td>
                        <td>${a}</td>
                      </tr>`}return e.category===`avto`?`<tr class="${i?`voz-row-dup`:`voz-row-new`}">
                        <td><strong>${Z(e.brand)}</strong></td>
                        <td>${Z(e.model)}</td>
                        <td class="adm-sub">${Z(e.variant)}</td>
                        <td class="adm-sub">${Z(e.fuel_type||`—`)}</td>
                        <td class="adm-sub">${e.engine_capacity_cc?Z(String(e.engine_capacity_cc))+` cc`:`—`}</td>
                        <td>${a}</td>
                      </tr>`:e.category===`plovila`?`<tr class="${i?`voz-row-dup`:`voz-row-new`}">
                        <td><strong>${Z(e.brand)}</strong></td>
                        <td>${Z(e.model)}</td>
                        <td class="adm-sub">${Z(e.vrsta||`—`)}</td>
                        <td class="adm-sub">${Z(e.kategorija||`—`)}</td>
                        <td class="adm-sub">${Z(e.variant)}</td>
                        <td>${a}</td>
                      </tr>`:e.category===`izvenkrmni`?`<tr class="${i?`voz-row-dup`:`voz-row-new`}">
                        <td><strong>${Z(e.brand)}</strong></td>
                        <td>${Z(e.model)}</td>
                        <td class="adm-sub">${e.horsepower_km?Z(String(e.horsepower_km))+` KM`:`—`}</td>
                        <td class="adm-sub">${Z(e.variant)}</td>
                        <td>${a}</td>
                      </tr>`:`<tr class="${i?`voz-row-dup`:`voz-row-new`}">
                    <td><span class="adm-badge adm-badge-${ht(e.category)}">${Z(e.category)}</span></td>
                    <td><strong>${Z(e.brand)}</strong></td>
                    <td>${Z(e.model)}</td>
                    <td class="adm-sub">${Z(e.variant)}</td>
                    <td>${a}</td>
                  </tr>`}).join(``)}
              ${e.length>20?`<tr><td colspan="${h}" style="color:#6b7280;text-align:center;padding:.75rem">… in še ${e.length-20} vrstic</td></tr>`:``}
            </tbody>
          </table>`,document.getElementById(`voz-count-label`).textContent=`${e.length} vrstic skupaj · ${i+c} novih zapisov`}}function _t(e){let t=(e||``).trim(),n=t.toLowerCase();if([`elektromotor`,`elektrom`,`električni`,`electric`].includes(n))return{group:`Električni`,cyl:``,layout:``,electric:!0};if(n.includes(`hibrid`))return{group:`Hibridni`,cyl:``,layout:``,electric:!1};if(n.includes(`rotor`)||n===`wankel`)return{group:`Wankel`,cyl:``,layout:``,electric:!1};if(t===``||t===`/`||n===`veriga`)return{group:``,cyl:``,layout:``,electric:!1};if(n.includes(`kvadratni`))return{group:`Štirivaljnik (kvadratni)`,cyl:`4`,layout:``,electric:!1};let r=t[0].toUpperCase(),i=``;for(let e of t)if(e>=`0`&&e<=`9`){i=e;break}let a={I1:[`Enovaljnik`,`Single`],I2:[`Dvovaljnik (vrstni)`,`Parallel-twin`],I3:[`Trivaljnik`,`Inline-three`],I4:[`Štirivaljnik`,`Inline-four`],I6:[`Šestvaljnik`,`Inline-six`],V2:[`Dvovaljnik (V)`,`V-twin`],V3:[`Trivaljnik (V)`,``],V4:[`Štirivaljnik (V)`,`V4`],V8:[`Osemvaljnik (V)`,``],B2:[`Bokser`,`Boxer`],B4:[`Bokser`,`Boxer-four`],B6:[`Bokser`,`Boxer-six`]}[r+i];return a?{group:a[0],cyl:[`1`,`2`,`3`,`4`,`6`].includes(i)?i:``,layout:a[1],electric:!1}:{group:``,cyl:``,layout:``,electric:!1}}function vt(e,t){let n=(e||``).toLowerCase();return t?`Električni`:n.startsWith(`4`)?`4T`:n.startsWith(`2`)?`2T`:n.includes(`elek`)?`Električni`:n.includes(`wankel`)?`Wankel`:``}function yt(e){return e=(e||``).trim().toLowerCase(),e.includes(`kardan`)?`kardan`:e.includes(`zobati`)?`zobati jermen`:e.includes(`jekleni`)?`jekleni jermen`:e.includes(`verig`)?`veriga`:``}var bt=new Set([`e-bike`,`električni skiro`,`elektricni skiro`,`električno kolo`,`elektricno kolo`,`električni motocikel`,`elektricni motocikel`,`e-skuter`,`električni moped`,`elektricni moped`]),xt={sportnimotor:`SportniMotor`,sportnitourer:`SportniTourer`,adventure:`Adventure`,nakedbike:`NakedBike`,enduro:`Enduro`,chopper:`Chopper`,tourer:`Tourer`,supermoto:`Supermoto`,trial:`Trial`,cross:`Cross`,skuter:`Skuter`,minimoto:`Minimoto`,gokart:`Gocart`,"motorne sani":`MotorneSani`,classic:`Classic`,cruiser:`Cruiser`,moped:`Moped`,utv:`UTV`,atv:`ATV`,"side-by-side":`UTV`,trikolesnik:`Trikolesnik`,scrambler:`NakedBike`};function St(e){let t=(e||``).trim(),n=t.toLowerCase();return bt.has(n)?{canon:`EVozila`,sub:t}:{canon:xt[n]||t,sub:t}}function Ct(e){let t=(e||``).trim();return{phev:`Plug-in Hybrid`,"plug-in hybrid":`Plug-in Hybrid`,"plugin hybrid":`Plug-in Hybrid`,"petrol/oil":`Petrol`,petrol:`Petrol`,bencin:`Petrol`,gasoline:`Petrol`,diesel:`Diesel`,dizel:`Diesel`,electric:`Electric`,električni:`Electric`,ev:`Electric`,hybrid:`Hybrid`,hibrid:`Hybrid`,lpg:`LPG`,cng:`CNG`,hydrogen:`Hydrogen`,vodik:`Hydrogen`,steam:`Steam`}[t.toLowerCase()]||t}function U(e){if(typeof XLSX>`u`){$(`XLSX knjižnica ni naložena.`,`error`);return}let t={avto:{sheetName:`Avtomobili`,fileName:`predloga_avto.xlsx`,notes:`OPOMBA: Stolpci so Make, Model, Trim, Fuel Type, Engine Capacity (cc). Fuel Type: Petrol|Diesel|Electric|Hybrid|Plug-in Hybrid|LPG|CNG|Hydrogen|Steam. Za Electric vozila pustite Engine Capacity prazno.`,headers:[`Make`,`Model`,`Trim`,`Fuel Type`,`Engine Capacity (cc)`],examples:[[`BMW`,`3 Series`,`320d`,`Diesel`,1995],[`BMW`,`3 Series`,`330e`,`Plug-in Hybrid`,1998],[`Tesla`,`Model 3`,`Long Range`,`Electric`,``]]},moto:{sheetName:`Motorji`,fileName:`predloga_motorji.xlsx`,notes:`OPOMBA: Vrsta = kategorija vozila (SportniMotor, Adventure, NakedBike, Classic, Cruiser, Moped, Skuter, ATV, UTV, Trikolesnik, E-Bike, Električni skiro …). Takt: 4-taktni|2-taktni|Električni|Wankel. Tip motorja = koda (I1=enovaljnik, I2=vrstni 2, I4=vrstni 4, V2=V-dvovaljnik, V4, B2=bokser, Elektromotor). Prenos moči: veriga|zobati jermen|jekleni jermen|kardan. Prostornina v ccm (pri električnih pustite prazno).`,headers:[`Znamka`,`Model`,`Vrsta`,`Različica`,`Prostornina`,`Takt`,`Tip motorja`,`Prenos moči`],examples:[[`BMW Motorrad`,`S 1000 RR`,`SportniMotor`,`S 1000 RR M`,999,`4-taktni`,`I4`,`veriga`],[`Ducati`,`Panigale V4`,`SportniMotor`,`Panigale V4S`,1103,`4-taktni`,`V4 90°`,`veriga`],[`BMW Motorrad`,`R 1250 GS`,`Adventure`,`R 1250 GS Adventure`,1254,`4-taktni`,`B2`,`kardan`],[`Amper`,`E-Bike`,`Električni skiro`,`Amper S45`,``,`Električni`,`Elektromotor`,`zobati jermen`]]},gospodarska:{sheetName:`Gospodarska`,fileName:`predloga_gospodarska.xlsx`,notes:`OPOMBA: Fuel Type: Diesel|Petrol|Electric|CNG|LPG. Za Electric vozila izpustite Fuel Consumption. Capacity: max 20 znakov (npr. 3500kg). Stolpci z (opcijsko) niso obvezni.`,headers:[`Brand`,`Model`,`Type`,`Trim`,`Fuel Type`,`Fuel Consumption (l/100km) (opcijsko)`,`Capacity (opcijsko)`],examples:[[`Mercedes-Benz`,`Sprinter`,`Dostavna`,`314 CDI`,`Diesel`,8.4,`3500kg`],[`Volkswagen`,`e-Crafter`,`Dostavna`,`e-Crafter 35`,`Electric`,``,`3500kg`]]},plovila:{sheetName:`Plovila`,fileName:`predloga_plovila.xlsx`,notes:`OPOMBA: Stolpci so Znamka, Model, Različica, Vrsta, Kategorija. Vrsta = tip plovila (Čolni, Jadrnice …). Kategorija = podkategorija (Walkaround, Flybridge, Enotrupna …). Različica = ime variante (privzeto enako modelu).`,headers:[`Znamka`,`Model`,`Različica`,`Vrsta`,`Kategorija`],examples:[[`Azimut`,`Atlantis 45`,`Atlantis 45`,`Čolni`,`Športna jahta`],[`Bavaria`,`C38`,`C38`,`Jadrnice`,`Enotrupna`],[`Bali`,`4.2`,`Bali 4.2`,`Jadrnice`,`Jadralni katamaran`]]},izvenkrmni:{sheetName:`Izvenkrmni motorji`,fileName:`predloga_izvenkrmni.xlsx`,notes:`OPOMBA: Stolpci so Znamka, Model, KM, Različica. KM = konjska moč (število). Za električne motorje pustite KM prazno ali vnesite nazivno moč v KM.`,headers:[`Znamka`,`Model`,`KM`,`Različica`],examples:[[`Yamaha`,`F40`,40,`F40`],[`Mercury`,`F150`,150,`F150`],[`ePropulsion`,`Spirit 1.0`,``,`Spirit 1.0 Plus`]]}}[e];if(!t){$(`Neznana kategorija.`,`error`);return}let n=[];n.push([t.notes,...Array(t.headers.length-1).fill(``)]),n.push(t.headers),t.examples.forEach(e=>n.push(e));let r=XLSX.utils.aoa_to_sheet(n);t.headers.forEach((e,n)=>{let i=XLSX.utils.encode_cell({r:1,c:n});r[i]||(r[i]={v:t.headers[n],t:`s`}),r[i].s={font:{bold:!0},fill:{fgColor:{rgb:`DCE6F1`}}}}),r[`!cols`]=t.headers.map(()=>({wch:22}));let i=XLSX.utils.book_new();XLSX.utils.book_append_sheet(i,r,t.sheetName),XLSX.writeFile(i,t.fileName)}async function wt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>Sponzorirani in izpostavljeni oglasi</h3>
        </div>
        <div class="adm-table-wrap" id="featured-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;try{let{docs:e}=await ye({},100),t=e.filter(e=>e.promotion?.tier&&e.promotion.tier!==`free`),n=document.getElementById(`featured-table`);if(!t.length){n.innerHTML=`<div class="adm-empty">Ni sponzoriranih oglasov.</div>`;return}n.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>Oglas</th><th>Tip</th><th>Aktiviran</th><th>Poteče</th><th>Akcije</th></tr></thead>
            <tbody>
              ${t.map(e=>`
                <tr>
                  <td><strong>${Z(e.make||``)} ${Z(e.model||``)}</strong></td>
                  <td>${cn(e.promotion?.tier)}</td>
                  <td class="adm-sub">${X(e.promotion?.activatedAt)}</td>
                  <td class="adm-sub">${e.promotion?.expiresAt?X(e.promotion.expiresAt):`∞`}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__featRemove('${e.id}')">Odstrani</button>
                    <button class="adm-btn adm-btn-xs" onclick="window.__featEdit('${e.id}')">Uredi</button>
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`,window.__featRemove=e=>J(`Odstraniti sponzoring?`,async()=>{await me(e,`free`,0),$(`Sponzoring odstranjen.`,`success`),wt()}),window.__featEdit=e=>tn(e)}catch(e){document.getElementById(`featured-table`).innerHTML=Q(e)}}async function Tt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`,document.getElementById(`report-filter`).addEventListener(`change`,e=>Et(e.target.value)),Et(``)}async function Et(e){let t=document.getElementById(`reports-table`);if(t){t.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div></div>`;try{let n=await ue(e||null);if(!n.length){t.innerHTML=`<div class="adm-empty">Ni poročil.</div>`;return}t.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>Oglas ID</th><th>Razlog</th><th>Prijavil</th><th>Datum</th><th>Status</th><th>Akcije</th></tr></thead>
            <tbody>
              ${n.map(e=>`
                <tr>
                  <td class="adm-sub">${Z(e.listingId||`—`)}</td>
                  <td>${ln(e.reason)}</td>
                  <td class="adm-sub">${Z(e.reporterName||e.reporterId?.slice(0,8)||`—`)}</td>
                  <td class="adm-sub">${X(e.createdAt)}</td>
                  <td>${un(e.status)}</td>
                  <td class="adm-actions">
                    ${e.status===`open`?`
                      <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__repResolve('${e.id}','remove')">Odstrani oglas</button>
                      <button class="adm-btn adm-btn-xs" onclick="window.__repResolve('${e.id}','dismiss')">Zavrni</button>
                    `:`<span class="adm-sub">Zaključeno</span>`}
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`,window.__repResolve=async(t,n)=>{await m(t,n),$(n===`dismiss`?`Poročilo zavrnjeno.`:`Oglas odstranjen.`,`success`),Et(e)}}catch(e){t.innerHTML=Q(e)}}}async function Dt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`,kt(),At()}function Ot(e){let[t,n]={active:[`Aktivna`,`adm-badge-green`],paused:[`Pavza`,`adm-badge-yellow`],ended:[`Zaključena`,`adm-badge`],cancelled:[`Preklicana`,`adm-badge-red`]}[e]||[e||`—`,`adm-badge`];return`<span class="adm-badge ${n}">${t}</span>`}async function kt(){let e=document.getElementById(`drazbe-table`);if(e)try{let t=await te();if(!t.length){e.innerHTML=`<div class="adm-empty">Ni dražb.</div>`;return}let n=e=>(Number(e)||0).toLocaleString(`sl-SI`)+` €`;e.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>Oglas ID</th><th>Izklicna</th><th>Trenutna</th><th>Ponudb</th><th>Konec</th><th>Status</th><th>Akcije</th></tr></thead>
            <tbody>
              ${t.map(e=>`
                <tr>
                  <td class="adm-sub"><a href="#/drazba?id=${e.listingId}" target="_blank">${Z(e.listingId)}</a></td>
                  <td class="adm-sub">${n(e.startPriceEur)}</td>
                  <td><strong>${n(e.currentBidEur)}</strong></td>
                  <td class="adm-sub">🔨 ${e.bidCount||0} · 👤 ${e.bidderCount||0}</td>
                  <td class="adm-sub">${X(e.endsAt)}</td>
                  <td>${Ot(e.status)}</td>
                  <td class="adm-actions">
                    <button class="adm-btn adm-btn-xs" onclick="window.__aucBids('${e.listingId}')">Ponudbe</button>
                    ${e.status===`active`?`<button class="adm-btn adm-btn-xs adm-btn-yellow" onclick="window.__aucStatus('${e.listingId}','paused')">Pavza</button>
                           <button class="adm-btn adm-btn-xs adm-btn-red" onclick="window.__aucClose('${e.listingId}')">Zaključi</button>`:e.status===`paused`?`<button class="adm-btn adm-btn-xs adm-btn-green" onclick="window.__aucStatus('${e.listingId}','active')">Aktiviraj</button>`:`<span class="adm-sub">—</span>`}
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`,window.__aucStatus=async(e,t)=>{await ne(e,t),await _(v.uid,v.displayName||v.email,`auction_status`,e,{status:t}),$(`Status dražbe posodobljen.`,`success`),kt()},window.__aucClose=async e=>{confirm(`Zaključim to dražbo in določim zmagovalca po najvišji ponudbi?`)&&(await ce(e),await _(v.uid,v.displayName||v.email,`auction_close`,e,{}),$(`Dražba zaključena.`,`success`),kt())},window.__aucBids=async e=>{let t=await oe(e);alert(t.length?t.map(e=>`${e.bidderName||e.bidderId?.slice(0,6)} — ${(Number(e.amountEur)||0).toLocaleString(`sl-SI`)} €`).join(`
`):`Ni ponudb.`)}}catch(t){e.innerHTML=Q(t)}}async function At(){let e=document.getElementById(`drazbe-alerts`);if(e)try{let t=await xe();if(!t.length){e.innerHTML=`<div class="adm-empty">Ni prijav.</div>`;return}e.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>E-pošta</th><th>Zanima</th><th>Datum</th></tr></thead>
            <tbody>
              ${t.map(e=>`
                <tr>
                  <td>${Z(e.email||`—`)}</td>
                  <td class="adm-sub">${Z(e.criteria?.interest||`—`)}</td>
                  <td class="adm-sub">${X(e.createdAt)}</td>
                </tr>`).join(``)}
            </tbody>
          </table>`}catch(t){e.innerHTML=Q(t)}}async function jt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`;try{let[e,t,n,r]=await Promise.all([g(),a(30),p(8),getSearchAnalytics(20)]);if(document.getElementById(`ana-kpis`).innerHTML=`
          ${Y(`Skupaj oglasov`,e.totalListings,`📋`,`blue`)}
          ${Y(`Aktivni`,e.activeCount,`✅`,`green`)}
          ${Y(`Novih danes`,e.newToday,`🆕`,`orange`)}
          ${Y(`Skupaj uporabnikov`,e.totalUsers,`👥`,`purple`)}`,typeof Chart<`u`){y&&=(y.destroy(),null);let e=document.getElementById(`ana-chart-listings`);e&&(y=new Chart(e,{type:`line`,data:{labels:t.map(e=>e.date.slice(5)),datasets:[{label:`Oglasi`,data:t.map(e=>e.count),borderColor:`#2563eb`,backgroundColor:`rgba(37,99,235,0.08)`,tension:.3,fill:!0,pointRadius:3}]},options:{responsive:!0,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0}}}}));let r=document.getElementById(`ana-chart-brands`);r&&n.length&&new Chart(r,{type:`doughnut`,data:{labels:n.map(e=>e.name),datasets:[{data:n.map(e=>e.count),backgroundColor:[`#2563eb`,`#7c3aed`,`#db2777`,`#ea580c`,`#16a34a`,`#0891b2`,`#ca8a04`,`#9333ea`]}]},options:{responsive:!0,plugins:{legend:{position:`right`}}}})}let i=document.getElementById(`ana-search-table`);r.length?i.innerHTML=`
              <table class="adm-table">
                <thead><tr><th>Poizvedba</th><th>Kategorija</th><th>Število iskanj</th><th>Brez rezultatov</th></tr></thead>
                <tbody>
                  ${r.map(e=>`
                    <tr>
                      <td><strong>${Z(e.query||e.id)}</strong></td>
                      <td>${Z(e.category||`—`)}</td>
                      <td><strong>${e.count||0}</strong></td>
                      <td>${e.noResults?`<span class="adm-badge adm-badge-red">Da</span>`:`<span class="adm-badge adm-badge-green">Ne</span>`}</td>
                    </tr>`).join(``)}
                </tbody>
              </table>`:i.innerHTML=`<div class="adm-empty">Ni podatkov o iskanjih.</div>`}catch(e){document.getElementById(`ana-kpis`).innerHTML=Q(e)}}async function Mt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>SEO strani</h3>
          <button class="adm-btn adm-btn-primary" id="seo-add-btn">+ Dodaj stran</button>
        </div>
        <div class="adm-table-wrap" id="seo-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`,document.getElementById(`seo-add-btn`).addEventListener(`click`,()=>rn(null)),Nt()}async function Nt(){let e=document.getElementById(`seo-table`);if(e)try{let t=await le();if(!t.length){e.innerHTML=`<div class="adm-empty">Ni SEO strani. Dodajte prvo.</div>`;return}e.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>Slug / URL</th><th>Meta naslov</th><th>Meta opis</th><th>Akcije</th></tr></thead>
            <tbody>
              ${t.map(e=>`
                <tr>
                  <td><code>${Z(e.slug||``)}</code></td>
                  <td>${Z(e.metaTitle||`—`)}</td>
                  <td class="adm-sub" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${Z(e.metaDescription||`—`)}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs" onclick="window.__seoEdit('${e.id}')">✏️ Uredi</button>
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`,window.__seoEdit=e=>rn(t.find(t=>t.id===e))}catch(t){e.innerHTML=Q(t)}}async function Pt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-kpi-grid">
        ${Y(`Skupaj transakcij`,`—`,`💳`,`blue`)}
        ${Y(`Uspešnih`,`—`,`✅`,`green`)}
        ${Y(`Neuspešnih`,`—`,`❌`,`red`)}
        ${Y(`Skupni prihodek`,`—`,`💰`,`purple`)}
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
      </div>`;try{let e=(await u()).packages||{};document.getElementById(`pay-packages-wrap`).innerHTML=`
          <div class="adm-pkg-grid">
            ${Object.entries(e).map(([e,t])=>`
              <div class="adm-pkg-card">
                <div class="adm-pkg-name">${Z(t.name||e)}</div>
                <div class="adm-pkg-price">${t.price===0?`Brezplačno`:t.price+` € / oglas`}</div>
                <ul class="adm-pkg-features">
                  <li>Do ${t.maxListings===999?`∞`:t.maxListings} oglasov</li>
                  <li>${t.durationDays} dni veljavnosti</li>
                </ul>
              </div>`).join(``)}
          </div>
          <div style="padding:1.5rem;border-top:1px solid #e5e7eb">
            <button class="adm-btn adm-btn-primary" onclick="window.__adminNav('settings')">⚙️ Uredi pakete v Nastavitvah</button>
          </div>`}catch(e){document.getElementById(`pay-packages-wrap`).innerHTML=Q(e)}}async function Ft(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`}async function It(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header">
          <h3>AutoHub News — članki</h3>
          <button class="adm-btn adm-btn-primary" id="news-add-btn">+ Nov članek</button>
        </div>
        <p style="padding:0 1.5rem 1rem;color:#6b7280;font-size:.85rem;">
          Novice in nasveti za avtomobile in motorje. Objavljeni članki se prikažejo na strani
          <a href="#/novice" target="_blank" style="color:#2563eb;">AutoHub News</a> in na domači strani.
        </p>
        <div class="adm-table-wrap" id="news-table-wrap"><div class="adm-loading"><div class="adm-spinner"></div></div></div>
      </div>`,document.getElementById(`news-add-btn`).addEventListener(`click`,()=>Ut(null)),Lt()}async function Lt(){let e=document.getElementById(`news-table-wrap`);if(e){e.innerHTML=`<div class="adm-loading"><div class="adm-spinner"></div></div>`;try{let t=await Te();if(!t.length){e.innerHTML=`<div style="padding:2.5rem;text-align:center;color:#9ca3af;">Ni člankov. Kliknite "+ Nov članek".</div>`;return}e.innerHTML=`<table class="adm-table">
          <thead><tr><th>Naslov</th><th>Kategorija</th><th>Status</th><th>Posodobljeno</th><th>Akcije</th></tr></thead>
          <tbody>
            ${t.map(e=>`
              <tr>
                <td>
                  <div class="adm-listing-cell">
                    ${e.coverImage?`<img src="${Z(e.coverImage)}" class="adm-thumb">`:`<div class="adm-thumb adm-thumb--empty">📰</div>`}
                    <div>
                      <strong>${Z(e.title||`—`)}</strong>
                      <div class="adm-sub">/${Z(e.slug||``)}</div>
                    </div>
                  </div>
                </td>
                <td><span class="adm-badge adm-badge-gray">${Z(ke(e.category))}</span></td>
                <td>${e.status===`published`?`<span class="adm-badge adm-badge-green">Objavljen</span>`:`<span class="adm-badge adm-badge-yellow">Osnutek</span>`}</td>
                <td class="adm-sub">${X(e.updatedAt||e.createdAt)}</td>
                <td class="adm-actions">
                  <button class="adm-btn adm-btn-xs" title="Uredi" onclick="window.__newsEdit('${e.id}')">✏️</button>
                  <button class="adm-btn adm-btn-xs adm-btn-red" title="Izbriši" onclick="window.__newsDelete('${e.id}')">🗑</button>
                </td>
              </tr>`).join(``)}
          </tbody>
        </table>`,window.__newsEdit=e=>{Ut(t.find(t=>t.id===e))},window.__newsDelete=e=>{J(`Izbrisati članek "${t.find(t=>t.id===e)?.title||e}"?`,async()=>{try{await Oe(e),await _(v.uid,v.displayName,`NEWS_DELETE`,e),$(`Članek izbrisan.`,`success`),Lt()}catch(e){$(`Napaka: `+e.message,`error`)}})}}catch(t){e.innerHTML=Q(t)}}}var W=[],G={};function Rt(){return`b`+Math.random().toString(36).slice(2,9)}function zt(){let e=document.getElementById(`nb-editor`);e&&(e.innerHTML=W.map((e,t)=>Bt(e,t)).join(``),e.querySelectorAll(`[data-block-id]`).forEach(e=>Vt(e)))}function Bt(e,t){let n=e.id,r=`<div class="nb-controls">${t>0?`<button class="nb-ctrl-btn" data-action="up"   data-id="${n}" title="Gor">↑</button>`:``}${t<W.length-1?`<button class="nb-ctrl-btn" data-action="down" data-id="${n}" title="Dol">↓</button>`:``}${`<button class="nb-ctrl-btn nb-ctrl-del" data-action="del"  data-id="${n}" title="Izbriši">✕</button>`}</div>`,i=``;return e.type===`heading`?i=`<div class="nb-block nb-block--heading" data-block-id="${n}">
            ${r}
            <div class="nb-label">Naslov</div>
            <select class="nb-heading-level adm-select" data-id="${n}" style="width:80px;margin-bottom:.4rem;">
              <option value="2" ${e.level==2?`selected`:``}>H2</option>
              <option value="3" ${e.level==3?`selected`:``}>H3</option>
              <option value="4" ${e.level==4?`selected`:``}>H4</option>
            </select>
            <input class="adm-input nb-text-input" data-field="text" data-id="${n}" value="${Z(e.text||``)}" placeholder="Naslov razdelka…">
          </div>`:e.type===`paragraph`?i=`<div class="nb-block nb-block--para" data-block-id="${n}">
            ${r}
            <div class="nb-label">Odstavek</div>
            <textarea class="adm-input nb-text-input" data-field="text" data-id="${n}" rows="3" placeholder="Besedilo odstavka…">${Z(e.text||``)}</textarea>
          </div>`:e.type===`image`?i=`<div class="nb-block nb-block--image" data-block-id="${n}">
            ${r}
            <div class="nb-label">Slika</div>
            <div id="nb-img-preview-${n}">${e.url?`<img src="${Z(e.url)}" style="max-height:140px;border-radius:.5rem;margin-bottom:.4rem;">`:G[n]?`<div style="color:#6b7280;font-size:.8rem;">📎 ${Z(G[n].name)}</div>`:``}</div>
            <input type="file" accept="image/*" class="adm-input nb-img-file" data-id="${n}" style="margin-bottom:.4rem;">
            <input class="adm-input nb-text-input" data-field="caption" data-id="${n}" value="${Z(e.caption||``)}" placeholder="Napis slike (neobvezno)…">
            <input class="adm-input nb-text-input" data-field="source" data-id="${n}" value="${Z(e.source||``)}" placeholder="Vir (npr. InsideEVs.de)…" style="margin-top:.3rem;">
          </div>`:e.type===`bullets`||e.type===`numbered`?i=`<div class="nb-block nb-block--list" data-block-id="${n}">
            ${r}
            <div class="nb-label">${e.type===`bullets`?`Seznam (•)`:`Seznam (1.)`}</div>
            <div class="nb-list-items" id="nb-list-${n}">
              ${(e.items||[]).map((t,r)=>`
                <div class="nb-list-row" data-list-id="${n}" data-li="${r}">
                  <span class="nb-list-bullet">${e.type===`bullets`?`○`:``+(r+1)+`.`}</span>
                  <input class="adm-input nb-list-item-input" data-id="${n}" data-li="${r}" value="${Z(t.text||``)}" placeholder="Postavka…">
                  <input class="adm-input nb-list-item-bold" data-id="${n}" data-li="${r}" value="${Z(t.bold||``)}" placeholder="Krepko (neobvezno)…" style="max-width:160px;">
                  <button class="nb-ctrl-btn nb-ctrl-del" data-action="del-li" data-id="${n}" data-li="${r}" title="Odstrani">✕</button>
                </div>`).join(``)}
            </div>
            <button class="nb-add-li adm-btn adm-btn-xs" data-action="add-li" data-id="${n}" style="margin-top:.4rem;">+ Dodaj postavko</button>
          </div>`:e.type===`quote`?i=`<div class="nb-block nb-block--quote" data-block-id="${n}">
            ${r}
            <div class="nb-label">Citat / poudarek</div>
            <textarea class="adm-input nb-text-input" data-field="text" data-id="${n}" rows="2" placeholder="Citirano besedilo…">${Z(e.text||``)}</textarea>
            <input class="adm-input nb-text-input" data-field="source" data-id="${n}" value="${Z(e.source||``)}" placeholder="Vir citata…" style="margin-top:.3rem;">
          </div>`:e.type===`divider`&&(i=`<div class="nb-block nb-block--divider" data-block-id="${n}">
            ${r}
            <div class="nb-label">Ločilo</div>
            <hr style="border:none;border-top:2px solid #e5e7eb;margin:.5rem 0;">
          </div>`),i}function Vt(e){e.dataset.blockId,e.querySelectorAll(`[data-action]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.dataset.action,r=e.dataset.id,i=e.dataset.li===void 0?null:parseInt(e.dataset.li),a=W.findIndex(e=>e.id===r);if(n===`up`&&a>0&&([W[a-1],W[a]]=[W[a],W[a-1]]),n===`down`&&a<W.length-1&&([W[a],W[a+1]]=[W[a+1],W[a]]),n===`del`&&(W.splice(a,1),delete G[r]),n===`add-li`){let e=W[a];e.items=[...e.items||[],{text:``,bold:``}]}if(n===`del-li`&&i!==null){let e=W[a];e.items=(e.items||[]).filter((e,t)=>t!==i)}zt()})}),e.querySelectorAll(`.nb-text-input`).forEach(e=>{e.addEventListener(`input`,()=>{let t=W.find(t=>t.id===e.dataset.id);t&&(t[e.dataset.field]=e.value)})}),e.querySelector(`.nb-heading-level`)?.addEventListener(`change`,e=>{let t=W.find(t=>t.id===e.target.dataset.id);t&&(t.level=parseInt(e.target.value))}),e.querySelectorAll(`.nb-list-item-input`).forEach(e=>{e.addEventListener(`input`,()=>{let t=W.find(t=>t.id===e.dataset.id);t?.items&&(t.items[parseInt(e.dataset.li)].text=e.value)})}),e.querySelectorAll(`.nb-list-item-bold`).forEach(e=>{e.addEventListener(`input`,()=>{let t=W.find(t=>t.id===e.dataset.id);t?.items&&(t.items[parseInt(e.dataset.li)].bold=e.value)})}),e.querySelector(`.nb-img-file`)?.addEventListener(`change`,e=>{let t=e.target.files?.[0];if(!t)return;let n=e.target.dataset.id;G[n]=t;let r=document.getElementById(`nb-img-preview-${n}`);r&&(r.innerHTML=`<img src="${URL.createObjectURL(t)}" style="max-height:140px;border-radius:.5rem;margin-bottom:.4rem;">`)})}function Ht(e){let t={id:Rt(),type:e};e===`heading`&&(t.text=``,t.level=2),e===`paragraph`&&(t.text=``),e===`image`&&(t.url=``,t.caption=``,t.source=``),(e===`bullets`||e===`numbered`)&&(t.items=[{text:``,bold:``}]),e===`quote`&&(t.text=``,t.source=``),W.push(t),zt(),setTimeout(()=>{document.querySelector(`#nb-editor [data-block-id]:last-child`)?.scrollIntoView({behavior:`smooth`,block:`nearest`})},50)}function Ut(e){let t=!!e,n=e||{},r=Me.map(e=>`<option value="${e.value}" ${n.category===e.value?`selected`:``}>${Z(e.label)}</option>`).join(``);if(W=[],G={},n.body)try{let e=JSON.parse(n.body);Array.isArray(e)&&(W=e.map(e=>({...e,id:e.id||Rt()})))}catch{W=String(n.body).split(/\n{2,}/).filter(e=>e.trim()).map(e=>({id:Rt(),type:`paragraph`,text:e.trim()}))}let i=q(t?`Uredi članek`:`Nov članek`,`
      <style>
        .nb-editor-wrap { display:flex; flex-direction:column; gap:0; }
        .nb-block { position:relative; border:1px solid #e5e7eb; border-radius:.6rem; padding:.75rem .75rem .75rem 2.5rem; margin-bottom:.6rem; background:#fafafa; }
        .dark-mode .nb-block { background:#1e2130; border-color:#374151; }
        .nb-block--heading { border-left:3px solid #6366f1; }
        .nb-block--image   { border-left:3px solid #10b981; }
        .nb-block--list    { border-left:3px solid #f59e0b; }
        .nb-block--quote   { border-left:3px solid #8b5cf6; background:#f5f3ff; }
        .dark-mode .nb-block--quote { background:#1a1830; }
        .nb-block--divider { border-left:3px solid #cbd5e1; }
        .nb-label { font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#9ca3af; margin-bottom:.35rem; }
        .nb-controls { position:absolute; top:.5rem; left:.3rem; display:flex; flex-direction:column; gap:2px; }
        .nb-ctrl-btn { background:none; border:none; cursor:pointer; color:#9ca3af; font-size:.75rem; line-height:1; padding:2px 4px; border-radius:3px; }
        .nb-ctrl-btn:hover { background:#f3f4f6; color:#374151; }
        .dark-mode .nb-ctrl-btn:hover { background:#374151; color:#e5e7eb; }
        .nb-ctrl-del:hover { background:#fee2e2 !important; color:#dc2626 !important; }
        .nb-add-btn-row { display:flex; gap:.5rem; flex-wrap:wrap; padding:.5rem 0; }
        .nb-add-btn { background:#f3f4f6; border:1px dashed #d1d5db; border-radius:.5rem; padding:.35rem .7rem; font-size:.78rem; cursor:pointer; color:#374151; display:flex; align-items:center; gap:.3rem; transition:background .15s; }
        .nb-add-btn:hover { background:#e0e7ff; border-color:#6366f1; color:#4f46e5; }
        .dark-mode .nb-add-btn { background:#1e2130; border-color:#374151; color:#d1d5db; }
        .nb-list-row { display:flex; align-items:center; gap:.4rem; margin-bottom:.3rem; }
        .nb-list-bullet { color:#9ca3af; font-size:.8rem; min-width:18px; }
        .nb-list-item-input { flex:1; }
      </style>
      <div class="adm-form-row">
        <label>Naslov *</label>
        <input id="news-title" class="adm-input" value="${Z(n.title||``)}" placeholder="npr. Test: novi električni SUV">
      </div>
      <div class="adm-form-row">
        <label>URL (slug)</label>
        <input id="news-slug" class="adm-input" value="${Z(n.slug||``)}" placeholder="samodejno iz naslova">
        <small style="color:#9ca3af;font-size:.75rem;">Pusti prazno za samodejno generiranje.</small>
      </div>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;">
        <div class="adm-form-row" style="flex:1;min-width:160px;">
          <label>Kategorija</label>
          <select id="news-category" class="adm-select">${r}</select>
        </div>
        <div class="adm-form-row" style="flex:1;min-width:160px;">
          <label>Avtor</label>
          <input id="news-author" class="adm-input" value="${Z(n.author||``)}" placeholder="Uredništvo">
        </div>
      </div>
      <div class="adm-form-row">
        <label>Naslovna slika</label>
        <input type="file" id="news-cover-file" accept="image/*" class="adm-input">
        <div id="news-cover-preview" style="margin-top:.5rem;">
          ${n.coverImage?`<img src="${Z(n.coverImage)}" style="max-height:120px;border-radius:.5rem;">`:``}
        </div>
      </div>
      <div class="adm-form-row">
        <label>Povzetek</label>
        <textarea id="news-excerpt" class="adm-input" rows="2" placeholder="Kratek opis, prikazan na kartici.">${Z(n.excerpt||``)}</textarea>
      </div>

      <div class="adm-form-row">
        <label style="margin-bottom:.5rem;">Vsebina članka *</label>
        <div class="nb-editor-wrap">
          <div id="nb-editor"></div>
          <div class="nb-add-btn-row">
            <button type="button" class="nb-add-btn" data-add="heading">📌 Naslov</button>
            <button type="button" class="nb-add-btn" data-add="paragraph">¶ Odstavek</button>
            <button type="button" class="nb-add-btn" data-add="image">🖼 Slika</button>
            <button type="button" class="nb-add-btn" data-add="bullets">• Seznam</button>
            <button type="button" class="nb-add-btn" data-add="numbered">1. Seznam</button>
            <button type="button" class="nb-add-btn" data-add="quote">❝ Citat</button>
            <button type="button" class="nb-add-btn" data-add="divider">─ Ločilo</button>
          </div>
        </div>
      </div>

      <div class="adm-form-row adm-form-row--check">
        <label>Objavi takoj</label>
        <input type="checkbox" id="news-publish" ${n.status===`published`?`checked`:``}>
      </div>
    `,async e=>{let r=document.getElementById(`news-title`).value.trim();if(!r){$(`Naslov je obvezen.`,`error`);return}if(!W.length){$(`Dodajte vsaj en blok vsebine.`,`error`);return}let i=document.getElementById(`adm-modal-confirm`);i&&(i.disabled=!0,i.textContent=`Shranjujem…`);try{let i=n.coverImage||``,a=document.getElementById(`news-cover-file`).files?.[0];a&&(i=await Ae(a));let o=await Promise.all(W.map(async e=>{if(e.type===`image`&&G[e.id]){let t=await Ae(G[e.id]);return{...e,url:t}}return e})),s={title:r,slug:Ee(document.getElementById(`news-slug`).value.trim()||r),category:document.getElementById(`news-category`).value,author:document.getElementById(`news-author`).value.trim(),excerpt:document.getElementById(`news-excerpt`).value.trim(),body:JSON.stringify(o),coverImage:i,status:document.getElementById(`news-publish`).checked?`published`:`draft`};if(t)await De(n.id,s),await _(v.uid,v.displayName,`NEWS_UPDATE`,n.id,{title:r});else{let e=await je(s);await _(v.uid,v.displayName,`NEWS_CREATE`,e,{title:r})}$(t?`Članek posodobljen.`:`Članek ustvarjen.`,`success`),e.remove(),Lt()}catch(e){$(`Napaka: `+e.message,`error`),i&&(i.disabled=!1,i.textContent=`Potrdi`)}});zt(),i.querySelectorAll(`[data-add]`).forEach(e=>{e.addEventListener(`click`,()=>Ht(e.dataset.add))}),i.querySelector(`#news-cover-file`)?.addEventListener(`change`,e=>{let t=e.target.files?.[0],n=document.getElementById(`news-cover-preview`);t&&n&&(n.innerHTML=`<img src="${URL.createObjectURL(t)}" style="max-height:120px;border-radius:.5rem;">`)})}async function Wt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header"><h3>Audit log (zadnjih 100 akcij)</h3></div>
        <div class="adm-table-wrap" id="audit-table">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;try{let e=await h(100),t=document.getElementById(`audit-table`);if(!e.length){t.innerHTML=`<div class="adm-empty">Ni logov.</div>`;return}t.innerHTML=`
          <table class="adm-table">
            <thead><tr><th>Čas</th><th>Admin</th><th>Akcija</th><th>Target</th><th>Podrobnosti</th></tr></thead>
            <tbody>
              ${e.map(e=>`
                <tr>
                  <td class="adm-sub">${X(e.createdAt)}</td>
                  <td class="adm-sub">${Z(e.adminName||e.adminUid?.slice(0,8)||`—`)}</td>
                  <td><code style="font-size:.8rem">${Z(e.action||``)}</code></td>
                  <td class="adm-sub">${Z(e.target||``)}</td>
                  <td class="adm-sub" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${Z(JSON.stringify(e.details||{}))}</td>
                </tr>`).join(``)}
            </tbody>
          </table>`}catch(e){document.getElementById(`audit-table`).innerHTML=Q(e)}}async function Gt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
      <div class="adm-card">
        <div class="adm-card-header"><h3>Nastavitve sistema</h3></div>
        <div id="settings-form-wrap">
          <div class="adm-loading"><div class="adm-spinner"></div></div>
        </div>
      </div>`;try{let e=await u();document.getElementById(`settings-form-wrap`).innerHTML=`
          <form id="settings-form" style="padding:1.5rem">
            <div class="adm-form-grid">

              <div class="adm-form-section">
                <h4>Paketi</h4>
                <div class="adm-form-row">
                  <label>Premium cena (€)</label>
                  <input class="adm-input" name="premiumPrice" type="number" step="0.01" value="${e.packages?.premium?.price||9.99}">
                </div>
                <div class="adm-form-row">
                  <label>Dealer mesečnina (€)</label>
                  <input class="adm-input" name="dealerPrice" type="number" step="0.01" value="${e.packages?.dealer?.price||49.99}">
                </div>
                <div class="adm-form-row">
                  <label>Featured cena / dan (€)</label>
                  <input class="adm-input" name="featuredPricePerDay" type="number" step="0.01" value="${e.featuredPricePerDay||2.99}">
                </div>
              </div>

              <div class="adm-form-section">
                <h4>Oglasi</h4>
                <div class="adm-form-row">
                  <label>Max slik / oglas</label>
                  <input class="adm-input" name="maxImagesPerListing" type="number" value="${e.maxImagesPerListing||20}">
                </div>
                <div class="adm-form-row">
                  <label>Samodejni potek (dni)</label>
                  <input class="adm-input" name="listingAutoExpireDays" type="number" value="${e.listingAutoExpireDays||90}">
                </div>
                <div class="adm-form-row adm-form-row--check">
                  <label>Oglasi gostov (brez prijave)</label>
                  <input type="checkbox" name="allowGuestListings" ${e.allowGuestListings?`checked`:``}>
                </div>
              </div>

              <div class="adm-form-section">
                <h4>Sistem</h4>
                <div class="adm-form-row adm-form-row--check">
                  <label>Vzdrževalni način</label>
                  <input type="checkbox" name="maintenanceMode" ${e.maintenanceMode?`checked`:``}>
                </div>
              </div>

            </div>
            <div style="padding-top:1.5rem;border-top:1px solid #e5e7eb;display:flex;gap:.75rem">
              <button type="submit" class="adm-btn adm-btn-primary">💾 Shrani nastavitve</button>
            </div>
          </form>`,document.getElementById(`settings-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={"packages.premium.price":parseFloat(t.get(`premiumPrice`)),"packages.dealer.price":parseFloat(t.get(`dealerPrice`)),featuredPricePerDay:parseFloat(t.get(`featuredPricePerDay`)),maxImagesPerListing:parseInt(t.get(`maxImagesPerListing`)),listingAutoExpireDays:parseInt(t.get(`listingAutoExpireDays`)),allowGuestListings:t.get(`allowGuestListings`)===`on`,maintenanceMode:t.get(`maintenanceMode`)===`on`};try{await ee(n),await _(v.uid,v.displayName,`SETTINGS_UPDATE`,`siteConfig`,n),$(`Nastavitve shranjene.`,`success`)}catch(e){$(`Napaka: `+e.message,`error`)}})}catch(e){document.getElementById(`settings-form-wrap`).innerHTML=Q(e)}}function Kt(e){return{deli:`Deli`,gume:`Gume`,oboje:`Deli in gume`}[e]||e||`—`}async function qt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`,document.getElementById(`ws-add`).addEventListener(`click`,()=>Jt(null)),K()}async function K(){let e=document.getElementById(`ws-table-wrap`);if(e)try{let r=await t();if(!r.length){e.innerHTML=`<div style="padding:2.5rem;text-align:center;color:#9ca3af;">Ni dodanih virov. Kliknite "+ Dodaj vir".</div>`;return}e.innerHTML=`<table class="adm-table">
          <thead><tr><th>Domena</th><th>Naziv</th><th>Kategorija</th><th>Odobreno</th><th>Status</th><th>Zadnji zajem</th><th>Akcije</th></tr></thead>
          <tbody>
            ${r.map(e=>`<tr>
              <td><strong>${Z(e.domain||``)}</strong></td>
              <td style="font-size:.85rem">${Z(e.name||`—`)}</td>
              <td>${Kt(e.category)}</td>
              <td>${e.approved?`<span class="adm-badge adm-badge-green">DA</span>`:`<span class="adm-badge adm-badge-gray">NE</span>`}</td>
              <td>${e.status===`paused`?`<span class="adm-badge adm-badge-gray">Pavza</span>`:`<span class="adm-badge adm-badge-blue">Aktiven</span>`}</td>
              <td style="font-size:.8rem">${e.lastScrapedAt?X(e.lastScrapedAt):`—`}</td>
              <td style="white-space:nowrap">
                <button class="adm-btn adm-btn-xs" data-edit="${e.id}">Uredi</button>
                <button class="adm-btn adm-btn-xs ${e.approved?``:`adm-btn-green`}" data-toggle="${e.id}">${e.approved?`Prekliči`:`Odobri`}</button>
                <button class="adm-btn adm-btn-xs adm-btn-red" data-del="${e.id}">Izbriši</button>
              </td>
            </tr>`).join(``)}
          </tbody></table>`,e.querySelectorAll(`[data-edit]`).forEach(e=>e.addEventListener(`click`,()=>Jt(r.find(t=>t.id===e.dataset.edit)))),e.querySelectorAll(`[data-toggle]`).forEach(e=>e.addEventListener(`click`,async()=>{let t=r.find(t=>t.id===e.dataset.toggle);try{await n(t.id,{approved:!t.approved}),await _(v.uid,v.displayName,`SCRAPING_SOURCE_APPROVE`,t.domain,{approved:!t.approved}),$(`Posodobljeno.`,`success`),K()}catch(e){$(`Napaka: `+e.message,`error`)}})),e.querySelectorAll(`[data-del]`).forEach(e=>e.addEventListener(`click`,async()=>{let t=r.find(t=>t.id===e.dataset.del);if(confirm(`Izbrišem vir "${t.domain}"?`))try{await se(t.id),await _(v.uid,v.displayName,`SCRAPING_SOURCE_DELETE`,t.domain),$(`Izbrisano.`,`success`),K()}catch(e){$(`Napaka: `+e.message,`error`)}}))}catch(t){e.innerHTML=Q(t)}}function Jt(e){q(e?`Uredi vir`:`Dodaj vir`,`
      <div class="adm-form-row"><label>Domena *</label>
        <input id="ws-domain" class="adm-input" value="${Z(e?.domain||``)}" placeholder="npr. rezervni-deli.si"></div>
      <div class="adm-form-row"><label>Naziv trgovine</label>
        <input id="ws-name" class="adm-input" value="${Z(e?.name||``)}" placeholder="npr. Rezervni Deli d.o.o."></div>
      <div class="adm-form-row"><label>Osnovni URL</label>
        <input id="ws-url" class="adm-input" value="${Z(e?.baseUrl||``)}" placeholder="https://www.rezervni-deli.si"></div>
      <div class="adm-form-row"><label>Kategorija</label>
        <select id="ws-cat" class="adm-select">
          <option value="oboje" ${e?.category===`oboje`?`selected`:``}>Deli in gume</option>
          <option value="deli"  ${e?.category===`deli`?`selected`:``}>Deli</option>
          <option value="gume"  ${e?.category===`gume`?`selected`:``}>Gume</option>
        </select></div>
      <div class="adm-form-row"><label>Opomba o dovoljenju</label>
        <textarea id="ws-note" class="adm-input" rows="2" placeholder="npr. pisno dovoljenje 2026-05">${Z(e?.permissionNote||``)}</textarea></div>
      <div class="adm-form-row adm-form-row--check"><label>Odobreno za zajem</label>
        <input type="checkbox" id="ws-approved" ${e?.approved?`checked`:``}></div>
      <div class="adm-form-row adm-form-row--check"><label>Na pavzi</label>
        <input type="checkbox" id="ws-paused" ${e?.status===`paused`?`checked`:``}></div>
    `,async t=>{let r=document.getElementById(`ws-domain`).value.trim();if(!r){$(`Domena je obvezna.`,`error`);return}let i={domain:r,name:document.getElementById(`ws-name`).value,baseUrl:document.getElementById(`ws-url`).value,category:document.getElementById(`ws-cat`).value,permissionNote:document.getElementById(`ws-note`).value,approved:document.getElementById(`ws-approved`).checked,status:document.getElementById(`ws-paused`).checked?`paused`:`active`};try{e?(await n(e.id,i),await _(v.uid,v.displayName,`SCRAPING_SOURCE_UPDATE`,r,i)):(await he(i),await _(v.uid,v.displayName,`SCRAPING_SOURCE_CREATE`,r,i)),$(e?`Vir posodobljen.`:`Vir dodan.`,`success`),t.remove(),K()}catch(e){$(`Napaka: `+e.message,`error`)}})}function Yt(e){return String(e||``).split(`
`).map(e=>{let t=e.split(`|`).map(e=>e.trim());if(t.length<3||!t[0])return null;let[n,r,i,a]=t;return{shop:n,domain:r,price:Number(String(i).replace(/[^0-9.]/g,``))||0,url:a||``,inStock:!0}}).filter(Boolean)}function Xt(e=[]){return e.map(e=>`${e.shop||``} | ${e.domain||``} | ${e.price??``} | ${e.url||``}`).join(`
`)}async function Zt(){let e=document.getElementById(`adm-content`);e.innerHTML=`
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
      </div>`,document.getElementById(`cat-add`).addEventListener(`click`,()=>$t(null)),Qt()}async function Qt(){let e=document.getElementById(`cat-table-wrap`);if(e)try{let t=await be();if(!t.length){e.innerHTML=`<div style="padding:2.5rem;text-align:center;color:#9ca3af;">Ni ročno vnesenih izdelkov. (Na strani Gume in deli so vseeno vidni mock izdelki.)</div>`;return}e.innerHTML=`<table class="adm-table">
          <thead><tr><th>Naziv</th><th>Tip</th><th>Vozilo</th><th>Najnižja cena</th><th>Ponudbe</th><th>Status</th><th>Akcije</th></tr></thead>
          <tbody>
            ${t.map(e=>`<tr>
              <td><strong>${Z(e.title||``)}</strong><br><small style="color:#6b7280">${Z(e.brand||``)}</small></td>
              <td>${e.itemType===`tire`?`Guma`:`Del`}</td>
              <td style="font-size:.8rem">${Z(e.vehicleCategory||``)}</td>
              <td>${e.lowestPrice==null?`—`:dn(e.lowestPrice)}</td>
              <td>${e.offerCount??(e.offers||[]).length}</td>
              <td>${e.status===`hidden`?`<span class="adm-badge adm-badge-gray">Skrit</span>`:`<span class="adm-badge adm-badge-green">Aktiven</span>`}</td>
              <td style="white-space:nowrap">
                <button class="adm-btn adm-btn-xs" data-edit="${e.id}">Uredi</button>
                <button class="adm-btn adm-btn-xs adm-btn-red" data-del="${e.id}">Izbriši</button>
              </td>
            </tr>`).join(``)}
          </tbody></table>`,e.querySelectorAll(`[data-edit]`).forEach(e=>e.addEventListener(`click`,()=>$t(t.find(t=>t.id===e.dataset.edit)))),e.querySelectorAll(`[data-del]`).forEach(e=>e.addEventListener(`click`,async()=>{let n=t.find(t=>t.id===e.dataset.del);if(confirm(`Izbrišem izdelek "${n.title}"?`))try{await fe(n.id),await _(v.uid,v.displayName,`CATALOG_DELETE`,n.title),$(`Izbrisano.`,`success`),Qt()}catch(e){$(`Napaka: `+e.message,`error`)}}))}catch(t){e.innerHTML=Q(t)}}function $t(e){let t=e?.attributes||{};q(e?`Uredi izdelek`:`Dodaj izdelek`,`
      <div class="adm-form-row"><label>Naziv *</label>
        <input id="cat-title" class="adm-input" value="${Z(e?.title||``)}" placeholder="npr. Michelin Primacy 4 205/55 R16"></div>
      <div class="adm-form-row"><label>Znamka</label>
        <input id="cat-brand" class="adm-input" value="${Z(e?.brand||``)}" placeholder="npr. Michelin"></div>
      <div class="adm-form-row"><label>Tip</label>
        <select id="cat-type" class="adm-select">
          <option value="part" ${e?.itemType===`part`?`selected`:``}>Del</option>
          <option value="tire" ${e?.itemType===`tire`?`selected`:``}>Guma</option>
        </select></div>
      <div class="adm-form-row"><label>Vozilo</label>
        <select id="cat-vehcat" class="adm-select">
          <option value="avto"        ${e?.vehicleCategory===`avto`?`selected`:``}>Avtomobili</option>
          <option value="moto"        ${e?.vehicleCategory===`moto`?`selected`:``}>Motorna kolesa</option>
          <option value="gospodarska" ${e?.vehicleCategory===`gospodarska`?`selected`:``}>Gospodarska</option>
          <option value="prosti-cas"  ${e?.vehicleCategory===`prosti-cas`?`selected`:``}>Prosti čas</option>
        </select></div>
      <div class="adm-form-row"><label>Slika (URL)</label>
        <input id="cat-img" class="adm-input" value="${Z(e?.imageUrl||``)}" placeholder="https://…"></div>

      <div class="adm-form-row"><label>Atributi gume: dimenzija</label>
        <input id="cat-size" class="adm-input" value="${Z(t.size||``)}" placeholder="205/55 R16"></div>
      <div class="adm-form-row"><label>Atributi gume: sezona</label>
        <select id="cat-season" class="adm-select">
          <option value="">—</option>
          <option value="letne"     ${t.season===`letne`?`selected`:``}>Letne</option>
          <option value="zimske"    ${t.season===`zimske`?`selected`:``}>Zimske</option>
          <option value="celoletne" ${t.season===`celoletne`?`selected`:``}>Celoletne</option>
        </select></div>
      <div class="adm-form-row"><label>Atributi dela: sklop / vrsta / OEM</label>
        <input id="cat-pgroup" class="adm-input" style="margin-bottom:.4rem" value="${Z(t.partGroup||``)}" placeholder="sklop (npr. zavore)">
        <input id="cat-ptype"  class="adm-input" style="margin-bottom:.4rem" value="${Z(t.partType||``)}" placeholder="vrsta (npr. ploscice)">
        <input id="cat-oem"    class="adm-input" value="${Z(t.oemNumber||``)}" placeholder="OEM številka"></div>

      <div class="adm-form-row"><label>Ponudbe trgovin (1 vrstica = Naziv | domena | cena | url)</label>
        <textarea id="cat-offers" class="adm-input" rows="5" placeholder="Pnevmatike24 | pnevmatike24.si | 89 | https://...">${Z(Xt(e?.offers))}</textarea></div>
      <div class="adm-form-row adm-form-row--check"><label>Skrij izdelek</label>
        <input type="checkbox" id="cat-hidden" ${e?.status===`hidden`?`checked`:``}></div>
    `,async t=>{let n=document.getElementById(`cat-title`).value.trim();if(!n){$(`Naziv je obvezen.`,`error`);return}let r=document.getElementById(`cat-type`).value,i=r===`tire`?{size:document.getElementById(`cat-size`).value.trim(),season:document.getElementById(`cat-season`).value}:{partGroup:document.getElementById(`cat-pgroup`).value.trim(),partType:document.getElementById(`cat-ptype`).value.trim(),oemNumber:document.getElementById(`cat-oem`).value.trim()},a={title:n,brand:document.getElementById(`cat-brand`).value.trim(),itemType:r,vehicleCategory:document.getElementById(`cat-vehcat`).value,imageUrl:document.getElementById(`cat-img`).value.trim(),attributes:i,offers:Yt(document.getElementById(`cat-offers`).value),status:document.getElementById(`cat-hidden`).checked?`hidden`:`active`};try{e?(await Ce(e.id,a),await _(v.uid,v.displayName,`CATALOG_UPDATE`,n,{offers:a.offers.length})):(await ae(a),await _(v.uid,v.displayName,`CATALOG_CREATE`,n,{offers:a.offers.length})),$(e?`Izdelek posodobljen.`:`Izdelek dodan.`,`success`),t.remove(),Qt()}catch(e){$(`Napaka: `+e.message,`error`)}})}function q(e,t,n=null){document.getElementById(`adm-modal-overlay`)?.remove();let r=document.createElement(`div`);r.id=`adm-modal-overlay`,r.className=`adm-modal-overlay`,r.innerHTML=`
      <div class="adm-modal">
        <div class="adm-modal-header">
          <h3>${Z(e)}</h3>
          <button class="adm-modal-close" id="adm-modal-close">✕</button>
        </div>
        <div class="adm-modal-body">${t}</div>
        ${n?`<div class="adm-modal-footer">
          <button class="adm-btn" id="adm-modal-cancel">Prekliči</button>
          <button class="adm-btn adm-btn-primary" id="adm-modal-confirm">Potrdi</button>
        </div>`:``}
      </div>`,document.body.appendChild(r);let i=()=>r.remove();return r.addEventListener(`click`,e=>{e.target===r&&i()}),document.getElementById(`adm-modal-close`).addEventListener(`click`,i),document.getElementById(`adm-modal-cancel`)?.addEventListener(`click`,i),n&&document.getElementById(`adm-modal-confirm`).addEventListener(`click`,()=>{n(r)}),r}function en(e){q(`Zavrni oglas`,`
      <div class="adm-form-row">
        <label>Razlog zavrnitve</label>
        <textarea id="reject-reason" class="adm-input" rows="3" placeholder="Npr. Napačni podatki, spam, previsoka cena…"></textarea>
      </div>`,async t=>{let n=document.getElementById(`reject-reason`).value;await _e(e,`rejected`,n),await _(v.uid,v.displayName,`LISTING_REJECTED`,e,{reason:n}),$(`Oglas zavrnjen.`,`success`),t.remove(),Pe===`listings`&&S(),Pe===`dashboard`&&He()})}function tn(e){q(`Nastavi sponzoring`,`
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
      </div>`,async t=>{let n=document.getElementById(`feat-tier`).value,r=parseInt(document.getElementById(`feat-days`).value)||7;await me(e,n,r),await _(v.uid,v.displayName,`LISTING_FEATURED`,e,{tier:n,days:r}),$(`Sponzoring nastavljen.`,`success`),t.remove()})}function nn(e,t){let n=t.find(t=>t.id===e);q(`Nastavi vlogo`,`
      <div class="adm-form-row"><label>Vloga za ${Z(n?.displayName||n?.email||e)}</label>
        <select id="role-select" class="adm-select">
          <option value="user"      ${n?.role===`user`?`selected`:``}>Uporabnik</option>
          <option value="dealer"    ${n?.role===`dealer`?`selected`:``}>Dealer</option>
          <option value="editor"    ${n?.role===`editor`?`selected`:``}>Urednik</option>
          <option value="moderator" ${n?.role===`moderator`?`selected`:``}>Moderator</option>
          <option value="admin"     ${n?.role===`admin`?`selected`:``}>Administrator</option>
        </select>
      </div>`,async t=>{let n=document.getElementById(`role-select`).value;try{await re(e,n),await _(v.uid,v.displayName,`USER_ROLE_CHANGE`,e,{role:n}),$(`Vloga posodobljena.`,`success`),t.remove(),T()}catch(e){$(`Napaka: `+e.message,`error`)}})}function rn(e){q(e?`Uredi SEO stran`:`Dodaj SEO stran`,`
      <div class="adm-form-row"><label>Slug (URL pot)</label>
        <input id="seo-slug" class="adm-input" value="${Z(e?.slug||``)}" placeholder="npr. /bmw/x5">
      </div>
      <div class="adm-form-row"><label>Meta naslov</label>
        <input id="seo-title" class="adm-input" value="${Z(e?.metaTitle||``)}" placeholder="BMW X5 rabljeni — MojAvto.si">
      </div>
      <div class="adm-form-row"><label>Meta opis</label>
        <textarea id="seo-desc" class="adm-input" rows="3" placeholder="Opisi, ki se prikazujejo v Googlu…">${Z(e?.metaDescription||``)}</textarea>
      </div>`,async e=>{let t=document.getElementById(`seo-slug`).value.trim(),n=document.getElementById(`seo-title`).value.trim(),r=document.getElementById(`seo-desc`).value.trim();if(!t){$(`Slug je obvezen.`,`error`);return}try{await s(t,{metaTitle:n,metaDescription:r}),$(`SEO stran shranjena.`,`success`),e.remove(),Nt()}catch(e){$(`Napaka: `+e.message,`error`)}})}function J(e,t){q(`Potrdite akcijo`,`<p style="margin:0">${Z(e)}</p>`,async e=>{e.remove(),await t()})}async function an(e){let t=e.target.value.toLowerCase().trim();if(!(!t||t.length<2))try{let{docs:e}=await ye({},20),n=e.filter(e=>(e.make||``).toLowerCase().includes(t)||(e.model||``).toLowerCase().includes(t)||(e.authorName||``).toLowerCase().includes(t)||(e.id||``).toLowerCase().includes(t));if(!n.length)return;q(`Rezultati iskanja: `+t,`
          <table class="adm-table">
            <thead><tr><th>Oglas</th><th>Status</th><th>Avtor</th><th>Akcija</th></tr></thead>
            <tbody>
              ${n.map(e=>`
                <tr>
                  <td><strong>${Z(e.make||``)} ${Z(e.model||``)}</strong></td>
                  <td>${on(e.status)}</td>
                  <td class="adm-sub">${Z(e.authorName||`—`)}</td>
                  <td>
                    <button class="adm-btn adm-btn-xs adm-btn-green" onclick="document.getElementById('adm-modal-overlay').remove();window.__lstApprove?.('${e.id}')">✓</button>
                    <button class="adm-btn adm-btn-xs adm-btn-red" onclick="document.getElementById('adm-modal-overlay').remove();window.__lstDelete?.('${e.id}')">🗑</button>
                  </td>
                </tr>`).join(``)}
            </tbody>
          </table>`)}catch{}}function Y(e,t,n,r){return`
      <div class="adm-kpi adm-kpi--${r}">
        <div class="adm-kpi-icon">${n}</div>
        <div class="adm-kpi-value">${t}</div>
        <div class="adm-kpi-label">${e}</div>
      </div>`}function on(e){let[t,n]={active:[`Aktiven`,`green`],pending:[`V pregledu`,`yellow`],rejected:[`Zavrnjen`,`red`],expired:[`Potekel`,`gray`]}[e]||[e||`—`,`gray`];return`<span class="adm-badge adm-badge-${n}">${t}</span>`}function sn(e){let[t,n]={admin:[`Administrator`,`purple`],moderator:[`Moderator`,`blue`],editor:[`Urednik`,`teal`],dealer:[`Dealer`,`orange`],user:[`Uporabnik`,`gray`]}[e]||[e||`Uporabnik`,`gray`];return`<span class="adm-badge adm-badge-${n}">${t}</span>`}function cn(e){let[t,n]={sponsored:[`⭐ Sponsored`,`purple`],homepage:[`🔝 Homepage`,`orange`],free:[`Brezplačni`,`gray`]}[e]||[e||`—`,`gray`];return`<span class="adm-badge adm-badge-${n}">${t}</span>`}function ln(e){let[t,n]={scam:[`🚨 Prevara`,`red`],spam:[`📧 Spam`,`yellow`],wrong:[`❌ Napačni podatki`,`orange`],other:[`❓ Drugo`,`gray`]}[e]||[Z(e||`—`),`gray`];return`<span class="adm-badge adm-badge-${n}">${t}</span>`}function un(e){let[t,n]={open:[`Odprto`,`red`],resolved:[`Rešeno`,`green`],dismissed:[`Zavrnjeno`,`gray`]}[e]||[e||`—`,`gray`];return`<span class="adm-badge adm-badge-${n}">${t}</span>`}function dn(e){return!e&&e!==0?`—`:new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(e)}function fn(e){return!e&&e!==0?`—`:new Intl.NumberFormat(`sl-SI`).format(e)+` km`}function X(e){if(!e)return`—`;let t=e?.toDate?e.toDate():e?.seconds?new Date(e.seconds*1e3):new Date(e);return isNaN(t)?`—`:t.toLocaleDateString(`sl-SI`,{day:`2-digit`,month:`2-digit`,year:`numeric`})}function Z(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function Q(e){return`<div class="adm-alert adm-alert-error">Napaka: ${Z(e?.message||String(e))}</div>`}window.__adminNav=e=>x(e);function $(e,t=`success`){document.querySelector(`.adm-toast`)?.remove();let n=document.createElement(`div`);n.className=`adm-toast adm-toast--${t}`,n.textContent=e,document.body.appendChild(n),setTimeout(()=>n.classList.add(`adm-toast--show`),10),setTimeout(()=>{n.classList.remove(`adm-toast--show`),setTimeout(()=>n.remove(),300)},3e3)}function pn(e,t){let n;return(...r)=>{clearTimeout(n),n=setTimeout(()=>e(...r),t)}}export{Ie as initAdminPage};