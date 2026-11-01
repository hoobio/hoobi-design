using Avalonia;
using Avalonia.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class HoobiChromeTests(AvaloniaSession session)
{
    [Fact]
    public void Attach_drops_the_content_one_pixel_and_keeps_the_other_sides() => session.Run(() =>
    {
        var root = new Border { Margin = new Thickness(2, 0, 3, 4) };
        var window = new Window { Content = root };
        using (HoobiChrome.Attach(window))
        {
            Assert.Equal(new Thickness(2, 1, 3, 4), root.Margin);
        }
    });

    [Fact]
    public void Attach_before_the_content_exists_fails() => session.Run(() =>
        Assert.Throws<InvalidOperationException>(() => HoobiChrome.Attach(new Window())));

    [Fact]
    public void Caption_buttons_take_the_inactive_class_from_activation_until_detached() => session.Run(() =>
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
