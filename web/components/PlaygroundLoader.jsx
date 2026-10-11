'use client';
import { useEffect, useState } from 'react';

/**
 * The server sends a light static preview (children). In the browser the full interactive playground
 * is loaded and replaces it, which keeps every one of the ~6,500 static icon pages small.
 */
export default function PlaygroundLoader({ name, label, svgStatic, children }) {
  const [Playground, setPlayground] = useState(null);
  useEffect(() => {
    let live = true;
    import('./Playground').then(m => { if (live) setPlayground(() => m.default); });
    return () => { live = false; };
  }, []);
  return Playground ? <Playground name={name} label={label} svgStatic={svgStatic} /> : children;
}
