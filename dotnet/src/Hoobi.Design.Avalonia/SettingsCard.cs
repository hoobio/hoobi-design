using Avalonia;
using Avalonia.Automation;
using Avalonia.Automation.Peers;
using Avalonia.Automation.Provider;
using Avalonia.Data;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;

namespace Hoobi.Design.Avalonia;

public class SettingsCard : ContentControl
{
    public static readonly StyledProperty<object?> HeaderProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(Header));

    public static readonly StyledProperty<object?> DescriptionProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(Description));

    public static readonly StyledProperty<object?> HeaderIconProperty = AvaloniaProperty.Register<SettingsCard, object?>(nameof(HeaderIcon));

    public static readonly StyledProperty<string?> HeaderGlyphProperty = AvaloniaProperty.Register<SettingsCard, string?>(nameof(HeaderGlyph));

    public static readonly StyledProperty<string?> ActionGlyphProperty = AvaloniaProperty.Register<SettingsCard, string?>(nameof(ActionGlyph));

    public static readonly StyledProperty<bool> IsClickEnabledProperty = AvaloniaProperty.Register<SettingsCard, bool>(nameof(IsClickEnabled));

    public static readonly StyledProperty<bool?> IsExpandedProperty = AvaloniaProperty.Register<SettingsCard, bool?>(nameof(IsExpanded), defaultBindingMode: BindingMode.TwoWay);

    public static readonly RoutedEvent<RoutedEventArgs> ClickEvent = RoutedEvent.Register<SettingsCard, RoutedEventArgs>(nameof(Click), RoutingStrategies.Bubble);

    static SettingsCard()
    {
        FocusableProperty.OverrideDefaultValue<SettingsCard>(false);
        IsClickEnabledProperty.Changed.AddClassHandler<SettingsCard>((card, e) => card.Focusable = e.GetNewValue<bool>());
        IsExpandedProperty.Changed.AddClassHandler<SettingsCard>((card, e) =>
        {
            var expanded = e.GetNewValue<bool?>();
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
