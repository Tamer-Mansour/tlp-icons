/* tlp-icons 0.1.0 - MIT. Icons from Lucide 1.55.0 (ISC), Tabler Icons 3.49.0 (MIT). Generated file, do not edit. */
/* <tlp-icon name="bell" size="24" stroke="1.75" trigger="hover|loop|click|none" duotone flip="rtl|x"> */
import { loadIcon, createSvg, run, installHover, ensureStyles } from './core.js';

const LOOP_PAUSE = 1200;

export class TlpIcon extends HTMLElement {
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
