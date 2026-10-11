#!/usr/bin/env node
// Validates tlp originals WITHOUT writing dist/ or site/ (safe to run by several people at once) and renders
// review images: a static sheet (icons at rest, large) and frame strips (motion frozen at 8 points).
//   node scripts/check-originals.mjs <out-name> <name> [<name> ...]
//   node scripts/check-originals.mjs <out-name> --category health
// Images: test/browser/shots/<out-name>-sheet.png and <out-name>-strips.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseUpstreamSvg, ALLOWED_ATTRS, ALLOWED_ELEMENTS } from './engine/svg.mjs';
import { ANIMS, LEGACY, LIMITS, SPEED } from './engine/anims.mjs';
import { atomize, unionBox } from './engine/atoms.mjs';
import { toSvgString } from '../src/runtime/core.js';
import { loadPlaywright } from '../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outName, ...args] = process.argv.slice(2);
if (!outName) { console.error('usage: node scripts/check-originals.mjs <out-name> <name...> | --category <id>'); process.exit(2); }
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const upstream = new Set();
for (const id of Object.keys(readJson('config/sources.json'))) for (const i of readJson(`upstream/${id}.json`).icons) { upstream.add(i.name); for (const a of i.aliases || []) upstream.add(a); }
const categories = new Set(readJson('config/categories.json').categories.map(c => c.id));
const dir = path.join(ROOT, 'originals');
const all = fs.readdirSync(dir).filter(f => f.endsWith('.json') && !f.startsWith('_')).map(f => f.slice(0, -5));

let names = args.filter(a => !a.startsWith('--'));
if (args.includes('--category')) {
  const cat = args[args.indexOf('--category') + 1];
  names = all.filter(n => { try { return readJson(`originals/${n}.json`).category === cat; } catch { return true; } });
}
const problems = [];
const icons = [];
for (const n of names) {
  const file = path.join(dir, `${n}.json`);
  if (!fs.existsSync(file)) { problems.push(`${n}: originals/${n}.json not found`); continue; }
  let o;
  try { o = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { problems.push(`${n}: invalid JSON (${e.message})`); continue; }
  const p = m => problems.push(`${n}: ${m}`);
  if (o.name !== n) p(`"name" must be "${n}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(n)) p('name must be kebab-case');
  if (upstream.has(n)) p('name already exists in Lucide/Tabler - pick another');
  if (!categories.has(o.category)) p(`unknown category "${o.category}"`);
  if (!Array.isArray(o.tags) || !o.tags.length) p('needs tags');
  if (/mezan|mizan/i.test(JSON.stringify(o))) p('forbidden word');
  const svg = String(o.svg || '');
  try { parseUpstreamSvg(`<svg viewBox="0 0 24 24">${svg}</svg>`, n); } catch (e) { p(e.message); }
  for (const m of svg.matchAll(/<\/?([a-zA-Z]+)([^>]*)>/g)) {
    if (!ALLOWED_ELEMENTS.has(m[1])) p(`element <${m[1]}> not allowed`);
    for (const a of m[2].matchAll(/([a-zA-Z:-]+)\s*=/g)) if (!ALLOWED_ATTRS.has(a[1])) p(`attribute ${a[1]} not allowed`);
  }
  for (const m of svg.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (!/^(d|f|p[1-9])$/.test(c)) p(`class "${c}" not allowed`);
  try {
    const box = unionBox(atomize(parseUpstreamSvg(`<svg viewBox="0 0 24 24">${svg}</svg>`, n)));
    if (box.x1 < 0.5 || box.y1 < 0.5 || box.x2 > 23.5 || box.y2 > 23.5) p(`drawing goes outside the grid (bbox ${box.x1.toFixed(1)},${box.y1.toFixed(1)} - ${box.x2.toFixed(1)},${box.y2.toFixed(1)}; keep within 1..23, ideally 2..22)`);
  } catch {}
  const used = new Set();
  let total = 0;
  const m = (o.motion || []).map(s => [s.part || 'all', LEGACY[s.anim] || s.anim, s.dur, s.delay || 0, ...(s.origin && s.origin !== 'center' ? [s.origin] : [])]);
  if (!m.length) p('needs at least one motion step');
  for (const [part, anim, dur, delay, origin] of m) {
    if (!ANIMS[anim]) p(`unknown anim "${anim}"`);
    if (part !== 'all') {
      if (!new RegExp(`class="([^"]* )?${part}( [^"]*)?"`).test(svg)) p(`part ${part} not in svg`);
      if (used.has(part)) p(`part ${part} used by two steps (one animation per element; nest a <g> instead)`);
      used.add(part);
    }
    if (!(dur >= LIMITS.durMin && dur <= LIMITS.durMax)) p(`dur ${dur} outside ${LIMITS.durMin}-${LIMITS.durMax}`);
    if (!(delay >= 0 && delay <= LIMITS.delayMax)) p(`delay ${delay} outside 0-${LIMITS.delayMax}`);
    if (origin && !/^(center|top|bottom|left|right)( (top|bottom|left|right|center))?$|^-?[\d.]+px -?[\d.]+px$/.test(origin)) p(`origin "${origin}" invalid`);
    total = Math.max(total, dur + delay);
  }
  if (total * SPEED > 1600) p(`too long: ${Math.round(total * SPEED)} ms at speed ${SPEED} (max 1600)`);
  icons.push({ name: n, svg, m });
}
// duplicates across all originals
const seen = new Map();
for (const n of all) { const k = n; if (seen.has(k)) problems.push(`duplicate original ${k}`); seen.set(k, 1); }

if (icons.length) {
  const css = fs.readFileSync(path.join(ROOT, 'src', 'runtime', 'tlp-icons.css'), 'utf8');
  const shots = path.join(ROOT, 'test', 'browser', 'shots');
  fs.mkdirSync(shots, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1010, height: 300 }, deviceScaleFactor: 1 });
  const sheet = icons.map(i => `<div class="c"><svg viewBox="0 0 24 24" class="tlp">${i.svg}</svg><span>${i.name}</span></div>`).join('');
  await page.setContent(`<!doctype html><style>${css}body{margin:0;font:11px monospace;background:#fff;--tlp-duo:.16}.g{display:grid;grid-template-columns:repeat(8,120px);gap:8px;padding:12px}.c{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;background:#f5f5ff;border-radius:10px;color:#4f46e5}.c svg{width:56px;height:56px;stroke-width:1.75}.c span{color:#0f172a;text-align:center;word-break:break-all}</style><div class="g">${sheet}</div>`);
  await page.locator('.g').screenshot({ path: path.join(shots, `${outName}-sheet.png`) });
  const FRAMES = 8;
  const rows = icons.map(i => {
    const anim = toSvgString({ svg: i.svg, m: i.m }, { animated: true, stroke: 1.75 });
    return `<div class="r"><div class="l">${i.name}</div>${Array.from({ length: FRAMES }, () => `<div class="f">${anim}</div>`).join('')}</div>`;
  }).join('');
  await page.setContent(`<!doctype html><style>${css}body{margin:0;font:10px monospace;background:#fff;--tlp-duo:.16}.r{display:flex;gap:4px;padding:3px 8px;align-items:center;color:#4f46e5}.l{width:150px;color:#0f172a;overflow:hidden}.f{width:62px;height:56px;display:grid;place-items:center;background:#f5f5ff;border-radius:8px}.f svg{width:40px;height:40px}</style><div id="s">${rows}</div>`);
  await page.evaluate(FRAMES => {
    for (const row of document.querySelectorAll('.r')) {
      const svgs = [...row.querySelectorAll('svg')];
      const total = +svgs[0].dataset.total || 0;
      svgs.forEach((svg, k) => { svg.classList.add('tlp-run'); svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min((total * k) / (FRAMES - 1), total - 1); }); });
    }
  }, FRAMES);
  await page.locator('#s').screenshot({ path: path.join(shots, `${outName}-strips.png`) });
  await browser.close();
  console.log(`images: test/browser/shots/${outName}-sheet.png and ${outName}-strips.png`);
}
console.log(`${icons.length} checked, ${problems.length} problems`);
if (problems.length) { console.log(problems.join('\n')); process.exitCode = 1; }
