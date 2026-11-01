using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Presenters;
using Avalonia.Controls.Primitives;
using Avalonia.Media;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Testing;

public static class PopupSurfaceProbe
{
    public static IReadOnlyList<string> Probe(TopLevel top)
    {
        ArgumentNullException.ThrowIfNull(top);
        var violations = new SortedSet<string>(CheckOpen(top), StringComparer.Ordinal);
        var controls = top.GetVisualDescendants().OfType<Control>().Where(control => control.IsEffectivelyVisible && control.IsEffectivelyEnabled).ToList();
        foreach (var combo in controls.OfType<ComboBox>())
        {
            combo.IsDropDownOpen = true;
            Collect(top, violations);
            combo.IsDropDownOpen = false;
            HeadlessSession.Pump();
        }

        foreach (var button in controls.OfType<Button>().Where(button => button.Flyout is not null))
        {
            button.Flyout!.ShowAt(button);
            Collect(top, violations);
            button.Flyout.Hide();
            HeadlessSession.Pump();
        }

        foreach (var host in controls.Where(control => control.ContextMenu is not null))
        {
            host.ContextMenu!.Open(host);
            Collect(top, violations);
            host.ContextMenu.Close();
            HeadlessSession.Pump();
        }

        return [.. violations];
    }

    public static IReadOnlyList<string> CheckOpen(TopLevel top)
    {
        ArgumentNullException.ThrowIfNull(top);
        var violations = new SortedSet<string>(StringComparer.Ordinal);
        foreach (var child in top.OpenedPopups.Select(popup => popup.Child).OfType<Control>())
        {
            Check(child, violations);
            foreach (var item in child.GetVisualDescendants().OfType<MenuItem>().Where(item => item.ItemCount > 0 && item.IsEffectivelyEnabled))
            {
                item.IsSubMenuOpen = true;
                HeadlessSession.Pump();
                if (item.GetVisualDescendants().OfType<Popup>().FirstOrDefault(popup => popup.IsOpen)?.Child is Control submenu)
                {
                    Check(submenu, violations);
                }

                item.IsSubMenuOpen = false;
                HeadlessSession.Pump();
            }
        }

        return [.. violations];
    }

    private static void Check(Control child, SortedSet<string> violations)
    {
        var surface = child.GetSelfAndVisualDescendants().OfType<Control>().FirstOrDefault(Acrylic.GetIsEnabled);
        if (surface is null)
        {
            violations.Add($"{Describe(child)}: no Acrylic.IsEnabled on the popup surface");
            return;
        }

        var fill = Fill(surface);
        var area = surface.Bounds.Width * surface.Bounds.Height;
        foreach (var cover in surface.GetVisualDescendants().OfType<Control>().Where(control => control.IsEffectivelyVisible))
        {
            if (Fill(cover) is ISolidColorBrush { Color.A: > 0 } brush && !ReferenceEquals(brush, fill) && cover.Bounds.Width * cover.Bounds.Height >= area * 0.9)
            {
                violations.Add($"{Describe(child)}: {Describe(cover)} covers the acrylic with {brush.Color}");
            }
        }
    }

    private static void Collect(TopLevel top, SortedSet<string> violations)
    {
        HeadlessSession.Pump();
        violations.UnionWith(CheckOpen(top));
    }

    private static IBrush? Fill(Control control) => control switch
    {
        Border border => border.Background,
        Panel panel => panel.Background,
        ContentPresenter presenter => presenter.Background,
        TemplatedControl templated => templated.Background,
        _ => null,
    };

    private static string Describe(Control control) =>
        $"{control.GetType().Name}{(string.IsNullOrEmpty(control.Name) ? "" : "#" + control.Name)}{(control.TemplatedParent is { } owner ? " in " + owner.GetType().Name : "")}";
}
