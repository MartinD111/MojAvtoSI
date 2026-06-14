import{s as e}from"./extensions-BVPcMrZL.js";import{t}from"./b2b-layout-DYP0LZVU.js";import{a as n,m as r,y as i}from"./b2bService-CdqiS2V3.js";var a=[{key:`summer`,label:`Poletne`},{key:`winter`,label:`Zimske`},{key:`all_season`,label:`Cel.let.`}];async function o(){let o=t({activeRoute:`/b2b/hotel-gum`,title:`Hotel za gume`});if(!o)return;if(!e(`vulcanizer`)){o.innerHTML=`<div class="b2b-empty"><p>Hotel za gume je namenjen vulkanizerjem.</p></div>`;return}o.innerHTML=`
        <div class="b2b-toolbar">
            <div class="b2b-filters">
                <input id="tireSearch" class="b2b-input" placeholder="Išči po imenu, telefonu, dimenziji…"/>
                <select id="tireStatusFilter" class="b2b-select">
                    <option value="stored">V hrambi</option>
                    <option value="picked_up">Prevzeto</option>
                    <option value="">Vse</option>
                </select>
            </div>
            <button id="addTireBtn" class="btn b2b-btn-primary"><i data-lucide="plus"></i> Nov vnos</button>
        </div>

        <div class="b2b-kpi-row" id="tireKpis"></div>

        <div id="tireContent" class="b2b-card b2b-card-flush">
            <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam…</div>
        </div>

        <div id="tireDialog" class="b2b-dialog" hidden>
            <div class="b2b-dialog-card b2b-dialog-wide">
                <h3 id="tireDlgTitle">Nov vnos gum</h3>
                <form id="tireForm" class="b2b-form">
                    <input type="hidden" name="id"/>
                    <fieldset>
                        <legend>Stranka</legend>
                        <div class="b2b-form-row">
                            <label>Ime in priimek<input name="customerName" required/></label>
                            <label>Telefon<input name="customerContact" required placeholder="+386…"/></label>
                        </div>
                        <label>Registrska / vozilo<input name="vehicleLabel" placeholder="LJ ABC-123, Škoda Octavia"/></label>
                    </fieldset>

                    <fieldset>
                        <legend>Gume</legend>
                        <div class="b2b-form-row">
                            <label>Dimenzija<input name="tireSize" required placeholder="205/55 R16"/></label>
                            <label>Sezona<select name="season">${a.map(e=>`<option value="${e.key}">${e.label}</option>`).join(``)}</select></label>
                        </div>
                        <div class="b2b-form-row">
                            <label>Število kosov<input name="quantity" type="number" min="1" max="8" value="4"/></label>
                            <label>DOT (teden/leto)<input name="dot" placeholder="2223"/></label>
                            <label>Globina (mm)<input name="treadDepth" type="number" step="0.5" min="0" max="15"/></label>
                        </div>
                        <label>Platišča?<select name="hasRims"><option value="false">Samo gume</option><option value="true">Z jeklenimi platišči</option><option value="alloy">Z alu platišči</option></select></label>
                    </fieldset>

                    <fieldset>
                        <legend>Lokacija v skladišču</legend>
                        <div class="b2b-form-row">
                            <label>Regal<input name="rack" placeholder="A"/></label>
                            <label>Polica<input name="shelf" placeholder="3"/></label>
                            <label>Pozicija<input name="position" placeholder="12"/></label>
                        </div>
                    </fieldset>

                    <label>Opombe<textarea name="notes" rows="2"></textarea></label>

                    <div class="b2b-dialog-actions">
                        <button type="button" class="btn b2b-btn-secondary" id="tireCancel">Prekliči</button>
                        <button type="submit" class="btn b2b-btn-primary">Shrani</button>
                    </div>
                </form>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons();let c=[];async function l(){let e=document.getElementById(`tireStatusFilter`).value;try{c=await r(e||void 0),u()}catch(e){document.getElementById(`tireContent`).innerHTML=`<div class="b2b-empty"><p>Napaka: ${e.message}</p></div>`}}function u(){let e=(document.getElementById(`tireSearch`).value||``).toLowerCase(),t=c.filter(t=>!e||t.customerName?.toLowerCase().includes(e)||t.customerContact?.toLowerCase().includes(e)||t.tireSize?.toLowerCase().includes(e)||t.vehicleLabel?.toLowerCase().includes(e)),r=c.filter(e=>e.status===`stored`).length,o=c.filter(e=>e.status===`picked_up`).length,u=a.map(e=>({...e,count:c.filter(t=>t.status===`stored`&&t.season===e.key).length}));document.getElementById(`tireKpis`).innerHTML=`
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#e0f2fe;color:#0284c7"><i data-lucide="archive"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">V hrambi</div><div class="b2b-kpi-value">${r}</div></div></div>
            <div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#dcfce7;color:#16a34a"><i data-lucide="check"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">Prevzeto</div><div class="b2b-kpi-value">${o}</div></div></div>
            ${u.map(e=>`<div class="b2b-kpi"><div class="b2b-kpi-icon" style="background:#fef3c7;color:#d97706"><i data-lucide="circle-dot"></i></div><div class="b2b-kpi-body"><div class="b2b-kpi-label">${e.label}</div><div class="b2b-kpi-value">${e.count}</div></div></div>`).join(``)}
        `,window.lucide&&window.lucide.createIcons();let f=document.getElementById(`tireContent`);if(!t.length){f.innerHTML=`<div class="b2b-empty"><i data-lucide="archive"></i><p>Ni zapisov.</p></div>`,window.lucide&&window.lucide.createIcons();return}f.innerHTML=`
            <table class="b2b-table">
                <thead>
                    <tr>
                        <th>Stranka</th>
                        <th>Vozilo</th>
                        <th>Gume</th>
                        <th>Lokacija</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${t.map(e=>{let t=[e.storageLocation?.rack,e.storageLocation?.shelf,e.storageLocation?.position].filter(Boolean).join(` · `)||`—`,n=a.find(t=>t.key===e.season)?.label||`—`;return`
                        <tr class="${e.status===`picked_up`?`b2b-row-faded`:``}">
                            <td>
                                <div class="b2b-cell-primary">${s(e.customerName)}</div>
                                <div class="b2b-cell-sub"><a href="tel:${s(e.customerContact)}">${s(e.customerContact)}</a></div>
                            </td>
                            <td>${s(e.vehicleLabel||`—`)}</td>
                            <td>
                                <div>${s(e.tireSize)} · ${e.quantity||4} kos</div>
                                <div class="b2b-cell-sub">${n} ${e.dot?`· DOT `+s(e.dot):``} ${e.treadDepth?`· `+e.treadDepth+` mm`:``}</div>
                            </td>
                            <td><code class="b2b-code">${s(t)}</code></td>
                            <td>
                                ${e.status===`stored`?`<span class="b2b-pill" style="background:#e0f2fe;color:#0284c7;">V hrambi</span>`:`<span class="b2b-pill" style="background:#dcfce7;color:#16a34a;">Prevzeto</span>`}
                            </td>
                            <td class="b2b-cell-actions">
                                ${e.status===`stored`?`<button class="b2b-icon-btn" data-pickup="${e.id}" title="Prevzem"><i data-lucide="check-circle"></i></button>`:`<button class="b2b-icon-btn" data-restore="${e.id}" title="Vrni v hrambo"><i data-lucide="rotate-ccw"></i></button>`}
                                <button class="b2b-icon-btn" data-edit="${e.id}"><i data-lucide="edit"></i></button>
                                <button class="b2b-icon-btn danger" data-del="${e.id}"><i data-lucide="trash-2"></i></button>
                            </td>
                        </tr>`}).join(``)}
                </tbody>
            </table>`,f.querySelectorAll(`[data-edit]`).forEach(e=>e.addEventListener(`click`,()=>{let t=c.find(t=>t.id===e.dataset.edit);t&&d(t)})),f.querySelectorAll(`[data-del]`).forEach(e=>e.addEventListener(`click`,async()=>{if(confirm(`Izbrisati zapis?`))try{await n(e.dataset.del),await l()}catch(e){alert(e.message)}})),f.querySelectorAll(`[data-pickup]`).forEach(e=>e.addEventListener(`click`,async()=>{let t=c.find(t=>t.id===e.dataset.pickup);if(t)try{await i({...t,status:`picked_up`,pickedUpAt:new Date().toISOString()}),await l()}catch(e){alert(e.message)}})),f.querySelectorAll(`[data-restore]`).forEach(e=>e.addEventListener(`click`,async()=>{let t=c.find(t=>t.id===e.dataset.restore);if(t)try{await i({...t,status:`stored`,pickedUpAt:null}),await l()}catch(e){alert(e.message)}})),window.lucide&&window.lucide.createIcons()}function d(e){let t=document.getElementById(`tireForm`);document.getElementById(`tireDlgTitle`).textContent=e?`Uredi vnos`:`Nov vnos gum`,t.reset(),t.id.value=e?.id||``,e&&(t.customerName.value=e.customerName||``,t.customerContact.value=e.customerContact||``,t.vehicleLabel.value=e.vehicleLabel||``,t.tireSize.value=e.tireSize||``,t.season.value=e.season||`summer`,t.quantity.value=e.quantity||4,t.dot.value=e.dot||``,t.treadDepth.value=e.treadDepth||``,t.hasRims.value=String(e.hasRims??`false`),t.rack.value=e.storageLocation?.rack||``,t.shelf.value=e.storageLocation?.shelf||``,t.position.value=e.storageLocation?.position||``,t.notes.value=e.notes||``),document.getElementById(`tireDialog`).hidden=!1}document.getElementById(`addTireBtn`).addEventListener(`click`,()=>d()),document.getElementById(`tireCancel`).addEventListener(`click`,()=>document.getElementById(`tireDialog`).hidden=!0),document.getElementById(`tireStatusFilter`).addEventListener(`change`,l),document.getElementById(`tireSearch`).addEventListener(`input`,u),document.getElementById(`tireForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n={id:t.get(`id`)||void 0,customerName:t.get(`customerName`).trim(),customerContact:t.get(`customerContact`).trim(),vehicleLabel:t.get(`vehicleLabel`).trim(),tireSize:t.get(`tireSize`).trim(),season:t.get(`season`),quantity:Number(t.get(`quantity`))||4,dot:t.get(`dot`).trim(),treadDepth:Number(t.get(`treadDepth`))||null,hasRims:t.get(`hasRims`),storageLocation:{rack:t.get(`rack`).trim(),shelf:t.get(`shelf`).trim(),position:t.get(`position`).trim()},notes:t.get(`notes`).trim(),status:`stored`};n.id||delete n.id;try{await i(n),document.getElementById(`tireDialog`).hidden=!0,await l()}catch(e){alert(`Napaka: `+e.message)}}),l()}function s(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{o as initB2bTireHotelPage};