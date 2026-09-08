const fs = require('fs');
let content = fs.readFileSync('public/icons/vehicles-custom.svg', 'utf8');

function hexToHsl(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let r = parseInt(hex.substring(0,2), 16) / 255;
    let g = parseInt(hex.substring(2,4), 16) / 255;
    let b = parseInt(hex.substring(4,6), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

content = content.replace(/fill:\s*(#[a-fA-F0-9]{3,6})/gi, (match, hex) => {
    let [h, s, l] = hexToHsl(hex);
    let hexLow = hex.toLowerCase();
    if (l > 85) {
        return `fill: var(--bg-glass, ${hexLow})`;
    } else if (s > 20 && h > 200 && h < 280) {
        return `fill: var(--icon-accent, ${hexLow})`;
    } else {
        return `fill: var(--icon-base, ${hexLow})`;
    }
});

fs.writeFileSync('public/icons/vehicles-custom.svg', content, 'utf8');
console.log('Successfully injected CSS vars into vehicles-custom.svg');
