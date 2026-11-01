using Avalonia;
using Avalonia.Controls;
using Avalonia.Styling;

namespace Hoobi.Design.Gallery;

public partial class ButtonsPage : UserControl
{
    public ButtonsPage() => InitializeComponent();
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
