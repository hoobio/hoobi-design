using Avalonia;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;
using Avalonia.Media;
using Avalonia.Styling;
using Avalonia.Threading;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class DialogTests(AvaloniaSession session)
{
    private static readonly string[] Titles = ["First", "Second"];

    [Fact]
    public void Dialogs_are_440_wide_with_eight_pixel_corners_the_raised_fill_and_an_accent_primary() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820 };
        window.Show();
        var dialog = new FAContentDialog { Title = "Title", Content = "Body", PrimaryButtonText = "Go", CloseButtonText = "Cancel" };

        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        window.CaptureRenderedFrame();

        var background = dialog.GetVisualDescendants().OfType<Border>().First(border => border.Name == "BackgroundElement");
        var layoutRoot = dialog.GetVisualDescendants().OfType<Panel>().First(panel => panel.Name == "LayoutRoot");
        var primary = dialog.GetVisualDescendants().OfType<Button>().First(button => button.Name == "PrimaryButton");
        var raised = Assert.IsAssignableFrom<ISolidColorBrush>(background.Background);
        var smoke = Assert.IsAssignableFrom<ISolidColorBrush>(layoutRoot.Background);
        var bounds = background.Bounds;
        var corners = background.CornerRadius;
        AvaloniaSession.CloseDialog(dialog, shown);
        window.Close();

        Assert.Equal(440, bounds.Width);
        Assert.Equal(new CornerRadius(8), corners);
        Assert.Equal(AvaloniaSession.Resource<Color>("HoobiSurfaceRaisedColor"), raised.Color);
        Assert.Equal(AvaloniaSession.Resource<ISolidColorBrush>("ContentDialogSmokeFill").Color, smoke.Color);
        Assert.Same(AvaloniaSession.Resource<ControlTheme>("AccentButtonStyle"), primary.Theme);
    });

    [Fact]
    public void Closing_the_owner_of_an_open_dialog_releases_the_queue_for_the_next_window() => session.Run(() =>
    {
        var first = new Window { Width = 800, Height = 600 };
        first.Show();
        var orphan = new FAContentDialog { Title = "Orphan", CloseButtonText = "Close" };
        var orphanShown = AppDialogs.ShowAsync(orphan, first);
        AvaloniaSession.WaitFor(() => orphan.IsLoaded);

        first.Close();
        AvaloniaSession.WaitFor(() => orphanShown.IsCompleted);

        var second = new Window { Width = 800, Height = 600 };
        second.Show();
        var next = new FAContentDialog { Title = "Next", CloseButtonText = "Close" };
        var nextShown = AppDialogs.ShowAsync(next, second);
        AvaloniaSession.WaitFor(() => next.IsLoaded);
        AvaloniaSession.CloseDialog(next, nextShown);
        second.Close();

        Assert.Equal(FAContentDialogResult.None, orphanShown.Result);
    });

    [Fact]
    public void Three_buttons_stack_full_width_and_close_never_takes_the_accent() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820 };
        window.Show();
        var dialog = new FAContentDialog { Title = "Title", PrimaryButtonText = "Remove the saved variables too", SecondaryButtonText = "Keep the folder", CloseButtonText = "Cancel", DefaultButton = FAContentDialogButton.Close };
        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        AvaloniaSession.Pump();

        var buttons = dialog.GetVisualDescendants().OfType<Button>().Where(button => button.Name is "PrimaryButton" or "SecondaryButton" or "CloseButton").ToDictionary(button => button.Name!);
        var widths = buttons.Values.Select(button => button.Bounds.Width).Distinct().ToList();
        var rows = buttons.Values.Select(button => button.TranslatePoint(default, dialog)!.Value.Y).Distinct().Count();
        var space = dialog.GetVisualDescendants().OfType<Grid>().Single(grid => grid.Name == "CommandSpace").Bounds.Width;
        var close = buttons["CloseButton"].Theme;
        AvaloniaSession.CloseDialog(dialog, shown);
        window.Close();

        Assert.Single(widths);
        Assert.Equal(space, widths[0]);
        Assert.Equal(3, rows);
        Assert.Same(AvaloniaSession.Resource<ControlTheme>("DialogCloseButtonStyle"), close);
    });

    [Fact]
    public void A_danger_dialog_themes_its_primary_as_critical() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820 };
        window.Show();
        var dialog = new FAContentDialog { Title = "Delete the item?", PrimaryButtonText = "Delete", CloseButtonText = "Cancel", Classes = { "Danger" } };
        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        AvaloniaSession.Pump();
        var primary = dialog.GetVisualDescendants().OfType<Button>().First(button => button.Name == "PrimaryButton").Theme;
        AvaloniaSession.CloseDialog(dialog, shown);
        window.Close();

        Assert.Same(AvaloniaSession.Resource<ControlTheme>("CriticalButtonStyle"), primary);
    });

    [Fact]
    public void A_dialog_hidden_while_queued_is_never_shown_and_returns_none() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820 };
        window.Show();
        var first = new FAContentDialog { Title = "First", CloseButtonText = "Close" };
        var queued = new FAContentDialog { Title = "Queued", CloseButtonText = "Close" };
        var firstShown = AppDialogs.ShowAsync(first, window);
        AvaloniaSession.WaitFor(() => first.IsLoaded);
        var opened = false;
        queued.Opened += (_, _) => opened = true;
        var queuedShown = AppDialogs.ShowAsync(queued, window);

        queued.Hide();
        Assert.True(queued.IsHitTestVisible);
        AvaloniaSession.CloseDialog(first, firstShown);
        AvaloniaSession.WaitFor(() => queuedShown.IsCompleted);
        window.Close();

        Assert.Equal(FAContentDialogResult.None, queuedShown.Result);
        Assert.False(opened);
        Assert.Null(queued.Parent);
    });

    [Fact]
    public void A_dialog_waits_while_its_window_holds_the_foreground_gate_and_a_press_releases_it() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820, ShowActivated = false };
        window.Show();
        Dispatcher.UIThread.RunJobs();
        var gate = ForegroundGate.For(window);
        gate.Hold();
        var dialog = new FAContentDialog { Title = "Title", CloseButtonText = "Close" };

        var shown = AppDialogs.ShowAsync(dialog, window);
        try
        {
            Dispatcher.UIThread.RunJobs();
            Assert.False(dialog.IsLoaded);

            window.MouseDown(new Point(640, 410), MouseButton.Left);
            Dispatcher.UIThread.RunJobs();
            Assert.False(gate.IsHeld);
            AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        }
        finally
        {
            gate.Release();
            AvaloniaSession.CloseDialog(dialog, shown);
            window.Close();
        }
    });

    [Fact]
    public void Every_dialog_shown_in_sequence_takes_the_dialog_brushes() => session.Run(() =>
    {
        var window = new Window { Width = 1280, Height = 820 };
        window.Show();
        foreach (var title in Titles)
        {
            var dialog = new FAContentDialog { Title = title, PrimaryButtonText = "OK", CloseButtonText = "Cancel" };
            var shown = AppDialogs.ShowAsync(dialog, window);
            AvaloniaSession.WaitFor(() => dialog.IsLoaded);

            Assert.True(dialog.Resources.ContainsKey("AccentButtonBackgroundPointerOver"));
            AvaloniaSession.CloseDialog(dialog, shown);
        }

        window.Close();
    });
}
