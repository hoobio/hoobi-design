# Components

## Components

Button, ConfirmButton (arm-then-confirm, built on Button), Menu (anchored flyout; `Menu.Item` /
`Menu.Label` / `Menu.Divider`, and `Menu.Sub` for a nested submenu: a cascading panel beside its
row with a fine pointer, flipped and clamped at the viewport edge, and drill-down in place under a
back row on `(pointer: coarse), (max-width: 40rem)`; one open path per menu, so Escape closes one
level and a leaf closes the whole menu), Badge (tone + optional dot + tooltip, covers status dots; `color`
swaps the tone for an arbitrary hex - the coloured-chip primitive), Card
(optional scoped mirage), CodeBlock (bring-your-own-engine: consumers install highlight.js and pass
`html`; the stylesheet maps standard hljs token classes onto the theme tokens, so any grammar
renders in Ayu Mirage), Modal, Tabs (controlled), Table (sortable columns, controlled sort), Breadcrumbs,
Timeline (`Timeline.Item`), DescriptionList,
Section (`panel` for a settings-shaped surface), Shell (the one page chrome; `bar={false}` for a full-height pane, a `Shell.Item` with `children` is an accordion of icon-less sub-items shown while it is active, and `Shell.MenuItem` /
`MenuLabel` / `MenuDivider` are Menu's rows for the user flyout), Progress, Spinner, Alert, Input,
Select, Checkbox, Switch (the master on/off; role="switch", where Checkbox is a value in a set),
SegmentedControl (2 to 4 labelled options at 32px, native radios in a radiogroup, the selected
segment filled with no accent), RadioCards (a fieldset with a visible legend and a native radio per
option drawn as a card with a title and a description; selection is a fill and a check; `detail`
holds further controls and renders under the card only while it is selected; `disabledReason` is
the card's tooltip), Delta (a Badge for a signed change: `+` success, `−` danger, `±` neutral at
zero, `invert` for lower-is-better),
Toast (one `Toaster` mounted at the root plus a module-level `toast()` - no context, because
the caller is usually a poll or a socket, not a component),
Notice (state news that outranks a toast: centred, mirage-backed, up until the state changes),
Rating, ChipInput (chips + an inline query + suggestions Tab takes), Stat (the Card variant for one
number; StatStrip slices a row of them into one surface), BarList (label / toned track / tabular readout, not a chart library),
ColorPicker (WinUI's anatomy: a hue and saturation ring, a value slider, a preview and a hex box,
with an optional nearest-swatch name from a palette you pass),
Slider, Tooltip (`[data-tip]` in CSS, placed fixed off the anchor by `tipAnchor` so no
scrolling or clipping ancestor can cut it off, and clamped inside the viewport with an 8px margin,
flipping below the anchor when there is no room above), RichTooltip (the same idea with nodes in it: a
title and a few lines, following the pointer), Popover (an anchored panel under a trigger of the
consumer's choosing - Menu without the rows), ActionDialog, Steps (chevrons wide, a stacked
list narrow), SectionNav, UnsavedBar (`sections` or a free `message`), the list-row primitive -
SettingRow / SettingGroup / SettingList (one surface level: rows on `bg-surface`, a 1px seam of
`bg-bg` between, a group title is text and never a box; slots `leading`, `label`, `meta`,
`description`, `control`, `children`; `highlight` swaps the row's fill for the accent tint when a
link calls it out) - LogViewer (level chips with counts, substring or /regex/
search, a pinned context, Follow; the level set is the consumer's), TimeAxis (events on a shared
time window, one lane per row - a cron schedule, a set of firings - not a chart library),
FlowCanvas (a node graph for a workflow builder: HTML nodes over an SVG edge layer, orthogonal
edges routed round every node with rounded corners only at a turn, siblings sharing one trunk,
ports at a fixed offset from the node top so nodes at one y line up, drags snapped to the 8px grid
and pulled level with a wired port within 12px; positions, edges and selection are the
consumer's), RepeatList (one row of controls per item of a list the consumer owns, a remove at
the end of each row and an add under the last; cells are sized sm, md or lg and wrap onto a second
line in a narrow container; optional column labels drawn once at the cells' widths), Markdown
(the subset Seerr renders - paragraphs, strong, em, lists - built as React nodes, never HTML;
anything else, a link included, stays text; `inline` for a label), and the
settings field set - FieldLabel
(the one label row: the `(i)` and the right-hand slot), SecretField, DurationInput, CronInput
(with `cronRuns`, a zero-dependency five-field matcher, and `describeCron`, the plain-English
caption for the common shapes, null for the rest) and CopyField - plus `cx`,
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
