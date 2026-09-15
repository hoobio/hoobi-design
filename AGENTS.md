# @hoobi/design

## Design identity (canonical)

> hoobi-design is a **DARK-MODE-PREFERENCE** library: **Fluent Design 2**
> (https://fluent2.microsoft.design - principles, iconography, layout, motion, as WinUI 3 ships it)
> is the basis for everything, with **Ayu Mirage** as the colour scheme and the library's own
> YouTube-sized type scale on top. **Minimalism heavy.**

This is the ethos applied to every token and component decision. Design choices must be consistent
with Fluent, Ayu, and minimalism. When a question has no house answer,
Fluent 2's answer is the default: icons are Fluent System Icons - consumers install
`@fluentui/react-icons` (20px/Regular variants) and pass them as ReactNodes, the library itself
stays zero-dependency; one-off glyphs drawn by hand follow the 20px grid with 1.5px strokes. Motion
on the Fluent easing tokens (`--ease-decelerate` entering, `--ease-accelerate` leaving,
`--ease-standard` in place; 150/250/300ms), layout on the 4px grid with 48px chrome heights.

React component library and design tokens for Hoobi apps. Hanken Grotesk for text, Dank Mono for code.
Published to the ADO Artifacts `Hoobi` feed and consumed by mendarr (and whatever comes next).

Zero runtime dependencies. Peer deps only: react >=19, react-dom >=19, tailwindcss >=4.3.

## Layout

```
styles.css                       # tokens (@theme static), @font-face, base layer, utilities
fonts/                           # Hanken Grotesk latin variable (+italic) + Dank Mono (woff2)
src/*.tsx                        # one component per file, re-exported from src/index.ts
catalog/                         # hand-rolled Vite reference page (see below)
operations/pipelines/publish.yaml
```

`tsc` is the whole build for the library itself. No Vite lib mode, no tsup, no Storybook.

## Consumer setup

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
`html`; the stylesheet maps standard hljs token classes onto the theme tokens, so any grammar
renders in Ayu Mirage), Modal, Tabs (controlled), Table (sortable columns, controlled sort), Breadcrumbs,
Timeline (`Timeline.Item`), DescriptionList,
Section (`panel` for a settings-shaped surface), Shell (the one page chrome; `bar={false}` for a full-height pane, a `Shell.Item` with `children` is an accordion of icon-less sub-items shown while it is active, and `Shell.MenuItem` /
`MenuLabel` / `MenuDivider` are Menu's rows for the user flyout), Progress, Spinner, Alert, Input,
Select, Checkbox, Switch (the master on/off; role="switch", where Checkbox is a value in a set),
Toast (one `Toaster` mounted at the root plus a module-level `toast()` - no context, because
the caller is usually a poll or a socket, not a component),
Notice (state news that outranks a toast: centred, mirage-backed, up until the state changes),
Rating, ChipInput (chips + an inline query + suggestions Tab takes), Stat (the Card variant for one
number), BarList (label / toned track / tabular readout, not a chart library),
Slider, Tooltip (`[data-tip]` in CSS, placed fixed off the anchor by `tipAnchor` so no
scrolling or clipping ancestor can cut it off), RichTooltip (the same idea with nodes in it: a
title and a few lines, following the pointer), Popover (an anchored panel under a trigger of the
consumer's choosing - Menu without the rows), ActionDialog, Steps (chevrons wide, a stacked
list narrow), SectionNav, UnsavedBar (`sections` or a free `message`), the list-row primitive -
SettingRow / SettingGroup / SettingList (one surface level: rows on `bg-surface`, a 1px seam of
`bg-bg` between, a group title is text and never a box; slots `leading`, `label`, `meta`,
`description`, `control`, `children`; `highlight` swaps the row's fill for the accent tint when a
link calls it out) - LogViewer (level chips with counts, substring or /regex/
search, a pinned context, Follow; the level set is the consumer's), TimeAxis (events on a shared
time window, one lane per row - a cron schedule, a set of firings - not a chart library), and the
settings field set - FieldLabel
(the one label row: the `(i)` and the right-hand slot), SecretField, DurationInput, CronInput
(with `cronRuns`, a zero-dependency five-field matcher) and CopyField - plus `cx`,
`mirageImage` and `markFavicon`.

Mirage comes in three strengths: `.mirage-layer` behind a whole app, `.mirage-scoped` as a card's
own fill (or `Card mirage="..."`), and `.mirage-edge` as a masked strip at a list row's left edge -
for rows/lists where a full-bleed mirage per row would be too busy.

Every strength tints at part opacity, so mirage assumes an **opaque page background beneath it**.
A box floating over a canvas, photo or video has none, and the content underneath reads through it:
the result looks transparent rather than filled. Mirage tuning does not fix this; the surface is
the wrong target for it. Such a surface needs its own opaque fill; mirage then goes on a child
element, if used at all.
`.mirage-scoped` also sets `position: relative` and `overflow: hidden`, which beat a consumer's
`absolute` or `overflow-y-auto` on the same element and can leave an overflowing panel silently
unscrollable - placement and scrolling belong on wrappers.

`Divider` is the house hairline as a component: 1px of page background, and it **bleeds to the
surface's edges by default** by cancelling whatever padding the container published as `--pad`
(a Card sets it), so nothing has to be told a magic inset. `padded` opts out. A consumer writing
`border-t border-bg` by hand is a Divider that has not been reached for yet.

`Card` takes `padded={false}` for a sliced card: the body runs flush to the edges so content that
bleeds its own hairlines (DescriptionList, a full-width list) can actually reach them. `Shell`
injects a `markFavicon` tab icon - the InitialMark's hue and initial - when the document declares
no icon of its own.

`Table` is a real `<table>` from `@2xl` (container query) up and a stack of row cards below, one
markup path. Columns are data (`id`, `header`, `cell`, optional `sortValue`); the sort is
**controlled** (`sort` + `onSortChange`, so the consumer keeps it in the URL) and applied by the
table itself, which lets the consumer keep its rows in stored order. Undefined sort values sink to
the bottom in either direction. `primary` names the row's title column, `rowAction` the trailing
control. Added when mendarr's release picker needed sortable columns.

Cells are vertically centred, so a one-line cell reads against the middle of a row a taller
neighbour has stretched. `valign` on a column and `rowValign` on the table are the two escapes,
`rowValign` ahead of a column where both are set, and `top` is for a cell whose content hangs from
the top of the row.

Columns also give way progressively rather than running off the right edge: a `compact` column
switches to its narrow rendering first, then the lowest `priority` columns drop one at a time
behind a "+N" menu that names them, and the stack of row cards is the last resort, reached only
when the primary column plus the must-show band (`priority >= 100`) no longer fits. A column
declaring `priority` or `compact` turns this on: those cells stop wrapping, so the columns have a
natural width to measure against the wrapper, the primary column truncates rather than letting the
table scroll, and the cards are reached by that measurement instead of the `@2xl` query. A consumer
that passes neither prop keeps exactly the behaviour it had, container query included.

Skeleton is deliberately absent. Toggle was considered and dropped: Checkbox covers the value case;
Switch covers the acting setting.

**A component is added only when a consumer needs one.** No speculative components, no props
added "for later".

**And a component is a primitive with slots, never a product concept.** A scheduled task, an
upstream connection, a wizard step are compositions of SettingRow + Badge + ActionButton in the
consumer, shown here as Recipes; ConnectionCard and TaskRow were both taken back out for wearing
mendarr's words (`Test`, `Run now`, `health`). If a consumer pattern needs something the primitives
cannot express, the fix is a slot on the primitive, not a new component named after the screen.

### API-enforced rules

- **Control state is shown on the control**, not in a paragraph beside it: a badge, a lock,
  an icon, a tone. An explanation lives on the `(i)` in `FieldLabel`'s `info`, on hover and
  keyboard focus. The line under a field is reserved for a validation
  `error` and for a live readout the value demands (CronInput's next runs). `Input.hint` is
  **@deprecated - use `info`**; no new component takes a `hint`/`helper`/`description` prop.
- **Anything destructive, irrecoverable, or with a byproduct confirms through `ActionDialog`**,
  which states the consequence before the second click. `ConfirmButton` is **@deprecated** for
  that job and stays only for trivial, reversible actions. A component that _causes_ such an
  action (SecretField's clear/regenerate/rotate) fires the callback bare and holds no arm state -
  the consumer owns the dialog, because only the consumer knows the byproduct.
- **Wording overrides are for translation, never for helper copy.** `SecretField` takes a
  `labels` object and nothing else; there is no slot for a sentence.
- **Async buttons use `ActionButton`.** A plain `Button` with an async `onClick` is not used.
  A button that starts work reports it: busy, then success or failure, with the error shown
  on its tooltip. `Button` takes `busy` for the cases the consumer already tracks.
- **Unrequested updates use `toast()`. A pressed button's result stays on the button.** A
  background outcome nobody clicked for - an auto-correction, a finished job, an arrived
  webhook - is `toast()`. The result of a press belongs on the control that was pressed,
  `ActionButton`. A toast does not repeat a result the button already shows.
- **Every tooltip is `Tooltip`.** A native `title=` on a DOM element is the browser's own box: late, unstyled, absent on touch. `check.mjs` fails the build on one in the library; consumers wrap the element in `Tooltip` (a relative time, a badge, a truncated value) instead.
- **The (i) is never a tab stop.** `InfoTip` is a `role="img"` span with `tabIndex={-1}`,
  hover-only; its words reach assistive tech through a hidden span the control names in
  `aria-describedby`, wired for you by every field in the library. Tab from one field moves
  focus to the next field, not to an explanation.

`ActionDialog` is yes-or-no; `FormDialog` is the one with fields, and its submit is gated on
the browser's own `checkValidity()`. Neither **ever closes itself** - the consumer flips
`open` once the work succeeded. `onAction`/`onSubmit` may return a promise, which the dialog
runs: busy while pending, the rejection's message in a danger line, still open.
`tone="danger"` is only for discarding something irrecoverable.

**The button names the action.** `actionLabel` and `submitLabel` are REQUIRED and say what
happens: "Rotate", "Regenerate", "Clear", "Set password", not "Confirm". The component is
named `ActionDialog`, not `ConfirmDialog`, for the same reason.

## Design rules

- **Settings are one surface level.** Rows are `bg-surface` separated by a 1px seam of `bg-bg`
  (`SettingList`), a group title is caption text, never a box, and nothing on a settings page sits
  below caption (14px): label `text-body`, description `text-caption text-text-dim`, only when the
  label cannot say it alone and never restating a value a control on the page already shows.
  Fields inside a row fill with `bg-chip` and no border (the danger border on `error` stays) and
  take `hideLabel`, because the row is the label. `bg-surface-raised` is for things that float: a
  menu, the unsaved bar, the hover on a secondary button, the "new lines" pill.
- **A free-text field has an example placeholder**, e.g. `http://sonarr:8989`,
  `*/15 * * * *`, `-1001234567890`. It is the cheapest hint available.
  Numbers show their default; a secret's placeholder is SecretField's own.
- Dark only. `color-scheme: dark`, no light-mode variants, no `dark:` prefixes.
- Everything comes from a token in `styles.css`. No literal hex in component files.
- Semantic colours (`--color-success/warn/danger/info`) are literal hex on purpose: Tailwind's
  opacity modifiers (`bg-warn/10`) cannot decompose a nested `var()`.
- Root font-size 18px, 16px under 40rem. Hanken Grotesk everywhere; Dank Mono only for a
  **machine string**: something a person copies, pastes, types exactly or compares character by
  character (a url, a key, a path, a release name, a cron expression, JSON, code). A name, a
  label, a heading, a timestamp, a status word or a count is sans - digits that must line up get
  `tabular-nums`, never a typeface change. In the library `font-mono` lives only in CodeBlock,
  CopyField, SecretField, CronInput's expression, Banner's `code`, and the `mono` opt-in on Input;
  `check.mjs` fails it anywhere else. ConnectionRow's url and LogViewer's lines are `<code>` /
  `.mono`, which the base layer styles. Consumers reach mono through `<code>` or those props, never
  through the class.
  The sans is the latin subset copied out of `@fontsource-variable/hanken-grotesk` (a devDependency,
  so the provenance and the upgrade path are in the lockfile), never fetched at runtime.

- **Mobile first, always.** Every component has to survive a 360px viewport: `min-w-0` on flex
  children, wrapping headers, horizontally scrollable tab strips, `dvh`-capped scrollable modals,
  44px touch targets under `pointer: coarse`, `env(safe-area-inset-*)` where content reaches the
  bottom edge. The base layer's `button`/`select`/`input`/`[role="tab"]` rule covers native
  controls; a row built on a non-native element (`Shell.Item`'s anchor) needs its own
  `pointer-coarse:min-h-11`.
- Modal is a native `<dialog>` with `showModal()`: Escape, focus trap and inert backdrop come free.
  Backdrop clicks work via `e.target === dialogRef.current`, which requires `p-0` on the dialog.
- Respect `prefers-reduced-motion` (handled globally in the base layer).
- **Every state a person can reach is reachable by URL.** A page is a real path (`/timeline`,
  never `#timeline`); a filter, a tab, a knob, an expanded fold or step lives in the query string;
  and anything expandable has a static, unique `id`, so the state has an address a link can
  name. Components stay controlled and dependency-free (`open` + `onOpenChange` + `id`) and the
  consumer's router owns the URL. Transient controls are excepted: an
  armed destructive button or a flyout that closes on the next click is not view state.

### WinUI 3 conventions

| Convention      | How it is encoded                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Corner radius   | `--radius-control`/`--radius-chip` **4px** (controls), `--radius-panel` **8px** (surfaces, overlays)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Type ramp       | `text-caption` 14 / `text-body` 16 / `text-body-strong` 16@500 / `text-body-large` 18 / `text-subtitle` 20@600 / `text-title` 28@600, expressed in rem against the 18px root. Reading tier sized like YouTube's grid (title 16/22, metadata 14/20); caption is de-emphasised by colour, never by dropping below 14px                                                                                                                                                                                                                                                                                                                                     |
| Control density | 32px standard (`h-8`) for Button md, Input, Select, Tabs; 28px (`h-7`) for Button sm                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Spacing         | `--spacing: 4px` - **px, not rem.** WinUI works in device-independent pixels, so `p-4` is a real 16px at any root size. Text stays rem so it still tracks user zoom.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Depth           | Fills, not strokes, never shadows. Surfaces are told apart by background alone (`bg` / `surface` / `surface-raised` / `chip`); cards, pills and alerts carry no border. Segmented cards are **sliced**: a 1px hairline of page background between full-bleed sections (`gap-px` in a clipped `rounded-panel`, or `border-t border-bg`), the earmark card treatment (its section divider is literally `Height="1"`). A stateful tone tints the whole surface (`bg-danger/15`), never a border. Borders remain only on interactive controls (secondary/danger Button, Input, Select) and the Tabs underline. The only overlay scrim is the Modal backdrop. |
| Accent          | Restrained. `--color-accent` is for the one primary action, the Tabs selection indicator, Progress fill, Spinner arc and the focus ring. Everything else is neutral: secondary and ghost buttons hover on `bg-surface`/`bg-surface-raised`, not on accent.                                                                                                                                                                                                                                                                                                                                                                                               |
| Focus           | One language everywhere: the global `:focus-visible` 2px outer ring at 2px offset. Components must **not** set `focus:outline-none` or re-style their own focus border.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Links           | Colour shift on hover (`accent-blue` -> `accent-cyan`), **never an underline** - WinUI hyperlinks shift shade. A button-shaped link (nav item, sidebar entry) highlights its own surface on hover (`hover:bg-surface`), not its text.                                                                                                                                                                                                                                                                                                                                                                                                                    |

`--spacing: 4px` means every Tailwind spacing utility is `n * 4px`. Reach for the WinUI grid values
(4 / 8 / 12 / 16 / 24 / 32) rather than odd numbers.

Minimalism: a component gets no decoration it does not need. No gradients, no shadows, no
double-signalling a state that the border or the ring already shows.

- A stateful tone tints the **whole surface** as a solid `/15` fill (`bg-warn/15`) - never a
  gradient fade, never a border.
- Tone semantics: `warn` (yellow) = paused, a person must act; `success` (green) = done, the fix
  landed; `danger` = failure; `info` = in progress / informational.

## Code style

Strict TS, ESM, `.js` extensions on relative imports (NodeNext). Props interfaces exported and named
`<Component>Props`. Self-documenting: no comment noise, comments only where the reason isn't in the
code.

## Library-only changes

**Library components are not mutated or restyled inside a consuming service.** A component that
needs to look or behave differently is changed in hoobi-design and repinned - a
`className` hack or a hand-rolled copy in the consumer forks the design system silently. Library
changes are **backwards compatible, ideally additive**: new props default to the old
behaviour, tokens are added rather than repurposed, and anything breaking is called out in the
commit and shipped together with the consumer updates.

## Build and verification

pnpm workspace: the root is the library, `catalog/` is the one workspace package and links the
library through `workspace:*`. One `pnpm install` at the root installs both; the only lockfile is
`pnpm-lock.yaml` at the root.

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
npm pack --dry-run     # must list dist/, styles.css, fonts/ and nothing else
```

**Validate visually before pushing.** Every modified component (and any page its change touches)
gets looked at in the catalog dev server with the browser - not reasoned about, looked at:

```bash
pnpm run build                  # catalog consumes ../ via workspace:*, so library dist first
pnpm -C catalog dev      # Vite on :5173
```

Open each changed page, check spacing/alignment/tones at desktop width and at 360px, and only then
commit. A component that was never rendered is not verified.

`pnpm run typecheck` also runs `check.mjs`, which enforces the rules this file states: no
literal hex in `src/*.tsx` (a `// hex-ok: reason` line above exempts, `hex-ok x2` covers two
lines), no bespoke focus styling, no box shadows, and every export in `src/index.ts` has a page
in `catalog/src/pages.tsx`.

Sanity-check token to utility generation after touching `styles.css`:

```bash
pnpm dlx @tailwindcss/cli@4.3.3 -i styles.css -o ./.tw-check.css   # gitignored
```

## Catalog

`catalog/` is a hand-rolled Vite + React reference page: sidebar nav (hash routing), a Foundations
group (Colour, Typography, Spacing & Radius) and one page per component with a description, import
line, prop table, and a variant/size/state matrix where every demo includes its copyable JSX.

Deliberately **not** Storybook. Plain anchors, one flat `pages.tsx`, no addons, no MDX, no
doc-extraction pipeline. Prop tables are hand-written.

```bash
pnpm run build            # the library first: catalog consumes ../ via workspace:*
pnpm -C catalog dev
pnpm -C catalog build     # -> catalog/dist/index.html, one self-contained file, fonts inlined
```

`vite-plugin-singlefile` plus `assetsInlineLimit` inlines the JS, the CSS and the four woff2 fonts,
so `catalog/dist/index.html` opens with zero external requests and can be published as-is.

## Claude Design sync

The catalog doubles as a **Claude Design system** (claude.ai/design project "Hoobi Design"), so
Claude generates Hoobi-shaped UI from the real components, the real rules, and the real tokens.

- `catalog/src/pages.tsx` is the one page registry: the catalog nav and the export both read it,
  so a component cannot be in one and missing from the other. `check.mjs` enforces that every
  library export has a page. Foundations include Rules (do/don't pairs) and Motion; Recipes are
  page-shaped compositions - both exist chiefly for the design system's benefit.
- `pnpm -C catalog build:ds` renders every page to static HTML in `catalog/design-system/`
  (gitignored): one standalone card per page with the compiled stylesheet and fonts inlined, a
  `<!-- @dsCard group="..." -->` marker for the Design System pane, plus `tokens.json` (the parsed
  `@theme` block) and `_hashes.json`. Static SSR on purpose: cards are readable markup, not a
  React bundle. Overlay pages (`dsOpen`) export with their panel revealed.
- **Sync runs at release time, not per commit** - the design system should show what consumers
  can `pnpm add`, and every card is stamped with the library version. After
  `pnpm version && git push --follow-tags`, run `/design-sync` (the repo skill at
  `.claude/skills/design-sync/` has the project id and the exact procedure): it diffs the
  remote `_hashes.json` against the local one and uploads only what changed (re-running is a
  no-op). This cannot run in the pipeline: DesignSync needs an interactive claude.ai login.

## Publish process

The end-to-end ritual (verify -> version -> tag push -> pipeline to green -> design-sync
decision -> consumer repin) is the **`release` skill** (`.claude/skills/release/`). Mechanics:

```bash
pnpm version patch      # or minor/major
git push --follow-tags
```

The `v*` tag fires `operations/pipelines/publish.yaml` (pipeline `hoobi-design`, definition 23, Home
Lab pool): npmAuthenticate -> pnpm install --frozen-lockfile -> typecheck -> build -> guard that the tag matches
`package.json` version -> publish, skipped when that version is already on the feed.

ADO feed versions are immutable: a wrong publish consumes the version number permanently, which the
tag guard checks against. The build step is explicit rather than leaning on `prepublishOnly`,
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

pnpm ignores `always-auth` silently; npm 11 (which still does the `npm publish` in the pipeline)
warns `Unknown project config "always-auth"`. It is kept because Azure Artifacts' own docs and
`npmAuthenticate@0` still specify it, and it is harmless.
