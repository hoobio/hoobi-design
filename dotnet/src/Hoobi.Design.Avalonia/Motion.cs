using Avalonia.Animation.Easings;

namespace Hoobi.Design.Avalonia;

public static class Motion
{
    [Obsolete("Off the WinUI grid: use Motion.Faster (83 ms) for a state fade or Motion.Fast (167 ms).")]
    public static TimeSpan Duration => Gated(150);

    public static TimeSpan Faster => Gated(83);

    public static TimeSpan Fast => Gated(167);

    public static TimeSpan Normal => Gated(250);

    public static TimeSpan Expand => Gated(333);

    public static Easing Standard { get; } = new SplineEasing(0.33, 0, 0.67, 1);

    public static Easing Decelerate { get; } = new SplineEasing(0, 0, 0, 1);

    public static Easing Accelerate { get; } = new SplineEasing(1, 0, 1, 1);

    public static Easing PointToPoint { get; } = new SplineEasing(0.1, 0.9, 0.2, 1);

    public static Easing Collapse { get; } = new SplineEasing(1, 1, 0, 1);

    public static bool Enabled => Native.ClientAreaAnimation();
    public static TimeSpan SubmenuDelay => Native.MenuShowDelay();

    private static TimeSpan Gated(double milliseconds) => Enabled ? TimeSpan.FromMilliseconds(milliseconds) : TimeSpan.Zero;
}
