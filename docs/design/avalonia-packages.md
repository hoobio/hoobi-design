# Avalonia packages

## Avalonia packages

`dotnet/` (`Hoobi.Design.slnx`) holds three NuGet packages. One `v*` tag publishes them with the npm package (see Publish process).

| Package                         | Contents                                                                                                                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Hoobi.Design.Avalonia`         | `HoobiTheme` (tokens, control themes, dialogs, settings cards, glyphs), the fonts, `UseHoobiDesign`, `AppDialogs`, `ColorShade`, `HoobiChrome`, `IdleMemory`, `ToastWindow`, `ForegroundGate`, `TrayMenuFocus`, `DialogIntent`, and the buildTransitive props and targets |
| `Hoobi.Design.Avalonia.Testing` | `HoverFlashProbe`, `PopupSurfaceProbe`, `TextCentring`, `HeadlessSession`                                                                                                                                                                                                 |
| `Hoobi.Desktop.Windows`         | Windows plumbing (see Windows desktop apps)                                                                                                                                                                                                                               |

### Consumer setup

- `Directory.Packages.props` pins `Hoobi.Design.Avalonia`, `Hoobi.Desktop.Windows` and (in test projects) `Hoobi.Design.Avalonia.Testing` to exact versions. Avalonia and FluentAvaloniaUI are pinned to the versions the library uses.
- `nuget.config` lists nuget.org and the Hoobi feed (`https://pkgs.dev.azure.com/Hoobi/Hoobi/_packaging/Hoobi/nuget/v3/index.json`). A `packageSourceMapping` maps `Hoobi.*` to the Hoobi feed and `*` to nuget.org.
- `App.axaml` holds `<hoobi:HoobiTheme />` in `Application.Styles` (`xmlns:hoobi="using:Hoobi.Design.Avalonia"`) and `RequestedThemeVariant="Dark"`.
- The `AppBuilder` calls `.UseHoobiDesign()`. It registers the font collection, the emoji fallback, popup placement, the scroll indicator and the dialog resource scope.
- A window with the Hoobi title bar sets `ExtendClientAreaToDecorationsHint="True"`, `ExtendClientAreaTitleBarHeightHint="{StaticResource TitleBarHeight}"` and `WindowDecorationsTheme` to `HoobiWindowDecorations` (minimise, maximise, close) or `HoobiCloseOnlyDecorations`. The drag area carries `chrome:WindowDecorationProperties.ElementRole="TitleBar"`. Content that takes clicks or a right-click (buttons, a picker) carries `ElementRole="User"`.
- A title row with its own context menu carries `ElementRole="User"` (so a right-click reaches that menu, not the system menu) and drags through `HoobiChrome.AttachDragHandle(row)`. A plain drag area keeps the `TitleBar` role.
- `HoobiChrome.CentreOnScreenOf(window, point)` centres a window on the screen that holds the point.
- The font licences are copied to `licenses/fonts/` in the output and publish folders.
- The window calls `HoobiChrome.Attach(this, onSessionEnding)` after `InitializeComponent`. It sets the 1px top margin on the content root, keeps the caption buttons' `inactive` class in step with activation, reposts the caption hover after `WM_MOUSELEAVE`, cloaks the window until its first frame, and posts `onSessionEnding` to the UI thread once on `WM_QUERYENDSESSION` or `WM_ENDSESSION`. Disposing the result removes the handlers. It does nothing on other platforms. An app does not copy this code.
