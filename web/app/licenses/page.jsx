import fs from 'node:fs';
import path from 'node:path';
import { data, sources } from '@/lib/data';
import { REPO_URL } from '@/lib/site';

export const metadata = {
  title: 'Licenses & credits',
  description: 'Where every tlp-icons icon comes from and under which license: Lucide (ISC), Tabler Icons (MIT) and the tlp originals (MIT), with the full license texts.',
  alternates: { canonical: '/licenses/' },
};

const FILES = { lucide: 'lucide.LICENSE.txt', tabler: 'tabler.LICENSE.txt', tlp: 'tlp.LICENSE.txt' };
const text = f => fs.readFileSync(path.join(process.cwd(), '..', 'licenses', f), 'utf8');

export default function Licenses() {
  const D = data();
  const src = sources();
  const counts = {};
  for (const i of Object.values(D.icons)) counts[i.source] = (counts[i.source] || 0) + 1;
  return (
    <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
      <p className="text-sm font-semibold text-brand">Licenses &amp; credits</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Where the icons come from</h1>
      <p className="mt-4 text-lg leading-8 text-ink-2">
        tlp-icons is MIT licensed and free for personal and commercial use. It is built on two open-source icon sets and on
        icons drawn for this project. Every icon page names its source and license. Keep the notices below when you
        redistribute the icons.
      </p>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-ink-3"><tr><th className="py-2 pr-4">Source</th><th className="py-2 pr-4">License</th><th className="py-2 pr-4 text-right">Icons</th></tr></thead>
          <tbody>
            {Object.entries(src).map(([id, s]) => (
              <tr key={id} className="border-t border-line">
                <td className="py-2 pr-4"><a className="font-semibold hover:text-brand" href={s.homepage} target="_blank" rel="noopener">{s.title}</a></td>
                <td className="py-2 pr-4">{s.license}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{(counts[id] || 0).toLocaleString('en')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 className="mt-12 text-2xl font-bold tracking-tight">Not included</h2>
      <p className="mt-3 leading-7 text-ink-2">
        No icons, fonts or artwork from Font Awesome, Material Symbols, Heroicons, Ionicons, Bootstrap Icons, Phosphor,
        Iconoir, Simple Icons or any other set are included. The tlp originals are drawn from scratch on our own 24×24
        grid. No icon fonts or font files are shipped. If you believe an icon infringes your rights,
        please <a className="font-semibold text-brand" href={`${REPO_URL}/issues`} target="_blank" rel="noopener">open an issue</a>.
      </p>
      <h2 className="mt-12 text-2xl font-bold tracking-tight">Trademarks</h2>
      <p className="mt-3 leading-7 text-ink-2">
        Brand logos (icons named <code>brand-*</code>, from Tabler Icons) are trademarks of their owners and are included only to
        identify their products. Inclusion does not imply endorsement. Follow each owner&apos;s brand guidelines; some do not
        allow altered or animated logos, so use <code>animated=&quot;false&quot;</code> for those.
      </p>
      {Object.entries(FILES).map(([id, f]) => (
        <section key={id} className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">{src[id]?.title || id} license</h2>
          <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-paper p-4 text-xs leading-5 text-ink-2 ring-1 ring-line">{text(f)}</pre>
        </section>
      ))}
    </div>
  );
}
