import{s as e}from"./extensions-BVPcMrZL.js";import{t}from"./b2b-layout-DYP0LZVU.js";import{u as n,x as r}from"./b2bService-CdqiS2V3.js";var i=[{key:`new`,label:`Novo`,color:`#2563eb`,bg:`#eff6ff`},{key:`contacted`,label:`Kontaktirano`,color:`#d97706`,bg:`#fffbeb`},{key:`meeting`,label:`Ogled dogovorjen`,color:`#7c3aed`,bg:`#f5f3ff`},{key:`closed`,label:`Zaključeno`,color:`#16a34a`,bg:`#f0fdf4`},{key:`lost`,label:`Izgubljeno`,color:`#dc2626`,bg:`#fef2f2`}];async function a(){let a=t({activeRoute:`/b2b/leads`,title:`Povpraševanja`});if(!a)return;if(!e(`dealer`)){a.innerHTML=`<div class="b2b-empty"><p>Ta sekcija je namenjena avtohišam/preprodajalcem.</p></div>`;return}a.innerHTML=`
        <div class="b2b-inbox">
            <aside class="b2b-inbox-list">
                <div class="b2b-inbox-filters">
                    <select id="leadStatusFilter" class="b2b-select">
                        <option value="">Vsi</option>
                        ${i.map(e=>`<option value="${e.key}">${e.label}</option>`).join(``)}
                    </select>
                </div>
                <div id="leadList" class="b2b-inbox-items">
                    <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam…</div>
                </div>
            </aside>
            <section class="b2b-inbox-detail" id="leadDetail">
                <div class="b2b-empty"><i data-lucide="inbox"></i><p>Izberite povpraševanje.</p></div>
            </section>
        </div>
    `,window.lucide&&window.lucide.createIcons();let s=[],c=null;async function l(){let e=document.getElementById(`leadStatusFilter`).value;try{s=await n(e||void 0),u(),s.length&&!c?d(s[0].id):s.length||(c=null,f())}catch(e){document.getElementById(`leadList`).innerHTML=`<div class="b2b-empty"><p>Napaka: ${e.message}</p></div>`}}function u(){let e=document.getElementById(`leadList`);if(!s.length){e.innerHTML=`<div class="b2b-empty"><i data-lucide="inbox"></i><p>Trenutno ni povpraševanj.</p></div>`,window.lucide&&window.lucide.createIcons();return}e.innerHTML=s.map(e=>{let t=i.find(t=>t.key===e.status)||i[0];return`
                <button class="b2b-inbox-item ${c===e.id?`active`:``}" data-id="${e.id}">
                    <div class="b2b-inbox-item-head">
                        <span class="b2b-inbox-name">${o(e.customerName||`Anonimno`)}</span>
                        <span class="b2b-pill" style="background:${t.bg};color:${t.color};">${t.label}</span>
                    </div>
                    <div class="b2b-inbox-sub">${o(e.vehicleLabel||e.vehicleId||`—`)}</div>
                    <div class="b2b-inbox-preview">${o((e.message||``).slice(0,80))}</div>
                </button>`}).join(``),e.querySelectorAll(`[data-id]`).forEach(e=>e.addEventListener(`click`,()=>d(e.dataset.id)))}function d(e){c=e,u(),f()}function f(){let e=document.getElementById(`leadDetail`),t=s.find(e=>e.id===c);if(!t){e.innerHTML=`<div class="b2b-empty"><i data-lucide="inbox"></i><p>Izberite povpraševanje.</p></div>`,window.lucide&&window.lucide.createIcons();return}e.innerHTML=`
            <header class="b2b-inbox-head">
                <div>
                    <h3>${o(t.customerName||`Anonimno`)}</h3>
                    <p class="b2b-cell-sub">${o(t.customerContact||`—`)}</p>
                </div>
                <select id="leadStatus" class="b2b-status-select">
                    ${i.map(e=>`<option value="${e.key}" ${e.key===t.status?`selected`:``}>${e.label}</option>`).join(``)}
                </select>
            </header>

            <dl class="b2b-kv">
                <dt>Vozilo</dt><dd>${o(t.vehicleLabel||t.vehicleId||`—`)}</dd>
                <dt>Prejeto</dt><dd>${t.createdAt?.seconds?new Date(t.createdAt.seconds*1e3).toLocaleString(`sl-SI`):`—`}</dd>
            </dl>

            <div class="b2b-msg">
                <h4>Sporočilo stranke</h4>
                <p>${o(t.message||`—`)}</p>
            </div>

            <div class="b2b-reply">
                <h4>Hitri odgovor</h4>
                <textarea id="replyBox" rows="4" placeholder="Odgovor stranki…">${o(t.replyDraft||``)}</textarea>
                <div class="b2b-dialog-actions">
                    <button class="btn b2b-btn-secondary" id="saveDraft">Shrani osnutek</button>
                    <a class="btn b2b-btn-primary" id="sendMail" href="mailto:${o(t.customerContact||``)}?subject=Odgovor na vaše povpraševanje&body=" target="_blank"><i data-lucide="mail"></i> Pošlji po e-pošti</a>
                </div>
            </div>
        `,window.lucide&&window.lucide.createIcons(),document.getElementById(`leadStatus`).addEventListener(`change`,async e=>{try{await r(t.id,{status:e.target.value}),await l()}catch(e){alert(e.message)}}),document.getElementById(`saveDraft`).addEventListener(`click`,async()=>{try{await r(t.id,{replyDraft:document.getElementById(`replyBox`).value})}catch(e){alert(e.message)}}),document.getElementById(`sendMail`).addEventListener(`click`,()=>{let e=encodeURIComponent(document.getElementById(`replyBox`).value);document.getElementById(`sendMail`).href=`mailto:${t.customerContact||``}?subject=Odgovor na vaše povpraševanje&body=${e}`})}document.getElementById(`leadStatusFilter`).addEventListener(`change`,l),l()}function o(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{a as initB2bLeadsPage};