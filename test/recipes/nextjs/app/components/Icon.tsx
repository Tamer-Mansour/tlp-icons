'use client';
// app/components/Icon.tsx - use <Icon name="bell" /> from any server or client component.
// The import is safe during server rendering (it registers the element only in the browser).
import 'tlp-icons/element';
import 'tlp-icons/jsx';

export function Icon(props: { name: string; size?: number; trigger?: 'hover' | 'loop' | 'click' | 'none'; duotone?: boolean }) {
  return <tlp-icon {...props} />;
}
