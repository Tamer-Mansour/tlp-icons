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

Versions match `tlp-icons`. MIT license; icon geometry from Lucide (ISC) and Tabler Icons (MIT). Brand logos are
trademarks of their respective owners. See `NOTICE.md` and `licenses/`.
