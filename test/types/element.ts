// Type test: tlp-icons/element (compiled with `tsc --noEmit`, never executed).
import { define, config, run, register, loadIcon, TlpIcon, type TlpReadyEvent, type TlpIconTrigger } from 'tlp-icons/element';

const el = document.createElement('tlp-icon'); // typed through HTMLElementTagNameMap
const typed: TlpIcon = el;
el.name = 'bell';
el.size = 24;
el.size = '1.5em';
const size: string = el.size;
el.stroke = 1.5;
el.trigger = 'loop';
el.duotone = true;
el.duotone = '';
const duo: boolean = el.duotone;
el.flip = 'rtl';
el.flip = null;
const played: boolean = el.play();
el.addEventListener('tlp-ready', (e: TlpReadyEvent) => {
  const n: string = e.detail.name;
  void n;
});
const t: TlpIconTrigger = 'click';

config.speed = 0.8;
const ok: boolean = define();
const ok2: boolean = define('my-icon');
if (TlpIcon) {
  const created: TlpIcon = new TlpIcon();
  void created;
}
register({ custom: { svg: '<path class="p1" d="M4 12h16"/>', m: [['p1', 'draw', 900, 0]] } }, { alias: 'custom' });
run(el.querySelector('svg'));
loadIcon('bell').then(icon => icon?.svg.length);

// @ts-expect-error not a valid trigger
el.trigger = 'always';
// @ts-expect-error not a valid flip
el.flip = 'y';

void [typed, size, duo, played, t, ok, ok2];
