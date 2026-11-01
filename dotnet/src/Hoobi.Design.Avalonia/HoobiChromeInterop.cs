using System.Runtime.InteropServices;

namespace Hoobi.Design.Avalonia;

internal static partial class HoobiChromeInterop
{
    public const uint WmQueryEndSession = 0x11;
    public const uint WmEndSession = 0x16;
    public const uint WmMouseLeave = 0x2A3;

    private const uint WmNcHitTest = 0x84;
    private const uint WmNcMouseMove = 0xA0;
    private const int HtMinButton = 8;
    private const int HtMaxButton = 9;
    private const int HtClose = 20;
    private const int DwmwaCloak = 13;

    public static void RepostCaptionButtonMove(nint handle)
    {
        if (!GetCursorPos(out var point))
        {
            return;
        }

        var position = (nint)(uint)((point.Y << 16) | (point.X & 0xFFFF));
        var hit = (int)SendMessageW(handle, WmNcHitTest, 0, position);
        if (hit is HtMinButton or HtMaxButton or HtClose)
        {
            PostMessageW(handle, WmNcMouseMove, hit, position);
        }
    }

    public static void Cloak(nint handle, bool cloaked)
    {
        var value = cloaked ? 1 : 0;
        _ = DwmSetWindowAttribute(handle, DwmwaCloak, ref value, sizeof(int));
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

    [LibraryImport("user32.dll")]
    private static partial nint SendMessageW(nint hWnd, uint msg, nint wParam, nint lParam);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool PostMessageW(nint hWnd, uint msg, nint wParam, nint lParam);

    [LibraryImport("dwmapi.dll")]
    private static partial int DwmSetWindowAttribute(nint hwnd, int attribute, ref int value, int size);
}
