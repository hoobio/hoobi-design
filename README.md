# hoobi-design

The Hoobi design system: Fluent Design 2 with the Ayu Mirage colour scheme, for the web and for Avalonia desktop apps. See `AGENTS.md` for the rules.

| Folder     | Contents                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `tokens/`  | The one token source: every colour, radius, duration and easing both platforms use                      |
| `react/`   | The npm package `@hoobi/design`: React components, `styles.css` and fonts (see `react/README.md`)       |
| `dotnet/`  | The NuGet packages `Hoobi.Design.Avalonia`, `Hoobi.Design.Avalonia.Testing` and `Hoobi.Desktop.Windows` |
| `catalog/` | The web reference page for every token and component                                                    |

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
pnpm -C catalog dev
```

The code is under the MIT licence (`LICENSE`). The fonts keep their own licences (`react/fonts/README.md`).
