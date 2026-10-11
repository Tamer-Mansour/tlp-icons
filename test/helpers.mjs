import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
export const exists = p => fs.existsSync(path.join(ROOT, p));

let cache = null;
export function data() {
  if (!cache) {
    if (!exists('dist/tlp-icons.json')) throw new Error('dist/ missing - run "npm run build" first');
    cache = readJson('dist/tlp-icons.json');
  }
  return cache;
}

/** Parses @keyframes blocks: { name: { '0%': 'decl', '100%': 'decl', ... } }. */
export function keyframes(css) {
  const out = {};
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
    const frames = {};
    for (const f of m[2].matchAll(/([\d%,\s]+)\{([^}]*)\}/g)) for (const sel of f[1].split(',').map(s => s.trim()).filter(Boolean)) frames[sel] = (frames[sel] ? `${frames[sel]};` : '') + f[2].trim();
    out[m[1]] = frames;
  }
  return out;
}
