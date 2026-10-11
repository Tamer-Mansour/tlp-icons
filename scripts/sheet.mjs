#!/usr/bin/env node
// Dev helper: static contact sheet (icons at rest, large) for visual review.
//   node scripts/sheet.mjs out-name --category legal [--source tlp]   or   node scripts/sheet.mjs out-name name1 name2 ...
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright } from '../test/browser/pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outName, ...args] = process.argv.slice(2);
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'tlp-icons.json'), 'utf8'));
let names = args.filter(a => !a.startsWith('--'));
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
if (opt('--category')) names = Object.keys(D.icons).filter(n => D.icons[n].category === opt('--category') && (!opt('--source') || D.icons[n].source === opt('--source')));
const cells = names.map(n => `<div class="c"><svg viewBox="0 0 24 24" class="tlp" style="--tlp-duo:.16">${D.icons[n].svg}</svg><span>${n}</span></div>`).join('');
const css = fs.readFileSync(path.join(ROOT, 'src', 'runtime', 'tlp-icons.css'), 'utf8');
const html = `<!doctype html><style>${css}body{margin:0;font:11px monospace;background:#fff}.g{display:grid;grid-template-columns:repeat(8,120px);gap:8px;padding:12px}.c{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px;background:#f5f5ff;border-radius:10px;color:#4f46e5}.c svg{width:56px;height:56px;stroke-width:1.75}.c span{color:#0f172a;text-align:center;word-break:break-all}</style><div class="g">${cells}</div>`;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1010, height: 400 }, deviceScaleFactor: 1 });
await page.setContent(html);
const out = path.join(ROOT, 'test', 'browser', 'shots', `${outName}.png`);
await page.locator('.g').screenshot({ path: out });
await browser.close();
console.log(`${names.length} icons -> ${out}`);
