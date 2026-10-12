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

test('no stale hand-typed counts remain in README or package.json', () => {
  const unmarked = readme.replace(/<!--s:[\w.-]+-->[^<]*<!--\/s-->/g, '').replace(/<!-- badges:start -->[\s\S]*?<!-- badges:end -->/, '');
  for (const stale of ['6,489', '6,067', '6,000+', '6,400', '300+ hand-made']) assert.ok(!unmarked.includes(stale), `README still says ${stale}`);
  assert.ok(!unmarked.includes(stats.icons.toLocaleString('en')), 'README has an unmarked icon count (wrap it in <!--s:icons-->)');
  assert.equal(readJson('package.json').description, description(stats));
});
