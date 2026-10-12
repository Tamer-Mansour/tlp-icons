// JSX typings for <tlp-icon>: `import 'tlp-icons/jsx'` (or add "tlp-icons/jsx" to tsconfig "types").
// A script file on purpose (no top-level import/export): it never imports `react`, so it does not error when
// React's types are not installed. It augments both the global JSX namespace (React <= 18, Preact and friends)
// and React's module-scoped `React.JSX` (React 18.3+/19, used by the react-jsx runtime).

declare namespace TlpIconsJSX {
  type Trigger = 'hover' | 'hold' | 'loop' | 'click' | 'none';
  type Flip = 'rtl' | 'x';
  type Handler = (event: any) => void;

  interface TlpIconAttributes {
    /** Icon name or alias, e.g. "bell" */
    name: string;
    size?: number | string;
    stroke?: number | string;
    trigger?: Trigger;
    duotone?: boolean | '';
    flip?: Flip;
    /** "false" = static icon */
    animated?: boolean | 'true' | 'false';
    // standard HTML attributes
    children?: unknown;
    id?: string;
    class?: string;
    className?: string;
    style?: string | Record<string, string | number | undefined>;
    title?: string;
    role?: string;
    slot?: string;
    hidden?: boolean;
    tabIndex?: number;
    dir?: string;
    lang?: string;
    part?: string;
    key?: string | number | null;
    ref?: unknown;
    suppressHydrationWarning?: boolean;
    onClick?: Handler;
    onMouseEnter?: Handler;
    onMouseLeave?: Handler;
    onFocus?: Handler;
    onBlur?: Handler;
    onKeyDown?: Handler;
    [aria: `aria-${string}`]: string | number | boolean | undefined;
    [data: `data-${string}`]: string | number | boolean | undefined;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    'tlp-icon': TlpIconsJSX.TlpIconAttributes;
  }
}

// React's types expose a UMD global namespace `React` (`export as namespace React`). Re-declaring it from a
// script merges into React's own namespace when @types/react is installed (so React.JSX, used by the react-jsx
// runtime in React 18.3+/19, gets the element) and is a harmless empty namespace when it is not.
declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'tlp-icon': TlpIconsJSX.TlpIconAttributes;
    }
  }
}
