import{a as e,o as t}from"./extensions-BVPcMrZL.js";import{t as n}from"./b2b-layout-DYP0LZVU.js";import{S as r,_ as i,p as a,s as o}from"./b2bService-CdqiS2V3.js";var s=[{key:`monday`,label:`Ponedeljek`},{key:`tuesday`,label:`Torek`},{key:`wednesday`,label:`Sreda`},{key:`thursday`,label:`Četrtek`},{key:`friday`,label:`Petek`},{key:`saturday`,label:`Sobota`},{key:`sunday`,label:`Nedelja`}];async function c(){let c=n({activeRoute:`/b2b/profil`,title:`Javni profil podjetja`});if(!c)return;let d=e(),f=t(),p=await o()||{},m=[];try{m=await a()}catch{}p={name:p.name||d?.companyDetails?.companyName||``,tagline:p.tagline||``,description:p.description||``,logo:p.logo||``,coverImage:p.coverImage||``,gallery:p.gallery||[],contact:{email:p.contact?.email||d?.email||``,phone:p.contact?.phone||d?.phone||``,address:p.contact?.address||d?.companyDetails?.address||``,website:p.contact?.website||``},social:{facebook:p.social?.facebook||``,instagram:p.social?.instagram||``,youtube:p.social?.youtube||``},workingHours:p.workingHours||s.reduce((e,t)=>({...e,[t.key]:``}),{}),brands:p.brands||``,certifications:p.certifications||``},c.innerHTML=`
        <div class="b2b-profile-editor-toolbar">
            <p class="b2b-hint">Javni profil je stran, ki jo vidijo stranke na MojAvto.si. Uredite podatke in kliknite <strong>Predogled</strong>, da vidite končni videz.</p>
            <div style="display:flex;gap:0.5rem;">
                <button id="previewFullBtn" class="btn b2b-btn-secondary"><i data-lucide="eye"></i> Predogled v živo</button>
                <button id="saveProfileBtn" type="submit" form="profileForm" class="btn b2b-btn-primary"><i data-lucide="save"></i> Shrani</button>
            </div>
        </div>

        <div class="b2b-profile-editor-grid">
            <!-- ── LEFT: FORM ─────────────────────────────────────── -->
            <form id="profileForm" class="b2b-form-stack">
                <!-- 1. BRANDING -->
                <section class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="image"></i> Grafična podoba</h2>
                    <div class="b2b-asset-row">
                        <div class="b2b-asset">
                            <label>Logotip <span class="b2b-field-hint">(kvadratni, min 400×400 px)</span></label>
                            <div class="b2b-asset-preview b2b-logo-preview">
                                <img id="logoImg" src="${u(p.logo)}" alt="" ${p.logo?``:`hidden`} />
                                <span id="logoPh" ${p.logo?`hidden`:``}><i data-lucide="image"></i></span>
                            </div>
                            <input type="file" id="logoFile" accept="image/*" hidden />
                            <div style="display:flex;gap:4px;">
                                <button type="button" class="btn b2b-btn-secondary btn-sm" data-upload="logo"><i data-lucide="upload"></i> Naloži</button>
                                ${p.logo?`<button type="button" class="btn b2b-btn-secondary btn-sm" data-remove="logo"><i data-lucide="x"></i></button>`:``}
                            </div>
                        </div>
                        <div class="b2b-asset" style="flex:1;">
                            <label>Naslovna slika <span class="b2b-field-hint">(panoramska, min 1600×500 px)</span></label>
                            <div class="b2b-asset-preview b2b-cover-preview">
                                <img id="coverImg" src="${u(p.coverImage)}" alt="" ${p.coverImage?``:`hidden`} />
                                <span id="coverPh" ${p.coverImage?`hidden`:``}><i data-lucide="image"></i></span>
                            </div>
                            <input type="file" id="coverFile" accept="image/*" hidden />
                            <div style="display:flex;gap:4px;">
                                <button type="button" class="btn b2b-btn-secondary btn-sm" data-upload="cover"><i data-lucide="upload"></i> Naloži</button>
                                ${p.coverImage?`<button type="button" class="btn b2b-btn-secondary btn-sm" data-remove="cover"><i data-lucide="x"></i></button>`:``}
                            </div>
                        </div>
                    </div>

                    <div style="margin-top:1rem;">
                        <label>Galerija (do 8 slik)</label>
                        <div id="galleryGrid" class="b2b-gallery-grid">
                            ${p.gallery.map((e,t)=>`
                                <div class="b2b-gallery-item" data-idx="${t}">
                                    <img src="${u(e)}" alt=""/>
                                    <button type="button" class="b2b-gallery-del" data-gallery-del="${t}"><i data-lucide="x"></i></button>
                                </div>
                            `).join(``)}
                            ${p.gallery.length<8?`
                                <button type="button" class="b2b-gallery-add" id="galleryAddBtn">
                                    <i data-lucide="plus"></i>
                                    <span>Dodaj</span>
                                </button>`:``}
                        </div>
                        <input type="file" id="galleryFile" accept="image/*" hidden />
                    </div>
                </section>

                <!-- 2. OSNOVNI PODATKI -->
                <section class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="info"></i> Osnovni podatki</h2>
                    <label>Ime podjetja<input name="name" required value="${u(p.name)}"/></label>
                    <label>Slogan <span class="b2b-field-hint">(kratka oznaka pod imenom)</span><input name="tagline" maxlength="80" placeholder="Vaš zanesljiv servis že od 1985" value="${u(p.tagline)}"/></label>
                    <label>Opis podjetja<textarea name="description" rows="5" placeholder="Predstavitev vašega podjetja, zgodovina, vrednote…">${u(p.description)}</textarea></label>
                    ${f.includes(`mechanic`)||f.includes(`dealer`)?`
                        <label>Blagovne znamke <span class="b2b-field-hint">(ločene z vejico)</span><input name="brands" placeholder="BMW, Audi, Mercedes" value="${u(p.brands)}"/></label>
                    `:``}
                    <label>Certifikati <span class="b2b-field-hint">(ločeni z vejico)</span><input name="certifications" placeholder="ISO 9001, Bosch Car Service" value="${u(p.certifications)}"/></label>
                </section>

                <!-- 3. KONTAKT -->
                <section class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="phone"></i> Kontaktni podatki</h2>
                    <div class="b2b-form-row">
                        <label>Telefon<input name="phone" value="${u(p.contact?.phone)}"/></label>
                        <label>E-mail<input name="email" type="email" value="${u(p.contact?.email)}"/></label>
                    </div>
                    <label>Naslov<input name="address" value="${u(p.contact?.address)}"/></label>
                    <label>Spletna stran<input name="website" type="url" placeholder="https://…" value="${u(p.contact?.website)}"/></label>
                </section>

                <!-- 4. DRUŽBENA OMREŽJA -->
                <section class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="share-2"></i> Družbena omrežja</h2>
                    <div class="b2b-form-row">
                        <label>Facebook<input name="facebook" placeholder="https://facebook.com/…" value="${u(p.social?.facebook)}"/></label>
                        <label>Instagram<input name="instagram" placeholder="https://instagram.com/…" value="${u(p.social?.instagram)}"/></label>
                        <label>YouTube<input name="youtube" placeholder="https://youtube.com/…" value="${u(p.social?.youtube)}"/></label>
                    </div>
                </section>

                <!-- 5. DELOVNI ČAS -->
                <section class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="clock"></i> Delovni čas</h2>
                    <div class="b2b-hours">
                        ${s.map(e=>`
                            <div class="b2b-hours-row">
                                <span>${e.label}</span>
                                <input name="wh_${e.key}" placeholder="8:00 - 16:00 (ali 'zaprto')" value="${u(p.workingHours?.[e.key]||``)}"/>
                            </div>
                        `).join(``)}
                    </div>
                </section>

                <p id="profileStatus" class="b2b-status-line"></p>
            </form>

            <!-- ── RIGHT: LIVE MINI PREVIEW ─────────────────────── -->
            <aside class="b2b-preview-sticky">
                <div class="b2b-card">
                    <h2 class="b2b-card-title"><i data-lucide="eye"></i> Hitri predogled</h2>
                    <div id="profilePreview" class="b2b-preview"></div>
                    <button type="button" id="previewFullBtn2" class="btn b2b-btn-secondary btn-sm" style="margin-top:0.75rem;width:100%;justify-content:center;">
                        <i data-lucide="maximize-2"></i> Odpri celotni predogled
                    </button>
                </div>
            </aside>
        </div>

        <!-- Fullscreen preview modal -->
        <div id="fullPreviewModal" class="b2b-fullscreen-preview" hidden>
            <div class="b2b-fullscreen-preview-header">
                <div class="b2b-fullscreen-preview-title">
                    <i data-lucide="eye"></i>
                    <span>Predogled — takšnega vidijo vaše stranke</span>
                </div>
                <div class="b2b-device-toggle">
                    <button class="b2b-device-btn active" data-device="desktop"><i data-lucide="monitor"></i> Desktop</button>
                    <button class="b2b-device-btn" data-device="tablet"><i data-lucide="tablet"></i> Tablica</button>
                    <button class="b2b-device-btn" data-device="mobile"><i data-lucide="smartphone"></i> Telefon</button>
                </div>
                <button id="closeFullPreview" class="btn b2b-btn-secondary"><i data-lucide="x"></i> Zapri</button>
            </div>
            <div class="b2b-fullscreen-preview-body">
                <div id="fullPreviewFrame" class="b2b-fullscreen-preview-frame desktop">
                    <div id="fullPreviewContent"></div>
                </div>
            </div>
        </div>
    `,window.lucide&&window.lucide.createIcons();function h(){let e=new FormData(document.getElementById(`profileForm`));return{name:(e.get(`name`)||``).trim(),tagline:(e.get(`tagline`)||``).trim(),description:(e.get(`description`)||``).trim(),logo:p.logo||``,coverImage:p.coverImage||``,gallery:p.gallery||[],contact:{email:(e.get(`email`)||``).trim(),phone:(e.get(`phone`)||``).trim(),address:(e.get(`address`)||``).trim(),website:(e.get(`website`)||``).trim()},social:{facebook:(e.get(`facebook`)||``).trim(),instagram:(e.get(`instagram`)||``).trim(),youtube:(e.get(`youtube`)||``).trim()},workingHours:s.reduce((t,n)=>({...t,[n.key]:e.get(`wh_`+n.key)||``}),{}),brands:(e.get(`brands`)||``).trim(),certifications:(e.get(`certifications`)||``).trim()}}function g(){let e=h(),t=s.map(t=>`<li><span>${t.label}</span><span>${u(e.workingHours[t.key]||`—`)}</span></li>`).join(``);document.getElementById(`profilePreview`).innerHTML=`
            <div class="preview-cover" style="${e.coverImage?`background-image:url('${e.coverImage}')`:``}"></div>
            <div class="preview-header">
                <div class="preview-logo">${e.logo?`<img src="${e.logo}" alt=""/>`:`<i data-lucide="building-2"></i>`}</div>
                <div>
                    <h3>${u(e.name||`Ime podjetja`)}</h3>
                    ${e.tagline?`<p class="preview-tagline">${u(e.tagline)}</p>`:``}
                    <p class="preview-address"><i data-lucide="map-pin"></i> ${u(e.contact.address||`—`)}</p>
                </div>
            </div>
            <p class="preview-desc">${u((e.description||`Opis podjetja še ni dodan.`).slice(0,160))}${e.description?.length>160?`…`:``}</p>
            <div class="preview-contact">
                ${e.contact.phone?`<a href="tel:${u(e.contact.phone)}"><i data-lucide="phone"></i> ${u(e.contact.phone)}</a>`:``}
                ${e.contact.email?`<a href="mailto:${u(e.contact.email)}"><i data-lucide="mail"></i> ${u(e.contact.email)}</a>`:``}
            </div>
            <ul class="preview-hours">${t}</ul>
        `,window.lucide&&window.lucide.createIcons()}function _(){let e=h(),t=s.map(t=>{let n=e.workingHours[t.key],r=!n||/zaprt/i.test(n);return`<tr class="${r?`fp-closed`:``}"><td>${t.label}</td><td>${r?`Zaprto`:u(n)}</td></tr>`}).join(``),n=e.brands?`<div class="fp-badges">${e.brands.split(`,`).map(e=>`<span class="fp-badge">${u(e.trim())}</span>`).join(``)}</div>`:``,r=e.certifications?`<div class="fp-certs">${e.certifications.split(`,`).map(e=>`<span class="fp-cert"><i data-lucide="award"></i>${u(e.trim())}</span>`).join(``)}</div>`:``,i=e.social.facebook||e.social.instagram||e.social.youtube?`
            <div class="fp-socials">
                ${e.social.facebook?`<a href="${u(e.social.facebook)}" target="_blank" rel="noopener"><i data-lucide="facebook"></i></a>`:``}
                ${e.social.instagram?`<a href="${u(e.social.instagram)}" target="_blank" rel="noopener"><i data-lucide="instagram"></i></a>`:``}
                ${e.social.youtube?`<a href="${u(e.social.youtube)}" target="_blank" rel="noopener"><i data-lucide="youtube"></i></a>`:``}
            </div>`:``,a={};for(let e of m){let t=e.category||`Drugo`;(a[t]=a[t]||[]).push(e)}let o=Object.keys(a).length?Object.entries(a).map(([e,t])=>`
                <div class="fp-svc-group">
                    <h3>${u(e)}</h3>
                    <div class="fp-svc-list">
                        ${t.map(e=>`
                            <div class="fp-svc-card">
                                <div class="fp-svc-icon"><i data-lucide="${u(e.icon||`wrench`)}"></i></div>
                                <div class="fp-svc-body">
                                    <div class="fp-svc-name">${u(e.name)}</div>
                                    ${e.description?`<div class="fp-svc-desc">${u(e.description)}</div>`:``}
                                    <div class="fp-svc-meta">
                                        ${e.duration?`<span><i data-lucide="clock"></i> ${e.duration} min</span>`:``}
                                        <span class="fp-svc-price">${l(e)}</span>
                                    </div>
                                </div>
                            </div>`).join(``)}
                    </div>
                </div>`).join(``):`<div class="fp-empty"><p>Ni dodanih storitev. <a href="#/b2b/storitve">Dodaj storitve →</a></p></div>`,c=e.gallery.length?`
            <section class="fp-section">
                <h2>Galerija</h2>
                <div class="fp-gallery">
                    ${e.gallery.map(e=>`<div class="fp-gallery-item"><img src="${u(e)}" alt=""/></div>`).join(``)}
                </div>
            </section>`:``;document.getElementById(`fullPreviewContent`).innerHTML=`
            <div class="fp-page">
                <!-- Hero -->
                <div class="fp-hero">
                    ${e.coverImage?`<img class="fp-hero-cover" src="${u(e.coverImage)}" alt="">`:`<div class="fp-hero-cover fp-hero-placeholder"></div>`}
                    <div class="fp-hero-overlay"></div>
                    <div class="fp-hero-content">
                        <div class="fp-hero-logo">${e.logo?`<img src="${u(e.logo)}" alt="">`:`<i data-lucide="building-2"></i>`}</div>
                        <div class="fp-hero-info">
                            <h1>${u(e.name||`Ime podjetja`)}</h1>
                            ${e.tagline?`<p class="fp-tagline">${u(e.tagline)}</p>`:``}
                            ${n}
                        </div>
                        <div class="fp-hero-actions">
                            ${e.contact.phone?`<a href="tel:${u(e.contact.phone)}" class="fp-btn primary"><i data-lucide="phone"></i> Kontaktiraj</a>`:``}
                            <button class="fp-btn outline" onclick="event.preventDefault()"><i data-lucide="calendar"></i> Rezerviraj termin</button>
                        </div>
                    </div>
                </div>

                <!-- Info bar -->
                <div class="fp-info-bar">
                    ${e.contact.address?`<div class="fp-info-item"><i data-lucide="map-pin"></i> ${u(e.contact.address)}</div>`:``}
                    ${e.contact.phone?`<div class="fp-info-item"><i data-lucide="phone"></i> ${u(e.contact.phone)}</div>`:``}
                    ${e.contact.email?`<div class="fp-info-item"><i data-lucide="mail"></i> ${u(e.contact.email)}</div>`:``}
                    ${e.contact.website?`<div class="fp-info-item"><i data-lucide="globe"></i> <a href="${u(e.contact.website)}" target="_blank" rel="noopener">${u(e.contact.website.replace(/^https?:\/\//,``))}</a></div>`:``}
                </div>

                <div class="fp-body">
                    <!-- O podjetju -->
                    ${e.description?`
                    <section class="fp-section">
                        <h2>O podjetju</h2>
                        <p class="fp-description">${u(e.description).replace(/\n/g,`<br>`)}</p>
                        ${r}
                        ${i}
                    </section>`:``}

                    <!-- Storitve -->
                    <section class="fp-section">
                        <h2>Storitve in cenik</h2>
                        ${o}
                    </section>

                    <!-- Galerija -->
                    ${c}

                    <!-- Delovni čas -->
                    <section class="fp-section fp-hours-section">
                        <h2>Delovni čas</h2>
                        <table class="fp-hours-table">${t}</table>
                    </section>
                </div>
            </div>
        `,window.lucide&&window.lucide.createIcons()}function v(){_(),document.getElementById(`fullPreviewModal`).hidden=!1,document.body.style.overflow=`hidden`}function y(){document.getElementById(`fullPreviewModal`).hidden=!0,document.body.style.overflow=``}document.getElementById(`previewFullBtn`).addEventListener(`click`,v),document.getElementById(`previewFullBtn2`).addEventListener(`click`,v),document.getElementById(`closeFullPreview`).addEventListener(`click`,y),document.querySelectorAll(`.b2b-device-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.b2b-device-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=document.getElementById(`fullPreviewFrame`);t.className=`b2b-fullscreen-preview-frame `+e.dataset.device})}),g(),document.getElementById(`profileForm`).addEventListener(`input`,g),document.querySelectorAll(`[data-upload]`).forEach(e=>{e.addEventListener(`click`,()=>document.getElementById(e.dataset.upload+`File`).click())}),document.querySelectorAll(`[data-remove]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.remove;t===`logo`?p.logo=``:p.coverImage=``,document.getElementById(t+`Img`).src=``,document.getElementById(t+`Img`).hidden=!0,document.getElementById(t+`Ph`).hidden=!1,e.remove(),g()})}),[`logo`,`cover`].forEach(e=>{document.getElementById(e+`File`).addEventListener(`change`,async t=>{let n=t.target.files?.[0];if(!n)return;let i=document.getElementById(`profileStatus`);i.textContent=`Nalagam sliko…`;try{let t=await r(n,e);document.getElementById(e+`Img`).src=t,document.getElementById(e+`Img`).hidden=!1,document.getElementById(e+`Ph`).hidden=!0,e===`logo`?p.logo=t:p.coverImage=t,g(),i.textContent=`Slika naložena. Ne pozabite klikniti Shrani.`}catch(e){i.textContent=`Napaka pri nalaganju: `+e.message}})}),document.getElementById(`galleryAddBtn`)?.addEventListener(`click`,()=>document.getElementById(`galleryFile`).click()),document.getElementById(`galleryFile`).addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;if(p.gallery.length>=8){alert(`Maksimalno 8 slik v galeriji.`);return}let n=document.getElementById(`profileStatus`);n.textContent=`Nalagam v galerijo…`;try{let e=await r(t,`gallery`);p.gallery.push(e),b(),g(),n.textContent=`Dodano v galerijo. Ne pozabite klikniti Shrani.`}catch(e){n.textContent=`Napaka: `+e.message}e.target.value=``});function b(){let e=document.getElementById(`galleryGrid`);e.innerHTML=`
            ${p.gallery.map((e,t)=>`
                <div class="b2b-gallery-item" data-idx="${t}">
                    <img src="${u(e)}" alt=""/>
                    <button type="button" class="b2b-gallery-del" data-gallery-del="${t}"><i data-lucide="x"></i></button>
                </div>
            `).join(``)}
            ${p.gallery.length<8?`
                <button type="button" class="b2b-gallery-add" id="galleryAddBtn">
                    <i data-lucide="plus"></i>
                    <span>Dodaj</span>
                </button>`:``}
        `,e.querySelectorAll(`[data-gallery-del]`).forEach(e=>{e.addEventListener(`click`,()=>{p.gallery.splice(Number(e.dataset.galleryDel),1),b(),g()})}),document.getElementById(`galleryAddBtn`)?.addEventListener(`click`,()=>document.getElementById(`galleryFile`).click()),window.lucide&&window.lucide.createIcons()}b(),document.getElementById(`profileForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=h(),n=document.getElementById(`saveProfileBtn`);n.disabled=!0,document.getElementById(`profileStatus`).textContent=`Shranjujem…`;try{await i(t),document.getElementById(`profileStatus`).textContent=`✓ Shranjeno — vaš profil je posodobljen.`,setTimeout(()=>{document.getElementById(`profileStatus`).textContent=``},3e3)}catch(e){document.getElementById(`profileStatus`).textContent=`Napaka: `+e.message}finally{n.disabled=!1}})}function l(e){if(e.priceType===`quote`||e.price==null)return`Po ogledu`;let t=Number(e.price).toFixed(2).replace(/\.00$/,``)+` €`;return e.priceType===`from`?`od ${t}`:t}function u(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}export{c as initB2bProfileEditorPage};