import{d as e,n as t}from"./firebase-D04QZ5MM.js";import{t as n}from"./serviceBookService-Dwa7rl6z.js";var r=[{value:`mali_servis`,label:`Minor Service`},{value:`veliki_servis`,label:`Major Service`},{value:`popravilo`,label:`Repair`},{value:`pnevmatike`,label:`Tires`},{value:`drugo`,label:`Other`}];function i(e){if(!e)return!1;let t=window.__currentUserProfile||{};return t.businessTier===`verified`||t.role===`mechanic`||e.email?.endsWith(`@mojavto.si`)}function a(){let n=document.getElementById(`service-entry-page`);n&&e(t,e=>{if(!i(e)){o(n);return}s(n,e)})}function o(e){e.innerHTML=`
        <div style="max-width:480px;margin:4rem auto;text-align:center;padding:2rem;">
            <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
            <h2 style="font-size:1.3rem;font-weight:800;color:#1e293b;margin:0 0 0.5rem;">Access Denied</h2>
            <p style="color:#64748b;margin:0 0 1.5rem;">This page is accessible only to verified workshops and mechanics.</p>
            <a href="#/dashboard" style="display:inline-block;padding:0.7rem 1.5rem;background:var(--color-primary-start);color:#fff;border-radius:0.75rem;text-decoration:none;font-weight:600;">← Back to Dashboard</a>
        </div>`}function s(e,t){e.innerHTML=`
        <div class="se-container">
            <div class="se-card glass-card">
                <div class="se-card-header">
                    <i data-lucide="wrench"></i>
                    <h1 class="se-title">Digital Service Record Entry</h1>
                </div>
                <p class="se-subtitle">Entered data is permanently linked to the vehicle's VIN number.</p>

                <form id="serviceEntryForm" class="se-form" novalidate>
                    <div class="se-field">
                        <label for="se-vin">VIN Number <span class="se-required">*</span></label>
                        <input id="se-vin" type="text" maxlength="17" placeholder="e.g. WBA3A5G59DNP26082" required />
                    </div>
                    <div class="se-row">
                        <div class="se-field">
                            <label for="se-date">Service Date <span class="se-required">*</span></label>
                            <input id="se-date" type="date" required />
                        </div>
                        <div class="se-field">
                            <label for="se-mileage">Odometer Reading (mi)</label>
                            <input id="se-mileage" type="number" min="0" placeholder="e.g. 77400" />
                        </div>
                    </div>
                    <div class="se-field">
                        <label for="se-type">Service Type <span class="se-required">*</span></label>
                        <select id="se-type" required>
                            ${r.map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
                        </select>
                    </div>
                    <div class="se-field">
                        <label for="se-desc">Description of Work Performed</label>
                        <textarea id="se-desc" rows="4" placeholder="Oil change, filters, brake inspection..."></textarea>
                    </div>
                    <div id="se-error" class="se-error" style="display:none;"></div>
                    <button type="submit" class="se-submit-btn" id="seSubmitBtn">
                        <i data-lucide="save"></i>
                        Save Record
                    </button>
                </form>

                <div id="se-toast" class="se-toast" style="display:none;"></div>
            </div>
        </div>`,window.lucide&&window.lucide.createIcons();let i=document.getElementById(`serviceEntryForm`);i.addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`seSubmitBtn`),a=document.getElementById(`se-error`),o=document.getElementById(`se-vin`).value.trim(),s=document.getElementById(`se-date`).value,u=document.getElementById(`se-mileage`).value,d=document.getElementById(`se-type`).value,f=document.getElementById(`se-desc`).value.trim();if(a.style.display=`none`,!o){c(a,`VIN number is required.`);return}if(o.length<5){c(a,`VIN number must be at least 5 characters.`);return}if(!s){c(a,`Service date is required.`);return}r.disabled=!0,r.textContent=`Saving...`;try{await n({vin:o,date:s,mileage:u||null,serviceType:d,description:f,mechanicId:t.uid,mechanicName:t.displayName||t.email||`Service`}),l(`✅ Record saved successfully!`),i.reset()}catch(e){console.error(`[ServiceEntry]`,e),c(a,`An error occurred. Please try again.`)}finally{r.disabled=!1,r.innerHTML=`<i data-lucide="save"></i> Save Record`,window.lucide&&window.lucide.createIcons()}})}function c(e,t){e.textContent=t,e.style.display=`block`}function l(e){let t=document.getElementById(`se-toast`);t&&(t.textContent=e,t.style.display=`block`,setTimeout(()=>{t.style.display=`none`},3500))}export{a as initServiceEntryPage};