using Windows.ApplicationModel;

namespace Hoobi.Desktop.Windows.Tests;

public sealed class StartupTests
{
    [Theory]
    [InlineData(StartupTaskState.Disabled, StartWithWindowsState.Disabled)]
    [InlineData(StartupTaskState.Enabled, StartWithWindowsState.Enabled)]
    [InlineData(StartupTaskState.DisabledByUser, StartWithWindowsState.DisabledByUser)]
    [InlineData(StartupTaskState.DisabledByPolicy, StartWithWindowsState.DisabledByPolicy)]
    [InlineData(StartupTaskState.EnabledByPolicy, StartWithWindowsState.EnabledByPolicy)]
    public void From_MapsEveryTaskState(StartupTaskState state, StartWithWindowsState expected) =>
        Assert.Equal(expected, StartupStates.From(state));

    [Theory]
    [InlineData(StartWithWindowsState.Disabled, false, false)]
    [InlineData(StartWithWindowsState.Enabled, false, true)]
    [InlineData(StartWithWindowsState.DisabledByUser, true, false)]
    [InlineData(StartWithWindowsState.DisabledByPolicy, true, false)]
    [InlineData(StartWithWindowsState.EnabledByPolicy, true, true)]
    public void LockedAndOn_FollowTheState(StartWithWindowsState state, bool locked, bool on)
    {
        Assert.Equal(locked, state.IsLocked());
        Assert.Equal(on, state.IsOn());
    }

    [Theory]
    [InlineData(true, StartupTaskState.Disabled, StartupTaskAction.RequestEnable)]
    [InlineData(true, StartupTaskState.Enabled, StartupTaskAction.None)]
    [InlineData(true, StartupTaskState.DisabledByUser, StartupTaskAction.None)]
    [InlineData(true, StartupTaskState.DisabledByPolicy, StartupTaskAction.None)]
    [InlineData(false, StartupTaskState.Enabled, StartupTaskAction.Disable)]
    [InlineData(false, StartupTaskState.Disabled, StartupTaskAction.None)]
    [InlineData(false, StartupTaskState.EnabledByPolicy, StartupTaskAction.None)]
    public void ActionFor_NeverTouchesALockedState(bool enable, StartupTaskState state, StartupTaskAction expected) =>
        Assert.Equal(expected, StartupStates.ActionFor(enable, state));

    [Fact]
    public async Task NonReleaseBuild_IsNotAllowedAndReportsNoState()
    {
        var startup = new StartAtSignIn("Task", "HoobiTest", isReleaseBuild: false, (_, _) => { });

        Assert.False(startup.IsAllowed);
        Assert.Null(await startup.GetStateAsync());
        Assert.Null(await startup.ApplyAsync(enable: true, launchToTray: true));
    }

    [Theory]
    [InlineData(null, "\"C:\\app.exe\"")]
    [InlineData("", "\"C:\\app.exe\"")]
    [InlineData("--tray", "\"C:\\app.exe\" --tray")]
    public void BuildCommand_QuotesThePathAndAppendsTheArgument(string? argument, string expected) =>
        Assert.Equal(expected, RunKeyRegistration.BuildCommand("C:\\app.exe", argument));

    [Fact]
    public void RunKey_RoundTripsAValue()
    {
        var name = $"HoobiDesignTest-{Guid.NewGuid():N}";
        try
        {
            Assert.False(RunKeyRegistration.IsRegistered(name));
            RunKeyRegistration.Register(name, "C:\\app.exe", "--tray");
            Assert.True(RunKeyRegistration.IsRegistered(name));
        }
        finally
        {
            RunKeyRegistration.Unregister(name);
        }

        Assert.False(RunKeyRegistration.IsRegistered(name));
    }
}
