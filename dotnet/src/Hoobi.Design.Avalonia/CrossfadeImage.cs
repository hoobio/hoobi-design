using Avalonia;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Controls.Templates;
using Avalonia.Media;
using Avalonia.Media.Imaging;

namespace Hoobi.Design.Avalonia;

public sealed class CrossfadeImage : TransitioningContentControl
{
    public CrossfadeImage()
    {
        PageTransition = Motion.Enabled ? new CrossFade(Motion.Fast) : null;
        ContentTemplate = new FuncDataTemplate<IImage>((image, _) =>
        {
            var view = new Image { Source = image, Stretch = Stretch.UniformToFill };
            RenderOptions.SetBitmapInterpolationMode(view, BitmapInterpolationMode.HighQuality);
            return view;
        });
    }

    protected override Type StyleKeyOverride => typeof(TransitioningContentControl);

    // A background layer: under an unbounded height a UniformToFill image measures to its own aspect ratio and would stretch the card.
    protected override Size MeasureOverride(Size availableSize)
    {
        _ = base.MeasureOverride(availableSize);
        return default;
    }
}
