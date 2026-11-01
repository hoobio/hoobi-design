using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Layout;
using Avalonia.Threading;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia;

public static class HoobiChrome
{
    private const string InactiveClass = "inactive";

    public static IDisposable Attach(Window window, Action? onSessionEnding = null)
    {
        ArgumentNullException.ThrowIfNull(window);
        if (window.Content is not Layoutable root)
        {
            throw new InvalidOperationException("HoobiChrome.Attach needs the window's content root; call it after InitializeComponent.");
        }

        return new Attachment(window, root, onSessionEnding);
    }

    public static IDisposable AttachDragHandle(Control handle)
    {
        ArgumentNullException.ThrowIfNull(handle);
        return new DragHandle(handle);
    }

    public static void CentreOnScreenOf(Window window, PixelPoint anchor)
    {
        ArgumentNullException.ThrowIfNull(window);
        if (window.Screens.ScreenFromPoint(anchor) is not { } screen)
        {
            return;
        }

        var area = screen.WorkingArea;
        var size = PixelSize.FromSize(window.ClientSize, screen.Scaling);
        window.Position = new PixelPoint(area.X + ((area.Width - size.Width) / 2), area.Y + ((area.Height - size.Height) / 2));
    }

    private sealed class DragHandle : IDisposable
    {
        private readonly Control _handle;

        public DragHandle(Control handle)
        {
            _handle = handle;
            handle.PointerPressed += OnPressed;
        }

        public void Dispose() => _handle.PointerPressed -= OnPressed;

        private void OnPressed(object? sender, PointerPressedEventArgs e)
        {
            if (TopLevel.GetTopLevel(_handle) is not Window window
                || !e.GetCurrentPoint(_handle).Properties.IsLeftButtonPressed
                || (e.Source as Visual)?.GetSelfAndVisualAncestors().TakeWhile(visual => visual != _handle).Any(visual => visual is InputElement { Focusable: true }) == true)
            {
                return;
            }

            e.Handled = true;
            if (e.ClickCount == 2)
            {
                if (window.CanMaximize)
                {
                    window.WindowState = window.WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
                }

                return;
            }

            window.BeginMoveDrag(e);
        }
    }

    private sealed class Attachment : IDisposable
    {
        private readonly Window _window;
        private readonly Action? _onSessionEnding;
        private readonly bool _hooked;
        private nint _cloaked;
        private bool _sessionEnding;

        public Attachment(Window window, Layoutable root, Action? onSessionEnding)
        {
            _window = window;
            _onSessionEnding = onSessionEnding;
            if (!OperatingSystem.IsWindows())
            {
                return;
            }

            // WinUI keeps the 1px top resize border outside its client area, where Avalonia's extended client area draws over it.
            root.Margin = new Thickness(root.Margin.Left, 1, root.Margin.Right, root.Margin.Bottom);
            window.Activated += OnActivationChanged;
            window.Deactivated += OnActivationChanged;
            window.Opened += OnOpened;
            if (window.TryGetPlatformHandle() is { HandleDescriptor: "HWND", Handle: var handle })
            {
                Win32Properties.AddWndProcHookCallback(window, OnWndProc);
                _hooked = true;
                if (!window.IsVisible)
                {
                    // An extended client area shows one white frame before Avalonia's first frame is composed.
                    HoobiChromeInterop.Cloak(handle, cloaked: true);
                    _cloaked = handle;
                }
            }
        }

        public void Dispose()
        {
            _window.Activated -= OnActivationChanged;
            _window.Deactivated -= OnActivationChanged;
            _window.Opened -= OnOpened;
            if (_hooked)
            {
                Win32Properties.RemoveWndProcHookCallback(_window, OnWndProc);
            }
        }

        private void OnActivationChanged(object? sender, EventArgs e) => UpdateCaptionButtons();

        private void OnOpened(object? sender, EventArgs e)
        {
            UpdateCaptionButtons();
            if (_cloaked is not 0 and var handle)
            {
                _cloaked = 0;
                _window.RequestAnimationFrame(_ => _window.RequestAnimationFrame(_ => HoobiChromeInterop.Cloak(handle, cloaked: false)));
            }
        }

        // FluentAvalonia binds the caption buttons' inactive class to an ancestor Window, but the decorations layer is the window's sibling under its host.
        private void UpdateCaptionButtons()
        {
            foreach (var button in _window.GetVisualParent()?.GetVisualDescendants().OfType<Button>() ?? [])
            {
                if (button.Classes.Contains("CaptionButton"))
                {
                    button.Classes.Set(InactiveClass, !_window.IsActive);
                }
            }
        }

        private nint OnWndProc(nint hWnd, uint msg, nint wParam, nint lParam, ref bool handled)
        {
            // Moving onto a drawn caption button ends client tracking with WM_MOUSELEAVE right after Avalonia's non-client move set the hover, and Windows resends the move only 0.6s to 1.7s later.
            if (msg == HoobiChromeInterop.WmMouseLeave)
            {
                HoobiChromeInterop.RepostCaptionButtonMove(hWnd);
            }
            // Windows sends these to request or confirm a logoff, reboot or app-update shutdown; unhandled, close-to-tray would hold the app until Windows force-kills it.
            else if (msg is HoobiChromeInterop.WmQueryEndSession or HoobiChromeInterop.WmEndSession && _onSessionEnding is { } ending && !_sessionEnding)
            {
                _sessionEnding = true;
                Dispatcher.UIThread.Post(ending);
            }

            return 0;
        }
    }
}
