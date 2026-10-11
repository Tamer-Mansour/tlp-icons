'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

const COLORS = ['#4f46e5', '#2563eb', '#0d9488', '#16a34a', '#0f172a', '#c2410c', '#be123c', '#9333ea'];
const BATCH = 180;

function score(name, q, words) {
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.split('-').includes(words[0])) return 2;
  return 3;
}

export default function Gallery({ initialCategory = null, categories }) {
  const [index, setIndex] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(initialCategory);
  const [size, setSize] = useState(28);
  const [stroke, setStroke] = useState(1.75);
  const [color, setColor] = useState(COLORS[0]);
  const [duo, setDuo] = useState(true);
  const [shown, setShown] = useState(BATCH);
  const sentinel = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) setQ(p.get('q'));
    if (p.get('c')) setCat(p.get('c'));
    fetch('/search.json').then(r => r.json()).then(setIndex);
    const onKey = e => { if (e.key === '/' && document.activeElement !== input.current) { e.preventDefault(); input.current?.focus(); } };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    if (!index) return [];
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const query = words.join('-');
    const catIdx = cat ? index.categories.findIndex(c => c.id === cat) : -1;
    let list = index.icons.filter(([n, c, t]) => {
      if (catIdx >= 0 && c !== catIdx) return false;
      if (!words.length) return true;
      const hay = `${n} ${n.replace(/-/g, ' ')} ${t} ${index.categories[c].title}`.toLowerCase();
      return words.every(w => hay.includes(w));
    });
    if (words.length) list = list.map((x, k) => [x, score(x[0], query, words), k]).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(x => x[0]);
    return list;
  }, [index, q, cat]);

  const counts = useMemo(() => {
    if (!index) return null;
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const m = {};
    for (const [n, c, t] of index.icons) {
      if (words.length) {
        const hay = `${n} ${n.replace(/-/g, ' ')} ${t} ${index.categories[c].title}`.toLowerCase();
        if (!words.every(w => hay.includes(w))) continue;
      }
      m[c] = (m[c] || 0) + 1;
    }
    return m;
  }, [index, q]);

  useEffect(() => { setShown(BATCH); }, [q, cat]);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) setShown(s => s + BATCH); }, { rootMargin: '1200px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [results.length]);

  const cats = index?.categories || categories;
  const totalCount = index ? (q ? Object.values(counts || {}).reduce((a, b) => a + b, 0) : index.icons.length) : null;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[240px_1fr]" style={{ '--tlp-duo': duo ? '.16' : '0', color }}>
      {/* categories */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pe-2 text-ink">
          <p className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Categories</p>
          <button type="button" onClick={() => setCat(null)} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition ${!cat ? 'bg-brand-soft font-semibold text-brand' : 'text-ink-2 hover:bg-paper'}`}>
            <span className="flex-1 text-start">All icons</span><span className="font-mono text-xs text-ink-3">{totalCount ?? ''}</span>
          </button>
          {cats.map((c, k) => (
            <button key={c.id} type="button" onClick={() => setCat(c.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition ${cat === c.id ? 'bg-brand-soft font-semibold text-brand' : 'text-ink-2 hover:bg-paper'} ${counts && !counts[k] ? 'opacity-40' : ''}`}>
              <span className="grid size-6 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${c.color} 12%, white)`, color: c.color }}>
                <tlp-icon name={c.icon} size="14" stroke="2" suppressHydrationWarning />
              </span>
              <span className="flex-1 truncate text-start">{c.title}</span>
              <span className="font-mono text-xs text-ink-3">{counts ? counts[k] || 0 : c.count}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
        {/* toolbar */}
        <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-white/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-[220px] flex-1">
              <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-3"><tlp-icon name="search" size="18" suppressHydrationWarning /></span>
              <input ref={input} value={q} onChange={e => setQ(e.target.value)} type="search" placeholder={`Search ${index ? index.icons.length.toLocaleString('en') : ''} icons…`}
                className="h-11 w-full rounded-xl border border-line bg-white ps-10 pe-12 text-sm text-ink shadow-card outline-none transition placeholder:text-ink-3 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" />
              <kbd className="absolute end-3 top-1/2 -translate-y-1/2 rounded border border-line bg-paper px-1.5 font-mono text-[11px] text-ink-3">/</kbd>
            </label>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink-2">
              <label className="flex items-center gap-2">Size<input type="range" min="16" max="44" value={size} onChange={e => setSize(+e.target.value)} className="w-20 accent-indigo-600" /></label>
              <label className="flex items-center gap-2">Stroke<input type="range" min="1" max="2.5" step="0.25" value={stroke} onChange={e => setStroke(+e.target.value)} className="w-20 accent-indigo-600" /></label>
              <div className="flex items-center gap-1.5">
                {COLORS.map(c => <button key={c} type="button" aria-label={`Color ${c}`} onClick={() => setColor(c)} className={`size-5 rounded-full border-2 border-white ring-1 transition ${color === c ? 'ring-ink' : 'ring-line'}`} style={{ background: c }} />)}
              </div>
              <button type="button" onClick={() => setDuo(d => !d)} className={`h-8 rounded-lg border px-3 font-semibold transition ${duo ? 'border-indigo-200 bg-brand-soft text-brand' : 'border-line bg-white text-ink-2'}`}>Duotone</button>
            </div>
          </div>
          {/* mobile categories */}
          <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:hidden">
            <button type="button" onClick={() => setCat(null)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${!cat ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2'}`}>All</button>
            {cats.map(c => <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${cat === c.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2'}`}>{c.title}</button>)}
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">{cat ? cats.find(c => c.id === cat)?.title : q ? 'Search results' : 'All icons'} <span className="ms-1 font-normal text-ink-3">{index ? results.length.toLocaleString('en') : '…'}</span></h2>
          {cat && <Link href={`/categories/${cat}/`} className="text-xs font-semibold text-brand hover:underline">Category page →</Link>}
        </div>

        {!index && <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">{Array.from({ length: 30 }, (_, k) => <div key={k} className="h-[112px] animate-pulse rounded-2xl bg-paper" />)}</div>}
        {index && !results.length && (
          <div className="mt-16 text-center">
            <p className="text-lg font-semibold">No icons match “{q}”.</p>
            <p className="mt-2 text-sm text-ink-2">Try another word, or <a className="font-semibold text-brand" href="https://github.com/Tamer-Mansour/tlp-icons/issues/new?title=Icon%20request" target="_blank" rel="noopener">request an icon</a>.</p>
          </div>
        )}
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(118px,1fr))]">
          {results.slice(0, shown).map(([n, , , s]) => (
            <li key={n} className="[content-visibility:auto] [contain-intrinsic-size:auto_118px]">
              <a href={`/icons/${n}/`} title={n} className="tile-host card card-hover relative flex h-full flex-col items-center gap-2.5 px-2 pb-3 pt-4">
                <span className="tile size-14" style={{ '--tc': color }}>
                  <tlp-icon name={n} size={String(size)} stroke={String(stroke)} suppressHydrationWarning />
                </span>
                <span className="w-full truncate text-center font-mono text-[11px] text-ink">{n}</span>
                {s === 'tlp' && <span className="absolute end-2 top-2 rounded bg-brand px-1 text-[9px] font-bold uppercase text-white">new</span>}
              </a>
            </li>
          ))}
        </ul>
        <div ref={sentinel} className="h-10" />
      </div>
    </div>
  );
}
