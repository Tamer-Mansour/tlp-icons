'use client';
// Client component on purpose: shared markup ships once in a cached script, not in every static page.
import Link from 'next/link';
import GithubMark from './GithubMark';
import NavLinks from './NavLinks';
import { LINKS } from '@/lib/nav';
import { REPO_URL, NPM_URL } from '@/lib/site';
import pkg from 'tlp-icons/package.json';

const Icon = ({ name, size }) => <tlp-icon name={name} size={size} stroke="2" suppressHydrationWarning />;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="tlp-icons home">
          <img src="/logo.svg" alt="" width="34" height="34" className="size-[34px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
          <span className="text-[17px] font-bold tracking-tight">tlp-icons</span>
          <span className="hidden rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-ink-2 sm:inline">v{pkg.version}</span>
        </Link>
        <NavLinks />
        <div className="ms-auto flex items-center gap-2">
          <Link href="/icons/" className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-ink-3 shadow-card transition hover:border-indigo-200 hover:text-ink-2 md:flex">
            <Icon name="search" size="16" />
            <span className="w-40 text-start">Search icons…</span>
          </Link>
          <a href={NPM_URL} target="_blank" rel="noopener" aria-label="tlp-icons on npm" className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink-2 shadow-card transition hover:border-red-200 hover:text-[#cb3837]">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4"><path fill="#cb3837" d="M2 7h20v9H12v1.5H7.5V16H2zm1.5 1.5v6h3v-4.5H8v4.5h1.5v-6zm7.5 0v7.5h3v-1.5h3v-6zm3 1.5H15v3h-1.5zm4.5-1.5v6h3v-4.5H20v4.5h1.5v-6z" /></svg>
            <span className="hidden sm:inline">npm</span>
          </a>
          <a href={REPO_URL} target="_blank" rel="noopener" className="flex h-9 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white transition hover:bg-[#43353d]">
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
