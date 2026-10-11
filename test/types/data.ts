// Type test: the main `tlp-icons` entry (raw data + SVG helpers).
import { icons, categories, aliases, getIcon, getSvg, toSvgString, timings, type IconData, type Category } from 'tlp-icons';

const bell: IconData | null = getIcon('bell');
const svg: string | null = getSvg('bell', { size: 32, stroke: 1.5, duotone: true });
const animated: string | null = getSvg('bell', { animated: true });
const first: Category | undefined = categories[0];
const target: string | undefined = aliases['trash-2'];
const count: number = Object.keys(icons).length;
if (bell) {
  const s: string = toSvgString(bell);
  const total: number = timings(bell, 0.6).total;
  void [s, total];
}
// @ts-expect-error unknown option type
getSvg('bell', { size: 'big' });

void [svg, animated, first, target, count];
