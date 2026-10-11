// SVG path parsing, absolutizing, splitting and flattening. Zero dependencies.

const PARAMS = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

export function tokenize(d) {
  const out = [];
  let i = 0;
  const n = d.length;
  let cmd = null;
  let argIndex = 0;
  const isSep = ch => ch === ' ' || ch === ',' || ch === '\n' || ch === '\r' || ch === '\t';
  const readNumber = () => {
    const m = /^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/.exec(d.slice(i));
    if (!m) throw new Error(`Bad path data near "${d.slice(i, i + 12)}"`);
    i += m[0].length;
    return parseFloat(m[0]);
  };
  while (i < n) {
    const ch = d[i];
    if (isSep(ch)) { i++; continue; }
    if (/[MmLlHhVvCcSsQqTtAaZz]/.test(ch)) {
      cmd = ch; argIndex = 0; i++;
      out.push({ cmd, args: [] });
      if (cmd === 'Z' || cmd === 'z') cmd = null;
      continue;
    }
    if (!cmd) throw new Error(`Number without command in "${d}"`);
    const per = PARAMS[cmd.toUpperCase()];
    let cur = out[out.length - 1];
    if (cur.args.length === per) {
      // implicit repeat; after M the repeats are L
      const next = cmd === 'M' ? 'L' : cmd === 'm' ? 'l' : cmd;
      cur = { cmd: next, args: [] };
      out.push(cur);
      cmd = next;
      argIndex = 0;
    }
    if (cmd.toUpperCase() === 'A' && (argIndex === 3 || argIndex === 4)) {
      if (ch !== '0' && ch !== '1') throw new Error(`Bad arc flag in "${d}"`);
      cur.args.push(ch === '1' ? 1 : 0);
      i++;
    } else {
      cur.args.push(readNumber());
    }
    argIndex = (argIndex + 1) % per;
  }
  return out;
}

/** Absolute segments grouped into subpaths. H/V become L, S becomes C, T becomes Q. */
export function toSubpaths(d) {
  const tokens = tokenize(d);
  const subs = [];
  let cur = null;
  let x = 0, y = 0, sx = 0, sy = 0;
  let lastC = null, lastQ = null;
  const start = () => { cur = { segs: [], closed: false }; subs.push(cur); };
  for (const { cmd, args } of tokens) {
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ax = v => (rel ? x + v : v);
    const ay = v => (rel ? y + v : v);
    let nc = null, nq = null;
    if (C === 'M') {
      x = ax(args[0]); y = ay(args[1]); sx = x; sy = y;
      start();
      cur.segs.push({ c: 'M', x, y });
    } else {
      if (!cur || cur.closed) { start(); cur.segs.push({ c: 'M', x, y }); sx = x; sy = y; }
      if (C === 'Z') {
        cur.closed = true;
        cur.segs.push({ c: 'Z' });
        x = sx; y = sy;
      } else if (C === 'L') {
        x = ax(args[0]); y = ay(args[1]);
        cur.segs.push({ c: 'L', x, y });
      } else if (C === 'H') {
        x = rel ? x + args[0] : args[0];
        cur.segs.push({ c: 'L', x, y });
      } else if (C === 'V') {
        y = rel ? y + args[0] : args[0];
        cur.segs.push({ c: 'L', x, y });
      } else if (C === 'C') {
        const s = { c: 'C', x1: ax(args[0]), y1: ay(args[1]), x2: ax(args[2]), y2: ay(args[3]), x: ax(args[4]), y: ay(args[5]) };
        cur.segs.push(s); x = s.x; y = s.y; nc = [s.x2, s.y2];
      } else if (C === 'S') {
        const x1 = lastC ? 2 * x - lastC[0] : x, y1 = lastC ? 2 * y - lastC[1] : y;
        const s = { c: 'C', x1, y1, x2: ax(args[0]), y2: ay(args[1]), x: ax(args[2]), y: ay(args[3]) };
        cur.segs.push(s); x = s.x; y = s.y; nc = [s.x2, s.y2];
      } else if (C === 'Q') {
        const s = { c: 'Q', x1: ax(args[0]), y1: ay(args[1]), x: ax(args[2]), y: ay(args[3]) };
        cur.segs.push(s); x = s.x; y = s.y; nq = [s.x1, s.y1];
      } else if (C === 'T') {
        const x1 = lastQ ? 2 * x - lastQ[0] : x, y1 = lastQ ? 2 * y - lastQ[1] : y;
        const s = { c: 'Q', x1, y1, x: ax(args[0]), y: ay(args[1]) };
        cur.segs.push(s); x = s.x; y = s.y; nq = [s.x1, s.y1];
      } else if (C === 'A') {
        const s = { c: 'A', rx: Math.abs(args[0]), ry: Math.abs(args[1]), rot: args[2], laf: args[3], sf: args[4], x: ax(args[5]), y: ay(args[6]) };
        cur.segs.push(s); x = s.x; y = s.y;
      }
    }
    lastC = nc; lastQ = nq;
  }
  return subs.filter(s => s.segs.length > 1 || s.closed);
}

export const fmt = v => {
  const r = Math.round(v * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

export function subpathToD(sub) {
  let out = '';
  for (const s of sub.segs) {
    switch (s.c) {
      case 'M': out += `M${fmt(s.x)} ${fmt(s.y)}`; break;
      case 'L': out += `L${fmt(s.x)} ${fmt(s.y)}`; break;
      case 'C': out += `C${fmt(s.x1)} ${fmt(s.y1)} ${fmt(s.x2)} ${fmt(s.y2)} ${fmt(s.x)} ${fmt(s.y)}`; break;
      case 'Q': out += `Q${fmt(s.x1)} ${fmt(s.y1)} ${fmt(s.x)} ${fmt(s.y)}`; break;
      case 'A': out += `A${fmt(s.rx)} ${fmt(s.ry)} ${fmt(s.rot)} ${s.laf} ${s.sf} ${fmt(s.x)} ${fmt(s.y)}`; break;
      case 'Z': out += 'Z'; break;
    }
  }
  return out;
}

/** Endpoint to centre parameterisation (SVG spec F.6.5). */
export function arcCenter(x1, y1, s) {
  let { rx, ry } = s;
  const { x: x2, y: y2 } = s;
  const phi = (s.rot * Math.PI) / 180;
  const cos = Math.cos(phi), sin = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
  if (rx === 0 || ry === 0) return null;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) { const k = Math.sqrt(lambda); rx *= k; ry *= k; }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let coef = den === 0 ? 0 : Math.sqrt(Math.max(0, num / den));
  if (s.laf === s.sf) coef = -coef;
  const cxp = (coef * rx * y1p) / ry, cyp = (-coef * ry * x1p) / rx;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!s.sf && dt > 0) dt -= 2 * Math.PI;
  if (s.sf && dt < 0) dt += 2 * Math.PI;
  return { cx, cy, rx, ry, phi, t1, dt };
}

/** Flattens a subpath into points. Returns { pts, lineOnly, vertices }. */
export function flatten(sub, steps = 10) {
  const pts = [];
  let x = 0, y = 0, sx = 0, sy = 0;
  let lineOnly = true;
  const vertices = [];
  for (const s of sub.segs) {
    if (s.c === 'M') { x = s.x; y = s.y; sx = x; sy = y; pts.push([x, y]); vertices.push([x, y]); continue; }
    if (s.c === 'Z') {
      if (Math.hypot(x - sx, y - sy) > 1e-6) { pts.push([sx, sy]); vertices.push([sx, sy]); }
      x = sx; y = sy;
      continue;
    }
    if (s.c === 'L') { x = s.x; y = s.y; pts.push([x, y]); vertices.push([x, y]); continue; }
    lineOnly = false;
    if (s.c === 'C') {
      for (let k = 1; k <= steps; k++) {
        const t = k / steps, u = 1 - t;
        pts.push([
          u * u * u * x + 3 * u * u * t * s.x1 + 3 * u * t * t * s.x2 + t * t * t * s.x,
          u * u * u * y + 3 * u * u * t * s.y1 + 3 * u * t * t * s.y2 + t * t * t * s.y,
        ]);
      }
    } else if (s.c === 'Q') {
      for (let k = 1; k <= steps; k++) {
        const t = k / steps, u = 1 - t;
        pts.push([u * u * x + 2 * u * t * s.x1 + t * t * s.x, u * u * y + 2 * u * t * s.y1 + t * t * s.y]);
      }
    } else if (s.c === 'A') {
      const a = arcCenter(x, y, s);
      if (!a) { pts.push([s.x, s.y]); } else {
        const n = Math.max(4, Math.ceil((Math.abs(a.dt) / (Math.PI * 2)) * steps * 3));
        for (let k = 1; k <= n; k++) {
          const t = a.t1 + (a.dt * k) / n;
          const ex = a.rx * Math.cos(t), ey = a.ry * Math.sin(t);
          pts.push([Math.cos(a.phi) * ex - Math.sin(a.phi) * ey + a.cx, Math.sin(a.phi) * ex + Math.cos(a.phi) * ey + a.cy]);
        }
      }
    }
    x = s.x; y = s.y;
    vertices.push([x, y]);
  }
  return { pts, lineOnly, vertices };
}
