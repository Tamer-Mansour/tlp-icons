'use client';
import { useEffect, useState } from 'react';

export default function DocsToc({ items }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-90px 0px -70% 0px' });
    items.forEach(i => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 text-sm">
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">On this page</p>
      {items.map(i => (
        <a key={i.id} href={`#${i.id}`} className={`block rounded-lg px-3 py-1.5 transition ${i.sub ? 'ps-6 text-[13px]' : 'font-medium'} ${active === i.id ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-paper hover:text-ink'}`}>{i.title}</a>
      ))}
    </nav>
  );
}
