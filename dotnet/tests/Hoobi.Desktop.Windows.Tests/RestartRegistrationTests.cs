namespace Hoobi.Desktop.Windows.Tests;

public sealed class RestartRegistrationTests
{
    [Fact]
    public void ArgumentFor_ChoosesTrayWhenHiddenAndNoActivateWhenShown()
    {
        Assert.Equal("--tray", RestartRegistration.ArgumentFor(windowVisible: false));
        Assert.Equal("--no-activate", RestartRegistration.ArgumentFor(windowVisible: true));
    }

    [Fact]
    public void Flags_AreNoCrashNoHangNoReboot() => Assert.Equal(11, RestartRegistration.Flags);

    [Fact]
    public void IsVisible_IsFalseForNoWindow() => Assert.False(RestartRegistration.IsVisible(0));

    [Theory]
    [InlineData("--TRAY", true)]
    [InlineData("--tray", true)]
    [InlineData("--other", false)]
    public void HasArgument_IgnoresCase(string arg, bool expected) =>
        Assert.Equal(expected, RestartRegistration.HasArgument([arg], RestartRegistration.TrayArgument));

    [Fact]
    public void PackageIdentity_IsUnpackagedUnderTheTestHost() => Assert.False(PackageIdentity.IsPackaged);
}
