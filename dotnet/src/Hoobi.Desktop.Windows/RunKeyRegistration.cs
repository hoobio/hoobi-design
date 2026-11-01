using Microsoft.Win32;

namespace Hoobi.Desktop.Windows;

public static class RunKeyRegistration
{
    private const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";

    public static bool IsRegistered(string valueName)
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKey);
        return key?.GetValue(valueName) is not null;
    }

    public static void Register(string valueName, string executablePath, string? argument)
    {
        using var key = Registry.CurrentUser.CreateSubKey(RunKey);
        key.SetValue(valueName, BuildCommand(executablePath, argument), RegistryValueKind.String);
    }

    public static void Unregister(string valueName)
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKey, writable: true);
        key?.DeleteValue(valueName, throwOnMissingValue: false);
    }

    internal static string BuildCommand(string executablePath, string? argument) =>
        argument is { Length: > 0 } ? $"\"{executablePath}\" {argument}" : $"\"{executablePath}\"";
}
