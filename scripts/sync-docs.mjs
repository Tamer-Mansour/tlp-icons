#!/usr/bin/env node
// Writes the real numbers from dist/stats.json (and dist/size-report.json) into README.md and package.json.
// Nothing in those files is typed by hand:
//   README inline numbers:  <!--s:icons-->6,620<!--/s-->   keys: icons categories aliases originals brands
//                           animations handmade cat.<id> (per category) size.<row index>.gzip
//   README badge block:     <!-- badges:start --> ... <!-- badges:end -->
//   README size table:      <!-- sizes:start --> ... <!-- sizes:end -->
//   package.json:           "description"
// Runs at the end of `npm run build` (repository builds only); can also be run on its own.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const fmt = n => Number(n).toLocaleString('en');
const kb = n => `${(n / 1024).toFixed(1)} KB`;

export function values(stats, sizes) {
  const v = {
    icons: fmt(stats.icons), categories: fmt(stats.categories), aliases: fmt(stats.aliases), originals: fmt(stats.originals),
    brands: fmt(stats.brands), animations: fmt(stats.animations), handmade: fmt(stats.handmade),
  };
  for (const [id, n] of Object.entries(stats.byCategory || {})) v[`cat.${id}`] = fmt(n);
  (sizes?.rows || []).forEach((r, k) => { v[`size.${k}.gzip`] = kb(r.gzip); v[`size.${k}.raw`] = kb(r.raw); });
  return v;
}

export function badges(stats, sizes) {
  const core = sizes?.rows?.[0];
  const enc = s => encodeURIComponent(s).replace(/-/g, '--');
  return [
    '<p align="center">',
    '  <a href="https://www.npmjs.com/package/tlp-icons"><img alt="npm version" src="https://img.shields.io/npm/v/tlp-icons?color=741D3D"></a>',
    '  <a href="https://www.npmjs.com/package/tlp-icons"><img alt="npm downloads" src="https://img.shields.io/npm/dm/tlp-icons?color=741D3D"></a>',
    core ? `  <a href="#bundle-size"><img alt="element size" src="https://img.shields.io/badge/element-${enc(kb(core.gzip))}%20gzip-16a34a"></a>` : '',
    '  <a href="https://github.com/Tamer-Mansour/tlp-icons/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Tamer-Mansour/tlp-icons/actions/workflows/ci.yml/badge.svg"></a>',
    '  <a href="https://github.com/Tamer-Mansour/tlp-icons/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/tlp-icons?color=16a34a"></a>',
    `  <img alt="icons" src="https://img.shields.io/badge/icons-${enc(fmt(stats.icons))}-741D3D">`,
    '</p>',
  ].filter(Boolean).join('\n');
}

export function sizeTable(sizes) {
  if (!sizes) return '';
  const rows = sizes.rows.map(r => `| ${r.label} | ${kb(r.raw)} | **${kb(r.gzip)}** |`).join('\n');
  return `| What | Minified | Gzip |\n| --- | ---: | ---: |\n${rows}`;
}

export function description(stats) {
  return `${fmt(stats.icons)} free, open-source animated SVG icons in ${stats.categories} categories (Lucide, Tabler and tlp originals), as one <tlp-icon> web component for HTML, React, Angular and Vue.`;
}

const LANG = { '.tsx': 'tsx', '.ts': 'ts', '.jsx': 'jsx', '.js': 'js', '.vue': 'vue', '.svelte': 'svelte', '.astro': 'astro', '.html': 'html' };

/** Code blocks for <!-- recipe:a/b.tsx,c/d.vue --> markers, read from test/recipes/ (the tested files). */
export function recipeBlocks(spec, root = ROOT) {
  const files = spec.split(',').map(s => s.trim()).filter(Boolean);
  return files.map(rel => {
    const file = path.join(root, 'test', 'recipes', rel);
    if (!fs.existsSync(file)) throw new Error(`README recipe file missing: test/recipes/${rel}`);
    const code = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trimEnd();
    const label = files.length > 1 ? `\`${path.basename(rel)}\`\n\n` : '';
    return `${label}\`\`\`${LANG[path.extname(rel)] || ''}\n${code}\n\`\`\``;
  }).join('\n\n');
}

export function syncReadme(text, stats, sizes) {
  text = text.replace(/<!-- recipe:([^\s]+) -->[\s\S]*?<!-- \/recipe -->/g, (m, spec) => `<!-- recipe:${spec} -->\n${recipeBlocks(spec)}\n<!-- /recipe -->`);
  const v = values(stats, sizes);
  let out = text.replace(/<!--s:([\w.-]+)-->[^<]*<!--\/s-->/g, (m, key) => {
    if (!(key in v)) throw new Error(`README: unknown stats marker "${key}"`);
    return `<!--s:${key}-->${v[key]}<!--/s-->`;
  });
  out = out.replace(/<!-- badges:start -->[\s\S]*?<!-- badges:end -->/, `<!-- badges:start -->\n${badges(stats, sizes)}\n<!-- badges:end -->`);
  if (sizes) out = out.replace(/<!-- sizes:start -->[\s\S]*?<!-- sizes:end -->/, `<!-- sizes:start -->\n${sizeTable(sizes)}\n<!-- sizes:end -->`);
  return out;
}

export function run() {
  const stats = read('dist/stats.json');
  const sizes = fs.existsSync(path.join(ROOT, 'dist', 'size-report.json')) ? read('dist/size-report.json') : null;
  const readmePath = path.join(ROOT, 'README.md');
  const before = fs.readFileSync(readmePath, 'utf8');
  const after = syncReadme(before, stats, sizes);
  if (after !== before) fs.writeFileSync(readmePath, after);
  const pkgPath = path.join(ROOT, 'package.json');
  const pkgText = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgText);
  const desc = description(stats);
  if (pkg.description !== desc) {
    pkg.description = desc;
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }
  return { readmeChanged: after !== before, descriptionChanged: pkgText !== fs.readFileSync(pkgPath, 'utf8') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = run();
  console.log(`sync-docs: README ${r.readmeChanged ? 'updated' : 'up to date'}, package.json description ${r.descriptionChanged ? 'updated' : 'up to date'}`);
}
