using System.Runtime.CompilerServices;

using Avalonia.Controls;
using Avalonia.Input;
using Avalonia.Interactivity;

namespace Hoobi.Design.Avalonia;

public sealed class ForegroundGate
{
    private static readonly ConditionalWeakTable<TopLevel, ForegroundGate> Gates = [];

    private TaskCompletionSource _released = new(TaskCreationOptions.RunContinuationsAsynchronously);

    public ForegroundGate() => _released.SetResult();

    public bool IsHeld => !_released.Task.IsCompleted;

    public Task WhenReleased => _released.Task;

    public static ForegroundGate For(TopLevel top)
    {
        ArgumentNullException.ThrowIfNull(top);

        return Gates.GetValue(top, owner =>
        {
            var gate = new ForegroundGate();
            if (owner is WindowBase window)
            {
                window.Activated += (_, _) => gate.Release();
            }

            // A press in the window is the user's own choice of it, even when no Activated has been raised for a start without focus.
            owner.AddHandler(InputElement.PointerPressedEvent, (_, _) => gate.Release(), RoutingStrategies.Tunnel, handledEventsToo: true);
            return gate;
        });
    }

    // Windows refuses SetForegroundWindow to a process that did not receive the last input event; a tray click goes to explorer, so borrow its input queue for the call.
    public static void ForceForeground(TopLevel window)
    {
        ArgumentNullException.ThrowIfNull(window);

        if (OperatingSystem.IsWindows() && window.TryGetPlatformHandle() is { HandleDescriptor: "HWND", Handle: var handle })
        {
            ForegroundGateInterop.ForceForeground(handle);
        }
    }

    public void Hold()
    {
        if (!IsHeld)
        {
            _released = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        }
    }

    public bool Release() => _released.TrySetResult();
}
