import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export const CACHE_DIR = process.env.TLP_ICONS_CACHE
  || path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), '.cache'), 'tlp-icons-cache');

const isWin = process.platform === 'win32';

function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: isWin && cmd === 'npm', ...opts }).trim();
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Latest published version of an npm package. */
export function npmLatest(pkg) {
  return run('npm', ['view', `${pkg}@latest`, 'version']);
}

function extract(tgz, dest, include = []) {
  ensureDir(dest);
  const args = ['-xzf', tgz, '-C', dest];
  for (const pattern of include) args.push('--include', pattern);
  run('tar', args);
}

/**
 * Makes sure `<pkg>@<version>` is unpacked in the cache and returns the package folder.
 * Uses `npm pack` so it works without node_modules.
 */
export function ensureNpmPackage(pkg, version) {
  const slug = pkg.replace(/^@/, '').replace(/\//g, '-');
  const dir = path.join(CACHE_DIR, `${slug}-${version}`);
  const pkgDir = path.join(dir, 'package');
  if (fs.existsSync(path.join(pkgDir, 'package.json'))) return pkgDir;
  ensureDir(CACHE_DIR);
  const tgz = path.join(CACHE_DIR, `${slug}-${version}.tgz`);
  if (!fs.existsSync(tgz)) {
    console.log(`  npm pack ${pkg}@${version}`);
    const name = run('npm', ['pack', `${pkg}@${version}`, '--silent', '--pack-destination', CACHE_DIR]).split(/\r?\n/).pop();
    const produced = path.join(CACHE_DIR, name);
    if (produced !== tgz) fs.renameSync(produced, tgz);
  }
  extract(tgz, dir);
  return pkgDir;
}

/** Downloads a GitHub tag tarball and extracts only the matching paths. Returns the extracted root folder. */
export async function ensureGithubTarball(repo, tag, include) {
  const slug = `${repo.split('/')[1]}-src-${tag}`;
  const dir = path.join(CACHE_DIR, slug);
  const marker = path.join(dir, '.complete');
  const findRoot = () => fs.readdirSync(dir, { withFileTypes: true }).find(d => d.isDirectory());
  if (fs.existsSync(marker)) return path.join(dir, findRoot().name);
  ensureDir(CACHE_DIR);
  const tgz = path.join(CACHE_DIR, `${slug}.tgz`);
  if (!fs.existsSync(tgz)) {
    const url = `https://codeload.github.com/${repo}/tar.gz/refs/tags/${tag}`;
    console.log(`  download ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    fs.writeFileSync(tgz, Buffer.from(await res.arrayBuffer()));
  }
  extract(tgz, dir, include);
  fs.writeFileSync(marker, new Date().toISOString());
  return path.join(dir, findRoot().name);
}
