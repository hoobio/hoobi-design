using System.Runtime.InteropServices;

namespace Hoobi.Desktop.Windows;

public static partial class PackageIdentity
{
    private const int AppModelErrorNoPackage = 15700;

    public static bool IsPackaged { get; } = ResolveIsPackaged();

    private static bool ResolveIsPackaged()
    {
        try
        {
            uint length = 0;
            return GetCurrentPackageFullName(ref length, 0) != AppModelErrorNoPackage;
        }
        catch (Exception ex) when (ex is DllNotFoundException or EntryPointNotFoundException)
        {
            return false;
        }
    }

    [LibraryImport("kernel32.dll")]
    private static partial int GetCurrentPackageFullName(ref uint length, nint name);
}
