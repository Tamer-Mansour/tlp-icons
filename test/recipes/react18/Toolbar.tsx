import { TlpIcon } from 'tlp-icons/react';

export function Toolbar() {
  return (
    <nav>
      <button type="button">
        <TlpIcon name="bell" /> Alerts
      </button>
      <TlpIcon name="loader-circle" trigger="loop" aria-label="Loading" />
      <TlpIcon name="heart" size={32} duotone className="like" />
    </nav>
  );
}
