import{a as e,o as t}from"./extensions-BVPcMrZL.js";import{t as n}from"./b2b-layout-DYP0LZVU.js";import{o as r}from"./b2bService-CdqiS2V3.js";async function i(){let i=n({activeRoute:`/b2b`,title:`Pregled`});if(!i)return;let u=e(),d=t();i.innerHTML=`
        <div class="b2b-grid">
            <div class="b2b-kpi-row">
                ${a(`Rezervacije`,`—`,`pending`,`calendar-check`,`#2563eb`)}
                ${a(`Storitve`,`—`,`services`,`tags`,`#16a34a`)}
                ${a(`Prihodki (opravljeno)`,`—`,`revenue`,`euro`,`#0d9488`)}
                ${d.includes(`dealer`)?a(`Zaloga vozil`,`—`,`inventory`,`warehouse`,`#f59e0b`):``}
                ${d.includes(`dealer`)?a(`Nova povpraševanja`,`—`,`leads`,`inbox`,`#ea580c`):``}
            </div>

            <section class="b2b-card">
                <h2 class="b2b-card-title"><i data-lucide="zap"></i> Hitra dejanja</h2>
                <div class="b2b-quick-actions">
                    <a href="#/b2b/storitve" class="b2b-quick-btn"><i data-lucide="plus"></i> Dodaj storitev</a>
                    <a href="#/novi-oglas" class="b2b-quick-btn"><i data-lucide="car"></i> Dodaj oglas</a>
                    ${d.includes(`dealer`)&&u?.businessTier===`verified`?`<a href="#/b2b/bulk-import" class="b2b-quick-btn"><i data-lucide="file-json"></i> Skupinski uvoz</a>`:``}
                    <a href="#/b2b/rezervacije?status=pending" class="b2b-quick-btn"><i data-lucide="calendar-check"></i> Odpri rezervacije</a>
                    <a href="#/b2b/profil" class="b2b-quick-btn"><i data-lucide="edit"></i> Uredi javni profil</a>
                    ${d.includes(`dealer`)?`<a href="#/b2b/zaloga" class="b2b-quick-btn"><i data-lucide="warehouse"></i> Upravljaj zalogo</a>`:``}
                    ${d.includes(`vulcanizer`)?`<a href="#/b2b/hotel-gum" class="b2b-quick-btn"><i data-lucide="circle-dot"></i> Hotel za gume</a>`:``}
                    ${d.includes(`mechanic`)?`<a href="#/b2b/servis-vnos" class="b2b-quick-btn"><i data-lucide="clipboard-list"></i> VIN servis vnos</a>`:``}
                </div>
            </section>

            <section class="b2b-card">
                <h2 class="b2b-card-title"><i data-lucide="info"></i> Status računa</h2>
                <ul class="b2b-info-list">
                    <li><strong>Ime podjetja:</strong> ${l(u?.companyDetails?.companyName||`—`)}</li>
                    <li><strong>Davčna:</strong> ${l(u?.companyDetails?.taxId||`—`)}</li>
                    <li><strong>Naslov:</strong> ${l(u?.companyDetails?.address||`—`)}</li>
                    <li><strong>Dejavnosti:</strong> ${d.length?d.map(e=>c(e)).join(`, `):`—`}</li>
                    <li><strong>Status:</strong> ${u?.businessTier===`verified`?`<span class="b2b-badge-ok">Verificirano</span>`:`<span class="b2b-badge-warn">V preverjanju</span>`}</li>
                </ul>
            </section>
        </div>
    `,window.lucide&&window.lucide.createIcons();try{let e=await r();o(`pending`,e.bookings.pending,`${e.bookings.total} skupaj`),o(`services`,e.services,``),o(`revenue`,s(e.bookings.revenue),`${e.bookings.completed} zaključeno`),o(`inventory`,e.inventory,``),o(`leads`,e.leads.new,`${e.leads.total} skupaj`)}catch(e){console.warn(`[b2b-dashboard] stats failed`,e),[`pending`,`services`,`revenue`,`inventory`,`leads`].forEach(e=>o(e,`0`,`ni podatkov`))}}function a(e,t,n,r,i){return`
        <div class="b2b-kpi" data-kpi="${n}">
            <div class="b2b-kpi-icon" style="background:${i}1a;color:${i};"><i data-lucide="${r}"></i></div>
            <div class="b2b-kpi-body">
                <div class="b2b-kpi-label">${e}</div>
                <div class="b2b-kpi-value" data-kpi-value>${t}</div>
                <div class="b2b-kpi-sub" data-kpi-sub>&nbsp;</div>
            </div>
        </div>`}function o(e,t,n){let r=document.querySelector(`[data-kpi="${e}"]`);r&&(r.querySelector(`[data-kpi-value]`).textContent=t,r.querySelector(`[data-kpi-sub]`).textContent=n||``)}function s(e){return new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(e||0)}function c(e){return{dealer:`Avtohiša`,mechanic:`Servis`,vulcanizer:`Vulkanizer`}[e]||e}function l(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{i as initB2bDashboardPage};