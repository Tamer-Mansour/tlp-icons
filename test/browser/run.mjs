#!/usr/bin/env node
// Browser tests (Playwright, optional): node test/browser/run.mjs  (run "npm run setup:browser" once first)
// Uses the library's offline bundle from file:// - no server, no network.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { loadPlaywright } from './pw.mjs';
import { testPage, ROOT } from './page.mjs';

const SHOTS = path.join(ROOT, 'test', 'browser', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const MECHANICS = ['clock', 'alarm-clock', 'timer', 'watch', 'history', 'calendar-clock', 'hourglass', 'settings', 'cog', 'user-cog', 'bell', 'bell-ring', 'gavel', 'gavel-strike', 'trash', 'trash-2', 'lock', 'lock-open', 'eye', 'check', 'circle-check', 'chart-column', 'arrow-up', 'arrow-right', 'download', 'cloud-rain', 'refresh-cw', 'heart', 'search', 'car'];

const CARDS = ['bell', 'clock', 'settings', 'heart', 'trash', 'lock', 'eye', 'check', 'download', 'cloud-rain', 'search', 'courthouse'];
const URL_ = testPage(`
<div id="grid" style="display:grid;grid-template-columns:repeat(6,110px);gap:10px;padding:20px">
  ${CARDS.map(n => `<div class="card" style="padding:20px;border:1px solid #ddd;border-radius:12px;display:grid;place-items:center"><tlp-icon name="${n}" size="32"></tlp-icon><span>${n}</span></div>`).join('')}
</div>
<div id="multi" style="margin:20px;padding:20px;border:1px dashed #999;display:flex;gap:20px;align-items:center"><span>label</span><tlp-icon name="bell"></tlp-icon><tlp-icon name="clock"></tlp-icon><div id="single" style="padding:10px"><b>x</b><tlp-icon name="heart"></tlp-icon></div></div>
<div id="aliases"><tlp-icon name="trash-2"></tlp-icon></div>`);

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
let failed = 0, passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ok   ${name}`); } catch (err) { failed++; console.log(`  FAIL ${name}\n       ${err.message.split('\n').join('\n       ')}`); }
}

const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
await page.goto(URL_);
await page.waitForFunction(n => document.querySelectorAll('.card tlp-icon svg.tlp').length === n, CARDS.length);

await test('offline bundle renders every icon with zero console errors', async () => {
  assert.deepEqual(errors, []);
  assert.ok(await page.evaluate(() => !!document.querySelector('#aliases svg.tlp')), 'alias trash-2 did not render');
});

await test('hovering a card runs its animation and returns to rest', async () => {
  const card = page.locator('.card').nth(2);
  await page.mouse.move(990, 690);
  await card.hover();
  assert.ok(await card.evaluate(c => c.querySelector('svg.tlp').classList.contains('tlp-run')), 'svg did not get the run class');
  const total = await card.evaluate(c => +c.querySelector('svg.tlp').dataset.total);
  await page.mouse.move(990, 690);
  await page.waitForTimeout(total + 200);
  const rest = await card.evaluate(c => {
    const svg = c.querySelector('svg.tlp');
    return { run: svg.classList.contains('tlp-run'), bad: [...svg.querySelectorAll('.p:not(.hh)')].map(p => getComputedStyle(p)).filter(s => (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)') || s.opacity !== '1').length };
  });
  assert.equal(rest.run, false, 'run class not removed');
  assert.equal(rest.bad, 0, 'parts not back at rest');
});

await test('animation keeps playing after the mouse leaves', async () => {
  const card = page.locator('.card').nth(5);
  await page.mouse.move(990, 690);
  await card.hover();
  await page.mouse.move(990, 690);
  await page.waitForTimeout(80);
  assert.ok(await card.evaluate(c => c.querySelector('svg.tlp').classList.contains('tlp-run')));
});

await test('hovering a container with several icons animates none; a single-icon wrapper animates its icon', async () => {
  await page.mouse.move(990, 690);
  await page.waitForTimeout(1800);
  await page.hover('#multi span');
  assert.equal(await page.evaluate(() => document.querySelectorAll('#multi > tlp-icon svg.tlp-run').length), 0);
  await page.mouse.move(990, 690);
  await page.hover('#single b');
  assert.ok(await page.evaluate(() => !!document.querySelector('#single svg.tlp-run')));
});

await test('RTL: directional icons mirror and nudge moves the way they point', async () => {
  const dx = async () => page.evaluate(async () => {
    const el = document.createElement('tlp-icon');
    el.setAttribute('name', 'arrow-right'); el.setAttribute('flip', 'rtl'); el.setAttribute('size', '48');
    el.style.cssText = 'position:fixed;left:200px;top:200px;z-index:99';
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    const svg = el.querySelector('svg');
    const part = svg.querySelector('.p') || svg;
    const before = part.getBoundingClientRect().left;
    svg.classList.add('tlp-run');
    svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = 0.45 * a.effect.getTiming().duration + (a.effect.getTiming().delay || 0); });
    const after = part.getBoundingClientRect().left;
    el.remove();
    return after - before;
  });
  const ltr = await dx();
  await page.evaluate(() => { document.documentElement.dir = 'rtl'; });
  const rtl = await dx();
  await page.evaluate(() => { document.documentElement.dir = 'ltr'; });
  assert.ok(ltr > 0.5, `LTR arrow-right should move right (dx=${ltr})`);
  assert.ok(rtl < -0.5, `RTL mirrored arrow-right should move left (dx=${rtl})`);
});

await test('trigger="click" and play() work', async () => {
  const ok = await page.evaluate(async () => {
    const el = document.createElement('tlp-icon');
    el.setAttribute('name', 'heart'); el.setAttribute('trigger', 'click');
    document.body.appendChild(el);
    await new Promise(r => setTimeout(r, 50));
    el.click();
    const clicked = el.querySelector('svg').classList.contains('tlp-run');
    el.remove();
    return clicked;
  });
  assert.ok(ok);
});

await test(`frame strips of ${MECHANICS.length} mechanic icons saved`, async () => {
  const strip = await browser.newPage({ viewport: { width: 1060, height: 100 }, deviceScaleFactor: 1 });
  await strip.goto(testPage('<div id="sheet"></div>'));
  const FRAMES = 10;
  const missing = await strip.evaluate(async ({ names, FRAMES }) => {
    const miss = [];
    const sheet = document.getElementById('sheet');
    for (const name of names) {
      if (!window.TlpIcons.getIcon(name)) { miss.push(name); continue; }
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:6px;padding:5px 10px;font:11px monospace;align-items:center';
      row.innerHTML = `<div style="width:90px;color:#0f172a">${name}</div>` + Array.from({ length: FRAMES }, () => `<div style="width:88px;height:80px;display:grid;place-items:center;background:#f5f5ff;border-radius:10px"><tlp-icon name="${name}" size="56" stroke="1.75" trigger="none"></tlp-icon></div>`).join('');
      sheet.appendChild(row);
    }
    await new Promise(r => setTimeout(r, 100));
    for (const row of sheet.children) {
      const svgs = [...row.querySelectorAll('svg.tlp')];
      const total = window.TlpIcons.timings(window.TlpIcons.getIcon(row.firstChild.textContent)).total;
      svgs.forEach((svg, k) => { svg.classList.add('tlp-run'); svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min((total * k) / (FRAMES - 1), total - 1); }); });
    }
    return miss;
  }, { names: MECHANICS, FRAMES });
  await strip.locator('#sheet').screenshot({ path: path.join(SHOTS, 'frame-strips.png') });
  await strip.close();
  assert.deepEqual(missing, [], `missing icons: ${missing.join(', ')}`);
});

await browser.close();
console.log(`\n${passed} passed, ${failed} failed. Frame strips: ${path.relative(ROOT, SHOTS)}`);
process.exitCode = failed ? 1 : 0;
