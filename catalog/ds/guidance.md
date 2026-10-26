# Component guidance

Each `## Name` section is copied into that component's README by `build.mjs`, between the catalog caption and the examples.

## Button

Accent is spent on exactly one button per view: `variant="primary"` is the one primary action, everything else is `secondary`, `ghost` or `danger`. Secondary and ghost buttons hover on `bg-surface-raised` and `bg-surface`, never on accent. `md` is the 32px WinUI standard, `sm` 28px for dense toolbars and card actions. The consumer provides the label (it names the action) and `onClick`.

- Do: compose a `Spinner` or pass `busy` for work the consumer already tracks.
- Don't: give a plain `Button` an async `onClick`; a button that starts work is an `ActionButton`.
- Don't: set `focus:outline-none` or restyle the focus ring.

## ActionButton

The async button. A button that starts work reports it on itself: busy, then success or failure, with the error on its tooltip. The result of a press stays on the button that was pressed; a toast does not repeat it.

- Do: return a promise from `onClick` and let the button run it.
- Don't: show a press result as a `toast()`.

## ConfirmButton

Deprecated for anything destructive. It stays only for trivial, reversible actions. Anything destructive, irrecoverable, or with a byproduct confirms through `ActionDialog`, which states the consequence before the second click.

## ActionDialog

Yes-or-no. The consumer provides `open`, `title`, `description` and a REQUIRED `actionLabel` that says what happens ("Rotate", "Regenerate", "Clear", "Set password", never "Confirm"). It never closes itself: the consumer flips `open` once the work succeeded. `onAction` may return a promise, which the dialog runs: busy while pending, the rejection's message in a danger line, still open. `tone="danger"` is only for discarding something irrecoverable.

## FormDialog

The dialog with fields. Submit is gated on the browser's own `checkValidity()`: put `required`, `type`, `minLength` or `pattern` on the fields, and `valid` for a cross-field rule. `submitLabel` is REQUIRED and names what submitting does. Like `ActionDialog`, it never closes itself.

## Modal

A native `<dialog>` with `showModal()`: Escape, the focus trap and the inert backdrop come from the platform. The backdrop is smoke (`--color-smoke` at 60%), not acrylic: smoke says the page is blocked. Keep `p-0` on the dialog so backdrop clicks work.

## Sheet

A modal side panel from the right edge, for create and edit forms. Smoke backdrop, like `Modal`.

## Divider

The house hairline: 1px of page background. It bleeds to the surface's edges by default by cancelling the padding the container published as `--pad` (a `Card` sets it), so nothing has to be told a magic inset. `padded` opts out. Spacing is the consumer's (`my-3`, `my-4`).

- Don't: write `border-t border-bg` by hand; that is a `Divider` that has not been reached for yet.

## Card

A surface told apart by fill alone: no border, no shadow. `padded={false}` makes a sliced card: the body runs flush to the edges so content that bleeds its own hairlines (`DescriptionList`, a full-width list) reaches them. Segmented cards are sliced by a 1px hairline of page background between full-bleed sections. A stateful `tone` tints the whole surface (`bg-danger/15`), never a border. Card has no width of its own; lay it out with a grid.

## Table

A real `<table>` from `@2xl` up and a stack of row cards below, one markup path. Columns are data (`id`, `header`, `cell`, optional `sortValue`). The sort is controlled (`sort` + `onSortChange`), so the consumer keeps it in the URL, and the table applies it. `primary` names the row's title column, `rowAction` the trailing control.

- `expansion` (`{ expanded, render }`, controlled like `sort`) renders `render(row)` under each expanded row; the toggle is the consumer's own control in a cell.
- `headerAccessory` on a column renders after the header and its sort button, never inside the button, so an info control there is not a button nested in a button.
- Cells are vertically centred; `valign` on a column and `rowValign` on the table are the escapes.
- A column declaring `priority` or `compact` turns on progressive columns: compact renderings first, then the lowest priority behind a "+N" menu, and the row cards last.

## Badge

Six tones and an optional status dot, 20px tall. `color` swaps the tone for an arbitrary hex, the coloured-chip primitive, with the chip mirage on by default (`mirage={false}` opts out). Tone semantics: `warn` = paused, a person must act; `success` = done; `danger` = failure; `info` = in progress.

## Toaster

Mount one `Toaster` near the root, then call the module-level `toast()` from anywhere: no context, because the caller is usually a poll or a socket. A toast is for an unrequested update (an auto-correction, a finished job, an arrived webhook). The acrylic is its fill and its tone rides on top as a `/20` wash plus the leading dot.

- Don't: toast the result of a button press; that stays on the `ActionButton`.

## Notice

State news that outranks a toast: centred, mirage-backed, up until the state changes (a dropped connection, a save that failed on the way out). Omit `onDismiss` and there is no close button; the consumer closes it on its own terms.

## Tooltip

Every tooltip is `Tooltip`. A native `title=` on a DOM element is the browser's own box: late, unstyled, absent on touch. It is placed fixed off the anchor, so no scrolling or clipping ancestor can cut it off. It takes the flyout acrylic so it reads the same as a Wowhead tip.

## RichTooltip

The `Tooltip` idea with nodes in it: a title and a few lines, following the pointer.

## Menu

An anchored flyout of rows (`Menu.Item`, `Menu.Label`, `Menu.Divider`). It takes the flyout acrylic, WinUI's rule for transient light-dismiss surfaces.

## Popover

An anchored panel under a trigger of the consumer's choosing: `Menu` without the rows. Flyout acrylic, like `Menu`.

## MultiSelect

A categorical filter: a `Popover` trigger, `Checkbox` rows and a Clear row.

## SettingRow

The list-row primitive. Settings are one surface level: rows on `bg-surface`, a 1px seam of `bg-bg` between (`SettingList`), and a group title (`SettingGroup`) is caption text, never a box. Slots: `leading`, `label`, `meta`, `description`, `control`, `children`. Fields inside a row fill with `bg-chip`, no border, and take `hideLabel`, because the row is the label. `highlight` swaps the row's fill for the accent tint when a link calls it out.

- Don't: put anything below caption (14px) on a settings page.
- Don't: build a product component (a task row, a connection card) on top; compose `SettingRow` + `Badge` + `ActionButton` in the consumer.

## Input

A 32px field. Control state is shown on the control, not in a paragraph beside it; an explanation lives on the `(i)` (`info`). The line under a field is reserved for a validation `error`. A free-text field has an example placeholder (`http://sonarr:8989`). `hint` is deprecated: use `info`. `mono` is the opt-in for a machine string.

## FieldLabel

The one label row for every field: the `(i)` and the right-hand slot. The `(i)` is never a tab stop: hover-only, its words reach assistive tech through `aria-describedby`.

## SecretField

A lock, dots and a tooltip: write-only, reveal, or never seen at all. Clear, regenerate and rotate fire their callback bare; the consumer owns the `ActionDialog`, because only the consumer knows the byproduct. `labels` is for translation, never for helper copy.

## Switch

The master on/off: a setting that acts, `role="switch"`. A value in a set is a `Checkbox`.

## Checkbox

A value in a set. A setting that acts is a `Switch`.

## CodeBlock

Bring your own engine: install highlight.js and pass its markup as `html`. The stylesheet maps standard hljs token classes onto the theme tokens, so any grammar renders in Ayu Mirage.

## CronInput

Chips first, expression second, and the next three runs as the live readout under the field. `cronRuns` is the zero-dependency five-field matcher behind it.

## Shell

The one page chrome: a top bar and a collapsible side pane on Fluent motion. `bar={false}` for a full-height pane. A `Shell.Item` with `children` is an accordion of icon-less sub-items. `Shell.MenuItem`, `MenuLabel` and `MenuDivider` are Menu's rows for the user flyout. With no favicon of its own, the document gets a `markFavicon` tab icon.

## Stat

The `Card` variant for one number: caption label, tabular number, caption-mute sub. `StatStrip` slices a row of them into one surface.

## BarList

Label, toned track and tabular readout. Not a chart library.

## TimeAxis

Events on a shared time window, one lane per row: a cron schedule, a set of firings. Not a chart library.

## Markdown

The subset Seerr renders (paragraphs, strong, em, lists), built as React nodes, never HTML. Anything else, a link included, stays text. `inline` for a label.

## LogViewer

Level chips with counts, substring or `/regex/` search, a pinned context, Follow. The level set is the consumer's. Lines render in mono.

## UnsavedBar

Sticky at the foot while anything is unsaved: `sections` names them, or a free `message`. Return a promise from `onSave` and the Save button reports it.

## Steps

Where you are in a linear flow: chevrons wide, a stacked list narrow.

## ColorPicker

WinUI's anatomy: a hue and saturation ring, a value slider, a preview and a hex box, with an optional nearest-swatch name from a palette the consumer passes.

## ChipInput

Picked things as chips, an inline query, and suggestions Tab takes.
