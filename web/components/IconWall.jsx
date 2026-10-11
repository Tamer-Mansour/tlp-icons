'use client';
import { useEffect, useRef } from 'react';

/** Plays the icons inside in a slow diagonal wave, so the hero is always alive. */
export default function IconWall({ children, cols = 6, every = 3600 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer;
    const wave = () => {
      const icons = [...el.querySelectorAll('tlp-icon')];
      icons.forEach((icon, k) => {
        const row = Math.floor(k / cols), col = k % cols;
        setTimeout(() => icon.play && icon.play(), (row + col) * 140);
      });
      timer = setTimeout(wave, every);
    };
    const start = setTimeout(wave, 700);
    return () => { clearTimeout(start); clearTimeout(timer); };
  }, [cols, every]);
  return <div ref={ref}>{children}</div>;
}
