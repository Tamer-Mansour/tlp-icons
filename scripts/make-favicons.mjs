#!/usr/bin/env node
// One-time helper: renders src/site/favicon.svg into PNGs (favicon-32, apple-touch-icon 180, og-image 1200x630).
// Output is committed, so the normal build never needs a browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright } from '../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'src', 'site');
const svg = fs.readFileSync(path.join(SITE, 'favicon.svg'), 'utf8');
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();

async function render(file, w, h, html) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden">${html}</body></html>`);
  await page.screenshot({ path: path.join(SITE, file), omitBackground: true });
  await page.close();
}
const sized = s => svg.replace('<svg ', `<svg width="${s}" height="${s}" style="display:block" `);
await render('favicon-32.png', 32, 32, sized(32));
// iOS draws its own rounded corners: give it a full-bleed square
await render('apple-touch-icon.png', 180, 180, sized(180).replace('rx="15"', 'rx="0"'));

const s = fs.readFileSync(path.join(ROOT, 'site', 'data.js'), 'utf8');
const D = JSON.parse(s.slice(s.indexOf('=') + 1).trim().replace(/;$/, ''));
const pick = ['bell', 'clock', 'settings', 'heart', 'cloud-rain', 'camera', 'map-pin', 'rocket', 'trophy', 'calendar', 'mail', 'search', 'lock', 'chart-column', 'music', 'sun'];
const icons = pick.map(n => D.icons.find(i => i.n === n)).filter(Boolean)
  .map(i => `<div style="width:96px;height:96px;border-radius:24px;background:#eef0ff;display:grid;place-items:center;color:#4f46e5"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><style>.d{fill:currentColor;fill-opacity:.16}.f{fill:currentColor}</style>${i.svg}</svg></div>`).join('');
await render('og-image.png', 1200, 630, `
<div style="width:1200px;height:630px;background:linear-gradient(135deg,#f8f9ff,#eceefe);font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;gap:56px;padding:0 72px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:18px">${sized(84)}<span style="font-size:58px;font-weight:800;color:#0f172a;letter-spacing:-1.5px">tlp-icons</span></div>
    <div style="font-size:40px;font-weight:700;color:#0f172a;margin-top:30px;line-height:1.15">Every icon, animated.</div>
    <div style="font-size:24px;color:#475569;margin-top:16px;line-height:1.4">${D.icons.length.toLocaleString('en')} free open-source icons · ${D.categories.length} categories · MIT</div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,96px);gap:16px">${icons}</div>
</div>`);
await browser.close();
console.log('favicon-32.png, apple-touch-icon.png, og-image.png written to src/site/');
