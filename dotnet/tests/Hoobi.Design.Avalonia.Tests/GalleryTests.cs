using System.Text.RegularExpressions;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Headless;
using Avalonia.Markup.Xaml.Styling;
using Avalonia.Media.Imaging;
using Avalonia.Styling;
using Avalonia.VisualTree;

using Hoobi.Design.Avalonia.Testing;
using Hoobi.Design.Gallery;

namespace Hoobi.Design.Avalonia.Tests;

public sealed partial class GalleryTests(AvaloniaSession session)
{
    private static readonly string[] Decorations = ["HoobiWindowDecorations", "HoobiCloseOnlyDecorations"];
    private static readonly bool[] States = [true, false];

    public static TheoryData<string> PageNames => [.. MainWindow.Pages.Select(page => page.Name)];

    [Fact]
    public void No_hover_or_press_fade_passes_through_a_lighter_colour() => session.Run(() =>
    {
        var window = ShowGallery();
        var flashes = new SortedSet<string>(StringComparer.Ordinal);
        try
        {
            foreach (var (name, _) in MainWindow.Pages)
            {
                window.Navigate(name);
                AvaloniaSession.Pump();
                flashes.UnionWith(HoverFlashProbe.Probe(window));
                foreach (var _ in OpenEachPopup(window))
                {
                    flashes.UnionWith(HoverFlashProbe.ProbePopups(window));
                }
            }
        }
        finally
        {
            window.Close();
        }

        foreach (var key in Decorations)
        {
            var preview = DecorationsPreview.Show(key);
            flashes.UnionWith(HoverFlashProbe.Probe(preview));
            preview.Close();
        }

        Assert.True(flashes.Count == 0, string.Join(Environment.NewLine, flashes));
    });

    [Theory]
    [MemberData(nameof(PageNames))]
    public void Text_ink_is_centred_on_every_page(string page) => session.Run(() =>
    {
        var window = ShowGallery();
        try
        {
            window.Navigate(page);
            AvaloniaSession.Pump();
            var failures = TextCentring.Scan(window, page).Where(finding => finding.Fails).ToList();
            Assert.True(failures.Count == 0, string.Join(Environment.NewLine, failures));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void Every_control_theme_and_class_in_the_library_appears_in_the_gallery() => session.Run(() =>
    {
        var seen = new List<StyledElement>();
        var window = ShowGallery();
        var closeOnly = ChromePage.NewCloseOnlyWindow();
        closeOnly.Show();
        AvaloniaSession.Pump();
        try
        {
            foreach (var (name, _) in MainWindow.Pages)
            {
                window.Navigate(name);
                AvaloniaSession.Pump();
                seen.AddRange(Elements(window));
                foreach (var _ in OpenEachPopup(window))
                {
                    foreach (var popup in window.OpenedPopups)
                    {
                        seen.AddRange(Elements((Visual)popup.Child!));
                    }
                }
            }

            seen.AddRange(Elements(closeOnly));
            foreach (var key in Decorations)
            {
                var preview = DecorationsPreview.Show(key);
                seen.AddRange(Elements(preview));
                preview.Close();
            }

            var decorations = new[] { window.WindowDecorationsTheme, closeOnly.WindowDecorationsTheme };
            var themes = Controls().Resources.Where(entry => entry.Value is ControlTheme).ToList();
            var missing = themes
                .Where(entry => entry.Key is Type type
                    ? !seen.Any(type.IsInstanceOfType)
                    : !seen.Any(element => element.Theme == entry.Value || (element as ItemsControl)?.ItemContainerTheme == entry.Value) && !decorations.Contains(entry.Value))
                .Select(entry => $"theme {entry.Key}")
                .Concat(ClassSelectors().Where(selector => !seen.Any(element => Matches(element, selector))).Select(selector => $"class {selector.Type}.{string.Join('.', selector.Classes)}"))
                .ToList();

            Assert.True(missing.Count == 0, string.Join(Environment.NewLine, missing));
        }
        finally
        {
            closeOnly.Close();
            window.Close();
        }
    });

    [Fact]
    public void Every_page_renders_to_a_png_when_asked() => session.Run(() =>
    {
        if (Environment.GetEnvironmentVariable("HOOBI_GALLERY_PNG_DIR") is not { Length: > 0 } directory)
        {
            return;
        }

        Directory.CreateDirectory(directory);
        var window = ShowGallery();
        try
        {
            foreach (var (name, _) in MainWindow.Pages)
            {
                window.Navigate(name);
                AvaloniaSession.Pump();
                Save(window, Path.Combine(directory, $"{name}.png"));
                var shot = 0;
                foreach (var popup in OpenEachPopup(window))
                {
                    Save(window, Path.Combine(directory, $"{name} {++shot} {popup}.png"));
                }
            }
        }
        finally
        {
            window.Close();
        }

        foreach (var key in Decorations)
        {
            foreach (var active in States)
            {
                var preview = DecorationsPreview.Show(key, active);
                Save(preview, Path.Combine(directory, $"{key} {(active ? "active" : "inactive")}.png"));
                preview.Close();
            }
        }
    });

    internal static MainWindow ShowGallery()
    {
        var window = new MainWindow { Width = 1280, Height = 800 };
        window.Show();
        AvaloniaSession.Pump();
        return window;
    }

    internal static IEnumerable<string> OpenEachPopup(Window window)
    {
        var page = (Control)window.GetVisualDescendants().OfType<ContentControl>().First(control => control.Name == "Page").Content!;
        foreach (var button in page.GetVisualDescendants().OfType<Button>().Where(button => button.Flyout is not null && button.IsEffectivelyEnabled).ToList())
        {
            button.Flyout!.ShowAt(button);
            AvaloniaSession.Pump();
            yield return $"{button.Content} flyout";
            button.Flyout.Hide();
            AvaloniaSession.Pump();
        }

        foreach (var combo in page.GetVisualDescendants().OfType<ComboBox>().Where(combo => combo.IsEffectivelyEnabled).ToList())
        {
            combo.IsDropDownOpen = true;
            AvaloniaSession.Pump();
            yield return "combo box list";
            combo.IsDropDownOpen = false;
            AvaloniaSession.Pump();
        }

        foreach (var host in page.GetVisualDescendants().OfType<Control>().Where(control => control.ContextMenu is not null).ToList())
        {
            host.ContextMenu!.Open(host);
            AvaloniaSession.Pump();
            yield return "context menu";
            host.ContextMenu.Close();
            AvaloniaSession.Pump();
        }

        foreach (var target in page.GetVisualDescendants().OfType<Control>().Where(control => ToolTip.GetTip(control) is not null && control.IsEffectivelyEnabled).ToList())
        {
            var centre = target.TranslatePoint(new Point(target.Bounds.Width / 2, target.Bounds.Height / 2), window)!.Value;
            window.MouseMove(centre);
            ToolTip.SetIsOpen(target, true);
            AvaloniaSession.Pump();
            yield return "tooltip";
            ToolTip.SetIsOpen(target, false);
            AvaloniaSession.Pump();
        }
    }

    private static void Save(TopLevel top, string path)
    {
        using var frame = top.CaptureRenderedFrame()!;
        frame.Save(path, PngBitmapEncoderOptions.Default);
    }

    private static IEnumerable<StyledElement> Elements(Visual root) => root.GetSelfAndVisualDescendants().OfType<StyledElement>();

    private static Styles Controls() =>
        Application.Current!.Styles.OfType<HoobiTheme>().Single()
            .Select(style => style is StyleInclude include ? include.Loaded : style).OfType<Styles>()
            .Single(styles => styles.Resources.ContainsKey("DefaultButtonStyle"));

    private static IReadOnlyList<(string Type, string[] Classes)> ClassSelectors()
    {
        var text = File.ReadAllText(Path.Combine(AvaloniaSession.DotnetRoot(), "src", "Hoobi.Design.Avalonia", "Themes", "Controls.axaml"));
        return [.. SelectorAttribute().Matches(text)
            .Select(match => match.Groups[1].Value)
            .Where(selector => !selector.StartsWith('^'))
            .SelectMany(selector => selector.Split(','))
            .SelectMany(part => part.Split("/template/")[0].Split([' ', '>'], StringSplitOptions.RemoveEmptyEntries))
            .Select(segment => Decoration().Replace(segment, ""))
            .Select(segment => ClassSegment().Match(segment))
            .Where(match => match.Success)
            .Select(match => (match.Groups[1].Value, match.Groups[2].Value.Split('.', StringSplitOptions.RemoveEmptyEntries)))
            .Where(selector => (selector.Item1, selector.Item2) is not ("ScrollViewer", [ScrollIndicator.ActiveClass]))
            .Distinct()];
    }

    private static bool Matches(StyledElement element, (string Type, string[] Classes) selector)
    {
        for (var type = element.GetType(); type is not null; type = type.BaseType)
        {
            if (type.Name == selector.Type)
            {
                return selector.Classes.All(element.Classes.Contains);
            }
        }

        return false;
    }

    [GeneratedRegex("<Style Selector=\"([^\"]+)\"")]
    private static partial Regex SelectorAttribute();

    [GeneratedRegex(@"\w+\||\[[^\]]*\]|:[\w-]+(\([^)]*\))?")]
    private static partial Regex Decoration();

    [GeneratedRegex(@"^(\w+)((?:\.\w+)+)$")]
    private static partial Regex ClassSegment();
}
