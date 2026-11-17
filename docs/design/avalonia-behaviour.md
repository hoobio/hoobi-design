# Avalonia behaviour and rules

### Motion

Anything that animates in WinUI 3 animates the same way here, with WinUI's duration and easing; an approximation is named as one.

| WinUI name                                     | Value           | Key                                            |
| ---------------------------------------------- | --------------- | ---------------------------------------------- |
| `ControlFasterAnimationDuration`               | 83 ms           | `Motion.Faster`, `HoobiDurationFaster`         |
| `ControlFastAnimationDuration`                 | 167 ms          | `Motion.Fast`, `HoobiDurationFast`             |
| `ControlNormalAnimationDuration`               | 250 ms          | `Motion.Normal`, `HoobiDurationNormal`         |
| Expander and list reorder                      | 333 ms          | `Motion.Expand`, `HoobiDurationExpand`         |
| `ControlFastOutSlowInKeySpline`                | `0,0,0,1`       | `Motion.Decelerate`, `HoobiEaseDecelerate`     |
| Accelerate                                     | `1,0,1,1`       | `Motion.Accelerate`, `HoobiEaseAccelerate`     |
| Point to point (nav, split view, list reorder) | `0.1,0.9,0.2,1` | `Motion.PointToPoint`, `HoobiEasePointToPoint` |
| Expander collapse                              | `1,1,0,1`       | `Motion.Collapse`, `HoobiEaseCollapse`         |

Every duration is zero when Windows turns off client-area animation (`Motion.Enabled`). Package XAML reads the durations through `{x:Static hoobi:Motion.*}`; the `HoobiDuration*` resources are set from `Motion` when `HoobiTheme` loads.

Where the values apply: ToggleSwitch knob size and fill fades 83 ms, knob slide 167 ms (WinUI uses a `RepositionThemeAnimation` with no value in its XAML, so 167 ms `0,0,0,1` is an approximation); the FluentAvalonia Slider thumb scales over 250 ms on hover and press and 167 ms back; dialogs scale over 250 ms in and 167 ms out and fade over 83 ms both ways; folds and chevrons open over 333 ms and close over 167 ms; Segmented items press over 167 ms `0,0,0,1`; scroll bars expand over 167 ms and fade over 83 ms; `GlidingWrapPanel` moves over 333 ms `0.1,0.9,0.2,1`; the NavigationView pane fades over FluentAvalonia's 350 and 120 ms with `0.1,0.9,0.2,1`. Popup, flyout and ToolTip animations are FluentAvalonia's.

### Gallery

`samples/Hoobi.Design.Gallery` is the native catalog: every style key and control theme the package ships is on a page. `GalleryTests` renders every page, each open popup, the toast window and the window decorations to PNG files when `HOOBI_GALLERY_PNG_DIR` names a folder. Changed styles are looked at in those PNGs before commit, as the web catalog is looked at in the browser.

### Consistency enforcement

The `buildTransitive` targets run before `CoreCompile` in every consuming project and fail the build on:

- `HOOBI001`: a literal colour in an `.axaml` file: a hex or named colour in a colour property (`*Background`, `*Foreground`, `*Fill`, `*Stroke`, `*Color`, `*Brush`) as an attribute, a setter `Value` or a property element, the content of a `Color` or `SolidColorBrush` element, or a hex inside a `BoxShadow` or `BoxShadows` value. Hex in other places (a `#Name` selector, text) is not a colour. `Transparent` is allowed as a hit-test fill. A literal needs `<!-- hex-ok: reason -->` on the line above.
- `HOOBI002`: an `x:Key` that the package already defines, at app scope: in a file whose root is a `ResourceDictionary` or `Styles`, or in `Application.Resources`, `Styles.Resources`, `Style.Resources` or `ControlTheme.Resources`. A key in an element's own `Resources` or `Styles` (a control, window or dialog, such as `ContentDialogMinWidth` in `FAContentDialog.Resources`) is a local override and is allowed. The list of package-owned keys is generated when the package is packed.

- `HOOBI003`: a popup surface that drops the Mirage acrylic: `Acrylic.IsEnabled` set to False, a Background on a popup presenter (`FlyoutPresenter`, `MenuFlyoutPresenter`, `ToolTip`, `ContextMenu`, the picker presenters, or the ComboBox, AutoCompleteBox and CalendarDatePicker popup borders), or an `x:Key` of `FlyoutPresenterBackground`, `MenuFlyoutPresenterBackground`, `ComboBoxDropDownBackground` or `HoobiFlyoutAcrylic*` at any scope. An exception needs `<!-- popup-ok: reason -->` on the line above.

`HoobiDesignChecks=false` turns the checks off for a project. `HoobiDesignChecksExclude` removes named `.axaml` files from them.

Every consumer runs `HoverFlashProbe` over its own pages and popups in its tests.
`PopupSurfaceProbe.Probe(top)` opens each ComboBox, flyout button and context menu under a TopLevel (`CheckOpen(top)` checks the popups already open, and opens each submenu in them) and reports a popup with no acrylic surface or with a fill that covers it; the gallery tests run it on every page. Consumers stay on the current package version through Renovate. The rule in Library-only changes (library components are not mutated or restyled inside a consuming service) applies to native apps in full.

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

`IdleMemory` trims a resident app that spends most of its time in the tray. Create it with the main window (`new IdleMemory(window)`; the delay defaults to 3 seconds), or for every window of the app with `IdleMemory.ForApplication(lifetime)`, which follows windows opened later and treats the app as idle when no window is active and visible. It trims when the window loses activation or is hidden and stays that way for the delay, and `NotifyBackgroundWorkCompleted()` trims after a background pass; it can be called from any thread and runs the trim on the UI thread. A trim runs when the window is not active or not visible. A trim is a blocking, compacting, aggressive collection with the large object heap compacted, followed by `EmptyWorkingSet`. While the window is hidden the process runs in EcoQoS, which throttles execution speed only. `Dispose` turns EcoQoS off. Idle priority is never used: it starves the UI thread, and a game that waits on the app with a synchronous message stalls.

Measure memory with `tools/Measure-Memory.ps1 <process name>`. The number is the private working set, as Task Manager shows it. Measure with the app in the tray, and record the figures before and after a change in the app's `AGENTS.md`. Steward's reference figures: 4 to 15 MB private working set in the tray between passes against 128 MB before trimming, 7 to 14 ms of GC pause per trim, and about 100 MB of committed private bytes (Skia, ANGLE, the runtime) unchanged.

### Avalonia and Windows rules

- In Avalonia 12 a template's own value outranks a style setter that has no pseudo-class. Target the template part (`/template/ ContentPresenter#PART_ContentPresenter`).
- An unscoped `Button:pointerover` override reaches the buttons inside flyouts. Name the element (`Button.Tinted:pointerover /template/ ContentPresenter#PART_ContentPresenter`).
- A `Button.Flyout` closes on a second press of its button. An `AttachedFlyout` opened from `Click` does not.
- Animate a `TranslateTransform` property (`TranslateTransform.YProperty`) with the visual as the animation target, after setting a `TranslateTransform` as its `RenderTransform`. Animating `Visual.RenderTransformProperty` throws "No animator registered for the property RenderTransform", and the error is swallowed when the animation is fire-and-forget.
- A `StyledProperty` change callback does not assign an inner `DataContext`.
- Compiled bindings need `x:DataType` on the element or an ancestor.
- Avalonia rounds .5 to even where WinUI rounds up. A WinUI layout that needs the round-up adds 0.01 (padding 15.01).
- Variable fonts do not render per weight. Ship static TTFs.
- FluentAvalonia resource names clash with unprefixed app keys. App keys carry the `Hoobi` prefix and are referenced with `StaticResource`.
- Show every dialog through `AppDialogs.ShowAsync` or `AppDialogs.ShowMessageAsync`. They queue a second dialog behind the open one, wait for `ForegroundGate`, cancel a `Hide()` that arrives before the dialog is shown (FluentAvalonia 3.1.0 throws on a dialog that was never shown), return `None` and release the queue when the owner closes, and shorten the open and close fades to 83 ms.
- `SmoothScroll.Centre(viewer, target)` scrolls a target to the middle of its scroll viewer with the wheel easing. Use it in place of `BringIntoView` when the app moves the user to a control, because `BringIntoView` stops with the control at the nearest edge.
- A dialog is 440 wide and keeps a 24px gutter (`HoobiDialogGutter`) to the window edges. In a window under 488 wide the dialog is narrower, down to `ContentDialogMinWidth` (320).
- Avalonia's `Button.OnKeyUp` clicks on a Space key-up with no key-down, so a key held over from before a dialog opened can confirm it. `DialogIntent` (applied by `AppDialogs`) counts a press when its key-down came after the dialog opened.
- A tray menu opens without focus; `TrayMenuFocus` gives it focus. `SetForegroundWindow` is refused to a process that did not receive the last input, and a tray click goes to Explorer, so `ForegroundGate.ForceForeground` borrows Explorer's input queue for the call.
- An app that closes to the tray quits on `WM_QUERYENDSESSION` or `WM_ENDSESSION`: it passes its quit to `HoobiChrome.Attach` as `onSessionEnding`.
- Hiding a window before the minimise animation ends cancels the animation.
- The window is cloaked (DWM) until its first frame is composed, then uncloaked two animation frames later. Without it a white frame shows on open. `HoobiChrome` does this for a window that is not yet shown when it is attached.
- WinUI keeps the 1px top resize border outside its client area, and an extended client area draws over it. The shell content sits 1px down (`Margin.Top` of 1, set by `HoobiChrome`), and `AppDialogs` reads that margin to centre the dialog panel.
- Drawn caption buttons are siblings of the window under its host, so a `Window:inactive` selector never matches them. `HoobiChrome` sets an inactive class on them on open, activation and deactivation. Moving onto a caption button from the client area ends client tracking with a `WM_MOUSELEAVE` that clears the hover, so `HoobiChrome`'s window procedure hook posts a `WM_NCMOUSEMOVE` for the cursor position when `WM_MOUSELEAVE` arrives over a caption button.
- A toast window is `WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW` and places itself by `PixelRect` per monitor. `ToastWindow` does both.
- The first real window pays about 250 ms to load XAML. A hidden throwaway window created at startup pre-loads it.
- `Microsoft.Win32.Registry` as a `PackageReference` fails with NU1510. The type is in the framework.
- CommunityToolkit `[ObservableProperty]` on a field raises MVVMTK0045. Use partial properties.
- FluentAvaloniaUI pulls in DataGrid, which is not trim-safe (IL2104). A trimmer run that trims nothing still lets `publish-clean` delete native DLLs.
- Tests run with `dotnet test --project <csproj>`.
- `Dispatcher.UIThread.RunJobs` does not fire dispatcher timers. A headless session pumps the dispatcher by hand (`HeadlessSession.Pump`, `HeadlessSession.WaitFor`).
- Two target frameworks run test processes at the same time. Each test uses its own temp folder.
- A `Mutex` is re-entrant on its owning thread. A single-instance test acquires the second instance on its own `Thread`.
