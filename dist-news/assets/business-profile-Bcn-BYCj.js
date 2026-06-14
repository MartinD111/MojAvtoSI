import{t as e}from"./sampleListings-CTAGWO7V.js";import{r as t}from"./businesses-BB2P-O_3.js";import{a as n,r}from"./businessService-Cxl975gJ.js";function i(e){let t=Math.floor(e),n=e%1>=.5,r=5-t-!!n;return`★`.repeat(t)+(n?`½`:``)+`☆`.repeat(r)}function a(e){document.getElementById(`bizCoverImg`).src=e.coverImage,document.getElementById(`bizCoverImg`).alt=e.name+` cover`,document.getElementById(`bizLogoImg`).src=e.logo,document.getElementById(`bizLogoImg`).alt=e.name,document.getElementById(`bizName`).textContent=e.name,document.getElementById(`bizStars`).textContent=i(e.rating),document.getElementById(`bizRatingNum`).textContent=e.rating.toFixed(1),document.getElementById(`bizRatingCount`).textContent=`(${e.reviewCount} ocen)`;let t=[];e.businessTypes.forEach(e=>{t.push(`<span class="biz-badge ${e}"><i data-lucide="${e===`dealer`?`building-2`:e===`service`?`wrench`:`circle`}"></i>${{dealer:`Avto hiša`,service:`Servis`,vulcanizer:`Vulkanizer`}[e]}</span>`)}),e.verified&&t.push(`<span class="biz-badge verified"><i data-lucide="badge-check"></i>Verificirano</span>`),e.authorizedBrands.length&&t.push(`<span class="biz-badge authorized"><i data-lucide="award"></i>Pooblaščen servis</span>`),e.offersLeasing&&t.push(`<span class="biz-badge leasing"><i data-lucide="landmark"></i>Leasing</span>`),e.offersTyreStorage&&t.push(`<span class="biz-badge tyre"><i data-lucide="circle"></i>Hramba gum</span>`),document.getElementById(`bizBadges`).innerHTML=t.join(``);let n=[];n.push(`<a href="tel:${e.contact.phone}" class="biz-cta-btn primary"><i data-lucide="phone"></i>Kontaktiraj</a>`),(e.businessTypes.includes(`service`)||e.businessTypes.includes(`vulcanizer`))&&n.push(`<button class="biz-cta-btn outline" id="bookingHeroBtn"><i data-lucide="calendar"></i>Rezerviraj termin</button>`),e.businessTypes.includes(`dealer`)&&n.push(`<button class="biz-cta-btn outline" onclick="window._showBizTab('oglasi')"><i data-lucide="car"></i>Poglej oglase</button>`),document.getElementById(`bizHeroActions`).innerHTML=n.join(``),document.getElementById(`bookingHeroBtn`)?.addEventListener(`click`,()=>{window.location.hash=`#/booking?businessId=${e.id}`})}function o(e){let t=[...new Set([...e.authorizedBrands,...e.supportedBrands])].length>0?`<div class="biz-brands-row">
            ${e.authorizedBrands.map(e=>`<span class="biz-brand-tag authorized" title="Pooblaščen">${e}</span>`).join(``)}
            ${e.supportedBrands.filter(t=>!e.authorizedBrands.includes(t)).map(e=>`<span class="biz-brand-tag">${e}</span>`).join(``)}
           </div>`:``;document.getElementById(`bizInfoBar`).innerHTML=`
        <div class="biz-info-item">
            <i data-lucide="map-pin"></i>
            ${e.contact.address}
        </div>
        <div class="biz-info-item">
            <i data-lucide="phone"></i>
            <a href="tel:${e.contact.phone}">${e.contact.phone}</a>
        </div>
        <div class="biz-info-item">
            <i data-lucide="mail"></i>
            <a href="mailto:${e.contact.email}">${e.contact.email}</a>
        </div>
        ${t?`<div class="biz-info-item"><i data-lucide="tag"></i>${t}</div>`:``}
    `}function s(e){let t=[];e.businessTypes.includes(`dealer`)&&t.push({id:`oglasi`,label:`Oglasi`,icon:`car`}),(e.businessTypes.includes(`service`)||e.businessTypes.includes(`vulcanizer`))&&t.push({id:`storitve`,label:`Storitve`,icon:`wrench`}),t.push({id:`ocene`,label:`Ocene`,icon:`star`}),t.push({id:`o-podjetju`,label:`O podjetju`,icon:`info`});let n=document.getElementById(`bizTabsNav`);n.innerHTML=t.map((e,t)=>`
        <button class="biz-tab-btn ${t===0?`active`:``}" data-tab="${e.id}" id="tabBtn-${e.id}">
            <i data-lucide="${e.icon}"></i>${e.label}
        </button>
    `).join(``),t.length>0&&c(t[0].id),n.querySelectorAll(`.biz-tab-btn`).forEach(e=>{e.addEventListener(`click`,()=>c(e.getAttribute(`data-tab`)))})}function c(e){document.querySelectorAll(`.biz-tab-content`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`.biz-tab-btn`).forEach(e=>e.classList.remove(`active`));let t=document.getElementById(`tab-${e}`),n=document.querySelector(`.biz-tab-btn[data-tab="${e}"]`);t&&t.classList.add(`active`),n&&n.classList.add(`active`),window.lucide&&window.lucide.createIcons()}window._showBizTab=c;function l(t){let n=document.getElementById(`bizListingsGrid`);if(!n)return;let r=e.filter(e=>e.seller===t.name||e.sellerId===t.id);if(r.length===0&&t.businessTypes.includes(`dealer`)&&(r=e.filter(e=>e.sellerType===`dealer`).slice(0,3)),r.length===0){n.innerHTML=`<div class="biz-empty"><div style="font-size:2rem;margin-bottom:0.5rem;">🚗</div><div>Ta avto hiša nima aktivnih oglasov.</div></div>`;return}n.innerHTML=r.map(e=>`
        <div class="biz-listing-card" onclick="window.location.hash='#/oglas?id=${e.id}'">
            <img class="biz-listing-img" src="${e.images[0]}" alt="${e.title}" loading="lazy" />
            <div class="biz-listing-body">
                <div class="biz-listing-title">${e.title}</div>
                <div class="biz-listing-sub">${e.subtitle}</div>
                <div class="biz-listing-price">${e.price}</div>
            </div>
        </div>
    `).join(``)}var u={tyre_change:`circle`,tyre_storage:`archive`,tyre_repair:`tool`,oil_change:`droplets`,brake_service:`disc`,diagnostics:`activity`,inspection:`clipboard-check`,air_conditioning:`wind`,wheel_alignment:`settings`,wheel_balancing:`loader`,clutch_repair:`settings-2`,body_repair:`shield`,electrical_repair:`zap`,battery_service:`battery-charging`,software_update:`cpu`,hybrid_service:`leaf`,washing:`sparkles`},d={tyre_change:`od 15 €/guma`,tyre_storage:`od 40 €/sezona`,tyre_repair:`od 8 €`,oil_change:`od 49 €`,brake_service:`od 79 €`,diagnostics:`od 29 €`,inspection:`po dogovoru`,air_conditioning:`od 59 €`,wheel_alignment:`od 39 €`,wheel_balancing:`od 8 €/guma`,clutch_repair:`od 299 €`,body_repair:`po ogledu`,electrical_repair:`od 49 €`,battery_service:`po ogledu`,software_update:`od 99 €`,hybrid_service:`od 119 €`,washing:`od 12 €`};function f(e){let n=document.getElementById(`bizServicesGrid`),r=document.getElementById(`bizBookingBanner`),i=document.getElementById(`bizBookingBtn`);if(n){if(e.servicesOffered.length===0){n.innerHTML=`<div class="biz-empty" style="grid-column:1/-1;"><div style="font-size:2rem;margin-bottom:0.5rem;">🔧</div><div>Storitve niso navedene.</div></div>`,r&&(r.style.display=`none`);return}n.innerHTML=e.servicesOffered.map(n=>`
        <div class="biz-service-card">
            <div class="biz-service-icon">
                <i data-lucide="${u[n]||`settings`}"></i>
            </div>
            <div class="biz-service-name">${t[n]||n}</div>
            <div class="biz-service-price">${d[n]||`po dogovoru`}</div>
            <button class="biz-service-cta" onclick="window.location.hash='#/booking?businessId=${e.id}&service=${n}'">
                Rezerviraj →
            </button>
        </div>
    `).join(``),i&&i.addEventListener(`click`,()=>{window.location.hash=`#/booking?businessId=${e.id}`})}}var p=[{author:`Marko K.`,avatar:`https://ui-avatars.com/api/?name=MK&background=2563eb&color=fff&size=64`,rating:5,date:`15. 3. 2024`,text:`Odlična izkušnja! Hitri, strokovni in prijazni. Termin sem dobil isti dan.`},{author:`Ana L.`,avatar:`https://ui-avatars.com/api/?name=AL&background=7c3aed&color=fff&size=64`,rating:4,date:`2. 2. 2024`,text:`Zelo zadovoljna s storitvijo. Cena je bila transparentna, brez skritih stroškov.`},{author:`Jure P.`,avatar:`https://ui-avatars.com/api/?name=JP&background=16a34a&color=fff&size=64`,rating:5,date:`18. 1. 2024`,text:`Najboljši servis v mestu. Priporočam vsem!`},{author:`Petra M.`,avatar:`https://ui-avatars.com/api/?name=PM&background=ea580c&color=fff&size=64`,rating:4,date:`5. 12. 2023`,text:`Dobra komunikacija in kakovostno delo. Vrnil sem se že tretjič.`},{author:`Tomaž V.`,avatar:`https://ui-avatars.com/api/?name=TV&background=0891b2&color=fff&size=64`,rating:3,date:`22. 11. 2023`,text:`Solidno, je pa bilo treba malo počakati na termin.`}];function m(e){let t=document.getElementById(`bizReviewsSummary`),n=document.getElementById(`bizReviewsList`);!t||!n||(t.innerHTML=`
        <div class="biz-reviews-big-rating">
            <div class="biz-rating-big">${e.rating.toFixed(1)}</div>
            <div class="biz-rating-stars-big">${i(e.rating)}</div>
            <div class="biz-rating-total">${e.reviewCount} ocen</div>
        </div>
        <div class="biz-rating-bars">
            ${[{stars:5,pct:68},{stars:4,pct:20},{stars:3,pct:8},{stars:2,pct:2},{stars:1,pct:2}].map(e=>`
                <div class="biz-rating-bar-row">
                    <span style="min-width:12px;">${e.stars}</span>
                    <i data-lucide="star" style="width:11px;height:11px;color:#f59e0b;"></i>
                    <div class="biz-rating-bar-bg">
                        <div class="biz-rating-bar-fill" style="width:${e.pct}%;"></div>
                    </div>
                    <span style="min-width:30px;">${e.pct}%</span>
                </div>
            `).join(``)}
        </div>
    `,n.innerHTML=p.map(e=>`
        <div class="biz-review-card">
            <div class="biz-review-header">
                <img class="biz-review-avatar" src="${e.avatar}" alt="${e.author}" />
                <div>
                    <div class="biz-review-author">${e.author}</div>
                    <div class="biz-review-stars">${`★`.repeat(e.rating)}${`☆`.repeat(5-e.rating)}</div>
                    <div class="biz-review-date">${e.date}</div>
                </div>
            </div>
            <div class="biz-review-text">${e.text}</div>
        </div>
    `).join(``))}function h(e){let t=document.getElementById(`bizAboutContent`);if(!t)return;let r=[];r.push(`
        <div class="biz-about-section">
            <h3><i data-lucide="info"></i>O podjetju</h3>
            <p class="biz-about-text">${e.description}</p>
        </div>
    `),e.offersLeasing&&e.leasingPartners.length>0&&r.push(`
            <div class="biz-about-section">
                <h3><i data-lucide="landmark"></i>Leasing partnerji</h3>
                <div class="biz-leasing-partners">
                    ${e.leasingPartners.map(e=>`<span class="biz-leasing-tag">✓ ${e}</span>`).join(``)}
                </div>
            </div>
        `),e.authorizedBrands.length>0&&r.push(`
            <div class="biz-about-section">
                <h3><i data-lucide="award"></i>Pooblaščene znamke</h3>
                <div class="biz-brands-row">
                    ${e.authorizedBrands.map(e=>`<span class="biz-brand-tag authorized">${e}</span>`).join(``)}
                </div>
            </div>
        `);let i=n(e);r.push(`
        <div class="biz-about-section">
            <h3><i data-lucide="map-pin"></i>Kontakt & lokacija</h3>
            <p class="biz-about-text">
                <strong>Naslov:</strong> ${e.contact.address}<br/>
                <strong>Telefon:</strong> <a href="tel:${e.contact.phone}" style="color:var(--color-primary-start);">${e.contact.phone}</a><br/>
                <strong>E-pošta:</strong> <a href="mailto:${e.contact.email}" style="color:var(--color-primary-start);">${e.contact.email}</a><br/>
                <strong>Tip:</strong> ${i.join(`, `)}
            </p>
        </div>
    `),t.innerHTML=r.join(``)}function g(){console.log(`[BusinessProfile] init`);let e=document.getElementById(`bizProfileLoading`),t=document.getElementById(`bizProfileError`),n=document.getElementById(`bizProfileContent`),i=window.location.hash.match(/[?&]id=([^&]+)/),c=i?i[1]:null;if(!c){e.style.display=`none`,t.style.display=`block`;return}let u=r(c);if(!u){e.style.display=`none`,t.style.display=`block`;return}e.style.display=`none`,n.style.display=`block`,a(u),o(u),s(u),l(u),f(u),m(u),h(u),window.lucide&&window.lucide.createIcons()}export{g as initBusinessProfilePage};