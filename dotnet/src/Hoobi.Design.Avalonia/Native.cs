using System.Runtime.InteropServices;

namespace Hoobi.Design.Avalonia;

internal static partial class Native
{
    private const uint SpiGetWheelScrollLines = 0x68;
    private const uint SpiGetClientAreaAnimation = 0x1042;

    public static uint WheelScrollLines() =>
        OperatingSystem.IsWindows() && SystemParametersInfo(SpiGetWheelScrollLines, 0, out var lines, 0) ? lines : 3;

    public static bool ClientAreaAnimation() =>
        !OperatingSystem.IsWindows() || !SystemParametersInfo(SpiGetClientAreaAnimation, 0, out var on, 0) || on != 0;

    [LibraryImport("user32.dll", EntryPoint = "SystemParametersInfoW")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SystemParametersInfo(uint action, uint param, out uint value, uint winIni);
}
