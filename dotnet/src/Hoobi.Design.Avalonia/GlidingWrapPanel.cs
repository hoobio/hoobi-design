using Avalonia;
using Avalonia.Controls;

namespace Hoobi.Design.Avalonia;

public sealed class GlidingWrapPanel : WrapPanel
{
    protected override Size ArrangeOverride(Size finalSize)
    {
        var size = base.ArrangeOverride(finalSize);
        Glide.Arranged(this);
        return size;
    }
}
