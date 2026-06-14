import{t as e}from"./storageKeys-BraFEh3o.js";var t=[{key:`year`,label:`Letnik`,icon:`calendar`},{key:`mileage`,label:`Prevoženi km`,icon:`gauge`},{key:`power`,label:`Moč`,icon:`settings-2`},{key:`fuel`,label:`Gorivo`,icon:`fuel`},{key:`transmission`,label:`Menjalnik`,icon:`cog`},{key:`consumption`,label:`Poraba`,icon:`droplets`},{key:`owners`,label:`Število lastnikov`,icon:`users`},{key:`location`,label:`Lokacija`,icon:`map-pin`},{key:`seller`,label:`Prodajalec`,icon:`user`},{key:`engineType`,label:`Tip motorja`,icon:`cpu`,motoOnly:!0},{key:`engineStroke`,label:`Takt motorja`,icon:`activity`,motoOnly:!0}],n=e(`compare_fields`),r=[`year`,`mileage`,`power`,`fuel`,`location`,`seller`];function i(){try{let e=localStorage.getItem(n);if(e)return JSON.parse(e)}catch{}return r}function a(e){localStorage.setItem(n,JSON.stringify(e))}function o(){console.log(`[ComparePage] init`),s()}function s(){let n=document.getElementById(`compareContent`);if(!n)return;let r=JSON.parse(localStorage.getItem(e(`compare`))||`[]`);if(r.length===0){n.innerHTML=`
            <div class="compare-empty">
                <i data-lucide="scale" class="compare-empty-icon"></i>
                <h2>Niste izbrali nobenega vozila za primerjavo</h2>
                <p>Pojdite na oglasno desko in pri oglasih kliknite na ikono tehtnice, da jih dodate v primerjavo.</p>
                <a href="#/oglasi"><i data-lucide="search" style="width:16px;height:16px;"></i> Pojdi na oglase</a>
            </div>
        `,window.lucide&&window.lucide.createIcons();return}let a=i(),o=`<div class="compare-grid ${r.length===2?`cols-2`:r.length===3?`cols-3`:`cols-2`}">`;r.forEach(e=>{let n=e.priceRating||{score:2,label:`Povprečna cena`,color:`amber`},r=t.filter(e=>a.includes(e.key)).map(t=>`
                <div class="compare-spec-row">
                    <span class="compare-spec-label"><i data-lucide="${t.icon}"></i> ${t.label}</span>
                    <span class="compare-spec-value">${e[t.key]||`—`}</span>
                </div>`).join(``);o+=`
        <div class="compare-col" data-compare-id="${e.id}">
            <div class="compare-col-img">
                <img src="${e.image}" alt="${e.title}" loading="lazy">
            </div>
            <div class="compare-col-header">
                <h2 class="compare-col-title">${e.title}</h2>
                <p class="compare-col-subtitle">${e.subtitle||``}</p>
                <div class="compare-col-price-row">
                    <span class="compare-col-price">${e.price||`—`}</span>
                    <span class="price-rating rating-${n.color}">${n.label}</span>
                </div>
            </div>
            <div class="compare-specs">${r}</div>
            <div class="compare-col-footer">
                <button class="compare-remove-btn" data-remove-id="${e.id}">
                    <i data-lucide="x"></i> Odstrani
                </button>
                <button class="compare-contact-btn">
                    <i data-lucide="mail"></i> Kontakt
                </button>
            </div>
        </div>`}),o+=`</div>`,o+=`
        <div class="compare-actions">
            <button class="compare-clear-all" id="clearAllCompare">Počisti vse</button>
            <button class="compare-edit-fields-btn" id="editFieldsBtn">
                <i data-lucide="sliders-horizontal" style="width:16px;height:16px;"></i> Uredi polja
            </button>
            ${r.length<3?`<a href="#/oglasi" class="compare-add-more"><i data-lucide="plus" style="width:16px;height:16px;"></i> Dodaj vozilo</a>`:``}
        </div>
    `,o+=c(a,r),n.innerHTML=o,window.lucide&&window.lucide.createIcons(),n.querySelectorAll(`.compare-remove-btn`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.getAttribute(`data-remove-id`),r=JSON.parse(localStorage.getItem(e(`compare`))||`[]`);r=r.filter(e=>e.id!==n),localStorage.setItem(e(`compare`),JSON.stringify(r)),window.updateHeaderCompare&&window.updateHeaderCompare(),s()})});let u=document.getElementById(`clearAllCompare`);u&&u.addEventListener(`click`,()=>{localStorage.setItem(e(`compare`),JSON.stringify([])),window.updateHeaderCompare&&window.updateHeaderCompare(),s()}),l(n)}function c(e,n){let r=n.some(e=>e.category===`moto`);return`
        <div class="cfe-backdrop" id="cfeBackdrop" style="display:none;">
            <div class="cfe-modal" role="dialog" aria-modal="true" aria-label="Uredi prikazana polja">
                <div class="cfe-modal-header">
                    <span class="cfe-modal-title">Prikazana polja</span>
                    <button class="cfe-close-btn" id="cfeClose" aria-label="Zapri">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="cfe-field-list">${t.filter(e=>!e.motoOnly||r).map(t=>`
        <label class="cfe-field-row">
            <input type="checkbox" class="cfe-checkbox" value="${t.key}" ${e.includes(t.key)?`checked`:``}>
            <i data-lucide="${t.icon}" class="cfe-field-icon"></i>
            <span>${t.label}</span>
            <span class="cfe-toggle" aria-hidden="true"></span>
        </label>`).join(``)}</div>
                <div class="cfe-modal-footer">
                    <button class="cfe-reset-btn" id="cfeReset">Privzeto</button>
                    <button class="cfe-save-btn" id="cfeSave">Shrani</button>
                </div>
            </div>
        </div>
    `}function l(e){let t=e.querySelector(`#cfeBackdrop`),n=e.querySelector(`#editFieldsBtn`),i=e.querySelector(`#cfeClose`),o=e.querySelector(`#cfeSave`),c=e.querySelector(`#cfeReset`),l=()=>{t.style.display=`flex`,window.lucide&&window.lucide.createIcons()},u=()=>{t.style.display=`none`};n.addEventListener(`click`,l),i.addEventListener(`click`,u),t.addEventListener(`click`,e=>{e.target===t&&u()}),o.addEventListener(`click`,()=>{a([...e.querySelectorAll(`.cfe-checkbox:checked`)].map(e=>e.value)),u(),s()}),c.addEventListener(`click`,()=>{e.querySelectorAll(`.cfe-checkbox`).forEach(e=>{e.checked=r.includes(e.value)})})}export{o as initComparePage};