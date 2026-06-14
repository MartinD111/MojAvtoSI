import{a as e}from"./i18n-BZd20ht-.js";import{c as t,l as n,n as r,s as i,u as a}from"./newsService-Ve7q7qVu.js";var o={avto:`linear-gradient(135deg, #e0e7ff, #c7d2fe)`,"avto-super":`linear-gradient(135deg, #ede9fe, #ddd6fe)`,"avto-vsakdan":`linear-gradient(135deg, #e0e7ff, #c7d2fe)`,"avto-elektro":`linear-gradient(135deg, #d1fae5, #a7f3d0)`,moto:`linear-gradient(135deg, #fee2e2, #fecaca)`,"moto-sport":`linear-gradient(135deg, #fee2e2, #fecaca)`,"moto-touring":`linear-gradient(135deg, #fef3c7, #fde68a)`,"moto-avantura":`linear-gradient(135deg, #ffedd5, #fed7aa)`,gospodarska:`linear-gradient(135deg, #e2e8f0, #cbd5e1)`,"gos-tovornjaki":`linear-gradient(135deg, #e2e8f0, #cbd5e1)`,"gos-kombiji":`linear-gradient(135deg, #f0fdf4, #dcfce7)`,splosno:`linear-gradient(135deg, #e2e8f0, #cbd5e1)`},s={avto:`car`,"avto-super":`zap`,"avto-vsakdan":`car`,"avto-elektro":`battery-charging`,moto:`bike`,"moto-sport":`gauge`,"moto-touring":`map`,"moto-avantura":`mountain`,gospodarska:`truck`,"gos-tovornjaki":`truck`,"gos-kombiji":`bus`,splosno:`newspaper`};function c(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}async function l(){await u(),window._newsParamsBound||(window._newsParamsBound=!0,document.addEventListener(`routeParamsChanged`,()=>{let e=(window.location.hash.slice(1)||`/`).split(`?`)[0];(e===`/novice`||e===`/novica`)&&u()}))}async function u(){let e=new URLSearchParams(window.location.hash.split(`?`)[1]||``),t=e.get(`slug`);t?await p(t):await d(e.get(`cat`)||``),window.lucide&&window.lucide.createIcons()}async function d(n){let i=document.getElementById(`app-container`);i.innerHTML=`
      <div class="page-container" style="flex-direction:column;">
        <section class="news-page-hero">
          <h1 class="news-page-title">AutoHub Magazine</h1>
          <p class="news-page-subtitle" data-i18n-key="news_page_subtitle">${c(e(`news_page_subtitle`,`Novice, testi in nasveti iz sveta avtomobilov in motorjev.`))}</p>
        </section>

        <div class="news-filter-bar" id="newsFilterBar">
          <a href="#/novice" class="news-filter-pill ${n?``:`active`}" data-i18n-key="news_filter_all">${c(e(`news_filter_all`,`Vse`))}</a>
          ${r.map(e=>`
            <a href="#/novice?cat=${e.value}" class="news-filter-pill ${n===e.value?`active`:``}">${c(e.label)}</a>
          `).join(``)}
        </div>

        <section class="news-section" style="margin-top:1rem;">
          <div class="news-grid" id="newsGrid">
            <div style="grid-column:1/-1;text-align:center;padding:3rem;color:#6b7280;">${c(e(`loading`,`Nalagam…`))}</div>
          </div>
        </section>
      </div>`;let a=document.getElementById(`newsGrid`);try{let r=await t({category:n,max:60});if(!r.length){a.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:#6b7280;">
              <i data-lucide="newspaper" style="width:48px;height:48px;color:#cbd5e1;"></i>
              <p style="margin-top:1rem;" data-i18n-key="news_empty">${c(e(`news_empty`,`Trenutno ni objavljenih novic.`))}</p>
            </div>`,window.lucide&&window.lucide.createIcons();return}a.innerHTML=r.map(f).join(``)}catch(e){a.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#dc2626;">${c(e.message)}</div>`}window.lucide&&window.lucide.createIcons()}function f(t){let r=t.coverImage?`<img src="${c(t.coverImage)}" alt="${c(t.title)}" style="width:100%;height:200px;object-fit:cover;">`:`<div style="width:100%;height:200px;background:${o[t.category]||o.splosno};display:flex;align-items:center;justify-content:center;">
             <i data-lucide="${s[t.category]||`newspaper`}" style="color:#6366f1;width:56px;height:56px;"></i>
           </div>`;return`
      <a href="#/novica?slug=${encodeURIComponent(t.slug)}" class="news-card">
        ${r}
        <div class="news-card-content">
          <span class="news-card-cat">${c(n(t.category))}</span>
          <h3>${c(t.title)}</h3>
          <p>${c(t.excerpt||``)}</p>
          <span class="read-more-btn">
            <span data-i18n-key="read_more">${c(e(`read_more`,`Preberi več`))}</span>
            <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
          </span>
        </div>
      </a>`}async function p(t){let r=document.getElementById(`app-container`);r.innerHTML=`<div class="page-container" style="flex-direction:column;">
      <div style="text-align:center;padding:4rem;color:#6b7280;">${c(e(`loading`,`Nalagam…`))}</div>
    </div>`;let l;try{l=await i(t)}catch(e){r.innerHTML=g(e.message);return}if(!l||l.status!==`published`){r.innerHTML=g(e(`news_not_found`,`Novica ni bila najdena.`)),window.lucide&&window.lucide.createIcons();return}window.scrollTo({top:0});let u=l.coverImage?`<img src="${c(l.coverImage)}" alt="${c(l.title)}" class="news-article-cover">`:`<div class="news-article-cover" style="background:${o[l.category]||o.splosno};display:flex;align-items:center;justify-content:center;">
             <i data-lucide="${s[l.category]||`newspaper`}" style="color:#6366f1;width:72px;height:72px;"></i>
           </div>`;r.innerHTML=`
      <div class="page-container" style="flex-direction:column;">
        <article class="news-article">
          <a href="#/novice" class="news-article-back">
            <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
            <span data-i18n-key="news_back">${c(e(`news_back`,`Nazaj na AutoHub Magazine`))}</span>
          </a>
          <div class="news-article-meta">
            <span class="news-card-cat">${c(n(l.category))}</span>
            ${l.publishedAt?`<span class="news-article-date">${c(a(l.publishedAt))}</span>`:``}
            ${l.author?`<span class="news-article-author">${c(e(`news_by`,`Avtor`))}: ${c(l.author)}</span>`:``}
          </div>
          <h1 class="news-article-title">${c(l.title)}</h1>
          ${l.excerpt?`<p class="news-article-lead">${c(l.excerpt)}</p>`:``}
          ${u}
          <div class="news-article-body">${m(l.body)}</div>
        </article>
      </div>`,window.lucide&&window.lucide.createIcons()}function m(e){if(!e)return``;try{let t=JSON.parse(e);if(Array.isArray(t))return t.map(h).join(``)}catch{}return String(e).split(/\n{2,}/).map(e=>`<p>${c(e.trim()).replace(/\n/g,`<br>`)}</p>`).join(``)}function h(e){if(!e||!e.type)return``;if(e.type===`heading`){let t=Math.min(Math.max(parseInt(e.level)||2,2),4);return`<h${t} class="nb-article-heading">${c(e.text||``)}</h${t}>`}if(e.type===`paragraph`)return`<p>${c(e.text||``).replace(/\n/g,`<br>`)}</p>`;if(e.type===`image`)return e.url?`<figure class="nb-article-figure">
            <img src="${c(e.url)}" alt="${c(e.caption||``)}" class="nb-article-img">
            ${e.caption||e.source?`<figcaption class="nb-article-caption">
                ${e.caption?c(e.caption):``}
                ${e.source?`<span class="nb-article-source">${c(e.source)}</span>`:``}
            </figcaption>`:``}
        </figure>`:``;if(e.type===`bullets`){let t=(e.items||[]).filter(e=>e.text||e.bold);return t.length?`<ul class="nb-article-list">${t.map(e=>`<li>${e.bold?`<strong>${c(e.bold)}</strong> `:``}${c(e.text||``)}</li>`).join(``)}</ul>`:``}if(e.type===`numbered`){let t=(e.items||[]).filter(e=>e.text||e.bold);return t.length?`<ol class="nb-article-list">${t.map(e=>`<li>${e.bold?`<strong>${c(e.bold)}</strong> `:``}${c(e.text||``)}</li>`).join(``)}</ol>`:``}return e.type===`quote`?`<blockquote class="nb-article-quote">
            <p>${c(e.text||``)}</p>
            ${e.source?`<cite>${c(e.source)}</cite>`:``}
        </blockquote>`:e.type===`divider`?`<hr class="nb-article-divider">`:``}function g(e){return`<div class="page-container" style="flex-direction:column;">
      <div style="text-align:center;padding:5rem 2rem;color:#6b7280;">
        <i data-lucide="newspaper" style="width:48px;height:48px;color:#cbd5e1;"></i>
        <p style="margin:1rem 0 1.5rem;">${c(e)}</p>
        <a href="#/novice" class="pill-btn primary btn-sm">← AutoHub Magazine</a>
      </div>
    </div>`}export{l as initNewsPage};