<p align="center">
  <a href="https://tlp-icons.netlify.app"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/web/public/favicon.svg" width="88" height="88" alt="tlp-icons logo"></a>
</p>

<h1 align="center">tlp-icons</h1>

<p align="center">
  <b>Every icon, animated.</b><br>
  <a href="https://tlp-icons.netlify.app/icons/"><b>Browse the icons</b></a> ·
  <a href="https://tlp-icons.netlify.app/docs/"><b>Documentation</b></a> ·
  <a href="https://tlp-icons.netlify.app/categories/brands/">Brands</a> ·
  <a href="https://github.com/Tamer-Mansour/tlp-icons/blob/main/ROADMAP.md">Roadmap</a> ·
  <a href="https://github.com/Tamer-Mansour/tlp-icons">GitHub</a>
</p>

<!-- badges:start -->
<p align="center">
  <a href="https://www.npmjs.com/package/tlp-icons"><img alt="npm version" src="https://img.shields.io/npm/v/tlp-icons?color=4f46e5"></a>
  <a href="https://www.npmjs.com/package/tlp-icons"><img alt="npm downloads" src="https://img.shields.io/npm/dm/tlp-icons?color=4f46e5"></a>
  <a href="#bundle-size"><img alt="element size" src="https://img.shields.io/badge/element-6.6%20KB%20gzip-16a34a"></a>
  <a href="https://github.com/Tamer-Mansour/tlp-icons/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Tamer-Mansour/tlp-icons/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Tamer-Mansour/tlp-icons/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/tlp-icons?color=16a34a"></a>
  <img alt="icons" src="https://img.shields.io/badge/icons-7%2C677-4f46e5">
</p>
<!-- badges:end -->

A free, open-source (MIT) library of <!--s:icons-->7,677<!--/s--> stroke icons, built from the best free sets (Lucide and Tabler) plus
our own **tlp originals**, sorted into <!--s:categories-->35<!--/s--> hand-curated categories, including **<!--s:brands-->376<!--/s--> brand logos** (Facebook,
Instagram, WhatsApp, X, TikTok, YouTube...). Every single one moves on hover: clock hands sweep around the face,
gears spin on their axle, bells swing from the top, trash lids lift, arrows move the way they point.

<table>
<tr>
<td align="center"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/media/hover.gif" width="420" alt="Hovering a button plays its icon"><br><sub>Hover a button, its icon plays</sub></td>
<td align="center"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/media/loop.gif" width="420" alt="Loaders with trigger=loop"><br><sub><code>trigger="loop"</code></sub></td>
</tr>
<tr>
<td align="center"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/media/rtl.gif" width="420" alt="The same arrow in LTR and RTL with flip=rtl"><br><sub><code>flip="rtl"</code> mirrors the icon and its motion</sub></td>
<td align="center"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/media/duotone.gif" width="420" alt="Icons without and with duotone"><br><sub><code>duotone</code> adds a soft tinted body</sub></td>
</tr>
</table>

[![tlp-icons website](https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/website.png)](https://tlp-icons.netlify.app)

<table><tr>
<td><a href="https://tlp-icons.netlify.app/categories/legal/"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/category.png" alt="Legal category page"></a></td>
<td><a href="https://tlp-icons.netlify.app/icons/courthouse/"><img src="https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/icon-page.png" alt="Icon page with live playground and code"></a></td>
</tr><tr>
<td align="center">Category pages (legal: <!--s:cat.legal-->1,177<!--/s--> icons)</td>
<td align="center">One page per icon: playground + code</td>
</tr></table>

<details>
<summary>Motion frames (each row is one hover animation frozen at 10 points)</summary>

![Frame strips](https://raw.githubusercontent.com/Tamer-Mansour/tlp-icons/main/docs/frame-strips.png)
</details>

- **<!--s:icons-->7,677<!--/s--> icons**: 24×24 grid, 2px stroke, round caps, `currentColor`. One consistent style.
- **100% animated**: <!--s:handmade-->1,496<!--/s--> hand-made choreographies, plus a motion engine that reads each icon's geometry.
- **Deep fields**: we draw our own icons where the free sets stop. Legal went from 18 to <!--s:cat.legal-->1,177<!--/s--> first; the
  [roadmap](https://github.com/Tamer-Mansour/tlp-icons/blob/main/ROADMAP.md) takes it to 1,180 and the whole library to 26,000.
- **Brand logos**: <!--s:brands-->376<!--/s--> brands in the same outline style, animated (trademarks of their owners, see `NOTICE.md`).
- **Tiny runtime**: one custom element, `<tlp-icon>`. Works in plain HTML, React, Angular, Vue, Svelte...
- **Lazy**: icons load per category, so a page that uses 10 icons doesn't download all <!--s:icons-->7,677<!--/s-->.
- **Polite motion**: plays once to the end, never animates a whole card at once, respects `prefers-reduced-motion`.
- **Works offline**: one classic script with every icon (in `tlp-icons-data`) runs from `file://`, and the build never needs the network.

## Install

```bash
npm install tlp-icons
```

Or with no build step, from a CDN:

```html
<script type="module" src="https://unpkg.com/tlp-icons/dist/tlp-icon.js"></script>
<tlp-icon name="bell"></tlp-icon>
```

Offline / no modules (for example opened from `file://`): one classic script with every icon inside (about 2.3 MB,
390 KB gzip). Since 0.2.0 it ships in the [`tlp-icons-data`](packages/tlp-icons-data) package:

```html
<script src="node_modules/tlp-icons-data/tlp-icons.all.js"></script>
<!-- or https://cdn.jsdelivr.net/npm/tlp-icons-data/tlp-icons.all.js -->
<tlp-icon name="bell"></tlp-icon>
```

## Usage

```html
<tlp-icon name="bell"></tlp-icon>
<tlp-icon name="settings" size="32" stroke="1.5"></tlp-icon>
<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>
<tlp-icon name="heart" trigger="click" duotone></tlp-icon>
<tlp-icon name="arrow-right" flip="rtl"></tlp-icon>
```

| Attribute | Values | Default |
| --- | --- | --- |
| `name` | any icon name (or a Lucide alias) | |
| `size` | number (px) or any CSS length | `24` (or `--tlp-size`) |
| `stroke` | stroke width | `2` (or `--tlp-stroke`) |
| `trigger` | `hover`, `hold`, `loop`, `click`, `none` | `hover` |
| `duotone` | boolean, adds a soft tinted body fill | off |
| `flip` | `rtl` (mirror only in right-to-left pages), `x` (always mirror) | off |
| `animated` | `false` makes the icon static (never animates) | animated |

`trigger="hold"` plays the animation to its peak on hover and stays there (the trash lid stays up, the bell stays
tilted); when the mouse leaves it plays back to rest. Page-wide defaults:

```js
import { config } from 'tlp-icons/element';
config.trigger = 'hold';   // every icon without a trigger attribute
config.animated = false;   // every icon static
```

The icon takes its color from `color`, like text. Theme everything with CSS variables:

```css
tlp-icon { --tlp-size: 20px; --tlp-stroke: 1.75; }
.card { --tlp-duo: .2; } /* duotone strength */
```

Play it from code: `document.querySelector('tlp-icon').play()`.

**Hover rule.** Hovering an icon animates it. Hovering anything else walks up to the nearest element that holds
exactly one icon (a button, a menu item) and animates that icon. If it reaches an element with several icons first
(a card, a menu, a table row), nothing animates. So hovering a button animates its icon, while a big card never
lights up all its icons at once.

## Framework recipes

Copy-paste setups. Every snippet below is a real file in [`test/recipes/`](test/recipes) that the test suite
compiles with that framework's own compiler (TypeScript, `vue/compiler-sfc`, `svelte/compiler`,
`@astrojs/compiler`), so they stay correct.

`import 'tlp-icons/element'` is safe during server rendering: on the server it registers nothing and never touches
the DOM.

### React 18: the wrapper

React 18 turns boolean props into strings and can't set custom element properties, so use the tiny optional
wrapper (`react` is an optional peer dependency and is never bundled):

<!-- recipe:react18/Toolbar.tsx -->
```tsx
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
```
<!-- /recipe -->

### React 19: the tag directly

React 19 supports custom elements natively. `tlp-icons/jsx` types the tag (`name` is required, `trigger` and
`flip` are checked):

<!-- recipe:react19/Toolbar.tsx -->
```tsx
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
```
<!-- /recipe -->

### Next.js (App Router)

Put the element behind one small client component and use it from server components. Server rendering outputs the
tag; the browser upgrades it.

<!-- recipe:nextjs/app/components/Icon.tsx -->
```tsx
'use client';
// app/components/Icon.tsx - use <Icon name="bell" /> from any server or client component.
// The import is safe during server rendering (it registers the element only in the browser).
import 'tlp-icons/element';
import 'tlp-icons/jsx';

export function Icon(props: { name: string; size?: number; trigger?: 'hover' | 'loop' | 'click' | 'none'; duotone?: boolean }) {
  return <tlp-icon {...props} />;
}
```
<!-- /recipe -->

### Angular 17+ (standalone)

<!-- recipe:angular/toolbar.component.ts -->
```ts
// toolbar.component.ts (Angular 17+, standalone)
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'tlp-icons/element';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button type="button"><tlp-icon name="bell"></tlp-icon> Alerts</button>
    <tlp-icon [attr.name]="icon" trigger="loop"></tlp-icon>
  `,
})
export class ToolbarComponent {
  icon = 'loader-circle';
}
```
<!-- /recipe -->

### Vue 3 + Vite

Tell Vue that `tlp-icon` is a custom element, then use it in any template:

<!-- recipe:vue/vite.config.ts,vue/App.vue -->
`vite.config.ts`

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({ template: { compilerOptions: { isCustomElement: tag => tag === 'tlp-icon' } } }),
  ],
});
```

`App.vue`

```vue
<script setup>
import { ref } from 'vue';
import 'tlp-icons/element';

const done = ref(false);
</script>

<template>
  <button type="button" @click="done = !done">
    <tlp-icon :name="done ? 'circle-check' : 'circle'" duotone></tlp-icon>
    {{ done ? 'Done' : 'Mark done' }}
  </button>
</template>
```
<!-- /recipe -->

### SvelteKit

<!-- recipe:sveltekit/+page.svelte -->
```svelte
<script>
  import { onMount } from 'svelte';

  // load the element in the browser only (SvelteKit renders on the server first)
  onMount(() => import('tlp-icons/element'));
</script>

<button type="button">
  <tlp-icon name="bell"></tlp-icon> Alerts
</button>
<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>
```
<!-- /recipe -->

### Astro

<!-- recipe:astro/index.astro -->
```astro
---
// src/pages/index.astro
const icon = 'bell';
---
<button type="button">
  <tlp-icon name={icon}></tlp-icon> Alerts
</button>
<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>

<script>
  // Astro bundles and runs this in the browser
  import 'tlp-icons/element';
</script>
```
<!-- /recipe -->

### Raw data and SVG strings (Node / SSR)

```js
import { icons, categories, getSvg } from 'tlp-icons';

getSvg('bell');                                // static SVG markup
getSvg('bell', { size: 32, stroke: 1.5 });
getSvg('bell', { animated: true });            // SVG with the motion baked in (needs dist/tlp-icons.css)
icons.bell;                                    // { svg, m: [[part, anim, dur, delay, origin?], ...] }
```

Importing `icons` pulls in the whole set. For pages, use `<tlp-icon>`, which loads one category chunk at a time.

**One category only:** import a category chunk directly and skip the manifest entirely:

```js
import legal from 'tlp-icons/icons/legal.js';   // { 'courthouse': { svg, m }, ... }
import { register } from 'tlp-icons/element';
register(legal);                                // <tlp-icon name="courthouse"> now renders with no lookup
```

### Full dataset: `tlp-icons-data`

Every icon's SVG, motion, category, tags and source in one JSON file (3.4 MB) ships as a separate package, so
`npm install tlp-icons` stays small:

```bash
npm install tlp-icons-data
```

```js
import data from 'tlp-icons-data' with { type: 'json' };   // bundlers: import data from 'tlp-icons-data'
data.icons.bell;        // { category, source, tags, svg, m }
```

It replaces the old `tlp-icons/data` export (removed in 0.2.0). Typed (`TlpIconsData`).

## Bundle size

Measured on every build (minified, gzip level 9) and written to `dist/size-report.json`. The build fails if the
element core goes over 8 KB gzip or the manifest over 15 KB gzip.

<!-- sizes:start -->
| What | Minified | Gzip |
| --- | ---: | ---: |
| element core (tlp-icon + core + element) | 22.5 KB | **6.6 KB** |
| manifest | 23.3 KB | **12.0 KB** |
| smallest category chunk (science.js) | 11.3 KB | **3.4 KB** |
| largest category chunk (legal.js) | 388.0 KB | **78.2 KB** |
| all icons, offline bundle (tlp-icons.all.js) | 2608.1 KB | **457.1 KB** |
| stylesheet (tlp-icons.css) | 11.6 KB | **2.4 KB** |
<!-- sizes:end -->

What a page actually downloads: the element core, the manifest, then **one chunk per category it uses**. A page
with a few interface and arrow icons loads about <!--s:size.0.gzip-->6.6 KB<!--/s--> + <!--s:size.1.gzip-->12.0 KB<!--/s-->
plus those two chunks. Import a chunk directly (`tlp-icons/icons/<category>.js`) to skip the manifest. The
stylesheet is injected by the element; `tlp-icons/css` is there if you prefer a `<link>`.

## Website

**https://tlp-icons.netlify.app** is built with **Next.js (React)** in `web/` and runs on the **published npm
package** (`"tlp-icons": "^0.1.0"`; the icon pages load it from `cdn.jsdelivr.net/npm/tlp-icons`). Every page is
pre-rendered static HTML for search engines, and the whole site is about 45 MB:

| Page | URL |
| --- | --- |
| Home | `/` |
| Icon gallery (search, filters, size / stroke / color / duotone) | `/icons/` |
| One page per icon: preview, sizes, buttons, code for React / HTML / Angular / Vue / SVG, related icons | `/icons/<name>/` (<!--s:icons-->7,677<!--/s--> pages) |
| Categories, one page each, including Brands | `/categories/`, `/categories/<id>/` |
| Documentation with live examples and the animation library | `/docs/` |
| Roadmap with live progress | `/roadmap/` |
| `sitemap.xml`, `robots.txt`, Open Graph image | |

```bash
cd web && npm install         # installs tlp-icons from npm
npm run dev                    # http://localhost:3000
npm run build                  # static site in web/out (about 45 MB, 6,900 files)
node scripts/serve.mjs         # serve web/out on http://localhost:4321
```

Netlify runs the same steps (see `netlify.toml`) and publishes `web/out` on every push to `main`.
After publishing a new tlp-icons version to npm, run `npm install tlp-icons@latest` in `web/` and redeploy.
For a manual deploy, drag the `web/out` folder onto the site's **Deploys** tab in Netlify.

**Offline use:** `tlp-icons-data/tlp-icons.all.js` is a single classic script with every icon; it works from `file://`
with no server and no internet.

## How it works

```
npm run sync    online:  latest Lucide + Tabler -> normalised snapshot in upstream/ -> build
npm run build   offline: upstream/ + config/ + overrides/ + originals/ -> dist/ (library)
npm test        offline: node:test suite (data, motion, keyframes, build idempotency)
npm run test:browser   optional Playwright tests + frame strips (npm run setup:browser once)
```

- `config/sources.json`: upstream versions (written by sync). Brand logos are on (`includeBrands`).
- `config/categories.json`: the taxonomy, plus explicit mapping tables for every upstream category, name patterns
  and the featured order.
- `config/rules.json`: keyword → motion recipe. Data, not code.
- `overrides/<name>.json`: hand choreographies. These always win over the engine.
- `originals/<name>.json`: **tlp originals**, icons we draw ourselves (with their category, tags and motion).
- `config/roadmap.json`: per-category goals and planned icon lists → `ROADMAP.md` (`node scripts/roadmap.mjs`)
  and the `/roadmap/` page.
- `scripts/adapters/`: one adapter per icon source (`latest`, `fetch`, `load`). Add a set by adding an adapter.
- `scripts/engine/`: SVG parsing, geometry, the motion engine and serialisation.
- `src/runtime/`: `core.js` (registry, baking, run engine, hover rule), `element.js` (`<tlp-icon>`) and
  `tlp-icons.css` (the <!--s:animations-->66<!--/s--> `tlp-` keyframes).

**Motion engine.** Every icon is split into atoms (one per element or sub-path) and measured. Then:

1. **Hand override**, if there is one.
2. **Mechanics detectors.** Clocks: find the face and split the hands at its centre, then sweep the minute hand
   and advance the hour hand (it keeps its position between hovers). Gears spin on their axle, and several gears
   turn opposite ways. Arrows: find each arrow head and its shaft, then move them the way they point.
3. **Composites**: `file-plus`, `user-cog` and `circle-check` animate as base + badge, or container + glyph.
   `-off` icons draw their slash last.
4. **Keyword rules** from `config/rules.json`: bells swing, trash lids lift, locks open on their hinge, eyes
   blink, charts grow, rain falls, vehicles drive...
5. **Fallback**: a duotone body fills in, the outline draws, details follow, then a soft finishing gesture.
   The gesture varies so neighbouring icons don't all look the same.

Every motion is small and springy and ends exactly at rest. The default `speed` is 0.6, which averages about
0.9 s per icon (1.56 s max). Change it with `import { config } from 'tlp-icons/element'; config.speed = 0.8`.

## Contributing

- New icon: add `originals/<name>.json` (24×24, 2px stroke, round caps, parts `p1`..`p4`, `motion` steps).
  Pick one from the planned lists in [ROADMAP.md](https://github.com/Tamer-Mansour/tlp-icons/blob/main/ROADMAP.md). Check it with
  `node scripts/sheet.mjs review <name>` and `node scripts/strips.mjs review <name>` (images in `test/browser/shots/`).
- Better motion for one icon: add `overrides/<name>.json` with the SVG retagged into parts (`class="p1"`...)
  and its `motion` steps. See any existing override.
- Better motion for many icons: add or adjust a rule in `config/rules.json`.
- Wrong category: add a name pattern or an explicit entry in `config/categories.json`.
- Run `npm run build && npm test` before opening a PR.

See [CONTRIBUTING.md](https://github.com/Tamer-Mansour/tlp-icons/blob/main/CONTRIBUTING.md) for the full workflow
and the release process, and [CHANGELOG.md](https://github.com/Tamer-Mansour/tlp-icons/blob/main/CHANGELOG.md) for
what changed in each version.

## License

MIT © tlp-icons contributors. Icon geometry from [Lucide](https://lucide.dev) (ISC) and
[Tabler Icons](https://tabler.io/icons) (MIT), plus tlp originals (MIT). See [NOTICE.md](https://github.com/Tamer-Mansour/tlp-icons/blob/main/NOTICE.md) and `licenses/`.

### Trademarks

The <!--s:brands-->376<!--/s--> brand icons (the Brands category, names starting with `brand-`) are provided for
referential, nominative use only: to identify a product or service, for example a "Sign in with GitHub" button or a
list of supported platforms. The logos remain the property of their respective owners, and their inclusion does not
imply any affiliation with or endorsement by those owners. Follow each owner's brand guidelines when you use them.
