// ═══════════════════════════════════════════════════════════════════════════════
// Build docs/EQUIPMENT_OPTIONS.md — the AI quick-entry equipment reference.
// Derived from src/data/equipment.js + public/lang/sl.json so it can never drift.
// Run after changing equipment groups/items or their Slovenian labels:
//     node scripts/build_equipment_reference.mjs
// ═══════════════════════════════════════════════════════════════════════════════
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { EQUIPMENT_GROUPS, ALL_EQUIPMENT_VALUES } = await import('../src/data/equipment.js');
const sl = JSON.parse(fs.readFileSync(path.join(root, 'public/lang/sl.json'), 'utf8'));
const T = (k) => sl[k] || k;

const NAV_CATS = ['colni', 'jadrnice', 'gumenjaki', 'jet-ski'];
const isNav = (g) => g.categories.some((c) => NAV_CATS.includes(c));

const avto = [], moto = [], nav = [], all = [];
for (const g of EQUIPMENT_GROUPS) {
    const bucket = g.categories.includes('all') ? all
        : isNav(g) ? nav
        : g.categories.includes('moto') ? moto
        : avto;
    bucket.push(g);
}

function section(title, groups) {
    let out = `## ${title}\n\n`;
    for (const g of groups) {
        out += `### ${T(g.label)}  \`${g.id}\`\n\n`;
        out += '| Oznaka (label) | Koda (value) |\n|---|---|\n';
        for (const i of g.items) out += `| ${T(i.label)} | \`${i.value}\` |\n`;
        out += '\n';
    }
    return out;
}

let md = '# Oprema — referenca za hitri AI vnos\n\n';
md += '> Samodejno izpeljano iz `src/data/equipment.js` + `public/lang/sl.json`. Ne urejaj ročno — ob spremembi opreme zaženi generator (glej dno datoteke).\n\n';
md += `Skupno **${ALL_EQUIPMENT_VALUES.length}** kod opreme v **${EQUIPMENT_GROUPS.length}** skupinah.\n\n`;
md += '## Kako AI vrne opremo\n\nV JSON izhodu naj AI uporabi polje `equipment` kot seznam **kod** iz desnega stolpca (npr. `["ABS","Leather","Navigation"]`). Lastnosti brez kode naj gredo v `customEquipment` kot `{ "category": "<id skupine>", "value": "<lepo ime>" }`.\n\n---\n\n';
md += section('🚗 Avtomobili (category: avto)', avto);
md += section('🏍️ Motorna kolesa (category: moto)', moto);
md += section('⛵ Plovila — MojaNavtika', nav);
md += section('🔁 Skupno (vse kategorije)', all);
md += '---\n\n## Regeneracija\n\nTa datoteka je izpeljana. Po urejanju `equipment.js` ali prevodov jo osveži z:\n\n```bash\nnode scripts/build_equipment_reference.mjs\n```\n';

fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/EQUIPMENT_OPTIONS.md'), md);
console.log(`Written docs/EQUIPMENT_OPTIONS.md (${md.length} chars, ${ALL_EQUIPMENT_VALUES.length} codes)`);
