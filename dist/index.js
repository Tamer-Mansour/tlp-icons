/* tlp-icons 0.1.0 - MIT. Icons from Lucide 1.55.0 (ISC), Tabler Icons 3.49.0 (MIT). Generated file, do not edit. */
import c0 from './icons/interface.js';
import c1 from './icons/arrows.js';
import c2 from './icons/layout.js';
import c3 from './icons/text.js';
import c4 from './icons/communication.js';
import c5 from './icons/notifications.js';
import c6 from './icons/people.js';
import c7 from './icons/security.js';
import c8 from './icons/files.js';
import c9 from './icons/devices.js';
import c10 from './icons/connectivity.js';
import c11 from './icons/development.js';
import c12 from './icons/charts.js';
import c13 from './icons/media.js';
import c14 from './icons/photography.js';
import c15 from './icons/design.js';
import c16 from './icons/shapes.js';
import c17 from './icons/math.js';
import c18 from './icons/finance.js';
import c19 from './icons/commerce.js';
import c20 from './icons/time.js';
import c21 from './icons/weather.js';
import c22 from './icons/nature.js';
import c23 from './icons/maps.js';
import c24 from './icons/vehicles.js';
import c25 from './icons/buildings.js';
import c26 from './icons/home.js';
import c27 from './icons/food.js';
import c28 from './icons/health.js';
import c29 from './icons/science.js';
import c30 from './icons/sport.js';
import c31 from './icons/tools.js';
import c32 from './icons/legal.js';
import c33 from './icons/emoji.js';
import { toSvgString, timings } from './core.js';
export { CATEGORIES as categories, ALIASES as aliases } from './manifest.js';
import { ALIASES } from './manifest.js';
/** Every icon: { name: { svg, m, r? } }. svg = inner markup (24x24, stroke=currentColor), m = motion steps [part, anim, dur, delay, origin?]. */
export const icons = Object.assign({}, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24, c25, c26, c27, c28, c29, c30, c31, c32, c33);
export function getIcon(name) { return icons[name] || icons[ALIASES[name]] || null; }
/** SVG markup string. opts: { size, stroke, duotone, animated } */
export function getSvg(name, opts = {}) { const i = getIcon(name); return i ? toSvgString(i, opts) : null; }
export { toSvgString, timings };
