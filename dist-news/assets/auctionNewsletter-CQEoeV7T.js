import{n as e}from"./firebase-D04QZ5MM.js";import{m as t}from"./listingService-CHYpX_DS.js";function n(e){if(!e)return null;if(typeof e.toMillis==`function`)return e.toMillis();if(e.seconds)return e.seconds*1e3;if(e instanceof Date)return e.getTime();if(typeof e==`number`)return e;let t=Date.parse(e);return Number.isNaN(t)?null:t}function r(e,t=Date.now()){if(e==null)return``;let n=e-t;if(n<=0)return`Zaključeno`;let r=Math.floor(n/864e5);n-=r*864e5;let i=Math.floor(n/36e5);n-=i*36e5;let a=Math.floor(n/6e4);n-=a*6e4;let o=Math.floor(n/1e3);return r>0?`${r} ${r===1?`dan`:`dni`} ${i} h ${a} min`:i>0?`${i} h ${a} min ${o} s`:`${a} min ${o} s`}function i(e,t=Date.now()){if(e==null)return!1;let n=e-t;return n>0&&n<=36e5}function a(e,t,n){if(!e)return()=>{};let a=()=>{let a=r(t);e.textContent=a;let s=t!=null&&t-Date.now()<=0;e.classList.toggle(`ending-soon`,i(t)),e.classList.toggle(`ended`,s),n&&n(a,{ended:s,endingSoon:i(t)}),s&&clearInterval(o)};a();let o=setInterval(a,1e3);return()=>clearInterval(o)}function o(t={}){return`
    <div class="auction-newsletter" id="auctionNewsletter">
        <div class="an-head">
            <span class="an-icon">🔔</span>
            <div>
                <p class="an-title">Obvestila o dražbah</p>
                <p class="an-sub">Pustite e-naslov in obveščali vas bomo o dražbah vozil, ki vas zanimajo.</p>
            </div>
        </div>
        <form class="an-form" id="auctionNewsletterForm">
            <input type="email" class="an-input" id="anEmail" placeholder="vaš@email.si" required
                value="${t.email||e.currentUser?.email||``}" />
            <input type="text" class="an-input" id="anInterest" placeholder="Npr. BMW, Audi, kombi …"
                value="${t.interest||``}" />
            <button type="submit" class="an-submit">Prijava</button>
        </form>
        <p class="an-status" id="anStatus" aria-live="polite"></p>
    </div>`}function s(n=document){let r=n.querySelector(`#auctionNewsletterForm`);if(!r)return;let i=n.querySelector(`#anStatus`);r.addEventListener(`submit`,async a=>{a.preventDefault();let o=n.querySelector(`#anEmail`).value.trim(),s=n.querySelector(`#anInterest`).value.trim();try{await t(o,{interest:s},e.currentUser?.uid||null),i&&(i.textContent=`✓ Prijavljeni ste na obvestila.`,i.className=`an-status ok`),r.reset()}catch(e){i&&(i.textContent=e.message||`Napaka pri prijavi.`,i.className=`an-status err`)}})}export{a as i,o as n,n as r,s as t};