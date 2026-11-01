using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia;

public static class HoverSubmenu
{
    public static readonly AttachedProperty<bool> IsEnabledProperty =
        AvaloniaProperty.RegisterAttached<Button, bool>("IsEnabled", typeof(HoverSubmenu));

    private static readonly AttachedProperty<Hover?> HoverProperty =
        AvaloniaProperty.RegisterAttached<Button, Hover?>("Hover", typeof(HoverSubmenu));

    static HoverSubmenu() => IsEnabledProperty.Changed.AddClassHandler<Button>((button, change) =>
    {
        button.GetValue(HoverProperty)?.Dispose();
        button.SetValue(HoverProperty, change.GetNewValue<bool>() ? new Hover(button) : null);
    });

    internal static TimeProvider Time { get; set; } = TimeProvider.System;

    public static bool GetIsEnabled(Button element) => element?.GetValue(IsEnabledProperty) ?? throw new ArgumentNullException(nameof(element));

    public static void SetIsEnabled(Button element, bool value) => (element ?? throw new ArgumentNullException(nameof(element))).SetValue(IsEnabledProperty, value);

    private sealed class Hover : IDisposable
    {
        private readonly Button _button;
        private readonly ITimer _timer;
        private FlyoutBase? _flyout;
        private Control? _content;
        private TopLevel? _top;
        private bool _opening;
        private bool _closing;
        private bool _inside;
        private bool _dismissedInside;

        public Hover(Button button)
        {
            _button = button;
            _timer = Time.CreateTimer(_ => Dispatcher.UIThread.Post(Elapsed), null, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
            button.PointerEntered += OnButtonEntered;
            button.PointerExited += OnButtonExited;
            button.KeyDown += OnButtonKeyDown;
            button.AttachedToVisualTree += OnAttached;
            button.DetachedFromVisualTree += OnDetached;
            Track(TopLevel.GetTopLevel(button));
        }

        private Flyout? Flyout => _button.Flyout as Flyout;

        private bool IsOpen => Flyout?.IsOpen == true;

        public void Dispose()
        {
            _button.PointerEntered -= OnButtonEntered;
            _button.PointerExited -= OnButtonExited;
            _button.KeyDown -= OnButtonKeyDown;
            _button.AttachedToVisualTree -= OnAttached;
            _button.DetachedFromVisualTree -= OnDetached;
            Track(null);
            Watch(null);
            _timer.Dispose();
        }

        private void Schedule(bool opening)
        {
            (_opening, _closing) = (opening, !opening);
            _timer.Change(Motion.SubmenuDelay, Timeout.InfiniteTimeSpan);
        }

        private void Cancel()
        {
            (_opening, _closing) = (false, false);
            _timer.Change(Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
        }

        private void Elapsed()
        {
            if (_opening && !IsOpen)
            {
                Open();
            }
            else if (_closing)
            {
                Cancel();
                Flyout?.Hide();
            }
        }

        private void Open()
        {
            Cancel();
            Watch(Flyout);
            Flyout?.ShowAt(_button);
        }

        private bool Contains(PointerEventArgs e) => new Rect(_button.Bounds.Size).Contains(e.GetPosition(_button));

        private void Track(TopLevel? top)
        {
            _top?.RemoveHandler(InputElement.PointerMovedEvent, OnWindowPointerMoved);
            _top = top;
            _top?.AddHandler(InputElement.PointerMovedEvent, OnWindowPointerMoved, RoutingStrategies.Tunnel, handledEventsToo: true);
        }

        private void Watch(Flyout? flyout)
        {
            if (!ReferenceEquals(flyout, _flyout))
            {
                _flyout?.Closed -= OnFlyoutClosed;
                _flyout = flyout;
                _flyout?.Closed += OnFlyoutClosed;
            }

            var content = flyout?.Content as Control;
            if (ReferenceEquals(content, _content))
            {
                return;
            }

            if (_content is { } old)
            {
                old.PointerEntered -= OnContentEntered;
                old.PointerExited -= OnContentExited;
                old.KeyDown -= OnContentKeyDown;
            }

            _content = content;
            if (content is not null)
            {
                content.PointerEntered += OnContentEntered;
                content.PointerExited += OnContentExited;
                content.KeyDown += OnContentKeyDown;
            }
        }

        private void OnAttached(object? sender, VisualTreeAttachmentEventArgs e) => Track(TopLevel.GetTopLevel(_button));

        private void OnDetached(object? sender, VisualTreeAttachmentEventArgs e) => Track(null);

        // An open flyout's light-dismiss layer covers the window and takes the button's pointer events, so the window's own moves say where the pointer is.
        private void OnWindowPointerMoved(object? sender, PointerEventArgs e)
        {
            _inside = Contains(e);
            _dismissedInside &= _inside;
            if (!IsOpen)
            {
                return;
            }

            if (_inside)
            {
                Cancel();
            }
            else if (!_closing)
            {
                Schedule(opening: false);
            }
        }

        // A press on the button light-dismisses the flyout, and the button then sees the pointer arrive again; it stays shut until the pointer leaves.
        private void OnFlyoutClosed(object? sender, EventArgs e)
        {
            Cancel();
            _dismissedInside = _inside;
        }

        private void OnButtonEntered(object? sender, PointerEventArgs e)
        {
            Watch(Flyout);
            if (IsOpen)
            {
                Cancel();
            }
            else if (!_dismissedInside)
            {
                Schedule(opening: true);
            }
        }

        private void OnButtonExited(object? sender, PointerEventArgs e)
        {
            if (!IsOpen)
            {
                Cancel();
            }
            else if (!Contains(e))
            {
                Schedule(opening: false);
            }
        }

        private void OnContentEntered(object? sender, PointerEventArgs e) => Cancel();

        private void OnContentExited(object? sender, PointerEventArgs e)
        {
            if (IsOpen)
            {
                Schedule(opening: false);
            }
        }

        private void OnButtonKeyDown(object? sender, KeyEventArgs e)
        {
            if (e.Key == Key.Right)
            {
                e.Handled = true;
                Open();
            }
        }

        private void OnContentKeyDown(object? sender, KeyEventArgs e)
        {
            if (e.Key is Key.Left or Key.Escape)
            {
                e.Handled = true;
                Flyout?.Hide();
                _button.Focus();
            }
        }
    }
}
