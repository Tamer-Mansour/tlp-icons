// Tiny "bundler" for the runtime: the sources only use top-level `export` and one relative import.
import fs from 'node:fs';
import path from 'node:path';

/** baseCss: styles without @keyframes (inlined in the core). keyframes: { name: css } (the classic bundle adds them all). */
export function bundleRuntime(root, baseCss, keyframes = {}, extraEase = {}, holdPoints = {}) {
  const dir = path.join(root, 'src', 'runtime');
  const ease = Object.entries(extraEase).map(([k, v]) => `${k}: ${JSON.stringify(v)}, `).join('');
  const hold = Object.entries(holdPoints).map(([k, v]) => `${k}: ${v}`).join(', ');
  const core = fs.readFileSync(path.join(dir, 'core.js'), 'utf8').replace("'/*__CSS__*/'", JSON.stringify(baseCss)).replace('/*__EASE__*/', ease).replace('/*__HOLD__*/', hold);
  const element = fs.readFileSync(path.join(dir, 'element.js'), 'utf8');
  const strip = src => src.replace(/^import[^;]+;\s*$/gm, '').replace(/^export (const|function|class|let) /gm, '$1 ');
  const exported = [...core.matchAll(/^export (?:const|function|class|let) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
  const elementExports = [...element.matchAll(/^export (?:const|function|class|let) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
  const iife = `(function () {\n'use strict';\n${strip(core)}\naddKeyframes(${JSON.stringify(keyframes)});\n${strip(element)}\nvar api = { ${[...exported, ...elementExports].join(', ')} };\nif (typeof window !== 'undefined') window.TlpIcons = api;\n})();\n`;
  return { coreEsm: core, elementEsm: element, iife };
}
