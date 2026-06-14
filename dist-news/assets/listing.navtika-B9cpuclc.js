const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./listingService-B896QzBR.js","./listingService-CHYpX_DS.js","./preload-helper-kNaey6uv.js","./firebase-D04QZ5MM.js","./index.esm-DejIl58p.js","./platform-BvWcB7wr.js","./storageKeys-BraFEh3o.js","./sampleListings-CTAGWO7V.js"])))=>i.map(i=>d[i]);
import{r as e}from"./chunk-QTnfLwEv.js";import{t}from"./storageKeys-BraFEh3o.js";import{a as n,t as r}from"./i18n-BZd20ht-.js";import{n as i}from"./firebase-D04QZ5MM.js";import{t as a}from"./preload-helper-kNaey6uv.js";import{S as o,a as s,i as c,l,o as u,r as d}from"./listingService-CHYpX_DS.js";import{t as f}from"./authGate-BAhVLKA2.js";import{o as p,s as m,t as h}from"./garageService-BlDALu--.js";import"./listingUtils-DBvePdce.js";import{t as g}from"./valuationScore-BHvyVyKH.js";import{r as _}from"./priceRatingUi-Bn9tzU9L.js";import{i as v,o as y}from"./jsx-runtime-BILTUGeO.js";import{t as b}from"./CostPanel-ISMDH_4i.js";import{n as x}from"./serviceBookService-Dwa7rl6z.js";var S=e(y(),1),C=e(v(),1);async function w(){console.log(`[ListingPage] init`);let e=new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`id`),t=document.getElementById(`listingPage`);if(!e){t&&(t.innerHTML=X(n(`error_listing_not_found`),n(`error_missing_id`)));return}try{let[t,n]=await Promise.all([c(e),u().catch(()=>[])]);l(e),P(t),E(t,n),T(t)}catch(e){console.error(`[ListingPage]`,e),t&&(t.innerHTML=X(n(`error_listing_not_found`),e.message))}}async function T(e){let t=e.vin||e.vinDetails?.vin;if(!t)return;let r=await x(t);if(!r.length)return;let i=document.getElementById(`lpServiceBadge`);i&&(i.innerHTML=`
            <div class="trust-badge">
                <i data-lucide="shield-check"></i>
                ${n(`verified_service_history`)}
            </div>`,window.lucide&&window.lucide.createIcons());let a=document.getElementById(`service-history-container`);if(!a)return;let o={mali_servis:n(`minor_service`),veliki_servis:n(`major_service`),popravilo:n(`repair`),pnevmatike:n(`tires`),drugo:n(`other`)},s=r.map(e=>{let t=e.date?new Date(e.date).toLocaleDateString(`en-US`,{day:`numeric`,month:`long`,year:`numeric`}):`—`,r=e.mileage?new Intl.NumberFormat(`sl-SI`).format(e.mileage)+` km`:null;return`
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-type">${Y(o[e.serviceType]||e.serviceType||n(`other`))}</span>
                        <span class="timeline-date">${Y(t)}</span>
                    </div>
                    ${r?`<div class="timeline-km">${Y(r)}</div>`:``}
                    <div class="timeline-mechanic">${Y(e.mechanicName||``)}</div>
                    ${e.description?`<div class="timeline-desc">${Y(e.description)}</div>`:``}
                </div>
            </div>`}).join(``);a.innerHTML=`
        <section class="lp-section">
            <h2 class="lp-section-title">${n(`service_history`)}</h2>
            <div class="service-timeline">${s}</div>
        </section>`,a.style.display=`block`}function E(e,t){let r=document.getElementById(`lpRatingBlock`);if(!r)return;let i=g(e,t);if(!i||i.confidence===`low`){r.innerHTML=_({stars:3,label:`Poštena cena`},{rareFeaturesLabel:n(`rare_features`)});return}r.innerHTML=_(i,{confidenceLabel:i.confidence===`high`?n(`high_confidence`)+` (${i.comparablesCount} ${n(`listings`).toLowerCase()})`:n(`medium_confidence`)+` (${i.comparablesCount} ${n(`listings`).toLowerCase()})`,rareFeaturesLabel:n(`rare_features`)})}function D(e){let t=s(e),i=e=>new Intl.NumberFormat(r()===`sl`?`sl-SI`:`en-US`).format(e),a=(e,t)=>`
        <div class="lp-view-stat">
            <span class="lp-view-num">${i(e)}</span>
            <span class="lp-view-label">${Y(t)}</span>
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
        </div>`}function O(e){e.classList.remove(`lp-btn-pop`),e.offsetWidth,e.classList.add(`lp-btn-pop`),clearTimeout(e._popTimer),e._popTimer=setTimeout(()=>e.classList.remove(`lp-btn-pop`),480)}var k=t(`liked`);function A(){try{return new Set(JSON.parse(localStorage.getItem(k)||`[]`))}catch{return new Set}}function j(e){try{localStorage.setItem(k,JSON.stringify([...e]))}catch{}}async function M(e){let t=document.getElementById(`lpFavBtn`);if(!t)return;A().has(e.id)&&t.classList.add(`active`);let r=async n=>{if(n)try{let r=await p(n.uid,e.id),i=A();r?(i.add(e.id),t.classList.add(`active`)):(i.delete(e.id),t.classList.remove(`active`)),j(i)}catch{}};if(i.currentUser)r(i.currentUser);else{let e=i.onAuthStateChanged(t=>{e(),r(t)})}t.addEventListener(`click`,async()=>{let r=i.currentUser;if(!r)try{r=await f({icon:`❤️`,title:n(`save_to_favorites_title`),message:n(`save_to_favorites_msg`)})}catch{return}let a=t.classList.contains(`active`),o=!a;o?t.classList.add(`active`):t.classList.remove(`active`);let s=A();o?s.add(e.id):s.delete(e.id),j(s),O(t),t.disabled=!0;try{a?await m(r.uid,e.id):await h(r.uid,{id:e.id,title:e.make+` `+e.model,price:e.priceEur||e.price,images:e.images})}catch(e){console.warn(`[lpFavBtn] Firebase sync failed (local state kept):`,e)}finally{t.disabled=!1}})}function N(e){let r=document.getElementById(`lpCompareBtn`);if(!r)return;let a=()=>{try{return JSON.parse(localStorage.getItem(t(`compare`))||`[]`)}catch{return[]}};a().some(t=>t.id===e.id)&&r.classList.add(`active`),r.addEventListener(`click`,async()=>{let o=a(),s=o.findIndex(t=>t.id===e.id);if(s!==-1){o.splice(s,1),r.classList.remove(`active`),O(r),localStorage.setItem(t(`compare`),JSON.stringify(o)),window.updateHeaderCompare&&window.updateHeaderCompare();return}let c=i.currentUser;if(!c)try{c=await f({icon:`⚖️`,title:n(`compare_vehicles_title`),message:n(`compare_vehicles_msg`)})}catch{return}if(o.length>=3){alert(n(`compare_limit_3`));return}o.push({id:e.id,title:e.make+` `+e.model,image:e.images?.exterior?.[0]||``,price:e.priceEur||e.price}),r.classList.add(`active`),O(r),localStorage.setItem(t(`compare`),JSON.stringify(o)),window.updateHeaderCompare&&window.updateHeaderCompare()})}function P(e){let t=document.getElementById(`listingPage`);if(!t)return;let r=e.images?.exterior||[],i=e.images?.interior||[],a=e.promotion?.tier===`sponsored`;t.innerHTML=`
        <div class="lp-container">

            <!-- Breadcrumb -->
            <nav class="lp-breadcrumb">
                <a href="#/">${n(`nav_home`)}</a>
                <span class="lp-bc-sep">›</span>
                <a href="#/iskanje?cat=${encodeURIComponent(e.category||``)}">
                    ${Y(K(e.category))}
                </a>
                ${e.make?`<span class="lp-bc-sep">›</span><span class="lp-bc-current">${Y(e.make)} ${Y(e.model||``)} ${Y(e.variant||``)}</span>`:``}
            </nav>

            <!-- Sponsored tag (subtle) -->
            ${a?`<div class="lp-sponsored-tag">${n(`sponsored_listing`)}</div>`:``}

            <!-- Header: title -->
            <header class="lp-header">
                <div class="lp-header-main">
                    <h1 class="lp-title">${Y(G(e))}</h1>
                    <div class="lp-meta-row">
                        <div class="lp-view-toggle">
                            <button class="lp-view-btn active" data-view="exterior">${n(`exterior`)}</button>
                            <button class="lp-view-btn ${i.length===0?`disabled`:``}" data-view="interior" ${i.length===0?`disabled`:``}>${n(`interior`)}</button>
                        </div>
                        ${e.createdAt?`<span>📅 ${J(e.createdAt)}</span>`:``}
                        ${e.viewCount?`<span>👁 ${n(`views_count`,{count:e.viewCount})}</span>`:``}
                    </div>
                </div>
            </header>

            <!-- Two-column layout -->
            <div class="lp-layout">

                <!-- LEFT: main content -->
                <div class="lp-main">

                    <!-- Image gallery -->
                    ${F(r,i,e.condition)}

                    <!-- Service history (populated async by injectServiceHistory) -->
                    <div id="service-history-container" style="display:none;"></div>

                    <!-- Description -->
                    ${e.description?`
                    <section class="lp-section">
                        <h2 class="lp-section-title">${n(`vehicle_description`)}</h2>
                        <div class="lp-description">${Y(e.description).replace(/\n/g,`<br>`)}</div>
                    </section>`:``}

                    <!-- Technical specs + equipment (combined) -->
                    ${L(e)}

                    <!-- Seller note (private sellers) -->
                    ${e.sellerNote?`
                    <section class="lp-section">
                        <div class="lp-seller-note-block">
                            <i data-lucide="message-circle"></i>
                            <div>
                                <span class="lp-seller-note-label">${n(`seller_note`)}</span>
                                <p class="lp-seller-note-text">${Y(e.sellerNote)}</p>
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
                                <div class="lp-sale-price">${d(e.salePriceEur,!1)}</div>
                                <div class="lp-original-price">${d(e.priceEur||e.priceRaw||e.price||0,!1)}</div>
                                <div class="lp-discount-pct">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                    -${Math.round((1-e.salePriceEur/(e.priceEur||e.priceRaw||e.price))*100)}%
                                </div>
                            </div>`:`
                            <div class="lp-price">${d(e.priceRaw||e.priceEur||e.price||0,e.callForPrice)}</div>`}
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
                    ${D(e)}

                    <!-- Cost Panel -->
                    <div id="react-cost-panel-root"></div>

                    <!-- Seller card -->
                    ${V(e)}

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
    `;let o=document.getElementById(`react-cost-panel-root`),s=e.priceRaw||e.priceEur||e.price,c=e.powerKw||e.power;if(o&&s&&c&&C.createRoot(o).render(S.createElement(b,{price:Number(s),powerKw:Number(c),fuelType:e.fuel||``,mpg:e.fuelL100km?235.215/e.fuelL100km:null,kWhPer100km:e.electricConsumption||null,isNew:e.isNew!==!1,make:e.make||``,category:e.category||`sedan`,vin:e.vin||``})),e.leasingConditions){let t=document.createElement(`div`);t.id=`leasingModal`,t.className=`lp-modal-overlay`,t.innerHTML=`
            <div class="lp-modal">
                <div class="lp-modal-header">
                    <h3 class="lp-modal-title">${n(`financing_modal_title`)}</h3>
                    <button class="lp-modal-close" id="btnCloseLeasingModal" aria-label="Close">✕</button>
                </div>
                <div class="lp-modal-body">${Y(e.leasingConditions).replace(/\n/g,`<br>`)}</div>
            </div>`,document.body.appendChild(t),document.getElementById(`btnShowLeasing`)?.addEventListener(`click`,()=>{t.classList.add(`active`)}),document.getElementById(`btnCloseLeasingModal`)?.addEventListener(`click`,()=>{t.classList.remove(`active`)}),t.addEventListener(`click`,e=>{e.target===t&&t.classList.remove(`active`)})}if(I(r,i),M(e),N(e),document.getElementById(`btnShowPhone`)?.addEventListener(`click`,()=>{let e=document.getElementById(`btnShowPhone`),t=document.getElementById(`phoneReveal`);t&&e&&(t.style.display=`flex`,e.style.display=`none`)}),window.innerWidth<=900){let e=t.querySelector(`.lp-gallery, .lp-gallery-empty`),n=t.querySelector(`.lp-price-card`);e&&n&&e.insertAdjacentElement(`afterend`,n)}window.lucide&&window.lucide.createIcons(),H(e),t.querySelectorAll(`.adv-acc-trigger`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.closest(`.adv-accordion`).querySelector(`.adv-acc-body`),n=e.getAttribute(`aria-expanded`)!==`true`;e.setAttribute(`aria-expanded`,String(n)),t&&(t.style.display=n?`flex`:`none`)})})}function F(e,t,r){if(e.length===0&&t.length===0)return`<div class="lp-gallery-empty">📷 ${n(`no_photos`)}</div>`;let i=e.length>0?e:t,a=i.slice(0,6).map((e,t)=>`
        <div class="lp-thumb ${t===0?`active`:``}" data-idx="${t}">
            <img src="${Y(e)}" alt="Photo ${t+1}" loading="lazy" />
            ${t===5&&i.length>6?`<div class="lp-thumb-more">+${i.length-6}</div>`:``}
        </div>`).join(``);return`
        <section class="lp-gallery">
            <div class="lp-gallery-main">
                <img id="galleryMainImg" src="${Y(i[0])}" alt="${n(`main_photo`)}" />
                ${r?`<span class="lp-condition-badge">${Y(r)}</span>`:``}
                ${i.length>1?`
                <button class="lp-gallery-nav lp-gallery-prev" id="gallPrev">&#10094;</button>
                <button class="lp-gallery-nav lp-gallery-next" id="gallNext">&#10095;</button>
                <span class="lp-gallery-counter" id="gallCounter">1 / ${i.length}</span>`:``}
            </div>
            ${i.length>1?`<div class="lp-thumbs" id="gallThumbs">${a}</div>`:`<div id="gallThumbs"></div>`}
        </section>`}function I(e,t){if(e.length===0&&t.length===0)return;let n=e.length>0?e:t,r=0,i=document.getElementById(`galleryMainImg`),a=document.getElementById(`gallCounter`);function o(e){r=(e+n.length)%n.length,i&&(i.src=n[r]),a&&(a.textContent=`${r+1} / ${n.length}`),document.querySelectorAll(`.lp-thumb`).forEach((e,t)=>{e.classList.toggle(`active`,t===r)})}function s(e){n=e,r=0,i&&(i.src=n[0]),a&&(a.textContent=`1 / ${n.length}`);let t=document.getElementById(`gallThumbs`);t&&(t.innerHTML=n.slice(0,6).map((e,t)=>`
                <div class="lp-thumb ${t===0?`active`:``}" data-idx="${t}">
                    <img src="${Y(e)}" alt="Photo ${t+1}" loading="lazy" />
                    ${t===5&&n.length>6?`<div class="lp-thumb-more">+${n.length-6}</div>`:``}
                </div>`).join(``),t.querySelectorAll(`.lp-thumb`).forEach(e=>{e.addEventListener(`click`,()=>o(Number(e.dataset.idx)))}));let s=document.getElementById(`gallPrev`),c=document.getElementById(`gallNext`);s&&(s.style.display=n.length>1?``:`none`),c&&(c.style.display=n.length>1?``:`none`),a&&(a.style.display=n.length>1?``:`none`)}document.getElementById(`gallPrev`)?.addEventListener(`click`,()=>o(r-1)),document.getElementById(`gallNext`)?.addEventListener(`click`,()=>o(r+1)),document.querySelectorAll(`.lp-thumb`).forEach(e=>{e.addEventListener(`click`,()=>o(Number(e.dataset.idx)))});let c=document.querySelector(`.lp-gallery-main`);if(c){let e=0;c.addEventListener(`touchstart`,t=>{e=t.changedTouches[0].clientX},{passive:!0}),c.addEventListener(`touchend`,t=>{let n=t.changedTouches[0].clientX-e;Math.abs(n)>40&&o(n<0?r+1:r-1)},{passive:!0})}document.querySelectorAll(`.lp-view-btn`).forEach(n=>{n.addEventListener(`click`,()=>{document.querySelectorAll(`.lp-view-btn`).forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),s(n.dataset.view===`interior`?t:e)})})}function L(e){let t=[];e.year&&t.push({label:n(`spec_first_registration`,`Letnik`),value:e.year,icon:`calendar-days`}),e.lengthM&&t.push({label:`Dolžina`,value:`${e.lengthM} m`,icon:`ruler`}),e.fuel&&t.push({label:`Gorivo`,value:e.fuel,icon:`fuel`}),(e.enginePowerHp||e.powerHp)&&t.push({label:`Moč motorja`,value:`${e.enginePowerHp||e.powerHp} KM`,icon:`zap`}),e.engineHours&&t.push({label:`Ure motorja`,value:`${e.engineHours} h`,icon:`clock`}),e.cabins&&t.push({label:`Kabine`,value:e.cabins,icon:`bed`});let r=[];return e.beamM&&r.push([`Širina`,`${e.beamM} m`]),e.draftM&&r.push([`Ugrez`,`${e.draftM} m`]),e.hullMaterial&&r.push([`Material trupa`,e.hullMaterial]),e.ceCategory&&r.push([`CE kategorija`,e.ceCategory]),e.engineCount&&r.push([`Število motorjev`,e.engineCount]),e.engineMountType&&r.push([`Tip motorja`,e.engineMountType]),e.berths&&r.push([`Ležišča`,e.berths]),`
        <section class="lp-section">
            <h2 class="lp-section-title centered">${n(`technical_specifications`,`Tehnični podatki`)}</h2>
            
            <div class="lp-specs-container">
                <div class="lp-key-specs-box">
                    <div class="lp-key-specs-grid">
                        ${t.map(e=>`
                            <div class="lp-key-spec-item" title="${Y(e.label)}">
                                <i data-lucide="${e.icon}" class="lp-key-spec-icon"></i>
                                <span class="lp-key-spec-value">${Y(String(e.value))}</span>
                            </div>
                        `).join(``)}
                    </div>
                </div>

                ${r.length>0?`
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
                            ${r.map(([e,t])=>`
                                <div class="lp-spec-item">
                                    <span class="lp-spec-label">${Y(e)}</span>
                                    <span class="lp-spec-value">${Y(String(t))}</span>
                                </div>
                            `).join(``)}
                        </div>
                    </div>
                </div>
                `:``}

                <!-- Equipment dropdowns (inline under specs) -->
                ${R(e)}
            </div>
        </section>
    `}function R(e){let t=e.equipment;if(!t||t.length===0)return``;let r=new Set([`udobje`,`parkiranje`]),i=new Set([`varnost`,`razsvetljava`,`multimedija`,`asistenti`,`prtljaga`,`garancija`,`moto`,`gospodarska`]),a=[],s=[];for(let e of o){let n=e.items.filter(e=>t.includes(e.value));n.length!==0&&(r.has(e.id)?a.push(...n):i.has(e.id)&&s.push(...n))}let c=(e,t,n)=>n.length===0?``:`
            <div class="adv-accordion glass-card">
                <div class="adv-acc-header">
                    <button type="button" class="adv-acc-trigger" aria-expanded="false">
                        <span class="adv-acc-title">
                            <i data-lucide="${e}"></i>
                            ${Y(t)}
                            <span style="font-size:0.75rem; color:#94a3b8; margin-left:0.4rem;">(${n.length})</span>
                        </span>
                        <div class="adv-acc-right"><i data-lucide="chevron-down" class="adv-acc-chevron"></i></div>
                    </button>
                </div>
                <div class="adv-acc-body" style="display:none; padding:1rem 1.5rem 1.25rem; flex-direction:row; flex-wrap:wrap; gap:0.6rem;">
                    ${n.map(e=>`<span class="adv-chip" style="cursor:default;">${Y(e.label)}</span>`).join(``)}
                </div>
            </div>`;return a.length===0&&s.length===0?``:`
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid rgba(0,0,0,0.06);">
            <span style="font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">${n(`equipment_and_features`)}</span>
        </div>
        ${c(`sofa`,n(`interior_and_comfort`),a)}
        ${c(`shield-check`,n(`equipment_safety_etc`),s)}
    `}var z={mon:n(`mon`),tue:n(`tue`),wed:n(`wed`),thu:n(`thu`),fri:n(`fri`),sat:n(`sat`),sun:n(`sun`)},B=[`mon`,`tue`,`wed`,`thu`,`fri`,`sat`,`sun`];function V(e){let t=e.contact||{},r=e.sellerType===`business`,i=e.authorName||t.name||n(r?`dealer`:`private_seller`),a=i.charAt(0).toUpperCase(),o=t.phone,s=t.email,c=e.location||{},l=r?`<span class="lp-seller-badge lp-seller-badge--business"><i data-lucide="building-2"></i> ${n(`dealer`)}</span>`:`<span class="lp-seller-badge lp-seller-badge--private"><i data-lucide="user"></i> ${n(`private_seller`)}</span>`,u=``;if(r&&e.businessHours&&Object.keys(e.businessHours).length>0){let t=B.filter(t=>e.businessHours[t]).map(t=>`
                <div class="lp-bh-row">
                    <span class="lp-bh-day">${z[t]}</span>
                    <span class="lp-bh-time">${Y(e.businessHours[t].from)} – ${Y(e.businessHours[t].to)}</span>
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
            </div>`}let d=``;return e.sellerNote&&(d=`
            <div class="lp-seller-note">
                <i data-lucide="message-circle"></i>
                <span>${Y(e.sellerNote)}</span>
            </div>`),`
        <div class="lp-sidebar-card lp-seller-card centered">
            <div class="lp-seller-avatar">${a}</div>
            <div class="lp-seller-name">${Y(i)}</div>
            ${l}

            ${c.city?`
            <div class="lp-seller-location">
                📍 ${Y(c.city)}${c.region?`, `+Y(c.region):``}
            </div>`:``}

            <div class="lp-seller-actions">
                ${o?`
                <a href="tel:${Y(o)}" class="lp-btn lp-btn--pill-phone">
                    <i data-lucide="phone"></i> ${Y(o)}
                </a>`:``}
                ${s?`
                <a href="mailto:${Y(s)}" class="lp-btn lp-btn--pill-mail">
                    <i data-lucide="mail"></i> ${Y(s)}
                </a>`:``}
            </div>
            ${d}
            ${u}
        </div>`}async function H(e){let t=document.getElementById(`similarGrid`);if(t)try{let{getListings:r}=await a(async()=>{let{getListings:e}=await import(`./listingService-B896QzBR.js`);return{getListings:e}},__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url),i=(await r()).filter(t=>t.id!==e.id&&t.status===`active`&&(t.make===e.make||t.category===e.category)).slice(0,4);if(i.length===0){t.innerHTML=`<p style="color:#94a3b8;font-size:0.85rem;">${n(`no_similar_listings`)}</p>`;return}t.innerHTML=i.map(e=>W(e)).join(``),window.lucide&&window.lucide.createIcons()}catch{t.innerHTML=``}}var U=`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`;function W(e){let t=e.images?.exterior?.[0]||`https://placehold.co/300x200?text=${encodeURIComponent(n(`no_photos`))}`,r=d(e.priceEur||e.price||0,e.callForPrice),i=e.mileageKm||e.mileage,a=e.engineHoursUsed==null?null:Number(e.engineHoursUsed),o=a!=null&&a>=0?new Intl.NumberFormat(`sl-SI`).format(a)+` h`:i?q(i):null,s=e.promotion?.tier===`sponsored`;return`
        <a class="lp-similar-card listing-card ${s?`sponsored`:``}" href="#/oglas?id=${e.id}">
            <div class="lp-similar-img-wrap">
                <img src="${Y(t)}" alt="${Y(e.make||``)} ${Y(e.model||``)}" loading="lazy" />
                ${s?`<span class="listing-sponsored-badge">${n(`sponsored_listing`)}</span>`:``}
                ${e.salePriceEur?`<span class="discount-tag-icon" title="Znižana cena" style="position:absolute;top:8px;left:8px;">${U}</span>`:``}
            </div>
            <div class="lp-similar-body">
                <div class="lp-similar-title">${Y(G(e))}</div>
                <div class="lp-similar-meta">${e.year||``}${o?` · `+o:``}${e.fuel?` · `+e.fuel:``}</div>
                <div class="lp-similar-price">${r}</div>
            </div>
        </a>`}function G(e){return[e.make,e.model,e.variant].filter(Boolean).join(` `)}function K(e){return{avto:n(`cat_cars`),moto:n(`cat_moto`),gospodarska:n(`cat_commercial`),mehanizacija:n(`cat_machinery`),"prosti-cas":n(`cat_leisure`),deli:n(`cat_parts`),plovila:`Plovila`,colni:`Čolni`,motorji:`Motorji`}[e]||n(`header_listings`)}function q(e){return new Intl.NumberFormat(`sl-SI`).format(Math.round(e))+` km`}function J(e){let t=e?.toDate?e.toDate():new Date(e?.seconds*1e3||e),n=r()===`sl`?`sl-SI`:`en-US`;return t.toLocaleDateString(n,{day:`numeric`,month:`long`,year:`numeric`})}function Y(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function X(e,t){return`
        <div style="text-align:center;padding:4rem 1rem;max-width:500px;margin:0 auto;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
            <h2 style="font-size:1.4rem;font-weight:700;margin:0 0 0.5rem;">${e}</h2>
            <p style="color:#64748b;margin-bottom:1.5rem;">${Y(t)}</p>
            <a href="#/" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">← ${n(`back_to_home`)}</a>
        </div>`}export{w as initNavtikaListingPage,E as injectRating,T as injectServiceHistory,P as renderListing};