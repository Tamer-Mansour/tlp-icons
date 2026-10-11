// Types for `tlp-icons/element` (the <tlp-icon> custom element and its runtime). Copied to dist/ by the build.
import type { IconData, SvgOptions, Timings } from './index.js';

export type { IconData, MotionStep, SvgOptions, Timings, Category } from './index.js';

export type TlpIconTrigger = 'hover' | 'loop' | 'click' | 'none';
export type TlpIconFlip = 'rtl' | 'x';

/** Fired (bubbling, composed) when the icon's SVG has been rendered. */
export type TlpReadyEvent = CustomEvent<{ name: string }>;

export interface TlpIconEventMap extends HTMLElementEventMap {
  'tlp-ready': TlpReadyEvent;
}

/** The <tlp-icon> element. Every property reflects to the attribute of the same name. */
export interface TlpIcon extends HTMLElement {
  /** Icon name or alias, e.g. "bell". */
  name: string;
  /** Size: a number (px) or any CSS length. Reads back as the attribute string. */
  get size(): string;
  set size(value: string | number | null);
  /** Stroke width in the 24x24 grid. Reads back as the attribute string. */
  get stroke(): string;
  set stroke(value: string | number | null);
  /** When the animation plays. Default "hover". */
  trigger: TlpIconTrigger;
  /** Soft tinted body fill. Accepts true / false / "" (attribute present). */
  get duotone(): boolean;
  set duotone(value: boolean | '' | 'true' | 'false' | null);
  /** Mirror in RTL pages ("rtl") or always ("x"); null = never. */
  flip: TlpIconFlip | null;
  /** Plays the animation once. Returns false if it is already playing or motion is reduced. */
  play(): boolean;

  addEventListener<K extends keyof TlpIconEventMap>(type: K, listener: (this: TlpIcon, ev: TlpIconEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof TlpIconEventMap>(type: K, listener: (this: TlpIcon, ev: TlpIconEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

/** The element class. `undefined` on the server (no DOM), so guard before using it there. */
export declare const TlpIcon: { prototype: TlpIcon; new (): TlpIcon } | undefined;

/** Registers the element (automatic on import in the browser). No-op on the server. */
export declare function define(tag?: string): boolean;

/** Runtime settings. `speed` scales every animation (default 0.6, about 0.9 s per icon). */
export declare const config: { speed: number };

/** Plays an icon's choreography once on a rendered <svg class="tlp">. */
export declare function run(svg: SVGSVGElement | Element | null, delay?: number): boolean;

/** Adds icons (and optional aliases) to the runtime registry. */
export declare function register(icons: Record<string, IconData>, aliases?: Record<string, string>): void;

export declare function setLoader(loader: ((name: string) => unknown) | null): void;
export declare function resolve(name: string): string;
export declare function getIcon(name: string): IconData | null;
export declare function loadIcon(name: string): Promise<IconData | null>;
export declare function timings(icon: IconData, speed?: number): Timings;
export declare function createSvg(icon: IconData, doc?: Document): SVGSVGElement | null;
export declare function toSvgString(icon: IconData, opts?: SvgOptions): string;
export declare function hoverTarget(target: EventTarget | null): Element | { icon: Element; scope: Element } | null;
export declare function installHover(doc?: Document): void;
export declare function ensureStyles(doc?: Document): void;
export declare const EASE: Record<string, string>;
export declare const ICON_SELECTOR: string;
export declare const CSS: string;

declare global {
  interface HTMLElementTagNameMap {
    'tlp-icon': TlpIcon;
  }
}
