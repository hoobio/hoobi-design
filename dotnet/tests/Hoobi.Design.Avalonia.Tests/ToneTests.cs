using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.LogicalTree;
using Avalonia.Media;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class ToneTests(AvaloniaSession session)
{
    public static TheoryData<Tone> Tones => [.. Enum.GetValues<Tone>()];

    [Theory]
    [MemberData(nameof(Tones))]
    public void Every_tone_resolves_a_brush_a_button_theme_and_a_glyph(Tone tone) => session.Run(() =>
    {
        Assert.NotNull(AvaloniaSession.Resource<IBrush>(Toned.BrushKeyFor(tone)));
        Assert.NotNull(AvaloniaSession.Resource<ControlTheme>(Toned.ButtonThemeKeyFor(tone)));
        Assert.NotEmpty(AvaloniaSession.Resource<string>(Toned.GlyphKeyFor(tone)));
        Assert.Same(AvaloniaSession.Resource<IBrush>(Toned.BrushKeyFor(tone)), ToneConverters.Brush.Convert(tone, typeof(IBrush), null, System.Globalization.CultureInfo.InvariantCulture));
    });

    [Fact]
    public void The_tone_swaps_the_class_on_a_border_and_the_theme_on_a_button() => session.Run(() =>
    {
        var alert = new Border { Classes = { "Alert" } };
        Toned.SetTone(alert, Tone.Danger);
        Assert.Equal(["Alert", "Danger"], alert.Classes);
        Toned.SetTone(alert, Tone.Info);
        Assert.Equal(["Alert", "Info"], alert.Classes);
        Toned.SetTone(alert, Tone.Neutral);
        Assert.Equal(["Alert"], alert.Classes);

        var button = new Button();
        var window = new Window { Content = button };
        window.Show();
        Toned.SetTone(button, Tone.Danger);
        AvaloniaSession.Pump();
        Assert.Same(AvaloniaSession.Resource<ControlTheme>("CriticalButtonStyle"), button.Theme);
        Assert.DoesNotContain("Danger", button.Classes);
        window.Close();
    });

    [Theory]
    [InlineData("Alert", Tone.Danger)]
    [InlineData("Alert", Tone.Success)]
    [InlineData("Alert", Tone.Info)]
    [InlineData("Badge", Tone.Accent)]
    public void Each_tone_class_used_on_a_border_has_a_style(string kind, Tone tone)
    {
        var themes = Path.Combine(AvaloniaSession.DotnetRoot(), "src", "Hoobi.Design.Avalonia", "Themes");
        var text = string.Concat(Directory.GetFiles(themes, "*.axaml").Select(File.ReadAllText));
        Assert.Contains($"Selector=\"Border.{kind}.{Toned.ClassFor(tone)}\"", text, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("Ada Hart-Lovelace", "AH")]
    [InlineData("  hoobi ", "H")]
    [InlineData("", "")]
    [InlineData(null, "")]
    public void Initials_take_the_first_and_last_word(string? name, string expected) => Assert.Equal(expected, ToneConverters.InitialsOf(name));

    [Theory]
    [InlineData("HoobiEaseStandard")]
    [InlineData("HoobiEaseDecelerate")]
    [InlineData("HoobiEaseAccelerate")]
    public void Motion_easings_match_the_tokens(string key) => session.Run(() =>
    {
        var token = AvaloniaSession.Resource<SplineEasing>(key);
        var code = (SplineEasing)(key switch
        {
            "HoobiEaseStandard" => Motion.Standard,
            "HoobiEaseDecelerate" => Motion.Decelerate,
            _ => Motion.Accelerate,
        });
        Assert.Equal((token.X1, token.Y1, token.X2, token.Y2), (code.X1, code.Y1, code.X2, code.Y2));
    });

    [Fact]
    public void A_toned_toast_shows_the_tone_glyph_and_the_bool_overload_still_means_success() => session.Run(() =>
    {
        ToastWindow.Show(null, "Sync paused", Tone.Info);
        var toast = ToastWindow.Current!;
        AvaloniaSession.Pump();
        var glyph = ((Border)toast.Content!).GetLogicalDescendants().OfType<TextBlock>().First();
        Assert.Equal(Tone.Info, toast.Tone);
        Assert.False(toast.IsSuccess);
        Assert.True(glyph.IsVisible);
        Assert.Equal(AvaloniaSession.Resource<string>("Glyph.Info"), glyph.Text);

        ToastWindow.Show(null, "Copied");
        AvaloniaSession.Pump();
        Assert.True(toast.IsSuccess);
        Assert.Equal(AvaloniaSession.Resource<string>("Glyph.CheckMark"), glyph.Text);

        ToastWindow.Show(null, "Plain", success: false);
        AvaloniaSession.Pump();
        Assert.False(glyph.IsVisible);
        toast.Hide();
    });
}
