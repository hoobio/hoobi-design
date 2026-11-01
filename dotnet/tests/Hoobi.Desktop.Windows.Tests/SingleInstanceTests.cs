namespace Hoobi.Desktop.Windows.Tests;

public sealed class SingleInstanceTests
{
    [Fact]
    public async Task SecondLaunch_IsRefused_AndSignalsTheFirstToShow()
    {
        var name = $"HoobiDesignTest.{Guid.NewGuid():N}";
        using var shown = new ManualResetEventSlim();

        await Task.Run(() =>
        {
            Assert.True(SingleInstance.TryAcquire(name, showRunning: true, TimeSpan.Zero, out var first));
            using (first)
            {
                var posted = 0;
                first.ListenForShow(
                    action =>
                    {
                        Interlocked.Increment(ref posted);
                        action();
                    },
                    shown.Set);

                Assert.False(AcquireOnAnotherThread(name, showRunning: true));
                Assert.True(shown.Wait(TimeSpan.FromSeconds(5)));
                Assert.Equal(1, Volatile.Read(ref posted));
            }
        }, TestContext.Current.CancellationToken);
    }

    [Fact]
    public void Dispose_FromANonOwningThread_ClosesWithoutThrowing()
    {
        var name = $"HoobiDesignTest.{Guid.NewGuid():N}";
        SingleInstance? instance = null;
        var owner = new Thread(() => Assert.True(SingleInstance.TryAcquire(name, showRunning: false, TimeSpan.Zero, out instance)));
        owner.Start();
        owner.Join();

        instance!.Dispose();
        Assert.True(AcquireOnAnotherThread(name, showRunning: false));
    }

    [Fact]
    public async Task SecondLaunch_WithoutShowRunning_DoesNotSignal()
    {
        var name = $"HoobiDesignTest.{Guid.NewGuid():N}";
        using var shown = new ManualResetEventSlim();

        await Task.Run(() =>
        {
            Assert.True(SingleInstance.TryAcquire(name, showRunning: false, TimeSpan.Zero, out var first));
            using (first)
            {
                first.ListenForShow(action => action(), shown.Set);

                Assert.False(AcquireOnAnotherThread(name, showRunning: false));
                Assert.False(shown.Wait(TimeSpan.FromMilliseconds(300)));
            }
        }, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task AfterTheFirstDisposes_ANewLaunchAcquires()
    {
        var name = $"HoobiDesignTest.{Guid.NewGuid():N}";

        await Task.Run(() =>
        {
            Assert.True(SingleInstance.TryAcquire(name, showRunning: false, TimeSpan.Zero, out var first));
            first.Dispose();

            Assert.True(SingleInstance.TryAcquire(name, showRunning: false, TimeSpan.Zero, out var again));
            again.Dispose();
        }, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task AbandonedMutex_CountsAsAcquired()
    {
        var name = $"HoobiDesignTest.{Guid.NewGuid():N}";
        using var abandoned = new Mutex(initiallyOwned: false, $"Local\\{name}");
        var owner = new Thread(() => abandoned.WaitOne());
        owner.Start();
        owner.Join();

        await Task.Run(() =>
        {
            Assert.True(SingleInstance.TryAcquire(name, showRunning: false, TimeSpan.Zero, out var instance));
            instance.Dispose();
        }, TestContext.Current.CancellationToken);
    }

    // A Mutex is re-entrant on its owning thread, and a blocking wait on Task.Run can inline onto the caller.
    private static bool AcquireOnAnotherThread(string name, bool showRunning)
    {
        var acquired = false;
        var thread = new Thread(() =>
        {
            acquired = SingleInstance.TryAcquire(name, showRunning, TimeSpan.Zero, out var instance);
            instance?.Dispose();
        });
        thread.Start();
        thread.Join();
        return acquired;
    }
}
