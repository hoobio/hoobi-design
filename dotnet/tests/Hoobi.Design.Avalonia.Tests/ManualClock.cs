using System.Reflection;

using Avalonia;
using Avalonia.Animation;

namespace Hoobi.Design.Avalonia.Tests;

// Avalonia 12 keeps IClock and ClockBase internal and the headless render timer reads a real Stopwatch, so a deterministic clock is reached by reflection.
internal sealed class ManualClock
{
    private static readonly Type ClockType = typeof(Animatable).Assembly.GetType("Avalonia.Animation.ClockBase", throwOnError: true)!;
    private static readonly MethodInfo PulseMethod = ClockType.GetMethod("Pulse", BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.Public)!;
    private static readonly AvaloniaProperty ClockProperty = (AvaloniaProperty)typeof(Animatable).GetField("ClockProperty", BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)!.GetValue(null)!;

    private readonly object _clock = Activator.CreateInstance(ClockType, nonPublic: true)!;
    private TimeSpan _now;

    public void Attach(Animatable target) => target.SetValue(ClockProperty, _clock);

    public void Advance(TimeSpan by)
    {
        _now += by;
        PulseMethod.Invoke(_clock, [_now]);
    }
}
