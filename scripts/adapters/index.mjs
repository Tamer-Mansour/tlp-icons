import lucide from './lucide.mjs';
import tabler from './tabler.mjs';

/**
 * Every source implements the same interface:
 *   id, title, license, homepage, repository, npm
 *   latest()            -> newest upstream version
 *   fetch(version)      -> makes sure the files are in the cache
 *   load(version, opts) -> { icons: [{ name, svg, tags, categories, aliases }], categories, categoryTitles, licenseText }
 * Order matters: on a name clash the earlier source wins.
 */
export const adapters = [lucide, tabler];
