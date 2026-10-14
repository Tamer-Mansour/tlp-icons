# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/)
(while below 1.0, minor versions may contain breaking changes; they are listed under **Changed** / **Removed**).

## [0.5.1] - 2026-10-14

### Docs

- README: feature list for the reached roadmap and the bucket loader (about 13 KB gzip for one icon), the new
  `/licenses/` page, website size (164 MB, 27,000 files) and version.
- Website on tlp-icons 0.5.0: 26,278 icon pages, all 100 animations in the docs, licenses page.

## [0.5.0] - 2026-10-13

### Added

- **The roadmap goal: 11,238 -> 26,278 icons.** 15,040 new tlp originals, drawn from scratch for this project
  and checked by eye on review sheets (1,965 redrawn in review). Every category is now at its roadmap target,
  including Science & Education (35 -> 1,000), People (79 -> 1,000), Buildings (110 -> 800), Vehicles, Communication,
  Development, Nature, Food, Sport, Home, Tools and the rest.
- **34 new animations: 66 -> 100**, every one used by icons. Entrances `slideInBack`, `unfold`, `stampIn`, `bounceIn`,
  `whooshIn`, `elasticIn`, `typeIn`, `drawReverse`, `slideDown`, `emerge`; gestures `jump`, `scan`, `scanX`, `glow`,
  `dim`, `inhale`, `squeeze`, `pump`, `shuttle`, `dash`, `recoil`, `throb`, `refill`, `equalize`, `blip`, `dig`,
  `stir`, `stamp`, `pour`, `magnify`; turns `spinFast`, `windUp`, `tumble`, `halfBack`. 585 Lucide/Tabler icons
  that only had the generic fallback motion now use them.
- `addKeyframes()` runtime export; `check-originals.mjs --no-images` and `--all`.
- Website: `/licenses/` page with every source, its icon count and the full license texts. Icon request issue template.

### Changed

- **Much lighter loading.** `<tlp-icon>` now loads icons from small hash buckets (about 56 icons, 3-6 KB gzip each):
  the bucket is computed from the name, so the element no longer downloads the manifest (30 KB gzip at this size) and
  no longer fetches a whole category (the legal chunk alone was 80 KB gzip). One icon on a page costs about
  13 KB gzip in total (element 7.1 KB, keyframes 3.2 KB, one bucket), however large the library grows.
- The `@keyframes` are no longer inlined in the element core; they load once from `anims.js` with the first icon (the
  classic bundles still include them). The element core went from 7.6 to 7.1 KB gzip while the library went from
  66 to 100 animations.
- Brands stay at the Tabler set (376): no further company logos are added, because of trademark risk. Their 624
  roadmap slots moved to other categories, so the 26,180 goal stayed the same. It is now reached; the targets
  were raised to today's counts (26,278).
- NOTICE: per-source table, Feather credit, explicit statement that nothing from Font Awesome, Material or other
  sets is included, a takedown contact, and a note that some brand guidelines forbid animated logos
  (`animated="false"`).
- Website icon pages declare each icon's real license (ISC for Lucide icons) in their structured data.
- Size limits: manifest 20 -> 40 KB gzip (it is no longer on the element's path); package unpacked limit 5 -> 12 MB.

### Removed

- **Breaking:** the per-category modules `tlp-icons/icons/<category>.js` moved to the data package:
  `import legal from 'tlp-icons-data/icons/legal.js'`. `dist/icons/` in `tlp-icons` now holds the internal buckets
  (no public export).

## [0.4.1] - 2026-10-12

### Docs

- README: new animated previews for `trigger="hold"`, the new animations and the new fields; refreshed website,
  category, icon-page and motion-frame images; feature list covers hover-and-hold, static icons, 66 animations and
  the five complete fields; offline bundle size is generated from the build.
- Website: homepage features and roadmap teaser for the new fields and triggers, npm link and version on every
  icon page, new social image.

## [0.4.0] - 2026-10-12

### Added

- **3,561 new tlp originals: 7,677 -> 11,238 icons.** Every priority field is at its roadmap target:
  - Health & Medical 142 -> 1,200 (clinical, dental, lab and imaging, pharmacy, anatomy, mental health and wellness,
    maternity and elderly care, emergency and public health, devices and telehealth)
  - Finance & Money 220 -> 1,100 (banking, payments and cards, investing, crypto, insurance, accounting and tax,
    personal finance and regional currencies)
  - Shopping & Commerce 126 -> 999 (retail, e-commerce, logistics and warehouses, packaging, promotions and loyalty,
    customer service and returns, point of sale and inventory)
  - Maps & Travel 253 -> 1,000 (navigation, places and landmarks, travel and hotels, transit, outdoors, map tools)
  - Legal & Government 1,177 -> 1,180
- Each icon was drawn and self-checked, then reviewed in groups (678 redrawn in review).

### Changed

- Size budgets follow the larger set: manifest limit 15 -> 20 KB gzip (about 15,000 icons), package unpacked
  size limit 3 -> 5 MB.

## [0.3.2] - 2026-10-12

### Fixed

- `trigger="hold"` released too early when the icon sits in a card or button: moving from the icon onto its
  container (still the same icon by the hover rule) no longer counts as leaving.

### Website

- Icons gallery: animation mode selector (Hover, Hold, Loop, Click, Static; also `?mode=` in the URL).
- npm link and the real package version in the header.

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

[0.4.1]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/Tamer-Mansour/tlp-icons/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Tamer-Mansour/tlp-icons/releases/tag/v0.1.0
