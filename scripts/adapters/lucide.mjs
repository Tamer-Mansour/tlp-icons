import fs from 'node:fs';
import path from 'node:path';
import { ensureNpmPackage, ensureGithubTarball, npmLatest } from '../lib/cache.mjs';

/**
 * Lucide (ISC). SVGs and tags come from the `lucide-static` npm package; categories and aliases are not
 * published to npm, so they are read from the GitHub repository at the same version tag.
 */
export default {
  id: 'lucide',
  title: 'Lucide',
  license: 'ISC',
  homepage: 'https://lucide.dev',
  repository: 'https://github.com/lucide-icons/lucide',
  npm: 'lucide-static',

  latest() {
    return npmLatest(this.npm);
  },

  async fetch(version) {
    const pkgDir = ensureNpmPackage(this.npm, version);
    const srcDir = await ensureGithubTarball('lucide-icons/lucide', version, ['*/icons/*.json', '*/categories/*.json', '*/LICENSE']);
    return { pkgDir, srcDir };
  },

  async load(version) {
    const { pkgDir, srcDir } = await this.fetch(version);
    const tags = JSON.parse(fs.readFileSync(path.join(pkgDir, 'tags.json'), 'utf8'));
    const categoryTitles = {};
    for (const f of fs.readdirSync(path.join(srcDir, 'categories')).filter(f => f.endsWith('.json'))) {
      const meta = JSON.parse(fs.readFileSync(path.join(srcDir, 'categories', f), 'utf8'));
      categoryTitles[f.slice(0, -5)] = meta.title;
    }
    const icons = [];
    for (const name of Object.keys(tags).sort()) {
      const svgFile = path.join(pkgDir, 'icons', `${name}.svg`);
      if (!fs.existsSync(svgFile)) continue;
      const metaFile = path.join(srcDir, 'icons', `${name}.json`);
      const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
      icons.push({
        name,
        svg: fs.readFileSync(svgFile, 'utf8'),
        tags: tags[name] || meta.tags || [],
        categories: meta.categories || [],
        aliases: (meta.aliases || []).map(a => (typeof a === 'string' ? a : a.name)).filter(Boolean),
      });
    }
    return {
      icons,
      categories: Object.keys(categoryTitles).sort(),
      categoryTitles,
      licenseText: fs.readFileSync(path.join(pkgDir, 'LICENSE'), 'utf8'),
    };
  },
};
