// Type test: the tlp-icons/react wrapper (React 18 recipe; also fine on React 19).
import { useRef } from 'react';
import { TlpIcon, type TlpIconProps } from 'tlp-icons/react';
import type { TlpIcon as TlpIconElement } from 'tlp-icons/element';

export function Buttons() {
  const ref = useRef<TlpIconElement>(null);
  const props: TlpIconProps = { name: 'heart', duotone: true };
  return (
    <div>
      <TlpIcon name="bell" />
      <TlpIcon ref={ref} name="settings" size={20} stroke={1.5} trigger="loop" duotone flip="rtl" className="icon" style={{ color: 'tomato' }} aria-label="Settings" onClick={() => ref.current?.play()} />
      <TlpIcon {...props} />
    </div>
  );
}

// @ts-expect-error `name` is required
export const missing = <TlpIcon />;
// @ts-expect-error invalid trigger
export const bad = <TlpIcon name="bell" trigger="sometimes" />;
