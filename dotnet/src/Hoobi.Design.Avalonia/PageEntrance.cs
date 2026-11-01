using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Media.Transformation;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia;

public static class PageEntrance
{
    public static readonly TimeSpan Duration = TimeSpan.FromMilliseconds(250);

    public static Task PlayAsync(Control page, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(page);
        if (!Motion.Enabled)
        {
            return Task.CompletedTask;
        }

        return new Animation
        {
            Duration = Duration,
            Easing = Motion.Decelerate,
            FillMode = FillMode.Forward,
            Children =
            {
                new KeyFrame { Cue = new Cue(0), Setters = { new Setter(Visual.OpacityProperty, 0d), new Setter(Visual.RenderTransformProperty, TransformOperations.Parse("translateY(16px)")) } },
                new KeyFrame { Cue = new Cue(1), Setters = { new Setter(Visual.OpacityProperty, 1d), new Setter(Visual.RenderTransformProperty, TransformOperations.Parse("translateY(0px)")) } },
            },
        }.RunAsync(page, cancellationToken);
    }
}
