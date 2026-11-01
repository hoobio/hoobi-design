using System.Runtime.InteropServices;

using Avalonia.Input;

namespace Hoobi.Design.Avalonia;

internal static partial class AppDialogsInterop
{
    public static bool IsKeyHeld(Key key) =>
        OperatingSystem.IsWindows()
        && key switch { Key.Enter => 0x0D, Key.Space => 0x20, _ => 0 } is var virtualKey and not 0
        && (GetAsyncKeyState(virtualKey) & 0x8000) != 0;

    [LibraryImport("user32.dll")]
    private static partial short GetAsyncKeyState(int virtualKey);
}
