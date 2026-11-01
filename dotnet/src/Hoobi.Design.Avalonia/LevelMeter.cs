using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace Hoobi.Design.Avalonia;

public sealed class LevelMeter : Control
{
    public static readonly StyledProperty<float[]?> LevelsProperty = AvaloniaProperty.Register<LevelMeter, float[]?>(nameof(Levels));
    public static readonly StyledProperty<float> HoldProperty = AvaloniaProperty.Register<LevelMeter, float>(nameof(Hold));
    public static readonly StyledProperty<double> VolumeProperty = AvaloniaProperty.Register<LevelMeter, double>(nameof(Volume), 1);
    public static readonly StyledProperty<double> WarnAtProperty = AvaloniaProperty.Register<LevelMeter, double>(nameof(WarnAt), 0.8);
    public static readonly StyledProperty<double> DangerAtProperty = AvaloniaProperty.Register<LevelMeter, double>(nameof(DangerAt), 0.9);

    private const double MinDb = -60;
    private const double HoldWidth = 2;

    private IBrush? _track;
    private IBrush? _level;
    private IBrush? _warn;
    private IBrush? _danger;
    private IBrush? _hold;

    static LevelMeter() => AffectsRender<LevelMeter>(LevelsProperty, HoldProperty, VolumeProperty, WarnAtProperty, DangerAtProperty);

    public float[]? Levels { get => GetValue(LevelsProperty); set => SetValue(LevelsProperty, value); }

    public float Hold { get => GetValue(HoldProperty); set => SetValue(HoldProperty, value); }

    public double Volume { get => GetValue(VolumeProperty); set => SetValue(VolumeProperty, value); }

    public double WarnAt { get => GetValue(WarnAtProperty); set => SetValue(WarnAtProperty, value); }

    public double DangerAt { get => GetValue(DangerAtProperty); set => SetValue(DangerAtProperty, value); }

    public static double Position(float amplitude)
    {
        if (amplitude <= 0)
        {
            return 0;
        }

        var db = 20 * Math.Log10(amplitude);
        return db <= MinDb ? 0 : Math.Clamp((db - MinDb) / -MinDb, 0, 1);
    }

    public override void Render(DrawingContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        var bounds = new Rect(Bounds.Size);
        if (bounds.Width <= 0 || bounds.Height <= 0 || _track is null || _level is null || _warn is null || _danger is null || _hold is null)
        {
            return;
        }

        using var clip = context.PushClip(new RoundedRect(bounds, Math.Min(4, bounds.Height / 2)));
        context.FillRectangle(_track, bounds);
        var span = bounds.Width * Math.Clamp(Volume, 0, 1);
        var warnX = span * WarnAt;
        var dangerX = span * DangerAt;
        var levels = Levels ?? [];
        var barHeight = bounds.Height / Math.Max(1, levels.Length);
        for (var i = 0; i < levels.Length; i++)
        {
            var width = Position(levels[i]) * span;
            var top = i * barHeight;
            Segment(context, _level, 0, Math.Min(width, warnX), top, barHeight);
            Segment(context, _warn, warnX, Math.Min(width, dangerX), top, barHeight);
            Segment(context, _danger, dangerX, width, top, barHeight);
        }

        if (Hold > 0.001f)
        {
            var at = Position(Hold) * span;
            context.FillRectangle(at >= dangerX ? _danger : _hold, new Rect(Math.Max(0, at - HoldWidth), 0, HoldWidth, bounds.Height));
        }
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        ResolveBrushes();
    }

    private static void Segment(DrawingContext context, IBrush brush, double from, double to, double top, double height)
    {
        if (to > from)
        {
            context.FillRectangle(brush, new Rect(from, top, to - from, height));
        }
    }

    private void ResolveBrushes()
    {
        _track = Brush("HoobiChipBrush");
        _level = Brush("HoobiAccentGreenBrush");
        _warn = Brush("HoobiWarnBrush");
        _danger = Brush("HoobiDangerBrush");
        _hold = Brush("HoobiTextBrush");
        InvalidateVisual();
    }

    private IBrush? Brush(string key) => this.TryFindResource(key, ActualThemeVariant, out var value) ? value as IBrush : null;
}
