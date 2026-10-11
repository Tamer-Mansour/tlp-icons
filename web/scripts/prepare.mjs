// Runs before dev/build: builds a compact search index for the gallery from the tlp-icons package data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(WEB, 'node_modules', 'tlp-icons', 'dist', 'tlp-icons.json');
if (!fs.existsSync(dataFile)) {
  console.error('tlp-icons data not found. Run "npm run build" in the repository root first, then "npm install" in web/.');
  process.exit(1);
}
const D = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const catIndex = Object.fromEntries(D.categories.map((c, k) => [c.id, k]));
const index = {
  version: D.version,
  categories: D.categories,
  // [name, category index, tags joined, source index]
  icons: Object.entries(D.icons).map(([n, i]) => [n, catIndex[i.category], (i.tags || []).join(' '), i.source]),
};
fs.mkdirSync(path.join(WEB, 'public'), { recursive: true });
fs.writeFileSync(path.join(WEB, 'public', 'search.json'), JSON.stringify(index));
const og = path.join(WEB, '..', 'src', 'site', 'og-image.png');
if (fs.existsSync(og)) fs.copyFileSync(og, path.join(WEB, 'public', 'og-image.png'));
console.log(`search index: ${index.icons.length} icons`);
