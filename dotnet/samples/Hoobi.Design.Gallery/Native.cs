using System.Runtime.InteropServices;

namespace Hoobi.Design.Gallery;

internal static partial class Native
{
    public const uint WM_MOUSELEAVE = 0x2A3;

    private const uint WM_NCHITTEST = 0x84;
    private const uint WM_NCMOUSEMOVE = 0xA0;
    private const int HTMINBUTTON = 8;
    private const int HTMAXBUTTON = 9;
    private const int HTCLOSE = 20;
    private const int DWMWA_CLOAK = 13;

    public static void RepostCaptionButtonMove(nint handle)
    {
        if (!OperatingSystem.IsWindows() || !GetCursorPos(out var point))
        {
            return;
        }

        var position = (nint)(uint)((point.Y << 16) | (point.X & 0xFFFF));
        var hit = (int)SendMessage(handle, WM_NCHITTEST, 0, position);
        if (hit is HTMINBUTTON or HTMAXBUTTON or HTCLOSE)
        {
            PostMessage(handle, WM_NCMOUSEMOVE, hit, position);
        }
    }

    public static void Cloak(nint handle, bool cloaked)
    {
        if (!OperatingSystem.IsWindows() || handle == 0)
        {
            return;
        }

        var value = cloaked ? 1 : 0;
        _ = DwmSetWindowAttribute(handle, DWMWA_CLOAK, ref value, sizeof(int));
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Point
    {
        public int X;
        public int Y;
    }

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool GetCursorPos(out Point point);

    [LibraryImport("user32.dll", EntryPoint = "SendMessageW")]
    private static partial nint SendMessage(nint hWnd, uint msg, nint wParam, nint lParam);

    [LibraryImport("user32.dll", EntryPoint = "PostMessageW")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool PostMessage(nint hWnd, uint msg, nint wParam, nint lParam);

    [LibraryImport("dwmapi.dll")]
    private static partial int DwmSetWindowAttribute(nint hwnd, int attribute, ref int value, int size);
}
