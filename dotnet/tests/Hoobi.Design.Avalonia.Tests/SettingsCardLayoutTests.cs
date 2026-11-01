using Avalonia;
using Avalonia.Controls;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class SettingsCardLayoutTests(AvaloniaSession session)
{
    private const double IconColumn = 2 + 20 + 20;
    private const double ActionIconMargin = 14;
    private const double ExpanderGlyphGap = 14 + ((32 - 16) / 2);
    private const double ItemIndent = 58;

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
    public void Child_rows_and_nested_cards_start_at_the_toolkit_item_indent(bool glyph) => session.Run(() =>
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
            Assert.Equal(parent.Padding.Left + (glyph ? IconColumn : 0), X(Part(parent, "PART_Header"), window));
            Assert.Equal(ItemIndent, X(label, window));
            Assert.Equal(ItemIndent, X(Part(nested, "PART_Header"), window));
        }
        finally
        {
            window.Close();
        }
    });

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public void The_control_sits_the_toolkit_gap_from_the_expander_chevron_glyph(bool inHeader) => session.Run(() =>
    {
        var combo = new ComboBox { Items = { "Self-hosted" }, SelectedIndex = 0 };
        var card = new SettingsCard { IsClickEnabled = true, IsExpanded = false };
        if (inHeader)
        {
            var row = new Grid { ColumnDefinitions = new ColumnDefinitions("*,Auto") };
            row.Children.Add(new TextBlock { Text = "Region" });
            var cell = new Grid { Children = { new Border { Width = 240, Height = 0 }, combo } };
            Grid.SetColumn(cell, 1);
            row.Children.Add(cell);
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
            var chevron = (TextBlock)Part(card, "PART_Chevron");
            var glyph = X(chevron, window) + ((chevron.Bounds.Width - chevron.FontSize) / 2);
            Assert.Equal(ExpanderGlyphGap, glyph - (X(combo, window) + combo.Bounds.Width));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_clickable_card_keeps_the_action_icon_margin_before_its_glyph() => session.Run(() =>
    {
        var combo = new ComboBox { Items = { "Self-hosted" }, SelectedIndex = 0 };
        var card = new SettingsCard { Header = "Region", IsClickEnabled = true, ActionGlyph = AvaloniaSession.Resource<string>("Glyph.ChevronRight"), Content = combo };
        var window = Host(card);
        try
        {
            Assert.Equal(ActionIconMargin, X(Part(card, "PART_Chevron"), window) - (X(combo, window) + combo.Bounds.Width));
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
