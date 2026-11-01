using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Media;
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

        if (page.RenderTransform is not TranslateTransform)
        {
            page.RenderTransform = new TranslateTransform();
        }

        return new Animation
        {
            Duration = Duration,
            Easing = Motion.Decelerate,
            FillMode = FillMode.Forward,
            Children =
            {
                new KeyFrame { Cue = new Cue(0), Setters = { new Setter(Visual.OpacityProperty, 0d), new Setter(TranslateTransform.YProperty, 16d) } },
                new KeyFrame { Cue = new Cue(1), Setters = { new Setter(Visual.OpacityProperty, 1d), new Setter(TranslateTransform.YProperty, 0d) } },
            },
        }.RunAsync(page, cancellationToken);
    }
}
