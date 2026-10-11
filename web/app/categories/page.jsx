import Link from 'next/link';
import Icon from '@/components/Icon';
import { categories, iconsIn, total, roadmap } from '@/lib/data';

export const metadata = {
  title: 'Icon categories',
  description: 'Browse animated icons by category: interface, arrows, legal, health, finance, brands and more.',
  alternates: { canonical: '/categories/' },
};

export default function CategoriesPage() {
  const rm = roadmap();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
      <p className="mt-2 text-ink-2">{categories().length} hand-curated categories, {total().toLocaleString('en')} icons.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories().map(c => {
          const sample = iconsIn(c.id).slice(0, 8);
          const target = rm.categories[c.id]?.target;
          return (
            <Link key={c.id} href={`/categories/${c.id}/`} className="card card-hover group p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${c.color} 12%, white)`, color: c.color }}><Icon name={c.icon} size="22" stroke="2" /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-ink">{c.title}</h2>
                  <p className="text-xs text-ink-3">{c.count.toLocaleString('en')} icons{target ? ` · goal ${target.toLocaleString('en')}` : ''}</p>
                </div>
                <span className="text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-brand">→</span>
              </div>
              <div className="mt-5 grid grid-cols-8 gap-1 text-ink-2" style={{ color: c.color }}>
                {sample.map(n => <span key={n} className="grid aspect-square place-items-center rounded-lg bg-paper"><Icon name={n} size="18" stroke="1.75" ssr={false} /></span>)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
