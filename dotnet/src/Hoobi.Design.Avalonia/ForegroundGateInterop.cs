using System.Runtime.InteropServices;

namespace Hoobi.Design.Avalonia;

internal static partial class ForegroundGateInterop
{
    public static void ForceForeground(nint handle)
    {
        var foreground = GetForegroundWindow();
        if (handle == 0 || foreground == handle)
        {
            return;
        }

        var owner = GetWindowThreadProcessId(foreground, 0);
        var self = GetCurrentThreadId();
        var attached = owner != self && AttachThreadInput(self, owner, true);

        BringWindowToTop(handle);
        SetForegroundWindow(handle);

        if (attached)
        {
            AttachThreadInput(self, owner, false);
        }
    }

    [LibraryImport("user32.dll")]
    private static partial nint GetForegroundWindow();

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SetForegroundWindow(nint hWnd);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool BringWindowToTop(nint hWnd);

    [LibraryImport("user32.dll")]
    private static partial uint GetWindowThreadProcessId(nint hWnd, nint processId);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool AttachThreadInput(uint attachTo, uint attachFrom, [MarshalAs(UnmanagedType.Bool)] bool attach);

    [LibraryImport("kernel32.dll")]
    private static partial uint GetCurrentThreadId();
}
