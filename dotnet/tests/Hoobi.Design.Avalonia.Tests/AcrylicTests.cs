using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Headless;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Media.Imaging;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class AcrylicTests(AvaloniaSession session)
{
    private static Color Tint => AvaloniaSession.Resource<Color>("HoobiFlyoutAcrylicTintColor");

    private static Color Fallback => AvaloniaSession.Resource<Color>("HoobiFlyoutAcrylicFallbackColor");

    private static Color Ground => AvaloniaSession.Resource<Color>("HoobiBgColor");

    [Fact]
    public void The_tint_is_the_dark_tint_at_82_percent() => session.Run(() =>
        Assert.Equal(Color.Parse("#D10C0E13"), Acrylic.Composite(Tint, null)));

    [Theory]
    [InlineData(true, true, true, true)]
    [InlineData(false, true, true, false)]
    [InlineData(true, false, true, false)]
    [InlineData(true, true, false, false)]
    public void Only_a_windowed_popup_on_windows_11_with_transparency_effects_asks_for_the_system_acrylic(bool windowedPopup, bool windows11, bool transparencyEffects, bool requested) =>
        Assert.Equal(requested, Acrylic.RequestsNative(windowedPopup, windows11, transparencyEffects));

    [Theory]
    [InlineData(true, true, "AcrylicBlur", AcrylicMode.Native)]
    [InlineData(false, true, "AcrylicBlur", AcrylicMode.Fallback)]
    [InlineData(true, true, "Transparent", AcrylicMode.Blur)]
    [InlineData(true, true, "None", AcrylicMode.Blur)]
    [InlineData(true, false, "AcrylicBlur", AcrylicMode.Blur)]
    [InlineData(false, false, "Transparent", AcrylicMode.Fallback)]
    public void The_surface_takes_the_system_acrylic_only_when_the_window_got_it(bool active, bool requested, string actual, AcrylicMode mode) =>
        Assert.Equal(mode, Acrylic.Choose(active, requested, actual switch
        {
            "AcrylicBlur" => WindowTransparencyLevel.AcrylicBlur,
            "Transparent" => WindowTransparencyLevel.Transparent,
            _ => WindowTransparencyLevel.None,
        }));

    [Fact]
    public void The_popup_surface_probe_accepts_the_native_tint_fill() => session.Run(() =>
    {
        var combo = NewCombo();
        var window = new Window { Width = 400, Height = 460, Content = combo };
        window.Show();
        AvaloniaSession.Pump();
        combo.IsDropDownOpen = true;
        AvaloniaSession.Pump();

        OpenList(combo).Background = new SolidColorBrush(Acrylic.Composite(Tint, null));
        Assert.Empty(Hoobi.Design.Avalonia.Testing.PopupSurfaceProbe.CheckOpen(window));
        combo.IsDropDownOpen = false;
        window.Close();
    });

    [Fact]
    public void A_submenu_takes_the_acrylic_and_the_probe_checks_it() => session.Run(() =>
    {
        var sub = new MenuItem { Header = "Sort by", Items = { new MenuItem { Header = "Name" }, new MenuItem { Header = "Updated" } } };
        var menu = new MenuFlyout { Items = { sub } };
        var button = new Button { Content = "More", Flyout = menu };
        var window = new Window { Width = 400, Height = 400, Content = button };
        window.Show();
        AvaloniaSession.Pump();
        menu.ShowAt(button);
        AvaloniaSession.Pump();

        Assert.Empty(Hoobi.Design.Avalonia.Testing.PopupSurfaceProbe.CheckOpen(window));
        sub.IsSubMenuOpen = true;
        AvaloniaSession.Pump();
        var surface = Assert.IsType<Border>(sub.GetVisualDescendants().OfType<Popup>().Single(popup => popup.IsOpen).Child);
        Assert.True(Acrylic.GetIsEnabled(surface));
        Assert.Equal(new CornerRadius(8), surface.CornerRadius);
        menu.Hide();
        window.Close();
    });

    [Fact]
    public void A_combo_box_list_draws_nothing_in_its_rounded_corners() => session.Run(() =>
    {
        var combo = NewCombo();
        var window = new Window { Width = 400, Height = 460, Background = Brushes.White, Content = combo };
        window.Show();
        AvaloniaSession.Pump();
        combo.IsDropDownOpen = true;
        AvaloniaSession.Pump();

        var list = OpenList(combo);
        using var frame = window.CaptureRenderedFrame()!;
        var origin = list.TranslatePoint(default, window)!.Value;
        var corner = Mean(frame, (int)origin.X, (int)(origin.Y + list.Bounds.Height) - 1, 1, 1);
        Assert.All(corner, channel => Assert.True(channel >= 250, $"corner pixel {string.Join(",", corner)}"));
        combo.IsDropDownOpen = false;
        window.Close();
    });

    [Fact]
    public void Saturation_follows_the_css_matrix() =>
        Assert.Equal(Color.Parse("#FF212B43"), Acrylic.Saturate(Color.Parse("#FF242B3C")));

    [Fact]
    public void A_flyout_draws_the_page_behind_it_blurred_under_the_tint() => session.Run(() =>
    {
        var block = new Border { Width = 120, Height = 60, Background = Brushes.White, HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Top, Margin = new Thickness(40, 60, 0, 0) };
        var content = new Border { Width = 240, Height = 320 };
        var button = new Button { Content = "Open", HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Top, Flyout = new Flyout { FlyoutPresenterClasses = { "Tinted" }, Placement = PlacementMode.BottomEdgeAlignedLeft, Content = content } };
        var window = new Window { Width = 400, Height = 460, Background = new SolidColorBrush(Ground), Content = new Panel { Children = { block, button } } };
        window.Show();
        AvaloniaSession.Pump();
        button.Flyout!.ShowAt(button);
        AvaloniaSession.Pump();

        var presenter = Assert.IsType<FlyoutPresenter>(window.OpenedPopups.Single().Child);
        var root = Assert.IsType<Window>(TopLevel.GetTopLevel(presenter));
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(presenter));
        Assert.IsType<ImageBrush>(presenter.Background);

        using var frame = root.CaptureRenderedFrame()!;
        var origin = content.TranslatePoint(default, root)!.Value;
        var blockOrigin = block.TranslatePoint(default, root)!.Value;
        var overBlock = Mean(frame, (int)blockOrigin.X + 30, (int)blockOrigin.Y + 20, 60, 20);
        var overGround = Mean(frame, (int)origin.X + 4, (int)origin.Y + 260, 220, 30);
        var expectedGround = Channels(Acrylic.Composite(Tint, Acrylic.Saturate(Ground)));
        var expectedWhite = Channels(Acrylic.Composite(Tint, Colors.White));
        for (var channel = 0; channel < 3; channel++)
        {
            Assert.InRange(overGround[channel], expectedGround[channel] - 2.0, expectedGround[channel] + 2.0);
            Assert.True(overGround[channel] <= Channels(Ground)[channel] - 5, "A flyout over plain page reads darker than the page.");
            Assert.InRange(overBlock[channel], expectedGround[channel] + 20, expectedWhite[channel] - 1);
        }

        button.Flyout.Hide();
        window.Close();
    });

    [Fact]
    public void An_overlay_presenter_falls_back_to_the_solid_colour_while_its_window_is_inactive() => session.Run(() =>
    {
        var presenter = new FlyoutPresenter { Classes = { "Tinted" }, Content = new Border { Width = 200, Height = 120 } };
        var window = new Window { Width = 400, Height = 300, Content = presenter };
        window.Show();
        AvaloniaSession.Pump();
        Assert.True(window.IsActive);
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(presenter));

        window.Hide();
        AvaloniaSession.Pump();
        Assert.Equal(AcrylicMode.Fallback, Acrylic.GetMode(presenter));
        Assert.Equal(Fallback, Assert.IsAssignableFrom<ISolidColorBrush>(presenter.Background).Color);

        window.Show();
        AvaloniaSession.Pump();
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(presenter));
        window.Close();
    });

    [Fact]
    public void A_tooltip_takes_the_composited_tint_without_rendering_the_window_behind_it() => session.Run(() =>
    {
        var target = new Button { Content = "Target" };
        ToolTip.SetTip(target, "Tip");
        var window = new Window { Width = 400, Height = 300, Background = new SolidColorBrush(Ground), Content = target };
        window.Show();
        AvaloniaSession.Pump();
        ToolTip.SetIsOpen(target, true);
        AvaloniaSession.Pump();

        var tip = window.OpenedPopups.Select(popup => popup.Child).OfType<ToolTip>().Single();
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(tip));
        Assert.Equal(Acrylic.Composite(Tint, Fallback), Assert.IsAssignableFrom<ISolidColorBrush>(tip.Background).Color);
        ToolTip.SetIsOpen(target, false);
        window.Close();
    });

    [Fact]
    public void A_combo_box_list_draws_the_page_behind_it_blurred_under_the_tint() => session.Run(() =>
    {
        var block = new Border { Height = 200, Background = Brushes.White, VerticalAlignment = VerticalAlignment.Top, Margin = new Thickness(0, 260, 0, 0) };
        var combo = NewCombo();
        var window = new Window { Width = 400, Height = 460, Background = new SolidColorBrush(Ground), Content = new Panel { Children = { block, combo } } };
        window.Show();
        AvaloniaSession.Pump();
        combo.IsDropDownOpen = true;
        AvaloniaSession.Pump();

        var list = OpenList(combo);
        var snapshot = Snapshot(list);
        var top = (int)list.TranslatePoint(default, window)!.Value.Y;
        var overGround = Mean(snapshot, 4, 150 - top, 190, 20);
        Assert.True(top + snapshot.PixelSize.Height >= 290, $"list from {top}, {snapshot.PixelSize.Height}px high");
        var overBlock = Mean(snapshot, 4, snapshot.PixelSize.Height - 24, 190, 20);
        var expectedGround = Channels(Acrylic.Composite(Tint, Acrylic.Saturate(Ground)));
        var expectedWhite = Channels(Acrylic.Composite(Tint, Colors.White));
        for (var channel = 0; channel < 3; channel++)
        {
            Assert.InRange(overGround[channel], expectedGround[channel] - 2.0, expectedGround[channel] + 2.0);
            Assert.InRange(overBlock[channel], expectedGround[channel] + 20, expectedWhite[channel] + 1);
        }

        combo.IsDropDownOpen = false;
        window.Close();
    });

    [Fact]
    public void A_combo_box_list_in_a_dialog_blurs_the_dialog_rather_than_the_page() => session.Run(() =>
    {
        var panel = Color.Parse("#FF2B3140");
        var combo = NewCombo();
        var window = new Window { Width = 400, Height = 460, Background = new SolidColorBrush(Ground) };
        window.Show();
        AvaloniaSession.Pump();
        OverlayLayer.GetOverlayLayer(window)!.Children.Add(new Border { Width = 400, Height = 460, Background = new SolidColorBrush(panel), Child = combo });
        AvaloniaSession.Pump();
        combo.IsDropDownOpen = true;
        AvaloniaSession.Pump();

        var list = OpenList(combo);
        var top = (int)list.TranslatePoint(default, window)!.Value.Y;
        var overPanel = Mean(Snapshot(list), 4, 150 - top, 190, 20);
        var expected = Channels(Acrylic.Composite(Tint, Acrylic.Saturate(panel)));
        for (var channel = 0; channel < 3; channel++)
        {
            Assert.InRange(overPanel[channel], expected[channel] - 2.0, expected[channel] + 2.0);
        }

        combo.IsDropDownOpen = false;
        window.Close();
    });

    [Fact]
    public void A_border_falls_back_to_the_solid_colour_while_its_window_is_inactive() => session.Run(() =>
    {
        var surface = new Border { Width = 200, Height = 120 };
        Acrylic.SetIsEnabled(surface, true);
        var window = new Window { Width = 400, Height = 300, Content = surface };
        window.Show();
        AvaloniaSession.Pump();
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(surface));
        Assert.IsType<ImageBrush>(surface.Background);

        window.Hide();
        AvaloniaSession.Pump();
        Assert.Equal(AcrylicMode.Fallback, Acrylic.GetMode(surface));
        Assert.Equal(Fallback, Assert.IsAssignableFrom<ISolidColorBrush>(surface.Background).Color);
        window.Close();
    });

    private static ComboBox NewCombo() => new()
    {
        Width = 200,
        ItemsSource = Enumerable.Range(1, 8).Select(item => $"Item {item}").ToArray(),
        SelectedIndex = 0,
        Margin = new Thickness(0, 40, 0, 0),
        HorizontalAlignment = HorizontalAlignment.Center,
        VerticalAlignment = VerticalAlignment.Top,
    };

    private static Border OpenList(ComboBox combo)
    {
        var list = Assert.IsType<Border>(combo.GetVisualDescendants().OfType<Popup>().Single(popup => popup.Name == "PART_Popup").Child);
        Assert.Equal(AcrylicMode.Blur, Acrylic.GetMode(list));
        Assert.Equal(new CornerRadius(8), list.CornerRadius);
        Assert.Equal(default, list.BorderThickness);
        return list;
    }

    private static WriteableBitmap Snapshot(Border list) =>
        Assert.IsType<WriteableBitmap>(Assert.IsType<ImageBrush>(list.Background).Source);

    private static double[] Channels(Color color) => [color.R, color.G, color.B];

    private static double[] Mean(WriteableBitmap frame, int x, int y, int width, int height)
    {
        using var locked = frame.Lock();
        var rgba = locked.Format == global::Avalonia.Platform.PixelFormat.Rgba8888;
        var sums = new double[3];
        var row = new int[width];
        for (var j = y; j < y + height; j++)
        {
            System.Runtime.InteropServices.Marshal.Copy(locked.Address + (j * locked.RowBytes) + (x * 4), row, 0, width);
            foreach (var pixel in row)
            {
                for (var channel = 0; channel < 3; channel++)
                {
                    sums[channel] += (pixel >> ((rgba ? channel : 2 - channel) * 8)) & 0xFF;
                }
            }
        }

        return [.. sums.Select(sum => sum / ((double)width * height))];
    }
}
