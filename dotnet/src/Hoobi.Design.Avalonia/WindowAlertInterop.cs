using System.Runtime.InteropServices;

using Avalonia;

namespace Hoobi.Design.Avalonia;

internal static partial class WindowAlertInterop
{
    private const uint MbIconHand = 0x10;
    private const uint FlashwAll = 0x3;
    private const uint FlashwTimerNoForeground = 0xC;

    public static void Raise(nint hwnd)
    {
        MessageBeep(MbIconHand);
        if (hwnd == 0)
        {
            return;
        }

        var info = new FlashWindowInfo
        {
            Size = (uint)Marshal.SizeOf<FlashWindowInfo>(),
            Hwnd = hwnd,
            Flags = FlashwAll | FlashwTimerNoForeground,
        };
        FlashWindowEx(ref info);
    }

    public static void SetForeground(nint hwnd)
    {
        if (hwnd != 0 && IsWindow(hwnd))
        {
            SetForegroundWindow(hwnd);
        }
    }

    public static PixelPoint? WindowCentre(nint hwnd) =>
        hwnd != 0 && IsWindow(hwnd) && GetWindowRect(hwnd, out var rect)
            ? new PixelPoint((rect.Left + rect.Right) / 2, (rect.Top + rect.Bottom) / 2)
            : null;

    [StructLayout(LayoutKind.Sequential)]
    private struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct FlashWindowInfo
    {
        public uint Size;
        public nint Hwnd;
        public uint Flags;
        public uint Count;
        public uint Timeout;
    }

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool GetWindowRect(nint hWnd, out Rect lpRect);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool MessageBeep(uint uType);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool IsWindow(nint hWnd);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SetForegroundWindow(nint hWnd);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool FlashWindowEx(ref FlashWindowInfo pwfi);
}
