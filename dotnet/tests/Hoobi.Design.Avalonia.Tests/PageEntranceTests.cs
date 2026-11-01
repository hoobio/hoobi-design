using Avalonia.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class PageEntranceTests(AvaloniaSession session)
{
    [Fact]
    public void A_page_slides_up_and_fades_in_over_250ms() => session.Run(() =>
    {
        var page = new Border { Height = 100 };
        var clock = new ManualClock();
        var window = new Window { Width = 400, Height = 200, Content = page };
        window.Show();
        AvaloniaSession.Pump();
        clock.Attach(window);
        try
        {
            var entrance = PageEntrance.PlayAsync(page);
            double Offset() => page.RenderTransform?.Value.M32 ?? 0;

            clock.Advance(TimeSpan.FromMilliseconds(16));
            AvaloniaSession.Pump(1);
            clock.Advance(TimeSpan.FromMilliseconds(100));
            AvaloniaSession.Pump(1);
            Assert.InRange(Offset(), 0.1, 15.9);
            Assert.InRange(page.Opacity, 0.01, 0.99);

            clock.Advance(TimeSpan.FromMilliseconds(300));
            AvaloniaSession.Pump(1);
            AvaloniaSession.Pump();
            Assert.Equal(0, Offset());
            Assert.Equal(1, page.Opacity);
            Assert.True(entrance.IsCompleted);
        }
        finally
        {
            window.Close();
        }
    });
}
