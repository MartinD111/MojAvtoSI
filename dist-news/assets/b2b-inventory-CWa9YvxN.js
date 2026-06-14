import{s as e}from"./extensions-BVPcMrZL.js";import{t}from"./b2b-layout-DYP0LZVU.js";import{g as n,l as r,r as i}from"./b2bService-CdqiS2V3.js";var a=[{key:`draft`,label:`Osnutek`,color:`#6b7280`,bg:`#f3f4f6`},{key:`prep`,label:`V pripravi`,color:`#d97706`,bg:`#fffbeb`},{key:`ready`,label:`Pripravljeno`,color:`#0d9488`,bg:`#f0fdfa`},{key:`listed`,label:`Objavljeno`,color:`#2563eb`,bg:`#eff6ff`},{key:`sold`,label:`Prodano`,color:`#16a34a`,bg:`#f0fdf4`}];async function o(){let o=t({activeRoute:`/b2b/zaloga`,title:`Zaloga vozil`});if(!o)return;if(!e(`dealer`)){o.innerHTML=`<div class="b2b-empty"><p>Ta sekcija je namenjena avtohišam/preprodajalcem.</p></div>`;return}o.innerHTML=`
        <div class="b2b-toolbar">
            <div class="b2b-filters">
                <select id="invStatusFilter" class="b2b-select">
                    <option value="">Vsi statusi</option>
                    ${a.map(e=>`<option value="${e.key}">${e.label}</option>`).join(``)}
                </select>
            </div>
            <button id="addInvBtn" class="btn b2b-btn-primary"><i data-lucide="plus"></i> Dodaj vozilo</button>
        </div>

        <div class="b2b-kpi-row" id="invKpis"></div>

        <div id="invContent" class="b2b-card b2b-card-flush">
            <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam zalogo…</div>
        </div>

        <div id="invDialog" class="b2b-dialog" hidden>
            <div class="b2b-dialog-card b2b-dialog-wide">
                <h3 id="invDlgTitle">Novo vozilo</h3>
                <form id="invForm" class="b2b-form">
                    <input type="hidden" name="id"/>
                    <div class="b2b-form-row">
                        <label>Znamka<input name="make" required/></label>
                        <label>Model<input name="model" required/></label>
                    </div>
                    <div class="b2b-form-row">
                        <label>VIN<input name="vin" maxlength="17" pattern="[A-HJ-NPR-Z0-9]{11,17}" placeholder="17-mestna oznaka"/></label>
                        <label>Letnik<input name="year" type="number" min="1950" max="2099"/></label>
                    </div>
                    <div class="b2b-form-row">
                        <label>Nabavna cena (€)<input name="purchasePrice" type="number" min="0" step="1"/></label>
                        <label>Ciljna prodajna cena (€)<input name="expectedPrice" type="number" min="0" step="1"/></label>
                    </div>
                    <div class="b2b-form-row">
                        <label>Vir nakupa<input name="source" placeholder="Dražba / Uvoz DE / Od stranke"/></label>
                        <label>Status<select name="status">${a.map(e=>`<option value="${e.key}">${e.label}</option>`).join(``)}</select></label>
                    </div>
                    <label>Opombe<textarea name="notes" rows="3"></textarea></label>
                    <div class="b2b-dialog-actions">
                        <button type="button" class="btn b2b-btn-secondary" id="invCancel">Prekliči</button>
                        <button type="submit" class="btn b2b-btn-primary">Shrani</button>
                    </div>
                </form>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons();let l=[];async function u(){let e=document.getElementById(`invStatusFilter`).value;try{l=await r(e||void 0),d()}catch(e){document.getElementById(`invContent`).innerHTML=`<div class="b2b-empty"><p>Napaka: ${e.message}</p></div>`}}function d(){let e={};for(let t of a)e[t.key]=0;let t=0,n=0;for(let r of l)e[r.status]=(e[r.status]||0)+1,t+=Number(r.purchasePrice)||0,n+=Number(r.expectedPrice)||0;document.getElementById(`invKpis`).innerHTML=`
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#dbeafe;color:#2563eb"><i data-lucide="warehouse"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">Skupaj vozil</div><div class="b2b-kpi-value">${l.length}</div></div></div>
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#fef3c7;color:#d97706"><i data-lucide="hammer"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">V pripravi</div><div class="b2b-kpi-value">${e.prep||0}</div></div></div>
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#dcfce7;color:#16a34a"><i data-lucide="check-circle"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">Objavljeno</div><div class="b2b-kpi-value">${e.listed||0}</div></div></div>
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#e0e7ff;color:#4f46e5"><i data-lucide="trending-up"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">Pričakovana marža</div><div class="b2b-kpi-value">${s(n-t)}</div></div></div>
        `,window.lucide&&window.lucide.createIcons();let r=document.getElementById(`invContent`);if(l.length===0){r.innerHTML=`<div class="b2b-empty"><i data-lucide="warehouse"></i><p>Zaloga je prazna.</p></div>`,window.lucide&&window.lucide.createIcons();return}r.innerHTML=`
            <table class="b2b-table">
                <thead><tr><th>Vozilo</th><th>VIN</th><th>Nabava</th><th>Cilj</th><th>Marža</th><th>Status</th><th></th></tr></thead>
                <tbody>
                    ${l.map(e=>{let t=(Number(e.expectedPrice)||0)-(Number(e.purchasePrice)||0),n=a.find(t=>t.key===e.status)||a[0];return`
                        <tr>
                            <td>
                                <div class="b2b-cell-primary">${c(e.make)} ${c(e.model)}</div>
                                <div class="b2b-cell-sub">${e.year||`—`} · ${c(e.source||``)}</div>
                            </td>
                            <td><code class="b2b-code">${c(e.vin||`—`)}</code></td>
                            <td>${s(e.purchasePrice)}</td>
                            <td>${s(e.expectedPrice)}</td>
                            <td style="color:${t>=0?`#16a34a`:`#dc2626`};font-weight:600;">${s(t)}</td>
                            <td><span class="b2b-pill" style="background:${n.bg};color:${n.color};">${n.label}</span></td>
                            <td class="b2b-cell-actions">
                                <button class="b2b-icon-btn" data-edit="${e.id}"><i data-lucide="edit"></i></button>
                                <button class="b2b-icon-btn danger" data-del="${e.id}"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`}).join(``)}
                </tbody>
            </table>`,r.querySelectorAll(`[data-edit]`).forEach(e=>e.addEventListener(`click`,()=>{let t=l.find(t=>t.id===e.dataset.edit);t&&f(t)})),r.querySelectorAll(`[data-del]`).forEach(e=>e.addEventListener(`click`,async()=>{if(confirm(`Izbrisati vozilo iz zaloge?`))try{await i(e.dataset.del),await u()}catch(e){alert(e.message)}})),window.lucide&&window.lucide.createIcons()}function f(e){let t=document.getElementById(`invForm`);if(document.getElementById(`invDlgTitle`).textContent=e?`Uredi vozilo`:`Novo vozilo`,t.reset(),t.id.value=e?.id||``,e)for(let n of[`make`,`model`,`vin`,`year`,`purchasePrice`,`expectedPrice`,`source`,`status`,`notes`])t[n]&&(t[n].value=e[n]??``);else t.status.value=`draft`;document.getElementById(`invDialog`).hidden=!1}document.getElementById(`addInvBtn`).addEventListener(`click`,()=>f()),document.getElementById(`invCancel`).addEventListener(`click`,()=>document.getElementById(`invDialog`).hidden=!0),document.getElementById(`invStatusFilter`).addEventListener(`change`,u),document.getElementById(`invForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),r={id:t.get(`id`)||void 0,make:t.get(`make`).trim(),model:t.get(`model`).trim(),vin:t.get(`vin`).trim().toUpperCase(),year:Number(t.get(`year`))||null,purchasePrice:Number(t.get(`purchasePrice`))||0,expectedPrice:Number(t.get(`expectedPrice`))||0,source:t.get(`source`).trim(),status:t.get(`status`),notes:t.get(`notes`).trim()};r.id||delete r.id;try{await n(r),document.getElementById(`invDialog`).hidden=!0,await u()}catch(e){alert(`Napaka: `+e.message)}}),u()}function s(e){return new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(e||0)}function c(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{o as initB2bInventoryPage};