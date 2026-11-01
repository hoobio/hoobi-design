using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class StyleDefaultsTests(AvaloniaSession session)
{
    [Fact]
    public void The_reveal_button_holds_to_reveal_and_shows_the_fluent_eye() => session.Run(() =>
    {
        var box = new TextBox { Classes = { "revealPasswordButton" }, PasswordChar = '*', Text = "secret" };
        var window = Host(box);
        try
        {
            Assert.True(HoldToReveal.GetIsEnabled(box));
            var toggle = box.GetVisualDescendants().OfType<ToggleButton>().Single();
            Assert.Equal(36, toggle.Bounds.Width);
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.Eye"), Glyph(toggle).Glyph);
            Assert.Equal(16, Glyph(toggle).FontSize);

            box.RevealPassword = true;
            AvaloniaSession.Pump();
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.EyeOff"), Glyph(toggle).Glyph);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_combo_box_is_32_high_with_the_fluent_chevron_and_opens_below() => session.Run(() =>
    {
        var combo = new ComboBox { Items = { "Stable", "Pre-release" }, SelectedIndex = 0 };
        var window = Host(combo);
        try
        {
            Assert.Equal(32, combo.Bounds.Height);
            var glyph = combo.GetVisualDescendants().OfType<FAFontIcon>().Single(icon => icon.Name == "DropDownGlyph");
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.ChevronDown"), glyph.Glyph);
            var popup = combo.GetVisualDescendants().OfType<Popup>().Single();
            Assert.Equal(PlacementMode.BottomEdgeAlignedLeft, popup.Placement);
            Assert.Equal(4, popup.VerticalOffset);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_numeric_up_down_spins_with_fluent_chevrons() => session.Run(() =>
    {
        var number = new NumericUpDown { Value = 3 };
        var window = Host(number);
        try
        {
            Assert.Equal(32, number.Bounds.Height);
            var buttons = number.GetVisualDescendants().OfType<RepeatButton>().ToDictionary(button => button.Name!);
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.ChevronUp"), buttons["PART_IncreaseButton"].Content);
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.ChevronDown"), buttons["PART_DecreaseButton"].Content);
            Assert.Equal(28, buttons["PART_IncreaseButton"].Bounds.Width);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_row_overlay_fills_its_row_with_no_minimum_height_or_corners() => session.Run(() =>
    {
        var overlay = new Button { Classes = { "RowOverlay" } };
        var window = Host(overlay);
        try
        {
            Assert.Equal(0, overlay.MinHeight);
            Assert.Equal(default, overlay.CornerRadius);
            Assert.Equal(window.ClientSize.Height, overlay.Bounds.Height);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_tab_strip_item_is_32_high() => session.Run(() =>
    {
        var strip = new TabStrip { Items = { new TabStripItem { Content = "Logins" } }, SelectedIndex = 0, VerticalAlignment = VerticalAlignment.Top };
        var window = Host(strip);
        try
        {
            Assert.Equal(32, strip.ContainerFromIndex(0)!.Bounds.Height);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_danger_icon_caption_button_keeps_its_colour_when_inactive() => session.Run(() =>
    {
        var button = new Button { Theme = AvaloniaSession.Resource<ControlTheme>("CaptionButtonTheme"), Classes = { "CaptionButton", "Icon", "Danger", "inactive" }, Content = "x" };
        var window = Host(button);
        try
        {
            var icon = button.GetVisualDescendants().OfType<FAFontIcon>().Single();
            Assert.Equal(AvaloniaSession.Resource<ISolidColorBrush>("SystemFillColorCriticalBrush").Color, Assert.IsAssignableFrom<ISolidColorBrush>(icon.Foreground).Color);
            Assert.Equal(AvaloniaSession.Resource<FontFamily>("HoobiIconFontFamily"), icon.FontFamily);
            Assert.Equal(16, button.GetVisualDescendants().OfType<Viewbox>().Single().Bounds.Height);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void The_highlight_fill_is_opaque_so_its_fade_has_no_lighter_frame() => session.Run(() =>
        Assert.Equal(255, AvaloniaSession.Resource<ISolidColorBrush>("HoobiHighlightBrush").Color.A));

    [Theory]
    [InlineData("HoobiSuccessTintBrush")]
    [InlineData("HoobiCautionTintBrush")]
    [InlineData("HoobiInfoTintBrush")]
    [InlineData("HoobiCriticalTintBrush")]
    public void A_tone_tint_is_a_15_percent_fill(string key) => session.Run(() =>
        Assert.Equal(0x26, AvaloniaSession.Resource<ISolidColorBrush>(key).Color.A));

    private static FAFontIcon Glyph(ToggleButton toggle) => toggle.GetVisualDescendants().OfType<FAFontIcon>().Single(icon => icon.Name == "Glyph");

    private static Window Host(Control content)
    {
        var window = new Window { Width = 400, Height = 200, Content = content };
        window.Show();
        AvaloniaSession.Pump();
        return window;
    }
}
