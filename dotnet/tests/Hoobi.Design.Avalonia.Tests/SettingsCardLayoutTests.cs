using Avalonia;
using Avalonia.Controls;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class SettingsCardLayoutTests(AvaloniaSession session)
{
    private const double IconColumn = 2 + 20 + 20;
    private const double ActionIconMargin = 14;

    [Theory]
    [InlineData(false, false)]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public void The_header_text_starts_at_the_padding_or_after_the_icon(bool glyph, bool icon) => session.Run(() =>
    {
        var card = new SettingsCard
        {
            Header = "Region",
            HeaderGlyph = glyph ? AvaloniaSession.Resource<string>("Glyph.Folder") : null,
            HeaderIcon = icon ? new Border { Width = 20, Height = 20 } : null,
        };
        var window = Host(card);
        try
        {
            var expected = card.BorderThickness.Left + card.Padding.Left + (glyph || icon ? IconColumn : 0);
            Assert.Equal(expected, X(Part(card, "PART_Header"), window));
        }
        finally
        {
            window.Close();
        }
    });

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void A_plain_child_row_and_a_nested_card_line_up_with_the_parent_header_text(bool glyph) => session.Run(() =>
    {
        var label = new TextBlock { Text = "Server URL" };
        var child = new Border { Classes = { "Row", "Switch", "Child" }, Child = label };
        var nested = new SettingsCard { Classes = { "Item" }, BorderThickness = new Thickness(0), Header = "Advanced", IsClickEnabled = true, IsExpanded = false };
        var parent = new SettingsCard
        {
            Classes = { "Item" },
            BorderThickness = new Thickness(0),
            Header = "Region",
            HeaderGlyph = glyph ? AvaloniaSession.Resource<string>("Glyph.Folder") : null,
            IsClickEnabled = true,
            IsExpanded = true,
            ExpandedContent = new StackPanel { Classes = { "Rows" }, Children = { child, nested } },
        };
        var window = Host(parent);
        try
        {
            var header = X(Part(parent, "PART_Header"), window);
            Assert.Equal(parent.Padding.Left + (glyph ? IconColumn : 0), header);
            Assert.Equal(header, X(label, window));
            Assert.Equal(header, X(Part(nested, "PART_Header"), window));
        }
        finally
        {
            window.Close();
        }
    });

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void The_control_sits_the_toolkit_action_icon_margin_from_the_chevron(bool inHeader) => session.Run(() =>
    {
        var combo = new ComboBox { Items = { "Self-hosted" }, SelectedIndex = 0 };
        var card = new SettingsCard { IsClickEnabled = true, IsExpanded = false };
        if (inHeader)
        {
            var row = new Grid { ColumnDefinitions = new ColumnDefinitions("*,Auto") };
            row.Children.Add(new TextBlock { Text = "Region" });
            Grid.SetColumn(combo, 1);
            row.Children.Add(combo);
            card.Header = row;
        }
        else
        {
            card.Header = "Region";
            card.Content = combo;
        }

        var window = Host(card);
        try
        {
            var chevron = Part(card, "PART_Chevron");
            Assert.Equal(ActionIconMargin, X(chevron, window) - (X(combo, window) + combo.Bounds.Width));
        }
        finally
        {
            window.Close();
        }
    });

    private static Control Part(SettingsCard card, string name) =>
        card.GetVisualDescendants().OfType<Control>().First(control => control.Name == name && control.TemplatedParent == card);

    private static double X(Visual visual, Visual root) => visual.TranslatePoint(default, root)!.Value.X;

    private static Window Host(Control content)
    {
        var window = new Window { Width = 600, Height = 400, Content = content };
        window.Show();
        AvaloniaSession.Pump();
        return window;
    }
}
