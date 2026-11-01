using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class PackageStylesTests(AvaloniaSession session)
{
    [Theory]
    [InlineData("ToggleSwitchFillOn")]
    [InlineData("CheckBoxCheckBackgroundFillChecked")]
    [InlineData("RadioButtonOuterEllipseCheckedFill")]
    public void Selection_controls_fill_with_the_accent(string key) => session.Run(() =>
    {
        Assert.Equal(AvaloniaSession.Resource<Color>("HoobiAccentColor"), AvaloniaSession.Resource<ISolidColorBrush>(key).Color);
        Assert.False(AvaloniaSession.Resource<ResourceDictionary>("HoobiDialogScopeResources").ContainsKey(key));
    });

    [Theory]
    [InlineData("ToggleSwitchKnobFillOn")]
    [InlineData("CheckBoxCheckGlyphForegroundChecked")]
    [InlineData("RadioButtonCheckGlyphFill")]
    public void Selection_glyphs_sit_on_bg(string key) => session.Run(() =>
        Assert.Equal(AvaloniaSession.Resource<Color>("HoobiBgColor"), AvaloniaSession.Resource<ISolidColorBrush>(key).Color));

    [Fact]
    public void An_expandable_settings_card_toggles_on_click_and_swaps_its_chevron() => session.Run(() =>
    {
        var card = new SettingsCard { Header = "Installs", IsClickEnabled = true, IsExpanded = false };
        var window = Host(card);
        try
        {
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.ChevronDown"), card.ActionGlyph);
            card.RaiseClick();
            AvaloniaSession.Pump();
            Assert.True(card.IsExpanded);
            Assert.Equal(AvaloniaSession.Resource<string>("Glyph.ChevronDown"), card.ActionGlyph);
            var fill = card.GetVisualDescendants().OfType<Border>().Single(border => border.Name == "PART_Fill");
            Assert.Equal(AvaloniaSession.Resource<ISolidColorBrush>("HoobiSettingsExpandedHeaderBrush").Color, Assert.IsAssignableFrom<ISolidColorBrush>(fill.Background).Color);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void An_expanding_settings_card_slides_its_rows_open_and_closed() => session.Run(() =>
    {
        var card = new SettingsCard
        {
            Header = "Installs",
            IsClickEnabled = true,
            IsExpanded = false,
            ExpandedContent = new Border { Height = 120 },
        };
        var window = Host(card);
        try
        {
            var slide = card.GetVisualDescendants().OfType<SlideExpander>().Single();
            AvaloniaSession.Pump();
            Assert.Equal(0, slide.Bounds.Height);

            card.RaiseClick();
            var heights = new List<double>();
            AvaloniaSession.WaitFor(() =>
            {
                AvaloniaSession.Pump(1);
                heights.Add(slide.Bounds.Height);
                return slide.Bounds.Height >= 120;
            });
            Assert.Contains(heights, height => height > 0 && height < 120);
            AvaloniaSession.Pump();
            Assert.Equal(120, slide.Bounds.Height);

            card.RaiseClick();
            AvaloniaSession.WaitFor(() =>
            {
                AvaloniaSession.Pump(1);
                return slide.Bounds.Height == 0;
            });
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_plain_settings_card_has_no_chevron_and_ignores_clicks() => session.Run(() =>
    {
        var card = new SettingsCard { Header = "About", IsClickEnabled = true };
        var window = Host(card);
        try
        {
            card.RaiseClick();
            Assert.Null(card.IsExpanded);
            Assert.Null(card.ActionGlyph);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_horizontal_slider_takes_the_house_theme_with_a_14px_thumb() => session.Run(() =>
    {
        var slider = new Slider { Value = 40, Width = 200 };
        var window = Host(slider);
        try
        {
            Assert.Same(AvaloniaSession.Resource<ControlTheme>("SliderStyle"), slider.Theme);
            var thumb = slider.GetVisualDescendants().OfType<Thumb>().Single();
            Assert.Equal(14, thumb.Bounds.Height);
            ((IPseudoClasses)thumb.Classes).Add(":pointerover");
            AvaloniaSession.Pump();
            Assert.Same(AvaloniaSession.Resource<IBrush>("HoobiSliderThumbPointerOverBrush"), thumb.Background);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_vertical_slider_keeps_the_fluent_theme() => session.Run(() =>
    {
        var slider = new Slider { Orientation = Orientation.Vertical, Height = 120 };
        var window = Host(slider);
        try
        {
            Assert.NotSame(AvaloniaSession.Resource<ControlTheme>("SliderStyle"), slider.Theme);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_small_button_is_28_high() => session.Run(() =>
    {
        var button = new Button { Classes = { "Small" }, Content = "Retry", VerticalAlignment = VerticalAlignment.Top };
        var window = Host(button);
        try
        {
            Assert.Equal(28, button.Bounds.Height);
        }
        finally
        {
            window.Close();
        }
    });

    private static Window Host(Control content)
    {
        var window = new Window { Width = 400, Height = 200, Content = content };
        window.Show();
        AvaloniaSession.Pump();
        return window;
    }
}
