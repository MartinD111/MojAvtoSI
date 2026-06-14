import{a as e}from"./i18n-BZd20ht-.js";import{n as t}from"./firebase-D04QZ5MM.js";import{c as n}from"./extensions-BVPcMrZL.js";import{t as r,x as i}from"./listingService-CHYpX_DS.js";import{t as a}from"./b2b-layout-DYP0LZVU.js";var o=`mojavto-bulk-v1`,s=[`priceEur`,`make`,`model`,`fuel`];async function c(){let t=a({activeRoute:`/b2b/bulk-import`,title:e(`bi_title`,`Skupinski uvoz oglasov`)});if(t){if(!n()){t.innerHTML=`
            <div class="b2b-empty">
                <p>${e(`bi_not_verified`,`Ta funkcija je na voljo samo verificiranim poslovnim uporabnikom.`)}</p>
                <a href="#/b2b" class="btn b2b-btn-primary">${e(`bi_back_dashboard`,`Nazaj na pregled`)}</a>
            </div>`;return}l(t)}}function l(t){t.innerHTML=`
        <div class="bi-wrap">
            <div class="b2b-card bi-upload-card">
                <div class="bi-upload-area" id="biDropZone">
                    <i data-lucide="file-json"></i>
                    <p class="bi-upload-hint">${e(`bi_drop_hint`,`Povlecite datoteko .mojavto.json sem ali`)}</p>
                    <label class="btn b2b-btn-primary bi-file-label">
                        ${e(`bi_choose_file`,`Izberite datoteko`)}
                        <input type="file" id="biFileInput" accept=".json" hidden>
                    </label>
                    <p class="bi-format-note">${e(`bi_format_note`,`Sprejemamo samo datoteke v formatu mojavto-bulk-v1 (MojAvto AI Converter).`)}</p>
                </div>
                <div id="biError" class="bi-error" hidden></div>
            </div>
        </div>`,window.lucide&&window.lucide.createIcons();let n=document.getElementById(`biFileInput`),r=document.getElementById(`biDropZone`),i=document.getElementById(`biError`);n.addEventListener(`change`,()=>{n.files[0]&&u(n.files[0],t,i)}),r.addEventListener(`dragover`,e=>{e.preventDefault(),r.classList.add(`bi-drag-over`)}),r.addEventListener(`dragleave`,()=>r.classList.remove(`bi-drag-over`)),r.addEventListener(`drop`,e=>{e.preventDefault(),r.classList.remove(`bi-drag-over`);let n=e.dataTransfer.files[0];n&&u(n,t,i)})}function u(t,n,r){let i=new FileReader;i.onload=t=>{let i;try{i=JSON.parse(t.target.result)}catch{d(r,e(`bi_err_json`,`Datoteka ni veljavna JSON datoteka.`));return}if(i.format!==o){d(r,e(`bi_err_format`,`Format ni podprt. Pričakovano: ${o}, prejeto: "${i.format||`?`}".`));return}if(!Array.isArray(i.listings)||i.listings.length===0){d(r,e(`bi_err_empty`,`Datoteka ne vsebuje nobenih oglasov.`));return}m(n,i.listings)},i.readAsText(t)}function d(e,t){e.textContent=t,e.hidden=!1}function f(e){return s.filter(t=>!e[t])}function p(e){return Array.isArray(e)?e.filter(e=>e&&i.includes(e)):[]}function m(t,n){let r=n.map((e,t)=>{let n=f(e);return{idx:t,draft:{...e,equipment:p(e.equipment)},missing:n,selected:n.length===0}});t.innerHTML=`
        <div class="bi-wrap">
            <div class="b2b-card">
                <div class="bi-preview-header">
                    <div>
                        <h2>${e(`bi_preview_title`,`Pregled uvoza`)}</h2>
                        <p class="bi-preview-sub" id="biSelCount"></p>
                    </div>
                    <div class="bi-preview-actions">
                        <button id="biSelectAll" class="btn b2b-btn-secondary">${e(`bi_select_all`,`Izberi vse veljavne`)}</button>
                        <button id="biImportBtn" class="btn b2b-btn-primary" disabled>
                            <i data-lucide="upload"></i> <span id="biImportBtnLabel">${e(`bi_import_btn`,`Ustvari oglase`)}</span>
                        </button>
                    </div>
                </div>

                <div class="bi-table-wrap">
                    <table class="bi-table" id="biTable">
                        <thead>
                            <tr>
                                <th class="bi-col-check"></th>
                                <th>${e(`bi_col_vehicle`,`Vozilo`)}</th>
                                <th>${e(`bi_col_year`,`Letnik`)}</th>
                                <th>${e(`bi_col_fuel`,`Gorivo`)}</th>
                                <th>${e(`bi_col_price`,`Cena`)}</th>
                                <th>${e(`bi_col_status`,`Status`)}</th>
                            </tr>
                        </thead>
                        <tbody id="biTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>`,window.lucide&&window.lucide.createIcons(),h(r),g(r),document.getElementById(`biSelectAll`).addEventListener(`click`,()=>{r.forEach(e=>{e.missing.length===0&&(e.selected=!0)}),h(r),g(r)}),document.getElementById(`biImportBtn`).addEventListener(`click`,()=>{let e=r.filter(e=>e.selected);e.length>0&&_(t,e.map(e=>e.draft))})}function h(t){let n=document.getElementById(`biTableBody`);n&&(n.innerHTML=t.map(t=>{let n=t.missing.length===0,r=n?`bi-badge-ok`:`bi-badge-err`,i=n?e(`bi_valid`,`Veljavno`):e(`bi_invalid`,`Manjka: ${t.missing.join(`, `)}`),a=[t.draft.make,t.draft.model,t.draft.variant].filter(Boolean).join(` `)||`—`,o=t.draft.priceEur?`${Number(t.draft.priceEur).toLocaleString(`sl-SI`)} €`:`—`;return`
            <tr class="bi-row ${n?``:`bi-row-invalid`} ${t.selected?`bi-row-selected`:``}" data-idx="${t.idx}">
                <td class="bi-col-check">
                    <input type="checkbox" class="bi-row-check" data-idx="${t.idx}"
                        ${t.selected?`checked`:``} ${n?``:`disabled`}>
                </td>
                <td class="bi-col-vehicle">${y(a)}</td>
                <td>${y(String(t.draft.year||`—`))}</td>
                <td>${y(t.draft.fuel||`—`)}</td>
                <td>${y(o)}</td>
                <td><span class="bi-badge ${r}">${y(i)}</span></td>
            </tr>`}).join(``),n.querySelectorAll(`.bi-row-check`).forEach(e=>{e.addEventListener(`change`,()=>{let r=Number(e.dataset.idx),i=t[r];i&&(i.selected=e.checked,n.querySelector(`tr[data-idx="${r}"]`)?.classList.toggle(`bi-row-selected`,e.checked)),g(t)})}))}function g(t){let n=t.filter(e=>e.selected).length,r=t.length,i=t.filter(e=>e.missing.length>0).length,a=document.getElementById(`biSelCount`),o=document.getElementById(`biImportBtn`),s=document.getElementById(`biImportBtnLabel`);if(a){let t=e(`bi_sel_count`,`Izbrano: ${n} / ${r}`).replace(`{sel}`,n).replace(`{total}`,r);i>0&&(t+=` — ${i} ${e(`bi_invalid_count`,`neveljavnih (preskočeno)`)}`),a.textContent=t}o&&(o.disabled=n===0),s&&(s.textContent=n>0?e(`bi_import_btn_n`,`Ustvari ${n} oglas(ov)`).replace(`{n}`,n):e(`bi_import_btn`,`Ustvari oglase`))}async function _(n,i){let a=t.currentUser;if(!a){alert(e(`bi_err_auth`,`Niste prijavljeni. Prosimo, prijavite se in poskusite znova.`));return}n.innerHTML=`
        <div class="bi-wrap">
            <div class="b2b-card">
                <h2>${e(`bi_importing`,`Uvažam oglase…`)}</h2>
                <div class="bi-progress-bar"><div class="bi-progress-fill" id="biProgressFill" style="width:0%"></div></div>
                <p class="bi-progress-label" id="biProgressLabel">0 / ${i.length}</p>
                <div id="biResultsList" class="bi-results-list"></div>
            </div>
        </div>`;let o=[],s=document.getElementById(`biProgressFill`),c=document.getElementById(`biProgressLabel`),l=document.getElementById(`biResultsList`);for(let t=0;t<i.length;t++){let n={...i[t],entryType:`bulk-import`},u=null,d=null;try{u=await r(n,[],[],a)}catch(e){d=e.message||String(e)}o.push({draft:n,id:u,err:d});let f=Math.round((t+1)/i.length*100);if(s&&(s.style.width=`${f}%`),c&&(c.textContent=`${t+1} / ${i.length}`),l){let t=[n.make,n.model,n.variant].filter(Boolean).join(` `)||`—`,r=document.createElement(`div`);if(r.className=`bi-result-row ${d?`bi-result-err`:`bi-result-ok`}`,d)r.innerHTML=`<i data-lucide="x-circle"></i> <span class="bi-result-name">${y(t)}</span> <span class="bi-result-msg">${y(d)}</span>`;else{let n=`#/novi-oglas?id=${u}`;r.innerHTML=`<i data-lucide="check-circle"></i> <span class="bi-result-name">${y(t)}</span> <a href="${n}" target="_blank" class="bi-result-link">${e(`bi_add_photos`,`Dodaj fotografije →`)}</a>`}l.appendChild(r),window.lucide&&window.lucide.createIcons()}}v(n,o)}function v(t,n){let r=n.filter(e=>e.id),i=n.filter(e=>e.err),a=r.map(e=>`${[e.draft.make,e.draft.model,e.draft.variant].filter(Boolean).join(` `)||e.id}: ${window.location.origin}${window.location.pathname}#/novi-oglas?id=${e.id}`).join(`
`);t.innerHTML=`
        <div class="bi-wrap">
            <div class="b2b-card">
                <h2>${e(`bi_done_title`,`Uvoz zaključen`)}</h2>
                <p class="bi-done-summary">
                    <span class="bi-badge bi-badge-ok">${r.length} ${e(`bi_done_ok`,`uspešno`)}</span>
                    ${i.length>0?`<span class="bi-badge bi-badge-err">${i.length} ${e(`bi_done_err`,`neuspešno`)}</span>`:``}
                </p>

                ${r.length>0?`
                <div class="bi-links-section">
                    <div class="bi-links-header">
                        <span>${e(`bi_links_title`,`Oglasi — dodajte fotografije`)}</span>
                        <button id="biCopyAll" class="btn b2b-btn-secondary bi-copy-btn">
                            <i data-lucide="copy"></i> ${e(`bi_copy_links`,`Kopiraj vse povezave`)}
                        </button>
                    </div>
                    <div class="bi-links-list">
                        ${r.map(t=>{let n=[t.draft.make,t.draft.model,t.draft.variant].filter(Boolean).join(` `)||t.id,r=`#/novi-oglas?id=${t.id}`;return`<div class="bi-link-row">
                                <span class="bi-link-name">${y(n)}</span>
                                <a href="${r}" class="bi-result-link" target="_blank">${e(`bi_add_photos`,`Dodaj fotografije →`)}</a>
                            </div>`}).join(``)}
                    </div>
                </div>`:``}

                ${i.length>0?`
                <div class="bi-errors-section">
                    <h3>${e(`bi_failed_title`,`Neuspeli oglasi`)}</h3>
                    ${i.map(e=>`<div class="bi-result-row bi-result-err"><i data-lucide="x-circle"></i> ${y([e.draft.make,e.draft.model,e.draft.variant].filter(Boolean).join(` `)||`—`)} — ${y(e.err)}</div>`).join(``)}
                </div>`:``}

                <div class="bi-done-actions">
                    <a href="#/b2b" class="btn b2b-btn-secondary">${e(`bi_back_dashboard`,`Nazaj na pregled`)}</a>
                    <button id="biImportAnother" class="btn b2b-btn-primary">${e(`bi_import_another`,`Uvozi novo datoteko`)}</button>
                </div>
            </div>
        </div>`,window.lucide&&window.lucide.createIcons(),document.getElementById(`biCopyAll`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(a).then(()=>{let t=document.getElementById(`biCopyAll`);t&&(t.textContent=e(`bi_copied`,`Kopirano!`))}).catch(()=>{})}),document.getElementById(`biImportAnother`)?.addEventListener(`click`,()=>{l(t)})}function y(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{c as initBulkImportPage};