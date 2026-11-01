using Avalonia;
using Avalonia.Controls;

namespace Hoobi.Design.Avalonia;

public static class WindowAlert
{
    public static void Raise(TopLevel window)
    {
        ArgumentNullException.ThrowIfNull(window);

        if (OperatingSystem.IsWindows())
        {
            WindowAlertInterop.Raise(Handle(window));
        }
    }

    public static void TakeForeground(TopLevel window)
    {
        ArgumentNullException.ThrowIfNull(window);

        ReturnForeground(Handle(window));
    }

    public static void ReturnForeground(nint hwnd)
    {
        if (OperatingSystem.IsWindows())
        {
            WindowAlertInterop.SetForeground(hwnd);
        }
    }

    public static PixelPoint? WindowCentre(nint hwnd) => OperatingSystem.IsWindows() ? WindowAlertInterop.WindowCentre(hwnd) : null;

    private static nint Handle(TopLevel window) => window.TryGetPlatformHandle() is { HandleDescriptor: "HWND", Handle: var hwnd } ? hwnd : 0;
}
