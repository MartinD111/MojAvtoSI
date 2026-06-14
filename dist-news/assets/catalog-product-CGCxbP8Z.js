import{a as e}from"./i18n-BZd20ht-.js";import{r as t,t as n}from"./catalogService-CxXGx5GX.js";function r(e){let t=window.location.hash.split(`?`)[1]||``;return new URLSearchParams(t).get(e)}async function i(){let t=document.getElementById(`catalog-root`);if(!t)return;let i=r(`id`);if(!i){t.innerHTML=o(e(`gd_no_product`,`Izdelek ni najden.`));return}t.innerHTML=`<div class="gd-loading" style="padding:4rem;text-align:center;">${e(`gd_loading`,`Nalaganje…`)}</div>`;let s;try{s=await n(i)}catch(n){console.error(`[CatalogProduct] load failed`,n),t.innerHTML=o(e(`gd_no_product`,`Izdelek ni najden.`));return}a(t,s)}function a(n,r){let i=t(r),a=r.attributes||{},o=[...r.offers||[]].sort((e,t)=>(e.price??1/0)-(t.price??1/0)),f=(r.itemType===`tire`?[[e(`gd_tire_size`,`Dimenzija`),a.size],[e(`gd_season`,`Sezona`),s(a.season)],[e(`gd_part_brand`,`Znamka`),r.brand],[`Indeks nosilnosti`,a.loadIndex],[`Hitrostni razred`,a.speedRating]]:[[e(`gd_part_brand`,`Znamka`),r.brand],[e(`gd_oem_number`,`OEM številka`),a.oemNumber],[e(`gd_compatibility`,`Združljivost`),(a.compatibility||[]).map(e=>`${e.make} ${e.model}`).join(`, `)]]).filter(([,e])=>e).map(([e,t])=>`
        <div class="catalog-spec"><span>${e}</span><strong>${u(String(t))}</strong></div>`).join(``),p=o.map(t=>`
        <a class="catalog-offer" href="${d(t.url)}" target="_blank" rel="noopener nofollow sponsored">
            <span class="catalog-offer-shop">
                <img class="catalog-offer-favicon" src="https://www.google.com/s2/favicons?domain=${d(t.domain)}&sz=32" alt="" loading="lazy" />
                <span>
                    <strong>${u(t.shop||t.domain)}</strong>
                    <small>${u(t.domain)}${t.inStock===!1?` · `+e(`gd_out_of_stock`,`Ni na zalogi`):``}</small>
                </span>
            </span>
            <span class="catalog-offer-right">
                <span class="catalog-offer-price">${t.price==null?``:l(t.price)}</span>
                <span class="catalog-offer-cta">${e(`gd_visit_shop`,`Obišči trgovino`)} <i data-lucide="external-link"></i></span>
            </span>
        </a>`).join(``);n.innerHTML=`
        <div class="catalog-detail">
            <a href="#/gume-in-deli" class="catalog-back"><i data-lucide="arrow-left"></i> ${e(`gd_back_to_search`,`Nazaj na iskanje`)}</a>

            <div class="catalog-detail-grid">
                <div class="catalog-detail-media glass-card">
                    ${r.imageUrl?`<img src="${d(r.imageUrl)}" alt="${d(r.title||``)}" />`:`<i data-lucide="${r.itemType===`tire`?`disc-3`:`wrench`}"></i>`}
                </div>

                <div class="catalog-detail-info">
                    <h1 class="catalog-detail-title">${u(r.title||``)}</h1>
                    ${i==null?``:`<div class="catalog-detail-price">${e(`gd_from_price`,`od {price}€`).replace(`{price}`,c(i))}</div>`}
                    <div class="catalog-detail-shops">${e(`gd_shops_count`,`{count} trgovin`).replace(`{count}`,o.length)}</div>
                    <div class="catalog-specs">${f}</div>
                </div>
            </div>

            <h2 class="catalog-offers-title">${e(`gd_offers_title`,`Na voljo v trgovinah`)}</h2>
            <div class="catalog-offers">${p||`<p>${e(`gd_no_offers`,`Trenutno ni ponudb.`)}</p>`}</div>
            <p class="catalog-disclaimer">${e(`gd_external_disclaimer`,`Cene in zaloga so informativne in se lahko razlikujejo od dejanskega stanja v trgovini.`)}</p>
        </div>
    `,window.lucide&&window.lucide.createIcons()}function o(t){return`<div class="catalog-detail" style="text-align:center;padding:4rem 1rem;">
        <p style="font-size:1.1rem;color:#64748b;">${u(t)}</p>
        <a href="#/gume-in-deli" class="pill-btn primary" style="margin-top:1rem;display:inline-block;text-decoration:none;">${e(`gd_back_to_search`,`Nazaj na iskanje`)}</a>
    </div>`}function s(t){return{letne:e(`gd_season_summer`,`Letne`),zimske:e(`gd_season_winter`,`Zimske`),celoletne:e(`gd_season_allseason`,`Celoletne`)}[t]||t||``}function c(e){return new Intl.NumberFormat(`sl-SI`).format(Math.round(e))}function l(e){return c(e)+` €`}function u(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function d(e){return u(e)}export{i as initCatalogProductPage};