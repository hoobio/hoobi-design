using Avalonia.Headless;
using Avalonia.Threading;

namespace Hoobi.Design.Avalonia.Testing;

public sealed class HeadlessSession(Type entryPointType) : IDisposable
{
    private readonly HeadlessUnitTestSession _session = HeadlessUnitTestSession.StartNew(entryPointType);

    public T Run<T>(Func<T> action, CancellationToken cancellationToken = default) =>
        _session.Dispatch(action, cancellationToken).GetAwaiter().GetResult();

    public void Run(Action action, CancellationToken cancellationToken = default) =>
        _session.Dispatch(action, cancellationToken).GetAwaiter().GetResult();

    public static void Pump(int passes = 5)
    {
        for (var pass = 0; pass < passes; pass++)
        {
            Dispatcher.UIThread.RunJobs();
            AvaloniaHeadlessPlatform.ForceRenderTimerTick();
        }
    }

    // The session thread only runs dispatched actions, so a wait pumps the dispatcher itself.
    public static bool WaitFor(Func<bool> condition, TimeSpan? timeout = null)
    {
        ArgumentNullException.ThrowIfNull(condition);
        var deadline = DateTime.UtcNow + (timeout ?? TimeSpan.FromSeconds(10));
        while (!condition() && DateTime.UtcNow < deadline)
        {
            Dispatcher.UIThread.RunJobs();
            Thread.Yield();
        }

        return condition();
    }

    // A test framework can dispose its fixture on the session's own thread, where a blocking Dispose waits on itself.
    public void Dispose() => _ = Task.Run(_session.Dispose);
}
