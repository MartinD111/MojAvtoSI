import{s as e}from"./extensions-BVPcMrZL.js";import{t}from"./b2b-layout-DYP0LZVU.js";import{b as n,d as r,p as i}from"./b2bService-CdqiS2V3.js";async function a(){let n=t({activeRoute:`/b2b/delavnica`,title:`Delavnica`});if(n){if(!e(`mechanic`)){n.innerHTML=`<div class="b2b-empty"><p>Delavnica je namenjena pooblaščenim servisom.</p></div>`;return}n.innerHTML=`
        <div class="b2b-workshop-grid">
            <section class="b2b-card b2b-card-flush b2b-workshop-day">
                <header class="b2b-card-title"><i data-lucide="sun"></i> Danes — <span id="today-date">${c()}</span></header>
                <div id="todayList"><div class="b2b-loading"><i data-lucide="loader"></i> Nalagam…</div></div>
            </section>
            <section class="b2b-card b2b-card-flush b2b-workshop-day">
                <header class="b2b-card-title"><i data-lucide="sunrise"></i> Jutri — <span id="tomorrow-date">${l(1)}</span></header>
                <div id="tomorrowList"></div>
            </section>
            <aside class="b2b-card">
                <header class="b2b-card-title"><i data-lucide="tags"></i> Storitve</header>
                <div id="svcMini"></div>
                <a href="#/b2b/storitve" class="btn b2b-btn-secondary btn-sm" style="margin-top:0.75rem;"><i data-lucide="edit"></i> Uredi cenik</a>
            </aside>
        </div>

        <div class="b2b-workshop-actions">
            <a href="#/b2b/servis-vnos" class="btn b2b-btn-primary"><i data-lucide="clipboard-list"></i> Nov servisni vnos (VIN)</a>
            <a href="#/b2b/rezervacije" class="btn b2b-btn-secondary"><i data-lucide="calendar"></i> Vse rezervacije</a>
        </div>
    `,window.lucide&&window.lucide.createIcons();try{let[e,t]=await Promise.all([r(),i()]),n=c(),a=l(1);o(`todayList`,e.filter(e=>e.date===n)),o(`tomorrowList`,e.filter(e=>e.date===a)),document.getElementById(`svcMini`).innerHTML=t.length?`<ul class="b2b-info-list">${t.slice(0,8).map(e=>`<li>${u(e.name)} <span class="b2b-cell-sub">· ${s(e)}</span></li>`).join(``)}</ul>`:`<p class="b2b-cell-sub">Ni shranjenih storitev.</p>`,window.lucide&&window.lucide.createIcons()}catch(e){document.getElementById(`todayList`).innerHTML=`<p>Napaka: ${e.message}</p>`}}}function o(e,t){let r=document.getElementById(e);if(!t.length){r.innerHTML=`<div class="b2b-empty-small"><i data-lucide="calendar-x"></i><p>Ni rezervacij.</p></div>`,window.lucide&&window.lucide.createIcons();return}r.innerHTML=[...t].sort((e,t)=>(e.time||``).localeCompare(t.time||``)).map(e=>`
        <div class="b2b-workshop-slot">
            <div class="b2b-workshop-time">${u(e.time||`—`)}</div>
            <div class="b2b-workshop-info">
                <strong>${u(e.customerName||`Stranka`)}</strong>
                <span class="b2b-cell-sub">${u(e.vehicleLabel||``)}</span>
                <span class="b2b-cell-sub">${u(Array.isArray(e.services)?e.services.join(`, `):e.serviceId||`—`)}</span>
            </div>
            <div class="b2b-workshop-actions-cell">
                ${e.status===`confirmed`?`<button class="btn b2b-btn-primary btn-sm" data-complete="${e.id}"><i data-lucide="check"></i> Zaključi</button>`:``}
                ${e.status===`pending`?`<button class="btn b2b-btn-secondary btn-sm" data-confirm="${e.id}"><i data-lucide="check-circle"></i> Potrdi</button>`:``}
            </div>
        </div>
    `).join(``),r.querySelectorAll(`[data-complete]`).forEach(e=>e.addEventListener(`click`,async()=>{try{await n(e.dataset.complete,`completed`),location.reload()}catch(e){alert(e.message)}})),r.querySelectorAll(`[data-confirm]`).forEach(e=>e.addEventListener(`click`,async()=>{try{await n(e.dataset.confirm,`confirmed`),location.reload()}catch(e){alert(e.message)}})),window.lucide&&window.lucide.createIcons()}function s(e){return e.priceType===`quote`||e.price==null?`Po ogledu`:(e.priceType===`from`?`od `:``)+e.price+` €`}function c(){return new Date().toISOString().slice(0,10)}function l(e){let t=new Date;return t.setDate(t.getDate()+e),t.toISOString().slice(0,10)}function u(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{a as initB2bWorkshopPage};