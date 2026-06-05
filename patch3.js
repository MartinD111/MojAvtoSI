const fs = require('fs');
let html = fs.readFileSync('public/views/advanced-search.navtika.html', 'utf8');
html = html.replace(/<!-- Results -->[\s\S]*?<div class="listings-grid" id="search-results-container"[\s\S]*?<\/div>[\s\S]*?<\/div>/, '');
fs.writeFileSync('public/views/advanced-search.navtika.html', html, 'utf8');

let js = fs.readFileSync('src/pages/advanced-search.navtika.js', 'utf8');
js = js.replace(/\/\/ ── Result rendering[\s\S]*?function escapeHtml\(s\).*?\}/, '');
fs.writeFileSync('src/pages/advanced-search.navtika.js', js, 'utf8');
