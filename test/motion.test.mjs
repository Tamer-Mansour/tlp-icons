import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, readJson, keyframes } from './helpers.mjs';
import { ANIMS } from '../scripts/engine/anims.mjs';
import { tokenize, toSubpaths } from '../scripts/engine/path.mjs';
import { parseUpstreamSvg } from '../scripts/engine/svg.mjs';
import { atomize } from '../scripts/engine/atoms.mjs';
import { choreograph, validateRules } from '../scripts/engine/motion.mjs';

const css = fs.readFileSync(path.join(ROOT, 'src', 'runtime', 'tlp-icons.css'), 'utf8');
const KF = keyframes(css);

test('every anim has a tlp- keyframe and every keyframe is in the library', () => {
  for (const a of Object.keys(ANIMS)) assert.ok(KF[`tlp-${a}`], `missing @keyframes tlp-${a}`);
  for (const k of Object.keys(KF)) {
    assert.ok(k.startsWith('tlp-'), `unprefixed keyframe ${k}`);
    assert.ok(ANIMS[k.slice(4)], `keyframe ${k} not in the library`);
  }
});

const transformsOf = decl => [...decl.matchAll(/transform:\s*([^;]+)/g)].map(m => m[1].trim());
const opacityOf = decl => [...decl.matchAll(/(?:^|;)\s*opacity:\s*([^;]+)/g)].map(m => m[1].trim());
function identity(t) {
  const fns = [...t.matchAll(/(\w+)\(([^)]*)\)/g)];
  return fns.every(([, fn, args]) => {
    const v = args.split(',').map(s => parseFloat(s));
    if (fn.startsWith('scale')) return v.every(x => x === 1);
    if (fn.startsWith('rotate')) return v.every(x => x % 360 === 0);
    if (fn.startsWith('translate')) return v.every(x => x === 0);
    return false;
  });
}

test('gesture keyframes start and end exactly at rest', () => {
  for (const [name, a] of Object.entries(ANIMS)) {
    if (a.kind !== 'gesture') continue;
    const f = KF[`tlp-${name}`];
    for (const at of ['0%', '100%']) {
      assert.ok(f[at], `${name} has no ${at} frame`);
      for (const t of transformsOf(f[at])) assert.ok(identity(t), `${name} ${at}: ${t}`);
      for (const o of opacityOf(f[at])) assert.equal(o, '1', `${name} ${at}: opacity ${o}`);
    }
  }
});

test('entrances end fully visible and in place', () => {
  for (const [name, a] of Object.entries(ANIMS)) {
    if (a.kind !== 'entrance') continue;
    const end = KF[`tlp-${name}`]['100%'];
    assert.ok(end, `${name} has no 100% frame`);
    for (const t of transformsOf(end)) assert.ok(identity(t), `${name} 100%: ${t}`);
    for (const o of opacityOf(end)) assert.equal(o, '1');
    if (name === 'draw') assert.match(end, /stroke-dashoffset:\s*0/);
    if (name === 'fillIn') assert.match(end, /fill-opacity:\s*var\(--tlp-duo/);
  }
});

test('turns end on a symmetric angle; the hour hand keeps its accumulated angle', () => {
  for (const [name, a] of Object.entries(ANIMS)) {
    if (a.kind !== 'turn') continue;
    const end = transformsOf(KF[`tlp-${name}`]['100%'])[0];
    const deg = parseFloat(/rotate\((-?[\d.]+)deg\)/.exec(end)[1]);
    assert.ok(deg % 180 === 0, `${name} ends at ${deg}deg`);
  }
  assert.match(KF['tlp-sweepHour']['0%'], /var\(--h0/);
  assert.match(KF['tlp-sweepHour']['100%'], /var\(--h0,0deg\) \+ 30deg/);
  assert.match(css, /\.p\.hh\{transform:rotate\(var\(--h0,0deg\)\)\}/);
});

test('reduced motion is respected', () => {
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{svg\.tlp \.p\{animation:none!important\}\}/);
});

test('path tokenizer handles compact arc flags and implicit commands', () => {
  const t = tokenize('M2 2a1 1 0 011 1l1 1 2 2z');
  assert.deepEqual(t[1], { cmd: 'a', args: [1, 1, 0, 0, 1, 1, 1] });
  assert.equal(t[3].cmd, 'l');
  const subs = toSubpaths('M3 3h18M12 5v14');
  assert.equal(subs.length, 2);
  assert.deepEqual(subs[1].segs[1], { c: 'L', x: 12, y: 19 });
});

test('the svg parser rejects scripts, event handlers and foreign elements', () => {
  assert.throws(() => parseUpstreamSvg('<svg viewBox="0 0 24 24"><script>alert(1)</script></svg>'));
  assert.throws(() => parseUpstreamSvg('<svg viewBox="0 0 24 24"><path d="M0 0" onclick="x()"/></svg>'));
  assert.throws(() => parseUpstreamSvg('<svg viewBox="0 0 24 24"><image href="x.png"/></svg>'));
  assert.throws(() => parseUpstreamSvg('<svg viewBox="0 0 48 48"><path d="M0 0h1"/></svg>'));
  assert.throws(() => parseUpstreamSvg('<svg viewBox="0 0 24 24"><path style="fill:red" d="M0 0h1"/></svg>'));
});

// ---- engine behaviour on real upstream geometry (bypassing hand overrides)
const rules = readJson('config/rules.json');
const upstream = new Map();
for (const id of Object.keys(readJson('config/sources.json'))) for (const i of readJson(`upstream/${id}.json`).icons) if (!upstream.has(i.name)) upstream.set(i.name, i);
const geom = name => { const elements = parseUpstreamSvg(`<svg viewBox="0 0 24 24">${upstream.get(name).svg}</svg>`, name); return { elements, atoms: atomize(elements) }; };
const env = {
  rules: rules.rules, pureGears: new Set(rules.pureGears), mechWords: new Set(Object.values(rules.mechanics).flat()),
  mechanics: tokens => { for (const [k, w] of Object.entries(rules.mechanics)) if (tokens.some(t => w.includes(t))) return k; return null; },
  has: n => upstream.has(n), lookup: n => (upstream.has(n) ? geom(n).atoms : null), isModifier: () => true,
};
test('config/rules.json only uses known anims, targets, origins and recipes', () => {
  assert.doesNotThrow(() => validateRules(rules));
  assert.throws(() => validateRules({ rules: [{ id: 'x', words: ['x'], steps: [{ t: 'main', a: 'wobble' }] }] }), /unknown anim wobble/);
  assert.throws(() => validateRules({ rules: [{ id: 'x', words: ['x'], steps: [{ t: 'nowhere', a: 'pop' }] }] }), /unknown target/);
});

const plan = name => { const g = geom(name); return choreograph(name, g.elements, g.atoms, upstream.get(name).tags, env); };

test('clock: minute hand sweeps and hour hand advances, both around the face centre', () => {
  const r = plan('clock');
  const sweep = r.motion.find(s => s[1] === 'sweep');
  const hour = r.motion.find(s => s[1] === 'sweepHour');
  assert.ok(sweep && hour, JSON.stringify(r.motion));
  assert.equal(sweep[4], '12px 12px');
  assert.equal(hour[4], '12px 12px');
  assert.notEqual(sweep[0], hour[0], 'hands must be separate parts');
  const alarm = plan('alarm-clock');
  assert.equal(alarm.motion.find(s => s[1] === 'sweep')[4], '12px 13px');
});

test('hands are split at the centre so each starts there', () => {
  const r = plan('clock');
  const hands = [...r.svg.matchAll(/<path d="M12 12L([\d.]+) ([\d.]+)" class="p\d"\/>/g)];
  assert.equal(hands.length, 2, r.svg);
});

test('gears spin on their axle; composites spin only the cog', () => {
  const s = plan('settings');
  assert.ok(s.motion.some(m => m[1] === 'spin' && m[4] === '12px 12px'), JSON.stringify(s.motion));
  const u = plan('user-cog');
  const spin = u.motion.find(m => m[1] === 'spin');
  assert.ok(spin && spin[0] !== 'all' && /^1[6-9]/.test(spin[4]), JSON.stringify(u.motion));
});

test('arrows move the way they point', () => {
  assert.ok(plan('arrow-up').motion.some(m => m[1] === 'lift'));
  assert.ok(plan('arrow-down').motion.some(m => m[1] === 'sink'));
  assert.ok(plan('arrow-left').motion.some(m => m[1] === 'nudgeBack'));
  assert.ok(plan('arrow-right').motion.some(m => m[1] === 'nudge'));
  const diag = plan('arrow-up-right').motion.map(m => m[1]);
  assert.ok(diag.includes('lift') && diag.includes('nudge'), diag.join());
});

test('bells swing from the top, trash lid lifts while the bin shakes, checks draw then pop', () => {
  const bell = plan('bell').motion.find(m => m[1] === 'swing');
  assert.ok(bell && /px 2(\.\d+)?px$|px [23](\.\d+)?px$/.test(bell[4]), JSON.stringify(plan('bell').motion));
  const trash = plan('trash').motion.map(m => m[1]);
  assert.ok(trash.includes('lift') && trash.includes('shake'), trash.join());
  const check = plan('check').motion.map(m => m[1]);
  assert.deepEqual(check, ['draw', 'pop']);
});

test('composites: the badge animates after the base (file-plus, clock-plus)', () => {
  const r = plan('clock-plus');
  assert.ok(r.motion.some(m => m[1] === 'popIn' && m[3] >= 300), JSON.stringify(r.motion));
  assert.ok(r.motion.some(m => m[1] === 'sweep'));
});

test('engine output is deterministic', () => {
  for (const n of ['clock', 'file-plus', 'cloud-rain', 'a-arrow-down', 'zoom-money']) assert.deepEqual(plan(n), plan(n));
});
