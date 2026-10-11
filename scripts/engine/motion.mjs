// Motion engine: turns any stroke icon into a choreography.
// Order: hand override (handled by the caller) -> mechanics detectors -> keyword rules -> generic fallback.
// Composite icons (file-plus, circle-check, user-cog ...) are split into a base and a modifier/glyph first.
import { Plan, fitTotal } from './plan.mjs';
import { ANIMS } from './anims.mjs';
import { unionBox } from './atoms.mjs';
import {
  findBody, largest, inside, circleLike, ticks, arrowGroups, bars, slash, sortBy, chunk, px,
  isHLine, isVLine, isStraight, isDot, dedupe,
} from './select.mjs';

export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

const CONTAINERS = [['square', 'rounded'], ['circle', 'dashed'], ['circle', 'dotted'], ['square', 'dashed'], ['square', 'dotted'], ['circle'], ['square'], ['badge'], ['octagon'], ['hexagon'], ['pentagon'], ['triangle'], ['shield'], ['rosette'], ['diamond']];
const GLYPH_DRAW = new Set(['letter', 'number', 'currency', 'percentage', 'asterisk', 'hash', 'dot', 'dashed', 'dotted']);
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// ---------------------------------------------------------------- context helpers

function makeCtx(plan, atoms, opts) {
  const box = unionBox(atoms);
  const ctx = {
    plan, atoms, box,
    full: atoms.length === plan.atoms.length && opts.full !== false,
    name: opts.name, tokens: opts.tokens, tags: opts.tags || [],
    role: opts.role || 'primary', delay: opts.delay || 0, h: hash(opts.name || ''),
    body: opts.body !== undefined ? opts.body : findBody(atoms),
    claimed: new Set(),
  };
  return ctx;
}

function partOf(ctx, atoms) {
  // only an explicit whole-icon step uses the outer wrapper; fills must sit on the shape itself
  if (atoms === 'all') return 'all';
  return ctx.plan.part(atoms);
}

function add(ctx, atoms, anim, opts = {}) {
  if (!atoms || (Array.isArray(atoms) && !atoms.length)) return null;
  const part = partOf(ctx, atoms);
  const dur = opts.dur ?? ANIMS[anim].dur;
  ctx.plan.step(part, anim, dur, (opts.dl || 0) + ctx.delay, opts.o);
  return part;
}

/** Duotone body + soft fill entrance. */
function decorateBody(ctx, opts = {}) {
  const b = ctx.body;
  if (!b || ctx.plan.body) return;
  ctx.plan.setBody(b);
  if (opts.fill !== false) add(ctx, [b], 'fillIn', { dur: 900, dl: opts.dl || 0 });
}

// ---------------------------------------------------------------- target selectors (used by rules.json)

function originFor(ctx, o, atoms) {
  if (!o || o === 'center') return undefined;
  const b = ctx.body ? ctx.body.bbox : ctx.box;
  const g = atoms && atoms.length ? unionBox(atoms) : ctx.box;
  switch (o) {
    case 'bodyTop': return px(b.cx, b.y1);
    case 'bodyCenter': return px(b.cx, b.cy);
    case 'bodyBottom': return px(b.cx, b.y2);
    case 'groupTop': return px(g.cx, g.y1);
    case 'groupBottom': return px(g.cx, g.y2);
    case 'groupCenter': return px(g.cx, g.cy);
    case 'boxTop': return px(ctx.box.cx, ctx.box.y1);
    case 'boxBottom': return px(ctx.box.cx, ctx.box.y2);
    case 'boxBottomLeft': return px(ctx.box.x1, ctx.box.y2);
    case 'boxBottomRight': return px(ctx.box.x2, ctx.box.y2);
    case 'iconCenter': return '12px 12px';
    case 'hinge': {
      // the end of the moving piece that touches the body (largest y)
      let best = null;
      for (const a of atoms || []) for (const e of [a.pts[0], a.pts[a.pts.length - 1]]) if (!best || e[1] > best[1]) best = e;
      return best ? px(best[0], best[1]) : undefined;
    }
    case 'handleEnd': {
      const lens = circleLike(ctx.atoms)[0];
      const c = lens ? [lens.cx, lens.cy] : [ctx.box.cx, ctx.box.cy];
      let best = null, bd = -1;
      for (const a of ctx.atoms) for (const e of [a.pts[0], a.pts[a.pts.length - 1]]) {
        const d = Math.hypot(e[0] - c[0], e[1] - c[1]);
        if (d > bd) { bd = d; best = e; }
      }
      return best ? px(best[0], best[1]) : undefined;
    }
    default: return o; // CSS keywords
  }
}

export const TARGETS = ['all', 'main', 'body', 'bodyOrLargest', 'notBody', 'rest', 'top', 'bottom', 'sides', 'outside', 'inner', 'small', 'large', 'dots', 'circles', 'heads', 'wheels', 'hlines', 'vlines', 'innerLines', 'curves', 'ticks', 'bars', 'line', 'left', 'right', 'upper', 'lower', 'arcs'];
export const RECIPES = ['clock', 'gauge', 'gear', 'arrows', 'spin'];
export const ORIGINS = ['center', 'bodyTop', 'bodyCenter', 'bodyBottom', 'groupTop', 'groupBottom', 'groupCenter', 'boxTop', 'boxBottom', 'boxBottomLeft', 'boxBottomRight', 'iconCenter', 'hinge', 'handleEnd', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'];

/** Throws on any unknown anim, target, origin or recipe in config/rules.json. */
export function validateRules(cfg) {
  const errs = [];
  const ids = new Set();
  for (const r of cfg.rules) {
    if (ids.has(r.id)) errs.push(`duplicate rule id ${r.id}`);
    ids.add(r.id);
    if (!Array.isArray(r.words) || !r.words.length) errs.push(`${r.id}: no words`);
    if (r.recipe && !RECIPES.includes(r.recipe)) errs.push(`${r.id}: unknown recipe ${r.recipe}`);
    for (const key of ['steps', 'modifier', 'glyph', 'extra']) for (const s of r[key] || []) {
      if (!ANIMS[s.a]) errs.push(`${r.id}.${key}: unknown anim ${s.a}`);
      if (!TARGETS.includes(s.t)) errs.push(`${r.id}.${key}: unknown target ${s.t}`);
      if (s.o && !ORIGINS.includes(s.o)) errs.push(`${r.id}.${key}: unknown origin ${s.o}`);
    }
    if (!r.recipe && !(r.steps || []).length) errs.push(`${r.id}: no steps`);
  }
  if (errs.length) throw new Error(`config/rules.json:\n  ${errs.join('\n  ')}`);
}

function select(ctx, t, used) {
  const A = ctx.atoms;
  const b = ctx.body;
  const nb = A.filter(a => a !== b);
  const bb = b ? b.bbox : ctx.box;
  switch (t) {
    case 'all': return ctx.full ? 'all' : A;
    case 'main': return A;
    case 'body': return b ? [b] : [];
    case 'bodyOrLargest': return [b || largest(A)];
    case 'notBody': return nb;
    case 'rest': return A.filter(a => !used.has(a));
    case 'top': return b ? nb.filter(a => a.bbox.y2 <= bb.y1 + 0.75) : nb.filter(a => a.bbox.cy < ctx.box.y1 + ctx.box.h * 0.3 && a.bbox.h < ctx.box.h * 0.5);
    case 'bottom': return b ? nb.filter(a => a.bbox.y1 >= bb.y2 - 0.75) : nb.filter(a => a.bbox.cy > ctx.box.y2 - ctx.box.h * 0.3 && a.bbox.h < ctx.box.h * 0.5);
    case 'sides': return b ? nb.filter(a => a.bbox.x2 <= bb.x1 + 0.75 || a.bbox.x1 >= bb.x2 - 0.75) : [];
    case 'outside': return b ? nb.filter(a => !inside(a, b, 0.3)) : [];
    case 'inner': return b ? nb.filter(a => inside(a, b, 0.3)) : [];
    case 'small': return nb.filter(a => a.diag <= 5);
    case 'large': return nb.filter(a => a.diag > 5);
    case 'dots': return nb.filter(a => isDot(a) || (a.circle && a.circle.r <= 1.5));
    case 'circles': return nb.filter(a => a.circle);
    case 'heads': return A.filter(a => a.circle && a.circle.r >= 1.5 && a.bbox.cy < ctx.box.cy);
    case 'wheels': return A.filter(a => a.circle && a.circle.r >= 1.2 && a.bbox.cy > ctx.box.cy && a !== b);
    case 'hlines': return nb.filter(isHLine);
    case 'vlines': return nb.filter(isVLine);
    case 'innerLines': return b ? nb.filter(a => (isHLine(a) || isVLine(a)) && inside(a, b, 0.3)) : nb.filter(isHLine);
    case 'curves': return nb.filter(a => !a.lineOnly && !a.closed && !a.circle);
    case 'ticks': return ticks(A);
    case 'bars': { const r = bars(A); return r ? r.atoms : []; }
    case 'line': {
      // the longest open polyline that is not an axis (L shape at the left/bottom)
      const cand = nb.filter(a => !a.closed && dedupe(a.vertices).length >= 3 && a.lineOnly && !(isAxis(a)));
      const c = cand.sort((p, q) => q.len - p.len)[0];
      return c ? [c] : [];
    }
    case 'left': return A.filter(a => a.bbox.cx < ctx.box.cx - 1.5);
    case 'right': return A.filter(a => a.bbox.cx > ctx.box.cx + 1.5);
    case 'upper': return A.filter(a => a.bbox.cy < ctx.box.cy - 1);
    case 'lower': return A.filter(a => a.bbox.cy > ctx.box.cy + 1);
    case 'arcs': return nb.filter(a => !a.closed && !a.lineOnly);
    default: throw new Error(`unknown target ${t}`);
  }
}

function isAxis(a) {
  const v = dedupe(a.vertices);
  if (v.length !== 3) return false;
  const [p, q, r] = v;
  const right = (Math.abs(p[0] - q[0]) < 0.05 && Math.abs(q[1] - r[1]) < 0.05) || (Math.abs(p[1] - q[1]) < 0.05 && Math.abs(q[0] - r[0]) < 0.05);
  return right && a.len > 18;
}

/** Applies a declarative rule (from config/rules.json). Returns true if it produced motion. */
function applySteps(ctx, steps) {
  const used = new Set();
  let produced = 0;
  for (const st of steps) {
    let target = select(ctx, st.t, used);
    if (target !== 'all' && !target.length) { if (st.need) return produced > 0; continue; }
    if (target !== 'all' && st.max && target.length > st.max) target = target.slice(0, st.max);
    const dur = st.dur ?? ANIMS[st.a].dur;
    if (target !== 'all' && (st.stagger || st.each)) {
      const sorted = sortBy(target, st.by || 'y', ctx.body ? [ctx.body.bbox.cx, ctx.body.bbox.cy] : [ctx.box.cx, ctx.box.y2]);
      const groups = chunk(sorted, st.groups || 3);
      groups.forEach((g, k) => {
        add(ctx, g, st.a, { dur, dl: (st.dl || 0) + k * (st.gap ?? 120), o: originFor(ctx, st.o, g) });
        g.forEach(a => used.add(a));
      });
    } else {
      add(ctx, target, st.a, { dur, dl: st.dl || 0, o: originFor(ctx, st.o, target === 'all' ? ctx.atoms : target) });
      if (target !== 'all') target.forEach(a => used.add(a));
    }
    if (st.a !== 'fillIn') produced++;
  }
  return produced > 0;
}

// ---------------------------------------------------------------- mechanics detectors (code)

function detectClock(ctx, mode = 'clock') {
  const faces = circleLike(ctx.atoms).filter(f => f.r >= 2.5);
  for (const face of faces) {
    const c = [face.cx, face.cy];
    const rays = [];
    const sources = [];
    for (const a of ctx.atoms) {
      if (a === face.atom || !a.lineOnly || a.closed) continue;
      const v = dedupe(a.vertices);
      const k = v.findIndex(p => Math.hypot(p[0] - c[0], p[1] - c[1]) < 0.8);
      if (k < 0) continue;
      if (!v.every(p => Math.hypot(p[0] - c[0], p[1] - c[1]) <= face.r * 1.02 + 0.3)) continue;
      const parts = [];
      if (k > 0) parts.push(v.slice(0, k + 1).reverse());
      if (k < v.length - 1) parts.push(v.slice(k));
      const good = parts.filter(r => r.length >= 2 && Math.hypot(r[r.length - 1][0] - c[0], r[r.length - 1][1] - c[1]) >= 1.2);
      if (!good.length) continue;
      sources.push({ atom: a, parts: good });
    }
    if (!sources.length) continue;
    // split shared polylines into separate hands that start at the centre
    for (const s of sources) {
      const made = s.parts.length > 1 || (dedupe(s.atom.vertices)[0] && Math.hypot(dedupe(s.atom.vertices)[0][0] - c[0], dedupe(s.atom.vertices)[0][1] - c[1]) > 0.8)
        ? ctx.plan.splitAtom(s.atom, s.parts) : [s.atom];
      ctx.atoms = ctx.atoms.flatMap(a => (a === s.atom ? made : [a]));
      made.forEach(m => rays.push(m));
    }
    rays.sort((p, q) => q.len - p.len);
    const origin = px(c[0], c[1]);
    if (face.full && face.atom.closed && !ctx.plan.body) { ctx.body = face.atom; decorateBody(ctx); }
    if (mode === 'gauge') {
      add(ctx, rays, 'wiggle', { dur: 1300, o: origin });
    } else {
      add(ctx, [rays[0]], 'sweep', { dur: 1600, o: origin });
      if (rays[1]) add(ctx, rays.slice(1), 'sweepHour', { dur: 1600, o: origin });
    }
    rays.forEach(r => ctx.claimed.add(r));
    ctx.claimed.add(face.atom);
    return true;
  }
  return false;
}

/** Gears: an axle circle with teeth around it, spinning on its own centre. Several gears turn opposite ways. */
function detectGears(ctx, pure) {
  const A = ctx.atoms;
  if (pure) {
    const axle = circleLike(A).filter(c => c.full).sort((p, q) => Math.hypot(p.cx - ctx.box.cx, p.cy - ctx.box.cy) - Math.hypot(q.cx - ctx.box.cx, q.cy - ctx.box.cy))[0];
    const o = axle && Math.hypot(axle.cx - ctx.box.cx, axle.cy - ctx.box.cy) < 2 ? px(axle.cx, axle.cy) : px(ctx.box.cx, ctx.box.cy);
    decorateBody(ctx);
    add(ctx, select(ctx, 'all'), 'spin', { dur: 1600, o });
    return true;
  }
  const axles = circleLike(A).filter(c => c.full && c.r <= 4);
  const gears = [];
  const taken = new Set();
  for (const ax of axles) {
    if (taken.has(ax.atom)) continue;
    const lim = ax.r + 3.2;
    const teeth = A.filter(a => a !== ax.atom && !taken.has(a) && a.pts.every(p => Math.hypot(p[0] - ax.cx, p[1] - ax.cy) <= lim) && a.diag <= lim * 2);
    if (teeth.length < 3 && !(teeth.length >= 1 && teeth.some(t => t.closed && t.diag > ax.r * 2))) continue;
    const g = [ax.atom, ...teeth];
    g.forEach(a => taken.add(a));
    gears.push({ atoms: g, o: px(ax.cx, ax.cy) });
  }
  if (!gears.length) return false;
  gears.slice(0, 3).forEach((g, k) => {
    add(ctx, g.atoms, k % 2 ? 'spinBack' : 'spin', { dur: 1600, o: g.o });
    g.atoms.forEach(a => ctx.claimed.add(a));
  });
  return true;
}

function dirAnims(dir) {
  const [dx, dy] = dir;
  const out = [];
  if (dy < 0) out.push('lift'); else if (dy > 0) out.push('sink');
  if (dx > 0) out.push('nudge'); else if (dx < 0) out.push('nudgeBack');
  return out;
}

/** Arrows move the way they point. Same-direction arrows cascade; opposite ones move together. */
function detectArrows(ctx, nameDir) {
  let groups = arrowGroups(ctx.atoms).filter(g => g.atoms.every(a => a !== ctx.body));
  if (!groups.length && nameDir) {
    const moving = ctx.atoms.filter(a => a !== ctx.body);
    groups = [{ atoms: moving.length ? moving : ctx.atoms, dir: nameDir }];
  }
  if (!groups.length) return false;
  decorateBody(ctx);
  // merge groups that point the same way when there are many (chevrons-up: 2 heads)
  const seen = new Map();
  let k = 0;
  for (const g of groups.slice(0, 4)) {
    const key = g.dir.join(',');
    const n = seen.get(key) || 0;
    seen.set(key, n + 1);
    const anims = dirAnims(g.dir);
    const dl = n * 110;
    anims.forEach(an => add(ctx, g.atoms, an, { dur: 1050, dl }));
    g.atoms.forEach(a => ctx.claimed.add(a));
    k++;
  }
  return k > 0;
}

// ---------------------------------------------------------------- rules

const tokenMatch = (tokens, word) => {
  const w = word.split('-');
  for (let i = 0; i + w.length <= tokens.length; i++) if (w.every((x, j) => tokens[i + j] === x)) return true;
  return false;
};

export function findRule(rules, tokens, tags) {
  for (const r of rules) if (r.words.some(w => (r.exact ? w === tokens.join('-') : tokenMatch(tokens, w)))) return { rule: r, via: 'name' };
  if (tags && tags.length) {
    const tagTokens = tags.map(t => String(t).toLowerCase().split(/[\s-]+/));
    for (const r of rules) {
      if (r.nameOnly || r.exact) continue;
      if (r.words.some(w => tagTokens.some(tt => tokenMatch(tt, w)))) return { rule: r, via: 'tag' };
    }
  }
  return null;
}

function nameDirection(tokens) {
  const ds = tokens.filter(t => DIRS[t]);
  if (!ds.length) return null;
  if (ds.length >= 2 && ((ds.includes('up') && ds.includes('down')) || (ds.includes('left') && ds.includes('right')))) return null;
  let dx = 0, dy = 0;
  for (const d of ds.slice(0, 2)) { dx += DIRS[d][0]; dy += DIRS[d][1]; }
  return [Math.sign(dx), Math.sign(dy)];
}

function runRecipe(ctx, rule, env) {
  const role = ctx.role;
  const steps = (role === 'modifier' && rule.modifier) || (role === 'glyph' && rule.glyph) || rule.steps;
  switch (rule.recipe) {
    case 'clock': return detectClock(ctx, 'clock') && (finishClock(ctx, rule), true);
    case 'gauge': return detectClock(ctx, 'gauge');
    case 'gear': return detectGears(ctx, role !== 'modifier' && env.pureGear);
    case 'arrows': return detectArrows(ctx, nameDirection(ctx.tokens));
    case 'spin': {
      const ccw = ctx.tokens.some(t => ['ccw', 'left', 'counterclockwise', 'back', 'undo'].includes(t));
      decorateBody(ctx, { fill: false });
      add(ctx, select(ctx, 'all'), ccw ? 'spinBack' : 'spin', { dur: rule.dur || 1500, o: px(ctx.box.cx, ctx.box.cy) });
      return true;
    }
    default: {
      if (rule.body !== false) decorateBody(ctx);
      return applySteps(ctx, steps || []);
    }
  }
}

function finishClock(ctx, rule) {
  const rest = ctx.atoms.filter(a => !ctx.claimed.has(a));
  if (rule.extra && rest.length) applySteps({ ...ctx, atoms: rest }, rule.extra);
}

// ---------------------------------------------------------------- generic fallback

const FINISH = ['pop', 'jelly', 'pop', 'breathe', 'tilt', 'pop', 'hop', 'wiggle'];

function fallback(ctx) {
  const h = ctx.h;
  const b = ctx.body;
  const others = ctx.atoms.filter(a => a !== b && !ctx.claimed.has(a));
  let end = 0;
  if (b) {
    decorateBody(ctx);
    add(ctx, [b], 'draw', { dur: 1000 });
    end = 650;
  }
  if (others.length) {
    const by = ['y', 'x', 'y', 'size'][h % 4];
    const sorted = sortBy(others, by);
    const groups = chunk(sorted, b ? 2 : 3);
    const style = (h >>> 3) % 3;
    groups.forEach((g, k) => {
      const smallish = g.every(a => a.diag <= 5);
      const anim = smallish ? (style === 2 ? 'fadeIn' : 'popIn') : style === 1 && !b ? 'fadeIn' : 'draw';
      const dl = (b ? 200 : 0) + k * (b ? 140 : 160);
      add(ctx, g, anim, { dur: anim === 'draw' ? 900 : 700, dl });
      end = Math.max(end, dl + 600);
    });
  }
  const finish = FINISH[(h >>> 5) % FINISH.length];
  add(ctx, select(ctx, 'all'), finish, { dur: finish === 'breathe' ? 1100 : 800, dl: Math.min(end, 900) });
  return true;
}

// ---------------------------------------------------------------- composites

function sameAtom(a, b) {
  if (Math.abs(a.bbox.x1 - b.bbox.x1) > 0.6 || Math.abs(a.bbox.y1 - b.bbox.y1) > 0.6) return false;
  if (Math.abs(a.bbox.x2 - b.bbox.x2) > 0.6 || Math.abs(a.bbox.y2 - b.bbox.y2) > 0.6) return false;
  return Math.abs(a.len - b.len) <= Math.max(0.6, 0.15 * Math.max(a.len, b.len));
}

/** Finds base + modifier for names like file-plus or calendar-heart. */
function splitSuffix(atoms, tokens, env) {
  for (let i = tokens.length - 1; i >= 1; i--) {
    const baseName = tokens.slice(0, i).join('-');
    const mod = tokens.slice(i);
    if (!env.lookup || !env.has(baseName)) continue;
    if (!env.isModifier(mod)) continue;
    const baseAtoms = env.lookup(baseName);
    if (!baseAtoms) continue;
    let modAtoms = atoms.filter(a => !baseAtoms.some(b => sameAtom(a, b)));
    // trimmed base strokes (cut out to make room for the badge) are large; keep them with the base
    modAtoms = modAtoms.filter(a => a.diag <= 13);
    if (!modAtoms.length || modAtoms.length === atoms.length) {
      modAtoms = atoms.filter(a => a.bbox.x1 >= 12 && a.bbox.y1 >= 11.5 && a.diag <= 12);
    }
    if (!modAtoms.length || modAtoms.length === atoms.length) continue;
    const mb = unionBox(modAtoms);
    if (mb.w > 15 || mb.h > 15) continue;
    return { base: atoms.filter(a => !modAtoms.includes(a)), mod: modAtoms, baseTokens: tokens.slice(0, i), modTokens: mod };
  }
  return null;
}

function splitContainer(atoms, tokens) {
  for (const c of CONTAINERS) {
    if (tokens.length <= c.length || !c.every((t, k) => tokens[k] === t)) continue;
    const glyphTokens = tokens.slice(c.length);
    if (/^\d+$/.test(glyphTokens[0]) && glyphTokens.length === 1) return null; // circle-2 style variants
    const box = unionBox(atoms);
    if (box.w < 14 || box.h < 14) return null;
    const pad = 2.2;
    const glyph = atoms.filter(a => a.bbox.x1 >= box.x1 + pad && a.bbox.x2 <= box.x2 - pad && a.bbox.y1 >= box.y1 + pad && a.bbox.y2 <= box.y2 - pad);
    const container = atoms.filter(a => !glyph.includes(a));
    if (!glyph.length || !container.length) return null;
    return { container, glyph, glyphTokens };
  }
  return null;
}

// ---------------------------------------------------------------- entry points

/** Plans a subset by name: detectors, then rules, then fallback. */
function planNamed(plan, atoms, opts, env) {
  const ctx = makeCtx(plan, atoms, opts);
  const tokens = opts.tokens;
  const hit = findRule(env.rules, tokens.filter(t => !/^\d+$/.test(t)), opts.role === 'primary' ? opts.tags : null);
  if (hit && runRecipe(ctx, hit.rule, env)) { plan.tags.push(`${opts.role}:${hit.rule.id}${hit.via === 'tag' ? '(tag)' : ''}`); return ctx; }
  // arrow geometry is a strong signal even without a keyword
  if (opts.role !== 'modifier' && arrowGroups(atoms).length && detectArrows(ctx, null)) { plan.tags.push(`${opts.role}:arrows(geo)`); return ctx; }
  if (opts.role === 'modifier') {
    decorateBody(ctx, { fill: false });
    const tk = ticks(atoms);
    if (tk.length) add(ctx, tk, 'draw', { dur: 700 });
    else add(ctx, atoms, 'popIn', { dur: 800 });
    plan.tags.push('modifier:default');
    return ctx;
  }
  if (opts.role === 'glyph' && tokens.some(t => GLYPH_DRAW.has(t))) {
    add(ctx, atoms, 'draw', { dur: 1000 });
    plan.tags.push('glyph:draw');
    return ctx;
  }
  fallback(ctx);
  plan.tags.push(`${opts.role}:fallback`);
  return ctx;
}

/**
 * Builds the motion plan for an icon.
 * env: { rules, lookup(name) -> atoms, has(name), isModifier(tokens), pureGears:Set }
 */
export function choreograph(name, elements, atoms, tags, env) {
  const plan = new Plan(elements, atoms);
  const tokens = name.split('-');
  const base = { name, tags, full: true };

  // "-off" icons: base motion, then the slash draws across
  if (tokens.includes('off') || tokens.includes('slash')) {
    const s = slash(atoms);
    if (s) {
      const rest = atoms.filter(a => a !== s);
      planNamed(plan, rest, { ...base, full: false, tokens: tokens.filter(t => t !== 'off' && t !== 'slash'), role: 'primary' }, env);
      const ctx = makeCtx(plan, [s], { name, tokens, role: 'modifier', delay: 0, body: null });
      add(ctx, [s], 'draw', { dur: 800, dl: 350 });
      plan.tags.push('modifier:slash');
      return finish(plan);
    }
  }

  // pure gears (settings, cog ...) spin as a whole
  if (env.pureGears.has(name)) {
    const ctx = makeCtx(plan, atoms, { ...base, tokens, role: 'primary' });
    detectGears(ctx, true);
    plan.tags.push('primary:gear');
    return finish(plan);
  }

  // mechanics that can live anywhere in a composite icon
  const mech = env.mechanics(tokens);
  if (mech) {
    const ctx = makeCtx(plan, atoms, { ...base, tokens, role: 'primary' });
    const ok = mech === 'clock' ? detectClock(ctx, 'clock') : mech === 'gauge' ? detectClock(ctx, 'gauge') : detectGears(ctx, false);
    if (ok) {
      plan.tags.push(`primary:${mech}`);
      const rest = ctx.atoms.filter(a => !ctx.claimed.has(a));
      if (rest.length) {
        const restTokens = tokens.filter(t => !env.mechWords.has(t));
        if (mech === 'clock' && tokens.includes('alarm')) add(ctx, 'all', 'wiggle', { dur: 1000 });
        else if (restTokens.length) {
          const role = restTokens[0] === tokens[0] ? 'primary' : 'modifier';
          planNamed(plan, rest, { ...base, full: false, tokens: restTokens, role, delay: role === 'modifier' ? 300 : 0, body: plan.body ? null : undefined }, env);
        }
      }
      return finish(plan);
    }
  }

  // some recipes describe the whole scene (cloud-rain, chart-bar-2): never split those
  const whole = findRule(env.rules.filter(r => r.whole), tokens.filter(t => !/^\d+$/.test(t)), null);
  const sfx = whole ? null : splitSuffix(atoms, tokens, env);
  if (sfx) {
    planNamed(plan, sfx.base, { ...base, full: false, tokens: sfx.baseTokens, role: 'primary' }, env);
    planNamed(plan, sfx.mod, { ...base, full: false, tokens: sfx.modTokens, role: 'modifier', delay: 300, body: null, tags: [] }, env);
    plan.tags.push(`composite:${sfx.baseTokens.join('-')}+${sfx.modTokens.join('-')}`);
    return finish(plan);
  }
  const ctn = splitContainer(atoms, tokens);
  if (ctn) {
    const c = makeCtx(plan, ctn.container, { ...base, full: false, tokens, role: 'container' });
    if (c.body) { decorateBody(c); add(c, [c.body], 'draw', { dur: 1000 }); } else add(c, ctn.container, 'draw', { dur: 1000 });
    planNamed(plan, ctn.glyph, { ...base, full: false, tokens: ctn.glyphTokens, role: 'glyph', delay: 250, body: null, tags: [] }, env);
    const ctx = makeCtx(plan, atoms, { ...base, tokens, role: 'container' });
    add(ctx, 'all', 'pop', { dur: 700, dl: 1050 });
    plan.tags.push(`container:${ctn.glyphTokens.join('-')}`);
    return finish(plan);
  }
  planNamed(plan, atoms, { ...base, tokens, role: 'primary' }, env);
  return finish(plan);
}

function finish(plan) {
  fitTotal(plan.steps);
  const out = plan.serialize();
  out.rule = plan.tags.join(' ');
  return out;
}

export { isStraight };
