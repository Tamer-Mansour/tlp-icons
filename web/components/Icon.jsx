import { svgMarkup } from '@/lib/data';

/**
 * Server-rendered <tlp-icon>: the static SVG is in the HTML (fast, crawlable, works without JS);
 * the tlp-icons element takes over on the client and adds the motion.
 */
export default function Icon({ name, size, stroke, trigger, duotone, flip, animated, className, ssr = true, label }) {
  const props = { name };
  if (size) props.size = String(size);
  if (stroke) props.stroke = String(stroke);
  if (trigger) props.trigger = trigger;
  if (duotone) props.duotone = '';
  if (flip) props.flip = flip;
  if (animated === false) props.animated = 'false';
  if (className) props.class = className;
  if (label) { props.role = 'img'; props['aria-label'] = label; }
  return ssr
    ? <tlp-icon {...props} dangerouslySetInnerHTML={{ __html: svgMarkup(name) }} suppressHydrationWarning />
    : <tlp-icon {...props} suppressHydrationWarning />;
}
