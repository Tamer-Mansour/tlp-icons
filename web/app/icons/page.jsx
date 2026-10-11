import Gallery from '@/components/Gallery';
import { categories, total } from '@/lib/data';

export const metadata = {
  title: 'All animated icons',
  description: `Search ${total().toLocaleString('en')} free animated SVG icons by name, tag or category. Copy code for React, Angular, Vue or HTML.`,
  alternates: { canonical: '/icons/' },
};

export default function IconsPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Icons</h1>
        <p className="mt-2 text-ink-2">{total().toLocaleString('en')} icons, every one animated. Hover to play, click for code.</p>
      </section>
      <Gallery categories={categories()} />
    </>
  );
}
