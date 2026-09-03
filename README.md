# @hoobi/design

React components and design tokens for Hoobi apps.

> **Design identity.** hoobi-design is a **dark-mode-preference** library using the **Ayu Mirage**
> colour scheme heavily, with components, fonts and spacing **heavily influenced by WinUI 3
> (Fluent 2)**. **Minimalism heavy.**

Zero runtime dependencies. Peer deps only: `react >=19`, `react-dom >=19`, `tailwindcss >=4.3`.

## Install

```
@hoobi:registry=https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/npm/registry/
always-auth=true
save-exact=true
```

```bash
pnpm add @hoobi/design
```

```css
/* your styles.css - one line, the library imports Tailwind itself */
@import '@hoobi/design/styles.css';
```

```tsx
import { Button, Card, Badge } from '@hoobi/design';
```

## Components

`Button` `Badge` `Card` `Modal` `Tabs` `Section` `Progress` `Spinner` `Alert` `Input` `Select`, plus
the `cx` class-joining helper.

Components are added when a consumer actually needs one. No speculative components, no props added
"for later".

## Tokens

Everything is a Tailwind v4 `@theme` token in `styles.css`, so `bg-surface`, `text-text-dim`,
`rounded-panel` and friends are all real utilities.

| Group    | Tokens                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| Surfaces | `bg`, `surface`, `surface-raised`, `border`, `chip`, `chip-border`                                            |
| Text     | `text`, `text-dim`, `text-mute`, `on-accent`                                                                  |
| Ayu hues | `accent-blue`, `accent-red`, `accent-cyan`, `accent-yellow`, `accent-orange`, `accent-purple`, `accent-green` |
| Action   | `accent`, `accent-hover`, `accent-fill`                                                                       |
| Semantic | `success`, `warn`, `danger`, `info`                                                                           |
| Radius   | `chip` 4px, `control` 4px, `panel` 8px                                                                        |
| Type     | `caption` 12, `body` 14, `body-strong` 14@600, `body-large` 18, `subtitle` 20@600, `title` 28@600             |
| Spacing  | `--spacing: 4px`, so every spacing utility is `n * 4px`                                                       |

### WinUI 3 conventions

- **4px** radius on controls, **8px** on surfaces and overlays.
- **32px** standard control height (`h-8`); 28px for the small button. 44px minimum under
  `pointer: coarse`, so touch targets survive.
- Spacing and radii are **px**, matching WinUI's device-independent pixels. Text stays rem against
  the 18px root so it still tracks user zoom.
- Subtle 1px borders instead of shadows.
- **Restrained accent**: accent marks the one primary action, the selected tab, progress fill and
  the focus ring. Everything else is neutral.
- One focus language: a 2px outer ring at 2px offset, from the global `:focus-visible`.

## Catalog

`catalog/` is a hand-rolled Vite reference page covering every token, the type ramp and every
component variant, tone, size and state, with copyable JSX for each.

```bash
pnpm run build
pnpm -C catalog dev
```

`pnpm -C catalog build` emits a single self-contained `dist/index.html` with the CSS, JS and
all four woff2 fonts inlined.

## Mobile

Every component has to survive a 360px viewport: `min-w-0` on flex children, wrapping headers,
horizontally scrollable tab strips, `dvh`-capped scrollable modals, `env(safe-area-inset-*)` where
content reaches the bottom edge.

## Publishing

```bash
pnpm version minor
git push --follow-tags
```

The `v*` tag fires the `hoobi-design` pipeline, which typechecks, builds, guards that the tag
matches `package.json`, and publishes to the Hoobi feed.
