using Avalonia;

using Hoobi.Design.Avalonia;

namespace Hoobi.Design.Gallery;

public static class Program
{
    [STAThread]
    public static void Main(string[] args) => BuildAvaloniaApp().StartWithClassicDesktopLifetime(args);

    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>()
        .UsePlatformDetect()
        .UseHoobiDesign();
}
