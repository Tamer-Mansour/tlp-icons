// Runs before dev/build: builds a compact search index for the gallery from the tlp-icons package data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dataFile } from '../lib/data-file.mjs';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const D = JSON.parse(fs.readFileSync(dataFile(WEB), 'utf8'));
const catIndex = Object.fromEntries(D.categories.map((c, k) => [c.id, k]));
const index = {
  version: D.version,
  categories: D.categories,
  // [name, category index, tags joined, source index]
  icons: Object.entries(D.icons).map(([n, i]) => [n, catIndex[i.category], (i.tags || []).join(' '), i.source]),
};
fs.mkdirSync(path.join(WEB, 'public'), { recursive: true });
fs.writeFileSync(path.join(WEB, 'public', 'search.json'), JSON.stringify(index));
console.log(`search index: ${index.icons.length} icons`);
