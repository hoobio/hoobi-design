namespace Hoobi.Desktop.Windows.Tests;

public sealed class UiWatchdogTests
{
    [Theory]
    [InlineData("--restart-after=1234", 1234)]
    [InlineData("--restart-after=abc", null)]
    [InlineData("--tray", null)]
    public void RestartedFrom_ReadsThePreviousProcessId(string arg, int? expected) =>
        Assert.Equal(expected, UiWatchdog.RestartedFrom(["--other", arg]));

    [Fact]
    public void WaitForPreviousInstance_WithoutTheArgument_ReturnsAtOnce() =>
        UiWatchdog.WaitForPreviousInstance(["--tray"]);

    [Fact]
    public void WaitForPreviousInstance_ForAProcessThatIsGone_ReturnsAtOnce() =>
        UiWatchdog.WaitForPreviousInstance([$"{UiWatchdog.RestartAfterArgument}{int.MaxValue}"]);

    [Theory]
    [InlineData(true, 60, true)]
    [InlineData(true, 301, false)]
    [InlineData(false, 60, false)]
    public void IsRelaunchLoop_OnlyWithinTheGuardAfterARestart(bool restarted, int seconds, bool expected) =>
        Assert.Equal(expected, UiWatchdog.IsRelaunchLoop(restarted, TimeSpan.FromSeconds(seconds)));

    [Fact]
    public void RelaunchArguments_ChooseTheModeAndCarryTheProcessId()
    {
        Assert.Equal(["--no-activate", "--restart-after=7"], UiWatchdog.RelaunchArguments(true, 7, null));
        Assert.Equal(["--tray", "--restart-after=7", "--x"], UiWatchdog.RelaunchArguments(false, 7, ["--x"]));
    }
}
