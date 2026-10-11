#!/usr/bin/env node
// Installs Playwright for the optional browser tests into the cache folder (outside the repo / OneDrive).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { CACHE_DIR } from './lib/cache.mjs';

const dir = path.join(CACHE_DIR, 'tools');
fs.mkdirSync(dir, { recursive: true });
if (!fs.existsSync(path.join(dir, 'package.json'))) fs.writeFileSync(path.join(dir, 'package.json'), '{"name":"tlp-icons-tools","private":true}\n');
execSync('npm install playwright@latest --no-audit --no-fund', { cwd: dir, stdio: 'inherit' });
execSync('npx playwright install chromium', { cwd: dir, stdio: 'inherit' });
console.log(`Playwright ready in ${dir}`);
