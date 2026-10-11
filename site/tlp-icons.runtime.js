/* tlp-icons 0.1.0 - MIT. Icons from Lucide 1.55.0 (ISC), Tabler Icons 3.49.0 (MIT). Generated file, do not edit. */
(function () {
'use strict';
/* tlp-icons runtime core: icon registry, choreography baking, run engine and the hover rule.
   Plain ES module without imports so the build can also wrap it into a classic <script> bundle. */

const config = { speed: 0.6 };

const OUT = 'cubic-bezier(.22,1,.36,1)';
const TURN = 'cubic-bezier(.65,0,.35,1)';
const SINE = 'cubic-bezier(.45,.05,.55,.95)';
const EASE = {
  draw: 'cubic-bezier(.65,.05,.36,1)', fillIn: 'ease', popIn: OUT, fadeIn: 'ease', slideIn: OUT, riseIn: OUT, dropIn: OUT,
  grow: OUT, growX: OUT, spin: TURN, spinBack: TURN, spinHalf: TURN, sweep: TURN, sweepHour: TURN, orbit: TURN,
};

const NS = 'http://www.w3.org/2000/svg';
const DRAWABLE = 'path,circle,rect,line,polyline,polygon,ellipse';
const registry = Object.create(null);
const aliases = Object.create(null);
let loader = null;

/** Adds icons: { name: { svg, m } }. */
const waiting = Object.create(null);
function register(icons, aliasMap) {
  for (const k in icons) registry[k] = icons[k];
  if (aliasMap) for (const k in aliasMap) aliases[k] = aliasMap[k];
  for (const k in waiting) {
    const icon = getIcon(k);
    if (icon) { waiting[k].forEach(fn => fn(icon)); delete waiting[k]; }
  }
}
function setLoader(fn) { loader = fn; }
function resolve(name) { return registry[name] ? name : aliases[name] || name; }
function getIcon(name) { return registry[resolve(name)] || null; }
/** Resolves with the icon data. Without a loader it waits for a later register() (classic script bundles). */
function loadIcon(name) {
  const icon = getIcon(name);
  if (icon) return Promise.resolve(icon);
  if (loader) return Promise.resolve(loader(resolve(name))).then(() => getIcon(name));
  return new Promise(res => { (waiting[name] = waiting[name] || []).push(res); });
}

/** Scaled timing of every step and the total length in ms. */
function timings(icon, speed = config.speed) {
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
function createSvg(icon, doc = document) {
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
function toSvgString(icon, opts = {}) {
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

/** Plays an icon's choreography once. It always finishes, even if the pointer leaves. */
function run(svg, delay = 0) {
  if (!svg || svg._tlpBusy || reduced()) return false;
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

const ICON_SELECTOR = 'tlp-icon,svg[data-tlp-icon]';
const HOST = 'button,a,[role=button],[role=menuitem],[role=tab],[role=option],li,tr,td,th,label,summary,input,select,textarea';

function svgOf(icon) { return icon.tagName.toLowerCase() === 'svg' ? icon : icon.querySelector('svg.tlp'); }
function triggerOf(icon) { return icon.getAttribute('trigger') || icon.getAttribute('data-trigger') || 'hover'; }

/**
 * Hover rule: hovering an icon animates it. Otherwise walk up to the nearest element that contains exactly one
 * icon and animate that one. If an element with several icons is reached first (card, menu, table row), do nothing.
 */
function hoverTarget(target) {
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
function installHover(doc = document) {
  if (hoverInstalled) return;
  hoverInstalled = true;
  doc.addEventListener('mouseover', e => {
    const hit = hoverTarget(e.target);
    if (!hit) return;
    const icon = hit.icon || hit;
    const scope = hit.scope || icon;
    if (scope.contains(e.relatedTarget)) return;
    if (triggerOf(icon) !== 'hover') return;
    run(svgOf(icon));
  }, true);
}

let styleInjected = false;
const CSS = "tlp-icon{display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--tlp-size,24px);height:var(--tlp-size,24px);line-height:0;vertical-align:middle;color:inherit}tlp-icon>svg,svg.tlp{width:100%;height:100%}svg.tlp{fill:none;stroke:currentColor;stroke-width:var(--tlp-stroke,2);stroke-linecap:round;stroke-linejoin:round;overflow:visible}svg.tlp .d{fill:currentColor;fill-opacity:var(--tlp-duo,0)}tlp-icon[duotone],.tlp-duotone{--tlp-duo:.16}tlp-icon[duotone=false]{--tlp-duo:0}svg.tlp .f{fill:currentColor}svg.tlp .p{transform-box:fill-box;transform-origin:var(--o,center)}svg.tlp .p.vb{transform-box:view-box}svg.tlp .p.hh{transform:rotate(var(--h0,0deg))}svg.tlp.tlp-run .p{animation:var(--a) var(--t,1000ms) var(--e,cubic-bezier(.45,.05,.55,.95)) var(--dl,0ms) 1 both}tlp-icon[flip=x]>svg,[dir=rtl] tlp-icon[flip=rtl]>svg{transform:scaleX(-1)}@keyframes tlp-draw{0%{stroke-dasharray:1;stroke-dashoffset:1}100%{stroke-dasharray:1;stroke-dashoffset:0}}@keyframes tlp-fillIn{0%{fill-opacity:0}100%{fill-opacity:var(--tlp-duo,0)}}@keyframes tlp-popIn{0%{opacity:0;transform:scale(.4)}55%{opacity:1;transform:scale(1.08)}78%{transform:scale(.98)}100%{opacity:1;transform:scale(1)}}@keyframes tlp-fadeIn{0%{opacity:0}100%{opacity:1}}@keyframes tlp-slideIn{0%{opacity:0;transform:translateX(-4px)}100%{opacity:1;transform:translateX(0)}}@keyframes tlp-riseIn{0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}}@keyframes tlp-dropIn{0%{opacity:0;transform:translateY(-5px)}60%{opacity:1;transform:translateY(.8px)}80%{transform:translateY(-.3px)}100%{opacity:1;transform:translateY(0)}}@keyframes tlp-grow{0%{transform:scaleY(0)}70%{transform:scaleY(1.06)}100%{transform:scaleY(1)}}@keyframes tlp-growX{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}@keyframes tlp-pop{0%,100%{transform:scale(1)}40%{transform:scale(1.14)}68%{transform:scale(.97)}86%{transform:scale(1.02)}}@keyframes tlp-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}@keyframes tlp-jelly{0%,100%{transform:scale(1,1)}30%{transform:scale(1.1,.9)}50%{transform:scale(.94,1.06)}70%{transform:scale(1.03,.97)}85%{transform:scale(.99,1.01)}}@keyframes tlp-swing{0%,100%{transform:rotate(0)}15%{transform:rotate(13deg)}32%{transform:rotate(-10deg)}50%{transform:rotate(6deg)}68%{transform:rotate(-3deg)}84%{transform:rotate(1deg)}}@keyframes tlp-wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-8deg)}45%{transform:rotate(6deg)}68%{transform:rotate(-3deg)}86%{transform:rotate(1deg)}}@keyframes tlp-tilt{0%,100%{transform:rotate(0)}40%{transform:rotate(-12deg)}72%{transform:rotate(3deg)}88%{transform:rotate(-1deg)}}@keyframes tlp-nod{0%,100%{transform:rotate(0)}45%{transform:rotate(7deg)}75%{transform:rotate(-1.5deg)}}@keyframes tlp-strike{0%,100%{transform:rotate(0)}38%{transform:rotate(-24deg)}56%{transform:rotate(7deg)}70%{transform:rotate(-2deg)}84%{transform:rotate(.6deg)}}@keyframes tlp-hop{0%,100%{transform:translateY(0) scale(1,1)}10%{transform:translateY(0) scale(1.04,.95)}40%{transform:translateY(-3px) scale(.97,1.04)}68%{transform:translateY(0) scale(1.04,.96)}84%{transform:translateY(0) scale(.99,1.01)}}@keyframes tlp-lift{0%,100%{transform:translateY(0)}45%{transform:translateY(-2.5px)}75%{transform:translateY(.4px)}}@keyframes tlp-sink{0%,100%{transform:translateY(0)}45%{transform:translateY(2.5px)}75%{transform:translateY(-.4px)}}@keyframes tlp-nudge{0%,100%{transform:translateX(0)}45%{transform:translateX(2.6px)}75%{transform:translateX(-.4px)}}@keyframes tlp-nudgeBack{0%,100%{transform:translateX(0)}45%{transform:translateX(-2.6px)}75%{transform:translateX(.4px)}}@keyframes tlp-float{0%,100%{transform:translateY(0)}25%{transform:translateY(-2px)}50%{transform:translateY(0)}75%{transform:translateY(-1.2px)}}@keyframes tlp-flip{0%,100%{transform:scaleX(1)}50%{transform:scaleX(-1)}}@keyframes tlp-spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes tlp-spinBack{0%{transform:rotate(0)}100%{transform:rotate(-360deg)}}@keyframes tlp-spinHalf{0%{transform:rotate(0)}80%{transform:rotate(188deg)}100%{transform:rotate(180deg)}}@keyframes tlp-sweep{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes tlp-sweepHour{0%{transform:rotate(var(--h0,0deg))}100%{transform:rotate(calc(var(--h0,0deg) + 30deg))}}@keyframes tlp-blink{0%,100%{transform:scaleY(1)}35%{transform:scaleY(.08)}60%{transform:scaleY(1)}}@keyframes tlp-shake{0%,100%{transform:translateX(0)}18%{transform:translateX(-1.6px)}36%{transform:translateX(1.4px)}54%{transform:translateX(-1px)}72%{transform:translateX(.6px)}88%{transform:translateX(-.2px)}}@keyframes tlp-pulseRing{0%,100%{opacity:1;transform:scale(1)}55%{opacity:0;transform:scale(1.5)}56%{opacity:0;transform:scale(.6)}}@keyframes tlp-orbit{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes tlp-stretch{0%,100%{transform:scaleX(1)}45%{transform:scaleX(1.12)}75%{transform:scaleX(.98)}}@media (prefers-reduced-motion:reduce){svg.tlp .p{animation:none!important}}";
function ensureStyles(doc = document) {
  if (styleInjected || !doc || !doc.head) return;
  styleInjected = true;
  if (doc.getElementById('tlp-icons-style') || CSS.length < 20) return;
  const style = doc.createElement('style');
  style.id = 'tlp-icons-style';
  style.textContent = CSS;
  doc.head.appendChild(style);
}

/* <tlp-icon name="bell" size="24" stroke="1.75" trigger="hover|loop|click|none" duotone flip="rtl|x"> */

const LOOP_PAUSE = 1200;

class TlpIcon extends HTMLElement {
  static get observedAttributes() { return ['name', 'size', 'stroke', 'trigger']; }

  connectedCallback() {
    ensureStyles(this.ownerDocument);
    installHover(this.ownerDocument);
    if (!this.hasAttribute('role')) this.setAttribute('aria-hidden', 'true');
    this.render();
    this.setupTrigger();
  }

  disconnectedCallback() {
    clearTimeout(this._loop);
    this._loop = null;
  }

  attributeChangedCallback(attr) {
    if (!this.isConnected) return;
    if (attr === 'size' || attr === 'stroke') this.applyVars();
    else if (attr === 'name') this.render();
    else if (attr === 'trigger') this.setupTrigger();
  }

  applyVars() {
    const size = this.getAttribute('size');
    const stroke = this.getAttribute('stroke');
    if (size) this.style.setProperty('--tlp-size', /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size);
    else this.style.removeProperty('--tlp-size');
    if (stroke) this.style.setProperty('--tlp-stroke', stroke);
    else this.style.removeProperty('--tlp-stroke');
  }

  render() {
    this.applyVars();
    const name = this.getAttribute('name');
    if (!name) { this.replaceChildren(); return; }
    loadIcon(name).then(icon => {
      if (this.getAttribute('name') !== name) return;
      if (!icon) { this.replaceChildren(); this.dataset.missing = ''; return; }
      delete this.dataset.missing;
      this.replaceChildren(createSvg(icon, this.ownerDocument));
      if (icon.r) this.dataset.dir = ''; else delete this.dataset.dir;
      this.dispatchEvent(new CustomEvent('tlp-ready', { bubbles: false }));
    });
  }

  setupTrigger() {
    clearTimeout(this._loop);
    this._loop = null;
    const trigger = this.getAttribute('trigger');
    if (trigger === 'loop') {
      const tick = () => {
        const svg = this.querySelector('svg.tlp');
        if (svg) run(svg);
        this._loop = setTimeout(tick, ((svg && +svg.dataset.total) || 900) + LOOP_PAUSE);
      };
      this._loop = setTimeout(tick, 60);
    }
    if (trigger === 'click' && !this._clickBound) {
      this._clickBound = true;
      this.addEventListener('click', () => { if (this.getAttribute('trigger') === 'click') run(this.querySelector('svg.tlp')); });
    }
  }

  /** Plays the animation once. */
  play() { return run(this.querySelector('svg.tlp')); }
}

if (typeof customElements !== 'undefined' && !customElements.get('tlp-icon')) customElements.define('tlp-icon', TlpIcon);

var api = { config, EASE, register, setLoader, resolve, getIcon, loadIcon, timings, createSvg, toSvgString, run, ICON_SELECTOR, hoverTarget, installHover, CSS, ensureStyles, TlpIcon };
if (typeof window !== 'undefined') window.TlpIcons = api;
})();
