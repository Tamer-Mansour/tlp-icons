// Types for `tlp-icons/react` (React wrapper component). Requires @types/react in your project.
import type { ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes } from 'react';
import type { TlpIcon as TlpIconElement, TlpIconFlip, TlpIconTrigger } from './tlp-icon.js';

export interface TlpIconProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Icon name or alias, e.g. "bell" */
  name: string;
  /** number (px) or any CSS length */
  size?: number | string;
  stroke?: number | string;
  trigger?: TlpIconTrigger;
  duotone?: boolean | '';
  flip?: TlpIconFlip;
  /** false = static icon (never animates) */
  animated?: boolean;
  children?: ReactNode;
}

/** <TlpIcon name="bell" /> renders <tlp-icon> and loads the element on the client only. */
export declare const TlpIcon: ForwardRefExoticComponent<TlpIconProps & RefAttributes<TlpIconElement>>;
export default TlpIcon;
