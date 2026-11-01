using System.Runtime.InteropServices;

namespace Hoobi.Design.Avalonia;

internal static partial class Native
{
    private const uint SpiGetAnimation = 0x48;
    private const uint SpiGetWheelScrollLines = 0x68;
    private const uint SpiGetMenuShowDelay = 0x6A;
    private const uint SpiGetClientAreaAnimation = 0x1042;

    public static uint WheelScrollLines() =>
        OperatingSystem.IsWindows() && SystemParametersInfo(SpiGetWheelScrollLines, 0, out var lines, 0) ? lines : 3;

    public static bool ClientAreaAnimation() =>
        !OperatingSystem.IsWindows() || !SystemParametersInfo(SpiGetClientAreaAnimation, 0, out var on, 0) || on != 0;

    // WinUI's cascading menus read MenuShowDelay and fall back to 400ms (CascadingMenuHelper.cpp).
    public static TimeSpan MenuShowDelay() =>
        TimeSpan.FromMilliseconds(OperatingSystem.IsWindows() && SystemParametersInfo(SpiGetMenuShowDelay, 0, out var ms, 0) ? ms : 400);

    public static TimeSpan DoubleClickTime() =>
        TimeSpan.FromMilliseconds(OperatingSystem.IsWindows() ? GetDoubleClickTime() : 500);

    public static bool MinimizeAnimation()
    {
        if (!OperatingSystem.IsWindows())
        {
            return false;
        }

        var info = new AnimationInfo { Size = (uint)Marshal.SizeOf<AnimationInfo>() };
        return SystemParametersInfo(SpiGetAnimation, info.Size, ref info, 0) && info.MinAnimate != 0;
    }

    private const int ProcessPowerThrottling = 4;
    private const uint PowerThrottlingExecutionSpeed = 0x1;

    public static void EmptyWorkingSet()
    {
        if (OperatingSystem.IsWindows())
        {
            SetProcessWorkingSetSizeEx(GetCurrentProcess(), -1, -1, 0);
        }
    }

    // Only the execution-speed throttle (EcoQoS), never Idle priority: Idle starves the UI thread a game waits on with a synchronous message.
    public static void SetEfficiencyMode(bool enabled)
    {
        if (!OperatingSystem.IsWindows())
        {
            return;
        }

        var mask = enabled ? PowerThrottlingExecutionSpeed : 0;
        var state = new PowerThrottlingState { Version = 1, ControlMask = mask, StateMask = mask };
        SetProcessInformation(GetCurrentProcess(), ProcessPowerThrottling, ref state, (uint)Marshal.SizeOf<PowerThrottlingState>());
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PowerThrottlingState
    {
        public uint Version;
        public uint ControlMask;
        public uint StateMask;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct AnimationInfo
    {
        public uint Size;
        public int MinAnimate;
    }

    [LibraryImport("user32.dll", EntryPoint = "SystemParametersInfoW")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SystemParametersInfo(uint action, uint param, out uint value, uint winIni);

    [LibraryImport("user32.dll", EntryPoint = "SystemParametersInfoW")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SystemParametersInfo(uint action, uint param, ref AnimationInfo value, uint winIni);

    [LibraryImport("user32.dll")]
    private static partial uint GetDoubleClickTime();

    [LibraryImport("kernel32.dll")]
    private static partial nint GetCurrentProcess();

    [LibraryImport("kernel32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SetProcessWorkingSetSizeEx(nint process, nint minimum, nint maximum, uint flags);

    [LibraryImport("kernel32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SetProcessInformation(nint process, int informationClass, ref PowerThrottlingState information, uint size);
}
