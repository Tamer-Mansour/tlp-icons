#!/usr/bin/env node
// Renders the animated README previews (docs/media/*.gif, 24 fps) with Playwright + ffmpeg.
// Frames are deterministic: every animation is paused and seeked to the exact frame time, then screenshotted.
//   node scripts/make-previews.mjs        (needs: npm run build, npm run setup:browser, ffmpeg on PATH)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadPlaywright } from '../test/browser/pw.mjs';
import { testPage, ROOT } from '../test/browser/page.mjs';

const FPS = 24;
const OUT = path.join(ROOT, 'docs', 'media');
fs.mkdirSync(OUT, { recursive: true });

const CSS = `
body{margin:0;background:#fff;font:600 15px 'Segoe UI',system-ui,sans-serif;color:#0b1020}
.scene{width:560px;height:180px;display:flex;align-items:center;justify-content:center;gap:22px;position:relative;background:linear-gradient(135deg,#f8f9ff,#eef0ff)}
.cap{position:absolute;bottom:10px;left:0;right:0;text-align:center;font:500 12px ui-monospace,Consolas,monospace;color:#6b7591}
.btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:12px;background:#4f46e5;color:#fff;font-weight:600;transition:none;box-shadow:0 8px 20px -10px #4f46e5}
.btn.soft{background:#e0e3ff;color:#4338ca;box-shadow:none}
.btn.ghost{background:#fff;color:#0b1020;box-shadow:0 0 0 1px #e2e5ef}
.btn.hover{filter:brightness(1.12);transform:translateY(-2px)}
.btn tlp-icon{--tlp-size:20px;--tlp-stroke:2}
.cursor{position:absolute;width:22px;height:22px;pointer-events:none;z-index:9}
.tile{width:84px;height:84px;border-radius:22px;background:#fff;display:grid;place-items:center;color:#4f46e5;box-shadow:0 10px 24px -14px rgba(30,27,75,.4),0 0 0 1px #e7e9f1}
.tile tlp-icon{--tlp-size:44px;--tlp-stroke:1.75}
.panel{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 20px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px #e7e9f1}
.panel small{font:500 11px ui-monospace,Consolas,monospace;color:#6b7591}
.duo{--tlp-duo:.22}
.noduo{--tlp-duo:0}
`;
const CURSOR = '<svg class="cursor" viewBox="0 0 24 24"><path d="M5 3l14 8-6.5 1.5L10 19z" fill="#0b1020" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';

const SCENES = [
  {
    file: 'hover', seconds: 3.1,
    html: `<div class="scene" id="s"><span class="btn" data-k="0"><tlp-icon name="send"></tlp-icon>Send</span><span class="btn soft" data-k="1"><tlp-icon name="download"></tlp-icon>Download</span><span class="btn ghost" data-k="2"><tlp-icon name="trash-2"></tlp-icon>Delete</span>${CURSOR}<div class="cap">hover a button → its icon plays</div></div>`,
    // cursor travels to each button; the hovered button's icon starts at its hover time
    frame: `(t) => {
      const btns = [...document.querySelectorAll('.btn')];
      const starts = [0.15, 1.15, 2.15];
      const k = t < 1.0 ? 0 : t < 2.0 ? 1 : 2;
      const r = btns[k].getBoundingClientRect(), prev = btns[Math.max(0, k - 1)].getBoundingClientRect();
      const local = t - (k === 0 ? 0 : k);
      const ease = Math.min(1, local / 0.15);
      const x = (k === 0 ? r.left - 40 : prev.left + prev.width / 2) + ((r.left + r.width / 2) - (k === 0 ? r.left - 40 : prev.left + prev.width / 2)) * ease;
      const y = r.top + r.height / 2 + 4;
      const c = document.querySelector('.cursor'); c.style.left = x + 'px'; c.style.top = y + 'px';
      btns.forEach((b, i) => {
        b.classList.toggle('hover', i === k && local >= 0.15);
        const svg = b.querySelector('svg.tlp'); if (!svg) return;
        const dt = (t - starts[i]) * 1000;
        svg.classList.toggle('tlp-run', dt >= 0);
        svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.max(0, dt); });
      });
    }`,
  },
  {
    file: 'loop', seconds: 3.0,
    html: `<div class="scene" id="s"><div class="tile"><tlp-icon name="loader-circle" trigger="none"></tlp-icon></div><div class="tile"><tlp-icon name="refresh-cw" trigger="none"></tlp-icon></div><div class="tile"><tlp-icon name="settings" trigger="none"></tlp-icon></div><div class="tile"><tlp-icon name="hourglass" trigger="none"></tlp-icon></div><div class="cap">&lt;tlp-icon trigger="loop"&gt;</div></div>`,
    // loop = play, pause, play...: emulate the element's loop cycle exactly
    frame: `(t) => {
      document.querySelectorAll('svg.tlp').forEach((svg, i) => {
        const total = +svg.dataset.total, cycle = total + 350;
        const dt = ((t * 1000) + i * 120) % cycle;
        svg.classList.add('tlp-run');
        svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min(dt, total); });
      });
    }`,
  },
  {
    file: 'rtl', seconds: 1.6,
    html: `<div class="scene" id="s"><div class="panel"><span class="btn"><span>Next</span><tlp-icon name="arrow-right" flip="rtl"></tlp-icon></span><small>dir="ltr"</small></div><div class="panel" dir="rtl"><span class="btn"><span>التالي</span><tlp-icon name="arrow-right" flip="rtl"></tlp-icon></span><small>dir="rtl"</small></div><div class="cap">flip="rtl" mirrors the icon and its motion</div></div>`,
    frame: `(t) => {
      document.querySelectorAll('svg.tlp').forEach(svg => {
        svg.classList.add('tlp-run');
        svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = (t * 1000) % 1300; });
      });
    }`,
  },
  {
    file: 'duotone', seconds: 1.8,
    html: `<div class="scene" id="s"><div class="panel noduo"><div style="display:flex;gap:14px;color:#4f46e5"><tlp-icon name="file-text" size="40"></tlp-icon><tlp-icon name="shield-check" size="40"></tlp-icon><tlp-icon name="folder" size="40"></tlp-icon></div><small>default</small></div><div class="panel duo"><div style="display:flex;gap:14px;color:#4f46e5"><tlp-icon name="file-text" size="40" duotone></tlp-icon><tlp-icon name="shield-check" size="40" duotone></tlp-icon><tlp-icon name="folder" size="40" duotone></tlp-icon></div><small>duotone</small></div><div class="cap">&lt;tlp-icon duotone&gt; adds a soft tinted body</div></div>`,
    frame: `(t) => {
      document.querySelectorAll('svg.tlp').forEach((svg, i) => {
        svg.classList.add('tlp-run');
        svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.max(0, t * 1000 - (i % 3) * 120); });
      });
    }`,
  },
];

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tlp-previews-'));
const results = [];
try {
  for (const scene of SCENES) {
    const page = await browser.newPage({ viewport: { width: 560, height: 180 }, deviceScaleFactor: 1 });
    await page.goto(testPage(scene.html, { css: CSS, title: scene.file }));
    await page.waitForFunction(() => [...document.querySelectorAll('tlp-icon')].every(e => e.querySelector('svg.tlp')));
    await page.evaluate(() => document.fonts && document.fonts.ready);
    const frames = Math.round(scene.seconds * FPS);
    const dir = path.join(tmp, scene.file);
    fs.mkdirSync(dir);
    for (let k = 0; k < frames; k++) {
      await page.evaluate(`(${scene.frame})(${k / FPS})`);
      await page.locator('#s').screenshot({ path: path.join(dir, `f${String(k).padStart(3, '0')}.png`) });
    }
    await page.close();
    const gif = path.join(OUT, `${scene.file}.gif`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%03d.png'),
      '-vf', 'split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
      '-loop', '0', gif]);
    results.push({ file: path.relative(ROOT, gif).replace(/\\/g, '/'), frames, kb: Math.round(fs.statSync(gif).size / 1024) });
  }
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.table(results);
const tooBig = results.filter(r => r.kb > 500);
if (tooBig.length) { console.error(`over 500 KB: ${tooBig.map(r => r.file).join(', ')}`); process.exitCode = 1; }
