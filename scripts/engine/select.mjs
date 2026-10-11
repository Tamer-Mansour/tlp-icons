// Geometric selectors used by detectors and keyword rules. All work on a subset of atoms.
import { unionBox } from './atoms.mjs';
import { arcCenter } from './path.mjs';

export const EPS = 0.05;

export const isStraight = a => a.lineOnly && !a.closed && dedupe(a.vertices).length === 2;
export const isHLine = a => isStraight(a) && a.bbox.h < EPS && a.bbox.w > 1;
export const isVLine = a => isStraight(a) && a.bbox.w < EPS && a.bbox.h > 1;
export const isDot = a => a.diag < 1.2;

export function dedupe(vs) {
  const out = [];
  for (const v of vs || []) if (!out.length || Math.hypot(v[0] - out[out.length - 1][0], v[1] - out[out.length - 1][1]) > 1e-3) out.push(v);
  return out;
}

/** Area of the region an atom would fill (open paths are filled as if closed, like SVG does). */
export function fillArea(a) {
  if (a.closed) return a.area;
  const p = a.pts;
  if (p.length < 3) return 0;
  let s = 0;
  for (let i = 0; i < p.length; i++) { const [ax, ay] = p[i], [bx, by] = p[(i + 1) % p.length]; s += ax * by - bx * ay; }
  return Math.abs(s) / 2;
}

/** The main closed body of a subset, or null. Open shapes qualify when they are nearly closed (cups, bins). */
export function findBody(atoms, minArea = 18) {
  let best = null, bestArea = 0;
  const box = unionBox(atoms);
  for (const a of atoms) {
    if (a.filled) continue;
    let area = 0;
    if (a.closed) area = a.area;
    else if (!isStraight(a) && a.pts.length > 3) {
      const f = a.pts[0], l = a.pts[a.pts.length - 1];
      const gap = Math.hypot(f[0] - l[0], f[1] - l[1]);
      const fa = fillArea(a);
      if (gap <= 0.6 * Math.max(a.bbox.w, a.bbox.h) && fa >= 0.4 * a.bbox.w * a.bbox.h) area = fa * 0.9;
    }
    if (area > bestArea) { best = a; bestArea = area; }
  }
  if (!best || bestArea < minArea) return null;
  if (bestArea < 0.12 * box.w * box.h && atoms.length > 2) return null;
  return best;
}

export function largest(atoms) {
  return atoms.reduce((m, a) => (!m || a.diag > m.diag ? a : m), null);
}

export const inside = (a, b, pad = 0.6) => a.bbox.x1 >= b.bbox.x1 - pad && a.bbox.x2 <= b.bbox.x2 + pad && a.bbox.y1 >= b.bbox.y1 - pad && a.bbox.y2 <= b.bbox.y2 + pad;

/** Circle candidates: real circles plus big arcs (for faces drawn as open arcs, like history). */
export function circleLike(atoms) {
  const out = [];
  for (const a of atoms) {
    if (a.circle) { out.push({ atom: a, ...a.circle, full: true }); continue; }
    if (!a.segs) continue;
    let x = 0, y = 0;
    for (const s of a.segs) {
      if (s.c === 'A' && Math.abs(s.rx - s.ry) < 0.01 && s.rx >= 4) {
        const c = arcCenter(x, y, s);
        if (c && Math.abs(c.dt) > Math.PI * 0.9) out.push({ atom: a, cx: c.cx, cy: c.cy, r: c.rx, full: false });
      }
      if (s.c !== 'Z') { x = s.x ?? x; y = s.y ?? y; }
    }
  }
  return out.sort((p, q) => q.r - p.r);
}

/** V-shaped tick marks (check marks). */
export function ticks(atoms) {
  return atoms.filter(a => {
    if (!a.lineOnly || a.closed) return false;
    const v = dedupe(a.vertices);
    if (v.length !== 3) return false;
    const [p, q, r] = v;
    // apex must be the lowest point; one arm longer than the other; arms go up on both sides
    if (!(q[1] > p[1] + 0.5 && q[1] > r[1] + 0.5)) return false;
    if (!((p[0] < q[0] && r[0] > q[0]) || (p[0] > q[0] && r[0] < q[0]))) return false;
    const l1 = Math.hypot(p[0] - q[0], p[1] - q[1]), l2 = Math.hypot(r[0] - q[0], r[1] - q[1]);
    return Math.max(l1, l2) / Math.min(l1, l2) > 1.25;
  });
}

const snap = (dx, dy) => {
  const ang = Math.atan2(dy, dx);
  const k = Math.round(ang / (Math.PI / 4));
  return [Math.round(Math.cos(k * Math.PI / 4)), Math.round(Math.sin(k * Math.PI / 4))];
};

/**
 * Arrow heads (symmetric chevrons) and the shafts that end at their apex.
 * Returns [{ atoms, dir: [dx, dy] }] where dir points the way the arrow points (y down).
 */
export function arrowGroups(atoms) {
  const groups = [];
  const used = new Set();
  for (const a of atoms) {
    if (!a.lineOnly || a.closed) continue;
    const v = dedupe(a.vertices);
    if (v.length !== 3) continue;
    const [p, q, r] = v;
    const l1 = Math.hypot(p[0] - q[0], p[1] - q[1]), l2 = Math.hypot(r[0] - q[0], r[1] - q[1]);
    if (Math.min(l1, l2) < 1 || Math.max(l1, l2) / Math.min(l1, l2) > 1.2) continue;
    const ux = (p[0] - q[0]) / l1, uy = (p[1] - q[1]) / l1, wx = (r[0] - q[0]) / l2, wy = (r[1] - q[1]) / l2;
    const cos = ux * wx + uy * wy;
    if (cos > 0.5 || cos < -0.6) continue; // roughly 55..125 degrees
    const mx = (p[0] + r[0]) / 2, my = (p[1] + r[1]) / 2;
    const dir = snap(q[0] - mx, q[1] - my);
    const g = { atoms: [a], dir, apex: q };
    used.add(a);
    for (const b of atoms) {
      if (b === a || used.has(b) || b.closed) continue;
      const bv = dedupe(b.vertices && b.vertices.length ? b.vertices : [b.pts[0], b.pts[b.pts.length - 1]]);
      const ends = [b.pts[0], b.pts[b.pts.length - 1]];
      if (!ends.some(e => Math.hypot(e[0] - q[0], e[1] - q[1]) < 0.7)) continue;
      if (b.diag > 30) continue;
      if (bv.length < 2 && b.lineOnly) continue;
      g.atoms.push(b); used.add(b);
      break;
    }
    groups.push(g);
  }
  return groups;
}

/** Straight bars that share a baseline (vertical) or a start line (horizontal). */
export function bars(atoms) {
  const v = atoms.filter(a => isVLine(a) || (a.closed && a.lineOnly && a.bbox.h > a.bbox.w * 1.4 && a.bbox.w <= 6));
  const h = atoms.filter(a => isHLine(a) || (a.closed && a.lineOnly && a.bbox.w > a.bbox.h * 1.4 && a.bbox.h <= 6));
  const groupBy = (list, key) => {
    const m = new Map();
    for (const a of list) { const k = Math.round(key(a)); if (!m.has(k)) m.set(k, []); m.get(k).push(a); }
    return [...m.values()].filter(g => g.length >= 2).sort((p, q) => q.length - p.length)[0] || [];
  };
  const vb = groupBy(v, a => a.bbox.y2);
  const hb = groupBy(h, a => a.bbox.x1);
  if (vb.length >= 2 && vb.length >= hb.length && new Set(vb.map(a => Math.round(a.bbox.h * 2))).size > 1) return { dir: 'v', atoms: vb.sort((p, q) => p.bbox.cx - q.bbox.cx) };
  if (hb.length >= 2 && new Set(hb.map(a => Math.round(a.bbox.w * 2))).size > 1) return { dir: 'h', atoms: hb.sort((p, q) => p.bbox.cy - q.bbox.cy) };
  return null;
}

/** Long 45-degree slash used by "-off" icons. */
export function slash(atoms) {
  return atoms.find(a => isStraight(a) && a.len >= 14 && Math.abs(a.bbox.w - a.bbox.h) < 2.5) || null;
}

export function sortBy(atoms, by, ref) {
  const list = atoms.slice();
  if (by === 'x') list.sort((a, b) => a.bbox.cx - b.bbox.cx || a.bbox.cy - b.bbox.cy);
  else if (by === 'xr') list.sort((a, b) => b.bbox.cx - a.bbox.cx || a.bbox.cy - b.bbox.cy);
  else if (by === 'dist' && ref) list.sort((a, b) => Math.hypot(a.bbox.cx - ref[0], a.bbox.cy - ref[1]) - Math.hypot(b.bbox.cx - ref[0], b.bbox.cy - ref[1]));
  else if (by === 'size') list.sort((a, b) => a.diag - b.diag);
  else list.sort((a, b) => a.bbox.cy - b.bbox.cy || a.bbox.cx - b.bbox.cx);
  return list;
}

/** Splits a sorted list into at most n contiguous groups. */
export function chunk(list, n) {
  if (list.length <= n) return list.map(a => [a]);
  const out = [];
  const size = list.length / n;
  for (let k = 0; k < n; k++) out.push(list.slice(Math.round(k * size), Math.round((k + 1) * size)));
  return out.filter(g => g.length);
}

export const px = (x, y) => `${Math.round(x * 100) / 100}px ${Math.round(y * 100) / 100}px`;
