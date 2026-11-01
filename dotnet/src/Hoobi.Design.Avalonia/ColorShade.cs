using System.Globalization;

using Avalonia;
using Avalonia.Data.Converters;
using Avalonia.Media;
using Avalonia.Media.Immutable;

namespace Hoobi.Design.Avalonia;

public sealed class ColorShade(double amount) : IValueConverter
{
    public static ColorShade Hover { get; } = new(0.2);

    public static ColorShade Pressed { get; } = new(0.32);

    public double Amount { get; } = amount;

    public static Color Mix(Color color, Color toward, double amount) => Color.FromArgb(
        color.A,
        Channel(color.R, toward.R, amount),
        Channel(color.G, toward.G, amount),
        Channel(color.B, toward.B, amount));

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture) =>
        value is ISolidColorBrush brush
        && Application.Current?.TryGetResource("HoobiBgColor", null, out var ground) == true && ground is Color bg
            ? new ImmutableSolidColorBrush(Mix(brush.Color, bg, Amount), brush.Opacity)
            : value;

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotSupportedException();

    private static byte Channel(byte from, byte to, double amount) => (byte)Math.Round(from + ((to - from) * amount));
}
