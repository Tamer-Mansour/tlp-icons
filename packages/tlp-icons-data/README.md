# tlp-icons-data

The complete [tlp-icons](https://www.npmjs.com/package/tlp-icons) dataset as one JSON file: for every icon its
inner SVG markup (24×24, `stroke="currentColor"`), its motion steps, category, tags and source, plus the category
list, aliases and source licenses.

Use it for build tools, design tools, search indexes or custom renderers. For icons in web pages, use
[`tlp-icons`](https://www.npmjs.com/package/tlp-icons) (`<tlp-icon name="bell">`): it loads one category at a time.

```bash
npm install tlp-icons-data
```

```js
// Node / modern ESM
import data from 'tlp-icons-data' with { type: 'json' };
// bundlers (Vite, webpack, Next.js)
import data from 'tlp-icons-data';

data.icons.bell;        // { category, source, tags, svg, m, r? }
data.categories;        // [{ id, title, icon, color, count }]
data.aliases['trash-2'] // 'trash'
```

Types are included (`TlpIconsData`, `IconRecord`, `MotionStep`, …).

## Offline single-file bundle

`tlp-icons.all.js` is a classic `<script>` with the runtime and every icon inside (about 2.3 MB, 390 KB gzip). It
works from `file://` with no server, no module loader and no network:

```html
<script src="node_modules/tlp-icons-data/tlp-icons.all.js"></script>
<tlp-icon name="bell"></tlp-icon>
```

From a CDN: `https://cdn.jsdelivr.net/npm/tlp-icons-data/tlp-icons.all.js`.

Versions match `tlp-icons`. MIT license; icon geometry from Lucide (ISC) and Tabler Icons (MIT). Brand logos are
trademarks of their respective owners. See `NOTICE.md` and `licenses/`.
