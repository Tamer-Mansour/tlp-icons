// What actually ships: `npm pack --dry-run --json` for tlp-icons and the tlp-icons-data workspace.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { ROOT, readJson } from './helpers.mjs';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function pack(args = []) {
  const out = execFileSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts', ...args], { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out.slice(out.indexOf('[')));
}

test('tlp-icons package: no full JSON, has runtime, types and licenses', { timeout: 120000 }, () => {
  const [info] = pack();
  const files = info.files.map(f => f.path.replace(/\\/g, '/'));
  assert.ok(!files.includes('dist/tlp-icons.json'), 'dist/tlp-icons.json must not ship in tlp-icons');
  for (const f of ['dist/index.js', 'dist/index.d.ts', 'dist/tlp-icon.js', 'dist/tlp-icon.d.ts', 'dist/jsx.d.ts', 'dist/manifest.js', 'dist/tlp-icons.css', 'LICENSE', 'NOTICE.md', 'licenses/lucide.LICENSE.txt']) {
    assert.ok(files.includes(f), `${f} missing from the package`);
  }
  assert.ok(!files.some(f => f.startsWith('packages/') || f.startsWith('web/') || f.startsWith('test/')), 'workspace/test/web files leaked into the package');
  const pkg = readJson('package.json');
  assert.ok(!('./data' in pkg.exports), './data export must be removed (moved to tlp-icons-data)');
});

test('tlp-icons-data package: the JSON, its types and licenses, same version as tlp-icons', { timeout: 120000 }, () => {
  const [info] = pack(['-w', 'tlp-icons-data']);
  const files = info.files.map(f => f.path.replace(/\\/g, '/'));
  for (const f of ['tlp-icons.json', 'index.d.ts', 'LICENSE', 'NOTICE.md', 'package.json']) assert.ok(files.includes(f), `${f} missing from tlp-icons-data`);
  assert.equal(info.name, 'tlp-icons-data');
  assert.equal(info.version, readJson('package.json').version, 'versions must match');
  assert.equal(readJson('packages/tlp-icons-data/package.json').license, readJson('package.json').license);
});
