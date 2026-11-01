using System.Runtime.InteropServices;

namespace Hoobi.Desktop.Windows;

public static partial class RestartRegistration
{
    public const string TrayArgument = "--tray";
    public const string NoActivateArgument = "--no-activate";

    // RESTART_NO_CRASH | RESTART_NO_HANG | RESTART_NO_REBOOT: only an update restarts the app.
    public const int Flags = 1 | 2 | 8;

    public static string ArgumentFor(bool windowVisible) => windowVisible ? NoActivateArgument : TrayArgument;

    public static bool HasArgument(IEnumerable<string> args, string argument) =>
        args.Any(arg => string.Equals(arg, argument, StringComparison.OrdinalIgnoreCase));

    public static int Register(nint ownerWindow) => Register(IsVisible(ownerWindow));

    public static int Register(bool windowVisible) => RegisterApplicationRestart(ArgumentFor(windowVisible), Flags);

    public static bool IsVisible(nint window) => window != 0 && IsWindowVisible(window);

    [LibraryImport("kernel32.dll", StringMarshalling = StringMarshalling.Utf16)]
    private static partial int RegisterApplicationRestart(string? commandLine, int flags);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool IsWindowVisible(nint window);
}
