using Avalonia.Controls;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class SettingsCardPreviewTests(AvaloniaSession session)
{
    private static readonly string[] Labels = ["Watchtower", "Protected", "Passkey", "TOTP", "Organisation"];

    [Fact]
    public void Previews_in_a_scope_show_together_hide_together_and_come_back() => session.Run(() =>
    {
        var cards = Labels.Select(label => Card(label, label == "Watchtower" ? "Tags weak, old or insecure passwords" : "Tags the item")).ToList();
        var scope = new StackPanel { Classes = { "Rows" } };
        SettingsCard.SetPreviewScope(scope, true);
        scope.Children.AddRange(cards);
        var window = new Window { Width = 900, Height = 600, Content = scope };
        window.Show();
        AvaloniaSession.Pump();
        try
        {
            Assert.All(cards, card => Assert.True(Host(card).IsVisible));
            Assert.All(cards, OnOneLine);

            window.Width = 340;
            AvaloniaSession.Pump();
            Assert.All(cards, card => Assert.False(Host(card).IsVisible));
            Assert.All(cards, OnOneLine);

            window.Width = 900;
            AvaloniaSession.Pump();
            Assert.All(cards, card => Assert.True(Host(card).IsVisible));
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void Outside_a_scope_a_card_hides_only_its_own_preview() => session.Run(() =>
    {
        var narrow = Card("Watchtower", "Tags weak, old or insecure passwords");
        var wide = Card("TOTP", null);
        var window = new Window { Width = 340, Height = 400, Content = new StackPanel { Children = { narrow, wide } } };
        window.Show();
        AvaloniaSession.Pump();
        try
        {
            Assert.False(Host(narrow).IsVisible);
            Assert.True(Host(wide).IsVisible);
            OnOneLine(narrow);
            OnOneLine(wide);
        }
        finally
        {
            window.Close();
        }
    });

    private static SettingsCard Card(string label, string? description) => new()
    {
        Classes = { "Item" },
        Header = label,
        Description = description,
        Preview = new Border { Classes = { "Badge" }, Child = new TextBlock { Text = label } },
        Content = new ToggleSwitch { OnContent = null, OffContent = null },
    };

    private static void OnOneLine(SettingsCard card)
    {
        foreach (var text in Part(card, "PART_HeaderBlock").GetVisualDescendants().OfType<TextBlock>())
        {
            Assert.Single(text.TextLayout.TextLines);
        }
    }

    private static Control Host(SettingsCard card) => Part(card, "PART_PreviewHost");

    private static Control Part(SettingsCard card, string name) =>
        card.GetVisualDescendants().OfType<Control>().First(control => control.Name == name && control.TemplatedParent == card);
}
