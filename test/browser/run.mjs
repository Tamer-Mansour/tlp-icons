#!/usr/bin/env node
// Browser tests (Playwright, optional): node test/browser/run.mjs  (run "npm run setup:browser" once first)
// Opens the gallery from file:// - no server, no network.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadPlaywright } from './pw.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'test', 'browser', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
const URL_ = pathToFileURL(path.join(ROOT, 'site', 'index.html')).href;
const MECHANICS = ['clock', 'alarm-clock', 'timer', 'watch', 'history', 'calendar-clock', 'hourglass', 'settings', 'cog', 'user-cog', 'bell', 'bell-ring', 'gavel', 'hammer', 'trash', 'trash-2', 'lock', 'lock-open', 'eye', 'check', 'circle-check', 'chart-column', 'arrow-up', 'arrow-right', 'download', 'cloud-rain', 'refresh-cw', 'heart', 'search', 'car'];

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
let failed = 0, passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log(`  ok   ${name}`); } catch (err) { failed++; console.log(`  FAIL ${name}\n       ${err.message.split('\n').join('\n       ')}`); }
}

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
await page.goto(URL_);
await page.waitForSelector('.card tlp-icon svg.tlp');
await page.waitForTimeout(300);

await test('gallery loads with zero console errors', async () => {
  assert.deepEqual(errors, []);
  const n = await page.locator('.card').count();
  assert.ok(n > 100, `only ${n} cards rendered`);
});

await test('hovering a card runs its animation and returns to rest', async () => {
  const card = page.locator('.card').nth(2);
  await page.mouse.move(5, 5);
  await card.hover();
  const running = await card.evaluate(c => c.querySelector('svg.tlp').classList.contains('tlp-run'));
  assert.ok(running, 'svg did not get the run class');
  const total = await card.evaluate(c => +c.querySelector('svg.tlp').dataset.total);
  await page.mouse.move(5, 5);
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
  await page.mouse.move(5, 5);
  await card.hover();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(80);
  assert.ok(await card.evaluate(c => c.querySelector('svg.tlp').classList.contains('tlp-run')));
});

await test('hovering a container with several icons animates none', async () => {
  await page.evaluate(() => {
    const box = document.createElement('div');
    box.id = 'multi';
    box.style.cssText = 'position:fixed;left:20px;bottom:20px;padding:20px;background:#fff;z-index:99;display:flex;gap:20px';
    box.innerHTML = '<span>label</span><tlp-icon name="bell"></tlp-icon><tlp-icon name="clock"></tlp-icon><div id="single" style="padding:10px"><b>x</b><tlp-icon name="heart"></tlp-icon></div>';
    document.body.appendChild(box);
  });
  await page.waitForTimeout(100);
  await page.mouse.move(5, 5);
  await page.hover('#multi span');
  const any = await page.evaluate(() => document.querySelectorAll('#multi > tlp-icon svg.tlp-run').length);
  assert.equal(any, 0, 'icons animated when hovering a multi-icon container');
  await page.mouse.move(5, 5);
  await page.hover('#single b');
  const one = await page.evaluate(() => !!document.querySelector('#single svg.tlp-run'));
  assert.ok(one, 'single-icon wrapper did not animate its icon');
  await page.evaluate(() => document.getElementById('multi').remove());
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

await test('drawer opens with copy snippets', async () => {
  await page.locator('.card').first().click();
  await page.waitForSelector('body.open');
  const code = await page.textContent('#d-code');
  assert.match(code, /<svg[^>]+viewBox="0 0 24 24"/);
  await page.click('[data-tab="react"]');
  assert.match(await page.textContent('#d-code'), /<tlp-icon name=/);
  await page.keyboard.press('Escape');
});

await test(`frame strips of ${MECHANICS.length} mechanic icons saved`, async () => {
  const strip = await browser.newPage({ viewport: { width: 1060, height: 100 }, deviceScaleFactor: 1 });
  await strip.goto(URL_);
  await strip.waitForFunction(() => window.TlpIcons && window.TlpIcons.getIcon('clock'));
  await strip.evaluate(() => {
    document.body.innerHTML = '';
    document.body.style.cssText = 'margin:0;background:#fff;--tlp-duo:.16';
  });
  const FRAMES = 10;
  const missing = [];
  await strip.evaluate(() => { document.body.innerHTML = '<div id="sheet"></div>'; });
  for (const name of MECHANICS) {
    const ok = await strip.evaluate(async ({ name, FRAMES }) => {
      if (!window.TlpIcons.getIcon(name)) return false;
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:6px;padding:5px 10px;font:11px monospace;align-items:center;color:#4f46e5';
      document.getElementById('sheet').appendChild(row);
      const total = window.TlpIcons.timings(window.TlpIcons.getIcon(name)).total;
      const label = document.createElement('div');
      label.style.cssText = 'width:90px;color:#0f172a';
      label.textContent = name;
      row.appendChild(label);
      for (let k = 0; k < FRAMES; k++) {
        const cell = document.createElement('div');
        cell.style.cssText = 'width:88px;height:80px;display:grid;place-items:center;background:#f5f5ff;border-radius:10px';
        const el = document.createElement('tlp-icon');
        el.setAttribute('name', name); el.setAttribute('size', '56'); el.setAttribute('stroke', '1.75'); el.setAttribute('trigger', 'none');
        cell.appendChild(el); row.appendChild(cell);
      }
      await new Promise(r => setTimeout(r, 60));
      [...row.querySelectorAll('svg.tlp')].forEach((svg, k) => {
        const t = (total * k) / (FRAMES - 1);
        svg.classList.add('tlp-run');
        svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min(t, total - 1); });
      });
      return true;
    }, { name, FRAMES });
    if (!ok) missing.push(name);
  }
  await strip.locator('#sheet').screenshot({ path: path.join(SHOTS, 'frame-strips.png') });
  await strip.close();
  assert.deepEqual(missing, [], `missing icons: ${missing.join(', ')}`);
});

await browser.close();
console.log(`\n${passed} passed, ${failed} failed. Frame strips: ${path.relative(ROOT, SHOTS)}`);
process.exitCode = failed ? 1 : 0;
