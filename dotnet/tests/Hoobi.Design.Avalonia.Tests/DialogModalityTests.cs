using Avalonia;
using Avalonia.Input;
using Avalonia.Threading;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

using Hoobi.Design.Gallery;

using static Hoobi.Design.Avalonia.Tests.DialogHandover;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class DialogModalityTests(AvaloniaSession session)
{
    [Fact]
    public void A_dialog_closes_from_its_close_button_after_a_handover_and_blocks_the_window_behind() => session.Run(() =>
    {
        var (owner, behindClicks) = WindowWithButtonBehind();
        var (window, dialog, reshown) = HandOverAndShowAgain(owner);

        ClickAt(window, new Point(20, 20));
        var blocked = behindClicks();
        Click(window, CloseButton(dialog));
        AvaloniaSession.WaitFor(() => reshown.IsCompleted);
        window.Close();

        Assert.Equal(0, blocked);
        Assert.Equal(FAContentDialogResult.None, reshown.Result);
    });

    [Fact]
    public void A_dialog_covers_the_whole_shell_title_bar_included_until_it_closes() => session.Run(() =>
    {
        var window = new MainWindow { Width = 1280, Height = 820 };
        window.Show();
        var dialog = new FAContentDialog { Title = "Title", Content = "Body", CloseButtonText = "Close" };

        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        Dispatcher.UIThread.RunJobs();
        var covered = new[] { new Point(640, 24), new Point(24, 400), new Point(1200, 780) }
            .All(point => window.InputHitTest(point) is Visual hit && hit.GetSelfAndVisualAncestors().Contains(dialog));
        Click(window, CloseButton(dialog));
        AvaloniaSession.WaitFor(() => shown.IsCompleted);
        window.Close();

        Assert.True(covered);
    });
}
