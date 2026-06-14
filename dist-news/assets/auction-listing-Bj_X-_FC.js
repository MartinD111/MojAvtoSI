const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./listing.navtika-B9cpuclc.js","./chunk-QTnfLwEv.js","./preload-helper-kNaey6uv.js","./firebase-D04QZ5MM.js","./index.esm-DejIl58p.js","./jsx-runtime-BILTUGeO.js","./storageKeys-BraFEh3o.js","./platform-BvWcB7wr.js","./CostPanel-ISMDH_4i.js","./i18n-BZd20ht-.js","./CostPanel-BSKR55Z8.css","./listingService-CHYpX_DS.js","./sampleListings-CTAGWO7V.js","./garageService-BlDALu--.js","./serviceBookService-Dwa7rl6z.js","./authGate-BAhVLKA2.js","./auth-4RmUyM8I.js","./listingUtils-DBvePdce.js","./priceRatingUi-Bn9tzU9L.js","./valuationScore-BHvyVyKH.js","./listing-CxQf0tTH.js","./authGate-D3UUNHkN.js"])))=>i.map(i=>d[i]);
import{t as e}from"./platform-BvWcB7wr.js";import{a as t}from"./i18n-BZd20ht-.js";import{n}from"./firebase-D04QZ5MM.js";import{t as r}from"./preload-helper-kNaey6uv.js";import{_ as i,b as a,g as o,i as s,o as c,v as l,y as u}from"./listingService-CHYpX_DS.js";import{i as d,n as f,r as p,t as m}from"./auctionNewsletter-CQEoeV7T.js";import{n as h,r as g,t as _}from"./auctionContract-DoTArium.js";function v(e,t,n={}){if(!e||!e.getContext)return;let r=n.primary||`#2563eb`,i=n.muted||`rgba(100,116,139,0.5)`,a=!!n.dark,o=a?`rgba(255,255,255,0.08)`:`rgba(0,0,0,0.06)`,s=a?`#94a3b8`:`#64748b`,c=window.devicePixelRatio||1,l=e.clientWidth||600,u=e.clientHeight||240;e.width=Math.round(l*c),e.height=Math.round(u*c);let d=e.getContext(`2d`);d.setTransform(c,0,0,c,0,0),d.clearRect(0,0,l,u);let f=Array.isArray(t)?t.filter(e=>e&&Number.isFinite(e.amount)):[],p=l-56-16,m=u-14-26;if(f.length===0){d.fillStyle=s,d.font=`13px system-ui, sans-serif`,d.textAlign=`center`,d.fillText(`Še ni ponudb`,l/2,u/2);return}let h=f.map(e=>e.amount),g=Math.min(...h),_=Math.max(...h),v=_-g||Math.max(_*.1,1),b=g-v*.1,x=_+v*.1,S=f.map(e=>e.t),C=Math.min(...S),w=Math.max(...S),T=w-C||1,E=e=>56+(e-C)/T*p,D=e=>14+(1-(e-b)/(x-b))*m;d.strokeStyle=o,d.fillStyle=s,d.font=`11px system-ui, sans-serif`,d.textAlign=`right`,d.lineWidth=1;for(let e=0;e<=4;e++){let t=b+(x-b)*e/4,n=D(t);d.beginPath(),d.moveTo(56,n),d.lineTo(l-16,n),d.stroke(),d.fillText(Math.round(t).toLocaleString(`sl-SI`)+` €`,50,n+4)}let O=Math.max(...f.map(e=>e.bidders||0),1);O>0&&(d.strokeStyle=i,d.lineWidth=1.5,d.setLineDash([4,3]),d.beginPath(),f.forEach((e,t)=>{let n=14+(1-(e.bidders||0)/O)*m,r=E(e.t);t===0?d.moveTo(r,n):d.lineTo(r,n)}),d.stroke(),d.setLineDash([])),d.beginPath(),f.forEach((e,t)=>{let n=E(e.t),r=D(e.amount);t===0?d.moveTo(n,r):d.lineTo(n,r)});let k=d.createLinearGradient(0,14,0,14+m);k.addColorStop(0,y(r,.18)),k.addColorStop(1,y(r,0)),d.lineTo(E(w),14+m),d.lineTo(E(C),14+m),d.closePath(),d.fillStyle=k,d.fill(),d.beginPath(),f.forEach((e,t)=>{let n=E(e.t),r=D(e.amount);t===0?d.moveTo(n,r):d.lineTo(n,r)}),d.strokeStyle=r,d.lineWidth=2,d.stroke(),d.fillStyle=r,f.forEach(e=>{d.beginPath(),d.arc(E(e.t),D(e.amount),3,0,Math.PI*2),d.fill()})}function y(e,t){let n=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return n?`rgba(${parseInt(n[1],16)},${parseInt(n[2],16)},${parseInt(n[3],16)},${t})`:`rgba(37,99,235,${t})`}var b=null,x=null,S=null,C=null,w=null;function T(){b&&=(b(),null),x&&=(x(),null),S&&=(S(),null)}document.addEventListener(`beforeRouteChange`,T);var E=e=>(Number(e)||0).toLocaleString(`sl-SI`)+` €`;async function D(){console.log(`[AuctionListing] init`),T();let t=new URLSearchParams(window.location.hash.split(`?`)[1]||``).get(`id`),n=document.getElementById(`listingPage`);if(!t||!n){n&&(n.innerHTML=`<div class="error-page"><h1>404</h1><p>Dražba ni najdena.</p></div>`);return}try{let[n,i]=await Promise.all([s(t),c().catch(()=>[])]);C=n;let o=e.id===`navtika`?await r(()=>import(`./listing.navtika-B9cpuclc.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]),import.meta.url):await r(()=>import(`./listing-CxQf0tTH.js`),__vite__mapDeps([20,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]),import.meta.url);o.renderListing(n),o.injectRating(n,i),o.injectServiceHistory(n),O(n),b=u(t,e=>{w=e,k(e)}),x=a(t,e=>{M(e)})}catch(e){console.error(`[AuctionListing]`,e),n&&(n.innerHTML=`<div class="error-page"><h1>404</h1><p>${e.message}</p></div>`)}}function O(e){let n=document.querySelector(`.lp-price-card`);if(!n)return;let r=document.createElement(`div`);r.className=`lp-sidebar-card auction-box`,r.innerHTML=`
        <div class="auction-countdown">
            <i data-lucide="clock"></i>
            <span class="ac-timer-val" id="acTimer">—</span>
        </div>
        <p class="auction-countdown-label" id="acTimerLabel">${t(`auction_time_left`,`do zaključka dražbe`)}</p>

        <div class="auction-current">
            <span class="auction-current-label">${t(`auction_current_bid`,`Trenutna ponudba`)}</span>
            <span class="auction-current-value" id="acCurrent">—</span>
        </div>
        <div class="auction-meta-row">
            <span>🔨 <strong id="acBidCount">0</strong> ${t(`auction_bids`,`ponudb`)}</span>
            <span>👤 <strong id="acBidderCount">0</strong> ${t(`auction_bidders`,`ponudnikov`)}</span>
            <span id="acStartPrice"></span>
        </div>
        <div class="auction-reserve" id="acReserve" style="display:none;"></div>

        <form class="auction-bid-form" id="acBidForm">
            <div class="auction-bid-input-row">
                <input type="number" class="auction-bid-input" id="acBidInput" inputmode="numeric" step="1" />
                <button type="submit" class="auction-bid-btn" id="acBidBtn">${t(`auction_place_bid`,`Oddaj ponudbo`)}</button>
            </div>
            <span class="auction-bid-hint" id="acBidHint"></span>
            <label class="auction-bid-notify">
                <input type="checkbox" id="acNotifyOutbid" checked />
                ${t(`auction_notify_outbid`,`Obvesti me po e-pošti, ko me nekdo prehiti`)}
            </label>
            <label class="auction-bid-notify">
                ${t(`auction_notify_threshold`,`Obvesti me, ko cena preseže`)}
                <input type="number" id="acNotifyThreshold" class="auction-bid-input" style="height:34px;max-width:120px;" placeholder="€" />
            </label>
            <span class="auction-bid-status" id="acBidStatus"></span>
        </form>
    `,n.replaceWith(r);let i=document.querySelector(`.lp-main`);if(i){let n=document.createElement(`div`);n.innerHTML=`
            <section class="lp-section auction-chart-section">
                <h3>${t(`auction_price_history`,`Potek cene`)}</h3>
                <canvas class="auction-chart-canvas" id="acChart"></canvas>
                <div class="auction-chart-legend">
                    <span><span class="swatch" style="background:var(--color-primary-start);"></span>${t(`auction_price`,`Cena`)}</span>
                    <span><span class="swatch" style="background:#94a3b8;"></span>${t(`auction_bidders`,`ponudniki`)}</span>
                </div>
            </section>
            <section class="lp-section auction-bid-history">
                <h3>${t(`auction_bid_history`,`Zgodovina ponudb`)}</h3>
                <div id="acBidHistory"><p style="color:#94a3b8;font-size:0.85rem;">${t(`auction_no_bids`,`Še ni ponudb. Bodite prvi!`)}</p></div>
            </section>
            <section class="lp-section">
                <div id="acNewsletter"></div>
            </section>`,i.appendChild(n);let r=n.querySelector(`#acNewsletter`);r.innerHTML=f({interest:[e.make,e.model].filter(Boolean).join(` `)}),m(n)}document.getElementById(`acBidForm`).addEventListener(`submit`,N),window.lucide&&window.lucide.createIcons()}function k(e){if(!e)return;let r=n.currentUser&&n.currentUser.uid===e.sellerId,a=o(e),s=i(e),c=(e,t)=>{let n=document.getElementById(e);n&&(n.textContent=t)};c(`acCurrent`,E(e.currentBidEur??e.startPriceEur)),c(`acBidCount`,e.bidCount||0),c(`acBidderCount`,e.bidderCount||0),c(`acStartPrice`,`${t(`auction_start`,`Izklicna`)}: ${E(e.startPriceEur)}`);let l=document.getElementById(`acReserve`);if(l)if(e.reservePriceEur){let n=(e.currentBidEur??0)>=e.reservePriceEur;l.style.display=`block`,l.className=`auction-reserve ${n?`met`:`unmet`}`,l.textContent=n?`✓ ${t(`auction_reserve_met`,`Minimalna cena dosežena`)}`:`⚠ ${t(`auction_reserve_unmet`,`Minimalna cena še ni dosežena`)}`}else l.style.display=`none`;let u=document.getElementById(`acTimer`),f=p(e.endsAt);S&&=(S(),null),u&&f&&(S=d(u,f,(e,{ended:n})=>{n&&A(t(`auction_ended`,`Dražba je zaključena.`))}));let m=document.getElementById(`acBidInput`),h=document.getElementById(`acBidHint`),g=document.getElementById(`acBidBtn`);m&&h&&g&&(m.min=String(s),(!m.value||Number(m.value)<s)&&(m.value=s),h.textContent=`${t(`auction_min_next`,`Najnižja naslednja ponudba`)}: ${E(s)} (korak ${E(50)})`,r?A(t(`auction_own`,`To je vaša dražba.`)):a?(g.disabled=!1,m.disabled=!1):A(t(`auction_ended`,`Dražba je zaključena.`))),j(e)}function A(e){let t=document.getElementById(`acBidBtn`),n=document.getElementById(`acBidInput`),r=document.getElementById(`acBidStatus`);t&&(t.disabled=!0),n&&(n.disabled=!0),r&&e&&(r.textContent=e,r.className=`auction-bid-status`)}function j(e){let t=document.getElementById(`acChart`);if(!t)return;let n=document.body.classList.contains(`dark-mode`),r=getComputedStyle(document.documentElement).getPropertyValue(`--color-primary-start`).trim()||`#2563eb`;v(t,e.priceSeries||[],{primary:r,dark:n})}function M(e){let n=document.getElementById(`acBidHistory`);if(n){if(!e||e.length===0){n.innerHTML=`<p style="color:#94a3b8;font-size:0.85rem;">${t(`auction_no_bids`,`Še ni ponudb. Bodite prvi!`)}</p>`;return}n.innerHTML=e.map(e=>{let t=e.createdAt?.toDate?e.createdAt.toDate():null,n=t?t.toLocaleString(`sl-SI`,{day:`2-digit`,month:`2-digit`,hour:`2-digit`,minute:`2-digit`}):``;return`<div class="bid-row">
            <span class="bid-name">${(e.bidderName||`Ponudnik`).replace(/(.{2}).*/,`$1***`)}</span>
            <span class="bid-amount">${E(e.amountEur)}</span>
            <span class="bid-time">${n}</span>
        </div>`}).join(``)}}async function N(e){if(e.preventDefault(),!n.currentUser){let{showAuthGate:e}=await r(async()=>{let{showAuthGate:e}=await import(`./authGate-D3UUNHkN.js`);return{showAuthGate:e}},__vite__mapDeps([21,15,3,4,16]),import.meta.url);e();return}let a=Number(document.getElementById(`acBidInput`).value),o=i(w),s=document.getElementById(`acBidStatus`);if(!Number.isFinite(a)||a<o){s.textContent=`${t(`auction_err_low`,`Ponudba mora biti vsaj`)} ${E(o)}.`,s.className=`auction-bid-status err`;return}P(a,{onOutbid:document.getElementById(`acNotifyOutbid`)?.checked||!1,thresholdEur:Number(document.getElementById(`acNotifyThreshold`)?.value)||null})}function P(e,r){let i=document.createElement(`div`);i.className=`auction-modal-overlay`,i.innerHTML=`
        <div class="auction-modal">
            <h2>${t(`auction_contract_title`,`Zaveza k nakupu`)}</h2>
            <p class="auction-modal-sub">
                ${t(`auction_contract_sub`,`Z oddajo ponudbe se zavezujete, da boste vozilo kupili po tej ceni, če ob zaključku dražbe zmagate.`)}
                <strong>${E(e)}</strong>
            </p>
            ${_({party:`buyer`,title:t(`auction_contract_widget_title`,`Podpis zaveze`),body:t(`auction_contract_widget_body`,`Podpišite s prstom ali prenesite PDF za podpis. Hranimo le do zaključka dražbe.`)})}
            <div class="auction-modal-actions">
                <button class="auction-modal-cancel" id="acmCancel">${t(`cancel`,`Prekliči`)}</button>
                <button class="auction-modal-confirm" id="acmConfirm" disabled>${t(`auction_confirm_bid`,`Potrdi ponudbo`)}</button>
            </div>
        </div>`,document.body.appendChild(i),window.lucide&&window.lucide.createIcons();let a=null,o=i.querySelector(`#acmConfirm`);g(i.querySelector(`.ac-contract`),{title:`Zaveza k nakupu na dražbi — MojAvto.si`,fileName:`zaveza-nakup-drazba`,lines:[`Ponudnik se zavezuje, da bo predmet dražbe kupil po ceni ${E(e)},`,`če bo ob zaključku dražbe oddal najvišjo veljavno ponudbo (zmagal).`,``,`Ta dokument se hrani le do zaključka dražbe.`]},e=>{o.disabled=!h(e)}).then(e=>{a=e});let s=()=>i.remove();i.querySelector(`#acmCancel`).addEventListener(`click`,s),i.addEventListener(`click`,e=>{e.target===i&&s()}),o.addEventListener(`click`,async()=>{let i=a&&a();if(!h(i))return;o.disabled=!0;let c=document.getElementById(`acBidStatus`);try{await l(C.id,e,n.currentUser,{type:i.type,signatureData:i.signatureData},r),c.textContent=t(`auction_bid_ok`,`✓ Ponudba oddana!`),c.className=`auction-bid-status ok`,s()}catch(e){c.textContent=e.message,c.className=`auction-bid-status err`,s()}})}export{D as initAuctionListingPage};