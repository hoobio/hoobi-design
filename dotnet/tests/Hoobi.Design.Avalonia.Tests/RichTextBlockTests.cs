using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Documents;
using Avalonia.Headless;
using Avalonia.Input;
using Avalonia.Media;
using Avalonia.VisualTree;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class RichTextBlockTests(AvaloniaSession session)
{
    private const string Href = "https://example.com/notes";

    [Theory]
    [InlineData(7, false)]
    [InlineData(8, true)]
    [InlineData(12, true)]
    [InlineData(13, false)]
    public void A_click_raises_the_href_only_inside_the_link_run(int character, bool raised) => session.Run(() =>
    {
        var (window, rich, text) = Show();
        var clicked = new List<string>();
        var commanded = new List<object?>();
        rich.LinkClicked += (_, href) => clicked.Add(href);
        rich.LinkCommand = new Command(commanded.Add);
        try
        {
            var point = At(window, text, character);
            window.MouseDown(point, MouseButton.Left);
            window.MouseUp(point, MouseButton.Left);
            AvaloniaSession.Pump();
            Assert.Equal(raised ? [Href] : [], clicked);
            Assert.Equal(raised ? [Href] : [], commanded);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void A_link_is_accent_blue_without_an_underline_and_turns_cyan_under_the_pointer() => session.Run(() =>
    {
        var (window, _, text) = Show();
        try
        {
            var link = (Run)text.Inlines![1];
            Assert.Null(link.TextDecorations);
            Assert.Same(AvaloniaSession.Resource<IBrush>("HoobiAccentBlueBrush"), link.Foreground);

            window.MouseMove(At(window, text, 10));
            AvaloniaSession.Pump();
            Assert.Same(AvaloniaSession.Resource<IBrush>("HoobiAccentCyanBrush"), link.Foreground);

            window.MouseMove(At(window, text, 2));
            AvaloniaSession.Pump();
            Assert.Same(AvaloniaSession.Resource<IBrush>("HoobiAccentBlueBrush"), link.Foreground);
        }
        finally
        {
            window.Close();
        }
    });

    [Fact]
    public void Blocks_render_heading_bullet_and_muted_paragraph() => session.Run(() =>
    {
        var rich = new RichTextBlock
        {
            Blocks =
            [
                new RichBlock(RichBlockKind.Heading, [new RichRun("Title")]),
                new RichBlock(RichBlockKind.Bullet, [new RichRun("Item")], Depth: 2),
                new RichBlock(RichBlockKind.Paragraph, [new RichRun("Old", Strong: true)], Muted: true),
            ],
        };
        Assert.Equal(3, rich.Children.Count);
        Assert.Equal(FontWeight.SemiBold, ((TextBlock)rich.Children[0]).FontWeight);
        Assert.Equal(new Thickness(32, 0, 0, 0), ((Grid)rich.Children[1]).Margin);
        Assert.Equal(0.5, rich.Children[2].Opacity);
        Assert.Equal(FontWeight.SemiBold, ((Run)((TextBlock)rich.Children[2]).Inlines![0]).FontWeight);
    });

    [Fact]
    public void TextHighlight_splits_the_text_around_the_match_and_restores_it() => session.Run(() =>
    {
        var text = new TextBlock { Text = "WeakAuras Companion" };
        TextHighlight.SetLength(text, 5);
        TextHighlight.SetStart(text, 4);
        Assert.Equal(["Weak", "Auras", " Companion"], text.Inlines!.OfType<Run>().Select(run => run.Text));

        text.Text = "BigWigs Mods";
        Assert.Equal(["BigW", "igs M", "ods"], text.Inlines!.OfType<Run>().Select(run => run.Text));

        text.Text = "Details";
        Assert.Empty(text.Inlines!);
        Assert.Equal("Details", text.Text);

        TextHighlight.SetLength(text, 3);
        Assert.Equal(["Deta", "ils", ""], text.Inlines!.OfType<Run>().Select(run => run.Text));

        TextHighlight.SetStart(text, -1);
        Assert.Empty(text.Inlines!);
        Assert.Equal("Details", text.Text);
    });

    private static (Window Window, RichTextBlock Rich, TextBlock Text) Show()
    {
        var rich = new RichTextBlock
        {
            Width = 400,
            Blocks = [new RichBlock(RichBlockKind.Paragraph, [new RichRun("See the "), new RichRun("notes", Href: Href), new RichRun(".")])],
        };
        var window = new Window { Width = 440, Height = 120, Content = new Border { Padding = new Thickness(20), Child = rich } };
        window.Show();
        AvaloniaSession.Pump();
        return (window, rich, rich.GetVisualDescendants().OfType<TextBlock>().First());
    }

    private static Point At(Window window, TextBlock text, int character)
    {
        var rect = text.TextLayout.HitTestTextPosition(character);
        return text.TranslatePoint(new Point(rect.X + 1, rect.Y + (rect.Height / 2)), window)!.Value;
    }

    private sealed class Command(Action<object?> execute) : System.Windows.Input.ICommand
    {
        public event EventHandler? CanExecuteChanged
        {
            add { }
            remove { }
        }

        public bool CanExecute(object? parameter) => true;

        public void Execute(object? parameter) => execute(parameter);
    }
}
