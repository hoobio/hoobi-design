using System.Runtime.InteropServices;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Media;
using Avalonia.Platform;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class LevelMeterTests(AvaloniaSession session)
{
    [Theory]
    [InlineData(0f, 0)]
    [InlineData(-1f, 0)]
    [InlineData(0.001f, 0)]
    [InlineData(1f, 1)]
    [InlineData(2f, 1)]
    [InlineData(0.1f, 2.0 / 3)]
    public void Position_maps_amplitude_onto_a_sixty_decibel_scale(float amplitude, double expected) =>
        Assert.Equal(expected, LevelMeter.Position(amplitude), 6);

    [Fact]
    public void A_full_level_draws_level_warn_and_danger_segments_cut_at_the_thresholds() => session.Run(() =>
    {
        var meter = new LevelMeter { Width = 200, Height = 10, Levels = [1f] };
        var window = new Window { Width = 240, Height = 40, Content = new Border { Padding = new Thickness(20, 10), Child = meter } };
        window.Show();
        AvaloniaSession.Pump();
        try
        {
            Assert.Equal(Token("HoobiAccentGreenColor"), Sample(window, 20 + 100, 15));
            Assert.Equal(Token("HoobiWarnColor"), Sample(window, 20 + 170, 15));
            Assert.Equal(Token("HoobiDangerColor"), Sample(window, 20 + 190, 15));

            meter.Volume = 0.5;
            AvaloniaSession.Pump();
            Assert.Equal(Token("HoobiAccentGreenColor"), Sample(window, 20 + 50, 15));
            Assert.Equal(Token("HoobiChipColor"), Sample(window, 20 + 150, 15));
        }
        finally
        {
            window.Close();
        }
    });

    private static Color Token(string key) => AvaloniaSession.Resource<Color>(key);

    private static Color Sample(Window window, int x, int y)
    {
        using var frame = window.CaptureRenderedFrame()!;
        using var locked = frame.Lock();
        var pixel = new byte[4];
        Marshal.Copy(locked.Address + (y * locked.RowBytes) + (x * 4), pixel, 0, 4);
        return locked.Format == PixelFormat.Rgba8888
            ? Color.FromArgb(pixel[3], pixel[0], pixel[1], pixel[2])
            : Color.FromArgb(pixel[3], pixel[2], pixel[1], pixel[0]);
    }
}
