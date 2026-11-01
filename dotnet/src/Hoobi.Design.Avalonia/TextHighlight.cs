using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Documents;

namespace Hoobi.Design.Avalonia;

public static class TextHighlight
{
    public static readonly AttachedProperty<int> StartProperty =
        AvaloniaProperty.RegisterAttached<TextBlock, int>("Start", typeof(TextHighlight), -1);

    public static readonly AttachedProperty<int> LengthProperty =
        AvaloniaProperty.RegisterAttached<TextBlock, int>("Length", typeof(TextHighlight));

    private static readonly AttachedProperty<string?> SourceProperty =
        AvaloniaProperty.RegisterAttached<TextBlock, string?>("Source", typeof(TextHighlight));

    private static readonly AttachedProperty<bool> RebuildingProperty =
        AvaloniaProperty.RegisterAttached<TextBlock, bool>("Rebuilding", typeof(TextHighlight));

    static TextHighlight()
    {
        StartProperty.Changed.AddClassHandler<TextBlock>((text, _) => Apply(text));
        LengthProperty.Changed.AddClassHandler<TextBlock>((text, _) => Apply(text));
        TextBlock.TextProperty.Changed.AddClassHandler<TextBlock>((text, _) =>
        {
            if (text.IsSet(StartProperty) && !text.GetValue(RebuildingProperty))
            {
                text.SetValue(SourceProperty, text.Text);
                Apply(text);
            }
        });
    }

    public static int GetStart(TextBlock element) => element?.GetValue(StartProperty) ?? throw new ArgumentNullException(nameof(element));

    public static void SetStart(TextBlock element, int value) => (element ?? throw new ArgumentNullException(nameof(element))).SetValue(StartProperty, value);

    public static int GetLength(TextBlock element) => element?.GetValue(LengthProperty) ?? throw new ArgumentNullException(nameof(element));

    public static void SetLength(TextBlock element, int value) => (element ?? throw new ArgumentNullException(nameof(element))).SetValue(LengthProperty, value);

    private static void Apply(TextBlock text)
    {
        if (text.GetValue(RebuildingProperty))
        {
            return;
        }

        if (!text.IsSet(SourceProperty))
        {
            text.SetValue(SourceProperty, text.Text);
        }

        var whole = text.GetValue(SourceProperty) ?? "";
        var start = GetStart(text);
        var length = GetLength(text);
        text.SetValue(RebuildingProperty, true);
        try
        {
            if (start < 0 || length <= 0 || start + length > whole.Length)
            {
                if (text.Inlines is { Count: > 0 })
                {
                    text.Inlines.Clear();
                    text.SetCurrentValue(TextBlock.TextProperty, whole);
                }

                return;
            }

            text.SetCurrentValue(TextBlock.TextProperty, null);
            text.Inlines ??= [];
            text.Inlines.Clear();
            var hit = new Run(whole.Substring(start, length));
            hit.Bind(TextElement.ForegroundProperty, text.GetResourceObservable("AccentTextFillColorPrimaryBrush"));
            text.Inlines.AddRange([new Run(whole[..start]), hit, new Run(whole[(start + length)..])]);
        }
        finally
        {
            text.SetValue(RebuildingProperty, false);
        }
    }
}
