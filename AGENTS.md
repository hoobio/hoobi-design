# @hoobi/design

## Design identity (canonical)

> hoobi-design is a **DARK-MODE-PREFERENCE** library: **Fluent Design 2**
> (https://fluent2.microsoft.design - principles, iconography, layout, motion, as WinUI 3 ships it)
> is the basis for everything, with **Ayu Mirage** as the colour scheme and the library's own
> YouTube-sized type scale on top. **Minimalism heavy.**

Every token and component decision resolves against that statement. If a change makes the library
less Fluent, less Ayu, or less minimal, it does not land. When a question has no house answer,
Fluent 2's answer is the default: icons are Fluent System Icons - consumers install
`@fluentui/react-icons` (20px/Regular variants) and pass them as ReactNodes, the library itself
stays zero-dependency; one-off glyphs drawn by hand follow the 20px grid with 1.5px strokes. Motion
on the Fluent easing tokens (`--ease-decelerate` entering, `--ease-accelerate` leaving,
`--ease-standard` in place; 150/250/300ms), layout on the 4px grid with 48px chrome heights.

React component library and design tokens for Hoobi apps. Noto Sans for text, Dank Mono for code.
Published to the ADO Artifacts `Hoobi` feed and consumed by mendarr (and whatever comes next).

Zero runtime dependencies. Peer deps only: react >=19, react-dom >=19, tailwindcss >=4.3.

## Layout

```
styles.css                       # tokens (@theme static), @font-face, base layer, utilities
fonts/                           # Noto Sans latin variable + Dank Mono (woff2)
src/*.tsx                        # one component per file, re-exported from src/index.ts
catalog/                         # hand-rolled Vite reference page (see below)
operations/pipelines/publish.yaml
```

`tsc` is the whole build for the library itself. No Vite lib mode, no tsup, no Storybook.

## Consuming

```jsonc
// consumer package.json
"@hoobi/design": "0.2.1"
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

Button, ConfirmButton (arm-then-confirm, built on Button), Menu (anchored flyout; `Menu.Item` /
`Menu.Label` / `Menu.Divider`), Badge (tone + optional dot + tooltip, covers status dots), Card
(optional scoped mirage), CodeBlock (bring-your-own-engine: consumers install highlight.js and pass
`html`; the stylesheet maps standard hljs token classes onto the theme tokens, so any grammar lands
Ayu Mirage), Modal, Tabs (controlled), Breadcrumbs, Timeline (`Timeline.Item`), DescriptionList,
Section, Shell (the one page chrome; `bar={false}` for a full-height pane, and `Shell.MenuItem` /
`MenuLabel` / `MenuDivider` are Menu's rows for the user flyout), Progress, Spinner, Alert, Input,
Select, Checkbox, Tooltip (`[data-tip]` in CSS, placed fixed off the anchor by `tipAnchor` so no
scrolling or clipping ancestor can cut it off), plus `cx`, `mirageImage` and `markFavicon`.

`Card` takes `padded={false}` for a sliced card: the body runs flush to the edges so content that
bleeds its own hairlines (DescriptionList, a full-width list) can actually reach them. `Shell`
injects a `markFavicon` tab icon - the InitialMark's hue and initial - when the document declares
no icon of its own.

Deliberately absent: Table, Toast, Skeleton. Toggle came off that list rather than onto this one:
Checkbox is the native input given the house look, which is what the absence already recommended.

**Components are only added when a consumer actually needs one.** No speculative components, no
props added "for later". A consumer wanting Table is the trigger to write Table.

## Design rules

- Dark only. `color-scheme: dark`, no light-mode variants, no `dark:` prefixes.
- Everything comes from a token in `styles.css`. No literal hex in component files.
- Semantic colours (`--color-success/warn/danger/info`) are literal hex on purpose: Tailwind's
  opacity modifiers (`bg-warn/10`) cannot decompose a nested `var()`.
- Root font-size 18px, 16px under 40rem. Noto Sans everywhere; Dank Mono only for code.

- **Mobile first, always.** Every component has to survive a 360px viewport: `min-w-0` on flex
  children, wrapping headers, horizontally scrollable tab strips, `dvh`-capped scrollable modals,
  44px touch targets under `pointer: coarse`, `env(safe-area-inset-*)` where content reaches the
  bottom edge.
- Modal is a native `<dialog>` with `showModal()`: Escape, focus trap and inert backdrop come free.
  Backdrop clicks work via `e.target === dialogRef.current`, which requires `p-0` on the dialog.
- Respect `prefers-reduced-motion` (handled globally in the base layer).

### WinUI 3 conventions this library follows

| Convention      | How it is encoded                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corner radius   | `--radius-control`/`--radius-chip` **4px** (controls), `--radius-panel` **8px** (surfaces, overlays)                                                                                                                                                       |
| Type ramp       | `text-caption` 14 / `text-body` 16 / `text-body-strong` 16@500 / `text-body-large` 18 / `text-subtitle` 20@600 / `text-title` 28@600, expressed in rem against the 18px root. Reading tier sized like YouTube's grid (title 16/22, metadata 14/20); caption is de-emphasised by colour, never by dropping below 14px |
| Control density | 32px standard (`h-8`) for Button md, Input, Select, Tabs; 28px (`h-7`) for Button sm                                                                                                                                                                       |
| Spacing         | `--spacing: 4px` - **px, not rem.** WinUI works in device-independent pixels, so `p-4` is a real 16px at any root size. Text stays rem so it still tracks user zoom.                                                                                       |
| Depth           | Fills, not strokes, never shadows. Surfaces are told apart by background alone (`bg` / `surface` / `surface-raised` / `chip`); cards, pills and alerts carry no border. Segmented cards are **sliced**: a 1px hairline of page background between full-bleed sections (`gap-px` in a clipped `rounded-panel`, or `border-t border-bg`), the earmark card treatment (its section divider is literally `Height="1"`). A stateful tone tints the whole surface (`bg-danger/15`), never a border. Borders remain only on interactive controls (secondary/danger Button, Input, Select) and the Tabs underline. The only overlay scrim is the Modal backdrop. |
| Accent          | Restrained. `--color-accent` is for the one primary action, the Tabs selection indicator, Progress fill, Spinner arc and the focus ring. Everything else is neutral: secondary and ghost buttons hover on `bg-surface`/`bg-surface-raised`, not on accent. |
| Focus           | One language everywhere: the global `:focus-visible` 2px outer ring at 2px offset. Components must **not** set `focus:outline-none` or re-style their own focus border.                                                                                    |
| Links           | Colour shift on hover (`accent-blue` -> `accent-cyan`), **never an underline** - WinUI hyperlinks shift shade. A button-shaped link (nav item, sidebar entry) highlights its own surface on hover (`hover:bg-surface`), not its text.                       |

`--spacing: 4px` means every Tailwind spacing utility is `n * 4px`. Reach for the WinUI grid values
(4 / 8 / 12 / 16 / 24 / 32) rather than odd numbers.

Minimalism: a component gets no decoration it does not need. No gradients, no shadows, no
double-signalling a state that the border or the ring already carries.

## Code style

Strict TS, ESM, `.js` extensions on relative imports (NodeNext). Props interfaces exported and named
`<Component>Props`. Self-documenting: no comment noise, comments only where the reason isn't in the
code.

## Changes land here, not in consumers

**Never mutate or restyle a library component inside a consuming service.** A consumer that needs a
component to look or behave differently is the trigger to change it in hoobi-design and repin - a
`className` hack or a hand-rolled copy in the consumer forks the design system silently. Library
changes should be **backwards compatible, ideally additive**: new props default to the old
behaviour, tokens are added rather than repurposed, and anything breaking is called out in the
commit and lands together with the consumer updates.

## Build and verify

```bash
npm ci
npm run typecheck
npm run build
npm pack --dry-run     # must list dist/, styles.css, fonts/ and nothing else
```

**Validate visually before pushing.** Every modified component (and any page its change touches)
gets looked at in the catalog dev server with the browser - not reasoned about, looked at:

```bash
npm run build                  # catalog consumes ../ via file:, so library dist first
cd catalog && npm run dev      # Vite on :5173
```

Open each changed page, check spacing/alignment/tones at desktop width and at 360px, and only then
commit. A component that was never rendered is not verified.

Sanity-check token to utility generation after touching `styles.css`:

```bash
npx -y @tailwindcss/cli@4.3.3 -i styles.css -o ./.tw-check.css   # gitignored
```

## Catalog

`catalog/` is a hand-rolled Vite + React reference page: sidebar nav (hash routing), a Foundations
group (Colour, Typography, Spacing & Radius) and one page per component with a description, import
line, prop table, and a variant/size/state matrix where every demo carries its copyable JSX.

Deliberately **not** Storybook. Plain anchors, one flat `pages.tsx`, no addons, no MDX, no
doc-extraction pipeline. Prop tables are hand-written.

```bash
npm run build            # the library first: catalog consumes ../ via file:
cd catalog && npm install && npm run dev
npm run build            # -> catalog/dist/index.html, one self-contained file, fonts inlined
```

`vite-plugin-singlefile` plus `assetsInlineLimit` inlines the JS, the CSS and the four woff2 fonts,
so `catalog/dist/index.html` opens with zero external requests and can be published as-is.

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
