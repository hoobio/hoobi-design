using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.VisualTree;

namespace Hoobi.Design.Gallery;

public partial class MainWindow : Window
{
    public static readonly IReadOnlyList<(string Name, Func<Control> Create)> Pages =
    [
        ("Buttons", () => new ButtonsPage()),
        ("Selection", () => new SelectionPage()),
        ("Text and input", () => new TextPage()),
        ("Rows and surfaces", () => new SurfacesPage()),
        ("Status", () => new StatusPage()),
        ("Flyouts and menus", () => new FlyoutsPage()),
        ("Window chrome", () => new ChromePage()),
    ];

    public MainWindow()
    {
        InitializeComponent();
        // WinUI keeps the 1px top resize border outside its client area, where Avalonia's extended client area draws over it.
        Root.Margin = new Thickness(0, 1, 0, 0);
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
        Activated += (_, _) => UpdateCaptionButtons();
        Deactivated += (_, _) => UpdateCaptionButtons();
        Opened += (_, _) => UpdateCaptionButtons();
        if (OperatingSystem.IsWindows())
        {
            Win32Properties.AddWndProcHookCallback(this, OnWndProc);
            var handle = TryGetPlatformHandle()?.Handle ?? 0;
            Native.Cloak(handle, cloaked: true);
            Opened += (_, _) => RequestAnimationFrame(_ => RequestAnimationFrame(_ => Native.Cloak(handle, cloaked: false)));
        }
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

    // FluentAvalonia binds the caption buttons' inactive class to an ancestor Window, but the decorations layer is the window's sibling under its host.
    private void UpdateCaptionButtons()
    {
        foreach (var button in this.GetVisualParent()?.GetVisualDescendants().OfType<Button>() ?? [])
        {
            if (button.Classes.Contains("CaptionButton"))
            {
                button.Classes.Set("inactive", !IsActive);
            }
        }
    }

    private static nint OnWndProc(nint hWnd, uint msg, nint wParam, nint lParam, ref bool handled)
    {
        // Moving onto a drawn caption button ends client tracking with WM_MOUSELEAVE right after Avalonia's non-client move set the hover, and Windows resends the move only 0.6s to 1.7s later.
        if (msg == Native.WM_MOUSELEAVE)
        {
            Native.RepostCaptionButtonMove(hWnd);
        }

        return 0;
    }
}
