// SSR safety: the element and the data entry must import in plain Node (no DOM), like Next.js / Nuxt /
// Angular Universal / SvelteKit do on the server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

const runNode = code => execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

test('import("./dist/tlp-icon.js") works with no DOM', () => {
  const out = runNode(`
    const m = await import('./dist/tlp-icon.js');
    if (typeof HTMLElement !== 'undefined') throw new Error('test must run without a DOM');
    if (m.TlpIcon !== undefined) throw new Error('TlpIcon should be undefined on the server');
    if (typeof m.define !== 'function') throw new Error('define() export missing');
    if (m.define() !== false) throw new Error('define() must be a no-op without customElements');
    m.ensureStyles(); m.installHover();
    if (m.createSvg({ svg: '', m: [] }) !== null) throw new Error('createSvg must return null without a document');
    console.log('ok');
  `);
  assert.equal(out.trim(), 'ok');
});

test('the element, the runtime core and the package self-reference import in Node', () => {
  const out = runNode(`
    await import('./dist/element.js');
    await import('./dist/core.js');
    await import('tlp-icons/element');
    const lib = await import('tlp-icons');
    if (!lib.getSvg('bell').startsWith('<svg')) throw new Error('getSvg failed');
    console.log('ok');
  `);
  assert.equal(out.trim(), 'ok');
});

test('import("./dist/index.js") still works in Node', () => {
  const out = runNode(`
    const lib = await import('./dist/index.js');
    console.log(Object.keys(lib.icons).length > 6000 && typeof lib.getSvg === 'function' ? 'ok' : 'bad');
  `);
  assert.equal(out.trim(), 'ok');
});
