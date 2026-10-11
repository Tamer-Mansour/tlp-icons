'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LINKS } from '@/lib/nav';

export default function NavLinks() {
  const path = usePathname() || '/';
  const active = href => (href === '/categories/' ? path.startsWith('/categories') && !path.startsWith('/categories/brands') : path.startsWith(href));
  return (
    <nav className="ms-2 hidden items-center gap-0.5 lg:flex">
      {LINKS.map(([href, text]) => (
        <Link key={href} href={href} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${active(href) ? 'bg-brand-soft text-brand' : 'text-ink-2 hover:bg-paper hover:text-ink'}`}>
          {text}
        </Link>
      ))}
    </nav>
  );
}
