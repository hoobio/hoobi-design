using System.Runtime.InteropServices;

using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Media;
using Avalonia.Media.Imaging;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class BackgroundBandingTests(AvaloniaSession session)
{
    [Fact]
    public void The_ground_glows_are_dithered_where_the_plain_brushes_band() => session.Run(() =>
    {
        var plain = Render(1280, 820, dithered: false);
        var dithered = Render(1280, 820, dithered: true);

        foreach (var (x0, y0, x1, y1) in Lines(1280, 820))
        {
            var before = Runs(plain, x0, y0, x1, y1);
            var after = Runs(dithered, x0, y0, x1, y1);
            Assert.True(before.MaxRun > 20);
            Assert.True(after.MaxRun <= 16);
            Assert.True(after.Changes >= 10 * before.Changes);
        }
    });

    [Fact]
    public void The_ground_glows_match_the_WinUI_baseline_colours() => session.Run(() =>
    {
        var dithered = Render(1264, 811, dithered: true);

        (int X, int Y, int Width, int Height, double R, double G, double B)[] regions =
        [
            (152, 7, 360, 32, 26.56, 36.15, 51.69),
            (752, 7, 360, 32, 31.78, 34.95, 47.30),
            (48, 169, 20, 310, 25.02, 31.25, 43.36),
            (1242, 209, 18, 210, 26.96, 30.53, 41.34),
            (752, 599, 480, 100, 24.00, 28.00, 38.00),
            (192, 49, 200, 38, 26.59, 36.43, 51.90),
        ];
        foreach (var region in regions)
        {
            var mean = Mean(dithered, region.X, region.Y, region.Width, region.Height);
            Assert.InRange(mean[0], region.R - 1, region.R + 1);
            Assert.InRange(mean[1], region.G - 1, region.G + 1);
            Assert.InRange(mean[2], region.B - 1, region.B + 1);
        }
    });

    private static (int, int, int, int)[] Lines(int width, int height) =>
    [
        (0, 2, width * 6 / 10, 2),
        (0, 0, width * 45 / 100, height * 35 / 100),
        (width - 1, 2, width * 45 / 100, 2),
        (width - 1, 0, width * 65 / 100, height * 35 / 100),
    ];

    private static WriteableBitmap Capture(int width, int height, bool dithered)
    {
        Control Glow(string key) => dithered
            ? new DitheredRadialGradient { Fill = AvaloniaSession.Resource<IRadialGradientBrush>(key) }
            : new Border { Background = AvaloniaSession.Resource<IBrush>(key) };
        var window = new Window
        {
            Width = width,
            Height = height,
            Background = AvaloniaSession.Resource<IBrush>("HoobiBgBrush"),
            Content = new Grid { Children = { Glow("HoobiGroundGlowTopLeft"), Glow("HoobiGroundGlowTopRight") } },
        };
        window.Show();
        var frame = window.CaptureRenderedFrame()!;
        window.Close();
        return frame;
    }

    private static (int Width, int[] Pixels) Render(int width, int height, bool dithered)
    {
        using var frame = Capture(width, height, dithered);
        using var locked = frame.Lock();
        var pixels = new int[locked.Size.Width * locked.Size.Height];
        for (var y = 0; y < locked.Size.Height; y++)
        {
            Marshal.Copy(locked.Address + (y * locked.RowBytes), pixels, y * locked.Size.Width, locked.Size.Width);
        }

        return (locked.Size.Width, pixels);
    }

    private static (int MaxRun, int Changes) Runs((int Width, int[] Pixels) image, int x0, int y0, int x1, int y1)
    {
        var steps = Math.Max(Math.Abs(x1 - x0), Math.Abs(y1 - y0));
        int run = 1, max = 1, changes = 0;
        var previous = image.Pixels[(y0 * image.Width) + x0];
        for (var i = 1; i <= steps; i++)
        {
            var pixel = image.Pixels[((y0 + ((y1 - y0) * i / steps)) * image.Width) + x0 + ((x1 - x0) * i / steps)];
            changes += pixel == previous ? 0 : 1;
            run = pixel == previous ? run + 1 : 1;
            max = Math.Max(max, run);
            previous = pixel;
        }

        return (max, changes);
    }

    private static double[] Mean((int Width, int[] Pixels) image, int x, int y, int width, int height)
    {
        var sums = new double[3];
        for (var j = y; j < y + height; j++)
        {
            for (var i = x; i < x + width; i++)
            {
                var pixel = image.Pixels[(j * image.Width) + i];
                for (var channel = 0; channel < 3; channel++)
                {
                    sums[channel] += (pixel >> (channel * 8)) & 0xFF;
                }
            }
        }

        return [.. sums.Select(sum => sum / (width * height))];
    }
}
