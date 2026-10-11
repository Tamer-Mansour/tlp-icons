#!/usr/bin/env node
// Writes ROADMAP.md from config/roadmap.json and the current build (dist/tlp-icons.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rm = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'roadmap.json'), 'utf8'));
const D = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'tlp-icons.json'), 'utf8'));
const now = Object.keys(D.icons).length;
const bar = p => '█'.repeat(Math.round(p / 10)) + '░'.repeat(10 - Math.round(p / 10));
const rows = D.categories.map(c => ({ ...c, target: rm.categories[c.id]?.target || c.count, priority: rm.categories[c.id]?.priority || 3 }))
  .sort((a, b) => a.priority - b.priority || b.target - a.target);

let md = `# Roadmap\n\n> Generated from \`config/roadmap.json\` by \`node scripts/roadmap.mjs\`. Live version: https://tlp-icons.netlify.app/roadmap/\n\n`;
md += `**Goal: ${rm.goal.total.toLocaleString('en')} animated icons by ${rm.goal.by}.** Today: ${now.toLocaleString('en')} (${Math.round((now / rm.goal.total) * 100)}%).\n\n`;
md += `## Principles\n\n${rm.principles.map(p => `- ${p}`).join('\n')}\n\n## Phases\n\n`;
for (const p of rm.phases) md += `### ${p.name} (${p.when}, ${p.target.toLocaleString('en')} icons)\n\n${p.items.map(i => `- ${i}`).join('\n')}\n\n`;
md += `## Categories\n\n| Category | Priority | Now | Goal | Progress |\n| --- | --- | ---: | ---: | --- |\n`;
for (const r of rows) {
  const pct = Math.min(100, Math.round((r.count / r.target) * 100));
  md += `| ${r.title} | ${['', 'High', 'Medium', 'Normal'][r.priority]} | ${r.count.toLocaleString('en')} | ${r.target.toLocaleString('en')} | \`${bar(pct)}\` ${pct}% |\n`;
}
md += `\n## Planned fields\n\nSeed lists for the next batches (✓ = already in the library).\n\n`;
for (const r of rows) {
  const fields = rm.categories[r.id]?.fields;
  if (!fields) continue;
  md += `### ${r.title} (${r.count} → ${r.target.toLocaleString('en')})\n\n`;
  for (const [f, names] of Object.entries(fields)) md += `- **${f}:** ${names.map(n => (D.icons[n] ? `✓ \`${n}\`` : `\`${n}\``)).join(', ')}\n`;
  md += '\n';
}
md += `## Candidate sources (only after license review and owner approval)\n\n| Set | License | Note |\n| --- | --- | --- |\n${rm.candidateSources.map(s => `| ${s.name} | ${s.license} | ${s.note} |`).join('\n')}\n`;
fs.writeFileSync(path.join(ROOT, 'ROADMAP.md'), md);
console.log(`ROADMAP.md written (${now} / ${rm.goal.total})`);
