const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./listingService-B896QzBR.js","./listingService-CHYpX_DS.js","./preload-helper-kNaey6uv.js","./firebase-D04QZ5MM.js","./index.esm-DejIl58p.js","./platform-BvWcB7wr.js","./storageKeys-BraFEh3o.js","./sampleListings-CTAGWO7V.js"])))=>i.map(i=>d[i]);
import{r as e}from"./chunk-QTnfLwEv.js";import{t}from"./storageKeys-BraFEh3o.js";import{a as n,t as r}from"./i18n-BZd20ht-.js";import{I as i,L as a,tt as o}from"./index.esm-DejIl58p.js";import{n as s,r as c}from"./firebase-D04QZ5MM.js";import{t as l}from"./preload-helper-kNaey6uv.js";import{S as u,a as d,i as f,l as p,o as m,r as h}from"./listingService-CHYpX_DS.js";import{t as g}from"./authGate-BAhVLKA2.js";import{o as _,s as v,t as y}from"./garageService-BlDALu--.js";import{t as b}from"./listingUtils-DBvePdce.js";import{t as x}from"./valuationScore-BHvyVyKH.js";import{r as S}from"./priceRatingUi-Bn9tzU9L.js";import{i as C,o as ee}from"./jsx-runtime-BILTUGeO.js";import{t as te}from"./CostPanel-ISMDH_4i.js";import{n as ne}from"./serviceBookService-Dwa7rl6z.js";var w=e(ee(),1),T=e(C(),1);async function E(){console.log(`[ListingPage] init`);let e=new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`id`),t=document.getElementById(`listingPage`);if(!e){t&&(t.innerHTML=$(n(`error_listing_not_found`),n(`error_missing_id`)));return}try{let[t,n]=await Promise.all([f(e),m().catch(()=>[])]);p(e),I(t),O(t,n),D(t)}catch(e){console.error(`[ListingPage]`,e),t&&(t.innerHTML=$(n(`error_listing_not_found`),e.message))}}async function D(e){let t=e.vin||e.vinDetails?.vin;if(!t)return;let i=await ne(t);if(!i.length)return;let a=document.getElementById(`lpServiceBadge`);a&&(a.innerHTML=`
            <div class="trust-badge">
                <i data-lucide="shield-check"></i>
                ${n(`verified_service_history`)}
            </div>`,window.lucide&&window.lucide.createIcons());let o=document.getElementById(`service-history-container`);if(!o)return;let s={mali_servis:n(`minor_service`),veliki_servis:n(`major_service`),popravilo:n(`repair`),pnevmatike:n(`tires`),drugo:n(`other`)},c=i.map(e=>{let t=e.date?new Date(e.date).toLocaleDateString(`en-US`,{day:`numeric`,month:`long`,year:`numeric`}):`—`,i=e.mileage?new Intl.NumberFormat(r()===`sl`?`sl-SI`:`en-US`).format(e.mileage)+` km`:null;return`
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-type">${Q(s[e.serviceType]||e.serviceType||n(`other`))}</span>
                        <span class="timeline-date">${Q(t)}</span>
                    </div>
                    ${i?`<div class="timeline-km">${Q(i)}</div>`:``}
                    <div class="timeline-mechanic">${Q(e.mechanicName||``)}</div>
                    ${e.description?`<div class="timeline-desc">${Q(e.description)}</div>`:``}
                </div>
            </div>`}).join(``);o.innerHTML=`
        <section class="lp-section">
            <h2 class="lp-section-title">${n(`service_history`)}</h2>
            <div class="service-timeline">${c}</div>
        </section>`,o.style.display=`block`}function O(e,t){let r=document.getElementById(`lpRatingBlock`);if(!r)return;let i=x(e,t);if(!i||i.confidence===`low`){r.innerHTML=S({stars:3,label:`Poštena cena`},{rareFeaturesLabel:n(`rare_features`)});return}r.innerHTML=S(i,{confidenceLabel:i.confidence===`high`?n(`high_confidence`)+` (${i.comparablesCount} ${n(`listings`).toLowerCase()})`:n(`medium_confidence`)+` (${i.comparablesCount} ${n(`listings`).toLowerCase()})`,rareFeaturesLabel:n(`rare_features`)})}function k(e){let t=d(e),i=e=>new Intl.NumberFormat(r()===`sl`?`sl-SI`:`en-US`).format(e),a=(e,t)=>`
        <div class="lp-view-stat">
            <span class="lp-view-num">${i(e)}</span>
            <span class="lp-view-label">${Q(t)}</span>
        </div>`;return`
        <div class="lp-sidebar-card lp-views-card">
            <div class="lp-views-title">
                <i data-lucide="eye"></i>
                <span>${n(`views_stats_title`,`Ogledi oglasa`)}</span>
            </div>
            <div class="lp-views-grid">
                ${a(t.today,n(`views_today`,`Danes`))}
                ${a(t.week,n(`views_week`,`Ta teden`))}
                ${a(t.total,n(`views_total`,`Skupaj`))}
            </div>
        </div>`}function A(e){e.classList.remove(`lp-btn-pop`),e.offsetWidth,e.classList.add(`lp-btn-pop`),clearTimeout(e._popTimer),e._popTimer=setTimeout(()=>e.classList.remove(`lp-btn-pop`),480)}var j=t(`liked`);function M(){try{return new Set(JSON.parse(localStorage.getItem(j)||`[]`))}catch{return new Set}}function N(e){try{localStorage.setItem(j,JSON.stringify([...e]))}catch{}}async function P(e){let t=document.getElementById(`lpFavBtn`);if(!t)return;M().has(e.id)&&t.classList.add(`active`);let r=async n=>{if(n)try{let r=await _(n.uid,e.id),i=M();r?(i.add(e.id),t.classList.add(`active`)):(i.delete(e.id),t.classList.remove(`active`)),N(i)}catch{}};if(s.currentUser)r(s.currentUser);else{let e=s.onAuthStateChanged(t=>{e(),r(t)})}t.addEventListener(`click`,async()=>{let r=s.currentUser;if(!r)try{r=await g({icon:`❤️`,title:n(`save_to_favorites_title`),message:n(`save_to_favorites_msg`)})}catch{return}let i=t.classList.contains(`active`),a=!i;a?t.classList.add(`active`):t.classList.remove(`active`);let o=M();a?o.add(e.id):o.delete(e.id),N(o),A(t),t.disabled=!0;try{i?await v(r.uid,e.id):await y(r.uid,{id:e.id,title:e.make+` `+e.model,price:e.priceEur||e.price,images:e.images})}catch(e){console.warn(`[lpFavBtn] Firebase sync failed (local state kept):`,e)}finally{t.disabled=!1}})}function F(e){let r=document.getElementById(`lpCompareBtn`);if(!r)return;let i=()=>{try{return JSON.parse(localStorage.getItem(t(`compare`))||`[]`)}catch{return[]}};i().some(t=>t.id===e.id)&&r.classList.add(`active`),r.addEventListener(`click`,async()=>{let a=i(),o=a.findIndex(t=>t.id===e.id);if(o!==-1){a.splice(o,1),r.classList.remove(`active`),A(r),localStorage.setItem(t(`compare`),JSON.stringify(a)),window.updateHeaderCompare&&window.updateHeaderCompare();return}let c=s.currentUser;if(!c)try{c=await g({icon:`⚖️`,title:n(`compare_vehicles_title`),message:n(`compare_vehicles_msg`)})}catch{return}if(a.length>=3){alert(n(`compare_limit_3`));return}a.push({id:e.id,title:e.make+` `+e.model,image:e.images?.exterior?.[0]||``,price:e.priceEur||e.price}),r.classList.add(`active`),A(r),localStorage.setItem(t(`compare`),JSON.stringify(a)),window.updateHeaderCompare&&window.updateHeaderCompare()})}function I(e){let t=document.getElementById(`listingPage`);if(!t)return;let r=e.images?.exterior||[],i=e.images?.interior||[],a=e.promotion?.tier===`sponsored`;t.innerHTML=`
        <div class="lp-container">

            <!-- Breadcrumb -->
            <nav class="lp-breadcrumb">
                <a href="#/">${n(`nav_home`)}</a>
                <span class="lp-bc-sep">›</span>
                <a href="#/iskanje?cat=${encodeURIComponent(e.category||``)}">
                    ${Q(re(e.category))}
                </a>
                ${e.make?`<span class="lp-bc-sep">›</span><span class="lp-bc-current">${Q(e.make)} ${Q(e.model||``)} ${Q(e.variant||``)}</span>`:``}
            </nav>

            <!-- Sponsored tag (subtle) -->
            ${a?`<div class="lp-sponsored-tag">${n(`sponsored_listing`)}</div>`:``}

            <!-- Header: title -->
            <header class="lp-header">
                <div class="lp-header-main">
                    <h1 class="lp-title">${Q(X(e))}</h1>
                    <div class="lp-meta-row">
                        <div class="lp-view-toggle">
                            <button class="lp-view-btn active" data-view="exterior">${n(`exterior`)}</button>
                            <button class="lp-view-btn ${i.length===0?`disabled`:``}" data-view="interior" ${i.length===0?`disabled`:``}>${n(`interior`)}</button>
                        </div>
                        ${e.createdAt?`<span>📅 ${ie(e.createdAt)}</span>`:``}
                        ${e.viewCount?`<span>👁 ${n(`views_count`,{count:e.viewCount})}</span>`:``}
                    </div>
                </div>
            </header>

            <!-- Two-column layout -->
            <div class="lp-layout">

                <!-- LEFT: main content -->
                <div class="lp-main">

                    <!-- Image gallery -->
                    ${L(r,i,e.condition)}

                    <!-- Service history (populated async by injectServiceHistory) -->
                    <div id="service-history-container" style="display:none;"></div>

                    <!-- Description -->
                    ${e.description?`
                    <section class="lp-section">
                        <h2 class="lp-section-title">${n(`vehicle_description`)}</h2>
                        <div class="lp-description">${Q(e.description).replace(/\n/g,`<br>`)}</div>
                    </section>`:``}

                    <!-- Technical specs + equipment (combined) -->
                    ${z(e)}

                    <!-- Seller note (private sellers) -->
                    ${e.sellerNote?`
                    <section class="lp-section">
                        <div class="lp-seller-note-block">
                            <i data-lucide="message-circle"></i>
                            <div>
                                <span class="lp-seller-note-label">${n(`seller_note`)}</span>
                                <p class="lp-seller-note-text">${Q(e.sellerNote)}</p>
                            </div>
                        </div>
                    </section>`:``}

                </div>

                <!-- RIGHT: sidebar (Sticky) -->
                <aside class="lp-sidebar">

                    <!-- Price Card (Pilled and Centered) -->
                    <div class="lp-sidebar-card lp-price-card centered">
                        <div class="lp-price-pill-container">
                            ${e.salePriceEur?`
                            <div>
                                <div class="lp-sale-price">${h(e.salePriceEur,!1)}</div>
                                <div class="lp-original-price">${h(e.priceEur||e.priceRaw||e.price||0,!1)}</div>
                                <div class="lp-discount-pct">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                    -${Math.round((1-e.salePriceEur/(e.priceEur||e.priceRaw||e.price))*100)}%
                                </div>
                            </div>`:`
                            <div class="lp-price">${h(e.priceRaw||e.priceEur||e.price||0,e.callForPrice)}</div>`}
                        </div>
                        <div id="lpRatingBlock"></div>
                        <div id="lpServiceBadge"></div>
                        ${e.priceNegotiable?`<div class="lp-price-sub">${n(`price_is_negotiable`)}</div>`:``}
                        ${e.leaseAvailable&&!e.leasingConditions?`<div class="lp-price-sub">${n(`financing_available`)}</div>`:``}
                        ${e.leasingConditions?`
                        <button class="lp-leasing-btn" id="btnShowLeasing">
                            <i data-lucide="credit-card"></i> ${n(`check_financing_options`)}
                        </button>`:``}

                        <!-- Like + Compare actions -->
                        <div class="lp-action-row">
                            <button class="lp-action-btn lp-fav-btn" id="lpFavBtn" data-listing-id="${e.id}" title="${n(`save_to_favorites_title`)}">
                                <i data-lucide="heart"></i>
                                <span>${n(`save_btn`)}</span>
                            </button>
                            <button class="lp-action-btn lp-compare-btn" id="lpCompareBtn" data-listing-id="${e.id}" title="${n(`compare_vehicles_title`)}">
                                <i data-lucide="scale"></i>
                                <span>${n(`compare_btn`)}</span>
                            </button>
                        </div>
                    </div>

                    <!-- View statistics -->
                    ${k(e)}

                    <!-- Cost Panel -->
                    <div id="react-cost-panel-root"></div>

                    <!-- Seller card -->
                    ${W(e)}

                </aside>
            </div>



            <!-- Similar -->
            <section class="lp-similar">
                <h2 class="lp-section-title">${n(`similar_listings`)}</h2>
                <div id="similarGrid" class="lp-similar-grid">
                    <p style="color:#94a3b8;font-size:0.85rem;">${n(`loading_similar_listings`)}</p>
                </div>
            </section>

        </div>
    `;let o=document.getElementById(`react-cost-panel-root`),c=e.priceRaw||e.priceEur||e.price,l=e.powerKw||e.power;if(o&&c&&l&&T.createRoot(o).render(w.createElement(te,{price:Number(c),powerKw:Number(l),fuelType:e.fuel||``,mpg:e.fuelL100km?235.215/e.fuelL100km:null,kWhPer100km:e.electricConsumption||null,isNew:e.isNew!==!1,make:e.make||``,category:e.category||`sedan`,vin:e.vin||``})),e.leasingConditions){let t=document.createElement(`div`);t.id=`leasingModal`,t.className=`lp-modal-overlay`,t.innerHTML=`
            <div class="lp-modal">
                <div class="lp-modal-header">
                    <h3 class="lp-modal-title">${n(`financing_modal_title`)}</h3>
                    <button class="lp-modal-close" id="btnCloseLeasingModal" aria-label="Close">✕</button>
                </div>
                <div class="lp-modal-body">${Q(e.leasingConditions).replace(/\n/g,`<br>`)}</div>
            </div>`,document.body.appendChild(t),document.getElementById(`btnShowLeasing`)?.addEventListener(`click`,()=>{t.classList.add(`active`)}),document.getElementById(`btnCloseLeasingModal`)?.addEventListener(`click`,()=>{t.classList.remove(`active`)}),t.addEventListener(`click`,e=>{e.target===t&&t.classList.remove(`active`)})}R(r,i),P(e),F(e),document.getElementById(`lpReportBtn`)?.addEventListener(`click`,()=>K(e.id)),document.getElementById(`btnShowPhone`)?.addEventListener(`click`,()=>{let e=document.getElementById(`btnShowPhone`),t=document.getElementById(`phoneReveal`);t&&e&&(t.style.display=`flex`,e.style.display=`none`)});let u=t=>{if(!t||t.uid!==e.authorId||document.getElementById(`lpOwnerBar`))return;let r=document.createElement(`div`);r.id=`lpOwnerBar`,r.className=`lp-owner-bar`,r.innerHTML=`
            <span class="lp-owner-bar-label"><i data-lucide="pencil-ruler"></i> ${n(`owner_bar_label`,`Vaš oglas`)}</span>
            <a class="lp-owner-bar-btn" href="#/novi-oglas?edit=${encodeURIComponent(e.id)}">
                <i data-lucide="pencil"></i> ${n(`owner_bar_edit`,`Uredi oglas`)}
            </a>`,document.getElementById(`listingPage`)?.insertAdjacentElement(`afterbegin`,r),window.lucide&&window.lucide.createIcons({nodes:[r]})};if(s.currentUser)u(s.currentUser);else{let e=s.onAuthStateChanged(t=>{e(),u(t)})}if(window.innerWidth<=900){let e=t.querySelector(`.lp-gallery, .lp-gallery-empty`),n=t.querySelector(`.lp-price-card`);e&&n&&e.insertAdjacentElement(`afterend`,n)}window.lucide&&window.lucide.createIcons(),q(e),t.querySelectorAll(`.adv-acc-trigger`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.adv-accordion`).querySelector(`.adv-acc-body`),n=e.getAttribute(`aria-expanded`)!==`true`;e.setAttribute(`aria-expanded`,String(n)),t&&(t.style.display=n?`flex`:`none`)})})}function L(e,t,r){if(e.length===0&&t.length===0)return`<div class="lp-gallery-empty">📷 ${n(`no_photos`)}</div>`;let i=e.length>0?e:t,a=i.slice(0,6).map((e,t)=>`
        <div class="lp-thumb ${t===0?`active`:``}" data-idx="${t}">
            <img src="${Q(e)}" alt="Photo ${t+1}" loading="lazy" />
            ${t===5&&i.length>6?`<div class="lp-thumb-more">+${i.length-6}</div>`:``}
        </div>`).join(``);return`
        <section class="lp-gallery">
            <div class="lp-gallery-main">
                <img id="galleryMainImg" src="${Q(i[0])}" alt="${n(`main_photo`)}" />
                ${r?`<span class="lp-condition-badge">${Q(r)}</span>`:``}
                ${i.length>1?`
                <button class="lp-gallery-nav lp-gallery-prev" id="gallPrev">&#10094;</button>
                <button class="lp-gallery-nav lp-gallery-next" id="gallNext">&#10095;</button>
                <span class="lp-gallery-counter" id="gallCounter">1 / ${i.length}</span>`:``}
            </div>
            ${i.length>1?`<div class="lp-thumbs" id="gallThumbs">${a}</div>`:`<div id="gallThumbs"></div>`}
        </section>`}function R(e,t){if(e.length===0&&t.length===0)return;let n=e.length>0?e:t,r=0,i=document.getElementById(`galleryMainImg`),a=document.getElementById(`gallCounter`);function o(e){r=(e+n.length)%n.length,i&&(i.src=n[r]),a&&(a.textContent=`${r+1} / ${n.length}`),document.querySelectorAll(`.lp-thumb`).forEach((e,t)=>{e.classList.toggle(`active`,t===r)})}function s(e){n=e,r=0,i&&(i.src=n[0]),a&&(a.textContent=`1 / ${n.length}`);let t=document.getElementById(`gallThumbs`);t&&(t.innerHTML=n.slice(0,6).map((e,t)=>`
                <div class="lp-thumb ${t===0?`active`:``}" data-idx="${t}">
                    <img src="${Q(e)}" alt="Photo ${t+1}" loading="lazy" />
                    ${t===5&&n.length>6?`<div class="lp-thumb-more">+${n.length-6}</div>`:``}
                </div>`).join(``),t.querySelectorAll(`.lp-thumb`).forEach(e=>{e.addEventListener(`click`,()=>o(Number(e.dataset.idx)))}));let s=document.getElementById(`gallPrev`),c=document.getElementById(`gallNext`);s&&(s.style.display=n.length>1?``:`none`),c&&(c.style.display=n.length>1?``:`none`),a&&(a.style.display=n.length>1?``:`none`)}document.getElementById(`gallPrev`)?.addEventListener(`click`,()=>o(r-1)),document.getElementById(`gallNext`)?.addEventListener(`click`,()=>o(r+1)),document.querySelectorAll(`.lp-thumb`).forEach(e=>{e.addEventListener(`click`,()=>o(Number(e.dataset.idx)))});let c=document.querySelector(`.lp-gallery-main`);if(c){let e=0;c.addEventListener(`touchstart`,t=>{e=t.changedTouches[0].clientX},{passive:!0}),c.addEventListener(`touchend`,t=>{let n=t.changedTouches[0].clientX-e;Math.abs(n)>40&&o(n<0?r+1:r-1)},{passive:!0})}document.querySelectorAll(`.lp-view-btn`).forEach(n=>{n.addEventListener(`click`,()=>{document.querySelectorAll(`.lp-view-btn`).forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),s(n.dataset.view===`interior`?t:e)})})}function z(e){let i=e.mileageKm||e.mileage,a=e.powerKw||e.power,o=a?n(`hp_val`,{val:Math.round(a*1.34102)}):null,s=(e.fuel||``).toLowerCase().trim(),c=s===`elektrika`||s===`električno`||s===`electric`||s===`e`,l=e.category===`moto`||e.category===`motor`,u=[{label:n(`spec_first_registration`),value:e.firstRegistration||e.year,icon:`calendar-days`},{label:n(`spec_vehicle_type`),value:e.subcategory||e.segment,icon:`car`},{label:n(`spec_mileage`),value:i?Z(i):null,icon:`gauge`},{label:n(`spec_power`),value:o,icon:`zap`},{label:n(`spec_fuel`),value:c?`E`:null,icon:`fuel`},{label:n(`spec_gearbox`),value:c?null:e.transmission,icon:`settings-2`},l&&e.engineStroke?{label:`Takt motorja`,value:e.engineStroke,icon:`activity`}:null,l&&e.engineType?{label:`Vrsta motorja`,value:e.engineType,icon:`cpu`}:null,{label:n(`spec_displacement`),value:e.engineCc?b(e.engineCc,localStorage.getItem(t(`displacement_unit`))||`cc`,r()):null,icon:`cpu`},{label:n(c?`spec_range`:`spec_fuel_economy`),value:V(e),icon:c?`battery-charging`:`droplet`}].filter(e=>e&&e.value!==null&&e.value!==void 0&&e.value!==``),d=[[n(`condition`),e.condition],[n(`drive_type`),e.driveType],[n(`previous_owners`),e.previousOwnersCount?e.previousOwnersCount+`.`:null],[n(`color`),e.color?e.colorType&&e.colorType!==`solid`?`${e.color} (${e.colorType})`:e.color:null],[n(`doors`),e.doorsCount],[n(`seats`),e.seatsCount],[n(`co2_emissions`),e.co2?n(`unit_gkm`,{val:e.co2}):null],[n(`emission_class`),e.emissionClass],[n(`hybrid_type`),e.hybridType],[n(`consumption_combined`),e.fuelL100kmCombined?n(`unit_l100km`,{val:e.fuelL100kmCombined}):e.fuelL100km?n(`unit_l100km`,{val:e.fuelL100km}):null],[n(`consumption_city`),e.fuelL100kmCity?n(`unit_l100km`,{val:e.fuelL100kmCity}):null],[n(`consumption_highway`),e.fuelL100kmHighway?n(`unit_l100km`,{val:e.fuelL100kmHighway}):null],[n(`battery_capacity`),e.batteryKwh?n(`unit_kwh`,{val:e.batteryKwh}):null],[n(`range_wltp`),e.rangeKm?n(`unit_km`,{val:e.rangeKm}):null],[`Zdravje baterije`,e.batteryHealth?`${e.batteryHealth} %`:null],[`Poraba`,e.consumptionKwh100?`${e.consumptionKwh100} kWh/100 km`:null],[n(`towing_capacity`),e.towingKg?n(`unit_kg`,{val:e.towingKg}):null],[n(`registered_until`),e.registeredUntil]].filter(([,e])=>e!=null&&e!==``);return u.length===0&&d.length===0?``:`
        <section class="lp-section">
            <h2 class="lp-section-title centered">${n(`technical_specifications`)}</h2>
            
            <div class="lp-specs-container">
                <!-- Primary Grid Box -->
                <div class="lp-key-specs-box">
                    <div class="lp-key-specs-grid">
                        ${u.map(e=>`
                            <div class="lp-key-spec-item" title="${Q(e.label)}">
                                <i data-lucide="${e.icon}" class="lp-key-spec-icon"></i>
                                <span class="lp-key-spec-value">${Q(String(e.value))}</span>
                            </div>
                        `).join(``)}
                    </div>
                </div>

                <!-- Secondary Specs Accordion -->
                ${d.length>0?`
                <div class="adv-accordion glass-card">
                    <div class="adv-acc-header">
                        <button type="button" class="adv-acc-trigger" aria-expanded="false">
                            <span class="adv-acc-title">
                                <i data-lucide="list"></i>
                                ${n(`all_specs_and_details`)}
                            </span>
                            <div class="adv-acc-right">
                                <i data-lucide="chevron-down" class="adv-acc-chevron"></i>
                            </div>
                        </button>
                    </div>
                    <div class="adv-acc-body" style="display:none; padding: 1.5rem; flex-direction: column; gap: 0.5rem;">
                        <div class="lp-specs-content" style="width: 100%;">
                            ${d.map(([e,t])=>`
                                <div class="lp-spec-item">
                                    <span class="lp-spec-label">${Q(e)}</span>
                                    <span class="lp-spec-value">${Q(String(t))}</span>
                                </div>
                            `).join(``)}
                        </div>
                    </div>
                </div>
                `:``}

                <!-- Equipment dropdowns (inline under specs) -->
                ${B(e)}
            </div>
        </section>
    `}function B(e){let t=Array.isArray(e.equipment)?e.equipment:[],r=Array.isArray(e.customEquipment)?e.customEquipment:[];if(t.length===0&&r.length===0)return``;let i=u.map(e=>{let n=e.items.filter(e=>t.includes(e.value));return n.length?{group:e,items:n}:null}).filter(Boolean);if(i.length===0&&r.length===0)return``;let a=i.map(({group:e,items:t})=>`
        <div class="lp-eq-group">
            <div class="lp-eq-group-header">
                <i data-lucide="${e.icon}" class="lp-eq-group-icon"></i>
                <span class="lp-eq-group-label">${Q(n(e.label,e.id))}</span>
            </div>
            <div class="lp-eq-chips">
                ${t.map(e=>`
                    <span class="lp-eq-chip">
                        <i data-lucide="${e.icon}"></i>
                        ${Q(n(e.label,e.value))}
                    </span>`).join(``)}
            </div>
        </div>`).join(``),o=r.length?`
        <div class="lp-eq-group">
            <div class="lp-eq-group-header">
                <i data-lucide="plus-circle" class="lp-eq-group-icon"></i>
                <span class="lp-eq-group-label">${n(`equipment_custom`,`Dodatna oprema`)}</span>
            </div>
            <div class="lp-eq-chips">
                ${r.map(e=>`<span class="lp-eq-chip lp-eq-chip--custom">${Q(e.value||``)}</span>`).join(``)}
            </div>
        </div>`:``,s=t.length+r.length;return`
        <div class="adv-accordion glass-card lp-eq-accordion">
            <div class="adv-acc-header">
                <button type="button" class="adv-acc-trigger" aria-expanded="false">
                    <span class="adv-acc-title">
                        <i data-lucide="list-checks"></i>
                        ${n(`equipment_and_features`,`Oprema in dodatki`)}
                        <span class="lp-eq-count">${s}</span>
                    </span>
                    <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                </button>
            </div>
            <div class="adv-acc-body lp-eq-body" style="display:none;">
                ${a}
                ${o}
            </div>
        </div>`}function V(e){let t=(e.fuel||``).toLowerCase();if(t===`elektrika`){let t=e.rangeKm||e.electricRangeKm;return t?n(`unit_km_wltp`,{val:t}):null}let r=[],i=e.fuelL100kmCombined||e.fuelL100km;return i&&r.push(n(`unit_l100km`,{val:i})),t.includes(`hibrid`)&&e.electricRangeKm&&r.push(n(`unit_km_el`,{val:e.electricRangeKm})),r.length>0?r.join(` + `):null}var H={mon:n(`mon`),tue:n(`tue`),wed:n(`wed`),thu:n(`thu`),fri:n(`fri`),sat:n(`sat`),sun:n(`sun`)},U=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`];function W(e){let t=e.contact||{},r=e.sellerType===`business`,i=e.authorName||t.name||n(r?`dealer`:`private_seller`),a=i.charAt(0).toUpperCase(),o=t.phone,s=t.email,c=e.location||{},l=r?`<span class="lp-seller-badge lp-seller-badge--business"><i data-lucide="building-2"></i> ${n(`dealer`)}</span>`:`<span class="lp-seller-badge lp-seller-badge--private"><i data-lucide="user"></i> ${n(`private_seller`)}</span>`,u=``;if(r&&e.businessHours&&Object.keys(e.businessHours).length>0){let t=U.filter(t=>e.businessHours[t]).map(t=>`
                <div class="lp-bh-row">
                    <span class="lp-bh-day">${H[t]}</span>
                    <span class="lp-bh-time">${Q(e.businessHours[t].from)} – ${Q(e.businessHours[t].to)}</span>
                </div>`).join(``);u=`
            <div class="adv-accordion lp-bh-accordion" style="margin-top:0.75rem;">
                <div class="adv-acc-header">
                    <button type="button" class="adv-acc-trigger" aria-expanded="false" style="padding:0.6rem 0.85rem;">
                        <span class="adv-acc-title" style="font-size:0.82rem;">
                            <i data-lucide="clock"></i> ${n(`business_hours`)}
                        </span>
                        <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                    </button>
                </div>
                <div class="adv-acc-body" style="display:none; padding:0.75rem 1rem; flex-direction:column; gap:0.35rem;">
                    ${t}
                </div>
            </div>`}return e.sellerNote&&`${Q(e.sellerNote)}`,`
        <div class="lp-sidebar-card lp-seller-card centered">
            <div class="lp-seller-avatar">${a}</div>
            <div class="lp-seller-name">${Q(i)}</div>
            ${l}

            <div class="lp-seller-actions">
                ${o?`
                <a href="tel:${Q(o)}" class="lp-btn lp-btn--pill-phone">
                    <i data-lucide="phone"></i> ${Q(o)}
                </a>`:``}
                ${s?`
                <a href="mailto:${Q(s)}" class="lp-btn lp-btn--pill-mail">
                    <i data-lucide="mail"></i> ${Q(s)}
                </a>`:``}
            </div>
            ${c.city?`
            <div class="lp-seller-location">
                📍 ${Q(c.city)}${c.region?`, `+Q(c.region):``}
            </div>`:``}
            ${u}
            <button id="lpReportBtn" style="margin-top:1rem;background:none;border:none;color:#94a3b8;font-size:0.78rem;cursor:pointer;display:flex;align-items:center;gap:0.3rem;padding:0;font-family:inherit;" title="Prijavi oglas">
                <i data-lucide="flag" style="width:13px;height:13px;"></i> Prijavi oglas
            </button>
        </div>`}var G=[{value:`spam`,label:`Spam ali prevara`},{value:`napacna_cena`,label:`Napačna cena ali podatki`},{value:`ze_prodano`,label:`Vozilo je že prodano`},{value:`neprimerno`,label:`Neprimerna vsebina`},{value:`ostalo`,label:`Drugo`}];function K(e){let t=document.getElementById(`reportModalOverlay`);t&&t.remove();let n=document.createElement(`div`);n.id=`reportModalOverlay`,n.style.cssText=`position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1.5rem;`,n.innerHTML=`
        <div style="background:#fff;border-radius:1.5rem;padding:2rem;max-width:360px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.18);">
            <h3 style="margin:0 0 0.25rem;font-size:1.05rem;font-weight:800;color:#0f172a;">Prijavi oglas</h3>
            <p style="margin:0 0 1.25rem;font-size:0.82rem;color:#64748b;">Izberite razlog za prijavo:</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem;">
                ${G.map(e=>`
                <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-size:0.88rem;color:#334155;padding:0.5rem 0.75rem;border-radius:0.75rem;border:1.5px solid #e2e8f0;transition:border-color 0.15s;">
                    <input type="radio" name="reportReason" value="${e.value}" style="accent-color:#f97316;">
                    ${e.label}
                </label>`).join(``)}
            </div>
            <div id="reportFeedback" style="min-height:1.2rem;font-size:0.82rem;color:#dc2626;margin-bottom:0.75rem;"></div>
            <div style="display:flex;gap:0.5rem;">
                <button id="reportSubmitBtn" style="flex:1;padding:0.7rem;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border:none;border-radius:0.9rem;font-weight:700;font-size:0.9rem;cursor:pointer;font-family:inherit;">Pošlji</button>
                <button id="reportCancelBtn" style="padding:0.7rem 1rem;background:#f1f5f9;color:#475569;border:none;border-radius:0.9rem;font-weight:600;font-size:0.9rem;cursor:pointer;font-family:inherit;">Prekliči</button>
            </div>
        </div>`,document.body.appendChild(n);let r=()=>n.remove();n.querySelector(`#reportCancelBtn`).addEventListener(`click`,r),n.addEventListener(`click`,e=>{e.target===n&&r()}),n.querySelector(`#reportSubmitBtn`).addEventListener(`click`,async()=>{let t=n.querySelector(`input[name="reportReason"]:checked`),l=n.querySelector(`#reportFeedback`);if(!t){l.textContent=`Prosimo, izberite razlog.`;return}let u=n.querySelector(`#reportSubmitBtn`);u.disabled=!0,u.textContent=`Pošiljam...`;try{await i(a(c,`reports`),{listingId:e,reporterId:s.currentUser?.uid||null,reason:t.value,createdAt:o(),status:`pending`}),n.querySelector(`div`).innerHTML=`
                <div style="text-align:center;padding:1rem 0;">
                    <div style="font-size:2rem;margin-bottom:0.5rem;">✅</div>
                    <p style="font-weight:700;color:#0f172a;margin:0 0 0.25rem;">Hvala za prijavo!</p>
                    <p style="font-size:0.82rem;color:#64748b;margin:0 0 1.25rem;">Preverili jo bomo čim prej.</p>
                    <button id="reportDoneBtn" style="padding:0.6rem 1.5rem;background:#f1f5f9;color:#475569;border:none;border-radius:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Zapri</button>
                </div>`,n.querySelector(`#reportDoneBtn`).addEventListener(`click`,r)}catch{l.textContent=`Napaka pri pošiljanju. Poskusite znova.`,u.disabled=!1,u.textContent=`Pošlji`}})}async function q(e){let t=document.getElementById(`similarGrid`);if(t)try{let{getListings:r}=await l(async()=>{let{getListings:e}=await import(`./listingService-B896QzBR.js`);return{getListings:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url),i=(await r()).filter(t=>t.id!==e.id&&t.status===`active`&&(t.make===e.make||t.category===e.category)).slice(0,4);if(i.length===0){t.innerHTML=`<p style="color:#94a3b8;font-size:0.85rem;">${n(`no_similar_listings`)}</p>`;return}t.innerHTML=i.map(e=>Y(e)).join(``),window.lucide&&window.lucide.createIcons()}catch{t.innerHTML=``}}var J=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;function Y(e){let t=e.images?.exterior?.[0]||`https://placehold.co/300x200?text=${encodeURIComponent(n(`no_photos`))}`,r=h(e.priceEur||e.price||0,e.callForPrice),i=e.mileageKm||e.mileage,a=e.promotion?.tier===`sponsored`;return`
        <a class="lp-similar-card listing-card ${a?`sponsored`:``}" href="#/oglas?id=${e.id}">
            <div class="lp-similar-img-wrap">
                <img src="${Q(t)}" alt="${Q(e.make||``)} ${Q(e.model||``)}" loading="lazy" />
                ${a?`<span class="listing-sponsored-badge">${n(`sponsored_listing`)}</span>`:``}
                ${e.salePriceEur?`<span class="discount-tag-icon" title="Znižana cena" style="position:absolute;top:8px;left:8px;">${J}</span>`:``}
            </div>
            <div class="lp-similar-body">
                <div class="lp-similar-title">${Q(X(e))}</div>
                <div class="lp-similar-meta">${e.year||``}${i?` · `+Z(i):``}${e.fuel?` · `+e.fuel:``}</div>
                <div class="lp-similar-price">${r}</div>
            </div>
        </a>`}function X(e){return[e.make,e.model,e.variant].filter(Boolean).join(` `)}function re(e){return{avto:n(`cat_cars`),moto:n(`cat_moto`),gospodarska:n(`cat_commercial`),mehanizacija:n(`cat_machinery`),"prosti-cas":n(`cat_leisure`),deli:n(`cat_parts`)}[e]||n(`header_listings`)}function Z(e){return new Intl.NumberFormat(`sl-SI`).format(Math.round(e))+` km`}function ie(e){let t=e?.toDate?e.toDate():new Date(e?.seconds*1e3||e),n=r()===`sl`?`sl-SI`:`en-US`;return t.toLocaleDateString(n,{day:`numeric`,month:`long`,year:`numeric`})}function Q(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function $(e,t){return`
        <div style="text-align:center;padding:4rem 1rem;max-width:500px;margin:0 auto;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
            <h2 style="font-size:1.4rem;font-weight:700;margin:0 0 0.5rem;">${e}</h2>
            <p style="color:#64748b;margin-bottom:1.5rem;">${Q(t)}</p>
            <a href="#/" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">← ${n(`back_to_home`)}</a>
        </div>`}export{E as initListingPage,O as injectRating,D as injectServiceHistory,I as renderListing};