using System.Diagnostics;
using System.Runtime.InteropServices;

using Windows.ApplicationModel.Store.Preview.InstallControl;
using Windows.Services.Store;

namespace Hoobi.Desktop.Windows;

public sealed record StoreUpdateCheck(int Count, bool CanInstallSilently);

public sealed record StoreInstallOutcome(string State, bool Completed, bool Cancelled);

public sealed record StoreQueueOutcome(string State, bool Completed, bool Failed);

public sealed class StoreUpdater(string productId, string appName, LogSink log) : IDisposable
{
    private const int ClassNotRegistered = unchecked((int)0x80040154);
    private const int ClassNotAvailable = unchecked((int)0x80040111);
    private const string StoreUpdatesUri = "ms-windows-store://downloadsandupdates";

    private StoreContext? _context;
    private IReadOnlyList<StorePackageUpdate> _updates = [];
    private bool _storeOff;
    private bool _installManagerOff;
    private Task<StoreInstallOutcome?>? _install;
    private StoreQueueItem? _queueItem;
    private Action<StoreUpdateProgress>? _queueProgress;
    private Action<StoreQueueOutcome>? _queueFinished;

    public bool HasUpdates => _context is not null && _updates.Count > 0;

    public static AppUpdatePhase ToPhase(StorePackageUpdateState state) => state switch
    {
        StorePackageUpdateState.Pending => AppUpdatePhase.Pending,
        StorePackageUpdateState.Downloading => AppUpdatePhase.Downloading,
        StorePackageUpdateState.Deploying or StorePackageUpdateState.Completed => AppUpdatePhase.Installing,
        StorePackageUpdateState.Canceled => AppUpdatePhase.None,
        _ => AppUpdatePhase.Failed,
    };

    public static bool IsActivationFailure(Exception ex) =>
        ex is TypeLoadException or DllNotFoundException or EntryPointNotFoundException
        || ex is COMException { HResult: ClassNotRegistered or ClassNotAvailable };

    public static bool ShouldOpenStoreUpdates(bool silent, bool completed) => !silent && !completed;

    public async Task ScanAsync(nint ownerWindow, bool checkNow)
    {
        try
        {
            // The scan can install the update and close the app on its own, so the restart is registered first.
            RegisterRestart(ownerWindow);
            if (Activate("The Store installer", ref _installManagerOff, () => new AppInstallManager()) is not { } manager)
            {
                return;
            }

            // Documented as needing a Microsoft-only capability, but it runs unelevated from a full-trust process with none declared (verified 28 Sep 2026).
            var item = await manager.SearchForUpdatesAsync(productId, string.Empty).AsTask().ConfigureAwait(false);
            log($"Store scan for {appName}: {item?.GetCurrentStatus().InstallState.ToString() ?? "no install item"}", null);

            if (checkNow)
            {
                await ScanAllAppsAsync(manager).ConfigureAwait(false);
            }
        }
        catch (Exception ex)
        {
            log($"Store scan for {appName} failed", ex);
        }
    }

    public async Task<StoreUpdateCheck?> CheckAsync(nint ownerWindow)
    {
        if (Activate("The Microsoft Store", ref _storeOff, () =>
            {
                var created = StoreContext.GetDefault();
                WinRT.Interop.InitializeWithWindow.Initialize(created, ownerWindow);
                return created;
            }) is not { } context)
        {
            return null;
        }

        var updates = await context.GetAppAndOptionalStorePackageUpdatesAsync().AsTask().ConfigureAwait(false);
        _context = context;
        _updates = updates;
        log($"Store update check: {updates.Count} update(s), silent install {context.CanSilentlyDownloadStorePackageUpdates}", null);
        return new StoreUpdateCheck(updates.Count, context.CanSilentlyDownloadStorePackageUpdates);
    }

    public Task<StoreInstallOutcome?> InstallAsync(nint ownerWindow, Action<StoreUpdateProgress>? report = null) =>
        _install is { IsCompleted: false } running ? running : _install = InstallCoreAsync(ownerWindow, report);

    public async Task WatchQueueAsync(Action<StoreUpdateProgress> report, Action<StoreQueueOutcome> finished)
    {
        // The finished install's queue item outlives the restart and read as installing forever (29 Sep 2026).
        if (_context is not { } context || _queueItem is not null || _updates.Count == 0 || _install is { IsCompleted: false })
        {
            return;
        }

        try
        {
            var items = await context.GetAssociatedStoreQueueItemsAsync().AsTask().ConfigureAwait(false);
            if (_queueItem is not null || items.FirstOrDefault(item => item.InstallKind == StoreQueueItemKind.Update) is not { } item)
            {
                return;
            }

            _queueItem = item;
            _queueProgress = report;
            _queueFinished = finished;
            item.StatusChanged += OnQueueItemStatusChanged;
            log("Store update: following an update the Microsoft Store queued", null);
            OnQueueItemStatusChanged(item, null);
        }
        catch (Exception ex)
        {
            log("Store update queue check failed", ex);
        }
    }

    public void Dispose()
    {
        if (_queueItem is { } item)
        {
            item.StatusChanged -= OnQueueItemStatusChanged;
            _queueItem = null;
        }
    }

    private async Task<StoreInstallOutcome?> InstallCoreAsync(nint ownerWindow, Action<StoreUpdateProgress>? report)
    {
        if (_context is not { } context || _updates.Count == 0)
        {
            OpenStoreUpdates();
            return null;
        }

        var silent = context.CanSilentlyDownloadStorePackageUpdates;
        RegisterRestart(ownerWindow);
        StoreInstallOutcome? outcome = null;
        try
        {
            var operation = silent
                ? context.TrySilentDownloadAndInstallStorePackageUpdatesAsync(_updates)
                : context.RequestDownloadAndInstallStorePackageUpdatesAsync(_updates);
            if (report is not null)
            {
                operation.Progress = (_, status) => report(ToProgress(status));
            }

            var result = await operation.AsTask().ConfigureAwait(false);
            outcome = new StoreInstallOutcome(
                result.OverallState.ToString(),
                result.OverallState is StorePackageUpdateState.Completed,
                result.OverallState is StorePackageUpdateState.Canceled);
            log($"Store update: finished {outcome.State} (silent {silent})", null);
        }
        catch (Exception ex)
        {
            log($"Store update install failed (silent {silent})", ex);
        }

        if (ShouldOpenStoreUpdates(silent, outcome?.Completed ?? false))
        {
            OpenStoreUpdates();
        }

        return outcome;
    }

    public void RegisterRestart(nint ownerWindow)
    {
        var result = RestartRegistration.Register(ownerWindow);
        if (result != 0)
        {
            log($"RegisterApplicationRestart failed: 0x{result:X8}", null);
        }
    }

    private StoreUpdateProgress ToProgress(StorePackageUpdateStatus status) => StoreUpdateProgress.From(
        ToPhase(status.PackageUpdateState),
        status.PackageDownloadProgress,
        status.PackageBytesDownloaded,
        status.PackageDownloadSizeInBytes,
        appName);

    private void OnQueueItemStatusChanged(StoreQueueItem item, object? args)
    {
        var status = item.GetCurrentStatus();
        var waiting = status.PackageInstallState is StoreQueueItemState.Paused
            || (status.PackageInstallState is StoreQueueItemState.Active && status.UpdateStatus.PackageUpdateState is StorePackageUpdateState.Pending);
        // The Store kept a Pending Update item for Steward with no update available to StoreContext (29 Sep 2026).
        if (waiting && _updates.Count == 0)
        {
            return;
        }

        switch (status.PackageInstallState)
        {
            case StoreQueueItemState.Active:
                _queueProgress?.Invoke(ToProgress(status.UpdateStatus));
                return;
            case StoreQueueItemState.Paused:
                _queueProgress?.Invoke(StoreUpdateProgress.From(AppUpdatePhase.Pending, 0, 0, 0, appName));
                return;
        }

        item.StatusChanged -= OnQueueItemStatusChanged;
        _queueItem = null;
        var outcome = new StoreQueueOutcome(
            status.PackageInstallExtendedState.ToString(),
            status.PackageInstallState is StoreQueueItemState.Completed,
            status.PackageInstallState is StoreQueueItemState.Error);
        log($"Store update: queued update finished {outcome.State}", null);
        _queueFinished?.Invoke(outcome);
    }

    private async Task ScanAllAppsAsync(AppInstallManager manager)
    {
        try
        {
            // Only the all-apps scan refreshes a flight's catalogue; it also queues every other Store app's update, so it runs on an explicit check only.
            await manager.SearchForAllUpdatesAsync().AsTask().ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            // Verified 29 Sep 2026: this call can throw yet still queue the update.
            log("Store scan for all apps failed", ex);
        }
    }

    private static void OpenStoreUpdates()
    {
        // The product page of an installed app has no update button, so the Store's update list is opened instead.
        using var process = Process.Start(new ProcessStartInfo(StoreUpdatesUri) { UseShellExecute = true });
    }

    private T? Activate<T>(string feature, ref bool off, Func<T> create)
        where T : class
    {
        if (off)
        {
            return null;
        }

        try
        {
            return create();
        }
        catch (Exception ex) when (IsActivationFailure(ex))
        {
            off = true;
            log($"{feature} is not available on this system; turned off for this run", ex);
            return null;
        }
    }
}
