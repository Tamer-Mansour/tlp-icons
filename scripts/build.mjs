#!/usr/bin/env node
// Offline build: upstream/ snapshot + config + overrides + originals -> dist/ (the library).
// The website lives in web/ (Next.js) and consumes dist/ through the tlp-icons package.
//   node scripts/build.mjs [--out <dir>] [--svg]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseUpstreamSvg, ALLOWED_ATTRS, ALLOWED_ELEMENTS } from './engine/svg.mjs';
import { atomize } from './engine/atoms.mjs';
import { choreograph, validateRules } from './engine/motion.mjs';
import { ANIMS, LEGACY, LIMITS, SPEED } from './engine/anims.mjs';
import { categorize, orderIcons } from './engine/categorize.mjs';
import { bundleRuntime } from './lib/bundle.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const outRoot = argv.includes('--out') ? path.resolve(argv[argv.indexOf('--out') + 1]) : ROOT;
const DIST = path.join(outRoot, 'dist');
const writeSvgFiles = argv.includes('--svg');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const sources = readJson('config/sources.json');
const catConfig = readJson('config/categories.json');
const rulesConfig = readJson('config/rules.json');
validateRules(rulesConfig);
const problems = [];
const t0 = Date.now();

// ------------------------------------------------------------------ load snapshots
const snapshots = Object.keys(sources).map(id => {
  const file = path.join(ROOT, 'upstream', `${id}.json`);
  if (!fs.existsSync(file)) throw new Error(`upstream/${id}.json missing - run "npm run sync" once (needs network)`);
  return readJson(`upstream/${id}.json`);
});

// ------------------------------------------------------------------ merge (first source wins on a name clash)
const icons = new Map();
const aliasMap = {};
const clashes = [];
for (const snap of snapshots) {
  for (const up of snap.icons) {
    if (icons.has(up.name)) { clashes.push(`${up.name} (${snap.source} skipped)`); continue; }
    icons.set(up.name, { name: up.name, source: snap.source, upstreamSvg: up.svg, tags: up.tags || [], upstreamCategories: up.categories || [], aliases: up.aliases || [] });
  }
}
// tlp originals: our own drawings with hand choreography (originals/<name>.json)
const ORIGINALS_META = { source: 'tlp', title: 'tlp-icons originals', license: 'MIT', homepage: 'https://tlp-icons.netlify.app', repository: 'https://github.com/Tamer-Mansour/tlp-icons', npm: 'tlp-icons', version: pkg.version };
const originals = new Map();
const origDir = path.join(ROOT, 'originals');
if (fs.existsSync(origDir)) {
  for (const f of fs.readdirSync(origDir).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort()) {
    const o = readJson(`originals/${f}`);
    const name = o.name || f.slice(0, -5);
    if (icons.has(name)) { problems.push(`original ${name} clashes with an upstream icon`); continue; }
    originals.set(name, o);
    icons.set(name, { name, source: 'tlp', upstreamSvg: null, tags: o.tags || [], upstreamCategories: [], aliases: [], original: o });
  }
}
for (const icon of icons.values()) for (const a of icon.aliases) if (!icons.has(a) && !aliasMap[a]) aliasMap[a] = icon.name;

// ------------------------------------------------------------------ geometry
const parsed = new Map();
const geometry = name => {
  if (parsed.has(name)) return parsed.get(name);
  const icon = icons.get(name);
  if (!icon) return null;
  const elements = parseUpstreamSvg(`<svg viewBox="0 0 24 24">${icon.upstreamSvg}</svg>`, name);
  const g = { elements, atoms: atomize(elements) };
  parsed.set(name, g);
  return g;
};

// ------------------------------------------------------------------ overrides
const overrides = new Map();
const orphanOverrides = [];
for (const f of fs.readdirSync(path.join(ROOT, 'overrides')).filter(f => f.endsWith('.json') && !f.startsWith('_')).sort()) {
  const o = readJson(`overrides/${f}`);
  const name = o.name || f.slice(0, -5);
  if (!icons.has(name)) { orphanOverrides.push(name); continue; }
  overrides.set(name, o);
}

const env = {
  rules: rulesConfig.rules,
  pureGears: new Set(rulesConfig.pureGears),
  mechWords: new Set(Object.values(rulesConfig.mechanics).flat()),
  mechanics: tokens => {
    for (const [kind, words] of Object.entries(rulesConfig.mechanics)) if (tokens.some(t => words.includes(t))) return kind;
    return null;
  },
  has: name => icons.has(name),
  lookup: name => geometry(name)?.atoms || null,
  isModifier: () => true,
};

const RTL_WORDS = new Set(['left', 'right', 'forward', 'back', 'backward', 'reply', 'undo', 'redo', 'send', 'login', 'logout', 'log', 'previous', 'next', 'skip', 'rewind', 'fast', 'indent', 'outdent', 'corner', 'quote', 'share', 'exit', 'enter']);
const NO_RTL = /(^|-)(align|text-align|panel|layout|sidebar|columns|chart|scale|flip)(-|$)/;

function normaliseOverride(name, o) {
  const motion = (o.motion || []).map(s => {
    const anim = LEGACY[s.anim] || s.anim;
    const step = [s.part || 'all', anim, Math.round(s.dur ?? ANIMS[anim]?.dur ?? 900), Math.round(s.delay || 0)];
    if (s.origin && s.origin !== 'center') step.push(s.origin);
    return step;
  });
  return { svg: String(o.svg).replace(/\s(stroke|fill|style|stroke-width|color)="[^"]*"/g, '').trim(), motion };
}

// ------------------------------------------------------------------ build every icon
const out = [];
const ruleStats = {};
for (const icon of [...icons.values()].sort((a, b) => (a.name < b.name ? -1 : 1))) {
  const category = icon.original ? icon.original.category : categorize(icon, catConfig, sources);
  if (!category) { problems.push(`${icon.name}: no category`); continue; }
  if (category === 'brands' && !sources.tabler?.includeBrands) continue;
  let result;
  try {
    if (icon.original) {
      const o = normaliseOverride(icon.name, icon.original);
      result = { svg: o.svg, motion: o.motion, rule: 'original' };
    } else if (overrides.has(icon.name)) {
      const o = normaliseOverride(icon.name, overrides.get(icon.name));
      result = { svg: o.svg, motion: o.motion, rule: 'override' };
    } else {
      const g = geometry(icon.name);
      result = choreograph(icon.name, g.elements, g.atoms, icon.tags, env);
    }
  } catch (err) {
    problems.push(`${icon.name}: ${err.stack || err.message}`);
    continue;
  }
  const key = result.rule.split(' ')[0].replace(/\(.*\)/, '');
  ruleStats[key] = (ruleStats[key] || 0) + 1;
  const tokens = icon.name.split('-');
  const rtl = !NO_RTL.test(icon.name) && (tokens.some(t => RTL_WORDS.has(t)) || category === 'arrows' && tokens.some(t => t === 'left' || t === 'right'));
  out.push({
    name: icon.name,
    category,
    source: icon.source,
    tags: [...new Set([...(icon.tags || []).map(String)])],
    upstreamCategories: icon.upstreamCategories,
    svg: result.svg,
    m: result.motion,
    rtl,
    rule: result.rule,
  });
}

// ------------------------------------------------------------------ validate (the tests repeat these checks)
for (const i of out) {
  for (const m of i.svg.matchAll(/<\/?([a-zA-Z]+)([^>]*)>/g)) {
    if (!ALLOWED_ELEMENTS.has(m[1])) problems.push(`${i.name}: element <${m[1]}>`);
    for (const a of m[2].matchAll(/([a-zA-Z:-]+)\s*=/g)) if (!ALLOWED_ATTRS.has(a[1])) problems.push(`${i.name}: attribute ${a[1]}`);
  }
  for (const [part, anim, dur, delay] of i.m) {
    if (!ANIMS[anim]) problems.push(`${i.name}: unknown anim ${anim}`);
    if (part !== 'all' && !new RegExp(`class="[^"]*\\b${part}\\b`).test(i.svg)) problems.push(`${i.name}: part ${part} missing`);
    if (dur < LIMITS.durMin || dur > LIMITS.durMax) problems.push(`${i.name}: dur ${dur}`);
    if (delay < 0 || delay > LIMITS.delayMax) problems.push(`${i.name}: delay ${delay}`);
  }
  if (!i.m.length) problems.push(`${i.name}: no motion`);
}

// ------------------------------------------------------------------ categories + order
const categories = catConfig.categories.filter(c => !c.optional || (c.id === 'brands' && sources.tabler?.includeBrands));
const byCat = new Map(categories.map(c => [c.id, []]));
for (const i of out) {
  if (!byCat.has(i.category)) { problems.push(`${i.name}: category ${i.category} not in taxonomy`); continue; }
  byCat.get(i.category).push(i);
}
const ordered = [];
const catMeta = [];
for (const c of categories) {
  const list = orderIcons(byCat.get(c.id), c.featured || []);
  if (!list.length) { problems.push(`category ${c.id} is empty`); continue; }
  ordered.push(...list);
  const icon = list.find(i => i.name === c.icon) ? c.icon : list[0].name;
  catMeta.push({ id: c.id, title: c.title, icon, color: c.color, count: list.length });
}

// ------------------------------------------------------------------ write dist
const rm = d => fs.rmSync(d, { recursive: true, force: true });
rm(path.join(DIST, 'icons'));
fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });

const sourceMeta = Object.fromEntries(snapshots.map(s => [s.source, { title: s.title, license: s.license, homepage: s.homepage, repository: s.repository, npm: s.npm, version: s.version }]));
if (originals.size) sourceMeta.tlp = { title: ORIGINALS_META.title, license: ORIGINALS_META.license, homepage: ORIGINALS_META.homepage, repository: ORIGINALS_META.repository, npm: ORIGINALS_META.npm, version: ORIGINALS_META.version };
const record = i => {
  const r = { svg: i.svg, m: i.m };
  if (i.rtl) r.r = 1;
  return r;
};
const json = v => JSON.stringify(v);
const header = `/* tlp-icons ${pkg.version} - MIT. Icons from ${snapshots.map(s => `${s.title} ${s.version} (${s.license})`).join(', ')}. Generated file, do not edit. */\n`;

// per-category ESM chunks
const manifest = {};
for (const c of catMeta) {
  const list = ordered.filter(i => i.category === c.id);
  const body = list.map(i => `${json(i.name)}:${json(record(i))}`).join(',\n');
  fs.writeFileSync(path.join(DIST, 'icons', `${c.id}.js`), `${header}export default {\n${body}\n};\n`);
  manifest[c.id] = list.map(i => i.name).join(' ');
}
fs.writeFileSync(path.join(DIST, 'manifest.js'), `${header}const C = ${JSON.stringify(manifest, null, 0)};\nexport const MANIFEST = Object.create(null);\nfor (const c in C) for (const n of C[c].split(' ')) MANIFEST[n] = c;\nexport const ALIASES = ${json(aliasMap)};\nexport const CATEGORIES = ${json(catMeta)};\n`);

// full data file
const fullData = {
  name: 'tlp-icons', version: pkg.version, speed: SPEED, sources: sourceMeta, categories: catMeta, aliases: aliasMap,
  icons: Object.fromEntries(ordered.map(i => [i.name, { category: i.category, source: i.source, tags: i.tags, svg: i.svg, m: i.m, ...(i.rtl ? { r: 1 } : {}) }])),
};
fs.writeFileSync(path.join(DIST, 'tlp-icons.json'), `${JSON.stringify(fullData)}\n`);

// runtime files
const css = fs.readFileSync(path.join(ROOT, 'src', 'runtime', 'tlp-icons.css'), 'utf8');
const runtime = bundleRuntime(ROOT, css);
fs.writeFileSync(path.join(DIST, 'tlp-icons.css'), css);
fs.writeFileSync(path.join(DIST, 'core.js'), header + runtime.coreEsm);
fs.writeFileSync(path.join(DIST, 'element.js'), header + runtime.elementEsm);
fs.writeFileSync(path.join(DIST, 'tlp-icon.js'), `${header}import { setLoader, register } from './core.js';
import { MANIFEST, ALIASES } from './manifest.js';
register({}, ALIASES);
const pending = {};
setLoader(name => {
  const cat = MANIFEST[name];
  if (!cat) return null;
  return pending[cat] || (pending[cat] = import(\`./icons/\${cat}.js\`).then(m => register(m.default)));
});
export * from './core.js';
export { TlpIcon } from './element.js';
`);
const imports = catMeta.map((c, k) => `import c${k} from './icons/${c.id}.js';`).join('\n');
fs.writeFileSync(path.join(DIST, 'index.js'), `${header}${imports}
import { toSvgString, timings } from './core.js';
export { CATEGORIES as categories, ALIASES as aliases } from './manifest.js';
import { ALIASES } from './manifest.js';
/** Every icon: { name: { svg, m, r? } }. svg = inner markup (24x24, stroke=currentColor), m = motion steps [part, anim, dur, delay, origin?]. */
export const icons = Object.assign({}, ${catMeta.map((c, k) => `c${k}`).join(', ')});
export function getIcon(name) { return icons[name] || icons[ALIASES[name]] || null; }
/** SVG markup string. opts: { size, stroke, duotone, animated } */
export function getSvg(name, opts = {}) { const i = getIcon(name); return i ? toSvgString(i, opts) : null; }
export { toSvgString, timings };
`);
fs.writeFileSync(path.join(DIST, 'index.d.ts'), `export type MotionStep = [part: string, anim: string, dur: number, delay: number, origin?: string];
export interface IconData { svg: string; m: MotionStep[]; r?: 1 }
export interface Category { id: string; title: string; icon: string; color: string; count: number }
export declare const icons: Record<string, IconData>;
export declare const categories: Category[];
export declare const aliases: Record<string, string>;
export declare function getIcon(name: string): IconData | null;
export declare function getSvg(name: string, opts?: { size?: number; stroke?: number; duotone?: boolean; animated?: boolean }): string | null;
export declare function toSvgString(icon: IconData, opts?: { size?: number; stroke?: number; duotone?: boolean; animated?: boolean }): string;
export declare function timings(icon: IconData, speed?: number): { steps: { part: string; anim: string; t: number; dl: number; origin?: string }[]; total: number };
`);
const allData = ordered.map(i => `${json(i.name)}:${json(record(i))}`).join(',\n');
fs.writeFileSync(path.join(DIST, 'tlp-icons.runtime.js'), header + runtime.iife);
fs.writeFileSync(path.join(DIST, 'tlp-icons.all.js'), `${header}${runtime.iife}\nTlpIcons.register({\n${allData}\n}, ${json(aliasMap)});\n`);

if (writeSvgFiles) {
  const dir = path.join(DIST, 'svg');
  rm(dir);
  fs.mkdirSync(dir, { recursive: true });
  const { toSvgString } = await import(`file://${path.join(DIST, 'core.js').replace(/\\/g, '/')}`);
  for (const i of ordered) fs.writeFileSync(path.join(dir, `${i.name}.svg`), toSvgString(i, {}));
}

// which engine rule (or override / original) produced each icon's motion - used by the review tools
fs.writeFileSync(path.join(DIST, 'motion-rules.json'), `${JSON.stringify(Object.fromEntries(ordered.map(i => [i.name, i.rule])))}\n`);

// ------------------------------------------------------------------ report
const report = {
  version: pkg.version,
  sources: Object.fromEntries(snapshots.map(s => [s.source, { version: s.version, icons: s.icons.length, categories: s.categories }])),
  total: ordered.length,
  categories: Object.fromEntries(catMeta.map(c => [c.id, c.count])),
  rules: Object.fromEntries(Object.entries(ruleStats).sort((a, b) => b[1] - a[1])),
  overrides: overrides.size,
  orphanOverrides,
  aliases: Object.keys(aliasMap).length,
  nameClashes: clashes.length,
  problems,
};
fs.writeFileSync(path.join(DIST, 'build-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`tlp-icons ${pkg.version}: ${ordered.length} icons in ${catMeta.length} categories (${overrides.size} hand overrides, ${clashes.length} name clashes, ${Object.keys(aliasMap).length} aliases) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
if (orphanOverrides.length) console.log(`orphaned overrides (no upstream icon): ${orphanOverrides.join(', ')}`);
if (problems.length) {
  console.log(`PROBLEMS (${problems.length}):\n  ${problems.slice(0, 40).join('\n  ')}`);
  process.exitCode = 1;
}
