// After `next build` (static export):
// 1. Icon pages are opened with normal links (full page loads), so their client-navigation payload files are never
//    requested: remove them to keep the deploy small (~6,500 pages).
// 2. Next's client asks for flat segment files (/docs/__next.docs.__PAGE__.txt) while the export writes them nested
//    (/docs/__next.docs/__PAGE__.txt). Flatten them so client-side navigation works on any static host (Netlify).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'out');
const ICONS = path.join(OUT, 'icons');
let removed = 0, removedBytes = 0, flattened = 0;

const walk = (d, fn) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, fn); else fn(p); } };

// 1. per-icon payloads (out/icons/<name>/**.txt); the gallery page's own files live directly in out/icons
for (const e of fs.readdirSync(ICONS, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith('__next')) continue;
  walk(path.join(ICONS, e.name), p => { if (p.endsWith('.txt')) { removedBytes += fs.statSync(p).size; fs.rmSync(p); removed++; } });
  for (const sub of fs.readdirSync(path.join(ICONS, e.name), { withFileTypes: true })) if (sub.isDirectory()) fs.rmSync(path.join(ICONS, e.name, sub.name), { recursive: true, force: true });
}

// 2. flatten nested segment payloads everywhere else
const flatten = dir => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name === '_next') continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith('__next.')) {
      walk(p, f => {
        const target = path.join(dir, path.relative(dir, f).split(path.sep).join('.'));
        if (!fs.existsSync(target)) { fs.renameSync(f, target); flattened++; }
      });
      fs.rmSync(p, { recursive: true, force: true });
    } else flatten(p);
  }
};
flatten(OUT);

let total = 0, files = 0;
walk(OUT, p => { total += fs.statSync(p).size; files++; });
console.log(`postbuild: removed ${removed} icon-page payloads (${(removedBytes / 1048576).toFixed(0)} MB), flattened ${flattened} segment files. Site: ${files} files, ${(total / 1048576).toFixed(0)} MB`);
