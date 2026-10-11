'use client';
import { useEffect, useState } from 'react';

/** Registers one demo icon per animation (base icon + only that animation) and shows them as hover tiles. */
export default function AnimLibrary({ demos }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import('tlp-icons/element').then(m => {
      const reg = {};
      for (const d of demos) reg[`tlp-demo-${d.anim}`] = d.icon;
      m.register(reg);
      setReady(true);
    });
  }, [demos]);
  return (
    <div className="my-5 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
      {demos.map(d => (
        <div key={d.anim} className="tile-host card card-hover flex flex-col items-center gap-2 px-2 pb-3 pt-4">
          <span className="tile size-14">{ready && <tlp-icon name={`tlp-demo-${d.anim}`} size="30" stroke="1.75" duotone={d.anim === 'fillIn' ? '' : undefined} suppressHydrationWarning />}</span>
          <b className="font-mono text-xs text-ink">{d.anim}</b>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">{d.kind}</span>
        </div>
      ))}
    </div>
  );
}
