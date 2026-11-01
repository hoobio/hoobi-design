using Avalonia.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class IdleMemoryTests(AvaloniaSession session)
{
    private static readonly TimeSpan Delay = TimeSpan.FromSeconds(3);

    [Fact]
    public void Hiding_trims_after_the_delay_and_turns_efficiency_mode_on_until_shown() => session.Run(() =>
    {
        var (window, time, trims, efficiency, memory) = Attach();
        using (memory)
        {
            Hide(window);
            Advance(time, Delay - TimeSpan.FromMilliseconds(1));
            Assert.Equal(0, trims());
            Assert.True(efficiency());

            Advance(time, TimeSpan.FromMilliseconds(1));
            Assert.Equal(1, trims());

            window.Show();
            Assert.False(efficiency());
            window.Close();
        }
    });

    [Fact]
    public void A_second_hide_restarts_the_delay() => session.Run(() =>
    {
        var (window, time, trims, _, memory) = Attach();
        using (memory)
        {
            Hide(window);
            Advance(time, TimeSpan.FromSeconds(2));
            window.Show();
            Hide(window);
            Advance(time, TimeSpan.FromSeconds(2));
            Assert.Equal(0, trims());

            Advance(time, TimeSpan.FromSeconds(1));
            Assert.Equal(1, trims());
            window.Close();
        }
    });

    [Fact]
    public void Showing_cancels_a_pending_trim() => session.Run(() =>
    {
        var (window, time, trims, _, memory) = Attach();
        using (memory)
        {
            window.Hide();
            window.Show();
            window.Activate();
            Advance(time, Delay * 2);
            Assert.Equal(0, trims());
            window.Close();
        }
    });

    [Fact]
    public void Background_work_trims_only_while_the_window_is_not_active() => session.Run(() =>
    {
        var (window, _, trims, _, memory) = Attach();
        using (memory)
        {
            window.Activate();
            AvaloniaSession.Pump();
            Assert.True(window.IsActive);
            memory.NotifyBackgroundWorkCompleted();
            Assert.Equal(0, trims());

            window.Hide();
            memory.NotifyBackgroundWorkCompleted();
            Assert.Equal(1, trims());
            window.Close();
        }
    });

    [Fact]
    public void A_trim_that_fires_while_the_window_is_active_does_nothing() => session.Run(() =>
    {
        var (window, time, trims, _, memory) = Attach();
        using (memory)
        {
            window.Hide();
            window.Show();
            window.Activate();
            AvaloniaSession.Pump();
            time.Fire();
            AvaloniaSession.Pump();
            Assert.Equal(0, trims());
            window.Close();
        }
    });

    [Fact]
    public void A_window_that_starts_hidden_trims_after_the_delay_in_efficiency_mode() => session.Run(() =>
    {
        var window = new Window();
        var time = new ManualTime();
        var trims = 0;
        var efficiency = false;
        using var memory = new IdleMemory(window, Delay, time, () => trims++, on => efficiency = on);
        Assert.True(efficiency);
        Advance(time, Delay);
        Assert.Equal(1, trims);
    });

    [Fact]
    public void TrimNow_does_not_throw() => IdleMemory.TrimNow();

    private static (Window Window, ManualTime Time, Func<int> Trims, Func<bool> Efficiency, IdleMemory Memory) Attach()
    {
        var window = new Window { Width = 200, Height = 200 };
        window.Show();
        AvaloniaSession.Pump();
        var time = new ManualTime();
        var trims = 0;
        var efficiency = false;
        var memory = new IdleMemory(window, Delay, time, () => trims++, on => efficiency = on);
        return (window, time, () => trims, () => efficiency, memory);
    }

    // The headless window raises Deactivated on a later dispatcher pass, which restarts the delay.
    private static void Hide(Window window)
    {
        window.Hide();
        AvaloniaSession.Pump();
    }

    private static void Advance(ManualTime time, TimeSpan by)
    {
        time.Advance(by);
        AvaloniaSession.Pump();
    }

    private sealed class ManualTime : TimeProvider
    {
        private readonly List<ManualTimer> _timers = [];
        private TimeSpan _now;

        public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
        {
            var timer = new ManualTimer(this, callback, state);
            timer.Change(dueTime, period);
            _timers.Add(timer);
            return timer;
        }

        public void Advance(TimeSpan by)
        {
            _now += by;
            foreach (var timer in _timers.Where(timer => timer.Due <= _now).ToList())
            {
                timer.Due = null;
                timer.Callback(timer.State);
            }
        }

        public void Fire()
        {
            foreach (var timer in _timers)
            {
                timer.Callback(timer.State);
            }
        }

        private sealed class ManualTimer(ManualTime time, TimerCallback callback, object? state) : ITimer
        {
            public TimeSpan? Due { get; set; }

            public TimerCallback Callback => callback;

            public object? State => state;

            public bool Change(TimeSpan dueTime, TimeSpan period)
            {
                Due = dueTime == Timeout.InfiniteTimeSpan ? null : time._now + dueTime;
                return true;
            }

            public void Dispose() => Due = null;

            public ValueTask DisposeAsync()
            {
                Dispose();
                return ValueTask.CompletedTask;
            }
        }
    }
}
