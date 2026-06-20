#!/usr/bin/env node
// Regression guard against SQL injection vectors (see docs/SECURITY.md §9).
// Fails the build if raw-SQL patterns appear under server/src. All DB access
// must go through the Supabase client (parameterized) or Postgres functions.
//
// Run: node scripts/check-no-raw-sql.mjs   (from the server/ directory)

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');

// Patterns that indicate hand-built SQL. Keep these tight to avoid false hits.
const FORBIDDEN = [
    { re: /\bsql`/, why: 'tagged SQL template literal (`sql`…``)' },
    { re: /\.(query|unsafe)\s*\(\s*`[^`]*\$\{/, why: 'interpolated string passed to .query()/.unsafe()' },
    // Uppercase SQL statement keyword (not a `.method`) inside an interpolated template.
    { re: /(?<![.\w])(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^\n;`'"]*`[^`]*\$\{/, why: 'SQL statement built with an interpolated template' },
    { re: /\bclient\.query\s*\(/, why: 'raw pg client.query(' },
];

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) out.push(...walk(p));
        else if (/\.(ts|js|mjs)$/.test(entry)) out.push(p);
    }
    return out;
}

const hits = [];
for (const file of walk(ROOT)) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        for (const { re, why } of FORBIDDEN) {
            if (re.test(line)) hits.push({ file: relative(ROOT, file), line: i + 1, why, src: line.trim() });
        }
    });
}

if (hits.length) {
    console.error('✗ Raw-SQL pattern(s) found in server/src — use the Supabase client or a Postgres function instead:\n');
    for (const h of hits) console.error(`  src/${h.file}:${h.line}  [${h.why}]\n    ${h.src}`);
    console.error('\nSee docs/SECURITY.md §9.');
    process.exit(1);
}

console.log('✓ No raw-SQL patterns in server/src.');
