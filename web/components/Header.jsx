'use client';
// Client component on purpose: shared markup ships once in a cached script, not in every static page.
import Link from 'next/link';
import GithubMark from './GithubMark';
import NavLinks from './NavLinks';
import { LINKS } from '@/lib/nav';
import { REPO_URL } from '@/lib/site';

const Icon = ({ name, size }) => <tlp-icon name={name} size={size} stroke="2" suppressHydrationWarning />;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="tlp-icons home">
          <img src="/favicon.svg" alt="" width="34" height="34" className="size-[34px] rounded-[10px] shadow-[0_6px_16px_-6px_#4f46e5] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
          <span className="text-[17px] font-bold tracking-tight">tlp-icons</span>
          <span className="hidden rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink-2 sm:inline">v0.1</span>
        </Link>
        <NavLinks />
        <div className="ms-auto flex items-center gap-2">
          <Link href="/icons/" className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-ink-3 shadow-card transition hover:border-indigo-200 hover:text-ink-2 md:flex">
            <Icon name="search" size="16" />
            <span className="w-40 text-start">Search icons…</span>
          </Link>
          <a href={REPO_URL} target="_blank" rel="noopener" className="flex h-9 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            <GithubMark />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <details className="group relative lg:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-lg border border-line bg-white text-ink-2 [&::-webkit-details-marker]:hidden" aria-label="Menu">
              <Icon name="menu" size="18" stroke="2" />
            </summary>
            <div className="absolute end-0 top-11 w-52 rounded-xl border border-line bg-white p-1.5 shadow-lift">
              {LINKS.map(([href, text]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-2 hover:bg-paper hover:text-ink">{text}</Link>)}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
