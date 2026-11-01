using System.Globalization;

using Avalonia.Controls;
using Avalonia.Markup.Xaml;
using Avalonia.Media;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class FontTests(AvaloniaSession session)
{
    [Theory]
    [InlineData("ContentControlThemeFontFamily", "Hanken Grotesk")]
    [InlineData("HoobiDisplayFontFamily", "Hanken Grotesk")]
    [InlineData("HoobiMonoFontFamily", "Cascadia Mono")]
    [InlineData("HoobiIconFontFamily", "FluentSystemIcons-Resizable")]
    public void Font_resources_load_the_bundled_font(string key, string familyName) => session.Run(() =>
    {
        Assert.True(FontManager.Current.TryGetGlyphTypeface(new Typeface(AvaloniaSession.Resource<FontFamily>(key)), out var typeface));
        Assert.Equal(familyName, typeface.FamilyName);
    });

    [Fact]
    public void A_shown_window_renders_grayscale_text() => session.Run(() =>
    {
        var window = new Window { Width = 200, Height = 100, Content = new TextBlock { Text = "Text" } };
        window.Show();
        AvaloniaSession.Pump();
        try
        {
            Assert.Equal(TextRenderingMode.Antialias, TextOptions.GetTextRenderingMode(window));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void The_default_family_is_the_embedded_hanken_grotesk() => session.Run(() =>
    {
        Assert.True(FontManager.Current.TryGetGlyphTypeface(new Typeface(FontFamily.Default), out var typeface));
        Assert.Equal("Hanken Grotesk", typeface.FamilyName);
    });

    [Fact]
    public void Every_glyph_is_in_the_icon_font() => session.Run(() =>
    {
        Assert.True(FontManager.Current.TryGetGlyphTypeface(new Typeface(AvaloniaSession.Resource<FontFamily>("HoobiIconFontFamily")), out var typeface));
        var glyphs = (ResourceDictionary)AvaloniaXamlLoader.Load(new Uri("avares://Hoobi.Design.Avalonia/Themes/Glyphs.axaml"));
        var keys = glyphs.Keys.OfType<string>().Where(key => key.StartsWith("Glyph.", StringComparison.Ordinal)).ToList();

        Assert.NotEmpty(keys);
        Assert.All(keys, key => Assert.NotEqual(0, typeface.CharacterToGlyphMap.GetGlyph(char.ConvertToUtf32(AvaloniaSession.Resource<string>(key), 0))));
    });

    [Fact]
    public void Text_weights_render_at_different_widths() => session.Run(() =>
    {
        var family = AvaloniaSession.Resource<FontFamily>("ContentControlThemeFontFamily");
        Assert.All([FontWeight.Normal, FontWeight.SemiBold, FontWeight.Bold], weight =>
        {
            Assert.True(FontManager.Current.TryGetGlyphTypeface(new Typeface(family, FontStyle.Normal, weight), out var typeface));
            Assert.Equal((weight, FontSimulations.None), (typeface.Weight, typeface.FontSimulations));
        });
        double Width(FontWeight weight) => new FormattedText(
            "Hoobi Design Gallery", CultureInfo.InvariantCulture, FlowDirection.LeftToRight,
            new Typeface(family, FontStyle.Normal, weight), 14, null).Width;

        Assert.True(Width(FontWeight.SemiBold) > Width(FontWeight.Normal));
        Assert.True(Width(FontWeight.Bold) > Width(FontWeight.SemiBold));
    });
}
