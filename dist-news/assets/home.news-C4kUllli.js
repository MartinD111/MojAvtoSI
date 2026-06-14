import{a as e}from"./i18n-BZd20ht-.js";import{c as t,l as n,n as r,u as i}from"./newsService-Ve7q7qVu.js";var a={avto:`linear-gradient(135deg, #e0e7ff, #c7d2fe)`,"avto-super":`linear-gradient(135deg, #ede9fe, #ddd6fe)`,"avto-vsakdan":`linear-gradient(135deg, #e0e7ff, #c7d2fe)`,"avto-elektro":`linear-gradient(135deg, #d1fae5, #a7f3d0)`,moto:`linear-gradient(135deg, #fee2e2, #fecaca)`,"moto-sport":`linear-gradient(135deg, #fee2e2, #fecaca)`,"moto-touring":`linear-gradient(135deg, #fef3c7, #fde68a)`,"moto-avantura":`linear-gradient(135deg, #ffedd5, #fed7aa)`,gospodarska:`linear-gradient(135deg, #e2e8f0, #cbd5e1)`,"gos-tovornjaki":`linear-gradient(135deg, #e2e8f0, #cbd5e1)`,"gos-kombiji":`linear-gradient(135deg, #f0fdf4, #dcfce7)`,splosno:`linear-gradient(135deg, #e2e8f0, #cbd5e1)`},o={avto:`car`,"avto-super":`zap`,"avto-vsakdan":`car`,"avto-elektro":`battery-charging`,moto:`bike`,"moto-sport":`gauge`,"moto-touring":`map`,"moto-avantura":`mountain`,gospodarska:`truck`,"gos-tovornjaki":`truck`,"gos-kombiji":`bus`,splosno:`newspaper`};function s(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}function c(e,t){return e.coverImage?`<img src="${s(e.coverImage)}" alt="${s(e.title)}" style="width:100%;height:${t};object-fit:cover;">`:`<div style="width:100%;height:${t};background:${a[e.category]||a.splosno};display:flex;align-items:center;justify-content:center;">
             <i data-lucide="${o[e.category]||`newspaper`}" style="color:#6366f1;width:64px;height:64px;"></i>
           </div>`}function l(t){return`
      <a href="#/novica?slug=${encodeURIComponent(t.slug)}" class="news-card">
        ${c(t,`180px`)}
        <div class="news-card-content">
          <span class="news-card-cat">${s(n(t.category))}</span>
          <h3>${s(t.title)}</h3>
          <p>${s(t.excerpt||``)}</p>
          <span class="read-more-btn"><span data-i18n-key="read_more">${s(e(`read_more`,`Preberi več`))}</span>
            <i data-lucide="arrow-right" style="width:16px;height:16px;"></i></span>
        </div>
      </a>`}async function u(){let a=document.getElementById(`newsHome`);if(!a)return;let o=[];try{o=await t({max:40})}catch(e){a.innerHTML=`<div style="text-align:center;padding:5rem 2rem;color:#dc2626;">${s(e.message)}</div>`;return}if(!o.length){a.innerHTML=`
          <section class="news-page-hero">
            <h1 class="news-page-title">AutoHub Magazine</h1>
            <p class="news-page-subtitle">${s(e(`news_page_subtitle`,`Novice, testi in nasveti iz sveta avtomobilov in motorjev.`))}</p>
          </section>
          <div style="text-align:center;padding:3rem 2rem;color:#6b7280;">
            <i data-lucide="newspaper" style="width:48px;height:48px;color:#cbd5e1;"></i>
            <p style="margin-top:1rem;">${s(e(`news_empty`,`Trenutno ni objavljenih novic.`))}</p>
          </div>`,window.lucide&&window.lucide.createIcons();return}let[u,...d]=o,f=d.slice(0,6),p=r.map(e=>({cat:e,items:o.filter(t=>t.category===e.value||t.category?.startsWith(e.value+`-`)).slice(0,3)})).filter(e=>e.items.length>0);a.innerHTML=`
      <section class="news-home-hero">
        <a href="#/novica?slug=${encodeURIComponent(u.slug)}" class="news-hero-card">
          ${c(u,`380px`)}
          <div class="news-hero-overlay">
            <span class="news-card-cat">${s(n(u.category))}</span>
            <h1 class="news-hero-title">${s(u.title)}</h1>
            ${u.excerpt?`<p class="news-hero-excerpt">${s(u.excerpt)}</p>`:``}
            <span class="news-hero-meta">
              ${u.publishedAt?s(i(u.publishedAt)):``}
              ${u.author?` · ${s(u.author)}`:``}
            </span>
          </div>
        </a>
      </section>

      ${f.length?`
      <section class="news-section">
        <div class="news-section-head">
          <h2 data-i18n-key="news_latest">${s(e(`news_latest`,`Najnovejše`))}</h2>
          <a href="#/novice" class="news-see-all" data-i18n-key="news_see_all">${s(e(`news_see_all`,`Vse novice →`))}</a>
        </div>
        <div class="news-grid">${f.map(l).join(``)}</div>
      </section>`:``}

      ${p.map(t=>`
        <section class="news-section">
          <div class="news-section-head">
            <h2>${s(t.cat.label)}</h2>
            <a href="#/novice?cat=${t.cat.value}" class="news-see-all">${s(e(`news_more`,`Več`))} →</a>
          </div>
          <div class="news-grid">${t.items.map(l).join(``)}</div>
        </section>
      `).join(``)}`,window.lucide&&window.lucide.createIcons()}export{u as initNewsHomePage};