# Catalog

## Catalog

`catalog/` is a hand-rolled Vite + React reference page: sidebar nav (hash routing), a Foundations
group (Colour, Typography, Spacing & Radius) and one page per component with a description, import
line, prop table, and a variant/size/state matrix where every demo includes its copyable JSX.

Deliberately **not** Storybook. Plain anchors, one flat `pages.tsx`, no addons, no MDX, no
doc-extraction pipeline. Prop tables are hand-written.

```bash
pnpm run build            # the library first: catalog consumes ../react via workspace:*
pnpm -C catalog dev
pnpm -C catalog build     # -> catalog/dist/index.html, one self-contained file, fonts inlined
```

`vite-plugin-singlefile` plus `assetsInlineLimit` inlines the JS, the CSS, the woff2 fonts and the
gallery PNGs, so `catalog/dist/index.html` opens with zero external requests and can be published
as-is.

The site is GitHub Pages at `design.hoobi.io` (`catalog/public/CNAME`), deployed by the release
workflow on each release tag only. Pages has no rewrite rule, so the deploy copies `index.html` to
`404.html` and a real path such as `/timeline` still loads the app. The `.NET` page
(`catalog/src/dotnet.tsx`) shows four gallery PNGs from `catalog/src/gallery/`; refresh them from
`HOOBI_GALLERY_PNG_DIR` when the native look changes.

The mirage demo artwork `catalog/src/mirage-art.png` is drawn by `node catalog/mirage-art.mjs`, so no third-party image ships in the repo.
