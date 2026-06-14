var e=`var(--color-primary-start, #f59e0b)`,t=`#374151`,n=0;function r(r,i=16){let a=`<div style="display:inline-flex;align-items:center;gap:2px;">`;for(let o=1;o<=5;o++){let s=r>=o?`full`:r>=o-.5?`half`:`empty`,c=s===`empty`?t:e;if(s===`half`){let r=`prg-${(n++).toString(36)}`;a+=`<svg width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" style="display:block"><defs><linearGradient id="${r}"><stop offset="50%" stop-color="${e}"/><stop offset="50%" stop-color="${t}"/></linearGradient></defs><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="url(#${r})"/></svg>`}else a+=`<svg width="${i}" height="${i}" viewBox="0 0 24 24" style="display:block"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="${c}"/></svg>`}return a+=`</div>`,a}function i(e){let t=e?.score;return t===3?{stars:4.5,label:`Odlična vrednost`}:t===1?{stars:2,label:`Nad povprečjem`}:{stars:3,label:`Poštena cena`}}function a(e){return String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e])}function o(e,t=``){return`<span class="price-rating price-rating--stacked"${t?` title="${a(t)}"`:``}>
        ${r(e.stars,13)}
        <span class="price-rating-label">${a(e.label)}</span>
    </span>`}function s(t,n={}){let{confidenceLabel:i=``,rareFeaturesLabel:o=`Redka oprema`}=n;return`
        <div style="margin:0.75rem 0 0.25rem; padding:0.75rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:0.75rem;">
            <div>${r(t.stars,18)}</div>
            <div style="font-size:0.9rem; font-weight:700; color:${e}; margin-top:4px;">${a(t.label)}</div>
            ${t.priceSignal?`<div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">${a(t.priceSignal)}</div>`:``}
            ${t.equipmentSignal?`<div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${a(o)}: ${a(t.equipmentSignal)}</div>`:``}
            ${i?`<div style="margin-top:6px;">
                <span style="font-size:0.72rem; font-weight:600; padding:0.2rem 0.5rem; border-radius:999px; background:rgba(255,255,255,0.05); color:#64748b;">${a(i)}</span>
            </div>`:``}
            ${t.warning?`
            <div style="margin-top:0.6rem; padding:0.5rem 0.75rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:0.5rem; font-size:0.8rem; color:#fca5a5; display:flex; gap:0.4rem; align-items:center;">
                <span>⚠️</span>${a(t.warning)}
            </div>`:``}
        </div>`}export{o as n,s as r,i as t};