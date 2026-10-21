// Builds a throw-away test page that loads the library's offline bundle (dist/tlp-icons.all.js) from file://.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// TLP_DIST points the review tools at a build made with `node scripts/build.mjs --out <dir>` (<dir>/dist)
const DIST = process.env.TLP_DIST ? path.resolve(process.env.TLP_DIST) : path.join(ROOT, 'dist');

export function testPage(body, { css = '', title = 'tlp-icons test' } = {}) {
  const bundle = path.join(DIST, 'tlp-icons.all.js');
  if (!fs.existsSync(bundle)) throw new Error('dist/ missing - run "npm run build" first');
  const html = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><title>${title}</title>
<style>body{margin:0;font:13px system-ui,sans-serif;color:#741D3D;--tlp-duo:.16}${css}</style>
<script src="${pathToFileURL(bundle).href}"></script></head><body>${body}</body></html>`;
  const dir = path.join(os.tmpdir(), 'tlp-icons-test');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `page-${crypto.createHash('sha1').update(html).digest('hex').slice(0, 12)}.html`);
  fs.writeFileSync(file, html);
  return pathToFileURL(file).href;
}

export const readData = () => JSON.parse(fs.readFileSync(path.join(DIST, 'tlp-icons.json'), 'utf8'));
