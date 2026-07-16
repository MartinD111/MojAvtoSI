const fs = require('fs');
const path = require('path');

const iconsDir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Icons\\SVG';
const rev1Dir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Revised\\SVG';
const rev2Dir = 'C:\\Users\\marti\\OneDrive\\Desktop\\Icons\\Revised 2';
const outputSprite = path.join(__dirname, 'public/icons/vehicles-custom.svg');

function normalizeName(filename) {
    let name = filename.replace(/\.svg$/i, '');
    name = name.replace(/^\d+\.\s*/, '');
    return name.trim();
}

function safeId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const svgFiles = new Map();

// 1. Read Icons
if (fs.existsSync(iconsDir)) {
    for (const f of fs.readdirSync(iconsDir)) {
        if (f.endsWith('.svg')) {
            svgFiles.set(normalizeName(f), path.join(iconsDir, f));
        }
    }
} else {
    console.warn("Icons dir not found", iconsDir);
}

// 2. Read Revised
if (fs.existsSync(rev1Dir)) {
    for (const f of fs.readdirSync(rev1Dir)) {
        if (f.endsWith('.svg')) {
            svgFiles.set(normalizeName(f), path.join(rev1Dir, f));
        }
    }
}

// 3. Read Revised 2
if (fs.existsSync(rev2Dir)) {
    for (const f of fs.readdirSync(rev2Dir)) {
        if (f.endsWith('.svg')) {
            svgFiles.set(normalizeName(f), path.join(rev2Dir, f));
        }
    }
}

let outSvg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n`;

for (const [normName, filePath] of svgFiles.entries()) {
    let content = fs.readFileSync(filePath, 'utf8');
    let idStr = 'vc-' + safeId(normName); // Prefix with vc- for "vehicle-custom"

    let viewBoxMatch = content.match(/viewBox="([^"]+)"/i);
    let viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 512 512";
    
    let innerMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    let inner = innerMatch ? innerMatch[1] : "";

    // Parse and scope classes to avoid sprite conflicts
    const styleMatch = inner.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
        let css = styleMatch[1];
        let classes = [...css.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
        classes = [...new Set(classes)]; // Unique classes

        classes.forEach(c => {
            // Replace class definition in CSS
            let cssRegex = new RegExp('\\.' + c + '\\b', 'g');
            inner = inner.replace(cssRegex, '.' + c + '-' + idStr);
            
            // Replace class usage in HTML
            let htmlRegex = new RegExp('class="([^"]*\\b' + c + '\\b[^"]*)"', 'g');
            inner = inner.replace(htmlRegex, (match, clses) => {
                return 'class="' + clses.split(' ').map(cl => cl === c ? cl + '-' + idStr : cl).join(' ') + '"';
            });
        });
    }

    outSvg += `  <symbol id="${idStr}" viewBox="${viewBox}">\n${inner}\n  </symbol>\n`;
}

outSvg += `</svg>\n`;

fs.writeFileSync(outputSprite, outSvg, 'utf8');
console.log('Successfully wrote', outputSprite);

// Dump names to a JSON file for easy reading
const mapDump = {};
for (const [normName] of svgFiles.entries()) {
    mapDump[normName] = 'vc-' + safeId(normName);
}
fs.writeFileSync(path.join(__dirname, 'icon_names.json'), JSON.stringify(mapDump, null, 2), 'utf8');
