import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSvg } from 'tlp-icons';
import PlaygroundLoader from '@/components/PlaygroundLoader';
import RelatedGrid from '@/components/RelatedGrid';
import { allNames, icon, category, related, sources, label, svgMarkup, SITE_URL } from '@/lib/data';

export const dynamicParams = false;
// Production: scripts/icon-pages.mjs writes light static pages for every icon after the build (keeps the deploy small).
// Next only needs one page here; `next dev` still serves every icon through this route.
export function generateStaticParams() {
  return process.env.NODE_ENV === 'production' ? [{ name: 'bell' }] : allNames().map(name => ({ name }));
}

const SPEED = 0.6;

export async function generateMetadata({ params }) {
  const { name } = await params;
  const i = icon(name);
  if (!i) return {};
  const c = category(i.category);
  const t = label(name);
  const isBrand = name.startsWith('brand-');
  return {
    title: `${t} ${isBrand ? 'logo icon' : 'icon'} — animated SVG`,
    description: `Free animated ${t.toLowerCase()} icon (${name}) in the ${c.title} category. Copy SVG or use it in React, Angular, Vue and HTML. ${(i.tags || []).slice(0, 6).join(', ')}.`,
    alternates: { canonical: `/icons/${name}/` },
    openGraph: { title: `${t} animated icon · tlp-icons`, url: `${SITE_URL}/icons/${name}/` },
  };
}

export default async function IconPage({ params }) {
  const { name } = await params;
  const i = icon(name);
  if (!i) notFound();
  const c = category(i.category);
  const src = sources()[i.source] || {};
  const t = label(name);
  const rel = related(name, 18);
  const total = Math.round(Math.max(...i.m.map(s => s[2] + s[3])) * SPEED);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'ImageObject', name: `${t} icon`, contentUrl: `${SITE_URL}/icons/${name}/`,
    encodingFormat: 'image/svg+xml', license: `https://opensource.org/licenses/${src.license === 'ISC' ? 'ISC' : 'MIT'}`, acquireLicensePage: `${SITE_URL}/licenses/`, creditText: src.title, keywords: (i.tags || []).join(', '),
  };
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-3" aria-label="Breadcrumb">
        <Link href="/icons/" className="hover:text-brand">Icons</Link><span>/</span>
        <Link href={`/categories/${c.id}/`} className="hover:text-brand">{c.title}</Link><span>/</span>
        <span className="font-medium text-ink-2">{name}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t} <span className="text-ink-3">{name.startsWith('brand-') ? 'logo' : 'icon'}</span></h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Link href={`/categories/${c.id}/`} className="rounded-full px-2.5 py-1" style={{ background: `color-mix(in srgb, ${c.color} 12%, white)`, color: c.color }}>{c.title}</Link>
            <span className="rounded-full bg-paper px-2.5 py-1 text-ink-2 ring-1 ring-line">{src.title || i.source} · {src.license}</span>
            <span className="rounded-full bg-paper px-2.5 py-1 text-ink-2 ring-1 ring-line">{total} ms animation</span>
            {i.source === 'tlp' && <span className="rounded-full bg-brand px-2.5 py-1 text-white">tlp original</span>}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PlaygroundLoader name={name} label={t} svgStatic={getSvg(name)}>
          <div className="card grid h-[400px] place-items-center text-brand lg:w-[55%]">
            <span className="grid size-44 place-items-center rounded-[2.2rem] bg-white ring-1 ring-indigo-100">
              <span className="size-[104px]" dangerouslySetInnerHTML={{ __html: svgMarkup(name) }} />
            </span>
          </div>
        </PlaygroundLoader>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">Motion</h2>
          <ol className="mt-3 space-y-1.5">
            {i.m.map((s, k) => (
              <li key={k} className="font-mono text-xs text-ink-2">
                <b className="text-brand">{s[1]}</b> on {s[0]} · {Math.round(s[2] * SPEED)}ms{s[3] ? ` +${Math.round(s[3] * SPEED)}` : ''}{s[4] ? ` @ ${s[4]}` : ''}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">About</h2>
          <p className="mt-3 text-sm leading-6 text-ink-2">The <b>{t}</b> {name.startsWith('brand-') ? 'logo' : 'icon'} ({name}) is a free animated SVG in the {c.title} category, drawn on a 24×24 grid with a 2px stroke. It comes from {src.title} ({src.license}) and is part of tlp-icons, MIT licensed.</p>
        </div>
      </div>

      {i.tags?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-ink">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {i.tags.slice(0, 30).map(tag => <Link key={tag} href={`/icons/?q=${encodeURIComponent(tag)}`} className="rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-2 hover:border-indigo-200 hover:text-brand">{tag}</Link>)}
          </div>
        </div>
      )}

      {name.startsWith('brand-') && <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">This logo is a trademark of its owner. It is included to identify the product only; follow the owner&apos;s brand guidelines.</p>}

      <section className="mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-bold tracking-tight">Related icons</h2>
          <Link href={`/categories/${c.id}/`} className="text-sm font-semibold text-brand hover:underline">All {c.title} →</Link>
        </div>
        <RelatedGrid names={rel} />
      </section>
    </div>
  );
}
