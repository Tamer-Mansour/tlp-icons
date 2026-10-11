/* <tlp-icon name="bell" size="24" stroke="1.75" trigger="hover|loop|click|none" duotone flip="rtl|x"> */
import { loadIcon, createSvg, run, installHover, ensureStyles } from './core.js';

const LOOP_PAUSE = 1200;
const ATTRS = ['name', 'size', 'stroke', 'trigger', 'duotone', 'flip'];
const TRIGGERS = ['hover', 'loop', 'click', 'none'];
const warned = new Set();
const isProduction = () => typeof process !== 'undefined' && !!process.env && process.env.NODE_ENV === 'production';

function warnMissing(name) {
  if (warned.has(name) || isProduction() || typeof console === 'undefined') return;
  warned.add(name);
  console.warn(`[tlp-icons] unknown icon "${name}". Browse names at https://tlp-icons.netlify.app/icons/`);
}

// SSR safety: nothing below touches HTMLElement / customElements / document at module level outside a guard,
// so `import 'tlp-icons/element'` works in Node (Next.js, Nuxt, Angular Universal, SvelteKit). On the server
// TlpIcon is undefined and define() is a no-op.
export const TlpIcon = typeof HTMLElement === 'undefined' ? undefined : class TlpIcon extends HTMLElement {
  static get observedAttributes() { return ATTRS; }

  constructor() {
    super();
    this._token = 0;
    // Frameworks may set properties before the element is defined; replay them through the setters.
    for (const prop of ATTRS) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        const value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
  }

  // ---- properties (reflect to attributes)
  get name() { return this.getAttribute('name') || ''; }
  set name(v) { this._reflect('name', v); }
  get size() { return this.getAttribute('size') || ''; }
  set size(v) { this._reflect('size', v); }
  get stroke() { return this.getAttribute('stroke') || ''; }
  set stroke(v) { this._reflect('stroke', v); }
  get trigger() { const t = this.getAttribute('trigger'); return TRIGGERS.includes(t) ? t : 'hover'; }
  set trigger(v) { this._reflect('trigger', v); }
  get duotone() { return this.hasAttribute('duotone') && this.getAttribute('duotone') !== 'false'; }
  set duotone(v) {
    if (v === true || v === '' || v === 'true') this.setAttribute('duotone', '');
    else this.removeAttribute('duotone');
  }
  get flip() { const f = this.getAttribute('flip'); return f === 'rtl' || f === 'x' ? f : null; }
  set flip(v) { this._reflect('flip', v); }

  _reflect(attr, v) {
    if (v === null || v === undefined || v === false) this.removeAttribute(attr);
    else this.setAttribute(attr, String(v));
  }

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
    this._token++; // abandon any in-flight load so it never renders into a detached node
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (!this.isConnected || oldValue === newValue) return;
    if (attr === 'size' || attr === 'stroke') this.applyVars();
    else if (attr === 'name') this.render();
    else if (attr === 'trigger') this.setupTrigger();
    else if (attr === 'duotone' || attr === 'flip') this.applyFlags();
  }

  applyVars() {
    const size = this.getAttribute('size');
    const stroke = this.getAttribute('stroke');
    if (size) this.style.setProperty('--tlp-size', /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size);
    else this.style.removeProperty('--tlp-size');
    if (stroke) this.style.setProperty('--tlp-stroke', stroke);
    else this.style.removeProperty('--tlp-stroke');
  }

  /** duotone / flip are styled by CSS attribute selectors; the state is mirrored here for JS-driven behaviour. */
  applyFlags() {
    const svg = this.querySelector('svg.tlp');
    if (svg) {
      svg.toggleAttribute('data-duotone', this.duotone);
      if (this.flip) svg.setAttribute('data-flip', this.flip); else svg.removeAttribute('data-flip');
    }
  }

  render() {
    this.applyVars();
    const token = ++this._token;
    const name = this.getAttribute('name');
    if (!name) { this.replaceChildren(); this.removeAttribute('data-missing'); return; }
    loadIcon(name).then(icon => {
      if (token !== this._token || !this.isConnected || this.getAttribute('name') !== name) return;
      if (!icon) {
        this.replaceChildren();
        this.setAttribute('data-missing', '');
        warnMissing(name);
        return;
      }
      this.removeAttribute('data-missing');
      const svg = createSvg(icon, this.ownerDocument);
      if (!svg) return;
      this.replaceChildren(svg);
      if (icon.r) this.dataset.dir = ''; else delete this.dataset.dir;
      this.applyFlags();
      this.dispatchEvent(new CustomEvent('tlp-ready', { bubbles: true, composed: true, detail: { name } }));
    }, () => {
      if (token === this._token && this.isConnected) { this.replaceChildren(); this.setAttribute('data-missing', ''); }
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
};

/**
 * Registers the custom element (done automatically on import in the browser). Safe to call on the server and
 * safe to call twice. Returns true when the element is (now) defined.
 */
export function define(tag = 'tlp-icon') {
  if (!TlpIcon || typeof customElements === 'undefined') return false;
  if (!customElements.get(tag)) customElements.define(tag, tag === 'tlp-icon' ? TlpIcon : class extends TlpIcon {});
  return true;
}

define();
