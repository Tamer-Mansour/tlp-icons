import fs from 'node:fs';
import path from 'node:path';
import { ensureNpmPackage, npmLatest } from '../lib/cache.mjs';

/**
 * Tabler Icons (MIT), outline style only. Brand logos are trademarks of other companies and are skipped
 * unless `includeBrands` is enabled in config/sources.json (owner decision).
 */
export default {
  id: 'tabler',
  title: 'Tabler Icons',
  license: 'MIT',
  homepage: 'https://tabler.io/icons',
  repository: 'https://github.com/tabler/tabler-icons',
  npm: '@tabler/icons',

  latest() {
    return npmLatest(this.npm);
  },

  async fetch(version) {
    return { pkgDir: ensureNpmPackage(this.npm, version) };
  },

  async load(version, options = {}) {
    const { pkgDir } = await this.fetch(version);
    const list = Object.values(JSON.parse(fs.readFileSync(path.join(pkgDir, 'icons.json'), 'utf8')));
    const icons = [];
    const categories = new Set();
    for (const meta of list.sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (!meta.styles?.outline) continue;
      const category = meta.category || 'Uncategorized';
      categories.add(category);
      if (category === 'Brand' && !options.includeBrands) continue;
      const svgFile = path.join(pkgDir, 'icons', 'outline', `${meta.name}.svg`);
      if (!fs.existsSync(svgFile)) continue;
      icons.push({
        name: meta.name,
        svg: fs.readFileSync(svgFile, 'utf8'),
        tags: (meta.tags || []).map(String),
        categories: [category],
        aliases: [],
      });
    }
    return {
      icons,
      categories: [...categories].sort(),
      categoryTitles: Object.fromEntries([...categories].map(c => [c, c])),
      licenseText: fs.readFileSync(path.join(pkgDir, 'LICENSE'), 'utf8'),
    };
  },
};
