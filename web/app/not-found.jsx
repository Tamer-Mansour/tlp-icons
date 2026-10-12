import Link from 'next/link';
import Icon from '@/components/Icon';
import { total } from '@/lib/data';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="tile size-24 text-brand"><Icon name="file-question" size="48" stroke="1.5" trigger="loop" duotone /></span>
      <h1 className="mt-8 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-ink-2">That page doesn&apos;t exist, but {total().toLocaleString('en')} icons do.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-indigo-700">Home</Link>
        <Link href="/icons/" className="inline-flex h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold hover:border-indigo-200">Browse icons</Link>
      </div>
    </div>
  );
}
