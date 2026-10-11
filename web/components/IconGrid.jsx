'use client';

/**
 * Compact icon grid: receives only names (small page payload) and renders short markup styled by the .ig class.
 * `fresh` marks tlp originals with a "new" badge.
 */
export default function IconGrid({ names, fresh = [], size = 28 }) {
  const isNew = new Set(fresh);
  return (
    <div className="ig">
      {names.map(n => (
        <a key={n} href={`/icons/${n}/`} title={n}>
          <span><tlp-icon name={n} size={String(size)} stroke="1.75" duotone="" suppressHydrationWarning /></span>
          {n}
          {isNew.has(n) && <i>new</i>}
        </a>
      ))}
    </div>
  );
}
