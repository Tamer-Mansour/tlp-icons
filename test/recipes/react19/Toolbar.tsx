import 'tlp-icons/element';
import 'tlp-icons/jsx'; // types <tlp-icon> in JSX

export function Toolbar() {
  return (
    <nav>
      <button type="button">
        <tlp-icon name="bell" /> Alerts
      </button>
      <tlp-icon name="loader-circle" trigger="loop" aria-label="Loading" />
      <tlp-icon name="heart" size={32} duotone className="like" />
    </nav>
  );
}
