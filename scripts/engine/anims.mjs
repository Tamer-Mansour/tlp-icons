// The animation library: names, default durations (design ms, before SPEED) and kinds.
// Keyframes live in src/runtime/tlp-icons.css; tests check both sides stay in sync.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SPEED = 0.6;

export const ANIMS = {
  // entrances: the part appears into place
  draw: { kind: 'entrance', dur: 1000 },
  fillIn: { kind: 'entrance', dur: 900 },
  popIn: { kind: 'entrance', dur: 800 },
  fadeIn: { kind: 'entrance', dur: 700 },
  slideIn: { kind: 'entrance', dur: 800 },
  riseIn: { kind: 'entrance', dur: 800 },
  dropIn: { kind: 'entrance', dur: 800 },
  grow: { kind: 'entrance', dur: 900 },
  growX: { kind: 'entrance', dur: 800 },
  // gestures: the part moves and returns exactly to rest
  pop: { kind: 'gesture', dur: 800 },
  breathe: { kind: 'gesture', dur: 1300 },
  jelly: { kind: 'gesture', dur: 1100 },
  swing: { kind: 'gesture', dur: 1400 },
  wiggle: { kind: 'gesture', dur: 1100 },
  tilt: { kind: 'gesture', dur: 1100 },
  nod: { kind: 'gesture', dur: 1000 },
  strike: { kind: 'gesture', dur: 1100 },
  hop: { kind: 'gesture', dur: 1000 },
  lift: { kind: 'gesture', dur: 1000 },
  sink: { kind: 'gesture', dur: 1000 },
  nudge: { kind: 'gesture', dur: 1000 },
  nudgeBack: { kind: 'gesture', dur: 1000 },
  float: { kind: 'gesture', dur: 1600 },
  flip: { kind: 'gesture', dur: 1200 },
  spin: { kind: 'turn', dur: 1500 },
  spinBack: { kind: 'turn', dur: 1500 },
  spinHalf: { kind: 'turn', dur: 1200 },
  sweep: { kind: 'turn', dur: 1600 },
  sweepHour: { kind: 'hour', dur: 1600 },
  blink: { kind: 'gesture', dur: 900 },
  shake: { kind: 'gesture', dur: 1000 },
  pulseRing: { kind: 'gesture', dur: 1200 },
  orbit: { kind: 'turn', dur: 1600 },
  stretch: { kind: 'gesture', dur: 1000 },
};

// Extra animation batches: config/animations/<batch>.json ([{ name, kind, dur, ease? }]) with keyframes in
// src/runtime/anims/<batch>.css and keyword rules in config/rules-extra/<batch>.json (applied before rules.json).
// TLP_BATCHES=a,b limits loading to those batches (lets several people build and review in parallel).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ONLY = process.env.TLP_BATCHES ? new Set(process.env.TLP_BATCHES.split(',').map(s => s.trim())) : null;
const batchFiles = (dir, ext) => {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter(f => f.endsWith(ext) && !f.startsWith('_') && (!ONLY || ONLY.has(f.slice(0, -ext.length)))).sort().map(f => path.join(d, f));
};

/** Easing per extra animation (merged into EASE in the runtime by the build). */
export const EXTRA_EASE = {};
for (const file of batchFiles('config/animations', '.json')) {
  for (const a of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    if (ANIMS[a.name]) throw new Error(`${path.basename(file)}: animation ${a.name} already exists`);
    if (!['entrance', 'gesture', 'turn'].includes(a.kind)) throw new Error(`${path.basename(file)}: ${a.name} has kind ${a.kind}`);
    ANIMS[a.name] = { kind: a.kind, dur: a.dur };
    if (a.ease) EXTRA_EASE[a.name] = a.ease;
  }
}

/** The runtime stylesheet: src/runtime/tlp-icons.css plus every batch's keyframes (before the reduced-motion rule). */
export function runtimeCss() {
  const base = fs.readFileSync(path.join(ROOT, 'src', 'runtime', 'tlp-icons.css'), 'utf8');
  const extra = batchFiles('src/runtime/anims', '.css').map(f => fs.readFileSync(f, 'utf8').trim()).filter(Boolean).join('\n');
  if (!extra) return base;
  const at = base.indexOf('@media (prefers-reduced-motion');
  return `${base.slice(0, at)}${extra}\n\n${base.slice(at)}`;
}

/**
 * Hold points for trigger="hold": where each animation pauses while hovered (0..1 of its own duration).
 * Gestures hold at their most displaced visible keyframe, turns half way (spinHalf at its end), entrances are
 * skipped to their end (not listed: the runtime treats a missing entry as "jump to the end").
 */
const PLAY_THROUGH = new Set(['blink', 'pulseRing', 'drip', 'fall', 'retrace']);
export function holdPoints(css = runtimeCss()) {
  const out = {};
  for (const [, name, body] of css.matchAll(/@keyframes tlp-(\w+)\{((?:[^{}]*\{[^{}]*\})*)\}/g)) {
    const a = ANIMS[name];
    if (!a || a.kind === 'entrance') continue;
    if (a.kind !== 'gesture') { out[name] = name === 'spinHalf' ? 1 : 0.5; continue; }
    // a frozen mid-frame would look broken (closed eye, faded ring, half-erased stroke): play once to rest instead
    if (PLAY_THROUGH.has(name)) { out[name] = 1; continue; }
    let best = 0.5, score = -1;
    for (const [, sel, decl] of body.matchAll(/([\d.%,\s]+)\{([^}]*)\}/g)) {
      const op = /(?:^|;)\s*opacity:\s*([\d.]+)/.exec(decl);
      if (op && +op[1] < 0.6) continue; // never freeze a part while it is faded out
      let s = 0;
      for (const [, fn, args] of decl.matchAll(/(\w+)\(([^)]*)\)/g)) {
        const v = args.split(',').map(parseFloat).filter(x => !Number.isNaN(x));
        if (fn.startsWith('translate')) s += v.reduce((t, x) => t + Math.abs(x), 0);
        else if (fn.startsWith('rotate') || fn.startsWith('skew')) s += v.reduce((t, x) => t + Math.abs(x), 0) / 6;
        else if (fn.startsWith('scale')) s += v.reduce((t, x) => t + Math.abs(x - 1), 0) * 25;
      }
      if (/stroke-dashoffset:\s*([\d.]+)/.test(decl)) s += parseFloat(/stroke-dashoffset:\s*([\d.]+)/.exec(decl)[1]) * 3;
      for (const p of sel.split(',').map(x => parseFloat(x) / 100)) if (p > 0 && p < 1 && s > score) { score = s; best = p; }
    }
    out[name] = +best.toFixed(3);
  }
  return out;
}

/** config/rules.json with the batches' extra rules in front (first matching rule wins). */
export function loadRules() {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'rules.json'), 'utf8'));
  const extra = batchFiles('config/rules-extra', '.json').flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  return { ...cfg, rules: [...extra, ...cfg.rules] };
}

export const ANIM_NAMES = Object.keys(ANIMS);

/** Old prototype names still found in some overrides. */
export const LEGACY = { ring: 'swing', drop: 'sink', rise: 'lift', slideX: 'nudge', slideXBack: 'nudgeBack', bounce: 'hop', pulse: 'breathe', tick: 'sweep' };

export const LIMITS = { durMin: 300, durMax: 2400, delayMax: 1500, totalMax: 2600 };
