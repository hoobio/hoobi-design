# Design rules

## Design rules

- **Settings are one surface level** (the general rule is under Page layout). Rows are `bg-surface` separated by a 1px seam of `bg-bg`
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
- Everything comes from a token in `tokens/tokens.css` (the `@theme static` block of `styles.css` is generated from it). No literal hex in component files.
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

### Page layout

- **A surface is never nested in another surface.** This applies to every component. A `Card`,
  `SettingList`, `Stat` or option card does not sit on a surface of its own kind or inside a
  `Card` body. Fields and option cards inside a surface fill with `bg-chip`. Content that needs
  grouping inside a surface uses a `Divider` or a caption title.
- A panel takes its size from its content or from its grid row. A fixed `min-height` is allowed
  only for a loading skeleton.
- In a two-column work area, the shorter column ends within one card height of the longer one at
  1440px. Content moves between columns before a spacer is added.
- A media or 3D panel takes its height from its row (stretch) or from an `aspect-ratio`.
- The page regions, in order, are: Shell, PageHeader, one banner slot, one Tabs row, the work area
  with an optional aside, UnsavedBar.
- A view has at most one Tabs row, one toolbar row and one banner slot. A second set of choices
  is a list in the aside, a `Select` or a `Menu`. It is never a strip above the Tabs.
- Banners have a priority order. One banner shows at a time.

### Container padding

- A container surface has the same padding on all four sides. The padding above and below the content equals the padding to its left and right. Container surfaces are rows, cards, groups, slots, alerts, settings cards, expander headers and dialogs. In the Avalonia package the value is 16 for rows and settings cards (`HoobiCardRowPadding`, `Border.Row` and its variants, `SettingsCard`, `SettingsCard.Item`), 12 for `Border.Slot`, `Border.Alert` and `Border.Inset`, and 24 for dialogs (`ContentDialogPadding`).
- A fixed `Height` or `MinHeight` on a container surface does not stand in for padding. A row takes its height from its content plus the padding, so a one-line row is 16 above and below its line, and a row that holds a 32px control is 16 above and below the control. `Border.Row.Switch`, `Border.Row.KeyValue` and `Border.Row.Hairline` set no height.
- `Border.Row.Switch.Child` has a 40px left padding that indents the row under its parent. Its top, right and bottom padding is 16.
- A control is exempt. A button, text box, combo box, menu item, tooltip, badge, key cap, tab, nav item or segmented item has a fixed height, and its text is centred in that height.
- Five other values are exempt:
  - `HoobiPageGutter` (26,7,26,26): the title bar above the page supplies the top space.
  - `SettingsExpanderItemPadding` (58,8,44,8): the left and right insets align child rows with the header text and the chevron, and `HoobiCardRowMinHeight` (52) gives the row its height.
  - `FAInfoBar` paddings: they are FluentAvalonia control internals.
  - `TextBlock.GroupHeader` margin: it is the space between groups, not an inset.
  - The dialog button strip (24,0,24,24): the dialog body above it supplies the top 24.
- On the web, Card, Modal and Sheet use one `--pad` value on all sides.
- In the React package a container surface's padding is one `p-*` utility, never a `px-*`/`py-*` pair. A `px-*`/`py-*` pair is only for an exempt control (its text centred in a fixed height) or where the request asks for asymmetric padding.

### Actions and controls

- A toolbar shows at most three buttons: one primary or one secondary pair, and one overflow
  `Menu`. More actions go into the `Menu` under `Menu.Label` groups.
- Every `Select`, `MultiSelect`, `SegmentedControl` and toggle group has a visible `label`, or sits
  in a group with a visible legend. Two adjacent dropdowns with hidden labels are not allowed.
- A control that only configures another action sits inside that action's popover or dialog, or
  directly beside its button as a ghost control. It is not a peer button in the toolbar.
- Controls that start the same task from different inputs (a new build from equipped gear, from
  owned items, from a preset) are one entry point with the input as a choice inside it.
- A view has one accent element. While `UnsavedBar` shows, the page primaries render as secondary.
- Selection is shown by fill (`surface-raised`) and a check icon or a `Badge`. The accent is not a
  selection ring.
- Item quality text uses the `--color-quality-*` tokens (`poor`, `common`, `uncommon`, `rare`,
  `epic`, `legendary`). Each is at least 4.5:1 on `surface` and `surface-raised`. `rare` and `epic`
  are lighter than the game colours, which are 3.22:1 and 3.18:1 on `surface`.
