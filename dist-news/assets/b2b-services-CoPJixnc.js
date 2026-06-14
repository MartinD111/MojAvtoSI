import{t as e}from"./b2b-layout-DYP0LZVU.js";import{i as t,p as n,v as r}from"./b2bService-CdqiS2V3.js";var i=[{id:`oil-change`,name:`Menjava olja`,icon:`droplet`,group:`Servis`},{id:`filter`,name:`Menjava filtrov`,icon:`filter`,group:`Servis`},{id:`maintenance`,name:`Redni servis`,icon:`wrench`,group:`Servis`},{id:`engine`,name:`Motor`,icon:`cog`,group:`Servis`},{id:`transmission`,name:`Menjalnik`,icon:`gauge`,group:`Servis`},{id:`timing-belt`,name:`Zobati jermen`,icon:`settings`,group:`Servis`},{id:`exhaust`,name:`Izpušni sistem`,icon:`wind`,group:`Servis`},{id:`cooling`,name:`Hladilni sistem`,icon:`thermometer`,group:`Servis`},{id:`diagnostic`,name:`Računalniška diag.`,icon:`cpu`,group:`Diagnostika`},{id:`check-engine`,name:`Napaka na motorju`,icon:`alert-triangle`,group:`Diagnostika`},{id:`battery`,name:`Akumulator`,icon:`battery`,group:`Diagnostika`},{id:`electrical`,name:`Elektrika`,icon:`zap`,group:`Diagnostika`},{id:`ac`,name:`Klima`,icon:`snowflake`,group:`Diagnostika`},{id:`tire-change`,name:`Menjava gum`,icon:`circle`,group:`Pnevmatike`},{id:`tire-balance`,name:`Centriranje`,icon:`circle-dot`,group:`Pnevmatike`},{id:`tire-repair`,name:`Krpanje pnevmatike`,icon:`bandage`,group:`Pnevmatike`},{id:`tire-storage`,name:`Hotel za gume`,icon:`archive`,group:`Pnevmatike`},{id:`alignment`,name:`Geometrija`,icon:`move-3d`,group:`Pnevmatike`},{id:`brakes`,name:`Zavore`,icon:`disc`,group:`Zavore`},{id:`suspension`,name:`Vzmetenje`,icon:`activity`,group:`Zavore`},{id:`steering`,name:`Volanski sistem`,icon:`steering-wheel`,group:`Zavore`},{id:`bodywork`,name:`Karoserija`,icon:`car`,group:`Karoserija`},{id:`paint`,name:`Lakiranje`,icon:`palette`,group:`Karoserija`},{id:`polish`,name:`Poliranje`,icon:`sparkles`,group:`Karoserija`},{id:`glass`,name:`Stekla`,icon:`square`,group:`Karoserija`},{id:`wash`,name:`Ročno pranje`,icon:`shower-head`,group:`Nega`},{id:`detailing`,name:`Detailing`,icon:`star`,group:`Nega`},{id:`interior`,name:`Čiščenje notranjosti`,icon:`sofa`,group:`Nega`},{id:`ceramic`,name:`Keramična zaščita`,icon:`shield`,group:`Nega`},{id:`sale`,name:`Prodaja vozila`,icon:`tag`,group:`Ostalo`},{id:`inspection`,name:`Tehnični pregled`,icon:`clipboard-check`,group:`Ostalo`},{id:`towing`,name:`Šlepanje`,icon:`truck`,group:`Ostalo`},{id:`rental`,name:`Najem vozila`,icon:`key-round`,group:`Ostalo`},{id:`other`,name:`Drugo`,icon:`more-horizontal`,group:`Ostalo`}];function a(e){return i.find(t=>t.id===e)}function o(){let e={};for(let t of i)(e[t.group]=e[t.group]||[]).push(t);return e}var s=[`Servis`,`Pnevmatike`,`Diagnostika`,`Avtoličarstvo`,`Pranje`,`Drugo`];async function c(){let i=e({activeRoute:`/b2b/storitve`,title:`Storitve in cenik`});if(!i)return;i.innerHTML=`
        <div class="b2b-toolbar">
            <p class="b2b-hint">Storitve, ki jih tukaj vnesete, se samodejno prikažejo na vašem javnem profilu.</p>
            <button id="addServiceBtn" class="btn b2b-btn-primary"><i data-lucide="plus"></i> Nova storitev</button>
        </div>

        <div id="servicesContent" class="b2b-card b2b-card-flush">
            <div class="b2b-loading"><i data-lucide="loader"></i> Nalagam…</div>
        </div>

        <div id="serviceDialog" class="b2b-dialog" hidden>
            <div class="b2b-dialog-card b2b-dialog-wide">
                <h3 id="svcDlgTitle">Nova storitev</h3>
                <form id="svcForm" class="b2b-form">
                    <input type="hidden" name="id"/>
                    <input type="hidden" name="iconId"/>

                    <label>Ikona
                        <button type="button" id="iconPickerBtn" class="b2b-icon-pick-btn">
                            <span class="b2b-icon-pick-current" id="iconPickCurrent">
                                <i data-lucide="wrench"></i>
                            </span>
                            <span class="b2b-icon-pick-label" id="iconPickLabel">Izberi ikono…</span>
                            <i data-lucide="chevron-down" style="margin-left:auto;opacity:0.5;"></i>
                        </button>
                    </label>

                    <label>Ime storitve<input name="name" required placeholder="Menjava olja"/></label>

                    <div class="b2b-form-row">
                        <label>Kategorija<select name="category">${s.map(e=>`<option>${e}</option>`).join(``)}</select></label>
                        <label>Trajanje (min)<input name="duration" type="number" min="5" step="5" placeholder="30"/></label>
                    </div>
                    <div class="b2b-form-row">
                        <label>Cena (€)<input name="price" type="number" min="0" step="0.01" placeholder="49.90"/></label>
                        <label>Tip<select name="priceType"><option value="fixed">Fiksna</option><option value="from">Od …</option><option value="quote">Po ogledu</option></select></label>
                    </div>
                    <label>Opis (neobvezno)<textarea name="description" rows="3"></textarea></label>

                    <div class="b2b-dialog-actions">
                        <button type="button" class="btn b2b-btn-secondary" id="svcCancel">Prekliči</button>
                        <button type="submit" class="btn b2b-btn-primary">Shrani</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Icon picker dialog -->
        <div id="iconDialog" class="b2b-dialog" hidden>
            <div class="b2b-dialog-card b2b-dialog-wide">
                <h3>Izberi ikono</h3>
                <input type="text" id="iconSearch" class="b2b-input" placeholder="Išči ikono…" style="width:100%;margin-bottom:1rem;"/>
                <div id="iconGrid" class="b2b-icon-grid-wrap"></div>
                <div class="b2b-dialog-actions">
                    <button type="button" class="btn b2b-btn-secondary" id="iconDialogClose">Zapri</button>
                </div>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons();let c=[],d=null;async function f(){try{c=await n(),p()}catch(e){document.getElementById(`servicesContent`).innerHTML=`<div class="b2b-empty"><p>Napaka: ${e.message}</p></div>`}}function p(){let e=document.getElementById(`servicesContent`);if(c.length===0){e.innerHTML=`<div class="b2b-empty"><i data-lucide="tag"></i><p>Še nimate storitev.</p><button class="btn b2b-btn-primary" id="emptyAdd">Dodaj prvo storitev</button></div>`,document.getElementById(`emptyAdd`).addEventListener(`click`,()=>h()),window.lucide&&window.lucide.createIcons();return}let n={};for(let e of c){let t=e.category||`Drugo`;(n[t]=n[t]||[]).push(e)}e.innerHTML=Object.entries(n).map(([e,t])=>`
            <div class="b2b-group">
                <h3 class="b2b-group-title">${e}</h3>
                <table class="b2b-table">
                    <thead><tr><th style="width:60px;"></th><th>Ime</th><th>Trajanje</th><th>Cena</th><th></th></tr></thead>
                    <tbody>
                        ${t.map(e=>`
                            <tr>
                                <td><div class="b2b-svc-icon"><i data-lucide="${e.icon||`wrench`}"></i></div></td>
                                <td>
                                    <div class="b2b-cell-primary">${u(e.name)}</div>
                                    ${e.description?`<div class="b2b-cell-sub">${u(e.description)}</div>`:``}
                                </td>
                                <td>${e.duration?e.duration+` min`:`—`}</td>
                                <td>${l(e)}</td>
                                <td class="b2b-cell-actions">
                                    <button class="b2b-icon-btn" data-edit="${e.id}" title="Uredi"><i data-lucide="edit"></i></button>
                                    <button class="b2b-icon-btn danger" data-del="${e.id}" title="Izbriši"><i data-lucide="trash-2"></i></button>
                                </td>
                            </tr>
                        `).join(``)}
                    </tbody>
                </table>
            </div>
        `).join(``),e.querySelectorAll(`[data-edit]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=c.find(t=>t.id===e.dataset.edit);t&&h(t)})}),e.querySelectorAll(`[data-del]`).forEach(e=>{e.addEventListener(`click`,async()=>{if(confirm(`Izbrisati to storitev?`))try{await t(e.dataset.del),await f()}catch(e){alert(e.message)}})}),window.lucide&&window.lucide.createIcons()}function m(e){d=e;let t=document.getElementById(`svcForm`);t.iconId.value=e?.id||``;let n=document.getElementById(`iconPickCurrent`),r=document.getElementById(`iconPickLabel`);e?(n.innerHTML=`<i data-lucide="${e.icon}"></i>`,r.textContent=e.name):(n.innerHTML=`<i data-lucide="wrench"></i>`,r.textContent=`Izberi ikono…`),window.lucide&&window.lucide.createIcons()}function h(e){let t=document.getElementById(`serviceDialog`),n=document.getElementById(`svcForm`);document.getElementById(`svcDlgTitle`).textContent=e?`Uredi storitev`:`Nova storitev`,n.reset(),n.id.value=e?.id||``,e?(n.name.value=e.name||``,n.category.value=e.category||s[0],n.duration.value=e.duration||``,n.price.value=e.price??``,n.priceType.value=e.priceType||`fixed`,n.description.value=e.description||``,m(e.iconId?a(e.iconId):null)):m(null),t.hidden=!1}function g(){document.getElementById(`serviceDialog`).hidden=!0}function _(){document.getElementById(`iconDialog`).hidden=!1,y(``),document.getElementById(`iconSearch`).value=``,document.getElementById(`iconSearch`).focus()}function v(){document.getElementById(`iconDialog`).hidden=!0}function y(e){let t=document.getElementById(`iconGrid`),n=(e||``).toLowerCase().trim(),r=o();t.innerHTML=Object.entries(r).map(([e,t])=>{let r=t.filter(e=>!n||e.name.toLowerCase().includes(n)||e.icon.toLowerCase().includes(n));return r.length?`
                <div class="b2b-icon-grid-group">
                    <h4>${e}</h4>
                    <div class="b2b-icon-grid">
                        ${r.map(e=>`
                            <button type="button" class="b2b-icon-tile ${d?.id===e.id?`active`:``}" data-pick="${e.id}" title="${u(e.name)}">
                                <i data-lucide="${e.icon}"></i>
                                <span>${u(e.name)}</span>
                            </button>`).join(``)}
                    </div>
                </div>`:``}).join(``)||`<p class="b2b-hint">Ni zadetkov za "${u(e)}".</p>`,t.querySelectorAll(`[data-pick]`).forEach(e=>{e.addEventListener(`click`,()=>{m(a(e.dataset.pick)),v()})}),window.lucide&&window.lucide.createIcons()}document.getElementById(`iconPickerBtn`).addEventListener(`click`,_),document.getElementById(`iconDialogClose`).addEventListener(`click`,v),document.getElementById(`iconSearch`).addEventListener(`input`,e=>y(e.target.value)),document.getElementById(`addServiceBtn`).addEventListener(`click`,()=>h()),document.getElementById(`svcCancel`).addEventListener(`click`,g),document.getElementById(`svcForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=new FormData(e.target),n=t.get(`iconId`)||``,i=n?a(n):null,o={id:t.get(`id`)||void 0,name:t.get(`name`).trim(),category:t.get(`category`),duration:Number(t.get(`duration`))||null,price:t.get(`priceType`)===`quote`?null:Number(t.get(`price`)),priceType:t.get(`priceType`),description:t.get(`description`).trim(),iconId:i?.id||``,icon:i?.icon||`wrench`};o.id||delete o.id;try{await r(o),g(),await f()}catch(e){alert(`Napaka: `+e.message)}}),f()}function l(e){if(e.priceType===`quote`||e.price==null)return`Po ogledu`;let t=Number(e.price).toFixed(2).replace(/\.00$/,``)+` €`;return e.priceType===`from`?`od ${t}`:t}function u(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{c as initB2bServicesPage};