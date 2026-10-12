/* tlp-icons runtime core: icon registry, choreography baking, run engine and the hover rule.
   Plain ES module without imports so the build can also wrap it into a classic <script> bundle. */

/** speed: duration multiplier. trigger: page default for icons without one. animated: false makes every icon static. */
export const config = { speed: 0.6, trigger: 'hover', animated: true };

const OUT = 'cubic-bezier(.22,1,.36,1)';
const TURN = 'cubic-bezier(.65,0,.35,1)';
const SINE = 'cubic-bezier(.45,.05,.55,.95)';
export const EASE = {
  draw: 'cubic-bezier(.65,.05,.36,1)', fillIn: 'ease', popIn: OUT, fadeIn: 'ease', slideIn: OUT, riseIn: OUT, dropIn: OUT,
  grow: OUT, growX: OUT, spin: TURN, spinBack: TURN, spinHalf: TURN, sweep: TURN, sweepHour: TURN, orbit: TURN,
  /*__EASE__*/
};
/** trigger="hold": where each animation pauses while hovered (fraction of its duration; generated from the keyframes).
    Animations not listed (entrances) jump to their end. */
export const HOLD = { /*__HOLD__*/ };

const NS = 'http://www.w3.org/2000/svg';
// SSR safety: never touch `document` unless it exists (Node, workers).
const currentDocument = () => (typeof document === 'undefined' ? null : document);
const DRAWABLE = 'path,circle,rect,line,polyline,polygon,ellipse';
const registry = Object.create(null);
const aliases = Object.create(null);
let loader = null;

/** Adds icons: { name: { svg, m } }. */
const waiting = Object.create(null);
export function register(icons, aliasMap) {
  for (const k in icons) registry[k] = icons[k];
  if (aliasMap) for (const k in aliasMap) aliases[k] = aliasMap[k];
  for (const k in waiting) {
    const icon = getIcon(k);
    if (icon) { waiting[k].forEach(fn => fn(icon)); delete waiting[k]; }
  }
}
/**
 * Installs the lazy loader. Icons requested before it existed (elements upgraded while the ES module graph was
 * still evaluating, e.g. tags in the HTML before <script type="module">) are loaded now instead of waiting forever.
 */
export function setLoader(fn) {
  loader = fn;
  if (!fn) return;
  for (const name in waiting) {
    Promise.resolve(fn(resolve(name))).then(() => {
      const list = waiting[name];
      if (!list) return;
      delete waiting[name];
      const icon = getIcon(name);
      list.forEach(res => res(icon));
    }, () => {});
  }
}
export function resolve(name) { return registry[name] ? name : aliases[name] || name; }
export function getIcon(name) { return registry[resolve(name)] || null; }
/** Resolves with the icon data. Without a loader it waits for a later register() (classic script bundles). */
export function loadIcon(name) {
  const icon = getIcon(name);
  if (icon) return Promise.resolve(icon);
  if (loader) return Promise.resolve(loader(resolve(name))).then(() => getIcon(name));
  return new Promise(res => { (waiting[name] = waiting[name] || []).push(res); });
}

/** Scaled timing of every step and the total length in ms. */
export function timings(icon, speed = config.speed) {
  let total = 0;
  const steps = (icon.m || []).map(([part, anim, dur, delay, origin]) => {
    const t = Math.round(dur * speed), dl = Math.round((delay || 0) * speed);
    total = Math.max(total, t + dl);
    return { part, anim, t, dl, origin };
  });
  return { steps, total };
}

const varsOf = s => {
  const v = { '--a': `tlp-${s.anim}`, '--t': `${s.t}ms`, '--dl': `${s.dl}ms`, '--e': EASE[s.anim] || SINE };
  if (s.origin) v['--o'] = s.origin;
  return v;
};
const clsOf = s => `p${s.origin && /px/.test(s.origin) ? ' vb' : ''}${s.anim === 'sweepHour' ? ' hh' : ''}`;
const hasClass = (cls, part) => (` ${cls} `).indexOf(` ${part} `) >= 0;

/** Builds a live <svg> element (CSP friendly: CSS variables are set through the CSSOM). */
export function createSvg(icon, doc = currentDocument()) {
  if (!doc) return null;
  const svg = doc.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'tlp');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = icon.svg;
  const { steps, total } = timings(icon);
  svg.dataset.total = String(total);
  for (const s of steps) {
    let targets;
    if (s.part === 'all') {
      const g = doc.createElementNS(NS, 'g');
      while (svg.firstChild) g.appendChild(svg.firstChild);
      svg.appendChild(g);
      targets = [g];
    } else {
      targets = Array.prototype.filter.call(svg.querySelectorAll('[class]'), el => hasClass(el.getAttribute('class'), s.part));
    }
    const vars = varsOf(s);
    for (const el of targets) {
      el.setAttribute('class', `${el.getAttribute('class') || ''} ${clsOf(s)}`.trim());
      for (const k in vars) el.style.setProperty(k, vars[k]);
    }
  }
  svg.querySelectorAll(DRAWABLE).forEach(el => el.setAttribute('pathLength', '1'));
  return svg;
}

/** Static or animated SVG markup string (animated markup uses inline style for the CSS variables). */
export function toSvgString(icon, opts = {}) {
  const sw = opts.stroke ?? 2, size = opts.size ?? 24;
  const head = `<svg xmlns="${NS}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  if (!opts.animated) {
    const clean = icon.svg.replace(/ class="([^"]*)"/g, (_, c) => {
      const keep = c.split(/\s+/).filter(x => x === 'd' || x === 'f');
      return keep.length ? ` class="${keep.join(' ')}"` : '';
    });
    const duo = opts.duotone ? '<style>.d{fill:currentColor;fill-opacity:.16}.f{fill:currentColor}</style>' : '<style>.f{fill:currentColor}</style>';
    return `${head}>${clean.includes('class="') ? duo : ''}${clean}</svg>`;
  }
  let inner = icon.svg;
  const { steps, total } = timings(icon);
  for (const s of steps) {
    const style = Object.entries(varsOf(s)).map(([k, v]) => `${k}:${v}`).join(';');
    if (s.part === 'all') { inner = `<g class="${clsOf(s)}" style="${style}">${inner}</g>`; continue; }
    inner = inner.replace(new RegExp(`<([a-z]+)([^>]*?) class="([^"]*\\b${s.part}\\b[^"]*)"`, 'g'), (_, tag, pre, c) => `<${tag}${pre} class="${c} ${clsOf(s)}" style="${style}"`);
  }
  inner = inner.replace(/<(path|circle|rect|line|polyline|polygon|ellipse)\b/g, '<$1 pathLength="1"');
  return `${head} class="tlp" data-tlp-icon data-total="${total}">${inner}</svg>`;
}

const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Static icons never animate: config.animated = false, or animated="false" / data-animated="false" on the icon or an ancestor. */
const isStatic = svg => config.animated === false || !!svg.closest('[animated=false],[data-animated=false]');

/** Plays an icon's choreography once. It always finishes, even if the pointer leaves. */
export function run(svg, delay = 0) {
  if (!svg || svg._tlpBusy || svg._tlpHold || reduced() || isStatic(svg)) return false;
  svg._tlpBusy = true;
  const go = () => {
    svg.classList.remove('tlp-run');
    void svg.getBoundingClientRect();
    svg.classList.add('tlp-run');
    setTimeout(() => {
      svg.querySelectorAll('.hh').forEach(h => h.style.setProperty('--h0', `${(parseFloat(h.style.getPropertyValue('--h0')) || 0) + 30}deg`));
      svg.classList.remove('tlp-run');
      svg._tlpBusy = false;
    }, (+svg.dataset.total || 0) + 40);
  };
  if (delay) setTimeout(go, delay); else go();
  return true;
}

const endOf = a => { const t = a.effect.getTiming(); return (+t.delay || 0) + (+t.duration || 0); };
function track(svg, busy) {
  cancelAnimationFrame(svg._tlpRaf);
  const tick = () => { if (busy()) svg._tlpRaf = requestAnimationFrame(tick); };
  svg._tlpRaf = requestAnimationFrame(tick);
}

/**
 * trigger="hold": plays forward and pauses each moving part at its hold point (HOLD), entrances jump to their end.
 * release() plays back to rest. Calling hold() while releasing turns around from the current frame.
 */
export function hold(svg) {
  if (!svg || svg._tlpBusy || reduced() || isStatic(svg)) return false;
  if (svg._tlpHold === 'in') return true;
  if (typeof svg.getAnimations !== 'function') return run(svg);
  if (!svg._tlpHold) {
    svg.classList.remove('tlp-run');
    void svg.getBoundingClientRect();
    svg.classList.add('tlp-run');
    svg._tlpAnims = svg.getAnimations({ subtree: true });
    for (const a of svg._tlpAnims) {
      const h = HOLD[(a.animationName || '').replace(/^tlp-/, '')];
      const t = a.effect.getTiming();
      a._tlpEnd = endOf(a);
      a._tlpAt = h === undefined ? a._tlpEnd : (+t.delay || 0) + h * (+t.duration || 0);
      if (h === undefined) { a.currentTime = a._tlpEnd; a.pause(); }
    }
  } else {
    for (const a of svg._tlpAnims) if (a._tlpAt < a._tlpEnd) { a.playbackRate = 1; a.play(); }
  }
  svg._tlpHold = 'in';
  track(svg, () => {
    let busy = false;
    for (const a of svg._tlpAnims) {
      if (a.playState !== 'running' || a.playbackRate < 0) continue;
      if (a._tlpAt < a._tlpEnd && a.currentTime >= a._tlpAt) { a.currentTime = a._tlpAt; a.pause(); } else busy = true;
    }
    return busy;
  });
  return true;
}

/** Ends a hold: held parts play back to rest, then the icon is static again. */
export function release(svg) {
  if (!svg || !svg._tlpHold || svg._tlpHold === 'out') return false;
  svg._tlpHold = 'out';
  const back = svg._tlpAnims.filter(a => a._tlpAt < a._tlpEnd);
  for (const a of back) { a.playbackRate = -1; a.play(); }
  track(svg, () => {
    if (svg._tlpHold !== 'out') return false;
    if (back.some(a => a.playState === 'running' && a.currentTime > 0)) return true;
    svg.classList.remove('tlp-run');
    svg._tlpHold = null;
    svg._tlpAnims = null;
    return false;
  });
  return true;
}

export const ICON_SELECTOR = 'tlp-icon,svg[data-tlp-icon]';
const HOST = 'button,a,[role=button],[role=menuitem],[role=tab],[role=option],li,tr,td,th,label,summary,input,select,textarea';

function svgOf(icon) { return icon.tagName.toLowerCase() === 'svg' ? icon : icon.querySelector('svg.tlp'); }
function triggerOf(icon) { return icon.getAttribute('trigger') || icon.getAttribute('data-trigger') || config.trigger || 'hover'; }

/**
 * Hover rule: hovering an icon animates it. Otherwise walk up to the nearest element that contains exactly one
 * icon and animate that one. If an element with several icons is reached first (card, menu, table row), do nothing.
 */
export function hoverTarget(target) {
  let el = target && target.nodeType === 1 ? target : target && target.parentElement;
  if (!el) return null;
  const own = el.closest(ICON_SELECTOR);
  if (own) return own.closest('tlp-icon') || own;
  for (let depth = 0; el && el.nodeType === 1 && el !== el.ownerDocument.body && depth < 8; depth++, el = el.parentElement) {
    const list = el.querySelectorAll(ICON_SELECTOR);
    let n = 0, found = null;
    for (const i of list) { if (i.tagName.toLowerCase() === 'svg' && i.closest('tlp-icon')) continue; n++; found = i; }
    if (n > 1) return null;
    if (n === 1) return { icon: found, scope: el };
    if (el.matches(HOST)) return null;
  }
  return null;
}

let hoverInstalled = false;
export function installHover(doc = currentDocument()) {
  if (hoverInstalled || !doc) return;
  hoverInstalled = true;
  doc.addEventListener('mouseover', e => {
    const hit = hoverTarget(e.target);
    if (!hit) return;
    const icon = hit.icon || hit;
    const scope = hit.scope || icon;
    if (scope.contains(e.relatedTarget)) return;
    const trigger = triggerOf(icon);
    if (trigger === 'hover') run(svgOf(icon));
    else if (trigger === 'hold') hold(svgOf(icon));
  }, true);
  doc.addEventListener('mouseout', e => {
    const hit = hoverTarget(e.target);
    if (!hit) return;
    const icon = hit.icon || hit;
    if (triggerOf(icon) !== 'hold') return;
    // still hovering the same icon by the hover rule (e.g. from the icon onto its card): keep holding
    const next = e.relatedTarget && hoverTarget(e.relatedTarget);
    if (next && (next.icon || next) === icon) return;
    release(svgOf(icon));
  }, true);
}

let styleInjected = false;
export const CSS = '/*__CSS__*/';
export function ensureStyles(doc = currentDocument()) {
  if (styleInjected || !doc || !doc.head) return;
  styleInjected = true;
  if (doc.getElementById('tlp-icons-style') || CSS.length < 20) return;
  const style = doc.createElement('style');
  style.id = 'tlp-icons-style';
  style.textContent = CSS;
  doc.head.appendChild(style);
}
