// Type test: React 19 using the tag directly, typed by `tlp-icons/jsx`.
import 'tlp-icons/jsx';
import 'tlp-icons/element';

export function Toolbar() {
  return (
    <nav>
      <tlp-icon name="bell" />
      <tlp-icon name="heart" size={20} stroke="1.5" trigger="loop" duotone flip="rtl" className="icon" aria-label="Likes" data-x="1" />
      <tlp-icon name="settings" size="2em" trigger="click" onClick={() => {}} style={{ color: 'red' }} />
    </nav>
  );
}

// @ts-expect-error `name` is required
export const missingName = <tlp-icon />;
// @ts-expect-error invalid trigger value
export const badTrigger = <tlp-icon name="bell" trigger="always" />;
