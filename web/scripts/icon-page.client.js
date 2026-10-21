// Shared script for the light icon pages (one cached file for all ~6,600 pages): loads the published tlp-icons
// package from the CDN and builds the interactive playground (preview, controls, sizes, buttons, code tabs).
// __TLP_CDN__ is replaced at build time with https://cdn.jsdelivr.net/npm/tlp-icons@<installed version>/dist
import '__TLP_CDN__/tlp-icon.js';
import { loadIcon, toSvgString } from '__TLP_CDN__/core.js';

const root = document.querySelector('[data-icon-page]');
const name = root.dataset.name;
const label = root.dataset.label;
const COLORS = ['#741D3D', '#BE617A', '#2B2228', '#5f8a73', '#9a3c5c', '#a4572b', '#7a6a2f', '#4f6f86'];
const TABS = ['React', 'HTML', 'Angular', 'Vue', 'SVG', 'Animated SVG'];
let stroke = 1.75, duo = true, tab = 0, color = COLORS[0], svgStatic = '', svgAnimated = '';

const pg = document.getElementById('pg');
pg.innerHTML = `
<div class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
  <div class="card relative overflow-hidden">
    <div class="dots absolute inset-0 opacity-60"></div>
    <button type="button" data-play class="relative grid h-[320px] w-full place-items-center text-brand" data-tint aria-label="Replay animation">
      <span class="grid size-44 place-items-center rounded-[2.2rem] bg-white shadow-lift ring-1 ring-indigo-100"><tlp-icon data-big data-sync name="${name}" size="104" stroke="1.75" trigger="click"></tlp-icon></span>
    </button>
    <div class="relative flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line bg-white/90 px-5 py-3.5 text-xs font-medium text-ink-2">
      <button type="button" data-play class="h-8 rounded-lg bg-brand px-3 font-semibold text-white">▶ Play</button>
      <button type="button" data-loop aria-pressed="false" class="h-8 rounded-lg border border-line px-3 font-semibold aria-pressed:border-indigo-200 aria-pressed:bg-brand-soft aria-pressed:text-brand">Loop</button>
      <label class="flex items-center gap-2">Stroke <input data-stroke type="range" min="1" max="2.5" step="0.25" value="1.75" class="w-20 accent-indigo-600"></label>
      <button type="button" data-duo aria-pressed="true" class="h-8 rounded-lg border border-line px-3 font-semibold aria-pressed:border-indigo-200 aria-pressed:bg-brand-soft aria-pressed:text-brand">Duotone</button>
      <div class="flex gap-1.5">${COLORS.map(c => `<button type="button" data-color="${c}" aria-label="Color ${c}" class="size-5 rounded-full border-2 border-white ring-1 ring-line" style="background:${c}"></button>`).join('')}</div>
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <div class="card p-5"><p class="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Sizes</p>
      <div class="mt-4 flex items-end justify-between text-brand" data-tint>${[16, 20, 24, 32, 40, 48].map(s => `<div class="flex flex-col items-center gap-2"><tlp-icon data-sync name="${name}" size="${s}" stroke="1.75"></tlp-icon><span class="font-mono text-[10px] text-ink-3">${s}</span></div>`).join('')}</div></div>
    <div class="card p-5"><p class="text-[11px] font-semibold uppercase tracking-wider text-ink-3">In buttons <span class="normal-case tracking-normal">(hover each)</span></p>
      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" data-btn="solid" class="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white"><tlp-icon name="${name}" size="18" stroke="2"></tlp-icon>${label}</button>
        <button type="button" data-btn="soft" class="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-soft px-4 text-sm font-semibold text-brand"><tlp-icon name="${name}" size="18" stroke="2"></tlp-icon>${label}</button>
        <button type="button" class="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"><tlp-icon name="${name}" size="18" stroke="2"></tlp-icon>${label}</button>
      </div></div>
    <div class="card flex items-center justify-between gap-3 p-5"><div class="min-w-0"><p class="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Name</p><p class="mt-1 truncate font-mono text-sm text-ink">${name}</p></div>
      <button type="button" data-copy="${name}" class="h-8 rounded-lg border border-line bg-paper px-3 text-xs font-semibold text-ink-2 hover:text-brand">Copy</button></div>
  </div>
</div>
<h2 class="!mt-12 !text-xl font-bold tracking-tight">Use it</h2>
<div class="mt-4 overflow-hidden rounded-2xl border border-[#43353d] bg-[#2B2228]">
  <div class="flex items-center gap-1 overflow-x-auto border-b border-white/5 px-2 py-2">${TABS.map((x, k) => `<button type="button" data-tab="${k}" class="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 aria-selected:bg-white/10 aria-selected:text-white">${x}</button>`).join('')}
    <button type="button" data-copy-code class="ms-auto h-7 shrink-0 rounded-md border border-white/10 bg-white/5 px-2.5 text-[11.5px] font-semibold text-slate-300 hover:text-white">Copy</button></div>
  <pre class="max-h-[420px] overflow-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-slate-200"><code data-code></code></pre>
</div>`;

const big = root.querySelector('[data-big]');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const snippets = () => {
  const attrs = `name="${name}"${stroke !== 2 ? ` stroke="${stroke}"` : ''}`;
  return [
    `import 'tlp-icons/element';\n\nexport function Example() {\n  return <tlp-icon ${attrs}${duo ? ' duotone=""' : ''} />;\n}`,
    `<script type="module" src="https://unpkg.com/tlp-icons/dist/tlp-icon.js"></script>\n\n<tlp-icon ${attrs}${duo ? ' duotone' : ''}></tlp-icon>`,
    `<!-- main.ts: import 'tlp-icons/element';  component: schemas: [CUSTOM_ELEMENTS_SCHEMA] -->\n<tlp-icon ${attrs}${duo ? ' duotone' : ''}></tlp-icon>`,
    `<!-- main.ts: import 'tlp-icons/element';  vite: isCustomElement: tag => tag === 'tlp-icon' -->\n<tlp-icon ${attrs}${duo ? ' duotone' : ''} />`,
    svgStatic || 'Loading…',
    svgAnimated || 'Loading…',
  ];
};
const render = () => {
  root.querySelector('[data-code]').innerHTML = esc(snippets()[tab]);
  root.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.tab === tab)));
  root.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('ring-ink', b.dataset.color === color));
};
const refreshSvg = () => loadIcon(name).then(icon => {
  if (!icon) return;
  svgStatic = toSvgString(icon, { stroke, duotone: duo });
  svgAnimated = toSvgString(icon, { stroke, animated: true });
  render();
});
const copy = async text => {
  try { await navigator.clipboard.writeText(text); } catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
};
const flash = btn => { const old = btn.textContent; btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = old; }, 1300); };

root.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.hasAttribute('data-play')) big.play && big.play();
  if (t.hasAttribute('data-loop')) {
    const on = t.getAttribute('aria-pressed') !== 'true';
    t.setAttribute('aria-pressed', String(on));
    big.setAttribute('trigger', on ? 'loop' : 'click');
  }
  if (t.hasAttribute('data-duo')) {
    duo = t.getAttribute('aria-pressed') !== 'true';
    t.setAttribute('aria-pressed', String(duo));
    root.style.setProperty('--tlp-duo', duo ? '.16' : '0');
    refreshSvg();
  }
  if (t.dataset.color) {
    color = t.dataset.color;
    root.querySelectorAll('[data-tint]').forEach(el => { el.style.color = color; });
    root.querySelectorAll('[data-btn="solid"]').forEach(el => { el.style.background = color; });
    root.querySelectorAll('[data-btn="soft"]').forEach(el => { el.style.color = color; el.style.background = `color-mix(in srgb, ${color} 10%, white)`; });
    render();
  }
  if (t.dataset.tab) { tab = +t.dataset.tab; render(); }
  if (t.hasAttribute('data-copy-code')) copy(snippets()[tab]).then(() => flash(t));
  if (t.dataset.copy) copy(t.dataset.copy).then(() => flash(t));
});
root.querySelector('[data-stroke]').addEventListener('input', e => {
  stroke = +e.target.value;
  root.querySelectorAll('[data-sync]').forEach(el => el.setAttribute('stroke', String(stroke)));
  refreshSvg();
});

root.style.setProperty('--tlp-duo', '.16');
render();
refreshSvg();
setTimeout(() => big.play && big.play(), 600);
