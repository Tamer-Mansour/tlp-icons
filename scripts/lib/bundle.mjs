// Tiny "bundler" for the runtime: the sources only use top-level `export` and one relative import.
import fs from 'node:fs';
import path from 'node:path';

export function bundleRuntime(root, css) {
  const dir = path.join(root, 'src', 'runtime');
  const minCss = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').trim();
  const core = fs.readFileSync(path.join(dir, 'core.js'), 'utf8').replace("'/*__CSS__*/'", JSON.stringify(minCss));
  const element = fs.readFileSync(path.join(dir, 'element.js'), 'utf8');
  const strip = src => src.replace(/^import[^;]+;\s*$/gm, '').replace(/^export (const|function|class|let) /gm, '$1 ');
  const exported = [...core.matchAll(/^export (?:const|function|class|let) ([A-Za-z_$][\w$]*)/gm)].map(m => m[1]);
  const iife = `(function () {\n'use strict';\n${strip(core)}\n${strip(element)}\nvar api = { ${[...exported, 'TlpIcon'].join(', ')} };\nif (typeof window !== 'undefined') window.TlpIcons = api;\n})();\n`;
  return { coreEsm: core, elementEsm: element, iife };
}
