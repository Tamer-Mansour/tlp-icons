'use client';
import { useState } from 'react';
import { highlight, CopyButton } from './CodeBlock';

/** tabs: [{ id, label, lang, code }] */
export default function CodeTabs({ tabs, className = '' }) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find(t => t.id === active) || tabs[0];
  return (
    <div className={`overflow-hidden rounded-2xl border border-[#43353d] bg-[#2B2228] shadow-xl shadow-indigo-950/10 ${className}`}>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/5 px-2 py-2">
        {tabs.map(t => (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${t.id === active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {t.label}
          </button>
        ))}
        <span className="ms-auto ps-2"><CopyButton text={tab.code} /></span>
      </div>
      <pre className="max-h-[420px] overflow-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] text-slate-200"><code dangerouslySetInnerHTML={{ __html: highlight(tab.code, tab.lang) }} /></pre>
    </div>
  );
}
