using System.Runtime.CompilerServices;

using Avalonia;
using Avalonia.Headless;
using Avalonia.Styling;

using Hoobi.Design.Avalonia;
using Hoobi.Design.Avalonia.Testing;
using Hoobi.Design.Gallery;

[assembly: AssemblyFixture(typeof(Hoobi.Design.Avalonia.Tests.AvaloniaSession))]
[assembly: Xunit.v3.Parallelization(Mode = Xunit.Sdk.ParallelMode.None)]

namespace Hoobi.Design.Avalonia.Tests;

public sealed class AvaloniaSession : IDisposable
{
    private readonly HeadlessSession _session = new(typeof(AvaloniaSession));

    public static AppBuilder BuildAvaloniaApp() => AppBuilder.Configure<App>()
        .UseSkia()
        .UseHoobiDesign()
        .UseHeadless(new AvaloniaHeadlessPlatformOptions { UseHeadlessDrawing = false });

    public static string DotnetRoot([CallerFilePath] string path = "") => Path.GetFullPath(Path.Combine(Path.GetDirectoryName(path)!, "..", ".."));

    public static T Resource<T>(string key) =>
        Application.Current!.TryGetResource(key, ThemeVariant.Dark, out var value) && value is T typed ? typed : throw new KeyNotFoundException(key);

    public void Run(Action action) => _session.Run(action, TestContext.Current.CancellationToken);

    public static void Pump(int passes = 5) => HeadlessSession.Pump(passes);

    public static void WaitFor(Func<bool> condition) => Assert.True(HeadlessSession.WaitFor(condition));

    public void Dispose() => _session.Dispose();
}
