#!/usr/bin/env node
// Dev helper: frame strips (animation frozen at 8 points) for visual review, rendered with the offline bundle.
//   node scripts/strips.mjs out-name icon-a icon-b ...
//   node scripts/strips.mjs out-name --random 40 [--generated] [--seed 7]
import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright } from '../test/browser/pw.mjs';
import { testPage, readData, ROOT } from '../test/browser/page.mjs';

const [outName, ...rest] = process.argv.slice(2);
let names = rest.filter(a => !a.startsWith('--') && !/^\d+$/.test(a));
if (rest.includes('--random')) {
  const n = +rest[rest.indexOf('--random') + 1] || 40;
  const D = readData();
  const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'motion-rules.json'), 'utf8'));
  const pool = Object.keys(D.icons).filter(name => !rest.includes('--generated') || !/^(override|original)$/.test(rules[name]));
  let seed = +(rest[rest.indexOf('--seed') + 1]) || 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  names = [];
  while (names.length < n && pool.length) names.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
}
const FRAMES = 8;
const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 200 } });
await page.goto(testPage('<div id="sheet"></div>'));
await page.evaluate(async ({ names, FRAMES }) => {
  const sheet = document.getElementById('sheet');
  for (const name of names) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:4px;padding:3px 8px;font:10px monospace;align-items:center';
    row.innerHTML = `<div style="width:150px;color:#0f172a;overflow:hidden">${name}</div>` + Array.from({ length: FRAMES }, () => `<div style="width:62px;height:56px;display:grid;place-items:center;background:#f5f5ff;border-radius:8px"><tlp-icon name="${name}" size="40" stroke="1.75" trigger="none"></tlp-icon></div>`).join('');
    sheet.appendChild(row);
  }
  await new Promise(r => setTimeout(r, 100));
  for (const row of sheet.children) {
    const svgs = [...row.querySelectorAll('svg.tlp')];
    const total = +svgs[0]?.dataset.total || 0;
    svgs.forEach((svg, k) => { svg.classList.add('tlp-run'); svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min((total * k) / (FRAMES - 1), total - 1); }); });
  }
}, { names, FRAMES });
const out = path.join(ROOT, 'test', 'browser', 'shots', `${outName}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });
await page.locator('#sheet').screenshot({ path: out });
await browser.close();
console.log(out);
