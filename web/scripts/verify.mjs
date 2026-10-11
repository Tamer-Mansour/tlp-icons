// Dev check of the built site (expects scripts/serve.mjs on :4321): console errors, hover tile, icon page runtime.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from '../../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'test', 'browser', 'shots', 'web');
fs.mkdirSync(SHOTS, { recursive: true });
const BASE = 'http://localhost:4321';
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
const cdn = new Set();
page.on('pageerror', e => errors.push(`${page.url()}: ${e.message}`));
page.on('console', m => m.type() === 'error' && errors.push(`${page.url()}: ${m.text()}`));
page.on('response', r => { if (r.url().includes('cdn.jsdelivr.net/npm/tlp-icons')) cdn.add(`${r.status()} ${r.url().replace(/^.*tlp-icons@/, 'tlp-icons@')}`); });

// 1. gallery hover: icon must stay visible (white on the solid tile)
await page.goto(`${BASE}/icons/?q=license`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const card = page.locator('a[title="license"]').first();
await card.hover();
await page.waitForTimeout(400);
const hover = await card.evaluate(a => {
  const tile = a.querySelector('.tile');
  const svg = tile.querySelector('svg');
  return { bg: getComputedStyle(tile).backgroundColor, icon: getComputedStyle(svg || tile).color };
});
await card.screenshot({ path: path.join(SHOTS, 'hover-license.png') });

// 2. category page grid hover
await page.goto(`${BASE}/categories/legal/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const cat = page.locator('.ig a').nth(3);
await cat.hover();
await page.waitForTimeout(400);
const catHover = await cat.evaluate(a => ({ bg: getComputedStyle(a.firstElementChild).backgroundColor, icon: getComputedStyle(a.firstElementChild).color }));
await page.screenshot({ path: path.join(SHOTS, 'legal-category.png') });

// 3. light icon page with runtime from the npm CDN
await page.goto(`${BASE}/icons/courthouse/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const iconPage = await page.evaluate(() => ({
  playground: !!document.querySelector('#pg [data-play]'),
  defined: !!customElements.get('tlp-icon'),
  rendered: document.querySelectorAll('tlp-icon svg.tlp').length,
  code: document.querySelector('[data-code]')?.textContent.slice(0, 40),
}));
await page.click('[data-tab="4"]');
await page.waitForTimeout(300);
const svgTab = await page.evaluate(() => document.querySelector('[data-code]').textContent.slice(0, 30));
await page.screenshot({ path: path.join(SHOTS, 'icon-page-light.png') });

// 4. home + docs + roadmap for console errors
for (const p of ['/', '/docs/', '/roadmap/', '/categories/']) { await page.goto(BASE + p, { waitUntil: 'networkidle' }); await page.waitForTimeout(400); }
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(SHOTS, 'home.png') });

console.log(JSON.stringify({ hover, catHover, iconPage, svgTab, cdn: [...cdn].slice(0, 4), errors }, null, 2));
await browser.close();
