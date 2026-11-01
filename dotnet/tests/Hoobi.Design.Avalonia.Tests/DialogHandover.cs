using Avalonia;
using Avalonia.Automation;
using Avalonia.Controls;
using Avalonia.Headless;
using Avalonia.Input;
using Avalonia.Layout;
using Avalonia.Threading;
using Avalonia.VisualTree;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia.Tests;

internal sealed class HandoverDialog : FAContentDialog
{
    public HandoverDialog(params string[] items)
    {
        Title = "Addon folders";
        CloseButtonText = "Close";
        var rows = new StackPanel { Spacing = 8 };
        foreach (var item in items)
        {
            var button = new Button { Content = "Changelog" };
            AutomationProperties.SetName(button, $"Changelog for {item}");
            button.Click += (_, _) =>
            {
                Request = item;
                Hide();
            };
            rows.Children.Add(new DockPanel { Children = { new TextBlock { Text = item, VerticalAlignment = VerticalAlignment.Center }, button } });
        }

        Content = rows;
    }

    protected override Type StyleKeyOverride => typeof(FAContentDialog);

    public string? Request { get; set; }
}

internal static class DialogHandover
{
    public static Button Named(FAContentDialog dialog, string name) =>
        dialog.GetVisualDescendants().OfType<Button>().Single(button => AutomationProperties.GetName(button) == name);

    public static Button CloseButton(FAContentDialog dialog) =>
        dialog.GetVisualDescendants().OfType<Button>().First(button => button.Name == "CloseButton");

    public static void Click(Window window, Control target)
    {
        Dispatcher.UIThread.RunJobs();
        ClickAt(window, target.TranslatePoint(new Point(target.Bounds.Width / 2, target.Bounds.Height / 2), window)!.Value);
    }

    public static void ClickAt(Window window, Point point)
    {
        window.MouseDown(point, MouseButton.Left);
        window.MouseUp(point, MouseButton.Left);
        Dispatcher.UIThread.RunJobs();
    }

    public static void Hover(Window window, Control target, int milliseconds)
    {
        Dispatcher.UIThread.RunJobs();
        window.MouseMove(target.TranslatePoint(new Point(target.Bounds.Width / 2, target.Bounds.Height / 2), window)!.Value);
        var until = DateTime.UtcNow.AddMilliseconds(milliseconds);
        AvaloniaSession.WaitFor(() => DateTime.UtcNow > until);
        window.CaptureRenderedFrame();
        Dispatcher.UIThread.RunJobs();
    }

    public static void Press(Window window, Key key, PhysicalKey physical)
    {
        window.KeyPress(key, RawInputModifiers.None, physical, null);
        window.KeyRelease(key, RawInputModifiers.None, physical, null);
        Dispatcher.UIThread.RunJobs();
    }

    public static (Window Window, HandoverDialog Dialog, Task<FAContentDialogResult> Reshown) HandOverAndShowAgain(Window window)
    {
        var dialog = new HandoverDialog("Steward: Guides", "Steward: Auctioning");
        var shown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        Hover(window, Named(dialog, "Changelog for Steward: Guides"), 500);
        Click(window, Named(dialog, "Changelog for Steward: Guides"));
        AvaloniaSession.WaitFor(() => shown.IsCompleted);
        dialog.Request = null;

        var changelog = new FAContentDialog { Title = "Steward: Guides", Content = "Fixed a thing", CloseButtonText = "Close" };
        var changelogShown = AppDialogs.ShowAsync(changelog, window);
        AvaloniaSession.WaitFor(() => changelog.IsLoaded);
        Hover(window, CloseButton(changelog), 500);
        Click(window, CloseButton(changelog));
        AvaloniaSession.WaitFor(() => changelogShown.IsCompleted);

        var reshown = AppDialogs.ShowAsync(dialog, window);
        AvaloniaSession.WaitFor(() => dialog.IsLoaded);
        Hover(window, Named(dialog, "Changelog for Steward: Guides"), 200);
        return (window, dialog, reshown);
    }

    public static (Window Window, Func<int> Clicks) WindowWithButtonBehind()
    {
        var clicks = 0;
        var behind = new Button { Content = "Behind", Width = 100, Height = 40, HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Top };
        behind.Click += (_, _) => clicks++;
        var window = new Window { Width = 1280, Height = 820, Content = behind };
        window.Show();
        Click(window, behind);
        clicks = 0;
        return (window, () => clicks);
    }
}
