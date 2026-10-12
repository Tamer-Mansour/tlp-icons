import Gallery from '@/components/Gallery';
import { categories, total, allNames, icon, svgMarkup } from '@/lib/data';

export const metadata = {
  title: 'All animated icons',
  description: `Search ${total().toLocaleString('en')} free animated SVG icons by name, tag or category. Copy code for React, Angular, Vue or HTML.`,
  alternates: { canonical: '/icons/' },
};

const FIRST_BATCH = 180; // same as the gallery's batch size
const FIRST_SCREEN = 48; // these also carry their SVG markup, so the first screen is visible without JS

export default function IconsPage() {
  const cats = categories();
  const catIndex = Object.fromEntries(cats.map((c, k) => [c.id, k]));
  const names = allNames().slice(0, FIRST_BATCH);
  const initial = names.map(n => [n, catIndex[icon(n).category], '', icon(n).source]);
  const svgs = Object.fromEntries(names.slice(0, FIRST_SCREEN).map(n => [n, svgMarkup(n)]));
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Icons</h1>
        <p className="mt-2 text-ink-2">{total().toLocaleString('en')} icons, every one animated. Hover to play, click for code.</p>
      </section>
      <Gallery categories={cats} initial={initial} svgs={svgs} total={total()} />
    </>
  );
}
