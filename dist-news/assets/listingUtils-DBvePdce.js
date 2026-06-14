import{t as e}from"./storageKeys-BraFEh3o.js";import{t}from"./i18n-BZd20ht-.js";var n=1.34102;function r(e){return e==null||isNaN(e)?null:Math.round(Number(e)*n)}var i={petrol:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},bencin:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},benzin:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},b:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},gasoline:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},gas:{code:`P`,cls:`fuel-pill-P`,icon:`fuel`,title:`Petrol`},diesel:{code:`D`,cls:`fuel-pill-D`,icon:`fuel`,title:`Diesel`},dizel:{code:`D`,cls:`fuel-pill-D`,icon:`fuel`,title:`Diesel`},d:{code:`D`,cls:`fuel-pill-D`,icon:`fuel`,title:`Diesel`},hibrid:{code:`H`,cls:`fuel-pill-H`,icon:`zap`,title:`Hybrid`},hybrid:{code:`H`,cls:`fuel-pill-H`,icon:`zap`,title:`Hybrid`},h:{code:`H`,cls:`fuel-pill-H`,icon:`zap`,title:`Hybrid`},"priključni hibrid":{code:`PH`,cls:`fuel-pill-HB`,icon:`plug-zap`,title:`Plug-in Hybrid`},"plug-in hybrid":{code:`PH`,cls:`fuel-pill-HB`,icon:`plug-zap`,title:`Plug-in Hybrid`},ph:{code:`PH`,cls:`fuel-pill-HB`,icon:`plug-zap`,title:`Plug-in Hybrid`},elektrika:{code:`E`,cls:`fuel-pill-E`,icon:`zap`,title:`Electric`},električno:{code:`E`,cls:`fuel-pill-E`,icon:`zap`,title:`Electric`},electric:{code:`E`,cls:`fuel-pill-E`,icon:`zap`,title:`Electric`},e:{code:`E`,cls:`fuel-pill-E`,icon:`zap`,title:`Electric`},lpg:{code:`LPG`,cls:`fuel-pill-LPG`,icon:`flame`,title:`LPG`}};function a(e){if(!e)return``;let t=typeof e==`object`?e.fuel:e;if(!t)return``;let n=i[t.toLowerCase().trim()]||{code:`E`,cls:`fuel-pill-E`,icon:`zap`,title:`Electric`};return`<div class="spec-pill fuel-coded ${n.cls}" title="${n.title}">
        <i data-lucide="${n.icon}"></i>
        <strong>${n.code}</strong>
    </div>`}function o(e){if(!e)return``;let t=r(e);return`<div class="spec-pill power-pill" data-kw="${e}" data-hp="${t}">
        <i data-lucide="zap"></i>
        <span class="power-val">${t} HP</span>
    </div>`}function s(e){let t=(e.fuel||``).toLowerCase().trim();if(t===`elektrika`||t===`električno`||t===`electric`||t===`e`){if(!e.electricRangeKm)return``;let t=e.electricRangeKm,n=`status-low`;return t<=250?n=`status-high`:t<=400&&(n=`status-medium`),`<div class="spec-pill consumption-pill ${n}" title="Doseg">
            <i data-lucide="battery-charging"></i>
            ${t} km
        </div>`}let n=parseFloat(e.fuelL100kmCombined||e.fuelL100km);if(!n)return``;let r=`status-medium`;return n<=5?r=`status-low`:n>=7&&(r=`status-high`),e.electricRangeKm&&n?`<div class="spec-pill consumption-pill ${r}" title="Poraba / doseg EV">
            <i data-lucide="droplets"></i>
            ${n.toFixed(1)} L/100km · ${e.electricRangeKm} km E
        </div>`:`<div class="spec-pill consumption-pill ${r}" title="Fuel Economy">
        <i data-lucide="droplets"></i>
        ${n.toFixed(1)} L/100km
    </div>`}function c(e){if(!e)return``;let t=typeof e==`object`?e.transmission:e,n=((typeof e==`object`?e.fuel:``)||``).toLowerCase().trim();if(n===`elektrika`||n===`električno`||n===`electric`||n===`e`||!t)return``;let r=t.toLowerCase().trim(),i=`A`,a=`Automatic`,o=`type-auto`;r.includes(`roč`)||r.includes(`manual`)?(i=`R`,a=`Manual`,o=`type-manual`):(r.includes(`sekven`)||r.includes(`sequen`))&&(i=`S`,a=`Sequential`,o=`type-auto`);let s=`<div class="spec-pill transmission-pill ${o}" title="Transmission: ${a}">
        <i data-lucide="settings"></i>
        <strong>${i}</strong>
    </div>`;return typeof e==`object`&&(e.category===`moto`||e.category===`motor`)&&(e.engineStroke&&(s+=`
            <div class="spec-pill stroke-pill" title="Takt motorja: ${e.engineStroke}">
                <i data-lucide="activity"></i>
                <strong>${e.engineStroke}</strong>
            </div>`),e.engineType&&(s+=`
            <div class="spec-pill type-pill" title="Vrsta motorja: ${e.engineType}">
                <i data-lucide="cpu"></i>
                <strong>${e.engineType}</strong>
            </div>`)),s}function l(e){return e?`<div class="spec-pill year-pill">
        <i data-lucide="calendar"></i>
        <span>${e}</span>
    </div>`:``}function u(e){let t=(e.fuel||``).toLowerCase().trim(),n=t===`elektrika`||t===`električno`||t===`electric`||t===`e`,r=t===`hibrid`&&e.hybridType===`PlugIn`;return!n&&!r||!e.batteryKwh?``:`<div class="spec-pill battery-pill" title="Kapaciteta baterije">
        <i data-lucide="battery"></i>
        <span>${e.batteryKwh} kWh</span>
    </div>`}function d(e){return e==null?``:`<div class="spec-pill km-pill">
        <i data-lucide="gauge"></i>
        <span>${typeof e==`number`?new Intl.NumberFormat(`sl-SI`).format(Math.round(e))+` km`:e}</span>
    </div>`}function f(e,t,n=`sl`){if(!e||isNaN(e))return``;if(t===`l`){let t=e/1e3,r=Number(t.toFixed(1));return(n===`sl`?r.toLocaleString(`sl-SI`,{minimumFractionDigits:1,maximumFractionDigits:1}):r.toLocaleString(`en-US`,{minimumFractionDigits:1,maximumFractionDigits:1}))+`L`}else return(n===`sl`?new Intl.NumberFormat(`sl-SI`).format(e):new Intl.NumberFormat(`en-US`).format(e))+` cc`}function p(n){return n?`<div class="spec-pill displacement-pill" data-cc="${n}">
        <i data-lucide="cog"></i>
        <span class="displacement-val">${f(n,localStorage.getItem(e(`displacement_unit`))||`cc`,t())}</span>
    </div>`:``}export{a,c,p as i,l,u as n,d as o,s as r,o as s,f as t};