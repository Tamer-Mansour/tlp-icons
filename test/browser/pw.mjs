// Resolves Playwright from node_modules or from the cache install made by `npm run setup:browser`.
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { CACHE_DIR } from '../../scripts/lib/cache.mjs';

const unwrap = m => (m.chromium ? m : m.default);

export async function loadPlaywright() {
  try { return unwrap(await import('playwright')); } catch {}
  const req = createRequire(path.join(CACHE_DIR, 'tools', 'package.json'));
  try {
    return unwrap(await import(pathToFileURL(req.resolve('playwright')).href));
  } catch {
    throw new Error('Playwright not found. Run "npm run setup:browser" once.');
  }
}
