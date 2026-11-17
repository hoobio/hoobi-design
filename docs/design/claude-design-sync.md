# Claude Design System sync

## Claude Design System sync

The library is also a Claude **Design System** artifact, "Hoobi Design"
(https://claude.ai/artifact/N5rDQuXjYLMJ7VQ6Q8wxHB), so Claude generates Hoobi-shaped UI from the
real components, rules and tokens. It moved there from the standalone claude.ai/design project
because claude.ai/design closes on 14 December 2026. `pnpm -C catalog build:ds` (library `dist`
first) runs `catalog/ds/build.mjs`, which writes the artifact's files to
`catalog/design-system/project/` (gitignored): `tokens.json` and `tokens.css` from the `@theme`
block (colours resolved through `tokens/build.mjs`), the fonts, a brand book from `catalog/ds/brand.md`, the library as one IIFE
`components/bundle.js` (`window.HoobiDesign`) with the catalog's compiled stylesheet, and a card per
component whose live preview mounts the catalog page's own `<Demo>` examples, or the overrides in
`catalog/ds/examples.mjs`. It fails on a token without a note in `catalog/ds/usage.json` and on any
file that breaks the artifact format.

Sync runs at release time, not per commit, so the system shows what consumers can `pnpm add`. After
the release-please PR merges and the publish is green, run `/design-sync` (`.claude/skills/design-sync/`): it
builds the files and publishes them to the artifact with the Artifact tool, the index
`design-system.json` last, keeping `"editing": "code"` so the page stays read-only.
`catalog/src/pages.tsx` is the one page registry: the catalog nav and the generator both read it,
and `check.mjs` enforces that every library export has a page.
