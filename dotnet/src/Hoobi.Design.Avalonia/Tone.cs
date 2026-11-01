using Avalonia;
using Avalonia.Controls;
using Avalonia.Data.Converters;
using Avalonia.Media;
using Avalonia.Styling;

namespace Hoobi.Design.Avalonia;

public enum Tone
{
    Neutral,
    Accent,
    Success,
    Warn,
    Danger,
    Info,
}

public static class Toned
{
    public static readonly AttachedProperty<Tone> ToneProperty =
        AvaloniaProperty.RegisterAttached<StyledElement, Tone>("Tone", typeof(Toned));

    private static readonly string[] ToneClasses = [.. Enum.GetNames<Tone>().Skip(1)];

    static Toned() => ToneProperty.Changed.AddClassHandler<StyledElement>((element, change) => Apply(element, change.GetNewValue<Tone>()));

    public static Tone GetTone(StyledElement element) => element?.GetValue(ToneProperty) ?? throw new ArgumentNullException(nameof(element));

    public static void SetTone(StyledElement element, Tone value) => (element ?? throw new ArgumentNullException(nameof(element))).SetValue(ToneProperty, value);

    public static string? ClassFor(Tone tone) => tone == Tone.Neutral ? null : tone.ToString();

    public static string BrushKeyFor(Tone tone) => tone switch
    {
        Tone.Accent => "HoobiAccentBrush",
        Tone.Success => "HoobiSuccessBrush",
        Tone.Warn => "HoobiWarnBrush",
        Tone.Danger => "HoobiDangerBrush",
        Tone.Info => "HoobiInfoBrush",
        _ => "TextFillColorSecondaryBrush",
    };

    public static string ButtonThemeKeyFor(Tone tone) => tone switch
    {
        Tone.Accent => "AccentButtonStyle",
        Tone.Warn => "CautionButtonStyle",
        Tone.Danger => "CriticalButtonStyle",
        _ => "DefaultButtonStyle",
    };

    public static string GlyphKeyFor(Tone tone) => tone switch
    {
        Tone.Success => "Glyph.CheckMark",
        Tone.Warn => "Glyph.Warning",
        Tone.Danger => "Glyph.Error",
        _ => "Glyph.Info",
    };

    private static void Apply(StyledElement element, Tone tone)
    {
        if (element is Button button)
        {
            button.Bind(StyledElement.ThemeProperty, button.GetResourceObservable(ButtonThemeKeyFor(tone)));
            return;
        }

        element.Classes.RemoveAll(ToneClasses);
        if (ClassFor(tone) is { } name)
        {
            element.Classes.Add(name);
        }
    }
}

public static class ToneConverters
{
    public static readonly IValueConverter Brush = new FuncValueConverter<Tone, IBrush?>(tone => Resource<IBrush>(Toned.BrushKeyFor(tone)));

    public static readonly IValueConverter ButtonTheme = new FuncValueConverter<Tone, ControlTheme?>(tone => Resource<ControlTheme>(Toned.ButtonThemeKeyFor(tone)));

    public static readonly IValueConverter Glyph = new FuncValueConverter<Tone, string>(tone => Resource<string>(Toned.GlyphKeyFor(tone)) ?? "");

    public static readonly IValueConverter Initials = new FuncValueConverter<string?, string>(InitialsOf);

    public static string InitialsOf(string? name)
    {
        var words = (name ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return words.Length switch
        {
            0 => "",
            1 => words[0][..1].ToUpperInvariant(),
            _ => $"{words[0][..1]}{words[^1][..1]}".ToUpperInvariant(),
        };
    }

    private static T? Resource<T>(string key)
        where T : class =>
        Application.Current?.TryGetResource(key, Application.Current.ActualThemeVariant, out var value) == true ? value as T : null;
}
