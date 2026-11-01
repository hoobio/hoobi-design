using Avalonia.Animation.Easings;

namespace Hoobi.Design.Avalonia;

public static class Motion
{
    public static TimeSpan Duration => Enabled ? TimeSpan.FromMilliseconds(150) : TimeSpan.Zero;

    public static Easing Standard { get; } = new SplineEasing(0.33, 0, 0.67, 1);

    public static bool Enabled => Native.ClientAreaAnimation();
}
