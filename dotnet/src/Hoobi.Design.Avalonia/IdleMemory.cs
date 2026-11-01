using System.Runtime;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia;

public sealed class IdleMemory : IDisposable
{
    public static readonly TimeSpan DefaultDelay = TimeSpan.FromSeconds(3);

    private readonly HashSet<Window> _windows = [];
    private readonly TimeSpan _delay;
    private readonly Action _trim;
    private readonly Action<bool> _efficiency;
    private readonly ITimer _timer;
    private readonly IDisposable[] _follow = [];

    public IdleMemory(Window window, TimeSpan? delay = null)
        : this(window, delay ?? DefaultDelay, TimeProvider.System, TrimNow, Native.SetEfficiencyMode)
    {
    }

    internal IdleMemory(Window window, TimeSpan delay, TimeProvider time, Action trim, Action<bool> efficiency)
        : this([window ?? throw new ArgumentNullException(nameof(window))], follow: false, delay, time, trim, efficiency)
    {
    }

    internal IdleMemory(IEnumerable<Window> windows, bool follow, TimeSpan delay, TimeProvider time, Action trim, Action<bool> efficiency)
    {
        _delay = delay;
        _trim = trim;
        _efficiency = efficiency;
        _timer = time.CreateTimer(_ => Dispatcher.UIThread.Post(TrimIfIdle), null, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
        foreach (var window in windows)
        {
            Track(window);
        }

        if (follow)
        {
            _follow =
            [
                Window.WindowOpenedEvent.AddClassHandler<Window>((window, _) => Track(window)),
                Window.WindowClosedEvent.AddClassHandler<Window>((window, _) => Untrack(window)),
            ];
        }

        if (!AnyVisible)
        {
            _efficiency(true);
            Schedule();
        }
    }

    public static IdleMemory ForApplication(IClassicDesktopStyleApplicationLifetime lifetime, TimeSpan? delay = null)
    {
        ArgumentNullException.ThrowIfNull(lifetime);
        return new IdleMemory(lifetime.Windows, follow: true, delay ?? DefaultDelay, TimeProvider.System, TrimNow, Native.SetEfficiencyMode);
    }

    private bool AnyVisible => _windows.Any(window => window.IsVisible);

    public static void TrimNow()
    {
        GCSettings.LargeObjectHeapCompactionMode = GCLargeObjectHeapCompactionMode.CompactOnce;
        // The compacting collect goes first: trimming an uncompacted heap only pages it back in on the next allocation.
        GC.Collect(GC.MaxGeneration, GCCollectionMode.Aggressive, blocking: true, compacting: true);
        Native.EmptyWorkingSet();
    }

    public void NotifyBackgroundWorkCompleted()
    {
        if (Dispatcher.UIThread.CheckAccess())
        {
            TrimIfIdle();
        }
        else
        {
            Dispatcher.UIThread.Post(TrimIfIdle);
        }
    }

    public void Dispose()
    {
        foreach (var handler in _follow)
        {
            handler.Dispose();
        }

        foreach (var window in _windows.ToList())
        {
            Detach(window);
        }

        _timer.Dispose();
        _efficiency(false);
    }

    private void Track(Window window)
    {
        if (!_windows.Add(window))
        {
            return;
        }

        window.Activated += OnActivated;
        window.Deactivated += OnDeactivated;
        window.PropertyChanged += OnPropertyChanged;
        if (window.IsVisible)
        {
            _efficiency(false);
            Cancel();
        }
    }

    private void Untrack(Window window)
    {
        if (!_windows.Contains(window))
        {
            return;
        }

        Detach(window);
        _efficiency(!AnyVisible);
        Schedule();
    }

    private void Detach(Window window)
    {
        window.Activated -= OnActivated;
        window.Deactivated -= OnDeactivated;
        window.PropertyChanged -= OnPropertyChanged;
        _windows.Remove(window);
    }

    private void Schedule() => _timer.Change(_delay, Timeout.InfiniteTimeSpan);

    private void Cancel() => _timer.Change(Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);

    private void TrimIfIdle()
    {
        if (!_windows.Any(window => window.IsActive && window.IsVisible))
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
        _efficiency(!AnyVisible);
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
