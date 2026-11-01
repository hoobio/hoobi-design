using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Platform;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia;

public sealed class ToastWindow : Window
{
    public static readonly TimeSpan VisibleFor = TimeSpan.FromSeconds(2);
    public static readonly TimeSpan FadeFor = TimeSpan.FromMilliseconds(150);

    private readonly DispatcherTimer _hideTimer = new() { Interval = VisibleFor };
    private readonly DispatcherTimer _fadeTimer = new() { Interval = FadeFor };
    private readonly Border _card;
    private readonly TextBlock _glyph;
    private readonly TextBlock _message;
    private Screen? _screen;

    public ToastWindow()
    {
        WindowDecorations = WindowDecorations.None;
        ShowActivated = false;
        ShowInTaskbar = false;
        Topmost = true;
        CanResize = false;
        SizeToContent = SizeToContent.WidthAndHeight;
        TransparencyLevelHint = [WindowTransparencyLevel.Transparent];
        this.Bind(BackgroundProperty, this.GetResourceObservable("HoobiToastWindowBackground"));
        // The window template lays a transparent hit-test panel under the whole client area, so the shadow gutter would take clicks; the toast holds nothing to click.
        IsHitTestVisible = false;
        _glyph = new TextBlock { VerticalAlignment = VerticalAlignment.Center, Classes = { "Icon" } };
        _message = new TextBlock { MaxWidth = 480, TextTrimming = TextTrimming.CharacterEllipsis, VerticalAlignment = VerticalAlignment.Center };
        _message.Bind(TextBlock.FontSizeProperty, _message.GetResourceObservable("BodyTextBlockFontSize"));
        _card = new Border
        {
            Margin = new Thickness(24, 24, 24, 16),
            Padding = new Thickness(12, 10),
            Opacity = 0,
            Transitions = [new DoubleTransition { Property = OpacityProperty, Duration = FadeFor, Easing = Motion.Standard }],
            Child = new StackPanel { Orientation = Orientation.Horizontal, Spacing = 10, Children = { _glyph, _message } },
        };
        _card.Bind(Border.BackgroundProperty, _card.GetResourceObservable("LayerFillColorAltBrush"));
        _card.Bind(Border.CornerRadiusProperty, _card.GetResourceObservable("OverlayCornerRadius"));
        _card.Bind(Border.BoxShadowProperty, _card.GetResourceObservable("HoobiFlyoutShadow"));
        Content = _card;
        ToastWindowInterop.MakeNonActivating(this);
        _hideTimer.Tick += (_, _) => FadeOut();
        _fadeTimer.Tick += (_, _) =>
        {
            _fadeTimer.Stop();
            Hide();
        };
        SizeChanged += (_, _) => PlaceOnScreen();
        ScalingChanged += (_, _) => PlaceOnScreen();
    }

    public static ToastWindow? Current { get; private set; }

    public string? Text => _message.Text;

    public Tone Tone { get; private set; }

    public bool IsSuccess => Tone == Tone.Success;

    public bool IsHideScheduled => _hideTimer.IsEnabled;

    public bool IsFading => _fadeTimer.IsEnabled;

    public double CardOpacity => _card.GetBaseValue(OpacityProperty).GetValueOrDefault();

    public static void Show(TopLevel? source, string text, bool success = true) => Show(source, text, success ? Tone.Success : Tone.Neutral);

    public static void Show(TopLevel? source, string text, Tone tone) => (Current ??= new ToastWindow()).Present(source, text, tone);

    public static PixelPoint Place(PixelRect workArea, Size size, double scaling)
    {
        var width = (int)Math.Ceiling(size.Width * scaling);
        var height = (int)Math.Ceiling(size.Height * scaling);
        return new PixelPoint(workArea.X + ((workArea.Width - width) / 2), workArea.Bottom - height);
    }

    public void Present(TopLevel? source, string text, bool success) => Present(source, text, success ? Tone.Success : Tone.Neutral);

    public void Present(TopLevel? source, string text, Tone tone)
    {
        _hideTimer.Stop();
        _fadeTimer.Stop();
        _message.Text = text;
        Tone = tone;
        _glyph.IsVisible = tone != Tone.Neutral;
        _glyph.Bind(TextBlock.TextProperty, _glyph.GetResourceObservable(Toned.GlyphKeyFor(tone)));
        _glyph.Bind(TextBlock.ForegroundProperty, _glyph.GetResourceObservable(tone == Tone.Success ? "SystemFillColorSuccessBrush" : Toned.BrushKeyFor(tone)));
        _screen = source?.Screens?.ScreenFromTopLevel(source) ?? Screens.Primary;
        Show();
        PlaceOnScreen();
        _card.Opacity = 1;
        _hideTimer.Start();
    }

    public void FadeOut()
    {
        _hideTimer.Stop();
        _card.Opacity = 0;
        _fadeTimer.Start();
    }

    private void PlaceOnScreen()
    {
        if (_screen is { } screen && IsVisible)
        {
            Position = Place(screen.WorkingArea, ClientSize, screen.Scaling);
        }
    }
}
