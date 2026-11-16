using Avalonia.Controls;
using Avalonia.Headless;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class SmoothScrollTests(AvaloniaSession session)
{
    private static readonly TimeSpan Start = TimeSpan.FromSeconds(10);

    [Fact]
    public void The_global_style_turns_it_on_for_every_scroll_viewer() => session.Run(() =>
    {
        var viewer = new ScrollViewer();
        var window = new Window { Content = viewer };
        window.Show();
        try
        {
            Assert.True(SmoothScroll.GetIsEnabled(viewer));
        }
        finally
        {
            window.Close();
        }
    });

    [Theory]
    [InlineData(3u, 48)]
    [InlineData(1u, 16)]
    [InlineData(0u, 0)]
    [InlineData(uint.MaxValue, 500)]
    public void A_notch_scrolls_the_system_line_count_or_a_page(uint lines, double pixels) =>
        Assert.Equal(pixels, WheelAnimation.NotchPixels(lines, viewport: 500));

    [Theory]
    [InlineData(1.0, false)]
    [InlineData(-2.0, false)]
    [InlineData(0.25, true)]
    [InlineData(-1.5, true)]
    public void Only_fractional_deltas_count_as_precise(double delta, bool precise) =>
        Assert.Equal(precise, WheelAnimation.IsPrecise(delta));

    [Theory]
    [InlineData(600, 32, 400, 1000, 416)]
    [InlineData(50, 32, 400, 1000, 0)]
    [InlineData(1350, 32, 400, 1000, 1000)]
    [InlineData(600, 500, 400, 1000, 650)]
    public void A_centred_target_sits_in_the_middle_of_the_viewport_inside_the_extent(double top, double height, double viewport, double max, double offset) =>
        Assert.Equal(offset, SmoothScroll.CentredOffset(top, height, viewport, max));

    [Fact]
    public void Centre_scrolls_a_far_target_to_the_middle_of_the_viewer() => session.Run(() =>
    {
        var target = new Border { Height = 32 };
        var panel = new StackPanel();
        panel.Children.Add(new Border { Height = 900 });
        panel.Children.Add(target);
        panel.Children.Add(new Border { Height = 900 });
        var viewer = new ScrollViewer { Content = panel };
        var window = new Window { Width = 400, Height = 400, Content = viewer };
        window.Show();
        try
        {
            SmoothScroll.Centre(viewer, target);
            var expected = SmoothScroll.CentredOffset(900, 32, viewer.Viewport.Height, viewer.Extent.Height - viewer.Viewport.Height);
            AvaloniaSession.WaitFor(() =>
            {
                AvaloniaHeadlessPlatform.ForceRenderTimerTick();
                return Math.Abs(viewer.Offset.Y - expected) < 1;
            });
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void The_offset_eases_out_to_the_target_and_stops()
    {
        var animation = new WheelAnimation();
        animation.Wheel(offset: 100, pixels: 48, max: 1000, Start);

        Assert.Equal(100, animation.Step(Start, 1000), 6);
        Assert.Equal(100 + 48 * 0.875, animation.Step(Start + WheelAnimation.Duration / 2, 1000), 6);
        Assert.True(animation.IsActive);
        Assert.Equal(148, animation.Step(Start + WheelAnimation.Duration, 1000), 6);
        Assert.False(animation.IsActive);
    }

    [Fact]
    public void Rapid_notches_add_to_the_pending_target()
    {
        var animation = new WheelAnimation();
        animation.Wheel(offset: 100, pixels: 48, max: 1000, Start);
        var midway = animation.Step(Start + TimeSpan.FromMilliseconds(50), 1000);
        animation.Wheel(midway, pixels: 48, max: 1000, Start + TimeSpan.FromMilliseconds(50));

        Assert.Equal(196, animation.Target);
        Assert.Equal(196, animation.Step(Start + TimeSpan.FromMilliseconds(50) + WheelAnimation.Duration, 1000), 6);
    }

    [Fact]
    public void The_target_stays_inside_the_extent_even_when_it_shrinks()
    {
        var animation = new WheelAnimation();
        animation.Wheel(offset: 980, pixels: 48, max: 1000, Start);
        Assert.Equal(1000, animation.Target);

        Assert.Equal(900, animation.Step(Start + WheelAnimation.Duration, 900), 6);
    }

    [Fact]
    public void A_viewer_at_an_end_lets_the_notch_chain_outward()
    {
        var animation = new WheelAnimation();

        Assert.False(animation.CanMove(offset: 0, pixels: -48, max: 1000));
        Assert.True(animation.CanMove(offset: 0, pixels: 48, max: 1000));
        Assert.False(animation.CanMove(offset: 1000, pixels: 48, max: 1000));
        Assert.False(animation.CanMove(offset: 0, pixels: 48, max: 0));

        animation.Wheel(offset: 900, pixels: 100, max: 1000, Start);
        Assert.False(animation.CanMove(offset: 950, pixels: 48, max: 1000));
        animation.Cancel();
        Assert.True(animation.CanMove(offset: 950, pixels: 48, max: 1000));
    }
}
