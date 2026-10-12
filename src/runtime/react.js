/* tlp-icons/react: a tiny React wrapper for <tlp-icon> (React 16.8+, built for React 18 which stringifies
   booleans and cannot set custom element properties). React is a peer dependency and is never bundled. */
import { createElement, forwardRef, useCallback, useEffect, useRef } from 'react';

const isOn = v => v === true || v === '' || v === 'true';

export const TlpIcon = forwardRef(function TlpIcon(props, forwardedRef) {
  const { name, size, stroke, trigger, duotone, flip, animated, children, ...rest } = props;
  const local = useRef(null);

  // the element is imported on the client only (keeps server rendering safe)
  useEffect(() => { import('./tlp-icon.js'); }, []);

  // keep attributes exact on the client (React 18 would write duotone="false")
  useEffect(() => {
    const el = local.current;
    if (!el) return;
    const set = (attr, value) => {
      if (value === undefined || value === null || value === false) el.removeAttribute(attr);
      else el.setAttribute(attr, String(value));
    };
    set('name', name);
    set('size', size);
    set('stroke', stroke);
    set('trigger', trigger);
    set('flip', flip);
    set('animated', animated === false || animated === 'false' ? 'false' : null);
    if (isOn(duotone)) el.setAttribute('duotone', ''); else el.removeAttribute('duotone');
  }, [name, size, stroke, trigger, duotone, flip, animated]);

  const ref = useCallback(node => {
    local.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  // the same attributes in the initial (server) HTML; className, style, aria-*, data-*, events pass through
  const attrs = { ...rest, ref, suppressHydrationWarning: true };
  if (name !== undefined && name !== null) attrs.name = String(name);
  if (size !== undefined && size !== null) attrs.size = String(size);
  if (stroke !== undefined && stroke !== null) attrs.stroke = String(stroke);
  if (trigger) attrs.trigger = trigger;
  if (flip) attrs.flip = flip;
  if (animated === false || animated === 'false') attrs.animated = 'false';
  if (isOn(duotone)) attrs.duotone = '';
  return createElement('tlp-icon', attrs, children);
});

export default TlpIcon;
