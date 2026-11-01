using System.Runtime.InteropServices;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Media;
using Avalonia.Platform;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class SettingsCardHoverTests(AvaloniaSession session)
{
    public enum Placement
    {
        Alone,
        GroupTop,
        GroupMiddle,
        GroupBottom,
        Item,
    }

    [Theory]
    [InlineData(Placement.Alone)]
    [InlineData(Placement.GroupTop)]
    [InlineData(Placement.GroupMiddle)]
    [InlineData(Placement.GroupBottom)]
    [InlineData(Placement.Item)]
    public void The_hover_fill_covers_the_whole_card_to_its_corners(Placement placement) => session.Run(() =>
    {
        var (window, card) = Host(placement);
        try
        {
            var rest = Sample(window, card, card.Bounds.Width / 2, card.Bounds.Height / 2);
            window.MouseMove(card.TranslatePoint(new Point(card.Bounds.Width / 2, card.Bounds.Height / 2), window)!.Value);
            AvaloniaSession.Pump();
            var hover = Sample(window, card, card.Bounds.Width / 2, card.Bounds.Height / 2);
            Assert.NotEqual(rest, hover);

            var (w, h) = (card.Bounds.Width, card.Bounds.Height);
            var radius = card.CornerRadius;
            var edge = 2.5;
            var points = new Dictionary<string, Point>
            {
                ["left"] = new(edge, h / 2),
                ["right"] = new(w - edge, h / 2),
                ["top"] = new(w / 2, edge),
                ["bottom"] = new(w / 2, h - edge),
                ["top left"] = Corner(radius.TopLeft, false, false, w, h),
                ["top right"] = Corner(radius.TopRight, true, false, w, h),
                ["bottom left"] = Corner(radius.BottomLeft, false, true, w, h),
                ["bottom right"] = Corner(radius.BottomRight, true, true, w, h),
            };
            var misses = points
                .Select(point => (point.Key, Colour: Sample(window, card, point.Value.X, point.Value.Y)))
                .Where(sample => sample.Colour != hover)
                .Select(sample => $"{sample.Key}: {sample.Colour}, hover {hover}")
                .ToList();
            Assert.True(misses.Count == 0, string.Join(Environment.NewLine, misses));
        }
        finally
        {
            window.Close();
        }
    });

    private static Point Corner(double radius, bool right, bool bottom, double w, double h)
    {
        var inset = Math.Ceiling(radius * (1 - Math.Sqrt(0.5))) + 2.5;
        return new(right ? w - inset : inset, bottom ? h - inset : inset);
    }

    private static (Window, SettingsCard) Host(Placement placement)
    {
        SettingsCard Clickable(string header) => new() { Header = header, IsClickEnabled = true, ActionGlyph = AvaloniaSession.Resource<string>("Glyph.ChevronRight") };
        Control content;
        SettingsCard card;
        switch (placement)
        {
            case Placement.Alone:
                card = Clickable("Keyboard shortcuts");
                content = card;
                break;
            case Placement.Item:
                card = new SettingsCard { Classes = { "Item" }, Header = "Advanced", IsClickEnabled = true, IsExpanded = false };
                content = new SettingsCard
                {
                    Header = "Region",
                    IsClickEnabled = true,
                    IsExpanded = true,
                    ExpandedContent = new StackPanel { Classes = { "Rows" }, Children = { card } },
                };
                break;
            default:
                var cards = new[] { Clickable("Addon folder"), Clickable("Keyboard shortcuts"), Clickable("About") };
                card = cards[(int)placement - (int)Placement.GroupTop];
                var group = new StackPanel { Classes = { "SettingsGroup" } };
                group.Children.AddRange(cards);
                content = group;
                break;
        }

        var window = new Window
        {
            Width = 600,
            Height = 400,
            Background = AvaloniaSession.Resource<IBrush>("HoobiBgBrush"),
            Content = new Border { Padding = new Thickness(20), Child = content },
        };
        window.Show();
        AvaloniaSession.Pump();
        foreach (var visual in window.GetVisualDescendants())
        {
            visual.Transitions = null;
        }

        return (window, card);
    }

    private static Color Sample(Window window, Visual card, double x, double y)
    {
        var at = card.TranslatePoint(new Point(x, y), window)!.Value;
        using var frame = window.CaptureRenderedFrame()!;
        using var locked = frame.Lock();
        var pixel = new byte[4];
        Marshal.Copy(locked.Address + ((int)at.Y * locked.RowBytes) + ((int)at.X * 4), pixel, 0, 4);
        return locked.Format == PixelFormat.Rgba8888
            ? Color.FromArgb(pixel[3], pixel[0], pixel[1], pixel[2])
            : Color.FromArgb(pixel[3], pixel[2], pixel[1], pixel[0]);
    }
}
