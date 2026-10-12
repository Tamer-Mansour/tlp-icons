import Link from 'next/link';
import Icon from '@/components/Icon';
import IconWall from '@/components/IconWall';
import InstallPill from '@/components/InstallPill';
import CodeTabs from '@/components/CodeTabs';
import { FRAMEWORK_TABS } from '@/lib/snippets';
import { categories, total, icon, roadmap, stats } from '@/lib/data';

const WALL = ['bell', 'clock', 'settings', 'heart', 'cloud-rain', 'trash', 'lock', 'search', 'chart-column', 'rocket', 'mail', 'camera', 'map-pin', 'calendar', 'gavel', 'music', 'sun', 'eye', 'download', 'bookmark', 'wifi', 'trophy', 'zap', 'user'];
const MECHANICS = [
  ['alarm-clock', 'Clock hands turn', 'Hands are found and split at the face centre. The minute hand sweeps, the hour hand advances and keeps its place.'],
  ['settings', 'Gears spin on the axle', 'The engine finds the axle circle and spins the gear around its real centre.'],
  ['bell-ring', 'Bells swing from the top', 'The body swings on its hanger, the clapper follows a beat later.'],
  ['trash-2', 'Lids lift, bins shake', 'The lid rises while the bin gives a little shake.'],
  ['cloud-rain', 'Rain falls', 'The cloud floats while the drops fall one by one.'],
  ['lock-open', 'Locks open on the hinge', 'The shackle tilts around the end that stays in the body.'],
];
const features = s => [
  ['sparkles', '100% animated', `All ${s.icons.toLocaleString('en')} icons move: ${s.handmade ? `${s.handmade.toLocaleString('en')} hand-made choreographies` : 'hand-made choreographies'} plus an engine that reads each icon's geometry.`],
  ['layout-grid', `${s.icons.toLocaleString('en')} icons`, `One consistent style in ${s.categories} categories: 24×24 grid, 2px stroke, round caps, currentColor.`],
  ['zap', 'Tiny and lazy', `One custom element. Icons load per category, so 10 icons never download all ${s.icons.toLocaleString('en')}.`],
  ['mouse-pointer-click', 'Polite motion', 'Plays once, always finishes, never lights up a whole card, respects reduced motion.'],
  ['hand', 'Hover and hold', 'trigger="hold": the icon animates to its peak on hover and stays there (the lid stays up), then returns when the mouse leaves.'],
  ['pause', 'Static when you need it', 'animated="false" on one icon, or config.animated = false for the whole page. Animated stays the default.'],
  ['activity', `${s.animations} animations`, 'From draw, pop and swing to beat, sway, flutter, drive, wave, pendulum and drip: each picked for what the icon is.'],
  ['briefcase-medical', 'Deep professional fields', 'Legal, health, finance, commerce and maps each have 1,000+ icons, drawn for real products in those fields.'],
  ['wifi-off', 'Works offline', 'A single classic script with every icon inside. No network, no build step.'],
  ['scale', 'MIT licensed', 'Free for personal and commercial use. Built on Lucide (ISC) and Tabler (MIT).'],
];
const FIELDS = ['legal', 'health', 'finance', 'commerce', 'maps'];
const WORKS = [['brand-react', 'React'], ['brand-angular', 'Angular'], ['brand-vue', 'Vue'], ['brand-svelte', 'Svelte'], ['brand-html5', 'HTML'], ['brand-nextjs', 'Next.js']];

export default function Home() {
  const cats = categories();
  const rm = roadmap();
  const count = total();
  const s = stats();
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="dots fade-mask absolute inset-0 -z-10" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/60 via-violet-200/40 to-pink-100/30 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div>
            <Link href="/icons/?mode=hold" className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 py-1 pe-3 ps-1 text-xs font-semibold text-brand shadow-card">
              <span className="rounded-full bg-brand px-2 py-0.5 text-white">New</span> Health, finance, commerce and maps complete · hover-and-hold →
            </Link>
            <h1 className="mt-6 text-5xl font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl">
              Every icon,<br /><span className="text-gradient">animated.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">
              {count.toLocaleString('en')} free, open-source icons that move the way real things move. One tiny element for React, Angular, Vue and plain HTML.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/icons/" className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700">
                <Icon name="layout-grid" size="18" /> Browse {count.toLocaleString('en')} icons
              </Link>
              <InstallPill />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-3">
              <span className="font-medium">Works with</span>
              {WORKS.filter(([n]) => icon(n)).map(([n, t]) => (
                <span key={n} className="flex items-center gap-1.5 font-medium text-ink-2"><Icon name={n} size="18" />{t}</span>
              ))}
            </div>
          </div>
          <IconWall cols={6}>
            <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
              {WALL.map((n, k) => (
                <a key={n} href={`/icons/${n}/`} className={`tile-host card card-hover grid aspect-square place-items-center ${k % 5 === 1 ? 'bg-brand-soft/60' : ''}`} title={n}>
                  <span className="tile size-[64%] max-w-16"><Icon name={n} size="28" stroke="1.75" duotone trigger="hover" /></span>
                </a>
              ))}
            </div>
          </IconWall>
        </div>
      </section>

      {/* stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <dl className="-mt-px grid grid-cols-2 divide-line border-x border-b border-line md:grid-cols-4 md:divide-x">
          {[[count.toLocaleString('en'), 'icons'], [s.categories, 'categories'], [s.animations, 'animations'], ['0', 'dependencies']].map(([v, l]) => (
            <div key={l} className="px-6 py-7 text-center">
              <dt className="text-3xl font-bold tracking-tight text-ink">{v}</dt>
              <dd className="mt-1 text-sm text-ink-3">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* mechanics */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand">Realistic motion</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Motion that makes sense</h2>
          <p className="mt-4 text-lg leading-8 text-ink-2">Not one generic bounce for everything. Each icon tells its own small story, and every motion ends exactly at rest.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MECHANICS.map(([n, t, d]) => (
            <div key={n} className="tile-host card card-hover flex gap-5 p-6">
              <span className="tile size-16 shrink-0"><Icon name={n} size="34" stroke="1.75" duotone trigger="loop" /></span>
              <div>
                <h3 className="font-semibold text-ink">{t}</h3>
                <p className="mt-1.5 text-sm leading-6 text-ink-2">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {features(s).map(([n, t, d]) => (
            <div key={n} className="tile-host">
              <span className="tile size-12"><Icon name={n} size="24" duotone /></span>
              <h3 className="mt-5 text-lg font-semibold">{t}</h3>
              <p className="mt-2 leading-7 text-ink-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* code */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand">One element</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Drop it into any framework</h2>
            <p className="mt-4 text-lg leading-8 text-ink-2"><code className="rounded-md bg-paper px-1.5 py-0.5 font-mono text-base text-indigo-900">&lt;tlp-icon&gt;</code> is a standard web component. Import it once and use it in templates, JSX or plain HTML. The hover rule decides which icon plays, so a busy card never lights up all at once.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/docs/" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-slate-800"><Icon name="book-open" size="17" /> Read the docs</Link>
              <Link href="/docs/#frameworks" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink shadow-card hover:border-indigo-200">Framework guides</Link>
            </div>
          </div>
          <CodeTabs tabs={FRAMEWORK_TABS} />
        </div>
      </section>

      {/* categories */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">{cats.length} categories</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Sorted the way you think</h2>
          </div>
          <Link href="/categories/" className="text-sm font-semibold text-brand hover:underline">All categories →</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map(c => (
            <Link key={c.id} href={`/categories/${c.id}/`} className="card card-hover group flex items-center gap-3 p-3.5" style={{ '--c': c.color }}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl text-[color:var(--c)] transition group-hover:scale-105" style={{ background: `color-mix(in srgb, ${c.color} 11%, white)` }}>
                <Icon name={c.icon} size="21" stroke="2" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{c.title}</span>
                <span className="text-xs text-ink-3">{c.count.toLocaleString('en')} icons</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* roadmap teaser */}
      <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white sm:px-12">
          <div className="absolute -right-24 -top-24 size-80 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-semibold text-indigo-300">Roadmap</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">From {count.toLocaleString('en')} to {rm.goal.total.toLocaleString('en')} icons</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">Deep, professional fields first. Legal, health, finance, commerce and maps are at their targets; science, buildings, vehicles and the rest come next.</p>
              <Link href="/roadmap/" className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink hover:bg-indigo-50"><Icon name="map" size="17" /> See the plan</Link>
            </div>
            <div className="space-y-4">
              {FIELDS.map(id => {
                const c = categories().find(x => x.id === id);
                const t = rm.categories[id].target;
                const pct = Math.max(2, Math.round(((c?.count || 0) / t) * 100));
                return (
                  <div key={id}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{c?.title}</span><span className="text-slate-400">{(c?.count || 0).toLocaleString('en')} / {t.toLocaleString('en')}</span></div>
                    <div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${Math.min(100, pct)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
