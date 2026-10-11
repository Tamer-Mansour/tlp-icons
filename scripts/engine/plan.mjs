// Collects motion parts/steps for one icon and serialises the retagged SVG.
import { elementToMarkup } from './svg.mjs';
import { flatten, toSubpaths } from './path.mjs';
import { atomPathD, polyD } from './atoms.mjs';

export const MAX_PARTS = 6;
export const MAX_TOTAL = 2600; // design ms; runtime SPEED 0.6 -> 1.56 s

export class Plan {
  constructor(elements, atoms) {
    this.elements = elements;
    this.atoms = atoms.slice();
    this.parts = []; // { id, atoms: Set<atom> }
    this.steps = []; // { part: id | 'all', anim, dur, delay, origin }
    this.body = null;
    this.tags = [];
  }

  /** Replace an atom by polylines (used to split clock hands at the centre). */
  splitAtom(atom, polylines) {
    const idx = this.atoms.indexOf(atom);
    if (idx < 0) return [];
    const made = polylines.map((pts, k) => {
      const d = polyD(pts);
      const { vertices } = flatten(toSubpaths(d)[0]);
      let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity, len = 0;
      pts.forEach(([x, y], j) => {
        x1 = Math.min(x1, x); x2 = Math.max(x2, x); y1 = Math.min(y1, y); y2 = Math.max(y2, y);
        if (j) len += Math.hypot(x - pts[j - 1][0], y - pts[j - 1][1]);
      });
      return {
        ...atom, d, synthetic: true, i: atom.i + (k + 1) / 100, pts, vertices, lineOnly: true, closed: false, circle: null,
        bbox: { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 }, len, area: 0, diag: Math.hypot(x2 - x1, y2 - y1),
      };
    });
    this.atoms.splice(idx, 1, ...made);
    for (const p of this.parts) if (p.atoms.has(atom)) { p.atoms.delete(atom); made.forEach(m => p.atoms.add(m)); }
    // the element is no longer emitted whole: mark siblings
    for (const a of this.atoms) if (a.el === atom.el) a.splitEl = true;
    return made;
  }

  part(atoms) {
    const set = new Set(atoms.filter(Boolean));
    if (!set.size) return null;
    const id = `p${this.parts.length + 1}`;
    this.parts.push({ id, atoms: set });
    return id;
  }

  step(part, anim, dur, delay = 0, origin) {
    if (!part) return;
    const s = { part, anim, dur: Math.round(dur), delay: Math.round(delay) };
    if (origin && origin !== 'center') s.origin = origin;
    this.steps.push(s);
  }

  setBody(atom) {
    this.body = atom || null;
  }

  /** Serialises to { svg, motion }. Drops conflicting parts, renumbers parts p1..pN in document order. */
  serialize() {
    const atoms = this.atoms;
    const usedParts = new Set(this.steps.map(s => s.part));
    let parts = this.parts.filter(p => usedParts.has(p.id) && p.atoms.size);
    // parts covering every atom behave like 'all' but keep their own wrapper: fine.
    const root = { id: null, atoms: new Set(atoms), children: [] };
    const dropped = new Set();
    const sorted = parts.map((p, k) => ({ ...p, k })).sort((a, b) => b.atoms.size - a.atoms.size || a.k - b.k);
    const isSubset = (a, b) => { for (const x of a) if (!b.has(x)) return false; return true; };
    const intersects = (a, b) => { for (const x of a) if (b.has(x)) return true; return false; };
    for (const p of sorted) {
      let node = root;
      for (;;) {
        const next = node.children.find(c => isSubset(p.atoms, c.atoms));
        if (!next) break;
        node = next;
      }
      if (node.children.some(c => intersects(c.atoms, p.atoms))) { dropped.add(p.id); continue; }
      node.children.push({ id: p.id, atoms: p.atoms, children: [] });
    }
    if (this.parts.length > MAX_PARTS) {
      // keep the first MAX_PARTS created; deeper ones are rare
    }

    const order = a => a.i;
    const body = this.body;
    const classOf = a => [a === body ? 'd' : '', a.filled ? 'f' : ''].filter(Boolean).join(' ');
    const elAtoms = new Map();
    for (const a of atoms) { if (!elAtoms.has(a.el)) elAtoms.set(a.el, []); elAtoms.get(a.el).push(a); }

    const rename = new Map();
    let counter = 0;
    const emitNode = node => {
      const childAtoms = new Set();
      for (const c of node.children) for (const a of c.atoms) childAtoms.add(a);
      const loose = [...node.atoms].filter(a => !childAtoms.has(a));
      const items = [];
      const doneEl = new Set();
      for (const a of loose.sort((x, y) => order(x) - order(y))) {
        if (doneEl.has(a.el)) continue;
        const siblings = elAtoms.get(a.el);
        const allHere = siblings.every(s => loose.includes(s));
        const sameClass = siblings.every(s => classOf(s) === classOf(siblings[0]));
        if (allHere && sameClass && !siblings.some(s => s.synthetic || s.splitEl)) {
          doneEl.add(a.el);
          const el = this.elements[a.el];
          items.push({ key: Math.min(...siblings.map(order)), body: siblings.includes(body), el: { tag: el.tag, attrs: el.attrs, cls: classOf(a) } });
        } else {
          items.push({ key: order(a), body: a === body, el: { tag: 'path', attrs: { d: atomPathD(a) }, cls: classOf(a) } });
        }
      }
      for (const c of node.children) items.push({ key: Math.min(...[...c.atoms].map(order)), body: body ? c.atoms.has(body) : false, node: c });
      items.sort((x, y) => (y.body - x.body) || (x.key - y.key));
      return items;
    };
    const render = (node, depth) => {
      let pid = '';
      if (node.id) { counter += 1; pid = `p${counter}`; rename.set(node.id, pid); }
      const items = emitNode(node);
      const inner = it => (it.node ? render(it.node, depth + 1) : null);
      if (node.id && items.length === 1 && items[0].el) {
        const { tag, attrs, cls } = items[0].el;
        return elementToMarkup(tag, attrs, [cls, pid].filter(Boolean).join(' '));
      }
      const body = items.map(it => (it.node ? inner(it) : elementToMarkup(it.el.tag, it.el.attrs, it.el.cls))).join('');
      return node.id ? `<g class="${pid}">${body}</g>` : body;
    };
    const svg = render(root, 0);
    const motion = [];
    for (const s of this.steps) {
      if (s.part !== 'all' && (dropped.has(s.part) || !rename.has(s.part))) continue;
      const part = s.part === 'all' ? 'all' : rename.get(s.part);
      motion.push(s.origin ? [part, s.anim, s.dur, s.delay, s.origin] : [part, s.anim, s.dur, s.delay]);
    }
    // stable order: by delay then part
    motion.sort((a, b) => a[3] - b[3] || (a[0] === 'all') - (b[0] === 'all') || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    return { svg, motion, dropped: [...dropped] };
  }
}

/** Keeps the whole choreography inside MAX_TOTAL by compressing delays first, then durations. */
export function fitTotal(steps) {
  const total = () => Math.max(0, ...steps.map(s => s.dur + s.delay));
  let t = total();
  if (t <= MAX_TOTAL) return steps;
  const maxDelay = Math.max(...steps.map(s => s.delay));
  if (maxDelay > 0) {
    const longestAtEnd = Math.max(...steps.map(s => s.dur));
    const k = Math.max(0, Math.min(1, (MAX_TOTAL - longestAtEnd) / maxDelay));
    for (const s of steps) s.delay = Math.round(s.delay * k);
  }
  t = total();
  if (t > MAX_TOTAL) for (const s of steps) s.dur = Math.round(s.dur * (MAX_TOTAL / t));
  for (const s of steps) if (s.dur + s.delay > MAX_TOTAL) s.dur = MAX_TOTAL - s.delay;
  return steps;
}
