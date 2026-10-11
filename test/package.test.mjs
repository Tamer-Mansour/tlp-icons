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
  for (const f of ['dist/index.js', 'dist/index.d.ts', 'dist/tlp-icon.js', 'dist/tlp-icon.d.ts', 'dist/jsx.d.ts', 'dist/react.js', 'dist/react.d.ts', 'dist/manifest.js', 'dist/tlp-icons.css', 'LICENSE', 'NOTICE.md', 'licenses/lucide.LICENSE.txt']) {
    assert.ok(files.includes(f), `${f} missing from the package`);
  }
  assert.ok(!files.some(f => f.startsWith('packages/') || f.startsWith('web/') || f.startsWith('test/')), 'workspace/test/web files leaked into the package');
  const pkg = readJson('package.json');
  assert.ok(!('./data' in pkg.exports), './data export must be removed (moved to tlp-icons-data)');
  assert.equal(pkg.peerDependenciesMeta?.react?.optional, true, 'react must be an optional peer dependency');
  assert.ok(!pkg.dependencies, 'tlp-icons has no runtime dependencies');
  assert.ok(!files.includes('dist/tlp-icons.all.js'), 'the offline bundle ships in tlp-icons-data');
  assert.ok(info.unpackedSize < 3 * 1024 * 1024, `unpacked size ${(info.unpackedSize / 1048576).toFixed(2)} MB must stay under 3 MB`);
  for (const f of ['dist/core.js.map', 'dist/element.js.map', 'dist/tlp-icon.js.map']) assert.ok(files.includes(f), `${f} missing`);
});

test('minified dist keeps the license banner and source maps resolve', async () => {
  const fsMod = await import('node:fs');
  const pathMod = await import('node:path');
  const dist = pathMod.join(ROOT, 'dist');
  const files = [...fsMod.readdirSync(dist).filter(f => f.endsWith('.js')), ...fsMod.readdirSync(pathMod.join(dist, 'icons')).map(f => `icons/${f}`)];
  for (const f of files) {
    const code = fsMod.readFileSync(pathMod.join(dist, f), 'utf8');
    assert.match(code, /^\/\* tlp-icons \d+\.\d+\.\d+ - MIT\./, `${f}: missing license banner`);
    const m = code.match(/\/\/# sourceMappingURL=(\S+)\s*$/);
    if (m) {
      const map = JSON.parse(fsMod.readFileSync(pathMod.join(dist, pathMod.dirname(f), m[1]), 'utf8'));
      assert.equal(map.version, 3);
      assert.ok(map.sourcesContent?.[0]?.length > 0, `${f}: map has no sources`);
    }
  }
  assert.ok(fsMod.readFileSync(pathMod.join(dist, 'tlp-icons.css'), 'utf8').startsWith('/* tlp-icons'), 'css banner');
  const report = JSON.parse(fsMod.readFileSync(pathMod.join(dist, 'size-report.json'), 'utf8'));
  assert.deepEqual(report.failures, []);
  assert.ok(report.rows[0].gzip < 8 * 1024 && report.rows[1].gzip < 15 * 1024);
});

test('tlp-icons-data package: the JSON, its types and licenses, same version as tlp-icons', { timeout: 120000 }, () => {
  const [info] = pack(['-w', 'tlp-icons-data']);
  const files = info.files.map(f => f.path.replace(/\\/g, '/'));
  for (const f of ['tlp-icons.json', 'tlp-icons.all.js', 'index.d.ts', 'LICENSE', 'NOTICE.md', 'package.json']) assert.ok(files.includes(f), `${f} missing from tlp-icons-data`);
  assert.equal(info.name, 'tlp-icons-data');
  assert.equal(info.version, readJson('package.json').version, 'versions must match');
  assert.equal(readJson('packages/tlp-icons-data/package.json').license, readJson('package.json').license);
});
