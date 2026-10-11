import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Static export: every page (home, gallery, docs, roadmap, one page per icon and per category) is plain HTML. */
export default {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // tlp-icons is linked from the parent folder (file:..)
  turbopack: { root: path.join(here, '..') },
  outputFileTracingRoot: path.join(here, '..'),
};
