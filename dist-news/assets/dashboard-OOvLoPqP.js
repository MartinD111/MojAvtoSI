import{r as e}from"./chunk-QTnfLwEv.js";import{a as t,t as n}from"./i18n-BZd20ht-.js";import{c as r,n as i}from"./listingService-CHYpX_DS.js";import{r as a}from"./businesses-BB2P-O_3.js";import{a as o,c as s,i as c,r as l,t as u}from"./browser-DJ0F6Jf2.js";var d=e(u(),1);function f(e){if(!e)return!1;let t=window.__currentUserProfile||{};return t.businessTier===`verified`||t.role===`mechanic`}async function p(){let e=document.getElementById(`app-container`);if(!e)return;let n=window.__currentUser;if(!n){window.location.hash=`/prijava`;return}e.innerHTML=`
    <div class="dashboard-page" style="max-width:900px;margin:2rem auto;padding:0 1rem;">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
        ${n.photoURL?`<img src='`+n.photoURL+`' style='width:56px;height:56px;border-radius:50%;object-fit:cover;' />`:`<div style='width:56px;height:56px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;font-size:1.5rem;'>👤</div>`}
        <div>
          <h1 style="margin:0;font-size:1.5rem;font-weight:700;">${t(`dashboard_welcome_user`,{name:n.displayName||`User`})}</h1>
          <p style="margin:0;color:#6b7280;font-size:0.9rem;">${n.email}</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
        <a href="#/novi-oglas" class="dashboard-card dashboard-card-new-listing">
          <span class="card-icon">➕</span>
          <span class="card-title">${t(`dashboard_post_listing`)}</span>
          <span class="card-desc">${t(`dashboard_post_new_vehicle`)}</span>
        </a>
        <a href="#/garaža" class="dashboard-card dashboard-card-garage">
          <span class="card-icon">🏎️</span>
          <span class="card-title">${t(`my_garage`)}</span>
          <span class="card-desc">${t(`dashboard_manage_vehicles`)}</span>
        </a>
        <a href="#/primerjava" class="dashboard-card dashboard-card-compare">
          <span class="card-icon">⚖️</span>
          <span class="card-title">${t(`compare_corner`)}</span>
          <span class="card-desc">${t(`dashboard_compare_selected`)}</span>
        </a>
        <a href="#/profil" class="dashboard-card dashboard-card-profile">
          <span class="card-icon">👤</span>
          <span class="card-title">${t(`my_profile`)}</span>
          <span class="card-desc">${t(`dashboard_edit_details`)}</span>
        </a>
        ${f(n)?`
        <a href="#/servis/vnos" class="dashboard-card dashboard-card-service">
          <span class="card-icon">🔧</span>
          <span class="card-title">${t(`dashboard_service_record`)}</span>
          <span class="card-desc">${t(`dashboard_add_service_entry`)}</span>
        </a>`:``}
      </div>

      <div class="dashboard-section">
        <h2>📋 ${t(`dashboard_my_active_listings`)}</h2>
        <div id="user-listings-container" style="min-height: 100px;">
          <div style="text-align:center;padding:2rem;color:#9ca3af;">
            <i class="fas fa-spinner fa-spin" style="font-size:2rem;margin-bottom:0.5rem;"></i>
            <p style="margin:0;font-size:0.9rem;">${t(`dashboard_loading_listings`)}</p>
          </div>
        </div>
      </div>

      <!-- Reservations section -->
      <div class="dashboard-section" id="bookings-section">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
          <h2 style="margin:0;">📅 ${t(`dashboard_my_bookings`)}</h2>
          <a href="#/zemljevid" style="font-size:0.85rem;font-weight:700;color:#2563eb;text-decoration:none;padding:8px 16px;background:rgba(37,99,235,0.1);border-radius:9999px;transition:all 0.2s;" onmouseover="this.style.background='rgba(37,99,235,0.2)'" onmouseout="this.style.background='rgba(37,99,235,0.1)'">+ ${t(`dashboard_new_booking`)}</a>
        </div>
        <div id="bookings-container">
          <div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.85rem;">${t(`dashboard_loading_bookings`)}</div>
        </div>
      </div>

      <!-- Service history section -->
      <div class="dashboard-section" id="service-history-section">
        <h2 style="margin:0 0 1rem;">🔧 ${t(`dashboard_service_book`)}</h2>
        <div id="service-history-container">
          <div style="text-align:center;padding:1.5rem;color:#9ca3af;font-size:0.85rem;">${t(`dashboard_loading_service_history`)}</div>
        </div>
      </div>

    </div>
  `;let i=document.getElementById(`user-listings-container`);try{let e=await r(n.uid);if(e.length===0)i.innerHTML=`
        <div style="text-align:center;padding:2rem;color:#9ca3af;">
          <div style="font-size:2rem;margin-bottom:0.5rem;">📋</div>
          <p style="margin:0;font-size:0.9rem;">${t(`dashboard_no_listings_yet`)}</p>
          <a href="#/novi-oglas" style="display:inline-block;margin-top:1rem;padding:12px 28px;background:linear-gradient(135deg, #f97316, #ea580c);color:#fff;border-radius:9999px;text-decoration:none;font-size:0.95rem;font-weight:700;box-shadow:0 10px 15px -3px rgba(249,115,22,0.3);transition:all 0.3s ease;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 20px -3px rgba(249,115,22,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 10px 15px -3px rgba(249,115,22,0.3)'">${t(`dashboard_post_first_listing`)}</a>
        </div>
      `;else{let n=`<div style="display:flex;flex-direction:column;gap:1rem;">`;e.forEach(e=>{let r=e.images?.exterior?.[0]||`https://via.placeholder.com/150?text=Ni+slike`,i=e.priceEur??e.price,a=i?new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(i):`—`,o=e.mileageKm??e.mileage,s=e.status===`sold`;n+=`
          <div class="dashboard-item-card" style="${s?`opacity:0.6;`:``}">
              <div style="position:relative;flex-shrink:0;">
                  <img src="${r}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;" alt="${e.title}">
                  ${s?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);border-radius:6px;"><span style="color:#fff;font-size:0.7rem;font-weight:800;letter-spacing:0.05em;background:#16a34a;padding:2px 8px;border-radius:9999px;">PRODANO</span></div>`:``}
              </div>
              <div style="flex:1;">
                  <h3>${e.make} ${e.model} ${e.variant||e.type||``}</h3>
                  <div class="item-specs">
                      <span>${e.year}</span>
                      <span>${o?new Intl.NumberFormat(`sl-SI`).format(Math.round(o))+` km`:``}</span>
                      <span>${e.fuel}</span>
                  </div>
              </div>
              <div style="text-align:right;">
                  <div style="font-weight:700;font-size:1.2rem;color:${s?`#16a34a`:`#f97316`};margin-bottom:0.5rem;">${s?`Prodano ✓`:a}</div>
                  ${s?``:`
                  <div style="display:flex;gap:0.5rem;justify-content:flex-end;flex-wrap:wrap;">
                      <a href="#/novi-oglas?edit=${e.id}" class="btn btn-outline btn-sm" style="border-color:#f97316;color:#f97316;">✎ Uredi</a>
                      <button class="btn btn-outline btn-sm print-listing-btn" data-id="${e.id}" style="border-color:#3b82f6;color:#3b82f6;" title="${t(`dashboard_print_sheet`)}">🖨️ ${t(`dashboard_print_sheet`)}</button>
                      <button class="btn btn-outline btn-sm delete-listing-btn" data-id="${e.id}" data-title="${e.make} ${e.model}">${t(`remove`)}</button>
                  </div>`}
              </div>
          </div>
        `}),n+=`</div>`,i.innerHTML=n,i.querySelectorAll(`.delete-listing-btn`).forEach(e=>{e.addEventListener(`click`,e=>{h(e.target.getAttribute(`data-id`),e.target.getAttribute(`data-title`)||`this listing`)})}),i.querySelectorAll(`.print-listing-btn`).forEach(t=>{t.addEventListener(`click`,t=>{let n=t.currentTarget.getAttribute(`data-id`),r=e.find(e=>e.id===n);r&&m(r)})})}}catch(e){console.error(`Error loading user listings:`,e),i.innerHTML=`<p style="color:red;text-align:center;">Error loading listings.</p>`}g(n.uid),_(n.uid)}async function m(e){let n=e.images?.exterior?.[0]||``,r=e.priceEur??e.price,i=r?new Intl.NumberFormat(`sl-SI`,{style:`currency`,currency:`EUR`,maximumFractionDigits:0}).format(r):`—`,a=e.mileageKm??e.mileage;document.getElementById(`print-title`).textContent=`${e.make} ${e.model} ${e.variant||e.type||``}`.trim(),document.getElementById(`print-price`).textContent=i,document.getElementById(`print-image`).src=n,document.getElementById(`print-year`).textContent=e.year||`—`,document.getElementById(`print-mileage`).textContent=a?new Intl.NumberFormat(`sl-SI`).format(Math.round(a))+` km`:`—`,document.getElementById(`print-fuel`).textContent=e.fuel||`—`,document.getElementById(`print-transmission`).textContent=e.transmission||`—`,document.getElementById(`print-power`).textContent=e.power?t(`hp_val`,{val:Math.round(e.power*1.34102)}):`—`;let o=`${window.location.origin}/#/oglas/${e.id}?src=qr_print`,s=document.getElementById(`print-qr-canvas`);try{await d.toCanvas(s,o,{width:200,margin:1})}catch(e){console.error(`QR generation failed:`,e)}window.print()}function h(e,n){let r=document.createElement(`div`);r.style.cssText=`position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(8px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1.5rem;`,r.innerHTML=`
        <div style="background:white;border-radius:2rem;padding:2rem;max-width:380px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,0.18);text-align:center;animation:agCardIn 0.3s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="font-size:2rem;margin-bottom:0.75rem;">🗑️</div>
            <h3 style="font-size:1.1rem;font-weight:800;color:#0f172a;margin:0 0 0.4rem;">${t(`dashboard_remove_listing_title`)}</h3>
            <p style="font-size:0.875rem;color:#64748b;margin:0 0 1.5rem;">"${n}"</p>
            <p style="font-size:0.82rem;color:#475569;margin:0 0 1.5rem;font-weight:500;">${t(`confirm_delete_listing`)}</p>
            <div style="display:flex;flex-direction:column;gap:0.6rem;">
                <button id="removeSoldBtn" style="padding:0.75rem 1rem;border:none;border-radius:1rem;background:linear-gradient(135deg,#16a34a,#15803d);color:white;font-size:0.9rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(22,163,74,0.3);">
                    ✅ ${t(`dashboard_sold_vehicle_confirm`)}
                </button>
                <button id="removeOnlyBtn" style="padding:0.75rem 1rem;border:2px solid #e2e8f0;border-radius:1rem;background:white;color:#334155;font-size:0.9rem;font-weight:700;font-family:'Inter',sans-serif;cursor:pointer;">
                    ${t(`dashboard_just_remove_listing`)}
                </button>
                <button id="removeCancelBtn" style="padding:0.6rem;border:none;background:none;color:#94a3b8;font-size:0.85rem;font-weight:600;font-family:'Inter',sans-serif;cursor:pointer;">
                    ${t(`cancel`)}
                </button>
            </div>
        </div>
    `,document.body.appendChild(r);let a=()=>r.remove();r.querySelector(`#removeCancelBtn`).addEventListener(`click`,a),r.addEventListener(`click`,e=>{e.target===r&&a()});let o=async t=>{let n=r.querySelectorAll(`button`);n.forEach(e=>{e.disabled=!0});try{await i(e,t?`sold`:`removed`),a(),p()}catch(e){console.error(`Delete failed:`,e),n.forEach(e=>{e.disabled=!1})}};r.querySelector(`#removeSoldBtn`).addEventListener(`click`,()=>o(!0)),r.querySelector(`#removeOnlyBtn`).addEventListener(`click`,()=>o(!1))}function g(e){let r=document.getElementById(`bookings-container`);if(!r)return;let i=o(e);if(i.length===0){r.innerHTML=`
            <div style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:0.85rem;">
                <div style="font-size:1.75rem;margin-bottom:0.5rem;">📅</div>
                ${t(`dashboard_no_bookings_yet`)}
                <br><a href="#/zemljevid" style="color:#2563eb;font-weight:600;font-size:0.82rem;">${t(`dashboard_find_service_shop`)}</a>
            </div>`;return}r.innerHTML=[...i].sort((e,t)=>{let n={pending:0,confirmed:1,completed:2,cancelled:3};return n[e.status]===n[t.status]?t.date?.localeCompare(e.date):n[e.status]-n[t.status]}).map(r=>{let{label:i,cls:o}=s(r.status),l=r.services.map(e=>a[e]||e).join(` · `),u={"status-pending":{bg:`#fffbeb`,color:`#d97706`,border:`#fde68a`},"status-confirmed":{bg:`#eff6ff`,color:`#2563eb`,border:`#bfdbfe`},"status-completed":{bg:`#f0fdf4`,color:`#16a34a`,border:`#bbf7d0`},"status-cancelled":{bg:`#fef2f2`,color:`#dc2626`,border:`#fecaca`}}[o]||{bg:`#f8fafc`,color:`#64748b`,border:`#e2e8f0`};return`
        <div class="dashboard-booking-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.5rem;">
                <span style="font-size:0.7rem;font-weight:700;padding:0.2rem 0.65rem;border-radius:9999px;background:${u.bg};color:${u.color};border:1px solid ${u.border};">${i}</span>
                <span style="font-size:0.75rem;color:#94a3b8;font-weight:500;">${c(r.date)} ob ${r.time||``}</span>
            </div>
            <div class="booking-title">${r.businessName||`Unknown business`}</div>
            <div class="booking-services">${l}</div>
            <div style="font-size:0.75rem;color:#94a3b8;">${r.vehicleLabel||``}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.65rem;flex-wrap:wrap;gap:0.5rem;">
                <span class="booking-price">${r.totalPrice>0?(n()===`en`?`$`:`€`)+r.totalPrice:t(`dashboard_quote_on_inspection`)}</span>
                ${r.status===`pending`||r.status===`confirmed`?`<button onclick="window._cancelBooking('${r.id}','${e}')" class="btn-cancel">${t(`cancel`)}</button>`:``}
            </div>
        </div>`}).join(``),window._cancelBooking=(e,n)=>{confirm(t(`dashboard_cancel_booking_confirm`))&&(l(n,e),g(n),_(n))}}function _(e){let r=document.getElementById(`service-history-container`);if(!r)return;let i=o(e).filter(e=>e.status===`completed`);if(i.length===0){r.innerHTML=`
            <div style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:0.85rem;">
                <div style="font-size:1.75rem;margin-bottom:0.5rem;">🔧</div>
                ${t(`dashboard_service_book_empty`)}
            </div>`;return}r.innerHTML=[...i].sort((e,t)=>t.date?.localeCompare(e.date)).map(e=>{let r=e.services.map(e=>a[e]||e).join(` · `);return`
        <div class="dashboard-booking-card" style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
            <div style="width:40px;height:40px;border-radius:0.75rem;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">✓</div>
            <div style="flex:1;min-width:0;">
                <div class="booking-title" style="margin-bottom:0.15rem;">${e.businessName||`Unknown business`}</div>
                <div class="booking-services">${r}</div>
                <div style="font-size:0.72rem;color:#94a3b8;margin-top:0.1rem;">${e.vehicleLabel||``} · ${c(e.date)}</div>
            </div>
            <div style="font-size:0.9rem;font-weight:800;color:#16a34a;flex-shrink:0;">${e.totalPrice>0?(n()===`en`?`$`:`€`)+e.totalPrice:t(`dashboard_quote_on_inspection`)}</div>
        </div>`}).join(``)}export{p as initDashboardPage};