// Minimal parser/normaliser for the flat stroke SVGs shipped by the upstream sets.

export const ALLOWED_ELEMENTS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g']);
export const GEOMETRY_ATTRS = {
  path: ['d'],
  circle: ['cx', 'cy', 'r'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  g: [],
};
/** Attributes allowed in shipped icon markup (geometry + our classes + pathLength added by the runtime). */
export const ALLOWED_ATTRS = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'transform', 'class']);

const decode = s => s.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function parseAttrs(src) {
  const attrs = {};
  for (const m of src.matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)')/g)) attrs[m[1]] = decode(m[3] ?? m[4]);
  return attrs;
}

/**
 * Parses an upstream SVG file into a flat list of drawable elements.
 * Throws on anything that is not plain stroke geometry so a malicious upstream change cannot slip through.
 */
export function parseUpstreamSvg(text, name = '?') {
  const body = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<\?xml[\s\S]*?\?>/g, '');
  const open = /<svg\b([^>]*)>/i.exec(body);
  if (!open) throw new Error(`${name}: no <svg> root`);
  const rootAttrs = parseAttrs(open[1]);
  if ((rootAttrs.viewBox || '').trim().replace(/\s+/g, ' ') !== '0 0 24 24') throw new Error(`${name}: viewBox is "${rootAttrs.viewBox}"`);
  const inner = body.slice(open.index + open[0].length, body.lastIndexOf('</svg>'));
  const elements = [];
  for (const m of inner.matchAll(/<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)\s*>/g)) {
    const [, closing, tag] = m;
    if (!ALLOWED_ELEMENTS.has(tag)) throw new Error(`${name}: element <${tag}> is not allowed`);
    if (closing || tag === 'g') continue;
    const attrs = parseAttrs(m[3]);
    for (const k of Object.keys(attrs)) {
      if (/^on/i.test(k) || /href$/i.test(k) || k === 'style') throw new Error(`${name}: attribute ${k} is not allowed`);
    }
    // Tabler adds an invisible 24x24 bounding path with stroke="none"
    if (attrs.stroke === 'none' && attrs.fill === 'none') continue;
    const keep = {};
    for (const k of GEOMETRY_ATTRS[tag]) if (attrs[k] != null) keep[k] = attrs[k].trim();
    if ((attrs.fill && attrs.fill !== 'none') || /(^|\s)f(\s|$)/.test(attrs.class || '')) keep.__filled = true;
    elements.push({ tag, attrs: keep });
  }
  if (!elements.length) throw new Error(`${name}: empty icon`);
  return elements;
}

export function elementToMarkup(tag, attrs, cls) {
  let out = `<${tag}`;
  for (const k of GEOMETRY_ATTRS[tag] || []) if (attrs[k] != null) out += ` ${k}="${attrs[k]}"`;
  if (cls) out += ` class="${cls}"`;
  return `${out}/>`;
}
