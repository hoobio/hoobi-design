using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Layout;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

using Hoobi.Design.Avalonia;

namespace Hoobi.Design.Gallery;

public partial class ButtonsPage : UserControl
{
    public ButtonsPage()
    {
        InitializeComponent();
        foreach (var tile in TintedTiles.Children.OfType<Control>().Where(tile => tile.Tag is string))
        {
            tile.Loaded += (_, _) =>
            {
                foreach (var presenter in tile.GetVisualDescendants().OfType<ContentPresenter>())
                {
                    presenter.Transitions = null;
                }

                foreach (var state in ((string)tile.Tag!).Split(' '))
                {
                    ((IPseudoClasses)tile.Classes).Add(state);
                }
            };
        }
    }
}

public partial class DialogsPage : UserControl
{
    public DialogsPage()
    {
        InitializeComponent();
        FormDialogButton.Click += async (_, _) => await AppDialogs.ShowAsync(NewFormDialog(), TopLevel.GetTopLevel(this)!);
        MessageDialogButton.Click += async (_, _) => await AppDialogs.ShowMessageAsync(TopLevel.GetTopLevel(this)!, "Remove WeakAuras?", "Its saved variables stay in the WTF folder.", "Remove", "Cancel");
        ToastButton.Click += (_, _) => ToastWindow.Show(TopLevel.GetTopLevel(this), "Copied the password");
    }

    public static FAContentDialog NewFormDialog() => new()
    {
        Title = "Add an install",
        PrimaryButtonText = "Add",
        SecondaryButtonText = "Browse",
        CloseButtonText = "Cancel",
        Content = new StackPanel
        {
            Spacing = 12,
            Children =
            {
                new TextBlock { Text = "Steward finds the addon folder from the game folder.", TextWrapping = TextWrapping.Wrap },
                new TextBox { PlaceholderText = @"D:\Games\World of Warcraft" },
                new ComboBox { Items = { "Retail", "Classic" }, SelectedIndex = 0, HorizontalAlignment = HorizontalAlignment.Stretch },
                new CheckBox { Content = "Keep the old folder", IsChecked = true },
            },
        },
    };
}

public partial class SettingsPage : UserControl
{
    public SettingsPage() => InitializeComponent();
}

public partial class LayoutPage : UserControl
{
    public LayoutPage()
    {
        InitializeComponent();
        Chips.ItemsSource = new[] { "Discord", "Spotify", "Firefox", "World of Warcraft", "Teams", "VLC" };
    }
}

public partial class SelectionPage : UserControl
{
    public SelectionPage() => InitializeComponent();
}

public partial class TextPage : UserControl
{
    public TextPage() => InitializeComponent();
}

public partial class SurfacesPage : UserControl
{
    public SurfacesPage() => InitializeComponent();
}

public partial class StatusPage : UserControl
{
    public StatusPage() => InitializeComponent();
}

public partial class FlyoutsPage : UserControl
{
    public FlyoutsPage() => InitializeComponent();
}

public partial class ChromePage : UserControl
{
    public ChromePage()
    {
        InitializeComponent();
        CloseOnlyButton.Click += (_, _) => NewCloseOnlyWindow().Show();
    }

    public static Window NewCloseOnlyWindow()
    {
        var window = new Window
        {
            Title = "Close only",
            Width = 420,
            Height = 240,
            ExtendClientAreaToDecorationsHint = true,
            WindowDecorationsTheme = (ControlTheme)Application.Current!.FindResource("HoobiCloseOnlyDecorations")!,
            Content = new TextBlock { Text = "HoobiCloseOnlyDecorations", Margin = new Thickness(16, 16, 0, 0), FontSize = 12 },
        };
        window.Bind(Window.BackgroundProperty, window.GetResourceObservable("HoobiBgBrush"));
        window.Bind(Window.ExtendClientAreaTitleBarHeightHintProperty, window.GetResourceObservable("TitleBarHeight"));
        return window;
    }
}
