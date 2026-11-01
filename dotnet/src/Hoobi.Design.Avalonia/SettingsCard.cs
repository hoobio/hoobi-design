using Avalonia;
using Avalonia.Animation;
using Avalonia.Automation;
using Avalonia.Automation.Peers;
using Avalonia.Automation.Provider;
using Avalonia.Data;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Input;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia;

public class SettingsCard : ContentControl
{
    public static readonly StyledProperty<object?> HeaderProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(Header));

    public static readonly StyledProperty<object?> DescriptionProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(Description));

    public static readonly StyledProperty<object?> HeaderIconProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(HeaderIcon));

    public static readonly StyledProperty<string?> HeaderGlyphProperty = AvaloniaProperty.Register<SettingsCard, string?>(nameof(HeaderGlyph));

    public static readonly StyledProperty<string?> ActionGlyphProperty = AvaloniaProperty.Register<SettingsCard, string?>(nameof(ActionGlyph));

    public static readonly StyledProperty<object?> ExpandedContentProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(ExpandedContent));

    public static readonly StyledProperty<bool> IsClickEnabledProperty = AvaloniaProperty.Register<SettingsCard, bool>(nameof(IsClickEnabled));

    public static readonly StyledProperty<bool?> IsExpandedProperty = AvaloniaProperty.Register<SettingsCard, bool?>(nameof(IsExpanded), defaultBindingMode: BindingMode.TwoWay);

    public static readonly StyledProperty<object?> PreviewProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(Preview));

    public static readonly AttachedProperty<bool> PreviewScopeProperty = AvaloniaProperty.RegisterAttached<SettingsCard, Control, bool>("PreviewScope");

    public static readonly RoutedEvent<RoutedEventArgs> ClickEvent = RoutedEvent.Register<SettingsCard, RoutedEventArgs>(nameof(Click), RoutingStrategies.Bubble);

    private Visual? _chevron;
    private Layoutable? _headerBlock;
    private Layoutable? _previewHost;
    private Layoutable? _preview;
    private Layoutable? _icon;
    private Layoutable? _content;
    private bool _previewFits;

    static SettingsCard()
    {
        FocusableProperty.OverrideDefaultValue<SettingsCard>(false);
        AffectsMeasure<SettingsCard>(PreviewProperty);
        IsClickEnabledProperty.Changed.AddClassHandler<SettingsCard>((card, e) => card.Focusable = e.GetNewValue<bool>());
        HeaderIconProperty.Changed.AddClassHandler<SettingsCard>((card, _) => card.UpdateIcon());
        HeaderGlyphProperty.Changed.AddClassHandler<SettingsCard>((card, _) => card.UpdateIcon());
        IsExpandedProperty.Changed.AddClassHandler<SettingsCard>((card, e) =>
        {
            var expanded = e.GetNewValue<bool?>();
            if (card._chevron is { } chevron)
            {
                chevron.Transitions = [new TransformOperationsTransition
                {
                    Property = RenderTransformProperty,
                    Duration = expanded == true ? Motion.Expand : Motion.Fast,
                    Easing = expanded == true ? Motion.Decelerate : Motion.Collapse,
                }];
            }

            card.PseudoClasses.Set(":expanded", expanded == true);
            card.PseudoClasses.Set(":collapsed", expanded == false);
        });
    }

    public event EventHandler<RoutedEventArgs> Click
    {
        add => AddHandler(ClickEvent, value);
        remove => RemoveHandler(ClickEvent, value);
    }

    public object? Header
    {
        get => GetValue(HeaderProperty);
        set => SetValue(HeaderProperty, value);
    }

    public object? Description
    {
        get => GetValue(DescriptionProperty);
        set => SetValue(DescriptionProperty, value);
    }

    public object? HeaderIcon
    {
        get => GetValue(HeaderIconProperty);
        set => SetValue(HeaderIconProperty, value);
    }

    public string? HeaderGlyph
    {
        get => GetValue(HeaderGlyphProperty);
        set => SetValue(HeaderGlyphProperty, value);
    }

    public string? ActionGlyph
    {
        get => GetValue(ActionGlyphProperty);
        set => SetValue(ActionGlyphProperty, value);
    }

    public object? ExpandedContent
    {
        get => GetValue(ExpandedContentProperty);
        set => SetValue(ExpandedContentProperty, value);
    }

    public object? Preview
    {
        get => GetValue(PreviewProperty);
        set => SetValue(PreviewProperty, value);
    }

    public static bool GetPreviewScope(Control element) => element.GetValue(PreviewScopeProperty);

    public static void SetPreviewScope(Control element, bool value) => element.SetValue(PreviewScopeProperty, value);

    public bool IsClickEnabled
    {
        get => GetValue(IsClickEnabledProperty);
        set => SetValue(IsClickEnabledProperty, value);
    }

    public bool? IsExpanded
    {
        get => GetValue(IsExpandedProperty);
        set => SetValue(IsExpandedProperty, value);
    }

    protected override void OnApplyTemplate(TemplateAppliedEventArgs e)
    {
        base.OnApplyTemplate(e);
        _chevron = e.NameScope.Find<Visual>("PART_Chevron");
        _headerBlock = e.NameScope.Find<Layoutable>("PART_HeaderBlock");
        _previewHost = e.NameScope.Find<Layoutable>("PART_PreviewHost");
        _preview = e.NameScope.Find<Layoutable>("PART_Preview");
        _icon = e.NameScope.Find<Layoutable>("PART_Icon");
        _content = e.NameScope.Find<Layoutable>("PART_Content");
    }

    protected override Size MeasureOverride(Size availableSize)
    {
        if (Preview is null || _headerBlock is null || _preview is null || _previewHost is null)
        {
            ShowPreview(false);
            return base.MeasureOverride(availableSize);
        }

        _headerBlock.Measure(Size.Infinity);
        var header = _headerBlock.DesiredSize.Width;
        _preview.Measure(Size.Infinity);
        var preview = _preview.DesiredSize.Width + _previewHost.Margin.Left;
        var size = base.MeasureOverride(availableSize);
        var inner = availableSize.Width - BorderThickness.Left - BorderThickness.Right - Padding.Left - Padding.Right;
        var taken = Taken(_icon) + Taken(_content) + Taken(_chevron as Layoutable);
        _previewFits = double.IsInfinity(inner) || header + preview + taken <= inner;
        UpdatePreviews();
        return size;
    }

    private static double Taken(Layoutable? part) => part is { IsVisible: true } ? part.DesiredSize.Width : 0;

    private void UpdatePreviews()
    {
        if (Scope() is not { } scope)
        {
            ShowPreview(_previewFits);
            return;
        }

        var members = scope.GetVisualDescendants().OfType<SettingsCard>().Where(card => card.Preview is not null && card.Scope() == scope).ToList();
        var show = members.All(card => card._previewFits);
        foreach (var card in members)
        {
            card.ShowPreview(show);
        }
    }

    private void ShowPreview(bool show)
    {
        if (_previewHost is not null)
        {
            _previewHost.IsVisible = show && Preview is not null;
        }
    }

    private Control? Scope() => this.GetVisualAncestors().OfType<Control>().FirstOrDefault(GetPreviewScope);

    private void UpdateIcon() => PseudoClasses.Set(":icon", HeaderIcon is not null || !string.IsNullOrEmpty(HeaderGlyph));

    internal void RaiseClick()
    {
        if (IsExpanded is { } expanded)
        {
            SetCurrentValue(IsExpandedProperty, !expanded);
        }

        RaiseEvent(new RoutedEventArgs(ClickEvent, this));
    }

    protected override void OnPointerPressed(PointerPressedEventArgs e)
    {
        ArgumentNullException.ThrowIfNull(e);

        base.OnPointerPressed(e);
        if (IsClickEnabled && e.GetCurrentPoint(this).Properties.IsLeftButtonPressed)
        {
            PseudoClasses.Set(":pressed", true);
            e.Handled = true;
        }
    }

    protected override void OnPointerReleased(PointerReleasedEventArgs e)
    {
        ArgumentNullException.ThrowIfNull(e);

        base.OnPointerReleased(e);
        if (!PseudoClasses.Contains(":pressed"))
        {
            return;
        }

        PseudoClasses.Set(":pressed", false);
        if (new Rect(Bounds.Size).Contains(e.GetPosition(this)))
        {
            RaiseClick();
        }

        e.Handled = true;
    }

    protected override void OnPointerCaptureLost(PointerCaptureLostEventArgs e)
    {
        base.OnPointerCaptureLost(e);
        PseudoClasses.Set(":pressed", false);
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
        ArgumentNullException.ThrowIfNull(e);

        base.OnKeyDown(e);
        if (IsClickEnabled && e.Key is Key.Enter or Key.Space)
        {
            RaiseClick();
            e.Handled = true;
        }
    }

    protected override AutomationPeer OnCreateAutomationPeer() => new CardPeer(this);

    // The peer is created once and can predate IsClickEnabled, so its role and Invoke read the property at each call.
    private sealed class CardPeer(SettingsCard owner) : ControlAutomationPeer(owner), IInvokeProvider
    {
        private SettingsCard Card => (SettingsCard)Owner;

        public void Invoke()
        {
            if (Card.IsClickEnabled && Card.IsEffectivelyEnabled)
            {
                Card.RaiseClick();
            }
        }

        protected override string? GetNameCore() =>
            AutomationProperties.GetName(Owner) is { Length: > 0 } name ? name : Card.Header as string;

        protected override AutomationControlType GetAutomationControlTypeCore() =>
            Card.IsClickEnabled ? AutomationControlType.Button : AutomationControlType.Group;

        protected override bool IsControlElementCore() => true;

        protected override bool IsContentElementCore() => true;

        protected override object? GetProviderCore(Type providerType) =>
            providerType == typeof(IInvokeProvider) && !Card.IsClickEnabled ? null : base.GetProviderCore(providerType);
    }
}
