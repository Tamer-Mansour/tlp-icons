# Contributing to tlp-icons

Thanks for helping. This repository holds two npm packages (npm workspaces) and the website:

| Path | What |
| --- | --- |
| `/` | `tlp-icons`: the `<tlp-icon>` element, data chunks, types, React wrapper |
| `packages/tlp-icons-data` | `tlp-icons-data`: the full JSON dataset and the offline single-file bundle |
| `web/` | the website (Next.js, static export), deployed to Netlify |

## Setup

```bash
git clone https://github.com/Tamer-Mansour/tlp-icons
cd tlp-icons
npm install            # dev tools only: esbuild, typescript, framework compilers for the recipe tests
npm run build          # upstream/ + config/ + overrides/ + originals/ -> dist/ (offline, no network)
npm test               # builds first, then unit, SSR, type, packaging, docs and recipe tests
npm run setup:browser  # once: Playwright in the cache folder
npm run test:browser   # browser tests + frame strips in test/browser/shots/
```

`npm run build` also rewrites the numbers in `README.md` and the `package.json` description from
`dist/stats.json`, the size table from `dist/size-report.json`, and the framework recipes from `test/recipes/`. Commit
those changes with your PR. The build fails if the element core goes over 8 KB gzip or the manifest over 15 KB gzip.

## Common changes

- **New icon:** add `originals/<name>.json` (24×24, 2px stroke, round caps, parts `p1`..`p4`, `motion` steps).
  Check it with `node scripts/check-originals.mjs review <name>`, which validates the icon and writes review images
  without touching `dist/`. Pick names from the planned lists in [ROADMAP.md](ROADMAP.md).
- **Better motion for one icon:** `overrides/<name>.json`.
- **Better motion for many icons:** a rule in `config/rules.json`.
- **Wrong category:** `config/categories.json`.
- **Framework recipe:** edit the file in `test/recipes/`; the README copy is regenerated and the test compiles it.
- **Upstream update:** `npm run sync` (needs network) refreshes `upstream/` and rebuilds.
- **README previews:** `node scripts/make-previews.mjs` (needs `ffmpeg` on `PATH`).

Please don't hand-edit `dist/`, generated README blocks (between `<!-- ... -->` markers) or `ROADMAP.md`
(`node scripts/roadmap.mjs`).

## Releasing

Both packages always share one version.

1. Update `CHANGELOG.md` (move items from "Unreleased" into the new version).
2. Bump both versions together and rebuild:
   ```bash
   npm version 0.3.0 --no-git-tag-version --workspaces --include-workspace-root
   npm run build && npm test
   git commit -am "release: 0.3.0" && git tag v0.3.0
   ```
3. Push the tag: `git push origin main --follow-tags`. The **Release** workflow (`.github/workflows/release.yml`):
   - checks that the tag matches both package versions,
   - builds and tests,
   - runs `npm publish --workspaces --include-workspace-root --provenance`.

### One-time setup: npm trusted publishing

On npmjs.com, for **each** package (`tlp-icons` and `tlp-icons-data`):

1. Go to **Settings → Trusted publishing → GitHub Actions**.
2. Enter repository `Tamer-Mansour/tlp-icons`, workflow `release.yml` and environment `npm`.

No npm token is stored in GitHub. Every release then carries a provenance statement linking it to the commit and
workflow run.

### Publishing from a local machine (fallback)

`publishConfig.provenance` is `true`, and provenance can only be generated in CI. From your own machine, turn it
off explicitly:

```bash
npm run build && npm test
npm publish --workspaces --include-workspace-root --provenance=false
```

## GitHub Actions status

The workflows are currently disabled in the repository settings while Actions billing is locked. Re-enable them with
`gh workflow enable ci.yml` and `gh workflow enable release.yml` (or the Actions tab). Until then, run the same
checks locally with `npm test` and `npm run test:browser`.
