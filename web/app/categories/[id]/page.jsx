import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import IconGrid from '@/components/IconGrid';
import { categories, category, iconsIn, roadmap, icon } from '@/lib/data';

export const dynamicParams = false;
export function generateStaticParams() {
  return categories().map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = category(id);
  if (!c) return {};
  return {
    title: `${c.title} icons — ${c.count.toLocaleString('en')} animated SVG icons`,
    description: `${c.count.toLocaleString('en')} free animated ${c.title.toLowerCase()} icons for React, Angular, Vue and HTML. Open source, MIT licensed.`,
    alternates: { canonical: `/categories/${id}/` },
  };
}


export default async function CategoryPage({ params }) {
  const { id } = await params;
  const c = category(id);
  if (!c) notFound();
  const names = iconsIn(id);
  const target = roadmap().categories[id]?.target;
  const pct = target ? Math.min(100, Math.max(1, Math.round((c.count / target) * 100))) : null;
  const originals = names.filter(n => icon(n).source === 'tlp').length;
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        <div className="dots fade-mask absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6">
          <nav className="text-sm text-ink-3"><Link href="/categories/" className="hover:text-brand">Categories</Link> / <span className="text-ink-2">{c.title}</span></nav>
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <span className="grid size-16 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${c.color} 13%, white)`, color: c.color }}><Icon name={c.icon} size="32" stroke="1.75" trigger="loop" /></span>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{c.title} icons</h1>
              <p className="mt-1 text-ink-2">{c.count.toLocaleString('en')} animated icons{originals ? `, ${originals} tlp originals` : ''}. Hover to play, click for code.</p>
            </div>
            {target && (
              <Link href="/roadmap/" className="card w-full max-w-xs p-4 sm:w-72">
                <div className="flex justify-between text-xs font-semibold"><span className="text-ink-2">Roadmap</span><span className="text-ink-3">{c.count} / {target.toLocaleString('en')}</span></div>
                <div className="mt-2 h-2 rounded-full bg-paper ring-1 ring-line"><div className="h-2 rounded-full" style={{ width: `${pct}%`, background: c.color }} /></div>
              </Link>
            )}
          </div>
          {id === 'brands' && <p className="mt-6 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Brand logos are trademarks of their respective owners (for example Facebook, Instagram and WhatsApp are trademarks of Meta Platforms, Inc.). They are included only to identify those products; inclusion does not imply endorsement.</p>}
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6" style={{ '--tc': c.color }}>
        <IconGrid names={names} fresh={names.filter(n => icon(n).source === 'tlp')} />
      </div>
    </div>
  );
}
