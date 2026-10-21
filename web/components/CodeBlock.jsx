'use client';
import { useState } from 'react';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (c, s) => `<span class="${c}">${s}</span>`;
const RX = {
  markup: /(&lt;!--[\s\S]*?--&gt;)|(\/\/[^\n]*)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|(&lt;\/?)([a-zA-Z][\w.-]*)|(\s)([:@]?[a-zA-Z][\w-]*)(?==)|\b(import|from|export|function|return|const|default|declare|interface|namespace)\b/g,
  script: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('[^'\n]*'|"(?:[^"\\\n]|\\.)*"|`[^`]*`)|\b(import|from|export|function|return|const|let|new|default|declare|interface|namespace|class|await|async)\b/g,
  shell: /((?:^|\s)#[^\n]*)|\b(npm|npx|git|cd|node)\b/g,
  css: /(\/\*[\s\S]*?\*\/)|(--[\w-]+)/g,
};

/** One-pass highlighter (never re-colours its own markup). */
export function highlight(code, lang) {
  const kind = /html|vue|jsx|tsx/.test(lang) ? 'markup' : lang === 'bash' ? 'shell' : lang === 'css' ? 'css' : 'script';
  return esc(code).replace(RX[kind], (m, a, b, c, d, e, f, g, h) => {
    if (kind === 'markup') {
      if (a || b) return span('tok-c', a || b);
      if (c) return span('tok-s', c);
      if (d) return d + span('tok-t', e);
      if (g) return f + span('tok-a', g);
      if (h) return span('tok-k', h);
      return m;
    }
    if (kind === 'script') return a ? span('tok-c', a) : b ? span('tok-s', b) : span('tok-k', c);
    if (kind === 'shell') return a ? span('tok-c', a) : span('tok-k', b);
    return a ? span('tok-c', a) : span('tok-a', b);
  });
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); return true; } catch { return false; } finally { ta.remove(); }
  }
}

export function CopyButton({ text, className = '' }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1400); } }}
      className={`inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 text-[11.5px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white ${className}`}>
      {done ? 'Copied ✓' : 'Copy'}
    </button>
  );
}

export default function CodeBlock({ code, lang = 'js', title }) {
  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-[#43353d] bg-[#2B2228] shadow-lg shadow-indigo-950/10">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-slate-500">{title || lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[12.5px] leading-[1.75] text-slate-200"><code dangerouslySetInnerHTML={{ __html: highlight(code, lang) }} /></pre>
    </div>
  );
}
