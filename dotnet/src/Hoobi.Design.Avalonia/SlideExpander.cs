using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia;

public sealed class SlideExpander : Decorator
{
    public static readonly StyledProperty<bool> IsExpandedProperty = AvaloniaProperty.Register<SlideExpander, bool>(nameof(IsExpanded));

    private int _version;

    static SlideExpander() => ClipToBoundsProperty.OverrideDefaultValue<SlideExpander>(true);

    public bool IsExpanded
    {
        get => GetValue(IsExpandedProperty);
        set => SetValue(IsExpandedProperty, value);
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        ArgumentNullException.ThrowIfNull(change);

        base.OnPropertyChanged(change);
        if (change.Property == IsExpandedProperty)
        {
            _ = SlideAsync(change.GetNewValue<bool>());
        }
        else if (change.Property == ChildProperty && Child is { } child)
        {
            child.IsVisible = IsExpanded;
        }
    }

    private async Task SlideAsync(bool expand)
    {
        if (Child is not { } child)
        {
            return;
        }

        var version = ++_version;
        if (!Motion.Enabled || Bounds.Width <= 0)
        {
            child.IsVisible = expand;
            ClearValue(HeightProperty);
            return;
        }

        var from = Bounds.Height;
        child.IsVisible = true;
        child.Measure(new Size(Bounds.Width, double.PositiveInfinity));
        var to = expand ? child.DesiredSize.Height : 0;
        Height = to;
        var slide = new Animation
        {
            Duration = Motion.Expand,
            Easing = expand ? Motion.Decelerate : Motion.Accelerate,
            Children =
            {
                new KeyFrame { Cue = new Cue(0), Setters = { new Setter(HeightProperty, from) } },
                new KeyFrame { Cue = new Cue(1), Setters = { new Setter(HeightProperty, to) } },
            },
        };
        await slide.RunAsync(this).ConfigureAwait(true);
        if (version != _version)
        {
            return;
        }

        child.IsVisible = expand;
        ClearValue(HeightProperty);
    }
}
