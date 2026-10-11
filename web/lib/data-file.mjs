// Where the full icon dataset lives: tlp-icons-data (>= 0.2.0) or, for older versions, inside tlp-icons/dist.
import fs from 'node:fs';
import path from 'node:path';

export function dataFile(webDir = process.cwd()) {
  const candidates = [
    path.join(webDir, 'node_modules', 'tlp-icons-data', 'tlp-icons.json'),
    path.join(webDir, 'node_modules', 'tlp-icons', 'dist', 'tlp-icons.json'),
  ];
  const found = candidates.find(f => fs.existsSync(f));
  if (!found) throw new Error('tlp-icons data not found: install tlp-icons-data (tlp-icons >= 0.2.0) or tlp-icons 0.1.x in web/');
  return found;
}

/** dist/stats.json of the installed tlp-icons package (>= 0.2.0), or null for older versions. */
export function statsFile(webDir = process.cwd()) {
  const f = path.join(webDir, 'node_modules', 'tlp-icons', 'dist', 'stats.json');
  return fs.existsSync(f) ? f : null;
}
