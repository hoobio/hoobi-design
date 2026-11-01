using Avalonia;
using Avalonia.Controls;

namespace Hoobi.Design.Avalonia;

public enum CardHeightMode
{
    Balanced,
    MatchRow,
    Dynamic,
}

public sealed class CardWrapPanel : Panel
{
    public static readonly StyledProperty<double> MinItemWidthProperty = AvaloniaProperty.Register<CardWrapPanel, double>(nameof(MinItemWidth), 320);
    public static readonly StyledProperty<double> SpacingProperty = AvaloniaProperty.Register<CardWrapPanel, double>(nameof(Spacing), 8);
    public static readonly StyledProperty<CardHeightMode> HeightModeProperty = AvaloniaProperty.Register<CardWrapPanel, CardHeightMode>(nameof(HeightMode));
    public static readonly AttachedProperty<bool> IsFullRowProperty = AvaloniaProperty.RegisterAttached<CardWrapPanel, Control, bool>("IsFullRow");
    // In Balanced mode a card that sets this keeps its own height: the user opened it deliberately, so it must not reflow the row.
    public static readonly AttachedProperty<bool> KeepsOwnHeightProperty = AvaloniaProperty.RegisterAttached<CardWrapPanel, Control, bool>("KeepsOwnHeight");

    static CardWrapPanel()
    {
        AffectsMeasure<CardWrapPanel>(MinItemWidthProperty, SpacingProperty, HeightModeProperty);
        AffectsParentMeasure<CardWrapPanel>(IsFullRowProperty, KeepsOwnHeightProperty);
    }

    public double MinItemWidth { get => GetValue(MinItemWidthProperty); set => SetValue(MinItemWidthProperty, value); }

    public double Spacing { get => GetValue(SpacingProperty); set => SetValue(SpacingProperty, value); }

    public CardHeightMode HeightMode { get => GetValue(HeightModeProperty); set => SetValue(HeightModeProperty, value); }

    public static bool GetIsFullRow(Control child) => child.GetValue(IsFullRowProperty);

    public static void SetIsFullRow(Control child, bool value) => child.SetValue(IsFullRowProperty, value);

    public static bool GetKeepsOwnHeight(Control child) => child.GetValue(KeepsOwnHeightProperty);

    public static void SetKeepsOwnHeight(Control child, bool value) => child.SetValue(KeepsOwnHeightProperty, value);

    protected override Size MeasureOverride(Size availableSize) => Layout(availableSize.Width, arrange: false);

    protected override Size ArrangeOverride(Size finalSize)
    {
        Layout(finalSize.Width, arrange: true);
        Glide.Arranged(this);
        return finalSize;
    }

    private Size Layout(double width, bool arrange)
    {
        if (double.IsInfinity(width))
        {
            width = MinItemWidth;
        }

        var columns = Math.Max(1, (int)((width + Spacing) / (MinItemWidth + Spacing)));
        var itemWidth = (width - ((columns - 1) * Spacing)) / columns;
        var y = 0.0;
        var row = new List<Control>();

        void FlushRow()
        {
            if (row.Count == 0)
            {
                return;
            }

            var height = row.Max(c => c.DesiredSize.Height);
            if (arrange)
            {
                for (var i = 0; i < row.Count; i++)
                {
                    var stretch = HeightMode switch
                    {
                        CardHeightMode.MatchRow => true,
                        CardHeightMode.Dynamic => false,
                        _ => !GetKeepsOwnHeight(row[i]),
                    };
                    row[i].Arrange(new Rect(i * (itemWidth + Spacing), y, itemWidth, stretch ? height : row[i].DesiredSize.Height));
                }
            }

            y += height + Spacing;
            row.Clear();
        }

        foreach (var child in Children.Where(c => c.IsVisible))
        {
            var full = GetIsFullRow(child);
            if (!arrange)
            {
                child.Measure(new Size(full ? width : itemWidth, double.PositiveInfinity));
            }

            if (full)
            {
                FlushRow();
                if (arrange)
                {
                    child.Arrange(new Rect(0, y, width, child.DesiredSize.Height));
                }

                y += child.DesiredSize.Height + Spacing;
                continue;
            }

            row.Add(child);
            if (row.Count == columns)
            {
                FlushRow();
            }
        }

        FlushRow();
        return new Size(width, Math.Max(0, y - Spacing));
    }
}
