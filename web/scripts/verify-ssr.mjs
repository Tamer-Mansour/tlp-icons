// Dev check (expects scripts/serve.mjs on :4321): the home count and the gallery's first screen are in the static
// HTML (visible with JavaScript disabled) and survive hydration with JavaScript on.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from '../../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = 'http://localhost:4321';
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const result = {};

const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
const p1 = await noJs.newPage();
await p1.goto(`${BASE}/`);
result.noJsHeroCount = await p1.evaluate(() => document.querySelector('dl dt')?.textContent);
await p1.goto(`${BASE}/icons/`);
result.noJsVisibleSvgs = await p1.evaluate(() => [...document.querySelectorAll('ul tlp-icon svg')].filter(s => { const r = s.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight; }).length);
await p1.screenshot({ path: path.join(ROOT, 'test', 'browser', 'shots', 'web', 'icons-nojs.png') });

const js = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p2 = await js.newPage();
const errors = [];
p2.on('pageerror', e => errors.push(e.message));
p2.on('console', m => m.type() === 'error' && errors.push(m.text()));
await p2.goto(`${BASE}/icons/`, { waitUntil: 'networkidle' });
await p2.waitForTimeout(1500);
result.jsRenderedSvgs = await p2.evaluate(() => document.querySelectorAll('ul tlp-icon svg.tlp').length);
result.jsEmptyFirstScreen = await p2.evaluate(() => [...document.querySelectorAll('ul tlp-icon')].slice(0, 48).filter(e => !e.querySelector('svg')).length);
await p2.fill('input[type=search]', 'gavel');
await p2.waitForTimeout(500);
result.searchWorks = await p2.evaluate(() => document.querySelectorAll('ul li').length);
result.errors = errors;
console.log(JSON.stringify(result, null, 2));
await browser.close();
