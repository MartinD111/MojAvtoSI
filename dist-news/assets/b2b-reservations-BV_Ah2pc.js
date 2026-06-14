import{t as e}from"./b2b-layout-DYP0LZVU.js";import{b as t,d as n,f as r,n as i,t as a}from"./b2bService-CdqiS2V3.js";var o={pending:{label:`Čaka potrditve`,color:`#d97706`,bg:`#fffbeb`},confirmed:{label:`Potrjeno`,color:`#2563eb`,bg:`#eff6ff`},completed:{label:`Zaključeno`,color:`#16a34a`,bg:`#f0fdf4`},cancelled:{label:`Preklicano`,color:`#dc2626`,bg:`#fef2f2`},blocked:{label:`Blokiran termin`,color:`#6b7280`,bg:`#f3f4f6`}};async function s(){let s=e({activeRoute:`/b2b/rezervacije`,title:`Rezervacije`});if(!s)return;let l=new URLSearchParams(location.hash.split(`?`)[1]||``).get(`status`)||``;s.innerHTML=`
        <div class="b2b-tabs" id="b2bResTabs">
            <button class="b2b-tab active" data-tab="bookings">
                <i data-lucide="calendar-check"></i> Rezervacije
            </button>
            <button class="b2b-tab" data-tab="tire-orders">
                <i data-lucide="package"></i> Naročila gum
                <span class="b2b-tab-badge" id="tireOrderBadge" style="display:none;">0</span>
            </button>
        </div>

        <div id="panelBookings">
            <div class="b2b-toolbar">
                <div class="b2b-filters">
                    <select id="resStatusFilter" class="b2b-select">
                        <option value="">Vsi statusi</option>
                        ${Object.entries(o).map(([e,t])=>`<option value="${e}" ${e===l?`selected`:``}>${t.label}</option>`).join(``)}
                    </select>
                    <div class="b2b-view-toggle">
                        <button class="b2b-view-btn active" data-view="list"><i data-lucide="list"></i> Seznam</button>
                        <button class="b2b-view-btn" data-view="calendar"><i data-lucide="calendar"></i> Koledar</button>
                    </div>
                </div>
                <button id="blockSlotBtn" class="btn b2b-btn-secondary"><i data-lucide="ban"></i> Blokiraj termin</button>
            </div>
            <div id="resContent" class="b2b-card b2b-card-flush">
                <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam rezervacije…</div>
            </div>
        </div>

        <div id="panelTireOrders" style="display:none;">
            <div id="tireOrdersContent" class="b2b-card b2b-card-flush">
                <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam naročila…</div>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons();let p=[],m=`list`;async function h(){let e=document.getElementById(`resStatusFilter`)?.value||``;try{p=await n(e?{status:e}:{}),g()}catch(e){document.getElementById(`resContent`).innerHTML=`<div class="b2b-empty"><i data-lucide="alert-triangle"></i><p>Napaka: ${e.message}</p></div>`,window.lucide&&window.lucide.createIcons()}}function g(){let e=document.getElementById(`resContent`);if(p.length===0){e.innerHTML=`<div class="b2b-empty"><i data-lucide="calendar-x"></i><p>Ni rezervacij za izbran filter.</p></div>`,window.lucide&&window.lucide.createIcons();return}m===`calendar`?e.innerHTML=u(p):e.innerHTML=c(p),x(e),window.lucide&&window.lucide.createIcons()}document.getElementById(`resStatusFilter`).addEventListener(`change`,h),document.querySelectorAll(`.b2b-view-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.b2b-view-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),m=e.dataset.view,g()})}),document.getElementById(`blockSlotBtn`).addEventListener(`click`,b),document.querySelectorAll(`.b2b-tab`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.b2b-tab`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=e.dataset.tab;document.getElementById(`panelBookings`).style.display=t===`bookings`?``:`none`,document.getElementById(`panelTireOrders`).style.display=t===`tire-orders`?``:`none`,t===`tire-orders`&&_()})}),h(),v();async function _(){let e=document.getElementById(`tireOrdersContent`);e.innerHTML=`<div class="b2b-loading"><i data-lucide="loader"></i> Nalagam naročila…</div>`,window.lucide&&window.lucide.createIcons();try{let t=await r(),n=document.getElementById(`tireOrderBadge`);if(n&&(n.textContent=t.length,n.style.display=t.length?`inline-flex`:`none`),t.length===0){e.innerHTML=`<div class="b2b-empty"><i data-lucide="package"></i><p>Ni čakajočih naročil gum.</p></div>`,window.lucide&&window.lucide.createIcons();return}e.innerHTML=`<div class="b2b-tire-orders-list">${t.map(d).join(``)}</div>`,y(e),window.lucide&&window.lucide.createIcons()}catch(t){e.innerHTML=`<div class="b2b-empty"><i data-lucide="alert-triangle"></i><p>Napaka: ${f(t.message)}</p></div>`,window.lucide&&window.lucide.createIcons()}}async function v(){try{let e=await r(),t=document.getElementById(`tireOrderBadge`);t&&e.length>0&&(t.textContent=e.length,t.style.display=`inline-flex`)}catch{}}function y(e){e.querySelectorAll(`.b2b-confirm-tire-order`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.orderId;e.disabled=!0,e.innerHTML=`<i data-lucide="loader"></i> Potrjujem...`,window.lucide&&window.lucide.createIcons();try{await i(t);let n=e.closest(`.b2b-tire-order-card`);n.innerHTML=`
                        <div class="b2b-tire-order-confirmed">
                            <i data-lucide="check-circle" style="color:#16a34a;width:20px;height:20px;"></i>
                            <div>
                                <strong>Sprejem potrjen!</strong><br>
                                <span style="font-size:0.82rem;color:#475569;">Kupec bo prejel SMS z linkom za rezervacijo termina.</span>
                            </div>
                        </div>`,window.lucide&&window.lucide.createIcons()}catch(t){alert(`Napaka: `+t.message),e.disabled=!1,e.innerHTML=`<i data-lucide="check-circle"></i> Potrdi sprejem`,window.lucide&&window.lucide.createIcons()}})})}async function b(){let e=prompt(`Datum (YYYY-MM-DD):`);if(!e)return;let t=prompt(`Ura (HH:MM), lahko prazno za cel dan:`)||`cel dan`,n=prompt(`Opomba (neobvezno):`)||``;try{await a(e,t,n),await h()}catch(e){alert(`Napaka: `+e.message)}}function x(e){e.querySelectorAll(`[data-action="status"]`).forEach(e=>{e.addEventListener(`change`,async n=>{let r=n.target.dataset.id,i=n.target.value;e.disabled=!0;try{await t(r,i),await h()}catch(t){alert(`Napaka: `+t.message),e.disabled=!1}})})}}function c(e){return`
        <table class="b2b-table">
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Ura</th>
                    <th>Stranka</th>
                    <th>Storitev</th>
                    <th>Znesek</th>
                    <th>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${e.map(e=>l(e)).join(``)}
            </tbody>
        </table>`}function l(e){let t=o[e.status]||{label:e.status,color:`#64748b`,bg:`#f1f5f9`},n=Array.isArray(e.services)?e.services.join(`, `):e.serviceId||`—`;return`
        <tr>
            <td>${f(e.date||`—`)}</td>
            <td>${f(e.time||`—`)}</td>
            <td>
                <div class="b2b-cell-primary">${f(e.customerName||e.customerId||`Anonimno`)}</div>
                <div class="b2b-cell-sub">${f(e.customerContact||``)}</div>
            </td>
            <td>${f(n)}</td>
            <td>${e.totalPrice?e.totalPrice+` €`:`—`}</td>
            <td>
                <select class="b2b-status-select" data-action="status" data-id="${e.id}" style="background:${t.bg};color:${t.color};">
                    ${Object.entries(o).map(([t,n])=>`<option value="${t}" ${t===e.status?`selected`:``}>${n.label}</option>`).join(``)}
                </select>
            </td>
            <td>${e.notes?`<span title="${f(e.notes)}"><i data-lucide="message-square"></i></span>`:``}</td>
        </tr>`}function u(e){let t={};for(let n of e){let e=n.date||`nedoločen`;(t[e]=t[e]||[]).push(n)}return`
        <div class="b2b-calendar">
            ${Object.keys(t).sort().map(e=>`
                <div class="b2b-calendar-day">
                    <div class="b2b-calendar-date">${e}</div>
                    <div class="b2b-calendar-slots">
                        ${t[e].sort((e,t)=>(e.time||``).localeCompare(t.time||``)).map(e=>{let t=o[e.status]||{label:e.status,color:`#64748b`,bg:`#f1f5f9`};return`
                            <div class="b2b-cal-slot" style="border-left:4px solid ${t.color};background:${t.bg};">
                                <div><strong>${f(e.time||`cel dan`)}</strong> · ${f(e.customerName||`—`)}</div>
                                <div class="b2b-cell-sub">${f(Array.isArray(e.services)?e.services.join(`, `):e.serviceId||``)}</div>
                            </div>`}).join(``)}
                    </div>
                </div>
            `).join(``)}
        </div>
    `}function d(e){let t=e.tireData||{},n=e.submittedAt?.toDate?e.submittedAt.toDate().toLocaleString(`sl-SI`):`—`;return`
        <div class="b2b-tire-order-card" data-order-id="${e.id}">
            <div class="b2b-tire-order-header">
                <div class="b2b-tire-order-title">
                    <i data-lucide="circle-dot" style="color:#2563eb;width:16px;height:16px;"></i>
                    <strong>${f(t.brand)} ${f(t.model)}</strong>
                    &mdash; ${f(t.dimension)} &times; ${t.quantity||`?`} kos
                </div>
                <div class="b2b-tire-order-time">
                    <i data-lucide="clock" style="width:12px;height:12px;"></i>
                    ${f(n)}
                </div>
            </div>
            <div class="b2b-tire-order-meta">
                <span>Kupec: ${f(e.buyerId)}</span>
                <span>Pričakovana dostava: <strong>${f(e.estimatedDeliveryDate||`—`)}</strong></span>
            </div>
            <div class="b2b-tire-order-banner">
                <i data-lucide="truck" style="width:14px;height:14px;"></i>
                Gume bodo dostavljene na vaš naslov.
            </div>
            <button class="btn b2b-btn-primary b2b-confirm-tire-order" data-order-id="${e.id}">
                <i data-lucide="check-circle"></i> Potrdi sprejem
            </button>
        </div>
    `}function f(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{s as initB2bReservationsPage};