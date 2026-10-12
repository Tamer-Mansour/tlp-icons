# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/)
(while below 1.0, minor versions may contain breaking changes; they are listed under **Changed** / **Removed**).

## [0.3.1] - 2026-10-12

### Added

- **`trigger="hold"`**: on hover the icon plays to its peak and stays there (trash lid up, bell tilted); when the
  mouse leaves it plays back to rest. Hold points are generated from the keyframes (`HOLD` in the runtime);
  entrances jump to their end, and animations that cannot freeze nicely (blink, drip...) play once.
  Also `el.hold()` / `el.release()` and the `hold()` / `release()` runtime functions.
- **`animated="false"`** (and the `animated` property, React prop): a static icon that never animates.
- **`config.trigger`** (page default trigger) and **`config.animated = false`** (every icon static).

## [0.3.0] - 2026-10-12

### Added

- **32 new animations** (34 -> 66), every one used by icons:
  - entrances: `zoomIn`, `spiralIn`, `swingIn`, `flipIn`, `focusIn`, `bloom`, `rollIn`
  - gestures: `buzz`, `tap`, `press`, `beat`, `flicker`, `twinkle`, `sway`, `flutter`, `bob`, `drive`, `launch`,
    `tada`, `rubber`, `rattle`, `spring`, `knock`, `wave`, `pendulum`, `flipY`, `drip`, `fall`, `retrace`, `peek`
  - turns: `roll`, `twirl`; `orbit` is now used (atom, orbit, galaxy, satellite)
- **Legal field complete: 120 -> 1,177 icons** (1,057 new tlp originals: courts, contracts, police, corrections,
  litigation, roles, rights and IP, government, corporate and tax, family, property, immigration).
- Animation batches: `config/animations/*.json`, `src/runtime/anims/*.css` and `config/rules-extra/*.json` are merged
  by the build.

### Changed

- About 1,000 generated icons now use a more fitting new animation (phones buzz, hearts beat, flags flutter...).
- Manifest size test aligned with the build limit (15 KB gzip).

## [0.2.0] - 2026-10-12

### Added

- **SSR safety**: `define()` export to register the element manually (no-op on the server).
- **TypeScript types** shipped in the package:
  - `dist/tlp-icon.d.ts`: the `TlpIcon` element with typed `name`, `size`, `stroke`, `trigger`, `duotone` and `flip`, `play()`, the `tlp-ready` event, plus `config`, `run`, `register` and `define`.
  - `HTMLElementTagNameMap['tlp-icon']`, so `document.createElement('tlp-icon')` is typed.
  - `tlp-icons/jsx` types `<tlp-icon>` in JSX: the global `JSX` namespace and `React.JSX` (React 18.3+/19). It never imports `react`, so it is safe without React types.
- **`exports` with `types` first** for `.`, `./element`, `./tlp-icon.js`, `./jsx` and `./react`, plus a top-level `types` field and a `typesVersions` fallback for TypeScript < 4.7.
- **`tlp-icons/react`**: an optional React wrapper (built for React 18, also works on 16.8+/19).
  - Forwards `name`/`size`/`stroke`/`trigger`/`duotone`/`flip` as attributes (in the server HTML and synced by `useEffect`).
  - Forwards `ref` and passes `className`, `style` and `aria-*` through.
  - Imports the element in `useEffect`, so server rendering is safe.
  - `react` is an optional peer dependency and is never bundled.
- **`tlp-icons-data` package** (npm workspace, same version): the full dataset `tlp-icons.json` with `index.d.ts` types, and the offline single-file bundle `tlp-icons.all.js`.
- **`dist/stats.json`** `{ icons, categories, aliases, originals, brands, animations, handmade, byCategory }`: the single source of truth for every number in the README, the `package.json` description and the website.
- **`dist/size-report.json`** and a size table printed by every build.
- **Element**:
  - JS property reflection for all six attributes, including properties set before the element is defined. `duotone` accepts `true` / `false` / `""`.
  - `duotone` and `flip` are observed attributes.
- **Manifest**: `categoryOf(name)` export.
- **Docs**:
  - README bundle-size table generated from the build.
  - Framework recipes compiled by the test suite: React 18 (wrapper), React 19, Next.js App Router, Angular 17+ standalone, Vue 3 + Vite, SvelteKit and Astro.
  - A Trademarks section.
  - Four animated previews (`docs/media/*.gif`).
  - Badges: npm version, downloads, element size, CI and license.
- **Release hygiene**:
  - `CHANGELOG.md` and `CONTRIBUTING.md`.
  - CI workflow on push/PR (build, tests, type tests, `size-report.json` artifact).
  - A release workflow that publishes both packages with npm provenance (trusted publishing / OIDC).
  - `publishConfig` (`access: public`, `provenance: true`).
- **Tests**:
  - Node-only SSR import of `dist/tlp-icon.js`, `element.js`, `core.js`, `index.js` and `tlp-icons/element`.
  - `tsc --noEmit` type tests, with and without React types.
  - React wrapper `renderToString`.
  - Packed contents and the < 3 MB unpacked size limit.
  - Minified banners and source maps.
  - Docs in sync with the build.
  - Framework recipe compilation.
  - Browser tests for property reflection, missing icons, detached renders, `tlp-ready` bubbling, and lazy chunk loading over HTTP.
  - `scripts/smoke.mjs`: the packed tarball in fresh Vite + React 18, Vite + React 19 and Next.js 15 App Router projects (tsc, production build, server render, browser render).

### Changed

- **Smaller manifest**: `dist/manifest.js` is now a minimal perfect hash (name → category, exact for every icon), down from 29.2 KB to 11.1 KB gzip. It still costs one network round trip per category. `MANIFEST[name]` keeps working through a lookup proxy, but the names are no longer enumerable. `manifest.js` is not a public entry.
- **Minified output**: `dist/*.js`, `dist/icons/*.js` and `tlp-icons.css` are minified with esbuild, and every file keeps its license banner. Runtime files ship external source maps with sources. Pure data files (category chunks, the offline bundle) are minified without maps.
- **Package size**: `tlp-icons` is 2.5 MB unpacked, down from 8.5 MB (1.4 MB → 0.47 MB packed).
- **`tlp-ready`** bubbles, is `composed` (crosses shadow roots) and carries `detail.name`.
- **Unknown icon names** render nothing, set `data-missing` and `console.warn` once per name (silent when `NODE_ENV=production`). They never throw.
- **Detached elements**: removing an element while its category is still loading no longer renders into the detached node.
- **Website** (tlp-icons.netlify.app):
  - Uses the published package and reads the real counts from `stats.json`.
  - The gallery's first screen and the counts are in the static HTML, so they work without JavaScript.

### Removed

- **`tlp-icons/data`** subpath export and `dist/tlp-icons.json` from the `tlp-icons` package. Use `tlp-icons-data` instead.
- **`dist/tlp-icons.all.js`** from the `tlp-icons` package. It now ships as `tlp-icons-data/tlp-icons.all.js` (CDN: `https://cdn.jsdelivr.net/npm/tlp-icons-data/tlp-icons.all.js`).

### Fixed

- **Node crash**: `import 'tlp-icons/element'` threw `HTMLElement is not defined` in Node, crashing server rendering in Next.js, Nuxt, Angular Universal and SvelteKit.
- **Icons that never loaded**: tags already in the page when the ES module ran were upgraded before the lazy loader existed and never rendered. This affected `<script type="module">` / CDN usage. Icons requested before the loader is installed are now loaded when it arrives.
- **Offline bundle**: with `tlp-icons.all.js`, unknown names now resolve as missing instead of waiting forever.
- **Bundler tree-shaking**: `element.js` is marked as side-effectful, so bundlers never drop the element registration.
- **Vite builds missing icons**: production builds were missing the category chunks, because the lazy loader used a template-literal `import()` that Vite does not analyse inside `node_modules`. Icons stayed empty (404). The loader now has one static `import('./icons/<id>.js')` per category, which every bundler can split.

## [0.1.1] - 2026-10-11

### Changed

- README for npmjs.com: absolute links, new screenshots of the website.
- The website installs the published package instead of a local link.

### Fixed

- Gallery hover: the icon disappeared on the coloured hover tile (the website, not the package).

## [0.1.0] - 2026-10-11

### Added

- First release: 6,620 animated stroke icons from Lucide, Tabler and tlp originals in 35 categories (including 376 brand logos).
- The `<tlp-icon>` web component (`name`, `size`, `stroke`, `trigger`, `duotone`, `flip`) with per-category lazy loading, the hover rule and `prefers-reduced-motion` support.
- Raw data and SVG helpers (`icons`, `categories`, `getIcon`, `getSvg`, `toSvgString`).
- The offline single-file bundle and the stylesheet.

[0.3.1]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Tamer-Mansour/tlp-icons/releases/tag/v0.1.0
