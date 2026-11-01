using System.Runtime;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia;

public sealed class IdleMemory : IDisposable
{
    public static readonly TimeSpan DefaultDelay = TimeSpan.FromSeconds(3);

    private readonly Window _window;
    private readonly TimeSpan _delay;
    private readonly Action _trim;
    private readonly Action<bool> _efficiency;
    private readonly ITimer _timer;

    public IdleMemory(Window window, TimeSpan? delay = null)
        : this(window, delay ?? DefaultDelay, TimeProvider.System, TrimNow, Native.SetEfficiencyMode)
    {
    }

    internal IdleMemory(Window window, TimeSpan delay, TimeProvider time, Action trim, Action<bool> efficiency)
    {
        ArgumentNullException.ThrowIfNull(window);
        _window = window;
        _delay = delay;
        _trim = trim;
        _efficiency = efficiency;
        _timer = time.CreateTimer(_ => Dispatcher.UIThread.Post(TrimIfIdle), null, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
        window.Activated += OnActivated;
        window.Deactivated += OnDeactivated;
        window.PropertyChanged += OnPropertyChanged;
        if (!window.IsVisible)
        {
            _efficiency(true);
            Schedule();
        }
    }

    public static void TrimNow()
    {
        GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
        // The compacting collect goes first: trimming an uncompacted heap only pages it back in on the next allocation.
        GC.Collect(GC.MaxGeneration, GCCollectionMode.Aggressive, blocking: true, compacting: true);
        Native.EmptyWorkingSet();
    }

    public void NotifyBackgroundWorkCompleted() => TrimIfIdle();

    public void Dispose()
    {
        _window.Activated -= OnActivated;
        _window.Deactivated -= OnDeactivated;
        _window.PropertyChanged -= OnPropertyChanged;
        _timer.Dispose();
    }

    private void Schedule() => _timer.Change(_delay, Timeout.InfiniteTimeSpan);

    private void Cancel() => _timer.Change(Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);

    private void TrimIfIdle()
    {
        if (!_window.IsActive || !_window.IsVisible)
        {
            _trim();
        }
    }

    private void OnActivated(object? sender, EventArgs e) => Cancel();

    private void OnDeactivated(object? sender, EventArgs e) => Schedule();

    private void OnPropertyChanged(object? sender, AvaloniaPropertyChangedEventArgs e)
    {
        if (e.Property != Visual.IsVisibleProperty)
        {
            return;
        }

        var visible = e.GetNewValue<bool>();
        _efficiency(!visible);
        if (visible)
        {
            Cancel();
        }
        else
        {
            Schedule();
        }
    }
}
