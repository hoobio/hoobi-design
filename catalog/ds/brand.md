Hoobi Design is a dark-mode-preference system for Hoobi's apps: **Fluent Design 2** (as WinUI 3 ships it) is the basis for everything, **Ayu Mirage** is the colour scheme, and the library's own YouTube-sized type scale sits on top. Minimalism heavy. Design choices are consistent with Fluent, Ayu and minimalism; where a question has no house answer, Fluent 2's answer is the default.

Components are React, in `components/bundle.js` as `window.HoobiDesign`. Styling is Tailwind v4 utilities on the tokens below (`bg-surface`, `text-text-dim`, `rounded-panel`, `p-4`); `components/bundle.css` holds every utility the components and the catalog use.

## Content

- A button names the action: "Rotate", "Regenerate", "Clear", "Set password", never "Confirm" or "OK".
- A free-text field has an example placeholder: `http://sonarr:8989`, `*/15 * * * *`, `-1001234567890`. Numbers show their default.
- An explanation lives on the `(i)` (`info` on every field, `FieldLabel`), on hover and keyboard focus, never in a paragraph under the field. The line under a field is for a validation `error` or a live readout the value demands.
- Wording overrides are for translation, never for helper copy.

## Colour

- Dark only: `color-scheme: dark`, no light variants. The layer scale is `color-bg` `#181c26` (page), `color-surface` `#1f2430` (cards, rows), `color-surface-raised` `#242936` (things that float), `color-chip` `#15181f` (one step below bg, fields inside a row).
- Surfaces are told apart by fill alone. Cards, pills and alerts carry no border and no shadow.
- Accent is restrained: `color-accent` is for the one primary action per view, the Tabs indicator, Progress fill, Spinner arc and the focus ring. Everything else is neutral.
- Text is `color-text` on every surface, `color-text-dim` for descriptions, `color-text-mute` for short tertiary labels only.
- Tones: `color-warn` = paused, a person must act; `color-success` = done; `color-danger` = failure; `color-info` = in progress. A stateful tone tints the **whole surface** as a solid `/15` fill (`bg-warn/15`): never a gradient, never a border. Over glass (`Toaster`) it is a `/20` wash.
- Links shift colour on hover, `color-accent-blue` to `color-accent-cyan`, and are never underlined. A button-shaped link (nav item) highlights its own surface (`hover:bg-surface`).
- The `color-accent-*` hues are the Ayu Mirage syntax scheme `CodeBlock` maps highlight.js onto.

## Type

- Hanken Grotesk everywhere (`font-sans`). Dank Mono (`font-mono`) only for a **machine string**: something a person copies, pastes, types exactly or compares character by character (a url, a key, a path, a cron expression, JSON). A name, a label, a heading, a timestamp, a status word or a count is sans; digits that must line up get `tabular-nums`.
- The ramp: `caption` 14, `body` 16, `body-strong` 16 at 500, `body-large` 18, `subtitle` 20 at 600, `title` 28 at 600, in rem against the 18px root (16px under 40rem). As utilities: `text-caption`, `text-body` and so on.
- Caption is de-emphasised by colour (`text-text-dim`), never by dropping below 14px. `caption-small` (12px) is for dense metadata only: version lines, timestamps.

## Layout and spacing

- `spacing` is 4px in device-independent pixels, not rem: `p-4` is 16px at any root size. Reach for the WinUI grid (4 / 8 / 12 / 16 / 24 / 32), not odd numbers.
- Control density: 32px (`h-8`) for Button md, Input, Select and Tabs; 28px (`h-7`) for Button sm; 48px chrome heights.
- Text in a filled box (a field, pill, chip, button) is vertically centred, never top-aligned with padding.
- Settings are one surface level: `SettingList` rows on `bg-surface`, a 1px seam of `bg-bg` between, a group title in caption text, never a box.
- Segmented cards are **sliced**: a 1px hairline of page background between full-bleed sections. `Divider` bleeds to the surface's edges by default; `Card padded={false}` lets flush content reach them.
- Mobile first: every component survives a 360px viewport. `min-w-0` on flex children, wrapping headers, scrollable tab strips, 44px touch targets under `pointer: coarse`.
- Every state a person can reach is reachable by URL: a page is a path, a filter or tab is in the query string, anything expandable has a static id.

## Shape and depth

- Radii: `radius-control` and `radius-chip` 4px for controls, `radius-panel` 8px for surfaces and overlays.
- Depth is fill, never shadow. The one shadow is `shadow-flyout`, on a flyout panel.
- The only strokes are the Tabs underline and hairline dividers. The only scrim is the Modal backdrop (smoke).
- No gradients, no decoration a component does not need, no double-signalling a state that the fill or the ring already shows.

## Focus

One language everywhere: the global `:focus-visible` ring, 2px solid `color-accent` at 2px offset (5.27:1 or more on every surface). Components never set `focus:outline-none` or restyle their own focus.

## Materials

Mirage is the house material (Fluent's mica, named for Ayu Mirage): an image blurred into the backdrop. `.mirage-layer` sits behind a whole app, `.mirage-scoped` is a card's own fill (`Card mirage`), `.mirage-edge` an accent strip at a list row's left edge, `.mirage-hero` a band behind a page head. `.mirage-flyout` (acrylic) is the fill of transient light-dismiss popups only: `Menu`, `Popover`, `ChipInput` suggestions, `Toaster` and tooltips. Modal surfaces take smoke instead. Mirage tints at part opacity, so it needs an opaque page beneath it.

## Motion

Fluent 2's curves and durations, unmodified: `--ease-decelerate` for things entering, `--ease-accelerate` for things leaving, `--ease-standard` for change in place; 150, 250 and 300ms. `prefers-reduced-motion` is respected globally.

## Iconography

Fluent System Icons: consumers install `@fluentui/react-icons` (the 20px Regular variants) and pass them as ReactNodes; the library ships no icon set. A one-off glyph drawn by hand follows the 20px grid with 1.5px strokes. There is no logo; an app's mark is its initial on its own hue (`Shell`'s brand, `markFavicon`).

## Components

- Control state is shown on the control: a badge, a lock, an icon, a tone.
- Anything destructive, irrecoverable or with a byproduct confirms through `ActionDialog`. `ConfirmButton` is for trivial, reversible actions only.
- Async buttons are `ActionButton`: busy, then success or failure on the button. An unrequested update is `toast()`; a press result never is.
- Every tooltip is `Tooltip`; never a native `title=`.
- A component is a primitive with slots, never a product concept: a scheduled task or a connection is `SettingRow` + `Badge` + `ActionButton` composed in the consumer.
- Library components are not restyled inside a consumer; a needed change goes into the library.
