// The framework recipes shown in README.md live in test/recipes/ and are compiled here with each framework's own
// compiler. sync-docs copies these files into the README, so the docs show exactly the tested code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { ROOT } from './helpers.mjs';

const require = createRequire(path.join(ROOT, 'package.json'));
const R = rel => path.join(ROOT, 'test', 'recipes', rel);
const src = rel => fs.readFileSync(R(rel), 'utf8');

test('recipes: React 18 (wrapper), React 19 (tag + jsx), Next.js App Router and Angular compile (tsc)', { timeout: 120000 }, () => {
  const tsc = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
  try {
    execFileSync(process.execPath, [tsc, '-p', R('tsconfig.json')], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    assert.fail(`tsc failed:\n${err.stdout || ''}${err.stderr || ''}`);
  }
});

test('recipe: Vue 3 SFC compiles and <tlp-icon> is a custom element (not an unresolved component)', () => {
  const { parse, compileScript, compileTemplate } = require('vue/compiler-sfc');
  const { descriptor, errors } = parse(src('vue/App.vue'), { filename: 'App.vue' });
  assert.deepEqual(errors, []);
  compileScript(descriptor, { id: 'app' });
  const isCustomElement = tag => tag === 'tlp-icon'; // the option from vite.config.ts
  const withOption = compileTemplate({ source: descriptor.template.content, filename: 'App.vue', id: 'app', compilerOptions: { isCustomElement } });
  assert.deepEqual(withOption.errors, []);
  assert.ok(!/resolveComponent\("tlp-icon"\)/.test(withOption.code), 'tlp-icon must not be resolved as a Vue component');
  const without = compileTemplate({ source: descriptor.template.content, filename: 'App.vue', id: 'app' });
  assert.match(without.code, /resolveComponent\("tlp-icon"\)/, 'sanity check: without the option Vue treats it as a component');
  // the vite.config.ts recipe is valid TypeScript and carries that option
  const esbuild = require('esbuild');
  const js = esbuild.transformSync(src('vue/vite.config.ts'), { loader: 'ts' }).code;
  assert.match(js, /isCustomElement:\s*\(?tag\)?\s*=>\s*tag === "tlp-icon"/);
});

test('recipe: SvelteKit page compiles for server and client', () => {
  const { compile } = require('svelte/compiler');
  for (const generate of ['server', 'client']) {
    const out = compile(src('sveltekit/+page.svelte'), { filename: '+page.svelte', generate });
    assert.ok(out.js.code.includes('tlp-icons/element'), `${generate}: import missing`);
  }
});

test('recipe: Astro page compiles', async () => {
  const { transform } = await import(pathToFileURL(require.resolve('@astrojs/compiler')).href);
  const out = await transform(src('astro/index.astro'), { filename: 'index.astro' });
  const errors = (out.diagnostics || []).filter(d => d.severity === 1);
  assert.deepEqual(errors, []);
  assert.ok(out.code.includes('tlp-icon'));
});
