import{t as e}from"./platform-BvWcB7wr.js";import{a as t}from"./i18n-BZd20ht-.js";import{o as n}from"./listingService-CHYpX_DS.js";import{n as r,t as i}from"./inputFormatters-DImaxELq.js";import{n as a}from"./customSelect-DV25eGXQ.js";import{n as o,r as s}from"./catalogService-CxXGx5GX.js";import{a as c,i as l,l as u,o as d,r as f,s as p,t as m}from"./equipmentTypes-8rzQ742n.js";var h=()=>e.id===`navtika`,g={itemType:`tire`,vehicleCategory:`avto`,source:`all`,filters:{}},_=[],v=[],y=[],b=[],x=[{value:`navigacija_elektronika`,label:`Navigacija`,icon:`navigation`},{value:`varnost_resevanje`,label:`Varnostna oprema`,icon:`life-buoy`},{value:`sidrna_oprema`,label:`Sidra in vrvi`,icon:`anchor`},{value:`jadra_opalov`,label:`Jadra`,icon:`wind`},{value:`elektrika_akumulator`,label:`Elektronika`,icon:`zap`},{value:`privez_transport`,label:`Prikolice za plovila`,icon:`truck`}];async function S(){let e=document.getElementById(`gd-root`);if(e){if(window.scrollTo({top:0,behavior:`instant`}),h()){g={itemType:`part`,vehicleCategory:`colni`,source:`all`,filters:{}},C(e);return}g={itemType:`tire`,vehicleCategory:`avto`,source:`all`,filters:{}},T(e),a(),E(),fetch(`json/tire_brands.json`).then(e=>e.json()).then(e=>{y=e||[],D()}).catch(()=>{}),fetch(`json/equipment_brands.json`).then(e=>e.json()).then(e=>{b=e||[],D()}).catch(()=>{}),await w(),D(),R()}}function C(e){let t=``,n={},r=new Date().getFullYear(),i=e=>`<option value="">${e}</option>`+Array.from({length:r-1979},(e,t)=>r-t).map(e=>`<option value="${e}">${e}</option>`).join(``),o=()=>`<option value="">Vse znamke</option>`+Object.keys(n).sort().map(e=>`<option value="${e}">${e}</option>`).join(``),s=e=>!e||!n[e]?`<option value="">Vsi modeli</option>`:`<option value="">Vsi modeli</option>`+(Array.isArray(n[e])?n[e]:Object.keys(n[e])).map(e=>`<option value="${e}">${e}</option>`).join(``);e.innerHTML=`
        <div class="search-box-container" style="margin-top:2rem;margin-bottom:4rem;">
            <form id="navOpremaForm" class="search-box compact glass-card main-search-card card-squircle">
                <style>
                    #navOpremaForm .nh-row { display:flex; gap:1rem; align-items:flex-end; margin-bottom:1.25rem; flex-wrap:wrap; }
                    #navOpremaForm .nh-field { display:flex; flex-direction:column; gap:0.35rem; flex:1; min-width:140px; }
                    #navOpremaForm .nh-field label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; width:100%; }
                    #navOpremaForm .nh-section-label { font-size:0.78rem; font-weight:600; color:var(--text-muted,#64748b); letter-spacing:0.02em; text-align:center; margin-bottom:0.6rem; }
                    #navOpremaForm .nh-actions { display:flex; gap:1rem; align-items:center; justify-content:center; margin-top:0.75rem; flex-wrap:wrap; }
                    #navOpremaForm .nav-oprema-cat-grid { justify-content:center; }
                    @media (max-width:600px) {
                        #navOpremaForm .nh-row { flex-direction:column; align-items:stretch; }
                        #navOpremaForm .pill-select-wrapper,
                        #navOpremaForm .pill-input-wrapper { width: 100% !important; }
                    }
                </style>

                <!-- Header: title only -->
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1.25rem;">
                    <i data-lucide="anchor" style="width:20px;height:20px;color:var(--color-primary,#2563eb);flex-shrink:0;"></i>
                    <span style="font-size:1rem;font-weight:700;">Oprema za plovila</span>
                </div>

                <!-- Category tiles -->
                <div style="margin-bottom:1.25rem;">
                    <div class="nh-section-label">VRSTA OPREME</div>
                    <div class="nav-oprema-cat-grid" id="navCatGrid">
                        ${x.map(e=>`
                            <button type="button" class="nav-oprema-cat-btn" data-cat="${e.value}">
                                <i data-lucide="${e.icon}" style="width:26px;height:26px;margin-bottom:0.3rem;"></i>
                                <span>${e.label}</span>
                            </button>
                        `).join(``)}
                    </div>
                </div>

                <!-- Row: Znamka + Model -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Znamka</label>
                        <div class="pill-select-wrapper">
                            <select id="navBrand" class="pill-input">
                                <option value="">Vse znamke</option>
                            </select>
                        </div>
                    </div>
                    <div class="nh-field">
                        <label>Model</label>
                        <div class="pill-select-wrapper">
                            <select id="navModel" class="pill-input" disabled>
                                <option value="">Vsi modeli</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Row: Cena od + Cena do (pill number inputs) -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Cena od (€)</label>
                        <input type="number" id="navPriceFrom" class="pill-input" placeholder="0 €" min="0" inputmode="numeric">
                    </div>
                    <div class="nh-field">
                        <label>Cena do (€)</label>
                        <input type="number" id="navPriceTo" class="pill-input" placeholder="Brez omejitve" min="0" inputmode="numeric">
                    </div>
                </div>

                <!-- Row: Letnik od + Letnik do -->
                <div class="nh-row">
                    <div class="nh-field">
                        <label>Letnik od</label>
                        <div class="pill-select-wrapper">
                            <select id="navYearFrom" class="pill-input">
                                ${i(`npr. 2010`)}
                            </select>
                        </div>
                    </div>
                    <div class="nh-field">
                        <label>Letnik do</label>
                        <div class="pill-select-wrapper">
                            <select id="navYearTo" class="pill-input">
                                ${i(`Vse`)}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="nh-actions">
                    <button type="reset" class="pill-btn secondary" style="flex:1;min-width:140px;max-width:220px;justify-content:center;gap:0.4rem;">
                        <i data-lucide="refresh-cw" style="width:16px;height:16px;"></i> Ponastavi
                    </button>
                    <button type="button" class="pill-btn primary search-submit-btn" id="navOpremaSearch" style="flex:1;min-width:140px;max-width:340px;justify-content:center;gap:0.5rem;">
                        <i data-lucide="search" style="width:16px;height:16px;"></i> Išči opremo
                    </button>
                </div>
            </form>
        </div>
    `,window.lucide&&window.lucide.createIcons({scope:e}),a(),e.querySelectorAll(`.nav-oprema-cat-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.classList.contains(`active`);e.querySelectorAll(`.nav-oprema-cat-btn`).forEach(e=>e.classList.remove(`active`)),r||n.classList.add(`active`),t=n.classList.contains(`active`)?n.dataset.cat:``})}),fetch(`json/brands_models_plovila.json`).then(e=>e.json()).then(e=>{n=e||{};let t=document.getElementById(`navBrand`);t&&(t.innerHTML=o())}).catch(()=>{}),document.getElementById(`navBrand`)?.addEventListener(`change`,e=>{let t=document.getElementById(`navModel`);t&&(t.innerHTML=s(e.target.value),t.disabled=!e.target.value)}),e.querySelector(`form`)?.addEventListener(`reset`,()=>{setTimeout(()=>{e.querySelectorAll(`.nav-oprema-cat-btn`).forEach(e=>e.classList.remove(`active`)),t=``;let n=document.getElementById(`navModel`);n&&(n.innerHTML=`<option value="">Vsi modeli</option>`,n.disabled=!0)},0)}),document.getElementById(`navOpremaSearch`)?.addEventListener(`click`,async()=>{let n=document.getElementById(`navBrand`)?.value||``;document.getElementById(`navModel`)?.value;let r=parseInt(document.getElementById(`navPriceFrom`)?.value)||0,i=parseInt(document.getElementById(`navPriceTo`)?.value)||0,o=document.getElementById(`navYearFrom`)?.value||``,s=document.getElementById(`navYearTo`)?.value||``,c=document.getElementById(`navProdajaToggle`)?.checked,l=document.getElementById(`navNajemToggle`)?.checked;g.filters={partGroup:t,brand:n,priceFrom:r>0?r:``,priceTo:i>0?i:``,yearFrom:o,yearTo:s,prodaja:c,najem:l},T(e),a(),E(),fetch(`json/equipment_brands.json`).then(e=>e.json()).then(e=>{b=e||[],D()}).catch(()=>{}),await w(),D(),R()})}async function w(){let e=document.getElementById(`gdResults`);e&&(e.innerHTML=`<div class="gd-loading">${t(`gd_loading`,`Nalaganje…`)}</div>`);try{let[e,t]=await Promise.all([n(),o()]);_=(e||[]).filter(e=>e.itemType===`part`||e.itemType===`tire`||e.itemType===`oprema`),v=t||[]}catch(e){console.error(`[GumeInDeli] data load failed`,e),_=[],v=[]}}function T(e){let n=(e,t,n)=>`
        <button type="button" class="gd-itemtype-btn ${g.itemType===e?`active`:``}" data-item="${e}">
            <i data-lucide="${t}"></i> <span>${n}</span>
        </button>`;e.innerHTML=`
        ${h()?`<div class="gd-hero-container">
            <h1 style="text-align:center;font-size:1.75rem;font-weight:700;margin-bottom:0.5rem;">Oprema za plovila</h1>
            <p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Motorji, navigacija, varnostna oprema in dodatki za plovila.</p>
           </div>`:`<div class="gd-hero-container">
            <div class="glass-card rounded-pill tabs-glass" id="gdVehCat" style="width:fit-content; margin-inline:auto; margin-bottom:1.5rem;">
                ${d.map(e=>`
        <button type="button" class="tab-btn ${g.vehicleCategory===e.value?`active`:``}" data-vehcat="${e.value}" title="${e.label}">
            <i data-lucide="${e.icon}"></i>
            <span class="hidden-md">${e.label}</span>
        </button>`).join(``)}
            </div>
            <div class="gd-itemtype-toggle" id="gdItemType">
                ${n(`tire`,`disc-3`,t(`gd_item_tires`,`Gume`))}
                ${n(`part`,`wrench`,t(`gd_item_parts`,`Deli`))}
                ${g.vehicleCategory===`moto`?n(`oprema`,`shield`,t(`cl_sub_oprema`,`Moto oprema`)):``}
            </div>
           </div>`}

        <div class="oglasi-layout">
            <aside class="oglasi-sidebar">
                <button type="button" id="gdMobileFilterToggle" class="mobile-filter-toggle">
                    <span><i data-lucide="sliders-horizontal"></i> ${t(`sidebar_filters_title`,`Filtri`)}</span>
                    <i data-lucide="chevron-down" class="mft-chevron"></i>
                </button>
                <div class="oglasi-sidebar-card glass-card" id="gdFilters"></div>
            </aside>

            <main class="gd-main">
                <div class="gd-results-header">
                    <div class="gd-source-toggle" id="gdSource">
                        <button type="button" class="gd-source-btn active" data-source="all">${t(`gd_source_all`,`Vse`)}</button>
                        <button type="button" class="gd-source-btn" data-source="peer">${t(`gd_source_peer`,`Rabljeni oglasi`)}</button>
                        <button type="button" class="gd-source-btn" data-source="catalog">${t(`gd_source_catalog`,`Cenik trgovin`)}</button>
                    </div>
                    <span class="gd-count" id="gdCount"></span>
                </div>
                <div class="gd-results-grid" id="gdResults"></div>
            </main>
        </div>
    `,window.lucide&&window.lucide.createIcons()}function E(){document.getElementById(`gdItemType`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.gd-itemtype-btn`);if(!t)return;let n=t.dataset.item;g.itemType=n,g.filters={},document.querySelectorAll(`#gdItemType .gd-itemtype-btn`).forEach(e=>e.classList.toggle(`active`,e===t)),D(),R()}),document.getElementById(`gdVehCat`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.tab-btn`);t&&(g.vehicleCategory=t.dataset.vehcat,g.itemType===`oprema`&&g.vehicleCategory!==`moto`&&(g.itemType=`tire`),g.filters={},T(document.getElementById(`gd-root`)),E(),D(),R())}),document.getElementById(`gdSource`)?.addEventListener(`click`,e=>{let t=e.target.closest(`.gd-source-btn`);t&&(g.source=t.dataset.source,document.querySelectorAll(`#gdSource .gd-source-btn`).forEach(e=>e.classList.toggle(`active`,e===t)),R())}),document.getElementById(`gdMobileFilterToggle`)?.addEventListener(`click`,()=>{document.getElementById(`gdFilters`)?.classList.toggle(`open`),document.getElementById(`gdMobileFilterToggle`)?.classList.toggle(`open`)})}function D(){let e=document.getElementById(`gdFilters`);e&&(e.innerHTML=g.itemType===`tire`?O():g.itemType===`oprema`?A():k(),window.lucide&&window.lucide.createIcons({scope:e}),a(),e.querySelectorAll(`.js-format-number`).forEach(e=>r(e)),P())}function O(){let e=[];for(let t=125;t<=355;t+=5)e.push(t);let n=[25,30,35,40,45,50,55,60,65,70,75,80,85],r=[];for(let e=10;e<=24;e++)r.push(e);let i=(e,t)=>`<option value="${e}" ${String(t)===String(e)?`selected`:``}>${e}</option>`,a=g.filters;return`
        <div class="gd-filter-header">
            <h3>${t(`sidebar_filters_title`,`Filtri`)}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t(`sidebar_reset`,`Počisti vse`)}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_tire_size`,`Dimenzija`)}</label>
            <div class="gd-dim-row">
                <select class="glass-select" id="fW" data-no-search="true"><option value="">${t(`gd_tire_width`,`Širina`)}</option>${e.map(e=>i(e,a.width)).join(``)}</select>
                <select class="glass-select" id="fA" data-no-search="true"><option value="">${t(`gd_tire_aspect`,`Profil`)}</option>${n.map(e=>i(e,a.aspect)).join(``)}</select>
                <select class="glass-select" id="fR" data-no-search="true"><option value="">R</option>${r.map(e=>i(e,a.rim)).join(``)}</select>
            </div>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_season`,`Sezona`)}</label>
            <div class="adv-chip-group gd-chips">
                ${j(`letne`,t(`gd_season_summer`,`Letne`))}
                ${j(`zimske`,t(`gd_season_winter`,`Zimske`))}
                ${j(`celoletne`,t(`gd_season_allseason`,`Celoletne`))}
            </div>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_part_brand`,`Znamka`)}</label>
            <select class="glass-select" id="fBrand">
                <option value="">${t(`all_brands`,`Vse znamke`)}</option>
                ${y.map(e=>`<option value="${e}" ${a.brand===e?`selected`:``}>${e}</option>`).join(``)}
            </select>
        </div>

        ${M(a)}
        ${N(a)}
    `}function k(){let e=g.filters,n=p(g.vehicleCategory).map(t=>`<option value="${t.value}" ${e.partGroup===t.value?`selected`:``}>${t.label}</option>`).join(``),r=(e.partGroup?u(g.vehicleCategory,e.partGroup):[]).map(t=>`<option value="${t.value}" ${e.partType===t.value?`selected`:``}>${t.label}</option>`).join(``);return`
        <div class="gd-filter-header">
            <h3>${t(`sidebar_filters_title`,`Filtri`)}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t(`sidebar_reset`,`Počisti vse`)}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_part_group`,`Sklop`)}</label>
            <select class="glass-select" id="fGroup">
                <option value="">${t(`gd_all_groups`,`Vsi sklopi`)}</option>
                ${n}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_part_type`,`Vrsta dela`)}</label>
            <select class="glass-select" id="fType" ${e.partGroup?``:`disabled`}>
                <option value="">${t(`gd_all_types`,`Vse vrste`)}</option>
                ${r}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_part_brand`,`Znamka / proizvajalec`)}</label>
            <input type="text" class="pill-input" id="fBrandText" value="${G(e.brand||``)}" placeholder="npr. Bosch" />
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_oem_number`,`OEM številka`)}</label>
            <input type="text" class="pill-input" id="fOemText" value="${G(e.oem||``)}" placeholder="npr. 0986494104" />
        </div>

        ${M(e)}
        ${N(e)}
    `}function A(){let e=g.filters,n=f().map(t=>`<option value="${t.value}" ${e.eqGroup===t.value?`selected`:``}>${t.label}</option>`).join(``),r=(e.eqGroup?c(e.eqGroup):[]).map(t=>`<option value="${t.value}" ${e.eqType===t.value?`selected`:``}>${t.label}</option>`).join(``),i=m.map(t=>`<option value="${t}" ${e.eqSize===t?`selected`:``}>${t}</option>`).join(``);return`
        <div class="gd-filter-header">
            <h3>${t(`sidebar_filters_title`,`Filtri`)}</h3>
            <button type="button" id="gdReset" class="gd-reset">${t(`sidebar_reset`,`Počisti vse`)}</button>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_eq_group`,`Sklop opreme`)}</label>
            <select class="glass-select" id="fEqGroup">
                <option value="">${t(`gd_eq_all_groups`,`Vsi sklopi`)}</option>
                ${n}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_eq_type`,`Vrsta`)}</label>
            <select class="glass-select" id="fEqType" ${e.eqGroup?``:`disabled`}>
                <option value="">${t(`gd_eq_all_types`,`Vse vrste`)}</option>
                ${r}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_part_brand`,`Znamka / proizvajalec`)}</label>
            <select class="glass-select" id="fEqBrand">
                <option value="">${t(`all_brands`,`Vse znamke`)}</option>
                ${b.map(t=>`<option value="${G(t)}" ${e.brand===t?`selected`:``}>${W(t)}</option>`).join(``)}
            </select>
        </div>

        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_eq_size`,`Velikost`)}</label>
            <select class="glass-select" id="fEqSize" data-no-search="true">
                <option value="">${t(`gd_eq_all_sizes`,`Vse velikosti`)}</option>
                ${i}
            </select>
        </div>

        ${M(e)}
        ${N(e)}
    `}function j(e,t){let n=(g.filters.seasons||[]).includes(e);return`<label class="adv-chip ${n?`checked`:``}"><input type="checkbox" name="season" value="${e}" ${n?`checked`:``}> ${t}</label>`}function M(e){return`
        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`gd_price`,`Cena (€)`)}</label>
            <div class="gd-dim-row">
                <input type="text" class="pill-input js-format-number" id="fPriceFrom" value="${G(e.priceFrom||``)}" placeholder="${t(`gd_from`,`od`)}" />
                <input type="text" class="pill-input js-format-number" id="fPriceTo" value="${G(e.priceTo||``)}" placeholder="${t(`gd_to`,`do`)}" />
            </div>
        </div>`}function N(e){let n=(e.conditions||[]).includes(`Rabljeno`),r=(e.conditions||[]).includes(`Novo`);return`
        <div class="gd-filter-group">
            <label class="gd-flabel">${t(`cl_condition`,`Stanje`)} <span class="gd-hint">(${t(`gd_source_peer`,`Rabljeni oglasi`)})</span></label>
            <div class="adv-chip-group gd-chips">
                <label class="adv-chip ${r?`checked`:``}"><input type="checkbox" name="condition" value="Novo" ${r?`checked`:``}> ${t(`gd_condition_new`,`Novo`)}</label>
                <label class="adv-chip ${n?`checked`:``}"><input type="checkbox" name="condition" value="Rabljeno" ${n?`checked`:``}> ${t(`gd_condition_used`,`Rabljeno`)}</label>
            </div>
        </div>`}function P(){let e=document.getElementById(`gdFilters`);if(!e)return;let t=g.filters,n=()=>R();e.querySelector(`#fW`)?.addEventListener(`change`,e=>{t.width=e.target.value,n()}),e.querySelector(`#fA`)?.addEventListener(`change`,e=>{t.aspect=e.target.value,n()}),e.querySelector(`#fR`)?.addEventListener(`change`,e=>{t.rim=e.target.value,n()}),e.querySelector(`#fBrand`)?.addEventListener(`change`,e=>{t.brand=e.target.value,n()}),e.querySelector(`#fGroup`)?.addEventListener(`change`,e=>{t.partGroup=e.target.value,t.partType=``,D(),R()}),e.querySelector(`#fType`)?.addEventListener(`change`,e=>{t.partType=e.target.value,n()}),e.querySelector(`#fBrandText`)?.addEventListener(`input`,e=>{t.brand=e.target.value,n()}),e.querySelector(`#fOemText`)?.addEventListener(`input`,e=>{t.oem=e.target.value,n()}),e.querySelector(`#fEqGroup`)?.addEventListener(`change`,e=>{t.eqGroup=e.target.value,t.eqType=``,D(),R()}),e.querySelector(`#fEqType`)?.addEventListener(`change`,e=>{t.eqType=e.target.value,n()}),e.querySelector(`#fEqBrand`)?.addEventListener(`change`,e=>{t.brand=e.target.value,n()}),e.querySelector(`#fEqSize`)?.addEventListener(`change`,e=>{t.eqSize=e.target.value,n()}),e.querySelector(`#fPriceFrom`)?.addEventListener(`input`,e=>{t.priceFrom=e.target.value,n()}),e.querySelector(`#fPriceTo`)?.addEventListener(`input`,e=>{t.priceTo=e.target.value,n()}),e.querySelectorAll(`input[name="season"]`).forEach(r=>r.addEventListener(`change`,()=>{t.seasons=[...e.querySelectorAll(`input[name="season"]:checked`)].map(e=>e.value),e.querySelectorAll(`input[name="season"]`).forEach(e=>e.closest(`.adv-chip`).classList.toggle(`checked`,e.checked)),n()})),e.querySelectorAll(`input[name="condition"]`).forEach(r=>r.addEventListener(`change`,()=>{t.conditions=[...e.querySelectorAll(`input[name="condition"]:checked`)].map(e=>e.value),e.querySelectorAll(`input[name="condition"]`).forEach(e=>e.closest(`.adv-chip`).classList.toggle(`checked`,e.checked)),n()})),e.querySelector(`#gdReset`)?.addEventListener(`click`,()=>{g.filters={},D(),R()})}function F(e){let t=parseFloat(String(e).replace(/[^0-9.]/g,``));return isNaN(t)?null:t}function I(e){let t=g.filters;if(e.itemType!==g.itemType||(e.vehicleCategory||e.category)!==g.vehicleCategory)return!1;let n=F(e.priceEur??e.price);if(t.priceFrom&&n!=null&&n<i(t.priceFrom)||t.priceTo&&n!=null&&n>i(t.priceTo)||t.conditions&&t.conditions.length&&!t.conditions.includes(e.condition))return!1;if(g.itemType===`tire`){if(t.width&&String(e.tireWidth)!==String(t.width)||t.aspect&&String(e.tireAspect)!==String(t.aspect)||t.rim&&String(e.tireRim)!==String(t.rim)||t.seasons&&t.seasons.length&&!t.seasons.includes(e.tireSeason)||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase()))return!1}else if(g.itemType===`oprema`){if(t.eqGroup&&e.equipmentGroup!==t.eqGroup||t.eqType&&e.equipmentType!==t.eqType||t.eqSize&&String(e.equipmentSize)!==String(t.eqSize)||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase()))return!1}else if(t.partGroup&&e.partGroup!==t.partGroup||t.partType&&e.partType!==t.partType||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase())||t.oem&&!(e.oemNumber||``).toLowerCase().includes(String(t.oem).toLowerCase()))return!1;return!0}function L(e){let t=g.filters;if(e.itemType!==g.itemType||e.vehicleCategory!==g.vehicleCategory)return!1;let n=e.attributes||{},r=s(e);if(t.priceFrom&&r!=null&&r<i(t.priceFrom)||t.priceTo&&r!=null&&r>i(t.priceTo))return!1;if(g.itemType===`tire`){if(t.width&&String(n.width)!==String(t.width)||t.aspect&&String(n.aspect)!==String(t.aspect)||t.rim&&String(n.rim)!==String(t.rim)||t.seasons&&t.seasons.length&&!t.seasons.includes(n.season)||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase()))return!1}else if(g.itemType===`oprema`){if(t.eqGroup&&n.equipmentGroup!==t.eqGroup||t.eqType&&n.equipmentType!==t.eqType||t.eqSize&&String(n.equipmentSize)!==String(t.eqSize)||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase()))return!1}else if(t.partGroup&&n.partGroup!==t.partGroup||t.partType&&n.partType!==t.partType||t.brand&&!(e.brand||``).toLowerCase().includes(String(t.brand).toLowerCase())||t.oem&&!(n.oemNumber||``).toLowerCase().includes(String(t.oem).toLowerCase()))return!1;return!0}function R(){let e=document.getElementById(`gdResults`),n=document.getElementById(`gdCount`);if(!e)return;let r=g.source===`catalog`?[]:_.filter(I),i=g.source===`peer`?[]:v.filter(L),a=r.length+i.length;if(n&&(n.textContent=`${a} ${t(`gd_results`,`zadetkov`)}`),a===0){e.innerHTML=`<div class="gd-empty"><i data-lucide="search-x"></i><p>${t(`gd_no_results`,`Ni zadetkov.`)}</p></div>`,window.lucide&&window.lucide.createIcons({scope:e});return}e.innerHTML=r.map(z).join(``)+i.map(B).join(``),window.lucide&&window.lucide.createIcons({scope:e})}function z(e){let n=e.images?.exterior?.[0]||``,r=F(e.priceEur??e.price),i=e.itemType===`tire`?[e.tireSize,V(e.tireSeason)].filter(Boolean).join(` · `):e.itemType===`oprema`?[e.brand,l(e.equipmentGroup,e.equipmentType),e.equipmentSize].filter(Boolean).join(` · `):[e.brand,e.oemNumber].filter(Boolean).join(` · `);return`
        <a href="#/oglas?id=${encodeURIComponent(e.id)}" class="gd-card gd-card--peer">
            <div class="gd-card-img">
                ${n?`<img src="${G(n)}" alt="${G(e.title||``)}" loading="lazy" />`:`<i data-lucide="${e.itemType===`tire`?`disc-3`:e.itemType===`oprema`?`shield`:`wrench`}"></i>`}
                <span class="gd-badge gd-badge--peer">${e.condition||t(`gd_source_peer`,`Oglas`)}</span>
            </div>
            <div class="gd-card-body">
                <div class="gd-card-title">${W(e.title||``)}</div>
                <div class="gd-card-sub">${W(i)}</div>
                <div class="gd-card-foot">
                    <span class="gd-card-price">${r==null?t(`cl_label_call_for_price`,`Po dogovoru`):U(r)}</span>
                    ${e.location?.region?`<span class="gd-card-loc"><i data-lucide="map-pin"></i> ${W(e.location.region)}</span>`:``}
                </div>
            </div>
        </a>`}function B(e){let n=s(e),r=e.attributes||{},i=e.itemType===`tire`?[r.size,V(r.season)].filter(Boolean).join(` · `):e.itemType===`oprema`?[e.brand,l(r.equipmentGroup,r.equipmentType),r.equipmentSize].filter(Boolean).join(` · `):[e.brand,r.oemNumber].filter(Boolean).join(` · `);return`
        <a href="#/katalog?id=${encodeURIComponent(e.id)}" class="gd-card gd-card--catalog">
            <div class="gd-card-img">
                ${e.imageUrl?`<img src="${G(e.imageUrl)}" alt="${G(e.title||``)}" loading="lazy" />`:`<i data-lucide="${e.itemType===`tire`?`disc-3`:e.itemType===`oprema`?`shield`:`wrench`}"></i>`}
                <span class="gd-badge gd-badge--catalog"><i data-lucide="store"></i> ${t(`gd_source_catalog`,`Trgovine`)}</span>
            </div>
            <div class="gd-card-body">
                <div class="gd-card-title">${W(e.title||``)}</div>
                <div class="gd-card-sub">${W(i)}</div>
                <div class="gd-card-foot">
                    <span class="gd-card-price">${n==null?``:t(`gd_from_price`,`od {price}€`).replace(`{price}`,H(n))}</span>
                    <span class="gd-card-shops">${t(`gd_shops_count`,`{count} trgovin`).replace(`{count}`,e.offerCount||(e.offers||[]).length)}</span>
                </div>
            </div>
        </a>`}function V(e){return{letne:t(`gd_season_summer`,`Letne`),zimske:t(`gd_season_winter`,`Zimske`),celoletne:t(`gd_season_allseason`,`Celoletne`)}[e]||e||``}function H(e){return new Intl.NumberFormat(`sl-SI`).format(Math.round(e))}function U(e){return H(e)+` €`}function W(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function G(e){return W(e)}export{S as initGumeInDeliPage};