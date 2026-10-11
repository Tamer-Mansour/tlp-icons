// Dev helper: screenshots of the built site pages (desktop + phone) and a console-error check.
//   node scripts/shots.mjs     (expects scripts/serve.mjs running on 4321)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from '../../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'test', 'browser', 'shots', 'web');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:4321';
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/icons/', '/icons/bell/', '/categories/', '/categories/legal/', '/categories/brands/', '/docs/', '/roadmap/'];
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const errors = [];
for (const [label, vp] of [['desk', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(`${label} ${page.url()}: ${e.message}`));
  page.on('console', m => m.type() === 'error' && errors.push(`${label} ${page.url()}: ${m.text()}`));
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const name = (p.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home') + `-${label}.png`;
    await page.screenshot({ path: path.join(OUT, name), fullPage: label === 'desk' && ['/', '/roadmap/', '/docs/'].includes(p) ? false : false });
  }
  await page.close();
}
await browser.close();
console.log('errors:', errors.length ? errors : 'none');
