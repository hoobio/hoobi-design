using System.Runtime.InteropServices;

using Windows.Services.Store;

namespace Hoobi.Desktop.Windows.Tests;

public sealed class StoreUpdaterTests
{
    [Theory]
    [InlineData(StorePackageUpdateState.Pending, AppUpdatePhase.Pending)]
    [InlineData(StorePackageUpdateState.Downloading, AppUpdatePhase.Downloading)]
    [InlineData(StorePackageUpdateState.Deploying, AppUpdatePhase.Installing)]
    [InlineData(StorePackageUpdateState.Completed, AppUpdatePhase.Installing)]
    [InlineData(StorePackageUpdateState.Canceled, AppUpdatePhase.None)]
    [InlineData(StorePackageUpdateState.ErrorLowBattery, AppUpdatePhase.Failed)]
    [InlineData(StorePackageUpdateState.OtherError, AppUpdatePhase.Failed)]
    public void ToPhase_MapsTheStoreState(StorePackageUpdateState state, AppUpdatePhase expected) =>
        Assert.Equal(expected, StoreUpdater.ToPhase(state));

    [Theory]
    [InlineData(false, false, true)]
    [InlineData(false, true, false)]
    [InlineData(true, false, false)]
    [InlineData(true, true, false)]
    public void ShouldOpenStoreUpdates_OnlyAfterAFailedInteractiveInstall(bool silent, bool completed, bool expected) =>
        Assert.Equal(expected, StoreUpdater.ShouldOpenStoreUpdates(silent, completed));

    [Fact]
    public void IsActivationFailure_RecognisesMissingStoreComponents()
    {
        Assert.True(StoreUpdater.IsActivationFailure(new TypeLoadException()));
        Assert.True(StoreUpdater.IsActivationFailure(new DllNotFoundException()));
        Assert.True(StoreUpdater.IsActivationFailure(new COMException("not registered", unchecked((int)0x80040154))));
        Assert.True(StoreUpdater.IsActivationFailure(new COMException("not available", unchecked((int)0x80040111))));
        Assert.False(StoreUpdater.IsActivationFailure(new COMException("other", unchecked((int)0x80004005))));
        Assert.False(StoreUpdater.IsActivationFailure(new InvalidOperationException()));
    }

    [Fact]
    public void HasUpdates_IsFalseBeforeACheck()
    {
        using var updater = new StoreUpdater("PRODUCT", "App", (_, _) => { });
        Assert.False(updater.HasUpdates);
    }

    [Fact]
    public async Task WatchQueueAsync_BeforeACheck_FollowsNothing()
    {
        using var updater = new StoreUpdater("PRODUCT", "App", (_, _) => { });
        var calls = 0;
        await updater.WatchQueueAsync(_ => calls++, _ => calls++);
        Assert.Equal(0, calls);
    }
}
