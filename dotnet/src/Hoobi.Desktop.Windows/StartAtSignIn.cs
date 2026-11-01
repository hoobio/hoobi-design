using Windows.ApplicationModel;

namespace Hoobi.Desktop.Windows;

public sealed class StartAtSignIn(string startupTaskId, string runValueName, bool isReleaseBuild, LogSink log)
{
    private bool _taskOff;

    public bool IsAllowed => isReleaseBuild;

    public bool StartupTaskUnavailable => _taskOff;

    public async Task<StartWithWindowsState?> GetStateAsync()
    {
        if (!isReleaseBuild)
        {
            return null;
        }

        if (!PackageIdentity.IsPackaged)
        {
            return RunKeyRegistration.IsRegistered(runValueName) ? StartWithWindowsState.Enabled : StartWithWindowsState.Disabled;
        }

        return await ApplyTaskAsync(null).ConfigureAwait(false);
    }

    public async Task<StartWithWindowsState?> ApplyAsync(bool enable, bool launchToTray)
    {
        if (!isReleaseBuild)
        {
            return null;
        }

        // An MSIX app's HKCU writes land in its private hive, so a packaged build starts at sign-in through the manifest StartupTask, never the Run value.
        if (PackageIdentity.IsPackaged)
        {
            return await ApplyTaskAsync(enable).ConfigureAwait(false);
        }

        if (enable && Environment.ProcessPath is { Length: > 0 } executable)
        {
            RunKeyRegistration.Register(runValueName, executable, launchToTray ? RestartRegistration.TrayArgument : null);
            return StartWithWindowsState.Enabled;
        }

        RunKeyRegistration.Unregister(runValueName);
        return StartWithWindowsState.Disabled;
    }

    private async Task<StartWithWindowsState?> ApplyTaskAsync(bool? enable)
    {
        if (_taskOff)
        {
            return null;
        }

        StartupTask task;
        try
        {
            task = await StartupTask.GetAsync(startupTaskId).AsTask().ConfigureAwait(false);
        }
        catch (Exception ex) when (StoreUpdater.IsActivationFailure(ex))
        {
            _taskOff = true;
            log($"Startup task {startupTaskId} is not available on this system; turned off for this run", ex);
            return null;
        }

        var state = task.State;
        switch (enable is { } wanted ? StartupStates.ActionFor(wanted, state) : StartupTaskAction.None)
        {
            case StartupTaskAction.RequestEnable:
                state = await task.RequestEnableAsync().AsTask().ConfigureAwait(false);
                break;
            case StartupTaskAction.Disable:
                task.Disable();
                state = task.State;
                break;
        }

        return StartupStates.From(state);
    }
}
