import Link from 'next/link';
import Icon from '@/components/Icon';
import { categories, roadmap, total, icon } from '@/lib/data';

export const metadata = {
  title: `Roadmap — growing to ${roadmap().goal.total.toLocaleString('en')} animated icons`,
  description: 'The tlp-icons growth plan: deep professional fields first (legal, health, finance, commerce, education), every icon animated.',
  alternates: { canonical: '/roadmap/' },
};

export default function Roadmap() {
  const rm = roadmap();
  const cats = categories();
  const now = total();
  const rows = cats.map(c => ({ ...c, target: rm.categories[c.id]?.target || c.count, priority: rm.categories[c.id]?.priority || 3, fields: rm.categories[c.id]?.fields }))
    .sort((a, b) => a.priority - b.priority || b.target - a.target);
  const pctAll = Math.round((now / rm.goal.total) * 100);
  const withFields = rows.filter(r => r.fields);
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="dots fade-mask absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6">
          <p className="text-sm font-semibold text-brand">Roadmap</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">From {now.toLocaleString('en')} to {rm.goal.total.toLocaleString('en')} animated icons</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-2">Depth before breadth. Someone building a legal, medical or finance product should find every icon they need in one place, each one animated.</p>
          <div className="mt-8 max-w-2xl">
            <div className="flex justify-between text-sm font-semibold"><span>Overall progress</span><span className="text-ink-3">{now.toLocaleString('en')} / {rm.goal.total.toLocaleString('en')} · {pctAll}%</span></div>
            <div className="mt-2 h-3 rounded-full bg-paper ring-1 ring-line"><div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" style={{ width: `${Math.max(2, pctAll)}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Phases</h2>
        <ol className="mt-6 grid gap-4 lg:grid-cols-3">
          {rm.phases.map((p, k) => (
            <li key={p.id} className="card relative p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{k + 1}</span>
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-ink-3">{p.when} · {p.target.toLocaleString('en')} icons</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-2">
                {p.items.map(it => <li key={it} className="flex gap-2"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-indigo-400" />{it}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Every category, current vs goal</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper text-left text-[11px] uppercase tracking-wider text-ink-3">
              <tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Priority</th><th className="hidden px-4 py-3 sm:table-cell">Now</th><th className="hidden px-4 py-3 sm:table-cell">Goal</th><th className="w-2/5 px-4 py-3">Progress</th></tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const pct = Math.min(100, Math.round((r.count / r.target) * 100));
                return (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-3"><Link href={`/categories/${r.id}/`} className="flex items-center gap-2.5 font-medium hover:text-brand"><span className="grid size-7 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${r.color} 12%, white)`, color: r.color }}><Icon name={r.icon} size="15" stroke="2" /></span>{r.title}</Link></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.priority === 1 ? 'bg-rose-50 text-rose-700' : r.priority === 2 ? 'bg-amber-50 text-amber-700' : 'bg-paper text-ink-3'}`}>{r.priority === 1 ? 'High' : r.priority === 2 ? 'Medium' : 'Normal'}</span></td>
                    <td className="hidden px-4 py-3 font-mono sm:table-cell">{r.count.toLocaleString('en')}</td>
                    <td className="hidden px-4 py-3 font-mono sm:table-cell">{r.target.toLocaleString('en')}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-paper ring-1 ring-line"><div className="h-2 rounded-full" style={{ width: `${Math.max(1, pct)}%`, background: r.color }} /></div><span className="w-9 text-right font-mono text-xs text-ink-3">{pct}%</span></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Planned fields</h2>
        <p className="mt-2 text-ink-2">Seed lists for the next batches. <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 text-xs font-semibold text-emerald-700">✓ done</span> means the icon is already in the library.</p>
        <div className="mt-6 space-y-6">
          {withFields.map(r => (
            <div key={r.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold"><span className="grid size-8 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${r.color} 12%, white)`, color: r.color }}><Icon name={r.icon} size="17" stroke="2" /></span>{r.title}</h3>
                <span className="text-sm text-ink-3">{r.count} now → {r.target.toLocaleString('en')} goal</span>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {Object.entries(r.fields).map(([field, names]) => (
                  <div key={field}>
                    <p className="text-sm font-semibold text-ink">{field}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {names.map(n => icon(n)
                        ? <a key={n} href={`/icons/${n}/`} className="rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11.5px] text-emerald-800 ring-1 ring-emerald-200 hover:ring-emerald-400">✓ {n}</a>
                        : <span key={n} className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11.5px] text-ink-2 ring-1 ring-line">{n}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Principles</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-2">{rm.principles.map(p => <li key={p} className="flex gap-2.5"><span className="text-brand">✓</span>{p}</li>)}</ul>
          </div>
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Candidate sources (after review)</h2>
            <ul className="mt-4 space-y-3 text-sm">{rm.candidateSources.map(s => <li key={s.name} className="flex justify-between gap-4"><span><b className="text-ink">{s.name}</b> <span className="text-ink-2">— {s.note}</span></span><span className="shrink-0 rounded bg-paper px-2 py-0.5 text-xs font-semibold text-ink-3 ring-1 ring-line">{s.license}</span></li>)}</ul>
            <a href="https://github.com/Tamer-Mansour/tlp-icons/issues/new?title=Icon%20request" target="_blank" rel="noopener" className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-slate-800">Request an icon</a>
          </div>
        </div>
      </section>
    </div>
  );
}
