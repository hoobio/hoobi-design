using Avalonia;
using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Threading;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

using static Hoobi.Design.Avalonia.Tests.DialogHandover;

namespace Hoobi.Design.Avalonia.Tests;

public sealed class DialogReshowTests(AvaloniaSession session)
{
    [Fact]
    public void A_dialog_shown_again_after_a_handover_closes_on_escape() => session.Run(() =>
    {
        var (window, dialog, reshown) = HandOverAndShowAgain(WindowWithButtonBehind().Window);

        Press(window, Key.Escape, PhysicalKey.Escape);
        var closed = Settle(() => reshown.IsCompleted);
        Finish(window, dialog, reshown);

        Assert.True(closed);
        Assert.Null(dialog.Request);
    });

    [Fact]
    public void A_dialog_shown_again_after_a_handover_keeps_tab_inside() => session.Run(() =>
    {
        var (window, dialog, reshown) = HandOverAndShowAgain(WindowWithButtonBehind().Window);

        Press(window, Key.Tab, PhysicalKey.Tab);
        var focused = window.FocusManager!.GetFocusedElement() as Visual;
        Finish(window, dialog, reshown);

        Assert.True(focused is not null && dialog.IsVisualAncestorOf(focused), $"focus left the dialog for {focused}");
    });

    [Fact]
    public void A_dialog_shown_again_after_a_handover_takes_a_click_first_time() => session.Run(() =>
    {
        var (window, dialog, reshown) = HandOverAndShowAgain(WindowWithButtonBehind().Window);

        Hover(window, Named(dialog, "Changelog for Steward: Auctioning"), 500);
        Click(window, Named(dialog, "Changelog for Steward: Auctioning"));
        Settle(() => reshown.IsCompleted);
        Finish(window, dialog, reshown);

        Assert.Equal("Steward: Auctioning", dialog.Request);
    });

    private static bool Settle(Func<bool> condition)
    {
        var deadline = DateTime.UtcNow.AddSeconds(2);
        while (!condition() && DateTime.UtcNow < deadline)
        {
            Dispatcher.UIThread.RunJobs();
            Thread.Yield();
        }

        return condition();
    }

    private static void Finish(Window window, FAContentDialog dialog, Task reshown)
    {
        if (!reshown.IsCompleted)
        {
            AvaloniaSession.CloseDialog(dialog, reshown);
        }

        window.Close();
    }
}
