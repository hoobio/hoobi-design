# Avalonia tokens and native divergences

### Tokens and native divergences

`tokens/tokens.css` is the one token source for both platforms. It is CSS custom properties in an `@theme static` block, so the web takes it verbatim and its comments stay beside the values. It holds every colour, radius, shadow, duration and easing, the native-only ones included (Fluent's dark-theme ARGB values that FluentAvalonia keys expect, the clear rest states, the dialog strokes), and those are web tokens too. Alpha is `#rrggbbaa` or `color-mix(in srgb, <colour> <p>%, transparent)`, which gives the colour's RGB at alpha `round(p * 255 / 100)`.

`node tokens/build.mjs` (or `pnpm tokens`) copies the block into `react/styles.css` and generates `Themes/Tokens.axaml`: a `Hoobi<Name>Color` and `Hoobi<Name>Brush` per colour, `HoobiRadius*`, `HoobiShadow*` (`BoxShadows`) and `HoobiEase*`. Durations are web tokens only: `Motion` holds the native durations, because they are zero when Windows turns off client-area animation. `Resources.axaml` holds no literal colour: every brush refers to a generated key (`Transparent` is allowed, as in HOOBI001). `check.mjs` (and `node tokens/build.mjs --check` alone) fails when `styles.css` or `Tokens.axaml` is stale and when `Resources.axaml` holds a hex or named colour. Hand edits to either generated file are lost on the next generation.

The native theme differs from the web in these places:

- Type sizes follow WinUI: caption 12, control content 13, body 14.
- Code and keys use Cascadia Mono. Dank Mono is for the web.
- Hanken Grotesk ships as static Regular, SemiBold and Bold TTFs, because Avalonia 12 does not map `FontWeight` onto a variable font's `wght` axis.
- Text on an accent fill is `#181C26`.

Value keys carry the `Hoobi` prefix (`HoobiBgBrush`, `HoobiAccentColor`). Control themes and resources that override FluentAvalonia or WinUI keep the WinUI names (`TitleBarHeight`, `CaptionTextBlockFontSize`).

Classes: `Button.RowOverlay` (with `SubtleButtonStyle`, laid over a `Border.Row`), `ToggleButton.Disclosure`, `TextBox.Multiline`, `TextBox.Invalid`, `ComboBox.Invalid`, `TextBox.revealPasswordButton` (hold to reveal), `ItemsControl.KeyCaps` and `Border.KeyCap` (an accent fill with SemiBold text in the text-on-accent colour, `HoobiBg`), `Highlighted` on `Border.Row`, `Border.Group` and `SettingsCard`, `Danger` on `FAContentDialog` (critical primary button), `Icon` and `Danger` on `CaptionButtonTheme`. `HoobiHighlightBrush` is the web `bg-accent/15` composited over `bg`. Every popup surface takes the Mirage acrylic by default, plain `FlyoutPresenter` included; `FlyoutPresenter.Tinted` is kept and changes nothing. Folds use `SlideExpander`, which moves its content as WinUI's Expander does: the fold takes its full height at once and the content slides down from above over 333 ms (`0,0,0,1`), then slides up over 167 ms (`1,1,0,1`) before the fold closes; it snaps under reduced motion. `SettingsCard.ExpandedContent` hosts its rows in one, so `IsExpanded` animates by default, and the card's chevron turns on the same timings.

`SettingsCard.Preview` sits between the header and the control and shows only while it fits beside the unwrapped header; inside a `SettingsCard.PreviewScope="True"` panel the sibling previews show all together or not at all. A clickable card's hover and pressed wash covers the whole card to its corners, child rows and nested cards in `ExpandedContent` start 58 px in (`SettingsExpanderItemPadding` 58,8,44,8), the expander chevron is a 32 px box with a centred 16 px glyph 22 px from the control, and a `ComboBox` in a card stretches to its column. A `Button.RowOverlay` is laid over its row as a sibling: a `ContentControl` or `UserControl` clips to its bounds in Avalonia 12, so an overlay inside one with a negative margin draws inset.

Popup acrylic. On Windows 11 (build 22000 and later) with transparency effects on, a popup in its own window (a `PopupRoot`) takes the system acrylic, as a WinUI flyout does: `Acrylic` sets `TransparencyLevelHint` to `AcrylicBlur` and fills the surface with `HoobiFlyoutAcrylicTintColor` at 82%, so the desktop and other windows show through, also where the popup runs past the app window. The system acrylic exists only under `Win32CompositionMode.WinUIComposition`; it is a host-backdrop Gaussian blur at a fixed 30 (the same amount as WinUI's `AcrylicBrush`), with no tint, luminosity or saturation that can be set, so the tint is a plain fill over it. 82% is the lowest tint that keeps danger text above 4.5:1 over a white window. The surface takes the hand-drawn blur of the app window (`AcrylicMode.Blur`, the same 82% tint) when the popup is in the overlay layer, on other platforms, on Windows 10, with transparency effects off, or when the window did not get `AcrylicBlur` (DirectComposition, RedirectionSurface, Wine), and the solid `HoobiFlyoutAcrylicFallbackColor` while the owner window is inactive. Avalonia clips the backdrop to rounded corners only through the app-wide `Win32PlatformOptions.WinUICompositionBackdropCornerRadius`, so `Acrylic` rounds each popup window itself with `DWMWA_WINDOW_CORNER_PREFERENCE` = `DWMWCP_ROUND` (8 px, the `OverlayCornerRadius`) and removes the 1 px system border with `DWMWA_BORDER_COLOR` = `DWMWA_COLOR_NONE`. The backdrop fills the whole popup window, so a popup surface fills its window exactly: no margin, no transform, no `BoxShadow`, and `WindowManagerAddShadowHint` off (the DWM shadow of the rounded window is the shadow). The gap between a popup and its target is `PopupGap.Size` (4 on `MenuFlyoutPresenter`, `FlyoutPresenter.Below` and the ComboBox list), set as the Popup offset on the side the popup opened: below, above, left or right of the target, so a flipped popup keeps the gap and does not overlap its target.

- `NavButtonStyle` and `.Selected` (`HoobiNavItemHeight`, `HoobiNavItemMargin`)
- `TextBlock.NavGlyph`
- `Button.Small`
- `Button.DropDown`
- `Button.Fill`
- `Button.ColumnHeader`
- `Button.Round`, `Button.Round.Accent` and `.Compact`
- `Button.Row`
- `Button.Tile` and `Button.Tile.XLarge`
- `Border.Tile.Small`
- `ToggleButton.GlyphPick`
- `ToggleButton.Swatch`
- `ToggleButton.Chevron`
- `TextBlock.Chevron` and `.Expanded`
- `TextBlock.DragHandle`
- `MenuItem.Danger`
- `TextBlock.PageTitle`
- `TextBlock.Dim`
- `TextBlock.Mute`
- `TextBlock.EmptyState`
- `Border.Divider` (`HoobiDividerBleed`)
- `Border.Badge.Solid`
- `Border.Dot`
- `Border.Inset`
- `Border.Slot`
- `ContentPresenter.Lifted`
- `Border.Row.Hairline`
- `Border.Avatar` and `.Small`
- `ProgressBar.Thin`
- `TextBox.Code`
- `FAContentDialog.Bare`
- `Border.Alert.Success` and `Border.Alert.Info`
- `SliderStyle` (the default horizontal `Slider`), `SliderFillButtonStyle`, `Slider.OverMeter`, `Slider.Seek`
- `FloatingPanelStyle` and `.Acrylic` (`HoobiFloatingPanelBrush`, `HoobiFloatingPanelAcrylicBrush`)
- `SettingsCard.IsExpanded` (`HoobiSettingsExpandedHeaderBrush`)
- `SettingsCard.Item`
- `ScrollViewer.NarrowScrollBand`

A button with its own fill takes the `Tinted` class. The hover and pressed fills come from `ColorShade.Hover` and `ColorShade.Pressed`, which mix the fill towards `HoobiBgColor`.

Components and helpers:

- `LevelMeter` (`Levels`, `Hold`, `Volume`, `WarnAt`, `DangerAt`, `Position`)
- `RichTextBlock` (`Blocks`, `LinkClicked`, `LinkCommand`), `RichBlock`, `RichBlockKind`, `RichRun`
- `TextHighlight.Start` and `TextHighlight.Length`
- `IconImage` (`FallbackSource`, `Failed`)
- `ImageLoader` (`Load`, `Scaling`) and `RemoteImage` (`MarkFailed`, `HasFailed`, `Failed`)
- `Tone`, `Toned.Tone`, `Toned.BrushKeyFor`, `Toned.ButtonThemeKeyFor`, `Toned.GlyphKeyFor`, `Toned.ClassFor`
- `ToneConverters.Brush`, `ToneConverters.ButtonTheme`, `ToneConverters.Glyph`, `ToneConverters.Initials`
- `PageEntrance.PlayAsync`
- `HoverSubmenu.IsEnabled`
- `Motion.Faster`, `Motion.Fast`, `Motion.Normal`, `Motion.Expand`, `Motion.Decelerate`, `Motion.Accelerate`, `Motion.PointToPoint`, `Motion.Collapse`, `Motion.SubmenuDelay` (`Motion.Duration`, 150 ms, is obsolete)
- `HoobiChrome.Cloak`, `HoobiChrome.DoubleClickTime`, `HoobiChrome.MinimiseThenHide`, `HoobiChrome.ApplyTransparency`
- `ToastWindow.Show(source, text, Tone)` and `ToastWindow.Tone`
