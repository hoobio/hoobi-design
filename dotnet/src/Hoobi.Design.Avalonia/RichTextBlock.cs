using System.Windows.Input;

using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.Documents;
using Avalonia.Input;
using Avalonia.Media;

namespace Hoobi.Design.Avalonia;

public enum RichBlockKind
{
    Paragraph,
    Heading,
    Bullet,
}

public sealed record RichRun(string Text, bool Strong = false, string? Href = null);

public sealed record RichBlock(RichBlockKind Kind, IReadOnlyList<RichRun> Runs, int Level = 1, int Depth = 0, bool Muted = false);

public sealed class RichTextBlock : StackPanel
{
    public static readonly StyledProperty<IReadOnlyList<RichBlock>?> BlocksProperty =
        AvaloniaProperty.Register<RichTextBlock, IReadOnlyList<RichBlock>?>(nameof(Blocks));

    public static readonly StyledProperty<ICommand?> LinkCommandProperty =
        AvaloniaProperty.Register<RichTextBlock, ICommand?>(nameof(LinkCommand));

    private const double IndentPerDepth = 16;
    private const double SecondHeadingSize = 16;

    static RichTextBlock() => BlocksProperty.Changed.AddClassHandler<RichTextBlock>((view, _) => view.Rebuild());

    public RichTextBlock() => Spacing = 6;

    public event EventHandler<string>? LinkClicked;

    public IReadOnlyList<RichBlock>? Blocks
    {
        get => GetValue(BlocksProperty);
        set => SetValue(BlocksProperty, value);
    }

    public ICommand? LinkCommand
    {
        get => GetValue(LinkCommandProperty);
        set => SetValue(LinkCommandProperty, value);
    }

    protected override Type StyleKeyOverride => typeof(StackPanel);

    private void OpenLink(string href)
    {
        LinkClicked?.Invoke(this, href);
        if (LinkCommand is { } command && command.CanExecute(href))
        {
            command.Execute(href);
        }
    }

    private void Rebuild()
    {
        Children.Clear();
        foreach (var block in Blocks ?? [])
        {
            var element = BuildBlock(block, first: Children.Count == 0);
            element.Opacity = block.Muted ? 0.5 : 1;
            Children.Add(element);
        }
    }

    private Control BuildBlock(RichBlock block, bool first)
    {
        var text = new LinkText(this, block.Runs);
        text.Classes.Add("Body");
        text.TextWrapping = TextWrapping.Wrap;
        switch (block.Kind)
        {
            case RichBlockKind.Heading:
                text.FontWeight = FontWeight.SemiBold;
                if (block.Level <= 1)
                {
                    text.Bind(TextBlock.FontSizeProperty, text.GetResourceObservable("SubtitleTextBlockFontSize"));
                    text.Bind(TextBlock.FontFamilyProperty, text.GetResourceObservable("HoobiDisplayFontFamily"));
                }
                else if (block.Level == 2)
                {
                    text.FontSize = SecondHeadingSize;
                }

                text.Margin = new Thickness(0, first ? 0 : 6, 0, 0);
                return text;
            case RichBlockKind.Bullet:
                var bullet = new TextBlock { Text = "•", Classes = { "Body" } };
                bullet.Bind(TextBlock.ForegroundProperty, bullet.GetResourceObservable("TextFillColorSecondaryBrush"));
                Grid.SetColumn(text, 1);
                return new Grid
                {
                    ColumnDefinitions = new ColumnDefinitions("Auto,*"),
                    ColumnSpacing = 8,
                    Margin = new Thickness(IndentPerDepth * Math.Max(block.Depth, 0), 0, 0, 0),
                    Children = { bullet, text },
                };
            default:
                return text;
        }
    }

    private sealed class LinkText : TextBlock
    {
        private const string LinkBrush = "HoobiAccentBlueBrush";
        private const string LinkHoverBrush = "HoobiAccentCyanBrush";

        private readonly RichTextBlock _owner;
        private readonly List<Link> _links = [];
        private Run? _hovered;

        public LinkText(RichTextBlock owner, IReadOnlyList<RichRun> runs)
        {
            _owner = owner;
            Inlines = [];
            var position = 0;
            foreach (var run in runs)
            {
                var inline = new Run(run.Text);
                if (run.Strong)
                {
                    inline.FontWeight = FontWeight.SemiBold;
                }

                if (!string.IsNullOrEmpty(run.Href))
                {
                    inline.Bind(TextElement.ForegroundProperty, this.GetResourceObservable(LinkBrush));
                    _links.Add(new Link(position, position + run.Text.Length, run.Href, inline));
                }

                position += run.Text.Length;
                Inlines.Add(inline);
            }
        }

        protected override Type StyleKeyOverride => typeof(TextBlock);

        protected override void OnPointerMoved(PointerEventArgs e)
        {
            base.OnPointerMoved(e);
            Hover(LinkAt(e.GetPosition(this)));
        }

        protected override void OnPointerExited(PointerEventArgs e)
        {
            base.OnPointerExited(e);
            Hover(null);
        }

        protected override void OnPointerPressed(PointerPressedEventArgs e)
        {
            base.OnPointerPressed(e);
            if (e.GetCurrentPoint(this).Properties.IsLeftButtonPressed && LinkAt(e.GetPosition(this)) is { } link)
            {
                e.Handled = true;
                _owner.OpenLink(link.Href);
            }
        }

        private Link? LinkAt(Point point)
        {
            if (_links.Count == 0)
            {
                return null;
            }

            var hit = TextLayout.HitTestPoint(point);
            return hit.IsInside ? _links.Find(link => hit.TextPosition >= link.Start && hit.TextPosition < link.End) : null;
        }

        private void Hover(Link? link)
        {
            var run = link?.Run;
            if (ReferenceEquals(run, _hovered))
            {
                return;
            }

            _hovered?.Bind(TextElement.ForegroundProperty, this.GetResourceObservable(LinkBrush));
            run?.Bind(TextElement.ForegroundProperty, this.GetResourceObservable(LinkHoverBrush));
            _hovered = run;
            Cursor = run is null ? null : new Cursor(StandardCursorType.Hand);
        }

        private sealed record Link(int Start, int End, string Href, Run Run);
    }
}
