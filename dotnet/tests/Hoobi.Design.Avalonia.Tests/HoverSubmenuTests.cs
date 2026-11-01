using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class HoverSubmenuTests(AvaloniaSession session)
{
    private static readonly TimeSpan Tick = TimeSpan.FromMilliseconds(1);

    [Fact]
    public void Hovering_opens_after_the_delay_and_leaving_closes_after_it() => session.Run(() =>
    {
        var (window, button, flyout, time) = Show();
        try
        {
            window.MouseMove(Centre(button, window));
            Advance(time, Motion.SubmenuDelay - Tick);
            Assert.False(flyout.IsOpen);
            Advance(time, Tick);
            Assert.True(flyout.IsOpen);
            Advance(time, Motion.SubmenuDelay * 2);
            Assert.True(flyout.IsOpen);

            window.MouseMove(new Point(380, 280));
            Advance(time, Motion.SubmenuDelay - Tick);
            Assert.True(flyout.IsOpen);
            Advance(time, Tick);
            Assert.False(flyout.IsOpen);
        }
        finally
        {
            HoverSubmenu.Time = TimeProvider.System;
            window.Close();
        }
    });

    [Fact]
    public void Coming_back_before_the_delay_keeps_it_open_and_leaving_early_never_opens_it() => session.Run(() =>
    {
        var (window, button, flyout, time) = Show();
        try
        {
            window.MouseMove(Centre(button, window));
            Advance(time, Motion.SubmenuDelay / 2);
            window.MouseMove(new Point(380, 280));
            Advance(time, Motion.SubmenuDelay);
            Assert.False(flyout.IsOpen);

            window.MouseMove(Centre(button, window));
            Advance(time, Motion.SubmenuDelay);
            Assert.True(flyout.IsOpen);
            window.MouseMove(new Point(380, 280));
            Advance(time, Motion.SubmenuDelay / 2);
            window.MouseMove(Centre(button, window));
            Advance(time, Motion.SubmenuDelay);
            Assert.True(flyout.IsOpen);
        }
        finally
        {
            HoverSubmenu.Time = TimeProvider.System;
            flyout.Hide();
            window.Close();
        }
    });

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void A_press_on_the_button_closes_the_open_flyout(bool openedByHover) => session.Run(() =>
    {
        var (window, button, flyout, time) = Show();
        try
        {
            var centre = Centre(button, window);
            window.MouseMove(centre);
            if (openedByHover)
            {
                Advance(time, Motion.SubmenuDelay);
            }
            else
            {
                Click(window, centre);
            }

            Assert.True(flyout.IsOpen);
            Click(window, centre);
            Advance(time, Motion.SubmenuDelay);
            Assert.False(flyout.IsOpen);
        }
        finally
        {
            HoverSubmenu.Time = TimeProvider.System;
            flyout.Hide();
            window.Close();
        }
    });

    private static void Click(Window window, Point point)
    {
        window.MouseDown(point, MouseButton.Left);
        window.MouseUp(point, MouseButton.Left);
        AvaloniaSession.Pump();
    }

    private static (Window Window, Button Button, Flyout Flyout, Clock Time) Show()
    {
        var time = new Clock();
        HoverSubmenu.Time = time;
        var flyout = new Flyout { Placement = PlacementMode.RightEdgeAlignedTop, Content = new Border { Width = 100, Height = 60 } };
        var button = new Button { Content = "Guild", Width = 100, Height = 32, Flyout = flyout };
        HoverSubmenu.SetIsEnabled(button, true);
        var window = new Window { Width = 400, Height = 300, Content = new StackPanel { Children = { button } } };
        window.Show();
        AvaloniaSession.Pump();
        return (window, button, flyout, time);
    }

    private static Point Centre(Control control, Window window) => control.TranslatePoint(new Point(control.Bounds.Width / 2, control.Bounds.Height / 2), window)!.Value;

    private static void Advance(Clock time, TimeSpan by)
    {
        AvaloniaSession.Pump();
        time.Advance(by);
        AvaloniaSession.Pump();
    }

    private sealed class Clock : TimeProvider
    {
        private readonly List<Timer> _timers = [];
        private TimeSpan _now;

        public override ITimer CreateTimer(TimerCallback callback, object? state, TimeSpan dueTime, TimeSpan period)
        {
            var timer = new Timer(this, callback, state);
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

        private sealed class Timer(Clock clock, TimerCallback callback, object? state) : ITimer
        {
            public TimeSpan? Due { get; set; }

            public TimerCallback Callback => callback;

            public object? State => state;

            public bool Change(TimeSpan dueTime, TimeSpan period)
            {
                Due = dueTime == Timeout.InfiniteTimeSpan ? null : clock._now + dueTime;
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
