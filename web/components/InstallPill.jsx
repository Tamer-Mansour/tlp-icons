'use client';
import { useState } from 'react';
import { copyText } from './CodeBlock';

export default function InstallPill({ cmd = 'npm install tlp-icons' }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { if (await copyText(cmd)) { setDone(true); setTimeout(() => setDone(false), 1400); } }}
      className="group inline-flex h-12 items-center gap-3 rounded-xl border border-line bg-white ps-4 pe-2 font-mono text-sm text-ink shadow-card transition hover:border-indigo-200">
      <span className="text-ink-3">$</span>{cmd}
      <span className="rounded-lg bg-paper px-2.5 py-1.5 font-sans text-xs font-semibold text-ink-2 transition group-hover:bg-brand-soft group-hover:text-brand">{done ? 'Copied ✓' : 'Copy'}</span>
    </button>
  );
}
