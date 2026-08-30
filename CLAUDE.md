# @hoobi/design

React component library and design tokens for Hoobi apps. Dark-only Ayu Mirage, Noto Sans for text,
Dank Mono for code and headings. Published to the ADO Artifacts `Hoobi` feed and consumed by mendarr
(and whatever comes next).

Zero runtime dependencies. Peer deps only: react >=19, react-dom >=19, tailwindcss >=4.3.

## Layout

```
styles.css                       # tokens (@theme static), @font-face, base layer, utilities
fonts/                           # Noto Sans latin variable + Dank Mono (woff2)
src/*.tsx                        # one component per file, re-exported from src/index.ts
operations/pipelines/publish.yaml
```

`tsc` is the whole build. No Vite lib mode, no tsup, no Storybook, no demo app: preview by
`npm link`ing into a consumer's dev server.

## Consuming

```jsonc
// consumer package.json
"@hoobi/design": "0.1.0"
```

```css
/* consumer styles.css - one line, the library imports Tailwind itself */
@import '@hoobi/design/styles.css';
```

The library's `@source "./dist"` makes the consumer's Tailwind scan the compiled components, so the
utility classes the components use get generated. Fonts are referenced with relative `url()` so
Vite hashes them and respects `base`.

Consumers need the scoped registry in their own `.npmrc`:

```
@hoobi:registry=https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/npm/registry/
always-auth=true
save-exact=true
```

## Components

Button, Badge (tone + optional dot, covers status dots), Card, Modal, Tabs (controlled), Section,
Progress, Spinner, Alert, Input, Select, plus the `cx` helper.

Deliberately absent: Table, Toggle (use a native checkbox), Toast, Skeleton, TerminalPrompt.

**Components are only added when a consumer actually needs one.** No speculative components, no
props added "for later". A consumer wanting Table is the trigger to write Table.

## Design rules

- Dark only. `color-scheme: dark`, no light-mode variants, no `dark:` prefixes.
- Everything comes from a token in `styles.css`. No literal hex in component files.
- Semantic colours (`--color-success/warn/danger/info`) are literal hex on purpose: Tailwind's
  opacity modifiers (`bg-warn/10`) cannot decompose a nested `var()`.
- Mono for headings at weight 400. Root font-size 18px, 16px under 40rem.
- **Mobile first, always.** Every component has to survive a 360px viewport: `min-w-0` on flex
  children, wrapping headers, horizontally scrollable tab strips, `dvh`-capped scrollable modals,
  44px touch targets under `pointer: coarse`, `env(safe-area-inset-*)` where content reaches the
  bottom edge.
- Modal is a native `<dialog>` with `showModal()`: Escape, focus trap and inert backdrop come free.
  Backdrop clicks work via `e.target === dialogRef.current`, which requires `p-0` on the dialog.
- Respect `prefers-reduced-motion` (handled globally in the base layer).

## Code style

Strict TS, ESM, `.js` extensions on relative imports (NodeNext). Props interfaces exported and named
`<Component>Props`. Self-documenting: no comment noise, comments only where the reason isn't in the
code.

## Build and verify

```bash
npm ci
npm run typecheck
npm run build
npm pack --dry-run     # must list dist/, styles.css, fonts/ and nothing else
```

Sanity-check token to utility generation after touching `styles.css`:

```bash
npx -y @tailwindcss/cli@4.3.3 -i styles.css -o /tmp/out.css
```

## Publishing

```bash
npm version patch      # or minor/major
git push --follow-tags
```

The `v*` tag fires `operations/pipelines/publish.yaml` (pipeline `hoobi-design`, definition 23, Home
Lab pool): npmAuthenticate -> npm ci -> typecheck -> build -> guard that the tag matches
`package.json` version -> publish, skipped when that version is already on the feed.

ADO feed versions are immutable: a wrong publish burns the version number permanently, which is what
the tag guard exists to prevent. The build step is explicit rather than leaning on `prepublishOnly`,
because `ignore-scripts=true` in a user `.npmrc` silently skips lifecycle scripts and would publish
a stale `dist`.

The pipeline runs as **Project Collection Build Service (Hoobi)** (collection-scoped job auth), not
the project build service, so that is the identity that needs Contributor on the feed. Granting only
`Hoobi Build Service (Hoobi)` yields a 403 "lacks ReadPackages" at publish time.

## Workflow

Work directly on `main` and push directly to `main`. Standing permission, no worktrees, no PRs, no
feature branches for this repo. Test directly: build it, link it into the consumer, look at it.

Commits use conventional-commit + gitmoji. Never add AI-attribution trailers or `Co-Authored-By`
lines.

## Known noise

npm 11 warns `Unknown project config "always-auth"` on every command. `always-auth` is kept because
Azure Artifacts' own docs and `npmAuthenticate@0` still expect it. Harmless.
