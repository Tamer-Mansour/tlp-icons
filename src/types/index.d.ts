// Types for `tlp-icons` (raw data + SVG helpers). Copied to dist/ by scripts/build.mjs.

/** One motion step: [part, anim, dur (design ms), delay (design ms), origin?]. */
export type MotionStep = [part: string, anim: string, dur: number, delay: number, origin?: string];

/** An icon: inner SVG markup (24x24 viewBox, stroke = currentColor) plus its choreography. `r: 1` = directional. */
export interface IconData {
  svg: string;
  m: MotionStep[];
  r?: 1;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

export interface SvgOptions {
  /** width/height attribute in px (default 24) */
  size?: number;
  /** stroke width (default 2) */
  stroke?: number;
  /** add the soft duotone body fill to static markup */
  duotone?: boolean;
  /** bake the motion into the markup (needs dist/tlp-icons.css) */
  animated?: boolean;
}

export interface Timings {
  steps: { part: string; anim: string; t: number; dl: number; origin?: string }[];
  total: number;
}

/** Every icon, keyed by name. Importing this pulls in the whole set; prefer <tlp-icon> in pages. */
export declare const icons: Record<string, IconData>;
export declare const categories: Category[];
export declare const aliases: Record<string, string>;
export declare function getIcon(name: string): IconData | null;
export declare function getSvg(name: string, opts?: SvgOptions): string | null;
export declare function toSvgString(icon: IconData, opts?: SvgOptions): string;
export declare function timings(icon: IconData, speed?: number): Timings;
