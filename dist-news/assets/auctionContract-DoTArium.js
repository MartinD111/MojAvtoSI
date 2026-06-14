const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./jspdf.es.min-BSvpxrzA.js","./chunk-QTnfLwEv.js","./preload-helper-kNaey6uv.js","./typeof-B5XbjTb1.js"])))=>i.map(i=>d[i]);
import{t as e}from"./preload-helper-kNaey6uv.js";var t=null;function n(e={}){return`
    <div class="ac-contract" data-party="${e.party||`buyer`}">
        <div class="ac-contract-head">
            <span class="ac-contract-icon">📝</span>
            <div>
                <p class="ac-contract-title">${e.title||`Pogodba`}</p>
                <p class="ac-contract-sub">${e.body||``}</p>
            </div>
        </div>

        <div class="ac-contract-modes">
            <button type="button" class="ac-mode-btn active" data-cmode="sign">✍️ Podpiši s prstom</button>
            <button type="button" class="ac-mode-btn" data-cmode="print">🖨️ Natisni &amp; pošlji</button>
        </div>

        <div class="ac-sign-wrap" data-pane="sign">
            <canvas class="ac-sign-canvas" width="600" height="180" aria-label="Polje za podpis"></canvas>
            <div class="ac-sign-actions">
                <button type="button" class="ac-sign-clear">Počisti</button>
                <span class="ac-sign-status" aria-live="polite"></span>
            </div>
        </div>

        <div class="ac-print-wrap" data-pane="print" style="display:none;">
            <p class="ac-print-note">Prenesite pogodbo, jo natisnite, podpišite in pošljite drugi stranki.
            Hranimo jo le do zaključka dražbe.</p>
            <button type="button" class="ac-print-btn">⬇️ Prenesi PDF pogodbo</button>
        </div>
    </div>`}async function r(n,r={},i){if(!n)return()=>null;let s=n.querySelector(`.ac-sign-canvas`),c=n.querySelector(`.ac-sign-status`),l=n.querySelector(`[data-pane="sign"]`),u=n.querySelector(`[data-pane="print"]`),d=`sign`,f=!1,p=!1;try{let{default:n}=await e(async()=>{let{default:e}=await import(`./signature_pad-B7Z10a-i.js`);return{default:e}},[],import.meta.url);o(s),t=new n(s,{penColor:`#0f172a`,minWidth:.8,maxWidth:2.2}),t.addEventListener(`endStroke`,()=>{f=!t.isEmpty(),c&&(c.textContent=f?`Podpisano ✓`:``),i&&i(g())})}catch{l&&(l.innerHTML=`<p style="color:#ef4444;">Podpisno polje ni na voljo.</p>`)}n.querySelectorAll(`.ac-mode-btn`).forEach(e=>{e.addEventListener(`click`,()=>{d=e.dataset.cmode,n.querySelectorAll(`.ac-mode-btn`).forEach(t=>t.classList.toggle(`active`,t===e)),l&&(l.style.display=d===`sign`?``:`none`),u&&(u.style.display=d===`print`?``:`none`),i&&i(g())})});let m=n.querySelector(`.ac-sign-clear`);m&&m.addEventListener(`click`,()=>{t&&t.clear(),f=!1,c&&(c.textContent=``),i&&i(g())});let h=n.querySelector(`.ac-print-btn`);h&&h.addEventListener(`click`,async()=>{await a(r),p=!0,i&&i(g())});function g(){return d===`sign`?{type:`sign`,signatureData:f&&t?t.toDataURL(`image/png`):null}:{type:`print`,signatureData:null,acknowledged:p}}return g}function i(e){return e?e.type===`sign`?!!e.signatureData:e.type===`print`?!!e.acknowledged:!1:!1}async function a(t={}){let{jsPDF:n}=await e(async()=>{let{jsPDF:e}=await import(`./jspdf.es.min-BSvpxrzA.js`);return{jsPDF:e}},__vite__mapDeps([0,1,2,3]),import.meta.url),r=new n({unit:`pt`,format:`a4`}),i=56;r.setFont(`helvetica`,`bold`),r.setFontSize(16),r.text(t.title||`Pogodba o dražbi — MojAvto.si`,56,i),i+=28,r.setFont(`helvetica`,`normal`),r.setFontSize(11),(t.lines||[]).forEach(e=>{r.splitTextToSize(e,483).forEach(e=>{i>760&&(r.addPage(),i=56),r.text(e,56,i),i+=16}),i+=6}),i+=40,r.line(56,i,276,i),r.setFontSize(10),r.text(`Podpis`,56,i+14),r.text(`Datum: ____________________`,336,i+14),r.save((t.fileName||`pogodba-drazba`)+`.pdf`)}function o(e){let t=Math.max(window.devicePixelRatio||1,1),n=e.offsetWidth||600,r=e.offsetHeight||180;e.width=n*t,e.height=r*t,e.getContext(`2d`).scale(t,t)}export{i as n,r,n as t};