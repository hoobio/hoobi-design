using Windows.ApplicationModel;

namespace Hoobi.Desktop.Windows;

public enum StartWithWindowsState
{
    Disabled,
    Enabled,
    DisabledByUser,
    DisabledByPolicy,
    EnabledByPolicy,
}

public enum StartupTaskAction
{
    None,
    RequestEnable,
    Disable,
}

public static class StartupStates
{
    public static StartWithWindowsState From(StartupTaskState state) => state switch
    {
        StartupTaskState.Enabled => StartWithWindowsState.Enabled,
        StartupTaskState.DisabledByUser => StartWithWindowsState.DisabledByUser,
        StartupTaskState.DisabledByPolicy => StartWithWindowsState.DisabledByPolicy,
        StartupTaskState.EnabledByPolicy => StartWithWindowsState.EnabledByPolicy,
        _ => StartWithWindowsState.Disabled,
    };

    public static bool IsLocked(this StartWithWindowsState state) =>
        state is StartWithWindowsState.DisabledByUser or StartWithWindowsState.DisabledByPolicy or StartWithWindowsState.EnabledByPolicy;

    public static bool IsOn(this StartWithWindowsState state) =>
        state is StartWithWindowsState.Enabled or StartWithWindowsState.EnabledByPolicy;

    public static StartupTaskAction ActionFor(bool enable, StartupTaskState state) => (enable, state) switch
    {
        (true, StartupTaskState.Disabled) => StartupTaskAction.RequestEnable,
        (false, StartupTaskState.Enabled) => StartupTaskAction.Disable,
        _ => StartupTaskAction.None,
    };
}
