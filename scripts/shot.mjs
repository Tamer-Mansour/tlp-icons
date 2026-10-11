#!/usr/bin/env node
// Dev helper: screenshots of the gallery (opened from file://) into test/browser/shots/.
//   node scripts/shot.mjs [search terms...]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright } from '../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(ROOT, 'test', 'browser', 'shots');
fs.mkdirSync(out, { recursive: true });
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 1.5 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
const t = Date.now();
await page.goto(pathToFileURL(path.join(ROOT, 'site', 'index.html')).href);
await page.waitForSelector('.card tlp-icon svg');
console.log(`first icons after ${Date.now() - t} ms`);
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, 'top.png') });
for (const q of process.argv.slice(2)) {
  await page.fill('#q', q);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, `q-${q.replace(/\W+/g, '_')}.png`) });
}
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await mobile.goto(pathToFileURL(path.join(ROOT, 'site', 'index.html')).href);
await mobile.waitForSelector('.card tlp-icon svg');
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: path.join(out, 'mobile.png') });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
