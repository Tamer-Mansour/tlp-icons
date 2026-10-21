'use client';
// Client component on purpose: its markup ships once in a cached script instead of in every static page's payload.
import Link from 'next/link';
import GithubMark from './GithubMark';
import { REPO_URL } from '@/lib/site';

export default function Footer({ count, cats }) {
  const total = () => count;
  return (
    <footer className="mt-24 border-t border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/brand/tlp-icons-intro-once.svg" alt="" width="32" height="32" className="size-8" />
            <span className="text-base font-bold">tlp-icons</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-2">{total().toLocaleString('en')} free, open-source icons. Every one animated. MIT licensed.</p>
          <a href={REPO_URL} target="_blank" rel="noopener" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-brand">
            <GithubMark /> Star on GitHub
          </a>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Product</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="text-ink-2 hover:text-brand" href="/icons/">All icons</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/categories/">Categories</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/categories/brands/">Brand icons</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/roadmap/">Roadmap</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Docs</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="text-ink-2 hover:text-brand" href="/docs/#install">Installation</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/docs/#frameworks">React, Angular, Vue</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/docs/#api">JavaScript API</Link></li>
            <li><Link className="text-ink-2 hover:text-brand" href="/docs/#animations">Animation library</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-3">Popular categories</h3>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm">
            {cats.slice(0, 6).map(c => <li key={c.id}><Link className="text-ink-2 hover:text-brand" href={`/categories/${c.id}/`}>{c.title}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-ink-3 sm:px-6">
          <p>MIT License · Icon geometry from <a className="hover:text-brand" href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> (ISC) and <a className="hover:text-brand" href="https://tabler.io/icons" target="_blank" rel="noopener">Tabler Icons</a> (MIT) · <Link className="hover:text-brand" href="/licenses/">Licenses &amp; credits</Link></p>
          <p className="flex items-center gap-2">Brand logos are trademarks of their respective owners. <span aria-hidden="true">·</span> A <img src="/tlp-brand.svg" alt="TLP" width="40" height="18" className="inline h-[18px] w-auto" /> product</p>
        </div>
      </div>
    </footer>
  );
}
