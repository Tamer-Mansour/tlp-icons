import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, data, readJson, exists } from './helpers.mjs';
import { parseUpstreamSvg, ALLOWED_ATTRS, ALLOWED_ELEMENTS } from '../scripts/engine/svg.mjs';
import { ANIMS, SPEED, LIMITS } from '../scripts/engine/anims.mjs';

const D = data();
const names = Object.keys(D.icons);

test('library has thousands of icons from every configured source', () => {
  assert.ok(names.length > 5000, `only ${names.length} icons`);
  const sources = readJson('config/sources.json');
  for (const id of Object.keys(sources)) assert.ok(names.some(n => D.icons[n].source === id), `no icons from ${id}`);
});

test('every icon parses, uses the 24x24 viewBox and only allowed elements/attributes', () => {
  const bad = [];
  for (const n of names) {
    const { svg } = D.icons[n];
    try { parseUpstreamSvg(`<svg viewBox="0 0 24 24">${svg}</svg>`, n); } catch (e) { bad.push(e.message); continue; }
    for (const m of svg.matchAll(/<\/?([a-zA-Z]+)([^>]*)>/g)) {
      if (!ALLOWED_ELEMENTS.has(m[1])) bad.push(`${n}: <${m[1]}>`);
      for (const a of m[2].matchAll(/([a-zA-Z:-]+)\s*=/g)) if (!ALLOWED_ATTRS.has(a[1])) bad.push(`${n}: ${a[1]}`);
    }
    if (/script|javascript:|on[a-z]+\s*=|href|style\s*=|url\(/i.test(svg)) bad.push(`${n}: injection pattern`);
    if (/<svg/i.test(svg)) bad.push(`${n}: nested svg`);
  }
  assert.deepEqual(bad.slice(0, 20), []);
});

test('class attributes only contain part / duotone / solid classes', () => {
  const bad = [];
  for (const n of names) for (const m of D.icons[n].svg.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (!/^(d|f|p[1-9])$/.test(c)) bad.push(`${n}: ${c}`);
  assert.deepEqual(bad.slice(0, 20), []);
});

test('names are unique, kebab-case and never collide with aliases', () => {
  assert.equal(new Set(names).size, names.length);
  for (const n of names) assert.match(n, /^[a-z0-9]+(-[a-z0-9]+)*$/, n);
  for (const [alias, target] of Object.entries(D.aliases)) {
    assert.ok(!D.icons[alias], `alias ${alias} shadows an icon`);
    assert.ok(D.icons[target], `alias ${alias} -> missing ${target}`);
  }
});

test('every icon is in exactly one existing category and no category is empty', () => {
  const ids = new Set(D.categories.map(c => c.id));
  const counts = {};
  for (const n of names) {
    const c = D.icons[n].category;
    assert.ok(ids.has(c), `${n}: unknown category ${c}`);
    counts[c] = (counts[c] || 0) + 1;
  }
  for (const c of D.categories) {
    assert.ok(counts[c.id] > 0, `empty category ${c.id}`);
    assert.equal(counts[c.id], c.count, `count mismatch ${c.id}`);
    assert.ok(D.icons[c.icon], `category icon ${c.icon} missing`);
    assert.match(c.color, /^#[0-9a-f]{6}$/i);
  }
  assert.ok(D.categories.length >= 25 && D.categories.length <= 36, `${D.categories.length} categories`);
});

test('category mapping covers every upstream category', () => {
  const cfg = readJson('config/categories.json');
  const ids = new Set(cfg.categories.map(c => c.id));
  for (const id of Object.keys(readJson('config/sources.json'))) {
    const snap = readJson(`upstream/${id}.json`);
    const table = cfg[id];
    assert.ok(table, `no mapping table for ${id}`);
    for (const c of snap.categories) {
      assert.ok(table[c], `${id} category "${c}" is not mapped`);
      assert.ok(ids.has(table[c]), `${id} "${c}" maps to unknown ${table[c]}`);
    }
    if (id === 'lucide') for (const c of snap.categories) assert.ok(cfg.lucidePriority.includes(c), `lucidePriority misses ${c}`);
  }
  for (const [re, cat] of cfg.patterns) { new RegExp(re); assert.ok(ids.has(cat), `pattern ${re} -> unknown ${cat}`); }
  for (const [n, cat] of Object.entries(cfg.icons)) assert.ok(ids.has(cat), `icon ${n} -> unknown ${cat}`);
});

test('every motion step targets an existing part, uses a known anim and stays in bounds', () => {
  const bad = [];
  for (const n of names) {
    const { svg, m } = D.icons[n];
    if (!m.length) bad.push(`${n}: no motion`);
    let total = 0;
    for (const [part, anim, dur, delay, origin] of m) {
      if (!ANIMS[anim]) bad.push(`${n}: unknown anim ${anim}`);
      if (part !== 'all' && !new RegExp(`class="([^"]* )?${part}( [^"]*)?"`).test(svg)) bad.push(`${n}: missing part ${part}`);
      if (!(dur >= LIMITS.durMin && dur <= LIMITS.durMax)) bad.push(`${n}: dur ${dur}`);
      if (!(delay >= 0 && delay <= LIMITS.delayMax)) bad.push(`${n}: delay ${delay}`);
      if (origin != null && !/^(center|top|bottom|left|right)( (top|bottom|left|right|center))?$|^-?[\d.]+px -?[\d.]+px$/.test(origin)) bad.push(`${n}: origin "${origin}"`);
      total = Math.max(total, dur + delay);
    }
    if (total * SPEED > 1600) bad.push(`${n}: ${Math.round(total * SPEED)} ms at SPEED ${SPEED}`);
  }
  assert.deepEqual(bad.slice(0, 20), [], `${bad.length} problems`);
});

test('every animation in the library is used by at least one icon', () => {
  const used = new Set(names.flatMap(n => D.icons[n].m.map(s => s[1])));
  assert.deepEqual(Object.keys(ANIMS).filter(a => !used.has(a)), []);
});

test('average animation length is about 0.9 s at the default speed', () => {
  const totals = names.map(n => Math.max(...D.icons[n].m.map(s => s[2] + s[3])) * SPEED);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  assert.ok(avg > 600 && avg < 1250, `average ${Math.round(avg)} ms`);
});

test('a part is never animated by two steps (one CSS animation per element)', () => {
  const bad = [];
  for (const n of names) {
    const seen = new Set();
    for (const [part] of D.icons[n].m) { if (part !== 'all' && seen.has(part)) bad.push(`${n}: ${part}`); seen.add(part); }
  }
  assert.deepEqual(bad.slice(0, 20), []);
});

test('overrides still match an existing upstream icon (no orphans)', () => {
  const upstream = new Set();
  for (const id of Object.keys(readJson('config/sources.json'))) for (const i of readJson(`upstream/${id}.json`).icons) upstream.add(i.name);
  const orphans = fs.readdirSync(path.join(ROOT, 'overrides')).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.slice(0, -5)).filter(n => !upstream.has(n));
  assert.deepEqual(orphans, [], `orphaned overrides: ${orphans.join(', ')}`);
  const report = readJson('dist/build-report.json');
  assert.deepEqual(report.orphanOverrides, []);
  assert.deepEqual(report.problems, []);
});

test('licenses and NOTICE are present for every source in the build', () => {
  const notice = fs.readFileSync(path.join(ROOT, 'NOTICE.md'), 'utf8');
  assert.ok(exists('LICENSE'));
  for (const [id, s] of Object.entries(D.sources)) {
    assert.ok(exists(`licenses/${id}.LICENSE.txt`), `licenses/${id}.LICENSE.txt missing`);
    assert.ok(fs.readFileSync(path.join(ROOT, 'licenses', `${id}.LICENSE.txt`), 'utf8').length > 200);
    assert.ok(notice.includes(s.title), `NOTICE.md does not credit ${s.title}`);
    assert.ok(notice.includes(s.license), `NOTICE.md does not mention ${s.license}`);
  }
});

test('brand logos are excluded unless enabled', () => {
  const sources = readJson('config/sources.json');
  if (sources.tabler?.includeBrands) return;
  assert.ok(!names.some(n => n.startsWith('brand-')), 'brand icons found');
  assert.ok(!D.categories.some(c => c.id === 'brands'));
});

test('tlp originals: valid category, unique names, hand-made motion, no forbidden words', () => {
  const dir = path.join(ROOT, 'originals');
  if (!fs.existsSync(dir)) return;
  const upstream = new Set();
  for (const id of Object.keys(readJson('config/sources.json'))) for (const i of readJson(`upstream/${id}.json`).icons) upstream.add(i.name);
  const ids = new Set(D.categories.map(c => c.id));
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_'))) {
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const o = JSON.parse(raw);
    assert.equal(o.name, f.slice(0, -5), `${f}: name must match the file name`);
    assert.ok(!upstream.has(o.name), `${o.name} clashes with an upstream icon`);
    assert.ok(ids.has(o.category), `${o.name}: unknown category ${o.category}`);
    assert.ok(Array.isArray(o.tags) && o.tags.length, `${o.name}: needs tags`);
    assert.ok(o.motion.length >= 1, `${o.name}: needs motion`);
    assert.ok(!/mezan|mizan/i.test(raw), `${o.name}: forbidden word`);
    assert.equal(D.icons[o.name]?.source, 'tlp');
  }
});

test('roadmap covers every category with a target at or above today', () => {
  const rm = readJson('config/roadmap.json');
  const ids = new Set(D.categories.map(c => c.id));
  for (const c of D.categories) {
    assert.ok(rm.categories[c.id], `roadmap misses ${c.id}`);
    assert.ok(rm.categories[c.id].target >= c.count, `${c.id}: target ${rm.categories[c.id].target} < current ${c.count}`);
  }
  for (const id of Object.keys(rm.categories)) assert.ok(ids.has(id), `roadmap has unknown category ${id}`);
  const sum = Object.values(rm.categories).reduce((a, c) => a + c.target, 0);
  assert.equal(rm.goal.total, sum, 'goal.total must equal the sum of category targets');
  assert.ok(rm.categories.legal.target >= 1000);
});

test('brands: the most used logos come first and all brand icons are in Brands', () => {
  const sources = readJson('config/sources.json');
  if (!sources.tabler?.includeBrands) return;
  const brands = names.filter(n => D.icons[n].category === 'brands');
  assert.ok(brands.length > 300);
  assert.deepEqual(brands.slice(0, 3), ['brand-facebook', 'brand-instagram', 'brand-whatsapp']);
  assert.ok(names.filter(n => n.startsWith('brand-')).every(n => D.icons[n].category === 'brands'));
});

test('siblings sit next to each other (arrow-up/down/left/right)', () => {
  const order = names.filter(n => D.icons[n].category === 'arrows');
  const idx = ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'].map(n => order.indexOf(n));
  assert.ok(idx.every(i => i >= 0));
  assert.ok(Math.max(...idx) - Math.min(...idx) === 3, `positions ${idx}`);
});

test('dist has per-category chunks and the manifest maps every name (and alias target) to its chunk', async () => {
  const { categoryOf, MANIFEST, CATEGORIES, ALIASES } = await import('../dist/manifest.js');
  for (const c of CATEGORIES) assert.ok(exists(`dist/icons/${c.id}.js`), `chunk ${c.id} missing`);
  const wrong = names.filter(n => categoryOf(n) !== D.icons[n].category);
  assert.deepEqual(wrong.slice(0, 10), [], `${wrong.length} names map to the wrong category`);
  assert.equal(MANIFEST.bell, D.icons.bell.category, 'MANIFEST[name] stays usable');
  for (const target of Object.values(ALIASES)) assert.ok(D.icons[target], `alias target ${target} missing`);
  const chunk = (await import('../dist/icons/time.js')).default;
  for (const n of Object.keys(chunk)) assert.equal(categoryOf(n), 'time');
  assert.ok(CATEGORIES.map(c => c.id).includes(categoryOf('definitely-not-an-icon')), 'unknown names still map to a real chunk');
});

test('lazy loader uses one static import() per category (bundlers like Vite can split them from node_modules)', () => {
  const code = fs.readFileSync(path.join(ROOT, 'dist', 'tlp-icon.js'), 'utf8');
  for (const c of D.categories) assert.ok(code.includes(`import("./icons/${c.id}.js")`), `no static import for ${c.id}`);
  assert.ok(!/import\(`/.test(code), 'template-literal import() is invisible to Vite inside node_modules');
});

test('manifest stays small (under 12 KB gzip)', async () => {
  const zlib = await import('node:zlib');
  const fsMod = await import('node:fs');
  const gz = zlib.gzipSync(fsMod.readFileSync(path.join(ROOT, 'dist', 'manifest.js')), { level: 9 }).length;
  assert.ok(gz < 12 * 1024, `manifest.js is ${(gz / 1024).toFixed(1)} KB gzip`);
});
