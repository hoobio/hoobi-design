using System.Runtime.CompilerServices;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.LogicalTree;

namespace Hoobi.Design.Avalonia;

public enum PopupSide
{
    None,
    Below,
    Above,
    Right,
    Left,
}

public static class PopupGap
{
    public static readonly AttachedProperty<double> SizeProperty =
        AvaloniaProperty.RegisterAttached<Control, double>("Size", typeof(PopupGap));

    private const int MaxCorrections = 2;

    private static readonly ConditionalWeakTable<Control, Tracker> Trackers = [];

    static PopupGap()
    {
        SizeProperty.Changed.AddClassHandler<Control>((surface, e) =>
        {
            surface.AttachedToVisualTree -= OnAttached;
            surface.AttachedToLogicalTree -= OnAttached;
            surface.DetachedFromVisualTree -= OnDetached;
            if (e.GetNewValue<double>() > 0)
            {
                // A flyout's presenter reaches its popup window before the window is parented to the Popup, so the logical attach is the one that finds it.
                surface.AttachedToVisualTree += OnAttached;
                surface.AttachedToLogicalTree += OnAttached;
                surface.DetachedFromVisualTree += OnDetached;
                if (TopLevel.GetTopLevel(surface) is not null)
                {
                    Attach(surface);
                }
            }
        });
    }

    public static double GetSize(Control surface) => surface.GetValue(SizeProperty);

    public static void SetSize(Control surface, double value) => surface.SetValue(SizeProperty, value);

    public static PopupSide Preferred(PlacementMode placement) => placement switch
    {
        PlacementMode.Bottom or PlacementMode.BottomEdgeAlignedLeft or PlacementMode.BottomEdgeAlignedRight => PopupSide.Below,
        PlacementMode.Top or PlacementMode.TopEdgeAlignedLeft or PlacementMode.TopEdgeAlignedRight => PopupSide.Above,
        PlacementMode.Right or PlacementMode.RightEdgeAlignedTop or PlacementMode.RightEdgeAlignedBottom => PopupSide.Right,
        PlacementMode.Left or PlacementMode.LeftEdgeAlignedTop or PlacementMode.LeftEdgeAlignedBottom => PopupSide.Left,
        _ => PopupSide.None,
    };

    // Centres, not edges: a popup that flipped with the gap still pointing the old way overlaps its target by the gap.
    public static PopupSide Side(PlacementMode placement, Rect target, Rect popup) => Preferred(placement) switch
    {
        PopupSide.Below or PopupSide.Above => popup.Center.Y >= target.Center.Y ? PopupSide.Below : PopupSide.Above,
        PopupSide.Right or PopupSide.Left => popup.Center.X >= target.Center.X ? PopupSide.Right : PopupSide.Left,
        _ => PopupSide.None,
    };

    public static Vector Offset(PopupSide side, double size) => side switch
    {
        PopupSide.Below => new Vector(0, size),
        PopupSide.Above => new Vector(0, -size),
        PopupSide.Right => new Vector(size, 0),
        PopupSide.Left => new Vector(-size, 0),
        _ => default,
    };

    private static void OnAttached(object? sender, EventArgs e) => Attach((Control)sender!);

    private static void OnDetached(object? sender, EventArgs e)
    {
        var surface = (Control)sender!;
        if (Trackers.TryGetValue(surface, out var tracker))
        {
            tracker.Dispose();
            Trackers.Remove(surface);
        }
    }

    private static void Attach(Control surface)
    {
        if (Trackers.TryGetValue(surface, out _) || TopLevel.GetTopLevel(surface) is null)
        {
            return;
        }

        if (surface.FindLogicalAncestorOfType<Popup>() is { } popup)
        {
            Trackers.Add(surface, new Tracker(surface, popup));
        }
    }

    private static void Move(Popup popup, PopupSide side, double size)
    {
        var offset = Offset(side, size);
        if (side is PopupSide.Below or PopupSide.Above)
        {
            popup.VerticalOffset = offset.Y;
        }
        else if (side is PopupSide.Right or PopupSide.Left)
        {
            popup.HorizontalOffset = offset.X;
        }
    }

    private sealed class Tracker : IDisposable
    {
        private readonly Control _surface;
        private readonly Popup _popup;
        private readonly WindowBase? _host;
        private int _corrections;

        public Tracker(Control surface, Popup popup)
        {
            _surface = surface;
            _popup = popup;
            _host = TopLevel.GetTopLevel(surface) as WindowBase;
            Move(_popup, Preferred(_popup.Placement), GetSize(_surface));
            _surface.LayoutUpdated += OnMoved;
            if (_host is not null)
            {
                _host.PositionChanged += OnMoved;
            }
        }

        public void Dispose()
        {
            _surface.LayoutUpdated -= OnMoved;
            if (_host is not null)
            {
                _host.PositionChanged -= OnMoved;
            }
        }

        private void OnMoved(object? sender, EventArgs e)
        {
            var target = _popup.PlacementTarget ?? _popup.FindLogicalAncestorOfType<Control>();
            if (_corrections >= MaxCorrections || target is null || !_surface.IsArrangeValid || TopLevel.GetTopLevel(target) is null)
            {
                return;
            }

            var side = Side(_popup.Placement, Screen(target), Screen(_surface));
            var wanted = Offset(side, GetSize(_surface));
            var current = side is PopupSide.Below or PopupSide.Above ? new Vector(0, _popup.VerticalOffset) : new Vector(_popup.HorizontalOffset, 0);
            if (side != PopupSide.None && wanted != current)
            {
                _corrections++;
                Move(_popup, side, GetSize(_surface));
            }
        }

        private static Rect Screen(Visual visual)
        {
            var origin = visual.PointToScreen(default);
            var scale = TopLevel.GetTopLevel(visual)?.RenderScaling ?? 1;
            return new Rect(origin.X, origin.Y, visual.Bounds.Width * scale, visual.Bounds.Height * scale);
        }
    }
}
