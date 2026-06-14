import{n as e}from"./firebase-D04QZ5MM.js";import{n as t,o as n,r}from"./auth-4RmUyM8I.js";var i=null,a=`<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6A7.8 7.8 0 0 0 16.98 9c0-.57-.05-1.1-.47-1z" fill="#4285F4"/>
  <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.64.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.87v2.07A8 8 0 0 0 8.98 17z" fill="#34A853"/>
  <path d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.87A8 8 0 0 0 .98 9c0 1.29.31 2.51.89 3.59l2.64-2.07z" fill="#FBBC05"/>
  <path d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .98 9l2.89 2.07C4.14 4.98 6.9 3.58 8.98 3.58z" fill="#EA4335"/>
</svg>`;function o(o={}){return new Promise((s,c)=>{if(e.currentUser){s(e.currentUser);return}i&&i.remove();let l=document.createElement(`div`);l.className=`auth-gate-overlay`,l.innerHTML=`
            <div class="auth-gate-card">
                <button class="auth-gate-close" id="agClose" aria-label="Zapri">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>

                <div class="auth-gate-header">
                    ${o.icon?`<div class="auth-gate-icon-wrap">${o.icon}</div>`:``}
                    <h3 class="auth-gate-title">${o.title||`Prijava je potrebna`}</h3>
                    <p class="auth-gate-msg">${o.message||`Za nadaljevanje se prijavite v vaš račun.`}</p>
                </div>

                <div class="auth-gate-tabs">
                    <button class="auth-gate-tab active" data-tab="login">Prijava</button>
                    <button class="auth-gate-tab" data-tab="register">Registracija</button>
                </div>

                <!-- LOGIN -->
                <div class="auth-gate-pane" id="agPaneLogin">
                    <button class="auth-gate-google-btn" id="agGoogle" type="button">
                        ${a}
                        Nadaljuj z Google
                    </button>
                    <div class="auth-gate-divider"><span>ali z e-pošto</span></div>
                    <form id="agLoginForm" novalidate>
                        <input class="auth-gate-input" type="email" id="agEmail" placeholder="E-poštni naslov" autocomplete="email" required>
                        <input class="auth-gate-input" type="password" id="agPass" placeholder="Geslo" autocomplete="current-password" required>
                        <p class="auth-gate-err" id="agLoginErr"></p>
                        <button class="auth-gate-submit" type="submit">Prijava</button>
                    </form>
                </div>

                <!-- REGISTER -->
                <div class="auth-gate-pane" id="agPaneReg" style="display:none;">
                    <button class="auth-gate-google-btn" id="agGoogleReg" type="button">
                        ${a}
                        Registracija z Google
                    </button>
                    <div class="auth-gate-divider"><span>ali z e-pošto</span></div>
                    <form id="agRegForm" novalidate>
                        <input class="auth-gate-input" type="text" id="agName" placeholder="Ime in priimek" autocomplete="name" required>
                        <input class="auth-gate-input" type="email" id="agEmailReg" placeholder="E-poštni naslov" autocomplete="email" required>
                        <input class="auth-gate-input" type="password" id="agPassReg" placeholder="Geslo (min. 6 znakov)" autocomplete="new-password" required minlength="6">
                        <p class="auth-gate-err" id="agRegErr"></p>
                        <button class="auth-gate-submit" type="submit">Ustvari račun</button>
                    </form>
                </div>
            </div>
        `,document.body.appendChild(l),i=l,requestAnimationFrame(()=>l.classList.add(`active`));let u=e=>{l.classList.remove(`active`),setTimeout(()=>{l.remove(),i=null},300),e&&c(Error(e))};l.querySelector(`#agClose`).addEventListener(`click`,()=>u(`cancelled`)),l.addEventListener(`click`,e=>{e.target===l&&u(`cancelled`)}),l.querySelectorAll(`.auth-gate-tab`).forEach(e=>{e.addEventListener(`click`,()=>{l.querySelectorAll(`.auth-gate-tab`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=e.dataset.tab===`register`;l.querySelector(`#agPaneLogin`).style.display=t?`none`:``,l.querySelector(`#agPaneReg`).style.display=t?``:`none`})});let d=e=>{l.classList.remove(`active`),setTimeout(()=>{l.remove(),i=null},300),s(e)},f=async()=>{try{d(await r())}catch(e){console.error(`[AuthGate] Google error`,e)}};l.querySelector(`#agGoogle`).addEventListener(`click`,f),l.querySelector(`#agGoogleReg`).addEventListener(`click`,f),l.querySelector(`#agLoginForm`).addEventListener(`submit`,async e=>{e.preventDefault();let n=l.querySelector(`#agLoginErr`);n.textContent=``;try{d(await t(l.querySelector(`#agEmail`).value,l.querySelector(`#agPass`).value))}catch{n.textContent=`Napačni podatki. Preverite e-naslov in geslo.`}}),l.querySelector(`#agRegForm`).addEventListener(`submit`,async e=>{e.preventDefault();let t=l.querySelector(`#agRegErr`);t.textContent=``;try{d(await n({fullname:l.querySelector(`#agName`).value,email:l.querySelector(`#agEmailReg`).value,password:l.querySelector(`#agPassReg`).value}))}catch(e){t.textContent=e.message||`Napaka pri registraciji.`}})})}export{o as t};