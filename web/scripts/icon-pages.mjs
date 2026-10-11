// Generates one light static page per icon (out/icons/<name>/index.html, ~5 KB each) after `next build`.
// Next.js pages carry a full JSON copy of themselves (~35 KB); 6,600 of those made the deploy ~270 MB.
// These pages keep everything search engines need (title, description, canonical, JSON-LD, real content and links)
// and get their motion from the tlp-icons package runtime, copied to /_tlp/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataFile } from '../lib/data-file.mjs';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(WEB, 'out');
const PKG = path.join(WEB, 'node_modules', 'tlp-icons', 'dist');
const SITE = 'https://tlp-icons.netlify.app';
const REPO = 'https://github.com/Tamer-Mansour/tlp-icons';
const SPEED = 0.6;

const D = JSON.parse(fs.readFileSync(dataFile(WEB), 'utf8'));
const names = Object.keys(D.icons);
const cats = Object.fromEntries(D.categories.map(c => [c.id, c]));
const byCat = {};
for (const n of names) (byCat[D.icons[n].category] ||= []).push(n);

// 1. the page script; the tlp-icons runtime itself comes from the published npm package on the CDN
const version = JSON.parse(fs.readFileSync(path.join(PKG, '..', 'package.json'), 'utf8')).version;
const CDN = `https://cdn.jsdelivr.net/npm/tlp-icons@${version}/dist`;
const TLP = path.join(OUT, '_tlp');
fs.rmSync(TLP, { recursive: true, force: true });
fs.mkdirSync(TLP, { recursive: true });
fs.writeFileSync(path.join(TLP, 'icon-page.js'), fs.readFileSync(path.join(WEB, 'scripts', 'icon-page.client.js'), 'utf8').replaceAll('__TLP_CDN__', CDN));

// 2. shared <head> assets from the Next build (Tailwind CSS + font) so the pages look identical
const home = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
const headAssets = [...home.matchAll(/<link[^>]+rel="(?:stylesheet|preload)"[^>]*>/g)].map(m => m[0]).filter(l => /\.css|font/.test(l)).join('');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const label = n => n.replace(/^brand-/, '').split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
const svg = n => `<svg viewBox="0 0 24 24" class="tlp" aria-hidden="true">${D.icons[n].svg}</svg>`;

const NAV = [['/icons/', 'Icons'], ['/categories/', 'Categories'], ['/categories/brands/', 'Brands'], ['/docs/', 'Docs'], ['/roadmap/', 'Roadmap']];
const header = `<header class="lh"><div><a href="/" class="lg"><img src="/favicon.svg" alt="">tlp-icons</a><nav>${NAV.map(([h, t]) => `<a href="${h}"${h === '/icons/' ? ' class="on"' : ''}>${t}</a>`).join('')}</nav><a class="gh" href="${REPO}">GitHub</a></div></header>`;
const footer = `<footer class="lf"><p><b>tlp-icons</b> · ${names.length.toLocaleString('en')} free animated icons · MIT · <a href="/docs/">Docs</a> · <a href="${REPO}">GitHub</a> · Geometry from Lucide (ISC) and Tabler Icons (MIT). Brand logos are trademarks of their owners.</p></footer>`;

function related(n) {
  const fam = n.split('-')[0];
  const cat = D.icons[n].category;
  const family = names.filter(x => x !== n && x.split('-')[0] === fam);
  const rest = byCat[cat].filter(x => x !== n && !family.includes(x));
  return [...family, ...rest].slice(0, 12);
}

function page(n) {
  const i = D.icons[n];
  const c = cats[i.category];
  const src = D.sources[i.source] || {};
  const t = label(n);
  const kind = n.startsWith('brand-') ? 'logo' : 'icon';
  const total = Math.round(Math.max(...i.m.map(s => s[2] + s[3])) * SPEED);
  const tags = (i.tags || []).slice(0, 24);
  const desc = `Free animated ${t.toLowerCase()} ${kind} (${n}) in the ${c.title} category. Copy SVG or use it in React, Angular, Vue and HTML.${tags.length ? ` ${tags.slice(0, 6).join(', ')}.` : ''}`;
  const ld = { '@context': 'https://schema.org', '@type': 'ImageObject', name: `${t} ${kind}`, contentUrl: `${SITE}/icons/${n}/`, encodingFormat: 'image/svg+xml', license: 'https://opensource.org/licenses/MIT', creditText: src.title, keywords: tags.join(', ') };
  const rel = related(n);
  return `<!doctype html><html lang="en" dir="ltr" data-scroll-behavior="smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(`${t} ${kind} — animated SVG · tlp-icons`)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}/icons/${n}/">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(`${t} animated ${kind} · tlp-icons`)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}/icons/${n}/"><meta property="og:image" content="${SITE}/og-image.png"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="theme-color" content="#4f46e5">${headAssets}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script></head><body>${header}
<main class="lm" data-icon-page data-name="${n}" data-label="${esc(t)}" style="--tc:${c.color}">
<nav class="bc"><a href="/icons/">Icons</a> / <a href="/categories/${c.id}/">${esc(c.title)}</a> / ${n}</nav>
<h1>${esc(t)} <span>${kind}</span></h1>
<div class="bd"><a class="c" href="/categories/${c.id}/">${esc(c.title)}</a><span>${esc(src.title || i.source)} · ${esc(src.license || '')}</span><span>${total} ms animation</span>${i.source === 'tlp' ? '<span class="o">tlp original</span>' : ''}</div>
<div id="pg"><tlp-icon data-big name="${n}" size="104" stroke="1.75" trigger="click">${svg(n)}</tlp-icon></div>
<h2>Motion</h2><ol class="mo">${i.m.map(s => `<li><b>${s[1]}</b> on ${s[0]} · ${Math.round(s[2] * SPEED)}ms${s[3] ? ` +${Math.round(s[3] * SPEED)}` : ''}${s[4] ? ` @ ${s[4]}` : ''}</li>`).join('')}</ol>
<h2>About</h2><p class="tx">The <b>${esc(t)}</b> ${kind} (${n}) is a free animated SVG in the ${esc(c.title)} category, drawn on a 24×24 grid with a 2px stroke. It comes from ${esc(src.title || i.source)} (${esc(src.license || '')}) and is part of tlp-icons, MIT licensed.</p>
${kind === 'logo' ? '<p class="tm">This logo is a trademark of its owner, included only to identify the product.</p>' : ''}
${tags.length ? `<h2>Tags</h2><div class="tg">${tags.map(g => `<a href="/icons/?q=${encodeURIComponent(g)}">${esc(g)}</a>`).join('')}</div>` : ''}
<h2>Related icons · <a href="/categories/${c.id}/">all ${esc(c.title)}</a></h2>
<div class="rl">${rel.map(r => `<a href="/icons/${r}/"><tlp-icon name="${r}" stroke="1.75"></tlp-icon>${r}</a>`).join('')}</div>
</main>${footer}<script type="module" src="/_tlp/icon-page.js"></script></body></html>`;
}

let bytes = 0;
for (const n of names) {
  const dir = path.join(OUT, 'icons', n);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const html = page(n);
  bytes += Buffer.byteLength(html);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
console.log(`icon pages: ${names.length} written, average ${(bytes / names.length / 1024).toFixed(1)} KB, total ${(bytes / 1048576).toFixed(1)} MB; runtime from ${CDN}`);
