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
body{margin:0;background:#FAF4ED;font:600 15px 'Segoe UI',system-ui,sans-serif;color:#2B2228}
.scene{width:560px;height:180px;display:flex;align-items:center;justify-content:center;gap:22px;position:relative;background:linear-gradient(135deg,#FAF4ED,#f3e4e0)}
.cap{position:absolute;bottom:10px;left:0;right:0;text-align:center;font:500 12px ui-monospace,Consolas,monospace;color:#8f7d86}
.btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:12px;background:#741D3D;color:#fff;font-weight:600;transition:none;box-shadow:0 8px 20px -10px #741D3D}
.btn.soft{background:#f0cdd8;color:#5e1832;box-shadow:none}
.btn.ghost{background:#fff;color:#2B2228;box-shadow:0 0 0 1px #e3d6cc}
.btn.hover{filter:brightness(1.12);transform:translateY(-2px)}
.btn tlp-icon{--tlp-size:20px;--tlp-stroke:2}
.cursor{position:absolute;width:22px;height:22px;pointer-events:none;z-index:9}
.tile{width:84px;height:84px;border-radius:22px;background:#fff;display:grid;place-items:center;color:#741D3D;box-shadow:0 10px 24px -14px rgba(30,27,75,.4),0 0 0 1px #eadfd6}
.tile tlp-icon{--tlp-size:44px;--tlp-stroke:1.75}
.panel{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 20px;border-radius:16px;background:#fff;box-shadow:0 0 0 1px #eadfd6}
.panel small{font:500 11px ui-monospace,Consolas,monospace;color:#8f7d86}
.duo{--tlp-duo:.22}
.noduo{--tlp-duo:0}
.scene.tall{height:236px;flex-direction:column;gap:10px}
.row{display:flex;gap:12px}
.mini{width:64px;height:64px;border-radius:18px;background:#fff;display:grid;place-items:center;color:#741D3D;box-shadow:0 8px 20px -14px rgba(30,27,75,.4),0 0 0 1px #eadfd6;--tlp-duo:.18}
.mini tlp-icon{--tlp-size:34px;--tlp-stroke:1.75}
.field{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 12px 8px;border-radius:16px;background:#fff;color:#741D3D;box-shadow:0 0 0 1px #eadfd6;--tlp-duo:.18}
.field .icons{display:flex;gap:8px}
.field tlp-icon{--tlp-size:30px;--tlp-stroke:1.75}
.field small{font:600 11px 'Segoe UI',system-ui,sans-serif;color:#8f7d86}
.tile.on{box-shadow:0 14px 30px -14px rgba(79,70,229,.55),0 0 0 2px #de97ab}
`;
// loop every icon of a scene: play, short pause, play... (staggered so the grid never moves in lockstep)
const LOOP_ALL = gap => `(t) => {
  document.querySelectorAll('svg.tlp').forEach((svg, i) => {
    const total = +svg.dataset.total, cycle = total + ${gap};
    const dt = ((t * 1000) + i * 170) % cycle;
    svg.classList.add('tlp-run');
    svg.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.min(dt, total); });
  });
}`;
const CURSOR = '<svg class="cursor" viewBox="0 0 24 24"><path d="M5 3l14 8-6.5 1.5L10 19z" fill="#2B2228" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';

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
    file: 'hold', seconds: 4.4,
    html: `<div class="scene" id="s"><div class="tile"><tlp-icon name="trash" trigger="hold"></tlp-icon></div><div class="tile"><tlp-icon name="bell" trigger="hold"></tlp-icon></div><div class="tile"><tlp-icon name="lock-open" trigger="hold"></tlp-icon></div>${CURSOR}<div class="cap">&lt;tlp-icon trigger="hold"&gt; animates, stays while hovered, returns on leave</div></div>`,
    // the cursor rests on each tile in turn; each icon runs to its hold point (TlpIcons.HOLD), stays, then plays back
    frame: `(t) => {
      const tiles = [...document.querySelectorAll('.tile')];
      const span = [[0.3, 1.5], [1.7, 2.9], [3.1, 4.0]];
      const c = document.querySelector('.cursor');
      const at = k => { const r = tiles[k].getBoundingClientRect(); return [r.left + r.width / 2 + 6, r.top + r.height / 2 + 8]; };
      let k = span.findIndex(([a, b]) => t >= a && t < b);
      let x, y;
      if (k >= 0) [x, y] = at(k);
      else {
        const prev = t < 0.3 ? -1 : span.findIndex(([, b], i) => t >= b && (i === span.length - 1 || t < span[i + 1][0]));
        const from = prev < 0 ? [at(0)[0] - 120, at(0)[1] + 30] : at(prev);
        const to = prev === span.length - 1 ? [from[0] + 140, from[1] + 30] : at(prev + 1);
        const t0 = prev < 0 ? 0 : span[prev][1], t1 = prev === span.length - 1 ? 4.4 : span[prev + 1][0];
        const e = Math.min(1, (t - t0) / (t1 - t0));
        x = from[0] + (to[0] - from[0]) * e; y = from[1] + (to[1] - from[1]) * e;
      }
      c.style.left = x + 'px'; c.style.top = y + 'px';
      tiles.forEach((tile, i) => {
        const svg = tile.querySelector('svg.tlp'); if (!svg) return;
        const [s, e] = span[i];
        tile.classList.toggle('on', t >= s && t < e);
        const anims = svg.getAnimations({ subtree: true });
        if (t < s) { svg.classList.remove('tlp-run'); return; }
        svg.classList.add('tlp-run');
        let done = true;
        svg.getAnimations({ subtree: true }).forEach(a => {
          const tm = a.effect.getTiming(), end = (+tm.delay || 0) + (+tm.duration || 0);
          const h = TlpIcons.HOLD[(a.animationName || '').replace('tlp-', '')];
          const stop = h === undefined ? end : (+tm.delay || 0) + h * (+tm.duration || 0);
          a.pause();
          if (h === undefined) { a.currentTime = end; return; }
          const held = Math.min((Math.min(t, e) - s) * 1000, stop);
          const cur = t < e ? held : Math.max(0, held - (t - e) * 1000);
          if (cur > 0) done = false;
          a.currentTime = cur;
        });
        if (t >= e && done) svg.classList.remove('tlp-run');
      });
    }`,
  },
  {
    file: 'animations', seconds: 3.4, height: 236,
    html: `<div class="scene tall" id="s" style="height:236px"><div class="row">${['vibrate', 'heart-pulse', 'flame', 'sparkle', 'plant', 'flag-up'].map(n => `<div class="mini"><tlp-icon name="${n}" trigger="none"></tlp-icon></div>`).join('')}</div><div class="row">${['ship', 'truck', 'rocket', 'gift', 'hand', 'droplet'].map(n => `<div class="mini"><tlp-icon name="${n}" trigger="none"></tlp-icon></div>`).join('')}</div><div class="cap" style="position:static">66 animations: buzz, beat, flicker, sway, flutter, drive, wave, drip...</div></div>`,
    frame: LOOP_ALL(500),
  },
  {
    file: 'fields', seconds: 3.4, height: 236,
    html: `<div class="scene tall" id="s" style="height:236px"><div class="row">${[['Health', ['epinephrine-pen', 'thyroid-gland', 'iv-drip-stand']], ['Finance', ['send-money', 'ach-transfer', 'ipo-launch']]].map(([t, ns]) => `<div class="field"><div class="icons">${ns.map(n => `<tlp-icon name="${n}" trigger="none"></tlp-icon>`).join('')}</div><small>${t}</small></div>`).join('')}</div><div class="row">${[['Commerce', ['shopping-trolley', 'service-bell', 'pallet-jack']], ['Maps & travel', ['parking-spot-pin', 'beach-umbrella', 'luggage-cart']]].map(([t, ns]) => `<div class="field"><div class="icons">${ns.map(n => `<tlp-icon name="${n}" trigger="none"></tlp-icon>`).join('')}</div><small>${t}</small></div>`).join('')}</div><div class="cap" style="position:static">1,000+ icons each in legal, health, finance, commerce and maps</div></div>`,
    frame: LOOP_ALL(600),
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
    html: `<div class="scene" id="s"><div class="panel noduo"><div style="display:flex;gap:14px;color:#741D3D"><tlp-icon name="file-text" size="40"></tlp-icon><tlp-icon name="shield-check" size="40"></tlp-icon><tlp-icon name="folder" size="40"></tlp-icon></div><small>default</small></div><div class="panel duo"><div style="display:flex;gap:14px;color:#741D3D"><tlp-icon name="file-text" size="40" duotone></tlp-icon><tlp-icon name="shield-check" size="40" duotone></tlp-icon><tlp-icon name="folder" size="40" duotone></tlp-icon></div><small>duotone</small></div><div class="cap">&lt;tlp-icon duotone&gt; adds a soft tinted body</div></div>`,
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
    const page = await browser.newPage({ viewport: { width: 560, height: scene.height || 180 }, deviceScaleFactor: 1 });
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
