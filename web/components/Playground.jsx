'use client';
import { useEffect, useRef, useState } from 'react';
import CodeTabs from './CodeTabs';
import { CopyButton } from './CodeBlock';
import { snippets } from '@/lib/snippets';

const COLORS = ['#741D3D', '#BE617A', '#2B2228', '#5f8a73', '#9a3c5c', '#a4572b', '#7a6a2f', '#4f6f86'];

/** Big preview with live controls, size strip, button mockups and copy-ready code for one icon. */
export default function Playground({ name, label, svgStatic }) {
  const [stroke, setStroke] = useState(1.75);
  const [duo, setDuo] = useState(true);
  const [color, setColor] = useState(COLORS[0]);
  const [loop, setLoop] = useState(false);
  const big = useRef(null);
  const [svgAnimated, setSvgAnimated] = useState('');
  const [svgCode, setSvgCode] = useState(svgStatic);

  // SVG code comes from the tlp-icons package itself
  useEffect(() => {
    let live = true;
    import('tlp-icons/element').then(m => m.loadIcon(name).then(icon => {
      if (!live || !icon) return;
      setSvgCode(m.toSvgString(icon, { stroke, duotone: duo }));
      setSvgAnimated(m.toSvgString(icon, { stroke, animated: true }));
    }));
    return () => { live = false; };
  }, [name, stroke, duo]);

  useEffect(() => { const t = setTimeout(() => big.current?.play?.(), 500); return () => clearTimeout(t); }, [name]);

  const tabs = [...snippets(name, { stroke, duotone: duo }),
    { id: 'svg', label: 'SVG', lang: 'html', code: svgCode },
    { id: 'animated', label: 'Animated SVG', lang: 'html', code: svgAnimated || 'Loading…' }];

  return (
    <div style={{ '--tlp-duo': duo ? '.16' : '0' }}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="tile-host card relative overflow-hidden">
          <div className="dots absolute inset-0 opacity-60" />
          <button type="button" onClick={() => big.current?.play?.()} className="relative grid h-[340px] w-full place-items-center" style={{ color }} aria-label="Replay animation">
            <span className="grid size-44 place-items-center rounded-[2.2rem] bg-white shadow-[0_30px_60px_-30px_rgba(79,70,229,.45)] ring-1 ring-indigo-100">
              <tlp-icon ref={big} name={name} size="104" stroke={String(stroke)} trigger={loop ? 'loop' : 'click'} dangerouslySetInnerHTML={{ __html: svgStatic }} suppressHydrationWarning />
            </span>
          </button>
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line bg-white/90 px-5 py-3.5 text-xs font-medium text-ink-2">
            <button type="button" onClick={() => big.current?.play?.()} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand px-3 font-semibold text-white hover:bg-indigo-700">▶ Play</button>
            <button type="button" onClick={() => setLoop(l => !l)} className={`h-8 rounded-lg border px-3 font-semibold ${loop ? 'border-indigo-200 bg-brand-soft text-brand' : 'border-line'}`}>Loop</button>
            <label className="flex items-center gap-2">Stroke <input type="range" min="1" max="2.5" step="0.25" value={stroke} onChange={e => setStroke(+e.target.value)} className="w-20 accent-indigo-600" /><span className="w-7 font-mono text-ink-3">{stroke}</span></label>
            <button type="button" onClick={() => setDuo(d => !d)} className={`h-8 rounded-lg border px-3 font-semibold ${duo ? 'border-indigo-200 bg-brand-soft text-brand' : 'border-line'}`}>Duotone</button>
            <div className="flex gap-1.5">{COLORS.map(c => <button key={c} type="button" aria-label={`Color ${c}`} onClick={() => setColor(c)} className={`size-5 rounded-full border-2 border-white ring-1 ${color === c ? 'ring-ink' : 'ring-line'}`} style={{ background: c }} />)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Sizes</p>
            <div className="mt-4 flex items-end justify-between text-ink" style={{ color }}>
              {[16, 20, 24, 32, 40, 48].map(s => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <tlp-icon name={name} size={String(s)} stroke={String(stroke)} suppressHydrationWarning />
                  <span className="font-mono text-[10px] text-ink-3">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">In buttons <span className="normal-case tracking-normal text-ink-3">(hover each)</span></p>
            <div className="mt-4 flex flex-wrap gap-2" style={{ '--c': color }}>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white" style={{ background: color }}><tlp-icon name={name} size="18" stroke="2" suppressHydrationWarning />{label}</button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold" style={{ background: `color-mix(in srgb, ${color} 10%, white)`, color }}><tlp-icon name={name} size="18" stroke="2" suppressHydrationWarning />{label}</button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink"><tlp-icon name={name} size="18" stroke="2" suppressHydrationWarning />{label}</button>
              <button type="button" aria-label={label} className="grid size-10 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 10%, white)`, color }}><tlp-icon name={name} size="18" stroke="2" suppressHydrationWarning /></button>
            </div>
          </div>
          <div className="card flex items-center justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Name</p>
              <p className="mt-1 truncate font-mono text-sm text-ink">{name}</p>
            </div>
            <CopyButton text={name} className="!border-line !bg-paper !text-ink-2 hover:!text-brand" />
          </div>
        </div>
      </div>
      <h2 className="mt-12 text-xl font-bold tracking-tight">Use it</h2>
      <CodeTabs tabs={tabs} className="mt-4" />
    </div>
  );
}
