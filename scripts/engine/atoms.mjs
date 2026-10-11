// Breaks an icon into "atoms": one per primitive element or per path subpath, each with measured geometry.
import { toSubpaths, flatten, subpathToD, fmt } from './path.mjs';

const num = v => (v == null || v === '' ? 0 : parseFloat(v));

function measure(pts, closed) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity, len = 0, area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
    if (i) len += Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]);
  }
  if (closed && pts.length > 2) {
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      area += ax * by - bx * ay;
    }
    area = Math.abs(area) / 2;
  }
  const w = x2 - x1, h = y2 - y1;
  return { bbox: { x1, y1, x2, y2, w, h, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 }, len, area };
}

function circleFit(pts, closed) {
  if (!closed || pts.length < 8) return null;
  let cx = 0, cy = 0;
  for (const [x, y] of pts) { cx += x; cy += y; }
  cx /= pts.length; cy /= pts.length;
  const ds = pts.map(([x, y]) => Math.hypot(x - cx, y - cy));
  const r = ds.reduce((a, b) => a + b, 0) / ds.length;
  if (r < 0.5) return null;
  const dev = Math.max(...ds.map(d => Math.abs(d - r)));
  return dev / r < 0.06 ? { cx, cy, r } : null;
}

function sampleEllipse(cx, cy, rx, ry, n = 32) {
  const pts = [];
  for (let k = 0; k <= n; k++) { const t = (k / n) * Math.PI * 2; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  return pts;
}

function rectPoints(x, y, w, h, rx, ry) {
  if (!rx && !ry) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  rx = Math.min(rx || ry, w / 2); ry = Math.min(ry || rx, h / 2);
  const pts = [];
  const corner = (cx, cy, a0) => { for (let k = 0; k <= 4; k++) { const t = a0 + (k / 4) * (Math.PI / 2); pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } };
  corner(x + w - rx, y + ry, -Math.PI / 2);
  corner(x + w - rx, y + h - ry, 0);
  corner(x + rx, y + h - ry, Math.PI / 2);
  corner(x + rx, y + ry, Math.PI);
  pts.push(pts[0]);
  return pts;
}

function makeAtom(base, pts, closed, extra = {}) {
  const m = measure(pts, closed);
  const atom = { ...base, pts, closed, ...m, ...extra };
  atom.circle = extra.circle || circleFit(pts, closed);
  atom.diag = Math.hypot(m.bbox.w, m.bbox.h);
  return atom;
}

/** Returns the atoms of an element list. Atoms keep a reference to their element (el) and subpath (sub). */
export function atomize(elements) {
  const atoms = [];
  elements.forEach((el, ei) => {
    const a = el.attrs;
    const base = { el: ei, tag: el.tag, filled: !!a.__filled };
    if (el.tag === 'path') {
      const subs = toSubpaths(a.d);
      subs.forEach((sub, si) => {
        const { pts, lineOnly, vertices } = flatten(sub);
        const first = pts[0], last = pts[pts.length - 1];
        const closed = sub.closed || (pts.length > 2 && Math.hypot(first[0] - last[0], first[1] - last[1]) < 0.02);
        atoms.push(makeAtom({ ...base, sub: si, subCount: subs.length, d: subpathToD(sub), segs: sub.segs }, pts, closed, { lineOnly, vertices }));
      });
    } else if (el.tag === 'circle') {
      const cx = num(a.cx), cy = num(a.cy), r = num(a.r);
      atoms.push(makeAtom(base, sampleEllipse(cx, cy, r, r), true, { circle: { cx, cy, r }, lineOnly: false, vertices: [] }));
    } else if (el.tag === 'ellipse') {
      const cx = num(a.cx), cy = num(a.cy), rx = num(a.rx), ry = num(a.ry);
      atoms.push(makeAtom(base, sampleEllipse(cx, cy, rx, ry), true, { circle: Math.abs(rx - ry) < 0.01 ? { cx, cy, r: rx } : null, lineOnly: false, vertices: [] }));
    } else if (el.tag === 'rect') {
      const x = num(a.x), y = num(a.y), w = num(a.width), h = num(a.height);
      const rx = a.rx != null ? num(a.rx) : a.ry != null ? num(a.ry) : 0;
      const ry = a.ry != null ? num(a.ry) : rx;
      const pts = rectPoints(x, y, w, h, rx, ry);
      const rounded = rx > 0;
      atoms.push(makeAtom(base, pts, true, { lineOnly: !rounded, vertices: rounded ? [] : pts.slice(0, 4) }));
    } else if (el.tag === 'line') {
      const pts = [[num(a.x1), num(a.y1)], [num(a.x2), num(a.y2)]];
      atoms.push(makeAtom(base, pts, false, { lineOnly: true, vertices: pts }));
    } else if (el.tag === 'polyline' || el.tag === 'polygon') {
      const nums = (a.points || '').trim().split(/[\s,]+/).map(Number);
      const pts = [];
      for (let k = 0; k + 1 < nums.length; k += 2) pts.push([nums[k], nums[k + 1]]);
      if (el.tag === 'polygon' && pts.length) pts.push(pts[0]);
      atoms.push(makeAtom(base, pts, el.tag === 'polygon', { lineOnly: true, vertices: pts }));
    }
  });
  atoms.forEach((a, i) => { a.i = i; });
  return atoms;
}

/** Markup for a single atom as its own element (paths become a single-subpath path). */
export function atomPathD(atom) {
  if (atom.d) return atom.d;
  // primitives turned into a path (only needed when splitting a primitive, which we never do)
  return atom.pts.map((p, k) => `${k ? 'L' : 'M'}${fmt(p[0])} ${fmt(p[1])}`).join('') + (atom.closed ? 'Z' : '');
}

/** Polyline helper: d string for a list of points. */
export function polyD(pts) {
  return pts.map((p, k) => `${k ? 'L' : 'M'}${fmt(p[0])} ${fmt(p[1])}`).join('');
}

export function unionBox(atoms) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const a of atoms) {
    x1 = Math.min(x1, a.bbox.x1); y1 = Math.min(y1, a.bbox.y1);
    x2 = Math.max(x2, a.bbox.x2); y2 = Math.max(y2, a.bbox.y2);
  }
  return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}
