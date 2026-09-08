const fs = require('fs');
let c = fs.readFileSync('src/pages/admin.js', 'utf8');
c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/admin.js', c);
console.log('Fixed admin.js');
