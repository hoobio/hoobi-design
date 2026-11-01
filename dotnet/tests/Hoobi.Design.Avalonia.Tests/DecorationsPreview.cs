using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Chrome;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

internal static class DecorationsPreview
{
    // The headless platform asks for no drawn decorations, so a test builds the theme's template itself and stands in for the title bar bindings a window would supply.
    public static Window Show(string themeKey, bool active = true)
    {
        var theme = AvaloniaSession.Resource<ControlTheme>(themeKey);
        var template = theme.Setters.OfType<Setter>().Single(setter => setter.Property == WindowDrawnDecorations.TemplateProperty).Value as IWindowDrawnDecorationsTemplate
            ?? throw new InvalidOperationException($"{themeKey} has no decorations template.");
        var content = template.Build().Result;
        var (underlay, overlay) = (content.Underlay!, content.Overlay!);
        (content.Underlay, content.Overlay) = (null, null);
        var height = AvaloniaSession.Resource<double>("TitleBarHeight");
        var window = new Window
        {
            Width = 480,
            Height = height,
            Background = AvaloniaSession.Resource<IBrush>("HoobiBgBrush"),
            Content = new Panel { Children = { underlay, overlay } },
        };
        window.Show();
        foreach (var part in window.GetVisualDescendants().OfType<Panel>().Where(panel => panel.Name is "PART_TitleBar" or "PART_OverlayPanel"))
        {
            part.IsVisible = true;
            part.Height = height;
        }

        foreach (var button in window.GetVisualDescendants().OfType<Button>().Where(button => button.Classes.Contains("CaptionButton")))
        {
            button.Classes.Set("inactive", !active);
        }

        AvaloniaSession.Pump();
        return window;
    }
}
