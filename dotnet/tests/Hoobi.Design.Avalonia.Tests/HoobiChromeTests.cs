using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;
using Avalonia.Media;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class HoobiChromeTests(AvaloniaSession session)
{
    private const string WindowsOnly = "HoobiChrome is a no-op off Windows.";

    [Fact]
    public void Attach_drops_the_content_one_pixel_and_keeps_the_other_sides()
    {
        Assert.SkipUnless(OperatingSystem.IsWindows(), WindowsOnly);
        session.Run(() =>
        {
            var root = new Border { Margin = new Thickness(2, 0, 3, 4) };
            var window = new Window { Content = root };
            using (HoobiChrome.Attach(window))
            {
                Assert.Equal(new Thickness(2, 1, 3, 4), root.Margin);
            }
        });
    }

    [Fact]
    public void Attach_before_the_content_exists_fails() => session.Run(() =>
        Assert.Throws<InvalidOperationException>(() => HoobiChrome.Attach(new Window())));

    [Theory]
    [InlineData(true, WindowState.Maximized)]
    [InlineData(false, WindowState.Normal)]
    public void A_double_click_on_a_drag_handle_maximises_only_a_window_that_can(bool canMaximize, WindowState expected) => session.Run(() =>
    {
        var handle = new Border { Height = 48, Background = Brushes.Transparent };
        var window = new Window { Width = 400, Height = 300, CanMaximize = canMaximize, Content = new StackPanel { Children = { handle } } };
        window.Show();
        AvaloniaSession.Pump();
        using (HoobiChrome.AttachDragHandle(handle))
        {
            DoubleClick(window, new Point(100, 24));
        }

        var state = window.WindowState;
        window.Close();
        Assert.Equal(expected, state);
    });

    [Fact]
    public void A_double_click_on_a_button_inside_a_drag_handle_is_left_to_the_button() => session.Run(() =>
    {
        var button = new Button { Content = "Pin", Width = 80, Height = 32 };
        var handle = new Border { Height = 48, Background = Brushes.Transparent, Child = button };
        var window = new Window { Width = 400, Height = 300, Content = new StackPanel { Children = { handle } } };
        window.Show();
        AvaloniaSession.Pump();
        using (HoobiChrome.AttachDragHandle(handle))
        {
            var centre = button.TranslatePoint(new Point(40, 16), window)!.Value;
            DoubleClick(window, centre);
        }

        var state = window.WindowState;
        window.Close();
        Assert.Equal(WindowState.Normal, state);
    });

    private static void DoubleClick(Window window, Point point)
    {
        for (var i = 0; i < 2; i++)
        {
            window.MouseDown(point, MouseButton.Left);
            window.MouseUp(point, MouseButton.Left);
        }

        AvaloniaSession.Pump();
    }

    [Fact]
    public void CentreOnScreenOf_centres_the_window_in_the_working_area_of_the_screen_under_the_point() => session.Run(() =>
    {
        var window = new Window { Width = 400, Height = 300 };
        window.Show();
        AvaloniaSession.Pump();
        try
        {
            var area = window.Screens.ScreenFromPoint(new PixelPoint(10, 10))!.WorkingArea;
            HoobiChrome.CentreOnScreenOf(window, new PixelPoint(10, 10));
            Assert.Equal(new PixelPoint(area.X + ((area.Width - 400) / 2), area.Y + ((area.Height - 300) / 2)), window.Position);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void Caption_buttons_take_the_inactive_class_from_activation_until_detached()
    {
        Assert.SkipUnless(OperatingSystem.IsWindows(), WindowsOnly);
        session.Run(() =>
        {
            var caption = new Button { Classes = { "CaptionButton" } };
            var window = new Window { Width = 200, Height = 100, Content = new Panel { Children = { caption } } };
            var chrome = HoobiChrome.Attach(window);
            try
            {
                window.Show();
                window.Activate();
                AvaloniaSession.Pump();
                Assert.True(window.IsActive);
                Assert.DoesNotContain("inactive", caption.Classes);

                window.Hide();
                AvaloniaSession.Pump();
                Assert.False(window.IsActive);
                Assert.Contains("inactive", caption.Classes);

                window.Show();
                window.Activate();
                AvaloniaSession.Pump();
                Assert.True(window.IsActive);
                Assert.DoesNotContain("inactive", caption.Classes);

                chrome.Dispose();
                window.Hide();
                AvaloniaSession.Pump();
                Assert.False(window.IsActive);
                Assert.DoesNotContain("inactive", caption.Classes);
            }
            finally
            {
                chrome.Dispose();
                window.Close();
            }
        });
    }
}
