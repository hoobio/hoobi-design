using Avalonia;
using Avalonia.Controls;

using FluentAvalonia.UI.Controls;

namespace Hoobi.Design.Avalonia;

// WinUI's ContentDialog resolves its controls' visual-state brushes (pointer over, pressed, checked, disabled) from generic.xaml rather than the app's overrides.
internal static class DialogResourceScope
{
    private static bool _registered;

    public static void Register()
    {
        if (_registered)
        {
            return;
        }

        _registered = true;
        Control.LoadedEvent.AddClassHandler<FAContentDialog>((dialog, _) =>
        {
            if (Application.Current?.TryGetResource("HoobiDialogScopeResources", Application.Current.ActualThemeVariant, out var value) != true
                || value is not IResourceDictionary resources)
            {
                return;
            }

            foreach (var (key, brush) in resources)
            {
                dialog.Resources.TryAdd(key, brush);
            }
        });
    }
}
