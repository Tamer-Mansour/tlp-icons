'use client';

/** Related icons, rendered by the tlp-icons element (keeps the static page small). */
export default function RelatedGrid({ names }) {
  return (
    <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5">
      {names.map(n => (
        <li key={n}>
          <a href={`/icons/${n}/`} title={n} className="tile-host card card-hover flex flex-col items-center gap-2 px-2 pb-3 pt-4">
            <span className="tile size-12"><tlp-icon name={n} size="24" stroke="1.75" suppressHydrationWarning /></span>
            <span className="w-full truncate text-center font-mono text-[11px] text-ink">{n}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
