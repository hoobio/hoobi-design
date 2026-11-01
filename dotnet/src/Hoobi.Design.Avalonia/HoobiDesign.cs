using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Media.Fonts;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia;

public static class HoobiDesign
{
    public const string FontCollection = "fonts:Hoobi";

    private static readonly string[] EmojiFamilies = ["Segoe UI Emoji"];

    private static bool _registered;

    // Avalonia 12.1.3 does not map FontWeight onto a variable font's wght axis, so Hanken Grotesk ships as static per-weight TTFs.
    public static AppBuilder UseHoobiDesign(this AppBuilder builder) => builder
        .ConfigureFonts(fonts => fonts.AddFontCollection(new EmbeddedFontCollection(new Uri(FontCollection), new Uri("avares://Hoobi.Design.Avalonia/Assets/Fonts"))))
        .With(new FontManagerOptions
        {
            DefaultFamilyName = $"{FontCollection}#Hanken Grotesk",
            FontFallbacks = [.. EmojiFamilies.Select(family => new FontFallback { FontFamily = new FontFamily(family) })],
        })
        .AfterSetup(_ => Register());

    private static void Register()
    {
        if (_registered)
        {
            return;
        }

        _registered = true;
        PopupPlacement.Register();
        ScrollIndicator.Register();
        // The drawn caption buttons sit beside the window under its host, outside the window's own text options.
        Control.LoadedEvent.AddClassHandler<TopLevel>((top, _) =>
        {
            foreach (var visual in top.GetSelfAndVisualAncestors())
            {
                TextOptions.SetTextRenderingMode(visual, TextRenderingMode.Antialias);
            }
        });
    }
}
