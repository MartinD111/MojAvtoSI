import{t as e}from"./storageKeys-BraFEh3o.js";import{a as t}from"./i18n-BZd20ht-.js";import{C as n,D as r}from"./adminService-cyoOq016.js";import{t as i}from"./viewport-DsxeKZ-2.js";import{a,c as o,i as s,n as c,r as l,s as u}from"./garageService-BlDALu--.js";async function d(){let e=document.getElementById(`app-container`);if(!e)return;let d=window.__currentUser;if(!d){window.location.hash=`/prijava`;return}e.innerHTML=`
    <div style="max-width:900px;margin:2rem auto;padding:0 1rem;">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
        ${d.photoURL?`<img src="${d.photoURL}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;" />`:`<div style="width:56px;height:56px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">👤</div>`}
        <div>
          <h1 style="margin:0;font-size:1.5rem;font-weight:700;">${d.displayName||t(`profile_user_fallback`)}</h1>
          <p style="margin:0;color:#6b7280;font-size:0.9rem;">${d.email}</p>
        </div>
      </div>

      <!-- Moja garaža -->
      <div class="profile-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <h2>${t(`profile_my_garage`)}</h2>
          <button id="btn-add-vehicle" style="font-size:0.85rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#2563eb,#4f46e5);border:none;padding:8px 20px;border-radius:9999px;cursor:pointer;transition:all 0.2s;">${t(`profile_add_vehicle`)}</button>
        </div>

        <!-- Add/edit form (hidden by default) -->
        <div id="vehicle-form-wrap" style="display:none;margin-bottom:1.5rem;">
          <div class="profile-form-container">
            <h3 id="vehicle-form-title">${t(`profile_new_vehicle`)}</h3>
            <form id="vehicle-form" style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <div style="grid-column:1/-1;">
                <label>${t(`profile_nickname_label`)}</label>
                <input id="vf-nickname" type="text" placeholder="${t(`profile_nickname_placeholder`)}">
              </div>

              <div>
                <label>${t(`profile_make_label`)}</label>
                <select id="vf-make" required>
                  <option value="">${t(`profile_select_make`)}</option>
                </select>
              </div>
              <div>
                <label>${t(`profile_model_label`)}</label>
                <select id="vf-model" required>
                  <option value="">${t(`profile_select_make_first`)}</option>
                </select>
              </div>

              <div>
                <label>${t(`profile_year_label`)}</label>
                <input id="vf-year" type="number" min="1950" max="2026" required placeholder="${t(`profile_year_placeholder`)}">
              </div>
              <div>
                <label>${t(`profile_fuel_label`)}</label>
                <select id="vf-fuel">
                  <option value="">${t(`profile_select_generic`)}</option>
                  <option value="Petrol">${t(`profile_fuel_petrol`)}</option>
                  <option value="Dizel">${t(`profile_fuel_diesel`)}</option>
                  <option value="Električni">${t(`profile_fuel_electric`)}</option>
                  <option value="Hibrid">${t(`profile_fuel_hybrid`)}</option>
                  <option value="Plug-in hibrid">${t(`profile_fuel_plugin_hybrid`)}</option>
                  <option value="LPG">${t(`profile_fuel_lpg`)}</option>
                  <option value="CNG">${t(`profile_fuel_cng`)}</option>
                </select>
              </div>

              <div>
                <label>${t(`profile_plate_label`)}</label>
                <input id="vf-plate" type="text" placeholder="${t(`profile_plate_placeholder`)}" style="text-transform:uppercase;">
              </div>
              <div>
                <label>${t(`profile_mileage_label`)}</label>
                <input id="vf-km" type="number" min="0" placeholder="${t(`profile_mileage_placeholder`)}">
              </div>

              <!-- Tire section -->
              <div style="grid-column:1/-1;margin-top:0.5rem;">
                <div style="border-top:1.5px solid rgba(255,255,255,0.1);padding-top:1rem;">
                  <h4 style="margin:0 0 0.75rem;font-size:0.9rem;font-weight:700;">${t(`profile_tires_title`)}</h4>
                </div>
              </div>

              <div style="grid-column:1/-1;">
                <label>${t(`profile_current_tire_type`)}</label>
                <select id="vf-tire-season">
                  <option value="">${t(`profile_select_generic`)}</option>
                  <option value="letne">${t(`profile_tire_summer`)}</option>
                  <option value="zimske">${t(`profile_tire_winter`)}</option>
                  <option value="celoletne">${t(`profile_tire_all_season`)}</option>
                </select>
              </div>

              <!-- Letne pnevmatike -->
              <div style="grid-column:1/-1;">
                <p style="font-size:0.78rem;font-weight:700;color:#f59e0b;margin:0.5rem 0 0.4rem;">${t(`profile_summer_tires_label`)}</p>
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_width`)}</label>
                <input id="vf-summer-width" type="number" placeholder="205">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_profile`)}</label>
                <input id="vf-summer-profile" type="number" placeholder="55">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_rim`)}</label>
                <input id="vf-summer-rim" type="number" placeholder="16">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_brand`)}</label>
                <input id="vf-summer-brand" type="text" placeholder="Michelin">
              </div>

              <!-- Zimske pnevmatike -->
              <div style="grid-column:1/-1;">
                <p style="font-size:0.78rem;font-weight:700;color:#3b82f6;margin:0.5rem 0 0.4rem;">${t(`profile_winter_tires_label`)}</p>
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_width`)}</label>
                <input id="vf-winter-width" type="number" placeholder="195">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_profile`)}</label>
                <input id="vf-winter-profile" type="number" placeholder="65">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_rim`)}</label>
                <input id="vf-winter-rim" type="number" placeholder="15">
              </div>
              <div>
                <label style="font-size:0.75rem;display:block;margin-bottom:3px;">${t(`profile_tire_brand`)}</label>
                <input id="vf-winter-brand" type="text" placeholder="Continental">
              </div>

              <!-- Buttons -->
              <div style="grid-column:1/-1;display:flex;gap:0.75rem;margin-top:0.5rem;">
                <button type="submit" id="vf-submit" style="flex:1;padding:10px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;border:none;border-radius:0.75rem;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:inherit;">${t(`profile_save_vehicle`)}</button>
                <button type="button" id="vf-cancel" style="padding:10px 20px;background:#f1f5f9;color:#475569;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">${t(`profile_cancel`)}</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Vehicle list -->
        <div id="vehicles-container">
          <div style="text-align:center;padding:2rem;color:#9ca3af;">
            <i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i>
            <p style="margin:0.5rem 0 0;font-size:0.85rem;">${t(`profile_loading_vehicles`)}</p>
          </div>
        </div>
      </div>

      <!-- Shranjeni oglasi -->
      <div class="profile-card" style="margin-top:2rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <h2>❤️ ${t(`profile_liked_listings`)||`Shranjeni oglasi`}</h2>
        </div>
        <div id="liked-listings-container">
          <div style="text-align:center;padding:2rem;color:#9ca3af;">
            <i class="fas fa-spinner fa-spin" style="font-size:1.5rem;"></i>
            <p style="margin:0.5rem 0 0;font-size:0.85rem;">${t(`profile_loading_vehicles`)||`Nalagam...`}</p>
          </div>
        </div>
      </div>

      <!-- Nastavitve TCO -->
      <div class="profile-card" style="margin-top:2rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
          <div>
            <h2>💰 ${t(`tco_settings_title`)||`TCO Settings`}</h2>
            <p style="margin:0.25rem 0 0;color:#64748b;font-size:0.85rem;">
              ${t(`tco_settings_subtitle`)||`Configure your vehicle cost estimates`}
            </p>
          </div>
          <a href="#/nastavitve-tco" style="font-size:0.85rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#16a34a,#15803d);padding:8px 20px;border-radius:9999px;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
            ${t(`cl_edit`)||`Edit`}
          </a>
        </div>
        <p style="margin:0;font-size:0.82rem;color:#64748b;">
          ${t(`tco_settings_card_desc`)||`Adjust annual mileage, fuel prices, and other parameters to calculate the total cost of ownership (TCO) for vehicles.`}
        </p>
      </div>

      <!-- Back link -->
      <div style="text-align:center;margin-top:2rem;margin-bottom:1rem;">
        <a href="#/dashboard" class="profile-back-link" style="display:inline-block;font-size:0.9rem;font-weight:700;color:#fff;text-decoration:none;padding:11px 32px;background:#2563eb;border-radius:9999px;transition:background 0.2s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">${t(`profile_back_to_dashboard_link`)}</a>
      </div>
    </div>
    `;let _=document.getElementById(`vf-make`),v=document.getElementById(`vf-model`),y=[];try{y=await n(`avto`),y.forEach(e=>{let t=document.createElement(`option`);t.value=e.name,t.textContent=e.name,t.dataset.brandId=e.id,_.appendChild(t)})}catch(e){console.error(`[Profile] Failed to load brands:`,e),_.insertAdjacentHTML(`afterend`,`<input id="vf-make-text" type="text" placeholder="${t(`profile_enter_make`)}" style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:0.75rem;font-size:0.9rem;font-family:inherit;margin-top:4px;">`)}_.addEventListener(`change`,async()=>{v.innerHTML=`<option value="">${t(`profile_loading_generic`)}</option>`;let e=y.find(e=>e.name===_.value);if(!e){v.innerHTML=`<option value="">${t(`profile_select_model`)}</option>`;return}try{let n=await r(e.id);v.innerHTML=`<option value="">${t(`profile_select_model`)}</option>`,n.forEach(e=>{let t=document.createElement(`option`);t.value=e.name,t.textContent=e.name,v.appendChild(t)})}catch{v.innerHTML=`<option value="">${t(`profile_enter_model`)}</option>`}});let b=document.getElementById(`vehicle-form-wrap`),x=document.getElementById(`vehicle-form`),S=null;document.getElementById(`btn-add-vehicle`).addEventListener(`click`,()=>{S=null,x.reset(),document.getElementById(`vehicle-form-title`).textContent=t(`profile_new_vehicle_title`),document.getElementById(`vf-submit`).textContent=t(`profile_save_vehicle`),b.style.display=`block`,i(b,{behavior:`smooth`,block:`nearest`})}),document.getElementById(`vf-cancel`).addEventListener(`click`,()=>{b.style.display=`none`,S=null}),x.addEventListener(`submit`,async e=>{e.preventDefault();let n=document.getElementById(`vf-submit`);n.disabled=!0,n.textContent=t(`profile_saving`);let r={nickname:document.getElementById(`vf-nickname`).value.trim(),make:_.value||document.getElementById(`vf-make-text`)?.value?.trim()||``,model:v.value||``,year:Number(document.getElementById(`vf-year`).value)||0,fuel:document.getElementById(`vf-fuel`).value,plate:document.getElementById(`vf-plate`).value.trim().toUpperCase(),mileageKm:Number(document.getElementById(`vf-km`).value)||0,tires:{currentSeason:document.getElementById(`vf-tire-season`).value,summer:{width:Number(document.getElementById(`vf-summer-width`).value)||null,profile:Number(document.getElementById(`vf-summer-profile`).value)||null,rim:Number(document.getElementById(`vf-summer-rim`).value)||null,brand:document.getElementById(`vf-summer-brand`).value.trim()},winter:{width:Number(document.getElementById(`vf-winter-width`).value)||null,profile:Number(document.getElementById(`vf-winter-profile`).value)||null,rim:Number(document.getElementById(`vf-winter-rim`).value)||null,brand:document.getElementById(`vf-winter-brand`).value.trim()}}};try{S?await o(d.uid,S,r):await c(d.uid,r),b.style.display=`none`,S=null,await C()}catch(e){console.error(`[Profile] Save vehicle error:`,e),alert(t(`profile_error_saving`))}finally{n.disabled=!1,n.textContent=t(S?`profile_update_vehicle`:`profile_save_vehicle`)}});async function C(){let e=document.getElementById(`vehicles-container`);try{let n=await a(d.uid);if(n.length===0){e.innerHTML=`
                    <div style="text-align:center;padding:2.5rem 1rem;color:#94a3b8;">
                        <div style="font-size:2.5rem;margin-bottom:0.5rem;">🚗</div>
                        <p style="margin:0;font-size:0.9rem;font-weight:500;">${t(`profile_garage_empty`)}</p>
                        <p style="margin:0.25rem 0 0;font-size:0.8rem;">${t(`profile_garage_empty_hint`)}</p>
                    </div>`;return}e.innerHTML=n.map(e=>{let n=f(e.tires),r=e.tires?.currentSeason?`<span style="font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:9999px;${p(e.tires.currentSeason)}">${m(e.tires.currentSeason)}</span>`:``;return`
                <div class="profile-vehicle-card">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
                        <div style="flex:1;min-width:0;">
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                                <span style="font-size:1.3rem;">🚗</span>
                                <h3>
                                    ${e.nickname||e.make+` `+e.model}
                                </h3>
                                ${r}
                            </div>
                            <p>
                                ${e.nickname?`${e.make} ${e.model}`:``}
                                ${e.year?(e.nickname?` · `:``)+t(`profile_year_label_short`)+` `+e.year:``}
                                ${e.fuel?` · `+h(e.fuel):``}
                                ${e.mileageKm?` · `+g(e.mileageKm)+` km`:``}
                            </p>
                            ${e.plate?`<p style="margin:0.15rem 0 0;font-size:0.78rem;color:#94a3b8;font-weight:600;letter-spacing:1px;">${e.plate}</p>`:``}
                            ${n?`<div style="margin-top:0.5rem;font-size:0.78rem;color:#475569;">${n}</div>`:``}
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-shrink:0;">
                            <button class="edit-vehicle-btn" data-id="${e.id}" style="padding:6px 14px;font-size:0.78rem;font-weight:600;border:1.5px solid #e2e8f0;background:#f8fafc;color:#475569;border-radius:0.5rem;cursor:pointer;font-family:inherit;">${t(`profile_edit`)}</button>
                            <button class="delete-vehicle-btn" data-id="${e.id}" style="padding:6px 14px;font-size:0.78rem;font-weight:600;border:1.5px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:0.5rem;cursor:pointer;font-family:inherit;">${t(`profile_delete`)}</button>
                        </div>
                    </div>
                </div>`}).join(``),e.querySelectorAll(`.edit-vehicle-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let r=n.find(t=>t.id===e.dataset.id);r&&(S=r.id,document.getElementById(`vehicle-form-title`).textContent=t(`profile_edit_vehicle_title`),document.getElementById(`vf-submit`).textContent=t(`profile_update_vehicle`),document.getElementById(`vf-nickname`).value=r.nickname||``,_.value=r.make||``,_.dispatchEvent(new Event(`change`)),setTimeout(()=>{v.value=r.model||``},500),document.getElementById(`vf-year`).value=r.year||``,document.getElementById(`vf-fuel`).value=r.fuel||``,document.getElementById(`vf-plate`).value=r.plate||``,document.getElementById(`vf-km`).value=r.mileageKm||``,document.getElementById(`vf-tire-season`).value=r.tires?.currentSeason||``,document.getElementById(`vf-summer-width`).value=r.tires?.summer?.width||``,document.getElementById(`vf-summer-profile`).value=r.tires?.summer?.profile||``,document.getElementById(`vf-summer-rim`).value=r.tires?.summer?.rim||``,document.getElementById(`vf-summer-brand`).value=r.tires?.summer?.brand||``,document.getElementById(`vf-winter-width`).value=r.tires?.winter?.width||``,document.getElementById(`vf-winter-profile`).value=r.tires?.winter?.profile||``,document.getElementById(`vf-winter-rim`).value=r.tires?.winter?.rim||``,document.getElementById(`vf-winter-brand`).value=r.tires?.winter?.brand||``,b.style.display=`block`,i(b,{behavior:`smooth`,block:`nearest`}))})}),e.querySelectorAll(`.delete-vehicle-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(confirm(t(`profile_confirm_delete`))){e.disabled=!0,e.textContent=t(`profile_deleting`);try{await l(d.uid,e.dataset.id),await C()}catch(n){console.error(`[Profile] Delete error:`,n),alert(t(`profile_error_deleting`)),e.disabled=!1,e.textContent=t(`profile_delete`)}}})})}catch(n){console.error(`[Profile] Load vehicles error:`,n),e.innerHTML=`<p style="color:#ef4444;text-align:center;font-size:0.85rem;">${t(`profile_error_loading`)}</p>`}}await C(),await w();async function w(){let e=document.getElementById(`liked-listings-container`);if(e)try{let n=await s(d.uid);if(n.length===0){e.innerHTML=`
                    <div style="text-align:center;padding:2.5rem 1rem;color:#94a3b8;">
                        <div style="font-size:2.5rem;margin-bottom:0.5rem;">❤️</div>
                        <p style="margin:0;font-size:0.9rem;font-weight:500;">${t(`profile_no_liked_listings`)||`Ni shranjenih oglasov`}</p>
                        <p style="margin:0.25rem 0 0;font-size:0.8rem;">${t(`profile_no_liked_hint`)||`Kliknite srce na oglasu, da ga shranite sem.`}</p>
                    </div>`;return}e.innerHTML=n.map(e=>{let n=e.priceEur??e.price,r=n?new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(n):``,i=e.image||``,a=e.title||e.listingId;return`
                <div class="profile-vehicle-card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                    ${i?`<img src="${i}" alt="${a}" style="width:90px;height:64px;object-fit:cover;border-radius:0.75rem;flex-shrink:0;">`:`<div style="width:90px;height:64px;border-radius:0.75rem;background:#f1f5f9;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🚗</div>`}
                    <div style="flex:1;min-width:0;">
                        <a href="#/oglas?id=${e.listingId}" style="font-size:0.95rem;font-weight:700;color:#0f172a;text-decoration:none;display:block;margin-bottom:0.2rem;">${a}</a>
                        ${r?`<span style="font-size:0.9rem;font-weight:700;color:#2563eb;">${r}</span>`:``}
                    </div>
                    <button class="remove-liked-btn" data-id="${e.listingId}" title="${t(`profile_remove_liked`)||`Odstrani`}" style="padding:6px 14px;font-size:0.78rem;font-weight:600;border:1.5px solid #fecaca;background:#fef2f2;color:#dc2626;border-radius:0.5rem;cursor:pointer;font-family:inherit;flex-shrink:0;">${t(`profile_remove_liked`)||`Odstrani`}</button>
                </div>`}).join(``),e.querySelectorAll(`.remove-liked-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{e.disabled=!0;try{await u(d.uid,e.dataset.id);try{let t=`ma_liked`,n=JSON.parse(localStorage.getItem(t)||`[]`);localStorage.setItem(t,JSON.stringify(n.filter(t=>t!==e.dataset.id)))}catch{}await w()}catch(t){console.error(`[Profile] Remove liked error:`,t),e.disabled=!1}})})}catch(n){console.error(`[Profile] Load liked listings error:`,n),e.innerHTML=`<p style="color:#ef4444;text-align:center;font-size:0.85rem;">${t(`profile_error_loading`)||`Napaka pri nalaganju.`}</p>`}}}function f(e){if(!e)return``;let n=[];if(e.summer?.width){let r=e.summer;n.push(`${t(`profile_summer_short`)} ${r.width}/${r.profile} R${r.rim}${r.brand?` (`+r.brand+`)`:``}`)}if(e.winter?.width){let r=e.winter;n.push(`${t(`profile_winter_short`)} ${r.width}/${r.profile} R${r.rim}${r.brand?` (`+r.brand+`)`:``}`)}return n.join(`<br>`)}function p(e){switch(e){case`letne`:return`background:#fef3c7;color:#d97706;border:1px solid #fde68a;`;case`zimske`:return`background:#dbeafe;color:#2563eb;border:1px solid #bfdbfe;`;case`celoletne`:return`background:#d1fae5;color:#059669;border:1px solid #a7f3d0;`;default:return`background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;`}}function m(e){switch(e){case`letne`:return t(`profile_tire_summer`);case`zimske`:return t(`profile_tire_winter`);case`celoletne`:return t(`profile_tire_all_season`);default:return e}}function h(e){if(!e)return``;switch(e){case`Petrol`:return t(`profile_fuel_petrol`);case`Dizel`:return t(`profile_fuel_diesel`);case`Električni`:return t(`profile_fuel_electric`);case`Hibrid`:return t(`profile_fuel_hybrid`);case`Plug-in hibrid`:return t(`profile_fuel_plugin_hybrid`);case`LPG`:return t(`profile_fuel_lpg`);case`CNG`:return t(`profile_fuel_cng`);default:return e}}function g(t){let n=(localStorage.getItem(e(`lang`))||`en`)===`sl`?`sl-SI`:`en-US`;return new Intl.NumberFormat(n).format(t)}export{d as initProfilePage};