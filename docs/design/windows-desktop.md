# Windows desktop apps

## Windows desktop apps (.NET)

Every .NET Windows desktop app in the Hoobi family (Steward, Earmark, and new ones) ships the same update and sign-in behaviour. `Hoobi.Desktop.Windows` holds it: `StoreUpdater` (scan, check, install with one install in flight at a time, restart registration, and `WatchQueueAsync`, which follows an update the Store queued from the scan to its progress and outcome), `StartAtSignIn` (startup task or Run value), `RestartRegistration`, `GitHubReleaseChecker`, `SingleInstance` (one process, a second launch shows the first; `ListenForShow` takes the UI-thread post, as `UiWatchdog` does), and `UiWatchdog` (restarts the app when the UI thread stops responding; `--restart-after=`). An app uses these types and does not copy them. The Bitwarden command palette companion has no Store or start-at-sign-in code and is exempt from this section.

- A packaged (Microsoft Store) release build checks for updates through the Store, not GitHub. It
  runs `AppInstallManager.SearchForUpdatesAsync(<product id>, "")` first, because `StoreContext`
  sees an update only after the Store has scanned. `SearchForAllUpdatesAsync` runs on an explicit
  "Check now" only, because it queues the update of every Store app on the machine. The check is
  `StoreContext.GetAppAndOptionalStorePackageUpdatesAsync`, with the window handle passed through
  `InitializeWithWindow`.
- The update installs silently when `CanSilentlyDownloadStorePackageUpdates` is true. Otherwise the
  install button calls `RequestDownloadAndInstallStorePackageUpdatesAsync`, and a failed or
  cancelled install opens `ms-windows-store://downloadsandupdates`.
- `RegisterApplicationRestart` (`--tray` when the window is hidden, `--no-activate` when it is
  shown, flags `RESTART_NO_CRASH | RESTART_NO_HANG | RESTART_NO_REBOOT`) runs before the Store scan
  and before an install, so Windows relaunches the app after the update.
- An unpackaged release build (MSI, portable) checks the GitHub releases list.
- Start at sign-in is for release builds only. On dev, debug and pre-release builds the setting is
  disabled and reads off.
- A packaged build starts at sign-in through a manifest `desktop:StartupTask` and the
  `StartupTask` API, not the `HKCU\...\Run` value. An MSIX app's HKCU writes go to its private hive
  (`%LocalAppData%\Packages\<PFN>\SystemAppData\Helium`), so a Run value it writes never reaches
  the real key. An unpackaged build writes the Run value.
- The setting shows the locked `StartupTaskState` values: `DisabledByUser` (turned off in Task
  Manager > Startup apps), `DisabledByPolicy` and `EnabledByPolicy`.
