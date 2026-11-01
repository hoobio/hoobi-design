using Avalonia.Controls;

using Hoobi.Design.Avalonia;

namespace Hoobi.Design.Gallery;

public partial class ComponentsPage : UserControl
{
    public ComponentsPage()
    {
        InitializeComponent();
        MonoMeter.Levels = [0.1f];
        MonoMeter.Hold = 0.2f;
        StereoMeter.Levels = [0.1f, 0.35f];
        StereoMeter.Hold = 0.4f;
        SurroundMeter.Levels = [0.03f, 0.75f, 0.2f];
        SurroundMeter.Hold = 0.8f;
        Notes.Blocks =
        [
            new RichBlock(RichBlockKind.Heading, [new RichRun("Steward 2.4")]),
            new RichBlock(RichBlockKind.Paragraph, [new RichRun("Updates now wait for the game to close. "), new RichRun("Nothing to do", Strong: true), new RichRun(" on your side; see the "), new RichRun("release notes", Href: "https://example.com/notes"), new RichRun(".")]),
            new RichBlock(RichBlockKind.Heading, [new RichRun("Fixes")], Level: 2),
            new RichBlock(RichBlockKind.Bullet, [new RichRun("The tray menu takes focus.")]),
            new RichBlock(RichBlockKind.Bullet, [new RichRun("Ignored addons stay ignored.")], Depth: 1),
            new RichBlock(RichBlockKind.Paragraph, [new RichRun("Older entries are muted.")], Muted: true),
        ];
        Tones.ItemsSource = Enum.GetValues<Tone>();
        Initials.Text = ToneConverters.InitialsOf("Ada Hart-Lovelace");
        var broken = new RemoteImage();
        broken.MarkFailed();
        BrokenIcon.Source = broken;
        InfoToastButton.Click += (_, _) => ToastWindow.Show(TopLevel.GetTopLevel(this), "Sync paused while the game runs", Tone.Info);
        WarnToastButton.Click += (_, _) => ToastWindow.Show(TopLevel.GetTopLevel(this), "The addon folder is read-only", Tone.Warn);
        ReplayButton.Click += (_, _) => _ = PageEntrance.PlayAsync(Body);
    }
}
