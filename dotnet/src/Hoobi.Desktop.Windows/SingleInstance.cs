using System.Diagnostics.CodeAnalysis;

namespace Hoobi.Desktop.Windows;

public sealed class SingleInstance : IDisposable
{
    private readonly Mutex _mutex;
    private readonly EventWaitHandle _show;
    private RegisteredWaitHandle? _showWait;

    private SingleInstance(Mutex mutex, EventWaitHandle show)
    {
        _mutex = mutex;
        _show = show;
    }

    public static bool TryAcquire(string name, bool showRunning, TimeSpan wait, [NotNullWhen(true)] out SingleInstance? instance)
    {
        var mutex = new Mutex(initiallyOwned: false, MutexName(name));
        bool acquired;
        try
        {
            acquired = mutex.WaitOne(wait);
        }
        // A killed process (watchdog restart, Store update, Task Manager) leaves the mutex abandoned; the next launch still owns it.
        catch (AbandonedMutexException)
        {
            acquired = true;
        }

        if (!acquired)
        {
            mutex.Dispose();
            if (showRunning && EventWaitHandle.TryOpenExisting(ShowEventName(name), out var show))
            {
                using (show)
                {
                    show.Set();
                }
            }

            instance = null;
            return false;
        }

        instance = new SingleInstance(mutex, new EventWaitHandle(false, EventResetMode.AutoReset, ShowEventName(name)));
        return true;
    }

    public void ListenForShow(Action<Action> postToUiThread, Action show) =>
        _showWait = ThreadPool.RegisterWaitForSingleObject(_show, (_, _) => postToUiThread(show), null, Timeout.Infinite, executeOnlyOnce: false);

    public void Dispose()
    {
        _showWait?.Unregister(null);
        try
        {
            _mutex.ReleaseMutex();
        }
        // Only the acquiring thread can release the mutex; from another thread the handles still close, and the owner's exit abandons it, which TryAcquire accepts.
        catch (ApplicationException)
        {
        }

        _mutex.Dispose();
        _show.Dispose();
    }

    private static string MutexName(string name) => $"Local\\{name}";

    private static string ShowEventName(string name) => $"Local\\{name}.Show";
}
