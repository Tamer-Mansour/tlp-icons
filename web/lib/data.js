// Server-side access to the tlp-icons package data (used at build time for static pages).
import fs from 'node:fs';
import path from 'node:path';
import { dataFile, statsFile } from './data-file.mjs';

export { SITE_URL, REPO_URL } from './site';

let cache = null;
function load() {
  if (cache) return cache;
  const D = JSON.parse(fs.readFileSync(dataFile(), 'utf8'));
  const names = Object.keys(D.icons);
  const byCat = {};
  for (const n of names) (byCat[D.icons[n].category] ||= []).push(n);
  cache = { D, names, byCat, catMap: Object.fromEntries(D.categories.map(c => [c.id, c])) };
  return cache;
}

export const data = () => load().D;
export const allNames = () => load().names;
export const categories = () => load().D.categories;
export const category = id => load().catMap[id] || null;
export const iconsIn = id => load().byCat[id] || [];
export const icon = name => load().D.icons[name] || null;
export const sources = () => load().D.sources;
export const total = () => stats().icons;

let statsCache = null;
/**
 * The real numbers: dist/stats.json of the installed tlp-icons package (>= 0.2.0), or the same values computed
 * from the dataset for older versions. Used for every count shown on the site.
 */
export function stats() {
  if (statsCache) return statsCache;
  const file = statsFile();
  if (file) return (statsCache = JSON.parse(fs.readFileSync(file, 'utf8')));
  const { D, names } = load();
  const anims = new Set();
  for (const n of names) for (const s of D.icons[n].m) anims.add(s[1]);
  statsCache = {
    version: D.version,
    icons: names.length,
    categories: D.categories.length,
    aliases: Object.keys(D.aliases || {}).length,
    originals: names.filter(n => D.icons[n].source === 'tlp').length,
    brands: names.filter(n => D.icons[n].category === 'brands').length,
    animations: anims.size,
    byCategory: Object.fromEntries(D.categories.map(c => [c.id, c.count])),
  };
  return statsCache;
}

export function roadmap() {
  const file = path.join(process.cwd(), '..', 'config', 'roadmap.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Same family first (bell, bell-ring...), then the rest of the category. */
export function related(name, limit = 24) {
  const i = icon(name);
  if (!i) return [];
  const fam = name.split('-')[0];
  const all = load().names;
  const family = all.filter(n => n !== name && n.split('-')[0] === fam);
  const sameCat = iconsIn(i.category).filter(n => n !== name && !family.includes(n));
  return [...family, ...sameCat].slice(0, limit);
}

/** Static SVG markup for server rendering (the custom element re-renders it with motion on the client). */
export function svgMarkup(name) {
  const i = icon(name);
  if (!i) return '';
  return `<svg viewBox="0 0 24 24" class="tlp" aria-hidden="true">${i.svg}</svg>`;
}

export const label = name => name.replace(/^brand-/, '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
