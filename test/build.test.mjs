import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

function hashTree(dir) {
  const out = {};
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p).replace(/\\/g, '/')] = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
    }
  };
  walk(dir);
  return out;
}

test('build is offline and idempotent: two builds give identical output, equal to the committed dist/', { timeout: 120000 }, () => {
  const a = fs.mkdtempSync(path.join(os.tmpdir(), 'tlp-a-'));
  const b = fs.mkdtempSync(path.join(os.tmpdir(), 'tlp-b-'));
  try {
    // no network: an unreachable proxy makes any fetch fail loudly
    const envNoNet = { ...process.env, HTTP_PROXY: 'http://127.0.0.1:9', HTTPS_PROXY: 'http://127.0.0.1:9', TLP_ICONS_CACHE: path.join(a, 'no-cache') };
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', a], { env: envNoNet, stdio: 'pipe' });
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs'), '--out', b], { env: envNoNet, stdio: 'pipe' });
    const ha = hashTree(path.join(a, 'dist')), hb = hashTree(path.join(b, 'dist'));
    assert.deepEqual(ha, hb);
    assert.deepEqual(hashTree(path.join(a, 'site')), hashTree(path.join(b, 'site')));
    const committed = hashTree(path.join(ROOT, 'dist'));
    delete committed['svg'];
    for (const k of Object.keys(committed)) if (k.startsWith('svg/')) delete committed[k];
    assert.deepEqual(committed, ha, 'dist/ is stale - run "npm run build"');
  } finally {
    fs.rmSync(a, { recursive: true, force: true });
    fs.rmSync(b, { recursive: true, force: true });
  }
});

test('runtime works in Node: getSvg returns static and animated markup', async () => {
  const lib = await import('../dist/index.js');
  const s = lib.getSvg('bell');
  assert.match(s, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="24" height="24" viewBox="0 0 24 24"/);
  assert.ok(!/class="[^"]*p\d/.test(s), 'static svg must not carry part classes');
  const anim = lib.getSvg('bell', { animated: true, size: 32 });
  assert.match(anim, /--a:tlp-swing/);
  assert.match(anim, /data-total="\d+"/);
  assert.equal(lib.getSvg('definitely-not-an-icon'), null);
  assert.ok(lib.getIcon('trash-2'), 'aliases resolve');
  assert.ok(lib.categories.length >= 25);
});
