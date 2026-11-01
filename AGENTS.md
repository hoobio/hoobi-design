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

React component library and design tokens for Hoobi apps, with an Avalonia theme and three NuGet packages for the Hoobi desktop apps (`dotnet/`). Hanken Grotesk for text, Dank Mono for code on the web.
Published to the ADO Artifacts `Hoobi` feed (npm and NuGet) and consumed by mendarr on the web and by steward-companion, earmark and command-palette-bitwarden on the desktop.

The npm package has zero runtime dependencies. Peer deps only: react >=19, react-dom >=19, tailwindcss >=4.3.

`Hoobi.Design.Avalonia` depends on Avalonia 12.1.4 and FluentAvaloniaUI 3.1.0. `Hoobi.Design.Avalonia.Testing` depends on Avalonia.Headless. `Hoobi.Desktop.Windows` has no package dependencies.

## Layout

```
styles.css                       # tokens (@theme static), @font-face, base layer, utilities
fonts/                           # Hanken Grotesk latin variable (+italic) + Dank Mono (woff2)
src/*.tsx                        # one component per file, re-exported from src/index.ts
catalog/                         # hand-rolled Vite reference page (see below)
dotnet/                          # Hoobi.Design.slnx: the Avalonia theme, the Windows helpers, their tests and the gallery
  src/Hoobi.Design.Avalonia/         # HoobiTheme (Themes/*.axaml), controls, fonts, buildTransitive props and targets
  src/Hoobi.Design.Avalonia.Testing/ # HoverFlashProbe, TextCentring, HeadlessSession
  src/Hoobi.Desktop.Windows/         # Store updates, start at sign-in, restart registration, single instance, watchdog
  samples/Hoobi.Design.Gallery/      # the native catalog
  tests/                             # one test project per package
  build-tokens.mjs                   # styles.css to Themes/Tokens.axaml
  tools/Measure-Memory.ps1           # working set sampler
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
`Menu.Label` / `Menu.Divider`), Badge (tone + optional dot + tooltip, covers status dots; `color`
swaps the tone for an arbitrary hex - the coloured-chip primitive), Card
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
number; StatStrip slices a row of them into one surface), BarList (label / toned track / tabular readout, not a chart library),
ColorPicker (WinUI's anatomy: a hue and saturation ring, a value slider, a preview and a hex box,
with an optional nearest-swatch name from a palette you pass),
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
time window, one lane per row - a cron schedule, a set of firings - not a chart library), Markdown
(the subset Seerr renders - paragraphs, strong, em, lists - built as React nodes, never HTML;
anything else, a link included, stays text; `inline` for a label), and the
settings field set - FieldLabel
(the one label row: the `(i)` and the right-hand slot), SecretField, DurationInput, CronInput
(with `cronRuns`, a zero-dependency five-field matcher) and CopyField - plus `cx`,
`mirageImage` and `markFavicon`.

Mirage comes in six strengths: `.mirage-layer` behind a whole app, `.mirage-scoped` as a card's
own fill (or `Card mirage="..."`), `.mirage-edge` as a masked strip at a list row's left edge -
for rows/lists where a full-bleed mirage per row would be too busy - `.mirage-hero` as a band
behind a page head, `.mirage-flyout` as a floating panel's fill, and `.mirage-chip` as a coloured
chip's fill (or `Badge color="#..."`).

`.mirage-flyout` and `.mirage-chip` are the two strengths applied **by default** - the chip one
whenever `Badge` is given a `color`, opted out of with `mirage={false}`. The flyout one covers only
transient light-dismiss
popups: `Menu`, `Popover` (so `MultiSelect` and `ColorPicker` inherit it), `ChipInput`'s
suggestions, Shell's group dropdown and railed user flyout, `Toast`, and tooltips (`[data-tip]` and
`RichTooltip`, matching the Wowhead item tooltips consumers float over the same tables). Apart from
tooltips, that is WinUI's own rule -
"Acrylic is used only for transient, light-dismiss surfaces such as flyouts and context menus"
([signature experiences: materials](https://learn.microsoft.com/en-us/windows/apps/design/signature-experiences/materials)).
Modal surfaces are excluded because WinUI signals those with smoke, not acrylic. WinUI's own ToolTip
is a solid brush; the house tooltip departs from it so it reads the same as a Wowhead tip. A toast floats over whatever the page
is showing, so it takes the acrylic as its fill and its tone rides on top as a `/20` wash plus the
leading dot. That wash lightens the fill, so a toned toast's description drops the dim caption
colour for `text-text` and clears 4.5:1; the default tone keeps the dim one. A tone tint alone was its whole surface until then, which left it 85% transparent and
a dense table read straight through the words.

`.mirage-flyout` and `.mirage-chip` are also the two strengths that do **not** read
`--mirage-image`. The flyout is the backdrop sample plus a `bg`-leaning tint and nothing else,
because fixed artwork has no relation to what the panel is covering and would tint every flyout the
same regardless of content. The tint is `color-mix(in srgb, var(--color-bg) 72%, transparent)` over
`backdrop-filter: blur(24px) saturate(1.4)`; 72% is the lowest that keeps a danger-toned menu row
above 4.5:1 over a dense table of bright class-coloured text. The chip draws its own hue instead:
two washes mixed from `--chip-color` over the flat 16% tint, with no blur - a 20px chip has nothing
to blur, and the washes are sized past the chip so no gradient edge lands inside it. The other four
strengths sit on an opaque page, where the artwork is the point, and keep using `--mirage-image` as
they always have.

Modal, and so `ActionDialog` and `FormDialog` which render through it, take **smoke** instead:
`--color-smoke` at 60% on the `<dialog>` backdrop. Acrylic says a surface is floating over the page
and will dismiss itself; smoke says the page is blocked. Fluent's own value is
`SmokeFillColorDefault` `#4D000000` - translucent black at 30%, the same in Light and Dark because
smoke is [not a mode-aware material](https://fluent2.microsoft.design/material) ([WinUI theme
resources](https://raw.githubusercontent.com/microsoft/microsoft-ui-xaml/main/controls/dev/CommonStyles/Common_themeresources_any.xaml)).
That 30% is calibrated for a light page, where it halves the page's luminance; over `#181c26` a
black veil cannot reach that dim at any alpha, because pure black only takes the page from a 1.19:1
to a 1.36:1 reading against `surface-raised`. So the alpha is doubled to Fluent's, which lands at
1.42:1 and, more to the point, pulls the bright accent text behind the dialog back towards the page
fill. The ink is `color-mix(in srgb, var(--color-bg) 25%, #000)` rather than pure black, so the
scrim is the same cool near-black the palette is built from. No blur: blur is acrylic's signal.

Every strength tints at part opacity, so mirage assumes an **opaque page background beneath it**.
A box floating over a canvas, photo or video has none, and the content underneath reads through it:
the result looks transparent rather than filled. Mirage tuning does not fix this; the surface is
the wrong target for it. Such a surface needs its own opaque fill; mirage then goes on a child
element, if used at all.
`.mirage-scoped` also sets `position: relative` and `overflow: hidden`, which beat a consumer's
`absolute` or `overflow-y-auto` on the same element and can leave an overflowing panel silently
unscrollable - placement and scrolling belong on wrappers.
`.mirage-scoped` is tunable per host through `--mirage-wash` (default 75%, the `surface-raised`
share of the tint), `--mirage-blur` (32px), `--mirage-saturate` (1.4) and `--mirage-scale` (1.2);
a thin host such as an 8px bar sets a lower wash and a smaller blur to keep the artwork's hue.

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

`expansion` (`{ expanded, render }`, controlled like `sort`) renders `render(row)` under each row whose key is in `expanded`: a full-width row wide, the end of the row's card stacked, never counted in the progressive width. The toggle is the consumer's own control in a cell. Added for the Steward Sims leaderboard's per-spec builds.

`headerAccessory` on a column renders in the header cell after the header and its sort button, never inside the button, so an info control there is not a button nested in a button. Wide only. Added for the Steward Sims leaderboard's info tooltips.

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
  Fields inside a row fill with `bg-chip` and no border (`error` tints the field `bg-danger/15`) and
  take `hideLabel`, because the row is the label. `bg-surface-raised` is for things that float: a
  menu, the unsaved bar, the hover on a secondary button, the "new lines" pill.
- **A free-text field has an example placeholder**, e.g. `http://sonarr:8989`,
  `*/15 * * * *`, `-1001234567890`. It is the cheapest hint available.
  Numbers show their default; a secret's placeholder is SecretField's own.
- Layer scale (native ports mirror it): `bg` `#181c26`, `surface` `#1f2430`, `surface-raised` `#242936`, `chip` `#15181f` (one step below bg).
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
| Depth           | Fills, not strokes, never shadows. Surfaces are told apart by background alone (`bg` / `surface` / `surface-raised` / `chip`); cards, pills and alerts carry no border. Segmented cards are **sliced**: a 1px hairline of page background between full-bleed sections (`gap-px` in a clipped `rounded-panel`, or `border-t border-bg`), the earmark card treatment (its section divider is literally `Height="1"`). A stateful tone tints the whole surface (`bg-danger/15`), never a border. Interactive controls carry no border either: fill tells them apart, and a stateful tone tints the fill. The only remaining strokes are the Tabs underline and hairline dividers. The only overlay scrim is the Modal backdrop. |
| Accent          | Restrained. `--color-accent` is for the one primary action, the Tabs selection indicator, Progress fill, Spinner arc and the focus ring. Everything else is neutral: secondary and ghost buttons hover on `bg-surface`/`bg-surface-raised`, not on accent.                                                                                                                                                                                                                                                                                                                                                                                               |
| Focus           | One language everywhere: the global `:focus-visible` 2px outer ring at 2px offset. Components must **not** set `focus:outline-none` or re-style their own focus border.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Links           | Colour shift on hover (`accent-blue` -> `accent-cyan`), **never an underline** - WinUI hyperlinks shift shade. A button-shaped link (nav item, sidebar entry) highlights its own surface on hover (`hover:bg-surface`), not its text.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Flyouts/menus   | A custom `Flyout` matching a native `MenuFlyout`'s look: `ShouldConstrainToRootBounds="False"`, a `SystemBackdrop` built on `DesktopAcrylicController` tinted to the palette (`TintOpacity` 0.15, `LuminosityOpacity` 0.96, default `SystemBackdropConfiguration`, a solid `FallbackColor` shown whenever the window is not input-active), presenter `Background="Transparent"`, `BorderThickness="0"`, `CornerRadius="8"`, an explicit `Placement` (the default `Top` opens upward once the popup is unconstrained). Tint tokens: `FlyoutAcrylicTintColor` `#FF1F2430`, `FlyoutAcrylicFallbackColor` `#FF242936`. `MenuFlyout` takes the same backdrop and presenter style, so a plain command list and a custom row layout (an account card, icon+name+role rows) read as one family. Keep WinUI's default shadow: a windowed popup HWND always reserves a 10/2/10/18 DIP gutter around the presenter, so disabling the shadow leaves that gutter as a visible empty band instead of removing it. Never call a DWM corner or border API on a popup window; WinUI already clips the backdrop to the presenter's `CornerRadius`. |
| Dialogs         | One shared `ContentDialog` style, not `BasedOn={StaticResource DefaultContentDialogStyle}` (the stock grey look): tinted background, `BorderThickness="0"`, `CornerRadius="8"`, `PrimaryButtonStyle` set to the accent button so the affirmative action is the default. A fixed-width dialog sets `MinWidth` equal to `MaxWidth`; a smaller `MinWidth` lays content out narrower than it was measured at and the content overlaps. Show every dialog through one helper that applies the style, closes any open flyout first, and queues a second `ShowAsync` behind one already open - WinUI allows only one `ContentDialog` open at a time per window. |
| Title bar       | With custom `TitleBar.RightHeader` content, keep the non-client Passthrough region in sync yourself: the `TitleBar` control only recomputes its passthrough hole on its own `SizeChanged`, so content added, removed or resized inside `RightHeader` after that (a button appearing, a picker collapsing) leaves the hole stale and a click there drags the window instead of hitting the control. Recompute it on every layout change and on window activation. Verify a title-bar-region click by checking the passthrough region itself, not by driving the control with UI Automation's Invoke pattern, which bypasses non-client hit testing entirely and passes even when the region is wrong. |
| Flyout buttons  | A button that opens a flyout, clicked while its window is inactive, needs the click deferred past activation settling (a flyout shown mid-activation opens then immediately closes); set an `OverlayInputPassThroughElement` so a click on another title-bar control switches flyouts in one click instead of two (close, then reopen); and ignore a reopen of the same flyout within roughly 300ms of it closing, since the overlay's dismissing press is what the pass-through delivers to the button, and without the guard that same click reopens what it just closed. |

The Avalonia package encodes the Flyouts/menus and Dialogs rows in `Themes/Controls.axaml`, `Themes/Dialogs.axaml` and `AppDialogs` (see Avalonia packages). The Title bar row is WinUI specific; the Avalonia title bar is `HoobiWindowDecorations` with `ElementRole`.

`--spacing: 4px` means every Tailwind spacing utility is `n * 4px`. Reach for the WinUI grid values
(4 / 8 / 12 / 16 / 24 / 32) rather than odd numbers.

Vertically centre text in a filled box (a value field, pill, chip, tile, button) at a fixed 32px
height, `TextBlock.VerticalAlignment="Center"` - never top-aligned text with padding standing in
for centring. Mixed fonts on one line (mono beside proportional) is one `TextBlock` of `Run`s, so
every part sits on the same baseline; separate `TextBlock`s centre by box height and the mono part
rides high. A glyph placed beside mono text is measured by its ink extents, not its layout box, or
it sits off the mono baseline.

WinUI 3 desktop-app framework rules (DI lifetime, frame navigation) live in the WinUI section of
Hoobi's `context/stacks/dotnet.md`, not here - this table is visual and interaction convention only.

Minimalism: a component gets no decoration it does not need. No gradients, no shadows, no
double-signalling a state that the border or the ring already shows.

- A stateful tone tints the **whole surface** as a solid `/15` fill (`bg-warn/15`) - never a
  gradient fade, never a border. On a surface that floats over arbitrary content the tone is a
  `/20` wash over the acrylic instead (`Toast`), because a `/15` tint over glass no longer reads
  as its tone.
- Tone semantics: `warn` (yellow) = paused, a person must act; `success` (green) = done, the fix
  landed; `danger` = failure; `info` = in progress / informational.

## Avalonia packages

`dotnet/` (`Hoobi.Design.slnx`) holds three NuGet packages. One `v*` tag publishes them with the npm package (see Publish process).

| Package                         | Contents                                                                                                                                                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Hoobi.Design.Avalonia`         | `HoobiTheme` (tokens, control themes, dialogs, settings cards, glyphs), the fonts, `UseHoobiDesign`, `AppDialogs`, `ColorShade`, `IdleMemory`, `ToastWindow`, `ForegroundGate`, `TrayMenuFocus`, `DialogIntent`, and the buildTransitive props and targets |
| `Hoobi.Design.Avalonia.Testing` | `HoverFlashProbe`, `TextCentring`, `HeadlessSession`                                                                                                                                                                                  |
| `Hoobi.Desktop.Windows`         | Windows plumbing (see Windows desktop apps)                                                                                                                                                                                           |

### Consumer setup

- `Directory.Packages.props` pins `Hoobi.Design.Avalonia`, `Hoobi.Desktop.Windows` and (in test projects) `Hoobi.Design.Avalonia.Testing` to exact versions. Avalonia and FluentAvaloniaUI are pinned to the versions the library uses.
- `nuget.config` lists nuget.org and the Hoobi feed (`https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/nuget/v3/index.json`). A `packageSourceMapping` maps `Hoobi.*` to the Hoobi feed and `*` to nuget.org.
- `App.axaml` holds `<hoobi:HoobiTheme />` in `Application.Styles` (`xmlns:hoobi="using:Hoobi.Design.Avalonia"`) and `RequestedThemeVariant="Dark"`.
- The `AppBuilder` calls `.UseHoobiDesign()`. It registers the font collection, the emoji fallback, popup placement, the scroll indicator and the dialog resource scope.
- A window with the Hoobi title bar sets `ExtendClientAreaToDecorationsHint="True"`, `ExtendClientAreaTitleBarHeightHint="{StaticResource TitleBarHeight}"` and `WindowDecorationsTheme` to `HoobiWindowDecorations` (minimise, maximise, close) or `HoobiCloseOnlyDecorations`. The drag area carries `chrome:WindowDecorationProperties.ElementRole="TitleBar"`. Content that takes clicks or a right-click (buttons, a picker) carries `ElementRole="User"`.

### Tokens and native divergences

`dotnet/build-tokens.mjs` generates `Themes/Tokens.axaml` from the `@theme static` block of `styles.css` (`node dotnet/build-tokens.mjs`). `check.mjs` fails when `Tokens.axaml` is stale. Hand edits to `Tokens.axaml` are lost on the next generation.

The native theme differs from the web in these places:

- Type sizes follow WinUI: caption 12, control content 13, body 14.
- Code and keys use Cascadia Mono. Dank Mono is for the web.
- Hanken Grotesk ships as static Regular, SemiBold and Bold TTFs, because Avalonia 12 does not map `FontWeight` onto a variable font's `wght` axis.
- Text on an accent fill is `#181C26`.

Value keys carry the `Hoobi` prefix (`HoobiBgBrush`, `HoobiAccentColor`). Control themes and resources that override FluentAvalonia or WinUI keep the WinUI names (`TitleBarHeight`, `CaptionTextBlockFontSize`).

A button with its own fill takes the `Tinted` class. The hover and pressed fills come from `ColorShade.Hover` and `ColorShade.Pressed`, which mix the fill towards `HoobiBgColor`.

### Gallery

`samples/Hoobi.Design.Gallery` is the native catalog: every style key and control theme the package ships is on a page. `GalleryTests` renders every page, each open popup, the toast window and the window decorations to PNG files when `HOOBI_GALLERY_PNG_DIR` names a folder. Changed styles are looked at in those PNGs before commit, as the web catalog is looked at in the browser.

### Consistency enforcement

The `buildTransitive` targets run before `CoreCompile` in every consuming project and fail the build on:

- `HOOBI001`: a literal colour in an `.axaml` file (hex, or a named colour in a colour property or setter). `Transparent` is allowed as a hit-test fill. A literal needs `<!-- hex-ok: reason -->` on the line above.
- `HOOBI002`: an `x:Key` that the package already defines. The list of package-owned keys is generated when the package is packed.

`HoobiDesignChecks=false` turns both checks off for a project. `HoobiDesignChecksExclude` removes named `.axaml` files from them.

Every consumer runs `HoverFlashProbe` over its own pages and popups in its tests. Consumers stay on the current package version through Renovate. The rule in Library-only changes (library components are not mutated or restyled inside a consuming service) applies to native apps in full.

### Hover and press rules

- A state change animated by a `BrushTransition` goes between two brushes of the same RGB. A clear rest state is the target colour at alpha 0 (`#00242936` under a `surface-raised` hover), not `Transparent` or `#00FFFFFF`. Avalonia interpolates brush colours with straight (not premultiplied) alpha, so a fade from clear white to an opaque Mirage colour passes through a lighter colour, and the control flashes white on hover or press.
- FluentAvalonia's clear theme brushes are white (`#00FFFFFF`, `SubtleFillColorTransparentBrush`). A style that sets a hover or pressed brush to an opaque token also sets the matching rest brush.
- `HoverFlashProbe.Probe(root)` and `HoverFlashProbe.ProbePopups(top)` (from `Hoobi.Design.Avalonia.Testing`) apply `:pointerover` and `:pressed` to each templated control and report every `BrushTransition` frame composited over `bg` that is lighter than both of its ends. Every app runs it over the shell, each page, each flyout and the control types and button themes it uses, before its first page ships.

### Memory

`Hoobi.Design.Avalonia` ships GC defaults through its `buildTransitive` props:

- `System.GC.Concurrent=false`, applied when the project does not set `ConcurrentGarbageCollection`.
- `System.GC.ConserveMemory=5`.
- `System.GC.Gen0MaxBudget=8388608` (8 MB). Without a cap the runtime sizes the gen0 budget from the L3 cache.

An app overrides `Concurrent` with `<ConcurrentGarbageCollection>` in the project file, and `ConserveMemory` or `Gen0MaxBudget` with `<RuntimeHostConfigurationOption Update="System.GC.ConserveMemory" Value="7" />`. `HoobiDesignGcDefaults=false` removes all three.

`IdleMemory` trims a resident app that spends most of its time in the tray. Create it with the main window (`new IdleMemory(window)`; the delay defaults to 3 seconds). It trims when the window loses activation or is hidden and stays that way for the delay, and `NotifyBackgroundWorkCompleted()` trims after a background pass. A trim runs when the window is not active or not visible. A trim is a blocking, compacting, aggressive collection with the large object heap compacted, followed by `EmptyWorkingSet`. While the window is hidden the process runs in EcoQoS, which throttles execution speed only. Idle priority is never used: it starves the UI thread, and a game that waits on the app with a synchronous message stalls.

Measure memory with `tools/Measure-Memory.ps1 <process name>`. The number is the private working set, as Task Manager shows it. Measure with the app in the tray, and record the figures before and after a change in the app's `AGENTS.md`. Steward's reference figures: 4 to 15 MB private working set in the tray between passes against 128 MB before trimming, 7 to 14 ms of GC pause per trim, and about 100 MB of committed private bytes (Skia, ANGLE, the runtime) unchanged.

### Avalonia and Windows rules

- In Avalonia 12 a template's own value outranks a style setter that has no pseudo-class. Target the template part (`/template/ ContentPresenter#PART_ContentPresenter`).
- An unscoped `Button:pointerover` override reaches the buttons inside flyouts. Name the element (`Button.Tinted:pointerover /template/ ContentPresenter#PART_ContentPresenter`).
- A `Button.Flyout` closes on a second press of its button. An `AttachedFlyout` opened from `Click` does not.
- Animate `RenderTransform`. Animating the `TranslateTransform` object throws `InvalidCastException`.
- A `StyledProperty` change callback does not assign an inner `DataContext`.
- Compiled bindings need `x:DataType` on the element or an ancestor.
- Avalonia rounds .5 to even where WinUI rounds up. A WinUI layout that needs the round-up adds 0.01 (padding 15.01).
- Variable fonts do not render per weight. Ship static TTFs.
- FluentAvalonia resource names clash with unprefixed app keys. App keys carry the `Hoobi` prefix and are referenced with `StaticResource`.
- Show every dialog through `AppDialogs.ShowAsync` or `AppDialogs.ShowMessageAsync`. They queue a second dialog behind the open one, wait for `ForegroundGate`, cancel a `Hide()` that arrives before the dialog is shown (FluentAvalonia 3.1.0 throws on a dialog that was never shown), and shorten the open fade.
- Avalonia's `Button.OnKeyUp` clicks on a Space key-up with no key-down, so a key held over from before a dialog opened can confirm it. `DialogIntent` (applied by `AppDialogs`) counts a press when its key-down came after the dialog opened.
- A tray menu opens without focus; `TrayMenuFocus` gives it focus. `SetForegroundWindow` is refused to a process that did not receive the last input, and a tray click goes to Explorer, so `ForegroundGate.ForceForeground` borrows Explorer's input queue for the call.
- An app that closes to the tray handles `WM_ENDSESSION` by quitting.
- Hiding a window before the minimise animation ends cancels the animation.
- The window is cloaked (DWM) until its first frame is composed, then uncloaked two animation frames later. Without it a white frame shows on open.
- WinUI keeps the 1px top resize border outside its client area, and an extended client area draws over it. The shell content sits 1px down (`Margin.Top` of 1), and `AppDialogs` reads that margin to centre the dialog panel.
- Drawn caption buttons are siblings of the window under its host, so a `Window:inactive` selector never matches them. The app sets an inactive class on them on open, activation and deactivation. Moving onto a caption button from the client area ends client tracking with a `WM_MOUSELEAVE` that clears the hover, so the window procedure hook posts a `WM_NCMOUSEMOVE` for the cursor position when `WM_MOUSELEAVE` arrives over a caption button.
- A toast window is `WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW` and places itself by `PixelRect` per monitor. `ToastWindow` does both.
- The first real window pays about 250 ms to load XAML. A hidden throwaway window created at startup pre-loads it.
- `Microsoft.Win32.Registry` as a `PackageReference` fails with NU1510. The type is in the framework.
- CommunityToolkit `[ObservableProperty]` on a field raises MVVMTK0045. Use partial properties.
- FluentAvaloniaUI pulls in DataGrid, which is not trim-safe (IL2104). A trimmer run that trims nothing still lets `publish-clean` delete native DLLs.
- Tests run with `dotnet test --project <csproj>`.
- `Dispatcher.UIThread.RunJobs` does not fire dispatcher timers. A headless session pumps the dispatcher by hand (`HeadlessSession.Pump`, `HeadlessSession.WaitFor`).
- Two target frameworks run test processes at the same time. Each test uses its own temp folder.
- A `Mutex` is re-entrant on its owning thread. A single-instance test acquires the second instance on its own `Thread`.

## Windows desktop apps (.NET)

Every .NET Windows desktop app in the Hoobi family (Steward, Earmark, and new ones) ships the same update and sign-in behaviour. `Hoobi.Desktop.Windows` holds it: `StoreUpdater` (scan, check, install, restart registration), `StartAtSignIn` (startup task or Run value), `RestartRegistration`, `GitHubReleaseChecker`, `SingleInstance` (one process, a second launch shows the first), and `UiWatchdog` (restarts the app when the UI thread stops responding; `--restart-after=`). An app uses these types and does not copy them. The Bitwarden command palette companion has no Store or start-at-sign-in code and is exempt from this section.

- A packaged (Microsoft Store) release build checks for updates through the Store, not GitHub. It
  runs `AppInstallManager.SearchForUpdatesAsync(<product id>, "")` first, because `StoreContext`
  sees an update only after the Store has scanned. `SearchForAllUpdatesAsync` runs on an explicit
  "Check now" only, because it queues the update of every Store app on the machine. The check is
  `StoreContext.GetAppAndOptionalStorePackageUpdatesAsync`, with the window handle passed through
  `InitializeWithWindow`.
- The update installs silently when `CanSilentlyDownloadStorePackageUpdates` is true. Otherwise the
  install button calls `RequestDownloadAndInstallStorePackageUpdatesAsync`, and a failed or
  cancelled install opens `ms-windows-store://downloadsandupdates`.
- `RegisterApplicationRestart` (`--tray` when the window is hidden, `--no-activate` when it is
  shown, flags `RESTART_NO_CRASH | RESTART_NO_HANG | RESTART_NO_REBOOT`) runs before the Store scan
  and before an install, so Windows relaunches the app after the update.
- An unpackaged release build (MSI, portable) checks the GitHub releases list.
- Start at sign-in is for release builds only. On dev, debug and pre-release builds the setting is
  disabled and reads off.
- A packaged build starts at sign-in through a manifest `desktop:StartupTask` and the
  `StartupTask` API, not the `HKCU\...\Run` value. An MSIX app's HKCU writes go to its private hive
  (`%LocalAppData%\Packages\<PFN>\SystemAppData\Helium`), so a Run value it writes never reaches
  the real key. An unpackaged build writes the Run value.
- The setting shows the locked `StartupTaskState` values: `DisabledByUser` (turned off in Task
  Manager > Startup apps), `DisabledByPolicy` and `EnabledByPolicy`.

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

The .NET side builds and tests from `dotnet/`:

```bash
dotnet build Hoobi.Design.slnx -c Release
dotnet test --project tests/Hoobi.Design.Avalonia.Tests -c Release
dotnet test --project tests/Hoobi.Desktop.Windows.Tests -c Release
dotnet pack src/Hoobi.Design.Avalonia -c Release -o artifacts   # likewise Hoobi.Design.Avalonia.Testing and Hoobi.Desktop.Windows
HOOBI_GALLERY_PNG_DIR=<folder> dotnet test --project tests/Hoobi.Design.Avalonia.Tests -c Release   # gallery PNGs
```

A change to `.axaml`, a control theme or a native token is verified in the gallery PNGs as well: open each changed page's PNG and check spacing, alignment and tones, as for the web catalog. A style that was never rendered is not verified.

`pnpm run typecheck` also runs `check.mjs`, which enforces the rules this file states: no
literal hex in `src/*.tsx` (a `// hex-ok: reason` line above exempts, `hex-ok x2` covers two
lines), no bespoke focus styling, no box shadows, and every export in `src/index.ts` has a page
in `catalog/src/pages.tsx`. It also fails when `Themes/Tokens.axaml` is stale against `styles.css`.

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

## Claude Design System sync

The library is also a Claude **Design System** artifact, "Hoobi Design"
(https://claude.ai/artifact/N5rDQuXjYLMJ7VQ6Q8wxHB), so Claude generates Hoobi-shaped UI from the
real components, rules and tokens. It moved there from the standalone claude.ai/design project
because claude.ai/design closes on 14 December 2026. `pnpm -C catalog build:ds` (library `dist`
first) runs `catalog/ds/build.mjs`, which writes the artifact's files to
`catalog/design-system/project/` (gitignored): `tokens.json` and `tokens.css` from the `@theme`
block, the fonts, a brand book from `catalog/ds/brand.md`, the library as one IIFE
`components/bundle.js` (`window.HoobiDesign`) with the catalog's compiled stylesheet, and a card per
component whose live preview mounts the catalog page's own `<Demo>` examples, or the overrides in
`catalog/ds/examples.mjs`. It fails on a token without a note in `catalog/ds/usage.json` and on any
file that breaks the artifact format.

Sync runs at release time, not per commit, so the system shows what consumers can `pnpm add`. After
`pnpm version && git push --follow-tags`, run `/design-sync` (`.claude/skills/design-sync/`): it
builds the files and publishes them to the artifact with the Artifact tool, the index
`design-system.json` last, keeping `"editing": "code"` so the page stays read-only.
`catalog/src/pages.tsx` is the one page registry: the catalog nav and the generator both read it,
and `check.mjs` enforces that every library export has a page.

## Publish process

The end-to-end ritual (verify -> version -> tag push -> pipeline to green -> Design System sync
decision -> consumer repin) is the **`release` skill** (`.claude/skills/release/`). Mechanics:

```bash
pnpm version patch      # or minor/major
git push --follow-tags
```

The `v*` tag fires `operations/pipelines/publish.yaml` (pipeline `hoobi-design`, definition 23, Home
Lab pool): npmAuthenticate -> pnpm install --frozen-lockfile -> typecheck -> build -> guard that the tag matches
`package.json` version -> publish, skipped when that version is already on the feed. The same run then installs the .NET SDK, runs `dotnet test` on `Hoobi.Design.Avalonia.Tests` (the Windows test project cannot run on the Linux agent), packs the three projects with `-p:Version=<tag version>` and pushes the `.nupkg` files with `--skip-duplicate`. The NuGet version comes from `package.json` (`dotnet/Directory.Build.props`), so one bump releases npm and NuGet together.

Consumers on GitHub Actions need an ADO PAT secret with Packaging (Read) for `dotnet restore`: the Hoobi feed rejects anonymous restore with 401.

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

A PR gets squash auto-complete from the `hoobi-design-pr-auto-complete` pipeline
(`operations/pipelines/pr-auto-complete.yaml`, an optional build policy on `main` with no path
filter), which runs the `pr/auto-complete.yaml` step from hoobi-pipeline-tools. Renovate and
claude-bot PRs are left alone, as they complete their own. A docs-only PR skips the required PR
validation build, so it completes as soon as auto-complete is set.

## Known noise

pnpm ignores `always-auth` silently; npm 11 (which still does the `npm publish` in the pipeline)
warns `Unknown project config "always-auth"`. It is kept because Azure Artifacts' own docs and
`npmAuthenticate@0` still specify it, and it is harmless.
