// Type tests: `tsc --noEmit` over test/types (React 19 types) and test/types/no-react (React types missing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

const tsc = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const project = rel => () => {
  if (!fs.existsSync(tsc)) throw new Error('typescript is not installed - run "npm install"');
  try {
    execFileSync(process.execPath, [tsc, '-p', path.join(ROOT, rel)], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    assert.fail(`tsc -p ${rel} failed:\n${err.stdout || ''}${err.stderr || ''}`);
  }
};

test('types: element, data API and <tlp-icon> in React 19 JSX compile (tsc --noEmit)', { timeout: 120000 }, project('test/types/tsconfig.json'));
test('types: tlp-icons/jsx does not error when React types are not installed', { timeout: 120000 }, project('test/types/no-react/tsconfig.json'));
