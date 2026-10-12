// The numbers in README.md and package.json must come from the build (dist/stats.json), never by hand.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJson, data } from './helpers.mjs';
import { values, description } from '../scripts/sync-docs.mjs';

const stats = readJson('dist/stats.json');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

test('dist/stats.json matches the built data', () => {
  const D = data();
  const names = Object.keys(D.icons);
  assert.equal(stats.icons, names.length);
  assert.equal(stats.categories, D.categories.length);
  assert.equal(stats.aliases, Object.keys(D.aliases).length);
  assert.equal(stats.originals, names.filter(n => D.icons[n].source === 'tlp').length);
  assert.equal(stats.brands, names.filter(n => D.icons[n].category === 'brands').length);
  assert.equal(stats.animations, 34);
  for (const c of D.categories) assert.equal(stats.byCategory[c.id], c.count);
});

test('every README number marker shows the current stats value', () => {
  const v = values(stats, readJson('dist/size-report.json'));
  const markers = [...readme.matchAll(/<!--s:([\w.-]+)-->([^<]*)<!--\/s-->/g)];
  assert.ok(markers.length >= 10, `only ${markers.length} markers`);
  for (const [, key, shown] of markers) assert.equal(shown, v[key], `README marker ${key} shows "${shown}", build says "${v[key]}"`);
  assert.match(readme, new RegExp(`badge/icons-${encodeURIComponent(v.icons)}-`), 'icons badge out of date');
});

test('README framework recipes are exactly the tested files; size table and badges are generated', async () => {
  const { recipeBlocks, sizeTable } = await import('../scripts/sync-docs.mjs');
  const recipes = [...readme.matchAll(/<!-- recipe:([^\s]+) -->\n([\s\S]*?)\n<!-- \/recipe -->/g)];
  const wanted = ['react18', 'react19', 'nextjs', 'angular', 'vue', 'sveltekit', 'astro'];
  for (const w of wanted) assert.ok(recipes.some(([, spec]) => spec.startsWith(`${w}/`)), `README has no ${w} recipe`);
  for (const [, spec, body] of recipes) assert.equal(body, recipeBlocks(spec), `README recipe ${spec} is out of date (run npm run build)`);
  const sizes = readJson('dist/size-report.json');
  assert.ok(readme.includes(`<!-- sizes:start -->\n${sizeTable(sizes)}\n<!-- sizes:end -->`), 'README size table out of date');
  for (const b of ['img.shields.io/npm/v/tlp-icons', 'img.shields.io/npm/dm/tlp-icons', 'actions/workflows/ci.yml/badge.svg', 'img.shields.io/npm/l/tlp-icons', 'element-']) assert.ok(readme.includes(b), `badge ${b} missing`);
  assert.match(readme, /### Trademarks[\s\S]*nominative[\s\S]*does not\s+imply/);
  for (const g of ['hover', 'loop', 'rtl', 'duotone']) {
    const f = path.join(ROOT, 'docs', 'media', `${g}.gif`);
    assert.ok(fs.existsSync(f), `docs/media/${g}.gif missing`);
    assert.ok(fs.statSync(f).size < 500 * 1024, `${g}.gif over 500 KB`);
    assert.ok(readme.includes(`docs/media/${g}.gif`), `${g}.gif not shown in README`);
  }
});

test('no stale hand-typed counts remain in README or package.json', () => {
  const unmarked = readme.replace(/<!--s:[\w.-]+-->[^<]*<!--\/s-->/g, '').replace(/<!-- badges:start -->[\s\S]*?<!-- badges:end -->/, '');
  for (const stale of ['6,489', '6,067', '6,000+', '6,400', '300+ hand-made']) assert.ok(!unmarked.includes(stale), `README still says ${stale}`);
  assert.ok(!unmarked.includes(stats.icons.toLocaleString('en')), 'README has an unmarked icon count (wrap it in <!--s:icons-->)');
  assert.equal(readJson('package.json').description, description(stats));
});
