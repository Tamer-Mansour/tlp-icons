#!/usr/bin/env node
// Online step: fetches the latest upstream sets into the cache and writes a normalised snapshot to upstream/.
// Everything after this (build, tests, gallery) works offline from that snapshot.
//   node scripts/sync.mjs            latest versions, then build
//   node scripts/sync.mjs --locked   re-create the snapshot for the versions in config/sources.json
//   node scripts/sync.mjs --no-build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { adapters } from './adapters/index.mjs';
import { parseUpstreamSvg, elementToMarkup } from './engine/svg.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const sourcesFile = path.join(ROOT, 'config', 'sources.json');
const sources = JSON.parse(fs.readFileSync(sourcesFile, 'utf8'));

fs.mkdirSync(path.join(ROOT, 'upstream'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'licenses'), { recursive: true });

for (const adapter of adapters) {
  const cfg = sources[adapter.id] || (sources[adapter.id] = {});
  const version = args.has('--locked') && cfg.version ? cfg.version : adapter.latest();
  console.log(`${adapter.title}: ${cfg.version || '-'} -> ${version}`);
  const data = await adapter.load(version, cfg);
  const icons = [];
  const rejected = [];
  for (const icon of data.icons) {
    try {
      const elements = parseUpstreamSvg(icon.svg, `${adapter.id}/${icon.name}`);
      const svg = elements.map(e => elementToMarkup(e.tag, e.attrs, e.attrs.__filled ? 'f' : '')).join('');
      icons.push({ name: icon.name, svg, tags: icon.tags, categories: icon.categories, aliases: icon.aliases });
    } catch (err) {
      rejected.push(`${icon.name}: ${err.message}`);
    }
  }
  if (rejected.length) console.log(`  rejected ${rejected.length}:\n   ${rejected.slice(0, 20).join('\n   ')}`);
  const snapshot = {
    source: adapter.id,
    title: adapter.title,
    license: adapter.license,
    homepage: adapter.homepage,
    repository: adapter.repository,
    npm: adapter.npm,
    version,
    categories: data.categories,
    categoryTitles: data.categoryTitles,
    icons,
  };
  // one icon per line keeps weekly diffs readable
  const head = JSON.stringify({ ...snapshot, icons: undefined }, null, 2).replace(/\n}$/, '');
  const body = icons.map(i => `    ${JSON.stringify(i)}`).join(',\n');
  fs.writeFileSync(path.join(ROOT, 'upstream', `${adapter.id}.json`), `${head},\n  "icons": [\n${body}\n  ]\n}\n`);
  fs.writeFileSync(path.join(ROOT, 'licenses', `${adapter.id}.LICENSE.txt`), data.licenseText.replace(/\r\n/g, '\n'));
  cfg.version = version;
  console.log(`  ${icons.length} icons written to upstream/${adapter.id}.json`);
}
fs.writeFileSync(sourcesFile, `${JSON.stringify(sources, null, 2)}\n`);

if (!args.has('--no-build')) execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit' });
