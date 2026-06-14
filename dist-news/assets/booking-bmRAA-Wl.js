import{r as e}from"./chunk-QTnfLwEv.js";import{t}from"./storageKeys-BraFEh3o.js";import{c as n,h as r}from"./b2bService-CdqiS2V3.js";import{r as i}from"./businessService-Cxl975gJ.js";import{d as a,f as o,h as s,i as c,l,m as u,n as d,o as f,p,s as m,t as h,u as ee}from"./browser-DJ0F6Jf2.js";import{t as g}from"./store-ChFIHQ4u.js";import{n as _}from"./viewport-DsxeKZ-2.js";var v=e(h(),1);function y(e,t,n=60){let[r,i,a]=e.split(`-`).map(Number),[o,s]=t.split(`:`).map(Number),c=e=>String(e).padStart(2,`0`),l=`${r}${c(i)}${c(a)}T${c(o)}${c(s)}00`,u=new Date(r,i-1,a,o,s+n);return{start:l,end:`${u.getFullYear()}${c(u.getMonth()+1)}${c(u.getDate())}T${c(u.getHours())}${c(u.getMinutes())}00`}}function b(e){let t={tyre_change:`Menjava gum`,tyre_storage:`Hramba gum`,tyre_repair:`Popravilo gume`,oil_change:`Menjava olja`,brake_service:`Servis zavor`,diagnostics:`Diagnostika`,inspection:`Tehnični pregled`,air_conditioning:`Servis klime`,wheel_alignment:`Poravnava koles`,wheel_balancing:`Balansiranje koles`,clutch_repair:`Popravilo sklopke`,body_repair:`Popravi karoserije`,electrical_repair:`Električna napaka`,battery_service:`Servis baterije`,software_update:`Posodobitev programske opreme`,hybrid_service:`Servis hibrida`,washing:`Pranje vozila`};return e.map(e=>t[e]||e).join(`, `)}function x(e,t){let{start:n,end:r}=y(e.date,e.time,60),i=b(e.services||[]),a=`${i} — ${t.name}`,o=`${window.location.origin}/#/potrditev?id=${e.id}`,s=[`Rezervacija: ${e.serviceNumber||e.id}`,`Podjetje: ${t.name}`,`Storitve: ${i}`,e.vehicleLabel?`Vozilo: ${e.vehicleLabel}`:``,e.totalPrice>0?`Skupaj od: ${e.totalPrice} €`:`Cena po ogledu`,e.notes?`Opomba: ${e.notes}`:``,``,`Potrditev: ${o}`].filter(Boolean).join(`
`),c=[t.location?.address,t.location?.city,`Slovenija`].filter(Boolean).join(`, `);return`https://www.google.com/calendar/render?${new URLSearchParams({action:`TEMPLATE`,text:a,dates:`${n}/${r}`,details:s,location:c,sf:`true`,output:`xml`}).toString()}`}var S={};function C(){S={businessId:null,business:null,currentStep:1,totalSteps:6,selectedVehicleId:null,vehicles:[],bookingType:`bring_own`,selectedServiceIds:[],selectedProducts:[],selectedDate:null,selectedTime:null,notes:``,calendarYear:new Date().getFullYear(),calendarMonth:new Date().getMonth(),sendConfirmEmail:!1,sendConfirmSms:!1,serviceNumber:null,priceBreakdown:null,tireOrder:null,tireOrderId:null,skipProductsForTireOrder:!1}}function w(e){return e&&e.businessTypes.includes(`vulcanizer`)}function T(e){return[1,3,4,5,6]}function E(){return[`Vozilo`,`Storitve`,`Izdelki`,`Termin`,`Potrditev`]}function D(e){return T(S.business)[e-1]||e}function O(){return window.__currentUser?.uid||`mock-user`}function k(){return S.skipProductsForTireOrder?!0:f(S.selectedServiceIds).length===0}function A(){if(S.tireOrder?.estimatedDeliveryDate){let e=new Date(S.tireOrder.estimatedDeliveryDate);return e.setHours(0,0,0,0),e}if(S.tireHandoff?.estimatedDeliveryDate){let e=new Date(S.tireHandoff.estimatedDeliveryDate);return e.setHours(0,0,0,0),e}let e=new Date;return e.setHours(0,0,0,0),e}function j(){return`MA-${new Date().toISOString().slice(0,10).replace(/-/g,``)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`}async function M(e,t){let n=document.getElementById(e);if(n)try{await v.toCanvas(n,t,{width:160,margin:2,color:{dark:`#1e293b`,light:`#ffffff`}})}catch(e){console.warn(`[Booking] QR render failed`,e)}}function te(e){switch(e){case 1:return S.selectedVehicleId?null:`Prosim izberite vozilo.`;case 2:return S.bookingType?null:`Prosim izberite tip rezervacije.`;case 3:return S.selectedServiceIds.length===0?`Prosim izberite vsaj eno storitev.`:null;case 4:return null;case 5:return S.selectedDate?S.selectedTime?null:`Prosim izberite uro termina.`:`Prosim izberite datum.`;case 6:return null;default:return null}}function N(){let e=document.getElementById(`bookingSummaryLines`),t=document.getElementById(`bookingSummaryTotal`),n=document.getElementById(`bookingSummaryDivider`),r=document.getElementById(`bookingSummaryQuote`),i=document.getElementById(`bookingSummaryEmpty`);if(!e)return;if(S.selectedServiceIds.length===0&&S.selectedProducts.length===0){i&&(i.style.display=`block`),e.innerHTML=``,t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`);return}i&&(i.style.display=`none`);let{lineItems:a,total:o,hasQuoteItems:s}=d(S.selectedServiceIds,S.selectedProducts);S.priceBreakdown={lineItems:a,total:o,hasQuoteItems:s},e.innerHTML=a.map(e=>`
        <div class="summary-line">
            <span class="summary-line-label">${e.label}</span>
            <span class="summary-line-price ${e.isQuote?`quote`:``}">
                ${e.isQuote?`Po ogledu`:`${e.price} €`}
            </span>
        </div>
    `).join(``),t&&(o>0?(t.style.display=`flex`,n&&(n.style.display=`block`),t.innerHTML=`
                <span class="summary-total-label">Skupaj od</span>
                <span class="summary-total-price">${o} €</span>
            `):(t.style.display=`none`,n&&(n.style.display=`none`))),r&&(r.style.display=s?`flex`:`none`),window.lucide&&window.lucide.createIcons()}function P(){let e=document.getElementById(`bookingProgressTrack`);if(!e)return;let t=E(),n=t.length,r=S.currentStep,i=``;for(let e=1;e<=n;e++){let a=e<r,o=a?`done`:e===r?`active`:``;i+=`<div class="booking-step-pill">
            <div class="booking-step-pill-btn ${o}">
                ${a?`<i data-lucide="check" style="width:14px;height:14px;"></i>`:e}
            </div>
            <span class="booking-step-pill-label ${o}">${t[e-1]}</span>
        </div>`,e<n&&(i+=`<div class="booking-step-connector ${a?`done`:``}"></div>`)}e.innerHTML=i,window.lucide&&window.lucide.createIcons()}function F(){let e=document.getElementById(`wizardBack`),t=document.getElementById(`wizardNext`);!e||!t||(e.style.display=S.currentStep>1?`inline-flex`:`none`,t.innerHTML=S.currentStep===S.totalSteps?`<i data-lucide="check-circle"></i> Potrdi rezervacijo`:`Naprej <i data-lucide="chevron-right"></i>`,window.lucide&&window.lucide.createIcons())}function I(e){let t=document.getElementById(`bookingWizard`);t&&(t.classList.add(`step-exit`),setTimeout(()=>{switch(t.classList.remove(`step-exit`),t.classList.add(`step-enter`),D(e)){case 1:t.innerHTML=L(),R();break;case 2:t.innerHTML=z(),B();break;case 3:t.innerHTML=V(),H();break;case 4:t.innerHTML=U(),W();break;case 5:t.innerHTML=J(),Y();break;case 6:t.innerHTML=Z(),ne();break;default:t.innerHTML=``}requestAnimationFrame(()=>t.classList.remove(`step-enter`)),N(),window.lucide&&window.lucide.createIcons()},150))}function L(){let e=S.vehicles.map(e=>`
        <div class="vehicle-card glass-card ${e.id===S.selectedVehicleId?`selected`:``}" data-vid="${e.id}">
            <div class="vehicle-radio"><div class="vehicle-radio-dot"></div></div>
            <div class="vehicle-icon"><i data-lucide="car"></i></div>
            <div class="vehicle-info">
                <div class="vehicle-name">${e.brand} ${e.model} ${e.year}</div>
                <div class="vehicle-plate">${e.licensePlate||`Ni registrske številke`}</div>
            </div>
        </div>`).join(``),t=Array.from({length:26},(e,t)=>2025-t).map(e=>`<option value="${e}">${e}</option>`).join(``),n=o.map(e=>`<option value="${e}">${e}</option>`).join(``);return`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="car"></i> Izberite vozilo</h2>
        <div class="vehicle-list">${e||`<div class="step-empty"><i data-lucide="car"></i>Nimate shranjenega vozila.</div>`}</div>
        <button class="add-vehicle-toggle" id="addVehicleToggle">
            <i data-lucide="plus"></i> Dodaj novo vozilo
        </button>
        <div class="add-vehicle-form glass-card" id="addVehicleForm" style="display:none;">
            <div class="form-row">
                <label>Znamka</label>
                <select id="vBrand" class="glass-select">
                    <option value="">Izberite znamko...</option>
                    ${n}
                </select>
            </div>
            <div class="form-row">
                <label>Model</label>
                <select id="vModel" class="glass-select" disabled>
                    <option value="">Najprej izberite znamko</option>
                </select>
            </div>
            <div class="form-row">
                <label>Letnik</label>
                <select id="vYear" class="glass-select">
                    <option value="">Letnik...</option>
                    ${t}
                </select>
            </div>
            <div class="form-row">
                <label>Registrska številka</label>
                <input id="vPlate" class="glass-input" placeholder="npr. LJ A1-234" />
            </div>
            <button class="btn-save-vehicle" id="saveVehicleBtn">
                <i data-lucide="save"></i> Shrani in izberi vozilo
            </button>
        </div>
    </div>`}function R(){document.querySelectorAll(`.vehicle-card`).forEach(e=>{e.addEventListener(`click`,()=>{S.selectedVehicleId=e.getAttribute(`data-vid`),document.querySelectorAll(`.vehicle-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`)})}),document.getElementById(`addVehicleToggle`)?.addEventListener(`click`,()=>{let e=document.getElementById(`addVehicleForm`);e&&(e.style.display=e.style.display===`none`?`grid`:`none`)}),document.getElementById(`vBrand`)?.addEventListener(`change`,function(){let e=document.getElementById(`vModel`);if(!e)return;let t=p[this.value]||[];e.innerHTML=t.length?t.map(e=>`<option value="${e}">${e}</option>`).join(``):`<option value="">Ni modelov</option>`,e.disabled=t.length===0}),document.getElementById(`saveVehicleBtn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`vBrand`)?.value,t=document.getElementById(`vModel`)?.value,n=parseInt(document.getElementById(`vYear`)?.value),r=document.getElementById(`vPlate`)?.value.trim();if(!e||!t||!n){alert(`Prosim izpolnite znamko, model in letnik.`);return}let i=O(),o=a(i,{brand:e,model:t,year:n,licensePlate:r,userId:i});S.vehicles=[...S.vehicles,o],S.selectedVehicleId=o.id,g.addVehicle(o);let s=document.getElementById(`bookingWizard`);s.innerHTML=L(),R(),window.lucide&&window.lucide.createIcons()})}function z(){return`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="layers"></i> Tip rezervacije</h2>
        <div class="booking-type-cards">${[{id:`bring_own`,icon:`car-front`,label:`Prinesem lastne gume`,desc:`Imate že kupljene gume in jih želite samo namestiti pri nas.`},{id:`use_stored`,icon:`archive`,label:`Sezonska menjava (hramba)`,desc:`Zamenjamo gume, ki so shranjene pri nas iz prejšnje sezone.`},{id:`buy_new`,icon:`shopping-cart`,label:`Kupim nove gume`,desc:`Izberite med našimi gumami — namestimo na mestu ob prihodu.`}].map(e=>`
        <div class="type-card ${S.bookingType===e.id?`selected`:``}" data-type="${e.id}">
            <div class="type-card-icon"><i data-lucide="${e.icon}"></i></div>
            <div class="type-card-label">${e.label}</div>
            <div class="type-card-desc">${e.desc}</div>
        </div>
    `).join(``)}</div>
    </div>`}function B(){document.querySelectorAll(`.type-card`).forEach(e=>{e.addEventListener(`click`,()=>{S.bookingType=e.getAttribute(`data-type`),document.querySelectorAll(`.type-card`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`)})})}function V(){let e=m(S.business);return e.length===0?`<div class="wizard-step"><h2 class="step-title"><i data-lucide="wrench"></i> Storitve</h2>
            <div class="step-empty"><i data-lucide="alert-circle"></i>To podjetje nima navedenih storitev.</div></div>`:`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="wrench"></i> Izberite storitve</h2>
        <div class="services-grid">${e.map(e=>{let t=S.selectedServiceIds.includes(e.id)?`selected`:``;return`
        <div class="service-check-card ${t}" data-sid="${e.id}" role="checkbox" aria-checked="${!!t}" tabindex="0">
            <div class="service-check-icon"><i data-lucide="${e.icon}"></i></div>
            <div class="service-check-info">
                <div class="service-check-name">${e.label}</div>
                <div class="service-check-price">${e.priceLabel}</div>
            </div>
            <div class="service-check-mark"><i data-lucide="check"></i></div>
        </div>`}).join(``)}</div>
    </div>`}function H(){document.querySelectorAll(`.service-check-card`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.getAttribute(`data-sid`);e.classList.toggle(`selected`);let n=e.classList.contains(`selected`),r=e.querySelector(`input[type="checkbox"]`);r&&(r.checked=n),n?S.selectedServiceIds.includes(t)||S.selectedServiceIds.push(t):(S.selectedServiceIds=S.selectedServiceIds.filter(e=>e!==t),S.selectedProducts=S.selectedProducts.filter(e=>!f([t]).find(t=>t.id===e.productId))),N()})})}function U(){let e=f(S.selectedServiceIds);return e.length===0?`
        <div class="wizard-step">
            <h2 class="step-title"><i data-lucide="package"></i> Izdelki</h2>
            <div class="step-empty">
                <i data-lucide="package"></i>
                Za izbrane storitve ni dodatnih izdelkov.<br>
                <small style="color:#94a3b8;">Kliknite Naprej za nadaljevanje.</small>
            </div>
        </div>`:`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="package"></i> Izberite izdelke <small style="font-size:0.75rem;font-weight:500;color:#94a3b8;">(neobvezno)</small></h2>
        <p class="step-subtitle">Naročite vnaprej — namestimo ob prihodu. Cene so prikazane brez montaže.</p>
        <div class="products-grid">${e.map(e=>{let t=S.selectedProducts.find(t=>t.productId===e.id),n=t?t.qty:e.defaultQty,r=t?`selected`:``;return`
        <div class="product-card ${r}" data-pid="${e.id}">
            <div class="product-selected-badge"><i data-lucide="check"></i></div>
            <div class="product-img-placeholder"><i data-lucide="package"></i></div>
            <div class="product-body">
                <span class="product-tag">${e.tag}</span>
                <div class="product-name">${e.name}</div>
                <div class="product-brand">${e.brand}</div>
                <div class="product-price">${e.price===0?`Po dogovoru`:`${e.price} € / ${e.unit}`}</div>
            </div>
            <div class="product-footer">
                <div class="product-qty-row">
                    <span class="qty-label">Kol.:</span>
                    <div class="qty-controls">
                        <button class="qty-btn qty-minus" data-pid="${e.id}">−</button>
                        <span class="qty-val" id="qty-${e.id}">${n}</span>
                        <button class="qty-btn qty-plus" data-pid="${e.id}">+</button>
                    </div>
                </div>
                <button class="${r?`btn-product-remove`:`btn-product-add`}" data-pid="${e.id}" id="pbtn-${e.id}">
                    ${r?`✓ Dodano`:`+ Dodaj`}
                </button>
            </div>
        </div>`}).join(``)}</div>
    </div>`}function W(){let e=f(S.selectedServiceIds);document.querySelectorAll(`.qty-minus, .qty-plus`).forEach(t=>{t.addEventListener(`click`,n=>{n.stopPropagation();let r=t.getAttribute(`data-pid`),i=document.getElementById(`qty-${r}`);if(!i)return;let a=e.find(e=>e.id===r);if(!a)return;let o=parseInt(i.textContent)||a.defaultQty;o=t.classList.contains(`qty-plus`)?Math.min(o+1,8):Math.max(o-1,1),i.textContent=o;let s=S.selectedProducts.findIndex(e=>e.productId===r);s>=0&&(S.selectedProducts[s].qty=o,N())})}),document.querySelectorAll(`[id^="pbtn-"]`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation();let n=e.getAttribute(`data-pid`),r=document.querySelector(`.product-card[data-pid="${n}"]`),i=document.getElementById(`qty-${n}`),a=i?parseInt(i.textContent):1;r?.classList.contains(`selected`)?(S.selectedProducts=S.selectedProducts.filter(e=>e.productId!==n),r?.classList.remove(`selected`),e.textContent=`+ Dodaj`,e.className=`btn-product-add`):(S.selectedProducts.push({productId:n,qty:a}),r?.classList.add(`selected`),e.textContent=`✓ Dodano`,e.className=`btn-product-remove`),e.setAttribute(`data-pid`,n),N()})})}var G=[`Januar`,`Februar`,`Marec`,`April`,`Maj`,`Junij`,`Julij`,`Avgust`,`September`,`Oktober`,`November`,`December`],K=[`Pon`,`Tor`,`Sre`,`Čet`,`Pet`,`Sob`,`Ned`];function q(e,t){let n=new Date;n.setHours(0,0,0,0);let r=new Date(e,t,1).getDay();r=r===0?6:r-1;let i=new Date(e,t+1,0).getDate(),a=new Date(e,t,0).getDate(),o=``;for(let e=r-1;e>=0;e--)o+=`<div class="cal-day other-month">${a-e}</div>`;let s=A();for(let r=1;r<=i;r++){let i=new Date(e,t,r),a=i.toISOString().slice(0,10),c=i.getDay()===0,l=i<s,u=i.getTime()===n.getTime(),d=S.selectedDate===a,f=`cal-day`;l||c?f+=` disabled`:d&&(f+=` selected`),u&&(f+=` today`);let p=!l&&!c?`data-date="${a}"`:``;o+=`<div class="${f}" ${p}>${r}${u?`<span class="cal-today-dot"></span>`:``}</div>`}let c=r+i,l=c%7==0?0:7-c%7;for(let e=1;e<=l;e++)o+=`<div class="cal-day other-month">${e}</div>`;return o}function J(){let e=u.map(e=>{let t=s.includes(e)?`disabled`:``;return`<button class="time-pill ${S.selectedTime===e&&!t?`selected`:``}" data-time="${e}" ${t}>${e}</button>`}).join(``),{calendarYear:t,calendarMonth:n}=S,r=!(t===new Date().getFullYear()&&n<=new Date().getMonth());return`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="calendar"></i> Izberite termin</h2>
        ${S.tireOrder?.estimatedDeliveryDate?`<div style="display:flex;align-items:center;gap:0.5rem;background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);border-radius:0.625rem;padding:0.5rem 0.875rem;font-size:0.8rem;color:#1e40af;margin-bottom:1rem;">
               <i data-lucide="truck" style="width:14px;height:14px;flex-shrink:0;"></i>
               Gume pričakovane <strong style="margin-left:0.25rem;">${S.tireOrder.estimatedDeliveryDate}</strong> — termini pred tem datumom so onemogočeni.
           </div>`:``}
        <div class="datetime-layout">

            <div class="cal-section">
                <div class="cal-widget glass-card">
                    <div class="cal-header">
                        <button class="cal-nav-btn" id="calPrev" ${r?``:`disabled`}>
                            <i data-lucide="chevron-left"></i>
                        </button>
                        <span class="cal-month-label">${G[n]} ${t}</span>
                        <button class="cal-nav-btn" id="calNext">
                            <i data-lucide="chevron-right"></i>
                        </button>
                    </div>
                    <div class="cal-dow-row">
                        ${K.map(e=>`<span>${e}</span>`).join(``)}
                    </div>
                    <div class="cal-grid" id="calGrid">
                        ${q(t,n)}
                    </div>
                    ${S.selectedDate?`<div class="cal-selected-label">
                        <i data-lucide="check-circle" style="width:13px;height:13px;color:#16a34a;"></i>
                        ${c(S.selectedDate)}
                    </div>`:``}
                </div>
            </div>

            <div>
                <div class="dt-section-label">Ura</div>
                <div class="time-grid">${e}</div>
            </div>

            <div class="notes-section">
                <div class="dt-section-label">Opomba (neobvezno)</div>
                <textarea id="bookingNotes" class="glass-input" rows="3"
                    placeholder="Npr. Prosim pokličite dan prej...">${S.notes}</textarea>
            </div>
        </div>
    </div>`}function Y(){document.getElementById(`calPrev`)?.addEventListener(`click`,()=>{S.calendarMonth===0?(S.calendarMonth=11,S.calendarYear--):S.calendarMonth--,X()}),document.getElementById(`calNext`)?.addEventListener(`click`,()=>{let e=new Date,t=e.getFullYear()+ +(e.getMonth()+6>11),n=(e.getMonth()+6)%12;(S.calendarYear<t||S.calendarYear===t&&S.calendarMonth<n)&&(S.calendarMonth===11?(S.calendarMonth=0,S.calendarYear++):S.calendarMonth++,X())}),document.getElementById(`calGrid`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.cal-day[data-date]`);t&&(S.selectedDate=t.getAttribute(`data-date`),X())}),document.querySelectorAll(`.time-pill:not(:disabled)`).forEach(e=>{e.addEventListener(`click`,()=>{S.selectedTime=e.getAttribute(`data-time`),document.querySelectorAll(`.time-pill`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`)})}),document.getElementById(`bookingNotes`)?.addEventListener(`input`,function(){S.notes=this.value})}function X(){let e=document.getElementById(`calGrid`),t=document.querySelector(`.cal-month-label`);document.querySelector(`.cal-selected-label`);let n=document.getElementById(`calPrev`),{calendarYear:r,calendarMonth:i}=S;e&&(e.innerHTML=q(r,i)),t&&(t.textContent=`${G[i]} ${r}`),n&&(n.disabled=r===new Date().getFullYear()&&i<=new Date().getMonth()),document.getElementById(`calGrid`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.cal-day[data-date]`);t&&(S.selectedDate=t.getAttribute(`data-date`),X())});let a=document.querySelector(`.cal-widget`);if(a){let e=a.querySelector(`.cal-selected-label`);S.selectedDate?(e||(e=document.createElement(`div`),e.className=`cal-selected-label`,a.appendChild(e)),e.innerHTML=`<i data-lucide="check-circle" style="width:13px;height:13px;color:#16a34a;"></i> ${c(S.selectedDate)}`):e&&e.remove()}window.lucide&&window.lucide.createIcons()}function Z(){let e=S.business,t=S.vehicles.find(e=>e.id===S.selectedVehicleId),{lineItems:n,total:r,hasQuoteItems:i}=d(S.selectedServiceIds,S.selectedProducts);S.serviceNumber||=j();let a=n.map(e=>`
        <div class="confirm-line-item">
            <span class="confirm-line-label">${e.label}</span>
            <strong class="confirm-line-price">${e.isQuote?`Po ogledu`:e.price+` €`}</strong>
        </div>
    `).join(``);return{bring_own:`Prinesem lastne gume`,use_stored:`Sezonska menjava (hramba)`,buy_new:`Kupim nove gume`}[S.bookingType],`
    <div class="wizard-step">
        <h2 class="step-title"><i data-lucide="clipboard-check"></i> Potrdite rezervacijo</h2>
        <div class="confirm-layout">

            <!-- Service number badge -->
            <div class="confirm-service-number-card glass-card">
                <div class="csn-icon"><i data-lucide="hash"></i></div>
                <div>
                    <div class="csn-label">Številka storitve</div>
                    <div class="csn-value">${S.serviceNumber}</div>
                </div>
                <div class="confirm-qr-mini">
                    <canvas id="confirmQRMini"></canvas>
                </div>
            </div>

            <div class="confirm-section glass-card">
                <div class="confirm-section-label">Podjetje</div>
                <div class="confirm-section-value">${e.name} · ${e.location.city}</div>
            </div>

            <div class="confirm-section glass-card">
                <div class="confirm-section-label">Vozilo</div>
                <div class="confirm-section-value">
                    ${t?`${t.brand} ${t.model} ${t.year}${t.licensePlate?` · `+t.licensePlate:``}`:`—`}
                </div>
            </div>



            <div class="confirm-section glass-card">
                <div class="confirm-section-label">Storitve in cene</div>
                <div class="confirm-section-value">${a}</div>
            </div>

            <div class="confirm-section glass-card">
                <div class="confirm-section-label">Termin</div>
                <div class="confirm-section-value">
                    ${c(S.selectedDate)} ob ${S.selectedTime}
                    ${S.notes?`<br><small style="color:#94a3b8;">${S.notes}</small>`:``}
                </div>
            </div>

            <div class="confirm-total-card">
                <span class="confirm-total-label">Skupaj od</span>
                <span class="confirm-total-price">${r>0?r+` €`:`Po ogledu`}</span>
            </div>

            ${i?`<p class="confirm-quote-note">
                * Nekatere storitve so po ogledu in niso vključene v skupno ceno.
            </p>`:``}

            <!-- Notification toggles -->
            <div class="confirm-notify-card glass-card">
                <div class="notify-card-title"><i data-lucide="bell"></i> Obvesti me</div>
                <label class="toggle-row">
                    <div class="toggle-row-text">
                        <span class="toggle-row-label">Pošlji potrditev s QR kodo na email</span>
                        <span class="toggle-row-sub">Kupec prejme potrditv in QR kodo po e-pošti</span>
                    </div>
                    <div class="toggle-switch-wrap">
                        <input type="checkbox" id="toggleEmail" class="toggle-input" ${S.sendConfirmEmail?`checked`:``} />
                        <span class="toggle-switch"></span>
                    </div>
                </label>
                <label class="toggle-row">
                    <div class="toggle-row-text">
                        <span class="toggle-row-label">Pošlji link potrditve na SMS</span>
                        <span class="toggle-row-sub">Kupec prejme SMS s kratkim linkom na potrditev</span>
                    </div>
                    <div class="toggle-switch-wrap">
                        <input type="checkbox" id="toggleSms" class="toggle-input" ${S.sendConfirmSms?`checked`:``} />
                        <span class="toggle-switch"></span>
                    </div>
                </label>
            </div>

            <button class="btn-confirm-booking" id="confirmBookingBtn">
                <i data-lucide="check-circle"></i> Potrdi rezervacijo
            </button>
        </div>
    </div>`}function ne(){document.getElementById(`confirmBookingBtn`)?.addEventListener(`click`,Q),document.getElementById(`toggleEmail`)?.addEventListener(`change`,function(){S.sendConfirmEmail=this.checked}),document.getElementById(`toggleSms`)?.addEventListener(`change`,function(){S.sendConfirmSms=this.checked}),M(`confirmQRMini`,S.serviceNumber)}function Q(){let e=O(),t=S.vehicles.find(e=>e.id===S.selectedVehicleId),{total:n}=d(S.selectedServiceIds,S.selectedProducts),i=S.serviceNumber||j(),a=ee({userId:e,businessId:S.businessId,businessName:S.business.name,vehicleId:S.selectedVehicleId,vehicleLabel:t?`${t.brand} ${t.model} ${t.year}${t.licensePlate?` · `+t.licensePlate:``}`:``,services:S.selectedServiceIds,products:S.selectedProducts,bookingType:w(S.business)?S.bookingType:null,totalPrice:n,date:S.selectedDate,time:S.selectedTime,notes:S.notes,serviceNumber:i,sendConfirmEmail:S.sendConfirmEmail,sendConfirmSms:S.sendConfirmSms,...S.tireHandoff?{tireHandoff:S.tireHandoff}:{}});g.addBooking(a),S.tireOrderId&&r(S.tireOrderId).catch(e=>console.warn(`[Booking] Failed to mark tire order as ordered`,e)),S.sendConfirmEmail&&console.info(`[Booking] Email s QR kodo poslan na:`,e),S.sendConfirmSms&&console.info(`[Booking] SMS z linkom poslan na:`,e);let o=x(a,S.business),s=document.getElementById(`bookingNav`);s&&(s.style.display=`none`);let l=document.getElementById(`bookingWizard`);l.classList.remove(`step-exit`,`step-enter`),l.innerHTML=`
    <div class="booking-success">
        <div class="success-icon"><i data-lucide="check-circle"></i></div>
        <h2 class="success-title">Rezervacija uspešna!</h2>
        <p class="success-subtitle">
            Potrditev je bila posredovana.
            Vse rezervacije si oglejte v <a href="#/dashboard">svojem profilu</a>.
        </p>

        <!-- Service number + QR -->
        <div class="success-sn-block">
            <div class="success-sn-left">
                <div class="success-sn-label">Številka storitve</div>
                <div class="success-sn-value">${i}</div>
                <div class="success-sn-hint">
                    <i data-lucide="info" style="width:11px;height:11px;"></i>
                    Pokažite QR kodo serviserju ob prihodu
                </div>
            </div>
            <div class="success-qr-wrap">
                <canvas id="successQRCanvas"></canvas>
            </div>
        </div>

        <!-- Notification status badges -->
        ${S.sendConfirmEmail?`<div class="success-notify-badge email">
            <i data-lucide="mail"></i> Potrditev s QR kodo poslana na e-pošto
        </div>`:``}
        ${S.sendConfirmSms?`<div class="success-notify-badge sms">
            <i data-lucide="smartphone"></i> SMS z linkom poslan
        </div>`:``}

        <div class="success-details">
            <div class="success-detail-row">
                <span class="success-detail-key">Podjetje</span>
                <span class="success-detail-val">${S.business.name}</span>
            </div>
            <div class="success-detail-row">
                <span class="success-detail-key">Datum</span>
                <span class="success-detail-val">${c(S.selectedDate)} ob ${S.selectedTime}</span>
            </div>
            <div class="success-detail-row">
                <span class="success-detail-key">Skupaj od</span>
                <span class="success-detail-val">${n>0?n+` €`:`Po ogledu`}</span>
            </div>
            <div class="success-detail-row">
                <span class="success-detail-key">Status</span>
                <span class="success-detail-val" style="color:#d97706;">Čaka potrditve</span>
            </div>
        </div>

        <div class="success-actions">
            <a href="${o}" target="_blank" rel="noopener" class="btn-gcal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="#4285f4" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
                Shrani v Google Koledar
            </a>
            <a href="#/dashboard" class="booking-btn-primary" style="text-decoration:none;">
                <i data-lucide="layout-dashboard"></i> Pojdi na profil
            </a>
        </div>
    </div>`,M(`successQRCanvas`,i);let u=document.getElementById(`bookingSummary`);u&&(u.style.display=`none`),window.lucide&&window.lucide.createIcons()}function re(){let e=te(D(S.currentStep));if(e){ae(e);return}if($(),S.currentStep>=S.totalSteps){Q();return}S.currentStep++,D(S.currentStep)===4&&k()&&S.currentStep++,P(),I(S.currentStep),F(),_()}function ie(){S.currentStep<=1||(S.currentStep--,D(S.currentStep)===4&&k()&&S.currentStep--,$(),P(),I(S.currentStep),F(),_())}function ae(e){let t=document.getElementById(`wizardError`);t||(t=document.createElement(`div`),t.id=`wizardError`,t.style.cssText=`background:#fef2f2;border:1px solid #fecaca;border-radius:0.75rem;padding:0.65rem 1rem;font-size:0.82rem;color:#dc2626;font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;`,t.innerHTML=`<i data-lucide="alert-circle" style="width:14px;height:14px;flex-shrink:0;"></i><span></span>`,document.getElementById(`bookingWizard`)?.insertAdjacentElement(`afterend`,t)),t.querySelector(`span`).textContent=e,t.style.display=`flex`,window.lucide&&window.lucide.createIcons()}function $(){document.getElementById(`wizardError`)?.remove()}function oe(){let e=S.business;if(!e)return;let t=document.getElementById(`bookingBizContext`);if(!t)return;let n=e.businessTypes.map(e=>`<span class="booking-biz-type-badge ${e}">${{dealer:`Avto hiša`,service:`Servis`,vulcanizer:`Vulkanizer`}[e]||e}</span>`).join(``);t.innerHTML=`
        <img class="booking-biz-logo" src="${e.logo}" alt="${e.name}" />
        <div class="booking-biz-info">
            <div class="booking-biz-name">${e.name}</div>
            <div class="booking-biz-meta">
                <i data-lucide="map-pin"></i>${e.location.city}
                &nbsp;${n}
            </div>
        </div>
        <a href="#/poslovni-profil?id=${e.id}" class="booking-back" style="margin:0;font-size:0.75rem;">
            Profil →
        </a>
    `,window.lucide&&window.lucide.createIcons()}function se(e){if(document.getElementById(`tireHandoffBanner`))return;let t=document.createElement(`div`);t.id=`tireHandoffBanner`,t.style.cssText=[`background:linear-gradient(135deg,rgba(37,99,235,0.12),rgba(79,70,229,0.10))`,`border:1px solid rgba(37,99,235,0.25)`,`border-radius:1rem`,`padding:0.875rem 1.125rem`,`margin-bottom:1.25rem`,`display:flex`,`align-items:center`,`gap:0.75rem`,`font-size:0.82rem`,`color:#1e40af`].join(`;`),t.innerHTML=`
        <i data-lucide="package-check" style="width:18px;height:18px;flex-shrink:0;color:#2563eb;"></i>
        <span>
            <strong>Nadaljujemo z rezervacijo montaže za vaše nove pnevmatike.</strong>
            ${e.quantity}× ${e.tireBrand} ${e.tireModel} (${e.tireDim}) —
            izberite samo še termin.
        </span>
    `,document.getElementById(`bookingProgress`)?.insertAdjacentElement(`afterend`,t),window.lucide&&window.lucide.createIcons()}function ce(e){if(document.getElementById(`tireHandoffBanner`))return;let t=e.tireData||{},n=document.createElement(`div`);n.id=`tireHandoffBanner`,n.style.cssText=[`background:linear-gradient(135deg,rgba(37,99,235,0.12),rgba(79,70,229,0.10))`,`border:1px solid rgba(37,99,235,0.25)`,`border-radius:1rem`,`padding:0.875rem 1.125rem`,`margin-bottom:1.25rem`,`display:flex`,`align-items:center`,`gap:0.75rem`,`font-size:0.82rem`,`color:#1e40af`].join(`;`),n.innerHTML=`
        <i data-lucide="package-check" style="width:18px;height:18px;flex-shrink:0;color:#2563eb;"></i>
        <span>
            <strong>Gume so bile naročene preko MojAvto in bodo dostavljene na vaš naslov.</strong>
            ${t.quantity}× ${t.brand} ${t.model} (${t.dimension}) —
            izberite termin montaže po dostavi.
        </span>
    `,document.getElementById(`bookingProgress`)?.insertAdjacentElement(`afterend`,n),window.lucide&&window.lucide.createIcons()}async function le(){console.log(`[BookingPage] init`),C();let e=sessionStorage.getItem(t(`tire_handoff`)),r=e?(()=>{try{return JSON.parse(e)}catch{return null}})():null;r&&sessionStorage.removeItem(t(`tire_handoff`));let a=window.location.hash,o=a.match(/[?&]businessId=([^&]+)/),s=(a.match(/[?&]service=([^&]+)/)||[])[1],c=(a.match(/[?&]tireOrderId=([^&]+)/)||[])[1]||null;if(S.businessId=r?.vulcanizerId||(o?o[1]:null),!S.businessId){let e=document.getElementById(`bookingWizard`);e&&(e.innerHTML=`
            <div class="booking-error">
                <h2>Napaka</h2>
                <p>Ni določenega poslovnega profila. Pojdite nazaj na <a href="#/zemljevid">zemljevid</a>.</p>
            </div>`);return}if(S.business=i(S.businessId),!S.business){if(r){console.warn(`[Booking] Handoff vulcanizer not found, falling back to standard flow`);let e=document.getElementById(`bookingWizard`);e&&(e.innerHTML=`
                <div class="booking-error">
                    <h2>Vulkanizer ni več na voljo</h2>
                    <p>Izbrani vulkanizer ni bil najden. Izberite drugega na <a href="#/zemljevid">zemljevidu</a>.</p>
                </div>`);return}let e=document.getElementById(`bookingWizard`);e&&(e.innerHTML=`
            <div class="booking-error">
                <h2>Podjetje ni najdeno</h2>
                <p>Poslovnega profila ni mogoče naložiti. <a href="#/zemljevid">Nazaj na zemljevid.</a></p>
            </div>`);return}S.totalSteps=T(S.business).length;let u=O();if(S.vehicles=l(u),g.setVehicles(S.vehicles),s&&S.business.servicesOffered.includes(s)&&(S.selectedServiceIds=[s]),c)try{let e=await n(c);if(e&&e.status===`confirmed`)S.tireOrderId=c,S.tireOrder=e,S.skipProductsForTireOrder=!0;else if(e){let e=document.getElementById(`bookingWizard`);e&&(e.innerHTML=`
                    <div class="booking-error">
                        <h2>Naročilo gum še ni potrjeno</h2>
                        <p>Vulkanizer še ni potrdil sprejema gum. Termin boste lahko rezervirali po potrditvi.</p>
                    </div>`);return}}catch(e){console.warn(`[Booking] Failed to load tire order`,e)}if(r&&(S.tireHandoff=r,S.bookingType=`bring_own`,S.business.servicesOffered.includes(`tyre_change`)&&(S.selectedServiceIds.includes(`tyre_change`)||S.selectedServiceIds.push(`tyre_change`)),S.notes=`SISTEMSKO SPOROČILO: Naročene pnevmatike (${r.quantity}× ${r.tireBrand} ${r.tireModel}, dimenzije: ${r.tireDim}) bodo dostavljene na vaš naslov. Stranka želi montažo.`),S.tireOrder){let e=S.tireOrder;S.bookingType=`bring_own`,S.business.servicesOffered.includes(`tyre_change`)&&!S.selectedServiceIds.includes(`tyre_change`)&&S.selectedServiceIds.push(`tyre_change`),S.notes=`Montaža dostavljenih gum (naročilo MojAvto #${e.id}). Gume bodo dostavljene na vaš naslov.`}let d=document.getElementById(`bookingBackLabel`);d&&(d.textContent=`Nazaj na profil`);let f=document.getElementById(`bookingBack`);f&&(f.href=`#/poslovni-profil?id=${S.businessId}`),oe(),P(),r&&se(r),S.tireOrder&&ce(S.tireOrder),I(1),F(),document.getElementById(`wizardNext`)?.addEventListener(`click`,re),document.getElementById(`wizardBack`)?.addEventListener(`click`,ie),window.lucide&&window.lucide.createIcons()}export{le as initBookingPage};