// Minifies dist/ in place with esbuild (files stay separate: no bundling, no splitting) and reports sizes.
// - runtime code files get a sourcemap (with sources) and keep the license banner
// - pure data files (icon chunks, the offline bundle) are minified without maps: they are object literals,
//   a map would add ~1 MB per copy while mapping nothing worth debugging
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

// no source map: pure data, or (jsx.js) an empty types-only stub
const DATA_FILES = new Set(['tlp-icons.all.js', 'jsx.js', 'anims.js']);
const CLASSIC_SCRIPTS = new Set(['tlp-icons.all.js', 'tlp-icons.runtime.js']);

export function minifyDist(ROOT, DIST, banner) {
  const esbuild = createRequire(path.join(ROOT, 'package.json'))('esbuild');
  const bannerLine = banner.trim();
  const jsFiles = [
    ...fs.readdirSync(DIST).filter(f => f.endsWith('.js')).map(f => ({ rel: f, data: DATA_FILES.has(f) })),
    ...fs.readdirSync(path.join(DIST, 'icons')).filter(f => f.endsWith('.js')).map(f => ({ rel: `icons/${f}`, data: true })),
  ];
  for (const { rel, data } of jsFiles) {
    const file = path.join(DIST, rel);
    const base = path.basename(rel);
    const code = fs.readFileSync(file, 'utf8');
    const result = esbuild.transformSync(code, {
      minify: true,
      format: CLASSIC_SCRIPTS.has(base) ? undefined : 'esm',
      target: 'es2020',
      sourcemap: data ? false : 'external',
      sourcefile: base,
      sourcesContent: true,
      legalComments: 'inline',
      banner: bannerLine,
      charset: 'utf8',
    });
    let out = result.code;
    if (!data) {
      out += `//# sourceMappingURL=${base}.map\n`;
      fs.writeFileSync(`${file}.map`, result.map);
    }
    fs.writeFileSync(file, out);
  }
  const cssFile = path.join(DIST, 'tlp-icons.css');
  const css = esbuild.transformSync(fs.readFileSync(cssFile, 'utf8'), { loader: 'css', minify: true, banner: bannerLine, legalComments: 'inline' });
  fs.writeFileSync(cssFile, css.code);
}

const gz = buf => zlib.gzipSync(buf, { level: 9 }).length;

/** Size table for the key files; returns { rows, failures }. */
export function sizeReport(DIST, limits) {
  const read = rel => fs.readFileSync(path.join(DIST, rel));
  const measure = (label, rels) => {
    const bufs = rels.map(read);
    const raw = bufs.reduce((a, b) => a + b.length, 0);
    const gzip = gz(Buffer.concat(bufs));
    return { label, files: rels, raw, gzip };
  };
  const chunks = fs.readdirSync(path.join(DIST, 'icons')).filter(f => f.endsWith('.js')).map(f => ({ f, size: read(`icons/${f}`).length })).sort((a, b) => a.size - b.size);
  const avg = chunks.reduce((t, c) => t + gz(read(`icons/${c.f}`)), 0) / chunks.length;
  const rows = [
    measure('element core (tlp-icon + core + element)', ['tlp-icon.js', 'core.js', 'element.js']),
    measure('manifest (optional: categoryOf, CATEGORIES, ALIASES)', ['manifest.js']),
    measure(`smallest icon bucket (icons/${chunks[0].f})`, [`icons/${chunks[0].f}`]),
    measure(`largest icon bucket (icons/${chunks.at(-1).f})`, [`icons/${chunks.at(-1).f}`]),
    measure('keyframes (anims.js, loaded with the first icon)', ['anims.js']),
    measure('all icons, offline bundle (tlp-icons.all.js)', ['tlp-icons.all.js']),
    measure('stylesheet (tlp-icons.css)', ['tlp-icons.css']),
  ];
  const failures = [];
  if (rows[0].gzip > limits.elementCore) failures.push(`element core is ${(rows[0].gzip / 1024).toFixed(2)} KB gzip (limit ${(limits.elementCore / 1024).toFixed(0)} KB)`);
  if (rows[1].gzip > limits.manifest) failures.push(`manifest is ${(rows[1].gzip / 1024).toFixed(2)} KB gzip (limit ${(limits.manifest / 1024).toFixed(0)} KB)`);
  return { rows, failures, limits, buckets: chunks.length, bucketGzipAvg: Math.round(avg) };
}

export function formatSizeTable(rows) {
  const kb = n => `${(n / 1024).toFixed(1)} KB`;
  const w = Math.max(...rows.map(r => r.label.length));
  return rows.map(r => `  ${r.label.padEnd(w)}  ${kb(r.raw).padStart(10)} raw  ${kb(r.gzip).padStart(9)} gzip`).join('\n');
}
