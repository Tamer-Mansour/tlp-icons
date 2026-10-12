#!/usr/bin/env node
// Smoke tests against the packed tarball in fresh projects (needs network for npm install):
//   Vite + React 18, Vite + React 19, Next.js 15 App Router.
// Each project: npm install <tarball>, tsc --noEmit, production build, then a real browser checks that
// <tlp-icon name="bell"> renders (and for Next.js that the server renders the page without crashing).
//   node scripts/smoke.mjs [vite-react18|vite-react19|next15 ...]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from '../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(os.tmpdir(), 'tlp-icons-smoke');
const isWin = process.platform === 'win32';
// the shell is only needed for npm/npx (.cmd shims on Windows); node runs directly so inline code is not split
const sh = (cmd, args, cwd, opts = {}) => execFileSync(cmd, args, { cwd, encoding: 'utf8', shell: isWin && cmd !== process.execPath, stdio: ['ignore', 'pipe', 'pipe'], ...opts });

fs.mkdirSync(TMP, { recursive: true });
const packed = JSON.parse(sh('npm', ['pack', '--json', '--pack-destination', TMP], ROOT).replace(/^[^[]*/, ''));
const tarball = path.join(TMP, packed[0].filename);
console.log(`packed ${packed[0].filename}: ${(packed[0].size / 1024).toFixed(0)} KB, ${(packed[0].unpackedSize / 1048576).toFixed(2)} MB unpacked, ${packed[0].entryCount} files`);

const tsconfig = {
  compilerOptions: { target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: false, isolatedModules: true },
  include: ['src'],
};
const viteApp = (react) => ({
  'package.json': JSON.stringify({ name: `smoke-vite-react${react}`, private: true, type: 'module', scripts: { build: 'vite build' } }, null, 2),
  'tsconfig.json': JSON.stringify(tsconfig, null, 2),
  'index.html': '<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
  'vite.config.ts': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins: [react()] });\n",
  'src/main.tsx': react === 18
    ? "import { createRoot } from 'react-dom/client';\nimport { App } from './App';\ncreateRoot(document.getElementById('root')!).render(<App />);\n"
    : "import { createRoot } from 'react-dom/client';\nimport { App } from './App';\ncreateRoot(document.getElementById('root')!).render(<App />);\n",
  'src/App.tsx': react === 18
    // React 18: the wrapper + the bare tag typed by tlp-icons/jsx
    ? "import 'tlp-icons/jsx';\nimport { TlpIcon } from 'tlp-icons/react';\n\nexport function App() {\n  return (\n    <main>\n      <tlp-icon id=\"tag\" name=\"bell\" />\n      <TlpIcon id=\"wrapped\" name=\"bell\" size={32} duotone={false} trigger=\"click\" />\n    </main>\n  );\n}\n"
    // React 19: the bare tag
    : "import 'tlp-icons/element';\nimport 'tlp-icons/jsx';\n\nexport function App() {\n  return (\n    <main>\n      <tlp-icon id=\"tag\" name=\"bell\" size={32} duotone />\n    </main>\n  );\n}\n",
});
const PROJECTS = {
  'vite-react18': {
    files: viteApp(18),
    deps: ['react@18', 'react-dom@18', '@types/react@18', '@types/react-dom@18', 'vite@latest', '@vitejs/plugin-react@latest', 'typescript@5'],
    build: ['npx', ['vite', 'build']], kind: 'static', out: 'dist',
  },
  'vite-react19': {
    files: viteApp(19),
    deps: ['react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', 'vite@latest', '@vitejs/plugin-react@latest', 'typescript@5'],
    build: ['npx', ['vite', 'build']], kind: 'static', out: 'dist',
  },
  next15: {
    files: {
      'package.json': JSON.stringify({ name: 'smoke-next15', private: true, scripts: { build: 'next build', start: 'next start' } }, null, 2),
      'tsconfig.json': JSON.stringify({ compilerOptions: { target: 'ES2022', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: false, skipLibCheck: false, strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: false, plugins: [{ name: 'next' }] }, include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'], exclude: ['node_modules'] }, null, 2),
      'next-env.d.ts': '/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n',
      'app/layout.tsx': "export const metadata = { title: 'smoke' };\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <html lang=\"en\"><body>{children}</body></html>;\n}\n",
      // server component importing the element directly: must not crash the server
      'app/page.tsx': "import 'tlp-icons/element';\nimport { Icon } from './Icon';\n\nexport default function Page() {\n  return (\n    <main>\n      <Icon name=\"bell\" />\n    </main>\n  );\n}\n",
      'app/Icon.tsx': fs.readFileSync(path.join(ROOT, 'test', 'recipes', 'nextjs', 'app', 'components', 'Icon.tsx'), 'utf8'),
    },
    deps: ['next@15', 'react@19', 'react-dom@19', '@types/react@19', '@types/react-dom@19', '@types/node@22', 'typescript@5'],
    build: ['npx', ['next', 'build']], kind: 'next',
  },
};

async function serveStatic(dir) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  const server = http.createServer((req, res) => {
    let f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  await new Promise(r => server.listen(0, r));
  return { url: `http://localhost:${server.address().port}/`, close: () => server.close() };
}

async function startNext(dir) {
  const port = 3900 + Math.floor(Math.random() * 90);
  const child = spawn(isWin ? 'npx.cmd' : 'npx', ['next', 'start', '-p', String(port)], { cwd: dir, shell: isWin, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stdout.on('data', d => { log += d; });
  child.stderr.on('data', d => { log += d; });
  for (let k = 0; k < 60; k++) {
    await new Promise(r => setTimeout(r, 1000));
    try { const r = await fetch(`http://localhost:${port}/`); if (r.status) break; } catch {}
  }
  return { url: `http://localhost:${port}/`, close: () => { if (isWin) { try { execFileSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {} } else child.kill(); }, log: () => log };
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROJECTS);
const results = [];
for (const name of wanted) {
  const p = PROJECTS[name];
  const dir = path.join(TMP, name);
  const r = { project: name };
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    for (const [rel, content] of Object.entries(p.files)) { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), content); }
    sh('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', ...p.deps, tarball], dir, { timeout: 600000 });
    r.tlpIcons = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', 'tlp-icons', 'package.json'), 'utf8')).version;
    r.react = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', 'react', 'package.json'), 'utf8')).version;
    // Node-only import of the element (server safety)
    sh(process.execPath, ['--input-type=module', '-e', "await import('tlp-icons/element'); await import('tlp-icons/react');"], dir);
    r.nodeImport = 'ok';
    try { sh('npx', ['tsc', '--noEmit', '-p', '.'], dir, { timeout: 300000 }); r.tsc = '0 errors'; } catch (e) { r.tsc = `ERRORS:\n${e.stdout}${e.stderr}`; throw new Error('tsc failed'); }
    try { sh(p.build[0], p.build[1], dir, { timeout: 600000 }); r.build = 'ok'; } catch (e) { r.build = `FAILED:\n${(e.stdout || '').slice(-1500)}${(e.stderr || '').slice(-1500)}`; throw new Error('build failed'); }
    const srv = p.kind === 'next' ? await startNext(dir) : await serveStatic(path.join(dir, p.out));
    try {
      if (p.kind === 'next') {
        const res = await fetch(srv.url);
        const html = await res.text();
        r.serverRender = `${res.status}${/<tlp-icon[^>]*name="bell"/.test(html) ? ', tag in server HTML' : ', TAG MISSING'}`;
        if (/HTMLElement is not defined|ReferenceError/.test(srv.log())) r.serverRender += ', SERVER ERROR IN LOG';
      }
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => m.type() === 'error' && errors.push(m.text()));
      await page.goto(srv.url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => document.querySelector('tlp-icon[name="bell"] svg.tlp'), null, { timeout: 15000 });
      r.browser = await page.evaluate(() => {
        const icons = [...document.querySelectorAll('tlp-icon[name="bell"]')];
        const wrapped = document.getElementById('wrapped');
        return `${icons.filter(i => i.querySelector('svg.tlp')).length}/${icons.length} rendered${wrapped ? `, wrapper duotone attr: ${wrapped.getAttribute('duotone') === null ? 'absent (correct)' : JSON.stringify(wrapped.getAttribute('duotone'))}` : ''}`;
      });
      r.consoleErrors = errors.length ? errors.slice(0, 3) : 'none';
      await page.close();
    } finally { srv.close(); }
    r.result = 'PASS';
  } catch (err) {
    r.result = `FAIL (${err.message.split('\n')[0]})`;
  }
  results.push(r);
  console.log(JSON.stringify(r, null, 2));
}
await browser.close();
const failed = results.filter(r => r.result !== 'PASS');
console.log(`\n${results.length - failed.length}/${results.length} smoke tests passed`);
process.exitCode = failed.length ? 1 : 0;
