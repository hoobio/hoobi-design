using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Styling;

using Hoobi.Design.Avalonia;

namespace Hoobi.Design.Gallery;

public partial class MainWindow : Window
{
    public static readonly IReadOnlyList<(string Name, Func<Control> Create)> Pages =
    [
        ("Buttons", () => new ButtonsPage()),
        ("Navigation and actions", () => new ActionsPage()),
        ("Selection", () => new SelectionPage()),
        ("Text and input", () => new TextPage()),
        ("Sliders, codes and expanders", () => new InputsMorePage()),
        ("Rows and surfaces", () => new SurfacesPage()),
        ("Text, badges and slots", () => new SurfacesMorePage()),
        ("Status", () => new StatusPage()),
        ("Flyouts and menus", () => new FlyoutsPage()),
        ("Dialogs and toasts", () => new DialogsPage()),
        ("Settings cards", () => new SettingsPage()),
        ("Layout and motion", () => new LayoutPage()),
        ("Components", () => new ComponentsPage()),
        ("Window chrome", () => new ChromePage()),
    ];

    public MainWindow()
    {
        InitializeComponent();
        HoobiChrome.Attach(this);
        var rowTheme = (ControlTheme)this.FindResource("MenuRowButtonStyle")!;
        foreach (var (name, _) in Pages)
        {
            var row = new Button { Content = name, Theme = rowTheme };
            row.Click += (_, _) => Navigate(name);
            Nav.Children.Add(row);
            var item = new MenuItem { Header = name };
            item.Click += (_, _) => Navigate(name);
            ((MenuFlyout)PagePicker.Flyout!).Items.Add(item);
        }

        Navigate(Pages[0].Name);
    }

    public void Navigate(string name)
    {
        Page.Content = Pages.Single(page => page.Name == name).Create();
        foreach (var row in Nav.Children.OfType<Button>())
        {
            var current = Equals(row.Content, name);
            row.FontWeight = current ? FontWeight.SemiBold : FontWeight.Normal;
            if (current)
            {
                row.Bind(ForegroundProperty, row.GetResourceObservable("AccentTextFillColorPrimaryBrush"));
            }
            else
            {
                row.ClearValue(ForegroundProperty);
            }
        }
    }
}
