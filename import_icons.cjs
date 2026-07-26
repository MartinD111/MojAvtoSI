const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const downloadsDir = 'C:\\Users\\marti\\Downloads\\PNg and SVG icons (1)\\SVG';
const iconsDir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Icons\\SVG';
const rev1Dir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Revised\\SVG';
const rev2Dir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Revised 2';
const outputSprite = path.join(__dirname, 'public/icons/vehicles-custom.svg');

const symbolsMap = new Map(); // symbolId -> symbol HTML
const nameToId = {};

// 1. Preserve existing symbols from git HEAD or existing outputSprite
function loadExistingSymbols() {
    let oldContent = '';
    if (fs.existsSync(outputSprite)) {
        oldContent = fs.readFileSync(outputSprite, 'utf8');
    }
    if (!oldContent && execSync) {
        try {
            oldContent = execSync('git show HEAD:public/icons/vehicles-custom.svg', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
        } catch (e) {}
    }
    if (oldContent) {
        const symbolMatches = oldContent.matchAll(/<symbol\s+id="([^"]+)"\s+viewBox="([^"]+)">([\s\S]*?)<\/symbol>/gi);
        for (const match of symbolMatches) {
            const id = match[1];
            const viewBox = match[2];
            const inner = match[3];
            symbolsMap.set(id, `  <symbol id="${id}" viewBox="${viewBox}">\n${inner.trim()}\n  </symbol>`);
        }
    }
}

loadExistingSymbols();

function normalizeName(filename) {
    let name = filename.replace(/\.svg$/i, '');
    name = name.replace(/^\d+\.\s*/, '');
    return name.trim();
}

function safeId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function addSvgDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.svg'));
    for (const f of files) {
        const normName = normalizeName(f);
        const idStr = 'vc-' + safeId(normName);
        const filePath = path.join(dirPath, f);
        const content = fs.readFileSync(filePath, 'utf8');

        let viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
        let viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";
        
        let innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
        let inner = innerMatch ? innerMatch[1] : "";

        // Parse and scope classes to avoid sprite conflicts
        const styleMatch = inner.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) {
            let css = styleMatch[1];
            let classes = [...css.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
            classes = [...new Set(classes)];

            classes.forEach(c => {
                let cssRegex = new RegExp('\\.' + c + '\\b', 'g');
                inner = inner.replace(cssRegex, '.' + c + '-' + idStr);
                
                let htmlRegex = new RegExp('class="([^"]*\\b' + c + '\\b[^"]*)"', 'g');
                inner = inner.replace(htmlRegex, (match, clses) => {
                    return 'class="' + clses.split(' ').map(cl => cl === c ? cl + '-' + idStr : cl).join(' ') + '"';
                });
            });
        }

        symbolsMap.set(idStr, `  <symbol id="${idStr}" viewBox="${viewBox}">\n${inner.trim()}\n  </symbol>`);
        nameToId[normName] = idStr;
    }
}

// 2. Read SVGs from any available directories
addSvgDirectory(iconsDir);
addSvgDirectory(rev1Dir);
addSvgDirectory(rev2Dir);
addSvgDirectory(downloadsDir);

// 3. Write merged sprite
let outSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n`;
for (const symbolHtml of symbolsMap.values()) {
    outSvg += symbolHtml + '\n';
}
outSvg += `</svg>\n`;

fs.writeFileSync(outputSprite, outSvg, 'utf8');
console.log('Successfully wrote merged sprite with', symbolsMap.size, 'symbols to', outputSprite);

// 4. Dump names to a JSON file
for (const id of symbolsMap.keys()) {
    if (!Object.values(nameToId).includes(id)) {
        nameToId[id] = id;
    }
}
fs.writeFileSync(path.join(__dirname, 'icon_names.json'), JSON.stringify(nameToId, null, 2), 'utf8');
