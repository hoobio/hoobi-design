using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

using Hoobi.Design.Avalonia;

namespace Hoobi.Design.Gallery;

public partial class InputsMorePage : UserControl
{
    public InputsMorePage()
    {
        InitializeComponent();
        PinnedStates.Apply(this);
        HoverSlider.Loaded += (_, _) => ((IPseudoClasses)HoverSlider.GetVisualDescendants().OfType<Thumb>().Single().Classes).Add(":pointerover");
        BareDialogButton.Click += async (_, _) => await AppDialogs.ShowAsync(NewBareDialog(), TopLevel.GetTopLevel(this)!);
    }

    public static FAContentDialog NewBareDialog() => new()
    {
        Classes = { "Bare" },
        Content = new StackPanel
        {
            Margin = new(24, 22, 24, 22),
            Spacing = 14,
            Children =
            {
                new TextBlock { Text = "Sign in to RestedXP", FontSize = 20, FontWeight = FontWeight.SemiBold },
                new TextBlock { Classes = { "Dim" }, Text = "Authenticator code", HorizontalAlignment = HorizontalAlignment.Center },
                new TextBox { Classes = { "Code" }, Width = 186, Text = "123 456", HorizontalAlignment = HorizontalAlignment.Center },
            },
        },
    };
}
