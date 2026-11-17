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
`--ease-standard` in place) and WinUI's durations (83/167/250ms, plus 333ms for expanders and
lists), layout on the 4px grid with 48px chrome heights. The web `styles.css` still uses 150ms in
places and is not yet on this set.

React component library and design tokens for Hoobi apps, with an Avalonia theme and three NuGet packages for the Hoobi desktop apps (`dotnet/`). Hanken Grotesk for text, Dank Mono for code on the web.
Published to the ADO Artifacts `Hoobi` feed (npm and NuGet) and consumed by mendarr on the web and by steward-companion, earmark and command-palette-bitwarden on the desktop.
The source is the GitHub repo `hoobio/hoobi-design` (MIT). CI, releases and the catalog site run on GitHub Actions; the package feed stays on Azure DevOps (Hoobi org) and is private.

The npm package has zero runtime dependencies. Peer deps only: react >=19, react-dom >=19, tailwindcss >=4.3.

`Hoobi.Design.Avalonia` depends on Avalonia 12.1.4 and FluentAvaloniaUI 3.1.0. `Hoobi.Design.Avalonia.Testing` depends on Avalonia.Headless. `Hoobi.Desktop.Windows` has no package dependencies.

## Layout

```
package.json                     # private workspace root: build, typecheck, test and tokens proxy to react/ and tokens/
tokens/
  tokens.css                         # the one token source: the @theme static block, every colour, radius, duration and easing
  build.mjs                          # tokens.css to react/styles.css @theme and dotnet Themes/Tokens.axaml; --check
react/                           # the npm package @hoobi/design
  package.json                       # name, version, exports, files
  styles.css                         # @theme static (generated), @font-face, base layer, utilities
  fonts/                             # Hanken Grotesk latin variable (+italic) + Dank Mono (woff2, fetched, gitignored); README.md has the licences
  src/*.tsx                          # one component per file, re-exported from src/index.ts
  test/                              # node:test against dist/
  check.mjs                          # the design-rule checks (below)
catalog/                         # hand-rolled Vite reference page (see docs/design/catalog.md)
dotnet/                          # Hoobi.Design.slnx: the Avalonia theme, the Windows helpers, their tests and the gallery
  src/Hoobi.Design.Avalonia/         # HoobiTheme (Themes/*.axaml), controls, fonts, buildTransitive props and targets
  src/Hoobi.Design.Avalonia.Testing/ # HoverFlashProbe, TextCentring, HeadlessSession
  src/Hoobi.Desktop.Windows/         # Store updates, start at sign-in, restart registration, single instance, watchdog
  samples/Hoobi.Design.Gallery/      # the native catalog
  tests/                             # one test project per package
  tools/Measure-Memory.ps1           # working set sampler
.github/workflows/               # ci.yml (every PR and push) and release-please.yml (release PR, publish, Pages)
release-please-config.json       # with .release-please-manifest.json: the one version for npm and NuGet
```

The pnpm workspace root is the repo root, with `react/` and `catalog/` as its packages. The root `package.json` is private and is never published.

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
Vite hashes them and respects `base`. Both paths are relative to `styles.css` at the package root
(`react/` in this repo).

Consumers need the scoped registry in their own `.npmrc`:

```
@hoobi:registry=https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/npm/registry/
always-auth=true
save-exact=true
```

## Feature docs

Feature detail is in `docs/design/`, not in this file. Before work in an area, read its doc. A new or changed feature fact goes in that doc in the same change; this file holds only the index, build, delivery and rules. The docs have lines of up to 2 KB: search them with Grep (`-o` and a bounded pattern such as `.{0,300}term.{0,300}`), never a whole-file Read. The index is in `docs/README.md`.

| Before touching | Read |
|---|---|
| `react/src/*.tsx`: a component, its props, variants and behaviour, and the API-enforced rules | `docs/design/components.md` |
| `react/styles.css`, `tokens/`, `react/check.mjs`: design rules, page layout, container padding, actions and controls | `docs/design/design-rules.md` |
| `dotnet/src/Hoobi.Design.Avalonia` control styling against WinUI 3 | `docs/design/winui-conventions.md` |
| `dotnet/` Avalonia packages: install and consumer setup | `docs/design/avalonia-packages.md` |
| `dotnet/` Avalonia tokens and native divergences | `docs/design/avalonia-tokens.md` |
| `dotnet/` Avalonia motion, gallery, consistency enforcement, hover and press, memory and platform rules | `docs/design/avalonia-behaviour.md` |
| `dotnet/src/Hoobi.Desktop.Windows`: Store updates, start at sign-in, restart registration | `docs/design/windows-desktop.md` |
| `catalog/`: the reference site, its build and deployment | `docs/design/catalog.md` |
| The Claude Design System sync | `docs/design/claude-design-sync.md` |

## Code style

Strict TS, ESM, `.js` extensions on relative imports (NodeNext). Props interfaces exported and named
`<Component>Props`.

## Library-only changes

**Library components are not mutated or restyled inside a consuming service.** A component that
needs to look or behave differently is changed in hoobi-design and repinned - a
`className` hack or a hand-rolled copy in the consumer forks the design system silently. Library
changes are **backwards compatible, ideally additive**: new props default to the old
behaviour, tokens are added rather than repurposed, and anything breaking is called out in the
commit and shipped together with the consumer updates.

**Consumers define no components, web or native.** A custom control, UserControl, ControlTheme or class style on a generic control in a consumer moves into hoobi-design. A variant of an existing component is a prop or class on that component. A new component needs a one-line justification in its commit. Only domain views that compose library components stay in the consumer. When a consumer's version of a component is better than the library's, the improvement becomes the library default for every consumer.

## Build and verification

pnpm workspace: the repo root is the workspace root, `react/` (the library) and `catalog/` are its
packages, and the catalog links the library through `workspace:*`. One `pnpm install` at the root
installs both; the only lockfile is `pnpm-lock.yaml` at the root. The root scripts proxy to
`react/`, so every command below runs from the root.

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm test
(cd react && npm pack --dry-run)   # must list dist/, styles.css, fonts/ (no README.md), LICENSE, README.md, package.json and nothing else
```

`react/LICENSE` is a copy of the root `LICENSE`, because npm packs `LICENSE` and `README.md` from the
package folder. The two stay identical.

Dank Mono is licensed (`react/fonts/README.md`) and is not in the repo or its history. The three woff2 files are the
universal package `hoobi-design-fonts-dankmono` 1.0.0 on the Hoobi feed. `pnpm fonts:fetch`
downloads them into `react/fonts/` (gitignored) when `az` is signed in to the Hoobi org, and prints a
message and does nothing otherwise; mono text then falls back to Cascadia Mono or the system
monospace. The release jobs download the package before the build and fail when it is missing, so
the published npm package and the catalog site always ship the files. `fonts:fetch` fails too when
`CI` or `TF_BUILD` is set. `ci.yml` does not fetch it: CI needs no secret, so a fork's PR runs it
as is.

**Validate visually before pushing.** Every modified component (and any page its change touches)
gets looked at in the catalog dev server with the browser - not reasoned about, looked at:

```bash
pnpm run build                  # catalog consumes ../react via workspace:*, so library dist first
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

`pnpm run typecheck` also runs `react/check.mjs`, which enforces the rules this file states: no
literal hex in `src/*.tsx` (a `// hex-ok: reason` line above exempts, `hex-ok x2` covers two
lines), no bespoke focus styling, no box shadows, no `<button`/`<Button` JSX in `src/*.tsx` without a `type` (a `// type-ok: reason` line above exempts), and every export in `src/index.ts` has a page
in `catalog/src/pages.tsx`. It also fails when `react/styles.css` or `Themes/Tokens.axaml` is
stale against `tokens/tokens.css`, and when `Themes/Resources.axaml` holds a literal colour.

A token change is made in `tokens/tokens.css`, then `pnpm tokens` regenerates both platforms.
Sanity-check token to utility generation after it:

```bash
cd react && pnpm dlx @tailwindcss/cli@4.3.3 -i styles.css -o ./.tw-check.css   # gitignored
```

## Publish process

The end-to-end ritual (verify -> merge the release PR -> publish to green -> Design System sync
decision -> consumer repin) is the **`release` skill** (`.claude/skills/release/`).

release-please owns the version (`release-please-config.json`, `.release-please-manifest.json`).
Nobody runs `pnpm version` or pushes a tag by hand. On each push to `main` the `Release` workflow
(`.github/workflows/release-please.yml`) runs release-please through the release-please GitHub App
(the `hoobio/pipeline-tools` step, repo secrets `RELEASE_PLEASE_APP_ID` and
`RELEASE_PLEASE_APP_PRIVATE_KEY`), which keeps one release PR open. The PR stamps the manifest,
`react/package.json` (an `extra-files` entry) and `CHANGELOG.md`; `dotnet/Directory.Build.props`
reads the NuGet version from `react/package.json`, so one release publishes npm and NuGet together.

Merging the release PR tags `v<version>`, and the same run then starts the release jobs, which run
on a release only:

- `publish`: checks that the tag matches `react/package.json`, signs in to Azure through OIDC,
  fetches Dank Mono, typechecks, builds, runs `npm publish ./react` (skipped when that version is
  already on the feed), runs `dotnet test` on `Hoobi.Design.Avalonia.Tests` (the Windows test
  project cannot run on Linux), packs the three projects with `-p:Version=<version>` and pushes the
  `.nupkg` files with `--skip-duplicate`.
- `pages-build` and `pages-deploy`: build the catalog with Dank Mono and deploy it to GitHub Pages.

`ci.yml` runs on every PR and every push to `main`: install, the token check, typecheck, build,
the node tests, the catalog build, the .NET build and `Hoobi.Design.Avalonia.Tests`. It needs no
secret. The `Build and test` check is required on `main`.

The feed sign-in is OIDC, with no stored credential: the job gets `id-token: write`, runs
`azure/login` with the repo secrets `ADO_HOOBI_ARTIFACTS_PULL_CLIENT_ID` and `ADO_HOOBI_TENANT_ID`,
and takes a token for the Azure DevOps resource (`499b84ac-1321-427f-aa17-267ca6975798`). That
token is the npm `_password`, the NuGet source password and `AZURE_DEVOPS_EXT_PAT` for the font
download. Tenant and client IDs are repo secrets, never variables or literals. The identity is the
Entra app `hoobi-github-ado-artifacts` in the Hoobi tenant, with Contributor on the feed and one
flexible federated credential for every `hoobio` repo (`repository_owner_id` is in the expression
because Entra rejects `sub` alone as mutable). Consumers restore the same way. The Hoobi feed
rejects anonymous restore with 401.

ADO feed versions are immutable: a wrong publish consumes the version number permanently, which the
tag check guards against. The build step is explicit rather than leaning on `prepublishOnly`,
because `ignore-scripts=true` in a user `.npmrc` silently skips lifecycle scripts and would publish
a stale `dist`.

## Workflow

Work directly on `main` and push directly to `main`. Standing permission, no worktrees, no PRs, no
feature branches for this repo. Test directly: build it, link it into the consumer, look at it.

Commits use conventional-commit + gitmoji.

A PR (the release PR and Renovate's included) merges through GitHub auto-merge, squash only, once
the `Build and test` check passes. Renovate (`renovate.json`, the Renovate GitHub App) groups
non-major and major updates and auto-merges security updates. A fork's PR runs `ci.yml` without
secrets.

## Known noise

pnpm ignores `always-auth` silently; npm (which still does the `npm publish` in the release job)
warns `Unknown project config "always-auth"`. It is kept because Azure Artifacts' own docs still
specify it, and it is harmless.
