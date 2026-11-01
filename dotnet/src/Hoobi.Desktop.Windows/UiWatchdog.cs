using System.ComponentModel;
using System.Diagnostics;

namespace Hoobi.Desktop.Windows;

public sealed class UiWatchdog(
    Action<Action> postToUiThread,
    Func<bool> isWindowVisible,
    LogSink log,
    IReadOnlyList<string>? extraArguments = null,
    Func<Task>? probeRenderThread = null)
{
    public const string RestartAfterArgument = "--restart-after=";
    private const int MissedBeatsBeforeRestart = 6;
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(5);
    private static readonly TimeSpan RelaunchGuard = TimeSpan.FromMinutes(5);

    private volatile int _stage;
    private volatile bool _visible = true;

    public static int? RestartedFrom(IEnumerable<string> args) =>
        args.FirstOrDefault(arg => arg.StartsWith(RestartAfterArgument, StringComparison.Ordinal)) is { } arg
        && int.TryParse(arg[RestartAfterArgument.Length..], out var pid) ? pid : null;

    public static void WaitForPreviousInstance(IEnumerable<string> args)
    {
        if (RestartedFrom(args) is not { } pid)
        {
            return;
        }

        try
        {
            using var previous = Process.GetProcessById(pid);
            previous.WaitForExit(TimeSpan.FromSeconds(15));
        }
        catch (ArgumentException)
        {
        }
    }

    public void Start()
    {
        if (Debugger.IsAttached)
        {
            log("UI watchdog skipped: debugger attached", null);
            return;
        }

        new Thread(Run) { IsBackground = true, Name = "UI watchdog" }.Start();
    }

    internal static bool IsRelaunchLoop(bool restartedFromArguments, TimeSpan sinceStart) =>
        restartedFromArguments && sinceStart < RelaunchGuard;

    internal static IReadOnlyList<string> RelaunchArguments(bool windowVisible, int processId, IReadOnlyList<string>? extraArguments) =>
        [RestartRegistration.ArgumentFor(windowVisible), $"{RestartAfterArgument}{processId}", .. extraArguments ?? []];

    private void Run()
    {
        var missed = 0;
        while (true)
        {
            _stage = 0;
            postToUiThread(Beat);
            Thread.Sleep(Interval);
            while (_stage < 2)
            {
                if (++missed >= MissedBeatsBeforeRestart && !Debugger.IsAttached)
                {
                    Restart(_stage == 0 ? "UI thread" : "render thread");
                    return;
                }

                Thread.Sleep(Interval);
            }

            missed = 0;
        }
    }

    private void Beat()
    {
        _stage = 1;
        _visible = isWindowVisible();
        if (probeRenderThread is null)
        {
            _stage = 2;
            return;
        }

        _ = ProbeAsync();
    }

    private async Task ProbeAsync()
    {
        await probeRenderThread!().ConfigureAwait(false);
        _stage = 2;
    }

    private void Restart(string stalled)
    {
        using var current = Process.GetCurrentProcess();
        if (IsRelaunchLoop(RestartedFrom(Environment.GetCommandLineArgs()) is not null, DateTime.Now - current.StartTime))
        {
            log($"The {stalled} stopped responding again within {RelaunchGuard.TotalMinutes:0} minutes of a restart; not restarting again", null);
            return;
        }

        var arguments = RelaunchArguments(_visible, Environment.ProcessId, extraArguments);
        log($"The {stalled} stopped responding for {(Interval * MissedBeatsBeforeRestart).TotalSeconds:0}s; restarting with {arguments[0]}", null);
        var start = new ProcessStartInfo(Environment.ProcessPath!);
        foreach (var argument in arguments)
        {
            start.ArgumentList.Add(argument);
        }

        try
        {
            using var started = Process.Start(start);
        }
        catch (Exception e) when (e is Win32Exception or InvalidOperationException)
        {
            log("Could not start a new process; not restarting", e);
            return;
        }

        current.Kill();
    }
}
