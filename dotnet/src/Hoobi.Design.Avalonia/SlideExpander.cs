using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia;

public sealed class SlideExpander : Decorator
{
    public static readonly StyledProperty<bool> IsExpandedProperty = AvaloniaProperty.Register<SlideExpander, bool>(nameof(IsExpanded));

    private Action? _stop;

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

        _stop?.Invoke();
        _stop = null;
        if (child.RenderTransform is not TranslateTransform offset)
        {
            offset = new TranslateTransform();
            child.RenderTransform = offset;
        }

        if (!Motion.Enabled || Bounds.Width <= 0)
        {
            offset.Y = 0;
            child.IsVisible = expand;
            return;
        }

        using var run = new CancellationTokenSource();
        _stop = run.Cancel;
        child.IsVisible = true;
        child.Measure(new Size(Bounds.Width, double.PositiveInfinity));
        var hidden = -child.DesiredSize.Height;
        offset.Y = expand ? 0 : hidden;
        var slide = new Animation
        {
            Duration = expand ? Motion.Expand : Motion.Fast,
            Easing = expand ? Motion.Decelerate : Motion.Collapse,
            Children =
            {
                new KeyFrame { Cue = new Cue(0), Setters = { new Setter(TranslateTransform.YProperty, expand ? hidden : 0d) } },
                new KeyFrame { Cue = new Cue(1), Setters = { new Setter(TranslateTransform.YProperty, expand ? 0d : hidden) } },
            },
        };
        try
        {
            await slide.RunAsync(child, run.Token).ConfigureAwait(true);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        if (run.IsCancellationRequested)
        {
            return;
        }

        _stop = null;
        child.IsVisible = expand;
    }
}
